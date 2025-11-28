/**
 * Authentication API Tests
 * Tests for JWT-based authentication endpoints
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const API_URL = `${BASE_URL}/api/auth`;

test.describe('Authentication API', () => {
  let testUsername: string;
  let testPassword: string;
  let accessToken: string;
  let refreshToken: string;

  test.beforeEach(() => {
    // Generate unique username for each test to avoid conflicts
    testUsername = `testuser_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    testPassword = 'testpass123';
  });

  test('POST /api/auth/register - should register a new user', async ({ request }) => {
    const response = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword,
        email: `${testUsername}@test.com`
      }
    });

    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('User registered successfully');
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe(testUsername);
    expect(data.user.email).toBe(`${testUsername}@test.com`);
    expect(data.accessToken).toBeDefined();
    expect(data.refreshToken).toBeDefined();

    // Store tokens for later tests
    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  test('POST /api/auth/register - should reject registration with missing fields', async ({ request }) => {
    const response = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername
        // Missing password
      }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  test('POST /api/auth/register - should reject short password', async ({ request }) => {
    const response = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: '123' // Too short
      }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('at least 6 characters');
  });

  test('POST /api/auth/register - should reject duplicate username', async ({ request }) => {
    // First registration
    await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    // Try to register with same username
    const response = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    expect(response.status()).toBe(409);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('already taken');
  });

  test('POST /api/auth/login - should login with valid credentials', async ({ request }) => {
    // First register
    await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    // Then login
    const response = await request.post(`${API_URL}/login`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.message).toBe('Login successful');
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe(testUsername);
    expect(data.accessToken).toBeDefined();
    expect(data.refreshToken).toBeDefined();

    accessToken = data.accessToken;
    refreshToken = data.refreshToken;
  });

  test('POST /api/auth/login - should reject invalid username', async ({ request }) => {
    const response = await request.post(`${API_URL}/login`, {
      data: {
        username: 'nonexistent_user',
        password: 'somepassword'
      }
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid username or password');
  });

  test('POST /api/auth/login - should reject invalid password', async ({ request }) => {
    // First register
    await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    // Try login with wrong password
    const response = await request.post(`${API_URL}/login`, {
      data: {
        username: testUsername,
        password: 'wrongpassword'
      }
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('Invalid username or password');
  });

  test('GET /api/auth/me - should return user info with valid token', async ({ request }) => {
    // Register and get token
    const registerResponse = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword,
        email: `${testUsername}@test.com`
      }
    });

    const registerData = await registerResponse.json();
    const token = registerData.accessToken;

    // Get user info
    const response = await request.get(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(data.user.username).toBe(testUsername);
    expect(data.user.email).toBe(`${testUsername}@test.com`);
  });

  test('GET /api/auth/me - should reject request without token', async ({ request }) => {
    const response = await request.get(`${API_URL}/me`);

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('No token provided');
  });

  test('GET /api/auth/me - should reject request with invalid token', async ({ request }) => {
    const response = await request.get(`${API_URL}/me`, {
      headers: {
        'Authorization': 'Bearer invalid_token_here'
      }
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test('POST /api/auth/refresh - should refresh access token with valid refresh token', async ({ request }) => {
    // Register and get tokens
    const registerResponse = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    const registerData = await registerResponse.json();
    const refreshTokenValue = registerData.refreshToken;

    // Refresh the access token
    const response = await request.post(`${API_URL}/refresh`, {
      data: {
        refreshToken: refreshTokenValue
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.accessToken).toBeDefined();
    expect(typeof data.accessToken).toBe('string');
  });

  test('POST /api/auth/refresh - should reject invalid refresh token', async ({ request }) => {
    const response = await request.post(`${API_URL}/refresh`, {
      data: {
        refreshToken: 'invalid_refresh_token'
      }
    });

    expect(response.status()).toBe(401);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toBeDefined();
  });

  test('POST /api/auth/refresh - should reject missing refresh token', async ({ request }) => {
    const response = await request.post(`${API_URL}/refresh`, {
      data: {}
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('required');
  });

  test('POST /api/auth/logout - should logout and revoke refresh token', async ({ request }) => {
    // Register and get tokens
    const registerResponse = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    const registerData = await registerResponse.json();
    const refreshTokenValue = registerData.refreshToken;

    // Logout
    const logoutResponse = await request.post(`${API_URL}/logout`, {
      data: {
        refreshToken: refreshTokenValue
      }
    });

    expect(logoutResponse.status()).toBe(200);

    const logoutData = await logoutResponse.json();
    expect(logoutData.success).toBe(true);
    expect(logoutData.message).toBe('Logged out successfully');

    // Try to use the refresh token - should fail
    const refreshResponse = await request.post(`${API_URL}/refresh`, {
      data: {
        refreshToken: refreshTokenValue
      }
    });

    expect(refreshResponse.status()).toBe(401);

    const refreshData = await refreshResponse.json();
    expect(refreshData.success).toBe(false);
  });

  test('POST /api/auth/logout - should work without refresh token', async ({ request }) => {
    const response = await request.post(`${API_URL}/logout`, {
      data: {}
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.success).toBe(true);
  });

  test('Full authentication flow', async ({ request }) => {
    // 1. Register
    const registerResponse = await request.post(`${API_URL}/register`, {
      data: {
        username: testUsername,
        password: testPassword,
        email: `${testUsername}@test.com`
      }
    });

    expect(registerResponse.status()).toBe(201);
    const registerData = await registerResponse.json();
    expect(registerData.success).toBe(true);

    const firstAccessToken = registerData.accessToken;
    const firstRefreshToken = registerData.refreshToken;

    // 2. Get user info with access token
    const meResponse = await request.get(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${firstAccessToken}`
      }
    });

    expect(meResponse.status()).toBe(200);
    const meData = await meResponse.json();
    expect(meData.user.username).toBe(testUsername);

    // 3. Refresh access token
    const refreshResponse = await request.post(`${API_URL}/refresh`, {
      data: {
        refreshToken: firstRefreshToken
      }
    });

    expect(refreshResponse.status()).toBe(200);
    const refreshData = await refreshResponse.json();
    const newAccessToken = refreshData.accessToken;

    // 4. Use new access token
    const meResponse2 = await request.get(`${API_URL}/me`, {
      headers: {
        'Authorization': `Bearer ${newAccessToken}`
      }
    });

    expect(meResponse2.status()).toBe(200);

    // 5. Logout
    const logoutResponse = await request.post(`${API_URL}/logout`, {
      data: {
        refreshToken: firstRefreshToken
      }
    });

    expect(logoutResponse.status()).toBe(200);

    // 6. Verify refresh token is revoked
    const refreshResponse2 = await request.post(`${API_URL}/refresh`, {
      data: {
        refreshToken: firstRefreshToken
      }
    });

    expect(refreshResponse2.status()).toBe(401);

    // 7. Login again
    const loginResponse = await request.post(`${API_URL}/login`, {
      data: {
        username: testUsername,
        password: testPassword
      }
    });

    expect(loginResponse.status()).toBe(200);
    const loginData = await loginResponse.json();
    expect(loginData.success).toBe(true);
    expect(loginData.accessToken).toBeDefined();
  });
});
