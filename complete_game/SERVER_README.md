# The Arcane Codex - Backend API Server

## Overview

This is the Node.js/Express backend API server for The Arcane Codex game. It provides RESTful API endpoints for the frontend game client.

## Features

- **CSRF Protection**: Token-based CSRF protection for secure form submissions
- **Game State Management**: In-memory game state storage (ready for database integration)
- **Scenario Management**: Load and manage quest scenarios with narrative and choices
- **Character Management**: Handle character stats, divine favor, and progression
- **Inventory System**: Manage player inventory and equipment
- **Quest System**: Track active and completed quests
- **Party Management**: Handle NPC companions and party dynamics
- **Static File Serving**: Serve the frontend HTML/CSS/JS files
- **Error Handling**: Comprehensive error handling and logging
- **CORS Support**: Configurable CORS for local development and production

## Prerequisites

- **Node.js**: Version 14.0.0 or higher
- **npm**: Comes with Node.js

## Installation

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `express` - Web framework
- `cors` - CORS middleware
- `dotenv` - Environment variable management
- `helmet` - Security headers
- `morgan` - HTTP request logger
- `nodemon` - Auto-restart during development (dev dependency)

### 2. Configure Environment Variables

Copy the example environment file:

```bash
# On Windows
copy .env.node.example .env

# On Linux/Mac
cp .env.node.example .env
```

Edit `.env` with your settings:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

## Running the Server

### Development Mode (with auto-restart)

```bash
npm run dev
```

This uses `nodemon` which automatically restarts the server when you make code changes.

### Production Mode

```bash
npm start
```

This runs the server using `node server.js`.

## API Endpoints

### Security

- **POST /api/csrf-token** - Get CSRF token for secure requests
- **GET /api/csrf-token** - Alternative GET endpoint for CSRF token

### Game State

- **GET /api/game_state** - Load complete game state (player, party, inventory, quests)
- **GET /api/current_scenario** - Load current quest/scenario with narrative and choices
- **POST /api/make_choice** - Submit player's choice for current scenario

### Character

- **GET /api/character/stats** - Get character statistics (HP, mana, skills, etc.)
- **GET /api/character/divine_favor** - Get divine favor values for all gods

### Inventory

- **GET /api/inventory/all** - Get all inventory items

### Quests

- **GET /api/quests/active** - Get active quests
- **GET /api/quests/completed** - Get completed quests

### Party

- **GET /api/party** - Get party information (NPCs and companions)

### Utility

- **GET /health** - Health check endpoint (returns server status)

### Frontend

- **GET /** - Serves the main game UI (arcane_codex_scenario_ui_enhanced.html)

## Example API Requests

### Get CSRF Token

```javascript
const response = await fetch('http://localhost:3000/api/csrf-token');
const data = await response.json();
console.log(data.csrf_token);
```

### Load Game State

```javascript
const response = await fetch('http://localhost:3000/api/game_state');
const data = await response.json();
console.log(data.game_state);
```

### Make a Choice

```javascript
const response = await fetch('http://localhost:3000/api/make_choice', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({
    choice_id: 'pick_lock',
    player_id: 'player_001'
  })
});
const result = await response.json();
console.log(result);
```

## Project Structure

```
complete_game/
├── server.js                 # Main Express server
├── package.json              # Node.js dependencies
├── .env                      # Environment variables (gitignored)
├── .env.node.example         # Example environment file
├── static/                   # Frontend files
│   ├── arcane_codex_scenario_ui_enhanced.html
│   └── ...other static files
└── SERVER_README.md          # This file
```

## Mock Data

The server currently uses in-memory mock data generators for:

- **Game Scenarios**: Rich narrative scenarios with choices and consequences
- **Game State**: Player stats, party members, inventory, quests
- **Character Data**: Stats, skills, divine favor
- **Inventory**: Items, equipment, consumables
- **Quests**: Active and completed quests

This mock data allows frontend development to proceed while the backend is being built.

## Next Steps for Production

### 1. Database Integration

Replace in-memory storage with a database:

```javascript
// Example: SQLite
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./arcane_codex.db');

// Example: PostgreSQL
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

### 2. Session Management

Add proper session management:

```javascript
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
```

### 3. Enhanced CSRF Protection

Use `csurf` middleware for production:

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

### 4. Rate Limiting

Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### 5. Authentication

Add user authentication (JWT, OAuth, etc.):

```javascript
const jwt = require('jsonwebtoken');
// Implement authentication middleware
```

### 6. WebSocket Support

For real-time multiplayer:

```javascript
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Handle real-time events
});
```

## Testing

### Manual Testing

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Check API endpoints: `http://localhost:3000/health`

### Using curl

```bash
# Health check
curl http://localhost:3000/health

# Get CSRF token
curl http://localhost:3000/api/csrf-token

# Get game state
curl http://localhost:3000/api/game_state

# Get current scenario
curl http://localhost:3000/api/current_scenario
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

1. Change PORT in `.env` file
2. Or find and kill the process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill
```

### Module Not Found

If you see "Cannot find module" errors:

```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### CORS Errors

If you see CORS errors in browser console:

1. Check CORS_ORIGIN in `.env` matches your frontend URL
2. Or set CORS_ORIGIN=* for development

## Performance Considerations

- **In-Memory Storage**: Current implementation uses in-memory storage. For production, migrate to a database.
- **CSRF Tokens**: Currently stored in a Set. For production, use Redis or session storage.
- **Concurrency**: Node.js is single-threaded. For high load, use PM2 or clustering.

## Security Checklist for Production

- [ ] Use HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Use secure SESSION_SECRET
- [ ] Enable rate limiting
- [ ] Implement proper CSRF protection with csurf
- [ ] Add helmet for security headers
- [ ] Validate and sanitize all input
- [ ] Use environment variables for secrets
- [ ] Enable logging and monitoring
- [ ] Set specific CORS_ORIGIN (not *)

## Support

For issues or questions, check:
- Server logs in the console
- Browser console for frontend errors
- `/health` endpoint for server status

## License

ISC
