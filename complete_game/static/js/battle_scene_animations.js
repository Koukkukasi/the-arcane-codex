/**
 * THE ARCANE CODEX - Battle Scene Animation System
 * Creates dramatic visual introductions for combat and major story moments
 */

class BattleSceneAnimator {
    constructor() {
        this.animationContainer = null;
        this.currentAnimation = null;
        this.activeParticles = [];
        this.animationInProgress = false;
    }

    /**
     * Sanitize HTML to prevent XSS attacks
     * @param {string} text - Text to sanitize
     * @returns {string} - Safe HTML
     */
    sanitizeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Clean up all animation resources
     */
    cleanup() {
        if (this.animationContainer) {
            this.animationContainer.innerHTML = '';
            this.animationContainer.style.display = 'none';
        }
        this.activeParticles = [];
        this.currentAnimation = null;
        this.animationInProgress = false;
    }

    /**
     * Initialize the animation container
     */
    init() {
        if (!this.animationContainer) {
            this.animationContainer = document.createElement('div');
            this.animationContainer.id = 'battle-scene-overlay';
            this.animationContainer.className = 'battle-scene-overlay';
            document.body.appendChild(this.animationContainer);
        }
    }

    /**
     * BATTLE INTRO: Dramatic flash and reveal
     * @param {Object} options - Configuration for battle intro
     * @param {string} options.enemyName - Name of enemy/encounter
     * @param {string} options.enemyIcon - Emoji or icon for enemy
     * @param {string} options.flavorText - Dramatic text (e.g., "A shadow emerges!")
     * @param {Function} options.onComplete - Callback when animation finishes
     */
    async playBattleIntro(options = {}) {
        if (this.animationInProgress) {
            console.warn('Animation already in progress');
            return;
        }

        try {
            this.animationInProgress = true;

            const {
                enemyName = 'Unknown Threat',
                enemyIcon = '⚔️',
                flavorText = 'Combat begins!',
                battleType = 'normal', // 'normal', 'boss', 'ambush'
                onComplete = () => {}
            } = options;

            // Sanitize all user-provided text
            const safeEnemyName = this.sanitizeHTML(enemyName);
            const safeEnemyIcon = this.sanitizeHTML(enemyIcon);
            const safeFlavorText = this.sanitizeHTML(flavorText);
            const safeBattleType = ['normal', 'boss', 'ambush'].includes(battleType) ? battleType : 'normal';

            this.init();

            // Create animation HTML
            const animationHTML = `
                <div class="battle-intro-sequence ${safeBattleType}">
                    <!-- Flash of light -->
                    <div class="flash-overlay"></div>

                    <!-- Screen crack/shatter effect -->
                    <div class="screen-crack">
                        <svg class="crack-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                            <path class="crack-line crack-1" d="M50,0 L50,100" stroke="#fff" stroke-width="0.5" opacity="0"/>
                            <path class="crack-line crack-2" d="M50,50 L0,25" stroke="#fff" stroke-width="0.3" opacity="0"/>
                            <path class="crack-line crack-3" d="M50,50 L100,25" stroke="#fff" stroke-width="0.3" opacity="0"/>
                            <path class="crack-line crack-4" d="M50,50 L0,75" stroke="#fff" stroke-width="0.3" opacity="0"/>
                            <path class="crack-line crack-5" d="M50,50 L100,75" stroke="#fff" stroke-width="0.3" opacity="0"/>
                        </svg>
                    </div>

                    <!-- Enemy reveal -->
                    <div class="enemy-reveal">
                        <div class="enemy-silhouette">
                            <div class="enemy-icon">${safeEnemyIcon}</div>
                            <div class="enemy-glow"></div>
                        </div>
                        <h1 class="enemy-name">${safeEnemyName}</h1>
                        <p class="flavor-text">${safeFlavorText}</p>
                    </div>

                    <!-- Battle ready indicator -->
                    <div class="battle-ready">
                        <div class="crossed-swords">⚔️</div>
                        <div class="ready-text">PREPARE FOR BATTLE</div>
                    </div>

                    <!-- Particle effects -->
                    <div class="battle-particles"></div>
                </div>
            `;

            this.animationContainer.innerHTML = animationHTML;
            this.animationContainer.style.display = 'block';

            // Add particles
            this.spawnBattleParticles();

            // Sequence timing
            await this.sleep(100);
            this.playFlash();

            await this.sleep(300);
            this.playScreenCrack();

            await this.sleep(600);
            this.playEnemyReveal(safeBattleType);

            await this.sleep(2000);
            this.playBattleReady();

            await this.sleep(1500);
            this.fadeOut(onComplete);
        } catch (error) {
            console.error('Error in playBattleIntro:', error);
            this.cleanup();
            if (options.onComplete) options.onComplete();
        } finally {
            this.animationInProgress = false;
        }
    }

    /**
     * LOCATION TRANSITION: Moving to new area
     */
    async playLocationTransition(options = {}) {
        if (this.animationInProgress) {
            console.warn('Animation already in progress');
            return;
        }

        try {
            this.animationInProgress = true;

            const {
                locationName = 'Unknown Location',
                locationIcon = '🏛️',
                description = 'You arrive at a new location...',
                onComplete = () => {}
            } = options;

            // Sanitize all user-provided text
            const safeLocationName = this.sanitizeHTML(locationName);
            const safeLocationIcon = this.sanitizeHTML(locationIcon);
            const safeDescription = this.sanitizeHTML(description);

            this.init();

            const animationHTML = `
                <div class="location-transition-sequence">
                    <div class="location-fade"></div>
                    <div class="location-reveal">
                        <div class="location-icon">${safeLocationIcon}</div>
                        <h1 class="location-name">${safeLocationName}</h1>
                        <p class="location-description">${safeDescription}</p>
                    </div>
                    <div class="location-particles"></div>
                </div>
            `;

            this.animationContainer.innerHTML = animationHTML;
            this.animationContainer.style.display = 'block';

            this.spawnLocationParticles();

            await this.sleep(2500);
            this.fadeOut(onComplete);
        } catch (error) {
            console.error('Error in playLocationTransition:', error);
            this.cleanup();
            if (options.onComplete) options.onComplete();
        } finally {
            this.animationInProgress = false;
        }
    }

    /**
     * DIVINE INTERVENTION: God appears/speaks
     */
    async playDivineIntervention(options = {}) {
        if (this.animationInProgress) {
            console.warn('Animation already in progress');
            return;
        }

        try {
            this.animationInProgress = true;

            const {
                godName = 'VALDRIS',
                godColor = '#D4AF37',
                godSymbol = null, // Path to god SVG
                message = 'The gods are watching...',
                onComplete = () => {}
            } = options;

            // Sanitize all user-provided text
            const safeGodName = this.sanitizeHTML(godName);
            const safeMessage = this.sanitizeHTML(message);

            // Validate color (hex only)
            const safeGodColor = /^#[0-9A-Fa-f]{6}$/.test(godColor) ? godColor : '#D4AF37';

            // Validate SVG path (basic validation)
            const safeGodSymbol = godSymbol && typeof godSymbol === 'string' && godSymbol.startsWith('/images/')
                ? godSymbol
                : null;

            this.init();

            const symbolHTML = safeGodSymbol
                ? `<img src="${safeGodSymbol}" class="god-symbol-large" style="color: ${safeGodColor}" alt="${safeGodName}">`
                : `<div class="god-symbol-placeholder" style="color: ${safeGodColor}">✦</div>`;

            const animationHTML = `
                <div class="divine-intervention-sequence">
                    <div class="divine-light" style="background: radial-gradient(circle, ${safeGodColor}33, transparent 70%)"></div>
                    <div class="divine-reveal">
                        ${symbolHTML}
                        <h1 class="god-title" style="color: ${safeGodColor}">${safeGodName}</h1>
                        <p class="divine-message">${safeMessage}</p>
                    </div>
                    <div class="divine-rays"></div>
                </div>
            `;

            this.animationContainer.innerHTML = animationHTML;
            this.animationContainer.style.display = 'block';

            this.spawnDivineParticles(safeGodColor);

            await this.sleep(3000);
            this.fadeOut(onComplete);
        } catch (error) {
            console.error('Error in playDivineIntervention:', error);
            this.cleanup();
            if (options.onComplete) options.onComplete();
        } finally {
            this.animationInProgress = false;
        }
    }

    /**
     * CRITICAL MOMENT: Betrayal, discovery, revelation
     */
    async playCriticalMoment(options = {}) {
        if (this.animationInProgress) {
            console.warn('Animation already in progress');
            return;
        }

        try {
            this.animationInProgress = true;

            const {
                title = 'CRITICAL MOMENT',
                icon = '⚠️',
                color = '#FF0000',
                message = 'Something significant has occurred!',
                onComplete = () => {}
            } = options;

            // Sanitize all user-provided text
            const safeTitle = this.sanitizeHTML(title);
            const safeIcon = this.sanitizeHTML(icon);
            const safeMessage = this.sanitizeHTML(message);

            // Validate color (hex only)
            const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#FF0000';

            this.init();

            const animationHTML = `
                <div class="critical-moment-sequence">
                    <div class="critical-flash" style="background-color: ${safeColor}55"></div>
                    <div class="critical-impact">
                        <div class="impact-icon" style="color: ${safeColor}">${safeIcon}</div>
                        <h1 class="impact-title" style="color: ${safeColor}">${safeTitle}</h1>
                        <p class="impact-message">${safeMessage}</p>
                    </div>
                    <div class="screen-shake"></div>
                </div>
            `;

            this.animationContainer.innerHTML = animationHTML;
            this.animationContainer.style.display = 'block';

            // Trigger screen shake
            document.body.classList.add('screen-shake-active');
            await this.sleep(500);
            document.body.classList.remove('screen-shake-active');

            await this.sleep(2500);
            this.fadeOut(onComplete);
        } catch (error) {
            console.error('Error in playCriticalMoment:', error);
            this.cleanup();
            if (options.onComplete) options.onComplete();
        } finally {
            this.animationInProgress = false;
        }
    }

    // === ANIMATION HELPERS ===

    playFlash() {
        const flash = this.animationContainer.querySelector('.flash-overlay');
        if (flash) {
            flash.style.animation = 'flashBurst 0.5s ease-out';
        }
    }

    playScreenCrack() {
        const cracks = this.animationContainer.querySelectorAll('.crack-line');
        cracks.forEach((crack, index) => {
            setTimeout(() => {
                crack.style.opacity = '1';
                crack.style.animation = 'crackAppear 0.4s ease-out forwards';
            }, index * 100);
        });
    }

    playEnemyReveal(battleType) {
        const enemyReveal = this.animationContainer.querySelector('.enemy-reveal');
        if (enemyReveal) {
            enemyReveal.style.display = 'flex';
            enemyReveal.style.animation = battleType === 'boss'
                ? 'enemyRevealBoss 1.5s ease-out'
                : 'enemyReveal 1s ease-out';
        }
    }

    playBattleReady() {
        const battleReady = this.animationContainer.querySelector('.battle-ready');
        if (battleReady) {
            battleReady.style.display = 'flex';
            battleReady.style.animation = 'battleReady 0.8s ease-out';
        }
    }

    fadeOut(callback) {
        this.animationContainer.style.animation = 'fadeOutOverlay 1s ease-out forwards';
        setTimeout(() => {
            this.animationContainer.style.display = 'none';
            this.animationContainer.innerHTML = '';
            if (callback) callback();
        }, 1000);
    }

    spawnBattleParticles() {
        const container = this.animationContainer.querySelector('.battle-particles');
        if (!container) return;

        // Respect reduced motion preferences
        const particleCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 5 : 30;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'battle-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            particle.style.animationDuration = `${2 + Math.random() * 2}s`;
            container.appendChild(particle);
            this.activeParticles.push(particle);
        }
    }

    spawnLocationParticles() {
        const container = this.animationContainer.querySelector('.location-particles');
        if (!container) return;

        // Respect reduced motion preferences
        const particleCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 5 : 20;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'location-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.animationDelay = `${Math.random() * 3}s`;
            container.appendChild(particle);
            this.activeParticles.push(particle);
        }
    }

    spawnDivineParticles(color) {
        const container = this.animationContainer.querySelector('.divine-intervention-sequence');
        if (!container) return;

        // Validate color again for safety
        const safeColor = /^#[0-9A-Fa-f]{6}$/.test(color) ? color : '#D4AF37';

        // Respect reduced motion preferences
        const particleCount = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 10 : 40;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'divine-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.background = safeColor;
            particle.style.animationDelay = `${Math.random() * 2}s`;
            container.appendChild(particle);
            this.activeParticles.push(particle);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Single global namespace to avoid pollution
if (typeof window.ArcaneCodex === 'undefined') {
    window.ArcaneCodex = {};
}

// Initialize the animator instance
window.ArcaneCodex.battleAnimator = new BattleSceneAnimator();

// Convenience API under single namespace
window.ArcaneCodex.animations = {
    playBattleIntro: (options) => window.ArcaneCodex.battleAnimator.playBattleIntro(options),
    playLocationTransition: (options) => window.ArcaneCodex.battleAnimator.playLocationTransition(options),
    playDivineIntervention: (options) => window.ArcaneCodex.battleAnimator.playDivineIntervention(options),
    playCriticalMoment: (options) => window.ArcaneCodex.battleAnimator.playCriticalMoment(options),
    cleanup: () => window.ArcaneCodex.battleAnimator.cleanup()
};
