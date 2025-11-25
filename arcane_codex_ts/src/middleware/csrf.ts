import { Request, Response, NextFunction } from 'express';
import { securityLogger } from '../services/logger';

/**
 * CSRF (Cross-Site Request Forgery) protection middleware
 * Validates CSRF tokens for state-changing requests
 */

// Extend session type to include csrf_token
declare module 'express-session' {
  interface SessionData {
    csrf_token?: string;
  }
}

/**
 * CSRF validation middleware
 * Validates that the CSRF token in the request matches the session token
 */
export function csrfValidation(req: Request, res: Response, next: NextFunction): void {
  // Skip for safe methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header or body
  const token = (req.headers['x-csrf-token'] as string) || req.body?._csrf;
  const sessionToken = req.session?.csrf_token;

  // Validate token
  if (!token || !sessionToken || token !== sessionToken) {
    securityLogger.warn({
      event: 'csrf_validation_failed',
      path: req.path,
      method: req.method,
      ip: req.ip,
      hasToken: !!token,
      hasSessionToken: !!sessionToken
    }, 'CSRF token validation failed');

    res.status(403).json({
      success: false,
      error: 'Invalid or missing CSRF token'
    });
    return;
  }

  next();
}

/**
 * Generate a new CSRF token for the session
 */
export function generateCsrfToken(req: Request): string {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrf_token = token;
  return token;
}

/**
 * Middleware to ensure CSRF token exists in session
 */
export function ensureCsrfToken(req: Request, _res: Response, next: NextFunction): void {
  if (!req.session.csrf_token) {
    generateCsrfToken(req);
  }
  next();
}

export default {
  csrfValidation,
  generateCsrfToken,
  ensureCsrfToken
};
