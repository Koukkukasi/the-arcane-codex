/**
 * Multiplayer Service
 * Manages real-time multiplayer game sessions using Socket.IO
 */

import { Server, Socket } from 'socket.io';
import { PartyManager } from './party_manager';
import { multiplayerLogger } from '../logger';
import {
  PlayerConnection,
  RoomState,
  GamePhase,
  JoinRoomPayload,
  LeaveRoomPayload,
  ReadyStatusPayload,
  ChatMessagePayload,
  PlayerActionPayload,
  RequestSyncPayload,
  HeartbeatPayload,
  ChatMessage,
  GlobalEvent,
  BattleAction,
  SocketResponse,
  ReconnectionData
} from '../../types/multiplayer';

/**
 * Singleton service for managing multiplayer sessions
 */
export class MultiplayerService {
  private static instance: MultiplayerService;
  private io: Server;
  // @ts-expect-error - PartyManager is initialized but not yet used
  private _partyManager: PartyManager;
  private rooms: Map<string, RoomState>;
  private playerConnections: Map<string, PlayerConnection>;
  private reconnectionData: Map<string, ReconnectionData>;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor(io: Server) {
    this.io = io;
    this._partyManager = PartyManager.getInstance();
    this.rooms = new Map();
    this.playerConnections = new Map();
    this.reconnectionData = new Map();
    this.startHeartbeatMonitor();
  }

  /**
   * Initialize the multiplayer service with Socket.IO instance
   */
  public static initialize(io: Server): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService(io);
    }
    return MultiplayerService.instance;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      throw new Error('MultiplayerService not initialized. Call initialize() first.');
    }
    return MultiplayerService.instance;
  }

  /**
   * Setup Socket.IO event handlers for a client socket
   */
  public setupSocketHandlers(socket: Socket): void {
    multiplayerLogger.info({ socketId: socket.id }, 'Client connected');

    // Join room event
    socket.on('join_room', (payload: JoinRoomPayload, callback) => {
      this.handleJoinRoom(socket, payload, callback);
    });

    // Leave room event
    socket.on('leave_room', (payload: LeaveRoomPayload, callback) => {
      this.handleLeaveRoom(socket, payload, callback);
    });

    // Ready status event
    socket.on('ready_status', (payload: ReadyStatusPayload, callback) => {
      this.handleReadyStatus(socket, payload, callback);
    });

    // Chat message event
    socket.on('chat_message', (payload: ChatMessagePayload, callback) => {
      this.handleChatMessage(socket, payload, callback);
    });

    // Player action event
    socket.on('player_action', (payload: PlayerActionPayload, callback) => {
      this.handlePlayerAction(socket, payload, callback);
    });

    // Request sync event
    socket.on('request_sync', (payload: RequestSyncPayload, callback) => {
      this.handleRequestSync(socket, payload, callback);
    });

    // Heartbeat event
    socket.on('heartbeat', (payload: HeartbeatPayload, callback) => {
      this.handleHeartbeat(socket, payload, callback);
    });

    // Battle turn event
    socket.on('battle_turn', (payload: BattleAction, callback) => {
      this.handleBattleTurn(socket, payload, callback);
    });

    // Scenario choice event
    socket.on('scenario_choice', (payload: { playerId: string; scenarioId: string; choiceId: string }, callback) => {
      this.handleScenarioChoice(socket, payload, callback);
    });

    // Share clue event
    socket.on('share_clue', (payload: { playerId: string; targetPlayerId: string; clueId: string }, callback) => {
      this.handleShareClue(socket, payload, callback);
    });

    // Disconnect event
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Handle player joining a room
   */
  private handleJoinRoom(
    socket: Socket,
    payload: JoinRoomPayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId, playerName, rejoin } = payload;

      // Check if trying to rejoin
      if (rejoin && this.reconnectionData.has(playerId)) {
        this.handleReconnect(socket, playerId);
        callback({ success: true, timestamp: Date.now(), data: { reconnected: true } });
        return;
      }

      // Get or create room
      let room = this.rooms.get(roomId);
      if (!room) {
        room = this.createRoom(roomId, playerId);
      }

      // Check room capacity
      if (room.players.size >= room.settings.maxPlayers) {
        callback({
          success: false,
          error: 'Room is full',
          timestamp: Date.now()
        });
        return;
      }

      // Create player connection
      const playerConnection: PlayerConnection = {
        playerId,
        socketId: socket.id,
        lastSeen: Date.now(),
        isConnected: true,
        playerName,
        roomId
      };

      // Add player to room
      room.players.set(playerId, playerConnection);
      room.lastActivity = Date.now();

      // Store player connection
      this.playerConnections.set(playerId, playerConnection);

      // Join Socket.IO room
      socket.join(roomId);

      multiplayerLogger.info({ roomId, playerId, playerName }, 'Player joined room');

      // Broadcast to other players
      const globalEvent: GlobalEvent = {
        id: `event_${Date.now()}_${playerId}`,
        type: 'player_joined',
        message: `${playerName} joined the game`,
        timestamp: Date.now()
      };
      room.sharedState.globalEvents.push(globalEvent);

      socket.to(roomId).emit('player_joined', {
        playerId,
        playerName,
        timestamp: Date.now()
      });

      // Send success response with room state
      callback({
        success: true,
        timestamp: Date.now(),
        data: {
          room: this.sanitizeRoomState(room, playerId),
          players: Array.from(room.players.values()).map(p => ({
            playerId: p.playerId,
            playerName: p.playerName,
            isConnected: p.isConnected
          }))
        }
      });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error joining room');
      callback({
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle player leaving a room
   */
  private handleLeaveRoom(
    socket: Socket,
    payload: LeaveRoomPayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId, reason } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback({
          success: false,
          error: 'Room not found',
          timestamp: Date.now()
        });
        return;
      }

      // Remove player from room
      room.players.delete(playerId);
      this.playerConnections.delete(playerId);

      // Leave Socket.IO room
      socket.leave(roomId);

      multiplayerLogger.info({ roomId, playerId, reason: reason || 'manual' }, 'Player left room');

      // Broadcast to other players
      const globalEvent: GlobalEvent = {
        id: `event_${Date.now()}_${playerId}`,
        type: 'player_left',
        message: `Player left the game`,
        timestamp: Date.now()
      };
      room.sharedState.globalEvents.push(globalEvent);

      socket.to(roomId).emit('player_left', {
        playerId,
        reason,
        timestamp: Date.now()
      });

      // If room is empty, clean it up
      if (room.players.size === 0) {
        this.rooms.delete(roomId);
        multiplayerLogger.info({ roomId }, 'Room disbanded (empty)');
      } else if (room.hostPlayerId === playerId) {
        // Transfer host to first remaining player
        const newHostId = room.players.keys().next().value as string;
        room.hostPlayerId = newHostId;
        this.io.to(roomId).emit('host_changed', {
          newHostId,
          timestamp: Date.now()
        });
      }

      callback({
        success: true,
        timestamp: Date.now()
      });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error leaving room');
      callback({
        success: false,
        error: error.message,
        timestamp: Date.now()
      });
    }
  }

  /**
   * Handle ready status change
   */
  private handleReadyStatus(
    _socket: Socket,
    payload: ReadyStatusPayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId, isReady } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback({ success: false, error: 'Room not found', timestamp: Date.now() });
        return;
      }

      // Broadcast ready status
      _socket.to(roomId).emit('player_ready_changed', {
        playerId,
        isReady,
        timestamp: Date.now()
      });

      multiplayerLogger.info({ roomId, playerId, isReady }, 'Player ready status changed');

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error updating ready status');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle chat message
   */
  private handleChatMessage(
    _socket: Socket,
    payload: ChatMessagePayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId, message } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback({ success: false, error: 'Room not found', timestamp: Date.now() });
        return;
      }

      const playerConnection = room.players.get(playerId);
      if (!playerConnection) {
        callback({ success: false, error: 'Player not in room', timestamp: Date.now() });
        return;
      }

      const chatMessage: ChatMessage = {
        id: `chat_${Date.now()}_${playerId}`,
        playerId,
        playerName: playerConnection.playerName,
        message,
        timestamp: Date.now(),
        type: 'chat'
      };

      // Add to room's chat history
      room.sharedState.chatHistory.push(chatMessage);

      // Keep only last 100 messages
      if (room.sharedState.chatHistory.length > 100) {
        room.sharedState.chatHistory = room.sharedState.chatHistory.slice(-100);
      }

      // Broadcast to all players in room
      this.io.to(roomId).emit('chat_message', chatMessage);

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error sending chat message');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle player action
   */
  private handlePlayerAction(
    socket: Socket,
    payload: PlayerActionPayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId, actionType, actionData: _actionData } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback({ success: false, error: 'Room not found', timestamp: Date.now() });
        return;
      }

      // Broadcast action to other players (not revealing details)
      socket.to(roomId).emit('player_action_taken', {
        playerId,
        actionType,
        timestamp: Date.now()
      });

      multiplayerLogger.info({ roomId, playerId, actionType }, 'Player action');

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling player action');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle sync request
   */
  private handleRequestSync(
    _socket: Socket,
    payload: RequestSyncPayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId, syncType } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback({ success: false, error: 'Room not found', timestamp: Date.now() });
        return;
      }

      let syncData: any = {};

      switch (syncType) {
        case 'full':
          syncData = this.sanitizeRoomState(room, playerId);
          break;
        case 'battle':
          syncData = room.sharedState.battleState || null;
          break;
        case 'scenario':
          syncData = room.sharedState.scenarioState || null;
          break;
        case 'exploration':
          syncData = room.sharedState.explorationState || null;
          break;
      }

      callback({
        success: true,
        timestamp: Date.now(),
        data: syncData
      });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling sync request');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(
    _socket: Socket,
    payload: HeartbeatPayload,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { roomId, playerId } = payload;
      const room = this.rooms.get(roomId);

      if (room) {
        const player = room.players.get(playerId);
        if (player) {
          player.lastSeen = Date.now();
        }
      }

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling heartbeat');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle battle turn
   */
  private handleBattleTurn(
    _socket: Socket,
    payload: BattleAction,
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { playerId } = payload;
      const playerConnection = this.playerConnections.get(playerId);

      if (!playerConnection || !playerConnection.roomId) {
        callback({ success: false, error: 'Player not in a room', timestamp: Date.now() });
        return;
      }

      const roomId = playerConnection.roomId;
      const room = this.rooms.get(roomId);

      if (!room || !room.sharedState.battleState) {
        callback({ success: false, error: 'No active battle', timestamp: Date.now() });
        return;
      }

      // Update battle state
      room.sharedState.battleState.lastAction = payload;

      // Broadcast to all players
      this.io.to(roomId).emit('battle_action', payload);

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling battle turn');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle scenario choice
   */
  private handleScenarioChoice(
    socket: Socket,
    payload: { playerId: string; scenarioId: string; choiceId: string },
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { playerId, scenarioId } = payload;
      const playerConnection = this.playerConnections.get(playerId);

      if (!playerConnection || !playerConnection.roomId) {
        callback({ success: false, error: 'Player not in a room', timestamp: Date.now() });
        return;
      }

      const roomId = playerConnection.roomId;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback({ success: false, error: 'Room not found', timestamp: Date.now() });
        return;
      }

      // Notify other players that this player made a choice (not revealing what)
      socket.to(roomId).emit('scenario_choice_made', {
        playerId,
        scenarioId,
        timestamp: Date.now()
      });

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling scenario choice');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle sharing a clue
   */
  private handleShareClue(
    _socket: Socket,
    payload: { playerId: string; targetPlayerId: string; clueId: string },
    callback: (response: SocketResponse) => void
  ): void {
    try {
      const { playerId, targetPlayerId, clueId } = payload;
      const playerConnection = this.playerConnections.get(playerId);
      const targetConnection = this.playerConnections.get(targetPlayerId);

      if (!playerConnection || !targetConnection) {
        callback({ success: false, error: 'Player not found', timestamp: Date.now() });
        return;
      }

      // Send clue to target player
      this.io.to(targetConnection.socketId).emit('clue_received', {
        fromPlayerId: playerId,
        clueId,
        timestamp: Date.now()
      });

      callback({ success: true, timestamp: Date.now() });
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error sharing clue');
      callback({ success: false, error: error.message, timestamp: Date.now() });
    }
  }

  /**
   * Handle disconnect
   */
  private handleDisconnect(socket: Socket): void {
    multiplayerLogger.info({ socketId: socket.id }, 'Client disconnected');

    // Find player by socket ID
    for (const [playerId, connection] of this.playerConnections.entries()) {
      if (connection.socketId === socket.id) {
        connection.isConnected = false;

        // Save reconnection data
        const room = this.rooms.get(connection.roomId!);
        if (room) {
          const reconnectionData: ReconnectionData = {
            playerId,
            roomId: connection.roomId!,
            lastSocketId: socket.id,
            disconnectTime: Date.now(),
            gamePhase: room.gamePhase,
            playerState: {} // TODO: Save player-specific state
          };
          this.reconnectionData.set(playerId, reconnectionData);

          // Notify other players
          socket.to(connection.roomId!).emit('player_disconnected', {
            playerId,
            timestamp: Date.now()
          });
        }

        multiplayerLogger.info({ playerId }, 'Player disconnected, reconnection data saved');
        break;
      }
    }
  }

  /**
   * Handle reconnection
   */
  private handleReconnect(socket: Socket, playerId: string): void {
    const reconnectionData = this.reconnectionData.get(playerId);
    if (!reconnectionData) {
      return;
    }

    const room = this.rooms.get(reconnectionData.roomId);
    if (!room) {
      this.reconnectionData.delete(playerId);
      return;
    }

    // Update player connection
    const playerConnection = room.players.get(playerId);
    if (playerConnection) {
      playerConnection.socketId = socket.id;
      playerConnection.isConnected = true;
      playerConnection.lastSeen = Date.now();
      this.playerConnections.set(playerId, playerConnection);
    }

    // Rejoin Socket.IO room
    socket.join(reconnectionData.roomId);

    // Notify other players
    socket.to(reconnectionData.roomId).emit('player_reconnected', {
      playerId,
      timestamp: Date.now()
    });

    // Clear reconnection data
    this.reconnectionData.delete(playerId);

    multiplayerLogger.info({ playerId, roomId: reconnectionData.roomId }, 'Player reconnected');
  }

  /**
   * Create a new room
   */
  private createRoom(roomId: string, hostPlayerId: string): RoomState {
    const room: RoomState = {
      roomId,
      hostPlayerId,
      players: new Map(),
      currentTurn: {
        currentPlayerIndex: 0,
        playerOrder: [],
        turnNumber: 1,
        phaseStartTime: Date.now()
      },
      gamePhase: GamePhase.LOBBY,
      sharedState: {
        chatHistory: [],
        globalEvents: []
      },
      createdAt: Date.now(),
      lastActivity: Date.now(),
      settings: {
        maxPlayers: 4,
        turnTimeLimit: 60,
        allowSpectators: false,
        autoCleanupAfter: 120 // 2 hours
      }
    };

    this.rooms.set(roomId, room);
    multiplayerLogger.info({ roomId, hostPlayerId }, 'Room created');

    return room;
  }

  /**
   * Sanitize room state for a specific player (hide private info)
   */
  private sanitizeRoomState(room: RoomState, _playerId: string): any {
    return {
      roomId: room.roomId,
      hostPlayerId: room.hostPlayerId,
      currentTurn: room.currentTurn,
      gamePhase: room.gamePhase,
      chatHistory: room.sharedState.chatHistory.slice(-50), // Last 50 messages
      globalEvents: room.sharedState.globalEvents.slice(-20), // Last 20 events
      settings: room.settings
    };
  }

  /**
   * Start heartbeat monitor to detect inactive players
   */
  private startHeartbeatMonitor(): void {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 60000; // 60 seconds

      this.rooms.forEach((room, roomId) => {
        room.players.forEach((player, playerId) => {
          if (now - player.lastSeen > timeout && player.isConnected) {
            multiplayerLogger.warn({ playerId, roomId }, 'Player timed out');
            player.isConnected = false;

            // Notify other players
            this.io.to(roomId).emit('player_disconnected', {
              playerId,
              reason: 'timeout',
              timestamp: now
            });
          }
        });
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Broadcast game phase change
   */
  public changeGamePhase(roomId: string, newPhase: GamePhase): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    room.gamePhase = newPhase;
    room.currentTurn.phaseStartTime = Date.now();

    const globalEvent: GlobalEvent = {
      id: `event_${Date.now()}_phase`,
      type: 'phase_change',
      message: `Game phase changed to ${newPhase}`,
      timestamp: Date.now()
    };
    room.sharedState.globalEvents.push(globalEvent);

    this.io.to(roomId).emit('phase_changed', {
      newPhase,
      timestamp: Date.now()
    });

    multiplayerLogger.info({ roomId, newPhase }, 'Room phase changed');
  }

  /**
   * Get room by ID
   */
  public getRoom(roomId: string): RoomState | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Cleanup on shutdown
   */
  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    multiplayerLogger.info('Service shut down');
  }
}
