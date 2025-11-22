# Battle System - Quick Start Guide

Production-ready battle endpoints for Phase 2 of The Arcane Codex.

## Quick Links

- **Full API Documentation:** [BATTLE_API.md](./BATTLE_API.md)
- **Server Location:** `C:\Users\ilmiv\ProjectArgent\arcane_codex_ts\src\routes\api.ts`
- **Battle Service:** `C:\Users\ilmiv\ProjectArgent\arcane_codex_ts\src\services\battle.ts`
- **Type Definitions:** `C:\Users\ilmiv\ProjectArgent\arcane_codex_ts\src\types\battle.ts`

---

## Starting the Server

```bash
cd C:\Users\ilmiv\ProjectArgent\arcane_codex_ts
npm run dev
```

Server runs on: `http://localhost:5000`

---

## 5 Core Endpoints

### 1. Start Battle
```bash
POST http://localhost:5000/api/battle/start
Content-Type: application/json

{
  "enemy_type": "GOBLIN_SCOUT"
}
```

Returns: `battle_id`, `player`, `enemy`, `turn_order`, `abilities`

---

### 2. Execute Action
```bash
POST http://localhost:5000/api/battle/:battle_id/action
Content-Type: application/json

{
  "action_type": "attack"  # or "defend" or "ability"
}
```

Returns: `damage`, `enemyHp`, `playerHp`, `turnResult`, `combatLog`

---

### 3. Use Ability
```bash
POST http://localhost:5000/api/battle/:battle_id/use_ability
Content-Type: application/json

{
  "ability_id": "power_strike"
}
```

Returns: Same as action + `ability`, `mana_cost`, `cooldown`

---

### 4. Get Status
```bash
GET http://localhost:5000/api/battle/:battle_id/status
```

Returns: Full battle state, player/enemy stats, combat log, cooldowns

---

### 5. Flee Battle
```bash
POST http://localhost:5000/api/battle/:battle_id/flee
```

Returns: `fled` (boolean), `flee_chance` (0-1)

---

## Enemy Types

```
GOBLIN_SCOUT       - Easy   (HP: 8)
SKELETON_WARRIOR   - Easy   (HP: 15)
SHADOW_ASSASSIN    - Medium (HP: 12, high damage)
FIRE_ELEMENTAL     - Medium (HP: 20, resistances)
ICE_WRAITH         - Medium (HP: 18)
CORRUPTED_PALADIN  - Hard   (HP: 35) BOSS
ANCIENT_DRAGON     - Extreme (HP: 100) BOSS
```

---

## Class Abilities

### Warrior
- `power_strike` - 150% damage
- `battle_cry` - +50% attack buff
- `shield_wall` - +50% defense buff

### Mage
- `fireball` - 200% damage + burn
- `ice_lance` - 180% damage + freeze
- `arcane_shield` - defense buff

### Rogue
- `backstab` - 220% damage
- `poison_dagger` - 120% damage + poison
- `vanish` - dodge next attack

### Paladin
- `divine_smite` - 180% damage
- `lay_on_hands` - heal 20 HP
- `holy_aura` - regeneration buff

---

## Testing with cURL

### Start a Battle
```bash
curl -X POST http://localhost:5000/api/battle/start \
  -H "Content-Type: application/json" \
  -d '{"enemy_type":"GOBLIN_SCOUT"}' \
  -c cookies.txt -b cookies.txt
```

### Attack
```bash
curl -X POST http://localhost:5000/api/battle/BATTLE_ID_HERE/action \
  -H "Content-Type: application/json" \
  -d '{"action_type":"attack"}' \
  -b cookies.txt
```

### Use Ability
```bash
curl -X POST http://localhost:5000/api/battle/BATTLE_ID_HERE/use_ability \
  -H "Content-Type: application/json" \
  -d '{"ability_id":"power_strike"}' \
  -b cookies.txt
```

---

## Code Examples

### JavaScript/Fetch
```javascript
// Start battle
const battle = await fetch('http://localhost:5000/api/battle/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ enemy_type: 'SKELETON_WARRIOR' })
}).then(r => r.json());

const battleId = battle.battle_id;

// Attack
const result = await fetch(`http://localhost:5000/api/battle/${battleId}/action`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ action_type: 'attack' })
}).then(r => r.json());

console.log('Damage:', result.damage);
console.log('Enemy HP:', result.enemyHp);

// Use ability
const abilityResult = await fetch(`http://localhost:5000/api/battle/${battleId}/use_ability`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ ability_id: 'power_strike' })
}).then(r => r.json());

if (abilityResult.isVictory) {
  console.log('Victory!');
}
```

---

## Socket.IO Integration

Listen for real-time battle events:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Join game room
socket.emit('join_game', {
  game_code: 'ABC123',
  player_name: 'Hero'
});

// Listen for battle events
socket.on('battle_started', (data) => {
  console.log('Battle started:', data.enemy);
});

socket.on('battle_action', (data) => {
  console.log('Player action:', data.action_type);
  console.log('Result:', data.result);
});

socket.on('battle_ability_used', (data) => {
  console.log('Ability used:', data.ability_name);
});

socket.on('battle_flee_attempt', (data) => {
  console.log('Flee attempt:', data.success ? 'Success' : 'Failed');
});
```

---

## TypeScript Types

All types are exported from `src/types/battle.ts`:

```typescript
import {
  BattleState,
  BattlePlayer,
  BattleEnemy,
  BattleAbility,
  StatusEffect,
  EnemyType
} from './types/battle';
```

---

## File Structure

```
arcane_codex_ts/
├── src/
│   ├── routes/
│   │   └── api.ts              # Battle endpoints (lines 654-1106)
│   ├── services/
│   │   └── battle.ts           # Battle logic & state management
│   ├── types/
│   │   └── battle.ts           # TypeScript type definitions
│   └── server.ts               # Server with battle cleanup
├── BATTLE_API.md               # Full API documentation
├── BATTLE_QUICK_START.md       # This file
└── test_battle_api.js          # Test script
```

---

## Rate Limiting

- **Battle Actions:** 3 requests/second
- **General API:** 500 requests/hour
- **Battle Cleanup:** Every 10 minutes (removes battles >30min old)

---

## Common Errors

### "Already in a battle"
- Player can only have one active battle at a time
- Complete or flee current battle first
- Or use the returned `battle_id` to continue

### "Not your turn"
- Wait for enemy turn to complete
- Check `is_player_turn` in status endpoint

### "Ability on cooldown"
- Check `ability_cooldowns` in status
- Wait for cooldown to reach 0

### "Not enough mana"
- Check `player.currentMana` vs `ability.manaCost`
- Abilities cost: 10-25 mana
- Mana doesn't regenerate during battle (Phase 2)

---

## Production Checklist

Before deploying:
- [ ] Set proper CORS origins in `server.ts`
- [ ] Change session secret in production
- [ ] Use Redis for battle state (replace Map)
- [ ] Add proper logging (Winston/Pino)
- [ ] Enable HTTPS
- [ ] Set up monitoring alerts
- [ ] Configure rate limits for production load
- [ ] Add database persistence for rewards

---

## Next Steps

1. **Test the endpoints** using cURL or Postman
2. **Integrate with frontend** battle UI
3. **Add Socket.IO listeners** for real-time updates
4. **Customize player stats** based on character progression
5. **Add more enemies** to enemy database
6. **Extend abilities** for each class

---

## Support

For issues or questions:
- Check [BATTLE_API.md](./BATTLE_API.md) for full documentation
- Review code comments in `src/services/battle.ts`
- Test with `test_battle_api.js`

---

**Server:** `http://localhost:5000`
**API Base:** `http://localhost:5000/api`
**Health Check:** `http://localhost:5000/health`
