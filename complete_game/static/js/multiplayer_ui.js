/**
 * Multiplayer UI Manager
 * Handles all UI interactions and state management for the multiplayer lobby
 * Integrates with multiplayer_client.js for Socket.IO communication
 */

class MultiplayerUI {
    constructor() {
        this.currentParty = null;
        this.playerRole = null;
        this.isReady = false;
        this.isHost = false;
        this.players = new Map();
        this.publicParties = [];
        this.currentPhase = 'LOBBY';

        // Cache DOM elements
        this.elements = {};
        this.initializeElements();

        // Initialize client connection
        this.initializeConnection();

        // Setup event listeners
        this.setupEventListeners();

        // Initialize particle effects
        this.initParticles();

        // Start with party control visible
        this.showPartyControl();
    }

    /**
     * Cache all DOM elements
     */
    initializeElements() {
        this.elements = {
            // Connection status
            connectionStatus: document.getElementById('connectionStatus'),
            connectionOverlay: document.getElementById('connectionOverlay'),
            reconnectAttempt: document.getElementById('reconnectAttempt'),

            // Party control
            partyControl: document.getElementById('partyControl'),
            partyNameInput: document.getElementById('partyNameInput'),
            maxPlayersSelect: document.getElementById('maxPlayersSelect'),
            publicPartyCheck: document.getElementById('publicPartyCheck'),
            partyCodeInput: document.getElementById('partyCodeInput'),
            btnCreateParty: document.getElementById('btnCreateParty'),
            btnJoinParty: document.getElementById('btnJoinParty'),
            btnBrowsePublic: document.getElementById('btnBrowsePublic'),

            // Party info
            partyInfo: document.getElementById('partyInfo'),
            partyDisplayName: document.getElementById('partyDisplayName'),
            partyCode: document.getElementById('partyCode'),
            btnCopyCode: document.getElementById('btnCopyCode'),
            btnReady: document.getElementById('btnReady'),
            btnLeaveParty: document.getElementById('btnLeaveParty'),

            // Player list
            playerListContainer: document.getElementById('playerListContainer'),
            playersList: document.getElementById('playersList'),
            playerCount: document.getElementById('playerCount'),
            maxPlayers: document.getElementById('maxPlayers'),
            emptyState: document.getElementById('emptyState'),

            // Role selector
            roleSelector: document.getElementById('roleSelector'),

            // Phase indicator
            phaseIndicator: document.getElementById('phaseIndicator'),
            phaseIcon: document.getElementById('phaseIcon'),
            phaseName: document.getElementById('phaseName'),
            phaseProgress: document.getElementById('phaseProgress'),

            // Chat
            chatMessages: document.getElementById('chatMessages'),
            chatInput: document.getElementById('chatInput'),
            btnSendChat: document.getElementById('btnSendChat'),
            btnMinimizeChat: document.getElementById('btnMinimizeChat'),

            // Public parties modal
            publicPartiesModal: document.getElementById('publicPartiesModal'),
            publicPartiesList: document.getElementById('publicPartiesList'),
            btnClosePublic: document.getElementById('btnClosePublic'),

            // Toast container
            toastContainer: document.getElementById('toastContainer')
        };
    }

    /**
     * Initialize Socket.IO connection
     */
    initializeConnection() {
        // Connect to server
        multiplayerClient.connect();

        // Register event handlers
        this.registerSocketHandlers();
    }

    /**
     * Register Socket.IO event handlers
     */
    registerSocketHandlers() {
        // Connection events
        multiplayerClient.on('connected', () => {
            this.updateConnectionStatus('online');
            this.hideReconnectionOverlay();
            this.showToast('Connected to server', 'success');
        });

        multiplayerClient.on('disconnected', () => {
            this.updateConnectionStatus('offline');
            this.showToast('Disconnected from server', 'error');
        });

        multiplayerClient.on('reconnecting', (data) => {
            this.updateConnectionStatus('connecting');
            this.showReconnectionOverlay(data.attempt);
        });

        multiplayerClient.on('reconnect_failed', () => {
            this.showToast('Failed to reconnect. Please refresh the page.', 'error');
        });

        // Player events
        multiplayerClient.on('player_joined', (data) => {
            this.handlePlayerJoined(data);
        });

        multiplayerClient.on('player_left', (data) => {
            this.handlePlayerLeft(data);
        });

        multiplayerClient.on('player_disconnected', (data) => {
            this.handlePlayerDisconnected(data);
        });

        multiplayerClient.on('player_reconnected', (data) => {
            this.handlePlayerReconnected(data);
        });

        multiplayerClient.on('host_changed', (data) => {
            this.handleHostChanged(data);
        });

        multiplayerClient.on('player_ready_changed', (data) => {
            this.handleReadyChanged(data);
        });

        // Chat events
        multiplayerClient.on('chat_message', (data) => {
            this.handleChatMessage(data);
        });

        // Game phase events
        multiplayerClient.on('phase_changed', (data) => {
            this.handlePhaseChanged(data);
        });
    }

    /**
     * Setup UI event listeners
     */
    setupEventListeners() {
        // Party creation
        this.elements.btnCreateParty.addEventListener('click', () => this.createParty());
        this.elements.btnJoinParty.addEventListener('click', () => this.joinParty());
        this.elements.btnBrowsePublic.addEventListener('click', () => this.showPublicParties());

        // Party management
        this.elements.btnReady.addEventListener('click', () => this.toggleReady());
        this.elements.btnLeaveParty.addEventListener('click', () => this.leaveParty());
        this.elements.btnCopyCode.addEventListener('click', () => this.copyPartyCode());

        // Chat
        this.elements.btnSendChat.addEventListener('click', () => this.sendChatMessage());
        this.elements.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendChatMessage();
        });

        // Role selection
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', (e) => this.selectRole(e.target.closest('.role-card')));
        });

        // Modal
        this.elements.btnClosePublic.addEventListener('click', () => this.hidePublicParties());

        // Input formatting
        this.elements.partyCodeInput.addEventListener('input', (e) => {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (value.length > 4) {
                value = value.slice(0, 4) + '-' + value.slice(4, 8);
            }
            e.target.value = value;
        });

        // Party name validation
        this.elements.partyNameInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9\s]/g, '');
        });
    }

    /**
     * Create a new party
     */
    async createParty() {
        const partyName = this.elements.partyNameInput.value.trim();
        const maxPlayers = parseInt(this.elements.maxPlayersSelect.value);
        const isPublic = this.elements.publicPartyCheck.checked;

        if (!partyName) {
            this.showToast('Please enter a party name', 'warning');
            this.shakeElement(this.elements.partyNameInput);
            return;
        }

        // Show loading state
        this.elements.btnCreateParty.classList.add('loading');

        try {
            // Create party via API
            const response = await fetch('/api/multiplayer/party/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: partyName,
                    maxPlayers: maxPlayers,
                    isPublic: isPublic
                })
            });

            const data = await response.json();

            if (data.success) {
                // Store party info
                this.currentParty = data.party;
                this.isHost = true;

                // Generate player ID and name
                const playerId = this.generatePlayerId();
                const playerName = localStorage.getItem('playerName') || 'Hero_' + Math.floor(Math.random() * 1000);

                // Join the room via Socket.IO
                await multiplayerClient.joinRoom(data.party.code, playerId, playerName);

                // Update UI
                this.showPartyInfo();
                this.updatePartyDisplay();
                this.showToast(`Party "${partyName}" created!`, 'success');

                // Add system message to chat
                this.addSystemMessage(`Welcome to ${partyName}! Share the party code with your friends.`);
            } else {
                this.showToast(data.error || 'Failed to create party', 'error');
            }
        } catch (error) {
            console.error('Error creating party:', error);
            this.showToast('Failed to create party', 'error');
        } finally {
            this.elements.btnCreateParty.classList.remove('loading');
        }
    }

    /**
     * Join an existing party
     */
    async joinParty(partyCode = null) {
        const code = partyCode || this.elements.partyCodeInput.value.replace('-', '').trim();

        if (!code || code.length !== 8) {
            this.showToast('Please enter a valid 8-character party code', 'warning');
            this.shakeElement(this.elements.partyCodeInput);
            return;
        }

        // Show loading state
        this.elements.btnJoinParty.classList.add('loading');

        try {
            // Get party info via API
            const response = await fetch(`/api/multiplayer/party/${code}`);
            const data = await response.json();

            if (data.success) {
                // Store party info
                this.currentParty = data.party;
                this.isHost = false;

                // Generate player ID and name
                const playerId = this.generatePlayerId();
                const playerName = localStorage.getItem('playerName') || 'Hero_' + Math.floor(Math.random() * 1000);

                // Join the room via Socket.IO
                await multiplayerClient.joinRoom(code, playerId, playerName);

                // Update UI
                this.showPartyInfo();
                this.updatePartyDisplay();
                this.showToast(`Joined party "${data.party.name}"!`, 'success');

                // Add system message to chat
                this.addSystemMessage(`You have joined ${data.party.name}!`);
            } else {
                this.showToast(data.error || 'Party not found', 'error');
            }
        } catch (error) {
            console.error('Error joining party:', error);
            this.showToast('Failed to join party', 'error');
        } finally {
            this.elements.btnJoinParty.classList.remove('loading');
        }
    }

    /**
     * Leave current party
     */
    async leaveParty() {
        if (!this.currentParty) return;

        // Confirm action
        if (!confirm('Are you sure you want to leave this party?')) return;

        try {
            await multiplayerClient.leaveRoom('manual');

            // Reset state
            this.currentParty = null;
            this.players.clear();
            this.isReady = false;
            this.isHost = false;
            this.playerRole = null;

            // Update UI
            this.showPartyControl();
            this.clearChat();
            this.showToast('Left the party', 'info');
        } catch (error) {
            console.error('Error leaving party:', error);
            this.showToast('Failed to leave party', 'error');
        }
    }

    /**
     * Toggle ready status
     */
    async toggleReady() {
        if (!this.currentParty) return;

        this.isReady = !this.isReady;

        try {
            await multiplayerClient.setReady(this.isReady);

            // Update button
            this.updateReadyButton();

            // Animate button
            this.pulseElement(this.elements.btnReady);

            // Show toast
            this.showToast(this.isReady ? 'Ready for battle!' : 'Not ready', 'info');
        } catch (error) {
            console.error('Error setting ready status:', error);
            this.isReady = !this.isReady; // Revert
            this.showToast('Failed to update ready status', 'error');
        }
    }

    /**
     * Send chat message
     */
    async sendChatMessage() {
        const message = this.elements.chatInput.value.trim();

        if (!message || !this.currentParty) return;

        try {
            await multiplayerClient.sendChatMessage(message);

            // Clear input
            this.elements.chatInput.value = '';

            // Add message to chat (will be echoed back via socket)
            // No need to add here, wait for server confirmation
        } catch (error) {
            console.error('Error sending message:', error);
            this.showToast('Failed to send message', 'error');
        }
    }

    /**
     * Handle player joined event
     */
    handlePlayerJoined(data) {
        // Add player to list
        this.players.set(data.playerId, data);

        // Update player list UI
        this.updatePlayersList();

        // Show toast
        this.showToast(`${data.playerName} joined the party`, 'success', {
            icon: '⚔'
        });

        // Add system message to chat
        this.addSystemMessage(`${data.playerName} has joined the party!`);

        // Animate player card
        setTimeout(() => {
            const playerCard = document.querySelector(`[data-player-id="${data.playerId}"]`);
            if (playerCard) this.bounceElement(playerCard);
        }, 100);
    }

    /**
     * Handle player left event
     */
    handlePlayerLeft(data) {
        // Remove player from list
        this.players.delete(data.playerId);

        // Update player list UI
        this.updatePlayersList();

        // Show toast
        this.showToast(`${data.playerName} left the party`, 'warning', {
            icon: '⚠'
        });

        // Add system message to chat
        this.addSystemMessage(`${data.playerName} has left the party.`);
    }

    /**
     * Handle player disconnected event
     */
    handlePlayerDisconnected(data) {
        // Update player status
        const player = this.players.get(data.playerId);
        if (player) {
            player.isConnected = false;
            this.updatePlayerCard(data.playerId);
        }

        // Show toast
        this.showToast(`${data.playerName} disconnected`, 'warning', {
            icon: '🔌'
        });

        // Add system message to chat
        this.addSystemMessage(`${data.playerName} has disconnected (may reconnect).`);
    }

    /**
     * Handle player reconnected event
     */
    handlePlayerReconnected(data) {
        // Update player status
        const player = this.players.get(data.playerId);
        if (player) {
            player.isConnected = true;
            this.updatePlayerCard(data.playerId);
        }

        // Show toast
        this.showToast(`${data.playerName} reconnected`, 'success', {
            icon: '🔗'
        });

        // Add system message to chat
        this.addSystemMessage(`${data.playerName} has reconnected!`);
    }

    /**
     * Handle host changed event
     */
    handleHostChanged(data) {
        this.isHost = (data.newHostId === multiplayerClient.playerId);

        // Update player list
        this.updatePlayersList();

        // Show toast
        this.showToast(`${data.newHostName} is now the party host`, 'info', {
            icon: '👑'
        });

        // Add system message to chat
        this.addSystemMessage(`${data.newHostName} is now the party host.`);
    }

    /**
     * Handle ready status changed event
     */
    handleReadyChanged(data) {
        // Update player ready status
        const player = this.players.get(data.playerId);
        if (player) {
            player.isReady = data.isReady;
            this.updatePlayerCard(data.playerId);
        }

        // Animate player card
        const playerCard = document.querySelector(`[data-player-id="${data.playerId}"]`);
        if (playerCard) {
            if (data.isReady) {
                playerCard.classList.add('is-ready');
                this.pulseElement(playerCard);
            } else {
                playerCard.classList.remove('is-ready');
            }
        }

        // Check if all players are ready
        const allReady = Array.from(this.players.values()).every(p => p.isReady);
        if (allReady && this.players.size >= 2) {
            this.showToast('All players ready! Game starting soon...', 'success', {
                icon: '🎮'
            });

            // Trigger celebration animation
            this.celebrateAllReady();
        }
    }

    /**
     * Handle chat message event
     */
    handleChatMessage(data) {
        this.addChatMessage(data.playerName, data.message, data.timestamp);
    }

    /**
     * Handle phase changed event
     */
    handlePhaseChanged(data) {
        this.currentPhase = data.phase;
        this.updatePhaseDisplay(data);

        // Show toast
        this.showToast(`Phase changed to ${data.phase}`, 'info', {
            icon: this.getPhaseIcon(data.phase)
        });

        // Add system message
        this.addSystemMessage(`Game phase changed to ${data.phase}`);

        // Trigger phase transition animation
        this.animatePhaseTransition();
    }

    /**
     * Update player list display
     */
    updatePlayersList() {
        const playersList = this.elements.playersList;
        const emptyState = this.elements.emptyState;

        // Clear existing
        playersList.innerHTML = '';

        if (this.players.size === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        // Add player cards
        this.players.forEach((player, playerId) => {
            const isMe = playerId === multiplayerClient.playerId;
            const card = this.createPlayerCard(player, isMe);
            playersList.appendChild(card);
        });

        // Update count
        this.elements.playerCount.textContent = this.players.size;
        this.elements.maxPlayers.textContent = this.currentParty?.maxPlayers || '6';
    }

    /**
     * Create player card element
     */
    createPlayerCard(player, isMe = false) {
        const card = document.createElement('div');
        card.className = 'player-card';
        card.dataset.playerId = player.playerId;

        if (player.isHost) card.classList.add('is-host');
        if (player.isReady) card.classList.add('is-ready');
        if (!player.isConnected) card.classList.add('is-disconnected');

        card.innerHTML = `
            <div class="player-avatar">
                ${this.getPlayerAvatar(player)}
                <div class="player-status-indicator ${player.isConnected ? 'online' : 'offline'}"></div>
            </div>
            <div class="player-info">
                <div class="player-name">
                    ${player.playerName}
                    ${isMe ? '<span class="badge badge-you">YOU</span>' : ''}
                    <div class="player-badges">
                        ${player.isHost ? '<span class="badge badge-host">HOST</span>' : ''}
                        ${player.isReady ? '<span class="badge badge-ready">READY</span>' : ''}
                    </div>
                </div>
                <div class="player-role">
                    <span class="role-icon">${this.getRoleIcon(player.role)}</span>
                    <span>${player.role || 'No role selected'}</span>
                </div>
            </div>
        `;

        return card;
    }

    /**
     * Update single player card
     */
    updatePlayerCard(playerId) {
        const player = this.players.get(playerId);
        if (!player) return;

        const card = document.querySelector(`[data-player-id="${playerId}"]`);
        if (!card) return;

        // Update classes
        card.classList.toggle('is-host', player.isHost);
        card.classList.toggle('is-ready', player.isReady);
        card.classList.toggle('is-disconnected', !player.isConnected);

        // Update status indicator
        const statusIndicator = card.querySelector('.player-status-indicator');
        if (statusIndicator) {
            statusIndicator.className = `player-status-indicator ${player.isConnected ? 'online' : 'offline'}`;
        }

        // Update badges
        const badges = card.querySelector('.player-badges');
        if (badges) {
            badges.innerHTML = `
                ${player.isHost ? '<span class="badge badge-host">HOST</span>' : ''}
                ${player.isReady ? '<span class="badge badge-ready">READY</span>' : ''}
            `;
        }
    }

    /**
     * Add chat message
     */
    addChatMessage(author, message, timestamp = Date.now()) {
        const messagesContainer = this.elements.chatMessages;

        const messageEl = document.createElement('div');
        messageEl.className = 'message player-message';

        const time = new Date(timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageEl.innerHTML = `
            <div class="message-header">
                <span class="message-author">${author}</span>
                <span class="message-timestamp">${time}</span>
            </div>
            <div class="message-text">${this.escapeHtml(message)}</div>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animate message
        this.fadeInElement(messageEl);
    }

    /**
     * Add system message to chat
     */
    addSystemMessage(message) {
        const messagesContainer = this.elements.chatMessages;

        const messageEl = document.createElement('div');
        messageEl.className = 'message system-message';
        messageEl.innerHTML = `
            <span class="message-icon">⚡</span>
            <span class="message-text">${message}</span>
        `;

        messagesContainer.appendChild(messageEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animate message
        this.fadeInElement(messageEl);
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', options = {}) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;

        const icon = options.icon || this.getToastIcon(type);
        const title = options.title || this.getToastTitle(type);

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.elements.toastContainer.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.classList.add('toast-exit');
            setTimeout(() => toast.remove(), 300);
        }, options.duration || 5000);
    }

    /**
     * Get toast icon by type
     */
    getToastIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get toast title by type
     */
    getToastTitle(type) {
        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || '';
    }

    /**
     * Update connection status display
     */
    updateConnectionStatus(status) {
        const statusEl = this.elements.connectionStatus;
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');

        // Update classes
        dot.className = `status-dot ${status}`;

        // Update text
        const statusTexts = {
            online: 'CONNECTED',
            offline: 'DISCONNECTED',
            connecting: 'CONNECTING...'
        };
        text.textContent = statusTexts[status] || 'UNKNOWN';
    }

    /**
     * Show reconnection overlay
     */
    showReconnectionOverlay(attempt) {
        this.elements.connectionOverlay.style.display = 'flex';
        this.elements.reconnectAttempt.textContent = attempt;
    }

    /**
     * Hide reconnection overlay
     */
    hideReconnectionOverlay() {
        this.elements.connectionOverlay.style.display = 'none';
    }

    /**
     * Update party display
     */
    updatePartyDisplay() {
        if (!this.currentParty) return;

        this.elements.partyDisplayName.textContent = this.currentParty.name;
        this.elements.partyCode.textContent = this.formatPartyCode(this.currentParty.code);

        // Show role selector if in party
        this.elements.roleSelector.style.display = 'block';
    }

    /**
     * Format party code with hyphen
     */
    formatPartyCode(code) {
        if (!code || code.length !== 8) return code;
        return code.slice(0, 4) + '-' + code.slice(4);
    }

    /**
     * Copy party code to clipboard
     */
    async copyPartyCode() {
        const code = this.currentParty?.code;
        if (!code) return;

        try {
            await navigator.clipboard.writeText(code);
            this.showToast('Party code copied to clipboard!', 'success');

            // Animate button
            this.pulseElement(this.elements.btnCopyCode);
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('Failed to copy code', 'error');
        }
    }

    /**
     * Show party control section
     */
    showPartyControl() {
        this.elements.partyControl.style.display = 'block';
        this.elements.partyInfo.style.display = 'none';
        this.elements.roleSelector.style.display = 'none';
        this.elements.phaseIndicator.style.display = 'none';

        // Clear inputs
        this.elements.partyNameInput.value = '';
        this.elements.partyCodeInput.value = '';
        this.elements.publicPartyCheck.checked = false;
    }

    /**
     * Show party info section
     */
    showPartyInfo() {
        this.elements.partyControl.style.display = 'none';
        this.elements.partyInfo.style.display = 'block';
        this.elements.phaseIndicator.style.display = 'block';
    }

    /**
     * Update ready button
     */
    updateReadyButton() {
        const btn = this.elements.btnReady;
        const icon = btn.querySelector('.ready-icon');
        const text = btn.querySelector('.ready-text');

        if (this.isReady) {
            btn.classList.add('is-ready');
            icon.textContent = '✓';
            text.textContent = 'READY';
        } else {
            btn.classList.remove('is-ready');
            icon.textContent = '⚔';
            text.textContent = 'READY FOR BATTLE';
        }
    }

    /**
     * Select player role
     */
    selectRole(card) {
        // Remove previous selection
        document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));

        // Add selection
        card.classList.add('selected');

        // Store role
        this.playerRole = card.dataset.role;

        // TODO: Send role selection to server
        this.showToast(`Selected role: ${this.playerRole.toUpperCase()}`, 'success');

        // Animate card
        this.bounceElement(card);
    }

    /**
     * Update phase display
     */
    updatePhaseDisplay(data) {
        this.elements.phaseIcon.textContent = this.getPhaseIcon(data.phase);
        this.elements.phaseName.textContent = data.phase;

        // Update progress bar
        const progress = data.progress || 0;
        this.elements.phaseProgress.style.width = `${progress}%`;
    }

    /**
     * Get phase icon
     */
    getPhaseIcon(phase) {
        const icons = {
            'LOBBY': '🎭',
            'INTERROGATION': '🔍',
            'BATTLE': '⚔',
            'VICTORY': '🏆',
            'DEFEAT': '💀'
        };
        return icons[phase] || '🎮';
    }

    /**
     * Get player avatar
     */
    getPlayerAvatar(player) {
        // Use first letter of name or default icon
        return player.playerName ? player.playerName[0].toUpperCase() : '?';
    }

    /**
     * Get role icon
     */
    getRoleIcon(role) {
        const icons = {
            'tank': '🛡',
            'dps': '⚔',
            'healer': '💚',
            'support': '✨'
        };
        return icons[role] || '❓';
    }

    /**
     * Clear chat messages
     */
    clearChat() {
        this.elements.chatMessages.innerHTML = `
            <div class="message system-message">
                <span class="message-icon">⚡</span>
                <span class="message-text">Welcome to The Arcane Codex multiplayer lobby!</span>
            </div>
        `;
    }

    /**
     * Show public parties modal
     */
    async showPublicParties() {
        this.elements.publicPartiesModal.style.display = 'flex';

        // Fetch public parties
        try {
            const response = await fetch('/api/multiplayer/parties/public');
            const data = await response.json();

            if (data.success) {
                this.publicParties = data.parties;
                this.renderPublicParties();
            } else {
                this.showToast('Failed to fetch public parties', 'error');
            }
        } catch (error) {
            console.error('Error fetching public parties:', error);
            this.showToast('Failed to fetch public parties', 'error');
        }
    }

    /**
     * Hide public parties modal
     */
    hidePublicParties() {
        this.elements.publicPartiesModal.style.display = 'none';
    }

    /**
     * Render public parties list
     */
    renderPublicParties() {
        const list = this.elements.publicPartiesList;
        list.innerHTML = '';

        if (this.publicParties.length === 0) {
            list.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <p class="empty-text">No public parties available</p>
                </div>
            `;
            return;
        }

        this.publicParties.forEach(party => {
            const item = document.createElement('div');
            item.className = 'party-item';

            item.innerHTML = `
                <div class="party-item-info">
                    <div class="party-name">${party.name}</div>
                    <div class="party-meta">
                        <div class="party-players">
                            👥 ${party.playerCount}/${party.maxPlayers}
                        </div>
                        <div class="party-phase">
                            ${this.getPhaseIcon(party.phase)} ${party.phase}
                        </div>
                    </div>
                </div>
                <button class="btn-join-party" data-code="${party.code}">JOIN</button>
            `;

            // Add click handler
            const joinBtn = item.querySelector('.btn-join-party');
            joinBtn.addEventListener('click', () => {
                this.hidePublicParties();
                this.joinParty(party.code);
            });

            list.appendChild(item);
        });
    }

    /**
     * Generate unique player ID
     */
    generatePlayerId() {
        let playerId = localStorage.getItem('playerId');
        if (!playerId) {
            playerId = 'player_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('playerId', playerId);
        }
        return playerId;
    }

    /**
     * Escape HTML for security
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Initialize particle effects
     */
    initParticles() {
        const particlesContainer = document.getElementById('particles');
        if (!particlesContainer) return;

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'floating-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: ${Math.random() > 0.5 ? 'var(--mp-green)' : 'var(--mp-gold)'};
                border-radius: 50%;
                opacity: ${Math.random() * 0.5 + 0.2};
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 20 + 10}s linear infinite;
                box-shadow: 0 0 ${Math.random() * 10 + 5}px currentColor;
            `;
            particlesContainer.appendChild(particle);
        }

        // Add CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes particleFloat {
                0% { transform: translate(0, 100vh) rotate(0deg); opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { transform: translate(100px, -100vh) rotate(720deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Animation utilities
     */
    shakeElement(element) {
        element.classList.add('shake');
        setTimeout(() => element.classList.remove('shake'), 500);
    }

    pulseElement(element) {
        element.classList.add('pulse');
        setTimeout(() => element.classList.remove('pulse'), 1000);
    }

    bounceElement(element) {
        element.classList.add('bounce');
        setTimeout(() => element.classList.remove('bounce'), 600);
    }

    fadeInElement(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(10px)';
        setTimeout(() => {
            element.style.transition = 'all 300ms ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 10);
    }

    /**
     * Celebrate all players ready
     */
    celebrateAllReady() {
        // Create confetti effect
        const confettiColors = ['var(--mp-green)', 'var(--mp-gold)', 'var(--mp-magenta)', 'var(--mp-cyan)'];
        const container = document.body;

        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: ${confettiColors[Math.floor(Math.random() * confettiColors.length)]};
                left: ${Math.random() * 100}%;
                top: -10px;
                transform: rotate(${Math.random() * 360}deg);
                animation: confettiFall 3s ease-out forwards;
                z-index: 9999;
            `;
            container.appendChild(confetti);

            setTimeout(() => confetti.remove(), 3000);
        }

        // Add animation if not exists
        if (!document.querySelector('#confettiStyle')) {
            const style = document.createElement('style');
            style.id = 'confettiStyle';
            style.textContent = `
                @keyframes confettiFall {
                    0% {
                        top: -10px;
                        transform: rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        top: 100%;
                        transform: rotate(720deg) scale(0);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Animate phase transition
     */
    animatePhaseTransition() {
        const phaseDisplay = this.elements.phaseIndicator;
        phaseDisplay.classList.add('phase-transition');

        setTimeout(() => {
            phaseDisplay.classList.remove('phase-transition');
        }, 1000);

        // Add transition animation if not exists
        if (!document.querySelector('#phaseTransitionStyle')) {
            const style = document.createElement('style');
            style.id = 'phaseTransitionStyle';
            style.textContent = `
                .phase-transition {
                    animation: phaseGlow 1s ease-in-out;
                }
                @keyframes phaseGlow {
                    0%, 100% { transform: scale(1); filter: brightness(1); }
                    50% { transform: scale(1.05); filter: brightness(1.5); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Add shake animation styles
     */
    initAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .shake {
                animation: shake 0.5s ease-in-out;
            }
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                20%, 40%, 60%, 80% { transform: translateX(5px); }
            }

            .pulse {
                animation: pulse 1s ease-in-out;
            }
            @keyframes pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.05); }
            }

            .bounce {
                animation: bounce 0.6s ease-in-out;
            }
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                25% { transform: translateY(-10px); }
                50% { transform: translateY(0); }
                75% { transform: translateY(-5px); }
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.multiplayerUI = new MultiplayerUI();

    // Add animation styles
    window.multiplayerUI.initAnimationStyles();

    console.log('[MULTIPLAYER UI] Initialized and ready');
});