/**
 * THE ARCANE CODEX - Dynamic Particle System
 * Creates floating mystical particles, dust effects, and animated runes
 */

class ArcaneParticleSystem {
  constructor(containerId = 'arcane-particle-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      this.container.className = 'arcane-particles';
      this.container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;';
      document.body.appendChild(this.container);
    }
    this.particles = [];
    this.runes = [];
  }

  /**
   * Add floating golden/purple particles
   */
  addFloatingParticles(count = 20) {
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';

      // Random position
      particle.style.left = `${Math.random() * 100}%`;

      // Random color (gold or purple)
      const colors = [
        { color: 'rgba(212, 175, 55, 0.8)', shadow: 'rgba(212, 175, 55, 0.6)' },
        { color: 'rgba(139, 92, 246, 0.8)', shadow: 'rgba(139, 92, 246, 0.6)' },
        { color: 'rgba(59, 130, 246, 0.8)', shadow: 'rgba(59, 130, 246, 0.6)' }
      ];
      const colorSet = colors[Math.floor(Math.random() * colors.length)];

      particle.style.background = `radial-gradient(circle, ${colorSet.color} 0%, transparent 70%)`;
      particle.style.boxShadow = `0 0 8px ${colorSet.shadow}`;

      // Random animation delay and duration
      particle.style.animationDelay = `${Math.random() * 10}s`;
      particle.style.animationDuration = `${12 + Math.random() * 8}s`;

      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  /**
   * Add floating rune symbols
   */
  addFloatingRunes(count = 5) {
    const runeFiles = [
      'static/images/rune_symbol_1.svg',
      'static/images/rune_symbol_2.svg',
      'static/images/rune_symbol_3.svg'
    ];

    for (let i = 0; i < count; i++) {
      const rune = document.createElement('img');
      rune.className = 'floating-rune';
      rune.src = runeFiles[Math.floor(Math.random() * runeFiles.length)];
      rune.style.left = `${Math.random() * 90 + 5}%`;
      rune.style.animationDelay = `${Math.random() * 20}s`;
      rune.style.animationDuration = `${18 + Math.random() * 10}s`;

      this.container.appendChild(rune);
      this.runes.push(rune);
    }
  }

  /**
   * Create a burst of mystical dust particles at a specific position
   */
  createDustBurst(x, y, count = 20) {
    for (let i = 0; i < count; i++) {
      const dust = document.createElement('div');
      dust.className = 'mystical-dust';

      // Position at click/touch location
      dust.style.left = `${x}px`;
      dust.style.top = `${y}px`;

      // Random movement direction
      const angle = (Math.PI * 2 * i) / count;
      const distance = 50 + Math.random() * 100;
      const dustX = Math.cos(angle) * distance;
      const dustY = Math.sin(angle) * distance;

      dust.style.setProperty('--dust-x', `${dustX}px`);
      dust.style.setProperty('--dust-y', `${dustY}px`);

      // Random delay
      dust.style.animationDelay = `${Math.random() * 0.3}s`;

      this.container.appendChild(dust);

      // Remove after animation
      setTimeout(() => {
        dust.remove();
      }, 8000);
    }
  }

  /**
   * Initialize interactive dust effects on clicks/touches
   */
  enableInteractiveDust() {
    document.addEventListener('click', (e) => {
      this.createDustBurst(e.clientX, e.clientY, 15);
    });

    document.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      this.createDustBurst(touch.clientX, touch.clientY, 15);
    });
  }

  /**
   * Clear all particles
   */
  clear() {
    this.particles.forEach(p => p.remove());
    this.runes.forEach(r => r.remove());
    this.particles = [];
    this.runes = [];
  }

  /**
   * Initialize full particle system
   */
  init(options = {}) {
    const {
      floatingParticles = 20,
      floatingRunes = 5,
      interactive = true
    } = options;

    this.addFloatingParticles(floatingParticles);
    this.addFloatingRunes(floatingRunes);

    if (interactive) {
      this.enableInteractiveDust();
    }
  }
}

/**
 * Divine Symbol Rotation Controller
 */
class DivineSymbolController {
  constructor(symbolElement) {
    this.symbol = symbolElement;
    this.rotation = 0;
    this.isHovering = false;
    this.speed = 0.2; // degrees per frame
    this.hoverSpeed = 1.5;

    if (this.symbol) {
      this.symbol.addEventListener('mouseenter', () => this.isHovering = true);
      this.symbol.addEventListener('mouseleave', () => this.isHovering = false);
      this.animate();
    }
  }

  animate() {
    const currentSpeed = this.isHovering ? this.hoverSpeed : this.speed;
    this.rotation += currentSpeed;

    if (this.symbol) {
      this.symbol.style.transform = `rotate(${this.rotation}deg)`;
    }

    requestAnimationFrame(() => this.animate());
  }
}

/**
 * God Icon Pulse Effect
 */
class GodIconEffects {
  constructor() {
    this.icons = document.querySelectorAll('.god-icon');
    this.attachHoverEffects();
  }

  attachHoverEffects() {
    this.icons.forEach((icon) => {
      icon.addEventListener('mouseenter', (e) => {
        this.createAura(e.target);
      });
    });
  }

  createAura(iconElement) {
    const aura = document.createElement('div');
    aura.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 100px;
      height: 100px;
      margin: -50px 0 0 -50px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(212, 175, 55, 0.4) 0%, transparent 70%);
      pointer-events: none;
      z-index: -1;
      animation: auraExpand 0.6s ease-out forwards;
    `;

    // Position relative to icon
    iconElement.parentElement.style.position = 'relative';
    iconElement.parentElement.appendChild(aura);

    setTimeout(() => aura.remove(), 600);
  }
}

// Add aura animation to document
const style = document.createElement('style');
style.textContent = `
  @keyframes auraExpand {
    from {
      transform: scale(0.5);
      opacity: 1;
    }
    to {
      transform: scale(2);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

/**
 * Auto-initialize when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  // Check if user prefers reduced motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    // Initialize particle system
    const particleSystem = new ArcaneParticleSystem();
    particleSystem.init({
      floatingParticles: 15,
      floatingRunes: 4,
      interactive: true
    });

    // Initialize divine symbol rotation
    const divineSymbol = document.querySelector('.divine-symbol');
    if (divineSymbol) {
      new DivineSymbolController(divineSymbol);
    }

    // Initialize god icon effects
    new GodIconEffects();
  }
});

// Export for manual usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    ArcaneParticleSystem,
    DivineSymbolController,
    GodIconEffects
  };
}
