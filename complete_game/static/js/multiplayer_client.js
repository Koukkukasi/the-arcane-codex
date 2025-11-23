/**
 * Multiplayer Client Manager
 * Handles Socket.IO connection and real-time multiplayer features
 */

class MultiplayerClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentRoom = null;
    this.playerId = null;
    this.playerName = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
    this.eventHandlers = new Map();
  }

  /**
   * Initialize Socket.IO connection
   */
  connect() {
    if (this.socket && this.isConnected) {
      console.log('[MULTIPLAYER] Already connected');
      return;
    }

    // Connect to Socket.IO server
    this.socket = io({
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    this.setupSocketEvents();
    console.log('[MULTIPLAYER] Connecting to server...');
  }

  /**
   * Setup Socket.IO event listeners
   */
  setupSocketEvents() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('[MULTIPLAYER] Connected to server');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      this.emit('connected');
    });

    this.socket.on('disconnect', () => {
      console.log('[MULTIPLAYER] Disconnected from server');
      this.isConnected = false;
      this.stopHeartbeat();
      this.emit('disconnected');
    });

    this.socket.on('reconnect_attempt', () => {
      this.reconnectAttempts++;
      console.log(`[MULTIPLAYER] Reconnection attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
      this.emit('reconnecting', { attempt: this.reconnectAttempts });
    });

    this.socket.on('reconnect_failed', () => {
      console.error('[MULTIPLAYER] Failed to reconnect after maximum attempts');
      this.emit('reconnect_failed');
    });

    // Room events
    this.socket.on('player_joined', (data) => {
      console.log('[MULTIPLAYER] Player joined:', data);
      this.emit('player_joined', data);
    });

    this.socket.on('player_left', (data) => {
      console.log('[MULTIPLAYER] Player left:', data);
      this.emit('player_left', data);
    });

    this.socket.on('player_disconnected', (data) => {
      console.log('[MULTIPLAYER] Player disconnected:', data);
      this.emit('player_disconnected', data);
    });

    this.socket.on('player_reconnected', (data) => {
      console.log('[MULTIPLAYER] Player reconnected:', data);
      this.emit('player_reconnected', data);
    });

    this.socket.on('host_changed', (data) => {
      console.log('[MULTIPLAYER] Host changed:', data);
      this.emit('host_changed', data);
    });

    // Game state events
    this.socket.on('phase_changed', (data) => {
      console.log('[MULTIPLAYER] Game phase changed:', data);
      this.emit('phase_changed', data);
    });

    this.socket.on('player_ready_changed', (data) => {
      console.log('[MULTIPLAYER] Player ready status changed:', data);
      this.emit('player_ready_changed', data);
    });

    // Chat events
    this.socket.on('chat_message', (data) => {
      console.log('[MULTIPLAYER] Chat message:', data);
      this.emit('chat_message', data);
    });

    // Battle events
    this.socket.on('battle_action', (data) => {
      console.log('[MULTIPLAYER] Battle action:', data);
      this.emit('battle_action', data);
    });

    // Scenario events
    this.socket.on('scenario_choice_made', (data) => {
      console.log('[MULTIPLAYER] Player made scenario choice:', data);
      this.emit('scenario_choice_made', data);
    });

    this.socket.on('clue_received', (data) => {
      console.log('[MULTIPLAYER] Clue received:', data);
      this.emit('clue_received', data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('[MULTIPLAYER] Socket error:', error);
      this.emit('error', error);
    });
  }

  /**
   * Join a multiplayer room
   */
  async joinRoom(roomId, playerId, playerName, rejoin = false) {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        reject(new Error('Not connected to server'));
        return;
      }

      this.socket.emit('join_room', {
        roomId,
        playerId,
        playerName,
        rejoin
      }, (response) => {
        if (response.success) {
          this.currentRoom = roomId;
          this.playerId = playerId;
          this.playerName = playerName;
          console.log('[MULTIPLAYER] Joined room:', roomId);
          resolve(response.data);
        } else {
          console.error('[MULTIPLAYER] Failed to join room:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Leave current room
   */
  async leaveRoom(reason = 'manual') {
    return new Promise((resolve, reject) => {
      if (!this.currentRoom) {
        resolve();
        return;
      }

      this.socket.emit('leave_room', {
        roomId: this.currentRoom,
        playerId: this.playerId,
        reason
      }, (response) => {
        if (response.success) {
          console.log('[MULTIPLAYER] Left room:', this.currentRoom);
          this.currentRoom = null;
          resolve();
        } else {
          console.error('[MULTIPLAYER] Failed to leave room:', response.error);
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Set ready status
   */
  async setReady(isReady) {
    return new Promise((resolve, reject) => {
      if (!this.currentRoom) {
        reject(new Error('Not in a room'));
        return;
      }

      this.socket.emit('ready_status', {
        roomId: this.currentRoom,
        playerId: this.playerId,
        isReady
      }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send chat message
   */
  async sendChatMessage(message) {
    return new Promise((resolve, reject) => {
      if (!this.currentRoom) {
        reject(new Error('Not in a room'));
        return;
      }

      this.socket.emit('chat_message', {
        roomId: this.currentRoom,
        playerId: this.playerId,
        message
      }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Request game state sync
   */
  async requestSync(syncType = 'full') {
    return new Promise((resolve, reject) => {
      if (!this.currentRoom) {
        reject(new Error('Not in a room'));
        return;
      }

      this.socket.emit('request_sync', {
        roomId: this.currentRoom,
        playerId: this.playerId,
        syncType
      }, (response) => {
        if (response.success) {
          resolve(response.data);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send battle action
   */
  async sendBattleAction(actionType, targetId, abilityId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('battle_turn', {
        playerId: this.playerId,
        actionType,
        targetId,
        abilityId,
        timestamp: Date.now()
      }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Send scenario choice (without revealing what)
   */
  async sendScenarioChoice(scenarioId, choiceId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('scenario_choice', {
        playerId: this.playerId,
        scenarioId,
        choiceId
      }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Share a clue with another player
   */
  async shareClue(targetPlayerId, clueId) {
    return new Promise((resolve, reject) => {
      this.socket.emit('share_clue', {
        playerId: this.playerId,
        targetPlayerId,
        clueId
      }, (response) => {
        if (response.success) {
          resolve();
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  /**
   * Start heartbeat to keep connection alive
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      return;
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.currentRoom && this.isConnected) {
        this.socket.emit('heartbeat', {
          roomId: this.currentRoom,
          playerId: this.playerId,
          timestamp: Date.now()
        }, () => {
          // Heartbeat acknowledged
        });
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * Register event handler
   */
  on(eventName, handler) {
    if (!this.eventHandlers.has(eventName)) {
      this.eventHandlers.set(eventName, []);
    }
    this.eventHandlers.get(eventName).push(handler);
  }

  /**
   * Unregister event handler
   */
  off(eventName, handler) {
    if (this.eventHandlers.has(eventName)) {
      const handlers = this.eventHandlers.get(eventName);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Emit custom event to registered handlers
   */
  emit(eventName, data) {
    if (this.eventHandlers.has(eventName)) {
      this.eventHandlers.get(eventName).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`[MULTIPLAYER] Error in event handler for ${eventName}:`, error);
        }
      });
    }
  }

  /**
   * Disconnect from server
   */
  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.currentRoom = null;
    console.log('[MULTIPLAYER] Disconnected');
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      currentRoom: this.currentRoom,
      playerId: this.playerId,
      playerName: this.playerName,
      socketId: this.socket?.id
    };
  }
}

// Create global multiplayer client instance
const multiplayerClient = new MultiplayerClient();

// Auto-connect when page loads (if Socket.IO is available)
if (typeof io !== 'undefined') {
  window.addEventListener('load', () => {
    console.log('[MULTIPLAYER] Socket.IO available, ready to connect');
    // Don't auto-connect yet - let the game initialize first
  });
} else {
  console.warn('[MULTIPLAYER] Socket.IO library not loaded');
}
