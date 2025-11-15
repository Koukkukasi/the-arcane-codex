# Quick Start Guide: SVG Graphics Integration

## 5-Minute Setup

### Step 1: Add CSS (30 seconds)
Add this line to the `<head>` section of your main game HTML:

```html
<link rel="stylesheet" href="/static/css/svg-integration.css">
```

### Step 2: Add JavaScript (30 seconds)
Add this line before the closing `</body>` tag:

```html
<script src="/static/js/divine-council.js"></script>
```

### Step 3: Add Divine Council Modal (1 minute)
Copy the contents of `static/divine-council-modal.html` and paste before `</body>`:

```html
<!-- Divine Council Modal -->
<div id="council-voting-modal" class="divine-council-modal">
  <!-- ... full modal HTML ... -->
</div>
```

### Step 4: Test It! (2 minutes)
Open browser console and run:

```javascript
// Test the Divine Council voting modal
window.DivineCouncil.showVoting({
  approve: ['valdris', 'sylara', 'athena'],
  condemn: ['kaitha', 'morvane', 'korvan', 'mercus'],
  reasons: {
    valdris: "Justice demands order. You honored the law.",
    sylara: "Life is precious. Mercy shows wisdom.",
    athena: "Your reasoning was sound and measured.",
    kaitha: "You bowed to authority instead of choosing freedom!",
    morvane: "The weak do not deserve mercy. Only the strong survive.",
    korvan: "You showed weakness in battle. A warrior must be ruthless.",
    mercus: "There was profit to be gained. You squandered opportunity."
  },
  judgment: "The council is divided 3-4. Your choice has cost you favor, but you maintain balance in the cosmos.",
  choice: "spare the merchant"
});
```

You should see a beautiful animated modal with god icons voting!

---

## Priority Implementation Order

### PHASE 1: Quick Wins (1-2 hours)
These give immediate visual impact:

1. **Character Sheet God Icons** (30 min)
   ```html
   <!-- In divine favor section -->
   <div class="divine-god" data-god="valdris">
     <div class="god-icon-container">
       <img src="/static/images/god_valdris.svg"
            alt="Valdris"
            class="god-icon"
            width="32" height="32">
     </div>
     <div class="divine-info">
       <div class="divine-name valdris-name">VALDRIS</div>
       <div class="divine-title">Order & Justice</div>
     </div>
     <!-- ... rest of favor bar ... -->
   </div>
   ```

2. **Landing Page Logo** (30 min)
   ```html
   <div class="landing-hero">
     <div class="logo-container">
       <img src="/static/images/arcane_codex_logo.svg"
            alt="The Arcane Codex"
            class="logo-main"
            width="200" height="200">
     </div>
     <h1>The Arcane Codex</h1>
   </div>
   ```

3. **Top Nav Logo** (15 min)
   ```html
   <div class="nav-logo">
     <img src="/static/images/arcane_codex_logo.svg"
          alt="The Arcane Codex"
          width="40" height="40"
          class="logo-small">
     <span class="game-title-small">The Arcane Codex</span>
   </div>
   ```

### PHASE 2: Showcase Feature (2-3 hours)
The main attraction:

4. **Divine Council Voting Modal** (already set up!)
   - Just add the HTML modal
   - Call `window.DivineCouncil.showVoting()` when needed
   - Customize voting logic in your game code

### PHASE 3: Polish (1-2 hours)
Nice touches:

5. **Corner Flourishes** (30 min)
   ```html
   <div class="corner-decoration corner-tl">
     <img src="/static/images/corner_flourish.svg" alt="">
   </div>
   <!-- Repeat for tr, bl, br corners -->
   ```

6. **Section Dividers** (30 min)
   ```html
   <img src="/static/images/divider_line.svg"
        class="section-divider" alt="">
   ```

7. **Rune Bullet Points** (30 min)
   ```html
   <ul class="mystical-list">
     <li>
       <img src="/static/images/rune_symbol_1.svg" class="list-rune" alt="">
       <span>Ancient prophecies speak of your coming</span>
     </li>
   </ul>
   ```

---

## File Checklist

Make sure these files exist:

### CSS
- [x] `C:\Users\ilmiv\ProjectArgent\complete_game\static\css\svg-integration.css`

### JavaScript
- [x] `C:\Users\ilmiv\ProjectArgent\complete_game\static\js\divine-council.js`

### HTML Templates
- [x] `C:\Users\ilmiv\ProjectArgent\complete_game\static\divine-council-modal.html`

### SVG Assets (14 total)
- [x] `god_valdris.svg`
- [x] `god_kaitha.svg`
- [x] `god_morvane.svg`
- [x] `god_sylara.svg`
- [x] `god_korvan.svg`
- [x] `god_athena.svg`
- [x] `god_mercus.svg`
- [x] `arcane_codex_logo.svg`
- [x] `corner_flourish.svg`
- [x] `divider_line.svg`
- [x] `rune_symbol_1.svg`
- [x] `rune_symbol_2.svg`
- [x] `rune_symbol_3.svg`
- [x] `mystical_background.svg`

All in: `C:\Users\ilmiv\ProjectArgent\complete_game\static\images\`

---

## Common Use Cases

### Use Case 1: Show Voting After Player Choice
```javascript
// In your choice handler
function handlePlayerChoice(choice) {
  // Your existing game logic...

  // Determine which gods approve/condemn
  const voteData = {
    approve: ['valdris', 'sylara'],
    condemn: ['kaitha', 'korvan'],
    reasons: {
      valdris: "You upheld justice and order.",
      sylara: "Balance was maintained.",
      kaitha: "You denied freedom!",
      korvan: "Courage was lacking."
    },
    judgment: "The Council is divided 2-2. The gods watch closely.",
    choice: choice.text
  };

  // Show the voting modal
  window.DivineCouncil.showVoting(voteData);

  // Set what happens when user clicks continue
  window.DivineCouncil.setContinueCallback(() => {
    // Continue with your story/game logic
    continueStory();
  });
}
```

### Use Case 2: Auto-Generate Voting Based on Favor
```javascript
// Use the built-in generator
const playerChoice = {
  text: "spare the merchant",
  alignments: ['lawful', 'just', 'merciful']
};

const currentFavor = {
  valdris: 15,
  kaitha: -10,
  morvane: 20,
  sylara: 5,
  korvan: 25,
  athena: 10,
  mercus: -5
};

// Generate voting data automatically
const voteData = window.DivineCouncil.generateVotingData(
  playerChoice,
  currentFavor
);

// Show the modal
window.DivineCouncil.showVoting(voteData);

// Update favor after voting
const newFavor = window.DivineCouncil.updateFavorLevels(
  voteData,
  currentFavor
);

// Save new favor to your game state
savePlayerFavor(newFavor);
```

### Use Case 3: Character Sheet Integration
```html
<!-- Replace your existing divine favor section with: -->
<div class="divine-favor-section">
  <div class="divine-favor-header">
    <img src="/static/images/rune_symbol_1.svg" class="section-icon" alt="">
    Divine Favor
    <img src="/static/images/rune_symbol_1.svg" class="section-icon" alt="">
  </div>

  <!-- VALDRIS -->
  <div class="divine-god" data-god="valdris">
    <div class="god-icon-container">
      <img src="/static/images/god_valdris.svg"
           alt="Valdris"
           class="god-icon"
           width="32" height="32">
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

  <!-- Repeat for other gods: kaitha, morvane, sylara, korvan, athena, mercus -->
</div>
```

---

## Troubleshooting

### Modal Doesn't Appear
1. Check console for errors: `F12` > Console
2. Verify modal HTML is in the page (Inspect Element)
3. Ensure `divine-council.js` is loaded (Console: `window.DivineCouncil`)
4. Check if modal has `.active` class when shown

### SVG Icons Don't Load
1. Verify file paths are correct (should be `/static/images/god_*.svg`)
2. Check browser Network tab for 404 errors
3. Ensure files exist in `static/images/` directory
4. Try accessing SVG directly: `http://localhost:8000/static/images/god_valdris.svg`

### Animations Don't Work
1. Check if `svg-integration.css` is loaded
2. Look for CSS errors in console
3. Test if CSS variables are defined (Inspect Element > Computed styles)
4. Disable any ad blockers that might block animations

### Styling Conflicts
1. Make sure `svg-integration.css` loads AFTER your main CSS
2. Check for conflicting class names
3. Use browser DevTools to inspect applied styles
4. Add `!important` to critical styles if needed (last resort)

---

## Browser Support

### Fully Supported
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Partial Support (graceful degradation)
- IE 11: No backdrop-filter, reduced animations
- Older mobile browsers: Simplified layout, no complex filters

### Fallbacks Included
- PNG fallback for SVG (via `<object>` tag)
- Reduced motion support (`prefers-reduced-motion`)
- No-JS fallback (static display)

---

## Performance Tips

1. **Preload Critical SVGs**
   ```html
   <link rel="preload" href="/static/images/arcane_codex_logo.svg" as="image">
   ```

2. **Lazy Load Below-Fold**
   ```html
   <img src="/static/images/corner_flourish.svg" loading="lazy">
   ```

3. **Optimize SVG Files**
   ```bash
   npx svgo -f static/images/ -o static/images/optimized/
   ```

4. **Use CSS Containment**
   Already included in `svg-integration.css` for god icons

5. **Monitor Performance**
   ```javascript
   // Check frame rate
   window.addEventListener('load', () => {
     const observer = new PerformanceObserver((list) => {
       for (const entry of list.getEntries()) {
         console.log('LCP:', entry.renderTime);
       }
     });
     observer.observe({ entryTypes: ['largest-contentful-paint'] });
   });
   ```

---

## Next Steps

1. **Test on Real Devices**
   - Mobile phones (iOS/Android)
   - Tablets
   - Desktop browsers

2. **Gather User Feedback**
   - Is the voting modal clear?
   - Are animations too fast/slow?
   - Do god icons help with immersion?

3. **Iterate & Polish**
   - Adjust timing based on feedback
   - Add more god-specific animations
   - Create additional notification types

4. **Optimize for Production**
   - Minify CSS/JS
   - Compress SVGs
   - Set up CDN for static assets

---

## Support

For questions or issues:
1. Check `SVG_INTEGRATION_PLAN.md` for detailed specs
2. Review example code in `divine-council.js` comments
3. Inspect `svg-integration.css` for available classes
4. Test with demo HTML file (create one if needed)

Good luck with your integration!
