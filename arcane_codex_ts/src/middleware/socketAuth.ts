import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { securityLogger } from '../services/logger';
import { JWTService, DecodedToken } from '../services/auth/jwt.service';

/**
 * Socket.IO Authentication Middleware
 * Validates player identity on socket connection
 * Supports both JWT token authentication and legacy session-based auth
 */

// Socket handshake auth data interface
export interface SocketAuthData {
  token?: string;        // JWT access token (new)
  playerId?: string;     // For legacy/dev compatibility
  playerName?: string;   // Optional display name
  sessionToken?: string; // Legacy session token
}

// Extended socket interface with authentication data
export interface AuthenticatedSocket extends Socket {
  playerId?: string;
  playerName?: string;
  sessionId?: string;
  userId?: string;       // From JWT token
  userRole?: 'player' | 'admin' | 'guest'; // From JWT token
  authMethod?: 'jwt' | 'session' | 'development'; // Track auth method used
}

// Session store for validating tokens (can be replaced with Redis in production)
const validSessions = new Map<string, { playerId: string; playerName: string; expiresAt: number }>();

/**
 * Register a valid session for socket authentication
 */
export function registerSocketSession(
  sessionId: string,
  playerId: string,
  playerName: string,
  ttlMinutes: number = 240 // 4 hours default
): void {
  validSessions.set(sessionId, {
    playerId,
    playerName,
    expiresAt: Date.now() + ttlMinutes * 60 * 1000
  });

  securityLogger.debug({
    event: 'socket_session_registered',
    sessionId: sessionId.substring(0, 8) + '...',
    playerId
  }, 'Socket session registered');
}

/**
 * Remove a session (on logout)
 */
export function removeSocketSession(sessionId: string): void {
  validSessions.delete(sessionId);
}

/**
 * Clean up expired sessions
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  let cleaned = 0;

  for (const [sessionId, session] of validSessions.entries()) {
    if (session.expiresAt < now) {
      validSessions.delete(sessionId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    securityLogger.info({ cleaned }, 'Cleaned up expired socket sessions');
  }
}

/**
 * Validate a session token
 */
function validateSession(sessionId: string): { valid: boolean; playerId?: string; playerName?: string } {
  const session = validSessions.get(sessionId);

  if (!session) {
    return { valid: false };
  }

  if (session.expiresAt < Date.now()) {
    validSessions.delete(sessionId);
    return { valid: false };
  }

  return { valid: true, playerId: session.playerId, playerName: session.playerName };
}

/**
 * Attempt JWT token authentication
 */
function authenticateWithJWT(
  token: string,
  socket: AuthenticatedSocket
): { success: boolean; error?: string; decoded?: DecodedToken } {
  try {
    const decoded = JWTService.verifyAccessToken(token);

    // Attach JWT data to socket
    socket.userId = decoded.userId;
    socket.playerId = decoded.userId; // Use userId as playerId for compatibility
    socket.playerName = decoded.username;
    socket.userRole = decoded.role;
    socket.authMethod = 'jwt';

    securityLogger.info({
      event: 'socket_jwt_authenticated',
      socketId: socket.id,
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role
    }, 'Socket connection authenticated via JWT');

    return { success: true, decoded };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    securityLogger.warn({
      event: 'socket_jwt_verification_failed',
      socketId: socket.id,
      error: errorMessage,
      ip: socket.handshake.address
    }, 'JWT verification failed for socket connection');

    return { success: false, error: errorMessage };
  }
}

/**
 * Attempt session-based authentication
 */
function authenticateWithSession(
  sessionToken: string,
  playerId: string,
  socket: AuthenticatedSocket
): { success: boolean; error?: string } {
  const validation = validateSession(sessionToken);

  if (!validation.valid) {
    securityLogger.warn({
      event: 'socket_auth_invalid_session',
      socketId: socket.id,
      playerId,
      ip: socket.handshake.address
    }, 'Socket connection rejected: invalid session');

    return { success: false, error: 'Invalid or expired session' };
  }

  // Verify playerId matches session
  if (validation.playerId !== playerId) {
    securityLogger.warn({
      event: 'socket_auth_player_mismatch',
      socketId: socket.id,
      providedPlayerId: playerId,
      sessionPlayerId: validation.playerId,
      ip: socket.handshake.address
    }, 'Socket connection rejected: player ID mismatch');

    return { success: false, error: 'Player ID does not match session' };
  }

  // Attach session data to socket
  socket.playerId = validation.playerId;
  socket.playerName = validation.playerName;
  socket.sessionId = sessionToken;
  socket.authMethod = 'session';

  securityLogger.info({
    event: 'socket_session_authenticated',
    socketId: socket.id,
    playerId: validation.playerId,
    playerName: validation.playerName
  }, 'Socket connection authenticated via session');

  return { success: true };
}

/**
 * Extract JWT token from socket handshake
 * Supports multiple token sources:
 * 1. handshake.auth.token
 * 2. Authorization header (Bearer token)
 */
function extractJWTToken(socket: AuthenticatedSocket): string | undefined {
  // Check auth.token first
  const authData: SocketAuthData = socket.handshake.auth;
  if (authData.token) {
    return authData.token;
  }

  // Check Authorization header
  const authHeader = socket.handshake.headers.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

/**
 * Socket.IO authentication middleware
 * Supports JWT token authentication with fallback to session-based auth
 *
 * PRODUCTION MODE (NODE_ENV=production):
 * - Requires valid JWT token (via handshake.auth.token or Authorization header)
 * - Rejects connections without valid JWT
 * - No fallback authentication methods allowed
 *
 * DEVELOPMENT MODE (NODE_ENV !== production):
 * Authentication priority:
 * 1. JWT token (if provided in handshake.auth.token or Authorization header)
 * 2. Session token (if provided and JWT fails/missing)
 * 3. Development mode with playerId only (for testing)
 */
export function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
): void {
  const authData: SocketAuthData = socket.handshake.auth;
  const { playerId, sessionToken, playerName } = authData;

  const isDevelopment = process.env.NODE_ENV !== 'production';

  // Extract JWT token from multiple sources
  const token = extractJWTToken(socket);

  // PRODUCTION MODE: Require JWT authentication
  if (!isDevelopment) {
    if (!token) {
      securityLogger.warn({
        event: 'socket_auth_no_jwt_production',
        socketId: socket.id,
        ip: socket.handshake.address
      }, 'Socket connection rejected in production: JWT token required');

      return next(new Error('Authentication required. JWT token must be provided in production mode.'));
    }

    // Attempt JWT authentication
    const jwtResult = authenticateWithJWT(token, socket);

    if (jwtResult.success) {
      return next(); // Successfully authenticated via JWT
    }

    // JWT verification failed in production - reject connection
    securityLogger.warn({
      event: 'socket_auth_jwt_failed_production',
      socketId: socket.id,
      error: jwtResult.error,
      ip: socket.handshake.address
    }, 'Socket connection rejected in production: invalid JWT token');

    return next(new Error(`Authentication failed: ${jwtResult.error || 'Invalid JWT token'}`));
  }

  // DEVELOPMENT MODE: Try multiple authentication methods

  // PRIORITY 1: Try JWT authentication if token is provided
  if (token) {
    const jwtResult = authenticateWithJWT(token, socket);

    if (jwtResult.success) {
      return next(); // Successfully authenticated via JWT
    }

    // JWT verification failed - log the error but continue to fallback methods in dev
    securityLogger.debug({
      event: 'socket_jwt_fallback',
      socketId: socket.id,
      jwtError: jwtResult.error
    }, 'JWT auth failed in development, attempting fallback authentication');
  }

  // PRIORITY 2: Try session-based authentication if sessionToken and playerId provided
  if (sessionToken && playerId) {
    const sessionResult = authenticateWithSession(sessionToken, playerId, socket);

    if (sessionResult.success) {
      return next(); // Successfully authenticated via session
    }

    // Session auth failed - log but continue to next fallback
    securityLogger.debug({
      event: 'socket_session_fallback',
      socketId: socket.id,
      sessionError: sessionResult.error
    }, 'Session auth failed in development, attempting fallback authentication');
  }

  // PRIORITY 3: Development mode fallback - allow with just playerId
  if (!playerId) {
    securityLogger.warn({
      event: 'socket_auth_missing_player_id',
      socketId: socket.id,
      ip: socket.handshake.address
    }, 'Socket connection rejected: missing playerId in development mode');

    return next(new Error('Player ID required for development mode'));
  }

  // Allow connection in development mode with minimal auth
  socket.playerId = playerId;
  socket.playerName = playerName || playerId;
  socket.authMethod = 'development';

  securityLogger.info({
    event: 'socket_dev_authenticated',
    socketId: socket.id,
    playerId,
    playerName: socket.playerName
  }, 'Socket connection authenticated in development mode');

  return next();
}

/**
 * Middleware to verify socket is authenticated before handling events
 */
export function requireSocketAuth(socket: AuthenticatedSocket): boolean {
  if (!socket.playerId) {
    securityLogger.warn({
      event: 'socket_unauthorized_event',
      socketId: socket.id
    }, 'Unauthorized socket event attempted');
    return false;
  }
  return true;
}

// Cleanup expired sessions every 5 minutes
setInterval(cleanupExpiredSessions, 5 * 60 * 1000);

export default {
  socketAuthMiddleware,
  registerSocketSession,
  removeSocketSession,
  requireSocketAuth,
  cleanupExpiredSessions
};
