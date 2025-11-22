# Map & Settings Overlays - Integration Guide
## The Arcane Codex - Phase 3

---

## Overview

This guide provides complete integration instructions for the **Map Overlay** and **Settings Overlay** systems for The Arcane Codex game.

---

## Files Created

### HTML Overlays
- `C:\Users\ilmiv\ProjectArgent\complete_game\static\overlays\map_overlay.html`
- `C:\Users\ilmiv\ProjectArgent\complete_game\static\overlays\settings_overlay.html`

### CSS Stylesheets
- `C:\Users\ilmiv\ProjectArgent\complete_game\static\css\map_overlay.css`
- `C:\Users\ilmiv\ProjectArgent\complete_game\static\css\settings_overlay.css`

### JavaScript Managers
- `C:\Users\ilmiv\ProjectArgent\complete_game\static\js\map_overlay.js`
- `C:\Users\ilmiv\ProjectArgent\complete_game\static\js\settings_overlay.js`

---

## Integration Steps

### 1. Add HTML Overlays to Main Game Page

In your main game HTML file (e.g., `index.html` or `game.html`), add these includes before the closing `</body>` tag:

```html
<!-- Map Overlay -->
<div id="mapOverlayContainer"></div>

<!-- Settings Overlay -->
<div id="settingsOverlayContainer"></div>

<!-- Load overlay HTML via JavaScript or server-side include -->
<script>
    // Load map overlay
    fetch('/static/overlays/map_overlay.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('mapOverlayContainer').innerHTML = html;
        });

    // Load settings overlay
    fetch('/static/overlays/settings_overlay.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('settingsOverlayContainer').innerHTML = html;
        });
</script>
```

### 2. Include CSS Stylesheets

Add these stylesheet links in your `<head>` section:

```html
<!-- Map Overlay Styles -->
<link rel="stylesheet" href="/static/css/map_overlay.css">

<!-- Settings Overlay Styles -->
<link rel="stylesheet" href="/static/css/settings_overlay.css">
```

### 3. Include JavaScript Managers

Add these script tags before the closing `</body>` tag, **after** the overlay HTML:

```html
<!-- Map Overlay Manager -->
<script src="/static/js/map_overlay.js"></script>

<!-- Settings Overlay Manager -->
<script src="/static/js/settings_overlay.js"></script>
```

---

## Usage

### Map Overlay

#### Opening the Map

```javascript
// From anywhere in your game code
window.mapOverlay.open();

// Or toggle
window.mapOverlay.toggle();
```

#### Keyboard Shortcut

The map opens with the **M** key by default. To integrate with your keybind system:

```javascript
document.addEventListener('keydown', (e) => {
    if (e.key === 'M' || e.key === 'm') {
        window.mapOverlay.toggle();
    }
});
```

#### Adding Map Button to UI

```html
<button id="mapButton" class="ui-button">
    <span class="btn-icon">🗺️</span>
    <span class="btn-label">Map</span>
</button>

<script>
    document.getElementById('mapButton').addEventListener('click', () => {
        window.mapOverlay.toggle();
    });
</script>
```

#### API Methods

```javascript
// Open/Close
mapOverlay.open();
mapOverlay.close();
mapOverlay.toggle();

// Player position
mapOverlay.setPlayerPosition(x, y);

// Discover location
mapOverlay.discoverLocation('location-id');

// Add POI (Point of Interest)
mapOverlay.addPOI({
    id: 'unique-poi-id',
    type: 'shop', // 'shop', 'quest', 'npc', 'danger', 'waypoint', 'treasure', 'boss'
    icon: '🏪',
    name: 'POI Name',
    description: 'POI description',
    position: { x: 400, y: 300 },
    discovered: true
});

// Update exploration stats
mapOverlay.updateExplorationStats();
```

### Settings Overlay

#### Opening Settings

```javascript
// From anywhere in your game code
window.settingsOverlay.open();

// Or toggle
window.settingsOverlay.toggle();
```

#### Keyboard Shortcut

The settings open with the **ESC** key by default:

```javascript
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.settingsOverlay.toggle();
    }
});
```

#### Adding Settings Button to UI

```html
<button id="settingsButton" class="ui-button">
    <span class="btn-icon">⚙️</span>
    <span class="btn-label">Settings</span>
</button>

<script>
    document.getElementById('settingsButton').addEventListener('click', () => {
        window.settingsOverlay.toggle();
    });
</script>
```

#### API Methods

```javascript
// Open/Close
settingsOverlay.open();
settingsOverlay.close();
settingsOverlay.toggle();

// Get setting value
const volume = settingsOverlay.getSetting('masterVolume'); // 0-100
const difficulty = settingsOverlay.getSetting('difficulty'); // 'easy', 'normal', 'hard', 'nightmare'
const isFullscreen = settingsOverlay.getSetting('fullscreen'); // boolean

// Set setting value
settingsOverlay.setSetting('masterVolume', 80);
settingsOverlay.setSetting('difficulty', 'hard');

// Get keybind
const inventoryKey = settingsOverlay.getKeybind('inventory'); // 'I'

// Check if key is bound to action
if (settingsOverlay.isKeybound(e.key, 'inventory')) {
    // Open inventory
}

// Access all settings
const allSettings = settingsOverlay.settings;
```

---

## Settings Structure

The settings are automatically saved to `localStorage` as `arcaneCodexSettings`. Here's the complete structure:

```javascript
{
    // Audio (0-100)
    masterVolume: 100,
    musicVolume: 80,
    sfxVolume: 90,
    ambientVolume: 70,
    masterMute: false,
    musicMute: false,
    sfxMute: false,

    // Display
    fullscreen: false,
    uiScale: 100, // 75-125
    graphicsQuality: 'medium', // 'low', 'medium', 'high', 'ultra'
    showFps: false,
    vsync: true,

    // Controls
    keybinds: {
        character: 'C',
        inventory: 'I',
        map: 'M',
        settings: 'Escape',
        quicksave: 'F5',
        quickload: 'F9',
        item1: '1',
        item2: '2',
        item3: '3',
        item4: '4',
        pause: ' ',
        help: 'H'
    },
    mouseSensitivity: 50, // 0-100

    // Game
    autosave: true,
    difficulty: 'normal', // 'easy', 'normal', 'hard', 'nightmare'
    permadeath: false,

    // Accessibility
    colorblindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
    fontSize: 100, // 80-150
    highContrast: false,
    dyslexiaFont: false,
    reducedMotion: false,
    screenShake: true,
    particleEffects: true,
    subtitles: true,
    visualCues: false,
    extendedTime: false,
    autoAim: false
}
```

---

## Integrating with Game Audio System

When settings change, apply them to your audio system:

```javascript
// Listen for settings changes
function applyAudioSettings() {
    const settings = window.settingsOverlay.settings;

    // Master volume
    Howler.volume(settings.masterVolume / 100);

    // Music volume
    if (musicTrack) {
        musicTrack.volume(settings.musicVolume / 100);
    }

    // Mute states
    Howler.mute(settings.masterMute);
}

// Call when settings are applied
document.addEventListener('settingsApplied', applyAudioSettings);
```

---

## Integrating with Save/Load System

Connect the settings overlay buttons to your actual save/load system:

```javascript
// Override default save/load handlers
const originalSaveGame = window.settingsOverlay.saveGame;
window.settingsOverlay.saveGame = function() {
    // Your actual save logic
    yourGameSaveFunction()
        .then(() => {
            this.showNotification('Game saved successfully!', 'success');
        })
        .catch(() => {
            this.showNotification('Failed to save game', 'error');
        });
};

const originalLoadGame = window.settingsOverlay.loadGame;
window.settingsOverlay.loadGame = function() {
    // Your actual load logic
    showLoadGameDialog();
};
```

---

## Keyboard Shortcuts

### Map Overlay
- **M** - Toggle map
- **ESC** - Close map
- **+/=** - Zoom in
- **-/_** - Zoom out
- **C** - Center on player

### Settings Overlay
- **ESC** - Toggle settings
- **Tab** - Navigate between tabs (with keyboard navigation)

---

## Customization

### Changing Colors

Both overlays use CSS custom properties. Override them in your main stylesheet:

```css
:root {
    /* Map colors */
    --map-primary: #your-color;
    --map-accent: #your-color;

    /* Settings colors */
    --settings-primary: #your-color;
    --settings-accent: #your-color;
}
```

### Adding New POI Types

1. Add icon to legend in `map_overlay.html`:
```html
<div class="legend-item">
    <span class="legend-icon custom">🎯</span>
    <span class="legend-label">Custom Type</span>
</div>
```

2. Add CSS styling in `map_overlay.css`:
```css
.poi-marker.custom .poi-marker-icon {
    border-color: #your-color;
    box-shadow: 0 0 15px rgba(your-color, 0.5);
}
```

3. Add filter checkbox if needed in HTML.

### Adding New Settings

1. Add setting to `getDefaultSettings()` in `settings_overlay.js`
2. Add UI element in `settings_overlay.html`
3. Bind the setting in `bindEvents()`
4. Apply the setting in `applySettings()`

---

## Responsive Design

Both overlays are fully responsive:

- **Desktop (1280px+)**: Full sidebar, all features visible
- **Tablet (768-1024px)**: Condensed sidebar, touch-friendly
- **Mobile (< 768px)**: Fullscreen overlay, vertical layout, hidden sidebar (map)
- **Small Mobile (< 480px)**: Optimized for one-handed use

---

## Accessibility Features

### Implemented
- Keyboard navigation support
- ARIA labels and roles
- Focus visible states
- High contrast mode support
- Reduced motion support
- Screen reader friendly
- Colorblind modes (filters)
- Adjustable font sizes
- Dyslexia-friendly font option

### Testing
```javascript
// Test reduced motion
document.documentElement.classList.add('reduced-motion');

// Test high contrast
settingsOverlay.setSetting('highContrast', true);

// Test colorblind mode
settingsOverlay.setSetting('colorblindMode', 'protanopia');
```

---

## Performance Optimization

### Map Overlay
- Canvas rendering is optimized for 60 FPS
- POI markers use CSS transforms for smooth animation
- Fog of War uses compositing for performance
- Panning and zooming are hardware-accelerated

### Settings Overlay
- Settings are throttled to prevent excessive localStorage writes
- Tab switching uses CSS transitions for smooth animations
- All interactions are debounced appropriately

---

## Browser Compatibility

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required features:**
- CSS Grid
- CSS Custom Properties
- Canvas API
- LocalStorage API
- ES6 Classes

---

## Troubleshooting

### Map doesn't render
```javascript
// Check if canvas is initialized
console.log(window.mapOverlay.canvas);
console.log(window.mapOverlay.ctx);

// Force resize
window.mapOverlay.resizeCanvas();
```

### Settings not saving
```javascript
// Check localStorage availability
try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    console.log('LocalStorage available');
} catch (e) {
    console.error('LocalStorage not available:', e);
}

// Check saved settings
console.log(localStorage.getItem('arcaneCodexSettings'));
```

### Overlays not opening
```javascript
// Check if managers are initialized
console.log(window.mapOverlay);
console.log(window.settingsOverlay);

// Check HTML elements
console.log(document.getElementById('mapOverlay'));
console.log(document.getElementById('settingsOverlay'));
```

---

## Future Enhancements

Potential additions for future phases:

### Map Overlay
- 3D view mode
- Path finding visualization
- Mini-map integration
- Custom map markers
- Player notes on map
- Distance measurement tool
- Area selection tool
- Real-time multiplayer markers

### Settings Overlay
- Cloud save integration
- Profile management
- Custom themes
- Macro recording
- Advanced graphics settings
- Network settings
- Controller support settings
- Achievement tracking

---

## Support

For issues or questions:
1. Check console for error messages
2. Verify all files are loaded correctly
3. Check browser compatibility
4. Review integration steps above

---

## Credits

**Design System:** Claude Code
**Framework:** Vanilla JS + CSS Custom Properties
**Icons:** Unicode Emoji
**Fonts:** Google Fonts (Cinzel, Inter)

---

**Last Updated:** 2025-11-22
**Version:** 3.0.0
**Phase:** 3 - Overlays & UI Systems
