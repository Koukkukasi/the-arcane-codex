# The Arcane Codex - TypeScript Server

A complete TypeScript/Express migration of The Arcane Codex game server from Python Flask.

## Features

- **Express Server**: Modern Node.js web framework
- **TypeScript**: Full type safety and IntelliSense support
- **Real-time WebSockets**: Socket.IO for multiplayer interactions
- **Session Management**: Express-session for player state
- **Rate Limiting**: Protection against API abuse (500 req/hour in dev)
- **MCP Integration**: Ready for Claude AI integration (optional)
- **Mock Data**: 30 interrogation questions included for offline play

## Project Structure

```
arcane_codex_ts/
├── src/
│   ├── server.ts         # Main Express server
│   ├── routes/
│   │   └── api.ts        # All API endpoints
│   ├── services/
│   │   ├── game.ts       # Game logic and session management
│   │   └── mcp.ts        # MCP/Claude AI integration
│   ├── types/
│   │   └── game.ts       # TypeScript interfaces
│   └── data/
│       └── questions.ts  # 30 mock interrogation questions
├── tsconfig.json         # TypeScript configuration
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## Installation

1. Navigate to the project directory:
```bash
cd C:\Users\ilmiv\ProjectArgent\arcane_codex_ts
```

2. Install dependencies (already done):
```bash
npm install
```

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

## Server Details

- **Port**: 5001 (configurable via PORT environment variable)
- **Static Files**: Serves from `../complete_game/static`
- **API Base**: `http://localhost:5001/api`
- **Health Check**: `http://localhost:5001/health`

## API Endpoints

### Authentication
- `GET /api/csrf-token` - Get CSRF token
- `POST /api/set_username` - Set player username
- `GET /api/get_username` - Get current username

### Game Management
- `POST /api/create_game` - Create new game session
- `POST /api/join_game` - Join existing game
- `GET /api/session_info` - Get current session info
- `GET /api/game_state` - Get full game state

### Divine Interrogation
- `POST /api/start_interrogation` - Begin interrogation
- `POST /api/answer_question` - Submit answer

### Character
- `POST /api/set_character_class` - Select character class
- `GET /api/character/divine_favor` - Get god favor scores

### Scenarios
- `POST /api/generate_scenario` - Generate new scenario (MCP/Mock)
- `GET /api/current_scenario` - Get active scenario

### Utility
- `POST /api/log_client_error` - Log client-side errors
- `GET /api/health` - Server health check

## WebSocket Events

### Client -> Server
- `join_game` - Join a game room
- `leave_game` - Leave a game room
- `game_update` - Send game updates

### Server -> Client
- `player_joined` - Player joined notification
- `player_left` - Player left notification
- `game_state_changed` - Game state update
- `interrogation_complete` - Player finished interrogation
- `new_scenario` - New scenario generated

## Environment Variables (Optional)

```env
PORT=5001                          # Server port
ANTHROPIC_API_KEY=your-key-here   # For Claude AI integration
NODE_ENV=development               # Environment mode
```

## MCP Integration

The server includes MCP (Model Context Protocol) support for Claude AI:

1. If `ANTHROPIC_API_KEY` is provided, AI-generated content will be used
2. Without an API key, the server falls back to mock questions and scenarios
3. The MCP service includes retry logic with exponential backoff

## Rate Limiting

- Development: 500 requests per hour per IP
- Applied to all `/api/` endpoints
- Configurable in `server.ts`

## Session Configuration

- Session timeout: 4 hours
- Stores: player ID, username, game code, interrogation progress
- Cookie-based with httpOnly flag

## Testing the Server

1. Start the server:
```bash
npm run dev
```

2. Check health endpoint:
```bash
curl http://localhost:5001/health
```

3. Test with the existing frontend:
   - The TypeScript server serves the same static files
   - Compatible with the existing Python game frontend
   - Access at: `http://localhost:5001`

## Migrated Features

✅ All core API endpoints from Python version
✅ Session management
✅ Game creation and joining
✅ Divine Interrogation system
✅ 30 mock questions
✅ Socket.IO real-time events
✅ Rate limiting
✅ CSRF protection
✅ Error logging

## Running Alongside Python Server

The TypeScript server runs on port 5001 by default, allowing you to run it alongside the Python server (port 5000) for comparison and testing.

## Next Steps

1. Start the server: `npm run dev`
2. Access the game at: `http://localhost:5001`
3. The frontend will automatically work with the new TypeScript backend
4. Monitor console for server logs and debugging

## Troubleshooting

### Port Already in Use
Change the port in the environment or directly in server.ts

### Module Not Found Errors
Run `npm install` to ensure all dependencies are installed

### TypeScript Errors
Run `npm run build` to check for compilation errors

### Static Files Not Found
Ensure the Python project exists at `../complete_game/static`

## License

Same as The Arcane Codex Python version