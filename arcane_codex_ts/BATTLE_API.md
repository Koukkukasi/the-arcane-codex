# Battle System API - Phase 2

Production-ready battle endpoints with TypeScript type safety, real-time Socket.IO updates, and comprehensive combat mechanics.

## Table of Contents
- [Endpoints](#endpoints)
- [Data Types](#data-types)
- [Enemy Types](#enemy-types)
- [Status Effects](#status-effects)
- [Class Abilities](#class-abilities)
- [Socket.IO Events](#socketio-events)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Endpoints

### 1. POST /api/battle/start
**Start a new battle session**

**Request:**
```json
{
  "player_id": "uuid-string",  // Optional, uses session player_id if not provided
  "enemy_type": "GOBLIN_SCOUT" // Optional, defaults to GOBLIN_SCOUT
}
```

**Response:**
```json
{
  "success": true,
  "battle_id": "battle-uuid",
  "player": {
    "id": "player-uuid",
    "name": "Hero",
    "class": "WARRIOR",
    "hp": 100,
    "maxHp": 100,
    "currentHp": 100,
    "mana": 50,
    "maxMana": 50,
    "currentMana": 50,
    "attack": 5,
    "defense": 2,
    "speed": 10,
    "level": 1,
    "statusEffects": []
  },
  "enemy": {
    "id": "goblin_scout",
    "name": "Goblin Scout",
    "emoji": "👺",
    "hp": 8,
    "maxHp": 8,
    "currentHp": 8,
    "attack": 3,
    "defense": 1,
    "speed": 15,
    "xp": 25,
    "gold": 10,
    "description": "A sneaky goblin scout. Weak but cunning.",
    "abilities": ["Quick Strike"],
    "lootTable": ["Rusty Dagger", "Goblin Ear", "Small Health Potion"],
    "isBoss": false
  },
  "turn_order": ["enemy", "player"],
  "is_player_turn": false,
  "abilities": [
    {
      "id": "power_strike",
      "name": "Power Strike",
      "emoji": "⚔️",
      "description": "A mighty blow dealing 150% damage",
      "manaCost": 10,
      "damage": 1.5,
      "cooldown": 2
    }
  ]
}
```

**Errors:**
- `400` - Player ID required
- `400` - Already in a battle
- `500` - Failed to start battle

---

### 2. POST /api/battle/:battle_id/action
**Execute a combat action (attack, defend, or ability)**

**Request:**
```json
{
  "action_type": "attack",  // "attack" | "defend" | "ability"
  "ability_id": "power_strike" // Required only for action_type: "ability"
}
```

**Response:**
```json
{
  "success": true,
  "damage": 7,
  "statusEffects": [],
  "enemyHp": 3,
  "playerHp": 95,
  "turnResult": "Turn complete",
  "enemyDamage": 5,
  "combatLog": [
    "You attack for 7 damage!",
    "Goblin Scout attacks! You take 5 damage!"
  ],
  "battle_state": {
    "player_hp": 95,
    "player_mana": 50,
    "enemy_hp": 3,
    "turn_count": 1,
    "is_player_turn": true
  }
}
```

**Errors:**
- `400` - Battle ID required
- `400` - Invalid action type
- `400` - Not your turn
- `403` - Not your battle
- `404` - Battle not found
- `500` - Failed to execute action

---

### 3. POST /api/battle/:battle_id/use_ability
**Use a class-specific ability**

**Request:**
```json
{
  "ability_id": "power_strike"
}
```

**Response:**
```json
{
  "success": true,
  "ability": "Power Strike",
  "mana_cost": 10,
  "cooldown": 2,
  "damage": 0,
  "statusEffects": [],
  "enemyHp": 0,
  "playerHp": 95,
  "turnResult": "Victory!",
  "isVictory": true,
  "combatLog": [
    "You used Power Strike! Dealt 12 damage!",
    "Victory! Goblin Scout defeated!",
    "You gained 25 XP and 10 gold!"
  ]
}
```

**Errors:**
- `400` - Battle ID and ability ID required
- `400` - Invalid ability for your class
- `400` - Not enough mana (from service)
- `400` - Ability on cooldown (from service)
- `403` - Not your battle
- `404` - Battle not found
- `500` - Failed to use ability

---

### 4. GET /api/battle/:battle_id/status
**Get current battle state**

**Response:**
```json
{
  "success": true,
  "battle_id": "battle-uuid",
  "player": {
    "hp": 95,
    "max_hp": 100,
    "mana": 40,
    "max_mana": 50,
    "status_effects": [
      {
        "id": "strength_buff",
        "name": "Strengthened",
        "emoji": "💪",
        "type": "buff",
        "description": "Attack increased by 50%",
        "attackMultiplier": 1.5,
        "duration": 3,
        "turnsRemaining": 2,
        "color": "#22c55e"
      }
    ]
  },
  "enemy": {
    "name": "Goblin Scout",
    "emoji": "👺",
    "hp": 3,
    "max_hp": 8,
    "status_effects": []
  },
  "turn_count": 2,
  "is_player_turn": true,
  "is_victory": false,
  "ended": null,
  "combat_log": [
    {
      "message": "Battle started against Goblin Scout!",
      "type": "system",
      "timestamp": 1234567890,
      "turn": 0
    }
  ],
  "ability_cooldowns": {
    "power_strike": 1
  },
  "abilities": [...]
}
```

**Errors:**
- `400` - Battle ID required
- `403` - Not your battle
- `404` - Battle not found

---

### 5. POST /api/battle/:battle_id/flee
**Attempt to flee from battle**

**Response:**
```json
{
  "success": true,
  "fled": true,
  "flee_chance": 0.65,
  "message": "Successfully fled from battle!"
}
```

**Or on failure:**
```json
{
  "success": true,
  "fled": false,
  "flee_chance": 0.45,
  "message": "Failed to flee!"
}
```

**Notes:**
- Flee chance is calculated based on speed difference
- Base chance: 50%
- Modified by: `baseChance + (playerSpeed - enemySpeed) * 0.05`
- Clamped between 20% and 90%
- Failed flee attempts result in enemy free attack

**Errors:**
- `400` - Battle ID required
- `400` - Not your turn
- `403` - Not your battle
- `404` - Battle not found

---

## Data Types

### Enemy Types (EnemyType enum)
```typescript
GOBLIN_SCOUT      // HP: 8,  ATK: 3,  DEF: 1,  SPD: 15  | XP: 25   | Gold: 10
SKELETON_WARRIOR  // HP: 15, ATK: 5,  DEF: 3,  SPD: 10  | XP: 50   | Gold: 20
SHADOW_ASSASSIN   // HP: 12, ATK: 8,  DEF: 2,  SPD: 20  | XP: 75   | Gold: 35
FIRE_ELEMENTAL    // HP: 20, ATK: 7,  DEF: 4,  SPD: 12  | XP: 100  | Gold: 50
ICE_WRAITH        // HP: 18, ATK: 6,  DEF: 5,  SPD: 14  | XP: 90   | Gold: 45
CORRUPTED_PALADIN // HP: 35, ATK: 10, DEF: 8,  SPD: 8   | XP: 200  | Gold: 100 (BOSS)
ANCIENT_DRAGON    // HP: 100, ATK: 15, DEF: 12, SPD: 10 | XP: 1000 | Gold: 500 (BOSS)
```

### Status Effects
```typescript
POISON         // Damage over time: 2 HP/turn for 3 turns
STUN           // Cannot act for 1 turn
BURN           // Fire damage: 3 HP/turn for 2 turns
FREEZE         // Cannot act, takes 1.5x damage for 1 turn
STRENGTH_BUFF  // Attack +50% for 3 turns
DEFENSE_BUFF   // Defense +50% for 3 turns
REGENERATION   // Heal 3 HP/turn for 3 turns
```

### Class Abilities

**WARRIOR**
- Power Strike: 150% damage, 10 mana, 2 turn cooldown
- Battle Cry: Strength buff, 15 mana, 4 turn cooldown
- Shield Wall: Defense buff, 15 mana, 4 turn cooldown

**MAGE**
- Fireball: 200% damage + burn (30% chance), 20 mana, 3 turn cooldown
- Ice Lance: 180% damage + freeze (50% chance), 18 mana, 3 turn cooldown
- Arcane Shield: Defense buff, 25 mana, 5 turn cooldown

**ROGUE**
- Backstab: 220% damage, 12 mana, 2 turn cooldown
- Poison Dagger: 120% damage + poison (80% chance), 15 mana, 3 turn cooldown
- Vanish: Dodge next attack, 20 mana, 5 turn cooldown

**PALADIN**
- Divine Smite: 180% damage, 18 mana, 3 turn cooldown
- Lay on Hands: Heal 20 HP, 25 mana, 4 turn cooldown
- Holy Aura: Regeneration buff, 20 mana, 5 turn cooldown

---

## Socket.IO Events

### Server -> Client Events

**battle_started**
```javascript
{
  player_id: "uuid",
  player_name: "Hero",
  enemy: "Goblin Scout",
  battle_id: "battle-uuid"
}
```

**battle_action**
```javascript
{
  battle_id: "uuid",
  player_name: "Hero",
  action_type: "attack",
  result: { ... }
}
```

**battle_ability_used**
```javascript
{
  battle_id: "uuid",
  player_name: "Hero",
  ability_name: "Power Strike",
  result: { ... }
}
```

**battle_flee_attempt**
```javascript
{
  battle_id: "uuid",
  player_name: "Hero",
  success: true
}
```

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

Common HTTP status codes:
- `400` - Bad request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized for this resource)
- `404` - Not found
- `500` - Internal server error

---

## Rate Limiting

**Battle Actions:** 3 requests per second
- Prevents battle action spam
- Applied to: `/action`, `/use_ability`, `/flee`

**Global API:** 500 requests per hour
- Applied to all `/api/*` endpoints

Rate limit headers:
- `X-RateLimit-Limit`: Request limit
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

---

## Combat Mechanics

### Turn Order
1. Calculated at battle start based on speed
2. Higher speed goes first
3. Alternates between player and enemy

### Damage Calculation
```
Base Damage = Attack + Random(0-2)
Modified Damage = Base * Ability Multiplier * Status Effect Multiplier
Final Damage = Max(1, Modified Damage - Defense)
```

### Status Effect Processing
1. Applied at end of player turn
2. Tick down at start of enemy turn
3. Effects removed when duration reaches 0
4. DoT/HoT effects apply before turn starts

### Cooldown System
- Cooldowns set when ability used
- Reduced by 1 at end of each turn
- Cannot use ability if cooldown > 0

### Victory/Defeat
- **Victory:** Enemy HP reaches 0
- **Defeat:** Player HP reaches 0
- Rewards calculated on victory
- Loot rolled with 50% chance per item

---

## Example Usage

### Starting a Battle
```javascript
const response = await fetch('/api/battle/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    enemy_type: 'SKELETON_WARRIOR'
  })
});

const data = await response.json();
console.log('Battle ID:', data.battle_id);
```

### Attacking
```javascript
const response = await fetch(`/api/battle/${battleId}/action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action_type: 'attack'
  })
});

const result = await response.json();
console.log('Damage dealt:', result.damage);
```

### Using Ability
```javascript
const response = await fetch(`/api/battle/${battleId}/use_ability`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    ability_id: 'power_strike'
  })
});

const result = await response.json();
if (result.isVictory) {
  console.log('Victory!');
}
```

### Getting Battle Status
```javascript
const response = await fetch(`/api/battle/${battleId}/status`);
const status = await response.json();
console.log('Player HP:', status.player.hp);
console.log('Enemy HP:', status.enemy.hp);
```

---

## Production Checklist

- [x] TypeScript type safety
- [x] Input validation on all endpoints
- [x] Rate limiting for battle actions
- [x] Session-based authentication
- [x] Battle state persistence
- [x] Automatic cleanup of old battles (30 min)
- [x] Socket.IO real-time updates
- [x] Comprehensive error handling
- [x] Combat log tracking
- [x] Status effect system
- [x] Ability cooldown management
- [x] Flee mechanics with probability
- [x] Boss enemy types
- [x] Class-specific abilities
- [x] Turn-based combat system

---

## Performance Notes

- Battles stored in-memory (use Redis for production scaling)
- Cleanup runs every 10 minutes
- Battles older than 30 minutes are removed
- Rate limiting prevents abuse
- Socket.IO broadcasts to game rooms only

---

## Security Features

- Session-based authentication required
- Player ownership verification
- Battle state isolation
- Rate limiting on all battle endpoints
- Input validation with TypeScript types
- CORS configuration
- CSRF token support (via main API)

---

## Future Enhancements

Potential additions for Phase 3:
- [ ] Multiplayer battles (PvP)
- [ ] Battle replay system
- [ ] Advanced AI for enemies
- [ ] Critical hit system
- [ ] Combo attack chains
- [ ] Equipment and stat modifiers
- [ ] Battle achievements
- [ ] Leaderboards
- [ ] Battle statistics tracking
- [ ] Persistent player inventory
