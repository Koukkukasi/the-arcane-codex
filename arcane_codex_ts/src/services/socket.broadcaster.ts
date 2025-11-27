/**
 * Socket Broadcaster Service
 * Bridges EventBus events to Socket.IO rooms
 * Handles targeted and broadcast messaging
 */

import { Server, Socket } from 'socket.io';
import { EventBus, PhaseChangeEvent, TurnChangeEvent, PlayerJoinEvent, PlayerLeaveEvent,
         PlayerReconnectEvent, ChatEvent, BattleEvent, InterrogationEvent, ScenarioEvent,
         GameStateEvent, NotificationEvent } from './event.bus';
import { GlobalEvent } from '../types/multiplayer';
import { gameLogger } from './logger';

// ============================================
// Socket Event Names (client-facing)
// ============================================

export const SocketEvents = {
  // Server -> Client events
  PHASE_CHANGED: 'phase_changed',
  TURN_CHANGED: 'turn_changed',
  PLAYER_JOINED: 'player_joined',
  PLAYER_LEFT: 'player_left',
  PLAYER_RECONNECTED: 'player_reconnected',
  CHAT_MESSAGE: 'chat_message',
  BATTLE_ACTION: 'battle_action',
  INTERROGATION_UPDATE: 'interrogation_update',
  SCENARIO_UPDATE: 'scenario_update',
  GAME_STATE_UPDATE: 'game_state_update',
  NOTIFICATION: 'notification',
  GLOBAL_EVENT: 'global_event',
  STATE_SYNC: 'state_sync',
  ERROR: 'error',

  // Client -> Server events
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  READY_STATUS: 'ready_status',
  SEND_CHAT: 'send_chat',
  PLAYER_ACTION: 'player_action',
  REQUEST_SYNC: 'request_sync',
  HEARTBEAT: 'heartbeat',
  START_GAME: 'start_game',
  END_TURN: 'end_turn'
} as const;

// ============================================
// Socket Broadcaster Service
// ============================================

export class SocketBroadcaster {
  private static instance: SocketBroadcaster;

  private io: Server | null = null;
  private eventBus: EventBus;
  private roomMappings: Map<string, string> = new Map(); // sessionId -> roomId

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  static getInstance(): SocketBroadcaster {
    if (!SocketBroadcaster.instance) {
      SocketBroadcaster.instance = new SocketBroadcaster();
    }
    return SocketBroadcaster.instance;
  }

  /**
   * Initialize with Socket.IO server
   */
  initialize(io: Server): void {
    this.io = io;
    gameLogger.info('SocketBroadcaster initialized with Socket.IO server');
  }

  /**
   * Register a session-to-room mapping
   */
  registerRoom(sessionId: string, roomId: string): void {
    this.roomMappings.set(sessionId, roomId);
  }

  /**
   * Unregister a room mapping
   */
  unregisterRoom(sessionId: string): void {
    this.roomMappings.delete(sessionId);
  }

  /**
   * Get room ID for a session
   */
  getRoomId(sessionId: string): string | null {
    return this.roomMappings.get(sessionId) || null;
  }

  // ============================================
  // Event Listeners Setup
  // ============================================

  private setupEventListeners(): void {
    // Phase changes
    this.eventBus.on('phase:change', (event: PhaseChangeEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.PHASE_CHANGED, {
        previousPhase: event.previousPhase,
        newPhase: event.newPhase,
        triggeredBy: event.triggeredBy,
        timestamp: event.timestamp,
        data: event.additionalData
      });
    });

    // Turn changes
    this.eventBus.on('turn:change', (event: TurnChangeEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.TURN_CHANGED, {
        previousPlayerId: event.previousPlayerId,
        currentPlayerId: event.currentPlayerId,
        turnNumber: event.turnNumber,
        timestamp: event.timestamp
      });
    });

    // Player joins
    this.eventBus.on('player:join', (event: PlayerJoinEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.PLAYER_JOINED, {
        playerId: event.playerId,
        playerName: event.playerName,
        timestamp: event.timestamp
      });
    });

    // Player leaves
    this.eventBus.on('player:leave', (event: PlayerLeaveEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.PLAYER_LEFT, {
        playerId: event.playerId,
        playerName: event.playerName,
        reason: event.reason,
        timestamp: event.timestamp
      });
    });

    // Player reconnects
    this.eventBus.on('player:reconnect', (event: PlayerReconnectEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.PLAYER_RECONNECTED, {
        playerId: event.playerId,
        playerName: event.playerName,
        disconnectedAt: event.disconnectedAt,
        reconnectedAt: event.reconnectedAt
      });
    });

    // Chat messages
    this.eventBus.on('chat:message', (event: ChatEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.CHAT_MESSAGE, event.message);
    });

    // Battle actions
    this.eventBus.on('battle:action', (event: BattleEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.BATTLE_ACTION, {
        action: event.action,
        result: event.result
      });
    });

    // Interrogation events
    this.eventBus.on('interrogation:event', (event: InterrogationEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.INTERROGATION_UPDATE, {
        type: event.type,
        playerId: event.playerId,
        data: event.data,
        timestamp: event.timestamp
      });
    });

    // Scenario events
    this.eventBus.on('scenario:event', (event: ScenarioEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.SCENARIO_UPDATE, {
        type: event.type,
        playerId: event.playerId,
        data: event.data,
        timestamp: event.timestamp
      });
    });

    // Game state events
    this.eventBus.on('game:state', (event: GameStateEvent) => {
      this.broadcastToRoom(event.sessionId, SocketEvents.GAME_STATE_UPDATE, {
        type: event.type,
        state: event.state,
        timestamp: event.timestamp
      });
    });

    // Notifications
    this.eventBus.on('notification:send', (event: NotificationEvent) => {
      if (event.playerId && event.sessionId) {
        // Targeted notification
        this.sendToPlayer(event.sessionId, event.playerId, SocketEvents.NOTIFICATION, {
          type: event.type,
          title: event.title,
          message: event.message,
          duration: event.duration,
          data: event.data,
          timestamp: event.timestamp
        });
      } else if (event.sessionId) {
        // Room-wide notification
        this.broadcastToRoom(event.sessionId, SocketEvents.NOTIFICATION, {
          type: event.type,
          title: event.title,
          message: event.message,
          duration: event.duration,
          data: event.data,
          timestamp: event.timestamp
        });
      } else {
        // Global notification (all connected clients)
        this.broadcastGlobal(SocketEvents.NOTIFICATION, {
          type: event.type,
          title: event.title,
          message: event.message,
          duration: event.duration,
          data: event.data,
          timestamp: event.timestamp
        });
      }
    });

    // Global events
    this.eventBus.on('global:event', (event: GlobalEvent) => {
      // GlobalEvent doesn't have sessionId, but we need to broadcast to specific room
      // This is handled by the EventBus when emitting global events with session context
      this.broadcastGlobal(SocketEvents.GLOBAL_EVENT, event);
    });

    gameLogger.info('SocketBroadcaster event listeners set up');
  }

  // ============================================
  // Broadcasting Methods
  // ============================================

  /**
   * Broadcast to all clients in a room
   */
  broadcastToRoom(sessionId: string, event: string, data: any): void {
    if (!this.io) {
      gameLogger.warn({ sessionId, event }, 'Cannot broadcast - Socket.IO not initialized');
      return;
    }

    const roomId = this.roomMappings.get(sessionId) || sessionId;

    this.io.to(roomId).emit(event, data);
    gameLogger.debug({ roomId, event }, 'Broadcast to room');
  }

  /**
   * Broadcast to all clients in a room except one
   */
  broadcastToRoomExcept(sessionId: string, exceptSocketId: string, event: string, data: any): void {
    if (!this.io) {
      return;
    }

    const roomId = this.roomMappings.get(sessionId) || sessionId;

    this.io.to(roomId).except(exceptSocketId).emit(event, data);
  }

  /**
   * Send to a specific player
   */
  sendToPlayer(sessionId: string, playerId: string, event: string, data: any): void {
    if (!this.io) {
      return;
    }

    const roomId = this.roomMappings.get(sessionId) || sessionId;

    // Get all sockets in the room
    const roomSockets = this.io.sockets.adapter.rooms.get(roomId);
    if (!roomSockets) {
      gameLogger.warn({ roomId, playerId }, 'Room not found for player message');
      return;
    }

    // Find socket for this player
    for (const socketId of roomSockets) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && (socket.data as any)?.playerId === playerId) {
        socket.emit(event, data);
        return;
      }
    }

    gameLogger.warn({ playerId, roomId }, 'Socket not found for player');
  }

  /**
   * Send to multiple specific players
   */
  sendToPlayers(sessionId: string, playerIds: string[], event: string, data: any): void {
    for (const playerId of playerIds) {
      this.sendToPlayer(sessionId, playerId, event, data);
    }
  }

  /**
   * Broadcast to all connected clients (global)
   */
  broadcastGlobal(event: string, data: any): void {
    if (!this.io) {
      return;
    }

    this.io.emit(event, data);
    gameLogger.debug({ event }, 'Global broadcast');
  }

  /**
   * Send state sync to a specific socket (for reconnection)
   */
  sendStateSync(socket: Socket, state: any, missedEvents: any[] = []): void {
    socket.emit(SocketEvents.STATE_SYNC, {
      type: 'full',
      state,
      missedEvents,
      timestamp: Date.now()
    });
  }

  /**
   * Send error to a socket
   */
  sendError(socket: Socket, error: string, code?: string): void {
    socket.emit(SocketEvents.ERROR, {
      error,
      code,
      timestamp: Date.now()
    });
  }

  // ============================================
  // Room Management
  // ============================================

  /**
   * Get all socket IDs in a room
   */
  getSocketsInRoom(sessionId: string): string[] {
    if (!this.io) {
      return [];
    }

    const roomId = this.roomMappings.get(sessionId) || sessionId;
    const roomSockets = this.io.sockets.adapter.rooms.get(roomId);

    return roomSockets ? Array.from(roomSockets) : [];
  }

  /**
   * Get player count in a room
   */
  getPlayerCount(sessionId: string): number {
    return this.getSocketsInRoom(sessionId).length;
  }

  /**
   * Check if a player is connected
   */
  isPlayerConnected(sessionId: string, playerId: string): boolean {
    if (!this.io) {
      return false;
    }

    const roomId = this.roomMappings.get(sessionId) || sessionId;
    const roomSockets = this.io.sockets.adapter.rooms.get(roomId);

    if (!roomSockets) {
      return false;
    }

    for (const socketId of roomSockets) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket && (socket.data as any)?.playerId === playerId) {
        return true;
      }
    }

    return false;
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get broadcaster statistics
   */
  getStats(): {
    initialized: boolean;
    roomCount: number;
    totalConnections: number;
  } {
    const roomCount = this.roomMappings.size;
    let totalConnections = 0;

    if (this.io) {
      totalConnections = this.io.sockets.sockets.size;
    }

    return {
      initialized: this.io !== null,
      roomCount,
      totalConnections
    };
  }

  /**
   * Shutdown
   */
  shutdown(): void {
    this.roomMappings.clear();
    gameLogger.info('SocketBroadcaster shut down');
  }
}
