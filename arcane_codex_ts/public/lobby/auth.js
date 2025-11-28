/**
 * AuthManager - Frontend JWT Authentication Manager
 * Handles token storage, refresh, and authentication state
 */

class AuthManager {
  constructor() {
    // Token storage keys
    this.ACCESS_TOKEN_KEY = 'arcane_access_token';
    this.REFRESH_TOKEN_KEY = 'arcane_refresh_token';
    this.USER_DATA_KEY = 'arcane_user_data';

    // Token refresh timing (refresh 1 minute before expiry)
    this.REFRESH_BUFFER_MS = 60 * 1000; // 1 minute
    this.refreshTimer = null;

    // Load tokens from localStorage
    this.loadTokens();

    // Start auto-refresh if we have tokens
    if (this.isAuthenticated()) {
      this.scheduleTokenRefresh();
    }
  }

  /**
   * Load tokens from localStorage
   */
  loadTokens() {
    this.accessToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    this.refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

    const userData = localStorage.getItem(this.USER_DATA_KEY);
    this.user = userData ? JSON.parse(userData) : null;
  }

  /**
   * Save tokens to localStorage
   */
  saveTokens(accessToken, refreshToken, user) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.user = user;

    localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(user));
  }

  /**
   * Clear tokens from memory and localStorage
   */
  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;

    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_DATA_KEY);

    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.accessToken && !!this.refreshToken;
  }

  /**
   * Get current access token
   */
  getAccessToken() {
    return this.accessToken;
  }

  /**
   * Get current user data
   */
  getUser() {
    return this.user;
  }

  /**
   * Decode JWT token (without verification - just parse payload)
   */
  decodeToken(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;

      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('[Auth] Failed to decode token', error);
      return null;
    }
  }

  /**
   * Get token expiry time in milliseconds
   */
  getTokenExpiry(token) {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return null;

    return decoded.exp * 1000; // Convert to milliseconds
  }

  /**
   * Schedule automatic token refresh
   */
  scheduleTokenRefresh() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    if (!this.accessToken) return;

    const expiry = this.getTokenExpiry(this.accessToken);
    if (!expiry) return;

    const now = Date.now();
    const timeUntilRefresh = expiry - now - this.REFRESH_BUFFER_MS;

    if (timeUntilRefresh <= 0) {
      // Token expired or about to expire, refresh immediately
      this.refreshTokenNow();
    } else {
      // Schedule refresh
      this.refreshTimer = setTimeout(() => {
        this.refreshTokenNow();
      }, timeUntilRefresh);

      console.log(`[Auth] Token refresh scheduled in ${Math.round(timeUntilRefresh / 1000)}s`);
    }
  }

  /**
   * Refresh access token immediately
   */
  async refreshTokenNow() {
    try {
      if (!this.refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();

      if (data.success && data.accessToken) {
        // Update access token
        this.accessToken = data.accessToken;
        localStorage.setItem(this.ACCESS_TOKEN_KEY, data.accessToken);

        console.log('[Auth] Token refreshed successfully');

        // Schedule next refresh
        this.scheduleTokenRefresh();

        return data.accessToken;
      } else {
        throw new Error(data.error || 'Token refresh failed');
      }
    } catch (error) {
      console.error('[Auth] Token refresh failed', error);
      // Clear tokens and force re-login
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(username, password, email = null) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email })
      });

      const data = await response.json();

      if (data.success) {
        // Save tokens
        this.saveTokens(data.accessToken, data.refreshToken, data.user);

        // Schedule token refresh
        this.scheduleTokenRefresh();

        console.log('[Auth] Registration successful', data.user.username);

        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[Auth] Registration failed', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }

  /**
   * Login with username and password
   */
  async login(username, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        // Save tokens
        this.saveTokens(data.accessToken, data.refreshToken, data.user);

        // Schedule token refresh
        this.scheduleTokenRefresh();

        console.log('[Auth] Login successful', data.user.username);

        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[Auth] Login failed', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      const refreshToken = this.refreshToken;

      // Clear tokens locally first
      this.clearTokens();

      // Call logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      console.log('[Auth] Logout successful');

      return { success: true };
    } catch (error) {
      console.error('[Auth] Logout failed', error);
      return { success: false, error: 'Logout failed' };
    }
  }

  /**
   * Fetch user profile from /me endpoint
   */
  async fetchUserProfile() {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update user data
        this.user = data.user;
        localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[Auth] Failed to fetch user profile', error);
      return { success: false, error: 'Failed to fetch user profile' };
    }
  }
}

// Export singleton instance
const authManager = new AuthManager();
