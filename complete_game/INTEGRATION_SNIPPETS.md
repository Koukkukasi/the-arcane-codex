# The Arcane Codex - Quick Integration Snippets

Copy and paste these code snippets to quickly integrate visual assets into your game.

---

## 1. Add to HTML `<head>` Section

```html
<!-- The Arcane Codex Stylesheets -->
<link rel="stylesheet" href="static/css/game.css">
<link rel="stylesheet" href="static/css/arcane_effects.css">
```

---

## 2. Add Background Layer (Place right after `<body>` tag)

```html
<!-- Mystical Background Layer -->
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
```

---

## 3. Alternative: SVG Background Image

If you prefer a static background instead of CSS animations:

```html
<style>
  body {
    background-image: url('static/images/mystical_background.svg');
    background-size: cover;
    background-position: center;
    background-attachment: fixed;
  }
</style>
```

---

## 4. Divine Logo / Main Symbol

```html
<div class="game-header">
  <div class="divine-symbol">
    <img src="static/images/arcane_codex_logo.svg" alt="The Arcane Codex">
  </div>

  <div class="game-title">
    <h1 class="title-main text-shimmer">THE ARCANE CODEX</h1>
    <p class="title-sub">Where Gods Judge and Mortals Tremble</p>
  </div>
</div>
```

---

## 5. God Selection Grid

```html
<div class="features-grid">
  <!-- Valdris - Order/Law -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_valdris.svg" alt="Valdris" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>VALDRIS</h3>
    <p>God of Order and Law. Balanced justice and divine decree.</p>
  </div>

  <!-- Kaitha - Chaos/Freedom -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_kaitha.svg" alt="Kaitha" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>KAITHA</h3>
    <p>Goddess of Chaos and Freedom. Wild flame of rebellion.</p>
  </div>

  <!-- Morvane - Death/Survival -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_morvane.svg" alt="Morvane" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>MORVANE</h3>
    <p>God of Death and Survival. The inevitable transformation.</p>
  </div>

  <!-- Sylara - Nature/Healing -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_sylara.svg" alt="Sylara" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>SYLARA</h3>
    <p>Goddess of Nature and Healing. Life's sacred vitality.</p>
  </div>

  <!-- Korvan - War/Honor -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_korvan.svg" alt="Korvan" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>KORVAN</h3>
    <p>God of War and Honor. Valor in battle and glory.</p>
  </div>

  <!-- Athena - Wisdom/Knowledge -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_athena.svg" alt="Athena" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>ATHENA</h3>
    <p>Goddess of Wisdom and Knowledge. All-seeing foresight.</p>
  </div>

  <!-- Mercus - Commerce/Wealth -->
  <div class="feature-card codex-reveal ethereal-glow">
    <div class="feature-icon">
      <img src="static/images/god_mercus.svg" alt="Mercus" class="god-icon" style="width: 64px; height: 64px;">
    </div>
    <h3>MERCUS</h3>
    <p>God of Commerce and Wealth. Prosperity through trade.</p>
  </div>
</div>
```

---

## 6. Section Dividers

```html
<!-- Mystical divider between sections -->
<div class="arcane-divider"></div>

<!-- OR use image directly -->
<div style="text-align: center; margin: 2rem 0;">
  <img src="static/images/divider_line.svg" alt="" style="width: 100%; max-width: 400px; opacity: 0.8;">
</div>
```

---

## 7. Loading Screen

```html
<div class="loading-overlay" aria-hidden="false">
  <div class="arcane-loader"></div>
  <p style="margin-top: 1.5rem; color: #9ca3af; font-style: italic;">
    Consulting the ancient texts...
  </p>
</div>
```

---

## 8. JavaScript Particle System (Add before `</body>`)

```html
<!-- Arcane Particle System -->
<script src="static/js/arcane_particles.js"></script>

<!-- Optional: Custom initialization -->
<script>
  // Customize particle settings (optional - auto-initializes with defaults)
  document.addEventListener('DOMContentLoaded', () => {
    const particles = new ArcaneParticleSystem();
    particles.init({
      floatingParticles: 25,  // Increase for more particles
      floatingRunes: 6,       // Increase for more runes
      interactive: true       // Click/touch creates dust bursts
    });
  });
</script>
```

---

## 9. Button with Effects

```html
<button class="btn btn-primary btn-large ethereal-glow">
  <span class="btn-icon">⚡</span>
  Enter the Codex
</button>
```

---

## 10. Card with Reveal Animation

```html
<div class="feature-card codex-reveal ethereal-glow">
  <div class="feature-icon">
    <img src="static/images/rune_symbol_1.svg" alt="" style="width: 48px;">
  </div>
  <h3>Your Title</h3>
  <p>Your description text here.</p>
</div>
```

---

## 11. Shimmer Text Effect

```html
<h1 class="text-shimmer">Golden Shimmering Title</h1>
```

---

## 12. Footer with Divine Theme

```html
<div class="game-footer">
  <div class="arcane-divider"></div>
  <p style="font-size: 1.125rem; color: #d4af37; margin-bottom: 0.5rem;">
    May the Gods grant you wisdom in judgment
  </p>
  <p class="footer-info">
    The Arcane Codex - A Dark Fantasy RPG Experience
  </p>
</div>
```

---

## 13. Complete Landing Page Template

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
  <!-- Background Layer -->
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
      <!-- Header with Divine Symbol -->
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

      <!-- Game Features -->
      <div class="features-grid">
        <div class="feature-card codex-reveal">
          <div class="feature-icon">📖</div>
          <h3>Divine Narrative</h3>
          <p>Unfold epic stories guided by the gods themselves.</p>
        </div>

        <div class="feature-card codex-reveal">
          <div class="feature-icon">⚔️</div>
          <h3>Moral Choices</h3>
          <p>Every decision shapes your fate and divine favor.</p>
        </div>

        <div class="feature-card codex-reveal">
          <div class="feature-icon">👥</div>
          <h3>Multiplayer</h3>
          <p>Unite with allies or face betrayal in judgement.</p>
        </div>

        <div class="feature-card codex-reveal">
          <div class="feature-icon">✨</div>
          <h3>Dark Fantasy</h3>
          <p>Immerse yourself in a world of mystery and magic.</p>
        </div>
      </div>

      <!-- Divider -->
      <div class="arcane-divider"></div>

      <!-- Call to Action -->
      <div class="game-actions" style="text-align: center;">
        <button class="btn btn-primary btn-large ethereal-glow">
          Enter the Codex
        </button>
      </div>

      <!-- Footer -->
      <div class="game-footer">
        <p>May the Gods grant you wisdom in judgment</p>
        <p class="footer-info">The Arcane Codex - 2025</p>
      </div>
    </div>
  </div>

  <!-- Particle System -->
  <script src="static/js/arcane_particles.js"></script>
</body>
</html>
```

---

## 14. Flask/Jinja2 Template Integration

If using Flask templates:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{% block title %}The Arcane Codex{% endblock %}</title>

  <!-- Static assets with url_for -->
  <link rel="stylesheet" href="{{ url_for('static', filename='css/game.css') }}">
  <link rel="stylesheet" href="{{ url_for('static', filename='css/arcane_effects.css') }}">
</head>
<body>
  <!-- Background -->
  <div class="arcane-background">
    <div class="mystical-orb orb-purple"></div>
    <div class="mystical-orb orb-gold"></div>
  </div>

  <!-- Corners -->
  <div class="arcane-corner corner-top-left">
    <img src="{{ url_for('static', filename='images/corner_flourish.svg') }}" alt="">
  </div>
  <!-- ... other corners ... -->

  <!-- Content Block -->
  {% block content %}
  {% endblock %}

  <!-- Particle System -->
  <script src="{{ url_for('static', filename='js/arcane_particles.js') }}"></script>
</body>
</html>
```

---

## 15. Custom Colors (Override Defaults)

Add this to your page's `<style>` or CSS file:

```css
:root {
  /* Override default colors */
  --color-primary: #7c3aed;        /* Different purple */
  --color-accent: #fbbf24;         /* Different gold */

  /* Or add new themed colors */
  --god-valdris: #d4af37;
  --god-kaitha: #ff6b35;
  --god-morvane: #4b5563;
  --god-sylara: #10b981;
  --god-korvan: #ef4444;
  --god-athena: #3b82f6;
  --god-mercus: #f59e0b;
}
```

---

## 16. Disable Animations for Performance

If you need better performance on slower devices:

```html
<style>
  /* Disable all animations */
  * {
    animation: none !important;
    transition: none !important;
  }

  /* Keep only essential effects */
  .btn:hover {
    transform: translateY(-2px);
  }
</style>
```

---

## 17. Mobile Optimizations

```html
<style>
  @media (max-width: 767px) {
    /* Hide corner decorations on mobile */
    .arcane-corner {
      display: none;
    }

    /* Reduce particle count */
    .particle:nth-child(n+6) {
      display: none;
    }

    /* Simplify divine symbol */
    .divine-symbol {
      width: 120px;
      height: 120px;
      animation: none; /* Stop rotation to save battery */
    }
  }
</style>
```

---

## Quick Copy-Paste Full Integration

For fastest setup, copy this complete template:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Arcane Codex</title>
  <link rel="stylesheet" href="static/css/game.css">
  <link rel="stylesheet" href="static/css/arcane_effects.css">
</head>
<body>
  <div class="arcane-background">
    <div class="mystical-orb orb-purple"></div>
    <div class="mystical-orb orb-gold"></div>
  </div>
  <div class="arcane-corner corner-top-left"><img src="static/images/corner_flourish.svg" alt=""></div>
  <div class="arcane-corner corner-top-right"><img src="static/images/corner_flourish.svg" alt=""></div>
  <div class="arcane-corner corner-bottom-left"><img src="static/images/corner_flourish.svg" alt=""></div>
  <div class="arcane-corner corner-bottom-right"><img src="static/images/corner_flourish.svg" alt=""></div>

  <div class="landing-page">
    <div class="container">
      <div class="game-header">
        <div class="divine-symbol">
          <img src="static/images/arcane_codex_logo.svg" alt="The Arcane Codex">
        </div>
        <div class="game-title">
          <h1 class="title-main text-shimmer">THE ARCANE CODEX</h1>
          <p class="title-sub">Where Gods Judge and Mortals Tremble</p>
        </div>
      </div>

      <!-- YOUR CONTENT HERE -->

      <div class="game-footer">
        <p>May the Gods grant you wisdom in judgment</p>
      </div>
    </div>
  </div>

  <script src="static/js/arcane_particles.js"></script>
</body>
</html>
```

---

**All snippets are production-ready. Just copy, paste, and customize!**
