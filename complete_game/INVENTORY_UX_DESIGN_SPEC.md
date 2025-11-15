# The Arcane Codex - Inventory System UX Design Specification

## Executive Summary

This document outlines the complete UX design for The Arcane Codex's inventory and equipment system. The design prioritizes player engagement, intuitive interactions, and responsive feedback to create an addictive, satisfying inventory management experience.

---

## 1. Design Philosophy

### Core Principles

**1. Clarity First**
- Item rarity instantly recognizable through color-coded borders and glows
- Equipment slots clearly labeled with visual indicators
- Weight/capacity always visible with color-coded warnings

**2. Responsive Feedback**
- Every interaction has immediate visual/audio feedback
- Drag operations show preview and valid drop zones
- Hover states reveal detailed information without cluttering

**3. Progressive Disclosure**
- Basic information always visible (icon, quantity, rarity)
- Additional details on hover (tooltips)
- Full stats in details panel on click
- Advanced actions in context menu

**4. Accessibility**
- Multiple interaction methods (drag, double-click, right-click, keyboard)
- Touch-friendly on mobile with larger targets
- Color-blind friendly with icons + text labels
- Keyboard navigation support

---

## 2. Layout Architecture

### Grid Configuration: 8×6 (48 Slots)

**Why 8×6 over 6×8?**
- Wider format better suits landscape monitors (16:9 aspect ratio)
- Equipment panel on left creates balanced L-shape composition
- More horizontal space = less scrolling on typical displays
- 8 columns allows efficient scanning (7±2 items per row principle)

### Responsive Breakpoints

```css
Desktop (1200px+):    8×6 grid, side-by-side layout
Tablet (768-1199px):  6×8 grid, side-by-side compressed
Mobile (<768px):      4×12 grid, stacked vertical layout
```

### Section Hierarchy

```
┌─────────────────────────────────────────────────┐
│ HEADER (Gold, Weight, Slots)                   │
├─────────────────────────────────────────────────┤
│ FILTERS (All, Weapons, Armor, etc.) + SEARCH   │
├──────────────┬──────────────────────────────────┤
│              │                                  │
│  EQUIPMENT   │     INVENTORY GRID (8×6)        │
│   SLOTS      │                                  │
│   (2×4)      │                                  │
│              │                                  │
│   STATS      │                                  │
│              │                                  │
├──────────────┴──────────────────────────────────┤
│ ITEM DETAILS PANEL                              │
└─────────────────────────────────────────────────┘
```

---

## 3. Equipment Slots Design

### Slot Configuration

```
Main Hand    Off-Hand
Helmet       Armor
Gloves       Boots
Amulet       Ring
```

### Visual States

**1. Empty Slot**
```css
- Faded icon showing slot type (opacity: 0.3)
- Dashed border on hover
- Text: "Empty" or slot name
- Color: Muted bronze (#8B7355)
```

**2. Equipped Slot**
```css
- Full-color item icon
- Solid gold border (#D4AF37)
- Rarity-colored glow (animated)
- Pulsing effect on hover
- Box-shadow: 0 0 20px rgba(212, 175, 55, 0.4)
```

**3. Drop Target (During Drag)**
```css
- Dashed bright gold border
- Pulsing background glow
- Animation: pulse 1s ease-in-out infinite
- Background: linear-gradient with gold tint
```

### Equipment Stats Summary Panel

Located below equipment slots:
```
┌─────────────────────┐
│ TOTAL STATS         │
├─────────────────────┤
│ ⚔️  Attack     +12  │
│ 🛡️  Defense    +18  │
│ ✨  Magic      +8   │
│ ⚡  Speed      +5   │
│ ❤️  HP Bonus   +25  │
└─────────────────────┘
```

**Features:**
- Real-time updates when equipping/unequipping
- Green (+) for bonuses, red (-) for penalties
- Animated number changes with brief highlight

---

## 4. Inventory Grid Design

### Slot Specifications

**Dimensions:**
- Desktop: 80px × 80px (aspect-ratio: 1)
- Tablet: 70px × 70px
- Mobile: 60px × 60px

**Visual Design:**
```css
Background: Linear gradient (dark brown tones)
Border: 2px solid bronze (#8B7355)
Border-radius: 8px
Padding: 8px
Gap between slots: 12px
```

### Slot States

**1. Normal State**
```css
border: 2px solid #8B7355;
background: linear-gradient(135deg, rgba(42,36,30,0.85), rgba(26,22,18,0.85));
cursor: pointer;
```

**2. Hover State**
```css
border-color: #D4AF37;
transform: scale(1.08) translateY(-2px);
box-shadow: 0 6px 12px rgba(212, 175, 55, 0.3);
z-index: 10;
transition: all 0.15s ease;
```

**3. Dragging State**
```css
opacity: 0.5;
cursor: grabbing;
filter: brightness(0.7);
```

**4. Hidden (Filtered)**
```css
display: none;
```

### Item Display Elements

**1. Item Icon**
- Font-size: 32px (emoji or custom sprite)
- Centered with flexbox
- Drop-shadow for depth

**2. Quantity Badge**
```css
Position: Absolute bottom-right
Background: rgba(212, 175, 55, 0.95)
Color: Dark brown (#2A1810)
Font: Cinzel, 11px, bold
Padding: 2px 6px
Border-radius: 4px
Min-width: 20px
Box-shadow: 0 2px 4px rgba(0,0,0,0.3)
```

**3. Rarity Border**
```css
Position: Absolute, inset: -2px
Border-radius: 8px
Border: 2px solid [rarity-color]
Opacity: 0.8
Pointer-events: none
```

### Rarity Color System

```css
Common:     #9CA3AF (Gray)      - No glow
Uncommon:   #10B981 (Green)     - Subtle glow
Rare:       #3B82F6 (Blue)      - Medium glow
Epic:       #8B5CF6 (Purple)    - Strong glow
Legendary:  #F59E0B (Orange)    - Pulsing glow animation
Divine:     #EF4444 (Red/Gold)  - Intense pulsing glow
```

**Glow Implementation:**
```css
.rarity-legendary {
  box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
  animation: legendary-glow 2s ease-in-out infinite;
}

@keyframes legendary-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
  50% { box-shadow: 0 0 30px rgba(245, 158, 11, 0.8); }
}

.rarity-divine {
  box-shadow: 0 0 25px rgba(239, 68, 68, 0.6);
  animation: divine-glow 1.5s ease-in-out infinite;
}
```

---

## 5. Drag-and-Drop Interaction Flow

### Desktop/Mouse Interactions

**Step 1: Drag Start**
```javascript
1. User clicks and holds on item
2. Cursor changes to "grab" then "grabbing"
3. Original item becomes semi-transparent (opacity: 0.5)
4. Valid drop zones highlighted with dashed gold borders
5. Invalid zones remain normal
6. Drag preview follows cursor (scaled 1.1x)
```

**Step 2: Drag Over**
```javascript
1. Valid slot shows pulsing animation
2. Slot border changes to bright gold
3. Background tint applied
4. Cursor shows "move" indicator
```

**Step 3: Drop**
```javascript
1. Item moves to new position with smooth transition
2. Quick scale animation (1 → 1.1 → 1)
3. Success sound effect plays
4. Gold particle effect (optional)
5. Stats update if equipment changed
```

**Step 4: Drag Cancel**
```javascript
1. Released outside valid zone
2. Item springs back to original position (elastic animation)
3. All highlights removed
4. No changes made
```

### Touch/Mobile Interactions

**Long Press to Drag**
```javascript
1. User long-presses item (300ms)
2. Haptic feedback (vibration)
3. Item "lifts" with shadow increase
4. Valid zones highlighted
5. Touch-move drags the item
6. Release to drop
```

**Alternative: Context Menu First**
```javascript
1. Long press opens context menu
2. User selects "Move Item"
3. Valid slots pulse
4. Tap destination to move
5. Confirm or cancel
```

### Responsiveness Optimization

```javascript
// Use requestAnimationFrame for smooth dragging
function updateDragPosition(e) {
  requestAnimationFrame(() => {
    dragPreview.style.transform =
      `translate(${e.clientX}px, ${e.clientY}px)`;
  });
}

// Debounce hover detection on mobile
const handleSlotHover = debounce((slot) => {
  slot.classList.add('drop-target');
}, 50);
```

---

## 6. Tooltip System

### Tooltip Positioning Logic

```javascript
// Smart positioning (never off-screen)
function positionTooltip(tooltip, trigger) {
  const rect = trigger.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();

  // Default: Right of item
  let left = rect.right + 10;
  let top = rect.top;

  // If off right edge, show on left
  if (left + tooltipRect.width > window.innerWidth) {
    left = rect.left - tooltipRect.width - 10;
  }

  // If off bottom, align to bottom
  if (top + tooltipRect.height > window.innerHeight) {
    top = window.innerHeight - tooltipRect.height - 10;
  }

  tooltip.style.left = left + 'px';
  tooltip.style.top = top + 'px';
}
```

### Tooltip Content Structure

```html
<div class="item-tooltip">
  <!-- SECTION 1: Header -->
  <div class="tooltip-header">
    <div class="tooltip-name">🗡️ Blade of the Fallen King</div>
    <div class="tooltip-type">Weapon • Longsword</div>
    <div class="tooltip-rarity" style="background: #3B82F6;">RARE</div>
  </div>

  <!-- SECTION 2: Primary Stats -->
  <div class="tooltip-stats">
    <div class="tooltip-stat">
      <span>⚔️ Damage:</span>
      <span style="color: #FFD700;">15-22</span>
    </div>
    <div class="tooltip-stat">
      <span>⚡ Attack Speed:</span>
      <span style="color: #FFD700;">Fast</span>
    </div>
    <div class="tooltip-stat">
      <span>🎯 Critical Chance:</span>
      <span style="color: #10B981;">+5%</span>
    </div>
    <div class="tooltip-stat">
      <span>💎 Value:</span>
      <span style="color: #FFD700;">350 Gold</span>
    </div>
  </div>

  <!-- SECTION 3: Description -->
  <div class="tooltip-description">
    "Forged in the fires of Mount Doom, this blade once belonged
    to King Artheron before his tragic fall. Whispers of power
    still emanate from its edge."
  </div>

  <!-- SECTION 4: Requirements -->
  <div class="tooltip-requirements">
    <div class="requirement-met">✓ Level 8</div>
    <div class="requirement-met">✓ Warrior Class</div>
    <div class="requirement-not-met">✗ Strength 15 (Current: 12)</div>
  </div>

  <!-- SECTION 5: Special Effects -->
  <div class="tooltip-effects">
    <div class="effect-item">
      🔥 +10 Fire Damage vs Undead
    </div>
    <div class="effect-item">
      ⚡ 15% chance to chain lightning on hit
    </div>
  </div>

  <!-- SECTION 6: Usage Hints -->
  <div class="tooltip-actions">
    Right-click for options • Double-click to equip • Drag to move
  </div>
</div>
```

### Tooltip Styling Guidelines

**Typography:**
- Header: Cinzel Bold 18px
- Type/Rarity: Yrsa 12px, uppercase
- Stats: Yrsa 14px
- Description: Yrsa 13px, italic, line-height 1.6

**Colors:**
- Positive stats: #10B981 (green)
- Negative stats: #EF4444 (red)
- Neutral stats: #FFD700 (gold)
- Requirements met: #10B981
- Requirements not met: #EF4444

**Spacing:**
- Padding: 16px
- Section gaps: 12px
- Stat row padding: 4px 0
- Borders: 1px solid rgba(139, 115, 85, 0.3)

**Animation:**
```css
@keyframes tooltipFadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-tooltip {
  animation: tooltipFadeIn 0.2s ease-out;
}
```

### Tooltip Behavior

**Show Triggers:**
- Mouse enter item (200ms delay)
- Touch and hold (300ms)

**Hide Triggers:**
- Mouse leave item
- Touch release
- Item dragged
- Context menu opened
- Inventory closed

**Performance:**
```javascript
// Debounce tooltip creation
const showTooltip = debounce((item, position) => {
  createTooltip(item, position);
}, 200);

// Reuse single tooltip element (don't create new ones)
const tooltip = document.getElementById('item-tooltip');
function updateTooltip(item) {
  // Update content, don't recreate DOM
  tooltip.querySelector('.tooltip-name').textContent = item.name;
  // ... update other fields
}
```

---

## 7. Context Menu Design

### Menu Structure

```html
<div class="context-menu">
  <!-- PRIMARY ACTIONS -->
  <div class="context-menu-item" data-action="equip">
    <span class="context-menu-icon">⚔️</span>
    <span>Equip</span>
    <span class="context-menu-hotkey">E</span>
  </div>

  <div class="context-menu-item" data-action="use">
    <span class="context-menu-icon">🧪</span>
    <span>Use</span>
    <span class="context-menu-hotkey">U</span>
  </div>

  <div class="context-menu-divider"></div>

  <!-- SECONDARY ACTIONS -->
  <div class="context-menu-item" data-action="examine">
    <span class="context-menu-icon">🔍</span>
    <span>Examine</span>
  </div>

  <div class="context-menu-item" data-action="split">
    <span class="context-menu-icon">📦</span>
    <span>Split Stack</span>
  </div>

  <div class="context-menu-item" data-action="compare">
    <span class="context-menu-icon">⚖️</span>
    <span>Compare</span>
  </div>

  <div class="context-menu-divider"></div>

  <!-- DESTRUCTIVE ACTIONS -->
  <div class="context-menu-item" data-action="drop">
    <span class="context-menu-icon">🗑️</span>
    <span>Drop</span>
  </div>

  <div class="context-menu-item" data-action="destroy">
    <span class="context-menu-icon">💥</span>
    <span>Destroy</span>
  </div>
</div>
```

### Context-Aware Menu Items

**Weapon/Armor:**
```javascript
{
  enabled: ['equip', 'examine', 'compare', 'drop', 'destroy'],
  disabled: ['use', 'split'],
  primary: 'equip'
}
```

**Consumable:**
```javascript
{
  enabled: ['use', 'examine', 'split', 'drop', 'destroy'],
  disabled: ['equip', 'compare'],
  primary: 'use'
}
```

**Quest Item:**
```javascript
{
  enabled: ['examine'],
  disabled: ['equip', 'use', 'split', 'drop', 'destroy'],
  primary: 'examine',
  warning: 'Quest items cannot be dropped or destroyed'
}
```

### Menu Styling

```css
.context-menu {
  background: linear-gradient(135deg,
    rgba(10, 8, 8, 0.98),
    rgba(26, 20, 18, 0.98));
  border: 2px solid #D4AF37;
  border-radius: 8px;
  padding: 8px 0;
  min-width: 200px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(4px);
}

.context-menu-item {
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.context-menu-item:hover {
  background: rgba(212, 175, 55, 0.2);
  color: #FFD700;
}

.context-menu-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
  pointer-events: none;
}

.context-menu-divider {
  height: 1px;
  background: rgba(139, 115, 85, 0.5);
  margin: 4px 8px;
}

.context-menu-hotkey {
  margin-left: auto;
  font-size: 11px;
  opacity: 0.7;
  padding: 2px 6px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 3px;
}
```

### Menu Positioning

```javascript
function positionContextMenu(menu, x, y) {
  menu.style.left = x + 'px';
  menu.style.top = y + 'px';

  // Prevent off-screen
  setTimeout(() => {
    const rect = menu.getBoundingClientRect();

    if (rect.right > window.innerWidth) {
      menu.style.left = (x - rect.width) + 'px';
    }

    if (rect.bottom > window.innerHeight) {
      menu.style.top = (y - rect.height) + 'px';
    }
  }, 0);
}
```

---

## 8. Filter and Search System

### Filter Categories

```javascript
const FILTERS = [
  { id: 'all', label: 'All Items', icon: '📦' },
  { id: 'weapons', label: 'Weapons', icon: '⚔️' },
  { id: 'armor', label: 'Armor', icon: '🛡️' },
  { id: 'consumables', label: 'Consumables', icon: '🧪' },
  { id: 'accessories', label: 'Accessories', icon: '💍' },
  { id: 'materials', label: 'Materials', icon: '⛏️' },
  { id: 'quest', label: 'Quest Items', icon: '🗝️' }
];
```

### Filter Button Design

```html
<button class="filter-btn active" data-filter="all">
  <span class="filter-icon">📦</span>
  <span class="filter-label">All Items</span>
  <span class="filter-count">23</span>
</button>
```

**Active State:**
```css
.filter-btn.active {
  border-color: #FFD700;
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.4),
    rgba(139, 115, 85, 0.4));
  color: #FFD700;
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}
```

**Ripple Effect on Click:**
```css
.filter-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: radial-gradient(circle,
    rgba(212, 175, 55, 0.3),
    transparent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.3s, height 0.3s;
}

.filter-btn:hover::before {
  width: 200%;
  height: 200%;
}
```

### Search Functionality

**Real-time Search:**
```javascript
// Debounced search (300ms)
const searchInventory = debounce((query) => {
  const lowerQuery = query.toLowerCase();

  items.forEach((item, index) => {
    const slot = slots[index];
    const matches =
      item.name.toLowerCase().includes(lowerQuery) ||
      item.type.toLowerCase().includes(lowerQuery) ||
      item.description.toLowerCase().includes(lowerQuery);

    if (matches) {
      slot.classList.remove('hidden');
      slot.style.order = 0; // Matching items first
    } else {
      slot.classList.add('hidden');
    }
  });

  updateFilterCounts();
}, 300);
```

**Search Box Features:**
- Clear button (X) when text entered
- Search icon on left
- Placeholder: "Search items..."
- Focus state with gold glow
- Keyboard shortcut: Ctrl/Cmd + F

### Sort Dropdown

```html
<select class="sort-dropdown">
  <option value="default">Sort: Default</option>
  <option value="name-asc">Name (A-Z)</option>
  <option value="name-desc">Name (Z-A)</option>
  <option value="rarity-desc">Rarity (High to Low)</option>
  <option value="rarity-asc">Rarity (Low to High)</option>
  <option value="type">Type</option>
  <option value="value-desc">Value (High to Low)</option>
  <option value="value-asc">Value (Low to High)</option>
  <option value="newest">Newest First</option>
  <option value="oldest">Oldest First</option>
</select>
```

**Sort Algorithm:**
```javascript
function sortInventory(criteria) {
  const comparators = {
    'name-asc': (a, b) => a.name.localeCompare(b.name),
    'name-desc': (a, b) => b.name.localeCompare(a.name),
    'rarity-desc': (a, b) => {
      const order = { common: 0, uncommon: 1, rare: 2,
                     epic: 3, legendary: 4, divine: 5 };
      return order[b.rarity] - order[a.rarity];
    },
    'value-desc': (a, b) => b.value - a.value,
    // ... etc
  };

  items.sort(comparators[criteria]);
  renderInventory();
}
```

---

## 9. Visual Feedback Specifications

### Micro-Interactions

**1. Item Pickup Animation**
```css
@keyframes itemPickup {
  0% {
    opacity: 0;
    transform: scale(0.5) translateY(20px);
  }
  60% {
    transform: scale(1.1) translateY(-5px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.new-item {
  animation: itemPickup 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**2. Item Equip Success**
```javascript
// Flash gold on equipment slot
slot.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.8)';
setTimeout(() => {
  slot.style.boxShadow = ''; // Return to normal
}, 500);

// Particle effect (optional)
createParticles(slot, 'gold', 10);
```

**3. Item Consumed**
```css
@keyframes consumeItem {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
    filter: brightness(1.5);
  }
  100% {
    opacity: 0;
    transform: scale(0.3);
  }
}
```

**4. Inventory Full Warning**
```javascript
// Shake animation + red flash
inventory.style.animation = 'shake 0.5s';
inventory.style.borderColor = '#EF4444';

setTimeout(() => {
  inventory.style.animation = '';
  inventory.style.borderColor = '';
}, 500);

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}
```

### Weight System Visual Feedback

**Weight Bar Color States:**
```javascript
function updateWeightBar(current, max) {
  const percent = (current / max) * 100;
  const bar = document.getElementById('weight-fill');

  bar.style.width = `${percent}%`;

  if (percent < 50) {
    bar.style.background = '#10B981'; // Green - plenty of space
  } else if (percent < 75) {
    bar.style.background = '#F59E0B'; // Orange - getting full
  } else if (percent < 100) {
    bar.style.background = '#EF4444'; // Red - almost full
    bar.style.animation = 'pulse 2s ease-in-out infinite';
  } else {
    bar.style.background = '#DC2626'; // Dark red - overfull
    bar.style.animation = 'pulse 1s ease-in-out infinite';
  }
}
```

**Overfull State:**
- Red pulsing weight bar
- Character movement speed penalty indicator
- Warning icon next to weight display
- Tooltip: "Overencumbered! Drop items or increase capacity"

### Rarity Indication Summary

**Visual Hierarchy (Weakest to Strongest):**

1. **Common** - Gray border, no glow
2. **Uncommon** - Green border, subtle glow
3. **Rare** - Blue border, medium glow
4. **Epic** - Purple border, strong glow + particles
5. **Legendary** - Orange border, pulsing glow, floating sparkles
6. **Divine** - Red/gold gradient border, intense pulsing, light rays

**Implementation:**
```css
/* Legendary sparkle effect */
.rarity-legendary::after {
  content: '✨';
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 20px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 0; transform: rotate(0deg); }
  50% { opacity: 1; transform: rotate(180deg); }
}

/* Divine light rays */
.rarity-divine::before {
  content: '';
  position: absolute;
  inset: -10px;
  background: radial-gradient(circle,
    rgba(255, 215, 0, 0.3),
    transparent 70%);
  animation: rotate 4s linear infinite;
}
```

---

## 10. Mobile/Touch Adaptations

### Touch Gesture Mapping

```javascript
const TOUCH_GESTURES = {
  'tap': 'Select item / Show details',
  'double-tap': 'Use/Equip item',
  'long-press': 'Show context menu (300ms)',
  'drag': 'Move item (after long-press)',
  'pinch-zoom': 'Disabled (prevent accidental zoom)',
  'swipe-left': 'Previous filter category',
  'swipe-right': 'Next filter category'
};
```

### Touch-Optimized Changes

**1. Larger Touch Targets**
```css
@media (max-width: 768px) {
  .inventory-slot {
    min-height: 60px;
    min-width: 60px;
    padding: 10px;
  }

  .filter-btn {
    padding: 12px 20px;
    min-height: 44px; /* iOS minimum touch target */
  }

  .context-menu-item {
    padding: 14px 18px;
    min-height: 48px;
  }
}
```

**2. Bottom Sheet for Context Menu**
```css
@media (max-width: 768px) {
  .context-menu {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-radius: 20px 20px 0 0;
    animation: slideUpFromBottom 0.3s ease-out;
  }

  @keyframes slideUpFromBottom {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
}
```

**3. Simplified Tooltip on Touch**
```javascript
// On mobile, show tooltip as modal overlay
function showMobileTooltip(item) {
  const modal = createTooltipModal(item);

  // Show with backdrop
  modal.classList.add('visible');

  // Close on tap outside
  modal.querySelector('.backdrop').addEventListener('click', () => {
    modal.classList.remove('visible');
  });
}
```

**4. Drag Feedback**
```javascript
// Haptic feedback (if supported)
function vibrate(pattern) {
  if (navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// On drag start
vibrate(50);

// On successful drop
vibrate([30, 100, 30]);

// On invalid drop
vibrate([100, 50, 100]);
```

### Mobile Layout Adjustments

**Vertical Stacking:**
```css
@media (max-width: 768px) {
  .inventory-content {
    flex-direction: column;
  }

  .equipment-section {
    max-width: 100%;
    order: 2; /* Show grid first on mobile */
  }

  .grid-section {
    order: 1;
  }

  .inventory-grid {
    grid-template-columns: repeat(4, 1fr); /* 4 columns on mobile */
  }
}
```

**Sticky Header:**
```css
@media (max-width: 768px) {
  .inventory-header {
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .inventory-filters {
    position: sticky;
    top: [header-height];
    z-index: 99;
  }
}
```

---

## 11. Accessibility Features

### Keyboard Navigation

**Keyboard Shortcuts:**
```javascript
const KEYBOARD_SHORTCUTS = {
  'I': 'Toggle inventory',
  'Esc': 'Close inventory/menu',
  'Tab': 'Navigate between sections',
  'Arrow Keys': 'Navigate grid slots',
  'Enter': 'Select/Activate item',
  'E': 'Equip selected item',
  'U': 'Use selected item',
  'D': 'Drop selected item',
  'Delete': 'Destroy selected item',
  'Ctrl/Cmd + F': 'Focus search box',
  'Ctrl/Cmd + S': 'Sort items',
  '1-9': 'Use quick slot items'
};
```

**Focus Management:**
```javascript
// Maintain focus ring for keyboard users
document.addEventListener('keydown', (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-nav');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-nav');
});

// Only show focus ring for keyboard users
.keyboard-nav .inventory-slot:focus {
  outline: 3px solid #FFD700;
  outline-offset: 2px;
}
```

**Grid Navigation:**
```javascript
function navigateGrid(direction) {
  const currentIndex = getFocusedSlotIndex();
  let newIndex;

  switch(direction) {
    case 'ArrowRight':
      newIndex = Math.min(currentIndex + 1, 47);
      break;
    case 'ArrowLeft':
      newIndex = Math.max(currentIndex - 1, 0);
      break;
    case 'ArrowDown':
      newIndex = Math.min(currentIndex + 8, 47);
      break;
    case 'ArrowUp':
      newIndex = Math.max(currentIndex - 8, 0);
      break;
  }

  focusSlot(newIndex);
}
```

### Screen Reader Support

**ARIA Labels:**
```html
<div class="inventory-slot"
     role="button"
     tabindex="0"
     aria-label="Health Potion, Common, Quantity 5, Restores 50 HP"
     data-item-id="1">
  <div class="grid-item">
    <div class="item-icon" aria-hidden="true">🧪</div>
    <div class="item-quantity" aria-hidden="true">5</div>
  </div>
</div>

<div class="equipment-slot"
     role="region"
     aria-label="Main Hand Equipment Slot">
  <div class="slot-label" id="main-hand-label">Main Hand</div>
  <div class="slot-item"
       role="button"
       aria-labelledby="main-hand-label"
       aria-describedby="equipped-item-description">
    <!-- ... -->
  </div>
</div>

<div id="equipped-item-description" class="sr-only">
  Iron Longsword equipped. Rare weapon. Damage 15-22.
</div>
```

**Live Region for Updates:**
```html
<div aria-live="polite" aria-atomic="true" class="sr-only">
  <span id="inventory-status">
    <!-- Dynamically updated: "Item equipped", "Item dropped", etc. -->
  </span>
</div>
```

### Color-Blind Friendly Design

**Icon + Color System:**
- Don't rely on color alone for rarity
- Add icons/patterns for each rarity level

```css
/* Add patterns to rarity borders */
.rarity-uncommon::before {
  content: '▪▪▪'; /* Dotted pattern */
}
.rarity-rare::before {
  content: '▬▬▬'; /* Dashed pattern */
}
.rarity-epic::before {
  content: '♦♦♦'; /* Diamond pattern */
}
```

**High Contrast Mode:**
```css
@media (prefers-contrast: high) {
  .inventory-slot {
    border-width: 3px;
  }

  .rarity-common { border-color: #FFF; }
  .rarity-uncommon { border-color: #0F0; }
  .rarity-rare { border-color: #00F; }
  .rarity-epic { border-color: #F0F; }
  .rarity-legendary { border-color: #FF0; }
  .rarity-divine { border-color: #F00; }
}
```

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Performance Optimizations

### Rendering Strategy

**Virtual Scrolling (if 100+ items):**
```javascript
// Only render visible slots + buffer
function renderVisibleSlots() {
  const scrollTop = container.scrollTop;
  const viewportHeight = container.clientHeight;
  const slotHeight = 92; // 80px + gap

  const firstVisible = Math.floor(scrollTop / slotHeight) * 8;
  const lastVisible = Math.ceil((scrollTop + viewportHeight) / slotHeight) * 8;

  // Buffer: render 2 rows above and below
  const renderStart = Math.max(0, firstVisible - 16);
  const renderEnd = Math.min(items.length, lastVisible + 16);

  for (let i = renderStart; i < renderEnd; i++) {
    renderSlot(i);
  }
}
```

**Debounce Expensive Operations:**
```javascript
// Search
const search = debounce((query) => filterItems(query), 300);

// Tooltip show
const showTooltip = debounce((item) => createTooltip(item), 200);

// Drag position update
const updateDrag = throttle((x, y) => {
  dragElement.style.transform = `translate(${x}px, ${y}px)`;
}, 16); // ~60fps
```

**DOM Recycling:**
```javascript
// Reuse DOM elements instead of creating new ones
const slotPool = [];

function getSlot() {
  return slotPool.pop() || createNewSlot();
}

function recycleSlot(slot) {
  slot.innerHTML = '';
  slotPool.push(slot);
}
```

### Asset Loading

**Lazy Load Icons:**
```javascript
// Load item icons on demand
const iconCache = new Map();

async function loadIcon(itemId) {
  if (!iconCache.has(itemId)) {
    const icon = await fetchIcon(itemId);
    iconCache.set(itemId, icon);
  }
  return iconCache.get(itemId);
}
```

**Sprite Sheet for Common Icons:**
```css
.item-icon {
  background-image: url('item-sprites.png');
  background-size: 320px 320px; /* 10x10 grid of 32px icons */
}

.item-icon[data-icon-id="1"] {
  background-position: 0 0;
}
.item-icon[data-icon-id="2"] {
  background-position: -32px 0;
}
```

### Memory Management

**Cleanup on Close:**
```javascript
function closeInventory() {
  // Remove event listeners
  items.forEach(item => {
    item.removeEventListener('mouseenter', showTooltip);
    item.removeEventListener('mouseleave', hideTooltip);
  });

  // Clear large data structures
  iconCache.clear();

  // Hide overlay
  overlay.classList.remove('active');
}
```

---

## 13. Success Metrics & A/B Testing

### Key Performance Indicators (KPIs)

**Engagement Metrics:**
- Inventory open rate (% of sessions)
- Average time in inventory
- Items equipped per session
- Items used per session
- Filter usage rate

**Usability Metrics:**
- Time to equip first item (new users)
- Error rate (invalid drag-drops)
- Context menu usage vs. other methods
- Search usage rate
- Mobile vs. desktop completion rates

**Retention Metrics:**
- Return rate after inventory tutorial
- Daily active users with inventory interaction
- Inventory-related churn rate

### A/B Testing Recommendations

**Test 1: Grid Layout**
- Variant A: 8×6 horizontal
- Variant B: 6×8 vertical
- Metric: Time to find specific item, user preference survey

**Test 2: Rarity Indication**
- Variant A: Color borders only
- Variant B: Color borders + glow animations
- Variant C: Color borders + glow + icons
- Metric: Rarity recognition speed, aesthetic preference

**Test 3: Drag vs. Click**
- Variant A: Drag-only for moving items
- Variant B: Drag + double-click
- Variant C: Drag + double-click + context menu
- Metric: Error rate, user preference, task completion time

**Test 4: Tooltip Delay**
- Variant A: 0ms instant
- Variant B: 200ms delay
- Variant C: 400ms delay
- Metric: Tooltip engagement, accidental triggers

**Test 5: Mobile Interaction**
- Variant A: Long-press for menu
- Variant B: Tap for menu, long-press to drag
- Variant C: Swipe to reveal actions
- Metric: Mobile completion rate, error rate

---

## 14. Implementation Files

### File Structure

```
/static/
  /inventory/
    inventory_system.html          # Main inventory UI
    inventory_system.css           # Styles
    inventory_system.js            # Core logic
    inventory_drag.js              # Drag-and-drop system
    inventory_tooltip.js           # Tooltip system
    inventory_context_menu.js      # Context menu
    inventory_mobile.js            # Mobile-specific code
    inventory_animations.css       # Animation keyframes
    inventory_rarity.css           # Rarity visual effects

/backend/
  inventory_system.py              # Python backend (already exists)

/api/
  /inventory/
    all                            # GET all items
    equip                          # POST equip item
    unequip                        # POST unequip item
    use                            # POST use consumable
    drop                           # POST drop item
    move                           # POST move item in grid
```

### Integration Points

**Main Game UI:**
```html
<!-- In templates/game.html -->
<link rel="stylesheet" href="/static/inventory/inventory_system.css">
<script src="/static/inventory/inventory_system.js"></script>

<!-- Inventory trigger button -->
<button class="game-button" onclick="window.InventorySystem.open()">
  Inventory (I)
</button>

<!-- Include inventory overlay -->
<div id="inventory-overlay">
  <!-- Inventory HTML structure -->
</div>
```

**API Integration:**
```javascript
// inventory_system.js
class InventorySystem {
  async loadInventory() {
    const response = await fetch('/api/inventory/all');
    const data = await response.json();
    this.items = data.items;
    this.equipped = data.equipped;
    this.renderInventory();
  }

  async equipItem(itemId, slot) {
    const response = await fetch('/api/inventory/equip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item_id: itemId, slot: slot })
    });

    if (response.ok) {
      await this.loadInventory(); // Refresh
      this.showNotification('Item equipped!', 'success');
    }
  }
}
```

---

## 15. Summary & Quick Wins

### Immediate Improvements (High Impact, Low Effort)

**Week 1:**
1. ✅ Implement rarity color system with glows
2. ✅ Add hover tooltips with item details
3. ✅ Create filter buttons with active states
4. ✅ Add weight bar with color-coded warnings

**Week 2:**
5. ✅ Implement basic drag-and-drop (desktop only)
6. ✅ Add context menu with common actions
7. ✅ Create item details panel
8. ✅ Add search functionality

**Week 3:**
9. ✅ Implement double-click to use/equip
10. ✅ Add equipment stats summary panel
11. ✅ Create loading states and animations
12. ✅ Optimize for mobile with touch gestures

### Future Enhancements

**Phase 2 Features:**
- Item comparison tool (side-by-side stats)
- Quick-equip loadout presets
- Inventory sorting automation
- Auto-loot filters
- Item durability indicators
- Repair/enchant UI integration
- Trade window
- Bank/vault system

**Advanced Features:**
- Item set bonuses display
- Transmog/appearance customization
- Item history tracking
- Achievement integration
- Social features (show off items)
- Marketplace integration

---

## Appendix: Code Snippets

### Complete Drag-and-Drop Implementation

See `C:\Users\ilmiv\ProjectArgent\complete_game\static\INVENTORY_SYSTEM_ENHANCED.html` for full implementation.

### API Endpoint Examples

```python
# In web_game.py
@app.route('/api/inventory/all')
def get_inventory():
    # Use existing inventory_system.py
    inventory = Inventory()
    # Load from database
    return jsonify({
        'items': [serialize_item(item) for item in inventory.slots],
        'equipped': inventory.equipped,
        'gold': inventory.gold,
        'capacity': inventory.capacity
    })

@app.route('/api/inventory/equip', methods=['POST'])
def equip_item():
    data = request.json
    item_id = data['item_id']
    slot = data['slot']

    # Validate and equip
    success = inventory.equip_item(item_id, slot)

    return jsonify({'success': success})
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Author:** UX Design Team
**Status:** Ready for Implementation
