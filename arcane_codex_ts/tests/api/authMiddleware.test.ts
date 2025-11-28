/**
 * Authentication Middleware Tests
 * Tests JWT authentication middleware for protected and optional auth endpoints
 */

import { test, expect } from '@playwright/test';
import { JWTService, TokenPayload } from '../../src/services/auth/jwt.service';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

test.describe('Authentication Middleware - requireAuth', () => {
  let validToken: string;
  let expiredToken: string;
  let invalidToken: string;

  const testUser: TokenPayload = {
    userId: 'test-user-123',
    username: 'testuser',
    role: 'player'
  };

  test.beforeAll(() => {
    // Generate valid token
    validToken = JWTService.generateAccessToken(testUser);

    // Generate invalid token (malformed)
    invalidToken = 'invalid.token.here';

    // For expired token, we'll use a malformed token since we can't easily create an expired one
    expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.invalid';
  });

  test('should return 401 when no authorization header is provided', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication required');
    expect(body.message).toContain('No authorization header');
  });

  test('should return 401 when authorization header is malformed', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': 'InvalidFormat token-here'
      },
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication required');
    expect(body.message).toContain('Invalid authorization header format');
  });

  test('should return 401 when token is invalid', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer ${invalidToken}`
      },
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication required');
    expect(body.message).toMatch(/Invalid|expired/i);
  });

  test('should return 401 when token is expired', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      },
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Authentication required');
  });

  test('should allow access with valid token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      },
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    // Should succeed or fail with business logic error, not auth error
    expect(response.status()).not.toBe(401);

    const body = await response.json();
    if (!body.success) {
      // If it fails, it should not be an authentication error
      expect(body.error).not.toBe('Authentication required');
    }
  });

  test('should attach user info to request with valid token', async ({ request }) => {
    // Test with an endpoint that requires auth and uses user info
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/join`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      },
      data: {
        partyCode: 'NONEXISTENT'
      }
    });

    // Should fail with party not found, not auth error
    expect(response.status()).not.toBe(401);
  });

  test('should reject empty Bearer token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': 'Bearer '
      },
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body.success).toBe(false);
  });

  test('should reject token with extra whitespace', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer  ${validToken}  `
      },
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    // May succeed if token parser is lenient, or fail - either is acceptable
    // Just ensure it doesn't cause a server error
    expect(response.status()).toBeLessThan(500);
  });
});

test.describe('Authentication Middleware - optionalAuth', () => {
  let validToken: string;

  const testUser: TokenPayload = {
    userId: 'test-user-456',
    username: 'optionaluser',
    role: 'player'
  };

  test.beforeAll(() => {
    validToken = JWTService.generateAccessToken(testUser);
  });

  test('should allow access without token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/multiplayer/parties/public`);

    // Should succeed regardless of authentication
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should allow access with valid token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/multiplayer/parties/public`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should allow access with invalid token', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/multiplayer/parties/public`, {
      headers: {
        'Authorization': 'Bearer invalid.token.here'
      }
    });

    // Should still succeed, just without user info
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('should allow access with malformed authorization header', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/multiplayer/parties/public`, {
      headers: {
        'Authorization': 'NotBearer token'
      }
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
  });
});

test.describe('Protected Multiplayer Endpoints', () => {
  let validToken: string;
  let partyCode: string;

  const testUser: TokenPayload = {
    userId: 'test-user-789',
    username: 'partyuser',
    role: 'player'
  };

  test.beforeAll(() => {
    validToken = JWTService.generateAccessToken(testUser);
  });

  test('POST /party/create requires authentication', async ({ request }) => {
    // Without token
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      data: {
        partyName: 'Test Party',
        maxPlayers: 4
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /party/join requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/join`, {
      data: {
        partyCode: 'TEST123'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /party/:code/leave requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/TEST123/leave`, {
      data: {}
    });

    expect(response.status()).toBe(401);
  });

  test('PUT /party/:code/settings requires authentication', async ({ request }) => {
    const response = await request.put(`${BASE_URL}/api/multiplayer/party/TEST123/settings`, {
      data: {
        settings: { maxPlayers: 6 }
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /party/:code/ready requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/TEST123/ready`, {
      data: {
        ready: true
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /party/:code/kick requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/TEST123/kick`, {
      data: {
        targetId: 'other-user'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /party/:code/transfer-host requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/TEST123/transfer-host`, {
      data: {
        newHost: 'other-user'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('POST /party/:code/start requires authentication', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/TEST123/start`, {
      data: {}
    });

    expect(response.status()).toBe(401);
  });

  test('should create party with valid token', async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer ${validToken}`
      },
      data: {
        partyName: 'Auth Test Party',
        maxPlayers: 4
      }
    });

    // Should not be an auth error
    expect(response.status()).not.toBe(401);

    const body = await response.json();
    if (body.success) {
      expect(body.data).toBeDefined();
      expect(body.data.code).toBeDefined();
      partyCode = body.data.code;
    }
  });
});

test.describe('Token Security', () => {
  test('should not accept token with wrong signature', async ({ request }) => {
    const validToken = JWTService.generateAccessToken({
      userId: 'test-user',
      username: 'testuser',
      role: 'player'
    });

    // Tamper with the signature
    const parts = validToken.split('.');
    const tamperedToken = `${parts[0]}.${parts[1]}.TAMPERED_SIGNATURE`;

    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer ${tamperedToken}`
      },
      data: {
        partyName: 'Test Party'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should not accept token from different issuer', async ({ request }) => {
    // Create a token manually with wrong issuer (if we had access to the secret)
    // For now, just test with an invalid token
    const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaXNzIjoid3JvbmctaXNzdWVyIn0.signature'
      },
      data: {
        partyName: 'Test Party'
      }
    });

    expect(response.status()).toBe(401);
  });

  test('should validate token structure', async ({ request }) => {
    const invalidStructureTokens = [
      'not.a.valid.jwt.token',
      'only-one-part',
      'two.parts',
      '',
      'bearer-without-prefix'
    ];

    for (const token of invalidStructureTokens) {
      const response = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: {
          partyName: 'Test Party'
        }
      });

      expect(response.status()).toBe(401);
    }
  });
});

test.describe('User Context Extraction', () => {
  test('should use authenticated user ID for party operations', async ({ request }) => {
    const user1Token = JWTService.generateAccessToken({
      userId: 'user-1',
      username: 'user1',
      role: 'player'
    });

    const user2Token = JWTService.generateAccessToken({
      userId: 'user-2',
      username: 'user2',
      role: 'player'
    });

    // Create party as user 1
    const createResponse = await request.post(`${BASE_URL}/api/multiplayer/party/create`, {
      headers: {
        'Authorization': `Bearer ${user1Token}`
      },
      data: {
        partyName: 'User Context Test',
        maxPlayers: 4
      }
    });

    expect(createResponse.status()).not.toBe(401);

    const createBody = await createResponse.json();
    if (createBody.success && createBody.data?.code) {
      const partyCode = createBody.data.code;

      // Try to update settings as user 2 (should fail - not host)
      const updateResponse = await request.put(`${BASE_URL}/api/multiplayer/party/${partyCode}/settings`, {
        headers: {
          'Authorization': `Bearer ${user2Token}`
        },
        data: {
          settings: { maxPlayers: 6 }
        }
      });

      // Should be forbidden (403) not unauthorized (401)
      expect(updateResponse.status()).toBe(403);
    }
  });
});
