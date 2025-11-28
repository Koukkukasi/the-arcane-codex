/**
 * Authentication Routes
 * Handles user authentication and session management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { apiLogger } from '../services/logger';
import { JWTService, TokenPayload, DecodedToken } from '../services/auth';
import { PlayerRepository } from '../database/repositories/player.repository';

const playerRepo = new PlayerRepository();
const SALT_ROUNDS = 12;

declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

const router = Router();

// ============================================
// JWT Authentication Middleware
// ============================================

/**
 * Middleware to verify JWT token
 */
export const requireJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'No token provided'
    });
    return;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = JWTService.verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';
    res.status(401).json({
      success: false,
      error: message
    });
  }
};

/**
 * Middleware to optionally extract JWT token (does not require it)
 * Sets req.user if valid token is present, otherwise continues without it
 */
export const optionalJWT = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);

    try {
      const decoded = JWTService.verifyAccessToken(token);
      req.user = decoded;
    } catch {
      // Token invalid or expired, continue without user
    }
  }

  next();
};
// ============================================
// Session-based Middleware (legacy)
// ============================================

/**
 * Middleware to ensure player has an ID
 */
export const ensurePlayerId = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.session.player_id) {
    req.session.player_id = uuidv4();
  }
  next();
};

/**
 * Middleware to require authentication
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.username || !req.session.player_id) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }
  next();
};

/**
 * Middleware to require game session
 */
export const requireGameSession = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.game_code) {
    res.status(400).json({
      success: false,
      error: 'Not in a game session'
    });
    return;
  }
  next();
};

// ============================================
// JWT Authentication Routes
// ============================================

/**
 * POST /register
 * Register a new user with username and password
 */
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, email } = req.body;

    // Validate input
    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
      return;
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      res.status(400).json({
        success: false,
        error: 'Username must be between 2 and 20 characters'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
      return;
    }

    // Check if username already exists
    const existingPlayer = await playerRepo.getPlayerByUsername(trimmedUsername);
    if (existingPlayer) {
      res.status(409).json({
        success: false,
        error: 'Username already taken'
      });
      return;
    }

    // Hash password and create player
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const playerId = uuidv4();

    const player = await playerRepo.createPlayerWithPassword({
      player_id: playerId,
      username: trimmedUsername,
      email: email || undefined,
      password_hash: passwordHash
    });

    // Generate tokens with storage
    const tokenPayload: TokenPayload = {
      userId: player.id,
      username: player.username,
      role: 'player'
    };

    const tokens = await JWTService.generateTokenPairWithStorage(tokenPayload);

    apiLogger.info({ username: trimmedUsername, playerId: player.id }, 'User registered');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: player.id,
        username: player.username,
        email: player.email
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    apiLogger.error({ error }, 'Registration failed');
    res.status(500).json({
      success: false,
      error: 'Registration failed'
    });
  }
});

/**
 * POST /login
 * Login with username and password
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
      return;
    }

    // Find player by username
    const player = await playerRepo.getPlayerByUsername(username.trim());
    if (!player) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
      return;
    }

    // Get password hash
    const passwordHash = await playerRepo.getPasswordHash(player.id);
    if (!passwordHash) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, passwordHash);
    if (!isValid) {
      res.status(401).json({
        success: false,
        error: 'Invalid username or password'
      });
      return;
    }

    // Update last seen
    await playerRepo.updateLastSeen(player.id);

    // Generate tokens with storage
    const tokenPayload: TokenPayload = {
      userId: player.id,
      username: player.username,
      role: 'player'
    };

    const tokens = await JWTService.generateTokenPairWithStorage(tokenPayload);

    apiLogger.info({ username: player.username, playerId: player.id }, 'User logged in');

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: player.id,
        username: player.username,
        email: player.email
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (error) {
    apiLogger.error({ error }, 'Login failed');
    res.status(500).json({
      success: false,
      error: 'Login failed'
    });
  }
});

/**
 * POST /logout
 * Logout user (clears session and revokes refresh token)
 */
router.post('/logout', async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshToken = req.body?.refreshToken;

    // Revoke the refresh token if provided
    if (refreshToken) {
      try {
        await JWTService.revokeRefreshToken(refreshToken);
        apiLogger.info('Refresh token revoked on logout');
      } catch (error) {
        // Log but don't fail logout if token revocation fails
        apiLogger.warn({ error }, 'Failed to revoke refresh token on logout');
      }
    }

    // Clear session if it exists
    try {
      if (req.session) {
        const playerId = req.session.player_id;
        if (req.session.game_code) delete req.session.game_code;
        if (req.session.username) delete req.session.username;

        if (playerId) {
          apiLogger.info({ playerId }, 'User logged out');
        } else {
          apiLogger.info('User logged out (no session)');
        }
      }
    } catch (sessionError) {
      // Session clearing failed but don't fail the logout
      apiLogger.warn({ error: sessionError }, 'Failed to clear session on logout');
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    apiLogger.error({ error }, 'Logout failed');
    res.status(500).json({
      success: false,
      error: 'Logout failed'
    });
  }
});

/**
 * POST /refresh
 * Refresh access token using refresh token with revocation check
 */
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      res.status(400).json({
        success: false,
        error: 'Refresh token is required'
      });
      return;
    }

    // Verify token and check if it's been revoked
    const newAccessToken = await JWTService.refreshAccessTokenWithRevocationCheck(refreshToken);

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Token refresh failed';
    apiLogger.warn({ error: message }, 'Token refresh failed');
    res.status(401).json({
      success: false,
      error: message
    });
  }
});

/**
 * GET /me
 * Get current user info (requires JWT)
 */
router.get('/me', requireJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user!;
    const player = await playerRepo.getPlayerById(user.userId);

    if (!player) {
      res.status(404).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: player.id,
        username: player.username,
        email: player.email,
        preferred_role: player.preferred_role,
        total_sessions: player.total_sessions,
        victories: player.victories,
        defeats: player.defeats
      }
    });
  } catch (error) {
    apiLogger.error({ error }, 'Failed to get user info');
    res.status(500).json({
      success: false,
      error: 'Failed to get user info'
    });
  }
});

// ============================================
// Legacy Session Routes
// ============================================

/**
 * POST /clear_session
 * Clear session to start fresh game
 */
router.post('/clear_session', (req: Request, res: Response): void => {
  delete req.session.game_code;
  delete req.session.username;

  apiLogger.info({ playerId: req.session.player_id }, 'Session cleared');

  res.json({
    success: true,
    message: 'Session cleared successfully'
  });
});

/**
 * GET /csrf-token
 * Get CSRF token for form submissions
 */
router.get('/csrf-token', (req: Request, res: Response): void => {
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrf_token = token;

  res.json({
    success: true,
    csrf_token: token
  });
});

/**
 * POST /set_username
 * Set the player's username
 */
router.post('/set_username', ensurePlayerId, (req: Request, res: Response): void => {
  const { username } = req.body;

  if (!username || username.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Username is required'
    });
    return;
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
    res.status(400).json({
      success: false,
      error: 'Username must be between 2 and 20 characters'
    });
    return;
  }

  req.session.username = trimmedUsername;

  apiLogger.info({ username: trimmedUsername, playerId: req.session.player_id }, 'User logged in');

  res.json({
    success: true,
    message: 'Username set successfully',
    username: trimmedUsername,
    player_id: req.session.player_id
  });
});

/**
 * GET /get_username
 * Get the current username
 */
router.get('/get_username', (req: Request, res: Response): void => {
  const username = req.session.username;

  if (!username) {
    res.json({
      success: false,
      message: 'No username set'
    });
    return;
  }

  res.json({
    success: true,
    username,
    player_id: req.session.player_id
  });
});

export default router;
