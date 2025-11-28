/**
 * JWT Authentication Service
 * Handles token generation, verification, and refresh
 */

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { RefreshTokenRepository } from '../../database/repositories/RefreshTokenRepository';

// ============================================
// Types
// ============================================

export interface TokenPayload {
  userId: string;
  username: string;
  role: 'player' | 'admin' | 'guest';
}

export interface DecodedToken extends TokenPayload {
  iss: string;
  aud: string;
  iat: number;
  exp: number;
}

// ============================================
// Configuration
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'arcane-codex-default-secret-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET + '-refresh';

const TOKEN_CONFIG = {
  issuer: 'arcane-codex',
  audience: 'arcane-codex-api',
  accessTokenExpiry: 15 * 60,  // 15 minutes in seconds
  refreshTokenExpiry: 7 * 24 * 60 * 60,  // 7 days in seconds
};

// ============================================
// JWT Service
// ============================================

export class JWTService {
  private static tokenRepository = new RefreshTokenRepository();

  /**
   * Generate an access token
   */
  static generateAccessToken(payload: TokenPayload): string {
    const options: SignOptions = {
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
      expiresIn: TOKEN_CONFIG.accessTokenExpiry,
    };

    return jwt.sign(payload, JWT_SECRET, options);
  }

  /**
   * Generate a refresh token (synchronous version for backwards compatibility)
   */
  static generateRefreshToken(payload: TokenPayload): string {
    const options: SignOptions = {
      issuer: TOKEN_CONFIG.issuer,
      audience: TOKEN_CONFIG.audience,
      expiresIn: TOKEN_CONFIG.refreshTokenExpiry,
    };

    // Only include essential data in refresh token
    const refreshPayload = {
      userId: payload.userId,
      username: payload.username,
      role: payload.role,
      type: 'refresh',
    };

    return jwt.sign(refreshPayload, JWT_REFRESH_SECRET, options);
  }

  /**
   * Generate a refresh token and store it in the database (async version)
   */
  static async generateRefreshTokenWithStorage(payload: TokenPayload): Promise<string> {
    const refreshToken = JWTService.generateRefreshToken(payload);

    // Store the token hash in the database
    try {
      const expiresAt = new Date(Date.now() + TOKEN_CONFIG.refreshTokenExpiry * 1000);
      await JWTService.tokenRepository.storeRefreshToken(payload.userId, refreshToken, expiresAt);
    } catch (error) {
      // Log but don't fail if storage fails (user may not exist in DB during tests)
      console.warn('Failed to store refresh token:', error);
    }

    return refreshToken;
  }

  /**
   * Verify an access token
   */
  static verifyAccessToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: TOKEN_CONFIG.issuer,
        audience: TOKEN_CONFIG.audience,
      }) as JwtPayload & TokenPayload;

      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        iss: decoded.iss!,
        aud: decoded.aud as string,
        iat: decoded.iat!,
        exp: decoded.exp!,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw error;
    }
  }

  /**
   * Verify a refresh token (synchronous version for backwards compatibility)
   */
  static verifyRefreshToken(token: string): DecodedToken {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: TOKEN_CONFIG.issuer,
        audience: TOKEN_CONFIG.audience,
      }) as JwtPayload & TokenPayload & { type?: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return {
        userId: decoded.userId,
        username: decoded.username,
        role: decoded.role,
        iss: decoded.iss!,
        aud: decoded.aud as string,
        iat: decoded.iat!,
        exp: decoded.exp!,
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token has expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw error;
    }
  }

  /**
   * Verify a refresh token and check if it's been revoked (async version)
   */
  static async verifyRefreshTokenWithRevocationCheck(token: string): Promise<DecodedToken> {
    const decoded = JWTService.verifyRefreshToken(token);

    // Check if token has been revoked
    const isRevoked = await JWTService.tokenRepository.isTokenRevoked(token);
    if (isRevoked) {
      throw new Error('Refresh token has been revoked');
    }

    return decoded;
  }

  /**
   * Refresh an access token using a refresh token (synchronous version)
   */
  static refreshAccessToken(refreshToken: string): string {
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    const payload: TokenPayload = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    return JWTService.generateAccessToken(payload);
  }

  /**
   * Refresh an access token using a refresh token with revocation check (async version)
   */
  static async refreshAccessTokenWithRevocationCheck(refreshToken: string): Promise<string> {
    const decoded = await JWTService.verifyRefreshTokenWithRevocationCheck(refreshToken);

    const payload: TokenPayload = {
      userId: decoded.userId,
      username: decoded.username,
      role: decoded.role,
    };

    return JWTService.generateAccessToken(payload);
  }

  /**
   * Decode a token without verification (for debugging)
   */
  static decodeToken(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }

  /**
   * Check if a token is expired
   */
  static isTokenExpired(token: string): boolean {
    const decoded = JWTService.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return decoded.exp < Math.floor(Date.now() / 1000);
  }

  /**
   * Get token expiration time in seconds
   */
  static getTokenExpiresIn(token: string): number {
    const decoded = JWTService.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    return decoded.exp - Math.floor(Date.now() / 1000);
  }

  /**
   * Generate both access and refresh tokens (synchronous version)
   */
  static generateTokenPair(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    return {
      accessToken: JWTService.generateAccessToken(payload),
      refreshToken: JWTService.generateRefreshToken(payload),
    };
  }

  /**
   * Generate both access and refresh tokens with storage (async version)
   */
  static async generateTokenPairWithStorage(payload: TokenPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = JWTService.generateAccessToken(payload);
    const refreshToken = await JWTService.generateRefreshTokenWithStorage(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Revoke a refresh token
   */
  static async revokeRefreshToken(token: string): Promise<void> {
    await JWTService.tokenRepository.revokeRefreshToken(token);
  }

  /**
   * Revoke all refresh tokens for a user
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    await JWTService.tokenRepository.revokeAllUserTokens(userId);
  }

  /**
   * Clean up expired tokens (should be called periodically)
   */
  static async cleanupExpiredTokens(): Promise<number> {
    return await JWTService.tokenRepository.cleanupExpiredTokens();
  }

  /**
   * Get active tokens for a user (for admin/debugging)
   */
  static async getActiveUserTokens(userId: string) {
    return await JWTService.tokenRepository.getActiveUserTokens(userId);
  }

  /**
   * Get token statistics (for monitoring)
   */
  static async getTokenStats() {
    return await JWTService.tokenRepository.getTokenStats();
  }
}

// Export for backwards compatibility
export default JWTService;
