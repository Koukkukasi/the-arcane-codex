/**
 * Skills Overlay - The Arcane Codex
 * ==================================
 * Interactive skill tree, ability management, and hotkey assignment
 *
 * Features:
 * - Skill point allocation system
 * - Drag-and-drop ability assignment
 * - Skill tree visualization with unlock requirements
 * - Action bar hotkey management (1-8)
 * - Skill tooltips with detailed information
 * - Class-specific skill trees
 */

class SkillsOverlay {
    constructor() {
        this.overlay = document.getElementById('skillsOverlay');
        this.isOpen = false;
        this.skillPoints = 5;
        this.playerLevel = 5;
        this.playerClass = 'Warrior';

        // Skill data
        this.skills = {
            'basic-combat': { level: 1, maxLevel: 1, unlocked: true },
            'power-strike': { level: 0, maxLevel: 3, unlocked: true, requires: 'basic-combat' },
            'defensive-stance': { level: 0, maxLevel: 3, unlocked: true, requires: 'basic-combat' },
            'whirlwind': { level: 0, maxLevel: 5, unlocked: false, requires: 'power-strike', requiredLevel: 10 },
            'shield-bash': { level: 0, maxLevel: 3, unlocked: false, requires: 'defensive-stance', requiredLevel: 8 },
            'first-aid': { level: 0, maxLevel: 3, unlocked: true },
            'meditation': { level: 0, maxLevel: 3, unlocked: false, requires: 'first-aid', requiredLevel: 6 },
            'vitality': { level: 0, maxLevel: 5, unlocked: true },
            'endurance': { level: 0, maxLevel: 5, unlocked: true }
        };

        // Action bar slots (1-8)
        this.actionBar = new Array(8).fill(null);

        // Drag state
        this.draggedAbility = null;

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.updateDisplay();
    }

    setupEventListeners() {
        // Close overlay handlers
        const closeButtons = this.overlay.querySelectorAll('[data-close-overlay]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.close());
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'k' || e.key === 'K') {
                if (!this.isOpen) {
                    this.open();
                } else {
                    this.close();
                }
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Skill node click handlers
        this.overlay.querySelectorAll('.skill-node.unlocked').forEach(node => {
            node.addEventListener('click', (e) => {
                const skillId = node.dataset.skill;
                this.showSkillTooltip(skillId, e);
            });
        });

        // Action slot click handlers for quick assignment
        this.overlay.querySelectorAll('.action-slot').forEach((slot, index) => {
            slot.addEventListener('click', () => {
                if (this.draggedAbility) {
                    this.assignToSlot(index, this.draggedAbility);
                    this.draggedAbility = null;
                }
            });
        });
    }

    setupDragAndDrop() {
        // Make ability cards draggable
        this.overlay.querySelectorAll('.ability-card[draggable="true"]').forEach(card => {
            card.addEventListener('dragstart', (e) => {
                const abilityId = card.dataset.ability;
                this.draggedAbility = {
                    id: abilityId,
                    name: card.querySelector('.ability-name').textContent,
                    icon: card.querySelector('.ability-icon').textContent
                };
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', card.innerHTML);
            });

            card.addEventListener('dragend', (e) => {
                card.classList.remove('dragging');
            });
        });

        // Make action slots droppable
        this.overlay.querySelectorAll('.action-slot').forEach((slot, index) => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                slot.classList.add('drag-over');
            });

            slot.addEventListener('dragleave', (e) => {
                slot.classList.remove('drag-over');
            });

            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('drag-over');

                if (this.draggedAbility) {
                    this.assignToSlot(index, this.draggedAbility);
                    this.draggedAbility = null;
                }
            });
        });
    }

    assignToSlot(slotIndex, ability) {
        this.actionBar[slotIndex] = ability;

        const slot = this.overlay.querySelector(`.action-slot[data-slot="${slotIndex + 1}"]`);
        const slotContent = slot.querySelector('.slot-content');

        slotContent.classList.remove('empty');
        slotContent.innerHTML = `
            <div class="ability-icon">${ability.icon}</div>
            <div class="ability-name">${ability.name}</div>
        `;

        // Show success feedback
        this.showNotification(`${ability.name} assigned to slot ${slotIndex + 1}`);
    }

    showSkillTooltip(skillId, event) {
        const skill = this.skills[skillId];
        if (!skill) return;

        const tooltip = document.getElementById('skillTooltip');
        const skillData = this.getSkillData(skillId);

        // Update tooltip content
        tooltip.querySelector('[data-tooltip-title]').textContent = skillData.name;
        tooltip.querySelector('[data-tooltip-description]').textContent = skillData.description;
        tooltip.querySelector('[data-req-level]').textContent = skillData.requiredLevel || this.playerLevel;
        tooltip.querySelector('[data-req-skill]').textContent = skillData.requiresName || 'None';

        // Update effects
        const effectsContainer = tooltip.querySelector('[data-tooltip-effects]');
        effectsContainer.innerHTML = skillData.effects.map(effect =>
            `<div class="effect-item">${effect}</div>`
        ).join('');

        // Update unlock button
        const unlockBtn = tooltip.querySelector('[data-unlock-skill]');
        if (skill.level >= skill.maxLevel) {
            unlockBtn.textContent = 'Max Level';
            unlockBtn.disabled = true;
        } else if (!skill.unlocked) {
            unlockBtn.textContent = 'Locked';
            unlockBtn.disabled = true;
        } else {
            unlockBtn.innerHTML = `<span class="button-icon">✨</span> Unlock (1 Point)`;
            unlockBtn.disabled = false;
            unlockBtn.onclick = () => this.unlockSkill(skillId);
        }

        // Position and show tooltip
        tooltip.style.display = 'block';
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY + 10}px`;

        // Hide on mouse leave
        setTimeout(() => {
            tooltip.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            }, { once: true });
        }, 100);
    }

    getSkillData(skillId) {
        const skillDatabase = {
            'basic-combat': {
                name: 'Basic Combat',
                description: 'Foundation of all warrior techniques. Increases base attack damage.',
                effects: ['10% Attack Damage', '5% Critical Chance'],
                requiredLevel: 1
            },
            'power-strike': {
                name: 'Power Strike',
                description: 'A devastating blow that deals massive damage to a single target.',
                effects: ['200% Weapon Damage', '15% Stun Chance', '20s Cooldown'],
                requiredLevel: 3,
                requiresName: 'Basic Combat'
            },
            'defensive-stance': {
                name: 'Defensive Stance',
                description: 'Adopt a defensive posture to reduce incoming damage.',
                effects: ['30% Damage Reduction', '10s Duration', '15s Cooldown'],
                requiredLevel: 3,
                requiresName: 'Basic Combat'
            },
            'whirlwind': {
                name: 'Whirlwind',
                description: 'Spin rapidly, damaging all enemies around you.',
                effects: ['150% Weapon Damage (AOE)', 'Hit up to 5 enemies', '25s Cooldown'],
                requiredLevel: 10,
                requiresName: 'Power Strike'
            },
            'shield-bash': {
                name: 'Shield Bash',
                description: 'Bash an enemy with your shield, interrupting their action.',
                effects: ['100% Weapon Damage', '2s Stun', 'Interrupt Casting', '12s Cooldown'],
                requiredLevel: 8,
                requiresName: 'Defensive Stance'
            },
            'first-aid': {
                name: 'First Aid',
                description: 'Basic healing techniques to recover health outside of combat.',
                effects: ['Heal 30 HP over 6s', 'Cannot be used in combat'],
                requiredLevel: 1
            },
            'meditation': {
                name: 'Meditation',
                description: 'Focus your mind to rapidly regenerate mana.',
                effects: ['Restore 50 Mana over 10s', 'Cannot move while meditating'],
                requiredLevel: 6,
                requiresName: 'First Aid'
            },
            'vitality': {
                name: 'Vitality',
                description: 'Passive increase to maximum health.',
                effects: ['10 Max HP per level', 'Stacks up to 5 times'],
                requiredLevel: 1
            },
            'endurance': {
                name: 'Endurance',
                description: 'Passive increase to stamina regeneration.',
                effects: ['2 Stamina/sec per level', 'Stacks up to 5 times'],
                requiredLevel: 1
            }
        };

        return skillDatabase[skillId] || {
            name: 'Unknown Skill',
            description: 'No description available',
            effects: [],
            requiredLevel: 1
        };
    }

    unlockSkill(skillId) {
        if (this.skillPoints <= 0) {
            this.showNotification('Not enough skill points!', 'error');
            return;
        }

        const skill = this.skills[skillId];
        if (!skill || !skill.unlocked || skill.level >= skill.maxLevel) {
            return;
        }

        skill.level++;
        this.skillPoints--;

        this.updateDisplay();
        this.showNotification(`Skill upgraded! ${this.getSkillData(skillId).name} is now level ${skill.level}`, 'success');

        // Hide tooltip
        document.getElementById('skillTooltip').style.display = 'none';
    }

    updateDisplay() {
        // Update skill points display
        const pointsDisplay = this.overlay.querySelector('[data-skill-points]');
        if (pointsDisplay) {
            pointsDisplay.textContent = this.skillPoints;
        }

        // Update class display
        const classNameDisplay = this.overlay.querySelector('[data-class-name]');
        if (classNameDisplay) {
            classNameDisplay.textContent = this.playerClass;
        }

        // Update skill nodes
        Object.keys(this.skills).forEach(skillId => {
            const skill = this.skills[skillId];
            const node = this.overlay.querySelector(`.skill-node[data-skill="${skillId}"]`);

            if (node) {
                const levelDisplay = node.querySelector('.node-level');
                if (levelDisplay) {
                    levelDisplay.textContent = `${skill.level}/${skill.maxLevel}`;
                }

                // Update active state
                if (skill.level > 0) {
                    node.classList.add('active');
                } else {
                    node.classList.remove('active');
                }
            }
        });
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `skill-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(16, 185, 129, 0.9)'};
            color: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            font-weight: 600;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    open() {
        this.overlay.classList.add('active');
        this.isOpen = true;
        this.updateDisplay();
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        this.isOpen = false;
        document.body.style.overflow = '';

        // Hide tooltip
        const tooltip = document.getElementById('skillTooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    // Public API
    addSkillPoints(amount) {
        this.skillPoints += amount;
        this.updateDisplay();
    }

    setPlayerLevel(level) {
        this.playerLevel = level;
        // Unlock skills based on level
        Object.keys(this.skills).forEach(skillId => {
            const skill = this.skills[skillId];
            const skillData = this.getSkillData(skillId);
            if (this.playerLevel >= (skillData.requiredLevel || 1)) {
                skill.unlocked = true;
            }
        });
        this.updateDisplay();
    }

    getActionBar() {
        return this.actionBar;
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
let skillsOverlay;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        skillsOverlay = new SkillsOverlay();

        // Expose to global scope for integration
        window.SkillsOverlay = skillsOverlay;
    });
} else {
    skillsOverlay = new SkillsOverlay();
    window.SkillsOverlay = skillsOverlay;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsOverlay;
}
