/**
 * Multiplayer Integration Module
 * Integrates multiplayer functionality into the main game
 * This file contains snippets to add to game_flow_beautiful_integrated.html
 */

// ============================================
// INTEGRATION INSTRUCTIONS
// ============================================
/**
 * 1. Add these script tags to the <head> section of game_flow_beautiful_integrated.html:
 *
 * <!-- Socket.IO -->
 * <script src="/socket.io/socket.io.js"></script>
 *
 * <!-- Multiplayer System -->
 * <script src="js/multiplayer_client.js"></script>
 * <script src="js/multiplayer_integration.js"></script>
 *
 * 2. Add this CSS link:
 * <link rel="stylesheet" href="css/multiplayer.css">
 *
 * 3. Add the multiplayer UI elements to your game HTML (see below)
 */

// ============================================
// MULTIPLAYER GAME INTEGRATION
// ============================================

class MultiplayerGameIntegration {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.multiplayerMode = false;
        this.partyCode = null;
        this.syncInterval = null;
        this.lastSyncTime = 0;
        this.syncDelay = 100; // ms between syncs

        // Initialize multiplayer button in main menu
        this.initializeMultiplayerButton();

        // Setup multiplayer event handlers
        this.setupMultiplayerHandlers();
    }

    /**
     * Initialize multiplayer button in main menu
     */
    initializeMultiplayerButton() {
        // Add this HTML to your main menu:
        const multiplayerButtonHTML = `
            <!-- Add to main menu buttons -->
            <button id="multiplayerModeBtn" class="menu-button mystical-button">
                <span class="button-icon">⚔</span>
                <span class="button-text">MULTIPLAYER MODE</span>
                <span class="button-subtitle">Team up with other heroes</span>
            </button>

            <!-- Multiplayer Mode Selector Modal -->
            <div id="multiplayerModal" class="modal-overlay" style="display: none;">
                <div class="modal-content">
                    <h2 class="modal-title">Choose Multiplayer Mode</h2>
                    <div class="multiplayer-options">
                        <button class="mp-option-btn" id="createPartyBtn">
                            <span class="option-icon">👑</span>
                            <span class="option-title">CREATE PARTY</span>
                            <span class="option-desc">Start a new adventure as host</span>
                        </button>
                        <button class="mp-option-btn" id="joinPartyBtn">
                            <span class="option-icon">🤝</span>
                            <span class="option-title">JOIN PARTY</span>
                            <span class="option-desc">Join an existing party</span>
                        </button>
                        <button class="mp-option-btn" id="quickMatchBtn">
                            <span class="option-icon">⚡</span>
                            <span class="option-title">QUICK MATCH</span>
                            <span class="option-desc">Join a random public party</span>
                        </button>
                    </div>
                    <button class="modal-close" id="closeMultiplayerModal">✕</button>
                </div>
            </div>

            <!-- Quick Party Join -->
            <div id="quickJoinPanel" class="quick-join-panel" style="display: none;">
                <h3>Join Party</h3>
                <input type="text" id="quickPartyCode" placeholder="Enter Party Code" maxlength="9">
                <button id="quickJoinBtn">JOIN</button>
                <button id="cancelQuickJoin">CANCEL</button>
            </div>
        `;

        // Add event listeners
        const multiplayerBtn = document.getElementById('multiplayerModeBtn');
        if (multiplayerBtn) {
            multiplayerBtn.addEventListener('click', () => this.showMultiplayerOptions());
        }
    }

    /**
     * Show multiplayer options modal
     */
    showMultiplayerOptions() {
        const modal = document.getElementById('multiplayerModal');
        if (modal) {
            modal.style.display = 'flex';

            // Setup option buttons
            document.getElementById('createPartyBtn')?.addEventListener('click', () => {
                this.startMultiplayerMode('create');
                modal.style.display = 'none';
            });

            document.getElementById('joinPartyBtn')?.addEventListener('click', () => {
                this.startMultiplayerMode('join');
                modal.style.display = 'none';
            });

            document.getElementById('quickMatchBtn')?.addEventListener('click', () => {
                this.startMultiplayerMode('quick');
                modal.style.display = 'none';
            });

            document.getElementById('closeMultiplayerModal')?.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }
    }

    /**
     * Start multiplayer mode
     */
    startMultiplayerMode(mode) {
        this.multiplayerMode = true;

        // Connect to multiplayer server
        if (!multiplayerClient.isConnected) {
            multiplayerClient.connect();
        }

        switch (mode) {
            case 'create':
                // Redirect to multiplayer lobby as host
                window.location.href = '/multiplayer_lobby.html?mode=create';
                break;

            case 'join':
                // Show quick join panel
                this.showQuickJoinPanel();
                break;

            case 'quick':
                // Find and join a random public party
                this.quickMatchJoin();
                break;
        }
    }

    /**
     * Show quick join panel
     */
    showQuickJoinPanel() {
        const panel = document.getElementById('quickJoinPanel');
        if (panel) {
            panel.style.display = 'block';

            document.getElementById('quickJoinBtn')?.addEventListener('click', () => {
                const code = document.getElementById('quickPartyCode')?.value;
                if (code) {
                    this.joinPartyWithCode(code);
                }
            });

            document.getElementById('cancelQuickJoin')?.addEventListener('click', () => {
                panel.style.display = 'none';
            });
        }
    }

    /**
     * Join party with code
     */
    async joinPartyWithCode(code) {
        try {
            // Validate code format
            const cleanCode = code.replace('-', '').toUpperCase();
            if (cleanCode.length !== 8) {
                this.showNotification('Invalid party code', 'error');
                return;
            }

            // Redirect to lobby with party code
            window.location.href = `/multiplayer_lobby.html?mode=join&code=${cleanCode}`;
        } catch (error) {
            console.error('Error joining party:', error);
            this.showNotification('Failed to join party', 'error');
        }
    }

    /**
     * Quick match join
     */
    async quickMatchJoin() {
        try {
            // Fetch available public parties
            const response = await fetch('/api/multiplayer/parties/public');
            const data = await response.json();

            if (data.success && data.parties.length > 0) {
                // Join the first available party
                const party = data.parties[0];
                window.location.href = `/multiplayer_lobby.html?mode=join&code=${party.code}`;
            } else {
                this.showNotification('No public parties available', 'warning');
                // Offer to create one instead
                setTimeout(() => {
                    if (confirm('No public parties found. Would you like to create one?')) {
                        window.location.href = '/multiplayer_lobby.html?mode=create&public=true';
                    }
                }, 500);
            }
        } catch (error) {
            console.error('Error finding public party:', error);
            this.showNotification('Failed to find public parties', 'error');
        }
    }

    /**
     * Setup multiplayer event handlers for game events
     */
    setupMultiplayerHandlers() {
        if (!this.multiplayerMode) return;

        // Listen for multiplayer events
        multiplayerClient.on('battle_action', (data) => {
            this.handleRemoteBattleAction(data);
        });

        multiplayerClient.on('scenario_choice_made', (data) => {
            this.handleRemoteScenarioChoice(data);
        });

        multiplayerClient.on('phase_changed', (data) => {
            this.handlePhaseChange(data);
        });

        multiplayerClient.on('player_ready_changed', (data) => {
            this.handlePlayerReady(data);
        });

        // Override game functions to sync with multiplayer
        this.overrideGameFunctions();
    }

    /**
     * Override game functions for multiplayer sync
     */
    overrideGameFunctions() {
        // Store original functions
        const originalBattleAction = this.game.executeBattleAction;
        const originalScenarioChoice = this.game.makeScenarioChoice;
        const originalPhaseTransition = this.game.transitionToPhase;

        // Override battle action
        this.game.executeBattleAction = async (action) => {
            // Execute locally first
            const result = await originalBattleAction.call(this.game, action);

            // Sync with multiplayer
            if (this.multiplayerMode && multiplayerClient.isConnected) {
                await multiplayerClient.sendBattleAction(
                    action.type,
                    action.targetId,
                    action.abilityId
                );
            }

            return result;
        };

        // Override scenario choice
        this.game.makeScenarioChoice = async (choiceId) => {
            // Execute locally first
            const result = await originalScenarioChoice.call(this.game, choiceId);

            // Sync with multiplayer
            if (this.multiplayerMode && multiplayerClient.isConnected) {
                await multiplayerClient.sendScenarioChoice(
                    this.game.currentScenarioId,
                    choiceId
                );
            }

            return result;
        };

        // Override phase transition
        this.game.transitionToPhase = async (phase) => {
            // Execute locally first
            const result = await originalPhaseTransition.call(this.game, phase);

            // Sync with multiplayer
            if (this.multiplayerMode && multiplayerClient.isConnected) {
                // Only host can change phases
                if (this.isHost()) {
                    this.broadcastPhaseChange(phase);
                }
            }

            return result;
        };
    }

    /**
     * Handle remote battle action from another player
     */
    handleRemoteBattleAction(data) {
        // Don't process our own actions
        if (data.playerId === multiplayerClient.playerId) return;

        // Apply the action to the game state
        this.game.applyRemoteAction({
            type: data.actionType,
            targetId: data.targetId,
            abilityId: data.abilityId,
            playerId: data.playerId,
            timestamp: data.timestamp
        });

        // Update UI to show the action
        this.displayRemoteAction(data);
    }

    /**
     * Handle remote scenario choice from another player
     */
    handleRemoteScenarioChoice(data) {
        // Don't process our own choices
        if (data.playerId === multiplayerClient.playerId) return;

        // Show that another player made a choice (without revealing what)
        this.showNotification(`${data.playerName} has made their choice`, 'info');

        // Update choice counter
        this.updateChoiceCounter(data.playerId);
    }

    /**
     * Handle phase change from host
     */
    handlePhaseChange(data) {
        // Sync local game to new phase
        this.game.currentPhase = data.phase;
        this.game.updatePhaseUI(data.phase);

        // Show notification
        this.showNotification(`Phase changed to: ${data.phase}`, 'info');
    }

    /**
     * Handle player ready status
     */
    handlePlayerReady(data) {
        // Update player list UI
        this.updatePlayerReadyStatus(data.playerId, data.isReady);

        // Check if all players are ready
        if (this.checkAllPlayersReady()) {
            // Start the game if host
            if (this.isHost()) {
                this.startMultiplayerGame();
            }
        }
    }

    /**
     * Display remote action in UI
     */
    displayRemoteAction(data) {
        // Create action notification
        const actionEl = document.createElement('div');
        actionEl.className = 'remote-action-notification';
        actionEl.innerHTML = `
            <span class="action-player">${data.playerName}</span>
            <span class="action-type">${data.actionType}</span>
            <span class="action-target">→ ${data.targetName || 'Target'}</span>
        `;

        // Add to battle log
        const battleLog = document.getElementById('battleLog');
        if (battleLog) {
            battleLog.appendChild(actionEl);
            battleLog.scrollTop = battleLog.scrollHeight;
        }

        // Animate the action
        this.animateBattleAction(data);
    }

    /**
     * Animate battle action
     */
    animateBattleAction(data) {
        // Add visual effects for the action
        const targetEl = document.querySelector(`[data-entity-id="${data.targetId}"]`);
        if (targetEl) {
            targetEl.classList.add('action-target');
            setTimeout(() => targetEl.classList.remove('action-target'), 1000);
        }

        // Play sound effect
        this.playActionSound(data.actionType);
    }

    /**
     * Start multiplayer game
     */
    async startMultiplayerGame() {
        // Transition from lobby to game
        this.showNotification('Starting multiplayer game!', 'success');

        // Start game with multiplayer settings
        this.game.startGame({
            multiplayer: true,
            partyCode: this.partyCode,
            players: await this.getPartyPlayers()
        });
    }

    /**
     * Get party players
     */
    async getPartyPlayers() {
        try {
            const response = await fetch(`/api/multiplayer/party/${this.partyCode}/players`);
            const data = await response.json();
            return data.players || [];
        } catch (error) {
            console.error('Error fetching party players:', error);
            return [];
        }
    }

    /**
     * Check if current player is host
     */
    isHost() {
        // Implementation depends on your game structure
        return this.game.isHost || false;
    }

    /**
     * Check if all players are ready
     */
    checkAllPlayersReady() {
        // Implementation depends on your game structure
        return this.game.allPlayersReady || false;
    }

    /**
     * Update player ready status in UI
     */
    updatePlayerReadyStatus(playerId, isReady) {
        const playerEl = document.querySelector(`[data-player-id="${playerId}"]`);
        if (playerEl) {
            playerEl.classList.toggle('is-ready', isReady);
        }
    }

    /**
     * Update choice counter
     */
    updateChoiceCounter(playerId) {
        // Update UI to show player has made a choice
        const counterEl = document.getElementById('choiceCounter');
        if (counterEl) {
            const current = parseInt(counterEl.textContent) || 0;
            counterEl.textContent = current + 1;
        }
    }

    /**
     * Broadcast phase change to other players
     */
    broadcastPhaseChange(phase) {
        // This would be handled by the server
        // The server receives the phase change and broadcasts to all players
    }

    /**
     * Play action sound effect
     */
    playActionSound(actionType) {
        // Map action types to sound files
        const sounds = {
            'attack': 'sword_clash.mp3',
            'defend': 'shield_block.mp3',
            'heal': 'heal_spell.mp3',
            'cast': 'magic_cast.mp3'
        };

        const soundFile = sounds[actionType] || 'default_action.mp3';

        // Play the sound
        const audio = new Audio(`/static/sounds/${soundFile}`);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Audio play failed:', e));
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `game-notification ${type}`;
        toast.innerHTML = `
            <span class="notification-icon">${this.getNotificationIcon(type)}</span>
            <span class="notification-text">${message}</span>
        `;

        // Add to container
        let container = document.getElementById('notificationContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificationContainer';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * Get notification icon
     */
    getNotificationIcon(type) {
        const icons = {
            'success': '✓',
            'error': '✕',
            'warning': '⚠',
            'info': 'ℹ'
        };
        return icons[type] || 'ℹ';
    }

    /**
     * Sync game state with server
     */
    async syncGameState() {
        if (!this.multiplayerMode || !multiplayerClient.isConnected) return;

        // Throttle syncs
        const now = Date.now();
        if (now - this.lastSyncTime < this.syncDelay) return;
        this.lastSyncTime = now;

        try {
            const gameState = await multiplayerClient.requestSync('partial');
            this.applyGameStateSync(gameState);
        } catch (error) {
            console.error('Error syncing game state:', error);
        }
    }

    /**
     * Apply game state sync from server
     */
    applyGameStateSync(gameState) {
        // Update local game state with server state
        if (gameState.phase) this.game.currentPhase = gameState.phase;
        if (gameState.players) this.game.updatePlayers(gameState.players);
        if (gameState.enemies) this.game.updateEnemies(gameState.enemies);
        if (gameState.turn) this.game.currentTurn = gameState.turn;
    }

    /**
     * Start sync interval
     */
    startSyncInterval() {
        if (this.syncInterval) return;

        this.syncInterval = setInterval(() => {
            this.syncGameState();
        }, 1000); // Sync every second
    }

    /**
     * Stop sync interval
     */
    stopSyncInterval() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    /**
     * Cleanup on disconnect
     */
    cleanup() {
        this.stopSyncInterval();
        this.multiplayerMode = false;
        multiplayerClient.disconnect();
    }
}

// ============================================
// CSS STYLES TO ADD TO GAME
// ============================================
const multiplayerGameStyles = `
<style>
/* Multiplayer UI Additions for Main Game */

.menu-button.multiplayer-button {
    background: linear-gradient(135deg, rgba(0, 255, 0, 0.1), rgba(255, 0, 255, 0.1));
    border: 2px solid var(--mp-green);
    position: relative;
    overflow: hidden;
}

.menu-button.multiplayer-button::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(45deg, transparent, rgba(0, 255, 0, 0.3), transparent);
    animation: shimmer 3s linear infinite;
}

@keyframes shimmer {
    0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
    100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
}

.multiplayer-options {
    display: grid;
    gap: 15px;
    margin-top: 20px;
}

.mp-option-btn {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 20px;
    background: rgba(0, 0, 0, 0.7);
    border: 2px solid var(--mp-border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 300ms;
}

.mp-option-btn:hover {
    background: rgba(0, 255, 0, 0.1);
    border-color: var(--mp-green);
    transform: translateX(5px);
}

.option-icon {
    font-size: 2rem;
}

.option-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--mp-green);
    letter-spacing: 1px;
}

.option-desc {
    font-size: 0.9rem;
    color: var(--mp-green-dim);
    opacity: 0.8;
}

.quick-join-panel {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--mp-bg-secondary);
    border: 2px solid var(--mp-green);
    border-radius: 15px;
    padding: 30px;
    z-index: 1000;
    text-align: center;
}

.quick-join-panel input {
    width: 100%;
    padding: 15px;
    margin: 15px 0;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--mp-border);
    border-radius: 8px;
    color: var(--mp-green);
    font-size: 1.2rem;
    text-align: center;
    letter-spacing: 2px;
}

.remote-action-notification {
    padding: 10px 15px;
    background: rgba(255, 0, 255, 0.1);
    border-left: 3px solid var(--mp-magenta);
    margin-bottom: 5px;
    animation: slideIn 300ms ease-out;
}

@keyframes slideIn {
    from { transform: translateX(-20px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.action-player {
    color: var(--mp-magenta);
    font-weight: 600;
}

.action-type {
    color: var(--mp-gold);
    margin: 0 10px;
}

.action-target {
    color: var(--mp-green-dim);
}

.action-target {
    animation: targetPulse 1s ease-out;
}

@keyframes targetPulse {
    0% { filter: brightness(1); }
    50% { filter: brightness(1.5) drop-shadow(0 0 20px var(--mp-gold)); }
    100% { filter: brightness(1); }
}

.notification-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.game-notification {
    padding: 15px 20px;
    background: var(--mp-bg-secondary);
    border: 2px solid var(--mp-green);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
    animation: notificationSlide 300ms ease-out;
}

@keyframes notificationSlide {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

.game-notification.fade-out {
    animation: notificationFade 300ms ease-in forwards;
}

@keyframes notificationFade {
    to { transform: translateX(100%); opacity: 0; }
}

.notification-icon {
    font-size: 1.2rem;
}

.notification-text {
    color: rgba(255, 255, 255, 0.9);
}

.game-notification.success {
    border-color: var(--mp-green);
    background: rgba(0, 255, 0, 0.1);
}

.game-notification.error {
    border-color: var(--mp-red);
    background: rgba(255, 51, 51, 0.1);
}

.game-notification.warning {
    border-color: var(--mp-gold);
    background: rgba(255, 176, 0, 0.1);
}

.game-notification.info {
    border-color: var(--mp-cyan);
    background: rgba(0, 255, 255, 0.1);
}
</style>
`;

// ============================================
// INITIALIZATION CODE
// ============================================

// Initialize multiplayer integration when game loads
document.addEventListener('DOMContentLoaded', () => {
    // Check if game instance exists
    if (window.gameInstance) {
        window.multiplayerIntegration = new MultiplayerGameIntegration(window.gameInstance);
        console.log('[MULTIPLAYER] Integration initialized');
    } else {
        console.warn('[MULTIPLAYER] Game instance not found. Waiting for game initialization...');

        // Wait for game to initialize
        const checkInterval = setInterval(() => {
            if (window.gameInstance) {
                window.multiplayerIntegration = new MultiplayerGameIntegration(window.gameInstance);
                console.log('[MULTIPLAYER] Integration initialized (delayed)');
                clearInterval(checkInterval);
            }
        }, 100);

        // Stop checking after 10 seconds
        setTimeout(() => clearInterval(checkInterval), 10000);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MultiplayerGameIntegration;
}