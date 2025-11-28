# Socket.IO JWT Authentication Enhancement

This document describes the enhancements made to the Socket.IO authentication middleware to support JWT token authentication.

## Overview

The Socket.IO authentication middleware has been enhanced to support JWT token authentication while maintaining backward compatibility with the existing session-based authentication system.

## Files Modified

### 1. `src/middleware/socketAuth.ts`
Main authentication middleware file with the following changes:

#### New Imports
```typescript
import { JWTService, DecodedToken } from '../services/auth/jwt.service';
```

#### New Interfaces

**SocketAuthData Interface**
```typescript
export interface SocketAuthData {
  token?: string;        // JWT access token (new)
  playerId?: string;     // For legacy/dev compatibility
  playerName?: string;   // Optional display name
  sessionToken?: string; // Legacy session token
}
```

**Enhanced AuthenticatedSocket Interface**
```typescript
export interface AuthenticatedSocket extends Socket {
  playerId?: string;
  playerName?: string;
  sessionId?: string;
  userId?: string;       // From JWT token (new)
  userRole?: 'player' | 'admin' | 'guest'; // From JWT token (new)
  authMethod?: 'jwt' | 'session' | 'development'; // Track auth method used (new)
}
```

#### New Functions

**authenticateWithJWT()**
- Verifies JWT access tokens using `JWTService.verifyAccessToken()`
- Extracts userId, username, and role from the token
- Attaches user data to the socket object
- Returns success/error result with decoded token data

**authenticateWithSession()**
- Validates session tokens using the existing session store
- Verifies playerId matches the session
- Attaches session data to the socket object
- Returns success/error result

#### Enhanced socketAuthMiddleware()

The middleware now implements a priority-based authentication flow:

**Priority 1: JWT Token Authentication**
- If `handshake.auth.token` is provided, attempt JWT verification
- On success, immediately authenticate the connection
- On failure, fall back to other methods

**Priority 2: Session Token Authentication**
- If `handshake.auth.sessionToken` and `handshake.auth.playerId` are provided
- Validate the session token against the session store
- On success in production, authenticate the connection
- On failure in production, reject the connection

**Priority 3: Development Mode**
- When `NODE_ENV !== 'production'`
- Allow connections with just `playerId` for testing
- Mark the connection with `authMethod: 'development'`

## Files Created

### 1. `src/middleware/socketAuth.example.ts`
Comprehensive examples showing how to connect using different authentication methods:
- JWT token authentication (recommended)
- Session token authentication (legacy)
- Development mode (testing)
- JWT with session fallback
- Token refresh handling
- React/TypeScript integration examples

## Authentication Flow

```
Client Connects
    |
    v
Has JWT Token? --YES--> Verify JWT --SUCCESS--> Authenticate
    |                       |
    NO                      FAIL
    |                       |
    v                       v
Has Session Token? --YES--> Verify Session --SUCCESS--> Authenticate
    |                           |
    NO                          FAIL
    |                           |
    v                           v
Development Mode? --YES--> Check PlayerId --VALID--> Authenticate
    |                           |
    NO                          INVALID
    |                           |
    v                           v
  REJECT                      REJECT
```

## Error Messages

The middleware provides specific error messages for different failure scenarios:

- **JWT Errors:**
  - "Token has expired"
  - "Invalid token"

- **Session Errors:**
  - "Invalid or expired session"
  - "Player ID does not match session"
  - "Authentication failed"

- **Development Mode Errors:**
  - "Player ID required for development mode"

- **General Errors:**
  - "Authentication required. Provide a valid JWT token or session token"

## Security Logging

All authentication attempts are logged with the following events:

- `socket_jwt_authenticated` - Successful JWT authentication
- `socket_jwt_verification_failed` - JWT verification failed
- `socket_jwt_fallback` - JWT failed, trying fallback
- `socket_session_authenticated` - Successful session authentication
- `socket_auth_invalid_session` - Invalid session token
- `socket_auth_player_mismatch` - Player ID doesn't match session
- `socket_dev_authenticated` - Development mode authentication
- `socket_auth_rejected` - Connection rejected (no valid auth)
- `socket_auth_all_methods_failed` - All auth methods failed

## Client-Side Usage

### Example 1: JWT Authentication (Recommended)

```typescript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
});

socket.on('connect', () => {
  console.log('Connected with JWT authentication');
});

socket.on('connect_error', (error) => {
  console.error('Authentication failed:', error.message);
});
```

### Example 2: Session Authentication (Legacy)

```typescript
const socket = io('http://localhost:3000', {
  auth: {
    sessionToken: 'session-token-here',
    playerId: 'player-123',
    playerName: 'Player Name'
  }
});
```

### Example 3: Development Mode

```typescript
// Only works when NODE_ENV !== 'production'
const socket = io('http://localhost:3000', {
  auth: {
    playerId: 'test-player-123',
    playerName: 'Test Player'
  }
});
```

### Example 4: Graceful Fallback

```typescript
const socket = io('http://localhost:3000', {
  auth: {
    token: jwtToken,              // Try JWT first
    sessionToken: sessionToken,   // Fallback to session
    playerId: playerId,           // Required for session auth
    playerName: playerName        // Optional
  }
});
```

## Server-Side Usage

The middleware is automatically applied to all Socket.IO connections. No changes are required to existing code.

### Accessing User Data

After successful authentication, the socket object contains:

```typescript
socket.userId       // User ID from JWT (if JWT auth used)
socket.playerId     // Player ID (userId for JWT, playerId for session/dev)
socket.playerName   // Player/username
socket.userRole     // User role from JWT: 'player' | 'admin' | 'guest'
socket.authMethod   // How the user authenticated: 'jwt' | 'session' | 'development'
socket.sessionId    // Session token (if session auth used)
```

### Example Event Handler

```typescript
io.on('connection', (socket: AuthenticatedSocket) => {
  console.log('User connected:', {
    userId: socket.userId,
    playerId: socket.playerId,
    playerName: socket.playerName,
    role: socket.userRole,
    authMethod: socket.authMethod
  });

  socket.on('someEvent', (data) => {
    // Use socket.userId, socket.playerId, etc.
    if (socket.userRole === 'admin') {
      // Handle admin-specific logic
    }
  });
});
```

## Migration Guide

### For Existing Clients

No changes required! Existing session-based authentication continues to work exactly as before.

### For New Clients

Use JWT authentication for improved security:

1. Obtain a JWT access token from the auth endpoint (`POST /api/auth/login`)
2. Connect to Socket.IO with the token in `handshake.auth.token`
3. Handle token expiration by refreshing and reconnecting

### For Development/Testing

Use the simplified development mode:

```typescript
const socket = io('http://localhost:3000', {
  auth: {
    playerId: 'test-player-id',
    playerName: 'Test Player'
  }
});
```

Note: Development mode only works when `NODE_ENV !== 'production'`

## Benefits

1. **Enhanced Security**: JWT tokens provide stateless authentication with cryptographic signatures
2. **Backward Compatibility**: Existing session-based auth continues to work
3. **Flexible**: Supports multiple authentication methods with automatic fallback
4. **Development Friendly**: Simplified auth for local testing
5. **Role-Based Access**: JWT tokens include role information for authorization
6. **Better Logging**: Detailed security logging for all authentication attempts
7. **Type Safety**: Full TypeScript support with proper interfaces

## Testing

### Test JWT Authentication

```bash
# 1. Start the server
npm run dev

# 2. Get a JWT token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password"}'

# 3. Connect with the token using a Socket.IO client
# See socketAuth.example.ts for client code examples
```

### Test Session Authentication

Existing session-based tests should continue to pass without modification.

### Test Development Mode

```bash
# Set NODE_ENV to development (or leave it unset)
NODE_ENV=development npm run dev

# Connect with just playerId - should succeed
```

## Future Enhancements

Potential improvements for future versions:

1. **Token Refresh**: Automatic token refresh on expiration
2. **Redis Integration**: Store sessions in Redis for scalability
3. **Rate Limiting**: Prevent brute force authentication attempts
4. **WebSocket Reconnection**: Better handling of reconnection with expired tokens
5. **Custom Claims**: Support for custom JWT claims and validation
6. **Multi-Factor Auth**: Support for MFA in socket authentication

## Related Files

- `src/services/auth/jwt.service.ts` - JWT token generation and verification
- `src/middleware/socketAuth.ts` - Main authentication middleware
- `src/middleware/socketAuth.example.ts` - Client-side usage examples
- `src/validation/socketSchemas.ts` - Socket event validation schemas

## Support

For questions or issues related to Socket.IO authentication:

1. Check the examples in `socketAuth.example.ts`
2. Review security logs for authentication errors
3. Verify JWT token is valid and not expired
4. Ensure environment variables are set correctly
