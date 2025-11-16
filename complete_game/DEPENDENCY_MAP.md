# THE ARCANE CODEX - SYSTEM DEPENDENCY MAP

## Visual System Architecture

### Current State (Broken)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER LAYER                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│  │  game.js     │  │ inventory.js │  │  skills.js   │                │
│  │              │  │              │  │              │                │
│  │ - Game loop  │  │ - 5 API      │  │ - 5 API      │                │
│  │ - UI updates │  │   calls      │  │   calls      │                │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │
│         │                 │                  │                         │
│  ┌──────┴──────────────────┴──────────────────┴───────┐               │
│  │         divine-council.js, api-client.js            │               │
│  │         + 6 more API calls                          │               │
│  └─────────────────────────┬─────────────────────────┘               │
│                            │                                           │
└────────────────────────────┼───────────────────────────────────────────┘
                             │
                             │ HTTP Requests (fetch)
                             │
                     ┌───────┴────────┐
                     │  16 API Calls  │
                     │   All Return   │
                     │   404 Error    │ ❌ BROKEN
                     └───────┬────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLASK SERVER LAYER                              │
│                     (arcane_codex_server.py)                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │  IMPLEMENTED ROUTES (11 endpoints)                       │          │
│  ├─────────────────────────────────────────────────────────┤          │
│  │  GET  /                           [OK] Serves HTML      │          │
│  │  POST /api/interrogation/start    [ORPHANED]            │          │
│  │  POST /api/interrogation/answer   [ORPHANED]            │          │
│  │  POST /api/character/create       [ORPHANED]            │          │
│  │  POST /api/game/start             [ORPHANED]            │          │
│  │  GET  /api/game/state             [ORPHANED]            │          │
│  │  GET  /api/town/enter             [ORPHANED]            │          │
│  │  POST /api/whispers/generate      [ORPHANED]            │          │
│  │  POST /api/whispers/share         [ORPHANED]            │          │
│  │  POST /api/council/convene        [ORPHANED]            │          │
│  │  POST /api/npc/approval/update    [ORPHANED]            │          │
│  └─────────────────────────────────────────────────────────┘          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │  MISSING ROUTES (16 endpoints)                          │          │
│  ├─────────────────────────────────────────────────────────┤          │
│  │  GET  /api/csrf-token              [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/divine_council/vote     [NOT IMPLEMENTED] ❌ │          │
│  │  GET  /api/inventory               [NOT IMPLEMENTED] ❌ │          │
│  │  GET  /api/inventory/all           [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/inventory/use           [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/inventory/drop          [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/inventory/equip         [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/inventory/destroy       [NOT IMPLEMENTED] ❌ │          │
│  │  GET  /api/npcs                    [NOT IMPLEMENTED] ❌ │          │
│  │  GET  /api/party/trust             [NOT IMPLEMENTED] ❌ │          │
│  │  GET  /api/quests                  [NOT IMPLEMENTED] ❌ │          │
│  │  GET  /api/skills/tree             [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/skills/unlock           [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/skills/use              [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/skills/refund           [NOT IMPLEMENTED] ❌ │          │
│  │  POST /api/skills/assign_hotkey    [NOT IMPLEMENTED] ❌ │          │
│  └─────────────────────────────────────────────────────────┘          │
│                                                                         │
│                         ❓ Unclear Integration                         │
│                         How are managers called?                       │
│                                                                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PYTHON MANAGER LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────────────┐  ┌──────────────────────┐                   │
│  │ inventory_manager.py │  │  skills_manager.py   │                   │
│  ├──────────────────────┤  ├──────────────────────┤                   │
│  │ ✅ File exists       │  │ ✅ File exists       │                   │
│  │ ✅ Imports work      │  │ ✅ Imports work      │                   │
│  │ ❌ Not exposed       │  │ ❌ Not exposed       │                   │
│  │    via API           │  │    via API           │                   │
│  └──────────┬───────────┘  └──────────┬───────────┘                   │
│             │                          │                               │
│  ┌──────────┴───────────┐  ┌──────────┴───────────┐                  │
│  │  quest_manager.py    │  │ game_controller.py   │                  │
│  ├──────────────────────┤  ├──────────────────────┤                  │
│  │ ✅ File exists       │  │ ✅ File exists       │                  │
│  │ ❌ Not exposed       │  │ ⚠️ Partially used    │                  │
│  └──────────┬───────────┘  └──────────┬───────────┘                  │
│             │                          │                               │
│  ┌──────────┴──────────────────────────┴───────────┐                 │
│  │      divine_interrogation.py                     │                 │
│  │      ✅ File exists                              │                 │
│  │      ✅ Has API routes (interrogation/*)         │                 │
│  │      ⚠️ Routes not called by frontend            │                 │
│  └──────────────────────┬───────────────────────────┘                 │
│                         │                                              │
│         All managers import:                                          │
│         database.py, dataclasses, logging, typing                     │
│                         │                                              │
└─────────────────────────┼──────────────────────────────────────────────┘
                          │
                          │ Direct Python calls
                          │ (works fine)
                          ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                  │
│                         (database.py)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │  SQLite Database: arcane_codex.db                       │          │
│  ├─────────────────────────────────────────────────────────┤          │
│  │                                                          │          │
│  │  ✅ games                  (game instances)             │          │
│  │  ✅ players                (player characters)          │          │
│  │  ✅ npcs                   (NPC companions)             │          │
│  │  ✅ sensory_whispers       (asymmetric info)            │          │
│  │  ✅ pending_actions        (turn queue)                 │          │
│  │  ✅ game_history           (event log)                  │          │
│  │  ✅ interrogation_answers  (divine data)                │          │
│  │  ✅ divine_councils        (voting)                     │          │
│  │  ✅ scenarios              (quests)                     │          │
│  │  ✅ sensory_memories       (player memories)            │          │
│  │                                                          │          │
│  │  Status: All tables properly defined                    │          │
│  │  Issue: Missing foreign key constraints                 │          │
│  └─────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Expected State (After Fixes)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            BROWSER LAYER                                │
│  game.js, inventory.js, skills.js, divine-council.js, api-client.js   │
│                            16 API calls                                 │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ HTTP fetch() requests
                             │ ✅ All return 200 OK
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLASK SERVER LAYER                              │
│                     NEW: api_routes.py                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Flask Blueprints:                                                     │
│  ┌─────────────────────────────────────────────────────────┐          │
│  │  @api.route('/api/inventory/all')                       │          │
│  │  def get_inventory():                                    │          │
│  │      InventoryManager.get_all_items() ───────┐          │          │
│  │                                               │          │          │
│  │  @api.route('/api/skills/tree')              │          │          │
│  │  def get_skill_tree():                        │          │          │
│  │      SkillsManager.get_tree() ────────────────┤          │          │
│  │                                               │          │          │
│  │  @api.route('/api/quests')                    │          │          │
│  │  def get_quests():                            │          │          │
│  │      QuestManager.get_active() ───────────────┤          │          │
│  │                                               │          │          │
│  │  ... (13 more endpoints)                      │          │          │
│  └───────────────────────────────────────────────┼──────────┘          │
│                                                   │                     │
│  app.register_blueprint(api)                     │                     │
└──────────────────────────────────────────────────┼─────────────────────┘
                                                    │
                                                    │ Call manager methods
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      PYTHON MANAGER LAYER                               │
│  ✅ All managers exposed via API routes                                │
│                                                                         │
│  inventory_manager.py ──→ get_all_items(), use_item(), drop_item()    │
│  skills_manager.py ──────→ get_tree(), unlock_skill(), use_skill()     │
│  quest_manager.py ───────→ get_active_quests(), complete_quest()       │
│  game_controller.py ─────→ get_state(), process_action()               │
│                                                                         │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                             │ SQL queries via database.py
                             ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         DATABASE LAYER                                  │
│  SQLite with 10 tables + foreign key constraints                       │
└─────────────────────────────────────────────────────────────────────────┘
```

## Manager Dependencies (Detailed)

### Game Controller
```python
game_controller.py
├── Imports:
│   ├── logging
│   ├── ai_gm_auto          (AI Game Master)
│   ├── inventory_system    (Item management)
│   ├── character_progression
│   ├── database           (Data access)
│   ├── battle_system      (Combat)
│   └── typing, dataclasses, enum, time
│
├── Database Tables Used:
│   ├── games
│   ├── players
│   ├── game_history
│   └── pending_actions
│
└── Status: ✅ File exists, ⚠️ Partially integrated
```

### Inventory Manager
```python
inventory_manager.py
├── Imports:
│   ├── dataclasses
│   ├── inventory_system   (Core logic)
│   ├── logging
│   └── typing
│
├── Database Tables Used:
│   └── players (inventory JSON column)
│
└── Status: ✅ File exists, ❌ No API endpoints
```

### Skills Manager
```python
skills_manager.py
├── Imports:
│   ├── dataclasses
│   ├── logging
│   ├── time
│   └── typing
│
├── Database Tables Used:
│   └── players (skills JSON column)
│
└── Status: ✅ File exists, ❌ No API endpoints
```

### Quest Manager
```python
quest_manager.py
├── Imports:
│   ├── dataclasses
│   ├── logging
│   ├── enum
│   └── typing
│
├── Database Tables Used:
│   ├── scenarios
│   └── game_history
│
└── Status: ✅ File exists, ❌ No API endpoints
```

### Divine Interrogation
```python
divine_interrogation.py
├── Imports:
│   ├── logging
│   ├── dataclasses
│   ├── mcp_client        (MCP integration)
│   ├── database          (Data access)
│   └── typing
│
├── Database Tables Used:
│   ├── interrogation_answers
│   ├── players
│   └── divine_councils
│
└── Status: ✅ File exists, ✅ Has API routes (but frontend doesn't call them)
```

## Frontend File Dependencies

### game.js (Main Game Logic)
```javascript
game.js
├── Calls:
│   ├── /api/interrogation/start   ❌ (backend has it, wrong name)
│   ├── /api/interrogation/answer  ❌ (backend has it, wrong name)
│   ├── /api/character/create      ❌ (backend has it, not called)
│   ├── /api/game/start            ❌ (backend has it, not called)
│   └── /api/game/state            ❌ (backend has it, not called)
│
├── Dependencies:
│   ├── api-client.js
│   ├── error_handler.js
│   └── overlays.js
│
└── Status: ❌ Partially broken (some endpoints exist, not called correctly)
```

### inventory.js (Inventory UI)
```javascript
inventory.js
├── Calls:
│   ├── /api/inventory/all      ❌ NOT IMPLEMENTED
│   ├── /api/inventory/use      ❌ NOT IMPLEMENTED
│   ├── /api/inventory/drop     ❌ NOT IMPLEMENTED
│   ├── /api/inventory/equip    ❌ NOT IMPLEMENTED
│   └── /api/inventory/destroy  ❌ NOT IMPLEMENTED
│
├── Dependencies:
│   └── api-client.js
│
└── Status: ❌ Completely broken (0/5 endpoints exist)
```

### skills.js (Skills UI)
```javascript
skills.js
├── Calls:
│   ├── /api/skills/tree          ❌ NOT IMPLEMENTED
│   ├── /api/skills/unlock        ❌ NOT IMPLEMENTED
│   ├── /api/skills/use           ❌ NOT IMPLEMENTED
│   ├── /api/skills/refund        ❌ NOT IMPLEMENTED
│   └── /api/skills/assign_hotkey ❌ NOT IMPLEMENTED
│
├── Dependencies:
│   └── api-client.js
│
└── Status: ❌ Completely broken (0/5 endpoints exist)
```

### divine-council.js (Divine Council Voting)
```javascript
divine-council.js
├── Calls:
│   └── /api/divine_council/vote  ❌ NOT IMPLEMENTED
│                                    (backend has /api/council/convene)
│
├── Dependencies:
│   ├── api-client.js
│   └── effect-notifications.js
│
└── Status: ❌ Broken (endpoint name mismatch)
```

### api-client.js (Generic API Wrapper)
```javascript
api-client.js
├── Calls:
│   ├── /api/csrf-token      ❌ NOT IMPLEMENTED
│   ├── /api/inventory       ❌ NOT IMPLEMENTED
│   ├── /api/npcs            ❌ NOT IMPLEMENTED
│   ├── /api/party/trust     ❌ NOT IMPLEMENTED
│   └── /api/quests          ❌ NOT IMPLEMENTED
│
├── Functions:
│   ├── fetchWithCSRF()      (wraps fetch with CSRF token)
│   ├── apiCall()            (generic wrapper)
│   └── loadInventoryData()  (mock data placeholder)
│
└── Status: ❌ Broken (wrapper exists, endpoints don't)
```

## Database Table Dependencies

```
games (root table)
├── Referenced by:
│   ├── players (game_id) ⚠️ No FK constraint
│   ├── npcs (game_id) ⚠️ No FK constraint
│   ├── sensory_whispers (game_id) ⚠️ No FK constraint
│   ├── pending_actions (game_id) ⚠️ No FK constraint
│   ├── game_history (game_id) ⚠️ No FK constraint
│   ├── divine_councils (game_id) ⚠️ No FK constraint
│   └── scenarios (game_id) ⚠️ No FK constraint
│
players
├── Referenced by:
│   ├── sensory_whispers (player_id) ⚠️ No FK constraint
│   ├── pending_actions (player_id) ⚠️ No FK constraint
│   ├── interrogation_answers (player_id) ⚠️ No FK constraint
│   └── sensory_memories (player_id) ⚠️ No FK constraint
│
└── Columns:
    ├── id (TEXT PRIMARY KEY)
    ├── game_id (TEXT) → Should reference games(id)
    ├── inventory (JSON) → Used by inventory_manager
    ├── skills (JSON) → Used by skills_manager
    ├── divine_favor (JSON) → Used by divine_interrogation
    └── position (JSON) → Used by map system
```

**Issue:** All foreign key relationships are implicit (TEXT fields) without
actual FOREIGN KEY constraints. This allows:
- Orphaned records (player without game)
- Invalid references (game_id that doesn't exist)
- Cascading delete issues

## Configuration Dependencies

```
Application Startup
├── Requires (.env):
│   ├── SECRET_KEY           ❌ MISSING (critical security!)
│   ├── SESSION_SECRET       ❌ MISSING (critical security!)
│   ├── DB_PATH              ❌ MISSING (defaults to in-memory?)
│   ├── PORT                 ❌ MISSING (defaults to 5000?)
│   ├── DEBUG                ❌ MISSING (defaults to False?)
│   ├── ANTHROPIC_API_KEY    ✅ PRESENT
│   └── 19 more variables    ❌ MISSING
│
├── Database:
│   ├── Needs: DB_PATH
│   ├── Needs: DB_POOL_SIZE
│   └── Needs: DB_TIMEOUT
│
├── Flask:
│   ├── Needs: SECRET_KEY (for sessions)
│   ├── Needs: HOST
│   └── Needs: PORT
│
├── CORS:
│   └── Needs: CORS_ORIGINS
│
├── Redis Cache:
│   ├── Needs: REDIS_URL
│   ├── Needs: CACHE_ENABLED
│   └── Needs: CACHE_DEFAULT_TTL
│
└── Status: ❌ Cannot start properly with current .env
```

## Integration Checklist

### Backend → Database ✅
- [x] database.py exists
- [x] Managers import database.py
- [x] SQL queries work
- [ ] Foreign key constraints (missing)

### Managers → Backend API ❌
- [ ] inventory_manager exposed via /api/inventory/*
- [ ] skills_manager exposed via /api/skills/*
- [ ] quest_manager exposed via /api/quests
- [x] divine_interrogation exposed (but wrong endpoint names)
- [ ] game_controller exposed properly

### Frontend → Backend API ❌
- [ ] 0/16 endpoints working
- [ ] All calls return 404
- [ ] Endpoint naming mismatches
- [ ] JSON format not verified

### Configuration ❌
- [ ] 2/25 environment variables set
- [ ] SECRET_KEY missing (critical!)
- [ ] Database path not configured
- [ ] CORS origins not set

### Real-time Features ❌
- [ ] SocketIO not implemented
- [ ] No event handlers
- [ ] Must poll for updates
- [ ] Poor multiplayer experience

## Summary

**Working Layers:**
- ✅ Database (schema is good)
- ✅ Python Managers (all files exist, imports work)
- ✅ Frontend UI (animations, overlays work)

**Broken Layers:**
- ❌ Frontend → Backend (0% working, all 404s)
- ❌ Backend → Managers (unclear integration)
- ❌ Configuration (92% missing)

**Critical Path to Fix:**
1. Fix .env (15 min)
2. Create api_routes.py with 16 endpoints (4-8 hours)
3. Wire managers to routes (2-4 hours)
4. Test integration (2-4 hours)
5. Add SocketIO (optional, 4-6 hours)

**Total Time:** 12-24 hours to working state
