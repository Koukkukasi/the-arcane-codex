# The Arcane Codex - Design System Migration Guide

## Quick Start Integration

To integrate the design system into your existing `arcane_codex_scenario_ui_enhanced.html` file, follow these steps:

### Step 1: Add Design System CSS Files

Add these lines to the `<head>` section of your HTML file, right after the Google Fonts link:

```html
<!-- Add these lines after the Google Fonts import -->
<link rel="stylesheet" href="arcane_codex_design_system.css">
<link rel="stylesheet" href="arcane_codex_components.css">
```

### Step 2: Update Root Variables

The design system uses more comprehensive CSS variables. You can either:
- **Option A**: Keep your existing variables and map them to design system tokens
- **Option B**: Replace your variables with design system tokens (recommended)

#### Mapping Table - Existing to Design System

| Your Current Variable | Design System Token | Value |
|----------------------|---------------------|-------|
| `--gold-bright` | `--color-gold-300` | #FFD700 |
| `--gold-medium` | `--color-gold-400` | #D4AF37 |
| `--gold-dark` | `--color-gold-500` | #B8860B |
| `--bronze-light` | `--color-gold-600` | #8B7355 |
| `--bronze-medium` | `--color-dark-100` | #5C4A3A |
| `--bronze-dark` | `--color-dark-100` | #3E342A |
| `--bg-dark` | `--color-dark-500` | #0A0908 |
| `--space-xs` | `--space-xs` | 4px |
| `--space-sm` | `--space-sm` | 8px |
| `--space-md` | `--space-md` | 12px |
| `--space-lg` | `--space-lg` | 16px |
| `--space-xl` | `--space-xl` | 24px |

### Step 3: Component Migration Examples

#### Buttons

**Before:**
```html
<button style="background: linear-gradient(#FFD700, #D4AF37); padding: 10px 20px; border: 2px solid #B8860B;">
    Cast Spell
</button>
```

**After:**
```html
<button class="btn btn-primary">
    Cast Spell
</button>
```

#### Cards/Panels

**Before:**
```html
<div class="panel-section">
    <div class="panel-header">Quest Details</div>
    <div class="panel-content">
        Content here...
    </div>
</div>
```

**After:**
```html
<div class="card">
    <div class="card-header">Quest Details</div>
    <div class="card-body">
        Content here...
    </div>
</div>
```

#### Progress Bars

**Before:**
```html
<div class="resource-bar">
    <div class="health-fill" style="width: 85%"></div>
    <span class="bar-text">85/100</span>
</div>
```

**After:**
```html
<div class="progress-bar progress-health">
    <div class="progress-fill" style="width: 85%"></div>
    <div class="progress-text">85/100 HP</div>
</div>
```

### Step 4: Overlay Migration

Your existing overlays can be enhanced with design system classes:

#### Character Sheet Overlay

**Add these classes to enhance the existing overlay:**
```html
<!-- Character Sheet Overlay -->
<div id="character-overlay" class="overlay character-sheet-overlay animate-fadeIn">
    <div class="overlay-backdrop"></div>
    <div class="overlay-content character-sheet-content">
        <!-- Update internal components to use design system -->
        <h2 class="text-display-md text-gradient-gold">Character Sheet</h2>

        <!-- Use design system buttons -->
        <button class="btn btn-ghost modal-close">×</button>

        <!-- Apply card styles to sections -->
        <div class="card">
            <div class="card-header">Attributes</div>
            <div class="card-body">
                <!-- Content -->
            </div>
        </div>
    </div>
</div>
```

#### Inventory Overlay

**Enhance inventory items with rarity classes:**
```html
<!-- Inventory items with rarity -->
<div class="inventory-slot card card-item rarity-legendary">
    <img src="sword.png" alt="Legendary Sword">
    <span class="text-caption">Excalibur</span>
</div>
```

### Step 5: Divine Council Integration

The design system includes specific colors for each god:

```html
<!-- God-specific styling -->
<div class="god-panel" style="border-color: var(--color-god-solaris);">
    <h3 class="text-heading-md" style="color: var(--color-god-solaris);">
        Solaris - Sun God
    </h3>
    <button class="btn btn-ghost" style="border-color: var(--color-god-solaris);">
        Invoke Divine Power
    </button>
</div>
```

### Step 6: Animation Enhancements

Add entrance animations to your overlays and cards:

```html
<!-- Add animation classes -->
<div class="card animate-fadeInUp">
    <!-- Card content -->
</div>

<!-- Celebration animations for victories -->
<div class="victory-modal animate-victory">
    <h2 class="text-display-lg text-glow-gold">VICTORY!</h2>
</div>

<!-- Loading states -->
<div class="spinner spinner-lg"></div>

<!-- Skeleton loading -->
<div class="skeleton skeleton-text"></div>
```

### Step 7: Responsive Improvements

Use responsive utility classes:

```html
<!-- Mobile responsive -->
<div class="hide-mobile">Desktop only content</div>
<div class="show-mobile">Mobile only content</div>

<!-- Fluid typography -->
<h1 class="text-fluid-lg">Responsive heading</h1>
```

### Step 8: Form Controls

Update your settings overlay with design system forms:

```html
<!-- Settings form controls -->
<div class="form-group">
    <label class="form-label">Volume</label>
    <input type="range" class="form-slider" min="0" max="100">
</div>

<div class="form-group">
    <label class="flex items-center gap-sm">
        <input type="checkbox" class="form-checkbox">
        <span>Enable Sound</span>
    </label>
</div>
```

## Specific Migration for Each Overlay

### 1. Character Sheet Overlay

```css
/* Add to your existing character sheet styles */
.character-sheet-overlay .stat-group {
    /* Replace with */
    @extend .card;
}

.character-sheet-overlay .stat-value {
    /* Replace with */
    @extend .text-heading-sm;
    @extend .text-gold;
}
```

### 2. Inventory Overlay

```css
/* Update inventory grid */
.inventory-grid {
    /* Replace with */
    @extend .grid;
    @extend .grid-4;
    @extend .gap-md;
}

/* Item slots with rarity */
.inventory-slot {
    /* Add rarity classes dynamically */
    /* .rarity-common, .rarity-rare, .rarity-legendary, etc. */
}
```

### 3. Skills Overlay

```css
/* Skill cards */
.skill-card {
    /* Replace with */
    @extend .card;
    @extend .animate-fadeIn;
}

/* Skill tooltips */
.skill-tooltip {
    /* Replace with */
    @extend .tooltip-content;
}
```

### 4. Quest Overlay

```css
/* Quest items */
.quest-item {
    /* Replace with */
    @extend .card;
    @extend .card-quest;
}

/* Quest progress */
.quest-progress {
    /* Replace with */
    @extend .progress-bar;
}
```

### 5. Map Overlay

```css
/* Map locations */
.map-location {
    /* Add hover effects */
    @extend .transition-all;
    @extend .glow-gold:hover;
}
```

### 6. Settings Overlay

```css
/* Settings panels */
.settings-section {
    /* Replace with */
    @extend .panel;
}

/* Settings controls */
/* Use form components from design system */
```

## JavaScript Enhancements

### Add Animation Triggers

```javascript
// Add entrance animations when showing overlays
function showOverlay(overlayId) {
    const overlay = document.getElementById(overlayId);
    overlay.classList.add('active', 'animate-fadeIn');

    // Add animation to content
    const content = overlay.querySelector('.overlay-content');
    content.classList.add('animate-scaleIn');
}

// Victory celebrations
function showVictory() {
    const victoryElement = document.querySelector('.victory-message');
    victoryElement.classList.add('animate-victory', 'text-glow-gold');

    // Play celebration animation
    setTimeout(() => {
        victoryElement.classList.add('animate-levelUp');
    }, 1000);
}

// Loading states
function setLoading(element, isLoading) {
    if (isLoading) {
        element.classList.add('btn-loading');
        element.disabled = true;
    } else {
        element.classList.remove('btn-loading');
        element.disabled = false;
    }
}
```

### Add Notification System

```javascript
// Create notification function
function notify(type, title, message) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type} show`;
    notification.innerHTML = `
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Usage examples
notify('success', 'Quest Complete!', 'You earned 500 XP');
notify('error', 'Battle Lost', 'Try again with better equipment');
notify('warning', 'Low Health', 'Find a healing potion');
```

## Performance Optimizations

### 1. Use CSS Classes Instead of Inline Styles

```html
<!-- Bad: Inline styles -->
<div style="background: #D4AF37; padding: 15px; border-radius: 8px;">

<!-- Good: Design system classes -->
<div class="card">
```

### 2. Leverage CSS Variables for Theming

```css
/* Create theme variations */
.dark-theme {
    --color-gold-400: #B8860B;
    --color-dark-500: #000000;
}

.light-theme {
    --color-gold-400: #FFD700;
    --color-dark-500: #F5F5F5;
}
```

### 3. Use Animation Classes for Smooth Transitions

```html
<!-- Add animation classes for smooth interactions -->
<div class="card transition-all hover:shadow-xl">
    <!-- Content -->
</div>
```

## Testing Checklist

After migration, test these areas:

- [ ] All overlays open and close properly
- [ ] Animations play smoothly
- [ ] Colors are consistent across components
- [ ] Buttons have proper hover/active states
- [ ] Progress bars update correctly
- [ ] Tooltips appear on hover
- [ ] Forms are styled consistently
- [ ] Rarity glows work on items
- [ ] God-specific colors display correctly
- [ ] Responsive design works on mobile
- [ ] Loading states display properly
- [ ] Notifications appear and dismiss

## Gradual Migration Approach

If you prefer a gradual migration:

### Phase 1: Core Infrastructure
1. Add design system CSS files
2. Keep existing styles
3. Start using utility classes for new components

### Phase 2: Component Migration
1. Replace buttons with design system buttons
2. Update cards and panels
3. Migrate progress bars

### Phase 3: Advanced Features
1. Add animations
2. Implement notification system
3. Add loading states

### Phase 4: Polish
1. Update all colors to use tokens
2. Add responsive utilities
3. Implement accessibility features

## Troubleshooting

### Common Issues and Solutions

**Issue: Styles not applying**
- Ensure CSS files are loaded in correct order
- Check for typos in class names
- Verify no conflicting styles

**Issue: Animations not working**
- Check if user has reduced motion enabled
- Verify animation classes are applied
- Ensure elements are visible

**Issue: Colors look different**
- Verify you're using the correct design token
- Check for opacity or filter effects
- Ensure parent backgrounds aren't affecting colors

## Support

For questions or issues with the design system:
- Review the style guide: `arcane_codex_style_guide.html`
- Check the documentation: `DESIGN_SYSTEM_DOCUMENTATION.md`
- Test components in: `DESIGN_SYSTEM_INTEGRATION.html`

## File Structure

```
/static/
├── arcane_codex_scenario_ui_enhanced.html  (Your main file)
├── arcane_codex_design_system.css          (Core design tokens)
├── arcane_codex_components.css             (Component library)
├── arcane_codex_style_guide.html           (Visual reference)
├── DESIGN_SYSTEM_DOCUMENTATION.md          (Full documentation)
├── DESIGN_SYSTEM_INTEGRATION.html          (Integration examples)
└── MIGRATION_GUIDE.md                      (This file)
```

---

*Migration Guide v1.0.0 - The Arcane Codex Design System*