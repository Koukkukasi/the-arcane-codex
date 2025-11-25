import { Socket } from 'socket.io';
import { ExtendedError } from 'socket.io/dist/namespace';
import { securityLogger } from '../services/logger';

/**
 * Socket.IO Authentication Middleware
 * Validates player identity on socket connection
 */

// Extended socket interface with authentication data
export interface AuthenticatedSocket extends Socket {
  playerId?: string;
  playerName?: string;
  sessionId?: string;
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
 * Socket.IO authentication middleware
 * Validates the session token from handshake auth data
 */
export function socketAuthMiddleware(
  socket: AuthenticatedSocket,
  next: (err?: ExtendedError) => void
): void {
  const { playerId, sessionToken, playerName } = socket.handshake.auth;

  // In development mode, allow connections without authentication
  // but still require playerId for tracking
  const isDevelopment = process.env.NODE_ENV !== 'production';

  if (!playerId) {
    securityLogger.warn({
      event: 'socket_auth_missing_player_id',
      socketId: socket.id,
      ip: socket.handshake.address
    }, 'Socket connection rejected: missing playerId');

    return next(new Error('Player ID required'));
  }

  // In production, validate session token
  if (!isDevelopment && sessionToken) {
    const validation = validateSession(sessionToken);

    if (!validation.valid) {
      securityLogger.warn({
        event: 'socket_auth_invalid_session',
        socketId: socket.id,
        playerId,
        ip: socket.handshake.address
      }, 'Socket connection rejected: invalid session');

      return next(new Error('Invalid session'));
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

      return next(new Error('Player ID mismatch'));
    }
  }

  // Attach auth data to socket
  socket.playerId = playerId;
  socket.playerName = playerName || playerId;
  socket.sessionId = sessionToken;

  securityLogger.info({
    event: 'socket_authenticated',
    socketId: socket.id,
    playerId,
    playerName: socket.playerName
  }, 'Socket connection authenticated');

  next();
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
