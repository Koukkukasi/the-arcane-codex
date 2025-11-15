# Inventory System - Quick Reference Card

## File Locations

```
C:\Users\ilmiv\ProjectArgent\complete_game\
├── inventory_manager.py              # Core module
├── web_game.py                       # API endpoints (lines 1720-2100)
├── arcane_codex_server.py            # Character creation (lines 697-712)
├── inventory_system.py               # Item database (existing)
├── test_inventory_api.py             # API testing
└── INVENTORY_BACKEND_TESTING.md     # Full documentation
```

## Quick Start

### 1. Test the Module
```bash
python inventory_manager.py
```

### 2. Start the Server
```bash
python web_game.py
```

### 3. Test the API
```bash
# After logging into game
python test_inventory_api.py
```

## API Endpoints

```
GET  /api/inventory/all        # Get full inventory
POST /api/inventory/equip      # Equip item
POST /api/inventory/unequip    # Unequip item
POST /api/inventory/use        # Use consumable
POST /api/inventory/drop       # Drop item
POST /api/inventory/move       # Move between slots
POST /api/inventory/add        # Add item (loot)
```

## Common Operations

### Get Inventory (JavaScript)
```javascript
fetch('/api/inventory/all')
    .then(r => r.json())
    .then(data => {
        console.log(`Items: ${data.items.length}`);
        console.log(`Gold: ${data.gold}`);
        console.log(`Weight: ${data.weight}/${data.max_weight}`);
    });
```

### Equip Item (JavaScript)
```javascript
fetch('/api/inventory/equip', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        item_id: 'iron_sword',
        slot: 'main_hand'
    })
}).then(r => r.json()).then(console.log);
```

### Use Potion (JavaScript)
```javascript
fetch('/api/inventory/use', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        item_id: 'health_potion'
    })
}).then(r => r.json()).then(data => {
    console.log(data.message); // "Restored 30 HP"
});
```

### Add Loot (JavaScript)
```javascript
fetch('/api/inventory/add', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
    },
    body: JSON.stringify({
        item_id: 'iron_sword',
        quantity: 1
    })
}).then(r => r.json()).then(console.log);
```

## SocketIO Events

### Listen for Events (JavaScript)
```javascript
socket.on('item_equipped', (data) => {
    console.log(`${data.username} equipped ${data.item.name}`);
});

socket.on('item_used', (data) => {
    console.log(data.message); // "Restored 30 HP"
});

socket.on('item_added', (data) => {
    console.log(`Got loot: ${data.item.name} x${data.quantity}`);
});
```

## Item Database IDs

### Weapons
- `rusty_sword`, `iron_sword`, `mage_staff`, `shadow_dagger`, `divine_mace`

### Armor
- `leather_armor`, `iron_helmet`, `mage_robes`, `wooden_shield`

### Consumables
- `health_potion`, `mana_potion`, `strength_elixir`, `smoke_bomb`

### Accessories
- `silver_ring`, `lucky_charm`

### Materials
- `iron_ore`, `monster_hide`

## Equipment Slots

```
main_hand     - Primary weapon
off_hand      - Secondary/shield
armor/chest   - Body armor
helmet/head   - Head armor
gloves/hands  - Hand armor
boots/feet    - Foot armor
accessory1    - Ring/amulet 1
accessory2    - Ring/amulet 2
```

## Starting Inventory by Class

### Fighter
- Iron Sword, Leather Armor, 3 Health Potions, 2 Bread

### Mage
- Apprentice Staff, Mystic Robes, 3 Health Potions, 2 Bread

### Thief
- Rusty Dagger, Leather Armor, 3 Health Potions, 2 Bread

### Cleric
- Simple Mace, Wooden Shield, 3 Health Potions, 2 Bread

## Python Usage

### Import InventoryManager
```python
from inventory_manager import InventoryManager, create_starting_inventory

# Create starting items
items = create_starting_inventory("Fighter")

# Manage inventory
inv_mgr = InventoryManager(character)
inv_mgr.add_item(item_dict, quantity=1)
inv_mgr.equip_item("iron_sword", "main_hand")
inv_mgr.use_item("health_potion")
```

### Character Integration
```python
from arcane_codex_server import ArcaneCodexGame

game = ArcaneCodexGame()
character = game.create_character("player1", "Hero")

# Starting inventory automatically added
print(len(character.inventory))  # 4 items for Fighter
```

## Troubleshooting

### "Not in game" error
- Ensure you have an active session (logged in)
- Check session cookies are sent with request

### "Item not found in database"
- Verify item ID matches exactly (case-sensitive)
- Check available IDs in `inventory_system.ItemDatabase`

### "Inventory full"
- Current limit: 48 slots
- Drop items or increase `max_slots`

### "Too heavy"
- Current limit: 100.0 weight
- Drop heavy items or increase `max_carry_weight`

## Rate Limits

- Most POST endpoints: 30 requests/minute
- /api/inventory/move: 60 requests/minute
- GET /api/inventory/all: Unlimited

## Status Codes

- `200` - Success
- `400` - Bad request (missing parameters)
- `404` - Not found (game/player/item)
- `429` - Rate limit exceeded
- `500` - Server error

## Testing Commands

```bash
# Test module
python inventory_manager.py

# Test API (must be in game)
python test_inventory_api.py

# Test specific endpoint
python test_inventory_api.py --test equip

# Custom server URL
python test_inventory_api.py --url http://yourserver:5000
```

## Log Files

```
game.log          # Server logs
```

Check logs for errors:
```bash
tail -f game.log | grep -i "inventory\|error"
```

## Complete Documentation

See `INVENTORY_BACKEND_TESTING.md` for:
- Full API documentation
- Request/response examples
- Advanced features
- Integration guide
- Performance notes

---

**Quick Help:** All inventory operations require an active game session!
