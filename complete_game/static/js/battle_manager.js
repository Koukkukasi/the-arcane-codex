/**
 * THE ARCANE CODEX - Battle Manager
 * Phase 1: Quick Win Implementation
 *
 * Integrates battle animations with game system
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

        // Bind handlers to maintain 'this' context and allow cleanup
        this.boundHandlers = {
            actionResult: (data) => this.handleActionResult(data),
            battleVictory: (data) => this.handleVictory(data),
            fleeResult: (data) => this.handleFleeResult(data)
        };

        // Don't initialize socket immediately - wait for battle to start
        // This ensures session cookies are set first
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
                // Include credentials to pass authentication
                window.socket = io('http://localhost:5000', {
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: 5,
                    reconnectionDelay: 1000,
                    withCredentials: true,  // Include session cookies
                    auth: {
                        player_id: sessionStorage.getItem('player_id') || 'test_player',
                        username: sessionStorage.getItem('username') || 'TestPlayer'
                    }
                });

                window.socket.on('connect', () => {
                    console.log('[Battle] Socket connected! ID:', window.socket.id);
                    // Register listeners now that socket is connected
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
        if (typeof socket === 'undefined') {
            console.error('[Battle] Cannot register listeners - socket undefined');
            return;
        }

        socket.on('action_result', this.boundHandlers.actionResult);
        socket.on('battle_victory', this.boundHandlers.battleVictory);
        socket.on('flee_result', this.boundHandlers.fleeResult);

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
        if (typeof socket !== 'undefined') {
            socket.off('action_result', this.boundHandlers.actionResult);
            socket.off('battle_victory', this.boundHandlers.battleVictory);
            socket.off('flee_result', this.boundHandlers.fleeResult);
        }

        // Clean up UI
        this.hideBattleControls();
        this.isInBattle = false;
        this.currentBattle = null;

        console.log('[Battle] Cleanup complete');
    }

    /**
     * Start a test battle
     */
    async startTestBattle() {
        try {
            // Get game code from global or session
            let gameCode = window.gameCode || localStorage.getItem('game_code') || 'TEST001';

            // Ensure it's a string, not an object
            if (typeof gameCode !== 'string') {
                gameCode = 'TEST001';
            }

            console.log('[Battle] Starting test battle for game:', gameCode);

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
                return;
            }

            console.log('[Battle] Battle data received:', data);

            // Store battle state
            this.currentBattle = data;
            this.isInBattle = true;
            this.enemyHp = data.enemy.hp;
            this.playerHp = data.player.hp;

            // Initialize socket connection AFTER session is established
            if (!this.socketInitialized) {
                console.log('[Battle] Initializing socket connection after session established');
                this.setupSocketListeners();
                this.socketInitialized = true;
            }

            // Play battle intro animation
            if (window.ArcaneCodex && window.ArcaneCodex.animations) {
                window.ArcaneCodex.animations.playBattleIntro({
                    enemyName: data.enemy.name,
                    enemyIcon: data.enemy.icon,
                    flavorText: data.enemy.flavor_text,
                    battleType: data.enemy.type,
                    onComplete: () => {
                        console.log('[Battle] Animation complete, showing controls');
                        this.showBattleControls();
                    }
                });
            } else {
                console.warn('[Battle] Animation system not available');
                this.showBattleControls();
            }

        } catch (error) {
            console.error('[Battle] Error starting test battle:', error);
            this.showMessage('Failed to start battle: ' + error.message, 'error');
        }
    }

    /**
     * Show battle control buttons
     */
    showBattleControls() {
        // Remove existing controls if any
        const existing = document.getElementById('battle-controls');
        if (existing) existing.remove();

        const controls = document.createElement('div');
        controls.id = 'battle-controls';
        controls.style.cssText = `
            position: fixed;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            background: rgba(10, 14, 39, 0.95);
            padding: 20px 30px;
            border-radius: 15px;
            border: 2px solid #a78bfa;
            box-shadow: 0 0 30px rgba(167, 139, 250, 0.5);
            display: flex;
            gap: 15px;
            font-family: 'MedievalSharp', cursive;
        `;

        // Create buttons with event listeners (no inline handlers)
        const attackBtn = document.createElement('button');
        attackBtn.id = 'attack-btn';
        attackBtn.className = 'battle-btn attack-btn';
        attackBtn.textContent = '⚔️ Attack';
        attackBtn.addEventListener('click', () => this.attack());

        const defendBtn = document.createElement('button');
        defendBtn.id = 'defend-btn';
        defendBtn.className = 'battle-btn defend-btn';
        defendBtn.textContent = '🛡️ Defend';
        defendBtn.addEventListener('click', () => this.defend());

        const fleeBtn = document.createElement('button');
        fleeBtn.id = 'flee-btn';
        fleeBtn.className = 'battle-btn flee-btn';
        fleeBtn.textContent = '🏃 Flee';
        fleeBtn.addEventListener('click', () => this.flee());

        controls.appendChild(attackBtn);
        controls.appendChild(defendBtn);
        controls.appendChild(fleeBtn);

        document.body.appendChild(controls);

        // Add styles for battle buttons
        const style = document.createElement('style');
        style.textContent = `
            .battle-btn {
                padding: 12px 24px;
                font-size: 16px;
                font-family: 'MedievalSharp', cursive;
                border: 2px solid;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-weight: bold;
            }

            .attack-btn {
                background: linear-gradient(135deg, #ef4444, #dc2626);
                border-color: #991b1b;
                color: white;
            }

            .attack-btn:hover {
                background: linear-gradient(135deg, #dc2626, #b91c1c);
                transform: scale(1.05);
            }

            .defend-btn {
                background: linear-gradient(135deg, #3b82f6, #2563eb);
                border-color: #1e40af;
                color: white;
            }

            .defend-btn:hover {
                background: linear-gradient(135deg, #2563eb, #1d4ed8);
                transform: scale(1.05);
            }

            .flee-btn {
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-color: #92400e;
                color: white;
            }

            .flee-btn:hover {
                background: linear-gradient(135deg, #d97706, #b45309);
                transform: scale(1.05);
            }
        `;
        document.head.appendChild(style);

        this.showMessage(`⚔️ Battle Started! Enemy: ${this.currentBattle.enemy.name}`, 'info');
    }

    /**
     * Hide battle controls
     */
    hideBattleControls() {
        const controls = document.getElementById('battle-controls');
        if (controls) {
            controls.remove();
        }
    }

    /**
     * Player attacks
     */
    attack() {
        if (!this.isInBattle || this.actionCooldown) {
            console.warn('[Battle] Action blocked - cooldown or not in battle');
            return;
        }

        console.log('[Battle] Player attacks');
        this.actionCooldown = true;
        this.disableControls();

        const gameCode = window.gameCode || localStorage.getItem('game_code');

        // Check if socket is available and connected
        if (typeof socket !== 'undefined' && socket && socket.connected) {
            socket.emit('battle_action', {
                game_code: gameCode,
                action: 'attack'
            });
        } else {
            // Test mode: simulate attack locally
            console.log('[Battle] Test mode - simulating attack locally');
            this.simulateAttack();
        }

        // Reset cooldown after delay
        setTimeout(() => {
            this.actionCooldown = false;
        }, this.cooldownTime);
    }

    /**
     * Simulate attack in test mode (no socket)
     */
    simulateAttack() {
        const damage = Math.floor(Math.random() * 20) + 10;
        this.enemyHp = Math.max(0, this.enemyHp - damage);

        this.showMessage(`💥 You deal ${damage} damage!`, 'success');

        // Simulate enemy death
        if (this.enemyHp <= 0) {
            setTimeout(() => {
                this.handleVictory({
                    message: 'Victory! The goblin falls!',
                    rewards: {
                        xp: 25,
                        gold: 10
                    }
                });
            }, 1000);
        } else {
            // Re-enable controls after cooldown
            setTimeout(() => {
                this.enableControls();
            }, this.cooldownTime);
        }
    }

    /**
     * Player defends
     */
    defend() {
        if (!this.isInBattle || this.actionCooldown) {
            console.warn('[Battle] Action blocked - cooldown or not in battle');
            return;
        }

        console.log('[Battle] Player defends');
        this.actionCooldown = true;
        this.disableControls();

        const gameCode = window.gameCode || localStorage.getItem('game_code');

        if (typeof socket !== 'undefined' && socket && socket.connected) {
            socket.emit('battle_action', {
                game_code: gameCode,
                action: 'defend'
            });
        } else {
            // Test mode
            console.log('[Battle] Test mode - simulating defend');
            this.showMessage('🛡️ You brace for impact!', 'info');
            setTimeout(() => {
                this.enableControls();
            }, this.cooldownTime);
        }

        // Reset cooldown after delay
        setTimeout(() => {
            this.actionCooldown = false;
        }, this.cooldownTime);
    }

    /**
     * Player flees
     */
    flee() {
        if (!this.isInBattle || this.actionCooldown) {
            console.warn('[Battle] Action blocked - cooldown or not in battle');
            return;
        }

        console.log('[Battle] Player attempts to flee');
        this.actionCooldown = true;
        this.disableControls();

        const gameCode = window.gameCode || localStorage.getItem('game_code');

        if (typeof socket !== 'undefined' && socket && socket.connected) {
            socket.emit('battle_action', {
                game_code: gameCode,
                action: 'flee'
            });
        } else {
            // Test mode
            console.log('[Battle] Test mode - simulating flee');
            const success = Math.random() > 0.5;
            this.handleFleeResult({
                success: success,
                message: success ? 'You escaped!' : 'Failed to escape!'
            });
        }

        // Reset cooldown after delay
        setTimeout(() => {
            this.actionCooldown = false;
        }, this.cooldownTime);
    }

    /**
     * Disable controls during action
     */
    disableControls() {
        const buttons = document.querySelectorAll('.battle-btn');
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
        });
    }

    /**
     * Enable controls
     */
    enableControls() {
        const buttons = document.querySelectorAll('.battle-btn');
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
        });
    }

    /**
     * Handle action result from server
     */
    handleActionResult(data) {
        console.log('[Battle] Action result:', data);

        if (data.action === 'attack') {
            const critText = data.critical ? ' CRITICAL HIT!' : '';
            this.showMessage(`💥 ${data.message}${critText}`, data.critical ? 'success' : 'info');

            this.enemyHp = data.remaining_enemy_hp;
        } else if (data.action === 'defend') {
            this.showMessage(`🛡️ ${data.message}`, 'info');
        }

        // Re-enable controls for next action
        setTimeout(() => {
            this.enableControls();
        }, 500);
    }

    /**
     * Handle victory
     */
    handleVictory(data) {
        console.log('[Battle] Victory!', data);

        this.isInBattle = false;
        this.hideBattleControls();

        // Show victory message
        this.showMessage(data.message, 'success');

        if (data.rewards) {
            setTimeout(() => {
                this.showMessage(`Rewards: +${data.rewards.xp} XP, +${data.rewards.gold} Gold`, 'success');
            }, 1000);
        }
    }

    /**
     * Handle flee result
     */
    handleFleeResult(data) {
        console.log('[Battle] Flee result:', data);

        if (data.success) {
            this.isInBattle = false;
            this.hideBattleControls();
            this.showMessage(data.message, 'success');
        } else {
            this.showMessage(data.message, 'error');
            setTimeout(() => {
                this.enableControls();
            }, 500);
        }
    }

    /**
     * Show message to player
     */
    showMessage(message, type = 'info') {
        // Try to use existing toast notification system if available
        if (window.effectNotifications && typeof window.effectNotifications.show === 'function') {
            window.effectNotifications.show(message, type);
            return;
        }

        // Fallback: create simple notification
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            font-family: 'MedievalSharp', cursive;
            z-index: 10001;
            animation: slideIn 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize battle manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.battleManager = new BattleManager();
        console.log('[Battle] Battle Manager initialized');
    });
} else {
    window.battleManager = new BattleManager();
    console.log('[Battle] Battle Manager initialized');
}

// Clean up on page unload to prevent memory leaks
window.addEventListener('beforeunload', () => {
    if (window.battleManager) {
        window.battleManager.cleanup();
    }
});
