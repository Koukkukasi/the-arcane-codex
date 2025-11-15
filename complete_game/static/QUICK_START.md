# Character Sheet Overlay - Quick Start Guide

## What You're Getting

A complete, production-ready Character Sheet overlay for your dark fantasy RPG game featuring Aldric, a Level 12 Fighter.

## Files Provided

1. **character_sheet_overlay.html** - Reference file with complete HTML and CSS
2. **CHARACTER_SHEET_IMPLEMENTATION_GUIDE.md** - Detailed implementation guide
3. **CHARACTER_SHEET_STRUCTURE.txt** - Visual ASCII structure breakdown
4. **QUICK_START.md** - This file

All files located in: `C:/Users/ilmiv/ProjectArgent/complete_game/static/`

## What's Included in the Overlay

### Character Info
- Name: Aldric
- Class: Fighter
- Level: 12
- Portrait: Sword emoji (⚔️)

### Experience Bar
- Current: 6,500 / 10,000 XP
- Progress: 65%
- Visual progress bar with gold gradient

### 6 Core Attributes
```
Strength:     18  (💪)
Dexterity:    14  (⚡)
Constitution: 16  (❤️)
Intelligence: 10  (🧠)
Wisdom:       12  (👁️)
Charisma:     13  (💬)
```

### 7 Divine Favor Ratings
| God | Favor | Bar |
|-----|-------|-----|
| VALDRIS | +15 | 60% |
| KAITHA | -10 | 40% |
| MORVANE | +20 | 80% |
| SYLARA | +5 | 50% |
| KORVAN | +25 | 100% |
| ATHENA | +10 | 67% |
| MERCUS | -5 | 33% |

### 4 Passive Abilities
1. **Iron Skin** - Reduce all incoming damage by 10%
2. **Veteran's Resolve** - Gain +2 to all saves after each combat
3. **Weapon Mastery** - Increase damage with melee weapons by 15%
4. **Fortified Mind** - Immunity to fear and charm effects

## Quick Integration (3 Steps)

### Step 1: Copy HTML
From `character_sheet_overlay.html`, copy the entire:
```html
<div id="character-overlay" class="overlay character-sheet-overlay">
    ...entire content...
</div>
```

Paste it into your main HTML file BEFORE the closing `</body>` tag:
```html
    </div>

    <!-- PASTE CHARACTER SHEET OVERLAY HERE -->
    <div id="character-overlay" class="overlay character-sheet-overlay">
        ...
    </div>

</body>
```

### Step 2: Copy CSS Styles
From `character_sheet_overlay.html`, find the:
```html
<style>
    /* CHARACTER SHEET OVERLAY STYLES */
    ...all the styles...
</style>
```

Copy ONLY the Character Sheet Overlay styles section and paste into your main HTML's `<style>` block in the `<head>`:
```html
<head>
    <style>
        /* Existing styles... */

        /* CHARACTER SHEET OVERLAY STYLES */
        .character-sheet-content { ... }
        .character-sheet-body { ... }
        /* ... etc ... */
    </style>
</head>
```

### Step 3: Done!
The existing JavaScript overlay system will handle everything automatically:
- Press 'C' to open/toggle the Character Sheet
- Press ESC or click X button to close
- Click backdrop to close
- Keyboard shortcuts already configured

## Testing It

1. Open your HTML file in a browser
2. Press 'C' key
3. You should see the Character Sheet overlay
4. Verify:
   - Aldric's name and portrait display
   - XP bar shows 65% filled
   - All 6 stats visible
   - All 7 gods display with their colors
   - 4 abilities listed below
   - Hover effects work on stat cards and abilities

## Customization

### Change Character Name
Find:
```html
<div class="character-name">Aldric</div>
```
Change to:
```html
<div class="character-name">Your Character Name</div>
```

### Update Stats
Find any stat value like:
```html
<div class="stat-value">18</div>
```
Change the number:
```html
<div class="stat-value">20</div>
```

### Update XP Progress
Find:
```html
<div class="xp-fill" style="width: 65%;"></div>
<div class="xp-text">6,500 / 10,000 (65%)</div>
```
Change both the percentage and text to match (e.g., 80% and 8,000 / 10,000)

### Update Divine Favor
Find any god entry like:
```html
<div class="divine-fill valdris-bar" style="width: 60%;"></div>
<div class="divine-value">+15</div>
```
Change the width percentage and value

### Add More Abilities
Copy this template and add more ability items:
```html
<div class="ability-item">
    <div class="ability-icon">EMOJI</div>
    <div class="ability-info">
        <div class="ability-name">ABILITY NAME</div>
        <div class="ability-desc">ABILITY DESCRIPTION</div>
    </div>
</div>
```

## Key Features

- **Dark Fantasy Theme** - Matches your existing UI perfectly
- **Gold/Bronze Color Scheme** - Consistent with your design
- **Responsive Layout** - Works on different screen sizes
- **Interactive Elements** - Hover effects on cards and abilities
- **Scrollable Content** - Handles overflow gracefully
- **No Extra JavaScript** - Uses your existing overlay system
- **Keyboard Shortcuts** - 'C' to toggle, ESC to close
- **Mobile Friendly** - Responsive design principles

## Color Scheme

All colors are consistent with your existing theme:
- **Bright Gold** (#FFD700) - Main text highlights
- **Medium Gold** (#D4AF37) - Secondary text and accents
- **Bronze** (#8B7355) - Borders
- **Dark** (#0A0908, #2A1810) - Backgrounds
- **God Colors** - Unique colors for each deity

## Browser Support

Works on:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

Requires:
- CSS Grid support
- Flexbox support
- CSS custom properties (modern browsers)

## Troubleshooting

### Overlay doesn't open
- Verify the HTML div has id="character-overlay"
- Check that the overlay class and CSS are included
- Test keyboard with 'C' key

### Styling looks wrong
- Make sure all CSS was copied (check browser dev tools)
- Verify font imports in main file (Cinzel, Yrsa)
- Check color values match

### Text is hard to read
- Ensure background colors are applied
- Check that text colors are correct (#FFD700 or #D4AF37)
- Verify shadows are rendering

### Scrollbar not visible
- Content must overflow the 85vh max-height
- Check scrollbar CSS is in your stylesheet
- Test in Chrome (webkit scrollbar support)

## Next Steps

1. **Integrate HTML** - Copy the overlay div
2. **Add CSS** - Copy the style block
3. **Test** - Press 'C' and verify it works
4. **Customize** - Update character data
5. **Enhance** - Add more abilities or features

## Need More Info?

- **Implementation Details** → Read CHARACTER_SHEET_IMPLEMENTATION_GUIDE.md
- **Structure Breakdown** → Read CHARACTER_SHEET_STRUCTURE.txt
- **Visual Reference** → Open character_sheet_overlay.html in a browser

## Summary

You now have a complete character sheet system ready to integrate into your game!

The overlay displays:
- ✓ Character information and portrait
- ✓ Experience progress (6,500/10,000 at 65%)
- ✓ All 6 core attributes with values
- ✓ Divine favor ratings for 7 gods
- ✓ 4 passive combat abilities
- ✓ Professional dark fantasy styling
- ✓ Interactive hover effects
- ✓ Keyboard shortcuts (C to toggle)
- ✓ Responsive design
- ✓ Scrollable overflow handling

Ready to use - no additional coding required!

---

**Location:** C:/Users/ilmiv/ProjectArgent/complete_game/static/
**Status:** Complete and ready for integration
**Last Updated:** November 2024
