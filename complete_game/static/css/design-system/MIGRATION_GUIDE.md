# The Arcane Codex - Design System Migration Guide

## Overview

This guide provides a systematic approach to migrate from inline styles to the modular design system, ensuring consistency, performance, and maintainability.

---

## Pre-Migration Checklist

- [ ] Back up current HTML files
- [ ] Document current inline style patterns
- [ ] Set up testing environment
- [ ] Install CSS analysis tools
- [ ] Create performance baselines

---

## Phase 1: Token Reconciliation (Days 1-3)

### Step 1.1: Create Variable Mapping

```css
/* migration-adapter.css */
/* Map old variables to new design system tokens */

:root {
  /* Legacy to Design System Mapping */
  --gold-bright: var(--color-divine-400);
  --gold-medium: var(--color-divine-500);
  --gold-dark: var(--color-divine-600);

  --bronze-light: var(--color-divine-700);
  --bronze-medium: var(--color-divine-800);
  --bronze-dark: var(--color-divine-900);

  --bg-dark: var(--color-background);
  --bg-panel: var(--color-surface);
  --bg-panel-secondary: var(--color-surface-hover);

  --whisper-purple: var(--color-arcane-500);
  --whisper-purple-light: var(--color-arcane-400);
  --whisper-bg: var(--color-arcane-100);

  /* Space mapping */
  --space-xs: var(--space-1);  /* 6px → 0.25rem */
  --space-sm: var(--space-2);  /* 10px → 0.5rem */
  --space-md: var(--space-4);  /* 15px → 1rem */
  --space-lg: var(--space-5);  /* 20px → 1.25rem */
  --space-xl: var(--space-8);  /* 30px → 2rem */

  /* Transition mapping */
  --transition-fast: var(--duration-fast) var(--ease-out);
  --transition-normal: var(--duration-base) var(--ease-in-out);
  --transition-slow: var(--duration-slow) var(--ease-in-out);
}
```

### Step 1.2: Update Import Structure

```html
<!-- In your HTML head -->
<!-- Phase 1: Add adapter after design system -->
<link rel="stylesheet" href="/static/css/design-system.css">
<link rel="stylesheet" href="/static/css/migration-adapter.css">

<!-- Phase 2: Your existing styles will work with new system -->
<style>
  /* Existing inline styles continue to work */
</style>
```

---

## Phase 2: Component Extraction (Days 4-10)

### Step 2.1: Identify Reusable Patterns

```javascript
// pattern-analyzer.js
// Run this to identify repeated patterns in HTML

const patterns = {
  'top-hud': /class="top-hud"/g,
  'resource-bar': /class=".*resource-bar.*"/g,
  'portrait-frame': /class=".*portrait.*"/g,
  'panel-section': /class=".*panel.*"/g
};

// Generate report of component usage
```

### Step 2.2: Create Component Classes

Transform inline styles to reusable components:

**Before (Inline):**
```html
<div style="
  width: 180px;
  height: 18px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6));
  border: 2px solid #3E342A;
  border-radius: 9px;
  overflow: hidden;
">
  <div style="
    height: 100%;
    width: 85%;
    background: linear-gradient(90deg, #660000, #CC0000, #FF3333, #CC0000);
  "></div>
</div>
```

**After (Component):**
```html
<div class="health-bar">
  <div class="health-bar-fill" style="width: 85%"></div>
</div>
```

### Step 2.3: Component Priority List

1. **Critical (Week 1)**
   - Health/Mana bars
   - Character portraits
   - Action buttons
   - Resource displays

2. **Important (Week 2)**
   - Panel sections
   - Inventory grids
   - Dialogue boxes
   - Map components

3. **Enhancement (Week 3)**
   - Animations
   - Particle effects
   - Transitions
   - Themes

---

## Phase 3: Progressive Implementation (Days 11-20)

### Step 3.1: Section-by-Section Migration

```html
<!-- Start with isolated sections -->

<!-- 1. Migrate HUD -->
<header class="top-hud game-header">
  <div class="player-status">
    <div class="character-portrait">
      <!-- Use new component classes -->
    </div>
    <div class="player-bars">
      <div class="health-bar">
        <div class="health-bar-fill"></div>
        <span class="bar-text">85/100</span>
      </div>
      <div class="mana-bar">
        <div class="mana-bar-fill"></div>
        <span class="bar-text">60/100</span>
      </div>
    </div>
  </div>
</header>
```

### Step 3.2: Testing Protocol

```javascript
// visual-regression-test.js
describe('Design System Migration', () => {
  it('should match visual baseline', () => {
    // Capture screenshots
    cy.screenshot('hud-migrated');

    // Compare with baseline
    cy.compareSnapshot('hud-baseline');

    // Check computed styles
    cy.get('.health-bar')
      .should('have.css', 'height', '24px')
      .should('have.css', 'border-radius', '12px');
  });
});
```

---

## Phase 4: Optimization (Days 21-25)

### Step 4.1: Remove Redundancy

```bash
# Find unused CSS
npx purgecss \
  --css static/css/design-system.css \
  --content static/*.html \
  --output static/css/design-system.min.css
```

### Step 4.2: Bundle Optimization

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            modules: true,
            importLoaders: 1
          }
        },
        'postcss-loader'
      ]
    }]
  },
  optimization: {
    minimizer: [
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            }
          ]
        }
      })
    ]
  }
};
```

### Step 4.3: Critical CSS Extraction

```html
<!-- Inline critical CSS for faster first paint -->
<style>
  /* Critical path CSS */
  :root {
    --color-background: #0A0908;
    --color-divine-400: #fbbf24;
  }

  body {
    background: var(--color-background);
    margin: 0;
  }

  .game-container {
    display: flex;
    height: 100vh;
  }
</style>

<!-- Load full CSS async -->
<link rel="preload" href="/static/css/design-system.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

---

## Migration Examples

### Example 1: Button Migration

**Original Inline:**
```html
<button style="
  padding: 10px 20px;
  background: linear-gradient(135deg, #8B7355, #D4AF37);
  border: 2px solid #D4AF37;
  border-radius: 5px;
  color: #2A1810;
  font-family: 'Cinzel', serif;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
">
  Start Quest
</button>
```

**Migrated:**
```html
<button class="btn btn-divine btn-lg">
  Start Quest
</button>
```

### Example 2: Card Migration

**Original Inline:**
```html
<div style="
  background: linear-gradient(135deg, rgba(42, 36, 30, 0.95), rgba(26, 22, 18, 0.95));
  border: 3px solid #8B7355;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.8);
">
  <h3 style="color: #D4AF37; font-family: 'Cinzel';">Quest Log</h3>
  <p style="color: #8B7355;">Active quests appear here...</p>
</div>
```

**Migrated:**
```html
<div class="card scenario-card">
  <h3 class="card-title text-divine">Quest Log</h3>
  <p class="card-body text-secondary">Active quests appear here...</p>
</div>
```

---

## Performance Monitoring

### Metrics to Track

```javascript
// performance-monitor.js
const metrics = {
  // Before migration
  before: {
    firstPaint: 1850,      // ms
    cssSize: 287,          // KB
    renderTime: 2300,      // ms
    layoutShifts: 0.15     // CLS score
  },

  // Target after migration
  target: {
    firstPaint: 1200,      // 35% improvement
    cssSize: 65,           // 77% reduction
    renderTime: 1500,      // 35% improvement
    layoutShifts: 0.05     // 67% improvement
  }
};

// Monitor improvements
function trackPerformance() {
  const perfData = performance.getEntriesByType('paint');
  const cssSize = document.styleSheets.length;

  console.table({
    'First Paint': perfData[0].startTime,
    'CSS Files': cssSize,
    'Total Styles': getAllStyles().length
  });
}
```

---

## Rollback Strategy

If issues arise during migration:

1. **Immediate Rollback:**
```html
<!-- Revert to backup -->
<link rel="stylesheet" href="/static/css/backup/original-styles.css">
```

2. **Gradual Rollback:**
```css
/* Override problematic components only */
.health-bar {
  /* Revert to original styles */
  all: revert;
}
```

3. **Feature Flags:**
```javascript
// Use feature flags for progressive rollout
if (features.useNewDesignSystem) {
  document.body.classList.add('design-system-v2');
} else {
  document.body.classList.add('legacy-styles');
}
```

---

## Post-Migration Tasks

### Documentation
- [ ] Update component documentation
- [ ] Create usage examples
- [ ] Document design decisions
- [ ] Create onboarding guide

### Testing
- [ ] Cross-browser testing
- [ ] Mobile responsiveness
- [ ] Accessibility audit
- [ ] Performance benchmarks

### Maintenance
- [ ] Set up CSS linting
- [ ] Create style guide
- [ ] Establish review process
- [ ] Plan quarterly audits

---

## Common Issues & Solutions

### Issue 1: Specificity Conflicts
```css
/* Solution: Use CSS Cascade Layers */
@layer reset, base, components, utilities;

@layer components {
  .btn { /* component styles */ }
}

@layer utilities {
  .text-center { /* utility styles */ }
}
```

### Issue 2: Missing Styles After Migration
```javascript
// Audit missing styles
const findMissingStyles = () => {
  const inlineStyles = document.querySelectorAll('[style]');
  const missing = [];

  inlineStyles.forEach(el => {
    const styles = el.getAttribute('style');
    if (!hasEquivalentClass(el, styles)) {
      missing.push({element: el, styles});
    }
  });

  console.warn('Elements with unmigratedstyles:', missing);
};
```

### Issue 3: Performance Degradation
```css
/* Optimize expensive selectors */
/* Bad */
.game-container > div > div > .panel > .content > p:nth-child(3) {
  /* styles */
}

/* Good */
.panel-text {
  /* styles */
}
```

---

## Success Criteria

Migration is complete when:

1. ✅ Zero inline styles in production HTML
2. ✅ CSS file size < 75KB (gzipped)
3. ✅ First paint time < 1.5s
4. ✅ 60fps animations consistently
5. ✅ WCAG AA accessibility compliance
6. ✅ Visual regression tests passing
7. ✅ Cross-browser compatibility verified
8. ✅ Documentation complete

---

## Resources

- [Design System Documentation](./DESIGN_SYSTEM.md)
- [Component Library](./COMPONENTS.md)
- [Animation Guide](./ANIMATIONS.md)
- [Performance Best Practices](./PERFORMANCE.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)

---

*Migration Guide Version: 1.0.0*
*Last Updated: November 2024*
*Contact: design-system@arcane-codex.com*