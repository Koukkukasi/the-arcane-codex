# World Map System - Complete Documentation

## Overview

The World Map System for The Arcane Codex provides a fully interactive, fantasy-styled world map with fog of war, points of interest (POIs), zoom/pan controls, fast travel, and a minimap for real-time navigation.

---

## Features

### 1. **Hand-Drawn Fantasy Aesthetic**
- Parchment-style background with texture
- Medieval/fantasy color palette (browns, golds, earth tones)
- Ornate borders and decorative elements
- Region-specific color coding

### 2. **Fog of War System**
Three discovery states:
- **Unexplored**: Dark overlay with fog particles
- **Discovered**: Visible terrain and POIs
- **Current Location**: Highlighted with player marker

### 3. **Points of Interest (POIs)**
Seven POI types with unique icons and colors:

| Type | Icon | Color | Description |
|------|------|-------|-------------|
| Shop | 🏪 | Brown (#8B7355) | Markets, merchants, trading posts |
| Temple | 🏛️ | Gold (#FFD700) | Divine temples, shrines |
| Quest | ⚔️ | Gold (#FFD700) | Quest objectives, dungeons |
| NPC | 👥 | Green (#4CAF50) | Important characters |
| Danger | ⚠️ | Red (#FF4444) | Enemy camps, boss lairs |
| Exit | 🚪 | Blue (#4A9EFF) | Gates, portals, transitions |
| Inn | 🏨 | Orange (#D2691E) | Rest areas |

### 4. **Interactive Features**
- **Click POI**: Opens detail modal with description, services, NPCs
- **Zoom**: Mouse wheel or +/- buttons (0.5x - 3x)
- **Pan**: Click and drag to explore
- **Fast Travel**: Teleport to discovered locations (costs gold)
- **Quest Integration**: Highlights quest locations with pulsing markers

### 5. **Minimap**
- Always visible during gameplay (bottom-left corner)
- Shows simplified region view
- Player position indicator
- Viewport rectangle showing current zoom
- Collapsible to save screen space

---

## Visual Design

### Color Palette

```css
/* Primary Colors */
Parchment Background: #E8D7B5, #D4C4A0, #C0B090
Gold Accents: #FFD700, #D4AF37
Border Brown: #8B7355

/* Region Colors */
City: #8B7355 (Brown)
Forest: #2D5016 (Dark Green)
Desert: #8B4513 (Saddle Brown)
Mountains: #4A5568 (Slate Gray)
Swamp: #1A3A2A (Dark Teal)

/* UI Elements */
Overlay: rgba(0, 0, 0, 0.85)
Hover Highlight: rgba(212, 175, 55, 0.4)
Danger Red: #FF4444
```

### Typography

```css
Headings: 'Cinzel', serif (fantasy-style)
Body Text: System fonts with fallback
Icon Font Size: 16px - 24px
Label Font Size: 14px
```

### Layout Structure

```
┌─────────────────────────────────────────────────┐
│ Header (Map Title + Controls)                   │
├─────────────────────────────────────────────────┤
│ ┌────────┐                         ┌─────────┐ │
│ │Legend  │   Main Map Canvas       │ Zoom    │ │
│ │        │   (Pan & Zoom)          │Controls │ │
│ │ •Shop  │                         │   +     │ │
│ │ •Quest │                         │   -     │ │
│ └────────┘                         └─────────┘ │
└─────────────────────────────────────────────────┘
```

---

## Technical Implementation

### Architecture

**3-Layer System:**

1. **Data Layer** (`WORLD_MAP_DATA`)
   - Regions, POIs, roads
   - Discovery state
   - Quest associations

2. **Rendering Layer** (`WorldMapRenderer`)
   - Canvas-based drawing
   - Zoom/pan transformations
   - Fog of war rendering
   - POI icon rendering

3. **Integration Layer** (`MapIntegration`)
   - Game state synchronization
   - Event handling
   - API communication
   - Persistence

### Technology Choices

**Canvas vs SVG:**
- **Primary: HTML5 Canvas**
  - Better performance for many POIs
  - Easier custom fog effects
  - Smooth zoom/pan

- **SVG for Icons** (optional enhancement)
  - Scalable markers
  - Better text rendering

### File Structure

```
static/
├── js/
│   ├── world_map_system.js      # Core map renderer
│   ├── map_integration.js       # Game integration
│   └── quest_map_implementation.js  # Dungeon maps
├── css/
│   └── world_map.css            # Map styling
```

---

## Usage Guide

### Opening the Map

**Keyboard Shortcut:**
```javascript
Press 'M' key to toggle map
```

**Programmatic:**
```javascript
mapIntegration.openMap();
mapIntegration.closeMap();
```

### Discovering Locations

```javascript
// Reveal a specific POI
mapIntegration.discoverLocation('druid_grove');

// Reveal an entire region
mapIntegration.discoverRegion('elderwood');

// Check if location is discovered
const canTravel = mapIntegration.canFastTravelTo('valdria_temple');
```

### Quest Integration

```javascript
// Mark quest location on map
mapIntegration.markQuestLocation('forest_shrine', {
    id: 'elderwood_mystery',
    name: 'The Elderwood Mystery',
    description: 'Investigate the ancient shrine'
});

// Center map on quest
mapIntegration.centerOnQuest('elderwood_mystery');

// Listen for quest updates
document.addEventListener('questUpdated', (e) => {
    console.log('Quest updated:', e.detail);
});
```

### Fast Travel

```javascript
// Player clicks "Fast Travel" button in POI modal
// Automatically deducts gold and teleports player

// Listen for fast travel events
document.addEventListener('fastTravel', async (e) => {
    const { poi, cost } = e.detail;

    // Deduct gold
    await deductGold(cost);

    // Update player location
    updatePlayerLocation(poi.id);

    // Show transition animation
    showTravelAnimation();
});
```

### Custom POIs

```javascript
// Add a custom POI dynamically
WORLD_MAP_DATA.pois.push({
    id: 'secret_cave',
    name: 'Hidden Cave',
    type: 'quest',
    icon: '⚔️',
    position: { x: 0.55, y: 0.60 },
    region: 'elderwood',
    discovered: false,
    canFastTravel: false,
    description: 'A mysterious cave entrance',
    questId: 'cave_of_wonders'
});

// Refresh map
if (worldMapInstance) {
    worldMapInstance.render();
}
```

---

## POI Detail Modal

When clicking a POI, a modal displays:

```
┌─────────────────────────────────────┐
│ 🏪 Grand Market              [X]   │
├─────────────────────────────────────┤
│                                     │
│ The largest marketplace in Valdria  │
│                                     │
│ Services:                           │
│  ⚡ Buy                             │
│  ⚡ Sell                            │
│  ⚡ Repair                          │
│                                     │
├─────────────────────────────────────┤
│        [🚀 Fast Travel (50g)]       │
│              [Close]                │
└─────────────────────────────────────┘
```

### Modal Structure

```javascript
{
    header: {
        icon: '🏪',
        name: 'Grand Market',
        closeButton: true
    },
    body: {
        description: 'Text description',
        services: ['buy', 'sell', 'repair'],
        npcName: 'Merchant Guildmaster' (optional),
        enemyLevel: 5 (for danger zones)
    },
    actions: {
        fastTravel: { cost: 50, enabled: true },
        close: true
    }
}
```

---

## Fog of War Implementation

### How It Works

1. **Initial State**: Only Valdria city is discovered
2. **Discovery Triggers**:
   - Entering a region (proximity-based)
   - Completing quests
   - NPC dialogue reveals
   - Purchasing maps

3. **Visual Effect**:
```javascript
// Unexplored regions
ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
ctx.fillRect(x, y, width, height);

// Add fog particles
for (let i = 0; i < 20; i++) {
    const gradient = ctx.createRadialGradient(...);
    gradient.addColorStop(0, 'rgba(100, 100, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(100, 100, 100, 0)');
    // Draw fog cloud
}
```

4. **Persistence**: Saved to `localStorage`
```javascript
{
    explored: ['valdria_city', 'elderwood'],
    current: 'valdria_city'
}
```

---

## Zoom and Pan Controls

### Mouse Controls

| Action | Input |
|--------|-------|
| Pan | Click + Drag |
| Zoom In | Mouse Wheel Up |
| Zoom Out | Mouse Wheel Down |

### Button Controls

```html
<div class="map-zoom-controls">
    <button onclick="mapIntegration.zoomIn()">+</button>
    <button onclick="mapIntegration.zoomOut()">−</button>
</div>
```

### Zoom Limits

```javascript
minScale: 0.5   // 50% (zoomed out, see whole map)
maxScale: 3.0   // 300% (zoomed in, see details)
```

### Touch Gestures (Mobile)

- **Pan**: Single finger drag
- **Zoom**: Pinch gesture (future enhancement)

---

## Minimap

### Features

- **Fixed Position**: Bottom-left corner
- **Always Visible**: During gameplay
- **Simplified View**: Only regions and player
- **Collapsible**: Click `-` to minimize
- **Real-time Updates**: Reflects player movement

### Rendering

```javascript
class Minimap {
    render() {
        // Draw simplified regions
        regions.forEach(region => {
            if (explored) {
                ctx.fillStyle = region.color + '80'; // 50% opacity
                ctx.fillRect(x, y, w, h);
            }
        });

        // Draw player marker
        ctx.fillStyle = '#00FF00';
        ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Draw viewport rectangle
        ctx.strokeRect(viewX, viewY, viewW, viewH);
    }
}
```

---

## Performance Considerations

### Optimization Techniques

1. **Canvas Layering**
   - Background: Static (drawn once)
   - Regions: Semi-static (drawn on discovery)
   - POIs: Dynamic (drawn every frame)
   - Fog: Overlay (drawn last)

2. **Render Only When Needed**
```javascript
// Don't render if map is closed
if (!this.mapOpen) return;

// Don't render if nothing changed
if (!this.dirty) return;
```

3. **Debounced Pan/Zoom**
```javascript
let renderTimeout;
function onPanZoom() {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(() => {
        worldMap.render();
    }, 16); // ~60fps
}
```

4. **POI Culling**
```javascript
// Only draw POIs in viewport
pois.filter(poi => {
    return isInViewport(poi.position);
}).forEach(poi => {
    POIIconRenderer.renderIcon(ctx, poi);
});
```

### Mobile Performance

- Reduce particle count in fog
- Lower canvas resolution
- Disable shadows on low-end devices
- Use simpler icons

---

## Integration with Quest System

### Quest Markers

When a quest becomes active:

```javascript
// 1. Mark location on map
const questPOI = WORLD_MAP_DATA.pois.find(p => p.questId === 'elderwood_mystery');
questPOI.questActive = true;

// 2. Add pulsing indicator
// Rendered automatically in POIIconRenderer
if (poi.type === 'quest' && !poi.completed) {
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.fillStyle = `rgba(255, 215, 0, ${pulse})`;
    ctx.font = 'bold 16px serif';
    ctx.fillText('!', x + iconSize/2, y - iconSize/2);
}

// 3. Reveal area if undiscovered
mapIntegration.discoverLocation('forest_shrine');
```

### Quest Completion

```javascript
// Mark quest as complete
const poi = WORLD_MAP_DATA.pois.find(p => p.questId === questId);
poi.completed = true;
poi.questActive = false;

// Update icon rendering
// (Will no longer show pulsing '!' marker)
```

---

## API Endpoints (Backend Integration)

### Required Endpoints

```javascript
// Get player's discovered locations
GET /api/map/discovered
Response: {
    regions: ['valdria_city', 'elderwood'],
    pois: ['valdria_market', 'druid_grove']
}

// Fast travel to location
POST /api/fast_travel
Body: { destination: 'valdria_temple' }
Response: {
    success: true,
    goldSpent: 50,
    newLocation: 'valdria_temple',
    arrivalMessage: 'You arrive at the Temple of the Seven...'
}

// Discover location (when player explores)
POST /api/map/discover
Body: { locationId: 'bandit_camp' }
Response: {
    success: true,
    discovered: {
        id: 'bandit_camp',
        name: 'Bandit Hideout',
        regionRevealed: 'elderwood'
    }
}
```

---

## Customization Guide

### Adding New Regions

```javascript
WORLD_MAP_DATA.regions.push({
    id: 'new_region',
    name: 'Volcanic Peaks',
    bounds: { x: 0.8, y: 0.7, width: 0.15, height: 0.2 },
    type: 'volcano',
    color: '#8B0000', // Dark Red
    discovered: false,
    description: 'Scorching volcanic wasteland'
});
```

### Adding New POI Types

```javascript
// 1. Define in POIIconRenderer
static getIconColor(type) {
    const colors = {
        // ...existing
        library: '#9370DB',  // New: Library
    };
    return colors[type] || '#FFFFFF';
}

// 2. Add to legend
<div class="legend-item">
    <span class="legend-icon library">📚</span>
    <span>Libraries</span>
</div>

// 3. Add POI
WORLD_MAP_DATA.pois.push({
    id: 'arcane_library',
    name: 'Arcane Library',
    type: 'library',
    icon: '📚',
    position: { x: 0.42, y: 0.44 },
    region: 'valdria_city',
    discovered: true,
    services: ['research', 'learn_lore']
});
```

### Custom Map Themes

```css
/* Dark Theme */
.world-map-overlay.dark-theme {
    --map-bg: #1A1A1A;
    --map-border: #555;
    --map-text: #CCC;
}

/* Bright Theme */
.world-map-overlay.bright-theme {
    --map-bg: #F5F5DC; /* Beige */
    --map-border: #8B7355;
    --map-text: #333;
}
```

---

## Troubleshooting

### Map Not Opening

**Problem**: Pressing 'M' doesn't open map

**Solutions:**
1. Check if `world_map_system.js` is loaded
2. Verify `initMapIntegration()` was called
3. Check console for errors
4. Ensure canvas element exists

```javascript
// Debug
console.log(window.mapIntegration); // Should not be null
console.log(document.getElementById('world-map-canvas')); // Should exist
```

### POIs Not Clickable

**Problem**: Clicking POIs does nothing

**Solutions:**
1. Check if POI is discovered
2. Verify `poi.discovered === true`
3. Check click detection radius

```javascript
// Increase hit radius
const hitRadius = 30 / this.scale; // Larger radius
```

### Fog Not Clearing

**Problem**: Discovered areas still show fog

**Solutions:**
1. Verify fog state
```javascript
console.log(worldMap.fogOfWar.exploredAreas);
```

2. Force reveal
```javascript
worldMap.fogOfWar.revealArea('elderwood');
worldMap.render();
```

3. Clear saved state
```javascript
localStorage.removeItem('arcane_map_state');
```

### Performance Issues

**Problem**: Map is laggy or slow

**Solutions:**
1. Reduce canvas size
```javascript
<canvas width="1600" height="1200"> <!-- Instead of 2000x1400 -->
```

2. Disable fog particles on mobile
```javascript
if (isMobile) {
    // Skip fog particle rendering
}
```

3. Lower render frequency
```javascript
const renderInterval = setInterval(() => {
    worldMap.render();
}, 100); // Render every 100ms instead of every frame
```

---

## Future Enhancements

### Planned Features

1. **Dynamic Events**
   - Weather effects (rain, snow)
   - Day/night cycle
   - Seasonal changes

2. **Advanced Interactions**
   - Route planning (show path between POIs)
   - Distance calculator
   - Travel time estimates

3. **Multiplayer**
   - Show all party members on map
   - Real-time position updates
   - Shared discovery

4. **3D View** (Optional)
   - Isometric perspective
   - Height-based terrain
   - Animated clouds

5. **Procedural Dungeons**
   - Auto-generated layouts
   - Different dungeon types
   - Random loot placement

---

## Testing Checklist

- [ ] Map opens with 'M' key
- [ ] Map closes with 'M' key or close button
- [ ] Zoom in/out works (mouse wheel + buttons)
- [ ] Pan works (click + drag)
- [ ] POI click opens modal
- [ ] Fast travel deducts gold
- [ ] Fog of war reveals correctly
- [ ] Minimap shows player position
- [ ] Legend displays all POI types
- [ ] Mobile touch gestures work
- [ ] Quest markers pulse
- [ ] Map state persists (localStorage)
- [ ] Responsive design (tablet, phone)
- [ ] Keyboard shortcuts work
- [ ] No console errors

---

## Credits

**Design Inspired By:**
- Classic fantasy RPG world maps
- Medieval cartography
- Parchment aesthetics

**Technologies:**
- HTML5 Canvas
- Vanilla JavaScript (no frameworks)
- CSS3 animations

**Fonts:**
- Cinzel (Google Fonts) - Fantasy headings
- System fonts - Body text

---

## Support

For issues or questions:
1. Check this documentation
2. Review code comments in `world_map_system.js`
3. Test in browser console
4. Check browser compatibility (Chrome, Firefox, Safari, Edge)

**Minimum Browser Requirements:**
- HTML5 Canvas support
- ES6 JavaScript
- LocalStorage API
- CSS Grid & Flexbox

---

**End of Documentation**
