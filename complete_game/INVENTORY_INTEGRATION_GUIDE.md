# Inventory System - Backend Integration Guide

## Quick Start: Connecting Frontend to Backend

This guide shows how to integrate the enhanced inventory UI with the existing Python backend.

---

## Backend API Endpoints (Already Exist)

The Python backend (`inventory_system.py`) already has the core logic. We just need to expose it via web endpoints.

### Add to `web_game.py`:

```python
from inventory_system import Inventory, ItemDatabase, LootTable
import json

# Global instances (in production, use session-based storage)
inventories = {}  # player_id -> Inventory
item_db = ItemDatabase()
loot_table = LootTable()

# ====================================
# INVENTORY API ENDPOINTS
# ====================================

@app.route('/api/inventory/all', methods=['GET'])
def get_inventory():
    """Get player's complete inventory"""
    player_id = request.args.get('player_id', 'default')

    if player_id not in inventories:
        inventories[player_id] = Inventory(capacity=48)

    inventory = inventories[player_id]

    return jsonify({
        'success': True,
        'gold': inventory.gold,
        'capacity': inventory.capacity,
        'weight': len([s for s in inventory.slots if s.item]) * 5,  # Simplified weight
        'max_weight': 100,
        'items': [
            {
                'slot_index': i,
                'item': serialize_item(slot.item) if slot.item else None,
                'quantity': slot.quantity
            }
            for i, slot in enumerate(inventory.slots)
        ],
        'equipped': {
            slot_name: serialize_item(item) if item else None
            for slot_name, item in inventory.equipped.items()
        },
        'stats': serialize_stats(inventory.get_total_stats())
    })

@app.route('/api/inventory/equip', methods=['POST'])
def equip_item():
    """Equip an item from inventory"""
    data = request.json
    player_id = data.get('player_id', 'default')
    item_id = data.get('item_id')
    slot = data.get('slot')

    if player_id not in inventories:
        return jsonify({'success': False, 'error': 'Inventory not found'}), 404

    inventory = inventories[player_id]

    # Find item in inventory
    item = None
    for inv_slot in inventory.slots:
        if inv_slot.item and inv_slot.item.id == item_id:
            item = inv_slot.item
            break

    if not item:
        return jsonify({'success': False, 'error': 'Item not found'}), 404

    # Equip the item
    previously_equipped = inventory.equip_item(item)

    return jsonify({
        'success': True,
        'equipped_item': serialize_item(item),
        'unequipped_item': serialize_item(previously_equipped) if previously_equipped else None,
        'stats': serialize_stats(inventory.get_total_stats())
    })

@app.route('/api/inventory/unequip', methods=['POST'])
def unequip_item():
    """Unequip an item to inventory"""
    data = request.json
    player_id = data.get('player_id', 'default')
    slot = data.get('slot')

    if player_id not in inventories:
        return jsonify({'success': False, 'error': 'Inventory not found'}), 404

    inventory = inventories[player_id]
    success = inventory.unequip_item(slot)

    return jsonify({
        'success': success,
        'stats': serialize_stats(inventory.get_total_stats()) if success else None
    })

@app.route('/api/inventory/use', methods=['POST'])
def use_item():
    """Use a consumable item"""
    data = request.json
    player_id = data.get('player_id', 'default')
    item_id = data.get('item_id')

    if player_id not in inventories:
        return jsonify({'success': False, 'error': 'Inventory not found'}), 404

    inventory = inventories[player_id]
    effect = inventory.use_consumable(item_id)

    if effect:
        return jsonify({
            'success': True,
            'effect': effect,
            'message': f'Used item: {effect["type"]} for {effect["value"]}'
        })
    else:
        return jsonify({'success': False, 'error': 'Cannot use item'}), 400

@app.route('/api/inventory/drop', methods=['POST'])
def drop_item():
    """Drop an item from inventory"""
    data = request.json
    player_id = data.get('player_id', 'default')
    item_id = data.get('item_id')
    quantity = data.get('quantity', 1)

    if player_id not in inventories:
        return jsonify({'success': False, 'error': 'Inventory not found'}), 404

    inventory = inventories[player_id]
    success = inventory.remove_item(item_id, quantity)

    return jsonify({
        'success': success,
        'message': f'Dropped {quantity} item(s)' if success else 'Failed to drop item'
    })

@app.route('/api/inventory/add', methods=['POST'])
def add_item():
    """Add an item to inventory (for testing/loot)"""
    data = request.json
    player_id = data.get('player_id', 'default')
    item_id = data.get('item_id')
    quantity = data.get('quantity', 1)

    if player_id not in inventories:
        inventories[player_id] = Inventory(capacity=48)

    inventory = inventories[player_id]
    item = item_db.get_item(item_id)

    if not item:
        return jsonify({'success': False, 'error': 'Item not found in database'}), 404

    success = inventory.add_item(item, quantity)

    return jsonify({
        'success': success,
        'message': f'Added {quantity}x {item.name}' if success else 'Inventory full',
        'item': serialize_item(item)
    })

@app.route('/api/inventory/move', methods=['POST'])
def move_item():
    """Move item between inventory slots"""
    data = request.json
    player_id = data.get('player_id', 'default')
    from_slot = data.get('from_slot')
    to_slot = data.get('to_slot')

    if player_id not in inventories:
        return jsonify({'success': False, 'error': 'Inventory not found'}), 404

    inventory = inventories[player_id]

    # Swap items in slots
    if from_slot < len(inventory.slots) and to_slot < len(inventory.slots):
        temp = inventory.slots[from_slot].item
        temp_qty = inventory.slots[from_slot].quantity

        inventory.slots[from_slot].item = inventory.slots[to_slot].item
        inventory.slots[from_slot].quantity = inventory.slots[to_slot].quantity

        inventory.slots[to_slot].item = temp
        inventory.slots[to_slot].quantity = temp_qty

        return jsonify({'success': True})

    return jsonify({'success': False, 'error': 'Invalid slot indices'}), 400

@app.route('/api/inventory/loot', methods=['POST'])
def generate_loot():
    """Generate loot from defeated enemy"""
    data = request.json
    player_id = data.get('player_id', 'default')
    enemy_type = data.get('enemy_type', 'goblin')
    level = data.get('level', 1)

    if player_id not in inventories:
        inventories[player_id] = Inventory(capacity=48)

    inventory = inventories[player_id]
    loot = loot_table.generate_loot(enemy_type, level)

    # Add gold
    inventory.gold += loot['gold']

    # Add items
    added_items = []
    for item_data in loot['items']:
        item = item_data['item']
        quantity = item_data['quantity']
        if inventory.add_item(item, quantity):
            added_items.append({
                'item': serialize_item(item),
                'quantity': quantity
            })

    return jsonify({
        'success': True,
        'gold': loot['gold'],
        'items': added_items,
        'total_gold': inventory.gold
    })

# ====================================
# HELPER FUNCTIONS
# ====================================

def serialize_item(item):
    """Convert Item object to JSON-serializable dict"""
    if not item:
        return None

    return {
        'id': item.id,
        'name': item.name,
        'description': item.description,
        'type': item.type.value,
        'rarity': item.rarity.value,
        'value': item.value,
        'icon': item.icon,
        'stackable': item.stackable,
        'max_stack': item.max_stack,
        'level_requirement': item.level_requirement,
        'class_requirement': item.class_requirement,
        'stats': {
            'attack': item.stats.attack,
            'defense': item.stats.defense,
            'magic': item.stats.magic,
            'speed': item.stats.speed,
            'hp_bonus': item.stats.hp_bonus,
            'critical_chance': item.stats.critical_chance,
            'dodge_chance': item.stats.dodge_chance,
            'damage_reduction': item.stats.damage_reduction
        } if hasattr(item, 'stats') else None,
        'effects': item.effects if hasattr(item, 'effects') else {},
        'slot': item.slot if hasattr(item, 'slot') else None
    }

def serialize_stats(stats):
    """Convert ItemStats to dict"""
    return {
        'attack': stats.attack,
        'defense': stats.defense,
        'magic': stats.magic,
        'speed': stats.speed,
        'hp_bonus': stats.hp_bonus,
        'critical_chance': stats.critical_chance,
        'dodge_chance': stats.dodge_chance,
        'damage_reduction': stats.damage_reduction
    }
```

---

## Frontend Integration

### 1. Update HTML to Include Inventory System

In `templates/game.html` or `static/arcane_codex_scenario_ui_enhanced.html`:

```html
<!-- Add before </body> -->
<link rel="stylesheet" href="/static/inventory/inventory_system.css">

<!-- Inventory Overlay (copy from INVENTORY_SYSTEM_ENHANCED.html) -->
<div id="inventory-overlay">
    <!-- ... full inventory HTML ... -->
</div>

<script src="/static/inventory/inventory_system.js"></script>
```

### 2. Create `inventory_system.js`

```javascript
class InventoryManager {
    constructor() {
        this.playerId = 'default'; // Get from session
        this.items = [];
        this.equipped = {};
        this.stats = {};
        this.isOpen = false;

        this.initElements();
        this.attachListeners();
    }

    initElements() {
        this.overlay = document.getElementById('inventory-overlay');
        this.grid = document.getElementById('inventory-grid');
        this.equipmentSlots = document.getElementById('equipment-slots');
        this.goldDisplay = document.getElementById('gold-amount');
        this.weightBar = document.getElementById('weight-fill');
        this.weightAmount = document.getElementById('weight-amount');
    }

    attachListeners() {
        // Keyboard shortcut
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'i' && !e.target.matches('input, textarea')) {
                this.toggle();
            }
        });

        // Close button
        this.overlay.querySelector('.close-btn').addEventListener('click', () => {
            this.close();
        });

        // Backdrop click
        this.overlay.querySelector('.overlay-backdrop').addEventListener('click', () => {
            this.close();
        });
    }

    async open() {
        this.isOpen = true;
        this.overlay.classList.add('active');
        await this.loadInventory();
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.remove('active');
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    async loadInventory() {
        try {
            const response = await fetch(`/api/inventory/all?player_id=${this.playerId}`);
            const data = await response.json();

            if (data.success) {
                this.items = data.items;
                this.equipped = data.equipped;
                this.stats = data.stats;

                this.updateGold(data.gold);
                this.updateWeight(data.weight, data.max_weight);
                this.renderInventory();
                this.renderEquipment();
                this.renderStats();
            }
        } catch (error) {
            console.error('Failed to load inventory:', error);
            this.showError('Failed to load inventory');
        }
    }

    renderInventory() {
        this.grid.innerHTML = '';

        // Create all 48 slots
        for (let i = 0; i < 48; i++) {
            const slotData = this.items.find(item => item.slot_index === i);
            const slot = this.createInventorySlot(i, slotData);
            this.grid.appendChild(slot);
        }
    }

    createInventorySlot(index, data) {
        const slot = document.createElement('div');
        slot.className = 'inventory-slot';
        slot.dataset.slotId = index;

        if (data && data.item) {
            const item = data.item;
            slot.innerHTML = `
                <div class="grid-item"
                     draggable="true"
                     data-item-id="${item.id}"
                     data-slot-index="${index}">
                    <div class="item-icon">${item.icon}</div>
                    ${data.quantity > 1 ? `<div class="item-quantity">${data.quantity}</div>` : ''}
                    <div class="item-rarity-border rarity-${item.rarity}"></div>
                </div>
            `;

            const gridItem = slot.querySelector('.grid-item');
            this.attachItemListeners(gridItem, item, index);
        }

        return slot;
    }

    attachItemListeners(element, item, slotIndex) {
        // Hover tooltip
        element.addEventListener('mouseenter', (e) => this.showTooltip(e, item));
        element.addEventListener('mouseleave', () => this.hideTooltip());

        // Context menu
        element.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, item, slotIndex);
        });

        // Double-click to use/equip
        element.addEventListener('dblclick', () => this.handleItemAction(item));

        // Drag and drop
        element.addEventListener('dragstart', (e) => this.handleDragStart(e, item, slotIndex));
        element.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }

    async handleItemAction(item) {
        if (item.type === 'consumable') {
            await this.useItem(item.id);
        } else if (['weapon', 'armor', 'accessory'].includes(item.type)) {
            await this.equipItem(item.id, item.slot);
        }
    }

    async equipItem(itemId, slot) {
        try {
            const response = await fetch('/api/inventory/equip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: this.playerId,
                    item_id: itemId,
                    slot: slot
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Item equipped!', 'success');
                await this.loadInventory(); // Refresh
            }
        } catch (error) {
            console.error('Failed to equip item:', error);
            this.showError('Failed to equip item');
        }
    }

    async useItem(itemId) {
        try {
            const response = await fetch('/api/inventory/use', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: this.playerId,
                    item_id: itemId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                await this.loadInventory(); // Refresh
            }
        } catch (error) {
            console.error('Failed to use item:', error);
            this.showError('Failed to use item');
        }
    }

    async dropItem(itemId, quantity = 1) {
        if (!confirm(`Drop ${quantity} item(s)?`)) return;

        try {
            const response = await fetch('/api/inventory/drop', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player_id: this.playerId,
                    item_id: itemId,
                    quantity: quantity
                })
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification('Item dropped', 'warning');
                await this.loadInventory();
            }
        } catch (error) {
            console.error('Failed to drop item:', error);
        }
    }

    handleDragStart(e, item, slotIndex) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('item_id', item.id);
        e.dataTransfer.setData('from_slot', slotIndex);

        e.target.classList.add('dragging');
        this.highlightDropZones(item.type);
    }

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.clearDropZones();
    }

    highlightDropZones(itemType) {
        // Highlight all inventory slots
        document.querySelectorAll('.inventory-slot').forEach(slot => {
            slot.classList.add('drop-target');
        });

        // Highlight appropriate equipment slots
        const validSlots = this.getValidEquipmentSlots(itemType);
        validSlots.forEach(slot => {
            slot.classList.add('drop-target');
        });
    }

    clearDropZones() {
        document.querySelectorAll('.drop-target').forEach(slot => {
            slot.classList.remove('drop-target');
        });
    }

    getValidEquipmentSlots(itemType) {
        const slotMap = {
            'weapon': ['main-hand', 'off-hand'],
            'armor': ['head', 'chest', 'legs', 'feet', 'hands', 'shield'],
            'accessory': ['accessory-1', 'accessory-2']
        };

        const validSlotTypes = slotMap[itemType] || [];
        return Array.from(document.querySelectorAll('.slot-item'))
            .filter(slot => validSlotTypes.includes(slot.dataset.slotType));
    }

    showTooltip(e, item) {
        const tooltip = document.getElementById('item-tooltip');
        // Update tooltip content
        tooltip.querySelector('.tooltip-name').textContent = `${item.icon} ${item.name}`;
        tooltip.querySelector('.tooltip-type').textContent = `${item.type} • ${item.rarity}`;

        const rarityBadge = tooltip.querySelector('.tooltip-rarity');
        rarityBadge.textContent = item.rarity.toUpperCase();
        rarityBadge.style.background = `var(--rarity-${item.rarity})`;

        // Position tooltip
        const rect = e.target.getBoundingClientRect();
        tooltip.style.left = `${rect.right + 10}px`;
        tooltip.style.top = `${rect.top}px`;

        tooltip.classList.add('visible');
    }

    hideTooltip() {
        document.getElementById('item-tooltip').classList.remove('visible');
    }

    showContextMenu(e, item, slotIndex) {
        const menu = document.getElementById('context-menu');

        menu.style.left = `${e.pageX}px`;
        menu.style.top = `${e.pageY}px`;
        menu.classList.add('visible');

        // Update menu items based on item type
        const equipBtn = menu.querySelector('[data-action="equip"]');
        const useBtn = menu.querySelector('[data-action="use"]');

        if (item.type === 'consumable') {
            equipBtn.classList.add('disabled');
            useBtn.classList.remove('disabled');
        } else if (['weapon', 'armor', 'accessory'].includes(item.type)) {
            equipBtn.classList.remove('disabled');
            useBtn.classList.add('disabled');
        }

        // Attach handlers
        menu.querySelectorAll('.context-menu-item:not(.disabled)').forEach(menuItem => {
            menuItem.onclick = (e) => {
                e.stopPropagation();
                this.handleContextAction(menuItem.dataset.action, item, slotIndex);
                menu.classList.remove('visible');
            };
        });
    }

    handleContextAction(action, item, slotIndex) {
        switch (action) {
            case 'equip':
                this.equipItem(item.id, item.slot);
                break;
            case 'use':
                this.useItem(item.id);
                break;
            case 'drop':
                this.dropItem(item.id, 1);
                break;
            case 'examine':
                this.showItemDetails(item);
                break;
        }
    }

    showItemDetails(item) {
        const detailsContent = document.querySelector('.details-content');
        detailsContent.innerHTML = `
            <div class="details-item-name">${item.icon} ${item.name}</div>
            <div style="color: var(--rarity-${item.rarity}); margin: 8px 0;">
                ${item.rarity.toUpperCase()}
            </div>
            <div class="details-item-description">${item.description}</div>
            <div style="margin-top: 12px;">Type: ${item.type}</div>
            <div>Value: ${item.value} gold</div>
        `;
    }

    renderEquipment() {
        Object.entries(this.equipped).forEach(([slot, item]) => {
            const slotElement = document.querySelector(`[data-slot="${slot}"] .slot-item`);
            if (slotElement) {
                if (item) {
                    slotElement.innerHTML = `
                        <div class="item-icon">${item.icon}</div>
                        <div class="item-rarity-border rarity-${item.rarity}"></div>
                    `;
                    slotElement.classList.add('equipped');
                    slotElement.classList.remove('empty');
                } else {
                    slotElement.classList.add('empty');
                    slotElement.classList.remove('equipped');
                }
            }
        });
    }

    renderStats() {
        if (!this.stats) return;

        const statsPanel = document.querySelector('.equipment-stats');
        if (statsPanel) {
            statsPanel.innerHTML = `
                <div class="section-header" style="font-size: 14px;">Total Stats</div>
                ${this.createStatRow('⚔️ Attack', this.stats.attack)}
                ${this.createStatRow('🛡️ Defense', this.stats.defense)}
                ${this.createStatRow('✨ Magic', this.stats.magic)}
                ${this.createStatRow('⚡ Speed', this.stats.speed)}
                ${this.createStatRow('❤️ HP Bonus', this.stats.hp_bonus)}
            `;
        }
    }

    createStatRow(label, value) {
        const className = value > 0 ? 'positive' : value < 0 ? 'negative' : '';
        return `
            <div class="stat-row">
                <span class="stat-name">${label}</span>
                <span class="stat-bonus ${className}">+${value}</span>
            </div>
        `;
    }

    updateGold(amount) {
        if (this.goldDisplay) {
            this.goldDisplay.textContent = amount.toLocaleString();
        }
    }

    updateWeight(current, max) {
        if (this.weightAmount) {
            this.weightAmount.textContent = `${current} / ${max}`;
        }

        if (this.weightBar) {
            const percent = (current / max) * 100;
            this.weightBar.style.width = `${percent}%`;

            // Color based on weight
            if (percent < 50) {
                this.weightBar.style.background = '#10B981'; // Green
            } else if (percent < 75) {
                this.weightBar.style.background = '#F59E0B'; // Orange
            } else {
                this.weightBar.style.background = '#EF4444'; // Red
            }
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type}] ${message}`);
        // TODO: Implement toast notification
    }

    showError(message) {
        console.error(message);
        alert(message); // Replace with better error UI
    }
}

// Initialize
let inventoryManager;
document.addEventListener('DOMContentLoaded', () => {
    inventoryManager = new InventoryManager();
    console.log('Inventory system initialized - Press I to open');
});

// Global function for external access
window.toggleInventory = () => inventoryManager.toggle();
window.InventoryManager = InventoryManager;
```

---

## Testing the Integration

### 1. Add Test Items

```bash
# Using curl or Postman
curl -X POST http://localhost:5000/api/inventory/add \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": "default",
    "item_id": "health_potion",
    "quantity": 5
  }'

curl -X POST http://localhost:5000/api/inventory/add \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": "default",
    "item_id": "iron_sword",
    "quantity": 1
  }'
```

### 2. Open Game, Press 'I'

The inventory should open with the test items.

### 3. Test Interactions

- Drag items to move them
- Double-click to equip/use
- Right-click for context menu
- Search/filter items

---

## Quick Integration Checklist

- [ ] Add API endpoints to `web_game.py`
- [ ] Copy `INVENTORY_SYSTEM_ENHANCED.html` styles to CSS file
- [ ] Copy inventory HTML structure to game template
- [ ] Create `inventory_system.js` with API integration
- [ ] Test loading inventory
- [ ] Test equipping items
- [ ] Test using consumables
- [ ] Test drag-and-drop
- [ ] Test on mobile devices
- [ ] Add loading states
- [ ] Add error handling
- [ ] Connect to loot system
- [ ] Connect to combat system (use potions)
- [ ] Add sound effects
- [ ] Performance testing with 100+ items

---

## File Locations

```
C:\Users\ilmiv\ProjectArgent\complete_game\
├── web_game.py                              # Add API endpoints here
├── inventory_system.py                      # Already exists (backend logic)
├── static\
│   ├── inventory\
│   │   ├── inventory_system.css            # Extract from ENHANCED.html
│   │   ├── inventory_system.js             # Create with code above
│   │   └── inventory_animations.css        # Optional: separate animations
│   └── INVENTORY_SYSTEM_ENHANCED.html       # Reference/demo file
├── templates\
│   └── game.html                            # Include inventory overlay
└── INVENTORY_UX_DESIGN_SPEC.md             # Full design documentation
```

---

## Next Steps

1. **Phase 1 (MVP):**
   - Get basic load/display working
   - Implement equip/unequip
   - Add use consumable

2. **Phase 2 (Interactions):**
   - Add drag-and-drop
   - Add context menu
   - Add tooltips

3. **Phase 3 (Polish):**
   - Add animations
   - Add sound effects
   - Mobile optimization
   - Performance tuning

4. **Phase 4 (Advanced):**
   - Item comparison
   - Loadout presets
   - Auto-sort
   - Trade system

---

**Ready to implement! Start with Phase 1 MVP.**
