# Skills & Abilities System - Visual Style Guide
## The Arcane Codex - Design Specifications

---

## Color Palette

### Skill Node States

```css
/* Locked State */
Border: #3f3f46 (--color-shadow-700)
Background: rgba(39, 39, 42, 0.5)
Opacity: 0.5
Icon: Grayscale

/* Available State (Can be unlocked) */
Border: #f59e0b (--color-divine-500)
Background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.05))
Glow: 0 0 20px rgba(245, 158, 11, 0.5)
Animation: Pulsing glow (2s infinite)

/* Unlocked State */
Border: #8b1fff (--color-arcane-500)
Background: linear-gradient(135deg, rgba(139, 31, 255, 0.2), rgba(139, 31, 255, 0.05))
Glow: 0 0 20px rgba(139, 31, 255, 0.4)

/* Max Rank State */
Border: #14b8a6 (--color-mystic-500)
Background: linear-gradient(135deg, rgba(20, 184, 166, 0.2), rgba(20, 184, 166, 0.05))
Glow: 0 0 20px rgba(20, 184, 166, 0.4)

/* Ultimate Ability */
Border: #fbbf24 (--color-divine-400)
Size: 120px × 120px (larger than normal)
```

### Connection Lines

```css
/* Unlocked Path */
Stroke: #a44eff (--color-arcane-400)
Stroke-Width: 3px
Filter: drop-shadow(0 0 4px rgba(139, 31, 255, 0.6))

/* Locked Path */
Stroke: #52525b (--color-shadow-600)
Stroke-Width: 3px
Stroke-Dasharray: 5, 5 (dashed)
Opacity: 0.3
```

### Action Bar Colors

```css
/* Normal Slot */
Background: #27272a (--color-surface)
Border: 2px solid #3f3f46 (--color-border)

/* Hover State */
Border: #8b1fff (--color-arcane-500)
Box-Shadow: 0 0 20px rgba(139, 31, 255, 0.4)
Transform: translateY(-4px)

/* Drag Over State */
Border: #fbbf24 (--color-divine-400)
Background: rgba(245, 158, 11, 0.1)
Box-Shadow: 0 0 30px rgba(245, 158, 11, 0.6)

/* Cooldown Overlay */
Background: rgba(0, 0, 0, 0.75)
Text: white with shadow
```

---

## Typography

### Font Families

```css
--font-display: 'Cinzel', 'Georgia', serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'Fira Code', 'Monaco', 'Courier New', monospace;
```

### Font Sizes

```css
/* Skill Tree */
.skill-node-name {
  font-size: 12px (--font-size-xs);
  font-weight: 600;
}

.skill-node-rank {
  font-size: 12px (--font-size-xs);
  font-weight: 700;
}

/* Ability Cards */
.ability-card-name {
  font-size: 18px (--font-size-lg);
  font-weight: 700;
}

.ability-card-type {
  font-size: 12px (--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Headings */
.overlay-title h2 {
  font-family: var(--font-display);
  font-size: 24px (--font-size-2xl);
  font-weight: 700;
}

/* Body Text */
.skill-detail-description p {
  font-size: 14px (--font-size-sm);
  line-height: 1.625;
}
```

---

## Component Specifications

### Skill Node

**Desktop Dimensions:**
```
Width: 100px
Height: 100px
Border-Radius: 12px (--radius-xl)
Border-Width: 3px
Padding: Internal spacing for icon/text
```

**Mobile Dimensions:**
```
Width: 70px
Height: 70px
Icon Font-Size: 32px (reduced from 48px)
```

**Icon Size:**
```
Desktop: 48px (--font-size-3xl)
Mobile: 32px
```

**Rank Badge:**
```
Font-Size: 12px
Padding: 2px 8px
Background: rgba(0, 0, 0, 0.5)
Border-Radius: 9999px (full pill)
```

**Positioning (Example):**
```css
.skill-node {
  position: absolute;
  left: 50%; /* Percentage from container */
  top: 10%; /* Percentage from container */
  transform: translate(-50%, -50%); /* Center on position */
}
```

### Ability Card

**Desktop Layout:**
```
Width: 100% of grid column (minmax(280px, 1fr))
Padding: 16px (--space-4)
Border-Radius: 8px (--radius-lg)
Border: 2px solid
```

**Mobile Layout:**
```
Display: flex (row instead of column)
Icon: Flex-shrink: 0
Body: Flex: 1
```

**Card Sections:**
```
Header (Icon + Level):
  - Icon: 56px × 56px circle
  - Level badge: Top-right corner

Body (Name, Type, Stats):
  - Name: Bold, large
  - Type: Small, uppercase
  - Cost/Cooldown: Two-column flex

Footer (Details Button):
  - Full width
  - Padding: 8px 12px
```

### Action Bar Slot

**Desktop:**
```
Width: 64px
Height: 64px
Gap between slots: 8px
Border-Radius: 8px (--radius-lg)
```

**Tablet:**
```
Width: 60px
Height: 60px
```

**Mobile:**
```
Width: 56px
Height: 56px
Min-Width: 56px (prevent shrinking)
```

**Icon:**
```
Font-Size: 32px
Centered within slot
```

**Hotkey Badge:**
```
Position: Absolute bottom-right
Font-Size: 12px
Background: rgba(0, 0, 0, 0.6)
Padding: 2px 6px
Border-Radius: 4px (--radius-sm)
```

### Overlay Panel

**Dimensions:**
```
Width: 95% of viewport
Max-Width: 1400px
Height: 90vh
Max-Height: 900px
```

**Header:**
```
Height: Auto
Padding: 24px (--space-6)
Background: linear-gradient with transparency
Border-Bottom: 2px solid
```

**Body:**
```
Flex: 1 (take remaining space)
Overflow-Y: auto
Padding: 24px (--space-6)
```

**Mobile Adjustments:**
```
Width: 100%
Height: 100vh
Border-Radius: 0 (full screen)
```

---

## Spacing System

### Grid Gaps

```css
.abilities-grid {
  gap: 16px (--space-4);
}

.skill-tree-container {
  gap: 24px (--space-6);
}

.action-bar-slots {
  gap: 8px (--action-slot-gap);
}
```

### Internal Padding

```css
/* Skill Node */
padding: Internal (auto-calculated for centering)

/* Ability Card */
padding: 16px (--space-4)

/* Modal Content */
padding: 24px (--space-6)

/* Small Components */
padding: 8px 12px (--space-2, --space-3)
```

### Margin Between Sections

```css
margin-bottom: 24px (--space-6) /* Between major sections */
margin-bottom: 16px (--space-4) /* Between related items */
margin-bottom: 12px (--space-3) /* Between text elements */
```

---

## Animation Specifications

### Duration Scale

```css
--duration-fast: 150ms     /* Micro-interactions */
--duration-base: 250ms     /* Standard transitions */
--duration-slow: 350ms     /* Panel animations */
--duration-slower: 500ms   /* Celebrations */
--duration-slowest: 1000ms /* Complex sequences */
```

### Easing Functions

```css
--ease-linear: linear
--ease-in: cubic-bezier(0.4, 0, 1, 1)
--ease-out: cubic-bezier(0, 0, 0.2, 1)      /* Most common */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55)
--ease-elastic: cubic-bezier(0.68, -0.6, 0.32, 1.6)
```

### Hover Transitions

```css
.skill-node:hover {
  transition: transform 200ms ease-out;
  transform: translate(-50%, -50%) scale(1.1);
}

.ability-card:hover {
  transition: all 250ms ease-out;
  transform: translateY(-4px);
}

.action-slot:hover {
  transition: all 200ms ease-out;
  transform: translateY(-4px);
}
```

### Keyframe Examples

**Pulse Animation:**
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
/* Apply: animation: pulse 2s ease-in-out infinite; */
```

**Glow Pulse:**
```css
@keyframes glowPulse {
  0% {
    box-shadow: 0 0 0 0 rgba(139, 31, 255, 0.7);
  }
  70% {
    box-shadow: 0 0 0 20px rgba(139, 31, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(139, 31, 255, 0);
  }
}
/* Apply: animation: glowPulse 2s infinite; */
```

**Fade In Up:**
```css
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
/* Apply: animation: fadeInUp 250ms ease-out; */
```

---

## Icons & Emoji

### Skill Icons (Examples)

```
Combat:
⚔️ Basic Combat
🗡️ Weapon Mastery
💥 Power Strikes
🌪️ Whirlwind
🔥 Berserker Rage

Magic:
🔮 Arcane Fundamentals
✨ Spell Weaving
🔥 Fireball
⚡ Lightning Bolt
🧊 Ice Storm
💫 Arcane Mastery

Defense:
🛡️ Shield Block
🏰 Defensive Stance
💎 Diamond Skin

Utility:
💚 Healing Light
💨 Quick Dash
🎯 Precision
```

### Status Icons

```
Available: ⭐ (star)
Locked: 🔒 (lock)
Max Rank: ✓ (checkmark)
Warning: ⚠️ (warning)
Info: ℹ️ (info)
```

---

## Shadow & Depth

### Shadow Layers

```css
/* Elevation 1 - Cards */
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1),
            0 1px 2px rgba(0, 0, 0, 0.06);

/* Elevation 2 - Raised Cards */
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1),
            0 2px 4px rgba(0, 0, 0, 0.06);

/* Elevation 3 - Modals */
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1),
            0 4px 6px rgba(0, 0, 0, 0.05);

/* Elevation 4 - Overlays */
box-shadow: 0 20px 25px rgba(0, 0, 0, 0.1),
            0 10px 10px rgba(0, 0, 0, 0.04);

/* Glow - Arcane */
box-shadow: 0 0 20px rgba(139, 31, 255, 0.5);

/* Glow - Divine */
box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);

/* Glow - Mystic */
box-shadow: 0 0 20px rgba(20, 184, 166, 0.5);
```

### Text Shadows

```css
/* Heading Glow */
text-shadow: 0 2px 8px rgba(139, 31, 255, 0.5);

/* Divine Text */
text-shadow: 0 2px 8px rgba(245, 158, 11, 0.5);

/* Readable Text on Dark */
text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
```

---

## Border Styles

### Standard Borders

```css
/* Default */
border: 2px solid var(--color-border);

/* Hover */
border: 2px solid var(--color-arcane-500);

/* Active */
border: 2px solid var(--color-divine-500);

/* Error */
border: 2px solid var(--color-danger);
```

### Border Radius

```css
--radius-sm: 4px    /* Small elements */
--radius-base: 6px  /* Default */
--radius-md: 8px    /* Cards */
--radius-lg: 12px   /* Large cards, nodes */
--radius-xl: 16px   /* Panels */
--radius-2xl: 24px  /* Modals */
--radius-full: 9999px /* Pills, circles */
```

---

## States & Interactions

### Skill Node States

**Default (Unlocked):**
```css
opacity: 1;
cursor: pointer;
transition: transform 200ms ease-out;
```

**Hover:**
```css
transform: translate(-50%, -50%) scale(1.1);
box-shadow: 0 0 30px rgba(139, 31, 255, 0.6);
```

**Active (Clicked):**
```css
transform: translate(-50%, -50%) scale(0.95);
```

**Selected:**
```css
border-color: var(--color-divine-400);
box-shadow: 0 0 40px rgba(245, 158, 11, 0.8);
```

**Locked:**
```css
opacity: 0.5;
cursor: not-allowed;
filter: grayscale(1);
```

### Ability Card States

**Default:**
```css
background: var(--ability-unlocked-bg);
border: 2px solid var(--color-arcane-500);
transform: translateY(0);
```

**Hover:**
```css
transform: translateY(-4px);
box-shadow: 0 8px 20px rgba(139, 31, 255, 0.3);
```

**Dragging:**
```css
opacity: 0.5;
cursor: grabbing;
```

**Assigned (Has Hotkey):**
```css
/* Show badge */
.ability-assigned-badge {
  display: block;
}
```

### Action Slot States

**Empty:**
```css
opacity: 0.5;
border: 2px dashed var(--color-border);
```

**Filled:**
```css
opacity: 1;
border: 2px solid var(--color-border);
```

**Hover (with ability):**
```css
border-color: var(--color-arcane-500);
transform: translateY(-4px);
box-shadow: 0 0 20px rgba(139, 31, 255, 0.4);
```

**Drag Over:**
```css
border-color: var(--color-divine-400);
background: rgba(245, 158, 11, 0.1);
box-shadow: 0 0 30px rgba(245, 158, 11, 0.6);
```

**On Cooldown:**
```css
/* Overlay visible */
.ability-cooldown-overlay {
  display: flex;
}
```

---

## Responsive Adjustments

### Desktop (1280px+)

```css
.skill-node { width: 100px; height: 100px; }
.ability-card { grid-column: span 1; }
.action-slot { width: 64px; height: 64px; }
.overlay-panel { max-width: 1400px; }
```

### Tablet (768-1024px)

```css
.skill-node { width: 85px; height: 85px; }
.ability-card { grid-column: span 1; }
.action-slot { width: 60px; height: 60px; }
.overlay-panel { max-width: 95%; }
```

### Mobile (< 768px)

```css
.skill-node { width: 70px; height: 70px; }
.ability-card {
  flex-direction: row;
  grid-column: span 1;
}
.action-slot { width: 56px; height: 56px; }
.overlay-panel {
  width: 100%;
  height: 100vh;
  border-radius: 0;
}
```

---

## Accessibility Specifications

### Focus Indicators

```css
.skill-node:focus-visible,
.ability-card:focus-visible,
.action-slot:focus-visible {
  outline: 3px solid var(--color-arcane-400);
  outline-offset: 4px;
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .skill-node,
  .ability-card,
  .action-slot {
    border-width: 3px;
  }

  .tree-connection {
    stroke-width: 5px;
  }
}
```

### Minimum Touch Targets

```css
/* All interactive elements */
min-width: 44px;
min-height: 44px;

/* Mobile */
@media (max-width: 768px) {
  .action-slot {
    min-width: 56px;
    min-height: 56px;
  }
}
```

---

## Code Snippet Library

### Create a Skill Node

```html
<div class="skill-node unlocked"
     data-skill-id="fireball"
     style="left: 50%; top: 25%;">
  <div class="skill-node-icon">🔥</div>
  <div class="skill-node-rank">3/5</div>
  <div class="skill-node-name">Fireball</div>
</div>
```

### Create an Ability Card

```html
<div class="ability-card unlocked draggable"
     draggable="true"
     data-ability-id="fireball">
  <div class="ability-card-header">
    <div class="ability-card-icon">🔥</div>
    <div class="ability-card-level">Rank 4</div>
  </div>
  <div class="ability-card-body">
    <h4 class="ability-card-name">Fireball</h4>
    <div class="ability-card-type">Active - Magic</div>
    <div class="ability-card-cost">
      <span class="cost-label">Cost:</span>
      <span class="cost-value">50 MP</span>
    </div>
    <div class="ability-card-cooldown">
      <span class="cooldown-label">Cooldown:</span>
      <span class="cooldown-value">8.0s</span>
    </div>
  </div>
  <div class="ability-card-footer">
    <button class="btn-ability-details">View Details</button>
  </div>
  <div class="ability-assigned-badge">Hotkey: 2</div>
</div>
```

### Create an Action Slot

```html
<div class="action-slot" data-hotkey="1" data-ability-id="fireball">
  <div class="ability-icon">🔥</div>
  <div class="ability-hotkey">1</div>
  <div class="ability-cooldown-overlay" style="display: none;">
    <div class="cooldown-progress"></div>
    <div class="cooldown-text">8.5s</div>
  </div>
</div>
```

### Show a Notification

```javascript
showNotification(
  "Skill Unlocked!",
  "Fireball has been unlocked. Assign it to your action bar.",
  "success"
);
```

### Trigger Celebration

```javascript
showSkillUnlockCelebration(
  "Skill Unlocked!",
  "Arcane Fundamentals",
  "You've taken your first steps into the arcane arts."
);
```

---

## Print-Ready Color Swatches

```
Arcane Purple (Primary):
■ #8b1fff    RGB(139, 31, 255)    HSL(279, 100%, 56%)

Divine Gold (Secondary):
■ #f59e0b    RGB(245, 158, 11)    HSL(43, 93%, 50%)

Mystic Teal (Accent):
■ #14b8a6    RGB(20, 184, 166)    HSL(173, 80%, 40%)

Shadow Gray (Background):
■ #09090b    RGB(9, 9, 11)        HSL(240, 10%, 4%)

Surface Gray:
■ #27272a    RGB(39, 39, 42)      HSL(240, 4%, 16%)

Border Gray:
■ #3f3f46    RGB(63, 63, 70)      HSL(240, 5%, 26%)

Danger Red:
■ #ef4444    RGB(239, 68, 68)     HSL(0, 84%, 60%)
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Purpose:** Visual design reference for developers and designers
**Project:** The Arcane Codex - Phase J
