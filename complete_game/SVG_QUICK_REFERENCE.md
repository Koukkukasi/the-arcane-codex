# SVG Integration Quick Reference Card

## Files Location
All files in: `C:\Users\ilmiv\ProjectArgent\complete_game\`

### CSS
- `static\css\svg-integration.css`

### JavaScript
- `static\js\divine-council.js`

### HTML Templates
- `static\divine-council-modal.html`

### SVG Assets
All in `static\images\`:
- God icons: `god_*.svg` (7 files)
- Logo: `arcane_codex_logo.svg`
- Runes: `rune_symbol_*.svg` (3 files)
- Decorations: `corner_flourish.svg`, `divider_line.svg`
- Background: `mystical_background.svg`

---

## Quick Setup (3 steps)

### 1. Add to `<head>`
```html
<link rel="stylesheet" href="/static/css/svg-integration.css">
```

### 2. Add before `</body>`
```html
<script src="/static/js/divine-council.js"></script>
```

### 3. Copy modal HTML
From `divine-council-modal.html` into your template

---

## Common Code Snippets

### Show Divine Council Voting
```javascript
window.DivineCouncil.showVoting({
  approve: ['valdris', 'sylara'],
  condemn: ['kaitha', 'korvan'],
  reasons: {
    valdris: "Your reason here",
    sylara: "Your reason here",
    kaitha: "Your reason here",
    korvan: "Your reason here"
  },
  judgment: "The Council is divided 2-2.",
  choice: "your choice description"
});
```

### Add God Icon to Character Sheet
```html
<div class="divine-god" data-god="valdris">
  <div class="god-icon-container">
    <img src="/static/images/god_valdris.svg"
         alt="Valdris"
         class="god-icon"
         width="32"
         height="32">
  </div>
  <div class="divine-info">
    <div class="divine-name valdris-name">VALDRIS</div>
    <div class="divine-title">Order & Justice</div>
  </div>
  <div class="divine-bar">
    <div class="divine-fill valdris-bar" style="width: 60%;"></div>
    <div class="divine-value">+15</div>
  </div>
</div>
```

### Add Logo to Landing Page
```html
<div class="logo-container">
  <img src="/static/images/arcane_codex_logo.svg"
       alt="The Arcane Codex"
       class="logo-main"
       width="200"
       height="200">
</div>
```

### Add Divider Line
```html
<img src="/static/images/divider_line.svg"
     class="section-divider"
     alt="">
```

### Add Corner Flourishes
```html
<div class="corner-decoration corner-tl">
  <img src="/static/images/corner_flourish.svg" alt="">
</div>
<div class="corner-decoration corner-tr">
  <img src="/static/images/corner_flourish.svg" alt="">
</div>
<div class="corner-decoration corner-bl">
  <img src="/static/images/corner_flourish.svg" alt="">
</div>
<div class="corner-decoration corner-br">
  <img src="/static/images/corner_flourish.svg" alt="">
</div>
```

---

## God Names & Colors

| God | Key | Color | Domain |
|-----|-----|-------|--------|
| Valdris | `valdris` | Blue #2563EB | Order & Justice |
| Kaitha | `kaitha` | Orange #F59E0B | Chaos & Freedom |
| Morvane | `morvane` | Purple #7C3AED | Death & Survival |
| Sylara | `sylara` | Green #059669 | Nature & Balance |
| Korvan | `korvan` | Red #DC2626 | War & Honor |
| Athena | `athena` | Blue #2563EB | Wisdom & Knowledge |
| Mercus | `mercus` | Gold #D4AF37 | Commerce & Wealth |

---

## CSS Classes Reference

### God Icons
- `.god-icon-container` - Circular border with glow
- `.god-icon` - The SVG icon itself (32px default)
- `.god-icon-large` - Larger version (56px for voting)

### Divine Favor
- `.divine-favor-section` - Container for all gods
- `.divine-favor-header` - Section title with runes
- `.divine-god` - Single god row
- `.divine-info` - God name and title
- `.divine-name` - God's name (use color classes)
- `.divine-title` - God's domain description
- `.divine-bar` - Progress bar container
- `.divine-fill` - Filled portion (set width %)
- `.divine-value` - Numeric favor value

### Color Classes
- `.valdris-name` - Blue text
- `.kaitha-name` - Orange text
- `.morvane-name` - Purple text
- `.sylara-name` - Green text
- `.korvan-name` - Red text
- `.athena-name` - Blue text
- `.mercus-name` - Gold text

### Logo
- `.logo-container` - Wrapper with glow
- `.logo-main` - Large animated logo
- `.logo-small` - Compact nav logo (40px)

### Decorative
- `.corner-decoration` - Fixed corner ornaments
- `.section-divider` - Horizontal divider line
- `.section-icon` - Rotating rune icons
- `.list-rune` - Rune bullet points

### Voting Modal
- `.divine-council-modal` - Outer container
- `.mystical-backdrop` - Blurred background
- `.council-content` - Modal panel
- `.council-header` - Modal title with runes
- `.god-voting-arena` - Voting columns layout
- `.vote-column` - Approve or condemn side
- `.approve-column` - Left side (green)
- `.condemn-column` - Right side (red)
- `.god-vote-card` - Individual god vote
- `.god-vote-info` - God name and reason
- `.council-judgment` - Final verdict box
- `.council-continue` - Close button

---

## JavaScript API

### Main Methods
```javascript
// Initialize (auto-called on DOM ready)
window.DivineCouncil.init()

// Show voting modal
window.DivineCouncil.showVoting(voteData)

// Hide voting modal
window.DivineCouncil.hideVoting()

// Set callback for continue button
window.DivineCouncil.setContinueCallback(callback)

// Generate voting data from favor levels
window.DivineCouncil.generateVotingData(choice, favorLevels)

// Update favor after voting
window.DivineCouncil.updateFavorLevels(voteData, currentFavor)

// Get god's attitude description
window.DivineCouncil.getGodAttitude(godKey, favorLevel)
```

### Vote Data Structure
```javascript
{
  approve: ['godKey1', 'godKey2'],      // Array of god keys
  condemn: ['godKey3', 'godKey4'],      // Array of god keys
  reasons: {                            // Reasons object
    godKey1: "Reason for approval",
    godKey2: "Reason for approval",
    godKey3: "Reason for condemn",
    godKey4: "Reason for condemn"
  },
  judgment: "Final judgment text",      // Result message
  choice: "player's choice description" // What they chose
}
```

---

## Responsive Breakpoints

- **Mobile:** 0-767px
  - Logo: 120px
  - God icons: 28px
  - Voting: Single column
  - Corners: Hidden

- **Tablet:** 768px-1023px
  - Logo: 160px
  - God icons: 30px
  - Voting: Side-by-side
  - Corners: 50px

- **Desktop:** 1024px+
  - Logo: 200px
  - God icons: 32px
  - Voting: Full width
  - Corners: 80px

---

## Testing Commands

### Browser Console
```javascript
// Test voting modal
window.DivineCouncil.showVoting({
  approve: ['valdris'],
  condemn: ['kaitha'],
  reasons: {
    valdris: "Test approval",
    kaitha: "Test condemn"
  },
  judgment: "Test judgment",
  choice: "test"
});

// Close modal
window.DivineCouncil.hideVoting();

// Check if loaded
console.log(window.DivineCouncil);
```

---

## Troubleshooting

### Modal doesn't show
1. Check console for errors
2. Verify `divine-council.js` loaded
3. Ensure modal HTML is in page
4. Test: `document.getElementById('council-voting-modal')`

### Icons don't load
1. Check file paths (should be `/static/images/`)
2. Open Network tab, look for 404s
3. Test direct access: `http://localhost:8000/static/images/god_valdris.svg`

### Animations not working
1. Verify `svg-integration.css` loaded
2. Check for CSS conflicts
3. Test on different browser

---

## File Sizes (Optimized)

- Each god icon: ~1-2 KB
- Logo: ~3 KB
- Rune symbols: ~0.5 KB each
- Decorations: ~0.5-1 KB each
- **Total:** ~15 KB all SVGs

---

## Performance Tips

1. **Preload critical SVGs:**
   ```html
   <link rel="preload" href="/static/images/arcane_codex_logo.svg" as="image">
   ```

2. **Lazy load decorative:**
   ```html
   <img src="/static/images/corner_flourish.svg" loading="lazy">
   ```

3. **Use external refs for reused icons:**
   Better caching than inline SVG

4. **Optimize with SVGO:**
   ```bash
   npx svgo -f static/images/
   ```

---

## Demo & Docs

- **Live Demo:** Open `static/svg_integration_demo.html`
- **Quick Start:** `QUICK_START_SVG_INTEGRATION.md`
- **Full Plan:** `SVG_INTEGRATION_PLAN.md`
- **Summary:** `PHASE_G_COMPLETION_SUMMARY.md`

---

## Support

All files ready to use. No dependencies beyond existing design system.
Questions? Check inline comments in `divine-council.js` for examples.

---

**Last Updated:** 2025-11-15
**Version:** 1.0.0
**Status:** Production Ready
