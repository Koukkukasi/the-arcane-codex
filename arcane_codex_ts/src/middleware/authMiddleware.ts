/**
 * JWT Authentication Middleware
 * Provides middleware functions for protecting API endpoints with JWT authentication
 */

import { Request, Response, NextFunction } from 'express';
import { JWTService, DecodedToken } from '../services/auth/jwt.service';
import { apiLogger } from '../services/logger';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: DecodedToken;
    }
  }
}

/**
 * Middleware to require JWT authentication
 * Returns 401 if token is missing, invalid, or expired
 * Attaches decoded user info to req.user
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // Check if authorization header exists
  if (!authHeader) {
    apiLogger.warn({ path: req.path }, 'Authentication required: No authorization header');
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'No authorization header provided'
    });
    return;
  }

  // Check if header follows Bearer format
  if (!authHeader.startsWith('Bearer ')) {
    apiLogger.warn({ path: req.path, authHeader }, 'Authentication required: Invalid authorization format');
    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: 'Invalid authorization header format. Use: Bearer <token>'
    });
    return;
  }

  // Extract token
  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  // Verify token
  try {
    const decoded = JWTService.verifyAccessToken(token);
    req.user = decoded;

    apiLogger.debug({
      userId: decoded.userId,
      username: decoded.username,
      path: req.path
    }, 'User authenticated successfully');

    next();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid token';

    // Determine appropriate error message
    let errorMessage = 'Invalid or expired token';
    if (message.includes('expired')) {
      errorMessage = 'Token has expired';
      apiLogger.info({ path: req.path }, 'Authentication failed: Token expired');
    } else if (message.includes('invalid')) {
      errorMessage = 'Invalid token';
      apiLogger.warn({ path: req.path }, 'Authentication failed: Invalid token');
    } else {
      apiLogger.warn({ path: req.path, error: message }, 'Authentication failed');
    }

    res.status(401).json({
      success: false,
      error: 'Authentication required',
      message: errorMessage
    });
  }
};

/**
 * Middleware to optionally extract JWT authentication
 * Does not require authentication - attaches user if valid token present
 * Continues without error if token is missing or invalid
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  // No token provided - continue without authentication
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next();
    return;
  }

  // Extract and verify token
  const token = authHeader.substring(7);

  try {
    const decoded = JWTService.verifyAccessToken(token);
    req.user = decoded;

    apiLogger.debug({
      userId: decoded.userId,
      username: decoded.username,
      path: req.path
    }, 'Optional authentication: User authenticated');
  } catch (error) {
    // Token invalid or expired - continue without authentication
    apiLogger.debug({ path: req.path }, 'Optional authentication: Invalid token, continuing without auth');
  }

  next();
};

/**
 * Middleware to require admin role
 * Must be used after requireAuth middleware
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    apiLogger.error({ path: req.path }, 'requireAdmin called without authentication');
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    apiLogger.warn({
      userId: req.user.userId,
      username: req.user.username,
      role: req.user.role,
      path: req.path
    }, 'Admin access denied: Insufficient permissions');

    res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin privileges required'
    });
    return;
  }

  next();
};

/**
 * Helper function to get user from request
 * Returns user if authenticated, null otherwise
 */
export const getAuthenticatedUser = (req: Request): DecodedToken | null => {
  return req.user || null;
};

/**
 * Helper function to check if user is authenticated
 */
export const isAuthenticated = (req: Request): boolean => {
  return !!req.user;
};

/**
 * Helper function to check if user is admin
 */
export const isAdmin = (req: Request): boolean => {
  return !!req.user && req.user.role === 'admin';
};

// Export default object for convenience
export default {
  requireAuth,
  optionalAuth,
  requireAdmin,
  getAuthenticatedUser,
  isAuthenticated,
  isAdmin
};
