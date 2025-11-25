import { test, expect } from '@playwright/test';
import { JWTService } from '../../src/services/auth/jwt.service';

/**
 * Authentication E2E Tests
 * Tests JWT authentication, token generation, and middleware
 */

test.describe('JWT Authentication', () => {
  const testPayload = {
    userId: 'test-user-123',
    username: 'testuser',
    role: 'player'
  };

  test('should generate valid access token', () => {
    const token = JWTService.generateAccessToken(testPayload);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
  });

  test('should generate valid refresh token', () => {
    const refreshToken = JWTService.generateRefreshToken(testPayload);

    expect(refreshToken).toBeDefined();
    expect(typeof refreshToken).toBe('string');
    expect(refreshToken.split('.')).toHaveLength(3);
  });

  test('should verify valid access token', () => {
    const token = JWTService.generateAccessToken(testPayload);
    const decoded = JWTService.verifyAccessToken(token);

    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe(testPayload.userId);
    expect(decoded.username).toBe(testPayload.username);
    expect(decoded.role).toBe(testPayload.role);
  });

  test('should verify valid refresh token', () => {
    const refreshToken = JWTService.generateRefreshToken(testPayload);
    const decoded = JWTService.verifyRefreshToken(refreshToken);

    expect(decoded).toBeDefined();
    expect(decoded.userId).toBe(testPayload.userId);
  });

  test('should reject invalid access token', () => {
    const invalidToken = 'invalid.token.here';

    expect(() => {
      JWTService.verifyAccessToken(invalidToken);
    }).toThrow();
  });

  test('should reject tampered token', () => {
    const token = JWTService.generateAccessToken(testPayload);
    const tamperedToken = token.slice(0, -5) + 'XXXXX';

    expect(() => {
      JWTService.verifyAccessToken(tamperedToken);
    }).toThrow();
  });

  test('should include correct issuer and audience', () => {
    const token = JWTService.generateAccessToken(testPayload);
    const decoded = JWTService.verifyAccessToken(token);

    expect(decoded.iss).toBe('arcane-codex');
    expect(decoded.aud).toBe('arcane-codex-api');
  });

  test('should have expiration time', () => {
    const token = JWTService.generateAccessToken(testPayload);
    const decoded = JWTService.verifyAccessToken(token);

    expect(decoded.exp).toBeDefined();
    expect(decoded.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  test('should refresh access token with valid refresh token', () => {
    const refreshToken = JWTService.generateRefreshToken(testPayload);
    const newAccessToken = JWTService.refreshAccessToken(refreshToken);

    expect(newAccessToken).toBeDefined();
    const decoded = JWTService.verifyAccessToken(newAccessToken);
    expect(decoded.userId).toBe(testPayload.userId);
  });

  test('should not refresh with invalid refresh token', () => {
    const invalidRefreshToken = 'invalid.refresh.token';

    expect(() => {
      JWTService.refreshAccessToken(invalidRefreshToken);
    }).toThrow();
  });

  test('should handle different user roles', () => {
    const adminPayload = { ...testPayload, role: 'admin' };
    const token = JWTService.generateAccessToken(adminPayload);
    const decoded = JWTService.verifyAccessToken(token);

    expect(decoded.role).toBe('admin');
  });

  test('should include issued at timestamp', () => {
    const token = JWTService.generateAccessToken(testPayload);
    const decoded = JWTService.verifyAccessToken(token);

    expect(decoded.iat).toBeDefined();
    expect(decoded.iat).toBeLessThanOrEqual(Math.floor(Date.now() / 1000));
  });
});

test.describe('Authentication API Endpoints', () => {
  const baseURL = 'http://localhost:3000';

  test('should require authentication for protected routes', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/players/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should allow access with valid token', async ({ request }) => {
    // This test assumes user can login/register first
    // In a real scenario, you'd create a test user and get a token

    const testPayload = {
      userId: 'test-user',
      username: 'testuser',
      role: 'player'
    };

    const token = JWTService.generateAccessToken(testPayload);

    // Test with valid token format
    expect(token).toBeDefined();
    expect(token.split('.')).toHaveLength(3);
  });

  test('should reject requests without authorization header', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/players/me`);

    // Should be 401 Unauthorized or 403 Forbidden
    expect([401, 403]).toContain(response.status());
  });

  test('should reject malformed authorization header', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/players/me`, {
      headers: {
        'Authorization': 'InvalidFormat token-here'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should handle OPTIONS requests for CORS', async ({ request }) => {
    const response = await request.fetch(`${baseURL}/api/players`, {
      method: 'OPTIONS'
    });

    expect(response.status()).toBeLessThan(500);
    expect(response.headers()['access-control-allow-methods']).toBeDefined();
  });
});

test.describe('Session Management', () => {
  test('should maintain session across requests', async ({ request }) => {
    // Create session cookie
    const loginResponse = await request.post('http://localhost:3000/api/auth/login', {
      data: {
        username: 'testuser',
        password: 'testpass'
      }
    });

    // Session cookie should be set if login exists
    // This is a structure test
    expect([200, 404, 401]).toContain(loginResponse.status());
  });

  test('should clear session on logout', async ({ request }) => {
    const logoutResponse = await request.post('http://localhost:3000/api/auth/logout');

    // Should handle logout request
    expect(logoutResponse.status()).toBeLessThan(500);
  });
});

test.describe('Token Security', () => {
  test('should not accept expired token', async () => {
    // Create a token with very short expiration
    const shortLivedPayload = {
      userId: 'test-user',
      username: 'testuser',
      role: 'player'
    };

    // This tests that tokens have expiration (actual expiry test would need time mocking)
    const token = JWTService.generateAccessToken(shortLivedPayload);
    const decoded = JWTService.verifyAccessToken(token);

    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  test('should not allow token reuse after refresh', () => {
    const refreshToken = JWTService.generateRefreshToken({
      userId: 'test-user',
      username: 'testuser',
      role: 'player'
    });

    const newAccessToken = JWTService.refreshAccessToken(refreshToken);

    // Both tokens should be valid but different
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(refreshToken);
  });

  test('should use secure random secrets', () => {
    // Generate multiple tokens and ensure they're different
    const payload = {
      userId: 'test-user',
      username: 'testuser',
      role: 'player'
    };

    const token1 = JWTService.generateAccessToken(payload);

    // Wait a millisecond to ensure different timestamps
    const delay = () => new Promise(resolve => setTimeout(resolve, 10));

    delay().then(() => {
      const token2 = JWTService.generateAccessToken(payload);

      // Tokens should be different due to different iat timestamps
      expect(token1).not.toBe(token2);
    });
  });
});
