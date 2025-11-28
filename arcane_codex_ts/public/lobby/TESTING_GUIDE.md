# Authentication Testing Guide

## Quick Test Checklist

### 1. Initial Load (No Auth)
- [ ] Open lobby page
- [ ] Auth modal should appear automatically
- [ ] Cannot access lobby features without login
- [ ] Arcane theme matches (purple glow, green text)

### 2. Register Flow
- [ ] Switch to Register tab
- [ ] Enter username (2-20 chars)
- [ ] Enter password (min 6 chars)
- [ ] Confirm password (must match)
- [ ] Optional email field
- [ ] Click "Join the Codex"
- [ ] Should create account and show lobby
- [ ] Username displayed in header
- [ ] Toast notification shows welcome message

### 3. Login Flow
- [ ] Logout (if logged in)
- [ ] Auth modal appears
- [ ] Enter username and password
- [ ] Click "Enter the Codex"
- [ ] Should login and show lobby
- [ ] Username displayed in header

### 4. Token Auto-Refresh
- [ ] Login successfully
- [ ] Check browser console for refresh scheduling message
- [ ] Token should auto-refresh 1 min before expiry
- [ ] No interruption to user experience

### 5. Logout Flow
- [ ] Click logout button in header
- [ ] Should disconnect socket
- [ ] Clear all UI state
- [ ] Show auth modal again
- [ ] Toast shows "Logged out successfully"

### 6. Error Handling
- [ ] Try login with wrong password → Shows error
- [ ] Try register with existing username → Shows error
- [ ] Try register with password mismatch → Shows error
- [ ] Try register with short username → Shows error
- [ ] Try register with short password → Shows error

### 7. JWT Token Usage
- [ ] Check Network tab in browser DevTools
- [ ] All API requests should have `Authorization: Bearer <token>` header
- [ ] Socket.IO connection should include token in auth object

### 8. 401 Handling
- [ ] Simulate expired token (manually edit localStorage)
- [ ] Try to create/join party
- [ ] Should get 401 response
- [ ] Should auto-logout and show login modal
- [ ] Toast shows "Session expired"

### 9. Persistence
- [ ] Login successfully
- [ ] Refresh page
- [ ] Should remain logged in
- [ ] Lobby should load without showing auth modal

### 10. Party Creation with Auth
- [ ] Login successfully
- [ ] Create a party
- [ ] Should use JWT token in request
- [ ] Party should be created with authenticated user ID

## Browser Console Commands

```javascript
// Check if authenticated
authManager.isAuthenticated()

// Get current user
authManager.getUser()

// Get access token
authManager.getAccessToken()

// View token expiry
authManager.getTokenExpiry(authManager.getAccessToken())

// Manually trigger logout
handleLogout()

// Check localStorage
localStorage.getItem('arcane_access_token')
localStorage.getItem('arcane_refresh_token')
localStorage.getItem('arcane_user_data')
```

## Expected Network Requests

### On Register
```
POST /api/auth/register
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}

Response:
{
  "success": true,
  "user": { "id": "...", "username": "testuser", "email": "..." },
  "accessToken": "eyJ...",
  "refreshToken": "eyJ..."
}
```

### On Login
```
POST /api/auth/login
{
  "username": "testuser",
  "password": "password123"
}

Response: (same as register)
```

### On Token Refresh
```
POST /api/auth/refresh
{
  "refreshToken": "eyJ..."
}

Response:
{
  "success": true,
  "accessToken": "eyJ..."
}
```

### On Party Create (with JWT)
```
POST /api/multiplayer/party/create
Headers:
  Authorization: Bearer eyJ...

Body:
{
  "hostId": "...",
  "partyName": "Test Party",
  "maxPlayers": 4,
  "isPublic": true
}
```

## Common Issues

### Issue: Auth modal doesn't appear
- Check if authManager is loaded (auth.js included before lobby.js)
- Check browser console for errors
- Verify UI elements exist (authModal, forms)

### Issue: Token not refreshing
- Check token expiry time in console
- Verify refresh token is valid
- Check for errors in browser console

### Issue: 401 on API calls
- Verify token is being sent in Authorization header
- Check if token is expired
- Verify backend is accepting JWT tokens

### Issue: Can't login after logout
- Clear localStorage completely
- Refresh page
- Try registering new account

## DevTools Tips

1. **Network Tab**: Monitor all API requests and headers
2. **Console Tab**: Check for auth-related logs
3. **Application Tab → Local Storage**: View stored tokens
4. **Console**: Use the commands above to debug auth state
