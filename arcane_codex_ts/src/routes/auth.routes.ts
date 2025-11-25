/**
 * Authentication Routes
 * Handles user authentication and session management
 */

import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { apiLogger } from '../services/logger';

const router = Router();

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
