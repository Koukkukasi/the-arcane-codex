# The Arcane Codex - SVG Graphics Integration Plan
## Phase G: Complete Visual Asset Integration Strategy

---

## Executive Summary

This document provides a comprehensive plan for integrating 14 custom SVG assets into The Arcane Codex, maximizing visual impact while maintaining performance and accessibility. The integration focuses on creating an immersive dark fantasy experience with divine iconography.

---

## Asset Inventory & Purpose

### 1. GOD ICONS (7 SVGs)
**Files:** `god_valdris.svg`, `god_kaitha.svg`, `god_morvane.svg`, `god_sylara.svg`, `god_korvan.svg`, `god_athena.svg`, `god_mercus.svg`

**Design Quality:** Each icon features:
- Gold gradient fills (#d4af37 to #aa8b2c)
- Built-in glow filters
- Unique symbolic representations
- 64x64 viewBox, perfectly scalable

**Primary Uses:**
1. Divine Council voting visualization (animated)
2. Character sheet divine favor display (static with hover effects)
3. Quest/scenario god influence indicators
4. Achievement/blessing notifications

### 2. BRANDING & LOGO
**File:** `arcane_codex_logo.svg`

**Design Quality:**
- Mystical book with Eye of Judgment centerpiece
- Purple and gold color scheme
- Runic decorations and particles
- 200x200 viewBox with intricate details

**Primary Uses:**
1. Landing page hero section
2. Loading screen centerpiece
3. Top-left navigation branding (scaled down)
4. About/credits section

### 3. DECORATIVE ELEMENTS (4 SVGs)
**Files:** `corner_flourish.svg`, `divider_line.svg`, `rune_symbol_1/2/3.svg`

**Primary Uses:**
- Corner flourish: Panel corners, modal decorations
- Divider line: Section separators in story text
- Rune symbols: Loading indicators, bullet points, achievement markers

### 4. BACKGROUND PATTERN
**File:** `mystical_background.svg`

**Primary Uses:**
- Tiled background for overlays
- Section backgrounds with low opacity
- Modal/dialog backdrops

---

## Integration Strategy by Location

### LOCATION 1: Landing Page / Title Screen
**Priority:** HIGH

#### Logo Placement
```html
<!-- Hero Section -->
<div class="landing-hero">
  <div class="logo-container animate-fadeIn">
    <img src="/static/images/arcane_codex_logo.svg"
         alt="The Arcane Codex"
         class="logo-main"
         width="200"
         height="200">
  </div>
  <h1 class="title-main">The Arcane Codex</h1>
  <p class="subtitle">Where Your Choices Shape Destiny</p>
</div>
```

#### CSS Styling
```css
.landing-hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 100%),
    url('/static/images/mystical_background.svg') repeat;
  background-size: auto, 300px;
}

.logo-container {
  position: relative;
  margin-bottom: var(--space-8);
  filter: drop-shadow(0 0 40px rgba(139, 31, 255, 0.6));
}

.logo-main {
  animation: logoFloat 4s ease-in-out infinite,
             logoGlow 2s ease-in-out infinite alternate;
}

@keyframes logoFloat {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes logoGlow {
  0% { filter: drop-shadow(0 0 20px rgba(139, 31, 255, 0.4)); }
  100% { filter: drop-shadow(0 0 40px rgba(139, 31, 255, 0.8)); }
}
```

#### Corner Flourishes
```html
<!-- Add to all four corners of landing page -->
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

```css
.corner-decoration {
  position: fixed;
  width: 80px;
  height: 80px;
  opacity: 0.6;
  pointer-events: none;
  z-index: var(--z-10);
  animation: cornerFadeIn 1s ease-out;
}

.corner-tl { top: 20px; left: 20px; }
.corner-tr { top: 20px; right: 20px; transform: scaleX(-1); }
.corner-bl { bottom: 20px; left: 20px; transform: scaleY(-1); }
.corner-br { bottom: 20px; right: 20px; transform: scale(-1); }

@keyframes cornerFadeIn {
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 0.6; transform: scale(1); }
}

@media (max-width: 768px) {
  .corner-decoration {
    width: 50px;
    height: 50px;
  }
}
```

---

### LOCATION 2: Top Navigation Bar
**Priority:** HIGH

#### Logo Integration (Compact Version)
```html
<div class="top-hud">
  <div class="nav-logo">
    <img src="/static/images/arcane_codex_logo.svg"
         alt="The Arcane Codex"
         width="40"
         height="40"
         class="logo-small">
    <span class="game-title-small">The Arcane Codex</span>
  </div>
  <!-- Rest of HUD content -->
</div>
```

```css
.nav-logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  transition: transform var(--duration-base) var(--ease-out);
}

.nav-logo:hover {
  transform: scale(1.05);
  cursor: pointer;
}

.logo-small {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));
  animation: subtleGlow 3s ease-in-out infinite;
}

@keyframes subtleGlow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4)); }
  50% { filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.6)); }
}

.game-title-small {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  color: var(--color-divine-300);
  letter-spacing: var(--letter-spacing-wide);
}
```

---

### LOCATION 3: Character Sheet - Divine Favor Section
**Priority:** CRITICAL

#### Enhanced Divine Favor Display
```html
<div class="divine-favor-section">
  <div class="divine-favor-header">
    <img src="/static/images/rune_symbol_1.svg" class="section-icon" alt="">
    Divine Favor
    <img src="/static/images/rune_symbol_1.svg" class="section-icon" alt="">
  </div>

  <!-- VALDRIS - Order/Law -->
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
      <div class="divine-fill valdris-bar" style="width: 60%;" data-value="60"></div>
      <div class="divine-value">+15</div>
    </div>
  </div>

  <!-- KAITHA - Chaos/Freedom -->
  <div class="divine-god" data-god="kaitha">
    <div class="god-icon-container">
      <img src="/static/images/god_kaitha.svg"
           alt="Kaitha"
           class="god-icon"
           width="32"
           height="32">
    </div>
    <div class="divine-info">
      <div class="divine-name kaitha-name">KAITHA</div>
      <div class="divine-title">Chaos & Freedom</div>
    </div>
    <div class="divine-bar">
      <div class="divine-fill kaitha-bar" style="width: 40%;"></div>
      <div class="divine-value negative">-10</div>
    </div>
  </div>

  <!-- MORVANE - Death/Survival -->
  <div class="divine-god" data-god="morvane">
    <div class="god-icon-container">
      <img src="/static/images/god_morvane.svg"
           alt="Morvane"
           class="god-icon"
           width="32"
           height="32">
    </div>
    <div class="divine-info">
      <div class="divine-name morvane-name">MORVANE</div>
      <div class="divine-title">Death & Survival</div>
    </div>
    <div class="divine-bar">
      <div class="divine-fill morvane-bar" style="width: 80%;"></div>
      <div class="divine-value">+20</div>
    </div>
  </div>

  <!-- SYLARA - Nature/Life -->
  <div class="divine-god" data-god="sylara">
    <div class="god-icon-container">
      <img src="/static/images/god_sylara.svg"
           alt="Sylara"
           class="god-icon"
           width="32"
           height="32">
    </div>
    <div class="divine-info">
      <div class="divine-name sylara-name">SYLARA</div>
      <div class="divine-title">Nature & Balance</div>
    </div>
    <div class="divine-bar">
      <div class="divine-fill sylara-bar" style="width: 50%;"></div>
      <div class="divine-value">+5</div>
    </div>
  </div>

  <!-- KORVAN - War/Courage -->
  <div class="divine-god" data-god="korvan">
    <div class="god-icon-container">
      <img src="/static/images/god_korvan.svg"
           alt="Korvan"
           class="god-icon"
           width="32"
           height="32">
    </div>
    <div class="divine-info">
      <div class="divine-name korvan-name">KORVAN</div>
      <div class="divine-title">War & Honor</div>
    </div>
    <div class="divine-bar">
      <div class="divine-fill korvan-bar" style="width: 100%;"></div>
      <div class="divine-value">+25</div>
    </div>
  </div>

  <!-- ATHENA - Wisdom/Knowledge -->
  <div class="divine-god" data-god="athena">
    <div class="god-icon-container">
      <img src="/static/images/god_athena.svg"
           alt="Athena"
           class="god-icon"
           width="32"
           height="32">
    </div>
    <div class="divine-info">
      <div class="divine-name athena-name">ATHENA</div>
      <div class="divine-title">Wisdom & Knowledge</div>
    </div>
    <div class="divine-bar">
      <div class="divine-fill athena-bar" style="width: 67%;"></div>
      <div class="divine-value">+10</div>
    </div>
  </div>

  <!-- MERCUS - Commerce/Value -->
  <div class="divine-god" data-god="mercus">
    <div class="god-icon-container">
      <img src="/static/images/god_mercus.svg"
           alt="Mercus"
           class="god-icon"
           width="32"
           height="32">
    </div>
    <div class="divine-info">
      <div class="divine-name mercus-name">MERCUS</div>
      <div class="divine-title">Commerce & Wealth</div>
    </div>
    <div class="divine-bar">
      <div class="divine-fill mercus-bar" style="width: 33%;"></div>
      <div class="divine-value negative">-5</div>
    </div>
  </div>
</div>
```

#### Character Sheet CSS Enhancements
```css
/* Divine Favor Section Header */
.divine-favor-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  color: var(--color-divine-300);
  margin-bottom: var(--space-6);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
}

.divine-favor-header .section-icon {
  width: 24px;
  height: 24px;
  opacity: 0.7;
  animation: runeRotate 8s linear infinite;
}

@keyframes runeRotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* God Entry Layout */
.divine-god {
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all var(--duration-base) var(--ease-out);
}

.divine-god:hover {
  background: rgba(0, 0, 0, 0.5);
  border-color: rgba(212, 175, 55, 0.3);
  transform: translateX(4px);
}

/* God Icon Styling */
.god-icon-container {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-full);
  background: radial-gradient(circle at center, rgba(212, 175, 55, 0.2), transparent);
  border: 2px solid rgba(212, 175, 55, 0.4);
  position: relative;
  transition: all var(--duration-base) var(--ease-out);
}

.divine-god:hover .god-icon-container {
  border-color: rgba(212, 175, 55, 0.8);
  box-shadow: 0 0 20px rgba(212, 175, 55, 0.4);
  transform: scale(1.1);
}

.god-icon {
  width: 32px;
  height: 32px;
  filter: drop-shadow(0 0 4px rgba(212, 175, 55, 0.3));
  transition: filter var(--duration-base) var(--ease-out);
}

.divine-god:hover .god-icon {
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.6));
}

/* God Info */
.divine-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.divine-name {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-wide);
}

.divine-title {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
}

/* God-specific colors (using CSS variables from tokens) */
.valdris-name { color: var(--god-valdris); }
.kaitha-name { color: var(--god-kaitha); }
.morvane-name { color: var(--god-morvane); }
.sylara-name { color: var(--god-sylara); }
.korvan-name { color: var(--god-korvan); }
.athena-name { color: var(--god-athena); }
.mercus-name { color: var(--god-mercus); }

/* Responsive Design */
@media (max-width: 768px) {
  .divine-god {
    grid-template-columns: 40px 1fr 80px;
    gap: var(--space-2);
  }

  .god-icon-container {
    width: 40px;
    height: 40px;
  }

  .god-icon {
    width: 28px;
    height: 28px;
  }
}
```

---

### LOCATION 4: Divine Council Voting Visualization
**Priority:** CRITICAL - This is the showcase feature!

#### Voting Modal Structure
```html
<!-- Divine Council Voting Modal -->
<div id="council-voting-modal" class="modal divine-council-modal">
  <div class="modal-backdrop mystical-backdrop"></div>
  <div class="modal-content council-content">

    <!-- Header -->
    <div class="council-header">
      <img src="/static/images/rune_symbol_2.svg" class="header-rune" alt="">
      <h2>The Divine Council Convenes</h2>
      <img src="/static/images/rune_symbol_2.svg" class="header-rune" alt="">
    </div>

    <!-- Divider -->
    <img src="/static/images/divider_line.svg" class="divider" alt="">

    <!-- Context -->
    <div class="council-context">
      <p>Your choice to <strong id="choice-text">spare the merchant</strong> has drawn the attention of the gods...</p>
    </div>

    <!-- God Voting Arena -->
    <div class="god-voting-arena">

      <!-- Approve Side (Left) -->
      <div class="vote-column approve-column">
        <div class="vote-label approve-label">Approve</div>
        <div class="god-votes-list" id="approve-gods">
          <!-- Gods who approve will appear here dynamically -->
        </div>
      </div>

      <!-- Center Divider -->
      <div class="vote-divider">
        <div class="divider-line"></div>
        <img src="/static/images/rune_symbol_3.svg" class="center-rune" alt="">
      </div>

      <!-- Condemn Side (Right) -->
      <div class="vote-column condemn-column">
        <div class="vote-label condemn-label">Condemn</div>
        <div class="god-votes-list" id="condemn-gods">
          <!-- Gods who condemn will appear here dynamically -->
        </div>
      </div>

    </div>

    <!-- Divider -->
    <img src="/static/images/divider_line.svg" class="divider" alt="">

    <!-- Judgment Result -->
    <div class="council-judgment">
      <div class="judgment-header">Divine Judgment</div>
      <div class="judgment-result" id="judgment-text">
        The Council is divided. Your fate remains uncertain...
      </div>
    </div>

    <!-- Continue Button -->
    <button class="btn-primary council-continue">Continue Your Journey</button>
  </div>
</div>
```

#### Voting Animation CSS
```css
/* Divine Council Modal */
.divine-council-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: var(--z-modal);
  animation: modalFadeIn 0.4s ease-out;
}

.divine-council-modal.active {
  display: flex;
  align-items: center;
  justify-content: center;
}

.mystical-backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  background:
    linear-gradient(180deg, rgba(139, 31, 255, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%),
    url('/static/images/mystical_background.svg') repeat;
  background-size: auto, 200px;
  backdrop-filter: blur(8px);
  animation: backdropPulse 4s ease-in-out infinite;
}

@keyframes backdropPulse {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.council-content {
  position: relative;
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow-y: auto;
  background: linear-gradient(180deg,
    rgba(26, 22, 18, 0.98) 0%,
    rgba(15, 10, 8, 0.98) 100%);
  border: 3px solid;
  border-image: linear-gradient(135deg,
    var(--color-divine-500),
    var(--color-arcane-500),
    var(--color-divine-500)) 1;
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow:
    0 0 60px rgba(139, 31, 255, 0.5),
    inset 0 0 40px rgba(0, 0, 0, 0.6);
}

/* Council Header */
.council-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.council-header h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-3xl);
  color: var(--color-divine-300);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}

.header-rune {
  width: 32px;
  height: 32px;
  animation: runeFloat 3s ease-in-out infinite;
}

@keyframes runeFloat {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-8px) rotate(180deg); }
}

/* Divider Line */
.divider {
  width: 100%;
  height: 8px;
  margin: var(--space-6) 0;
  opacity: 0.6;
}

/* Voting Arena Layout */
.god-voting-arena {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: var(--space-6);
  margin: var(--space-8) 0;
  min-height: 400px;
}

/* Vote Columns */
.vote-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.vote-label {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  text-shadow: 0 0 10px currentColor;
}

.approve-label {
  color: var(--color-success);
  background: rgba(20, 184, 166, 0.1);
  border: 2px solid rgba(20, 184, 166, 0.3);
}

.condemn-label {
  color: var(--color-danger);
  background: rgba(239, 68, 68, 0.1);
  border: 2px solid rgba(239, 68, 68, 0.3);
}

/* Center Divider */
.vote-divider {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.divider-line {
  width: 2px;
  height: 100%;
  background: linear-gradient(180deg,
    transparent,
    var(--color-divine-500),
    transparent);
  box-shadow: 0 0 10px var(--color-divine-500);
}

.center-rune {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 48px;
  height: 48px;
  padding: var(--space-2);
  background: var(--color-background);
  border-radius: var(--radius-full);
  border: 2px solid var(--color-divine-500);
  animation: runeRotate 8s linear infinite;
}

/* God Votes List */
.god-votes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Individual God Vote Card */
.god-vote-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  opacity: 0;
  transform: scale(0.8) translateY(-20px);
  animation: godVoteAppear 0.6s ease-out forwards;
}

/* Stagger animation delays */
.god-vote-card:nth-child(1) { animation-delay: 0.1s; }
.god-vote-card:nth-child(2) { animation-delay: 0.3s; }
.god-vote-card:nth-child(3) { animation-delay: 0.5s; }
.god-vote-card:nth-child(4) { animation-delay: 0.7s; }

@keyframes godVoteAppear {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(-20px);
  }
  60% {
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* Approve-specific styling */
.approve-column .god-vote-card {
  border-left: 4px solid var(--color-success);
  background: linear-gradient(90deg,
    rgba(20, 184, 166, 0.2),
    rgba(0, 0, 0, 0.4));
}

.approve-column .god-vote-card:hover {
  border-color: var(--color-success);
  box-shadow: 0 0 20px rgba(20, 184, 166, 0.3);
}

/* Condemn-specific styling */
.condemn-column .god-vote-card {
  border-right: 4px solid var(--color-danger);
  background: linear-gradient(270deg,
    rgba(239, 68, 68, 0.2),
    rgba(0, 0, 0, 0.4));
}

.condemn-column .god-vote-card:hover {
  border-color: var(--color-danger);
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.3);
}

/* God Icon in Vote Card */
.god-vote-card .god-icon-large {
  width: 56px;
  height: 56px;
  padding: var(--space-2);
  background: radial-gradient(circle at center,
    rgba(212, 175, 55, 0.3),
    transparent);
  border: 2px solid rgba(212, 175, 55, 0.5);
  border-radius: var(--radius-full);
  filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5));
  animation: iconPulse 2s ease-in-out infinite;
}

@keyframes iconPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.5));
  }
  50% {
    transform: scale(1.05);
    filter: drop-shadow(0 0 20px rgba(212, 175, 55, 0.7));
  }
}

.god-vote-info {
  flex: 1;
}

.god-vote-name {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  letter-spacing: var(--letter-spacing-wide);
  margin-bottom: var(--space-1);
}

.god-vote-reason {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  font-style: italic;
  line-height: var(--line-height-relaxed);
}

/* Council Judgment */
.council-judgment {
  background: linear-gradient(135deg,
    rgba(212, 175, 55, 0.15),
    rgba(139, 115, 85, 0.15));
  border: 2px solid var(--color-divine-500);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  text-align: center;
  margin: var(--space-6) 0;
  animation: judgmentReveal 0.8s ease-out 2s both;
}

@keyframes judgmentReveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.judgment-header {
  font-family: var(--font-display);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-divine-300);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  margin-bottom: var(--space-4);
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
}

.judgment-result {
  font-size: var(--font-size-lg);
  color: var(--color-divine-200);
  line-height: var(--line-height-relaxed);
}

/* Continue Button */
.council-continue {
  width: 100%;
  margin-top: var(--space-4);
  animation: buttonFadeIn 0.6s ease-out 2.5s both;
}

@keyframes buttonFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .god-voting-arena {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }

  .vote-divider {
    order: 2;
    flex-direction: row;
    width: 100%;
    height: auto;
    margin: var(--space-4) 0;
  }

  .divider-line {
    width: 100%;
    height: 2px;
  }

  .approve-column { order: 1; }
  .condemn-column { order: 3; }
}

@media (max-width: 768px) {
  .council-content {
    padding: var(--space-4);
  }

  .council-header h2 {
    font-size: var(--font-size-xl);
  }

  .god-vote-card .god-icon-large {
    width: 48px;
    height: 48px;
  }
}
```

#### JavaScript for Dynamic God Voting
```javascript
/**
 * Divine Council Voting System
 * Dynamically animates god votes based on player choices
 */

class DivineCouncil {
  constructor() {
    this.gods = {
      valdris: {
        icon: '/static/images/god_valdris.svg',
        name: 'Valdris',
        title: 'God of Order & Justice',
        color: 'var(--god-valdris)'
      },
      kaitha: {
        icon: '/static/images/god_kaitha.svg',
        name: 'Kaitha',
        title: 'Goddess of Chaos & Freedom',
        color: 'var(--god-kaitha)'
      },
      morvane: {
        icon: '/static/images/god_morvane.svg',
        name: 'Morvane',
        title: 'God of Death & Survival',
        color: 'var(--god-morvane)'
      },
      sylara: {
        icon: '/static/images/god_sylara.svg',
        name: 'Sylara',
        title: 'Goddess of Nature & Balance',
        color: 'var(--god-sylara)'
      },
      korvan: {
        icon: '/static/images/god_korvan.svg',
        name: 'Korvan',
        title: 'God of War & Honor',
        color: 'var(--god-korvan)'
      },
      athena: {
        icon: '/static/images/god_athena.svg',
        name: 'Athena',
        title: 'Goddess of Wisdom & Knowledge',
        color: 'var(--god-athena)'
      },
      mercus: {
        icon: '/static/images/god_mercus.svg',
        name: 'Mercus',
        title: 'God of Commerce & Wealth',
        color: 'var(--god-mercus)'
      }
    };
  }

  /**
   * Show voting modal with animated god decisions
   * @param {Object} voteData - Contains approve/condemn arrays and reasons
   */
  showVoting(voteData) {
    const modal = document.getElementById('council-voting-modal');
    const approveList = document.getElementById('approve-gods');
    const condemnList = document.getElementById('condemn-gods');

    // Clear previous votes
    approveList.innerHTML = '';
    condemnList.innerHTML = '';

    // Populate approve votes
    voteData.approve.forEach(godKey => {
      const card = this.createGodVoteCard(godKey, voteData.reasons[godKey]);
      approveList.appendChild(card);
    });

    // Populate condemn votes
    voteData.condemn.forEach(godKey => {
      const card = this.createGodVoteCard(godKey, voteData.reasons[godKey]);
      condemnList.appendChild(card);
    });

    // Set judgment text
    document.getElementById('judgment-text').textContent = voteData.judgment;

    // Show modal
    modal.classList.add('active');
  }

  /**
   * Create a god vote card element
   */
  createGodVoteCard(godKey, reason) {
    const god = this.gods[godKey];
    const card = document.createElement('div');
    card.className = 'god-vote-card';
    card.setAttribute('data-god', godKey);

    card.innerHTML = `
      <img src="${god.icon}"
           alt="${god.name}"
           class="god-icon-large"
           width="56"
           height="56">
      <div class="god-vote-info">
        <div class="god-vote-name" style="color: ${god.color}">
          ${god.name.toUpperCase()}
        </div>
        <div class="god-vote-reason">"${reason}"</div>
      </div>
    `;

    return card;
  }

  /**
   * Hide voting modal
   */
  hideVoting() {
    const modal = document.getElementById('council-voting-modal');
    modal.classList.remove('active');
  }
}

// Example usage:
const council = new DivineCouncil();

// When a choice is made that triggers divine judgment:
council.showVoting({
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
  judgment: "The council is divided 3-4. Your choice has cost you favor, but you maintain balance in the cosmos."
});

// Close button handler
document.querySelector('.council-continue').addEventListener('click', () => {
  council.hideVoting();
});
```

---

### LOCATION 5: Story Text & Scenario Sections
**Priority:** MEDIUM

#### Divider Integration
```html
<!-- Use between major story sections -->
<div class="story-section">
  <p>The merchant trembles before you, pleading for mercy...</p>
</div>

<img src="/static/images/divider_line.svg"
     class="section-divider"
     alt="">

<div class="story-section">
  <p>Your companions watch intently, waiting for your decision...</p>
</div>
```

```css
.section-divider {
  width: 80%;
  height: 6px;
  margin: var(--space-6) auto;
  opacity: 0.5;
  display: block;
}

/* Animated entrance */
.section-divider.animate {
  animation: dividerSlide 0.8s ease-out;
}

@keyframes dividerSlide {
  from {
    opacity: 0;
    transform: scaleX(0);
  }
  to {
    opacity: 0.5;
    transform: scaleX(1);
  }
}
```

#### Rune Bullet Points
```html
<ul class="mystical-list">
  <li>
    <img src="/static/images/rune_symbol_1.svg" class="list-rune" alt="">
    <span>Ancient prophecies speak of your coming</span>
  </li>
  <li>
    <img src="/static/images/rune_symbol_2.svg" class="list-rune" alt="">
    <span>The artifact pulses with arcane energy</span>
  </li>
  <li>
    <img src="/static/images/rune_symbol_3.svg" class="list-rune" alt="">
    <span>Shadows dance at the edge of your vision</span>
  </li>
</ul>
```

```css
.mystical-list {
  list-style: none;
  padding: 0;
  margin: var(--space-4) 0;
}

.mystical-list li {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
  padding: var(--space-2);
  background: rgba(0, 0, 0, 0.2);
  border-left: 2px solid var(--color-arcane-500);
  border-radius: var(--radius-md);
  transition: all var(--duration-base) var(--ease-out);
}

.mystical-list li:hover {
  background: rgba(0, 0, 0, 0.4);
  border-left-color: var(--color-divine-500);
  transform: translateX(4px);
}

.list-rune {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  opacity: 0.8;
  filter: drop-shadow(0 0 4px rgba(139, 92, 246, 0.4));
}
```

---

### LOCATION 6: Loading States
**Priority:** MEDIUM

#### Loading Screen with Logo
```html
<div id="loading-screen" class="loading-screen">
  <div class="loading-content">
    <img src="/static/images/arcane_codex_logo.svg"
         alt="The Arcane Codex"
         class="loading-logo"
         width="150"
         height="150">

    <div class="loading-text">Awakening the Codex...</div>

    <div class="loading-runes">
      <img src="/static/images/rune_symbol_1.svg" class="loading-rune" alt="">
      <img src="/static/images/rune_symbol_2.svg" class="loading-rune" alt="">
      <img src="/static/images/rune_symbol_3.svg" class="loading-rune" alt="">
    </div>

    <div class="loading-bar">
      <div class="loading-bar-fill"></div>
    </div>
  </div>
</div>
```

```css
.loading-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background:
    linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,8,18,0.95) 100%),
    url('/static/images/mystical_background.svg') repeat;
  background-size: auto, 250px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  transition: opacity 0.8s ease-out;
}

.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
}

.loading-logo {
  animation:
    logoFloat 3s ease-in-out infinite,
    logoGlowPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 30px rgba(139, 31, 255, 0.6));
}

@keyframes logoGlowPulse {
  0%, 100% {
    filter: drop-shadow(0 0 30px rgba(139, 31, 255, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 50px rgba(139, 31, 255, 0.9));
  }
}

.loading-text {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  color: var(--color-divine-300);
  letter-spacing: var(--letter-spacing-wider);
  text-shadow: 0 0 20px rgba(212, 175, 55, 0.5);
  animation: textPulse 2s ease-in-out infinite;
}

@keyframes textPulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.loading-runes {
  display: flex;
  gap: var(--space-6);
}

.loading-rune {
  width: 32px;
  height: 32px;
  animation: runeOrbit 4s ease-in-out infinite;
  opacity: 0;
}

.loading-rune:nth-child(1) {
  animation-delay: 0s;
}

.loading-rune:nth-child(2) {
  animation-delay: 0.3s;
}

.loading-rune:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes runeOrbit {
  0%, 100% {
    opacity: 0;
    transform: translateY(20px) rotate(0deg);
  }
  50% {
    opacity: 1;
    transform: translateY(0px) rotate(180deg);
  }
}

.loading-bar {
  width: 300px;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.loading-bar-fill {
  height: 100%;
  background: linear-gradient(90deg,
    var(--color-arcane-500),
    var(--color-divine-500),
    var(--color-arcane-500));
  background-size: 200% 100%;
  animation: loadingProgress 2s ease-in-out infinite;
  border-radius: var(--radius-full);
  box-shadow: 0 0 10px var(--color-arcane-500);
}

@keyframes loadingProgress {
  0% {
    width: 0%;
    background-position: 0% 50%;
  }
  50% {
    width: 70%;
    background-position: 100% 50%;
  }
  100% {
    width: 100%;
    background-position: 0% 50%;
  }
}
```

---

### LOCATION 7: Achievement/Notification System
**Priority:** LOW

#### Divine Blessing Notification
```html
<div class="notification divine-blessing">
  <img src="/static/images/god_korvan.svg"
       class="notification-icon"
       alt="Korvan"
       width="40"
       height="40">
  <div class="notification-content">
    <div class="notification-title">Divine Blessing Received!</div>
    <div class="notification-text">Korvan grants you +5 favor for your courage in battle</div>
  </div>
  <img src="/static/images/rune_symbol_1.svg"
       class="notification-rune"
       alt="">
</div>
```

```css
.notification {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4);
  background: linear-gradient(90deg,
    rgba(0, 0, 0, 0.95),
    rgba(26, 22, 18, 0.95));
  border: 2px solid var(--color-divine-500);
  border-radius: var(--radius-lg);
  box-shadow:
    0 4px 12px rgba(0, 0, 0, 0.6),
    0 0 20px rgba(212, 175, 55, 0.3);
  animation: notificationSlideIn 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

@keyframes notificationSlideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg,
    transparent,
    rgba(212, 175, 55, 0.2),
    transparent);
  animation: notificationShimmer 2s ease-in-out infinite;
}

@keyframes notificationShimmer {
  to {
    left: 100%;
  }
}

.notification-icon {
  width: 40px;
  height: 40px;
  padding: var(--space-1);
  background: radial-gradient(circle,
    rgba(212, 175, 55, 0.2),
    transparent);
  border: 2px solid rgba(212, 175, 55, 0.4);
  border-radius: var(--radius-full);
  filter: drop-shadow(0 0 8px rgba(212, 175, 55, 0.4));
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-bold);
  color: var(--color-divine-300);
  margin-bottom: var(--space-1);
}

.notification-text {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
}

.notification-rune {
  width: 24px;
  height: 24px;
  opacity: 0.6;
  animation: runeRotate 8s linear infinite;
}
```

---

## Loading Strategy

### Inline vs. External References

#### INLINE SVGs (Recommended for):
1. **God icons in voting modal** - Allows CSS color manipulation via `fill: currentColor`
2. **Small decorative runes** - Faster rendering, fewer HTTP requests
3. **Critical above-fold graphics** - Logo on landing page

#### EXTERNAL REFERENCES (Recommended for):
1. **Character sheet god icons** - Cached efficiently, reused across page
2. **Background patterns** - Large files benefit from caching
3. **Loading screen graphics** - Can load asynchronously

### Implementation Pattern
```html
<!-- Inline SVG example (for manipulation) -->
<svg class="god-icon-inline" viewBox="0 0 64 64">
  <!-- SVG content here - allows fill/stroke manipulation -->
</svg>

<!-- External reference (for caching) -->
<img src="/static/images/god_valdris.svg"
     alt="Valdris"
     width="48"
     height="48"
     loading="lazy">
```

### Preloading Strategy
```html
<!-- In <head> section -->
<link rel="preload"
      href="/static/images/arcane_codex_logo.svg"
      as="image"
      type="image/svg+xml">

<!-- God icons for character sheet (preload if critical) -->
<link rel="prefetch"
      href="/static/images/god_valdris.svg"
      as="image">
<!-- Repeat for other gods -->
```

---

## Browser Fallbacks & Accessibility

### SVG Support Fallback
```html
<!-- With fallback image -->
<object data="/static/images/arcane_codex_logo.svg"
        type="image/svg+xml"
        width="200"
        height="200">
  <img src="/static/images/arcane_codex_logo.png"
       alt="The Arcane Codex"
       width="200"
       height="200">
</object>
```

### CSS Feature Detection
```css
/* Fallback for browsers without SVG support */
@supports not (content: url('data:image/svg+xml,')) {
  .god-icon {
    background-image: url('/static/images/fallback/god-icon.png');
    background-size: contain;
  }
}

/* Fallback for no backdrop-filter support */
@supports not (backdrop-filter: blur(8px)) {
  .mystical-backdrop {
    background: rgba(0, 0, 0, 0.95);
  }
}
```

### Accessibility Enhancements
```html
<!-- Meaningful alt text -->
<img src="/static/images/god_valdris.svg"
     alt="Valdris, God of Order and Justice"
     role="img"
     aria-label="Valdris, God of Order and Justice">

<!-- Decorative icons (hide from screen readers) -->
<img src="/static/images/rune_symbol_1.svg"
     alt=""
     role="presentation"
     aria-hidden="true">

<!-- SVG with title and desc for accessibility -->
<svg viewBox="0 0 64 64" role="img" aria-labelledby="valdris-title valdris-desc">
  <title id="valdris-title">Valdris</title>
  <desc id="valdris-desc">Icon depicting scales of justice with a crown</desc>
  <!-- SVG content -->
</svg>
```

---

## Responsive Sizing Guidelines

### Breakpoint-Specific Sizes
```css
/* God Icons */
.god-icon {
  /* Mobile: Smaller for compact screens */
  width: 28px;
  height: 28px;
}

@media (min-width: 768px) {
  .god-icon {
    /* Tablet: Medium size */
    width: 32px;
    height: 32px;
  }
}

@media (min-width: 1024px) {
  .god-icon {
    /* Desktop: Full size */
    width: 48px;
    height: 48px;
  }
}

/* Logo Scaling */
.logo-main {
  /* Mobile */
  width: 120px;
  height: 120px;
}

@media (min-width: 768px) {
  .logo-main {
    /* Tablet */
    width: 160px;
    height: 160px;
  }
}

@media (min-width: 1024px) {
  .logo-main {
    /* Desktop */
    width: 200px;
    height: 200px;
  }
}

/* Corner Flourishes */
.corner-decoration {
  /* Mobile: Hidden or very small */
  display: none;
}

@media (min-width: 768px) {
  .corner-decoration {
    /* Tablet: Small */
    display: block;
    width: 50px;
    height: 50px;
  }
}

@media (min-width: 1024px) {
  .corner-decoration {
    /* Desktop: Full size */
    width: 80px;
    height: 80px;
  }
}
```

---

## Color Scheme Integration

### Existing Theme Colors (from 00-tokens.css)
- **Primary Arcane**: `--color-arcane-500: #8b1fff` (purple)
- **Divine Gold**: `--color-divine-500: #f59e0b`
- **Mystic Teal**: `--color-mystic-500: #14b8a6`

### God-Specific Colors (Already Defined)
```css
--god-valdris: #2563EB;   /* Royal blue */
--god-kaitha: #F59E0B;    /* Orange */
--god-morvane: #7C3AED;   /* Purple */
--god-sylara: #059669;    /* Green */
--god-korvan: #DC2626;    /* Red */
--god-athena: #2563EB;    /* Blue */
--god-mercus: #D4AF37;    /* Gold */
```

### SVG Color Manipulation
```css
/* Apply god-specific colors to SVG fills */
.god-icon.valdris {
  filter:
    drop-shadow(0 0 8px var(--god-valdris))
    hue-rotate(200deg); /* Shift gold to blue */
}

.god-icon.kaitha {
  filter: drop-shadow(0 0 8px var(--god-kaitha));
}

/* For inline SVGs, use CSS variables */
.god-icon-inline {
  fill: var(--god-color);
  stroke: var(--god-color-light);
}
```

---

## Performance Optimization

### 1. SVG Optimization
```bash
# Use SVGO to minimize file sizes
npx svgo -f static/images/ -o static/images/optimized/

# Options to preserve:
# - viewBox (for scaling)
# - IDs (for gradients/filters)
# - Filters (for glow effects)
```

### 2. Lazy Loading
```html
<!-- Non-critical images -->
<img src="/static/images/mystical_background.svg"
     loading="lazy"
     decoding="async">

<!-- Critical images (above fold) -->
<img src="/static/images/arcane_codex_logo.svg"
     loading="eager">
```

### 3. CSS Containment
```css
.god-icon-container {
  contain: layout style paint;
  /* Isolates this element for better rendering performance */
}
```

### 4. Sprite Sheet Alternative (For Many Small Icons)
```svg
<!-- sprite-sheet.svg - Single file with all god icons -->
<svg style="display: none;">
  <symbol id="god-valdris" viewBox="0 0 64 64">
    <!-- Valdris icon content -->
  </symbol>
  <symbol id="god-kaitha" viewBox="0 0 64 64">
    <!-- Kaitha icon content -->
  </symbol>
  <!-- ... other gods ... -->
</svg>

<!-- Usage -->
<svg class="god-icon">
  <use href="#god-valdris"></use>
</svg>
```

---

## Implementation Priority Order

### PHASE 1 (Week 1) - HIGH PRIORITY
1. **Landing Page Logo Integration** (2 hours)
   - Add logo with animations
   - Corner flourishes
   - Mystical background

2. **Top Navigation Logo** (1 hour)
   - Compact logo in HUD
   - Responsive scaling

3. **Character Sheet Divine Favor** (3 hours)
   - God icons next to names
   - Hover effects
   - Rune decorations in header

### PHASE 2 (Week 2) - CRITICAL FEATURE
4. **Divine Council Voting Modal** (6 hours)
   - Full modal structure
   - Animated god vote cards
   - Judgment system
   - JavaScript integration
   - Responsive design

### PHASE 3 (Week 3) - POLISH
5. **Story Text Enhancements** (2 hours)
   - Divider lines between sections
   - Rune bullet points

6. **Loading Screen** (2 hours)
   - Animated logo
   - Rune orbit effect
   - Progress bar

### PHASE 4 (Week 4) - NICE-TO-HAVE
7. **Notification System** (3 hours)
   - Divine blessing toasts
   - Achievement popups

8. **Additional Decorative Elements** (2 hours)
   - Panel corner decorations
   - Modal borders with runes

---

## Testing Checklist

### Visual Testing
- [ ] All SVGs render correctly in Chrome, Firefox, Safari, Edge
- [ ] Animations run smoothly (60fps target)
- [ ] No layout shift when SVGs load
- [ ] Hover effects work on all interactive elements
- [ ] Colors match design system tokens

### Responsive Testing
- [ ] Mobile (320px - 767px): Simplified layout, smaller icons
- [ ] Tablet (768px - 1023px): Medium icons, single-column voting
- [ ] Desktop (1024px+): Full-size icons, side-by-side voting
- [ ] Ultra-wide (1920px+): No stretching, proper max-widths

### Performance Testing
- [ ] Page load time < 3 seconds on 3G connection
- [ ] No cumulative layout shift from SVG loading
- [ ] Lazy loading working for below-fold images
- [ ] Animations don't cause jank or dropped frames

### Accessibility Testing
- [ ] All SVGs have proper alt text or aria-labels
- [ ] Decorative SVGs hidden from screen readers
- [ ] Keyboard navigation works for interactive elements
- [ ] Color contrast meets WCAG AA standards (4.5:1 minimum)
- [ ] Reduced motion preference respected

### Browser Fallback Testing
- [ ] PNG fallbacks work in IE11 (if supporting)
- [ ] No FOUC (flash of unstyled content)
- [ ] Graceful degradation without SVG support

---

## File Structure Reference

```
complete_game/
├── static/
│   ├── images/
│   │   ├── god_valdris.svg ✓
│   │   ├── god_kaitha.svg ✓
│   │   ├── god_morvane.svg ✓
│   │   ├── god_sylara.svg ✓
│   │   ├── god_korvan.svg ✓
│   │   ├── god_athena.svg ✓
│   │   ├── god_mercus.svg ✓
│   │   ├── arcane_codex_logo.svg ✓
│   │   ├── corner_flourish.svg ✓
│   │   ├── divider_line.svg ✓
│   │   ├── rune_symbol_1.svg ✓
│   │   ├── rune_symbol_2.svg ✓
│   │   ├── rune_symbol_3.svg ✓
│   │   └── mystical_background.svg ✓
│   ├── css/
│   │   ├── design-system/
│   │   │   ├── 00-tokens.css (color variables)
│   │   │   ├── 03-animations.css (keyframes)
│   │   │   └── 04-components.css (god icons, voting modal)
│   │   └── svg-integration.css (NEW - add all SVG styles here)
│   └── js/
│       └── divine-council.js (NEW - voting system)
```

---

## Quick Start Code Snippets

### Complete CSS File: `svg-integration.css`
Create this file with all the CSS from sections above:

```css
/**
 * The Arcane Codex - SVG Integration Styles
 * All styles for SVG graphics integration
 */

/* ==========================================
   LANDING PAGE STYLES
   ========================================== */
.landing-hero { /* ... */ }
.logo-container { /* ... */ }
.logo-main { /* ... */ }
.corner-decoration { /* ... */ }

/* ==========================================
   NAVIGATION STYLES
   ========================================== */
.nav-logo { /* ... */ }
.logo-small { /* ... */ }

/* ==========================================
   CHARACTER SHEET - DIVINE FAVOR
   ========================================== */
.divine-favor-section { /* ... */ }
.god-icon-container { /* ... */ }
.god-icon { /* ... */ }

/* ==========================================
   DIVINE COUNCIL VOTING MODAL
   ========================================== */
.divine-council-modal { /* ... */ }
.god-voting-arena { /* ... */ }
.god-vote-card { /* ... */ }

/* ... (include all CSS from above) ... */
```

### Complete JavaScript File: `divine-council.js`
```javascript
/**
 * Divine Council Voting System
 * Complete implementation
 */

class DivineCouncil {
  // ... (include all JavaScript from above) ...
}

// Initialize
const council = new DivineCouncil();

// Export for use in main game
window.DivineCouncil = council;
```

### HTML Template Addition
Add this to your main game HTML:

```html
<!-- In <head> -->
<link rel="stylesheet" href="/static/css/svg-integration.css">
<link rel="preload" href="/static/images/arcane_codex_logo.svg" as="image">

<!-- Before </body> -->
<script src="/static/js/divine-council.js"></script>

<!-- Add voting modal markup -->
<!-- (Include full modal HTML from section above) -->
```

---

## Visual Hierarchy Summary

### Z-Index Layers (Top to Bottom)
1. **Loading Screen** (z-index: 9999)
2. **Divine Council Modal** (z-index: 1050)
3. **Notifications** (z-index: 1080)
4. **Top Navigation** (z-index: 100)
5. **Corner Decorations** (z-index: 10)
6. **Main Content** (z-index: 0)
7. **Background Patterns** (z-index: -1)

### Visual Weight (Most to Least Prominent)
1. Divine Council Modal (largest, centered, animated)
2. Landing Page Logo (hero position, glowing)
3. Character Sheet God Icons (interactive, prominent)
4. Top Nav Logo (small but always visible)
5. Decorative Elements (subtle, low opacity)

---

## Final Recommendations

### DO:
✅ Use external `<img>` references for god icons in character sheet (caching)
✅ Inline SVG for voting modal god icons (animation control)
✅ Lazy load background patterns and decorative elements
✅ Preload critical SVGs (logo on landing page)
✅ Use CSS variables for consistent theming
✅ Test on real devices, not just browser dev tools
✅ Implement progressive enhancement (work without SVG)
✅ Add loading states for asynchronous SVG loads

### DON'T:
❌ Don't inline large SVGs (>10KB) in critical rendering path
❌ Don't forget alt text for meaningful images
❌ Don't use base64 encoded SVGs (larger file size)
❌ Don't animate too many elements simultaneously (performance)
❌ Don't use complex filters on mobile (battery drain)
❌ Don't rely solely on color to convey information (accessibility)
❌ Don't forget to compress/optimize SVGs before deployment

---

## Success Metrics

After implementation, measure:
- **Page Load Time**: < 3s on 3G
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **Animation Frame Rate**: 60fps steady
- **User Engagement**: +20% time on character sheet (god icons)
- **Immersion Score**: Qualitative feedback on divine council voting

---

## Conclusion

This integration plan transforms The Arcane Codex into a visually stunning dark fantasy experience. The Divine Council voting modal will be the centerpiece feature, providing dramatic visual feedback for player choices. God icons in the character sheet create ongoing engagement with the divine favor system. Decorative elements throughout enhance the mystical atmosphere without overwhelming the UI.

**Implementation Time Estimate**: 20-25 hours total
**Complexity**: Medium-High
**Impact**: Very High (core to game's visual identity)

Ready to begin implementation! Start with Phase 1 (Landing Page) for immediate visual impact.
