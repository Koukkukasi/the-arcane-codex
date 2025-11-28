/**
 * Express Type Extensions
 * Extends Express Request interface to include authenticated user information
 */

import { DecodedToken } from '../services/auth/jwt.service';

declare global {
  namespace Express {
    interface Request {
      /**
       * Authenticated user information from JWT token
       * Set by requireAuth or optionalAuth middleware
       */
      user?: DecodedToken;
    }
  }
}

// This export is needed to make this a module
export {};
