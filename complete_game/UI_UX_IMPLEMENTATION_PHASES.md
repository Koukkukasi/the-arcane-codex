# UI/UX Implementation Phases

## Phase 1: Interactive UI Overlays & Panels
**Status**: Not Started | **Priority**: High
**Estimated Time**: 2-3 weeks

### Overview
Implement fully functional interactive overlays for all sidebar navigation buttons, transforming the static UI into a dynamic, game-ready interface.

---

## 1. Map Overlay (M key / 🗺️ button)

### Features:
- **Minimap Display**: Visual representation of current area/dungeon
- **Player Position**: Real-time player marker with facing direction
- **Fog of War**: Unexplored areas shown in darkness, gradually revealed
- **Points of Interest**:
  - 🏪 Shops and merchants
  - ⚔️ Quest objectives
  - 👥 NPC locations
  - 🚪 Exits and portals
  - ⚠️ Danger zones
- **Click-to-Travel**: Fast travel to discovered locations (if allowed)
- **Zoom Controls**: +/- buttons or mouse wheel
- **Legend**: Icon explanation panel

### Technical Implementation:
```javascript
// Map overlay structure
<div id="map-overlay" class="game-overlay">
  <div class="overlay-backdrop"></div>
  <div class="overlay-panel map-panel">
    <div class="panel-header">
      <h2>🗺️ World Map</h2>
      <button class="close-btn">×</button>
    </div>
    <div class="map-canvas">
      <!-- SVG or Canvas-based map -->
    </div>
    <div class="map-legend">
      <!-- Icon explanations -->
    </div>
  </div>
</div>
```

### User Interactions:
- Press M or click 🗺️ button → Map overlay appears
- ESC or click outside → Close overlay
- Hover over marker → Show tooltip
- Click marker → Details panel or travel option

---

## 2. Inventory Panel (I key / 🎒 button)

### Features:
- **Grid-Based Inventory**: 8×6 grid (48 slots)
- **Equipment Slots**:
  - Weapon (main hand)
  - Weapon (off-hand / shield)
  - Armor (chest)
  - Helmet
  - Gloves
  - Boots
  - 2× Accessory slots (rings, amulets)
- **Item Display**:
  - Item icons with emoji or SVG
  - Stack counts for consumables
  - Rarity coloring (common, uncommon, rare, legendary)
- **Item Actions**:
  - Right-click → Context menu (Use / Equip / Drop / Examine)
  - Drag-and-drop to equip/unequip
  - Double-click to use/equip
- **Filters & Sorting**:
  - All / Weapons / Armor / Consumables / Quest Items
  - Sort by: Name, Type, Value, Rarity
- **Item Tooltips**:
  - Item name and description
  - Stats and bonuses
  - Requirements (level, class)
  - Value and weight
- **Weight/Capacity**: Current weight / Max capacity display

### Technical Implementation:
```javascript
// Inventory structure
<div id="inventory-overlay" class="game-overlay">
  <div class="overlay-backdrop"></div>
  <div class="overlay-panel inventory-panel">
    <div class="panel-header">
      <h2>🎒 Inventory</h2>
      <div class="capacity">Weight: 45 / 100</div>
      <button class="close-btn">×</button>
    </div>

    <!-- Equipment Slots -->
    <div class="equipment-section">
      <div class="equip-slot" data-slot="weapon-main">⚔️</div>
      <div class="equip-slot" data-slot="armor">🛡️</div>
      <!-- ... more slots -->
    </div>

    <!-- Inventory Grid -->
    <div class="inventory-filters">
      <button class="filter active" data-filter="all">All</button>
      <button class="filter" data-filter="weapons">Weapons</button>
      <!-- ... more filters -->
    </div>

    <div class="inventory-grid">
      <!-- 48 inventory slots -->
    </div>
  </div>
</div>
```

### User Interactions:
- Press I or click 🎒 button → Inventory opens
- Drag item from inventory to equipment slot → Equip
- Drag equipped item back to inventory → Unequip
- Right-click item → Context menu
- Hover → Detailed tooltip

---

## 3. Character Sheet (C key / 👤 button)

### Features:
- **Character Portrait**: Large emoji or avatar display
- **Basic Info**:
  - Name
  - Class (Fighter, Mage, etc.)
  - Level and XP progress bar
  - Current / Max HP and Mana
- **Core Stats**:
  - Strength, Dexterity, Constitution
  - Intelligence, Wisdom, Charisma
  - Derived stats (Armor Class, Attack Bonus, etc.)
- **Divine Favor Ratings**:
  - 🌩️ VALDRIS (Order/Law): +15
  - 🔥 KAITHA (Chaos/Freedom): -10
  - 💀 MORVANE (Survival): +20
  - 🌿 SYLARA (Nature): +5
  - ⚔️ KORVAN (War): +25
  - 📚 ATHENA (Wisdom): +10
  - 💰 MERCUS (Commerce): -5
  - **Visual**: Radial chart or bar graph
- **Skills & Abilities**:
  - Passive abilities list
  - Active abilities with descriptions
- **Titles & Achievements**:
  - Earned titles
  - Achievement badges

### Technical Implementation:
```javascript
<div id="character-overlay" class="game-overlay">
  <div class="overlay-backdrop"></div>
  <div class="overlay-panel character-panel">
    <div class="panel-header">
      <h2>👤 Character</h2>
      <button class="close-btn">×</button>
    </div>

    <div class="character-display">
      <div class="char-portrait">⚔️</div>
      <div class="char-info">
        <h3>Aldric</h3>
        <div class="char-class">Fighter • Level 12</div>
        <div class="xp-bar">
          <div class="xp-fill" style="width: 65%"></div>
          <span>6,500 / 10,000 XP</span>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <!-- Core stats -->
    </div>

    <div class="divine-favor-section">
      <h4>Divine Favor</h4>
      <div class="favor-chart">
        <!-- Radial chart or bars -->
      </div>
    </div>
  </div>
</div>
```

---

## 4. Skills Panel (K key / ⚔️ button)

### Features:
- **Active Abilities Grid**: All learnable abilities
- **Skill Trees**: Visual progression paths
- **Ability Details**:
  - Name and description
  - Cooldown / Resource cost
  - Damage / Healing / Effect
  - Level requirements
  - Unlock conditions
- **Hotkey Assignment**:
  - Drag ability to action bar slot (1-8)
  - Visual feedback showing assigned hotkey
- **Skill Points Display**: Available / Total skill points
- **Upgrade System**: Level up abilities (if applicable)

### Technical Implementation:
```javascript
<div id="skills-overlay" class="game-overlay">
  <div class="overlay-backdrop"></div>
  <div class="overlay-panel skills-panel">
    <div class="panel-header">
      <h2>⚔️ Skills & Abilities</h2>
      <div class="skill-points">Skill Points: 3</div>
      <button class="close-btn">×</button>
    </div>

    <div class="skill-tree">
      <!-- Visual skill tree with connections -->
    </div>

    <div class="abilities-list">
      <!-- Grid of available abilities -->
    </div>

    <div class="ability-details">
      <!-- Selected ability info -->
    </div>
  </div>
</div>
```

---

## 5. Quest Log (J key / 📜 button)

### Features:
- **Active Quests Tab**:
  - Quest title and NPC quest-giver
  - Objectives with progress (e.g., "Kill Goblins: 3/10")
  - Quest description and lore
  - Rewards preview (XP, gold, items)
  - Time remaining (if timed)
- **Completed Quests Tab**:
  - Archive of finished quests
  - Rewards received
  - Completion date
- **Failed/Abandoned Tab** (optional)
- **Quest Categories**:
  - Main Story
  - Side Quests
  - NPC Requests
  - Divine Trials
- **Map Integration**: "Show on Map" button links to quest location

### Technical Implementation:
```javascript
<div id="quests-overlay" class="game-overlay">
  <div class="overlay-backdrop"></div>
  <div class="overlay-panel quests-panel">
    <div class="panel-header">
      <h2>📜 Quest Log</h2>
      <button class="close-btn">×</button>
    </div>

    <div class="quest-tabs">
      <button class="tab active" data-tab="active">Active (3)</button>
      <button class="tab" data-tab="completed">Completed (12)</button>
    </div>

    <div class="quest-list">
      <!-- List of quests -->
    </div>

    <div class="quest-details">
      <h3>The Medicine Heist</h3>
      <div class="quest-giver">From: Grimsby</div>
      <div class="quest-description">...</div>
      <div class="quest-objectives">
        <div class="objective">✓ Enter Valdria</div>
        <div class="objective">⏳ Obtain medicine (0/1)</div>
      </div>
      <div class="quest-rewards">
        Rewards: 500 XP, 100 gold
      </div>
      <button class="show-on-map">Show on Map</button>
    </div>
  </div>
</div>
```

---

## 6. Settings Menu (ESC key / ⚙️ button)

### Features:
- **Audio Settings**:
  - Master Volume slider
  - Music Volume slider
  - SFX Volume slider
  - Mute checkboxes
- **Display Settings**:
  - Fullscreen toggle
  - Resolution dropdown (if applicable)
  - UI Scale slider
- **Controls**:
  - Keybind customization interface
  - Reset to defaults button
- **Game Settings**:
  - Save Game button
  - Load Game button
  - Return to Main Menu
  - Quit Game
- **Accessibility**:
  - Colorblind mode
  - Font size adjustments
  - Reduced motion toggle

### Technical Implementation:
```javascript
<div id="settings-overlay" class="game-overlay">
  <div class="overlay-backdrop"></div>
  <div class="overlay-panel settings-panel">
    <div class="panel-header">
      <h2>⚙️ Settings</h2>
      <button class="close-btn">×</button>
    </div>

    <div class="settings-tabs">
      <button class="tab active" data-tab="audio">Audio</button>
      <button class="tab" data-tab="display">Display</button>
      <button class="tab" data-tab="controls">Controls</button>
      <button class="tab" data-tab="game">Game</button>
    </div>

    <div class="settings-content">
      <!-- Tab content -->
    </div>

    <div class="settings-actions">
      <button class="btn-apply">Apply</button>
      <button class="btn-cancel">Cancel</button>
    </div>
  </div>
</div>
```

---

## Shared Technical Requirements

### 1. Overlay System Architecture
```css
.game-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: none; /* Hidden by default */
}

.game-overlay.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
}

.overlay-panel {
  position: relative;
  z-index: 1001;
  background: linear-gradient(135deg, #2A1810, #1A1612);
  border: 3px solid #8B7355;
  border-radius: 10px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.9);
  max-width: 90%;
  max-height: 90%;
  overflow-y: auto;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
```

### 2. Keyboard Event Handler
```javascript
// Global keyboard handler
document.addEventListener('keydown', (e) => {
  // Prevent multiple overlays
  if (document.querySelector('.game-overlay.active')) {
    if (e.key === 'Escape') {
      closeAllOverlays();
    }
    return; // Don't open new overlays while one is active
  }

  switch(e.key.toLowerCase()) {
    case 'c': openOverlay('character'); break;
    case 'i': openOverlay('inventory'); break;
    case 'k': openOverlay('skills'); break;
    case 'j': openOverlay('quests'); break;
    case 'm': openOverlay('map'); break;
    case 'escape': openOverlay('settings'); break;
  }
});

function openOverlay(overlayId) {
  const overlay = document.getElementById(`${overlayId}-overlay`);
  overlay.classList.add('active');
  overlay.querySelector('.close-btn').focus(); // Accessibility
}

function closeAllOverlays() {
  document.querySelectorAll('.game-overlay.active').forEach(overlay => {
    overlay.classList.remove('active');
  });
}

// Close on backdrop click
document.querySelectorAll('.overlay-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', closeAllOverlays);
});
```

### 3. Mobile Responsiveness
```css
@media (max-width: 768px) {
  .overlay-panel {
    width: 95%;
    height: 95%;
    max-width: none;
    max-height: none;
  }

  /* Adjust layout for touch */
  .inventory-grid {
    grid-template-columns: repeat(4, 1fr); /* Fewer columns */
  }
}
```

---

## Implementation Checklist

### Phase 1.1: Foundation (Week 1)
- [ ] Create overlay system architecture
- [ ] Implement keyboard event handlers
- [ ] Design modal backdrop and panel styling
- [ ] Add open/close animations
- [ ] Test ESC key functionality
- [ ] Mobile responsiveness setup

### Phase 1.2: Core Overlays (Week 2)
- [ ] Inventory panel implementation
  - [ ] Grid system
  - [ ] Equipment slots
  - [ ] Drag-and-drop
  - [ ] Item tooltips
- [ ] Character sheet implementation
  - [ ] Stats display
  - [ ] Divine favor visualization
  - [ ] XP progress bar
- [ ] Skills panel implementation
  - [ ] Ability grid
  - [ ] Hotkey assignment
  - [ ] Skill descriptions

### Phase 1.3: Advanced Features (Week 3)
- [ ] Map overlay implementation
  - [ ] Canvas/SVG map rendering
  - [ ] Fog of war system
  - [ ] POI markers
- [ ] Quest log implementation
  - [ ] Quest list with filtering
  - [ ] Progress tracking
  - [ ] Map integration
- [ ] Settings menu implementation
  - [ ] Audio controls
  - [ ] Keybind editor
  - [ ] Save/Load UI

### Phase 1.4: Polish & Testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Accessibility improvements (ARIA labels, focus management)
- [ ] Performance optimization
- [ ] Animation polish
- [ ] User testing and feedback

---

## Success Criteria

✅ All 6 sidebar buttons open functional overlays
✅ Keyboard shortcuts work (C, I, K, J, M, ESC)
✅ ESC key closes any active overlay
✅ Click outside overlay closes it
✅ No multiple overlays can be open simultaneously
✅ Smooth animations and transitions
✅ Mobile-responsive on tablets and phones
✅ Accessible (keyboard navigation, screen reader support)
✅ Consistent dark fantasy visual theme
✅ No performance issues (60fps maintained)

---

## Future Enhancements (Post-Phase 1)

- Context-sensitive help tooltips
- Tutorial overlay system
- Achievements/badges overlay
- Crafting interface
- Social/party management panel
- Minimap always-on corner display
- Quick-access radial menu (hold TAB)
