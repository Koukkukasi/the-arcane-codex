# Authentication Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Application                       │
│  (Browser, Mobile App, or any HTTP client)                      │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    Express Server (server.ts)                    │
│  • CORS Configuration                                            │
│  • Rate Limiting (500 req/hour)                                  │
│  • Session Management                                            │
│  • Static File Serving                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Routes to /api
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                    API Router (routes/api.ts)                    │
│                                                                   │
│  router.use('/auth', authRoutes)  ← JWT endpoints               │
│  router.use('/', authRoutes)      ← Legacy endpoints            │
│  router.use('/', gameRoutes)                                     │
│  router.use('/character', characterRoutes)                       │
│  router.use('/battle', battleRoutes)                             │
│  router.use('/ai_gm', aigmRoutes)                                │
│  router.use('/multiplayer', multiplayerRoutes)                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Routes to /api/auth
                         │
┌────────────────────────▼────────────────────────────────────────┐
│               Auth Routes (routes/auth.routes.ts)                │
│                                                                   │
│  JWT Endpoints:                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ POST   /register  → Register new user                    │  │
│  │ POST   /login     → Login user                           │  │
│  │ POST   /logout    → Logout and revoke token              │  │
│  │ POST   /refresh   → Refresh access token                 │  │
│  │ GET    /me        → Get current user (requireJWT)        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Middleware:                                                     │
│  • requireJWT       → Enforce authentication                     │
│  • optionalJWT      → Optional authentication                    │
│  • ensurePlayerId   → Legacy session support                     │
│  • requireAuth      → Legacy session auth                        │
└────────────┬─────────────────────┬──────────────────────────────┘
             │                     │
             │                     │
    ┌────────▼─────────┐  ┌───────▼──────────┐
    │   JWTService     │  │ PlayerRepository │
    │  (jwt.service)   │  │ (player.repo)    │
    └────────┬─────────┘  └───────┬──────────┘
             │                     │
             │                     │
    ┌────────▼──────────┐ ┌───────▼──────────┐
    │ RefreshToken      │ │  SQLite Database │
    │ Repository        │ │                  │
    │ (token tracking)  │ │ • players table  │
    └────────┬──────────┘ │ • refresh_tokens │
             │             └──────────────────┘
             │
             └──────────────┐
                            │
                   ┌────────▼─────────┐
                   │  SQLite Database │
                   │                  │
                   │ • refresh_tokens │
                   └──────────────────┘
```

## Request Flow Diagrams

### 1. User Registration Flow

```
Client                     Auth Routes              PlayerRepository         JWTService
  │                             │                           │                    │
  ├──POST /api/auth/register──→│                           │                    │
  │  {username, password}       │                           │                    │
  │                             ├─Validate input            │                    │
  │                             │                           │                    │
  │                             ├─Check username exists────→│                    │
  │                             │←─User not found───────────┤                    │
  │                             │                           │                    │
  │                             ├─Hash password (bcrypt)    │                    │
  │                             │                           │                    │
  │                             ├─Create player────────────→│                    │
  │                             │←─Player created───────────┤                    │
  │                             │                           │                    │
  │                             ├─Generate tokens──────────────────────────────→│
  │                             │                           │  ┌─Create access   │
  │                             │                           │  ├─Create refresh  │
  │                             │                           │  └─Store in DB     │
  │                             │←─Token pair────────────────────────────────────┤
  │                             │                           │                    │
  │←─201 Created (tokens)───────┤                           │                    │
  │  {user, accessToken,        │                           │                    │
  │   refreshToken}             │                           │                    │
```

### 2. User Login Flow

```
Client                     Auth Routes              PlayerRepository         JWTService
  │                             │                           │                    │
  ├──POST /api/auth/login─────→│                           │                    │
  │  {username, password}       │                           │                    │
  │                             ├─Validate input            │                    │
  │                             │                           │                    │
  │                             ├─Get user by username─────→│                    │
  │                             │←─User data────────────────┤                    │
  │                             │                           │                    │
  │                             ├─Get password hash────────→│                    │
  │                             │←─Hash──────────────────────┤                    │
  │                             │                           │                    │
  │                             ├─Verify password (bcrypt)  │                    │
  │                             │                           │                    │
  │                             ├─Update last seen─────────→│                    │
  │                             │                           │                    │
  │                             ├─Generate tokens──────────────────────────────→│
  │                             │←─Token pair────────────────────────────────────┤
  │                             │                           │                    │
  │←─200 OK (tokens)────────────┤                           │                    │
  │  {user, accessToken,        │                           │                    │
  │   refreshToken}             │                           │                    │
```

### 3. Protected Endpoint Access

```
Client                     requireJWT Middleware     JWTService          Auth Routes
  │                                  │                    │                    │
  ├──GET /api/auth/me──────────────→│                    │                    │
  │  Authorization: Bearer <token>  │                    │                    │
  │                                  ├─Extract token      │                    │
  │                                  │                    │                    │
  │                                  ├─Verify token──────→│                    │
  │                                  │  • Check signature │                    │
  │                                  │  • Check expiry    │                    │
  │                                  │  • Validate claims │                    │
  │                                  │←─Decoded payload───┤                    │
  │                                  │                    │                    │
  │                                  ├─Set req.user       │                    │
  │                                  ├─Call next()───────────────────────────→│
  │                                  │                    │                    │
  │                                  │                    │  ┌─Get user info   │
  │                                  │                    │  └─Return data     │
  │←─200 OK (user data)──────────────┴────────────────────┴────────────────────┤
```

### 4. Token Refresh Flow

```
Client                     Auth Routes         JWTService           RefreshTokenRepo
  │                             │                    │                      │
  ├──POST /api/auth/refresh───→│                    │                      │
  │  {refreshToken}             │                    │                      │
  │                             ├─Validate input     │                      │
  │                             │                    │                      │
  │                             ├─Verify and check──→│                      │
  │                             │                    ├─Verify signature     │
  │                             │                    ├─Check expiry         │
  │                             │                    │                      │
  │                             │                    ├─Check revocation────→│
  │                             │                    │  (hash token & query)│
  │                             │                    │←─Not revoked─────────┤
  │                             │                    │                      │
  │                             │                    ├─Generate new access  │
  │                             │←─New access token──┤                      │
  │                             │                    │                      │
  │←─200 OK (new token)─────────┤                    │                      │
  │  {accessToken}              │                    │                      │
```

### 5. Logout Flow

```
Client                     Auth Routes         JWTService           RefreshTokenRepo
  │                             │                    │                      │
  ├──POST /api/auth/logout────→│                    │                      │
  │  {refreshToken}             │                    │                      │
  │                             ├─Revoke token──────→│                      │
  │                             │                    ├─Hash token           │
  │                             │                    │                      │
  │                             │                    ├─Mark as revoked─────→│
  │                             │                    │  UPDATE SET revoked=1│
  │                             │                    │←─Success─────────────┤
  │                             │←─Revoked───────────┤                      │
  │                             │                    │                      │
  │                             ├─Clear session      │                      │
  │                             │                    │                      │
  │←─200 OK─────────────────────┤                    │                      │
  │  {success: true}            │                    │                      │
```

## Database Schema

### players Table
```sql
┌─────────────────────────────────────────────────────────────┐
│                         PLAYERS                             │
├─────────────────────┬────────────────┬──────────────────────┤
│ Column              │ Type           │ Description          │
├─────────────────────┼────────────────┼──────────────────────┤
│ id                  │ UUID PK        │ Internal ID          │
│ player_id           │ TEXT UNIQUE    │ External ID          │
│ username            │ TEXT UNIQUE    │ Username             │
│ email               │ TEXT           │ Email (optional)     │
│ password_hash       │ TEXT           │ bcrypt hash          │
│ preferred_role      │ TEXT           │ Game role            │
│ avatar_url          │ TEXT           │ Avatar URL           │
│ theme               │ TEXT           │ UI theme             │
│ total_sessions      │ INTEGER        │ Session count        │
│ total_playtime_min  │ INTEGER        │ Playtime minutes     │
│ victories           │ INTEGER        │ Win count            │
│ defeats             │ INTEGER        │ Loss count           │
│ created_at          │ TIMESTAMP      │ Creation time        │
│ updated_at          │ TIMESTAMP      │ Last update          │
│ last_seen           │ TIMESTAMP      │ Last activity        │
└─────────────────────┴────────────────┴──────────────────────┘
```

### refresh_tokens Table
```sql
┌─────────────────────────────────────────────────────────────┐
│                     REFRESH_TOKENS                          │
├─────────────────────┬────────────────┬──────────────────────┤
│ Column              │ Type           │ Description          │
├─────────────────────┼────────────────┼──────────────────────┤
│ id                  │ UUID PK        │ Token ID             │
│ user_id             │ TEXT           │ User reference       │
│ token_hash          │ TEXT           │ SHA-256 hash         │
│ expires_at          │ TIMESTAMP      │ Expiration time      │
│ revoked             │ BOOLEAN        │ Revocation flag      │
│ created_at          │ TIMESTAMP      │ Creation time        │
│ revoked_at          │ TIMESTAMP      │ Revocation time      │
└─────────────────────┴────────────────┴──────────────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Security Layers                          │
└─────────────────────────────────────────────────────────────┘

Layer 1: Network Security
┌─────────────────────────────────────────────────────────────┐
│ • CORS Configuration (allowed origins)                       │
│ • Rate Limiting (500 requests/hour)                          │
│ • HTTPS in Production                                        │
└─────────────────────────────────────────────────────────────┘

Layer 2: Input Validation
┌─────────────────────────────────────────────────────────────┐
│ • Username length (2-20 chars)                               │
│ • Password strength (min 6 chars)                            │
│ • Email format validation                                    │
│ • Request body sanitization                                  │
└─────────────────────────────────────────────────────────────┘

Layer 3: Password Security
┌─────────────────────────────────────────────────────────────┐
│ • bcrypt hashing (12 salt rounds)                            │
│ • No plain text storage                                      │
│ • Secure comparison (bcrypt.compare)                         │
└─────────────────────────────────────────────────────────────┘

Layer 4: Token Security
┌─────────────────────────────────────────────────────────────┐
│ • JWT with HMAC-SHA256 signature                             │
│ • Short-lived access tokens (15 min)                         │
│ • Longer-lived refresh tokens (7 days)                       │
│ • Token revocation tracking                                  │
│ • Secure token storage (hashed)                              │
└─────────────────────────────────────────────────────────────┘

Layer 5: Error Handling
┌─────────────────────────────────────────────────────────────┐
│ • Generic error messages                                     │
│ • No user enumeration                                        │
│ • Comprehensive logging                                      │
│ • Graceful failure handling                                  │
└─────────────────────────────────────────────────────────────┘
```

## Token Lifecycle

```
Registration/Login
       │
       ▼
┌──────────────┐
│  Generate    │
│  Token Pair  │
└──────┬───────┘
       │
       ├─────────────────────────────┐
       │                             │
       ▼                             ▼
┌──────────────┐              ┌─────────────┐
│ Access Token │              │   Refresh   │
│  (15 min)    │              │   Token     │
│              │              │  (7 days)   │
└──────┬───────┘              └──────┬──────┘
       │                             │
       │                             │
       │                       ┌─────▼──────┐
       │                       │  Store in  │
       │                       │  Database  │
       │                       └─────┬──────┘
       │                             │
       ▼                             │
┌──────────────┐                     │
│   Use for    │                     │
│  API Calls   │                     │
└──────┬───────┘                     │
       │                             │
       │ (expires after 15 min)      │
       │                             │
       ▼                             │
┌──────────────┐              ┌──────▼──────┐
│   Token      │              │  Use for    │
│   Expired    │              │  Refresh    │
└──────┬───────┘              └──────┬──────┘
       │                             │
       │                             │
       │        ┌────────────────────┘
       │        │
       ▼        ▼
┌─────────────────┐
│  Refresh Flow   │
│  (check valid   │
│   & not revoked)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  New Access     │
│  Token          │
│  (15 min)       │
└─────────────────┘
```

## Component Dependencies

```
server.ts
    │
    ├─→ routes/api.ts
    │       │
    │       └─→ routes/auth.routes.ts
    │               │
    │               ├─→ services/auth/jwt.service.ts
    │               │       │
    │               │       └─→ database/repositories/RefreshTokenRepository.ts
    │               │               │
    │               │               └─→ database/connection.ts
    │               │
    │               └─→ database/repositories/player.repository.ts
    │                       │
    │                       └─→ database/connection.ts
    │
    └─→ middleware/socketAuth.ts (uses JWTService)
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                    Technology Stack                          │
├─────────────────────────────────────────────────────────────┤
│ Runtime:      Node.js + TypeScript                          │
│ Framework:    Express 5                                      │
│ Database:     SQLite (better-sqlite3)                        │
│ Auth:         JWT (jsonwebtoken)                             │
│ Hashing:      bcrypt                                         │
│ Validation:   Custom + Zod                                   │
│ Testing:      Playwright                                     │
│ Logging:      Pino                                           │
│ Security:     CORS, Rate Limiting, Helmet                    │
└─────────────────────────────────────────────────────────────┘
```
