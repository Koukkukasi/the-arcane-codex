# Quick Start - Backend API Server

## 1. Install Dependencies

```bash
npm install
```

## 2. Start the Server

### Windows
```bash
START_NODE_SERVER.bat
```

### Linux/Mac
```bash
./start_node_server.sh
```

### Or manually
```bash
npm start
```

## 3. Access the Game

Open your browser to: **http://localhost:3000**

## 4. Test API Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Get game state
curl http://localhost:3000/api/game_state

# Get current scenario
curl http://localhost:3000/api/current_scenario
```

## Available Endpoints

- `POST /api/csrf-token` - Get CSRF token
- `GET /api/game_state` - Load game state
- `GET /api/current_scenario` - Load scenario
- `POST /api/make_choice` - Submit choice
- `GET /api/character/stats` - Character stats
- `GET /api/character/divine_favor` - Divine favor
- `GET /api/inventory/all` - Inventory
- `GET /api/quests/active` - Active quests
- `GET /api/quests/completed` - Completed quests
- `GET /api/party` - Party info
- `GET /health` - Health check

## Troubleshooting

**Port already in use?**
- Edit `.env` and change `PORT=3000` to another port

**Module not found?**
- Run `npm install` again

**Server won't start?**
- Check `node --version` (need 14.0.0+)
- Delete `node_modules` and run `npm install`

## Need More Help?

Read `SERVER_README.md` for detailed documentation.
