/**
 * Socket.IO Authentication Examples
 * Demonstrates how to connect to the server using different authentication methods
 */

import { io, Socket } from 'socket.io-client';

// ============================================
// Example 1: JWT Token Authentication (Recommended for Production)
// ============================================

export function connectWithJWT(accessToken: string): Socket {
  const socket = io('http://localhost:3000', {
    auth: {
      token: accessToken  // JWT access token from login
    }
  });

  socket.on('connect', () => {
    console.log('Connected with JWT authentication');
    console.log('Socket ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('JWT authentication failed:', error.message);
    // Possible errors:
    // - "Token has expired"
    // - "Invalid token"
    // - "Authentication required. Provide a valid JWT token or session token"
  });

  return socket;
}

// ============================================
// Example 2: Session Token Authentication (Legacy Support)
// ============================================

export function connectWithSession(sessionToken: string, playerId: string, playerName?: string): Socket {
  const socket = io('http://localhost:3000', {
    auth: {
      sessionToken: sessionToken,
      playerId: playerId,
      playerName: playerName || playerId
    }
  });

  socket.on('connect', () => {
    console.log('Connected with session authentication');
    console.log('Player ID:', playerId);
  });

  socket.on('connect_error', (error) => {
    console.error('Session authentication failed:', error.message);
    // Possible errors:
    // - "Invalid or expired session"
    // - "Player ID does not match session"
    // - "Authentication failed"
  });

  return socket;
}

// ============================================
// Example 3: Development Mode (Testing Only)
// ============================================

export function connectDevelopmentMode(playerId: string, playerName?: string): Socket {
  // Only works when NODE_ENV !== 'production'
  const socket = io('http://localhost:3000', {
    auth: {
      playerId: playerId,
      playerName: playerName || playerId
    }
  });

  socket.on('connect', () => {
    console.log('Connected in development mode');
    console.log('Player ID:', playerId);
  });

  socket.on('connect_error', (error) => {
    console.error('Development authentication failed:', error.message);
    // Possible errors:
    // - "Player ID required for development mode"
  });

  return socket;
}

// ============================================
// Example 4: JWT with Fallback to Session (Graceful Degradation)
// ============================================

export function connectWithFallback(
  accessToken?: string,
  sessionData?: { sessionToken: string; playerId: string; playerName?: string }
): Socket {
  const auth: any = {};

  // Try JWT first
  if (accessToken) {
    auth.token = accessToken;
  }

  // Provide session as fallback
  if (sessionData) {
    auth.sessionToken = sessionData.sessionToken;
    auth.playerId = sessionData.playerId;
    auth.playerName = sessionData.playerName;
  }

  const socket = io('http://localhost:3000', { auth });

  socket.on('connect', () => {
    console.log('Connected successfully');
    // The server will log which authentication method was used
  });

  socket.on('connect_error', (error) => {
    console.error('All authentication methods failed:', error.message);
  });

  return socket;
}

// ============================================
// Example 5: Token Refresh Handling
// ============================================

export function connectWithAutoRefresh(
  getAccessToken: () => Promise<string>,
  onTokenExpired: () => Promise<string>
): Socket {
  let socket: Socket | null = null;

  async function createConnection() {
    const token = await getAccessToken();

    socket = io('http://localhost:3000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected with access token');
    });

    socket.on('connect_error', async (error) => {
      if (error.message.includes('expired')) {
        console.log('Token expired, refreshing...');
        try {
          await onTokenExpired(); // Get new token
          socket?.disconnect();
          socket = null;
          await createConnection(); // Reconnect with new token
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
        }
      } else {
        console.error('Connection error:', error.message);
      }
    });

    // Handle token expiration during active connection
    socket.on('unauthorized', async (data) => {
      console.log('Unauthorized event received:', data);
      try {
        await onTokenExpired(); // Get new token
        socket?.disconnect();
        socket = null;
        await createConnection();
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
      }
    });

    return socket;
  }

  createConnection();

  return socket!;
}

// ============================================
// Example 6: Using with React/TypeScript Frontend
// ============================================

export class SocketAuthManager {
  private socket: Socket | null = null;

  constructor(private baseURL: string = 'http://localhost:3000') {}

  /**
   * Connect with JWT token
   */
  connect(accessToken: string): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.baseURL, {
        auth: { token: accessToken }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        reject(error);
      });
    });
  }

  /**
   * Reconnect with new token (after refresh)
   */
  async reconnect(newAccessToken: string): Promise<void> {
    if (this.socket) {
      this.socket.disconnect();
    }
    await this.connect(newAccessToken);
  }

  /**
   * Disconnect and cleanup
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get current socket instance
   */
  getSocket(): Socket | null {
    return this.socket;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

// ============================================
// Usage Examples
// ============================================

/*
// Example 1: Simple JWT connection
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
const socket = connectWithJWT(token);

// Example 2: React Hook
function useSocket(accessToken: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const newSocket = connectWithJWT(accessToken);
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [accessToken]);

  return socket;
}

// Example 3: With refresh token
const authManager = new SocketAuthManager();

async function initializeSocket() {
  const token = await fetchAccessToken();
  await authManager.connect(token);

  // Later, when token expires
  const newToken = await refreshAccessToken();
  await authManager.reconnect(newToken);
}

// Example 4: Development testing
if (process.env.NODE_ENV === 'development') {
  const socket = connectDevelopmentMode('test-player-123', 'Test Player');
}
*/
