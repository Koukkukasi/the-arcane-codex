/**
 * Character Sheet Overlay System
 * The Arcane Codex - Phase 3
 *
 * Manages character stats, divine favor, abilities, and achievements display
 */

class CharacterOverlaySystem {
    constructor() {
        this.overlay = null;
        this.isOpen = false;
        this.canvas = null;
        this.ctx = null;

        // Character data structure
        this.characterData = {
            name: 'Brave Adventurer',
            class: 'Warrior',
            classIcon: '🗡️',
            portrait: '⚔️',
            level: 1,
            currentXP: 0,
            maxXP: 100,
            title: 'Novice Explorer',

            stats: {
                strength: 10,
                dexterity: 10,
                constitution: 10,
                intelligence: 10,
                wisdom: 10,
                charisma: 10
            },

            divineFavor: {
                valdris: 0,    // War god
                kaitha: 0,     // Moon goddess
                morvane: 0,    // Death god
                sylara: 0,     // Nature goddess
                korvan: 0,     // Forge god
                athena: 0,     // Wisdom goddess
                mercus: 0      // Commerce god
            },

            abilities: [
                { id: 'basic_attack', name: 'Basic Attack', description: 'A simple weapon strike', icon: '🗡️', unlocked: true, cooldown: 0 },
                { id: 'defensive_stance', name: 'Defensive Stance', description: 'Reduce incoming damage', icon: '🛡️', unlocked: true, cooldown: 0 },
                { id: 'power_strike', name: 'Power Strike', description: 'Powerful attack with knockback', icon: '⚡', unlocked: false, requiredLevel: 5 },
                { id: 'whirlwind', name: 'Whirlwind', description: 'Spin attack hitting all enemies', icon: '🌪️', unlocked: false, requiredLevel: 10 },
                { id: 'battle_cry', name: 'Battle Cry', description: 'Buff allies and intimidate foes', icon: '📢', unlocked: false, requiredLevel: 15 },
                { id: 'berserker_rage', name: 'Berserker Rage', description: 'Enter a state of fury', icon: '🔥', unlocked: false, requiredLevel: 20 }
            ],

            achievements: [
                { id: 'first_steps', name: 'First Steps', icon: '🎯', earned: true },
                { id: 'monster_slayer', name: 'Monster Slayer', icon: '⚔️', earned: true },
                { id: 'castle_defender', name: 'Castle Defender', icon: '🏰', earned: false },
                { id: 'dragon_hunter', name: 'Dragon Hunter', icon: '🐉', earned: false },
                { id: 'realm_savior', name: 'Realm Savior', icon: '👑', earned: false },
                { id: 'legendary_hero', name: 'Legendary Hero', icon: '✨', earned: false }
            ]
        };

        // God colors for radial chart
        this.godColors = {
            valdris: '#dc2626',
            kaitha: '#6366f1',
            morvane: '#7c3aed',
            sylara: '#10b981',
            korvan: '#f97316',
            athena: '#06b6d4',
            mercus: '#facc15'
        };

        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupOverlay());
        } else {
            this.setupOverlay();
        }
    }

    setupOverlay() {
        // Check if overlay HTML exists, if not inject it
        if (!document.getElementById('characterOverlay')) {
            this.injectOverlayHTML();
        }

        this.overlay = document.getElementById('characterOverlay');
        if (!this.overlay) return;

        this.canvas = document.getElementById('favorRadialChart');
        if (this.canvas) {
            this.ctx = this.canvas.getContext('2d');
        }

        this.bindEvents();
        this.updateDisplay();
    }

    injectOverlayHTML() {
        // Fetch and inject the overlay HTML if needed
        fetch('/static/overlays/character_overlay.html')
            .then(response => response.text())
            .then(html => {
                const div = document.createElement('div');
                div.innerHTML = html;
                document.body.appendChild(div.firstElementChild);
                this.setupOverlay();
            })
            .catch(err => console.error('Failed to load character overlay:', err));
    }

    bindEvents() {
        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'c' && !this.isTyping()) {
                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close button and backdrop clicks
        const closeElements = this.overlay.querySelectorAll('[data-close-overlay]');
        closeElements.forEach(element => {
            element.addEventListener('click', () => this.close());
        });

        // Character button in UI (if exists)
        const characterButton = document.querySelector('[data-open-character]');
        if (characterButton) {
            characterButton.addEventListener('click', () => this.open());
        }

        // Stat card hover effects
        this.setupStatCardTooltips();
    }

    setupStatCardTooltips() {
        const statCards = this.overlay.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const tooltip = card.querySelector('.stat-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '1';
                    tooltip.style.visibility = 'visible';
                }
            });

            card.addEventListener('mouseleave', () => {
                const tooltip = card.querySelector('.stat-tooltip');
                if (tooltip) {
                    tooltip.style.opacity = '0';
                    tooltip.style.visibility = 'hidden';
                }
            });
        });
    }

    isTyping() {
        const activeElement = document.activeElement;
        return activeElement && (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.contentEditable === 'true'
        );
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        if (!this.overlay || this.isOpen) return;

        this.isOpen = true;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Update data and render
        this.updateDisplay();
        this.drawRadialChart();

        // Trigger animations
        this.animateEntry();

        // Dispatch event
        window.dispatchEvent(new CustomEvent('characterOverlayOpened'));
    }

    close() {
        if (!this.overlay || !this.isOpen) return;

        this.isOpen = false;
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';

        // Dispatch event
        window.dispatchEvent(new CustomEvent('characterOverlayClosed'));
    }

    updateDisplay() {
        if (!this.overlay) return;

        // Update character info
        this.updateElement('[data-character-name]', this.characterData.name);
        this.updateElement('[data-character-class] .class-name', this.characterData.class);
        this.updateElement('[data-character-class] .class-icon', this.characterData.classIcon);
        this.updateElement('[data-character-portrait] .portrait-emoji', this.characterData.portrait);
        this.updateElement('[data-level]', this.characterData.level);
        this.updateElement('[data-character-title]', this.characterData.title);

        // Update XP bar
        this.updateXPBar();

        // Update stats
        this.updateStats();

        // Update divine favor
        this.updateDivineFavor();

        // Update abilities
        this.updateAbilities();

        // Update achievements
        this.updateAchievements();
    }

    updateElement(selector, value) {
        const element = this.overlay.querySelector(selector);
        if (element) {
            element.textContent = value;
        }
    }

    updateXPBar() {
        const currentXP = this.characterData.currentXP;
        const maxXP = this.characterData.maxXP;
        const percentage = (currentXP / maxXP) * 100;

        this.updateElement('[data-current-xp]', currentXP);
        this.updateElement('[data-max-xp]', maxXP);

        const xpFill = this.overlay.querySelector('[data-xp-fill]');
        if (xpFill) {
            xpFill.style.width = `${percentage}%`;
        }
    }

    updateStats() {
        Object.entries(this.characterData.stats).forEach(([stat, value]) => {
            const modifier = Math.floor((value - 10) / 2);
            const modifierText = modifier >= 0 ? `+${modifier}` : `${modifier}`;

            this.updateElement(`[data-stat-value="${stat}"]`, value);

            const modifierElement = this.overlay.querySelector(`[data-stat-modifier="${stat}"]`);
            if (modifierElement) {
                modifierElement.textContent = modifierText;
                modifierElement.setAttribute('data-negative', modifier < 0);
            }
        });
    }

    updateDivineFavor() {
        const maxFavor = 100; // Maximum favor per god
        let totalFavor = 0;

        Object.entries(this.characterData.divineFavor).forEach(([god, favor]) => {
            totalFavor += favor;
            const percentage = (favor / maxFavor) * 100;

            // Update bar
            const barFill = this.overlay.querySelector(`[data-favor-fill="${god}"]`);
            if (barFill) {
                barFill.style.width = `${percentage}%`;
            }

            // Update value
            this.updateElement(`[data-favor-value="${god}"]`, favor);
        });

        // Update total
        this.updateElement('[data-favor-total]', totalFavor);
    }

    drawRadialChart() {
        if (!this.canvas || !this.ctx) return;

        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 100;
        const innerRadius = 60;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Calculate angles
        const gods = Object.keys(this.characterData.divineFavor);
        const angleStep = (Math.PI * 2) / gods.length;
        let currentAngle = -Math.PI / 2; // Start at top

        // Draw segments
        gods.forEach((god, index) => {
            const favor = this.characterData.divineFavor[god];
            const maxFavor = 100;
            const favorRadius = innerRadius + ((radius - innerRadius) * (favor / maxFavor));

            // Draw segment background
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angleStep);
            this.ctx.arc(centerX, centerY, innerRadius, currentAngle + angleStep, currentAngle, true);
            this.ctx.closePath();
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.fill();
            this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.stroke();

            // Draw favor fill
            if (favor > 0) {
                this.ctx.beginPath();
                this.ctx.arc(centerX, centerY, favorRadius, currentAngle, currentAngle + angleStep);
                this.ctx.arc(centerX, centerY, innerRadius, currentAngle + angleStep, currentAngle, true);
                this.ctx.closePath();

                // Create gradient
                const gradient = this.ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, radius);
                gradient.addColorStop(0, this.godColors[god] + '80');
                gradient.addColorStop(1, this.godColors[god]);

                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }

            currentAngle += angleStep;
        });

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, innerRadius - 2, 0, Math.PI * 2);
        this.ctx.fillStyle = '#1e1b3a';
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    updateAbilities() {
        const container = this.overlay.querySelector('[data-abilities-grid]');
        if (!container) return;

        container.innerHTML = '';

        this.characterData.abilities.forEach(ability => {
            const card = document.createElement('div');
            card.className = 'ability-card';

            if (!ability.unlocked) {
                card.classList.add('locked');
            }

            card.innerHTML = `
                <div class="ability-icon">${ability.unlocked ? ability.icon : '🔒'}</div>
                <div class="ability-info">
                    <h3 class="ability-name">${ability.name}</h3>
                    <p class="ability-description">${ability.unlocked ? ability.description : `Reach level ${ability.requiredLevel} to unlock`}</p>
                </div>
                <div class="ability-cooldown">${ability.unlocked ? 'Ready' : 'Locked'}</div>
            `;

            container.appendChild(card);
        });
    }

    updateAchievements() {
        const container = this.overlay.querySelector('[data-achievements-grid]');
        if (!container) return;

        container.innerHTML = '';

        this.characterData.achievements.forEach(achievement => {
            const badge = document.createElement('div');
            badge.className = 'achievement-badge';

            if (achievement.earned) {
                badge.classList.add('earned');
            }

            badge.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
            `;

            container.appendChild(badge);
        });
    }

    animateEntry() {
        // XP bar animation
        const xpFill = this.overlay.querySelector('[data-xp-fill]');
        if (xpFill) {
            const targetWidth = xpFill.style.width;
            xpFill.style.width = '0%';
            setTimeout(() => {
                xpFill.style.width = targetWidth;
            }, 100);
        }

        // Favor bars animation
        const favorFills = this.overlay.querySelectorAll('[data-favor-fill]');
        favorFills.forEach((fill, index) => {
            const targetWidth = fill.style.width;
            fill.style.width = '0%';
            setTimeout(() => {
                fill.style.width = targetWidth;
            }, 100 + (index * 50));
        });
    }

    // Public API methods

    setCharacterData(data) {
        this.characterData = { ...this.characterData, ...data };
        this.updateDisplay();
        if (this.isOpen) {
            this.drawRadialChart();
        }
    }

    updateStat(stat, value) {
        if (this.characterData.stats.hasOwnProperty(stat)) {
            this.characterData.stats[stat] = value;
            this.updateStats();
        }
    }

    updateDivineFavorValue(god, value) {
        if (this.characterData.divineFavor.hasOwnProperty(god)) {
            this.characterData.divineFavor[god] = Math.max(0, Math.min(100, value));
            this.updateDivineFavor();
            if (this.isOpen) {
                this.drawRadialChart();
            }
        }
    }

    addDivineFavor(god, amount) {
        if (this.characterData.divineFavor.hasOwnProperty(god)) {
            this.updateDivineFavorValue(god, this.characterData.divineFavor[god] + amount);

            // Animate the change
            const favorItem = this.overlay.querySelector(`[data-god="${god}"]`);
            if (favorItem) {
                favorItem.classList.add('favor-gained');
                setTimeout(() => favorItem.classList.remove('favor-gained'), 500);
            }
        }
    }

    updateXP(current, max = null) {
        this.characterData.currentXP = current;
        if (max !== null) {
            this.characterData.maxXP = max;
        }
        this.updateXPBar();
    }

    levelUp(newLevel) {
        this.characterData.level = newLevel;
        this.updateElement('[data-level]', newLevel);

        // Check for newly unlocked abilities
        this.characterData.abilities.forEach(ability => {
            if (!ability.unlocked && ability.requiredLevel <= newLevel) {
                ability.unlocked = true;
            }
        });

        this.updateAbilities();

        // Trigger level up animation
        const levelBadge = this.overlay.querySelector('.level-badge');
        if (levelBadge) {
            levelBadge.classList.add('level-up-animation');
            setTimeout(() => levelBadge.classList.remove('level-up-animation'), 1000);
        }
    }

    unlockAchievement(achievementId) {
        const achievement = this.characterData.achievements.find(a => a.id === achievementId);
        if (achievement && !achievement.earned) {
            achievement.earned = true;
            this.updateAchievements();

            // Show notification
            this.showAchievementNotification(achievement);
        }
    }

    showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-notification-content">
                <span class="achievement-notification-icon">${achievement.icon}</span>
                <div class="achievement-notification-text">
                    <div class="achievement-notification-title">Achievement Unlocked!</div>
                    <div class="achievement-notification-name">${achievement.name}</div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Add achievement notification styles dynamically
const achievementStyles = `
<style>
.achievement-notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 16px 24px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 300ms cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.achievement-notification.show {
    transform: translateX(0);
}

.achievement-notification-content {
    display: flex;
    align-items: center;
    gap: 12px;
}

.achievement-notification-icon {
    font-size: 2rem;
}

.achievement-notification-text {
    display: flex;
    flex-direction: column;
}

.achievement-notification-title {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
}

.achievement-notification-name {
    font-size: 1.125rem;
    color: white;
    font-weight: bold;
}

.level-up-animation {
    animation: level-up-pulse 1s ease-in-out;
}

@keyframes level-up-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.5); box-shadow: 0 0 30px rgba(245, 158, 11, 0.8); }
    100% { transform: scale(1); }
}

.favor-gained {
    animation: favor-pulse 0.5s ease-in-out;
}

@keyframes favor-pulse {
    0% { background: var(--char-bg-secondary); }
    50% { background: rgba(245, 158, 11, 0.2); }
    100% { background: var(--char-bg-secondary); }
}
</style>
`;

// Inject additional styles
if (!document.querySelector('#achievement-notification-styles')) {
    const styleElement = document.createElement('div');
    styleElement.id = 'achievement-notification-styles';
    styleElement.innerHTML = achievementStyles;
    document.head.appendChild(styleElement.firstElementChild);
}

// Initialize the system
const characterOverlay = new CharacterOverlaySystem();

// Export for use in other modules
window.CharacterOverlaySystem = characterOverlay;

// Example usage for testing (remove in production)
if (window.location.href.includes('debug=true')) {
    // Test data
    setTimeout(() => {
        characterOverlay.setCharacterData({
            name: 'Aldric the Bold',
            class: 'Paladin',
            classIcon: '⚔️',
            level: 12,
            currentXP: 3750,
            maxXP: 5000,
            title: 'Champion of Light',
            stats: {
                strength: 18,
                dexterity: 12,
                constitution: 16,
                intelligence: 10,
                wisdom: 14,
                charisma: 15
            },
            divineFavor: {
                valdris: 75,
                kaitha: 30,
                morvane: 10,
                sylara: 45,
                korvan: 60,
                athena: 50,
                mercus: 25
            }
        });
    }, 1000);
}