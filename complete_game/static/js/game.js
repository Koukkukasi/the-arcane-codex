/**
 * The Arcane Codex - Complete Game Client
 * Handles all game logic, API communication, and UI updates
 */

class ArcaneCodexGame {
    constructor() {
        // Game State
        this.gameCode = null;
        this.playerId = null;
        this.playerName = null;
        this.playerClass = null;
        this.currentScreen = 'landing';
        this.currentQuestion = 0;
        this.interrogationAnswers = [];
        this.pollingInterval = null;
        this.trustLevel = 100;
        this.interrogationStarted = false; // Track if interrogation API has been called
        this.currentQuestionData = null; // Store current question to persist across updates

        // API Configuration
        this.API_BASE = '/api';
        this.POLLING_DELAY = 1000; // 1 second (faster updates for better responsiveness)

        // Load saved player ID if exists
        this.loadPlayerSession();
    }

    // ===== Initialization Methods =====

    initLandingPage() {
        // Check if username is already set
        this.checkUsername();

        // Setup username form handler
        const usernameForm = document.getElementById('username-form');
        if (usernameForm) {
            usernameForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSetUsername(e.target);
            });
        }

        // Setup form handlers
        const createForm = document.getElementById('create-game-form');
        const joinForm = document.getElementById('join-game-form');

        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateGame(e.target);
            });
        }

        if (joinForm) {
            joinForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleJoinGame(e.target);
            });
        }

        // Auto-capitalize game code input
        const gameCodeInput = document.getElementById('join-code');
        if (gameCodeInput) {
            gameCodeInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.toUpperCase();
            });
        }
    }

    async checkUsername() {
        try {
            const response = await this.apiRequest('/get_username', 'GET', null, true);
            if (response.username) {
                // Username already set, show game selection
                this.showGameSelection(response.username);
            }
        } catch (error) {
            // No username set, show username screen (already visible by default)
        }
    }

    async handleSetUsername(form) {
        const username = form.username.value.trim();

        if (!username) {
            this.showError('Username required');
            return;
        }

        this.showLoading('Setting username...');

        try {
            const response = await this.apiRequest('/set_username', 'POST', { username });
            this.showGameSelection(response.username);
        } catch (error) {
            // Error already shown by apiRequest
        } finally {
            this.hideLoading();
        }
    }

    showGameSelection(username) {
        // Hide username screen
        document.getElementById('username-screen').style.display = 'none';

        // Show game selection screen
        document.getElementById('game-selection-screen').style.display = 'block';

        // Update username display
        document.getElementById('display-username').textContent = username;
    }

    initGameInterface() {
        // Setup lobby form handlers
        this.initLandingPage();

        // Setup event handlers
        this.setupMenuToggle();
        this.setupChoiceInput();
        this.setupLeaveGame();

        // Initialize map feature
        this.initializeMap();

        // DISABLED AUTO-RESUME: Always show lobby first
        // Users complained that clicking PLAY would jump straight to interrogation
        // when they had a saved session. Now we always start fresh at the lobby.

        // // Only load session if we already have a player ID (returning player)
        // if (this.playerId) {
        //     this.loadSessionInfo().then(() => {
        //         this.startGameLoop();
        //     }).catch(() => {
        //         // Session invalid, show lobby
        //         this.showScreen('lobby');
        //     });
        // }
        // Always stay on lobby screen for fresh user experience
    }

    // ===== Session Management =====

    loadPlayerSession() {
        const savedPlayerId = localStorage.getItem('arcane_player_id');
        const savedGameCode = localStorage.getItem('arcane_game_code');

        if (savedPlayerId) {
            this.playerId = savedPlayerId;
        }
        if (savedGameCode) {
            this.gameCode = savedGameCode;
        }
    }

    savePlayerSession() {
        if (this.playerId) {
            localStorage.setItem('arcane_player_id', this.playerId);
        }
        if (this.gameCode) {
            localStorage.setItem('arcane_game_code', this.gameCode);
        }
    }

    clearPlayerSession() {
        localStorage.removeItem('arcane_player_id');
        localStorage.removeItem('arcane_game_code');
        this.playerId = null;
        this.gameCode = null;
    }

    // ===== API Methods =====

    async apiRequest(endpoint, method = 'GET', body = null, silent = false) {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        if (this.playerId) {
            options.headers['X-Player-ID'] = this.playerId;
        }

        try {
            const response = await fetch(`${this.API_BASE}${endpoint}`, options);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `API Error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (!silent) {
                console.error('API Request failed:', error);
                this.showError(error.message);
            }
            throw error;
        }
    }

    async createGame() {
        // Username is now in session, send empty JSON object
        const response = await this.apiRequest('/create_game', 'POST', {});

        this.gameCode = response.game_code;
        this.playerId = response.player_id;
        this.playerName = response.player_name;
        this.savePlayerSession();

        return response;
    }

    async joinGame(gameCode) {
        // Username is now in session, no need to pass it
        const response = await this.apiRequest('/join_game', 'POST', {
            game_code: gameCode
        });

        this.gameCode = gameCode;
        this.playerId = response.player_id;
        this.playerName = response.player_name;
        this.savePlayerSession();

        return response;
    }

    async loadSessionInfo() {
        try {
            // Use silent=true since 400 error is expected when not in a game
            const response = await this.apiRequest('/session_info', 'GET', null, true);

            this.gameCode = response.game_code;
            this.playerName = response.player_name;
            this.playerClass = response.player_class;

            // Update UI with session info
            this.updateGameHeader(response);
            this.updateCharacterInfo(response);

            return response;
        } catch (error) {
            // Session invalid - clear old data and let user create/join a new game
            this.clearPlayerSession();
            throw error;  // Re-throw so caller knows it failed
        }
    }

    async startInterrogation() {
        return await this.apiRequest('/start_interrogation', 'POST');
    }

    async answerQuestion(answerId) {
        return await this.apiRequest('/answer_question', 'POST', {
            answer_id: answerId
        });
    }

    async generateScenario() {
        return await this.apiRequest('/generate_scenario', 'POST');
    }

    async getCurrentScenario() {
        return await this.apiRequest('/current_scenario');
    }

    async getMyWhisper() {
        return await this.apiRequest('/my_whisper');
    }

    async makeChoice(choiceText) {
        return await this.apiRequest('/make_choice', 'POST', {
            choice: choiceText
        });
    }

    async getWaitingFor() {
        return await this.apiRequest('/waiting_for');
    }

    async resolveTurn() {
        return await this.apiRequest('/resolve_turn', 'POST');
    }

    async getGameState() {
        return await this.apiRequest('/game_state');
    }

    // ===== Event Handlers =====

    async handleCreateGame(form) {
        const playerName = document.getElementById('creator-name').value.trim();

        if (!playerName) {
            this.showError('Please enter your name');
            return;
        }

        this.showLoading('Creating game...');

        try {
            // First set username in session
            await this.apiRequest('/set_username', 'POST', {
                username: playerName
            });

            // Then create game
            const response = await this.apiRequest('/create_game', 'POST');

            this.gameCode = response.game_code;
            this.playerId = response.player_id;
            this.playerName = playerName;

            // Save session
            this.savePlayerSession();

            // Update game header with code
            this.updateGameHeader({ game_code: this.gameCode });

            // Show loading while we fetch the first question
            this.showLoading('The gods are preparing your interrogation...');

            // Start interrogation and get first question
            const interrogationResponse = await this.startInterrogation();
            this.currentQuestionData = interrogationResponse.question;
            this.interrogationStarted = true;

            // Hide loading
            this.hideLoading();

            // Display the interrogation screen with the question
            await this.showInterrogationScreen({
                phase: 'interrogation',
                current_question: this.currentQuestionData
            });

            // Start polling
            this.startGameLoop();
        } catch (error) {
            // Error already shown by apiRequest
        } finally {
            this.hideLoading();
        }
    }

    async handleJoinGame(form) {
        const playerName = document.getElementById('join-name').value.trim();
        const gameCode = document.getElementById('join-code').value.trim().toUpperCase();

        if (!playerName) {
            this.showError('Please enter your name');
            return;
        }

        if (!gameCode) {
            this.showError('Please enter game code');
            return;
        }

        if (gameCode.length !== 6) {
            this.showError('Game code must be 6 characters');
            return;
        }

        this.showLoading('Joining game...');

        try {
            // First set username in session
            await this.apiRequest('/set_username', 'POST', {
                username: playerName
            });

            // Then join game
            const response = await this.apiRequest('/join_game', 'POST', {
                game_code: gameCode
            });

            this.gameCode = gameCode;
            this.playerId = response.player_id;
            this.playerName = playerName;

            // Save session
            this.savePlayerSession();

            // Update game header with code
            this.updateGameHeader({ game_code: this.gameCode });

            // Show loading while we fetch the first question
            this.showLoading('The gods are preparing your interrogation...');

            // Start interrogation and get first question
            const interrogationResponse = await this.startInterrogation();
            this.currentQuestionData = interrogationResponse.question;
            this.interrogationStarted = true;

            // Hide loading
            this.hideLoading();

            // Display the interrogation screen with the question
            await this.showInterrogationScreen({
                phase: 'interrogation',
                current_question: this.currentQuestionData
            });

            // Start polling
            this.startGameLoop();
        } catch (error) {
            // Error already shown by apiRequest
        } finally {
            this.hideLoading();
        }
    }

    setupMenuToggle() {
        const toggle = document.getElementById('menu-toggle');
        const sidebar = document.getElementById('game-sidebar');

        if (toggle && sidebar) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                sidebar.classList.toggle('active');
            });
        }
    }

    setupChoiceInput() {
        const input = document.getElementById('choice-input');
        const charCount = document.getElementById('char-count');
        const submitBtn = document.getElementById('submit-choice');

        if (input && charCount) {
            input.addEventListener('input', () => {
                const length = input.value.length;
                charCount.textContent = `${length}/500`;

                if (length > 400) {
                    charCount.style.color = 'var(--color-danger)';
                } else if (length > 300) {
                    charCount.style.color = 'var(--color-warning)';
                } else {
                    charCount.style.color = 'var(--color-text-muted)';
                }
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                this.submitChoice();
            });
        }
    }

    setupLeaveGame() {
        const leaveBtn = document.getElementById('leave-game');
        if (leaveBtn) {
            leaveBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to leave the game?')) {
                    this.clearPlayerSession();
                    window.location.href = '/';
                }
            });
        }
    }

    // ===== Game Loop =====

    async startGameLoop() {
        // Initial state check
        await this.updateGameState();

        // Start polling for updates
        this.pollingInterval = setInterval(() => {
            this.updateGameState();
        }, this.POLLING_DELAY);
    }

    stopGameLoop() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
    }

    async updateGameState() {
        try {
            const state = await this.getGameState();

            // Update trust meter
            this.updateTrustMeter(state.trust_level);

            // Update player list
            this.updatePlayersList(state.players);

            // Update NPCs if available
            if (state.npcs) {
                this.updateNPCsList(state.npcs);
            }

            // Determine which screen to show
            if (state.phase === 'interrogation') {
                if (state.interrogation_complete) {
                    this.showScreen('creation-complete');
                } else {
                    this.showInterrogationScreen(state);
                }
            } else if (state.phase === 'scenario') {
                if (state.waiting_for && state.waiting_for.length > 0) {
                    this.showWaitingScreen(state.waiting_for);
                } else if (state.turn_resolved) {
                    this.showResultsScreen(state);
                } else {
                    this.showScenarioScreen(state);
                }
            } else if (state.phase === 'lobby') {
                this.showScreen('waiting');
                this.updateWaitingStatus(state.players);
            }

            // Update player count
            const playerCount = document.getElementById('player-count');
            if (playerCount) {
                playerCount.textContent = `${state.players.length}/4`;
            }

        } catch (error) {
            console.error('Game state update failed:', error);
        }
    }

    // ===== Screen Management =====

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.game-screen').forEach(screen => {
            screen.style.display = 'none';
        });

        // Show requested screen
        const screen = document.getElementById(`${screenId}-screen`);
        if (screen) {
            screen.style.display = 'block';
            this.currentScreen = screenId;
        }
    }

    async showInterrogationScreen(state) {
        this.showScreen('interrogation');

        // Get current question - only start interrogation once
        if (!this.interrogationStarted) {
            // Start interrogation if not started
            const response = await this.startInterrogation();
            this.currentQuestionData = response.question;
            this.interrogationStarted = true;
        }

        // Use stored question data
        const currentQuestion = this.currentQuestionData || state.current_question;
        if (!currentQuestion) {
            console.error('No question data available');
            return;
        }

        const questionNumber = currentQuestion.question_number || 1;

        // Update progress
        document.getElementById('question-number').textContent = questionNumber;
        document.getElementById('progress-fill').style.width = `${questionNumber * 10}%`;

        // Display question (use question_text, not text)
        document.getElementById('question-text').textContent = currentQuestion.question_text || currentQuestion.text;

        // Display answers (extract text from option objects)
        const optionsContainer = document.getElementById('answer-options');
        optionsContainer.innerHTML = '';

        currentQuestion.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'answer-option';
            // Option might be a string OR an object with {id, text}
            button.textContent = typeof option === 'string' ? option : option.text;
            // Use option.id if available, otherwise use index
            const answerId = typeof option === 'object' ? option.id : (index + 1);
            button.addEventListener('click', () => this.selectAnswer(answerId));
            optionsContainer.appendChild(button);
        });
    }

    async selectAnswer(answerId) {
        this.showLoading('Submitting answer...');

        try {
            const response = await this.answerQuestion(answerId);

            if (response.status === 'complete') {
                // Show class assignment
                this.playerClass = response.assigned_class;
                this.showClassAssignment(response.assigned_class);
            } else if (response.status === 'continue') {
                // Update question data for next question
                this.currentQuestionData = response.next_question;
                // Directly render the next question
                await this.showInterrogationScreen({
                    phase: 'interrogation',
                    current_question: this.currentQuestionData
                });
            }
        } finally {
            this.hideLoading();
        }
    }

    showClassAssignment(className) {
        this.showScreen('creation-complete');

        const classData = {
            'Fighter': { icon: '⚔️', description: 'Masters of combat and physical prowess, fighters lead from the front.' },
            'Mage': { icon: '🔮', description: 'Wielders of arcane power, mages see through illusion and deception.' },
            'Thief': { icon: '🗡️', description: 'Experts in stealth and cunning, thieves find hidden paths and secrets.' },
            'Cleric': { icon: '✨', description: 'Channels of divine power, clerics heal wounds and reveal truth.' }
        };

        const data = classData[className] || { icon: '❓', description: 'A mysterious class with unknown powers.' };

        document.getElementById('class-icon').textContent = data.icon;
        document.getElementById('assigned-class').textContent = className;
        document.getElementById('class-description').textContent = data.description;
    }

    async showScenarioScreen(state) {
        this.showScreen('scenario');

        // Get current scenario
        const scenario = await this.getCurrentScenario();

        if (scenario) {
            // Update turn indicator
            document.getElementById('turn-indicator').textContent = `Turn ${state.turn || 1}`;

            // Display public scenario
            document.getElementById('public-description').textContent = scenario.public_description;

            // Get and display whisper
            const whisper = await this.getMyWhisper();
            if (whisper) {
                document.getElementById('player-class').textContent = this.playerClass || 'Unknown';
                document.getElementById('whisper-content').textContent = whisper.content;
            }

            // Clear choice input
            const choiceInput = document.getElementById('choice-input');
            if (choiceInput) {
                choiceInput.value = '';
                choiceInput.disabled = false;
            }

            const submitBtn = document.getElementById('submit-choice');
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        } else {
            // Generate new scenario if none exists
            await this.generateScenario();
            await this.updateGameState();
        }
    }

    async submitChoice() {
        const choiceInput = document.getElementById('choice-input');
        const choice = choiceInput.value.trim();

        if (!choice) {
            this.showError('Please describe your action');
            return;
        }

        this.showLoading('Submitting choice...');

        try {
            await this.makeChoice(choice);

            // Disable input after submission
            choiceInput.disabled = true;
            document.getElementById('submit-choice').disabled = true;

            // Update game state
            await this.updateGameState();
        } finally {
            this.hideLoading();
        }
    }

    showWaitingScreen(waitingFor) {
        this.showScreen('waiting');

        const statusContainer = document.getElementById('waiting-status');
        if (statusContainer && waitingFor) {
            const waitingList = waitingFor.map(player =>
                `<div class="waiting-player">⏳ ${player}</div>`
            ).join('');

            statusContainer.innerHTML = `
                <h3>Waiting for:</h3>
                ${waitingList}
            `;
        }
    }

    async showResultsScreen(state) {
        this.showScreen('results');

        // Get turn resolution details
        if (state.last_outcome) {
            document.getElementById('outcome-text').textContent = state.last_outcome;
        }

        // Display player choices
        if (state.last_choices) {
            const choicesList = document.getElementById('choices-list');
            choicesList.innerHTML = state.last_choices.map(choice => `
                <div class="choice-item">
                    <div class="choice-player">${choice.player}</div>
                    <div class="choice-text">${choice.text}</div>
                </div>
            `).join('');
        }

        // Display effects
        if (state.last_effects) {
            const effectsList = document.getElementById('effects-list');
            effectsList.innerHTML = state.last_effects.map(effect => `
                <div class="effect-item ${effect.positive ? 'effect-positive' : 'effect-negative'}">
                    ${effect.text}
                </div>
            `).join('');
        }

        // Setup continue button
        const continueBtn = document.getElementById('continue-button');
        if (continueBtn) {
            continueBtn.onclick = async () => {
                await this.generateScenario();
                await this.updateGameState();
            };
        }
    }

    // ===== UI Update Methods =====

    updateGameHeader(sessionInfo) {
        const codeElement = document.getElementById('game-code');
        if (codeElement) {
            codeElement.textContent = sessionInfo.game_code || '------';
        }
    }

    updateCharacterInfo(sessionInfo) {
        const nameElement = document.getElementById('player-name');
        const classElement = document.getElementById('player-class-badge');

        if (nameElement) {
            nameElement.textContent = sessionInfo.player_name || 'Unknown';
        }

        if (classElement && sessionInfo.player_class) {
            classElement.textContent = sessionInfo.player_class;
        }

        // Update HP and Mana if available
        if (sessionInfo.hp !== undefined) {
            this.updateStat('hp', sessionInfo.hp, sessionInfo.max_hp || 20);
        }

        if (sessionInfo.mana !== undefined) {
            this.updateStat('mana', sessionInfo.mana, sessionInfo.max_mana || 10);
        }
    }

    updateStat(statType, current, max) {
        const fill = document.getElementById(`${statType}-fill`);
        const text = document.getElementById(`${statType}-text`);

        if (fill && text) {
            const percentage = (current / max) * 100;
            fill.style.width = `${percentage}%`;
            text.textContent = `${current}/${max}`;
        }
    }

    updateTrustMeter(trustLevel) {
        const bar = document.getElementById('trust-bar');
        const value = document.getElementById('trust-value');

        if (bar && value) {
            this.trustLevel = trustLevel;
            bar.style.width = `${trustLevel}%`;
            value.textContent = `${trustLevel}/100`;

            // Update color based on level
            if (trustLevel > 70) {
                bar.setAttribute('data-level', 'high');
            } else if (trustLevel > 30) {
                bar.setAttribute('data-level', 'medium');
            } else {
                bar.setAttribute('data-level', 'low');
            }
        }
    }

    updatePlayersList(players) {
        const container = document.getElementById('players-container');
        if (!container) return;

        container.innerHTML = players.map(player => {
            const isReady = player.status === 'ready';
            const isChoosing = player.status === 'choosing';

            return `
                <div class="player-item">
                    <div class="player-info">
                        <div class="status-indicator ${isReady ? 'ready' : isChoosing ? 'choosing' : ''}"></div>
                        <span class="player-name">${player.name}</span>
                        ${player.class ? `<span class="player-class">(${player.class})</span>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateNPCsList(npcs) {
        const container = document.getElementById('npcs-container');
        if (!container) return;

        container.innerHTML = npcs.map(npc => {
            const approvalClass = npc.approval > 50 ? 'positive' :
                                 npc.approval < -50 ? 'negative' : 'neutral';

            return `
                <div class="npc-item">
                    <div class="npc-info">
                        <span class="npc-name">${npc.name}</span>
                    </div>
                    <div class="approval-meter">
                        <span class="approval-value ${approvalClass}">${npc.approval > 0 ? '+' : ''}${npc.approval}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateWaitingStatus(players) {
        const statusContainer = document.getElementById('waiting-status');
        if (!statusContainer) return;

        const readyPlayers = players.filter(p => p.status === 'ready');
        const waitingPlayers = players.filter(p => p.status !== 'ready');

        let html = '<h3>Player Status</h3>';

        if (readyPlayers.length > 0) {
            html += '<div class="ready-players"><h4>Ready:</h4>';
            html += readyPlayers.map(p => `<div>✓ ${p.name}</div>`).join('');
            html += '</div>';
        }

        if (waitingPlayers.length > 0) {
            html += '<div class="waiting-players"><h4>Waiting for:</h4>';
            html += waitingPlayers.map(p => `<div>⏳ ${p.name}</div>`).join('');
            html += '</div>';
        }

        statusContainer.innerHTML = html;
    }

    // ===== Utility Methods =====

    showLoading(message = 'Loading...') {
        const overlay = document.getElementById('loading-overlay');
        const text = document.getElementById('loading-text');

        if (overlay) {
            overlay.setAttribute('aria-hidden', 'false');
            if (text) {
                text.textContent = message;
            }
        }
    }

    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.setAttribute('aria-hidden', 'true');
        }
    }

    showError(message) {
        // Check if we're on landing page or game page
        let errorElement = document.getElementById('error-message');

        if (!errorElement) {
            // Use toast for game page
            errorElement = document.getElementById('error-toast');
        }

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';

            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    // ===== Map Methods =====

    initializeMap() {
        // Setup map toggle button
        const mapToggle = document.getElementById('map-toggle');
        const gameMap = document.getElementById('game-map');

        if (mapToggle && gameMap) {
            mapToggle.addEventListener('click', () => {
                const isCollapsed = gameMap.style.display === 'none';
                gameMap.style.display = isCollapsed ? 'block' : 'none';
                mapToggle.querySelector('span').textContent = isCollapsed ? '▼' : '▶';
            });
        }

        // Initialize demo markers for testing
        this.addDemoMarkers();
    }

    addDemoMarkers() {
        // Create demo player markers for visual testing
        const playerMarkersContainer = document.getElementById('player-markers');
        if (!playerMarkersContainer) return;

        const demoPlayers = [
            { id: 'demo1', name: 'You', x: 10, y: 10, color: '#00ff00', isYou: true },
            { id: 'demo2', name: 'Wizard', x: 30, y: 20, color: '#4a9eff', isYou: false },
            { id: 'demo3', name: 'Rogue', x: 50, y: 35, color: '#ffb000', isYou: false }
        ];

        demoPlayers.forEach(player => {
            this.updatePlayerMarker(player);
        });
    }

    updatePlayerMarker(playerData) {
        const playerMarkersContainer = document.getElementById('player-markers');
        if (!playerMarkersContainer) return;

        // Check if marker already exists
        let marker = document.getElementById(`player-marker-${playerData.id}`);

        if (!marker) {
            // Create new marker
            marker = document.createElement('div');
            marker.id = `player-marker-${playerData.id}`;
            marker.className = `player-marker${playerData.isYou ? ' you' : ''}`;
            marker.innerHTML = '<span class="marker-icon">👤</span>';
            playerMarkersContainer.appendChild(marker);
        }

        // Update position (x and y are percentages 0-100)
        marker.style.left = `${playerData.x}%`;
        marker.style.top = `${playerData.y}%`;

        // Update color if provided and not the current player
        if (playerData.color && !playerData.isYou) {
            marker.style.border = `3px solid ${playerData.color}`;
            marker.style.boxShadow = `0 0 20px ${playerData.color}80`;
        }

        // Add tooltip with player name
        marker.setAttribute('title', playerData.name);
    }

    updateMapPositions(players) {
        // This will be called when receiving real-time updates from server
        if (!players || players.length === 0) return;

        const playerMarkersContainer = document.getElementById('player-markers');
        if (!playerMarkersContainer) return;

        // Clear existing markers
        playerMarkersContainer.innerHTML = '';

        // Add marker for each player
        players.forEach((player, index) => {
            const playerData = {
                id: player.id || `player-${index}`,
                name: player.name || 'Unknown',
                x: player.position?.x || 10 + (index * 15),
                y: player.position?.y || 10 + (index * 10),
                color: player.color || this.getPlayerColor(index),
                isYou: player.id === this.playerId
            };
            this.updatePlayerMarker(playerData);
        });
    }

    getPlayerColor(index) {
        const colors = ['#00ff00', '#4a9eff', '#ffb000', '#ff00ff', '#00ffff'];
        return colors[index % colors.length];
    }

    drawPath(fromX, fromY, toX, toY, color = '#00ff00') {
        // Draw movement path on SVG overlay
        const svg = document.querySelector('.path-overlay');
        if (!svg) return;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', `${fromX}%`);
        line.setAttribute('y1', `${fromY}%`);
        line.setAttribute('x2', `${toX}%`);
        line.setAttribute('y2', `${toY}%`);
        line.setAttribute('stroke', color);
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        line.setAttribute('opacity', '0.6');

        svg.appendChild(line);

        // Auto-remove path after animation
        setTimeout(() => {
            line.remove();
        }, 3000);
    }

    // ===== Cleanup =====

    destroy() {
        this.stopGameLoop();
        this.clearPlayerSession();
    }
}

// Initialize on page load
window.addEventListener('beforeunload', () => {
    if (window.game) {
        window.game.stopGameLoop();
    }
});

// Make game instance globally available for debugging
window.ArcaneCodexGame = ArcaneCodexGame;