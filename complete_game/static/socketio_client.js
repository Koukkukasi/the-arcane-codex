/**
 * PHASE H: Real-Time Multiplayer - SocketIO Client Integration
 *
 * This module provides:
 * - SocketIO connection management
 * - Real-time event handling
 * - Reconnection logic with exponential backoff
 * - Presence tracking
 * - Event-driven UI updates
 *
 * Usage:
 * 1. Include Socket.IO CDN script in HTML
 * 2. Import this module
 * 3. Initialize with initSocketIO()
 * 4. Set up event listeners
 */

// ============================================================================
// SOCKETIO CLIENT STATE
// ============================================================================

let socket = null;
let reconnectAttempts = 0;
let maxReconnectAttempts = 10;
let reconnectDelay = 1000; // Start with 1 second
let isConnected = false;
let currentGameCode = null;
let currentPlayerId = null;

// Event callbacks
const eventCallbacks = {
    onPlayerJoined: [],
    onPlayerLeft: [],
    onPlayerReconnected: [],
    onChoiceSubmitted: [],
    onNewScenario: [],
    onTurnResolved: [],
    onPresenceUpdate: [],
    onConnectionChange: [],
    onError: []
};

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize SocketIO connection
 *
 * @param {Object} options - Configuration options
 * @param {string} options.gameCode - Current game code (if in a game)
 * @param {string} options.playerId - Current player ID
 * @returns {Object} Socket instance
 */
function initSocketIO(options = {}) {
    if (socket) {
        console.log('[SocketIO] Already initialized');
        return socket;
    }

    currentGameCode = options.gameCode || null;
    currentPlayerId = options.playerId || null;

    // Initialize Socket.IO connection
    socket = io({
        transports: ['websocket', 'polling'],
        upgrade: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        timeout: 20000
    });

    setupSocketHandlers();

    console.log('[SocketIO] Initialized');
    return socket;
}

/**
 * Setup all socket event handlers
 */
function setupSocketHandlers() {
    // Connection events
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect', handleReconnect);
    socket.on('reconnect_sync', handleReconnectSync);

    // Game session events
    socket.on('player_joined', handlePlayerJoined);
    socket.on('player_connected', handlePlayerConnected);
    socket.on('player_disconnected', handlePlayerDisconnected);
    socket.on('player_reconnected', handlePlayerReconnected);

    // Scenario events
    socket.on('player_chose', handlePlayerChose);
    socket.on('new_scenario', handleNewScenario);
    socket.on('turn_resolution', handleTurnResolution);

    // Presence events
    socket.on('presence_update', handlePresenceUpdate);

    // Utility events
    socket.on('pong', handlePong);
    socket.on('player_typing', handlePlayerTyping);

    // Error events
    socket.on('error', handleError);

    console.log('[SocketIO] Event handlers registered');
}

// ============================================================================
// CONNECTION HANDLERS
// ============================================================================

function handleConnect() {
    console.log('[SocketIO] Connected:', socket.id);
    isConnected = true;
    reconnectAttempts = 0;
    reconnectDelay = 1000;

    // Update UI
    updateConnectionStatus(true);
    triggerCallbacks('onConnectionChange', { connected: true });

    // Join game room if in a game
    if (currentGameCode) {
        joinGameRoom(currentGameCode);
    }

    // Hide reconnection overlay
    hideReconnectionOverlay();
}

function handleDisconnect(reason) {
    console.log('[SocketIO] Disconnected:', reason);
    isConnected = false;

    // Update UI
    updateConnectionStatus(false);
    triggerCallbacks('onConnectionChange', { connected: false, reason });

    // Show reconnection overlay if unexpected disconnect
    if (reason !== 'io client disconnect') {
        showReconnectionOverlay();
    }
}

function handleConnectError(error) {
    console.error('[SocketIO] Connection error:', error);
    reconnectAttempts++;

    if (reconnectAttempts >= maxReconnectAttempts) {
        console.error('[SocketIO] Max reconnection attempts reached');
        showMaxReconnectError();
    } else {
        // Exponential backoff
        reconnectDelay = Math.min(reconnectDelay * 1.5, 10000);
        updateReconnectionStatus(`Reconnecting... (Attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
    }
}

function handleReconnect(attemptNumber) {
    console.log('[SocketIO] Reconnected after', attemptNumber, 'attempts');

    // Request full state sync
    if (currentGameCode) {
        socket.emit('reconnect', {
            game_code: currentGameCode,
            player_id: currentPlayerId
        });
    }
}

function handleReconnectSync(data) {
    console.log('[SocketIO] Received reconnect sync:', data);

    // Update game state from sync data
    if (data.scenario) {
        updateScenarioUI(data.scenario);
    }

    if (data.players) {
        updatePlayersUI(data.players);
    }

    // Notify user
    showNotification('Reconnected successfully!', 'success');
}

// ============================================================================
// GAME SESSION HANDLERS
// ============================================================================

function handlePlayerJoined(data) {
    console.log('[SocketIO] Player joined:', data.player_name);

    // Update player list UI
    addPlayerToUI(data);

    // Show notification
    showNotification(`${data.player_name} joined the game`, 'info');

    // Trigger callbacks
    triggerCallbacks('onPlayerJoined', data);
}

function handlePlayerConnected(data) {
    console.log('[SocketIO] Player connected:', data.player_name);

    // Update presence indicator
    updatePlayerPresence(data.player_id, true);

    // Show subtle notification
    showPresenceNotification(`${data.player_name} is online`, 'online');

    // Trigger callbacks
    triggerCallbacks('onPlayerJoined', data);
}

function handlePlayerDisconnected(data) {
    console.log('[SocketIO] Player disconnected:', data.player_name);

    // Update presence indicator
    updatePlayerPresence(data.player_id, false);

    // Show subtle notification
    showPresenceNotification(`${data.player_name} went offline`, 'offline');

    // Trigger callbacks
    triggerCallbacks('onPlayerLeft', data);
}

function handlePlayerReconnected(data) {
    console.log('[SocketIO] Player reconnected:', data.player_name);

    // Update presence indicator
    updatePlayerPresence(data.player_id, true);

    // Show notification
    showPresenceNotification(`${data.player_name} reconnected`, 'online');

    // Trigger callbacks
    triggerCallbacks('onPlayerReconnected', data);
}

// ============================================================================
// SCENARIO HANDLERS
// ============================================================================

function handlePlayerChose(data) {
    console.log('[SocketIO] Player made choice:', data.player_name);

    // Update waiting list UI
    updateWaitingList(data.waiting_for);

    // Update progress bar
    updateChoiceProgress(data.choices_submitted, data.total_players);

    // Show notification if all choices in
    if (data.all_submitted) {
        showNotification('All players have chosen! Ready to resolve turn.', 'success');
        enableResolveTurnButton();
    } else {
        showNotification(`${data.player_name} has made their choice`, 'info');
    }

    // Trigger callbacks
    triggerCallbacks('onChoiceSubmitted', data);
}

function handleNewScenario(data) {
    console.log('[SocketIO] New scenario generated:', data.scenario_id);

    // Play location transition animation if available
    if (window.ArcaneCodex && window.ArcaneCodex.animations) {
        window.ArcaneCodex.animations.playLocationTransition({
            locationName: data.theme || 'New Challenge',
            locationIcon: '🗺️',
            description: 'A new scenario unfolds...',
            onComplete: () => {
                // Show dramatic notification
                showScenarioNotification('A new challenge awaits...');

                // Reload scenario data
                loadCurrentScenario();
            }
        });
    } else {
        // Fallback if animations not loaded
        showScenarioNotification('A new challenge awaits...');
        loadCurrentScenario();
    }

    // Trigger callbacks
    triggerCallbacks('onNewScenario', data);
}

function handleTurnResolution(data) {
    console.log('[SocketIO] Turn resolved:', data.turn_number);

    // Show resolution notification
    showResolutionNotification(data);

    // Reload game state
    reloadGameState();

    // Trigger callbacks
    triggerCallbacks('onTurnResolved', data);
}

// ============================================================================
// PRESENCE HANDLERS
// ============================================================================

function handlePresenceUpdate(data) {
    console.log('[SocketIO] Presence update:', data);

    // Update all player presence indicators
    if (data.players) {
        data.players.forEach(player => {
            updatePlayerPresence(player.player_id, player.online);
        });
    }

    // Update online count
    updateOnlineCount(data.online_players.length, data.total_players);

    // Trigger callbacks
    triggerCallbacks('onPresenceUpdate', data);
}

// ============================================================================
// UTILITY HANDLERS
// ============================================================================

function handlePong(data) {
    console.log('[SocketIO] Pong received:', data.timestamp);
    // Used for connection testing
}

function handlePlayerTyping(data) {
    console.log('[SocketIO] Player typing:', data.player_name, data.is_typing);

    // Show/hide typing indicator
    updateTypingIndicator(data.player_id, data.is_typing, data.player_name);
}

function handleError(data) {
    console.error('[SocketIO] Error:', data);

    // Show error notification
    showNotification(data.message || 'An error occurred', 'error');

    // Trigger callbacks
    triggerCallbacks('onError', data);
}

// ============================================================================
// EMIT FUNCTIONS (Client → Server)
// ============================================================================

/**
 * Join a game room
 * @param {string} gameCode - Game code to join
 */
function joinGameRoom(gameCode) {
    if (!socket || !isConnected) {
        console.warn('[SocketIO] Cannot join room - not connected');
        return;
    }

    currentGameCode = gameCode;
    socket.emit('join_game_room', { game_code: gameCode });
    console.log('[SocketIO] Joining room:', gameCode);
}

/**
 * Notify room that player submitted choice
 */
function emitChoiceSubmitted() {
    if (!socket || !isConnected || !currentGameCode) {
        console.warn('[SocketIO] Cannot emit choice - not connected to game');
        return;
    }

    socket.emit('choice_submitted', {});
    console.log('[SocketIO] Choice submitted event emitted');
}

/**
 * Notify room of new scenario
 * @param {Object} scenarioData - Scenario data
 */
function emitScenarioGenerated(scenarioData) {
    if (!socket || !isConnected || !currentGameCode) return;

    socket.emit('scenario_generated', scenarioData);
    console.log('[SocketIO] Scenario generated event emitted');
}

/**
 * Notify room of turn resolution
 * @param {Object} resolutionData - Resolution data
 */
function emitTurnResolved(resolutionData) {
    if (!socket || !isConnected || !currentGameCode) return;

    socket.emit('turn_resolved', resolutionData);
    console.log('[SocketIO] Turn resolved event emitted');
}

/**
 * Send typing indicator
 * @param {boolean} isTyping - Whether player is typing
 */
function emitTyping(isTyping) {
    if (!socket || !isConnected || !currentGameCode) return;

    socket.emit('typing', { is_typing: isTyping });
}

/**
 * Request presence update
 */
function requestPresence() {
    if (!socket || !isConnected) return;

    socket.emit('request_presence', {});
    console.log('[SocketIO] Presence update requested');
}

/**
 * Ping server (for connection testing)
 */
function ping() {
    if (!socket || !isConnected) return;

    socket.emit('ping', {});
    console.log('[SocketIO] Ping sent');
}

// ============================================================================
// EVENT CALLBACKS
// ============================================================================

/**
 * Register callback for event
 * @param {string} eventName - Event name
 * @param {Function} callback - Callback function
 */
function on(eventName, callback) {
    if (eventCallbacks[eventName]) {
        eventCallbacks[eventName].push(callback);
    } else {
        console.warn('[SocketIO] Unknown event:', eventName);
    }
}

/**
 * Unregister callback for event
 * @param {string} eventName - Event name
 * @param {Function} callback - Callback function to remove
 */
function off(eventName, callback) {
    if (eventCallbacks[eventName]) {
        const index = eventCallbacks[eventName].indexOf(callback);
        if (index > -1) {
            eventCallbacks[eventName].splice(index, 1);
        }
    }
}

/**
 * Trigger all callbacks for an event
 * @param {string} eventName - Event name
 * @param {Object} data - Event data
 */
function triggerCallbacks(eventName, data) {
    if (eventCallbacks[eventName]) {
        eventCallbacks[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('[SocketIO] Callback error:', error);
            }
        });
    }
}

// ============================================================================
// UI UPDATE FUNCTIONS (Implementations depend on your UI)
// ============================================================================

function updateConnectionStatus(connected) {
    const statusIndicator = document.getElementById('connection-status');
    if (statusIndicator) {
        statusIndicator.className = connected ? 'connected' : 'disconnected';
        statusIndicator.textContent = connected ? 'Connected' : 'Disconnected';
    }
}

function showReconnectionOverlay() {
    let overlay = document.getElementById('reconnection-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'reconnection-overlay';
        overlay.className = 'reconnection-overlay';
        overlay.innerHTML = `
            <div class="reconnection-content">
                <div class="reconnection-spinner"></div>
                <h3>Connection Lost</h3>
                <p id="reconnection-status">Attempting to reconnect...</p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
}

function hideReconnectionOverlay() {
    const overlay = document.getElementById('reconnection-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function updateReconnectionStatus(message) {
    const status = document.getElementById('reconnection-status');
    if (status) {
        status.textContent = message;
    }
}

function showMaxReconnectError() {
    const overlay = document.getElementById('reconnection-overlay');
    if (overlay) {
        overlay.innerHTML = `
            <div class="reconnection-content error">
                <h3>Connection Failed</h3>
                <p>Unable to reconnect to the server.</p>
                <button onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
}

function showNotification(message, type = 'info') {
    console.log(`[Notification ${type}]:`, message);
    // Implement your notification UI here
    // Example: toast notification, banner, etc.
}

function showPresenceNotification(message, status) {
    console.log(`[Presence ${status}]:`, message);
    // Subtle notification for presence changes
}

function showScenarioNotification(message) {
    console.log('[Scenario]:', message);
    // Dramatic notification for new scenarios
}

function showResolutionNotification(data) {
    console.log('[Resolution]:', data);
    // Show turn resolution results
}

function updatePlayerPresence(playerId, online) {
    const indicator = document.querySelector(`[data-player-id="${playerId}"] .presence-indicator`);
    if (indicator) {
        indicator.className = `presence-indicator ${online ? 'online' : 'offline'}`;
    }
}

function updateOnlineCount(online, total) {
    const counter = document.getElementById('online-count');
    if (counter) {
        counter.textContent = `${online}/${total} online`;
    }
}

function updateWaitingList(waitingPlayerIds) {
    // Update UI showing who hasn't chosen yet
    console.log('[Waiting for]:', waitingPlayerIds);
}

function updateChoiceProgress(submitted, total) {
    const progressBar = document.getElementById('choice-progress');
    if (progressBar) {
        const percent = (submitted / total) * 100;
        progressBar.style.width = `${percent}%`;
    }
}

function enableResolveTurnButton() {
    const button = document.getElementById('resolve-turn-btn');
    if (button) {
        button.disabled = false;
    }
}

function addPlayerToUI(playerData) {
    console.log('[Add player]:', playerData);
    // Add player to player list UI
}

function updatePlayersUI(players) {
    console.log('[Update players]:', players);
    // Update entire player list
}

function updateScenarioUI(scenario) {
    console.log('[Update scenario]:', scenario);
    // Update scenario display
}

function updateTypingIndicator(playerId, isTyping, playerName) {
    console.log('[Typing]:', playerName, isTyping);
    // Show/hide typing indicator
}

function reloadGameState() {
    // Trigger game state reload
    if (typeof loadGameState === 'function') {
        loadGameState();
    }
}

function loadCurrentScenario() {
    // Trigger scenario reload
    if (typeof loadCurrentScenario === 'function') {
        loadCurrentScenario();
    }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export functions for use in main application
window.SocketIOClient = {
    init: initSocketIO,
    on,
    off,
    joinGameRoom,
    emitChoiceSubmitted,
    emitScenarioGenerated,
    emitTurnResolved,
    emitTyping,
    requestPresence,
    ping,
    isConnected: () => isConnected,
    getSocket: () => socket
};

console.log('[SocketIO Client] Module loaded');
