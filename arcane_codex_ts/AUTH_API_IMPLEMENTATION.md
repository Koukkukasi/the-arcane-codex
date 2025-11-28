# Authentication API Implementation

This document describes the JWT-based authentication API endpoints implemented in arcane_codex_ts.

## Overview

The authentication system uses JWT tokens for secure user authentication with the following features:
- Password hashing with bcrypt (12 salt rounds)
- Access tokens (15 minutes expiry)
- Refresh tokens (7 days expiry) with revocation support
- Secure token storage in database
- Proper error handling and validation

## API Endpoints

All authentication endpoints are available under `/api/auth/` prefix.

### 1. POST /api/auth/register

Register a new user with username and password.

**Request Body:**
```json
{
  "username": "string (2-20 chars, required)",
  "password": "string (min 6 chars, required)",
  "email": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-token"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid input (missing fields, short password, invalid username length)
- `409 Conflict`: Username already taken
- `500 Internal Server Error`: Registration failed

**Features:**
- Password is hashed using bcrypt with 12 salt rounds
- Validates username length (2-20 characters)
- Validates password length (minimum 6 characters)
- Checks for duplicate usernames
- Returns both access and refresh tokens
- Refresh token is stored in database for revocation tracking

### 2. POST /api/auth/login

Login with existing credentials.

**Request Body:**
```json
{
  "username": "string (required)",
  "password": "string (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string"
  },
  "accessToken": "jwt-token",
  "refreshToken": "jwt-token"
}
```

**Error Responses:**
- `400 Bad Request`: Missing username or password
- `401 Unauthorized`: Invalid username or password
- `500 Internal Server Error`: Login failed

**Features:**
- Verifies password using bcrypt compare
- Updates user's last seen timestamp
- Returns fresh token pair
- Refresh token is stored in database

### 3. POST /api/auth/logout

Logout user and revoke refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-token (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Error Responses:**
- `500 Internal Server Error`: Logout failed

**Features:**
- Revokes the provided refresh token in database
- Clears session data (for backward compatibility)
- Gracefully handles missing refresh token
- Logs token revocation attempts

### 4. POST /api/auth/refresh

Refresh access token using a valid refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt-token (required)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "accessToken": "jwt-token"
}
```

**Error Responses:**
- `400 Bad Request`: Missing refresh token
- `401 Unauthorized`: Invalid, expired, or revoked refresh token
- `500 Internal Server Error`: Token refresh failed

**Features:**
- Verifies refresh token signature and expiration
- Checks if token has been revoked in database
- Returns new access token with same user claims
- Does NOT issue a new refresh token (use login for that)

### 5. GET /api/auth/me

Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "preferred_role": "string",
    "total_sessions": number,
    "victories": number,
    "defeats": number
  }
}
```

**Error Responses:**
- `401 Unauthorized`: No token provided or invalid token
- `404 Not Found`: User not found
- `500 Internal Server Error`: Failed to get user info

**Features:**
- Requires valid JWT access token in Authorization header
- Returns comprehensive user profile
- Validates token on each request

## Authentication Middleware

### requireJWT

Middleware that enforces JWT authentication for protected routes.

**Usage:**
```typescript
import { requireJWT } from './routes/auth.routes';

router.get('/protected', requireJWT, async (req, res) => {
  // req.user contains decoded token payload
  const userId = req.user.userId;
  // ... your logic
});
```

**Features:**
- Extracts Bearer token from Authorization header
- Verifies token signature and expiration
- Attaches decoded user info to `req.user`
- Returns 401 if token is missing or invalid

### optionalJWT

Middleware that optionally extracts JWT token without requiring it.

**Usage:**
```typescript
import { optionalJWT } from './routes/auth.routes';

router.get('/public', optionalJWT, async (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is anonymous
  }
});
```

## Token Structure

### Access Token Payload
```json
{
  "userId": "uuid",
  "username": "string",
  "role": "player" | "admin" | "guest",
  "iss": "arcane-codex",
  "aud": "arcane-codex-api",
  "iat": timestamp,
  "exp": timestamp
}
```

### Refresh Token Payload
```json
{
  "userId": "uuid",
  "username": "string",
  "role": "player" | "admin" | "guest",
  "type": "refresh",
  "iss": "arcane-codex",
  "aud": "arcane-codex-api",
  "iat": timestamp,
  "exp": timestamp
}
```

## Security Features

1. **Password Hashing**: Uses bcrypt with 12 salt rounds
2. **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
3. **Token Revocation**: Refresh tokens can be revoked and are tracked in database
4. **Secure Secrets**: Uses environment variables for JWT secrets
5. **Error Messages**: Generic error messages to prevent user enumeration
6. **Input Validation**: Validates all user inputs
7. **Rate Limiting**: Server-wide rate limiting (500 requests/hour)

## Environment Variables

Required environment variables for production:

```env
# JWT Secrets
JWT_SECRET=your-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Session Secret
SESSION_SECRET=your-session-secret-here

# Database Configuration
DATABASE_URL=your-database-url-here
```

## Database Schema

### players table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  player_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  password_hash TEXT,
  preferred_role TEXT,
  avatar_url TEXT,
  theme TEXT,
  total_sessions INTEGER DEFAULT 0,
  total_playtime_minutes INTEGER DEFAULT 0,
  victories INTEGER DEFAULT 0,
  defeats INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### refresh_tokens table
```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  revoked_at TIMESTAMP
);
```

## Testing

Comprehensive test suite is available at `tests/api/auth.spec.ts`.

Run tests:
```bash
npm test tests/api/auth.spec.ts
```

The test suite covers:
- User registration (success and error cases)
- User login (valid and invalid credentials)
- Token refresh (valid and revoked tokens)
- Logout and token revocation
- Protected endpoint access
- Full authentication flow

## Example Usage

### Client-Side Implementation

```typescript
// Register
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myusername',
    password: 'mypassword',
    email: 'user@example.com'
  })
});
const { accessToken, refreshToken } = await registerResponse.json();

// Store tokens securely
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Make authenticated request
const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Refresh token when access token expires
const refreshResponse = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});
const { accessToken: newAccessToken } = await refreshResponse.json();
localStorage.setItem('accessToken', newAccessToken);

// Logout
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refreshToken: localStorage.getItem('refreshToken')
  })
});
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

## Files Modified/Created

### Modified Files
1. `src/routes/auth.routes.ts` - Updated JWT endpoints with token storage and revocation
2. `src/routes/api.ts` - Added `/auth` route prefix

### Created Files
1. `tests/api/auth.spec.ts` - Comprehensive test suite

### Existing Dependencies (Already Present)
1. `src/services/auth/jwt.service.ts` - JWT token generation and verification
2. `src/database/repositories/player.repository.ts` - Player data persistence
3. `src/database/repositories/RefreshTokenRepository.ts` - Token revocation tracking

## Migration Notes

The authentication system is backward compatible with the existing session-based authentication. Legacy endpoints remain available:
- POST /api/set_username
- GET /api/get_username
- POST /api/clear_session
- GET /api/csrf-token

New applications should use the JWT endpoints under `/api/auth/` for better security and scalability.
