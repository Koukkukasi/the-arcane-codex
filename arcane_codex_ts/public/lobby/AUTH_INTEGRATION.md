# Frontend Authentication Integration

## Overview

The Arcane Codex lobby now has full JWT-based authentication integration. Users must login or register before accessing the lobby features.

## Files Modified/Created

### New Files
- `public/lobby/auth.js` - AuthManager class for handling JWT tokens
- `public/lobby/AUTH_INTEGRATION.md` - This documentation

### Modified Files
- `public/lobby/index.html` - Added auth modal UI and user display
- `public/lobby/lobby.js` - Integrated AuthManager and JWT token handling

## Features

### AuthManager (auth.js)

The AuthManager class provides:

1. **Token Storage**: Stores access and refresh tokens in localStorage
   - `arcane_access_token` - JWT access token
   - `arcane_refresh_token` - JWT refresh token
   - `arcane_user_data` - User profile data

2. **Auto Token Refresh**: Automatically refreshes tokens 1 minute before expiry
   - Schedules refresh based on token expiry time
   - Prevents session interruption

3. **Authentication Methods**:
   - `login(username, password)` - Login with credentials
   - `register(username, password, email)` - Create new account
   - `logout()` - Logout and clear tokens
   - `refreshToken()` - Manually refresh access token
   - `isAuthenticated()` - Check if user is logged in
   - `getAccessToken()` - Get current access token
   - `getUser()` - Get current user data

### Auth Modal UI

Beautiful arcane-themed login/register modal with:

- Tab-based interface for Login/Register
- Form validation
- Error display
- CRT/phosphor green aesthetic matching lobby theme
- Mystical purple glow effects

### Lobby Integration

1. **On Page Load**:
   - Checks if user is authenticated
   - Shows auth modal if not logged in
   - Shows lobby if authenticated

2. **JWT Token Usage**:
   - Passes JWT token in Socket.IO auth object
   - Includes `Authorization: Bearer <token>` header in all API requests
   - Handles 401 responses by showing login modal

3. **User Display**:
   - Shows logged-in username in header
   - Logout button to end session

4. **Auto-Logout on 401**:
   - Global fetch wrapper detects 401 responses
   - Automatically logs out and shows auth modal

## API Endpoints Used

All endpoints are under `/api/auth`:

- `POST /register` - Create new account
- `POST /login` - Login with username/password
- `POST /logout` - Logout (revokes refresh token)
- `POST /refresh` - Refresh access token
- `GET /me` - Get current user profile

## Token Flow

1. User logs in or registers
2. Server returns access token (15 min) and refresh token (7 days)
3. Tokens stored in localStorage
4. Access token included in all API requests
5. Auto-refresh scheduled 1 minute before expiry
6. On 401 response, user is logged out

## Usage

### Login
1. User enters username and password
2. Click "Enter the Codex"
3. On success, auth modal closes and lobby initializes

### Register
1. Switch to Register tab
2. Enter username, optional email, password, confirm password
3. Click "Join the Codex"
4. On success, account created and user logged in

### Logout
1. Click logout button in header
2. Tokens cleared, socket disconnected
3. Auth modal shown again

## Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiry
- Refresh token revocation on logout
- Auto-logout on token expiry
- Token stored in localStorage (not cookies for simplicity)

## Future Enhancements

- Remember me functionality (extend refresh token expiry)
- Password reset flow
- Email verification
- Two-factor authentication
- Social login (OAuth)
