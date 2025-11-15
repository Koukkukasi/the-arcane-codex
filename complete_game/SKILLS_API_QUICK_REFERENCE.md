# Skills & Abilities API - Quick Reference

## Endpoints

### GET /api/skills/tree
Get complete skill tree for character's class

**Authentication**: Required (session cookie)

**Response**:
```json
{
  "success": true,
  "skill_tree": {
    "abilities": [
      {
        "id": "power_attack",
        "name": "Power Attack",
        "description": "A devastating strike dealing 150% damage",
        "type": "active",
        "category": "combat",
        "max_rank": 3,
        "current_rank": 1,
        "cost_type": "stamina",
        "cost": 15,
        "cooldown": 8.0,
        "damage": 150,
        "effects": {},
        "requirements": {"level": 3},
        "prerequisites": ["basic_combat"],
        "unlocked": true,
        "tier": 2,
        "icon": "💥",
        "lore": "Strike with the force of a falling star."
      }
    ],
    "skill_points": 5,
    "hotkeys": {1: "power_attack", 2: null, ...},
    "active_cooldowns": {"fireball": 3.5}
  }
}
```

---

### POST /api/skills/unlock
Unlock an ability (costs 1 skill point)

**Body**:
```json
{
  "ability_id": "basic_combat"
}
```

**Response**:
```json
{
  "success": true,
  "ability": {...},
  "remaining_skill_points": 4
}
```

**Errors**:
- "Ability not found"
- "Ability already unlocked"
- "Requirements not met"
- "Prerequisites not completed"
- "Not enough skill points"

---

### POST /api/skills/rankup
Increase ability rank (costs 1 skill point)

**Body**:
```json
{
  "ability_id": "power_attack"
}
```

**Response**:
```json
{
  "success": true,
  "ability": {...},
  "remaining_skill_points": 3
}
```

**Errors**:
- "Ability not unlocked"
- "Already max rank"
- "Not enough skill points"

---

### POST /api/skills/assign_hotkey
Assign ability to hotkey 1-8

**Body**:
```json
{
  "ability_id": "fireball",
  "hotkey": 2
}
```

**Response**:
```json
{
  "success": true,
  "hotkey": 2,
  "ability": {...}
}
```

**Errors**:
- "Invalid hotkey (1-8)"
- "Ability not unlocked"
- "Only active abilities can be assigned"

---

### POST /api/skills/use
Use an active ability

**Body**:
```json
{
  "ability_id": "power_attack",
  "target": "enemy_1"  // Optional
}
```

**Response**:
```json
{
  "success": true,
  "ability": {...},
  "result": {
    "ability_name": "Power Attack",
    "rank": 2,
    "damage": 187,
    "effects_applied": ["Dealt 187 damage"]
  },
  "cooldowns": {
    "power_attack": 8.0
  }
}
```

**Errors**:
- "Ability not unlocked"
- "Cannot use passive abilities"
- "Ability on cooldown (5.3s remaining)"
- "Not enough mana"
- "Not enough stamina"

**Side Effects**:
- Deducts cost (mana/stamina)
- Starts cooldown timer
- Broadcasts `ability_used` SocketIO event to all players

---

### GET /api/skills/cooldowns
Get active cooldowns with remaining time

**Response**:
```json
{
  "success": true,
  "cooldowns": {
    "power_attack": 5.3,
    "fireball": 2.1
  }
}
```

---

### POST /api/character/level_up
Level up character (grants +2 skill points)

**Response**:
```json
{
  "success": true,
  "level": 6,
  "skill_points": 13,
  "hp_max": 130,
  "mana_max": 85
}
```

**Side Effects**:
- Increases level by 1
- Grants +2 skill points
- Increases HP max by 10
- Increases Mana max by 5
- Full heals HP and mana
- Broadcasts `level_up` SocketIO event

---

## SocketIO Events

### Received by Client

**ability_used**
```javascript
{
  username: "PlayerName",
  ability: "Fireball",
  result: {
    ability_name: "Fireball",
    rank: 3,
    damage: 375,
    effects_applied: ["Dealt 375 damage"]
  }
}
```

**level_up**
```javascript
{
  username: "PlayerName",
  new_level: 5,
  skill_points_gained: 2,
  total_skill_points: 11
}
```

---

## Frontend Integration Examples

### Load Skill Tree

```javascript
async function loadSkillTree() {
  const response = await fetch('/api/skills/tree', {
    credentials: 'include'
  });

  const data = await response.json();

  if (data.success) {
    displayAbilities(data.skill_tree.abilities);
    updateSkillPoints(data.skill_tree.skill_points);
    updateHotkeys(data.skill_tree.hotkeys);
    updateCooldowns(data.skill_tree.active_cooldowns);
  }
}
```

### Unlock Ability

```javascript
async function unlockAbility(abilityId) {
  const response = await fetch('/api/skills/unlock', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({ability_id: abilityId})
  });

  const result = await response.json();

  if (result.success) {
    updateSkillPoints(result.remaining_skill_points);
    markAbilityUnlocked(result.ability);
    showNotification(`Unlocked ${result.ability.name}!`);
  } else {
    showError(result.error);
  }
}
```

### Use Ability (Hotkey)

```javascript
// Keyboard event handler
document.addEventListener('keydown', (e) => {
  const hotkey = parseInt(e.key);

  if (hotkey >= 1 && hotkey <= 8) {
    useAbilityHotkey(hotkey);
  }
});

async function useAbilityHotkey(hotkey) {
  // Get ability ID from hotkey mapping
  const abilityId = hotkeys[hotkey];

  if (!abilityId) {
    showError('No ability assigned to this hotkey');
    return;
  }

  const response = await fetch('/api/skills/use', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify({ability_id: abilityId})
  });

  const result = await response.json();

  if (result.success) {
    displayAbilityEffect(result.result);
    startCooldownAnimation(abilityId, result.cooldowns[abilityId]);
  } else {
    showError(result.error);
  }
}
```

### Cooldown Animation

```javascript
function startCooldownAnimation(abilityId, duration) {
  const button = document.querySelector(`[data-ability="${abilityId}"]`);
  const overlay = button.querySelector('.cooldown-overlay');

  overlay.style.display = 'block';

  let remaining = duration;
  const interval = setInterval(() => {
    remaining -= 0.1;

    if (remaining <= 0) {
      clearInterval(interval);
      overlay.style.display = 'none';
    } else {
      const percent = (remaining / duration) * 100;
      overlay.style.height = `${percent}%`;
      overlay.querySelector('.cooldown-text').textContent = `${remaining.toFixed(1)}s`;
    }
  }, 100);
}
```

### Real-Time Updates

```javascript
// Initialize SocketIO
const socket = io();

// Join game room
socket.emit('join_game', {game_code: gameCode});

// Listen for ability usage
socket.on('ability_used', (data) => {
  // Show combat log
  addCombatLog(`${data.username} used ${data.ability}!`);

  // Display effect animation
  displayAbilityEffect(data.result);
});

// Listen for level ups
socket.on('level_up', (data) => {
  if (data.username === currentUsername) {
    // Show celebration
    showLevelUpCelebration(data.new_level);

    // Update skill points
    updateSkillPoints(data.total_skill_points);

    // Pulse skill tree button
    pulseSkillTreeButton();
  } else {
    addCombatLog(`${data.username} reached level ${data.new_level}!`);
  }
});
```

---

## Character Classes & Their Abilities

### Fighter
- Basic Combat (passive)
- Power Attack, Shield Bash, Weapon Mastery
- Whirlwind, Defensive Stance
- Berserker Rage
- Battle Trance (ultimate)

### Mage
- Arcane Fundamentals (passive)
- Fireball, Lightning Bolt, Mana Shield
- Spell Weaving, Ice Wall
- Arcane Explosion
- Meteor Strike (ultimate)

### Thief
- Stealth Basics (passive)
- Backstab, Poison Blade

### Ranger
- Hunter's Mark
- Rapid Fire, Beast Companion

### Cleric
- Divine Basics (passive)
- Healing Light, Divine Protection
- Resurrection (ultimate)

### Bard
- Inspiring Presence (passive)
- Battle Song, Healing Melody

---

## Ability Types

**active**: Must be manually activated, costs resources, has cooldown
**passive**: Always active once unlocked, no activation needed
**toggle**: Can be turned on/off, costs resources while active

---

## Cost Types

**mana**: Uses character.mana (or character.mp)
**stamina**: Uses character.stamina
**none**: Free to use

---

## Rank Scaling Formula

- **Damage**: base * (1 + (rank - 1) * 0.25)
  - Rank 1: 100% damage
  - Rank 2: 125% damage
  - Rank 3: 150% damage
  - Rank 5: 200% damage

- **Effects**: base * (1 + (rank - 1) * 0.2)
  - Rank 1: 100% effect
  - Rank 2: 120% effect
  - Rank 3: 140% effect
  - Rank 5: 180% effect

---

## Rate Limits

- GET /api/skills/tree: 100/minute
- POST /api/skills/unlock: 30/minute
- POST /api/skills/rankup: 30/minute
- POST /api/skills/assign_hotkey: 30/minute
- POST /api/skills/use: 60/minute
- GET /api/skills/cooldowns: 100/minute
- POST /api/character/level_up: 10/minute

---

## Error Handling Best Practices

```javascript
async function safeApiCall(endpoint, options = {}) {
  try {
    const response = await fetch(endpoint, {
      credentials: 'include',
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    if (!data.success) {
      throw new Error(data.error || 'Operation failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    showError(error.message);
    return null;
  }
}

// Usage
const result = await safeApiCall('/api/skills/unlock', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({ability_id: 'fireball'})
});

if (result) {
  // Success
  updateSkillPoints(result.remaining_skill_points);
}
```

---

## Development Workflow

1. **Character Creation** → 3 starting skill points
2. **Open Skills UI** → GET /api/skills/tree
3. **Unlock Abilities** → POST /api/skills/unlock
4. **Rank Up** → POST /api/skills/rankup
5. **Assign Hotkeys** → POST /api/skills/assign_hotkey
6. **Use in Combat** → POST /api/skills/use (keyboard 1-8)
7. **Gain XP** → POST /api/character/level_up → +2 skill points
8. **Repeat** steps 3-7

---

## Common Pitfalls

1. **Forgetting to check unlocked status**
   - Always check `ability.unlocked === true` before allowing usage

2. **Not handling cooldowns client-side**
   - Cache cooldown data and disable buttons locally

3. **Ignoring prerequisites**
   - Display locked abilities with requirement tooltips

4. **Not syncing mana/mp**
   - `character.mp` is an alias for `character.mana`, keep them equal

5. **Forgetting real-time updates**
   - Always listen to SocketIO events for multiplayer sync

---

## Testing Checklist

- [ ] Unlock ability with sufficient skill points
- [ ] Try to unlock with insufficient points (should fail)
- [ ] Rank up ability to max rank
- [ ] Try to rank up beyond max (should fail)
- [ ] Assign active ability to hotkey
- [ ] Try to assign passive ability to hotkey (should fail)
- [ ] Use ability with sufficient resources
- [ ] Try to use with insufficient mana/stamina (should fail)
- [ ] Use ability, wait for cooldown
- [ ] Try to use before cooldown expires (should fail)
- [ ] Level up, verify +2 skill points granted
- [ ] Verify SocketIO events broadcast to all players
- [ ] Test with all 6 character classes

---

## Quick Reference: All Endpoints

```
GET    /api/skills/tree           → Get skill tree
POST   /api/skills/unlock         → Unlock ability
POST   /api/skills/rankup         → Rank up ability
POST   /api/skills/assign_hotkey  → Assign to hotkey 1-8
POST   /api/skills/use            → Use active ability
GET    /api/skills/cooldowns      → Get cooldowns
POST   /api/character/level_up    → Level up (+2 points)
```
