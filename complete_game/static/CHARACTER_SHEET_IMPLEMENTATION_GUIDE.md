# Character Sheet Overlay - Implementation Guide

## Overview

This document provides complete instructions for integrating the enhanced Character Sheet Overlay into your dark fantasy RPG game UI.

## What's Included

The Character Sheet Overlay displays comprehensive character information for **Aldric**, a Level 12 Fighter, with:

### 1. Character Info Section
- Large circular portrait (⚔️ emoji)
- Character name: "Aldric"
- Class and Level: "Fighter • Level 12"
- Professional styling with gold borders and shadows

### 2. Experience (XP) Bar
- Visual progress bar showing 6,500 / 10,000 XP (65% progress)
- Gold gradient fill
- Percentage text overlay
- Smooth width transitions for level-up animations

### 3. Core Attributes (Stats Grid - 6 Cards)
Displayed in a 3x2 grid layout:

**Row 1:**
- **Strength (💪)**: 18 - Physical power
- **Dexterity (⚡)**: 14 - Speed and precision
- **Constitution (❤️)**: 16 - Health and endurance

**Row 2:**
- **Intelligence (🧠)**: 10 - Reasoning and arcane knowledge
- **Wisdom (👁️)**: 12 - Perception and insight
- **Charisma (💬)**: 13 - Leadership and influence

Each stat card includes:
- Emoji icon
- Stat name in uppercase
- Numeric value in large gold text
- Hover effects with golden glow

### 4. Divine Favor Section (7 Gods)

Seven divine beings with relationship tracking:

| God | Type | Color | Favor |
|-----|------|-------|-------|
| **VALDRIS** | Order/Law | Blue (#87CEEB) | +15 (60% bar) |
| **KAITHA** | Chaos/Freedom | Orange (#FF8C00) | -10 (40% bar) |
| **MORVANE** | Survival/Pragmatism | Grey (#708090) | +20 (80% bar) |
| **SYLARA** | Nature/Life | Green (#90EE90) | +5 (50% bar) |
| **KORVAN** | War/Courage | Crimson (#CD5C5C) | +25 (100% bar) |
| **ATHENA** | Wisdom/Knowledge | Purple (#BA55D3) | +10 (67% bar) |
| **MERCUS** | Commerce/Value | Gold (#F0E68C) | -5 (33% bar) |

Each god entry includes:
- Color-coded name
- Gradient-filled bar (god-specific colors)
- Numeric favor value (positive in gold, negative in red)

### 5. Passive Abilities (4 Abilities)

Combat and defensive passive abilities:

1. **Iron Skin (🛡️)**
   - Reduce all incoming damage by 10%

2. **Veteran's Resolve (⚔️)**
   - Gain +2 to all saves after each combat encounter

3. **Weapon Mastery (🗡️)**
   - Increase damage with melee weapons by 15%

4. **Fortified Mind (💪)**
   - Immunity to fear and charm effects

Each ability has:
- Large emoji icon
- Ability name in uppercase gold
- Description text explaining the effect
- Hover effects for interactivity

## Installation Instructions

### Step 1: Copy HTML Content

Open the file: `character_sheet_overlay.html`

Copy the HTML structure from the `<div id="character-overlay">` section and paste it into your main HTML file (before the `</body>` tag).

**Location in main file:**
```html
</div>

<!-- Character Sheet Overlay HTML goes here -->

</body>
```

### Step 2: Add CSS Styles

Copy all the CSS from the `<style>` section in `character_sheet_overlay.html` and add it to your main HTML file's `<style>` section in the `<head>`.

The styles are organized into logical groups:
- Character sheet content sizing
- Character info section
- XP bar styling
- Stats grid and cards
- Divine favor bars
- Abilities section
- Scrollbar styling

### Step 3: Verify JavaScript Integration

The existing overlay system in `arcane_codex_scenario_ui_enhanced.html` already handles:
- Opening/closing overlays via the `.overlay` class
- Keyboard shortcuts (Press 'C' to open Character sheet)
- Backdrop click handling
- Close button functionality

No additional JavaScript is needed - the Character Sheet will work with the existing overlay system.

## File References

All files are located in: `C:/Users/ilmiv/ProjectArgent/complete_game/static/`

- **Main HTML**: `arcane_codex_scenario_ui_enhanced.html`
- **Character Sheet Template**: `character_sheet_overlay.html` (reference file)
- **This Guide**: `CHARACTER_SHEET_IMPLEMENTATION_GUIDE.md`

## Design Specifications

### Color Palette
- Primary Gold: #D4AF37 (borders, accents)
- Bright Gold: #FFD700 (text highlights)
- Dark Bronze: #8B7355 (borders)
- Background: rgba(0, 0, 0, 0.3-0.4)
- Text: #D4AF37 to #FFD700

### Typography
- Headers: 'Cinzel' serif (bold, uppercase)
- Body: 'Yrsa' serif
- Font weights: 600-700 for emphasis

### Responsive Design
- Max width: 650px
- Max height: 85vh
- Grid: 3 columns for stats
- Flex layout for abilities
- Auto-scrolling for overflow content

### Interactive Elements

**Stat Cards:**
- Hover: Border color changes to gold, background glow effect

**Ability Items:**
- Hover: Border turns gold, background highlights with gold tint

**Divine Bars:**
- Dynamic width based on favor value
- Gradient colors matching god personality

## Customization Options

### Changing Character Data

To update character information, modify these values:

```html
<!-- Character Name and Class -->
<div class="character-name">Aldric</div>
<div class="character-class-title">Fighter • Level 12</div>

<!-- XP Progress -->
<div class="xp-fill" style="width: 65%;"></div>
<div class="xp-text">6,500 / 10,000 (65%)</div>

<!-- Stat Values -->
<div class="stat-value">18</div>  <!-- Update any stat value -->

<!-- Divine Favor Values -->
<div class="divine-fill valdris-bar" style="width: 60%;"></div>
<div class="divine-value">+15</div>

<!-- Ability Descriptions -->
<div class="ability-desc">Reduce all incoming damage by 10%</div>
```

### Adding/Removing Content

**To add more abilities:**
Copy the entire `.ability-item` div and modify:
```html
<div class="ability-item">
    <div class="ability-icon">EMOJI_HERE</div>
    <div class="ability-info">
        <div class="ability-name">ABILITY NAME</div>
        <div class="ability-desc">DESCRIPTION</div>
    </div>
</div>
```

**To modify divine gods:**
Update the god entry with new color classes:
```html
<div class="divine-god">
    <div class="divine-name custom-god-name">GODNAME</div>
    <div class="divine-bar">
        <div class="divine-fill custom-god-bar" style="width: XX%;"></div>
        <div class="divine-value">+YY</div>
    </div>
</div>
```

## Testing Checklist

- [ ] Overlay opens with 'C' key press
- [ ] Overlay closes with 'X' button, ESC key, or backdrop click
- [ ] Character portrait displays correctly
- [ ] XP bar fills to 65%
- [ ] All 6 stat cards display with correct values
- [ ] All 7 divine god entries display with correct colors
- [ ] Divine bars fill to correct percentages
- [ ] All 4 ability items display with descriptions
- [ ] Hover effects work on stat cards and abilities
- [ ] Scrollbar appears when content overflows
- [ ] Text is readable on dark background
- [ ] No console errors

## Browser Compatibility

The Character Sheet uses:
- CSS Grid and Flexbox (IE 11+ / All modern browsers)
- CSS custom properties (modern browsers)
- Webkit scrollbar styling (Chrome, Safari, Edge)

For full compatibility across all browsers, ensure the main file's CSS includes the required font imports and base styles.

## Performance Notes

- Minimal DOM elements (no complex nesting)
- CSS-based animations (smooth transitions)
- No JavaScript overhead for the overlay itself
- Reuses existing overlay system functionality

## Integration with Existing Systems

The Character Sheet integrates seamlessly with:

1. **Sidebar Navigation**: 'C' hotkey triggers opening
2. **Overlay System**: Uses existing `.overlay` class functionality
3. **Color Scheme**: Matches the dark fantasy theme
4. **Font System**: Uses 'Cinzel' and 'Yrsa' fonts already imported
5. **Event Handling**: Leverages existing close button and backdrop click handlers

## Future Enhancements

Potential additions:
- Equipment display section
- Skills and proficiencies
- Background story
- Character relationships
- Combat statistics (damage, AC, HP details)
- Spell list (for casters)
- Quest log integration
- Achievement tracking
- Character customization (changing portrait, name, appearance)

## Support

For issues or questions:
1. Check browser console for errors
2. Verify all CSS classes are correctly named
3. Ensure HTML structure matches exactly
4. Test in different browsers
5. Clear browser cache if styles don't update

---

**Created for:** The Arcane Codex - Dark Fantasy RPG UI
**Version:** 1.0
**Last Updated:** November 2024
