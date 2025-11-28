# Multiplayer Lobby

This is the multiplayer lobby interface for The Arcane Codex. It allows players to create or join parties and start multiplayer game sessions.

## Features

### Party Management
- **Create Party**: Host can create a new party with custom name, max players (2-6), and public/private settings
- **Join Party**: Players can join existing parties using a 6-digit party code
- **Browse Public Parties**: View and join publicly available parties
- **Party Code**: Unique 6-character code for each party (excludes ambiguous characters like I, O, 0, 1)

### Real-time Communication
- **Socket.IO Integration**: Real-time updates for all party activities
- **Player Status**: See when players join, leave, disconnect, or reconnect
- **Ready Status**: Players can mark themselves ready; host can start when all are ready
- **Chat System**: In-lobby chat for party members

### Player Features
- **Persistent Identity**: Player ID and name stored in localStorage
- **Role Selection**: Choose character role before game starts (Warrior, Mage, Rogue, Healer)
- **Ready Toggle**: Mark ready status to signal you're prepared to start
- **Automatic Reconnection**: Rejoin parties automatically after disconnect

### Host Features
- **Start Game**: Begin the game when all players are ready
- **Party Settings**: Control max players and public visibility
- **Host Transfer**: If host leaves, automatically transfers to next player

## Architecture

### Client-Side (`lobby.js`)
- **State Management**: Central `LobbyState` object manages all client state
- **Socket.IO Events**: Handles real-time communication with server
- **UI Updates**: Reactive UI updates based on state changes
- **Error Handling**: User-friendly toast notifications for errors

### Server-Side
- **API Endpoints** (`/api/multiplayer/*`):
  - `POST /party/create` - Create new party
  - `POST /party/join` - Join existing party
  - `GET /parties/public` - List public parties
  - `POST /party/:code/start` - Start game (host only)
  - `POST /party/:code/ready` - Set ready status

- **Socket.IO Events**:
  - `join_room` - Join party room
  - `leave_room` - Leave party room
  - `chat_message` - Send chat message
  - `ready_status` - Update ready status
  - `player_joined` - Broadcast when player joins
  - `player_left` - Broadcast when player leaves
  - `player_ready_changed` - Broadcast ready status change
  - `game_started` - Notify all players game is starting

### Data Flow

1. **Party Creation**:
   ```
   Client → POST /api/multiplayer/party/create
   → PartyManager.createParty()
   → Socket join_room event
   → Update UI
   ```

2. **Party Join**:
   ```
   Client → POST /api/multiplayer/party/join
   → PartyManager.joinParty()
   → Socket join_room event
   → Broadcast player_joined to room
   → Update all clients
   ```

3. **Game Start**:
   ```
   Host clicks Ready/Start
   → POST /api/multiplayer/party/:code/start
   → MultiplayerService.startGame()
   → Create game session
   → Broadcast game_started
   → All clients redirect to game
   ```

## Socket Authentication

The lobby uses Socket.IO authentication middleware that supports:
- **JWT tokens** (production)
- **Session tokens** (development fallback)
- **Player ID only** (development mode)

Authentication is handled automatically via the `auth` object in Socket.IO connection options.

## Local Storage

The lobby stores the following in localStorage:
- `arcane_player_id`: Unique player identifier
- `arcane_player_name`: Player display name

This ensures consistent identity across sessions.

## UI Components

### Connection Status
Visual indicator showing server connection state:
- Green: Connected
- Yellow (pulsing): Connecting
- Red: Disconnected

### Player List
Shows all party members with:
- Player name
- Host badge
- "You" indicator
- Ready status (✓ or ○)
- Online/offline status

### Role Selector
Grid of role cards (Warrior, Mage, Rogue, Healer) that players can select before starting.

### Chat
Real-time chat with system messages for:
- Player joins/leaves
- Ready status changes
- Connection events

### Toast Notifications
Non-intrusive notifications for:
- Success messages (green border)
- Error messages (red border)
- Info messages (purple border)

## Theming

The lobby uses the Arcane Codex theme:
- **Colors**: Dark background with purple/gold accents and CRT green
- **Fonts**:
  - Cinzel Decorative for titles
  - Cinzel for headings
  - JetBrains Mono for code/status
  - Inter for body text
- **Effects**:
  - Floating particle effects
  - CRT scanline overlay
  - Glowing text shadows

## Development

To test the lobby:

1. Start the server:
   ```bash
   npm run dev
   ```

2. Open lobby in browser:
   ```
   http://localhost:5000/lobby/
   ```

3. Open multiple tabs to test multiplayer

## Production Considerations

- Socket.IO authentication requires JWT tokens in production
- Player IDs should be mapped to authenticated user accounts
- Chat messages should be validated and sanitized
- Rate limiting is enforced on Socket.IO events
- Parties are auto-cleaned after 2 hours of inactivity

## Browser Support

Tested on modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Requires:
- JavaScript enabled
- localStorage support
- WebSocket support
