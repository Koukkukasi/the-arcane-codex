# Authentication API Quick Reference

Quick reference guide for the authentication endpoints.

## Base URL
```
http://localhost:5000/api/auth
```

## Endpoints Summary

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | /register | No | Register new user |
| POST | /login | No | Login user |
| POST | /logout | No | Logout and revoke token |
| POST | /refresh | No | Refresh access token |
| GET | /me | Yes | Get current user info |

## 1. Register User

```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123",
  "email": "john@example.com"  # optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

## 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepass123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

## 3. Get Current User

```bash
GET /api/auth/me
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "preferred_role": "player",
    "total_sessions": 5,
    "victories": 3,
    "defeats": 2
  }
}
```

## 4. Refresh Access Token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGc..."
}
```

## 5. Logout

```bash
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."  # optional but recommended
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123",
    "email": "john@example.com"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "password": "securepass123"
  }'
```

### Get User Info
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Common HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created (registration) |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (invalid credentials or token) |
| 404 | Not Found (user doesn't exist) |
| 409 | Conflict (username already exists) |
| 500 | Internal Server Error |

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

## Token Lifetimes

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days

## Best Practices

1. **Store tokens securely**: Use httpOnly cookies or secure storage
2. **Refresh before expiry**: Refresh access token before it expires
3. **Always logout**: Revoke refresh tokens when logging out
4. **Handle 401 errors**: Redirect to login when receiving 401
5. **Use HTTPS**: Always use HTTPS in production

## Frontend Integration Pattern

```javascript
// Store tokens after login/register
const { accessToken, refreshToken } = await loginOrRegister();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// Axios interceptor for automatic token refresh
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        localStorage.setItem('accessToken', data.accessToken);
        error.config.headers.Authorization = `Bearer ${data.accessToken}`;
        return axios.request(error.config);
      } catch {
        // Refresh failed, redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Add token to requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```
