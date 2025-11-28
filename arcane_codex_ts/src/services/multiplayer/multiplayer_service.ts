/**
 * Multiplayer Service
 * Manages real-time multiplayer game sessions using Socket.IO
 */

import { Server, Socket } from 'socket.io';
import { PartyManager } from './party_manager';
import { multiplayerLogger, securityLogger } from '../logger';
import { PhaseManager } from '../phase.manager';
import { TurnManager } from '../turn.manager';
import { SessionManager, ManagedSession } from '../session.manager';
import { GameSessionService } from '../game/GameSessionService';
import { ScenarioManager } from '../game/ScenarioManager';
import { BattleService } from '../battle';
import { AIGMService } from '../ai_gm_core';
import { ScenarioRequest, ScenarioContext, PlayerHistory, ScenarioType } from '../../types/ai_gm';
import { CharacterClass, God } from '../../types/game';
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
  ReconnectionData,
  SocketErrorCode
} from '../../types/multiplayer';
import {
  validateSocketData,
  joinRoomSchema,
  leaveRoomSchema,
  readyStatusSchema,
  chatMessageSchema,
  requestSyncSchema,
  heartbeatSchema,
  battleActionSchema,
  scenarioChoiceSchema,
  shareClueSchema
} from '../../validation/socketSchemas';
import { AuthenticatedSocket } from '../../middleware/socketAuth';

// ============================================
// Rate Limiting Configuration
// ============================================
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  chat_message: { maxRequests: 10, windowMs: 10000 }, // 10 messages per 10 seconds
  player_action: { maxRequests: 20, windowMs: 10000 }, // 20 actions per 10 seconds
  battle_turn: { maxRequests: 5, windowMs: 5000 }, // 5 turns per 5 seconds
  default: { maxRequests: 30, windowMs: 10000 } // 30 requests per 10 seconds
};

// Rate limit tracking per player
const rateLimitTracking = new Map<string, Map<string, { count: number; resetTime: number }>>();

/**
 * Singleton service for managing multiplayer sessions
 */
export class MultiplayerService {
  private static instance: MultiplayerService;
  private io: Server;
  private partyManager: PartyManager;
  private phaseManager: PhaseManager;
  private turnManager: TurnManager;
  private sessionManager: SessionManager;
  private gameSessionService: GameSessionService;
  private scenarioManager: ScenarioManager;
  private rooms: Map<string, RoomState>;
  private playerConnections: Map<string, PlayerConnection>;
  private reconnectionData: Map<string, ReconnectionData>;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private roomToSession: Map<string, string> = new Map(); // roomId -> sessionId

  private constructor(io: Server) {
    this.io = io;
    this.partyManager = PartyManager.getInstance();
    this.phaseManager = PhaseManager.getInstance();
    this.turnManager = TurnManager.getInstance();
    this.sessionManager = SessionManager.getInstance();
    this.gameSessionService = GameSessionService.getInstance();
    this.scenarioManager = ScenarioManager.getInstance();
    this.rooms = new Map();
    this.playerConnections = new Map();
    this.reconnectionData = new Map();
    this.startHeartbeatMonitor();
    this.initializeScenarios();
  }

  /**
   * Initialize scenarios from data files
   */
  private async initializeScenarios(): Promise<void> {
    try {
      const count = await this.scenarioManager.loadScenariosFromFiles();
      multiplayerLogger.info({ count }, 'Scenarios initialized');
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Failed to initialize scenarios');
    }
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

  // ============================================
  // Helper Methods
  // ============================================

  /**
   * Create standardized error response
   */
  private createErrorResponse(code: SocketErrorCode, message: string): SocketResponse {
    return {
      success: false,
      error: message,
      errorCode: code,
      timestamp: Date.now()
    };
  }

  /**
   * Create standardized success response
   */
  private createSuccessResponse(data?: any): SocketResponse {
    return {
      success: true,
      timestamp: Date.now(),
      data
    };
  }

  /**
   * Check rate limit for a player/event combination
   */
  private checkRateLimit(playerId: string, eventType: string): boolean {
    const config = RATE_LIMITS[eventType] || RATE_LIMITS.default;
    const now = Date.now();

    if (!rateLimitTracking.has(playerId)) {
      rateLimitTracking.set(playerId, new Map());
    }

    const playerLimits = rateLimitTracking.get(playerId)!;
    const eventLimit = playerLimits.get(eventType);

    if (!eventLimit || now > eventLimit.resetTime) {
      playerLimits.set(eventType, { count: 1, resetTime: now + config.windowMs });
      return true;
    }

    if (eventLimit.count >= config.maxRequests) {
      securityLogger.warn({
        playerId,
        eventType,
        count: eventLimit.count,
        limit: config.maxRequests
      }, 'Rate limit exceeded');
      return false;
    }

    eventLimit.count++;
    return true;
  }

  /**
   * Validate and handle socket event with rate limiting
   */
  private handleValidatedEvent<T>(
    socket: Socket | AuthenticatedSocket,
    eventType: string,
    payload: unknown,
    schema: any,
    callback: ((response: SocketResponse) => void) | undefined,
    handler: (validatedPayload: T) => void
  ): void {
    // Get player ID from authenticated socket or payload
    const authSocket = socket as AuthenticatedSocket;
    const playerId = authSocket.playerId || (payload as any)?.playerId;

    // Check rate limit
    if (playerId && !this.checkRateLimit(playerId, eventType)) {
      if (callback) {
        callback(this.createErrorResponse(
          SocketErrorCode.RATE_LIMITED,
          'Too many requests. Please slow down.'
        ));
      }
      return;
    }

    // Validate payload
    const validation = validateSocketData(schema, payload);
    if (!validation.success) {
      multiplayerLogger.warn({
        socketId: socket.id,
        eventType,
        error: validation.error
      }, 'Socket validation failed');

      if (callback) {
        callback(this.createErrorResponse(
          SocketErrorCode.VALIDATION_ERROR,
          validation.error
        ));
      }
      return;
    }

    // Execute handler with validated data cast to expected type
    handler(validation.data as T);
  }

  /**
   * Setup Socket.IO event handlers for a client socket
   */
  public setupSocketHandlers(socket: Socket | AuthenticatedSocket): void {
    const authSocket = socket as AuthenticatedSocket;
    multiplayerLogger.info({
      socketId: socket.id,
      playerId: authSocket.playerId
    }, 'Setting up socket handlers');

    // Join room event - with validation
    socket.on('join_room', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'join_room',
        payload,
        joinRoomSchema,
        callback,
        (validPayload: JoinRoomPayload) => this.handleJoinRoom(socket, validPayload, callback!)
      );
    });

    // Leave room event - with validation
    socket.on('leave_room', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'leave_room',
        payload,
        leaveRoomSchema,
        callback,
        (validPayload: LeaveRoomPayload) => this.handleLeaveRoom(socket, validPayload, callback!)
      );
    });

    // Ready status event - with validation
    socket.on('ready_status', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'ready_status',
        payload,
        readyStatusSchema,
        callback,
        (validPayload: ReadyStatusPayload) => this.handleReadyStatus(socket, validPayload, callback!)
      );
    });

    // Chat message event - with validation and rate limiting
    socket.on('chat_message', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'chat_message',
        payload,
        chatMessageSchema,
        callback,
        (validPayload: ChatMessagePayload) => this.handleChatMessage(socket, validPayload, callback!)
      );
    });

    // Player action event - with validation
    socket.on('player_action', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      // Player action uses a flexible schema, so we validate manually
      const authSocket = socket as AuthenticatedSocket;
      const playerId = authSocket.playerId || (payload as any)?.playerId;

      if (playerId && !this.checkRateLimit(playerId, 'player_action')) {
        if (callback) {
          callback(this.createErrorResponse(SocketErrorCode.RATE_LIMITED, 'Too many actions'));
        }
        return;
      }

      this.handlePlayerAction(socket, payload as PlayerActionPayload, callback!);
    });

    // Request sync event - with validation
    socket.on('request_sync', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'request_sync',
        payload,
        requestSyncSchema,
        callback,
        (validPayload: RequestSyncPayload) => this.handleRequestSync(socket, validPayload, callback!)
      );
    });

    // Heartbeat event - with validation (no rate limiting on heartbeat)
    socket.on('heartbeat', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      const validation = validateSocketData(heartbeatSchema, payload);
      if (!validation.success) {
        if (callback) {
          callback(this.createErrorResponse(SocketErrorCode.VALIDATION_ERROR, validation.error));
        }
        return;
      }
      // Ensure timestamp is present for HeartbeatPayload
      const heartbeatData: HeartbeatPayload = {
        ...validation.data,
        timestamp: validation.data.timestamp ?? Date.now()
      };
      this.handleHeartbeat(socket, heartbeatData, callback!);
    });

    // Battle turn event - with validation and strict rate limiting
    socket.on('battle_turn', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'battle_turn',
        payload,
        battleActionSchema,
        callback,
        (validPayload: BattleAction) => this.handleBattleTurn(socket, validPayload, callback!)
      );
    });

    // Scenario choice event - with validation
    socket.on('scenario_choice', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'scenario_choice',
        payload,
        scenarioChoiceSchema,
        callback,
        (validPayload) => this.handleScenarioChoice(socket, validPayload as any, callback!)
      );
    });

    // Share clue event - with validation
    socket.on('share_clue', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleValidatedEvent(
        socket,
        'share_clue',
        payload,
        shareClueSchema,
        callback,
        (validPayload) => this.handleShareClue(socket, validPayload as any, callback!)
      );
    });

    // Start game event - host only
    socket.on('start_game', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleStartGame(socket, payload as any, callback!);
    });

    // Submit battle action event
    socket.on('submit_action', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleSubmitAction(socket, payload as any, callback!);
    });

    // Submit scenario response event
    socket.on('scenario_response', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleScenarioResponse(socket, payload as any, callback!);
    });

    // Request new AI scenario event (host only)
    socket.on('request_ai_scenario', (payload: unknown, callback?: (response: SocketResponse) => void) => {
      this.handleRequestAIScenario(socket, payload as any, callback!);
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

      // Check if trying to rejoin with reconnection data
      if (rejoin && this.reconnectionData.has(playerId)) {
        this.handleReconnect(socket, playerId);
        callback(this.createSuccessResponse({ reconnected: true }));
        return;
      }

      // Validate that the party exists before allowing join
      const party = this.partyManager.getParty(roomId);
      if (!party) {
        callback({
          success: false,
          error: 'Party not found',
          timestamp: Date.now()
        });
        return;
      }

      // Get or create room for existing party
      let room = this.rooms.get(roomId);
      if (!room) {
        room = this.createRoom(roomId, playerId);
      }

      // Check if player was already in the room (reconnection without stored data)
      const existingPlayer = room.players.get(playerId);
      if (rejoin && existingPlayer) {
        // Update existing player's socket
        existingPlayer.socketId = socket.id;
        existingPlayer.isConnected = true;
        existingPlayer.lastSeen = Date.now();
        this.playerConnections.set(playerId, existingPlayer);
        socket.join(roomId);

        callback({
          success: true,
          timestamp: Date.now(),
          data: {
            reconnected: true,
            room: this.sanitizeRoomState(room, playerId),
            players: Array.from(room.players.values()).map(p => ({
              playerId: p.playerId,
              playerName: p.playerName,
              isConnected: p.isConnected
            }))
          }
        });
        return;
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

      // Sync player with party system (if not already in party)
      if (party && !party.players.has(playerId)) {
        this.partyManager.joinParty(roomId, playerId, playerName);
      }

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
          reconnected: rejoin || undefined, // Set to true if rejoining, undefined otherwise
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

      // Sync with party system - remove player from party
      const party = this.partyManager.getParty(roomId);
      if (party && party.players.has(playerId)) {
        this.partyManager.leaveParty(roomId, playerId);
      }

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
  private async handleScenarioChoice(
    socket: Socket,
    payload: { playerId: string; scenarioId: string; choiceId: string },
    callback: (response: SocketResponse) => void
  ): Promise<void> {
    try {
      const { playerId, scenarioId, choiceId } = payload;
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

      // Register the choice with AIGMService
      const aigmService = AIGMService.getInstance();
      const choiceRegistered = aigmService.registerChoice(scenarioId, playerId, choiceId);

      if (!choiceRegistered) {
        callback({ success: false, error: 'Invalid choice or already chosen', timestamp: Date.now() });
        return;
      }

      // Apply consequences for this choice
      multiplayerLogger.info({ playerId, scenarioId, choiceId, roomId },
        'Applying consequences for scenario choice');

      const consequenceResult = await aigmService.applyChoiceConsequences(
        scenarioId,
        choiceId,
        playerId,
        roomId
      );

      // Notify other players that this player made a choice (not revealing what)
      socket.to(roomId).emit('scenario_choice_made', {
        playerId,
        scenarioId,
        timestamp: Date.now()
      });

      // If consequences were applied, broadcast effects
      if (consequenceResult.appliedConsequences.length > 0) {
        // Broadcast world effects to all players
        this.io.to(roomId).emit('consequences_resolved', {
          scenarioId,
          playerId,
          worldEffects: consequenceResult.worldEffects.map(e => ({
            type: e.effectType,
            description: e.description
          })),
          timestamp: Date.now()
        });

        // Send player-specific effects privately
        for (const [affectedPlayerId, effects] of consequenceResult.playerEffects.entries()) {
          const affectedConnection = this.playerConnections.get(affectedPlayerId);
          if (affectedConnection) {
            this.io.to(affectedConnection.socketId).emit('player_effect_applied', {
              scenarioId,
              effects: effects.map(e => ({
                type: e.effectType,
                stat: e.stat,
                oldValue: e.oldValue,
                newValue: e.newValue,
                description: e.description
              })),
              timestamp: Date.now()
            });
          }
        }
      }

      // Log any errors but still return success if choice was registered
      if (consequenceResult.errors.length > 0) {
        multiplayerLogger.warn({ errors: consequenceResult.errors },
          'Some consequences failed to apply');
      }

      callback({
        success: true,
        timestamp: Date.now(),
        data: {
          choiceId,
          consequencesApplied: consequenceResult.appliedConsequences.length
        }
      });
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
   * Handle request for new AI scenario (host only, mid-game)
   */
  private async handleRequestAIScenario(
    _socket: Socket,
    payload: { roomId: string; playerId: string; scenarioType?: string; theme?: string },
    callback: (response: SocketResponse) => void
  ): Promise<void> {
    try {
      const { roomId, playerId, scenarioType, theme } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback(this.createErrorResponse(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
        return;
      }

      // Only host can request new scenarios
      if (room.hostPlayerId !== playerId) {
        callback(this.createErrorResponse(SocketErrorCode.UNAUTHORIZED, 'Only host can request new scenarios'));
        return;
      }

      // Notify players that AI is generating
      this.io.to(roomId).emit('scenario_generation_started', {
        message: 'The AI Game Master is crafting a new scenario...',
        requestedBy: playerId,
        timestamp: Date.now()
      });

      // Build player data from room
      const playerData = Array.from(room.players.values()).map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        characterClass: 'WARRIOR'
      }));

      // Generate AI scenario
      const aigmService = AIGMService.getInstance();
      const scenarioRequest = this.buildScenarioRequest(room, playerData);

      // Override type and theme if specified
      if (scenarioType) {
        const typeMap: Record<string, ScenarioType> = {
          'investigation': ScenarioType.INVESTIGATION,
          'moral_dilemma': ScenarioType.MORAL_DILEMMA,
          'combat': ScenarioType.COMBAT_CHOICE,
          'negotiation': ScenarioType.NEGOTIATION,
          'discovery': ScenarioType.DISCOVERY,
          'betrayal': ScenarioType.BETRAYAL
        };
        scenarioRequest.desiredType = typeMap[scenarioType.toLowerCase()] || ScenarioType.INVESTIGATION;
      }
      if (theme) {
        scenarioRequest.theme = theme;
      }

      multiplayerLogger.info({ roomId, scenarioType, theme }, 'Requesting new AI scenario');
      const aiScenario = await aigmService.generateScenario(scenarioRequest);

      const scenario = {
        id: aiScenario.id,
        title: aiScenario.title,
        narrative: aiScenario.narrative,
        choices: aiScenario.choices,
        type: aiScenario.type,
        ai_generated: true
      };

      // Update room state
      const sessionId = this.roomToSession.get(roomId);
      if (sessionId) {
        await this.gameSessionService.startScenario(sessionId, scenario.id, scenario);
      }

      room.sharedState.scenarioState = {
        scenarioId: scenario.id,
        scenarioPhase: 0,
        playersReady: [],
        choicesMade: new Map(),
        sharedClues: [],
        consequencesRevealed: false
      };
      room.gamePhase = GamePhase.SCENARIO;

      // Broadcast new scenario to all players
      this.io.to(roomId).emit('new_scenario', {
        scenario: {
          id: scenario.id,
          title: scenario.title,
          narrative: scenario.narrative,
          choices: scenario.choices.map((c: any) => ({
            id: c.id,
            text: c.text,
            description: c.description
          })),
          ai_generated: true
        },
        timestamp: Date.now()
      });

      multiplayerLogger.info({ roomId, scenarioId: scenario.id }, 'New AI scenario generated and broadcast');
      callback(this.createSuccessResponse({ scenarioId: scenario.id, ai_generated: true }));
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error generating AI scenario');

      // Notify players of failure
      const room = this.rooms.get(payload.roomId);
      if (room) {
        this.io.to(payload.roomId).emit('scenario_generation_failed', {
          error: 'Failed to generate AI scenario',
          timestamp: Date.now()
        });
      }

      callback(this.createErrorResponse(SocketErrorCode.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Handle start game event
   */
  private async handleStartGame(
    _socket: Socket,
    payload: { roomId: string; playerId: string },
    callback: (response: SocketResponse) => void
  ): Promise<void> {
    try {
      const { roomId, playerId } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback(this.createErrorResponse(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
        return;
      }

      if (room.hostPlayerId !== playerId) {
        callback(this.createErrorResponse(SocketErrorCode.UNAUTHORIZED, 'Only host can start game'));
        return;
      }

      // Create game session
      const playerData = Array.from(room.players.values()).map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        characterClass: 'WARRIOR' // Default, can be customized
      }));

      const gameSession = await this.gameSessionService.startGameSession(roomId, playerData);

      // Notify players that AI is generating scenario
      this.io.to(roomId).emit('scenario_generation_started', {
        message: 'The AI Game Master is crafting your adventure...',
        timestamp: Date.now()
      });

      // Generate AI scenario
      let scenario: any = null;
      try {
        const aigmService = AIGMService.getInstance();
        const scenarioRequest = this.buildScenarioRequest(room, playerData);

        multiplayerLogger.info({ roomId }, 'Requesting AI scenario generation for game start');
        const aiScenario = await aigmService.generateScenario(scenarioRequest);

        scenario = {
          id: aiScenario.id,
          title: aiScenario.title,
          narrative: aiScenario.narrative,
          choices: aiScenario.choices,
          type: aiScenario.type,
          ai_generated: true
        };

        multiplayerLogger.info({ roomId, scenarioId: aiScenario.id }, 'AI scenario generated for game');
      } catch (aiError) {
        // Fallback to template-based scenario if AI fails
        multiplayerLogger.warn({ roomId, error: aiError }, 'AI scenario generation failed, using fallback');
        const fallbackScenario = this.scenarioManager.getRandomScenario(undefined, 1, room.players.size);
        if (fallbackScenario) {
          scenario = {
            id: fallbackScenario.id,
            title: fallbackScenario.title,
            narrative: fallbackScenario.narrative,
            choices: fallbackScenario.choices,
            ai_generated: false
          };
        }
      }

      if (scenario) {
        await this.gameSessionService.startScenario(gameSession.sessionId, scenario.id, scenario);
        room.sharedState.scenarioState = {
          scenarioId: scenario.id,
          scenarioPhase: 0,
          playersReady: [],
          choicesMade: new Map(),
          sharedClues: [],
          consequencesRevealed: false
        };
      }

      room.gamePhase = GamePhase.SCENARIO;

      // Broadcast game started to all players
      this.io.to(roomId).emit('game_started', {
        sessionId: gameSession.sessionId,
        phase: room.gamePhase,
        scenario: scenario ? {
          id: scenario.id,
          title: scenario.title,
          narrative: scenario.narrative,
          choices: scenario.choices.map((c: any) => ({
            id: c.id,
            text: c.text,
            description: c.description
          })),
          ai_generated: scenario.ai_generated
        } : null,
        timestamp: Date.now()
      });

      multiplayerLogger.info({ roomId, sessionId: gameSession.sessionId, aiGenerated: scenario?.ai_generated }, 'Game started');
      callback(this.createSuccessResponse({ sessionId: gameSession.sessionId, aiGenerated: scenario?.ai_generated }));
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error starting game');
      callback(this.createErrorResponse(SocketErrorCode.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Handle submit battle action
   */
  private async handleSubmitAction(
    _socket: Socket,
    payload: { roomId: string; playerId: string; actionType: string; actionData?: any },
    callback: (response: SocketResponse) => void
  ): Promise<void> {
    try {
      const { roomId, playerId, actionType, actionData } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback(this.createErrorResponse(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
        return;
      }

      const gameSession = this.gameSessionService.getSessionByPartyCode(roomId);
      if (!gameSession || !gameSession.battleState) {
        callback(this.createErrorResponse(SocketErrorCode.NO_ACTIVE_BATTLE, 'No active battle'));
        return;
      }

      // Process battle action
      let result: any;
      const battleId = gameSession.battleState.battleId;

      switch (actionType) {
        case 'attack':
          result = BattleService.executeAttack(battleId);
          break;
        case 'defend':
          result = BattleService.executeDefend(battleId);
          break;
        case 'ability':
          if (actionData?.abilityId) {
            result = BattleService.useAbility(battleId, actionData.abilityId);
          }
          break;
        case 'flee':
          result = BattleService.attemptFlee(battleId);
          break;
        default:
          callback(this.createErrorResponse(SocketErrorCode.VALIDATION_ERROR, 'Invalid action type'));
          return;
      }

      if (!result) {
        callback(this.createErrorResponse(SocketErrorCode.INTERNAL_ERROR, 'Action failed'));
        return;
      }

      // Update battle state in session
      const updatedBattle = BattleService.getBattle(battleId);
      if (updatedBattle) {
        gameSession.battleState = updatedBattle;
        await this.gameSessionService.saveSessionState(gameSession.sessionId);

        // Update player stats if battle ended
        if (updatedBattle.ended) {
          await this.gameSessionService.updatePlayerAfterBattle(
            gameSession.sessionId,
            playerId,
            updatedBattle
          );
        }
      }

      // Broadcast battle update to all players
      this.io.to(roomId).emit('battle_update', {
        battleId,
        playerHp: updatedBattle?.player.currentHp,
        enemyHp: updatedBattle?.enemy.currentHp,
        isVictory: updatedBattle?.isVictory,
        isDefeat: !updatedBattle?.isVictory && updatedBattle?.ended,
        combatLog: result.combatLog || [],
        timestamp: Date.now()
      });

      // If battle ended, transition phase
      if (updatedBattle?.ended) {
        room.gamePhase = updatedBattle.isVictory ? GamePhase.SCENARIO : GamePhase.LOBBY;

        this.io.to(roomId).emit('game_ended', {
          outcome: updatedBattle.isVictory ? 'victory' : 'defeat',
          rewards: updatedBattle.isVictory ? BattleService.getBattleRewards(battleId) : null,
          timestamp: Date.now()
        });
      }

      callback(this.createSuccessResponse({ result }));
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling battle action');
      callback(this.createErrorResponse(SocketErrorCode.INTERNAL_ERROR, error.message));
    }
  }

  /**
   * Handle scenario response
   */
  private async handleScenarioResponse(
    _socket: Socket,
    payload: { roomId: string; playerId: string; choiceId: string },
    callback: (response: SocketResponse) => void
  ): Promise<void> {
    try {
      const { roomId, playerId, choiceId } = payload;
      const room = this.rooms.get(roomId);

      if (!room) {
        callback(this.createErrorResponse(SocketErrorCode.ROOM_NOT_FOUND, 'Room not found'));
        return;
      }

      const gameSession = this.gameSessionService.getSessionByPartyCode(roomId);
      if (!gameSession || !gameSession.scenarioState) {
        callback(this.createErrorResponse(SocketErrorCode.INTERNAL_ERROR, 'No active scenario'));
        return;
      }

      const player = room.players.get(playerId);
      if (!player) {
        callback(this.createErrorResponse(SocketErrorCode.PLAYER_NOT_FOUND, 'Player not found'));
        return;
      }

      // Record choice
      await this.gameSessionService.recordScenarioChoice(
        gameSession.sessionId,
        playerId,
        choiceId
      );

      // Update room state
      if (room.sharedState.scenarioState) {
        room.sharedState.scenarioState.choicesMade.set(playerId, true);
      }

      // Broadcast that a choice was made (not revealing which)
      this.io.to(roomId).emit('scenario_presented', {
        playerId,
        choiceMade: true,
        timestamp: Date.now()
      });

      // Check if all players have made choices
      const allChosen = Array.from(room.players.keys()).every(pid =>
        gameSession.scenarioState?.playerChoices.has(pid)
      );

      if (allChosen) {
        // Resolve scenario
        const scenarioSession = this.scenarioManager.getScenarioSession(gameSession.sessionId);
        if (scenarioSession) {
          const outcome = await this.scenarioManager.resolveScenario(gameSession.sessionId);

          // Broadcast outcome
          this.io.to(roomId).emit('scenario_resolved', {
            outcome: outcome.success ? 'success' : 'failure',
            narrative: outcome.narrative,
            rewards: outcome.rewards,
            consequences: outcome.consequences,
            timestamp: Date.now()
          });

          // Complete scenario in game session
          await this.gameSessionService.completeScenario(gameSession.sessionId);

          // Transition to next phase (could be battle, another scenario, or victory)
          room.gamePhase = GamePhase.BATTLE;
        }
      }

      callback(this.createSuccessResponse());
    } catch (error: any) {
      multiplayerLogger.error({ error }, 'Error handling scenario response');
      callback(this.createErrorResponse(SocketErrorCode.INTERNAL_ERROR, error.message));
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
            playerState: { turnIndex: room.currentTurn.playerOrder.indexOf(playerId), isCurrentTurn: room.currentTurn.playerOrder[room.currentTurn.currentPlayerIndex] === playerId }
          };
          this.reconnectionData.set(playerId, reconnectionData);

          // Notify other players using io.to() instead of socket.to() since socket is disconnecting
          this.io.to(connection.roomId!).emit('player_disconnected', {
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
   * Handle reconnection with full state sync
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

    // Send full state sync to reconnecting player with acknowledgment
    const fullState = this.sanitizeRoomState(room, playerId);
    this.emitWithAck(
      socket,
      'state_sync',
      {
        type: 'full',
        data: fullState,
        timestamp: Date.now(),
        missedEvents: this.getMissedEvents(room, reconnectionData.disconnectTime)
      },
      5000
    ).then((acked) => {
      if (acked) {
        multiplayerLogger.info({ playerId }, 'State sync acknowledged by reconnecting player');
      } else {
        multiplayerLogger.warn({ playerId }, 'State sync not acknowledged - client may be out of sync');
      }
    });

    // Notify other players
    socket.to(reconnectionData.roomId).emit('player_reconnected', {
      playerId,
      playerName: playerConnection?.playerName || 'Unknown',
      timestamp: Date.now()
    });

    // Clear reconnection data
    this.reconnectionData.delete(playerId);

    multiplayerLogger.info({ playerId, roomId: reconnectionData.roomId }, 'Player reconnected');
  }

  /**
   * Get events that occurred while player was disconnected
   */
  private getMissedEvents(room: RoomState, disconnectTime: number): GlobalEvent[] {
    return room.sharedState.globalEvents.filter(event => event.timestamp > disconnectTime);
  }

  /**
   * Emit event with acknowledgment timeout
   * Returns a promise that resolves to true if acknowledged, false if timed out
   */
  private emitWithAck(
    socket: Socket,
    event: string,
    data: any,
    timeoutMs: number = 5000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, timeoutMs);

      socket.emit(event, data, (response: any) => {
        clearTimeout(timeout);
        resolve(response?.success !== false);
      });
    });
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
   * Find room ID by session ID
   */
  public findRoomBySessionId(sessionId: string): string | null {
    for (const [roomId, sId] of this.roomToSession.entries()) {
      if (sId === sessionId) {
        return roomId;
      }
    }
    return null;
  }

  /**
   * Get the PartyManager instance for external access
   */
  public getPartyManager(): PartyManager {
    return this.partyManager;
  }

  /**
   * Start game for a room - initializes session, phase, and turn management
   */
  public async startGame(roomId: string, hostPlayerId: string): Promise<{ success: boolean; error?: string; session?: ManagedSession }> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return { success: false, error: 'Room not found' };
    }

    if (room.hostPlayerId !== hostPlayerId) {
      return { success: false, error: 'Only host can start the game' };
    }

    try {
      // Get host player info from room
      const hostConnection = room.players.get(hostPlayerId);
      const hostPlayerName = hostConnection?.playerName || 'Host';

      // Create session in SessionManager
      const session = await this.sessionManager.createSession({
        partyCode: roomId,
        hostPlayerId,
        hostPlayerName,
        maxPlayers: room.settings?.maxPlayers || 4,
        settings: {}
      });
      if (!session) {
        return { success: false, error: 'Failed to create session' };
      }

      // Add other players to session
      for (const [playerId, connection] of room.players) {
        if (playerId !== hostPlayerId) {
          await this.sessionManager.addPlayer(session.id, playerId, connection.playerName);
        }
      }

      // Store session mapping
      this.roomToSession.set(roomId, session.id);

      // Initialize turn order
      await this.turnManager.initializeTurnOrder(session.id, { strategy: 'sequential' });

      // Transition from LOBBY to INTERROGATION
      const phaseResult = await this.phaseManager.transitionTo(
        session.id,
        GamePhase.INTERROGATION
      );

      if (!phaseResult.success) {
        return { success: false, error: phaseResult.error };
      }

      // Update room state
      room.gamePhase = GamePhase.INTERROGATION;
      room.currentTurn.phaseStartTime = Date.now();

      // Broadcast game started
      this.io.to(roomId).emit('game_started', {
        sessionId: session.id,
        phase: GamePhase.INTERROGATION,
        timestamp: Date.now()
      });

      multiplayerLogger.info({ roomId, sessionId: session.id }, 'Game started');

      return { success: true, session };
    } catch (error: any) {
      multiplayerLogger.error({ roomId, error }, 'Failed to start game');
      return { success: false, error: error.message };
    }
  }

  /**
   * Advance turn for a room
   */
  public async advanceTurn(roomId: string, playerId: string): Promise<{ success: boolean; error?: string }> {
    const sessionId = this.roomToSession.get(roomId);
    if (!sessionId) {
      return { success: false, error: 'No session for room' };
    }

    // Validate it's this player's turn
    const validation = await this.turnManager.validateTurnAction(sessionId, playerId);
    if (!validation.success || !validation.canAct) {
      return { success: false, error: validation.reason || 'Not your turn' };
    }

    // Advance the turn
    const result = await this.turnManager.advanceTurn(sessionId);

    if (result.success) {
      // Broadcast turn change
      this.io.to(roomId).emit('turn_changed', {
        currentPlayerId: result.currentPlayerId,
        turnNumber: result.turnNumber,
        isNewRound: result.isNewRound,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Transition phase for a room
   */
  public async transitionPhase(
    roomId: string,
    targetPhase: GamePhase,
    additionalData?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    const sessionId = this.roomToSession.get(roomId);
    if (!sessionId) {
      return { success: false, error: 'No session for room' };
    }

    const room = this.rooms.get(roomId);
    const result = await this.phaseManager.transitionTo(sessionId, targetPhase, additionalData);

    if (result.success && room) {
      // Update room phase
      room.gamePhase = targetPhase;
      room.currentTurn.phaseStartTime = Date.now();

      // Broadcast phase change
      const globalEvent: GlobalEvent = {
        id: `event_${Date.now()}_phase`,
        type: 'phase_change',
        message: `Game phase changed to ${targetPhase}`,
        timestamp: Date.now()
      };
      room.sharedState.globalEvents.push(globalEvent);

      this.io.to(roomId).emit('phase_changed', {
        newPhase: result.newPhase,
        previousPhase: result.previousPhase,
        timestamp: Date.now()
      });
    }

    return result;
  }

  /**
   * Get session for a room
   */
  public async getSessionForRoom(roomId: string): Promise<ManagedSession | null> {
    const sessionId = this.roomToSession.get(roomId);
    if (!sessionId) return null;
    return this.sessionManager.getSession(sessionId);
  }

  /**
   * Broadcast game phase change (legacy method - kept for backward compatibility)
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
   * Build ScenarioRequest for AI scenario generation
   */
  private buildScenarioRequest(_room: RoomState, playerData: { playerId: string; playerName: string; characterClass: string }[]): ScenarioRequest {
    const playerHistories: PlayerHistory[] = playerData.map(p => ({
      playerId: p.playerId,
      playerName: p.playerName,
      characterClass: (p.characterClass as CharacterClass) || CharacterClass.WARRIOR,
      godFavor: new Map<God, number>(),
      specialItems: [],
      npcRelationships: new Map<string, number>(),
      knownSecrets: [],
      personalGoals: [],
      moralAlignment: { lawChaos: 0, goodEvil: 0 }
    }));

    const context: ScenarioContext = {
      playerHistories,
      partyState: {
        location: 'Starting Location',
        activeQuests: [],
        sharedInventory: [],
        partyReputation: 0,
        resources: { gold: 0, supplies: 100, influence: 0 },
        partyModifiers: []
      },
      partyComposition: {
        playerIds: playerData.map(p => p.playerId),
        classes: playerData.map(p => (p.characterClass as CharacterClass) || CharacterClass.WARRIOR),
        averageLevel: 1,
        partySize: playerData.length
      },
      worldState: {
        factions: new Map(),
        majorEvents: [],
        playerActionsHistory: [],
        worldTime: { day: 1, season: 'SPRING', year: 1 },
        globalFlags: new Map()
      }
    };

    return {
      context,
      desiredType: ScenarioType.INVESTIGATION,
      difficulty: 5,
      theme: 'dark fantasy adventure'
    };
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
