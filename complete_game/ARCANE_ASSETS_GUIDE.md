# The Arcane Codex - Visual Assets Guide

## Overview

This guide documents all visual assets created for "The Arcane Codex" - a dark fantasy multiplayer RPG with a Dark Souls meets Baldur's Gate 3 aesthetic.

**Theme**: Gods, secrets, betrayal, divine judgment
**Color Palette**: Deep purples (#8B5CF6), divine gold (#d4af37), shadow blacks (#0F0F17), ethereal blues (#3b82f6)

---

## Asset Inventory

### 1. Divine Symbol / Main Logo

**File**: `static/images/arcane_codex_logo.svg`
**Size**: 200×200px (scalable SVG)
**Description**: The Eye of Judgment within an ancient codex book. Features mystical circles, runic symbols, and golden/purple color scheme.

**Usage**:
```html
<div class="divine-symbol">
  <img src="static/images/arcane_codex_logo.svg" alt="The Arcane Codex">
</div>
```

**Features**:
- Outer mystical circles with purple gradients
- Ancient book representation
- Central all-seeing eye (Eye of Judgment)
- Corner ornaments with runic symbols
- Golden accents and ethereal particles
- Automatically rotates when using `arcane_particles.js`

---

### 2. God Icons (Set of 7)

All icons are 64×64px scalable SVG files with unique symbolism.

#### VALDRIS - Order/Law
**File**: `static/images/god_valdris.svg`
**Symbol**: Balanced scales crowned with royal regalia
**Colors**: Gold gradient with purple jewels
**Represents**: Divine justice, law, balance, order

#### KAITHA - Chaos/Freedom
**File**: `static/images/god_kaitha.svg`
**Symbol**: Wild flame with chaotic wisps
**Colors**: Fiery gradient (gold → orange → red)
**Represents**: Chaos, freedom, unpredictability, rebellion

#### MORVANE - Survival/Death
**File**: `static/images/god_morvane.svg`
**Symbol**: Raven perched above a skull
**Colors**: Dark grays with purple accents
**Represents**: Death, survival, the inevitable, transformation

#### SYLARA - Nature/Healing
**File**: `static/images/god_sylara.svg`
**Symbol**: Sacred tree with life energy
**Colors**: Vibrant greens with golden life force
**Represents**: Nature, healing, growth, vitality

#### KORVAN - War/Honor
**File**: `static/images/god_korvan.svg`
**Symbol**: Crossed sword and shield
**Colors**: Steel grays, crimson red, gold accents
**Represents**: War, honor, valor, combat prowess

#### ATHENA - Wisdom/Knowledge
**File**: `static/images/god_athena.svg`
**Symbol**: All-seeing owl above ancient tome
**Colors**: Deep blues with golden radiance
**Represents**: Wisdom, knowledge, foresight, learning

#### MERCUS - Commerce/Wealth
**File**: `static/images/god_mercus.svg`
**Symbol**: Merchant scales with golden coins
**Colors**: Rich golds with orange accents
**Represents**: Commerce, wealth, trade, prosperity

**Usage**:
```html
<img src="static/images/god_valdris.svg" alt="Valdris" class="god-icon">
```

**Hover Effects**: When using `arcane_effects.css`, god icons will:
- Float upward 5px
- Scale to 110%
- Emit golden and purple glow
- Create expanding aura (with JavaScript)

---

### 3. Decorative Elements

#### Corner Flourish
**File**: `static/images/corner_flourish.svg`
**Size**: 100×100px
**Description**: Ornate arcane corner decoration with swirls and runic dots

**Usage**:
```html
<div class="arcane-corner corner-top-left">
  <img src="static/images/corner_flourish.svg" alt="">
</div>
```

**Corner Classes**:
- `corner-top-left` - No rotation
- `corner-top-right` - Rotated 90°
- `corner-bottom-left` - Rotated -90°
- `corner-bottom-right` - Rotated 180°

#### Divider Line
**File**: `static/images/divider_line.svg`
**Size**: 400×40px
**Description**: Mystical horizontal divider with central diamond ornament

**Usage**:
```html
<div class="arcane-divider"></div>
```

---

### 4. Rune Symbols (Set of 3)

Floating animated runes for mystical atmosphere.

**Files**:
- `static/images/rune_symbol_1.svg` - Circle rune with cross pattern
- `static/images/rune_symbol_2.svg` - Triangle rune with eye symbol
- `static/images/rune_symbol_3.svg` - Hexagon rune with geometric inner pattern

**Size**: 32×32px each

**Usage**:
```html
<img src="static/images/rune_symbol_1.svg" class="floating-rune" alt="">
```

**Animation**: Automatically float upward with rotation when using CSS classes.

---

## CSS Files

### game.css
The main stylesheet with design system, colors, typography, and component styles.

**Key Features**:
- CSS variables for consistent theming
- Responsive grid layouts
- Dark fantasy color palette
- Typography system
- Component library (buttons, cards, forms)

### arcane_effects.css
Advanced visual effects and animations.

**Includes**:
- Mystical background with animated grid
- Floating particle effects
- Glowing orb animations
- Rune floating animations
- Text shimmer effects
- Divine symbol pulse
- Ethereal glow on hover
- Arcane loading spinner
- Page reveal animations

**Usage**:
```html
<link rel="stylesheet" href="static/css/game.css">
<link rel="stylesheet" href="static/css/arcane_effects.css">
```

---

## JavaScript

### arcane_particles.js
Dynamic particle system for enhanced visual effects.

**Classes**:

#### ArcaneParticleSystem
Creates and manages floating particles and runes.

```javascript
const particles = new ArcaneParticleSystem();
particles.init({
  floatingParticles: 20,  // Number of magical particles
  floatingRunes: 5,       // Number of floating runes
  interactive: true       // Enable click/touch dust bursts
});
```

**Methods**:
- `addFloatingParticles(count)` - Add golden/purple particles
- `addFloatingRunes(count)` - Add rotating rune symbols
- `createDustBurst(x, y, count)` - Burst effect at position
- `enableInteractiveDust()` - Click/touch creates dust
- `clear()` - Remove all particles

#### DivineSymbolController
Controls rotation speed of the main divine symbol.

```javascript
const symbol = document.querySelector('.divine-symbol');
new DivineSymbolController(symbol);
```

**Features**:
- Slow continuous rotation
- Speeds up on hover
- Smooth animation using requestAnimationFrame

#### GodIconEffects
Adds aura effects to god icons on hover.

```javascript
new GodIconEffects();
```

**Auto-initialization**: Script automatically initializes when DOM is ready (respects `prefers-reduced-motion`).

---

## Complete Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Arcane Codex</title>

  <!-- Stylesheets -->
  <link rel="stylesheet" href="static/css/game.css">
  <link rel="stylesheet" href="static/css/arcane_effects.css">
</head>
<body>
  <!-- Arcane Background Layer -->
  <div class="arcane-background">
    <div class="mystical-orb orb-purple"></div>
    <div class="mystical-orb orb-gold"></div>
  </div>

  <!-- Corner Decorations -->
  <div class="arcane-corner corner-top-left">
    <img src="static/images/corner_flourish.svg" alt="">
  </div>
  <div class="arcane-corner corner-top-right">
    <img src="static/images/corner_flourish.svg" alt="">
  </div>
  <div class="arcane-corner corner-bottom-left">
    <img src="static/images/corner_flourish.svg" alt="">
  </div>
  <div class="arcane-corner corner-bottom-right">
    <img src="static/images/corner_flourish.svg" alt="">
  </div>

  <!-- Main Content -->
  <div class="landing-page">
    <div class="container">
      <!-- Divine Symbol -->
      <div class="game-header">
        <div class="divine-symbol">
          <img src="static/images/arcane_codex_logo.svg" alt="The Arcane Codex">
        </div>

        <div class="game-title">
          <h1 class="title-main text-shimmer">THE ARCANE CODEX</h1>
          <p class="title-sub">Where Gods Judge and Mortals Tremble</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="arcane-divider"></div>

      <!-- God Icons -->
      <div class="features-grid">
        <div class="feature-card codex-reveal">
          <img src="static/images/god_valdris.svg" alt="Valdris" class="god-icon">
          <h3>VALDRIS</h3>
          <p>God of Order and Law</p>
        </div>
        <!-- Repeat for other gods... -->
      </div>

      <!-- Game Actions -->
      <div class="game-actions">
        <button class="btn btn-primary btn-large">
          Enter the Codex
        </button>
      </div>
    </div>
  </div>

  <!-- Particle System (auto-creates container) -->
  <script src="static/js/arcane_particles.js"></script>
</body>
</html>
```

---

## Utility CSS Classes

### Animation Classes
- `text-shimmer` - Golden shimmer text effect
- `codex-reveal` - Fade-in reveal animation (staggered)
- `ethereal-glow` - Mystical glow on hover
- `god-icon` - God icon with hover effects
- `divine-symbol` - Main logo with rotation
- `floating-rune` - Floating rune animation

### Layout Classes
- `arcane-background` - Full-screen mystical background
- `arcane-corner` - Corner decoration positioning
- `arcane-divider` - Horizontal divider with ornaments
- `arcane-particles` - Particle container
- `arcane-loader` - Loading spinner animation

### Effect Elements
- `mystical-orb` - Large glowing orb
  - `orb-purple` - Purple variant
  - `orb-gold` - Gold variant
- `particle` - Single floating particle
- `mystical-dust` - Dust particle effect

---

## Color Reference

```css
/* Primary Colors */
--color-primary: #8B5CF6;        /* Deep purple */
--color-accent: #F59E0B;         /* Gold */
--color-bg-primary: #0F0F17;     /* Deep dark background */

/* God-specific Colors */
Valdris (Order):     #d4af37 (Gold)
Kaitha (Chaos):      #ff6b35 (Flame Orange)
Morvane (Death):     #4b5563 (Gray)
Sylara (Nature):     #10b981 (Green)
Korvan (War):        #ef4444 (Red)
Athena (Wisdom):     #3b82f6 (Blue)
Mercus (Wealth):     #f59e0b (Gold/Orange)
```

---

## File Size & Performance

All assets are optimized for web performance:

- **SVG Files**: ~2-5 KB each (excellent compression)
- **CSS Files**: ~45 KB combined (minify for production)
- **JavaScript**: ~8 KB (minimal overhead)
- **Total Asset Weight**: < 100 KB for all graphics

**Recommendations**:
1. Serve SVGs with gzip compression (reduces by ~60%)
2. Use CSS/JS minification for production
3. Consider lazy-loading particles on mobile
4. Respect `prefers-reduced-motion` (already implemented)

---

## Accessibility

All assets include accessibility features:

- **Reduced Motion**: Animations disabled for `prefers-reduced-motion: reduce`
- **High Contrast**: Border enhancements for `prefers-contrast: high`
- **Alt Text**: All decorative images have empty alt text (`alt=""`)
- **Semantic Icons**: God icons include descriptive alt text
- **Keyboard Navigation**: All interactive elements are keyboard accessible

---

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **SVG Support**: All modern browsers (IE11+ with polyfills)
- **CSS Animations**: Full support in all modern browsers
- **Gradient Filters**: WebKit prefix included for compatibility

---

## Customization

### Changing Colors

Edit CSS variables in `game.css`:

```css
:root {
  --color-primary: #8B5CF6;     /* Change main purple */
  --color-accent: #d4af37;      /* Change gold accent */
}
```

### Adjusting Animation Speed

Edit animation durations in `arcane_effects.css`:

```css
@keyframes particleFloat {
  /* Change from 40s to faster/slower */
  animation-duration: 40s;
}
```

### Particle Density

Adjust in JavaScript:

```javascript
particles.init({
  floatingParticles: 30,  // More particles
  floatingRunes: 10       // More runes
});
```

---

## Demo Page

View all assets in action:
**File**: `static/arcane_assets_demo.html`

Open this file in a browser to see:
- All god icons with hover effects
- Background animations
- Particle systems
- Decorative elements
- Integration examples
- Code snippets

---

## Support & Maintenance

**Created**: 2025
**Version**: 1.0
**Framework Compatibility**: Vanilla HTML/CSS/JS (works with any framework)

For questions or customization requests, refer to the demo page or inspect the source files.

---

**May the Gods grant you wisdom in judgment.**
