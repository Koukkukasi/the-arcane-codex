# Skills & Abilities System - Animation Specifications
## The Arcane Codex

---

## Table of Contents

1. [Animation Philosophy](#animation-philosophy)
2. [Skill Tree Animations](#skill-tree-animations)
3. [Ability Activation Animations](#ability-activation-animations)
4. [Cooldown Animations](#cooldown-animations)
5. [Celebration Sequences](#celebration-sequences)
6. [Micro-interactions](#micro-interactions)
7. [Performance Guidelines](#performance-guidelines)
8. [Accessibility Considerations](#accessibility-considerations)

---

## Animation Philosophy

### Core Principles

1. **Responsive Feedback**: Every user action receives immediate visual feedback
2. **Progressive Enhancement**: Animations add delight without blocking functionality
3. **Performance First**: All animations run at 60fps on target devices
4. **Meaningful Motion**: Animations convey system state and guide user attention
5. **Accessibility**: Respect `prefers-reduced-motion` preferences

### Timing Guidelines

| Action Type | Duration | Easing Function |
|-------------|----------|-----------------|
| Micro-interactions | 150-250ms | ease-out |
| Panel transitions | 300-400ms | ease-in-out |
| Celebrations | 1000-3000ms | elastic/bounce |
| Cooldown progress | Linear | linear |
| Skill unlock | 1500ms | ease-out |

---

## Skill Tree Animations

### Node States & Transitions

#### 1. Locked → Available Transition

**Visual Changes:**
- Border color: `var(--skill-node-locked)` → `var(--skill-node-available)`
- Background glow appears with pulsing animation
- Pulse effect on border

**Animation Sequence:**
```css
@keyframes skillUnlock {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.2);
    filter: brightness(1.5);
  }
  50% {
    transform: scale(1.15);
    filter: brightness(1.8);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
```

**Timing:** 800ms with ease-out
**Delay:** Stagger by 100ms if multiple nodes unlock

#### 2. Available → Unlocked Transition

**Visual Changes:**
- Border color change with flash effect
- Icon scales up momentarily
- Rank badge animates in from bottom
- Connection line to node lights up

**Animation Sequence:**
```css
@keyframes skillInvest {
  0% {
    transform: scale(1);
  }
  20% {
    transform: scale(1.15) rotate(5deg);
  }
  40% {
    transform: scale(1.1) rotate(-3deg);
  }
  60% {
    transform: scale(1.12) rotate(2deg);
  }
  80% {
    transform: scale(1.05) rotate(-1deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
  }
}
```

**Timing:** 600ms with bounce easing
**Sound Effect:** "skill-invest.mp3"
**Particle Effect:** Golden sparkles emanate from node (5-8 particles)

#### 3. Rank Up Animation

**Visual Changes:**
- Rank number counts up (e.g., "3/5" → "4/5")
- Circular progress ring fills
- Brief glow pulse

**Animation Sequence:**
```css
@keyframes rankIncrease {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
```

**Timing:** 400ms
**Counter Animation:** Number ticks up over 300ms

#### 4. Connection Line Activation

**Visual Changes:**
- Line draws from parent to child node
- Color transitions from locked to unlocked state
- Glow effect travels along the line

**Animation Sequence:**
```css
@keyframes connectionActivate {
  0% {
    stroke-dashoffset: 1000;
    opacity: 0.3;
  }
  100% {
    stroke-dashoffset: 0;
    opacity: 1;
  }
}
```

**Timing:** 500ms with ease-in-out
**Delay:** Starts 200ms after node unlock animation

---

## Ability Activation Animations

### Action Bar Ability Activation

#### 1. Button Press Feedback

**Visual Changes:**
- Icon scales down briefly
- Background flashes
- Ripple effect from center

**Animation Sequence:**
```css
@keyframes abilityActivate {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(139, 31, 255, 0.7);
  }
  50% {
    transform: scale(0.95);
    box-shadow: 0 0 0 20px rgba(139, 31, 255, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(139, 31, 255, 0);
  }
}
```

**Timing:** 300ms
**Sound Effect:** Varies by ability type (melee, magic, etc.)

#### 2. Ability Cast Sequence

For abilities with cast time (e.g., Fireball - 1.2s cast):

**Visual Phases:**

1. **Preparation (0-200ms)**
   - Ability icon glows
   - Border pulses

2. **Casting (200ms - cast complete)**
   - Circular progress indicator fills
   - Icon rotates slightly
   - Pulsing glow intensifies

3. **Release (cast complete)**
   - Flash of light
   - Icon returns to normal
   - Cooldown begins

**Animation Sequence:**
```css
@keyframes abilityCast {
  0% {
    filter: brightness(1);
    transform: rotate(0deg);
  }
  50% {
    filter: brightness(1.5);
    transform: rotate(5deg);
  }
  100% {
    filter: brightness(2);
    transform: rotate(0deg);
  }
}
```

---

## Cooldown Animations

### Progress Indicator

**Implementation:**
- Vertical fill from top to bottom using `transform: scaleY()`
- Semi-transparent black overlay
- Countdown timer displays remaining seconds

**Animation Properties:**
```css
.cooldown-progress {
  transform-origin: top;
  transition: transform 0.1s linear;
  /* Updates every 100ms via JavaScript */
}
```

### Cooldown Complete

**Visual Changes:**
- Overlay fades out over 200ms
- Icon pulses once to indicate readiness
- Brief glow effect

**Animation Sequence:**
```css
@keyframes cooldownComplete {
  0% {
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(139, 31, 255, 0.8);
  }
  100% {
    opacity: 0;
    transform: scale(1);
  }
}
```

**Timing:** 400ms
**Sound Effect:** "cooldown-ready.mp3" (subtle chime)

---

## Celebration Sequences

### Skill Unlock Celebration

**Full-Screen Overlay Animation**

**Sequence Breakdown:**

1. **Backdrop Fade-In (0-200ms)**
   - Black overlay fades to 90% opacity
   - Blur effect increases

2. **Icon Entrance (200-600ms)**
   - Large icon zooms in from 0.3x to 1x scale
   - Rotation effect (0° to 360°)
   - Ease-out with elastic bounce

3. **Title Reveal (400-800ms)**
   - Text fades in from bottom
   - Scale from 0.8x to 1x
   - Stagger delay: 100ms

4. **Skill Name (600-1000ms)**
   - Golden glow text appears
   - Letter-by-letter reveal (optional)
   - Glow pulse effect

5. **Description (800-1200ms)**
   - Subtle fade-in
   - Slide up 20px

6. **Particle Effects (Continuous)**
   - 30 sparkle particles
   - Random positions and delays
   - Float and fade animation

7. **Button Appearance (1000-1400ms)**
   - "Continue" button slides up
   - Glow effect on hover

**CSS Implementation:**
```css
.celebration-overlay {
  animation: fadeIn 200ms ease-out;
}

.celebration-icon {
  animation: celebrationZoom 600ms cubic-bezier(0.68, -0.6, 0.32, 1.6);
}

.celebration-title {
  animation: fadeInUp 400ms ease-out 200ms backwards;
}

.celebration-skill-name {
  animation: fadeInUp 400ms ease-out 300ms backwards,
             textGlow 2s ease-in-out infinite;
}

@keyframes celebrationZoom {
  0% {
    transform: scale(0.3) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.1) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
    opacity: 1;
  }
}

@keyframes textGlow {
  0%, 100% {
    text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
  }
  50% {
    text-shadow: 0 0 20px rgba(245, 158, 11, 0.8),
                 0 0 30px rgba(245, 158, 11, 0.6);
  }
}
```

### Level Up Celebration

**Variant Animation:**
- Similar to skill unlock but with additional elements
- XP bar fills animation
- Level number count-up effect
- Stat increases fly in from bottom

**Duration:** 3-5 seconds
**Auto-dismiss:** After 5 seconds or on click

---

## Micro-interactions

### Hover States

#### Skill Node Hover
```css
.skill-node:hover {
  transform: translate(-50%, -50%) scale(1.1);
  transition: transform 200ms ease-out;
  box-shadow: 0 0 30px rgba(139, 31, 255, 0.6);
}
```

#### Ability Card Hover
```css
.ability-card:hover {
  transform: translateY(-4px);
  transition: transform 250ms ease-out;
  box-shadow: 0 8px 20px rgba(139, 31, 255, 0.3);
}
```

#### Action Slot Hover
```css
.action-slot:hover {
  transform: translateY(-4px);
  transition: transform 200ms ease-out;
  border-color: var(--color-arcane-500);
}
```

### Drag & Drop States

#### Drag Start
- Opacity: 0.5
- Cursor: grabbing
- All action slots get "can-drop" class

#### Drag Over Valid Target
- Border color: gold
- Background glow
- Scale up slightly (1.05x)

#### Drop Success
- Flash animation
- Sound effect
- Brief particle burst

---

## Performance Guidelines

### GPU Acceleration

**Properties to Animate (GPU-accelerated):**
- `transform`
- `opacity`
- `filter` (use sparingly)

**Avoid Animating:**
- `width`, `height` (causes reflow)
- `top`, `left` (use `transform` instead)
- `margin`, `padding`

### Will-Change Optimization

```css
/* Apply to elements that will animate */
.skill-node,
.ability-card,
.action-slot {
  will-change: transform;
}

/* Remove after animation completes */
.skill-node.animating {
  will-change: auto;
}
```

### Animation Budget

**Per-frame Budget:** 16.67ms (60fps)

**Recommended Limits:**
- Max simultaneous animations: 10
- Max particle count: 50
- Cooldown update frequency: 100ms (10fps is sufficient)

### Performance Testing

```javascript
// Monitor frame rate
let lastTime = performance.now();
let frames = 0;

function checkFrameRate() {
  const currentTime = performance.now();
  frames++;

  if (currentTime >= lastTime + 1000) {
    console.log(`FPS: ${frames}`);
    frames = 0;
    lastTime = currentTime;
  }

  requestAnimationFrame(checkFrameRate);
}

checkFrameRate();
```

---

## Accessibility Considerations

### Reduced Motion Support

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep essential feedback */
  .ability-cooldown-overlay {
    transition: opacity 0.2s !important;
  }
}
```

### Focus Indicators

```css
.skill-node:focus-visible,
.ability-card:focus-visible,
.action-slot:focus-visible {
  outline: 3px solid var(--color-arcane-400);
  outline-offset: 4px;
  /* Animation still runs but focus ring is always visible */
}
```

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  .skill-node,
  .ability-card {
    border-width: 3px;
  }

  .tree-connection {
    stroke-width: 4px;
  }
}
```

---

## Animation State Machine

### Skill Node States

```
[LOCKED]
  ↓ (requirements met)
[AVAILABLE] → (pulse animation)
  ↓ (skill point invested)
[UNLOCKED] → (unlock animation)
  ↓ (more points invested)
[RANK 2-4] → (rank up animation)
  ↓ (max rank reached)
[MAX RANK] → (max rank glow)
```

### Ability Activation States

```
[READY]
  ↓ (activation)
[CASTING] → (cast bar animation)
  ↓ (cast complete)
[COOLDOWN] → (cooldown progress)
  ↓ (cooldown complete)
[READY] → (ready pulse)
```

---

## Implementation Checklist

- [ ] Skill node state transitions implemented
- [ ] Connection line animations working
- [ ] Ability activation feedback present
- [ ] Cooldown system animating smoothly
- [ ] Celebration sequences trigger correctly
- [ ] Drag-and-drop visual feedback clear
- [ ] Hover states provide feedback
- [ ] Performance tested (60fps maintained)
- [ ] Reduced motion preferences respected
- [ ] Focus indicators visible
- [ ] Mobile touch interactions working
- [ ] Sound effects integrated
- [ ] Particle systems optimized

---

## Future Enhancements

1. **Advanced Particle Systems**
   - WebGL-based particle renderer
   - More complex particle behaviors

2. **Skill Combos**
   - Visual indicators when skills synergize
   - Chain animation sequences

3. **Customizable Themes**
   - Player-selectable animation intensity
   - Custom color schemes for abilities

4. **Battle Integration**
   - Ability animations sync with combat
   - Real-time damage numbers

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Author:** UI/UX Design System Architect
**Project:** The Arcane Codex
