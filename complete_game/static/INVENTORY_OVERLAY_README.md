# Inventory Overlay - Complete HTML Structure

## Overview

This document provides the complete, ready-to-use HTML structure for a **Dark Fantasy RPG Inventory Overlay** designed for "The Arcane Codex" game UI. The inventory system includes:

- **8x6 Grid Layout** (48 total slots)
- **Equipment Slots** (8 slots for armor, weapons, and accessories)
- **Sample Items** with quantity tracking
- **Item Tooltips** with detailed information
- **Weight Capacity Display** (45/100)
- **Filter System** (All, Weapons, Armor, Consumables)
- **Item Details Panel** showing hover information
- **Dark Fantasy Aesthetic** matching existing game UI

---

## Quick Start

### Option 1: Standalone Demo
Open `INVENTORY_OVERLAY_COMPLETE.html` in your browser to see a fully functional demo with styling included.

### Option 2: Integration into Existing Project
Add the HTML, CSS, and JavaScript from `inventory_overlay.html` before the closing `</body>` tag in your main HTML file.

---

## File Structure

```
/static/
├── INVENTORY_OVERLAY_COMPLETE.html    # Standalone demo (fully self-contained)
├── inventory_overlay.html              # Component to integrate into main HTML
└── INVENTORY_OVERLAY_README.md         # This file
```

---

## HTML Structure

### Main Container
```html
<div id="inventory-overlay" class="game-overlay">
    <div class="overlay-backdrop"></div>
    <div class="overlay-panel inventory-panel">
        <!-- Content goes here -->
    </div>
</div>
```

### Header Section
```html
<div class="overlay-header">
    <div class="overlay-title">Inventory</div>
    <div class="capacity-info">
        <span class="capacity-label">Weight:</span>
        <span class="capacity-value">45 / 100</span>
    </div>
    <button class="close-btn">x</button>
</div>
```

**Customization:**
- Change `"Inventory"` to any title
- Update weight values: `45 / 100` where 45 is current, 100 is max

### Filter Buttons
```html
<div class="inventory-filters">
    <button class="filter-btn active" data-filter="all">All Items</button>
    <button class="filter-btn" data-filter="weapons">Weapons</button>
    <button class="filter-btn" data-filter="armor">Armor</button>
    <button class="filter-btn" data-filter="consumables">Consumables</button>
</div>
```

**Customization:**
- Add/remove filter buttons as needed
- Update `data-filter` attribute with category names
- Only one button should have `.active` class initially

### Equipment Slots Section
```html
<div class="equipment-section">
    <div class="equipment-header">EQUIPPED ITEMS</div>
    <div class="equipment-slots">
        <div class="equipment-slot main-hand" data-slot="main-hand">
            <div class="slot-label">Main Hand</div>
            <div class="slot-item equipped"
                 data-item-id="weapon-001"
                 data-tooltip="Blade of the Fallen King | Damage: 15-22 | Rare">
                x
            </div>
        </div>
        <!-- More slots... -->
    </div>
</div>
```

**Available Equipment Slots:**
- `main-hand` - Main weapon slot
- `off-hand` - Off-hand weapon/shield
- `armor` - Body armor
- `helmet` - Head protection
- `gloves` - Hand armor
- `boots` - Foot armor
- `accessory-1` - Ring/Amulet slot 1
- `accessory-2` - Ring/Amulet slot 2

**Customization:**
- Change emoji/icon in `.slot-item` div
- Update `data-item-id` for unique identification
- Modify `data-tooltip` text with item details
- Remove `.equipped` class to show empty slot

### Inventory Grid
```html
<div class="grid-section">
    <div class="grid-header">INVENTORY GRID (8x6)</div>
    <div class="inventory-grid">
        <div class="inventory-slot" data-slot-id="slot-0">
            <div class="grid-item"
                 data-item-id="potion-001"
                 data-tooltip="Health Potion | Restores 100 HP | Common">
                x
                <span class="item-quantity">3</span>
            </div>
        </div>
        <!-- 47 more slots... -->
    </div>
</div>
```

**Grid Layout:**
- 8 columns x 6 rows = 48 total slots
- Each slot has `data-slot-id="slot-N"` where N is 0-47
- Items display emoji/icon with quantity badge

**Adding Items:**
1. Place emoji or symbol in `.grid-item` div
2. Add `data-item-id` for unique identification
3. Add `data-tooltip` with item description
4. Optional: Add `<span class="item-quantity">N</span>` for stack count

### Item Details Panel
```html
<div class="item-details">
    <div class="details-title">Item Details</div>
    <div class="details-content">
        <p class="details-placeholder">Hover over an item to view details</p>
    </div>
</div>
```

This panel dynamically updates when hovering over items.

---

## CSS Classes Reference

### Main Classes
| Class | Purpose |
|-------|---------|
| `.game-overlay` | Centered overlay container |
| `.overlay-panel` | Main panel with styling |
| `.inventory-panel` | Specific inventory styling |
| `.overlay-header` | Golden header bar |
| `.overlay-title` | Title text styling |
| `.capacity-info` | Weight/capacity display |
| `.close-btn` | Close button styling |

### Filter Classes
| Class | Purpose |
|-------|---------|
| `.inventory-filters` | Filter button container |
| `.filter-btn` | Individual filter button |
| `.filter-btn.active` | Active filter state |

### Equipment Classes
| Class | Purpose |
|-------|---------|
| `.equipment-section` | Equipment slots container |
| `.equipment-header` | "EQUIPPED ITEMS" header |
| `.equipment-slots` | Grid for equipment slots |
| `.equipment-slot` | Individual equipment slot |
| `.slot-label` | Slot name (Main Hand, etc) |
| `.slot-item` | Item display in slot |
| `.slot-item.equipped` | Equipped item styling |

### Grid Classes
| Class | Purpose |
|-------|---------|
| `.grid-section` | Main inventory grid container |
| `.grid-header` | "INVENTORY GRID (8x6)" header |
| `.inventory-grid` | 8-column grid layout |
| `.inventory-slot` | Individual grid slot |
| `.grid-item` | Item in grid slot |
| `.item-quantity` | Quantity badge |

### Item Details Classes
| Class | Purpose |
|-------|---------|
| `.item-details` | Details panel container |
| `.details-title` | Panel title |
| `.details-content` | Dynamic content area |
| `.details-placeholder` | Placeholder text |

---

## CSS Color Palette

The inventory uses the dark fantasy theme from the main game:

```css
--gold-bright: #FFD700;        /* Bright gold accents */
--gold-medium: #D4AF37;        /* Medium gold text */
--gold-dark: #B8860B;          /* Dark gold borders */
--bronze-light: #8B7355;       /* Light bronze/tan */
--bronze-medium: #5C4A3A;      /* Medium bronze */
--bronze-dark: #3E342A;        /* Dark bronze */
--bg-dark: #0A0908;            /* Very dark background */
--bg-panel: rgba(42, 36, 30, 0.95);        /* Panel background */
--bg-panel-secondary: rgba(26, 22, 18, 0.95); /* Secondary panel */
```

---

## JavaScript API

### Opening/Closing
```javascript
// Toggle inventory
window.toggleInventory();

// Open inventory
document.getElementById('inventory-overlay').classList.add('active');

// Close inventory
document.getElementById('inventory-overlay').classList.remove('active');
```

### Keyboard Shortcuts
- **I Key**: Toggle inventory open/closed (built-in)
- **ESC**: Close inventory (can be added)

### Event Handling

#### Item Hover
```javascript
const item = document.querySelector('[data-item-id="potion-001"]');
item.addEventListener('mouseenter', (e) => {
    const tooltip = item.getAttribute('data-tooltip');
    console.log('Hovering over:', tooltip);
});
```

#### Filter Change
```javascript
const filterBtn = document.querySelector('[data-filter="weapons"]');
filterBtn.addEventListener('click', () => {
    // Handle filter change
    console.log('Filter changed to weapons');
});
```

#### Close Button
```javascript
const closeBtn = document.querySelector('.close-btn');
closeBtn.addEventListener('click', () => {
    document.getElementById('inventory-overlay').classList.remove('active');
});
```

### Programmatic Updates

#### Update Weight Capacity
```javascript
function updateCapacity(current, max) {
    const capacityValue = document.querySelector('.capacity-value');
    capacityValue.textContent = `${current} / ${max}`;
}

updateCapacity(75, 100);
```

#### Update Item Quantity
```javascript
function updateItemQuantity(itemId, quantity) {
    const item = document.querySelector(`[data-item-id="${itemId}"]`);
    const qtyBadge = item.querySelector('.item-quantity');
    if (qtyBadge) qtyBadge.textContent = quantity;
}

updateItemQuantity('potion-001', 5);
```

#### Update Item Details Panel
```javascript
function showItemDetails(itemDetails) {
    const detailsContent = document.querySelector('.details-content');
    detailsContent.innerHTML = `
        <p><strong>${itemDetails.name}</strong></p>
        <p>${itemDetails.description}</p>
        <p>Value: ${itemDetails.value} gold</p>
    `;
}

showItemDetails({
    name: 'Health Potion',
    description: 'Restores 100 HP when consumed',
    value: 50
});
```

---

## Responsive Design

Current design is optimized for:
- **Desktop**: 1200px+ width
- **Inventory Panel**: 1200px wide x 85vh max-height
- **Mobile**: Scalable with media queries (can be added)

### Making It Mobile-Friendly
```css
@media (max-width: 768px) {
    .inventory-panel {
        width: 95vw;
        max-height: 90vh;
    }

    .inventory-content {
        flex-direction: column;
    }

    .inventory-grid {
        grid-template-columns: repeat(4, 1fr);
    }
}
```

---

## Sample Items Included

### Equipment (with emojis)
1. **Blade of the Fallen King** - x (Main Hand)
2. **Iron Kite Shield** - x (Off-Hand)
3. **Plate Armor** - x (Armor)
4. **Ornate Helm** - x (Helmet)
5. **Amulet of Warding** - x (Accessory)

### Inventory Items
1. **Health Potion** - x (Qty: 3)
2. **Mana Potion** - x (Qty: 2)
3. **Copper Key** - x (Qty: 1)
4. **Scroll of Fireball** - x (Qty: 1)
5. **Alchemical Vial** - x (Qty: 5)

All items have tooltips with:
- Item name
- Effect/Stat information
- Rarity tier (Common, Uncommon, Rare)

---

## Customization Guide

### Changing Colors

Update the root CSS variables:
```css
:root {
    --gold-bright: #FFD700;      /* Change bright accents */
    --gold-medium: #D4AF37;      /* Change gold text */
    --bronze-light: #8B7355;     /* Change border/bronze */
    --bg-dark: #0A0908;          /* Change dark background */
}
```

### Changing Grid Size

Modify the grid layout:
```css
.inventory-grid {
    grid-template-columns: repeat(10, 1fr);  /* 10 columns instead of 8 */
    gap: 10px;
}
```

This creates a 10x4 grid (40 slots) instead of 8x6 (48 slots).

### Adding More Equipment Slots

Copy an existing equipment slot and modify:
```html
<div class="equipment-slot trinket" data-slot="trinket">
    <div class="slot-label">Trinket</div>
    <div class="slot-item" data-slot-empty="true">-</div>
</div>
```

### Adding Drag & Drop

```javascript
const gridItems = document.querySelectorAll('.grid-item');
let draggedItem = null;

gridItems.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        draggedItem = e.target;
    });

    item.addEventListener('drop', (e) => {
        e.preventDefault();
        // Swap items
    });
});
```

---

## Integration Checklist

- [ ] Copy all CSS into your main stylesheet (or `<style>` tag)
- [ ] Copy HTML structure before closing `</body>` tag
- [ ] Copy JavaScript event handlers
- [ ] Test opening/closing with I key
- [ ] Test filter button clicks
- [ ] Test item hover tooltips
- [ ] Update color variables to match your theme
- [ ] Customize equipment slot names if needed
- [ ] Add your own item data and icons
- [ ] Connect to backend inventory system
- [ ] Add drag & drop functionality (optional)

---

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- IE11: Partial (CSS Grid, Flexbox supported)

---

## Performance Tips

1. **Lazy Load Images**: Replace emojis with optimized images if needed
2. **Event Delegation**: Use event delegation for many items
3. **Virtual Scrolling**: For large inventories (100+ items)
4. **CSS Optimization**: Minimize animations on low-end devices

---

## Future Enhancements

- [ ] Drag & drop item movement
- [ ] Item sorting (by name, rarity, type)
- [ ] Item comparison tooltips
- [ ] Inventory search bar
- [ ] Sell/drop items functionality
- [ ] Item preview with 3D model
- [ ] Keyboard shortcuts for quick items
- [ ] Multiple inventory tabs
- [ ] Item color rarity indicators

---

## Support Notes

**Known Limitations:**
- Does not include drag & drop (add with JavaScript)
- Backdrop click closes overlay (can be disabled)
- Tooltips use CSS (no max-width, can overflow on small screens)
- Fixed width of 1200px (adjust with media queries)

**Debug Console:**
```javascript
// Check if inventory loaded
console.log(window.toggleInventory);

// Manual toggle
window.toggleInventory();

// Check inventory element
console.log(document.getElementById('inventory-overlay'));
```

---

## License & Usage

This inventory overlay is designed specifically for "The Arcane Codex" dark fantasy RPG.
Feel free to customize colors, layout, and content to match your game's aesthetic.

---

**Last Updated:** 2025-11-14
**Version:** 1.0 - Complete HTML Structure
