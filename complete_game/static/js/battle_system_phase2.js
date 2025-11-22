/**
 * THE ARCANE CODEX - Battle System Phase 2
 * Enhanced combat with health bars, enemy variety, and class abilities
 *
 * SECURITY ENHANCEMENTS:
 * - XSS protection via safe DOM manipulation
 * - Input validation and sanitization
 * - Memory leak prevention
 * - Race condition protection
 * - Integer overflow protection
 *
 * Features:
 * - Animated health bars (player & enemy)
 * - 5+ enemy types with unique stats
 * - Class-specific abilities
 * - Status effects (poison, stun, buff, debuff)
 * - Battle log with combat history
 * - Floating damage numbers
 * - Turn-based combat system
 */

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_DAMAGE = 999999;
const MIN_DAMAGE = 0;
const MAX_HP = 999999;
const MIN_HP = 0;
const MAX_MANA = 999999;
const MIN_MANA = 0;
const MAX_TURN_COUNT = 1000;
const MAX_LOG_ENTRIES = 20;
const MAX_STATUS_EFFECTS = 10;
const TURN_DELAY_MS = 1500;
const ANIMATION_DURATION_MS = 500;

// ============================================================================
// INPUT SANITIZER
// ============================================================================

class InputSanitizer {
    /**
     * Sanitize and validate string input
     */
    static sanitizeString(input, maxLength = 100) {
        if (typeof input !== 'string') {
            return '';
        }
        // Remove any HTML/script tags and limit length
        return input
            .replace(/[<>]/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+=/gi, '')
            .substring(0, maxLength);
    }

    /**
     * Sanitize and validate numeric input with bounds checking
     */
    static sanitizeNumber(input, min = 0, max = MAX_DAMAGE) {
        const num = parseInt(input, 10);
        if (isNaN(num)) {
            return min;
        }
        return Math.min(Math.max(num, min), max);
    }

    /**
     * Validate enemy type exists
     */
    static validateEnemyType(enemyType) {
        if (!enemyType || typeof enemyType !== 'string') {
            return 'GOBLIN_SCOUT';
        }
        const sanitized = this.sanitizeString(enemyType, 50);
        return ENEMY_TYPES.hasOwnProperty(sanitized) ? sanitized : 'GOBLIN_SCOUT';
    }

    /**
     * Sanitize player data object
     */
    static sanitizePlayerData(data) {
        if (!data || typeof data !== 'object') {
            return null;
        }

        // Create a clean object with only expected properties
        const sanitized = {};

        // Whitelist of allowed properties
        const allowedProps = ['name', 'class', 'hp', 'maxHp', 'mana', 'maxMana',
                             'attack', 'defense', 'speed', 'level'];

        for (const prop of allowedProps) {
            if (data.hasOwnProperty(prop)) {
                if (prop === 'name' || prop === 'class') {
                    sanitized[prop] = this.sanitizeString(data[prop], 50);
                } else {
                    sanitized[prop] = this.sanitizeNumber(data[prop], 0, MAX_HP);
                }
            }
        }

        return sanitized;
    }
}

// ============================================================================
// SAFE OBJECT UTILITIES
// ============================================================================

/**
 * Safely create object without prototype pollution
 */
function sanitizeObject(obj) {
    if (!obj || typeof obj !== 'object') {
        return {};
    }

    const clean = Object.create(null);

    for (const key in obj) {
        if (obj.hasOwnProperty(key) && !key.startsWith('__')) {
            // Prevent prototype pollution
            if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
                continue;
            }

            const value = obj[key];
            if (typeof value === 'object' && value !== null) {
                clean[key] = sanitizeObject(value);
            } else {
                clean[key] = value;
            }
        }
    }

    return clean;
}

/**
 * Safe object merge without prototype pollution
 */
function safeMerge(target, source) {
    const sanitizedSource = sanitizeObject(source);
    const result = Object.create(null);

    // Copy target properties
    for (const key in target) {
        if (target.hasOwnProperty(key)) {
            result[key] = target[key];
        }
    }

    // Merge source properties
    for (const key in sanitizedSource) {
        result[key] = sanitizedSource[key];
    }

    return result;
}

// ============================================================================
// ENEMY DATABASE
// ============================================================================

const ENEMY_TYPES = Object.freeze({
    GOBLIN_SCOUT: Object.freeze({
        id: 'goblin_scout',
        name: 'Goblin Scout',
        emoji: '👺',
        hp: 8,
        maxHp: 8,
        attack: 3,
        defense: 1,
        speed: 15,
        xp: 25,
        gold: 10,
        description: 'A sneaky goblin scout. Weak but cunning.',
        abilities: ['Quick Strike'],
        lootTable: ['Rusty Dagger', 'Goblin Ear', 'Small Health Potion'],
        isBoss: false
    }),

    SKELETON_WARRIOR: Object.freeze({
        id: 'skeleton_warrior',
        name: 'Skeleton Warrior',
        emoji: '💀',
        hp: 15,
        maxHp: 15,
        attack: 5,
        defense: 3,
        speed: 10,
        xp: 50,
        gold: 20,
        description: 'An undead warrior, relentless and fearless.',
        abilities: ['Bone Slash', 'Undead Resilience'],
        lootTable: ['Ancient Bone', 'Rusty Sword', 'Health Potion'],
        isBoss: false
    }),

    SHADOW_ASSASSIN: Object.freeze({
        id: 'shadow_assassin',
        name: 'Shadow Assassin',
        emoji: '🥷',
        hp: 12,
        maxHp: 12,
        attack: 8,
        defense: 2,
        speed: 20,
        xp: 75,
        gold: 35,
        description: 'Strikes from darkness with deadly precision.',
        abilities: ['Shadow Strike', 'Vanish', 'Critical Hit'],
        lootTable: ['Shadow Cloak', 'Assassin\'s Blade', 'Poison Vial'],
        isBoss: false
    }),

    FIRE_ELEMENTAL: Object.freeze({
        id: 'fire_elemental',
        name: 'Fire Elemental',
        emoji: '🔥',
        hp: 20,
        maxHp: 20,
        attack: 7,
        defense: 4,
        speed: 12,
        xp: 100,
        gold: 50,
        description: 'A being of pure flame. Resistant to physical attacks.',
        abilities: ['Fireball', 'Flame Aura', 'Burning Touch'],
        resistances: ['physical'],
        weaknesses: ['ice', 'water'],
        isBoss: false
    }),

    ICE_WRAITH: Object.freeze({
        id: 'ice_wraith',
        name: 'Ice Wraith',
        emoji: '❄️',
        hp: 18,
        maxHp: 18,
        attack: 6,
        defense: 5,
        speed: 14,
        xp: 90,
        gold: 45,
        description: 'A chilling spirit that freezes its victims.',
        abilities: ['Frost Bolt', 'Ice Shield', 'Freeze'],
        lootTable: ['Frost Shard', 'Frozen Heart', 'Ice Wand'],
        resistances: ['ice'],
        weaknesses: ['fire'],
        isBoss: false
    }),

    CORRUPTED_PALADIN: Object.freeze({
        id: 'corrupted_paladin',
        name: 'Corrupted Paladin',
        emoji: '⚔️',
        hp: 35,
        maxHp: 35,
        attack: 10,
        defense: 8,
        speed: 8,
        xp: 200,
        gold: 100,
        description: 'Once a holy warrior, now twisted by dark magic.',
        abilities: ['Dark Smite', 'Unholy Shield', 'Corruption Aura'],
        lootTable: ['Corrupted Plate', 'Dark Sword', 'Cursed Amulet'],
        isBoss: true
    }),

    ANCIENT_DRAGON: Object.freeze({
        id: 'ancient_dragon',
        name: 'Ancient Dragon',
        emoji: '🐉',
        hp: 100,
        maxHp: 100,
        attack: 15,
        defense: 12,
        speed: 10,
        xp: 1000,
        gold: 500,
        description: 'A legendary beast of immense power and wisdom.',
        abilities: ['Dragon Breath', 'Wing Buffet', 'Tail Sweep', 'Roar'],
        lootTable: ['Dragon Scale', 'Dragon Tooth', 'Legendary Weapon'],
        resistances: ['fire', 'physical'],
        weaknesses: ['ice', 'lightning'],
        isBoss: true
    })
});

// ============================================================================
// STATUS EFFECTS
// ============================================================================

const STATUS_EFFECTS = Object.freeze({
    POISON: Object.freeze({
        id: 'poison',
        name: 'Poisoned',
        emoji: '🧪',
        type: 'debuff',
        description: 'Takes damage over time',
        damagePerTurn: 2,
        duration: 3,
        color: '#9333ea'
    }),

    STUN: Object.freeze({
        id: 'stun',
        name: 'Stunned',
        emoji: '💫',
        type: 'debuff',
        description: 'Cannot act this turn',
        duration: 1,
        color: '#facc15'
    }),

    BURN: Object.freeze({
        id: 'burn',
        name: 'Burning',
        emoji: '🔥',
        type: 'debuff',
        description: 'Takes fire damage over time',
        damagePerTurn: 3,
        duration: 2,
        color: '#ef4444'
    }),

    FREEZE: Object.freeze({
        id: 'freeze',
        name: 'Frozen',
        emoji: '❄️',
        type: 'debuff',
        description: 'Cannot act and takes extra damage',
        duration: 1,
        damageMultiplier: 1.5,
        color: '#06b6d4'
    }),

    STRENGTH_BUFF: Object.freeze({
        id: 'strength_buff',
        name: 'Strengthened',
        emoji: '💪',
        type: 'buff',
        description: 'Attack increased by 50%',
        attackMultiplier: 1.5,
        duration: 3,
        color: '#22c55e'
    }),

    DEFENSE_BUFF: Object.freeze({
        id: 'defense_buff',
        name: 'Shielded',
        emoji: '🛡️',
        type: 'buff',
        description: 'Defense increased by 50%',
        defenseMultiplier: 1.5,
        duration: 3,
        color: '#3b82f6'
    }),

    REGENERATION: Object.freeze({
        id: 'regeneration',
        name: 'Regenerating',
        emoji: '✨',
        type: 'buff',
        description: 'Restores health over time',
        healPerTurn: 3,
        duration: 3,
        color: '#10b981'
    })
});

// ============================================================================
// CLASS ABILITIES
// ============================================================================

const CLASS_ABILITIES = Object.freeze({
    WARRIOR: Object.freeze([
        Object.freeze({
            id: 'power_strike',
            name: 'Power Strike',
            emoji: '⚔️',
            description: 'A mighty blow dealing 150% damage',
            manaCost: 10,
            damage: 1.5,
            cooldown: 2,
            effect: null
        }),
        Object.freeze({
            id: 'battle_cry',
            name: 'Battle Cry',
            emoji: '📢',
            description: 'Increases attack for 3 turns',
            manaCost: 15,
            damage: 0,
            cooldown: 4,
            effect: 'STRENGTH_BUFF'
        }),
        Object.freeze({
            id: 'shield_wall',
            name: 'Shield Wall',
            emoji: '🛡️',
            description: 'Increases defense for 3 turns',
            manaCost: 15,
            damage: 0,
            cooldown: 4,
            effect: 'DEFENSE_BUFF'
        })
    ]),

    MAGE: Object.freeze([
        Object.freeze({
            id: 'fireball',
            name: 'Fireball',
            emoji: '🔥',
            description: 'Hurls a ball of flame dealing high damage',
            manaCost: 20,
            damage: 2.0,
            cooldown: 3,
            effect: 'BURN',
            effectChance: 0.3
        }),
        Object.freeze({
            id: 'ice_lance',
            name: 'Ice Lance',
            emoji: '❄️',
            description: 'Piercing ice that may freeze the enemy',
            manaCost: 18,
            damage: 1.8,
            cooldown: 3,
            effect: 'FREEZE',
            effectChance: 0.5
        }),
        Object.freeze({
            id: 'arcane_shield',
            name: 'Arcane Shield',
            emoji: '🔮',
            description: 'Magical barrier that absorbs damage',
            manaCost: 25,
            damage: 0,
            cooldown: 5,
            effect: 'DEFENSE_BUFF'
        })
    ]),

    ROGUE: Object.freeze([
        Object.freeze({
            id: 'backstab',
            name: 'Backstab',
            emoji: '🗡️',
            description: 'Critical strike from shadows',
            manaCost: 12,
            damage: 2.2,
            cooldown: 2,
            effect: null
        }),
        Object.freeze({
            id: 'poison_dagger',
            name: 'Poison Dagger',
            emoji: '🧪',
            description: 'Strikes with poisoned blade',
            manaCost: 15,
            damage: 1.2,
            cooldown: 3,
            effect: 'POISON',
            effectChance: 0.8
        }),
        Object.freeze({
            id: 'vanish',
            name: 'Vanish',
            emoji: '💨',
            description: 'Becomes untargetable for 1 turn',
            manaCost: 20,
            damage: 0,
            cooldown: 5,
            effect: null,
            special: 'dodge_next'
        })
    ]),

    PALADIN: Object.freeze([
        Object.freeze({
            id: 'divine_smite',
            name: 'Divine Smite',
            emoji: '⚡',
            description: 'Holy power smites the enemy',
            manaCost: 18,
            damage: 1.8,
            cooldown: 3,
            effect: null
        }),
        Object.freeze({
            id: 'lay_on_hands',
            name: 'Lay on Hands',
            emoji: '✋',
            description: 'Heals self for 20 HP',
            manaCost: 25,
            damage: 0,
            cooldown: 4,
            effect: null,
            special: 'heal_20'
        }),
        Object.freeze({
            id: 'holy_aura',
            name: 'Holy Aura',
            emoji: '✨',
            description: 'Grants regeneration for 3 turns',
            manaCost: 20,
            damage: 0,
            cooldown: 5,
            effect: 'REGENERATION'
        })
    ])
});

// ============================================================================
// BATTLE STATE MANAGER
// ============================================================================

class BattleSystemPhase2 {
    constructor() {
        this.battle = null;
        this.player = null;
        this.enemy = null;
        this.turnCount = 0;
        this.combatLog = [];
        this.isPlayerTurn = true;
        this.abilityCooldowns = {};
        this.playerStatusEffects = [];
        this.enemyStatusEffects = [];

        // Turn lock to prevent race conditions
        this.turnLock = false;

        // Track event listeners for cleanup
        this.eventListeners = new Map();

        // UI Elements (will be set by initBattleUI)
        this.playerHealthBar = null;
        this.enemyHealthBar = null;
        this.battleLogContainer = null;
        this.abilitiesContainer = null;
        this.statusEffectsContainer = null;
    }

    /**
     * Initialize battle UI components
     */
    initBattleUI() {
        try {
            // Health bars
            this.playerHealthBar = document.getElementById('player-health-bar');
            this.enemyHealthBar = document.getElementById('enemy-health-bar');

            // Battle log
            this.battleLogContainer = document.getElementById('battle-log');

            // Abilities
            this.abilitiesContainer = document.getElementById('battle-abilities');

            // Status effects
            this.statusEffectsContainer = document.getElementById('status-effects');

            console.log('[Battle Phase 2] UI initialized');
        } catch (error) {
            console.error('[Battle Phase 2] Error initializing UI:', error);
        }
    }

    /**
     * Cleanup event listeners to prevent memory leaks
     */
    cleanup() {
        this.eventListeners.forEach((listener, element) => {
            element.removeEventListener('click', listener);
        });
        this.eventListeners.clear();
    }

    /**
     * Start a new battle
     */
    startBattle(playerData, enemyType = 'GOBLIN_SCOUT') {
        try {
            // Validate and sanitize inputs
            const sanitizedPlayerData = InputSanitizer.sanitizePlayerData(playerData);
            if (!sanitizedPlayerData) {
                console.error('[Battle Phase 2] Invalid player data');
                return;
            }

            const validatedEnemyType = InputSanitizer.validateEnemyType(enemyType);

            // Reset state
            this.cleanup();
            this.turnCount = 0;
            this.combatLog = [];
            this.isPlayerTurn = true;
            this.turnLock = false;
            this.abilityCooldowns = {};
            this.playerStatusEffects = [];
            this.enemyStatusEffects = [];

            // Set up player with sanitized data
            this.player = {
                ...sanitizedPlayerData,
                currentHp: InputSanitizer.sanitizeNumber(
                    sanitizedPlayerData.hp || sanitizedPlayerData.maxHp || 100,
                    MIN_HP,
                    MAX_HP
                ),
                currentMana: InputSanitizer.sanitizeNumber(
                    sanitizedPlayerData.mana || sanitizedPlayerData.maxMana || 50,
                    MIN_MANA,
                    MAX_MANA
                ),
                statusEffects: []
            };

            // Set up enemy with deep copy to prevent modification
            const enemyTemplate = ENEMY_TYPES[validatedEnemyType];
            this.enemy = {
                ...JSON.parse(JSON.stringify(enemyTemplate)),
                currentHp: enemyTemplate.hp,
                statusEffects: []
            };

            this.battle = {
                battleId: `battle_${Date.now()}`,
                started: Date.now(),
                turnOrder: this.calculateTurnOrder()
            };

            // Initialize UI
            this.updateHealthBars();
            this.renderAbilities();
            this.addLogEntry(`Battle started against ${this.enemy.name}!`, 'system');

            console.log('[Battle Phase 2] Battle started:', this.battle);

            // If enemy is faster, they go first
            if (!this.isPlayerTurn) {
                setTimeout(() => this.enemyTurn(), TURN_DELAY_MS);
            }
        } catch (error) {
            console.error('[Battle Phase 2] Error starting battle:', error);
        }
    }

    /**
     * Calculate turn order based on speed
     */
    calculateTurnOrder() {
        const playerSpeed = InputSanitizer.sanitizeNumber(this.player.speed || 10, 0, 100);
        const enemySpeed = InputSanitizer.sanitizeNumber(this.enemy.speed || 10, 0, 100);

        this.isPlayerTurn = playerSpeed >= enemySpeed;

        return this.isPlayerTurn ? ['player', 'enemy'] : ['enemy', 'player'];
    }

    /**
     * Update health bar displays safely
     */
    updateHealthBars() {
        try {
            // Player health bar
            const playerPercent = Math.min(100, Math.max(0,
                (this.player.currentHp / this.player.maxHp) * 100));

            if (this.playerHealthBar) {
                this.playerHealthBar.style.width = `${playerPercent}%`;
                const hpTextElement = this.playerHealthBar.querySelector('.hp-text');
                if (hpTextElement) {
                    // Use textContent to prevent XSS
                    hpTextElement.textContent = `${this.player.currentHp} / ${this.player.maxHp}`;
                }
            }

            // Enemy health bar
            const enemyPercent = Math.min(100, Math.max(0,
                (this.enemy.currentHp / this.enemy.maxHp) * 100));

            if (this.enemyHealthBar) {
                this.enemyHealthBar.style.width = `${enemyPercent}%`;
                const hpTextElement = this.enemyHealthBar.querySelector('.hp-text');
                if (hpTextElement) {
                    // Use textContent to prevent XSS
                    hpTextElement.textContent = `${this.enemy.currentHp} / ${this.enemy.maxHp}`;
                }
            }

            // Animate health bars
            this.animateHealthBar(this.playerHealthBar, playerPercent);
            this.animateHealthBar(this.enemyHealthBar, enemyPercent);
        } catch (error) {
            console.error('[Battle Phase 2] Error updating health bars:', error);
        }
    }

    /**
     * Animate health bar change
     */
    animateHealthBar(barElement, targetPercent) {
        if (!barElement) return;

        try {
            barElement.style.transition = `width ${ANIMATION_DURATION_MS}ms ease-out`;
            barElement.style.width = `${targetPercent}%`;

            // Color based on health percentage
            if (targetPercent > 60) {
                barElement.style.backgroundColor = '#22c55e'; // Green
            } else if (targetPercent > 30) {
                barElement.style.backgroundColor = '#f59e0b'; // Orange
            } else {
                barElement.style.backgroundColor = '#ef4444'; // Red
            }
        } catch (error) {
            console.error('[Battle Phase 2] Error animating health bar:', error);
        }
    }

    /**
     * Add entry to battle log safely
     */
    addLogEntry(message, type = 'info') {
        try {
            // Sanitize message
            const sanitizedMessage = InputSanitizer.sanitizeString(message, 200);

            const entry = {
                message: sanitizedMessage,
                type: InputSanitizer.sanitizeString(type, 20),
                timestamp: Date.now(),
                turn: Math.min(this.turnCount, MAX_TURN_COUNT)
            };

            this.combatLog.push(entry);

            // Limit log size to prevent memory issues
            if (this.combatLog.length > MAX_LOG_ENTRIES * 2) {
                this.combatLog = this.combatLog.slice(-MAX_LOG_ENTRIES);
            }

            // Update UI safely
            if (this.battleLogContainer) {
                const logElement = document.createElement('div');
                logElement.className = `log-entry log-${entry.type}`;
                // Use textContent to prevent XSS
                logElement.textContent = `[Turn ${this.turnCount}] ${sanitizedMessage}`;

                this.battleLogContainer.insertBefore(logElement, this.battleLogContainer.firstChild);

                // Limit displayed entries
                while (this.battleLogContainer.children.length > MAX_LOG_ENTRIES) {
                    this.battleLogContainer.removeChild(this.battleLogContainer.lastChild);
                }
            }

            console.log(`[Battle Log] ${sanitizedMessage}`);
        } catch (error) {
            console.error('[Battle Phase 2] Error adding log entry:', error);
        }
    }

    /**
     * Render class abilities safely
     */
    renderAbilities() {
        if (!this.abilitiesContainer) return;

        try {
            // Clear existing listeners
            this.eventListeners.forEach((listener, element) => {
                if (element.parentElement === this.abilitiesContainer) {
                    element.removeEventListener('click', listener);
                    this.eventListeners.delete(element);
                }
            });

            // Clear container
            while (this.abilitiesContainer.firstChild) {
                this.abilitiesContainer.removeChild(this.abilitiesContainer.firstChild);
            }

            const playerClass = InputSanitizer.sanitizeString(this.player.class || 'WARRIOR', 20);
            const abilities = CLASS_ABILITIES[playerClass] || CLASS_ABILITIES.WARRIOR;

            abilities.forEach(ability => {
                const button = document.createElement('button');
                button.className = 'ability-btn';

                // Create elements safely without innerHTML
                const emojiSpan = document.createElement('span');
                emojiSpan.className = 'ability-emoji';
                emojiSpan.textContent = ability.emoji;

                const nameSpan = document.createElement('span');
                nameSpan.className = 'ability-name';
                nameSpan.textContent = ability.name;

                const manaSpan = document.createElement('span');
                manaSpan.className = 'ability-mana';
                manaSpan.textContent = `${ability.manaCost} MP`;

                button.appendChild(emojiSpan);
                button.appendChild(nameSpan);
                button.appendChild(manaSpan);

                // Check if on cooldown or not enough mana
                const onCooldown = this.abilityCooldowns[ability.id] > 0;
                const notEnoughMana = this.player.currentMana < ability.manaCost;

                if (onCooldown || notEnoughMana || !this.isPlayerTurn || this.turnLock) {
                    button.disabled = true;
                    button.classList.add('disabled');
                }

                if (onCooldown) {
                    const cooldownSpan = document.createElement('span');
                    cooldownSpan.className = 'cooldown';
                    cooldownSpan.textContent = this.abilityCooldowns[ability.id].toString();
                    button.appendChild(cooldownSpan);
                }

                // Store listener for cleanup
                const listener = () => this.useAbility(ability);
                button.addEventListener('click', listener);
                this.eventListeners.set(button, listener);

                this.abilitiesContainer.appendChild(button);
            });
        } catch (error) {
            console.error('[Battle Phase 2] Error rendering abilities:', error);
        }
    }

    /**
     * Player uses an ability
     */
    useAbility(ability) {
        try {
            // Check turn lock to prevent race conditions
            if (this.turnLock) {
                this.addLogEntry('Action already in progress!', 'error');
                return;
            }

            if (!this.isPlayerTurn) {
                this.addLogEntry('Not your turn!', 'error');
                return;
            }

            if (this.player.currentMana < ability.manaCost) {
                this.addLogEntry('Not enough mana!', 'error');
                return;
            }

            if (this.abilityCooldowns[ability.id] > 0) {
                this.addLogEntry('Ability on cooldown!', 'error');
                return;
            }

            // Set turn lock
            this.turnLock = true;

            // Deduct mana with bounds checking
            this.player.currentMana = InputSanitizer.sanitizeNumber(
                this.player.currentMana - ability.manaCost,
                MIN_MANA,
                MAX_MANA
            );

            // Calculate damage with overflow protection
            const baseDamage = InputSanitizer.sanitizeNumber(this.player.attack || 5, 1, MAX_DAMAGE);
            let damage = InputSanitizer.sanitizeNumber(
                Math.floor(baseDamage * (ability.damage || 1)),
                MIN_DAMAGE,
                MAX_DAMAGE
            );

            // Apply status effect modifiers
            const strengthBuff = this.playerStatusEffects.find(e => e.id === 'strength_buff');
            if (strengthBuff && STATUS_EFFECTS.STRENGTH_BUFF.attackMultiplier) {
                damage = InputSanitizer.sanitizeNumber(
                    Math.floor(damage * STATUS_EFFECTS.STRENGTH_BUFF.attackMultiplier),
                    MIN_DAMAGE,
                    MAX_DAMAGE
                );
            }

            // Handle special abilities
            if (ability.special === 'heal_20') {
                const healAmount = 20;
                this.player.currentHp = InputSanitizer.sanitizeNumber(
                    this.player.currentHp + healAmount,
                    MIN_HP,
                    Math.min(this.player.maxHp, MAX_HP)
                );
                this.addLogEntry(`You healed for ${healAmount} HP!`, 'player');
            } else if (damage > 0) {
                // Apply damage with bounds checking
                this.enemy.currentHp = InputSanitizer.sanitizeNumber(
                    this.enemy.currentHp - damage,
                    MIN_HP,
                    MAX_HP
                );
                this.addLogEntry(`You used ${ability.name}! Dealt ${damage} damage!`, 'player');

                // Show floating damage number
                this.showFloatingDamage(damage, 'enemy');
            } else {
                this.addLogEntry(`You used ${ability.name}!`, 'player');
            }

            // Apply status effect
            if (ability.effect) {
                const effectChance = Math.min(Math.max(ability.effectChance || 1.0, 0), 1);
                if (Math.random() < effectChance) {
                    this.applyStatusEffect(this.enemy, ability.effect);
                }
            }

            // Set cooldown
            this.abilityCooldowns[ability.id] = InputSanitizer.sanitizeNumber(
                ability.cooldown,
                0,
                10
            );

            // Update UI
            this.updateHealthBars();
            this.renderAbilities();

            // Check for victory
            if (this.enemy.currentHp <= 0) {
                this.handleVictory();
                return;
            }

            // End turn
            this.endTurn();
        } catch (error) {
            console.error('[Battle Phase 2] Error using ability:', error);
            this.turnLock = false;
        }
    }

    /**
     * Apply status effect to target
     */
    applyStatusEffect(target, effectId) {
        try {
            const effectTemplate = STATUS_EFFECTS[effectId];
            if (!effectTemplate) return;

            // Limit status effects to prevent memory issues
            const targetEffects = target === this.player ? this.playerStatusEffects : this.enemyStatusEffects;
            if (targetEffects.length >= MAX_STATUS_EFFECTS) {
                return;
            }

            const effect = {
                ...JSON.parse(JSON.stringify(effectTemplate)),
                turnsRemaining: effectTemplate.duration
            };

            if (target === this.player) {
                this.playerStatusEffects.push(effect);
                this.addLogEntry(`You are now ${effect.name}!`, 'debuff');
            } else {
                this.enemyStatusEffects.push(effect);
                this.addLogEntry(`${this.enemy.name} is now ${effect.name}!`, 'buff');
            }

            this.updateStatusEffects();
        } catch (error) {
            console.error('[Battle Phase 2] Error applying status effect:', error);
        }
    }

    /**
     * Update status effects display
     */
    updateStatusEffects() {
        // Update UI to show active status effects
        // TODO: Implement status effect icons
    }

    /**
     * Show floating damage number
     */
    showFloatingDamage(damage, target) {
        // TODO: Implement animated floating damage numbers
        console.log(`[Damage] ${damage} to ${target}`);
    }

    /**
     * End player turn and start enemy turn
     */
    endTurn() {
        try {
            this.isPlayerTurn = false;
            this.turnCount = Math.min(this.turnCount + 1, MAX_TURN_COUNT);

            // Process status effects
            this.processStatusEffects();

            // Reduce cooldowns
            Object.keys(this.abilityCooldowns).forEach(abilityId => {
                if (this.abilityCooldowns[abilityId] > 0) {
                    this.abilityCooldowns[abilityId]--;
                }
            });

            // Release turn lock
            this.turnLock = false;

            // Enemy turn
            setTimeout(() => this.enemyTurn(), TURN_DELAY_MS);
        } catch (error) {
            console.error('[Battle Phase 2] Error ending turn:', error);
            this.turnLock = false;
        }
    }

    /**
     * Process status effects (damage, healing, etc.)
     */
    processStatusEffects() {
        try {
            // Process player status effects
            this.playerStatusEffects = this.playerStatusEffects.filter(effect => {
                effect.turnsRemaining--;

                // Apply effect with bounds checking
                if (effect.damagePerTurn) {
                    const damage = InputSanitizer.sanitizeNumber(effect.damagePerTurn, 0, MAX_DAMAGE);
                    this.player.currentHp = InputSanitizer.sanitizeNumber(
                        this.player.currentHp - damage,
                        MIN_HP,
                        MAX_HP
                    );
                    this.addLogEntry(`${effect.name} deals ${damage} damage to you!`, 'debuff');
                }

                if (effect.healPerTurn) {
                    const heal = InputSanitizer.sanitizeNumber(effect.healPerTurn, 0, MAX_HP);
                    this.player.currentHp = InputSanitizer.sanitizeNumber(
                        this.player.currentHp + heal,
                        MIN_HP,
                        Math.min(this.player.maxHp, MAX_HP)
                    );
                    this.addLogEntry(`${effect.name} heals you for ${heal} HP!`, 'buff');
                }

                return effect.turnsRemaining > 0;
            }).slice(0, MAX_STATUS_EFFECTS);

            // Process enemy status effects
            this.enemyStatusEffects = this.enemyStatusEffects.filter(effect => {
                effect.turnsRemaining--;

                // Apply effect with bounds checking
                if (effect.damagePerTurn) {
                    const damage = InputSanitizer.sanitizeNumber(effect.damagePerTurn, 0, MAX_DAMAGE);
                    this.enemy.currentHp = InputSanitizer.sanitizeNumber(
                        this.enemy.currentHp - damage,
                        MIN_HP,
                        MAX_HP
                    );
                    this.addLogEntry(`${effect.name} deals ${damage} damage to ${this.enemy.name}!`, 'buff');
                }

                return effect.turnsRemaining > 0;
            }).slice(0, MAX_STATUS_EFFECTS);

            this.updateHealthBars();
        } catch (error) {
            console.error('[Battle Phase 2] Error processing status effects:', error);
        }
    }

    /**
     * Enemy takes their turn
     */
    enemyTurn() {
        try {
            // Check turn lock
            if (this.turnLock) {
                return;
            }

            if (this.enemy.currentHp <= 0) return;

            // Set turn lock
            this.turnLock = true;

            this.addLogEntry(`${this.enemy.name}'s turn...`, 'system');

            // Check if stunned/frozen
            const stunned = this.enemyStatusEffects.find(e => e.id === 'stun' || e.id === 'freeze');
            if (stunned) {
                this.addLogEntry(`${this.enemy.name} is ${stunned.name} and cannot act!`, 'buff');
                this.startPlayerTurn();
                return;
            }

            // Simple AI: Random attack or ability
            const useAbility = Math.random() > 0.5 && this.enemy.abilities && this.enemy.abilities.length > 0;

            if (useAbility) {
                const abilityIndex = Math.floor(Math.random() * this.enemy.abilities.length);
                const ability = this.enemy.abilities[abilityIndex];
                this.addLogEntry(`${this.enemy.name} uses ${ability}!`, 'enemy');
            }

            // Calculate damage with bounds checking
            const baseDamage = InputSanitizer.sanitizeNumber(this.enemy.attack, 0, MAX_DAMAGE);
            const randomBonus = Math.floor(Math.random() * 3);
            let damage = InputSanitizer.sanitizeNumber(baseDamage + randomBonus, MIN_DAMAGE, MAX_DAMAGE);

            // Apply player's defense
            const defense = InputSanitizer.sanitizeNumber(this.player.defense || 0, 0, MAX_DAMAGE);
            damage = InputSanitizer.sanitizeNumber(Math.max(1, damage - defense), MIN_DAMAGE, MAX_DAMAGE);

            // Apply damage
            this.player.currentHp = InputSanitizer.sanitizeNumber(
                this.player.currentHp - damage,
                MIN_HP,
                MAX_HP
            );
            this.addLogEntry(`${this.enemy.name} attacks! You take ${damage} damage!`, 'enemy');
            this.showFloatingDamage(damage, 'player');

            this.updateHealthBars();

            // Release turn lock
            this.turnLock = false;

            // Check for defeat
            if (this.player.currentHp <= 0) {
                this.handleDefeat();
                return;
            }

            // Start player turn
            setTimeout(() => this.startPlayerTurn(), TURN_DELAY_MS);
        } catch (error) {
            console.error('[Battle Phase 2] Error during enemy turn:', error);
            this.turnLock = false;
        }
    }

    /**
     * Start player turn
     */
    startPlayerTurn() {
        try {
            this.isPlayerTurn = true;
            this.turnLock = false;
            this.addLogEntry('Your turn!', 'system');
            this.renderAbilities();
        } catch (error) {
            console.error('[Battle Phase 2] Error starting player turn:', error);
        }
    }

    /**
     * Handle battle victory
     */
    handleVictory() {
        try {
            this.turnLock = true;
            this.addLogEntry(`Victory! ${this.enemy.name} defeated!`, 'victory');

            const xp = InputSanitizer.sanitizeNumber(this.enemy.xp, 0, MAX_DAMAGE);
            const gold = InputSanitizer.sanitizeNumber(this.enemy.gold, 0, MAX_DAMAGE);

            this.addLogEntry(`You gained ${xp} XP and ${gold} gold!`, 'reward');

            console.log('[Battle] Victory!', {
                xp: xp,
                gold: gold,
                loot: this.enemy.lootTable
            });

            // Trigger victory callback
            if (typeof this.onVictory === 'function') {
                this.onVictory({
                    xp: xp,
                    gold: gold,
                    loot: this.rollLoot()
                });
            }

            // Cleanup
            this.cleanup();
        } catch (error) {
            console.error('[Battle Phase 2] Error handling victory:', error);
        }
    }

    /**
     * Handle battle defeat
     */
    handleDefeat() {
        try {
            this.turnLock = true;
            this.addLogEntry('You have been defeated...', 'defeat');

            // Trigger defeat callback
            if (typeof this.onDefeat === 'function') {
                this.onDefeat();
            }

            // Cleanup
            this.cleanup();
        } catch (error) {
            console.error('[Battle Phase 2] Error handling defeat:', error);
        }
    }

    /**
     * Roll for loot drops
     */
    rollLoot() {
        try {
            if (!this.enemy.lootTable || !Array.isArray(this.enemy.lootTable)) {
                return [];
            }

            // 50% chance per item
            return this.enemy.lootTable.filter(() => Math.random() > 0.5);
        } catch (error) {
            console.error('[Battle Phase 2] Error rolling loot:', error);
            return [];
        }
    }
}

// Export for use
window.BattleSystemPhase2 = BattleSystemPhase2;
console.log('[Battle Phase 2] Secure battle system loaded');