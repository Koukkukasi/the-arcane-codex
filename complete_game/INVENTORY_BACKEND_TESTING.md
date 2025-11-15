# Inventory System Backend - Testing Guide

## Overview

The complete inventory system backend has been implemented for The Arcane Codex. This guide provides testing instructions, API examples, and integration details.

---

## Files Created/Modified

### New Files:
1. **inventory_manager.py** - Core inventory management module
   - `InventoryManager` class
   - `create_starting_inventory()` function
   - Item management (add, remove, equip, unequip, use)

2. **inventory_endpoints.py** - API endpoint documentation
3. **add_inventory_endpoints.py** - Auto-integration script (already run)
4. **INVENTORY_BACKEND_TESTING.md** - This testing guide

### Modified Files:
1. **web_game.py** - Added 6 new inventory endpoints
2. **arcane_codex_server.py** - Added starting inventory to character creation

---

## System Architecture

### Inventory Manager (`inventory_manager.py`)

The `InventoryManager` class provides:
- **Item Management**: Add, remove, stack items
- **Equipment System**: Equip/unequip to slots (main_hand, off_hand, armor, etc.)
- **Consumables**: Use potions, food, scrolls
- **Weight/Capacity**: Track inventory weight and slot limits
- **Stat Calculation**: Apply/remove item stat bonuses

### API Endpoints (`web_game.py`)

All endpoints are rate-limited and include SocketIO events for real-time multiplayer updates.

#### 1. GET /api/inventory/all
Get complete inventory with equipped items and stats.

**Response:**
```json
{
  "items": [
    {
      "id": "iron_sword",
      "name": "Iron Sword",
      "type": "weapon",
      "description": "A reliable iron blade",
      "quantity": 1,
      "weight": 3.0,
      "value": 50,
      "rarity": "uncommon",
      "equipped": true,
      "slot": "main_hand",
      "stats": {"strength": 2, "attack": 4},
      "icon": "🗡️"
    }
  ],
  "equipped": {
    "main_hand": { /* item object */ }
  },
  "total_stats": {
    "attack": 4,
    "defense": 2,
    "magic": 0,
    "hp_bonus": 5
  },
  "gold": 50,
  "weight": 8.0,
  "max_weight": 100.0,
  "slots_used": 5,
  "slots_max": 48
}
```

#### 2. POST /api/inventory/equip
Equip an item to a slot.

**Request:**
```json
{
  "item_id": "iron_sword",
  "slot": "main_hand"
}
```

**Response:**
```json
{
  "success": true,
  "equipped": { /* new equipped item */ },
  "unequipped": { /* previously equipped item or null */ }
}
```

**Valid Slots:**
- `main_hand`, `off_hand` - Weapons
- `armor`, `chest` - Armor
- `helmet`, `head` - Helmets
- `gloves`, `hands` - Gloves
- `boots`, `feet` - Boots
- `accessory1`, `accessory2` - Accessories/rings

#### 3. POST /api/inventory/unequip
Unequip an item.

**Request:**
```json
{
  "item_id": "iron_sword"
}
```

**Response:**
```json
{
  "success": true,
  "item": { /* unequipped item */ }
}
```

#### 4. POST /api/inventory/use
Use a consumable item (potion, food, scroll).

**Request:**
```json
{
  "item_id": "health_potion"
}
```

**Response:**
```json
{
  "success": true,
  "effect": "healing",
  "value": 30,
  "message": "Restored 30 HP"
}
```

**Effect Types:**
- `healing` - Restores HP
- `mana` - Restores MP
- `stamina` - Restores stamina
- `buff` - Applies temporary buff
- `spell` - Casts a spell

#### 5. POST /api/inventory/drop
Drop an item from inventory.

**Request:**
```json
{
  "item_id": "bread",
  "quantity": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dropped 1 item(s)"
}
```

#### 6. POST /api/inventory/move
Move item between inventory slots.

**Request:**
```json
{
  "from_index": 0,
  "to_index": 5
}
```

**Response:**
```json
{
  "success": true
}
```

#### 7. POST /api/inventory/add
Add item to inventory (for loot/rewards).

**Request:**
```json
{
  "item_id": "health_potion",
  "quantity": 3
}
```

**Response:**
```json
{
  "success": true,
  "message": "Added 3x Health Potion",
  "item": { /* added item details */ }
}
```

---

## Starting Inventory System

Characters receive starting items based on their class:

### Fighter
- Iron Sword (weapon, +2 STR, +4 ATK)
- Leather Armor (armor, +1 CON, +2 DEF)
- 3x Health Potion
- 2x Bread

### Mage
- Apprentice Staff (weapon, +2 INT, +3 MAG)
- Mystic Robes (armor, +1 INT, +2 MAG)
- 3x Health Potion
- 2x Bread

### Thief
- Rusty Dagger (weapon, +1 DEX, +2 ATK)
- Leather Armor (armor, +1 DEX, +1 DEF)
- 3x Health Potion
- 2x Bread

### Cleric
- Simple Mace (weapon, +1 STR, +3 ATK)
- Wooden Shield (shield, +2 DEF)
- 3x Health Potion
- 2x Bread

---

## Testing Instructions

### 1. Test Inventory Manager Module

```bash
cd C:\Users\ilmiv\ProjectArgent\complete_game
python inventory_manager.py
```

**Expected Output:**
```
Testing Inventory Manager...

Starting items for Fighter: 4
  - Iron Sword x1
  - Leather Armor x1
  - Health Potion x3
  - Bread x2

Inventory: 4 items
Total weight: 11.6/100.0

Equip sword: True
Equipped items: ['main_hand']
Total stats: {'attack': 4, 'defense': 0, ...}

Use potion: {'success': True, 'effect': 'healing', ...}

Inventory Manager test complete!
```

### 2. Test API Endpoints with cURL

#### Get Inventory
```bash
curl -X GET http://localhost:5000/api/inventory/all \
  -H "Cookie: session=YOUR_SESSION_ID" \
  -H "Content-Type: application/json"
```

#### Equip Item
```bash
curl -X POST http://localhost:5000/api/inventory/equip \
  -H "Cookie: session=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{"item_id": "iron_sword", "slot": "main_hand"}'
```

#### Use Health Potion
```bash
curl -X POST http://localhost:5000/api/inventory/use \
  -H "Cookie: session=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{"item_id": "health_potion"}'
```

#### Add Test Items
```bash
curl -X POST http://localhost:5000/api/inventory/add \
  -H "Cookie: session=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{"item_id": "iron_sword", "quantity": 1}'
```

### 3. Test with Python Requests

```python
import requests

# Login and get session
session = requests.Session()
base_url = "http://localhost:5000"

# Get CSRF token
response = session.get(f"{base_url}/api/csrf-token")
csrf_token = response.json()['csrf_token']

# Set session (login first)
# ... your login logic ...

# Get inventory
response = session.get(f"{base_url}/api/inventory/all")
inventory = response.json()
print(f"Inventory: {len(inventory['items'])} items")
print(f"Gold: {inventory['gold']}")
print(f"Weight: {inventory['weight']}/{inventory['max_weight']}")

# Equip item
response = session.post(
    f"{base_url}/api/inventory/equip",
    json={"item_id": "iron_sword", "slot": "main_hand"},
    headers={"X-CSRFToken": csrf_token}
)
print(f"Equip result: {response.json()}")

# Use potion
response = session.post(
    f"{base_url}/api/inventory/use",
    json={"item_id": "health_potion"},
    headers={"X-CSRFToken": csrf_token}
)
print(f"Use result: {response.json()}")
```

### 4. Test SocketIO Events

The following events are emitted for real-time multiplayer updates:

- `item_equipped` - When a player equips an item
- `item_unequipped` - When a player unequips an item
- `item_used` - When a player uses a consumable
- `item_dropped` - When a player drops an item
- `item_added` - When an item is added to inventory (loot)

**Listen for events:**
```javascript
socket.on('item_equipped', (data) => {
    console.log(`${data.username} equipped ${data.item.name} to ${data.slot}`);
    // Update UI
});

socket.on('item_used', (data) => {
    console.log(`${data.username} used item: ${data.message}`);
    // Show effect animation
});
```

---

## Item Database

Available items in `inventory_system.py`:

### Weapons
- `rusty_sword` - Common, +2 ATK
- `iron_sword` - Uncommon, +4 ATK, +5% Crit
- `mage_staff` - Common, +3 MAG (Mage only)
- `shadow_dagger` - Rare, +5 ATK, +2 SPD, +15% Crit (Thief only)
- `divine_mace` - Epic, +6 ATK, +3 MAG (Cleric only)

### Armor
- `leather_armor` - Common, +2 DEF
- `iron_helmet` - Uncommon, +1 DEF, +5 HP
- `mage_robes` - Uncommon, +2 MAG, +1 DEF (Mage only)
- `wooden_shield` - Common, +1 DEF, 5% Damage Reduction

### Accessories
- `silver_ring` - Uncommon, +1 MAG
- `lucky_charm` - Rare, +10% Crit, +5% Dodge

### Consumables
- `health_potion` - Common, Restore 20 HP
- `mana_potion` - Common, Restore 10 MP
- `strength_elixir` - Uncommon, +3 ATK for 5 turns
- `smoke_bomb` - Uncommon, Guaranteed escape

### Materials
- `iron_ore` - Common, crafting material
- `monster_hide` - Uncommon, crafting material

---

## Integration Checklist

- [x] Created `inventory_manager.py` module
- [x] Added 6 inventory API endpoints to `web_game.py`
- [x] Integrated starting inventory into character creation
- [x] Added SocketIO events for real-time updates
- [x] Added `max_carry_weight` to Character class
- [x] Rate limiting on all endpoints (30-60 per minute)
- [x] CSRF protection on POST endpoints
- [x] Comprehensive error handling and logging
- [x] Created testing documentation

---

## Troubleshooting

### Issue: "Module 'inventory_manager' not found"
**Solution:** Ensure `inventory_manager.py` is in the same directory as `web_game.py`

### Issue: "Item not found in database"
**Solution:** Check the item ID matches one in `ItemDatabase._load_base_items()`

### Issue: "Inventory full or overweight"
**Solution:**
- Check current weight: `GET /api/inventory/all`
- Drop items: `POST /api/inventory/drop`
- Max capacity: 48 slots, 100.0 weight

### Issue: "Invalid slot for this item type"
**Solution:** Verify slot names match item type:
- Weapons: `main_hand`, `off_hand`
- Armor: `armor`, `chest`
- Accessories: `accessory1`, `accessory2`

### Issue: "Character has no inventory attribute"
**Solution:** Delete old save data and recreate character with Divine Interrogation

---

## Performance Notes

- All endpoints are rate-limited to prevent abuse
- Weight calculation is O(n) where n = number of items
- Equipped items are indexed by slot for O(1) lookup
- SocketIO events use room-based broadcasting for efficiency

---

## Next Steps

### Frontend Integration:
1. Create inventory UI component (see `INVENTORY_SYSTEM_ENHANCED.html`)
2. Connect UI to backend API endpoints
3. Add drag-and-drop functionality
4. Implement item tooltips and context menus

### Advanced Features:
1. Item crafting system
2. Trading between players
3. Item durability and repair
4. Enchantment system
5. Set bonuses (equip multiple items from same set)

---

## API Rate Limits

- `/api/inventory/equip` - 30 per minute
- `/api/inventory/unequip` - 30 per minute
- `/api/inventory/use` - 30 per minute
- `/api/inventory/drop` - 30 per minute
- `/api/inventory/move` - 60 per minute
- `/api/inventory/add` - 30 per minute
- `/api/inventory/all` - Unlimited (GET only)

---

## Support

For issues or questions:
1. Check server logs: `game.log`
2. Test with `python inventory_manager.py`
3. Verify endpoints with cURL or Postman
4. Check browser console for frontend errors

---

**Implementation Status:** COMPLETE ✓

All Phase I requirements implemented and ready for frontend integration.
