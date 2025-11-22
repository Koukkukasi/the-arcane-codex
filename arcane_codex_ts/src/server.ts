import express from 'express';
import cors from 'cors';
import session from 'express-session';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import apiRoutes from './routes/api';
import BattleService from './services/battle';

// Create Express app
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static path (defined here, but middleware added later to avoid intercepting root route)
const staticPath = path.join(__dirname, '../../complete_game/static');

// Session configuration
app.use(session({
  secret: 'arcane-codex-secret-key-2024',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 4 * 60 * 60 * 1000, // 4 hours
    httpOnly: true,
    secure: false // Set to true in production with HTTPS
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
  res.sendFile(path.join(staticPath, 'game_flow_beautiful_integrated.html'));
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

// Socket.IO handlers
io.on('connection', (socket) => {
  console.log(`[SOCKET] Client connected: ${socket.id}`);

  socket.on('join_game', (data: { game_code: string; player_name: string }) => {
    if (data.game_code) {
      socket.join(data.game_code);
      console.log(`[SOCKET] ${data.player_name || 'Unknown'} joined game ${data.game_code}`);

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
      console.log(`[SOCKET] ${data.player_name || 'Unknown'} left game ${data.game_code}`);

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
    console.log(`[SOCKET] Client disconnected: ${socket.id}`);
  });

  socket.on('error', (error) => {
    console.error(`[SOCKET] Error from client ${socket.id}:`, error);
  });
});

// Export io for use in other modules
export { io };

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[ERROR]', err.stack);
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

// Start server
const PORT = process.env.PORT || 5000; // Changed from 5001 to 5000
server.listen(PORT, () => {
  console.log(`
====================================
    The Arcane Codex - TypeScript Server
====================================
    Server:   http://localhost:${PORT}
    API:      http://localhost:${PORT}/api
    Health:   http://localhost:${PORT}/health

    Rate limiting: 500 requests/hour
    Session timeout: 4 hours
    Battle cleanup: Every 10 minutes

    Environment: ${process.env.NODE_ENV || 'development'}
    Static files: ${staticPath}
====================================
  `);
});