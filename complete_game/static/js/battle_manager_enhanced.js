/**
 * THE ARCANE CODEX - Enhanced Battle Manager
 * With integrated theme switching and beautiful UI support
 */

class BattleManager {
    constructor() {
        this.currentBattle = null;
        this.isInBattle = false;
        this.enemyHp = 0;
        this.playerHp = 0;
        this.actionCooldown = false;
        this.cooldownTime = 500; // ms
        this.socketRetryTimeout = null;
        this.socketInitialized = false;

        // Theme management
        this.currentTheme = 'default';
        this.themeTransitionTime = 1000; // ms

        // Callbacks for UI integration
        this.onVictory = null;
        this.onDefeat = null;
        this.onBattleStart = null;
        this.onBattleEnd = null;

        // Bind handlers to maintain 'this' context and allow cleanup
        this.boundHandlers = {
            actionResult: (data) => this.handleActionResult(data),
            battleVictory: (data) => this.handleVictory(data),
            fleeResult: (data) => this.handleFleeResult(data),
            battleEvent: (data) => this.handleBattleEvent(data)
        };
    }

    /**
     * Set theme for battle mode
     */
    setTheme(theme) {
        const validThemes = ['default', 'battle', 'divine', 'victory'];
        if (!validThemes.includes(theme)) {
            console.warn('[Battle] Invalid theme:', theme);
            return;
        }

        // Remove all theme classes
        document.body.classList.remove('battle-theme', 'divine-theme', 'victory-theme');

        // Add new theme if not default
        if (theme !== 'default') {
            document.body.classList.add(`${theme}-theme`);
        }

        this.currentTheme = theme;
        console.log('[Battle] Theme changed to:', theme);

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
    }

    /**
     * Smooth theme transition
     */
    async transitionToTheme(theme, duration = 1000) {
        // Add transition class
        document.body.style.transition = `background ${duration}ms ease`;

        // Change theme
        this.setTheme(theme);

        // Remove transition after completion
        setTimeout(() => {
            document.body.style.transition = '';
        }, duration);
    }

    /**
     * Set up SocketIO listeners for battle events
     */
    setupSocketListeners() {
        if (typeof socket === 'undefined') {
            console.warn('[Battle] Socket not available, initializing...');

            // Initialize socket if not present
            if (typeof io !== 'undefined') {
                // Connect to the server with proper configuration
                window.socket = io(window.location.origin || 'http://localhost:5000', {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    withCredentials: true,
                    auth: {
                        player_id: sessionStorage.getItem('player_id') || 'test_player',
                        username: sessionStorage.getItem('username') || 'TestPlayer'
                    }
                });

                window.socket.on('connect', () => {
                    console.log('[Battle] Socket connected! ID:', window.socket.id);
                    this.registerListeners();
                });

                window.socket.on('connect_error', (error) => {
                    console.error('[Battle] Socket connection error:', error.message);
                });

                console.log('[Battle] Socket initialization started');
                return;
            } else {
                // SocketIO library not loaded, retry later
                console.warn('[Battle] SocketIO library not loaded, will retry');
                this.socketRetryTimeout = setTimeout(() => this.setupSocketListeners(), 1000);
                return;
            }
        } else {
            // Socket already exists, register listeners
            this.registerListeners();
        }
    }

    /**
     * Register socket event listeners
     */
    registerListeners() {
        if (typeof socket === 'undefined' && typeof window.socket === 'undefined') {
            console.error('[Battle] Cannot register listeners - socket undefined');
            return;
        }

        const s = window.socket || socket;
        s.on('action_result', this.boundHandlers.actionResult);
        s.on('battle_victory', this.boundHandlers.battleVictory);
        s.on('flee_result', this.boundHandlers.fleeResult);
        s.on('battle_event', this.boundHandlers.battleEvent);

        console.log('[Battle] Socket listeners registered');
    }

    /**
     * Clean up resources and event listeners
     */
    cleanup() {
        // Clear retry timeout
        if (this.socketRetryTimeout) {
            clearTimeout(this.socketRetryTimeout);
            this.socketRetryTimeout = null;
        }

        // Remove socket listeners
        const s = window.socket || socket;
        if (s) {
            s.off('action_result', this.boundHandlers.actionResult);
            s.off('battle_victory', this.boundHandlers.battleVictory);
            s.off('flee_result', this.boundHandlers.fleeResult);
            s.off('battle_event', this.boundHandlers.battleEvent);
        }

        // Reset theme to default
        this.setTheme('default');

        // Clean up UI
        this.hideBattleControls();
        this.isInBattle = false;
        this.currentBattle = null;

        console.log('[Battle] Cleanup complete');
    }

    /**
     * Start a test battle with theme switching
     */
    async startTestBattle() {
        try {
            // Switch to battle theme
            await this.transitionToTheme('battle');

            // Get game code from global or session
            let gameCode = window.gameCode || localStorage.getItem('game_code') || 'TEST001';

            // Ensure it's a string, not an object
            if (typeof gameCode !== 'string') {
                gameCode = 'TEST001';
            }

            console.log('[Battle] Starting test battle for game:', gameCode);

            // Fire start callback
            if (this.onBattleStart) {
                this.onBattleStart();
            }

            // Play battle intro animation if available
            if (window.playBattleIntro) {
                window.playBattleIntro({
                    enemyName: 'CRYPT GUARDIAN',
                    enemyIcon: '💀',
                    flavorText: 'An ancient evil awakens from the shadows!',
                    battleType: 'boss',
                    onComplete: () => {
                        console.log('[Battle] Intro animation complete');
                    }
                });
            }

            // Call API to initiate battle
            const response = await fetch('/api/battle/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ game_code: gameCode })
            });

            const data = await response.json();

            if (!data.success) {
                this.showMessage(data.error || 'Failed to start battle', 'error');
                // Reset theme on failure
                this.setTheme('default');
                return;
            }

            console.log('[Battle] Battle data received:', data);

            // Set up socket listeners if not already done
            if (!this.socketInitialized) {
                this.setupSocketListeners();
                this.socketInitialized = true;
            }

            // Initialize battle state
            this.currentBattle = data.battle;
            this.isInBattle = true;
            this.enemyHp = data.enemy_hp || 100;
            this.playerHp = data.player_hp || 100;

            // Show battle UI
            this.showBattleUI(data);

        } catch (error) {
            console.error('[Battle] Failed to start test battle:', error);
            this.showMessage('Failed to start battle', 'error');
            // Reset theme on error
            this.setTheme('default');
        }
    }

    /**
     * Handle battle victory with theme transition
     */
    async handleVictory(data) {
        console.log('[Battle] Victory!', data);

        // Transition to victory theme
        await this.transitionToTheme('victory');

        // Play victory animation if available
        if (window.playVictoryAnimation) {
            window.playVictoryAnimation({
                rewards: data.rewards || {},
                experienceGained: data.experience || 0,
                onComplete: () => {
                    console.log('[Battle] Victory animation complete');
                }
            });
        }

        // Show victory message
        this.showMessage('VICTORY! The enemy has been defeated!', 'success');

        // Fire victory callback
        if (this.onVictory) {
            this.onVictory(data);
        }

        // Cleanup after delay
        setTimeout(() => {
            this.cleanup();

            // Fire end callback
            if (this.onBattleEnd) {
                this.onBattleEnd('victory', data);
            }
        }, 3000);
    }

    /**
     * Handle battle defeat
     */
    async handleDefeat(data) {
        console.log('[Battle] Defeat...', data);

        // No special theme for defeat, just reset
        this.showMessage('DEFEATED... The battle is lost.', 'error');

        // Fire defeat callback
        if (this.onDefeat) {
            this.onDefeat(data);
        }

        // Cleanup after delay
        setTimeout(() => {
            this.cleanup();

            // Fire end callback
            if (this.onBattleEnd) {
                this.onBattleEnd('defeat', data);
            }
        }, 2000);
    }

    /**
     * Handle generic battle events
     */
    handleBattleEvent(data) {
        console.log('[Battle] Event received:', data);

        switch(data.type) {
            case 'battle_start':
                this.handleBattleStart(data);
                break;
            case 'enemy_attack':
                this.handleEnemyAttack(data);
                break;
            case 'player_attack':
                this.handlePlayerAttack(data);
                break;
            case 'critical_hit':
                this.handleCriticalHit(data);
                break;
            case 'battle_end':
                if (data.result === 'victory') {
                    this.handleVictory(data);
                } else {
                    this.handleDefeat(data);
                }
                break;
            default:
                console.log('[Battle] Unknown event type:', data.type);
        }
    }

    /**
     * Handle battle start event
     */
    handleBattleStart(data) {
        // Set battle theme
        this.setTheme('battle');

        // Update battle state
        this.isInBattle = true;
        this.currentBattle = data.battle;

        console.log('[Battle] Battle started:', data);
    }

    /**
     * Handle enemy attack animation
     */
    handleEnemyAttack(data) {
        if (window.playEnemyAttack) {
            window.playEnemyAttack({
                damage: data.damage,
                attackName: data.attack_name || 'Strike',
                onComplete: () => {
                    this.updatePlayerHp(this.playerHp - data.damage);
                }
            });
        }
    }

    /**
     * Handle player attack animation
     */
    handlePlayerAttack(data) {
        if (window.playPlayerAttack) {
            window.playPlayerAttack({
                damage: data.damage,
                attackName: data.attack_name || 'Sword Strike',
                onComplete: () => {
                    this.updateEnemyHp(this.enemyHp - data.damage);
                }
            });
        }
    }

    /**
     * Handle critical hit effect
     */
    handleCriticalHit(data) {
        if (window.playCriticalHit) {
            window.playCriticalHit({
                damage: data.damage,
                attacker: data.attacker,
                onComplete: () => {
                    this.showMessage('CRITICAL HIT!', 'warning');
                }
            });
        }
    }

    /**
     * Handle action result from server
     */
    handleActionResult(data) {
        console.log('[Battle] Action result:', data);

        if (data.success) {
            // Update HP values
            if (data.enemy_hp !== undefined) {
                this.updateEnemyHp(data.enemy_hp);
            }
            if (data.player_hp !== undefined) {
                this.updatePlayerHp(data.player_hp);
            }

            // Show action message
            if (data.message) {
                this.showMessage(data.message, 'info');
            }

            // Check for battle end
            if (data.battle_ended) {
                if (data.victory) {
                    this.handleVictory(data);
                } else {
                    this.handleDefeat(data);
                }
            }
        } else {
            this.showMessage(data.error || 'Action failed', 'error');
        }

        // Reset action cooldown
        this.actionCooldown = false;
    }

    /**
     * Handle flee result
     */
    handleFleeResult(data) {
        console.log('[Battle] Flee result:', data);

        if (data.success) {
            this.showMessage('You fled from battle!', 'warning');

            // Reset theme
            this.setTheme('default');

            // Cleanup
            setTimeout(() => {
                this.cleanup();

                // Fire end callback
                if (this.onBattleEnd) {
                    this.onBattleEnd('fled', data);
                }
            }, 1500);
        } else {
            this.showMessage(data.message || 'Cannot flee!', 'error');
        }
    }

    /**
     * Update enemy HP display
     */
    updateEnemyHp(hp) {
        this.enemyHp = Math.max(0, hp);
        const percentage = (this.enemyHp / 100) * 100;

        const enemyHpBar = document.getElementById('enemyHpBar');
        if (enemyHpBar) {
            enemyHpBar.style.width = `${percentage}%`;
        }

        const enemyHpText = document.getElementById('enemyHpText');
        if (enemyHpText) {
            enemyHpText.textContent = `${this.enemyHp}/100`;
        }
    }

    /**
     * Update player HP display
     */
    updatePlayerHp(hp) {
        this.playerHp = Math.max(0, hp);
        const percentage = (this.playerHp / 100) * 100;

        const playerHpBar = document.getElementById('playerHpBar');
        if (playerHpBar) {
            playerHpBar.style.width = `${percentage}%`;
        }

        const playerHpText = document.getElementById('playerHpText');
        if (playerHpText) {
            playerHpText.textContent = `${this.playerHp}/100`;
        }

        // Update main HUD if present
        const mainHpDisplay = document.getElementById('playerHealth');
        if (mainHpDisplay) {
            mainHpDisplay.textContent = this.playerHp;
        }
    }

    /**
     * Show battle UI
     */
    showBattleUI(battleData) {
        console.log('[Battle] Showing battle UI');

        // Create or update battle screen
        let battleScreen = document.getElementById('battleScreen');
        if (!battleScreen) {
            battleScreen = document.createElement('div');
            battleScreen.id = 'battleScreen';
            battleScreen.className = 'battle-screen';
            document.body.appendChild(battleScreen);
        }

        battleScreen.innerHTML = `
            <div class="battle-container">
                <h2 class="battle-title">BATTLE!</h2>

                <div class="battle-combatants">
                    <div class="enemy-info">
                        <h3>${battleData.enemy_name || 'Enemy'}</h3>
                        <div class="hp-bar">
                            <div id="enemyHpBar" class="hp-fill enemy" style="width: 100%"></div>
                        </div>
                        <span id="enemyHpText">100/100</span>
                    </div>

                    <div class="vs-separator">VS</div>

                    <div class="player-info">
                        <h3>${battleData.player_name || 'You'}</h3>
                        <div class="hp-bar">
                            <div id="playerHpBar" class="hp-fill player" style="width: 100%"></div>
                        </div>
                        <span id="playerHpText">100/100</span>
                    </div>
                </div>

                <div class="battle-actions">
                    <button class="battle-btn attack" onclick="battleManager.performAction('attack')">
                        ⚔️ Attack
                    </button>
                    <button class="battle-btn defend" onclick="battleManager.performAction('defend')">
                        🛡️ Defend
                    </button>
                    <button class="battle-btn magic" onclick="battleManager.performAction('magic')">
                        ✨ Magic
                    </button>
                    <button class="battle-btn flee" onclick="battleManager.performAction('flee')">
                        🏃 Flee
                    </button>
                </div>

                <div id="battleMessages" class="battle-messages"></div>
            </div>
        `;

        battleScreen.style.display = 'block';
    }

    /**
     * Hide battle controls
     */
    hideBattleControls() {
        const battleScreen = document.getElementById('battleScreen');
        if (battleScreen) {
            battleScreen.style.display = 'none';
        }
    }

    /**
     * Perform battle action
     */
    async performAction(action) {
        if (this.actionCooldown) {
            console.log('[Battle] Action on cooldown');
            return;
        }

        this.actionCooldown = true;

        try {
            const response = await fetch('/api/battle/action', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    action: action,
                    battle_id: this.currentBattle?.id
                })
            });

            const data = await response.json();
            this.handleActionResult(data);

        } catch (error) {
            console.error('[Battle] Action failed:', error);
            this.showMessage('Action failed', 'error');
            this.actionCooldown = false;
        }
    }

    /**
     * Show message in battle UI
     */
    showMessage(message, type = 'info') {
        const messagesDiv = document.getElementById('battleMessages');
        if (messagesDiv) {
            const msgElement = document.createElement('div');
            msgElement.className = `battle-message ${type}`;
            msgElement.textContent = message;
            messagesDiv.appendChild(msgElement);

            // Auto-remove after 3 seconds
            setTimeout(() => {
                msgElement.remove();
            }, 3000);
        }

        // Also show as toast if available
        if (window.ToastManager) {
            window.ToastManager.show(message, type);
        }
    }
}

// Create global instance
window.battleManager = new BattleManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BattleManager;
}

console.log('[Battle] Enhanced Battle Manager loaded with theme switching');