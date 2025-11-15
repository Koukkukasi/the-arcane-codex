# Skills & Abilities System - Mobile Adaptation Guide
## The Arcane Codex

---

## Table of Contents

1. [Mobile Design Philosophy](#mobile-design-philosophy)
2. [Touch Interaction Patterns](#touch-interaction-patterns)
3. [Responsive Breakpoints](#responsive-breakpoints)
4. [Component Adaptations](#component-adaptations)
5. [Performance Optimizations](#performance-optimizations)
6. [Touch Gestures](#touch-gestures)
7. [Mobile-Specific UI Patterns](#mobile-specific-ui-patterns)
8. [Testing Guidelines](#testing-guidelines)

---

## Mobile Design Philosophy

### Core Principles

1. **Touch-First Design**: All interactions work with fingers (44px minimum touch targets)
2. **Simplified Navigation**: Reduce cognitive load with clear, focused interfaces
3. **One-Handed Operation**: Critical actions accessible with thumb reach
4. **Progressive Disclosure**: Show essential info first, details on demand
5. **Performance**: Smooth 60fps on mid-range devices

### Design Constraints

| Device Type | Min Touch Target | Max Text Density | Max Columns |
|-------------|------------------|------------------|-------------|
| Phone (Portrait) | 44px × 44px | 16px base font | 1-2 |
| Phone (Landscape) | 44px × 44px | 14px base font | 2-3 |
| Tablet (Portrait) | 40px × 40px | 16px base font | 2-4 |
| Tablet (Landscape) | 40px × 40px | 15px base font | 3-6 |

---

## Touch Interaction Patterns

### 1. Tap Interactions

#### Single Tap
- **Skill Node**: Show skill details in bottom sheet
- **Ability Card**: Open ability detail modal
- **Action Slot**: Activate ability (if not on cooldown)

#### Long Press (500ms)
- **Skill Node**: Show quick tooltip
- **Ability Card**: Enter drag mode for assignment
- **Action Slot**: Enter edit mode (remove ability)

#### Double Tap
- **Skill Node**: Invest skill point (if available)
- **Ability Card**: Quick-assign to first free action slot

### 2. Swipe Gestures

#### Horizontal Swipe
- **Tab Navigation**: Swipe left/right to change tabs
- **Skill Tree**: Navigate between specialization branches

#### Vertical Swipe
- **Overlay**: Swipe down to close (when at top of scroll)
- **Detail Panel**: Swipe up to expand, down to minimize

### 3. Pinch Gestures

#### Pinch Zoom (Skill Tree)
- Zoom in: 1x → 2x (max)
- Zoom out: 1x → 0.5x (min)
- Two-finger pinch on skill tree canvas

### 4. Pan Gestures

#### Skill Tree Navigation
- One-finger drag to pan viewport
- Momentum scrolling with deceleration
- Edge resistance when reaching boundaries

---

## Responsive Breakpoints

### Breakpoint System

```css
/* Phone (Portrait) */
@media (max-width: 480px) {
  --action-slot-size: 52px;
  --skill-node-size: 70px;
  --font-size-base: 14px;
}

/* Phone (Landscape) */
@media (min-width: 481px) and (max-width: 767px) and (orientation: landscape) {
  --action-slot-size: 56px;
  --skill-node-size: 75px;
}

/* Tablet (Portrait) */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  --action-slot-size: 60px;
  --skill-node-size: 85px;
}

/* Tablet (Landscape) */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: landscape) {
  --action-slot-size: 64px;
  --skill-node-size: 90px;
}
```

### Layout Adaptations

#### Phone Portrait (< 480px)
- Single column layouts
- Full-screen overlays
- Bottom-anchored action bar
- Stacked skill detail panel below tree

#### Phone Landscape (481-767px)
- Two-column layouts where space permits
- Horizontal scrolling action bar
- Side-panel for skill details

#### Tablet (768-1024px)
- Multi-column grid layouts
- Split-view for skill tree + details
- Floating action bar options

---

## Component Adaptations

### Action Bar

#### Desktop (Default)
```html
<div class="action-bar">
  <div class="action-bar-slots">
    <!-- 8 slots in a row -->
  </div>
</div>
```

#### Mobile Phone
```html
<div class="action-bar action-bar--mobile">
  <div class="action-bar-slots-scroll">
    <!-- 8 slots, horizontal scroll -->
  </div>
  <div class="action-bar-indicators">
    <!-- Dots showing which slots are visible -->
  </div>
</div>
```

**CSS Implementation:**
```css
@media (max-width: 768px) {
  .action-bar {
    height: 90px;
    padding: var(--space-2);
  }

  .action-bar-slots {
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }

  .action-bar-slots::-webkit-scrollbar {
    display: none;
  }

  .action-slot {
    scroll-snap-align: center;
    width: 56px;
    height: 56px;
    min-width: 56px;
  }
}
```

### Skill Tree

#### Desktop
- Fixed viewport with pan/zoom
- Hover tooltips
- Click to select

#### Mobile
```css
@media (max-width: 768px) {
  .skill-tree-container {
    grid-template-columns: 1fr;
  }

  .skill-tree-canvas {
    min-height: 50vh;
    max-height: 60vh;
    touch-action: pan-x pan-y pinch-zoom;
  }

  .skill-node {
    width: 70px;
    height: 70px;
  }

  .skill-node-icon {
    font-size: 32px;
  }

  .skill-node-name {
    font-size: 10px;
    max-width: 90px;
    white-space: normal;
    line-height: 1.2;
  }

  /* Bottom sheet for details */
  .skill-detail-panel {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    max-height: 40vh;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
    transform: translateY(100%);
    transition: transform 300ms ease-out;
  }

  .skill-detail-panel.active {
    transform: translateY(0);
  }
}
```

### Ability Grid

#### Desktop
- 3-4 columns grid
- Hover for quick info
- Click for full details

#### Mobile
```css
@media (max-width: 768px) {
  .abilities-grid {
    grid-template-columns: 1fr;
    gap: var(--space-3);
  }

  .ability-card {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: var(--space-3);
  }

  .ability-card-header {
    flex-shrink: 0;
  }

  .ability-card-body {
    flex: 1;
    margin-left: var(--space-3);
  }

  .ability-card-footer {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
    flex-shrink: 0;
  }
}
```

### Skill Detail Modal

#### Desktop
- Centered modal, 700px max-width
- Click backdrop to close

#### Mobile
```css
@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
    margin: 0;
  }

  .modal-header {
    position: sticky;
    top: 0;
    background: var(--color-shadow-900);
    z-index: 10;
  }

  .modal-body {
    padding: var(--space-4);
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .ability-detail-actions {
    position: sticky;
    bottom: 0;
    background: var(--color-shadow-900);
    padding: var(--space-4);
    border-top: 2px solid var(--color-border);
    flex-direction: column;
    gap: var(--space-2);
  }
}
```

---

## Touch Gestures Implementation

### Long Press Handler

```javascript
class LongPressHandler {
  constructor(element, callback, duration = 500) {
    this.element = element;
    this.callback = callback;
    this.duration = duration;
    this.timeout = null;
    this.moved = false;

    this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this));
    this.element.addEventListener('touchend', this.onTouchEnd.bind(this));
  }

  onTouchStart(e) {
    this.moved = false;
    this.timeout = setTimeout(() => {
      if (!this.moved) {
        this.callback(e);
        navigator.vibrate && navigator.vibrate(50); // Haptic feedback
      }
    }, this.duration);
  }

  onTouchMove(e) {
    this.moved = true;
    clearTimeout(this.timeout);
  }

  onTouchEnd(e) {
    clearTimeout(this.timeout);
  }
}

// Usage
const skillNode = document.querySelector('.skill-node');
new LongPressHandler(skillNode, (e) => {
  showQuickTooltip(skillNode);
});
```

### Drag & Drop for Touch

```javascript
class TouchDragDrop {
  constructor() {
    this.draggedElement = null;
    this.dragClone = null;
    this.dropTargets = [];
  }

  initDraggable(element) {
    element.addEventListener('touchstart', this.onDragStart.bind(this));
    element.addEventListener('touchmove', this.onDragMove.bind(this));
    element.addEventListener('touchend', this.onDragEnd.bind(this));
  }

  initDropTarget(element) {
    this.dropTargets.push(element);
  }

  onDragStart(e) {
    this.draggedElement = e.currentTarget;

    // Create visual clone
    this.dragClone = this.draggedElement.cloneNode(true);
    this.dragClone.style.cssText = `
      position: fixed;
      pointer-events: none;
      opacity: 0.8;
      z-index: 10000;
      width: ${this.draggedElement.offsetWidth}px;
      transform: scale(1.1);
    `;
    document.body.appendChild(this.dragClone);

    // Haptic feedback
    navigator.vibrate && navigator.vibrate(10);
  }

  onDragMove(e) {
    e.preventDefault();

    if (!this.dragClone) return;

    const touch = e.touches[0];

    // Position clone under finger
    this.dragClone.style.left = `${touch.clientX - this.dragClone.offsetWidth / 2}px`;
    this.dragClone.style.top = `${touch.clientY - this.dragClone.offsetHeight / 2}px`;

    // Check drop targets
    this.dropTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      const isOver = (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      );

      if (isOver) {
        target.classList.add('drag-over');
        navigator.vibrate && navigator.vibrate(5); // Subtle feedback
      } else {
        target.classList.remove('drag-over');
      }
    });
  }

  onDragEnd(e) {
    if (!this.dragClone) return;

    const touch = e.changedTouches[0];

    // Find drop target
    let droppedOn = null;
    this.dropTargets.forEach(target => {
      const rect = target.getBoundingClientRect();
      if (
        touch.clientX >= rect.left &&
        touch.clientX <= rect.right &&
        touch.clientY >= rect.top &&
        touch.clientY <= rect.bottom
      ) {
        droppedOn = target;
      }
      target.classList.remove('drag-over');
    });

    if (droppedOn) {
      // Handle successful drop
      this.handleDrop(this.draggedElement, droppedOn);
      navigator.vibrate && navigator.vibrate([10, 20, 10]); // Success pattern
    }

    // Cleanup
    this.dragClone.remove();
    this.dragClone = null;
    this.draggedElement = null;
  }

  handleDrop(source, target) {
    const abilityId = source.dataset.abilityId;
    assignAbilityToSlot(abilityId, target);
  }
}

// Initialize
const touchDragDrop = new TouchDragDrop();

document.querySelectorAll('.ability-card.draggable').forEach(card => {
  touchDragDrop.initDraggable(card);
});

document.querySelectorAll('.action-slot').forEach(slot => {
  touchDragDrop.initDropTarget(slot);
});
```

### Pinch Zoom for Skill Tree

```javascript
class PinchZoom {
  constructor(element) {
    this.element = element;
    this.scale = 1;
    this.minScale = 0.5;
    this.maxScale = 2;
    this.initialDistance = 0;

    this.element.addEventListener('touchstart', this.onTouchStart.bind(this));
    this.element.addEventListener('touchmove', this.onTouchMove.bind(this));
  }

  onTouchStart(e) {
    if (e.touches.length === 2) {
      this.initialDistance = this.getDistance(e.touches[0], e.touches[1]);
    }
  }

  onTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();

      const currentDistance = this.getDistance(e.touches[0], e.touches[1]);
      const scaleChange = currentDistance / this.initialDistance;

      this.scale = Math.min(
        Math.max(this.scale * scaleChange, this.minScale),
        this.maxScale
      );

      this.element.style.transform = `scale(${this.scale})`;
      this.initialDistance = currentDistance;
    }
  }

  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
}

// Initialize on skill tree
const skillTreeCanvas = document.querySelector('.skill-tree-canvas');
new PinchZoom(skillTreeCanvas);
```

---

## Mobile-Specific UI Patterns

### Bottom Sheet for Skill Details

```html
<!-- Mobile Bottom Sheet -->
<div class="skill-detail-bottom-sheet">
  <div class="bottom-sheet-handle"></div>
  <div class="bottom-sheet-content">
    <!-- Skill details here -->
  </div>
</div>
```

```css
.skill-detail-bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-shadow-900);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.6);
  max-height: 70vh;
  transform: translateY(100%);
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  z-index: var(--z-modal);
}

.skill-detail-bottom-sheet.active {
  transform: translateY(0);
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  background: var(--color-shadow-600);
  border-radius: 2px;
  margin: 12px auto 8px;
  cursor: grab;
}
```

```javascript
class BottomSheet {
  constructor(element) {
    this.element = element;
    this.handle = element.querySelector('.bottom-sheet-handle');
    this.startY = 0;
    this.currentY = 0;
    this.isDragging = false;

    this.handle.addEventListener('touchstart', this.onDragStart.bind(this));
    this.handle.addEventListener('touchmove', this.onDragMove.bind(this));
    this.handle.addEventListener('touchend', this.onDragEnd.bind(this));
  }

  onDragStart(e) {
    this.startY = e.touches[0].clientY;
    this.isDragging = true;
  }

  onDragMove(e) {
    if (!this.isDragging) return;

    this.currentY = e.touches[0].clientY;
    const deltaY = this.currentY - this.startY;

    if (deltaY > 0) { // Only allow dragging down
      this.element.style.transform = `translateY(${deltaY}px)`;
    }
  }

  onDragEnd(e) {
    if (!this.isDragging) return;
    this.isDragging = false;

    const deltaY = this.currentY - this.startY;

    if (deltaY > 100) { // Threshold to close
      this.close();
    } else {
      this.element.style.transform = 'translateY(0)';
    }
  }

  open() {
    this.element.classList.add('active');
  }

  close() {
    this.element.classList.remove('active');
    this.element.style.transform = '';
  }
}
```

### Floating Action Button (FAB)

```html
<button class="fab fab--skills" aria-label="Open Skills">
  ⚔️
</button>
```

```css
.fab {
  position: fixed;
  bottom: 80px; /* Above action bar */
  right: 20px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-arcane-600), var(--color-arcane-500));
  color: white;
  font-size: 24px;
  border: none;
  box-shadow: 0 4px 12px rgba(139, 31, 255, 0.4);
  cursor: pointer;
  z-index: var(--z-sticky);
  display: none;
}

@media (max-width: 768px) {
  .fab {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.fab:active {
  transform: scale(0.95);
}
```

### Swipeable Tabs

```javascript
class SwipeableTabs {
  constructor(tabsContainer) {
    this.container = tabsContainer;
    this.tabs = Array.from(tabsContainer.querySelectorAll('.tab-btn'));
    this.contents = Array.from(document.querySelectorAll('.tab-content'));
    this.currentIndex = 0;
    this.startX = 0;

    this.container.addEventListener('touchstart', this.onSwipeStart.bind(this));
    this.container.addEventListener('touchmove', this.onSwipeMove.bind(this));
    this.container.addEventListener('touchend', this.onSwipeEnd.bind(this));
  }

  onSwipeStart(e) {
    this.startX = e.touches[0].clientX;
  }

  onSwipeMove(e) {
    // Visual feedback during swipe
  }

  onSwipeEnd(e) {
    const endX = e.changedTouches[0].clientX;
    const diff = this.startX - endX;

    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0 && this.currentIndex < this.tabs.length - 1) {
        // Swipe left - next tab
        this.switchTab(this.currentIndex + 1);
      } else if (diff < 0 && this.currentIndex > 0) {
        // Swipe right - previous tab
        this.switchTab(this.currentIndex - 1);
      }
    }
  }

  switchTab(index) {
    this.currentIndex = index;

    this.tabs.forEach((tab, i) => {
      tab.classList.toggle('active', i === index);
    });

    this.contents.forEach((content, i) => {
      content.classList.toggle('active', i === index);
    });
  }
}
```

---

## Performance Optimizations

### Lazy Loading Images/Icons

```javascript
// Use Intersection Observer for ability cards
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card = entry.target;
      // Load high-res icon or details
      loadAbilityDetails(card);
      imageObserver.unobserve(card);
    }
  });
});

document.querySelectorAll('.ability-card').forEach(card => {
  imageObserver.observe(card);
});
```

### Throttle Touch Events

```javascript
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

// Usage
element.addEventListener('touchmove', throttle((e) => {
  handleTouchMove(e);
}, 16)); // ~60fps
```

### Virtualized Scrolling for Large Lists

```javascript
// For ability lists with 100+ items
class VirtualScroller {
  constructor(container, items, renderItem) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = 80;
    this.visibleCount = Math.ceil(container.offsetHeight / this.itemHeight) + 2;

    this.render();
  }

  render() {
    const scrollTop = this.container.scrollTop;
    const startIndex = Math.floor(scrollTop / this.itemHeight);
    const endIndex = startIndex + this.visibleCount;

    const visibleItems = this.items.slice(startIndex, endIndex);

    this.container.innerHTML = '';
    visibleItems.forEach((item, i) => {
      const element = this.renderItem(item);
      element.style.transform = `translateY(${(startIndex + i) * this.itemHeight}px)`;
      this.container.appendChild(element);
    });
  }
}
```

---

## Testing Guidelines

### Device Testing Matrix

| Device Type | Min Specs | Test Scenarios |
|-------------|-----------|----------------|
| iPhone SE (2020) | iOS 14, A13 | Portrait, small screen |
| iPhone 13 Pro | iOS 15, A15 | Portrait/landscape, 120Hz |
| Samsung Galaxy S21 | Android 11 | Portrait/landscape |
| iPad Air | iPadOS 15 | Split-screen, multitasking |
| Budget Android | Android 10, 4GB RAM | Performance baseline |

### Touch Target Testing

```javascript
// Test touch target sizes
function checkTouchTargets() {
  const minSize = 44;
  const interactive = document.querySelectorAll('button, a, .clickable, .skill-node, .action-slot');

  interactive.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.width < minSize || rect.height < minSize) {
      console.warn('Touch target too small:', el, `${rect.width}x${rect.height}`);
    }
  });
}
```

### Performance Monitoring

```javascript
// Monitor scroll performance
let lastScrollTime = performance.now();

window.addEventListener('scroll', () => {
  const currentTime = performance.now();
  const deltaTime = currentTime - lastScrollTime;

  if (deltaTime > 16.67) {
    console.warn('Scroll jank detected:', deltaTime, 'ms');
  }

  lastScrollTime = currentTime;
}, { passive: true });
```

---

## Accessibility on Mobile

### Voice Control Support

```html
<!-- Add voice command labels -->
<button aria-label="Activate fireball ability, hotkey 2">
  🔥 Fireball
</button>
```

### Screen Reader Announcements

```javascript
// Announce ability activation
function announceAbilityActivation(abilityName) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `${abilityName} activated`;

  document.body.appendChild(announcement);

  setTimeout(() => announcement.remove(), 1000);
}
```

### High Contrast Support

```css
@media (prefers-contrast: high) {
  .skill-node,
  .ability-card,
  .action-slot {
    border-width: 3px;
  }

  .tree-connection {
    stroke-width: 5px;
  }

  /* Ensure text contrast */
  .skill-node-name,
  .ability-card-name {
    text-shadow: 0 0 4px rgba(0, 0, 0, 0.9);
  }
}
```

---

## Checklist for Mobile Launch

- [ ] All touch targets meet 44px minimum
- [ ] Drag-and-drop works on touch devices
- [ ] Long press interactions implemented
- [ ] Swipe gestures functional
- [ ] Pinch zoom on skill tree working
- [ ] Bottom sheets for details implemented
- [ ] Action bar scrollable on small screens
- [ ] FAB accessible with one hand
- [ ] Haptic feedback on supported devices
- [ ] Performance tested on low-end devices
- [ ] Landscape orientation supported
- [ ] iOS Safari tested (no 300ms tap delay)
- [ ] Android Chrome tested
- [ ] PWA installable
- [ ] Offline functionality (if applicable)
- [ ] Touch event throttling optimized
- [ ] Virtual scrolling for long lists
- [ ] Accessibility tested with screen readers
- [ ] High contrast mode supported

---

**Document Version:** 1.0
**Last Updated:** 2025-11-15
**Author:** UI/UX Design System Architect
**Project:** The Arcane Codex
