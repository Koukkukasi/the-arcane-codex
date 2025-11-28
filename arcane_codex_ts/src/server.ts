import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import apiRoutes from './routes/api';
import BattleService from './services/battle';
import { MultiplayerService } from './services/multiplayer/multiplayer_service';
import GameService from './services/game';
import { logger, socketLogger, securityLogger } from './services/logger';
import { socketAuthMiddleware, AuthenticatedSocket } from './middleware/socketAuth';
import { TokenCleanupService } from './services/tokenCleanup';
import { SessionPersistenceService } from './services/sessionPersistence';

// ============================================
// SECURITY: Environment Configuration
// ============================================

const isProduction = process.env.NODE_ENV === 'production';

// Session secret - require in production, warn in development
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET && isProduction) {
  throw new Error('SESSION_SECRET environment variable is required in production');
}
if (!SESSION_SECRET) {
  securityLogger.warn('Using generated session secret - set SESSION_SECRET env var for production');
}
const sessionSecret = SESSION_SECRET || crypto.randomBytes(32).toString('hex');

// CORS allowed origins
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5000', 'http://localhost:5001', 'http://localhost:3000'];

// CORS configuration with allowlist
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.) in development
    if (!origin && !isProduction) {
      callback(null, true);
      return;
    }
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      securityLogger.warn({ origin }, 'Blocked CORS request');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};

// Create Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static path
const staticPath = path.join(__dirname, '../public');

// Session configuration
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
    httpOnly: true,
    secure: isProduction, // Use secure cookies in production
    sameSite: isProduction ? 'strict' : 'lax'
  }
}));

// Rate limiting (development: 500 requests per hour)
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 500, // 500 requests per hour
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// API Routes
app.use('/api', apiRoutes);

// Root route - serve the main game (MUST be before static middleware)
app.get('/', (_req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// Serve static files AFTER root route to prevent index.html from being served automatically
app.use(express.static(staticPath));

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    server: 'TypeScript Express',
    version: '1.0.0'
  });
});

// Initialize Multiplayer Service
const multiplayerService = MultiplayerService.initialize(io);

// Socket.IO Authentication Middleware
io.use(socketAuthMiddleware);

// Socket.IO handlers
io.on('connection', (socket: AuthenticatedSocket) => {
  socketLogger.info({
    socketId: socket.id,
    playerId: socket.playerId,
    playerName: socket.playerName
  }, 'Client connected');

  // Setup multiplayer event handlers
  multiplayerService.setupSocketHandlers(socket);

  // Legacy handlers for backward compatibility
  socket.on('join_game', (data: { game_code: string; player_name: string }) => {
    if (data.game_code) {
      socket.join(data.game_code);
      socketLogger.info({ playerName: data.player_name || 'Unknown', gameCode: data.game_code }, 'Player joined game');

      // Notify other players in the room
      socket.to(data.game_code).emit('player_joined', {
        player_name: data.player_name,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('leave_game', (data: { game_code: string; player_name: string }) => {
    if (data.game_code) {
      socket.leave(data.game_code);
      socketLogger.info({ playerName: data.player_name || 'Unknown', gameCode: data.game_code }, 'Player left game');

      // Notify other players
      socket.to(data.game_code).emit('player_left', {
        player_name: data.player_name,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('game_update', (data: { game_code: string; update_type: string; payload: any }) => {
    if (data.game_code) {
      // Broadcast game updates to all players in the room
      io.to(data.game_code).emit('game_state_changed', {
        update_type: data.update_type,
        payload: data.payload,
        timestamp: new Date().toISOString()
      });
    }
  });

  socket.on('disconnect', () => {
    socketLogger.info({ socketId: socket.id }, 'Client disconnected');
  });

  socket.on('error', (error) => {
    socketLogger.error({ socketId: socket.id, error }, 'Socket error');
  });
});

// Export io for use in other modules
export { io };

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error({ err }, 'Unhandled server error');
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not found'
  });
});

// Periodic cleanup of old battles (every 10 minutes)
setInterval(() => {
  BattleService.cleanupBattles(30); // Clean up battles older than 30 minutes
}, 10 * 60 * 1000);

// Periodic cleanup of old game sessions (every 15 minutes)
setInterval(() => {
  GameService.cleanupOldSessions(4); // Clean up sessions older than 4 hours
}, 15 * 60 * 1000);

// ============================================
// Token Cleanup Service
// ============================================
// Clean up expired refresh tokens every hour
const tokenCleanupService = TokenCleanupService.getInstance({
  intervalMinutes: parseInt(process.env.TOKEN_CLEANUP_INTERVAL || '60'),
  enableLogging: true
});
tokenCleanupService.start();

// ============================================
// Session Persistence Service
// ============================================
// Initialize session persistence (restoration and cleanup)
const sessionPersistenceService = SessionPersistenceService.getInstance({
  staleSessionHours: parseInt(process.env.STALE_SESSION_HOURS || '4'),
  deleteAbandonedDays: parseInt(process.env.DELETE_ABANDONED_DAYS || '7'),
  cleanupIntervalMinutes: parseInt(process.env.SESSION_CLEANUP_INTERVAL || '15'),
  restoreOnStartup: process.env.RESTORE_SESSIONS_ON_STARTUP !== 'false',
  maxRestoreAgeHours: parseInt(process.env.MAX_RESTORE_AGE_HOURS || '24')
});

// ============================================
// Graceful Shutdown
// ============================================
const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Received shutdown signal, starting graceful shutdown...');

  // Stop accepting new connections
  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    // Stop cleanup jobs
    tokenCleanupService.stop();
    await sessionPersistenceService.shutdown();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error({ err: error }, 'Error during shutdown');
    process.exit(1);
  }
};

// Handle shutdown signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const PORT = process.env.PORT || 5000; // Changed from 5001 to 5000
server.listen(PORT, async () => {
  logger.info({
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    staticPath,
    rateLimit: '500 requests/hour',
    sessionTimeout: '4 hours'
  }, 'The Arcane Codex server started');

  // Initialize session persistence after server starts
  try {
    await sessionPersistenceService.initialize();
    logger.info('Session persistence initialized successfully');
  } catch (error) {
    logger.error({ err: error }, 'Failed to initialize session persistence');
  }
});