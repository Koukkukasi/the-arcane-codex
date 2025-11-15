# Backend Integration Plan - The Arcane Codex
**Date**: 2025-11-15
**Goal**: Connect Web UI to Flask Backend
**Target**: Production-ready web game

---

## 📊 CURRENT STATE

### **Architecture Understanding**:
- **Primary Interface**: Discord Bot / WhatsApp (for kids/players)
- **Web UI**: Optional demo/testing interface
- **Web Server**: `web_game.py` (1,221 lines) - Main Flask server
- **Alt Server**: `app.py` (409 lines) - Simple Flask + SocketIO
- **Production**: `app_production.py` (753 lines) - Optimized version

### **Decision**:
Use `web_game.py` as primary backend (has MCP integration + all game logic)

---

## 🔌 EXISTING API ENDPOINTS (web_game.py)

### ✅ **Already Implemented**:

#### **Session Management**:
1. `GET /` - Landing page
2. `GET /game` - Main game interface
3. `GET /boring` - Alternative landing
4. `POST /api/set_username` - Set player username
5. `GET /api/get_username` - Get current username
6. `GET /api/session_info` - Get session data

#### **Game Management**:
7. `POST /api/create_game` - Create new game session (returns game code)
8. `POST /api/join_game` - Join existing game by code
9. `GET /api/game_state` - Get current game state

#### **Character Creation (Divine Interrogation)**:
10. `POST /api/start_interrogation` - Begin Divine Interrogation
11. `POST /api/answer_question` - Submit answer to divine question

#### **Scenario System**:
12. `POST /api/generate_scenario` - Generate new scenario via MCP
13. `GET /api/current_scenario` - Get active scenario
14. `GET /api/my_whisper` - Get player's private whisper

#### **Gameplay**:
15. `POST /api/make_choice` - Submit player choice
16. `GET /api/waiting_for` - Check who hasn't submitted
17. `POST /api/resolve_turn` - Resolve turn after all choices

---

## ❌ MISSING API ENDPOINTS (Needed for UI)

### **Character Data**:
- `GET /api/character/stats` - Get character stats (STR, DEX, etc.)
- `GET /api/character/divine_favor` - Get favor with all 7 gods
- `GET /api/character/level` - Get level and XP

### **Inventory**:
- `GET /api/inventory/all` - Get full inventory
- `GET /api/inventory/equipment` - Get equipped items
- `POST /api/inventory/equip` - Equip item
- `POST /api/inventory/use` - Use consumable

### **Skills**:
- `GET /api/skills/all` - Get all skills
- `POST /api/skills/assign` - Assign skill to hotkey

### **Quests**:
- `GET /api/quests/active` - Get active quests
- `GET /api/quests/completed` - Get completed quests

### **Map**:
- `GET /api/map/locations` - Get discovered locations
- `GET /api/map/current` - Get current location

### **Settings**:
- `POST /api/settings/save` - Save settings
- `GET /api/settings/load` - Load settings

---

## 🎯 INTEGRATION STRATEGY

### **Phase 1: Connect Existing Endpoints** (2-3 hours)

Map UI to existing APIs without creating new endpoints.

#### **1.1 Character Sheet Overlay**
**UI File**: `arcane_codex_scenario_ui_enhanced.html` (Character overlay)
**API**: Use `/api/game_state` to get character data

**Implementation**:
```javascript
// When user presses C key (character overlay)
async function loadCharacterData() {
    const response = await fetch('/api/game_state');
    const data = await response.json();

    // Update character sheet UI
    document.querySelector('.character-name').textContent = data.player_name;
    document.querySelector('.character-class-title').textContent = data.player_class;

    // Update stats (if available in game_state)
    // Update divine favor (if available)
    // Update level/XP
}
```

**Modifications Needed**:
- ✅ No backend changes (use existing `/api/game_state`)
- ⚠️ Enhance `/api/game_state` to include full character data

#### **1.2 Scenario Display**
**UI File**: Main scenario panel
**API**: `/api/current_scenario` + `/api/my_whisper`

**Implementation**:
```javascript
async function loadCurrentScenario() {
    // Get public scenario
    const scenarioRes = await fetch('/api/current_scenario');
    const scenario = await scenarioRes.json();

    // Update public narrative
    document.querySelector('.narrative-text').innerHTML = scenario.public_scene;

    // Get private whisper
    const whisperRes = await fetch('/api/my_whisper');
    const whisper = await whisperRes.json();

    // Update whisper panel
    document.querySelector('.whisper-content').innerHTML = whisper.content;
}
```

**Modifications Needed**:
- ✅ No backend changes

#### **1.3 Choice Submission**
**UI File**: Choice buttons
**API**: `/api/make_choice`

**Implementation**:
```javascript
// When player clicks choice button
document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', async function() {
        const choiceText = this.textContent.trim();

        const response = await fetch('/api/make_choice', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ choice: choiceText })
        });

        const result = await response.json();

        if (result.success) {
            // Show waiting screen
            showWaitingForOthers();
        }
    });
});
```

**Modifications Needed**:
- ✅ No backend changes
- TODO on line 5916 resolved!

---

### **Phase 2: Extend Game State** (3-4 hours)

Enhance `/api/game_state` to return all data needed by UI overlays.

#### **2.1 Enhanced Game State Response**

**Current** (`/api/game_state`):
```json
{
    "game_code": "ABC123",
    "player_name": "Aldric",
    "player_class": "Fighter",
    "game_started": true
}
```

**Enhanced**:
```json
{
    "game_code": "ABC123",
    "player": {
        "name": "Aldric",
        "class": "Fighter",
        "level": 5,
        "xp": 2400,
        "xp_next": 5000,
        "hp": 45,
        "hp_max": 60,
        "mana": 10,
        "mana_max": 15,
        "stats": {
            "strength": 16,
            "dexterity": 12,
            "constitution": 14,
            "intelligence": 8,
            "wisdom": 10,
            "charisma": 11
        },
        "divine_favor": {
            "VALDRIS": 15,
            "KAITHA": -10,
            "MORVANE": 20,
            "SYLARA": 5,
            "KORVAN": 25,
            "ATHENA": 10,
            "MERCUS": -5
        },
        "inventory": [
            {"id": "sword_01", "name": "Iron Sword", "type": "weapon", "equipped": true},
            {"id": "potion_01", "name": "Health Potion", "type": "consumable", "quantity": 3}
        ],
        "equipment": {
            "main_hand": "sword_01",
            "off_hand": null,
            "armor": "leather_armor",
            "helmet": null
        },
        "skills": [
            {"id": "power_attack", "name": "Power Attack", "level": 2, "hotkey": 1}
        ],
        "quests_active": [
            {
                "id": "quest_01",
                "title": "The Medicine Heist",
                "description": "Find Grimsby's nephew",
                "objectives": [
                    {"text": "Enter Valdria", "completed": true},
                    {"text": "Obtain medicine", "completed": false}
                ],
                "rewards": {"xp": 500, "gold": 100}
            }
        ],
        "quests_completed": []
    },
    "scenario": {
        "turn": 12,
        "location": "Duke's Warehouse",
        "public_scene": "You enter the warehouse...",
        "choices": [
            "Enter through the front door",
            "Sneak around the back",
            "Wait and observe",
            "Leave immediately"
        ]
    },
    "party": [
        {"name": "Aldric", "class": "Fighter", "hp": 45, "hp_max": 60},
        {"name": "Mystra", "class": "Mage", "hp": 30, "hp_max": 35}
    ]
}
```

**Implementation**:
```python
# In web_game.py, modify get_game_state()
@app.route('/api/game_state', methods=['GET'])
def get_game_state():
    game_code = session.get('game_code')
    game_session = get_game_session(game_code)
    player_id = session.get('player_id')

    # Get character from game engine
    character = game_session.game.get_character(player_id)

    # Build enhanced response
    return jsonify({
        'game_code': game_code,
        'player': {
            'name': character.name,
            'class': character.class_type,
            'level': character.level,
            'xp': character.xp,
            'xp_next': calculate_xp_for_next_level(character.level),
            'hp': character.hp,
            'hp_max': character.max_hp,
            'mana': character.mana,
            'mana_max': character.max_mana,
            'stats': character.stats,
            'divine_favor': character.divine_favor,
            'inventory': serialize_inventory(character.inventory),
            'equipment': character.equipped_items,
            'skills': character.skills,
            'quests_active': get_active_quests(player_id),
            'quests_completed': get_completed_quests(player_id)
        },
        'scenario': {
            'turn': game_session.game.turn_number,
            'location': game_session.game.current_location,
            'public_scene': game_session.current_scenario.public_scene if game_session.current_scenario else "",
            'choices': extract_choices(game_session.current_scenario) if game_session.current_scenario else []
        },
        'party': serialize_party(game_session.game.party)
    })
```

---

### **Phase 3: Real-Time Updates** (2-3 hours)

Add WebSocket/SocketIO for live updates when other players make choices.

#### **3.1 Switch to SocketIO**

**Why**: Flask + SocketIO for real-time multiplayer

**Use**: `app.py` (already has SocketIO) OR add SocketIO to `web_game.py`

**Implementation**:
```python
# Add to web_game.py
from flask_socketio import SocketIO, emit, join_room

socketio = SocketIO(app, cors_allowed_origins="*")

@socketio.on('connect')
def handle_connect():
    player_id = session.get('player_id')
    game_code = session.get('game_code')

    if game_code:
        join_room(game_code)  # Join game room
        print(f"Player {player_id} connected to game {game_code}")

@socketio.on('disconnect')
def handle_disconnect():
    print(f"Player disconnected")

# When scenario updates, emit to all players
def broadcast_scenario_update(game_code, scenario):
    socketio.emit('scenario_update', {
        'public_scene': scenario.public_scene,
        'choices': extract_choices(scenario)
    }, room=game_code)

# When choice is made, notify others
def broadcast_choice_made(game_code, player_name):
    socketio.emit('player_choice_made', {
        'player': player_name,
        'waiting_for': get_waiting_players(game_code)
    }, room=game_code)
```

**Client-Side** (in HTML):
```javascript
// Connect to SocketIO
const socket = io();

socket.on('connect', () => {
    console.log('Connected to game server');
});

socket.on('scenario_update', (data) => {
    // Update scenario display
    document.querySelector('.narrative-text').innerHTML = data.public_scene;
    updateChoices(data.choices);
});

socket.on('player_choice_made', (data) => {
    // Update waiting display
    document.querySelector('.waiting-status').textContent =
        `Waiting for: ${data.waiting_for.join(', ')}`;
});
```

---

### **Phase 4: Missing Features** (4-5 hours)

Implement missing endpoints for inventory, skills, quests, map.

#### **4.1 Inventory Endpoints**

```python
@app.route('/api/inventory/all', methods=['GET'])
def get_inventory():
    player_id = session.get('player_id')
    character = get_character(player_id)
    return jsonify({
        'items': serialize_inventory(character.inventory),
        'equipment': character.equipped_items,
        'weight': calculate_weight(character.inventory),
        'weight_max': character.carry_capacity
    })

@app.route('/api/inventory/equip', methods=['POST'])
def equip_item():
    data = request.json
    item_id = data.get('item_id')
    slot = data.get('slot')  # 'main_hand', 'armor', etc.

    player_id = session.get('player_id')
    character = get_character(player_id)

    # Equip logic
    success = character.equip_item(item_id, slot)

    return jsonify({'success': success})

@app.route('/api/inventory/use', methods=['POST'])
def use_item():
    data = request.json
    item_id = data.get('item_id')

    player_id = session.get('player_id')
    character = get_character(player_id)

    # Use consumable
    result = character.use_item(item_id)

    return jsonify(result)
```

#### **4.2 Skills Endpoints**

```python
@app.route('/api/skills/all', methods=['GET'])
def get_skills():
    player_id = session.get('player_id')
    character = get_character(player_id)

    return jsonify({
        'skills': character.skills,
        'skill_points': character.skill_points
    })

@app.route('/api/skills/assign', methods=['POST'])
def assign_skill_hotkey():
    data = request.json
    skill_id = data.get('skill_id')
    hotkey = data.get('hotkey')  # 1-8

    player_id = session.get('player_id')
    character = get_character(player_id)

    success = character.assign_skill_to_hotkey(skill_id, hotkey)

    return jsonify({'success': success})
```

#### **4.3 Quest Endpoints**

```python
@app.route('/api/quests/active', methods=['GET'])
def get_active_quests():
    player_id = session.get('player_id')
    game_code = session.get('game_code')

    quests = db.get_active_quests(player_id, game_code)

    return jsonify({'quests': quests})

@app.route('/api/quests/completed', methods=['GET'])
def get_completed_quests():
    player_id = session.get('player_id')
    game_code = session.get('game_code')

    quests = db.get_completed_quests(player_id, game_code)

    return jsonify({'quests': quests})
```

---

## 🗺️ INTEGRATION ROADMAP

### **Week 1: Foundation** (8-10 hours)
- ✅ Day 1-2: Phase 1 - Connect existing endpoints (2-3 hours)
- ✅ Day 3-4: Phase 2 - Enhance game state (3-4 hours)
- ✅ Day 5: Phase 3 - Add SocketIO (2-3 hours)

### **Week 2: Features** (6-8 hours)
- ✅ Day 6-7: Phase 4 - Inventory/Skills/Quests endpoints (4-5 hours)
- ✅ Day 8: Testing & Bug fixes (2-3 hours)

### **Week 3: Polish** (4-6 hours)
- ✅ Loading states
- ✅ Error handling
- ✅ Performance optimization
- ✅ Documentation

---

## 🎯 PRIORITY ORDER

### **Priority 1: Playable Core** (Hours 1-5)
1. Connect `/api/current_scenario` → Display scenario
2. Connect `/api/my_whisper` → Display whisper
3. Connect `/api/make_choice` → Submit choice
4. Show waiting state
5. Auto-reload on turn resolution

**Result**: Can play through one scenario

### **Priority 2: Character Sheet** (Hours 6-8)
1. Enhance `/api/game_state` with full character data
2. Load character data on overlay open
3. Display stats, divine favor, level/XP

**Result**: Character sheet overlay functional

### **Priority 3: Real-Time Updates** (Hours 9-11)
1. Add SocketIO to `web_game.py`
2. Emit scenario updates
3. Emit choice notifications
4. Auto-refresh UI on events

**Result**: Multiplayer feels live

### **Priority 4: Full Features** (Hours 12-18)
1. Inventory system
2. Skills system
3. Quest system
4. Settings persistence

**Result**: All overlays functional

---

## 📝 FILES TO MODIFY

### **Backend Files**:
1. `web_game.py` (main server)
   - Enhance `/api/game_state` endpoint
   - Add SocketIO support
   - Add new inventory/skills/quests endpoints

2. `arcane_codex_server.py` (game engine)
   - Add methods to get character data
   - Add inventory management
   - Add skills management

3. `database.py` (if needed)
   - Add quest tracking tables
   - Add inventory persistence

### **Frontend Files**:
1. `static/arcane_codex_scenario_ui_enhanced.html`
   - Add SocketIO client library
   - Add API integration code
   - Add loading states
   - Add error handling

---

## 🧪 TESTING PLAN

### **Test Scenarios**:

**Test 1: Solo Play**
1. Create game
2. Complete Divine Interrogation
3. Receive scenario
4. See private whisper
5. Make choice
6. See next scenario

**Test 2: Multiplayer**
1. Player 1 creates game
2. Player 2 joins game
3. Both complete interrogation
4. Both receive scenario
5. Each sees different whispers
6. Player 1 makes choice
7. Player 2 sees "Waiting for Player 1"
8. Player 2 makes choice
9. Both see resolution

**Test 3: Character Sheet**
1. Open character overlay (C key)
2. Verify stats display
3. Verify divine favor bars
4. Verify level/XP

**Test 4: Inventory**
1. Open inventory (I key)
2. See items
3. Equip weapon
4. Use potion
5. Verify stats update

---

## ⚠️ KNOWN ISSUES TO ADDRESS

### **1. MCP Integration**
**Issue**: Character creation fails with MCP error
**Status**: Known from FINAL_STATUS.md
**Workaround**: TEST_MODE uses mock questions
**Fix**: Configure Claude Desktop MCP (see MCP_SETUP.md)

### **2. Session Persistence**
**Issue**: Sessions lost on server restart
**Status**: SECRET_KEY now persisted to file
**Improvement**: Use Redis for session storage

### **3. No Database Persistence**
**Issue**: Game state only in memory
**Status**: Lost on server restart
**Fix**: Implement database save/load

---

## 🎉 SUCCESS CRITERIA

### **Phase 1 Complete When**:
- ✅ Can create/join game via UI
- ✅ Can complete Divine Interrogation
- ✅ Can see scenario + whisper
- ✅ Can make choice
- ✅ Can see next scenario

### **Phase 2 Complete When**:
- ✅ Character sheet shows all data
- ✅ Divine favor displays correctly
- ✅ Level/XP progress visible

### **Phase 3 Complete When**:
- ✅ Multiple players can play together
- ✅ Real-time updates work
- ✅ Waiting screen appears
- ✅ Auto-refresh on turn end

### **Phase 4 Complete When**:
- ✅ All 6 overlays functional
- ✅ Inventory system works
- ✅ Skills can be assigned
- ✅ Quests track progress
- ✅ Settings persist

---

## 🚀 NEXT IMMEDIATE STEPS

**Start here** (30 minutes):

1. Test current backend:
```bash
cd /c/Users/ilmiv/ProjectArgent/complete_game
python web_game.py
# Open http://localhost:5000
```

2. Verify existing endpoints:
```bash
# Test character creation
curl -X POST http://localhost:5000/api/start_interrogation \
  -H "Content-Type: application/json"

# Test game state
curl http://localhost:5000/api/game_state
```

3. Begin Phase 1:
- Add SocketIO script to HTML
- Connect `/api/current_scenario` to scenario panel
- Test scenario display

---

**This plan will result in a fully functional web game in 2-3 weeks.**

**Ready to begin implementation?**
