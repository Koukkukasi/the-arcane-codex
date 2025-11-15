# The Arcane Codex - Design System Documentation

## Version 1.0.0

### Table of Contents
1. [Introduction](#introduction)
2. [Design Tokens](#design-tokens)
3. [Color System](#color-system)
4. [Typography](#typography)
5. [Spacing](#spacing)
6. [Components](#components)
7. [Animations](#animations)
8. [Utilities](#utilities)
9. [Best Practices](#best-practices)
10. [Migration Guide](#migration-guide)

---

## Introduction

The Arcane Codex Design System is a comprehensive collection of design tokens, components, and utilities built specifically for the dark fantasy RPG game interface. It ensures visual consistency, improves development efficiency, and provides a scalable foundation for UI development.

### Core Files
- `arcane_codex_design_system.css` - Core design tokens and utilities
- `arcane_codex_components.css` - Reusable component patterns
- `arcane_codex_style_guide.html` - Visual style guide showcase

### Design Philosophy
- **Dark Fantasy Aesthetic**: Rich golds, deep browns, and mystical purples
- **Accessibility First**: WCAG AA compliant color contrasts
- **Performance Optimized**: GPU-accelerated animations, minimal repaints
- **Responsive by Default**: Mobile-first approach with fluid typography
- **Themeable**: CSS custom properties enable easy customization

---

## Design Tokens

Design tokens are the foundation of our design system. They ensure consistency and make global changes simple.

### Using Design Tokens
```css
/* Access tokens via CSS custom properties */
.my-element {
    color: var(--color-gold-400);
    padding: var(--space-lg);
    font-size: var(--font-size-body-md);
}
```

---

## Color System

### Primary Palette - Gold & Bronze
The primary color palette represents wealth, achievement, and divine power.

| Token | Hex Value | Usage |
|-------|-----------|--------|
| `--color-gold-100` | #FFF9E6 | Lightest gold, highlights |
| `--color-gold-200` | #FFECB3 | Light accents |
| `--color-gold-300` | #FFD700 | Bright gold, primary actions |
| `--color-gold-400` | #D4AF37 | Main gold, text and borders |
| `--color-gold-500` | #B8860B | Dark gold, hover states |
| `--color-gold-600` | #8B6914 | Darker gold, pressed states |
| `--color-gold-700` | #6B5010 | Deep gold, shadows |
| `--color-gold-800` | #4A380B | Very dark gold |
| `--color-gold-900` | #2A1F06 | Darkest gold |

### God-Specific Colors
Each deity has a unique color for divine powers and blessings.

| God | Token | Hex Value | Description |
|-----|-------|-----------|-------------|
| Solaris | `--color-god-solaris` | #FFD700 | Sun God - Radiant Gold |
| Lunara | `--color-god-lunara` | #C0C0E6 | Moon Goddess - Silver Blue |
| Tempest | `--color-god-tempest` | #4169E1 | Storm God - Electric Blue |
| Verdant | `--color-god-verdant` | #228B22 | Nature Goddess - Forest Green |
| Pyronis | `--color-god-pyronis` | #DC143C | Fire God - Crimson |
| Glacius | `--color-god-glacius` | #00CED1 | Ice God - Cyan |
| Umbral | `--color-god-umbral` | #4B0082 | Shadow God - Indigo |

### Rarity Tiers
Items and abilities use rarity colors to indicate their power level.

| Rarity | Token | Hex Value | Glow Effect |
|--------|-------|-----------|-------------|
| Common | `--color-rarity-common` | #B0B0B0 | No glow |
| Uncommon | `--color-rarity-uncommon` | #4CAF50 | Subtle glow |
| Rare | `--color-rarity-rare` | #2196F3 | Pulsing glow |
| Epic | `--color-rarity-epic` | #9C27B0 | Strong pulse |
| Legendary | `--color-rarity-legendary` | #FF6F00 | Intense glow |
| Mythic | `--color-rarity-mythic` | #E91E63 | Radiant glow |
| Divine | `--color-rarity-divine` | #FFD700 | Divine radiance |

### Status Colors
Semantic colors for different UI states.

```css
/* Success States */
--color-success: #4CAF50;
--color-success-light: #81C784;
--color-success-dark: #2E7D32;

/* Warning States */
--color-warning: #FFA726;
--color-warning-light: #FFB74D;
--color-warning-dark: #F57C00;

/* Error States */
--color-error: #EF5350;
--color-error-light: #EF9A9A;
--color-error-dark: #C62828;

/* Info States */
--color-info: #42A5F5;
--color-info-light: #90CAF9;
--color-info-dark: #1976D2;
```

### Usage Examples
```html
<!-- Rarity-based item card -->
<div class="card card-item rarity-legendary">
    <div class="card-header">Excalibur</div>
    <div class="card-body">Legendary sword of kings</div>
</div>

<!-- God-specific blessing -->
<div class="blessing" style="border-color: var(--color-god-solaris);">
    <span class="text-glow-gold">Blessing of Solaris</span>
</div>
```

---

## Typography

### Font Families
```css
--font-family-display: 'Cinzel', serif;  /* Headings, titles */
--font-family-body: 'Yrsa', serif;       /* Body text */
--font-family-mono: 'Courier New', monospace; /* Code, stats */
```

### Font Scale
| Class | Size | Usage |
|-------|------|--------|
| `.text-display-lg` | 48px | Main titles |
| `.text-display-md` | 36px | Section headers |
| `.text-display-sm` | 28px | Subsection headers |
| `.text-heading-lg` | 24px | Card titles |
| `.text-heading-md` | 20px | Panel headers |
| `.text-heading-sm` | 18px | Small headers |
| `.text-body-xl` | 20px | Large body text |
| `.text-body-lg` | 18px | Emphasized text |
| `.text-body-md` | 16px | Standard text |
| `.text-body-sm` | 14px | Secondary text |
| `.text-caption` | 12px | Captions, labels |
| `.text-tiny` | 10px | Badges, tooltips |

### Typography Effects
```html
<!-- Gradient text -->
<h1 class="text-display-lg text-gradient-gold">The Arcane Codex</h1>

<!-- Glowing text -->
<span class="text-glow-gold">Divine Power</span>

<!-- Text with shadow -->
<p class="text-body-lg text-shadow-lg">Ancient knowledge awaits...</p>
```

---

## Spacing

### Spacing Scale
Our spacing system uses a consistent scale for predictable layouts.

| Token | Value | Usage |
|-------|-------|--------|
| `--space-2xs` | 2px | Minimal spacing |
| `--space-xs` | 4px | Tight spacing |
| `--space-sm` | 8px | Small gaps |
| `--space-md` | 12px | Standard spacing |
| `--space-lg` | 16px | Comfortable spacing |
| `--space-xl` | 24px | Large spacing |
| `--space-2xl` | 32px | Extra large |
| `--space-3xl` | 48px | Huge spacing |
| `--space-4xl` | 64px | Massive spacing |
| `--space-5xl` | 96px | Maximum spacing |

### Usage Classes
```html
<!-- Padding -->
<div class="p-lg">Large padding</div>
<div class="p-xl">Extra large padding</div>

<!-- Margin -->
<div class="m-md">Medium margin</div>
<div class="m-2xl">Double XL margin</div>

<!-- Gap (for flex/grid) -->
<div class="flex gap-lg">
    <div>Item 1</div>
    <div>Item 2</div>
</div>
```

---

## Components

### Buttons

#### Basic Usage
```html
<!-- Primary button -->
<button class="btn btn-primary">
    Cast Spell
</button>

<!-- Secondary button -->
<button class="btn btn-secondary">
    View Details
</button>

<!-- Danger button -->
<button class="btn btn-danger">
    Delete Character
</button>

<!-- Ghost button -->
<button class="btn btn-ghost">
    Cancel
</button>
```

#### Button Sizes
```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-xl">Extra Large</button>
```

#### Button States
```html
<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>

<!-- Loading -->
<button class="btn btn-primary btn-loading">Loading...</button>
```

### Cards

```html
<!-- Basic card -->
<div class="card">
    <div class="card-header">Quest Details</div>
    <div class="card-body">
        <p>Defeat the dragon terrorizing the village.</p>
    </div>
    <div class="card-footer">
        <button class="btn btn-primary btn-sm">Accept Quest</button>
    </div>
</div>

<!-- Item card with rarity -->
<div class="card card-item rarity-epic">
    <div class="card-header">Mystic Staff</div>
    <div class="card-body">
        <p class="text-body-sm">+50 Magic Power</p>
        <p class="text-caption text-mystic">Epic Quality</p>
    </div>
</div>
```

### Progress Bars

```html
<!-- Health bar -->
<div class="progress-bar progress-health">
    <div class="progress-fill" style="width: 75%"></div>
    <div class="progress-text">75/100 HP</div>
</div>

<!-- Mana bar -->
<div class="progress-bar progress-mana">
    <div class="progress-fill" style="width: 60%"></div>
    <div class="progress-text">60/100 MP</div>
</div>

<!-- Experience bar -->
<div class="progress-bar progress-exp">
    <div class="progress-fill" style="width: 40%"></div>
    <div class="progress-text">400/1000 XP</div>
</div>
```

### Tooltips

```html
<!-- Basic tooltip -->
<div class="tooltip-trigger">
    <button class="btn btn-ghost">?</button>
    <div class="tooltip-content">
        This is helpful information
    </div>
</div>

<!-- Directional tooltips -->
<div class="tooltip-trigger tooltip-bottom">
    <span>Hover me</span>
    <div class="tooltip-content">Bottom tooltip</div>
</div>

<div class="tooltip-trigger tooltip-left">
    <span>Hover me</span>
    <div class="tooltip-content">Left tooltip</div>
</div>
```

### Forms

```html
<!-- Text input -->
<div class="form-group">
    <label class="form-label">Character Name</label>
    <input type="text" class="form-input" placeholder="Enter name...">
</div>

<!-- Select dropdown -->
<div class="form-group">
    <label class="form-label">Class</label>
    <select class="form-input form-select">
        <option>Warrior</option>
        <option>Mage</option>
        <option>Rogue</option>
    </select>
</div>

<!-- Checkbox -->
<label class="flex items-center gap-sm">
    <input type="checkbox" class="form-checkbox">
    <span>Enable notifications</span>
</label>

<!-- Radio buttons -->
<label class="flex items-center gap-sm">
    <input type="radio" name="difficulty" class="form-radio">
    <span>Easy</span>
</label>

<!-- Slider -->
<div class="form-group">
    <label class="form-label">Volume</label>
    <input type="range" class="form-slider" min="0" max="100" value="50">
</div>
```

### Modals/Overlays

```html
<!-- Modal structure -->
<div class="modal-overlay" id="quest-modal">
    <div class="modal-content">
        <div class="modal-header">
            <span>New Quest Available</span>
            <button class="modal-close">×</button>
        </div>
        <div class="modal-body">
            <h3 class="text-heading-md">The Lost Artifact</h3>
            <p>An ancient artifact has been stolen...</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost">Decline</button>
            <button class="btn btn-primary">Accept</button>
        </div>
    </div>
</div>

<!-- Activate modal with JavaScript -->
<script>
function showModal(id) {
    document.getElementById(id).classList.add('active');
}

function hideModal(id) {
    document.getElementById(id).classList.remove('active');
}
</script>
```

### Tabs

```html
<div class="tabs">
    <button class="tab-item active">Stats</button>
    <button class="tab-item">Skills</button>
    <button class="tab-item">Equipment</button>
</div>
<div class="tab-content">
    <!-- Tab content here -->
</div>
```

### Badges

```html
<!-- Level badge -->
<span class="badge badge-level">15</span>

<!-- Status badges -->
<span class="badge badge-success">Active</span>
<span class="badge badge-warning">Pending</span>
<span class="badge badge-error">Failed</span>
<span class="badge badge-info">New</span>
```

### Loading States

```html
<!-- Spinner -->
<div class="spinner"></div>
<div class="spinner spinner-lg"></div>
<div class="spinner spinner-sm"></div>

<!-- Skeleton screens -->
<div class="skeleton skeleton-title"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-text"></div>
<div class="skeleton skeleton-avatar"></div>
<div class="skeleton skeleton-card"></div>
```

### Notifications

```html
<div class="notification notification-success show">
    <div class="notification-title">Quest Complete!</div>
    <div class="notification-message">You earned 500 XP</div>
</div>

<div class="notification notification-error show">
    <div class="notification-title">Battle Lost</div>
    <div class="notification-message">Try again with better equipment</div>
</div>
```

---

## Animations

### Entrance Animations
```html
<!-- Fade animations -->
<div class="animate-fadeIn">Fades in</div>
<div class="animate-fadeInUp">Fades in from below</div>
<div class="animate-fadeInDown">Fades in from above</div>

<!-- Slide animations -->
<div class="animate-slideInLeft">Slides from left</div>
<div class="animate-slideInRight">Slides from right</div>

<!-- Scale animations -->
<div class="animate-scaleIn">Scales in</div>
<div class="animate-rotateIn">Rotates in</div>
```

### Exit Animations
```html
<div class="animate-fadeOut">Fades out</div>
<div class="animate-fadeOutUp">Fades out upward</div>
<div class="animate-fadeOutDown">Fades out downward</div>
<div class="animate-scaleOut">Scales out</div>
```

### Celebration Animations
```html
<!-- Victory animation -->
<div class="animate-victory">Pulsing victory glow</div>

<!-- Level up effect -->
<div class="animate-levelUp">Level up celebration</div>

<!-- Quest completion -->
<div class="animate-questComplete">Quest complete bounce</div>

<!-- Shimmer effect -->
<div class="animate-shimmer">Shimmering highlight</div>

<!-- Floating glow -->
<div class="animate-float">Floating with glow</div>
```

### Continuous Animations
```html
<div class="animate-spin">Spinning</div>
<div class="animate-bounce">Bouncing</div>
<div class="animate-skeleton">Skeleton loading</div>
```

### Animation Timing
```css
/* Available durations */
--duration-instant: 50ms;
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--duration-slower: 750ms;
--duration-slowest: 1000ms;

/* Available easing functions */
--ease-linear: linear;
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
--ease-smooth: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

---

## Utilities

### Layout Utilities
```html
<!-- Flexbox -->
<div class="flex flex-col gap-lg">
    <div>Item 1</div>
    <div>Item 2</div>
</div>

<div class="flex items-center justify-between">
    <span>Left</span>
    <span>Right</span>
</div>

<!-- Grid -->
<div class="grid grid-3 gap-md">
    <div>Col 1</div>
    <div>Col 2</div>
    <div>Col 3</div>
</div>
```

### Visual Effects
```html
<!-- Shadows -->
<div class="shadow-sm">Small shadow</div>
<div class="shadow-md">Medium shadow</div>
<div class="shadow-lg">Large shadow</div>
<div class="shadow-xl">Extra large shadow</div>

<!-- Glows -->
<div class="glow-gold">Gold glow</div>
<div class="glow-purple">Purple glow</div>
<div class="glow-success">Success glow</div>
<div class="glow-error">Error glow</div>

<!-- Borders -->
<div class="border-gold">Gold border</div>
<div class="border-silver">Silver border</div>
<div class="border-bronze">Bronze border</div>

<!-- Border radius -->
<div class="rounded-sm">Small radius</div>
<div class="rounded-md">Medium radius</div>
<div class="rounded-lg">Large radius</div>
<div class="rounded-full">Full circle</div>
```

### Responsive Utilities
```html
<!-- Hide/show based on screen size -->
<div class="hide-mobile">Hidden on mobile</div>
<div class="show-mobile">Only on mobile</div>
<div class="hide-tablet">Hidden on tablet</div>
<div class="show-tablet">Only on tablet</div>
<div class="hide-desktop">Hidden on desktop</div>
<div class="show-desktop">Only on desktop</div>

<!-- Fluid typography -->
<h1 class="text-fluid-lg">Responsive heading</h1>
<p class="text-fluid-md">Responsive paragraph</p>
```

### Accessibility
```html
<!-- Screen reader only -->
<span class="sr-only">This text is only for screen readers</span>

<!-- Focus ring -->
<button class="btn btn-primary focus-ring">
    Accessible button with focus ring
</button>
```

---

## Best Practices

### 1. Use Design Tokens
Always use design tokens instead of hard-coded values:
```css
/* Good */
.my-element {
    color: var(--color-gold-400);
    padding: var(--space-lg);
}

/* Bad */
.my-element {
    color: #D4AF37;
    padding: 16px;
}
```

### 2. Compose with Utility Classes
Build complex layouts by composing utility classes:
```html
<!-- Good: Composable and clear -->
<div class="flex items-center gap-lg p-xl rounded-lg shadow-md">
    <!-- Content -->
</div>

<!-- Avoid: Creating one-off classes -->
<div class="my-custom-container">
    <!-- Content -->
</div>
```

### 3. Semantic Component Usage
Use the appropriate component for the context:
```html
<!-- Good: Semantic -->
<button class="btn btn-danger">Delete</button>
<div class="notification notification-success">Success!</div>

<!-- Bad: Non-semantic -->
<div class="red-button">Delete</div>
<div class="green-box">Success!</div>
```

### 4. Progressive Enhancement
Start with base functionality, then add enhancements:
```html
<!-- Base: Works without JavaScript -->
<div class="card">
    <div class="card-body">Content</div>
</div>

<!-- Enhanced: Add interactions -->
<div class="card animate-fadeIn" onclick="handleClick()">
    <div class="card-body">Interactive content</div>
</div>
```

### 5. Accessibility First
Always ensure your UI is accessible:
```html
<!-- Include ARIA labels -->
<button class="btn btn-primary" aria-label="Accept quest">
    <span aria-hidden="true">✓</span>
    Accept
</button>

<!-- Provide alternatives for visual content -->
<div class="rarity-legendary" role="status">
    <span class="sr-only">Legendary item</span>
    <!-- Visual representation -->
</div>
```

### 6. Performance Considerations
- Use GPU-accelerated properties for animations (transform, opacity)
- Minimize repaints and reflows
- Lazy load non-critical CSS
- Use CSS containment for complex components

### 7. Mobile-First Design
Design for mobile first, then enhance for larger screens:
```css
/* Mobile first */
.element {
    font-size: var(--font-size-body-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
    .element {
        font-size: var(--font-size-body-md);
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .element {
        font-size: var(--font-size-body-lg);
    }
}
```

---

## Migration Guide

### Migrating from Inline Styles

#### Before (Old Code)
```html
<div style="background: #D4AF37; padding: 15px; border-radius: 8px;">
    <h2 style="font-size: 24px; color: #2A1810;">Title</h2>
    <p style="color: #8B7355;">Content</p>
</div>
```

#### After (Design System)
```html
<div class="card">
    <div class="card-header">Title</div>
    <div class="card-body">
        <p>Content</p>
    </div>
</div>
```

### Migrating Custom Components

#### Before (Custom CSS)
```css
.my-custom-button {
    padding: 10px 20px;
    background: linear-gradient(#FFD700, #D4AF37);
    border: 2px solid #B8860B;
    border-radius: 5px;
    font-weight: bold;
    text-transform: uppercase;
}
```

#### After (Design System)
```html
<!-- Simply use the button component -->
<button class="btn btn-primary">Click Me</button>
```

### Migrating Color Values

#### Step 1: Identify all color values
Search for hex codes, rgb values, and color names in your CSS.

#### Step 2: Map to design tokens
```css
/* Old */
color: #D4AF37;
background: #0A0908;
border-color: #8B7355;

/* New */
color: var(--color-gold-400);
background: var(--color-dark-500);
border-color: var(--color-gold-600);
```

#### Step 3: Update HTML classes
```html
<!-- Old -->
<span style="color: #FFD700;">Golden Text</span>

<!-- New -->
<span class="text-gold">Golden Text</span>
```

### Migrating Animations

#### Before (Custom Animations)
```css
@keyframes customFade {
    from { opacity: 0; }
    to { opacity: 1; }
}

.my-element {
    animation: customFade 0.3s ease-out;
}
```

#### After (Design System)
```html
<div class="animate-fadeIn">
    Content with fade animation
</div>
```

### Integration Checklist

1. **Include Design System Files**
```html
<link rel="stylesheet" href="arcane_codex_design_system.css">
<link rel="stylesheet" href="arcane_codex_components.css">
```

2. **Update HTML Structure**
- Replace custom classes with utility classes
- Use semantic component classes
- Add appropriate ARIA attributes

3. **Remove Redundant CSS**
- Delete custom styles that duplicate design system features
- Remove inline styles
- Consolidate similar patterns

4. **Test Responsiveness**
- Verify mobile layouts
- Check tablet breakpoints
- Ensure desktop optimization

5. **Validate Accessibility**
- Test keyboard navigation
- Verify screen reader compatibility
- Check color contrast ratios

6. **Performance Audit**
- Measure page load times
- Check animation performance
- Optimize asset loading

### Common Migration Patterns

#### Pattern 1: Custom Cards to Design System Cards
```html
<!-- Old -->
<div class="custom-card-wrapper">
    <div class="custom-card-title">Quest</div>
    <div class="custom-card-content">Description</div>
</div>

<!-- New -->
<div class="card card-quest">
    <div class="card-header">Quest</div>
    <div class="card-body">Description</div>
</div>
```

#### Pattern 2: Custom Modals to Design System Modals
```html
<!-- Old -->
<div class="my-modal" style="display: none;">
    <div class="my-modal-bg"></div>
    <div class="my-modal-box">
        <!-- Content -->
    </div>
</div>

<!-- New -->
<div class="modal-overlay" id="my-modal">
    <div class="modal-content">
        <div class="modal-header">Title</div>
        <div class="modal-body">Content</div>
        <div class="modal-footer">Actions</div>
    </div>
</div>
```

#### Pattern 3: Custom Progress Bars
```html
<!-- Old -->
<div class="hp-bar-container">
    <div class="hp-bar-fill" style="width: 75%"></div>
    <span class="hp-text">75/100</span>
</div>

<!-- New -->
<div class="progress-bar progress-health">
    <div class="progress-fill" style="width: 75%"></div>
    <div class="progress-text">75/100 HP</div>
</div>
```

### Troubleshooting Common Issues

#### Issue: Styles Not Applying
- Ensure CSS files are loaded in correct order
- Check for specificity conflicts
- Verify class names are spelled correctly

#### Issue: Animations Not Working
- Check if user has reduced motion preference
- Verify animation class is applied correctly
- Ensure element is visible when animation starts

#### Issue: Colors Look Different
- Confirm you're using the correct token
- Check for opacity or filter effects
- Verify parent element backgrounds

#### Issue: Layout Breaking on Mobile
- Use responsive utility classes
- Test with actual devices, not just browser resize
- Check for fixed widths that should be flexible

---

## Support and Resources

### File Paths
- Main Design System: `C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_design_system.css`
- Component Library: `C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_components.css`
- Style Guide: `C:/Users/ilmiv/ProjectArgent/complete_game/static/arcane_codex_style_guide.html`
- Documentation: `C:/Users/ilmiv/ProjectArgent/complete_game/static/DESIGN_SYSTEM_DOCUMENTATION.md`

### Version History
- **v1.0.0** - Initial release with complete design system

### Contributing
When adding new components or utilities:
1. Follow existing naming conventions
2. Document all new features
3. Ensure accessibility compliance
4. Test across all supported browsers
5. Update the style guide with examples

---

*The Arcane Codex Design System - Crafting legendary interfaces for epic adventures*