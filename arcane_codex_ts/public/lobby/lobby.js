/**
 * The Arcane Codex - Multiplayer Lobby Client
 * Handles real-time party management and Socket.IO communication
 */

// ============================================
// State Management
// ============================================

const LobbyState = {
  // Player identity (from JWT auth)
  playerId: null,
  playerName: null,

  // Socket connection
  socket: null,
  connectionStatus: 'disconnected',

  // Current party
  currentParty: null,
  isHost: false,
  isReady: false,
  selectedRole: null,

  // Players in party
  players: new Map(),

  // UI references
  ui: {},

  // Auth modal state
  authModalVisible: false
};

// ============================================
// Global Fetch Wrapper for 401 Handling
// ============================================

/**
 * Wrapper around fetch to handle 401 responses globally
 */
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const response = await originalFetch(...args);

  // If we get a 401 and we're authenticated, show login modal
  if (response.status === 401 && authManager && authManager.isAuthenticated()) {
    console.warn('[Fetch] Got 401 response, token may be expired');
    showToast('Session expired. Please login again.', 'error');
    setTimeout(() => {
      handleLogout();
    }, 1000);
  }

  return response;
};

// ============================================
// Initialization
// ============================================

/**
 * Initialize the lobby application
 */
function initializeLobby() {
  // Cache UI references
  cacheUIReferences();

  // Setup event listeners (including auth)
  setupEventListeners();

  // Check authentication status
  if (authManager.isAuthenticated()) {
    // User is logged in, get identity from auth
    const user = authManager.getUser();
    LobbyState.playerId = user.id;
    LobbyState.playerName = user.username;

    // Show user display
    showUserDisplay();

    // Initialize Socket.IO connection
    initializeSocket();

    // Setup particle effects
    initializeParticles();

    console.log('[Lobby] Initialized with auth', { playerId: LobbyState.playerId, playerName: LobbyState.playerName });
  } else {
    // Not authenticated, show login modal
    showAuthModal();
    console.log('[Lobby] Not authenticated, showing login modal');
  }
}

/**
 * Cache all UI element references
 */
function cacheUIReferences() {
  LobbyState.ui = {
    // Auth modal
    authModal: document.getElementById('authModal'),
    authTabs: document.querySelectorAll('.auth-tab'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginError: document.getElementById('loginError'),
    registerError: document.getElementById('registerError'),
    btnLogin: document.getElementById('btnLogin'),
    btnRegister: document.getElementById('btnRegister'),

    // User display
    userDisplay: document.getElementById('userDisplay'),
    displayUsername: document.getElementById('displayUsername'),
    btnLogout: document.getElementById('btnLogout'),

    // Connection status
    statusIndicator: document.querySelector('.status-indicator'),
    statusText: document.querySelector('.status-text'),

    // Create party
    partyNameInput: document.getElementById('partyNameInput'),
    maxPlayersSelect: document.getElementById('maxPlayersSelect'),
    publicPartyCheck: document.getElementById('publicPartyCheck'),
    btnCreateParty: document.getElementById('btnCreateParty'),

    // Join party
    partyCodeInput: document.getElementById('partyCodeInput'),
    btnJoinParty: document.getElementById('btnJoinParty'),
    btnBrowsePublic: document.getElementById('btnBrowsePublic'),

    // Player list
    playersList: document.getElementById('playersList'),
    emptyState: document.getElementById('emptyState'),
    playerCount: document.getElementById('playerCount'),
    maxPlayers: document.getElementById('maxPlayers'),

    // Role selector
    roleSelector: document.getElementById('roleSelector'),
    roleCards: document.querySelectorAll('.role-card'),

    // Ready & Start
    btnReady: document.getElementById('btnReady'),

    // Phase indicator
    phaseIndicator: document.getElementById('phaseIndicator'),
    phaseName: document.getElementById('phaseName'),

    // Chat
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    btnSendChat: document.getElementById('btnSendChat'),

    // Toast container
    toastContainer: document.getElementById('toastContainer'),

    // Public parties modal
    publicPartiesModal: document.getElementById('publicPartiesModal'),
    publicPartiesList: document.getElementById('publicPartiesList'),
    btnClosePublic: document.getElementById('btnClosePublic')
  };
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  const { ui } = LobbyState;

  // Auth tabs
  ui.authTabs.forEach(tab => {
    tab.addEventListener('click', () => handleAuthTabSwitch(tab));
  });

  // Auth forms
  ui.loginForm.addEventListener('submit', handleLogin);
  ui.registerForm.addEventListener('submit', handleRegister);

  // Logout
  ui.btnLogout.addEventListener('click', handleLogout);

  // Create party
  ui.btnCreateParty.addEventListener('click', handleCreateParty);

  // Join party
  ui.btnJoinParty.addEventListener('click', handleJoinParty);
  ui.partyCodeInput.addEventListener('input', handlePartyCodeInput);
  ui.partyCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleJoinParty();
  });

  // Browse public parties
  ui.btnBrowsePublic.addEventListener('click', handleBrowsePublic);
  ui.btnClosePublic.addEventListener('click', () => {
    ui.publicPartiesModal.classList.remove('visible');
  });

  // Role selection
  ui.roleCards.forEach(card => {
    card.addEventListener('click', () => handleRoleSelect(card));
  });

  // Ready button
  ui.btnReady.addEventListener('click', handleReadyToggle);

  // Chat
  ui.btnSendChat.addEventListener('click', handleSendChat);
  ui.chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendChat();
  });
}

// ============================================
// Authentication Handlers
// ============================================

/**
 * Show auth modal
 */
function showAuthModal() {
  const { ui } = LobbyState;
  ui.authModal.classList.add('visible');
  LobbyState.authModalVisible = true;
}

/**
 * Hide auth modal
 */
function hideAuthModal() {
  const { ui } = LobbyState;
  ui.authModal.classList.remove('visible');
  LobbyState.authModalVisible = false;
}

/**
 * Show user display in header
 */
function showUserDisplay() {
  const { ui } = LobbyState;
  ui.displayUsername.textContent = LobbyState.playerName;
  ui.userDisplay.classList.add('visible');
}

/**
 * Hide user display
 */
function hideUserDisplay() {
  const { ui } = LobbyState;
  ui.userDisplay.classList.remove('visible');
}

/**
 * Handle auth tab switching
 */
function handleAuthTabSwitch(tab) {
  const { ui } = LobbyState;
  const targetTab = tab.dataset.tab;

  // Update tab active state
  ui.authTabs.forEach(t => t.classList.remove('active'));
  tab.classList.add('active');

  // Show/hide forms
  if (targetTab === 'login') {
    ui.loginForm.classList.add('active');
    ui.registerForm.classList.remove('active');
    ui.loginError.classList.remove('visible');
  } else {
    ui.loginForm.classList.remove('active');
    ui.registerForm.classList.add('active');
    ui.registerError.classList.remove('visible');
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(e) {
  e.preventDefault();
  const { ui } = LobbyState;

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showAuthError('login', 'Please enter username and password');
    return;
  }

  // Disable button
  ui.btnLogin.disabled = true;
  ui.btnLogin.textContent = 'AUTHENTICATING...';

  try {
    const result = await authManager.login(username, password);

    if (result.success) {
      // Update lobby state
      LobbyState.playerId = result.user.id;
      LobbyState.playerName = result.user.username;

      // Hide auth modal
      hideAuthModal();

      // Show user display
      showUserDisplay();

      // Initialize Socket.IO connection
      initializeSocket();

      // Setup particle effects
      initializeParticles();

      showToast('Welcome, ' + result.user.username + '!', 'success');

      // Clear form
      document.getElementById('loginUsername').value = '';
      document.getElementById('loginPassword').value = '';
    } else {
      showAuthError('login', result.error);
    }
  } catch (error) {
    console.error('[Auth] Login error', error);
    showAuthError('login', 'Login failed. Please try again.');
  } finally {
    ui.btnLogin.disabled = false;
    ui.btnLogin.textContent = 'Enter the Codex';
  }
}

/**
 * Handle register form submission
 */
async function handleRegister(e) {
  e.preventDefault();
  const { ui } = LobbyState;

  const username = document.getElementById('registerUsername').value.trim();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;
  const passwordConfirm = document.getElementById('registerPasswordConfirm').value;

  // Validation
  if (!username || !password) {
    showAuthError('register', 'Please enter username and password');
    return;
  }

  if (password.length < 6) {
    showAuthError('register', 'Password must be at least 6 characters');
    return;
  }

  if (password !== passwordConfirm) {
    showAuthError('register', 'Passwords do not match');
    return;
  }

  // Disable button
  ui.btnRegister.disabled = true;
  ui.btnRegister.textContent = 'CREATING ACCOUNT...';

  try {
    const result = await authManager.register(username, password, email || null);

    if (result.success) {
      // Update lobby state
      LobbyState.playerId = result.user.id;
      LobbyState.playerName = result.user.username;

      // Hide auth modal
      hideAuthModal();

      // Show user display
      showUserDisplay();

      // Initialize Socket.IO connection
      initializeSocket();

      // Setup particle effects
      initializeParticles();

      showToast('Account created! Welcome, ' + result.user.username + '!', 'success');

      // Clear form
      document.getElementById('registerUsername').value = '';
      document.getElementById('registerEmail').value = '';
      document.getElementById('registerPassword').value = '';
      document.getElementById('registerPasswordConfirm').value = '';
    } else {
      showAuthError('register', result.error);
    }
  } catch (error) {
    console.error('[Auth] Registration error', error);
    showAuthError('register', 'Registration failed. Please try again.');
  } finally {
    ui.btnRegister.disabled = false;
    ui.btnRegister.textContent = 'Join the Codex';
  }
}

/**
 * Handle logout
 */
async function handleLogout() {
  const { ui } = LobbyState;

  // Disconnect socket
  if (LobbyState.socket) {
    LobbyState.socket.disconnect();
    LobbyState.socket = null;
  }

  // Logout from auth manager
  await authManager.logout();

  // Clear lobby state
  LobbyState.playerId = null;
  LobbyState.playerName = null;
  LobbyState.currentParty = null;
  LobbyState.isHost = false;
  LobbyState.isReady = false;
  LobbyState.players.clear();

  // Hide user display
  hideUserDisplay();

  // Show auth modal
  showAuthModal();

  // Clear UI
  ui.playersList.innerHTML = '';
  ui.emptyState.style.display = 'block';
  ui.roleSelector.classList.remove('visible');
  ui.btnReady.classList.remove('visible');
  ui.phaseIndicator.classList.remove('visible');

  showToast('Logged out successfully', 'info');
}

/**
 * Show auth error message
 */
function showAuthError(form, message) {
  const { ui } = LobbyState;
  const errorEl = form === 'login' ? ui.loginError : ui.registerError;
  errorEl.textContent = message;
  errorEl.classList.add('visible');

  // Hide error after 5 seconds
  setTimeout(() => {
    errorEl.classList.remove('visible');
  }, 5000);
}

// ============================================
// Socket.IO Connection
// ============================================

/**
 * Initialize Socket.IO connection with authentication
 */
function initializeSocket() {
  updateConnectionStatus('connecting');

  // Get JWT token from auth manager
  const token = authManager.getAccessToken();

  // Connect to Socket.IO server with auth
  LobbyState.socket = io(window.location.origin, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    auth: {
      token: token,
      playerId: LobbyState.playerId,
      playerName: LobbyState.playerName
    }
  });

  setupSocketEventHandlers(LobbyState.socket);
}

/**
 * Setup Socket.IO event handlers
 */
function setupSocketEventHandlers(socket) {
  // Connection events
  socket.on('connect', handleSocketConnect);
  socket.on('disconnect', handleSocketDisconnect);
  socket.on('connect_error', handleSocketError);

  // Party events
  socket.on('player_joined', handlePlayerJoined);
  socket.on('player_left', handlePlayerLeft);
  socket.on('player_disconnected', handlePlayerDisconnected);
  socket.on('player_reconnected', handlePlayerReconnected);

  // Chat events
  socket.on('chat_message', handleChatMessage);

  // Ready status
  socket.on('player_ready_changed', handlePlayerReadyChanged);

  // Game start
  socket.on('game_started', handleGameStarted);

  // Phase changes
  socket.on('phase_changed', handlePhaseChanged);

  // Host transfer
  socket.on('host_changed', handleHostChanged);
}

/**
 * Handle socket connection
 */
function handleSocketConnect() {
  console.log('[Socket] Connected', { socketId: LobbyState.socket.id });
  updateConnectionStatus('connected');
  addSystemMessage('Connected to server');
}

/**
 * Handle socket disconnection
 */
function handleSocketDisconnect() {
  console.log('[Socket] Disconnected');
  updateConnectionStatus('disconnected');
  addSystemMessage('Disconnected from server');
}

/**
 * Handle socket connection error
 */
function handleSocketError(error) {
  console.error('[Socket] Connection error', error);
  updateConnectionStatus('disconnected');

  // Check if it's an auth error
  if (error.message && error.message.includes('401')) {
    showToast('Authentication failed. Please login again.', 'error');
    handleLogout();
  } else {
    showToast('Connection error: ' + error.message, 'error');
  }
}

// ============================================
// Socket Event Handlers
// ============================================

/**
 * Handle player joined event
 */
function handlePlayerJoined(data) {
  console.log('[Event] Player joined', data);

  const { playerId, playerName } = data;

  // Add to local players map
  LobbyState.players.set(playerId, {
    id: playerId,
    name: playerName,
    isReady: false,
    isConnected: true
  });

  // Update UI
  updatePlayerList();
  addSystemMessage(`${playerName} joined the party`);
}

/**
 * Handle player left event
 */
function handlePlayerLeft(data) {
  console.log('[Event] Player left', data);

  const { playerId } = data;
  const player = LobbyState.players.get(playerId);

  if (player) {
    LobbyState.players.delete(playerId);
    updatePlayerList();
    addSystemMessage(`${player.name} left the party`);
  }
}

/**
 * Handle player disconnected event
 */
function handlePlayerDisconnected(data) {
  console.log('[Event] Player disconnected', data);

  const { playerId } = data;
  const player = LobbyState.players.get(playerId);

  if (player) {
    player.isConnected = false;
    updatePlayerList();
    addSystemMessage(`${player.name} disconnected`);
  }
}

/**
 * Handle player reconnected event
 */
function handlePlayerReconnected(data) {
  console.log('[Event] Player reconnected', data);

  const { playerId, playerName } = data;
  const player = LobbyState.players.get(playerId);

  if (player) {
    player.isConnected = true;
    updatePlayerList();
    addSystemMessage(`${playerName} reconnected`);
  }
}

/**
 * Handle chat message event
 */
function handleChatMessage(data) {
  console.log('[Event] Chat message', data);

  const { playerName, message } = data;
  addChatMessage(playerName, message);
}

/**
 * Handle player ready status change
 */
function handlePlayerReadyChanged(data) {
  console.log('[Event] Ready status changed', data);

  const { playerId, isReady } = data;
  const player = LobbyState.players.get(playerId);

  if (player) {
    player.isReady = isReady;
    updatePlayerList();
    addSystemMessage(`${player.name} is ${isReady ? 'ready' : 'not ready'}`);
  }
}

/**
 * Handle game started event
 */
function handleGameStarted(data) {
  console.log('[Event] Game started', data);

  const { sessionId, phase } = data;

  addSystemMessage('Game is starting!');
  showToast('The game has begun!', 'success');

  // Redirect to game in 2 seconds
  setTimeout(() => {
    window.location.href = `/?session=${sessionId}`;
  }, 2000);
}

/**
 * Handle phase change event
 */
function handlePhaseChanged(data) {
  console.log('[Event] Phase changed', data);

  const { newPhase } = data;
  LobbyState.ui.phaseName.textContent = newPhase;
  addSystemMessage(`Phase changed to ${newPhase}`);
}

/**
 * Handle host change event
 */
function handleHostChanged(data) {
  console.log('[Event] Host changed', data);

  const { newHostId } = data;
  LobbyState.isHost = (newHostId === LobbyState.playerId);

  const player = LobbyState.players.get(newHostId);
  if (player) {
    addSystemMessage(`${player.name} is now the host`);
  }

  updatePlayerList();
}

// ============================================
// Party Management
// ============================================

/**
 * Handle create party button click
 */
async function handleCreateParty() {
  const { ui } = LobbyState;
  const partyName = ui.partyNameInput.value.trim();

  if (!partyName) {
    showToast('Please enter a party name', 'error');
    ui.partyNameInput.focus();
    return;
  }

  // Disable button
  ui.btnCreateParty.disabled = true;
  ui.btnCreateParty.textContent = 'CREATING...';

  try {
    const token = authManager.getAccessToken();
    const response = await fetch('/api/multiplayer/party/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        hostId: LobbyState.playerId,
        partyName: partyName,
        maxPlayers: parseInt(ui.maxPlayersSelect.value),
        isPublic: ui.publicPartyCheck.checked
      })
    });

    const data = await response.json();

    if (data.success) {
      LobbyState.currentParty = data.data;
      LobbyState.isHost = true;

      // Join Socket.IO room
      await joinSocketRoom(data.data.code);

      // Show party UI
      showPartyUI();

      showToast(`Party created! Code: ${data.data.code}`, 'success');

      // Clear input
      ui.partyNameInput.value = '';
    } else {
      showToast(data.error || 'Failed to create party', 'error');
    }
  } catch (error) {
    console.error('[Party] Create failed', error);
    showToast('Failed to create party', 'error');
  } finally {
    ui.btnCreateParty.disabled = false;
    ui.btnCreateParty.textContent = 'CREATE PARTY';
  }
}

/**
 * Handle join party button click
 */
async function handleJoinParty() {
  const { ui } = LobbyState;
  const partyCode = ui.partyCodeInput.value.trim().toUpperCase();

  if (!partyCode || partyCode.length !== 6) {
    showToast('Please enter a valid 6-digit party code', 'error');
    ui.partyCodeInput.focus();
    return;
  }

  // Disable button
  ui.btnJoinParty.disabled = true;
  ui.btnJoinParty.textContent = 'JOINING...';

  try {
    const token = authManager.getAccessToken();
    const response = await fetch('/api/multiplayer/party/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        partyCode: partyCode,
        playerId: LobbyState.playerId,
        playerName: LobbyState.playerName
      })
    });

    const data = await response.json();

    if (data.success) {
      LobbyState.currentParty = data.data;
      LobbyState.isHost = (data.data.host === LobbyState.playerId);

      // Load existing players
      if (data.data.players) {
        data.data.players.forEach(player => {
          LobbyState.players.set(player.id, {
            id: player.id,
            name: player.name,
            isReady: player.isReady || false,
            isConnected: true,
            role: player.role
          });
        });
      }

      // Join Socket.IO room
      await joinSocketRoom(data.data.code);

      // Show party UI
      showPartyUI();

      showToast('Joined party!', 'success');

      // Clear input
      ui.partyCodeInput.value = '';
    } else {
      showToast(data.error || 'Failed to join party', 'error');
    }
  } catch (error) {
    console.error('[Party] Join failed', error);
    showToast('Failed to join party', 'error');
  } finally {
    ui.btnJoinParty.disabled = false;
    ui.btnJoinParty.textContent = 'JOIN PARTY';
  }
}

/**
 * Join Socket.IO room
 */
function joinSocketRoom(roomId) {
  return new Promise((resolve, reject) => {
    LobbyState.socket.emit('join_room', {
      roomId: roomId,
      playerId: LobbyState.playerId,
      playerName: LobbyState.playerName,
      rejoin: false
    }, (response) => {
      if (response.success) {
        console.log('[Socket] Joined room', roomId);

        // Load players from response
        if (response.data && response.data.players) {
          response.data.players.forEach(player => {
            LobbyState.players.set(player.playerId, {
              id: player.playerId,
              name: player.playerName,
              isReady: false,
              isConnected: player.isConnected
            });
          });
          updatePlayerList();
        }

        resolve(response);
      } else {
        console.error('[Socket] Failed to join room', response.error);
        reject(new Error(response.error || 'Failed to join room'));
      }
    });
  });
}

/**
 * Handle browse public parties
 */
async function handleBrowsePublic() {
  const { ui } = LobbyState;

  ui.publicPartiesModal.classList.add('visible');
  ui.publicPartiesList.innerHTML = '<li>Loading public parties...</li>';

  try {
    const token = authManager.getAccessToken();
    const response = await fetch('/api/multiplayer/parties/public', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();

    if (data.success && data.data.length > 0) {
      ui.publicPartiesList.innerHTML = data.data.map(party => `
        <li data-code="${party.code}" onclick="joinPublicParty('${party.code}')">
          <div>
            <strong>${escapeHtml(party.name)}</strong><br>
            <small>${party.playerCount}/${party.maxPlayers} players</small>
          </div>
        </li>
      `).join('');
    } else {
      ui.publicPartiesList.innerHTML = '<li style="text-align: center; color: rgba(51, 255, 51, 0.5);">No public parties available</li>';
    }
  } catch (error) {
    console.error('[Party] Failed to load public parties', error);
    ui.publicPartiesList.innerHTML = '<li style="text-align: center; color: #8b0000;">Failed to load parties</li>';
  }
}

/**
 * Join a public party from the modal
 */
window.joinPublicParty = function(partyCode) {
  LobbyState.ui.publicPartiesModal.classList.remove('visible');
  LobbyState.ui.partyCodeInput.value = partyCode;
  handleJoinParty();
};

/**
 * Handle party code input formatting
 */
function handlePartyCodeInput(e) {
  e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').substring(0, 6);
}

// ============================================
// Role Selection
// ============================================

/**
 * Handle role card selection
 */
function handleRoleSelect(card) {
  const { ui } = LobbyState;

  // Remove selection from all cards
  ui.roleCards.forEach(c => c.classList.remove('selected'));

  // Select this card
  card.classList.add('selected');
  LobbyState.selectedRole = card.dataset.role;

  console.log('[Role] Selected', LobbyState.selectedRole);
}

// ============================================
// Ready & Start
// ============================================

/**
 * Handle ready button toggle
 */
function handleReadyToggle() {
  const { ui, socket, currentParty, playerId, isReady } = LobbyState;

  if (!currentParty) return;

  const newReadyState = !isReady;

  socket.emit('ready_status', {
    roomId: currentParty.code,
    playerId: playerId,
    isReady: newReadyState
  }, (response) => {
    if (response.success) {
      LobbyState.isReady = newReadyState;

      // Update button text
      if (LobbyState.isHost) {
        ui.btnReady.textContent = newReadyState ? 'Start Game' : 'Ready';
      } else {
        ui.btnReady.textContent = newReadyState ? 'Not Ready' : 'Ready';
      }

      // Update local player
      const player = LobbyState.players.get(playerId);
      if (player) {
        player.isReady = newReadyState;
        updatePlayerList();
      }

      // If host and ready, start the game
      if (LobbyState.isHost && newReadyState) {
        startGame();
      }
    } else {
      showToast('Failed to update ready status', 'error');
    }
  });
}

/**
 * Start the game (host only)
 */
async function startGame() {
  const { currentParty, playerId } = LobbyState;

  if (!currentParty || !LobbyState.isHost) {
    showToast('Only the host can start the game', 'error');
    return;
  }

  try {
    const token = authManager.getAccessToken();
    const response = await fetch(`/api/multiplayer/party/${currentParty.code}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        hostId: playerId
      })
    });

    const data = await response.json();

    if (data.success) {
      addSystemMessage('Starting game...');
      // The game_started event will be emitted via socket
    } else {
      showToast(data.error || 'Failed to start game', 'error');
      // Reset ready state
      LobbyState.isReady = false;
      LobbyState.ui.btnReady.textContent = 'Ready';
    }
  } catch (error) {
    console.error('[Game] Failed to start', error);
    showToast('Failed to start game', 'error');
    LobbyState.isReady = false;
    LobbyState.ui.btnReady.textContent = 'Ready';
  }
}

// ============================================
// Chat
// ============================================

/**
 * Handle send chat button click
 */
function handleSendChat() {
  const { ui, socket, currentParty, playerId, chatInput } = LobbyState;
  const message = ui.chatInput.value.trim();

  if (!message || !currentParty) return;

  socket.emit('chat_message', {
    roomId: currentParty.code,
    playerId: playerId,
    message: message
  }, (response) => {
    if (response.success) {
      ui.chatInput.value = '';
    } else {
      showToast('Failed to send message', 'error');
    }
  });
}

/**
 * Add a chat message to the chat box
 */
function addChatMessage(sender, message) {
  const { ui } = LobbyState;

  const msgEl = document.createElement('div');
  msgEl.className = 'chat-message';
  msgEl.innerHTML = `<span class="sender">${escapeHtml(sender)}:</span> ${escapeHtml(message)}`;

  ui.chatMessages.appendChild(msgEl);
  ui.chatMessages.scrollTop = ui.chatMessages.scrollHeight;
}

/**
 * Add a system message to the chat
 */
function addSystemMessage(message) {
  addChatMessage('System', message);
}

// ============================================
// UI Updates
// ============================================

/**
 * Update connection status indicator
 */
function updateConnectionStatus(status) {
  const { ui } = LobbyState;
  LobbyState.connectionStatus = status;

  ui.statusIndicator.className = 'status-indicator';

  switch (status) {
    case 'connected':
      ui.statusText.textContent = 'CONNECTED';
      break;
    case 'connecting':
      ui.statusText.textContent = 'CONNECTING';
      ui.statusIndicator.classList.add('connecting');
      break;
    case 'disconnected':
      ui.statusText.textContent = 'DISCONNECTED';
      ui.statusIndicator.classList.add('disconnected');
      break;
  }
}

/**
 * Show the party UI (after joining/creating)
 */
function showPartyUI() {
  const { ui, currentParty } = LobbyState;

  // Hide empty state
  ui.emptyState.style.display = 'none';

  // Show role selector and ready button
  ui.roleSelector.classList.add('visible');
  ui.btnReady.classList.add('visible');

  // Show phase indicator
  ui.phaseIndicator.classList.add('visible');

  // Update max players
  ui.maxPlayers.textContent = currentParty.settings?.maxPlayers || currentParty.maxPlayers || 4;

  // Add self to players list
  LobbyState.players.set(LobbyState.playerId, {
    id: LobbyState.playerId,
    name: LobbyState.playerName,
    isReady: false,
    isConnected: true
  });

  // Update player list
  updatePlayerList();

  // Add system message
  addSystemMessage(`Party code: ${currentParty.code}`);
}

/**
 * Update the player list UI
 */
function updatePlayerList() {
  const { ui, playerId } = LobbyState;
  const players = Array.from(LobbyState.players.values());

  // Update count
  ui.playerCount.textContent = players.length;

  // Clear list
  ui.playersList.innerHTML = '';

  // Add players
  players.forEach(player => {
    const li = document.createElement('li');

    const isHost = (LobbyState.currentParty && player.id === LobbyState.currentParty.host);
    const isSelf = (player.id === playerId);

    let badges = [];
    if (isHost) badges.push('<span style="color: var(--arcane-gold);">[HOST]</span>');
    if (isSelf) badges.push('<span style="color: var(--crt-green);">[YOU]</span>');
    if (!player.isConnected) badges.push('<span style="color: var(--arcane-blood);">[OFFLINE]</span>');

    const readyIcon = player.isReady ? '✓' : '○';
    const readyColor = player.isReady ? 'var(--crt-green)' : 'rgba(51, 255, 51, 0.3)';

    li.innerHTML = `
      <div>
        <strong>${escapeHtml(player.name)}</strong>
        ${badges.join(' ')}
      </div>
      <div style="color: ${readyColor};">${readyIcon}</div>
    `;

    ui.playersList.appendChild(li);
  });
}

/**
 * Show a toast notification
 */
function showToast(message, type = 'info') {
  const { ui } = LobbyState;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  ui.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// ============================================
// Particle Effects
// ============================================

/**
 * Initialize particle effects
 */
function initializeParticles() {
  const particlesContainer = document.getElementById('particles');
  if (!particlesContainer) return;

  // Create floating particles
  for (let i = 0; i < 30; i++) {
    createParticle(particlesContainer);
  }
}

/**
 * Create a single particle
 */
function createParticle(container) {
  const particle = document.createElement('div');
  particle.style.position = 'absolute';
  particle.style.width = Math.random() * 3 + 1 + 'px';
  particle.style.height = particle.style.width;
  particle.style.background = 'rgba(123, 44, 191, ' + (Math.random() * 0.5 + 0.2) + ')';
  particle.style.borderRadius = '50%';
  particle.style.left = Math.random() * 100 + '%';
  particle.style.top = Math.random() * 100 + '%';
  particle.style.pointerEvents = 'none';
  particle.style.boxShadow = '0 0 10px rgba(123, 44, 191, 0.5)';

  container.appendChild(particle);

  // Animate particle
  animateParticle(particle);
}

/**
 * Animate a particle
 */
function animateParticle(particle) {
  const duration = Math.random() * 10000 + 10000; // 10-20 seconds
  const startX = parseFloat(particle.style.left);
  const startY = parseFloat(particle.style.top);
  const endX = Math.random() * 100;
  const endY = Math.random() * 100;
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % duration) / duration;

    const x = startX + (endX - startX) * progress;
    const y = startY + (endY - startY) * progress;

    particle.style.left = x + '%';
    particle.style.top = y + '%';
    particle.style.opacity = Math.sin(progress * Math.PI);

    requestAnimationFrame(animate);
  }

  animate();
}

// ============================================
// Utility Functions
// ============================================

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// Initialize on page load
// ============================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLobby);
} else {
  initializeLobby();
}
