# The Arcane Codex Design System

## Overview

A comprehensive, AAA-quality design system for The Arcane Codex dark fantasy RPG. This modular CSS architecture provides consistent styling, enhanced performance, and immersive visual effects.

## Quick Start

```html
<!-- Include in your HTML head -->
<link rel="stylesheet" href="/static/css/design-system.css">
```

## File Structure

```
design-system/
├── 00-tokens.css         # Core design tokens (colors, spacing, typography)
├── 01-reset.css          # Modern CSS reset with accessibility
├── 02-utilities.css      # Single-purpose utility classes
├── 03-animations.css     # Animation library
├── 04-components.css     # Reusable UI components
├── 05-layouts.css        # Layout patterns
├── 06-themes.css         # Theme variations
├── 07-improvements.css   # Enhanced game-specific components
├── AUDIT_REPORT.md       # Comprehensive system audit
├── MIGRATION_GUIDE.md    # Step-by-step migration instructions
└── README.md            # This file
```

## Key Features

### 🎨 Design Tokens
- **5 Color Palettes**: Arcane, Divine, Mystic, Shadow, Blood/Void/Corruption (enhanced)
- **Fluid Typography**: Responsive font sizing with clamp()
- **Consistent Spacing**: 24-step spacing scale
- **Performance Budgets**: Animation timing constraints

### 🚀 Animations
- **60+ Keyframes**: Combat, magic, celebration, loading states
- **GPU Optimization**: Hardware-accelerated transforms
- **Reduced Motion**: Accessibility-compliant alternatives

### 🧩 Components
- **15+ Base Components**: Buttons, cards, modals, forms, toasts
- **Game-Specific**: Health bars, mana bars, character portraits, ability icons
- **State Variations**: Loading, hover, active, disabled states

### 📐 Layouts
- **Responsive Grid**: Mobile-first with 6 breakpoints
- **Game Layouts**: Combat, inventory, character creation
- **Flexible Containers**: Fluid and fixed width options

### 🎭 Themes
- **8 Built-in Themes**: Divine, Whisper, Shadow, Boss Battle, Seasonal
- **Dynamic Theming**: State-based theme switching
- **Accessibility**: High contrast and colorblind modes

## Usage Examples

### Basic Button
```html
<button class="btn btn-primary">
  Start Adventure
</button>
```

### Health Bar
```html
<div class="health-bar">
  <div class="health-bar-fill" style="width: 85%"></div>
  <span class="bar-text">85/100</span>
</div>
```

### Scenario Card
```html
<div class="card scenario-card">
  <h2 class="scenario-card-title">The Whispering Woods</h2>
  <p class="scenario-card-description">
    Ancient magic stirs in the forgotten forest...
  </p>
</div>
```

### Animation Usage
```html
<!-- Apply animation classes -->
<div class="animate-fadeInUp">
  Content fades in from below
</div>

<!-- Celebration effect -->
<div class="animate-confetti">
  Victory achieved!
</div>
```

### Theme Application
```html
<!-- Apply theme to container -->
<body data-theme="whisper-realm">
  <!-- All children inherit theme -->
</body>
```

## Performance Guidelines

### Critical CSS
```html
<style>
  /* Inline critical styles for fast first paint */
  :root { --color-background: #0A0908; }
  body { background: var(--color-background); }
</style>
```

### Lazy Loading
```html
<link rel="preload" href="/static/css/design-system.css" as="style"
      onload="this.onload=null;this.rel='stylesheet'">
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 10+)

## Migration from Inline Styles

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions on migrating from inline styles to the design system.

## Audit Results

See [AUDIT_REPORT.md](./AUDIT_REPORT.md) for a comprehensive analysis of the design system with recommendations.

## Development

### Adding New Components

1. Create component in `04-components.css`
2. Follow BEM naming convention
3. Include all state variations
4. Document usage

### Creating New Animations

1. Define keyframes in `03-animations.css`
2. Create utility classes
3. Optimize for 60fps
4. Test reduced motion

### Adding Themes

1. Define color overrides in `06-themes.css`
2. Create `[data-theme="name"]` selector
3. Include transition effects
4. Test accessibility

## Best Practices

1. **Use Design Tokens**: Always reference CSS variables
2. **Mobile First**: Start with mobile styles, enhance for desktop
3. **Semantic Classes**: Use meaningful class names
4. **Performance**: Minimize repaints/reflows
5. **Accessibility**: Test with screen readers
6. **Documentation**: Comment complex patterns

## Resources

- [Design Tokens Reference](./00-tokens.css)
- [Component Gallery](../design-system-showcase.html)
- [Animation Playground](./03-animations.css)
- [Theme Switcher Demo](./06-themes.css)

## Version History

- **v1.0.0** (Nov 2024): Initial release
- **v1.1.0** (Nov 2024): Added improvements module with enhanced game components

## License

© 2024 The Arcane Codex. All rights reserved.

---

*For questions or support, contact: design-system@arcane-codex.com*