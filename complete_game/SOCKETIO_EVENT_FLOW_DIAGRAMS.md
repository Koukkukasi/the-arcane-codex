# SocketIO Event Flow Diagrams

Visual diagrams for understanding real-time event flows in The Arcane Codex.

---

## 1. Player Joins Game Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Player A  │         │   Server    │         │   Player B  │
│  (Browser)  │         │   (Flask)   │         │  (Browser)  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  1. HTTP POST         │                       │
       │  /api/join_game       │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  2. HTTP 200 OK       │                       │
       │  {game_code, ...}     │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  3. SocketIO emit     │                       │
       │  'join_game_room'     │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  4. Join room         │
       │                       │  Update presence      │
       │                       │                       │
       │  5. 'player_joined'   │                       │
       │  (confirmation)       │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │                       │  6. Broadcast         │
       │                       │  'player_joined'      │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │  7. 'presence_update' │
       │                       ├──────────────────────>│
       │                       │                       │
       │  8. 'presence_update' │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       ▼                       ▼                       ▼
```

**Key Points**:
- HTTP used for data persistence (save player to game session)
- SocketIO used for real-time notifications
- All players in room notified instantly
- Presence list updated for everyone

---

## 2. Player Makes Choice Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Player A  │         │   Server    │         │   Player B  │         │   Player C  │
│  (Browser)  │         │   (Flask)   │         │  (Browser)  │         │  (Browser)  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │                       │
       │  1. Click choice btn  │                       │                       │
       │                       │                       │                       │
       │  2. HTTP POST         │                       │                       │
       │  /api/make_choice     │                       │                       │
       ├──────────────────────>│                       │                       │
       │                       │                       │                       │
       │                       │  3. Save choice to    │                       │
       │                       │  game_session         │                       │
       │                       │  .current_scenario    │                       │
       │                       │                       │                       │
       │  4. HTTP 200 OK       │                       │                       │
       │  {all_submitted:false}│                       │                       │
       │<──────────────────────┤                       │                       │
       │                       │                       │                       │
       │  5. SocketIO emit     │                       │                       │
       │  'choice_submitted'   │                       │                       │
       ├──────────────────────>│                       │                       │
       │                       │                       │                       │
       │                       │  6. Broadcast to room │                       │
       │                       │  'player_chose'       │                       │
       │                       │  {choices: 1/3}       │                       │
       │                       ├──────────────────────>│                       │
       │                       ├───────────────────────┼──────────────────────>│
       │                       │                       │                       │
       │                       │                       │  7. Update UI         │
       │                       │                       │  - Progress bar: 33%  │
       │                       │                       │  - Show "Alice chose" │
       │                       │                       │                       │
       │                       │                       │                       │
       │  (Later: Player B submits choice)             │                       │
       │                       │                       │                       │
       │                       │  'player_chose'       │                       │
       │<──────────────────────┤  {choices: 2/3}       │                       │
       │                       │                       │                       │
       │                       │                       │                       │
       │  (Later: Player C submits choice)             │                       │
       │                       │                       │                       │
       │                       │  'player_chose'       │                       │
       │<──────────────────────┤  {choices: 3/3,       │                       │
       │                       │   all_submitted:true} │                       │
       │                       │                       │                       │
       │  8. Enable            │                       │                       │
       │  "Resolve Turn" btn   │                       │                       │
       │                       │                       │                       │
       ▼                       ▼                       ▼                       ▼
```

**Key Points**:
- Choice saved to server immediately (HTTP)
- Room notified in real-time (SocketIO)
- Progress bar updates dynamically
- All players see when everyone has chosen

---

## 3. Disconnect and Reconnect Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Player A  │         │   Server    │         │   Player B  │
│  (Browser)  │         │   (Flask)   │         │  (Browser)  │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  CONNECTED            │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  Room: ABC123         │
       │                       │  Presence: [A, B]     │
       │                       │                       │
       │  ❌ NETWORK LOSS      │                       │
       │  (tab closed, etc)    │                       │
       │                       │                       │
       │                       │  1. Detect disconnect │
       │                       │  Remove from presence │
       │                       │  Presence: [B]        │
       │                       │                       │
       │                       │  2. Broadcast         │
       │                       │  'player_disconnected'│
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │                       │  3. Update UI
       │                       │                       │  - Gray dot for A
       │                       │                       │  - "1/2 online"
       │                       │                       │
       │  (30 seconds later)   │                       │
       │                       │                       │
       │  ✅ NETWORK RESTORED  │                       │
       │                       │                       │
       │  4. Auto reconnect    │                       │
       │  (exponential backoff)│                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │  5. SocketIO emit     │                       │
       │  'reconnect'          │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  6. Gather state      │
       │                       │  - Current scenario   │
       │                       │  - Players list       │
       │                       │  - Choices submitted  │
       │                       │                       │
       │  7. 'reconnect_sync'  │                       │
       │  {full game state}    │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  8. Update UI         │                       │
       │  - Sync to server     │                       │
       │  - Hide overlay       │                       │
       │                       │                       │
       │                       │  9. Update presence   │
       │                       │  Presence: [A, B]     │
       │                       │                       │
       │                       │  10. Broadcast        │
       │                       │  'player_reconnected' │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │                       │  11. Update UI
       │                       │                       │  - Green dot for A
       │                       │                       │  - "2/2 online"
       │                       │                       │  - Toast: "Alice
       │                       │                       │    reconnected"
       │                       │                       │
       ▼                       ▼                       ▼
```

**Key Points**:
- Disconnect detected automatically by server
- Other players notified immediately
- Reconnect happens automatically with exponential backoff
- Full state sync ensures consistency
- Presence indicators update in real-time

---

## 4. Scenario Generation and Broadcasting

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Player A  │         │   Server    │         │   Player B  │         │   Player C  │
│   (Host)    │         │   (Flask)   │         │             │         │             │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │                       │
       │  1. Click "Next Turn" │                       │                       │
       │                       │                       │                       │
       │  2. HTTP POST         │                       │                       │
       │  /api/generate_scenario                       │                       │
       ├──────────────────────>│                       │                       │
       │                       │                       │                       │
       │                       │  3. Call MCP          │                       │
       │                       │  Generate scenario    │                       │
       │                       │  (AI-powered)         │                       │
       │                       │                       │                       │
       │                       │  4. Create Scenario   │                       │
       │                       │  - public_scene       │                       │
       │                       │  - whispers (A,B,C)   │                       │
       │                       │  - theme              │                       │
       │                       │                       │                       │
       │  5. HTTP 200 OK       │                       │                       │
       │  {scenario_id, theme} │                       │                       │
       │<──────────────────────┤                       │                       │
       │                       │                       │                       │
       │  6. SocketIO emit     │                       │                       │
       │  'scenario_generated' │                       │                       │
       ├──────────────────────>│                       │                       │
       │                       │                       │                       │
       │                       │  7. Broadcast to room │                       │
       │                       │  'new_scenario'       │                       │
       │                       ├──────────────────────>│                       │
       │                       ├───────────────────────┼──────────────────────>│
       │                       │                       │                       │
       │                       │                       │  8. Show notification │
       │                       │                       │  "A new challenge     │
       │                       │                       │   awaits..."          │
       │                       │                       │                       │
       │                       │                       │  9. Fetch scenario    │
       │                       │                       │  GET /api/current_    │
       │                       │                       │  scenario             │
       │                       │                       ├──────────────────────>│
       │                       │                       │                       │
       │                       │                       │  10. Fetch whisper    │
       │                       │                       │  GET /api/my_whisper  │
       │                       │                       ├──────────────────────>│
       │                       │                       │                       │
       │                       │                       │  11. Display:         │
       │                       │                       │  - Public scene       │
       │                       │                       │  - Private whisper    │
       │                       │                       │  - Choice input       │
       │                       │                       │                       │
       ▼                       ▼                       ▼                       ▼
```

**Key Points**:
- Host generates scenario via HTTP (persistence)
- All players notified instantly via SocketIO
- Players fetch their data (public + private whisper)
- Dramatic UI transition for new scenario

---

## 5. Turn Resolution Flow

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Player A  │         │   Server    │         │  All Players│
│   (Host)    │         │   (Flask)   │         │   (Room)    │
└──────┬──────┘         └──────┬──────┘         └──────┬──────┘
       │                       │                       │
       │  ALL CHOICES IN       │                       │
       │  (detected by         │                       │
       │   previous events)    │                       │
       │                       │                       │
       │  1. Click "Resolve"   │                       │
       │                       │                       │
       │  2. HTTP POST         │                       │
       │  /api/resolve_turn    │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  3. Gather all choices│
       │                       │  4. Calculate outcome │
       │                       │  - Trust change       │
       │                       │  - NPC reactions      │
       │                       │  5. Mark resolved     │
       │                       │                       │
       │  6. HTTP 200 OK       │                       │
       │  {outcome, trust}     │                       │
       │<──────────────────────┤                       │
       │                       │                       │
       │  7. SocketIO emit     │                       │
       │  'turn_resolved'      │                       │
       ├──────────────────────>│                       │
       │                       │                       │
       │                       │  8. Broadcast         │
       │                       │  'turn_resolution'    │
       │                       ├──────────────────────>│
       │                       │                       │
       │                       │                       │  9. Show results
       │                       │                       │  - Outcome narrative
       │                       │                       │  - Trust change
       │                       │                       │  - Reload game state
       │                       │                       │
       ▼                       ▼                       ▼
```

**Key Points**:
- Only host can resolve (or any player if configured)
- Outcome calculated on server
- All players see results simultaneously
- Game state updated for all

---

## 6. Presence Tracking System

```
          ┌──────────────────────────────────────┐
          │          SERVER STATE                 │
          │                                       │
          │  game_sessions = {                   │
          │    'ABC123': GameSession(...)        │
          │  }                                    │
          │                                       │
          │  player_presence = {                 │
          │    'ABC123': {'player_a', 'player_b'}│
          │  }                                    │
          │                                       │
          │  connected_clients = {               │
          │    'socket_1': {                     │
          │      player_id: 'player_a',          │
          │      game_code: 'ABC123'             │
          │    },                                 │
          │    'socket_2': {                     │
          │      player_id: 'player_b',          │
          │      game_code: 'ABC123'             │
          │    }                                  │
          │  }                                    │
          └──────────────────────────────────────┘
                          │
                          │ Events trigger updates
                          ▼
          ┌──────────────────────────────────────┐
          │      PRESENCE CHANGE EVENTS           │
          │                                       │
          │  - on('connect')                     │
          │    → Add to presence                 │
          │    → Broadcast 'player_connected'    │
          │                                       │
          │  - on('disconnect')                  │
          │    → Remove from presence            │
          │    → Broadcast 'player_disconnected' │
          │                                       │
          │  - on('reconnect')                   │
          │    → Add back to presence            │
          │    → Broadcast 'player_reconnected'  │
          │    → Send 'reconnect_sync'           │
          │                                       │
          │  - on('request_presence')            │
          │    → Send current presence list      │
          │                                       │
          └──────────────────────────────────────┘
                          │
                          │ Broadcasts
                          ▼
          ┌──────────────────────────────────────┐
          │         ALL CLIENTS IN ROOM           │
          │                                       │
          │  Receive 'presence_update':          │
          │  {                                    │
          │    online_players: ['a', 'b'],       │
          │    total_players: 3,                 │
          │    players: [                        │
          │      {id: 'a', name: 'Alice', online: true},│
          │      {id: 'b', name: 'Bob', online: true}, │
          │      {id: 'c', name: 'Charlie', online: false}│
          │    ]                                  │
          │  }                                    │
          │                                       │
          │  UI Update:                           │
          │  - Green dot for Alice ●             │
          │  - Green dot for Bob ●               │
          │  - Gray dot for Charlie ○            │
          │  - Counter: "2/3 online"             │
          │                                       │
          └──────────────────────────────────────┘
```

**Key Points**:
- Presence tracked at three levels: game session, player set, socket connections
- Updates propagate instantly on any change
- UI reflects online/offline status in real-time
- Automatic cleanup on disconnect

---

## 7. Error Handling Flow

```
┌─────────────┐         ┌─────────────┐
│   Client    │         │   Server    │
└──────┬──────┘         └──────┬──────┘
       │                       │
       │  SocketIO emit        │
       │  (invalid request)    │
       ├──────────────────────>│
       │                       │
       │                       │  Try to process
       │                       │  ❌ Error!
       │                       │  - No auth
       │                       │  - Invalid game
       │                       │  - Missing data
       │                       │
       │  Emit 'error'         │
       │  {                    │
       │    message: "...",    │
       │    code: "AUTH_..."   │
       │  }                    │
       │<──────────────────────┤
       │                       │
       │  Handle error         │
       │  switch(code):        │
       │  - AUTH_REQUIRED      │
       │    → Redirect login   │
       │  - NO_GAME            │
       │    → Redirect lobby   │
       │  - INVALID_GAME       │
       │    → Show toast       │
       │  - default            │
       │    → Show generic     │
       │                       │
       ▼                       ▼

GRACEFUL DEGRADATION:

┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │  SocketIO fails to connect
       │  (server down, network issue)
       │
       │  Detect: !isConnected
       │
       │  Fallback to HTTP polling:
       │  setInterval(() => {
       │    fetch('/api/game_state')
       │      .then(updateUI)
       │  }, 5000)
       │
       │  Show notification:
       │  "Using fallback mode"
       │
       ▼
```

**Key Points**:
- Server errors emitted as events (not thrown)
- Client handles errors gracefully
- Falls back to HTTP polling if SocketIO unavailable
- User always sees helpful error messages

---

## 8. Complete Session Lifecycle

```
┌────────────────────────────────────────────────────────────────┐
│                    PLAYER SESSION LIFECYCLE                     │
└────────────────────────────────────────────────────────────────┘

1. ENTER GAME
   │
   ├─> HTTP: POST /api/set_username
   ├─> HTTP: POST /api/create_game OR /api/join_game
   │         Response: {game_code, player_id}
   │         Session: {username, game_code, player_id}
   │
   └─> SocketIO: Initialize & emit 'join_game_room'
                 Server: Join room ABC123
                 Server: Update presence
                 Server: Broadcast 'player_joined'

2. CHARACTER CREATION
   │
   ├─> HTTP: POST /api/start_interrogation
   ├─> HTTP: POST /api/answer_question (x10)
   │         AI generates unique questions
   │         Determines character class
   │
   └─> All players ready?
       └─> Server: game_started = True

3. GAMEPLAY LOOP
   │
   ├─> Host generates scenario
   │   ├─> HTTP: POST /api/generate_scenario
   │   │         MCP generates dynamic scenario
   │   │
   │   └─> SocketIO: emit 'scenario_generated'
   │                 Server: Broadcast 'new_scenario'
   │
   ├─> Players view scenario
   │   ├─> HTTP: GET /api/current_scenario (public)
   │   └─> HTTP: GET /api/my_whisper (private)
   │
   ├─> Players make choices
   │   ├─> HTTP: POST /api/make_choice
   │   │         Server: Save choice
   │   │
   │   └─> SocketIO: emit 'choice_submitted'
   │                 Server: Broadcast 'player_chose'
   │                 All players: Update progress
   │
   ├─> All choices in?
   │   └─> Enable "Resolve Turn" button
   │
   ├─> Resolve turn
   │   ├─> HTTP: POST /api/resolve_turn
   │   │         Server: Calculate outcome
   │   │         Server: Update trust, NPCs, etc.
   │   │
   │   └─> SocketIO: emit 'turn_resolved'
   │                 Server: Broadcast 'turn_resolution'
   │                 All players: See outcome
   │
   └─> Repeat gameplay loop

4. NETWORK EVENTS (during gameplay)
   │
   ├─> Player disconnects
   │   └─> Server: Detect disconnect
   │       Server: Update presence
   │       Server: Broadcast 'player_disconnected'
   │       Other players: Gray dot, update counter
   │
   ├─> Player reconnects
   │   ├─> Client: Auto reconnect (exponential backoff)
   │   ├─> Client: emit 'reconnect'
   │   ├─> Server: Send 'reconnect_sync' (full state)
   │   ├─> Client: Sync UI to server state
   │   └─> Server: Broadcast 'player_reconnected'
   │       Other players: Green dot, toast notification
   │
   └─> Request presence
       └─> Client: emit 'request_presence'
           Server: Send 'presence_update'

5. END GAME
   │
   ├─> Game completes (trust 0 or 100, or time limit)
   │
   ├─> HTTP: GET /api/game_state → phase: 'complete'
   │
   └─> SocketIO: Disconnect
                 Server: Clean up presence
                 Server: Game session persists for review
```

---

## 9. Data Persistence vs Real-Time Events

```
┌─────────────────────────────────────────────────────────────────┐
│                 HTTP (PERSISTENCE)                               │
│                                                                  │
│  Used for:                                                      │
│  - Creating/joining games                                       │
│  - Saving choices                                               │
│  - Generating scenarios                                         │
│  - Resolving turns                                              │
│  - Fetching game state                                          │
│                                                                  │
│  Why HTTP:                                                      │
│  - RESTful, stateless                                           │
│  - Easy to test (curl, Postman)                                 │
│  - Familiar pattern                                             │
│  - Session-based auth                                           │
│  - Request/response model                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ After successful HTTP request
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               SOCKETIO (REAL-TIME EVENTS)                        │
│                                                                  │
│  Used for:                                                      │
│  - Notifying other players                                      │
│  - Presence tracking                                            │
│  - Progress updates                                             │
│  - Reconnection sync                                            │
│  - Typing indicators                                            │
│                                                                  │
│  Why SocketIO:                                                  │
│  - Instant updates (< 200ms)                                    │
│  - Bidirectional communication                                  │
│  - Push notifications                                           │
│  - Room-based broadcasting                                      │
│  - Automatic reconnection                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

EXAMPLE: Player Makes Choice

1. CLIENT: HTTP POST /api/make_choice
   ↓
2. SERVER: Save choice to game_session.current_scenario
   ↓
3. SERVER: Return HTTP 200 OK
   ↓
4. CLIENT: SocketIO emit 'choice_submitted'
   ↓
5. SERVER: SocketIO broadcast 'player_chose' to room
   ↓
6. ALL CLIENTS: Update UI in real-time

Benefits:
- Data persisted (can refresh page)
- Other players notified instantly
- Best of both worlds
```

---

## 10. Scaling Architecture

```
SINGLE SERVER (Current Implementation)
┌────────────────────────────────────────┐
│         Flask + SocketIO               │
│         Eventlet async mode            │
│                                        │
│  Max: 500 concurrent players           │
│       125 concurrent games (4 each)    │
│                                        │
│  game_sessions: Dict (in-memory)       │
│  player_presence: Dict (in-memory)     │
└────────────────────────────────────────┘


MULTI-SERVER (For scaling > 500 players)
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  Flask +     │  │  Flask +     │  │  Flask +     │
│  SocketIO    │  │  SocketIO    │  │  SocketIO    │
│  Server 1    │  │  Server 2    │  │  Server 3    │
└──────┬───────┘  └──────┬───────┘  └──────┬───────┘
       │                 │                 │
       │     All connected to Redis       │
       │                 │                 │
       └─────────────────┴─────────────────┘
                         │
                         ▼
               ┌──────────────────┐
               │   Redis Pub/Sub  │
               │   Message Queue  │
               │                  │
               │  Synchronizes:   │
               │  - Room messages │
               │  - Presence data │
               │  - Events        │
               └──────────────────┘

Benefits:
- Horizontal scaling
- Load balancing
- High availability
- Shared state across servers
- Players can connect to any server

Code change:
socketio = SocketIO(
    app,
    message_queue='redis://localhost:6379/0'
)
```

---

## Legend

```
Symbols Used in Diagrams:

├─>  Flow direction (sequential)
│    Continuation
▼    Final state / End
❌   Error / Failure
✅   Success / Restored
●    Presence indicator (online)
○    Presence indicator (offline)

Box Types:
┌────────┐
│ Entity │  Player, Server, Component
└────────┘

┌──────────────────────┐
│ State / Data         │  Server state, data structure
└──────────────────────┘
```

---

**End of Event Flow Diagrams**

For implementation details, see:
- `PHASE_H_SOCKETIO_DOCUMENTATION.md` - Full technical documentation
- `PHASE_H_SUMMARY.md` - Quick reference summary
- `socketio_integration.py` - Server implementation
- `socketio_client.js` - Client implementation
