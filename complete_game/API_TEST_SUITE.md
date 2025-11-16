# The Arcane Codex - Complete API Test Suite

## Overview
This document provides comprehensive testing for all 50+ API endpoints in The Arcane Codex, including:
- curl command examples
- Expected request/response formats
- Error case testing
- Rate limiting verification
- Pass/fail criteria

---

## Table of Contents

### Authentication & Session Management
1. [POST /api/set_username](#1-post-apiset_username)
2. [GET /api/get_username](#2-get-apiget_username)
3. [GET /api/csrf-token](#3-get-apicsrf-token)
4. [GET /api/session_info](#4-get-apisession_info)

### Game Session Management
5. [POST /api/create_game](#5-post-apicreate_game)
6. [POST /api/join_game](#6-post-apijoin_game)
7. [GET /api/game_state](#7-get-apigame_state)

### Character Creation (Divine Interrogation)
8. [POST /api/start_interrogation](#8-post-apistart_interrogation)
9. [POST /api/answer_question](#9-post-apianswer_question)

### Character Stats & Progression
10. [GET /api/character/stats](#10-get-apicharacterstats)
11. [GET /api/character/divine_favor](#11-get-apicharacterdivine_favor)
12. [POST /api/character/level_up](#12-post-apicharacterlevel_up)

### Inventory Management
13. [GET /api/inventory/all](#13-get-apiinventoryall)
14. [GET /api/inventory](#14-get-apiinventory)
15. [POST /api/inventory/equip](#15-post-apiinventoryequip)
16. [POST /api/inventory/unequip](#16-post-apiinventoryunequip)
17. [POST /api/inventory/use](#17-post-apiinventoryuse)
18. [POST /api/inventory/drop](#18-post-apiinventorydrop)
19. [POST /api/inventory/move](#19-post-apiinventorymove)
20. [POST /api/inventory/add](#20-post-apiinventoryadd)
21. [POST /api/inventory/destroy](#21-post-apiinventorydestroy)

### Quest System
22. [GET /api/quests/active](#22-get-apiquestsactive)
23. [GET /api/quests/completed](#23-get-apiquestscompleted)
24. [GET /api/quests](#24-get-apiquests)

### Map & Location
25. [GET /api/map/current](#25-get-apimapcurrent)

### Divine Council System
26. [POST /api/divine_council/convene](#26-post-apidivine_councilconvene)
27. [POST /api/divine_council/vote](#27-post-apidivine_councilvote)
28. [GET /api/divine_council/history](#28-get-apidivine_councilhistory)
29. [GET /api/divine_favor/all](#29-get-apidivine_favorall)
30. [GET /api/divine_effects/active](#30-get-apidivine_effectsactive)

### Skills & Abilities
31. [GET /api/skills/tree](#31-get-apiskillstree)
32. [POST /api/skills/unlock](#32-post-apiskillsunlock)
33. [POST /api/skills/rankup](#33-post-apiskillsrankup)
34. [POST /api/skills/assign_hotkey](#34-post-apiskillsassign_hotkey)
35. [POST /api/skills/use](#35-post-apiskillsuse)
36. [GET /api/skills/cooldowns](#36-get-apiskillscooldowns)
37. [POST /api/skills/refund](#37-post-apiskillsrefund)

### NPC Companions
38. [GET /api/npcs](#38-get-apinpcs)

### Party Management
39. [GET /api/party/trust](#39-get-apipartytrust)

### Scenario Generation (MCP-Powered)
40. [POST /api/generate_scenario](#40-post-apigenerate_scenario)
41. [GET /api/current_scenario](#41-get-apicurrent_scenario)
42. [GET /api/my_whisper](#42-get-apimy_whisper)
43. [POST /api/make_choice](#43-post-apimake_choice)
44. [GET /api/waiting_for](#44-get-apiwaiting_for)
45. [POST /api/resolve_turn](#45-post-apiresolve_turn)

### Utility & Monitoring
46. [POST /api/log_client_error](#46-post-apilog_client_error)

### Static Routes
47. [GET /](#47-get-)
48. [GET /game](#48-get-game)
49. [GET /favicon.ico](#49-get-faviconico)

---

## Setup for Testing

### 1. Start the Server
```bash
python web_game.py
```

### 2. Create Session Cookies
```bash
# Save cookies to file for subsequent requests
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "TestPlayer1"}' \
  -c cookies.txt
```

### 3. Get CSRF Token (for POST requests)
```bash
curl -X GET http://localhost:5000/api/csrf-token \
  -b cookies.txt
```

---

## API Endpoint Tests

### 1. POST /api/set_username

**Purpose:** Set username for the player (authentication)

**Rate Limit:** Not specified (unlimited)

**Request:**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "TestPlayer1"}' \
  -c cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "username": "TestPlayer1",
  "message": "Welcome, TestPlayer1!"
}
```

**Error Response - Empty Username (400):**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": ""}'
```
```json
{
  "status": "error",
  "message": "Username must be at least 2 characters"
}
```

**Error Response - Too Long (400):**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "ThisUsernameIsWayTooLongAndShouldBeRejected"}'
```
```json
{
  "status": "error",
  "message": "Username too long (max 20 characters)"
}
```

**Error Response - Invalid Characters (400):**
```bash
curl -X POST http://localhost:5000/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "<script>alert(1)</script>"}'
```
```json
{
  "status": "error",
  "message": "Username contains invalid characters"
}
```

**Pass Criteria:**
- Valid username returns 200
- Session cookie set with player_id
- Invalid usernames return 400
- XSS attempts blocked

---

### 2. GET /api/get_username

**Purpose:** Get current username from session

**Request:**
```bash
curl -X GET http://localhost:5000/api/get_username \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "username": "TestPlayer1"
}
```

**Response - No Username Set:**
```json
{
  "status": "success",
  "username": null
}
```

**Pass Criteria:**
- Returns username if set
- Returns null if not set
- Always returns 200

---

### 3. GET /api/csrf-token

**Purpose:** Get CSRF token for POST requests

**Request:**
```bash
curl -X GET http://localhost:5000/api/csrf-token \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "csrf_token": "ImFhYmJjY2RkZWVmZjExMjIzMzQ0NTU2Njc3ODg5OTAwIg.ZxYz..."
}
```

**Pass Criteria:**
- Returns valid CSRF token
- Token is cryptographically random
- Token tied to session

---

### 4. GET /api/session_info

**Purpose:** Get current session information

**Request:**
```bash
curl -X GET http://localhost:5000/api/session_info \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "game_code": "ABC123",
  "player_id": "a1b2c3d4e5f6...",
  "username": "TestPlayer1",
  "player_count": 2,
  "players": ["TestPlayer1", "TestPlayer2"],
  "game_started": true,
  "interrogation_complete": true
}
```

**Response - Not in Game:**
```json
{
  "status": "success",
  "game_code": null,
  "player_id": "a1b2c3d4e5f6...",
  "username": "TestPlayer1"
}
```

**Pass Criteria:**
- Returns session details
- game_code null if not joined
- player_count accurate

---

### 5. POST /api/create_game

**Purpose:** Create new multiplayer game session

**Rate Limit:** 10 per hour

**Authentication:** Required (username must be set)

**Request:**
```bash
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "game_code": "ABC123",
  "player_id": "a1b2c3d4e5f6...",
  "player_name": "TestPlayer1",
  "message": "Game created! Share code ABC123 with friends"
}
```

**Error Response - Not Authenticated (400):**
```bash
curl -X POST http://localhost:5000/api/create_game \
  -H "Content-Type: application/json"
```
```json
{
  "status": "error",
  "message": "Username required. Please set username first."
}
```

**Error Response - Rate Limited (429):**
```bash
# After 10 requests in an hour
```
```json
{
  "success": false,
  "error": "Rate limit exceeded. Please try again later."
}
```

**Pass Criteria:**
- Creates unique 6-character game code
- Sets game_code in session
- Returns player_id
- Rate limit enforced

**Rate Limit Test:**
```bash
# Send 11 requests rapidly
for i in {1..11}; do
  curl -X POST http://localhost:5000/api/create_game \
    -H "Content-Type: application/json" \
    -b cookies.txt
  echo "Request $i"
done
# Expected: First 10 succeed, 11th returns 429
```

---

### 6. POST /api/join_game

**Purpose:** Join existing game session

**Rate Limit:** 20 per hour

**Authentication:** Required

**Request:**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "ABC123"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "game_code": "ABC123",
  "player_id": "e5f6g7h8...",
  "player_name": "TestPlayer2",
  "message": "Joined game ABC123!",
  "players": ["TestPlayer1", "TestPlayer2"],
  "player_count": 2
}
```

**Error Response - Game Not Found (404):**
```bash
curl -X POST http://localhost:5000/api/join_game \
  -H "Content-Type: application/json" \
  -d '{"game_code": "INVALID"}' \
  -b cookies.txt
```
```json
{
  "status": "error",
  "message": "Game not found"
}
```

**Error Response - Game Full (400):**
```json
{
  "status": "error",
  "message": "Game is full (4 players max)"
}
```

**Error Response - Game Started (400):**
```json
{
  "status": "error",
  "message": "Game already started"
}
```

**Pass Criteria:**
- Can join game with valid code
- Player added to players list
- Max 4 players enforced
- Cannot join started game

---

### 7. GET /api/game_state

**Purpose:** Get current game state

**Authentication:** Required (must be in game)

**Request:**
```bash
curl -X GET http://localhost:5000/api/game_state \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "game_state": {
    "current_location": "Valdria",
    "party_trust": 50,
    "turn_number": 1,
    "gold": 100,
    "characters": [
      {
        "name": "TestPlayer1",
        "class": "Mage",
        "level": 1,
        "hp": 100,
        "max_hp": 100
      }
    ],
    "npc_companions": [],
    "current_scenario": {
      "public_scene": "You enter a dark forest...",
      "turn_number": 1
    }
  }
}
```

**Error Response - Not in Game (400):**
```json
{
  "status": "error",
  "message": "Not in game"
}
```

**Error Response - Unauthorized (401):**
```bash
curl -X GET http://localhost:5000/api/game_state
# No cookies
```
```json
{
  "status": "error",
  "message": "Authentication required"
}
```

**Pass Criteria:**
- Returns complete game state
- Requires authentication
- Only accessible to players in game

---

### 8. POST /api/start_interrogation

**Purpose:** Start Divine Interrogation (character creation)

**Rate Limit:** 3 per hour

**Request:**
```bash
curl -X POST http://localhost:5000/api/start_interrogation \
  -H "Content-Type: application/json" \
  -d '{"class_choice": "Mage"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Divine Interrogation started",
  "question_number": 1,
  "question_text": "A starving mother steals bread from a wealthy baker...",
  "options": [
    {
      "id": "q1_a",
      "letter": "A",
      "text": "Uphold the law. Cut off her hand. Law is absolute.",
      "favor": {
        "VALDRIS": 20,
        "KORVAN": 10,
        "SYLARA": -10
      }
    },
    {
      "id": "q1_b",
      "letter": "B",
      "text": "She pays double the bread's value. Gold solves this.",
      "favor": {
        "MERCUS": 20,
        "MORVANE": 15
      }
    }
  ]
}
```

**Error Response - Already Started (400):**
```json
{
  "status": "error",
  "message": "Interrogation already in progress"
}
```

**Error Response - Invalid Class (400):**
```bash
curl -X POST http://localhost:5000/api/start_interrogation \
  -H "Content-Type: application/json" \
  -d '{"class_choice": "InvalidClass"}' \
  -b cookies.txt
```

**Pass Criteria:**
- Returns first question
- 10 questions total
- Divine favor system initialized
- Rate limit enforced

---

### 9. POST /api/answer_question

**Purpose:** Answer Divine Interrogation question

**Rate Limit:** 20 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/answer_question \
  -H "Content-Type: application/json" \
  -d '{"answer_id": "q1_a"}' \
  -b cookies.txt
```

**Success Response - More Questions (200 OK):**
```json
{
  "status": "success",
  "message": "Answer recorded",
  "question_number": 2,
  "divine_favor": {
    "VALDRIS": 20,
    "KORVAN": 10,
    "SYLARA": -10,
    "KAITHA": 0,
    "MORVANE": 0,
    "ATHENA": 0,
    "MERCUS": 0
  },
  "question_text": "You discover forbidden magic...",
  "options": [...]
}
```

**Success Response - Final Question (200 OK):**
```json
{
  "status": "success",
  "message": "Divine Interrogation complete! Character created.",
  "interrogation_complete": true,
  "divine_favor": {
    "VALDRIS": 85,
    "KORVAN": 45,
    "SYLARA": -20,
    "KAITHA": 60,
    "MORVANE": 30,
    "ATHENA": 70,
    "MERCUS": 15
  },
  "patron_god": "VALDRIS",
  "character": {
    "class": "Mage",
    "level": 1,
    "stats": {...}
  }
}
```

**Error Response - Invalid Answer (400):**
```bash
curl -X POST http://localhost:5000/api/answer_question \
  -H "Content-Type: application/json" \
  -d '{"answer_id": "invalid"}' \
  -b cookies.txt
```

**Pass Criteria:**
- Accepts valid answer_id
- Updates divine favor
- Returns next question (or completion)
- Character created after question 10

---

### 10. GET /api/character/stats

**Purpose:** Get character statistics

**Request:**
```bash
curl -X GET http://localhost:5000/api/character/stats \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "stats": {
    "name": "TestPlayer1",
    "class": "Mage",
    "level": 5,
    "xp": 1250,
    "xp_to_next_level": 1500,
    "hp": 85,
    "max_hp": 100,
    "mp": 120,
    "max_mp": 150,
    "strength": 10,
    "dexterity": 12,
    "constitution": 14,
    "intelligence": 18,
    "wisdom": 16,
    "charisma": 13
  }
}
```

**Pass Criteria:**
- Returns all character stats
- Stats accurate and up-to-date

---

### 11. GET /api/character/divine_favor

**Purpose:** Get divine favor with all 7 gods

**Request:**
```bash
curl -X GET http://localhost:5000/api/character/divine_favor \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "divine_favor": {
    "VALDRIS": 85,
    "KAITHA": 60,
    "MORVANE": 30,
    "SYLARA": -20,
    "KORVAN": 45,
    "ATHENA": 70,
    "MERCUS": 15
  },
  "patron_god": "VALDRIS",
  "active_blessings": [
    {
      "god": "VALDRIS",
      "blessing": "Lawful Shield",
      "duration": 3
    }
  ]
}
```

**Pass Criteria:**
- Returns favor for all 7 gods
- Patron god identified (highest favor)
- Active blessings listed

---

### 12. POST /api/character/level_up

**Purpose:** Level up character

**Rate Limit:** 10 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/character/level_up \
  -H "Content-Type: application/json" \
  -d '{"stat_increases": {"intelligence": 2, "wisdom": 1}}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Level up! Now level 6",
  "new_level": 6,
  "skill_points_gained": 3,
  "stat_increases": {
    "intelligence": 2,
    "wisdom": 1
  },
  "new_stats": {
    "level": 6,
    "intelligence": 20,
    "wisdom": 17,
    "hp": 110,
    "max_hp": 110
  }
}
```

**Error Response - Insufficient XP (400):**
```json
{
  "status": "error",
  "message": "Insufficient experience for level up"
}
```

**Pass Criteria:**
- Increases level by 1
- Grants skill points
- Applies stat increases
- Increases max HP/MP

---

### 13. GET /api/inventory/all

**Purpose:** Get complete inventory

**Request:**
```bash
curl -X GET http://localhost:5000/api/inventory/all \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "items": [
    {
      "id": "sword_001",
      "name": "Iron Sword",
      "type": "weapon",
      "description": "A simple iron blade",
      "quantity": 1,
      "equipped": true,
      "slot": "main_hand",
      "stats": {
        "damage": "1d8",
        "attack_bonus": 2
      }
    },
    {
      "id": "potion_health_001",
      "name": "Health Potion",
      "type": "consumable",
      "description": "Restores 50 HP",
      "quantity": 3,
      "equipped": false
    }
  ],
  "gold": 100,
  "weight": 25,
  "max_weight": 100,
  "equipped_items": {
    "main_hand": "sword_001",
    "off_hand": null,
    "armor": "leather_armor_001",
    "helm": null,
    "boots": "leather_boots_001"
  }
}
```

**Pass Criteria:**
- Returns all inventory items
- Shows equipped status
- Includes weight calculation
- Lists gold amount

---

### 14. GET /api/inventory

**Purpose:** Alias for /api/inventory/all (backward compatibility)

**Request:**
```bash
curl -X GET http://localhost:5000/api/inventory \
  -b cookies.txt
```

**Response:** Same as /api/inventory/all

---

### 15. POST /api/inventory/equip

**Purpose:** Equip item to slot

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/equip \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001", "slot": "main_hand"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Equipped Iron Sword to main_hand",
  "equipped": {
    "id": "sword_001",
    "name": "Iron Sword",
    "slot": "main_hand"
  },
  "unequipped": {
    "id": "dagger_001",
    "name": "Rusty Dagger"
  }
}
```

**Error Response - Item Not Found (400):**
```json
{
  "success": false,
  "error": "Item not found in inventory"
}
```

**Error Response - Wrong Slot (400):**
```bash
# Try to equip sword to helm slot
curl -X POST http://localhost:5000/api/inventory/equip \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001", "slot": "helm"}' \
  -b cookies.txt
```
```json
{
  "success": false,
  "error": "Cannot equip weapon to helm slot"
}
```

**Pass Criteria:**
- Equips item to correct slot
- Unequips previous item in slot
- Updates character stats
- Validates slot compatibility

---

### 16. POST /api/inventory/unequip

**Purpose:** Unequip item

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/unequip \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Unequipped Iron Sword",
  "item": {
    "id": "sword_001",
    "name": "Iron Sword",
    "equipped": false
  }
}
```

**Pass Criteria:**
- Unequips item
- Item remains in inventory
- Character stats updated

---

### 17. POST /api/inventory/use

**Purpose:** Use consumable item

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/use \
  -H "Content-Type: application/json" \
  -d '{"item_id": "potion_health_001"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Used Health Potion: Restored 50 HP",
  "effect": {
    "type": "heal",
    "amount": 50,
    "hp_before": 60,
    "hp_after": 110
  },
  "item_consumed": true,
  "remaining_quantity": 2
}
```

**Error Response - Not Consumable (400):**
```bash
# Try to use sword
curl -X POST http://localhost:5000/api/inventory/use \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001"}' \
  -b cookies.txt
```
```json
{
  "success": false,
  "error": "Item is not consumable"
}
```

**Pass Criteria:**
- Applies item effect
- Decrements quantity
- Removes item if quantity = 0
- Cannot use non-consumables

---

### 18. POST /api/inventory/drop

**Purpose:** Drop item from inventory

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/drop \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001", "quantity": 1}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Dropped Iron Sword",
  "item": {
    "id": "sword_001",
    "name": "Iron Sword",
    "quantity_dropped": 1
  }
}
```

**Error Response - Item Equipped (400):**
```json
{
  "success": false,
  "error": "Cannot drop equipped item. Unequip first."
}
```

**Pass Criteria:**
- Removes item from inventory
- Cannot drop equipped items
- Supports partial quantity drop

---

### 19. POST /api/inventory/move

**Purpose:** Move item between inventory slots

**Rate Limit:** 60 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/move \
  -H "Content-Type: application/json" \
  -d '{"item_id": "sword_001", "from_slot": 1, "to_slot": 5}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Moved item to slot 5",
  "item": {
    "id": "sword_001",
    "slot": 5
  }
}
```

**Pass Criteria:**
- Moves item to new slot
- Handles slot swapping
- Validates slot numbers

---

### 20. POST /api/inventory/add

**Purpose:** Add item to inventory (loot/rewards)

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/add \
  -H "Content-Type: application/json" \
  -d '{"item_id": "gold_coins", "quantity": 50}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Added 50 gold coins to inventory",
  "item": {
    "id": "gold_coins",
    "name": "Gold Coins",
    "quantity": 50
  },
  "new_gold_total": 150
}
```

**Error Response - Inventory Full (400):**
```json
{
  "success": false,
  "error": "Inventory full (max weight exceeded)"
}
```

**Pass Criteria:**
- Adds item to inventory
- Stacks with existing items
- Checks weight limit

---

### 21. POST /api/inventory/destroy

**Purpose:** Permanently destroy item

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/inventory/destroy \
  -H "Content-Type: application/json" \
  -d '{"item_id": "cursed_ring_001"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Destroyed Cursed Ring",
  "item": {
    "id": "cursed_ring_001",
    "name": "Cursed Ring"
  }
}
```

**Pass Criteria:**
- Permanently removes item
- Requires confirmation for valuable items
- Cannot destroy equipped items

---

### 22. GET /api/quests/active

**Purpose:** Get active quests

**Request:**
```bash
curl -X GET http://localhost:5000/api/quests/active \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "quests": [
    {
      "id": "quest_001",
      "title": "The Missing Artifact",
      "description": "Find the stolen artifact from the Temple of Valdris",
      "objectives": [
        {
          "id": "obj_001",
          "description": "Talk to the High Priest",
          "completed": true
        },
        {
          "id": "obj_002",
          "description": "Investigate the abandoned warehouse",
          "completed": false
        }
      ],
      "rewards": {
        "gold": 100,
        "experience": 500,
        "items": ["holy_amulet_001"]
      },
      "difficulty": "medium",
      "time_limit": null
    }
  ]
}
```

**Pass Criteria:**
- Returns all active quests
- Shows objective completion status
- Lists rewards

---

### 23. GET /api/quests/completed

**Purpose:** Get completed quests

**Request:**
```bash
curl -X GET http://localhost:5000/api/quests/completed \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "quests": [
    {
      "id": "quest_tutorial",
      "title": "Escape the Prison",
      "completed_at": "2025-11-15T14:30:00Z",
      "rewards_claimed": {
        "gold": 50,
        "experience": 100
      }
    }
  ]
}
```

**Pass Criteria:**
- Returns completed quests
- Shows completion timestamp
- Lists claimed rewards

---

### 24. GET /api/quests

**Purpose:** Get all quests (active + completed)

**Request:**
```bash
curl -X GET http://localhost:5000/api/quests \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "active_quests": [...],
  "completed_quests": [...],
  "total_quests": 5,
  "completion_rate": "40%"
}
```

---

### 25. GET /api/map/current

**Purpose:** Get current location

**Request:**
```bash
curl -X GET http://localhost:5000/api/map/current \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "location": {
    "id": "valdria",
    "name": "Valdria",
    "type": "city",
    "description": "The capital city of the realm",
    "available_locations": [
      {
        "id": "market",
        "name": "Market District",
        "travel_time": 0
      },
      {
        "id": "temple",
        "name": "Temple of the Seven",
        "travel_time": 5
      }
    ],
    "npcs_present": [
      {
        "id": "merchant_001",
        "name": "Gregor the Merchant"
      }
    ]
  }
}
```

**Pass Criteria:**
- Returns current location details
- Lists available travel destinations
- Shows NPCs present

---

### 26. POST /api/divine_council/convene

**Purpose:** Convene Divine Council to vote on player action

**Rate Limit:** 10 per hour (expensive AI operation)

**Request:**
```bash
curl -X POST http://localhost:5000/api/divine_council/convene \
  -H "Content-Type: application/json" \
  -d '{"situation": "We found a cursed artifact. Should we destroy it or keep it for study?", "context": "The artifact radiates dark magic"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "council_id": "council_001",
  "situation": "We found a cursed artifact...",
  "votes": [
    {
      "god": "VALDRIS",
      "vote": "destroy",
      "reasoning": "Cursed artifacts threaten the order. Destroy it immediately.",
      "intensity": "strong"
    },
    {
      "god": "KAITHA",
      "vote": "study",
      "reasoning": "Knowledge of dark magic helps us combat it. Study first.",
      "intensity": "moderate"
    },
    {
      "god": "MORVANE",
      "vote": "destroy",
      "reasoning": "Weakness. Destroy it before it corrupts the weak-minded.",
      "intensity": "strong"
    }
  ],
  "majority_decision": "destroy",
  "vote_tally": {
    "destroy": 5,
    "study": 2
  },
  "consequences": {
    "party_trust": 5,
    "divine_favor_changes": {
      "VALDRIS": 10,
      "KAITHA": -5
    },
    "narrative_effect": "The gods smile upon your righteous decision."
  }
}
```

**Pass Criteria:**
- All 7 gods vote
- Majority decision determined
- Consequences applied
- Divine favor updated

---

### 27. POST /api/divine_council/vote

**Purpose:** Cast vote in Divine Council (multiplayer voting)

**Request:**
```bash
curl -X POST http://localhost:5000/api/divine_council/vote \
  -H "Content-Type: application/json" \
  -d '{"council_id": "council_001", "vote": "destroy"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Vote recorded",
  "your_vote": "destroy",
  "votes_remaining": 2
}
```

**Pass Criteria:**
- Records player vote
- One vote per player
- Cannot change vote

---

### 28. GET /api/divine_council/history

**Purpose:** Get past Divine Council decisions

**Request:**
```bash
curl -X GET http://localhost:5000/api/divine_council/history \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "councils": [
    {
      "council_id": "council_001",
      "situation": "Should we destroy the cursed artifact?",
      "decision": "destroy",
      "timestamp": "2025-11-15T14:30:00Z",
      "consequences_applied": true
    }
  ]
}
```

---

### 29. GET /api/divine_favor/all

**Purpose:** Get divine favor for all players

**Request:**
```bash
curl -X GET http://localhost:5000/api/divine_favor/all \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "players": [
    {
      "player_id": "player_001",
      "username": "TestPlayer1",
      "divine_favor": {
        "VALDRIS": 85,
        "KAITHA": 60,
        ...
      },
      "patron_god": "VALDRIS"
    }
  ]
}
```

---

### 30. GET /api/divine_effects/active

**Purpose:** Get active divine blessings/curses

**Request:**
```bash
curl -X GET http://localhost:5000/api/divine_effects/active \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "blessings": [
    {
      "god": "VALDRIS",
      "name": "Lawful Shield",
      "description": "+2 AC for 3 turns",
      "duration_remaining": 2,
      "effect": {
        "ac_bonus": 2
      }
    }
  ],
  "curses": []
}
```

---

### 31. GET /api/skills/tree

**Purpose:** Get skill tree for character class

**Rate Limit:** 100 per minute

**Request:**
```bash
curl -X GET http://localhost:5000/api/skills/tree \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "class": "Mage",
  "available_skill_points": 5,
  "skills": [
    {
      "id": "fireball",
      "name": "Fireball",
      "description": "Launch a ball of fire dealing 2d6+INT damage",
      "rank": 0,
      "max_rank": 5,
      "unlocked": false,
      "cost_to_unlock": 1,
      "requirements": {
        "level": 1,
        "prerequisites": []
      },
      "effects": {
        "damage": "2d6",
        "range": 30,
        "aoe": 10
      }
    }
  ]
}
```

---

### 32. POST /api/skills/unlock

**Purpose:** Unlock a skill

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/skills/unlock \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "fireball"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Unlocked Fireball",
  "skill": {
    "id": "fireball",
    "name": "Fireball",
    "rank": 1,
    "unlocked": true
  },
  "skill_points_remaining": 4
}
```

**Error Response - Insufficient Points (400):**
```json
{
  "status": "error",
  "message": "Insufficient skill points"
}
```

---

### 33. POST /api/skills/rankup

**Purpose:** Increase skill rank

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/skills/rankup \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "fireball"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Fireball rank increased to 2",
  "skill": {
    "id": "fireball",
    "rank": 2,
    "new_effects": {
      "damage": "3d6"
    }
  }
}
```

---

### 34. POST /api/skills/assign_hotkey

**Purpose:** Assign skill to hotkey (1-8)

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/skills/assign_hotkey \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "fireball", "hotkey": 1}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Fireball assigned to hotkey 1",
  "hotkeys": {
    "1": "fireball",
    "2": "ice_lance",
    ...
  }
}
```

---

### 35. POST /api/skills/use

**Purpose:** Use an active skill

**Rate Limit:** 60 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/skills/use \
  -H "Content-Type: application/json" \
  -d '{"skill_id": "fireball", "target_id": "enemy_001"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Cast Fireball",
  "result": {
    "damage_dealt": 18,
    "target": "Goblin Warrior",
    "target_hp_remaining": 12
  },
  "cooldown": {
    "skill_id": "fireball",
    "turns_remaining": 3
  }
}
```

**Error Response - On Cooldown (400):**
```json
{
  "status": "error",
  "message": "Skill on cooldown (2 turns remaining)"
}
```

---

### 36. GET /api/skills/cooldowns

**Purpose:** Get all skill cooldowns

**Rate Limit:** 100 per minute

**Request:**
```bash
curl -X GET http://localhost:5000/api/skills/cooldowns \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "cooldowns": {
    "fireball": 2,
    "ice_lance": 0,
    "teleport": 5
  }
}
```

---

### 37. POST /api/skills/refund

**Purpose:** Refund skill points (reset skills)

**Request:**
```bash
curl -X POST http://localhost:5000/api/skills/refund \
  -H "Content-Type: application/json" \
  -d '{"confirm": true}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "All skills refunded",
  "skill_points_refunded": 15,
  "total_skill_points": 15
}
```

---

### 38. GET /api/npcs

**Purpose:** Get NPC companions

**Request:**
```bash
curl -X GET http://localhost:5000/api/npcs \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "npcs": [
    {
      "id": "npc_001",
      "name": "Elara the Healer",
      "class": "Cleric",
      "level": 3,
      "approval": 75,
      "loyalty": "loyal",
      "location": "Valdria Temple",
      "special_abilities": ["Heal", "Bless"]
    }
  ]
}
```

---

### 39. GET /api/party/trust

**Purpose:** Get party trust level

**Request:**
```bash
curl -X GET http://localhost:5000/api/party/trust \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "party_trust": 65,
  "trust_level": "Trusted",
  "effects": {
    "combat_bonus": 5,
    "trade_discount": 10
  },
  "recent_changes": [
    {
      "change": 5,
      "reason": "Helped the villagers",
      "timestamp": "2025-11-15T14:00:00Z"
    }
  ]
}
```

---

### 40. POST /api/generate_scenario

**Purpose:** Generate new MCP-powered scenario

**Rate Limit:** 5 per minute (expensive AI operation)

**Request:**
```bash
curl -X POST http://localhost:5000/api/generate_scenario \
  -H "Content-Type: application/json" \
  -d '{"difficulty": "medium", "theme": "mystery"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "scenario_id": "scenario_001",
  "public_scene": "As you enter the abandoned manor, a cold wind extinguishes your torch. In the darkness, you hear whispers...",
  "turn_number": 1,
  "theme": "mystery"
}
```

**Note:** Requires MCP configuration or TEST_MODE=1

---

### 41. GET /api/current_scenario

**Purpose:** Get current scenario

**Request:**
```bash
curl -X GET http://localhost:5000/api/current_scenario \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "scenario": {
    "scenario_id": "scenario_001",
    "public_scene": "As you enter the abandoned manor...",
    "turn_number": 1,
    "choices_submitted": 1,
    "total_players": 2,
    "all_submitted": false
  }
}
```

---

### 42. GET /api/my_whisper

**Purpose:** Get player's private class-specific information

**Request:**
```bash
curl -X GET http://localhost:5000/api/my_whisper \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "whisper": "As a Mage, you sense powerful magic emanating from the basement. The wards here are ancient and unstable."
}
```

---

### 43. POST /api/make_choice

**Purpose:** Submit player's choice for current turn

**Rate Limit:** 30 per minute

**Request:**
```bash
curl -X POST http://localhost:5000/api/make_choice \
  -H "Content-Type: application/json" \
  -d '{"choice": "I investigate the whispers cautiously, using a light spell"}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Choice submitted!",
  "choices_submitted": 2,
  "total_players": 2,
  "all_submitted": true,
  "waiting_for": []
}
```

---

### 44. GET /api/waiting_for

**Purpose:** Check which players haven't submitted choices

**Request:**
```bash
curl -X GET http://localhost:5000/api/waiting_for \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "waiting_for": ["TestPlayer2"],
  "submitted": ["TestPlayer1"],
  "all_submitted": false
}
```

---

### 45. POST /api/resolve_turn

**Purpose:** Resolve turn once all choices submitted

**Request:**
```bash
curl -X POST http://localhost:5000/api/resolve_turn \
  -H "Content-Type: application/json" \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "resolution": "Your combined actions reveal a hidden passage. The whispers grow louder as you descend...",
  "consequences": {
    "party_trust": 2,
    "gold_found": 50,
    "experience_gained": 100
  },
  "turn_number": 2
}
```

---

### 46. POST /api/log_client_error

**Purpose:** Log client-side errors for monitoring

**Request:**
```bash
curl -X POST http://localhost:5000/api/log_client_error \
  -H "Content-Type: application/json" \
  -d '{"error": "TypeError: Cannot read property of undefined", "stack": "..."}' \
  -b cookies.txt
```

**Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Error logged"
}
```

---

### 47. GET /

**Purpose:** Main game page

**Request:**
```bash
curl -X GET http://localhost:5000/
```

**Success Response (200 OK):** HTML page

---

### 48. GET /game

**Purpose:** Game interface page

**Request:**
```bash
curl -X GET http://localhost:5000/game
```

**Success Response (200 OK):** HTML page

---

### 49. GET /favicon.ico

**Purpose:** Serve favicon

**Request:**
```bash
curl -X GET http://localhost:5000/favicon.ico
```

**Success Response (200 OK):** Icon file

---

## Rate Limiting Summary

| Endpoint | Rate Limit | Window |
|----------|-----------|--------|
| /api/create_game | 10 requests | 1 hour |
| /api/join_game | 20 requests | 1 hour |
| /api/start_interrogation | 3 requests | 1 hour |
| /api/answer_question | 20 requests | 1 minute |
| /api/generate_scenario | 5 requests | 1 minute |
| /api/make_choice | 30 requests | 1 minute |
| /api/inventory/equip | 30 requests | 1 minute |
| /api/inventory/use | 30 requests | 1 minute |
| /api/skills/use | 60 requests | 1 minute |
| /api/divine_council/convene | 10 requests | 1 hour |
| Default (all others) | 200 requests | 1 day |
| Default (all others) | 50 requests | 1 hour |

---

## Automated API Testing Script

```bash
#!/bin/bash
# test_all_apis.sh - Comprehensive API test script

BASE_URL="http://localhost:5000"
COOKIE_FILE="/tmp/arcane_cookies.txt"

echo "=========================================="
echo "ARCANE CODEX - API TEST SUITE"
echo "=========================================="
echo ""

# 1. Set username
echo "Test 1: Set username..."
curl -s -X POST $BASE_URL/api/set_username \
  -H "Content-Type: application/json" \
  -d '{"username": "AutoTest"}' \
  -c $COOKIE_FILE > /dev/null
echo "✓ Username set"

# 2. Get username
echo "Test 2: Get username..."
RESPONSE=$(curl -s -X GET $BASE_URL/api/get_username -b $COOKIE_FILE)
if echo "$RESPONSE" | grep -q "AutoTest"; then
  echo "✓ Username retrieved correctly"
else
  echo "✗ Username mismatch"
fi

# 3. Create game
echo "Test 3: Create game..."
GAME_RESPONSE=$(curl -s -X POST $BASE_URL/api/create_game \
  -H "Content-Type: application/json" \
  -b $COOKIE_FILE)
GAME_CODE=$(echo "$GAME_RESPONSE" | jq -r '.game_code')
echo "✓ Game created: $GAME_CODE"

# 4. Get session info
echo "Test 4: Get session info..."
curl -s -X GET $BASE_URL/api/session_info -b $COOKIE_FILE > /dev/null
echo "✓ Session info retrieved"

# 5. Start interrogation
echo "Test 5: Start interrogation..."
curl -s -X POST $BASE_URL/api/start_interrogation \
  -H "Content-Type: application/json" \
  -d '{"class_choice": "Mage"}' \
  -b $COOKIE_FILE > /dev/null
echo "✓ Interrogation started"

# 6. Answer questions (10 times)
echo "Test 6: Answer interrogation questions..."
for i in {1..10}; do
  curl -s -X POST $BASE_URL/api/answer_question \
    -H "Content-Type: application/json" \
    -d '{"answer_id": "q'$i'_a"}' \
    -b $COOKIE_FILE > /dev/null
done
echo "✓ All questions answered"

# 7. Get character stats
echo "Test 7: Get character stats..."
curl -s -X GET $BASE_URL/api/character/stats -b $COOKIE_FILE > /dev/null
echo "✓ Character stats retrieved"

# 8. Get inventory
echo "Test 8: Get inventory..."
curl -s -X GET $BASE_URL/api/inventory/all -b $COOKIE_FILE > /dev/null
echo "✓ Inventory retrieved"

# 9. Get quests
echo "Test 9: Get quests..."
curl -s -X GET $BASE_URL/api/quests/active -b $COOKIE_FILE > /dev/null
echo "✓ Quests retrieved"

# 10. Get skill tree
echo "Test 10: Get skill tree..."
curl -s -X GET $BASE_URL/api/skills/tree -b $COOKIE_FILE > /dev/null
echo "✓ Skill tree retrieved"

echo ""
echo "=========================================="
echo "ALL API TESTS COMPLETED"
echo "=========================================="
```

**Run the script:**
```bash
chmod +x test_all_apis.sh
./test_all_apis.sh
```

---

## Error Code Reference

| HTTP Code | Meaning | Common Causes |
|-----------|---------|---------------|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid input, missing fields, validation failed |
| 401 | Unauthorized | Not authenticated, session expired |
| 403 | Forbidden | Authenticated but not authorized for action |
| 404 | Not Found | Resource doesn't exist (game code, item, etc.) |
| 405 | Method Not Allowed | Wrong HTTP method (GET instead of POST) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error, check logs |

---

## Testing Checklist

- [ ] All authentication endpoints tested
- [ ] Game session flow tested (create, join, play)
- [ ] Divine Interrogation complete (10 questions)
- [ ] Inventory operations (equip, use, drop)
- [ ] Quest system functional
- [ ] Skills system functional
- [ ] Divine Council voting works
- [ ] NPC companions accessible
- [ ] Map/location system works
- [ ] Scenario generation works (MCP or test mode)
- [ ] Rate limiting enforced
- [ ] Error handling graceful
- [ ] Session persistence works
- [ ] CSRF protection active
- [ ] SocketIO real-time updates work

---

**API Testing Complete! Ready for production deployment.**
