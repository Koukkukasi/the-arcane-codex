# World Map System - Visual Design Mockup

## Full Map View (Opened with 'M' key)

```
╔═════════════════════════════════════════════════════════════════════════════════════╗
║  ⚔️ World Map of Valdria                    [📖 Legend] [🎯 Reset] [✕ Close (M)]  ║
╠═════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                     ║
║  ┌──────────┐                                                            ┌────┐   ║
║  │ LEGEND   │     ╔══════════════════════════════════════════════╗       │ +  │   ║
║  │          │     ║                                              ║       ├────┤   ║
║  │ 🏪 Shops │     ║    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░        ║       │ -  │   ║
║  │ 🏛️ Temple│     ║    ░░░ FROSTPEAK MOUNTAINS ░░░░░░░          ║       └────┘   ║
║  │ ⚔️ Quests│     ║    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░         ║                ║
║  │ 👥 NPCs  │     ║                          🏪                  ║                ║
║  │ ⚠️ Danger│     ║           ELDERWOOD         ⚠️              ║                ║
║  │ 🚪 Exits │     ║            FOREST        🏛️                 ║                ║
║  └──────────┘     ║         👥                                   ║                ║
║                   ║      ⚔️      🏪                              ║                ║
║                   ║         ┌─────────────┐                      ║                ║
║                   ║         │  VALDRIA    │                      ║                ║
║                   ║         │   (City)    │                      ║                ║
║                   ║         │  🏪 🏛️ 🏨  │                      ║                ║
║                   ║         │    ● 👤     │  ← Player Location   ║                ║
║                   ║         └─────────────┘                      ║                ║
║                   ║                                              ║                ║
║                   ║   ░░░░░░░░░░░░░░░░░░░░░░░░░░░                ║                ║
║                   ║   ░░ SHADOWFEN SWAMP ░░░░                    ║                ║
║                   ║   ░░░░░░░░░░░░░░░░░░░░░░░░                   ║                ║
║                   ║                                              ║                ║
║                   ║            ░░░░░░░░░░░░░░░░░░░░░░░░░░        ║                ║
║                   ║            ░░ CRIMSON WASTES ░░░░░           ║                ║
║                   ║            ░░░░░░░░░░░░░░░░░░░░░░            ║                ║
║                   ╚══════════════════════════════════════════════╝                ║
║                                                                                     ║
║                                                      Zoom: 100%                     ║
╚═════════════════════════════════════════════════════════════════════════════════════╝

Legend:
  ░░░ = Unexplored (Fog of War)
  🏪  = Shop/Market
  🏛️  = Temple
  ⚔️  = Quest Location
  👥  = NPC
  ⚠️  = Danger Zone
  🚪  = Exit/Gate
  🏨  = Inn
  👤  = Player (Green pulsing marker)
  ●   = Current Location
```

---

## POI Detail Modal (Clicked on Temple)

```
                        ╔═══════════════════════════════════╗
                        ║  🏛️ Temple of the Seven      [X] ║
                        ╠═══════════════════════════════════╣
                        ║                                   ║
                        ║  Divine temple to the seven gods  ║
                        ║  where truth is revealed.         ║
                        ║                                   ║
                        ║  Services:                        ║
                        ║   ⚡ Heal wounds                  ║
                        ║   ⚡ Receive blessings            ║
                        ║   ⚡ Accept divine quests         ║
                        ║                                   ║
                        ╠═══════════════════════════════════╣
                        ║  [🚀 Fast Travel (50g)]  [Close] ║
                        ╚═══════════════════════════════════╝
```

---

## Minimap (Always Visible During Gameplay)

```
┌────────────────────┐
│ World Map      [-] │ ← Click to collapse
├────────────────────┤
│  ░░░░             │
│  ░FRST░           │
│  ░░░░             │
│    ┌───┐          │
│    │ V │          │ V = Valdria
│    └───┘          │
│      👤           │ Player marker
│                   │
│  ░░░░░            │
│  ░SWMP░           │
│  ░░░░░            │
└────────────────────┘

Simplified view showing:
- Regions (abbreviated)
- Player position (green dot)
- Fog coverage
```

---

## Map States

### 1. Fully Zoomed Out (0.5x - Overview)

```
╔══════════════════════════════════════════════╗
║                                              ║
║   ░░FRST░        ░░░MNTS░░░                 ║
║   ░░░░░          ░░░░░░░                    ║
║                                              ║
║         [VALDRIA]                            ║
║            👤                                ║
║                                              ║
║   ░░SWMP░              ░░DESERT░░           ║
║   ░░░░                  ░░░░░░              ║
║                                              ║
╚══════════════════════════════════════════════╝

Can see entire world at once
```

### 2. Standard View (1.0x - Default)

```
╔══════════════════════════════════════════════╗
║                                              ║
║     ELDERWOOD FOREST                         ║
║                                              ║
║       👥  ⚔️                                 ║
║                                              ║
║     ┌───────────────┐                        ║
║     │   VALDRIA     │                        ║
║     │               │                        ║
║     │  🏪 🏛️ 🏨    │                        ║
║     │      👤       │                        ║
║     └───────────────┘                        ║
║                                              ║
╚══════════════════════════════════════════════╝

Standard exploration view
```

### 3. Zoomed In (3.0x - Detail View)

```
╔══════════════════════════════════════════════╗
║                                              ║
║                                              ║
║              ┌─────────────┐                 ║
║              │  VALDRIA    │                 ║
║              │   CITY      │                 ║
║              │             │                 ║
║              │    🏪       │                 ║
║              │  Grand      │                 ║
║              │  Market     │                 ║
║              │             │                 ║
║              │     👤      │                 ║
║              │             │                 ║
║              │    🏛️      │                 ║
║              │  Temple     │                 ║
║              └─────────────┘                 ║
║                                              ║
╚══════════════════════════════════════════════╝

Can see individual POI labels
```

---

## Quest Marker Pulse Animation

### Frame 1 (t=0ms)
```
    !
   ⚔️
 SHRINE
```

### Frame 2 (t=150ms)
```
    ❗
   ⚔️
 SHRINE
```

### Frame 3 (t=300ms)
```
    ‼️
   ⚔️
 SHRINE
```

Cycles continuously for active quests

---

## Fog of War Reveal Animation

### Before Discovery
```
░░░░░░░░░░
░░░░░░░░░░
░░░░░░░░░░
░░░░░░░░░░
```

### During Reveal (t=0-1000ms)
```
░░░░░░░░░░
░░░    ░░░
░  🏪  ░░░
░░░░░░░░░░
```

### After Reveal
```

    🏪
  MARKET

```

Smooth fade-out effect with ripple

---

## Color-Coded Regions

```
┌─────────────────────────────────────┐
│                                     │
│  ELDERWOOD (Green tint)             │
│  🌲🌲🌲                             │
│                                     │
│  VALDRIA (Brown/Tan)                │
│  🏰                                 │
│                                     │
│  FROSTPEAK (Blue/Gray)              │
│  ⛰️❄️                               │
│                                     │
│  CRIMSON WASTES (Red/Orange)        │
│  🏜️🌵                               │
│                                     │
│  SHADOWFEN (Dark Green)             │
│  🌿💀                               │
└─────────────────────────────────────┘
```

---

## Interactive Elements

### Hover Effect
```
Before Hover:
  🏪
Market

During Hover:
╔═══════════╗
║   🏪      ║  ← Glow effect
║  MARKET   ║  ← Label appears
╚═══════════╝
    Cursor changes to pointer
```

### Click Feedback
```
Click:
  🏪  →  💫 🏪 💫  →  [Modal Opens]
      Sparkle       Detail window
      effect
```

---

## Road/Path Rendering

```
     VALDRIA
        │
    ····│····  ← Dashed line (discovered)
   ·    │   ·
  ·     │    ·
 ·      ▼     ·
·    SHRINE    ·
·              ·
 ·    ░░░    ·   ← Fog (undiscovered path)
  ·   ░░░   ·
   ···░░░···
```

---

## Region Border Styles

### Discovered Region
```
┌ ─ ─ ─ ─ ─ ─ ─ ┐  ← Dashed border
                     (region color)
│   ELDERWOOD   │
│               │
│  (Visible)    │
└ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Undiscovered Region
```
███████████████████  ← Solid dark
█                 █
█   ░░░░░░░       █
█   ░░░░░         █
█   ░░░           █
███████████████████
```

---

## Fast Travel Animation Concept

```
Step 1: Fade Out
  Valdria
    👤   →  💨👤💨  →  (transparent)

Step 2: Map Pan/Zoom
  [Map smoothly pans to destination]
  [Zoom level adjusts]

Step 3: Fade In
  (transparent)  →  ✨👤✨  →  Temple
                                👤

Step 4: Arrival
  🏛️ Temple
     👤
  "You arrive at the Temple of the Seven"
```

---

## Responsive Layout (Mobile)

```
┌─────────────────────┐
│  Map         [X]    │
├─────────────────────┤
│                     │
│   ┌─────────┐       │
│   │VALDRIA  │       │
│   │   👤    │       │
│   └─────────┘       │
│                     │
│  Legend hidden      │
│  (tap icon to view) │
│                     │
├─────────────────────┤
│   [+]  [−]  [🎯]   │
└─────────────────────┘

Simplified for small screens:
- Legend collapses
- Larger touch targets
- Simplified region names
```

---

## Quest Integration Example

```
Quest Board:
┌─────────────────────────────────┐
│ ACTIVE QUESTS                   │
├─────────────────────────────────┤
│ ⚔️ The Elderwood Mystery        │
│    📍 Forest Shrine  [Show Map] │ ← Click to center on location
│                                 │
│ ⚔️ Lost Pyramid                 │
│    📍 Crimson Wastes [Show Map] │
│                                 │
└─────────────────────────────────┘

Map View (after clicking "Show Map"):
╔════════════════════════════════╗
║     [Centered on quest POI]    ║
║                                ║
║           ⚔️ !                 ║  ← Pulsing marker
║        FOREST SHRINE           ║
║                                ║
║  [Accept Quest] [Fast Travel]  ║
╚════════════════════════════════╝
```

---

## Implementation Preview

### HTML Structure
```html
<div class="world-map-overlay" id="world-map-overlay">
  <div class="world-map-header">
    <h1>⚔️ World Map of Valdria</h1>
    <div class="world-map-controls">
      <button>📖 Legend</button>
      <button>🎯 Reset</button>
      <button>✕ Close</button>
    </div>
  </div>

  <div class="world-map-canvas-container">
    <canvas id="world-map-canvas"></canvas>

    <div class="map-zoom-controls">
      <button>+</button>
      <button>−</button>
    </div>

    <div class="world-map-legend">
      <!-- Legend items -->
    </div>
  </div>
</div>
```

### CSS Gradient Background (Parchment)
```css
background: linear-gradient(
  135deg,
  #E8D7B5 0%,
  #D4C4A0 50%,
  #C0B090 100%
);

/* Add texture */
background-image:
  url('data:image/svg+xml,...'), /* Noise texture */
  linear-gradient(...);
```

---

## Performance Benchmarks

Target Performance:
- **Initial Load**: < 500ms
- **Pan/Zoom**: 60 FPS
- **POI Click**: < 100ms response
- **Fog Reveal**: Smooth 30 FPS animation
- **Memory**: < 50 MB

---

## Accessibility Features

### Keyboard Navigation
```
M          - Toggle map
+/-        - Zoom in/out
Arrow Keys - Pan map
Enter      - Select focused POI
Esc        - Close map/modal
Tab        - Navigate POIs
```

### Screen Reader Support
```html
<canvas aria-label="Interactive world map of Valdria">
  <!-- Fallback content -->
  <div role="region" aria-label="Map legend">
    <ul>
      <li>Shop locations marked with 🏪</li>
      <li>Quest locations marked with ⚔️</li>
      <!-- etc -->
    </ul>
  </div>
</canvas>
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .world-map-overlay {
    --border-width: 3px;
    --text-shadow: 2px 2px 0 #000;
    --icon-scale: 1.2;
  }
}
```

---

## Visual Style Guide

### Typography Hierarchy
```
H1 (Map Title)
  Font: Cinzel, 28px, Bold
  Color: #FFD700 (Gold)
  Shadow: 2px 2px 4px rgba(0,0,0,0.8)

H2 (Region Names)
  Font: Cinzel, 20px, Italic
  Color: [Region Color]

H3 (POI Names)
  Font: Cinzel, 14px, Bold
  Color: #FFD700

Body Text
  Font: System, 14px
  Color: #D4AF37
```

### Icon Sizing
```
POI Icons:    30px × 30px
Quest Marker: 16px (! symbol)
Player:       20px × 20px (pulsing)
Minimap POI:  8px × 8px
```

### Animation Timing
```
Fade In:     300ms ease-in
Fade Out:    200ms ease-out
Pulse:       2000ms infinite
Zoom:        150ms ease-in-out
Pan:         100ms linear
```

---

**End of Visual Design Mockup**

These mockups show the complete visual design and user experience of the world map system.
All elements are implemented in the actual code files!
