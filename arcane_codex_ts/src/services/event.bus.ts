/**
 * Event Bus Service
 * Central event system for game-wide real-time communication
 * Provides typed events, event queuing, and replay for reconnecting players
 */

import { TypedEmitter } from '../types/events';
import { gameLogger } from './logger';
import { GamePhase, GlobalEvent, ChatMessage, BattleAction } from '../types/multiplayer';

// ============================================
// Event Types
// ============================================

export interface PhaseChangeEvent {
  sessionId: string;
  roomId: string;
  previousPhase: GamePhase;
  newPhase: GamePhase;
  triggeredBy: string;
  timestamp: number;
  additionalData?: Record<string, any>;
}

export interface TurnChangeEvent {
  sessionId: string;
  roomId: string;
  previousPlayerId: string;
  currentPlayerId: string;
  turnNumber: number;
  timestamp: number;
}

export interface PlayerJoinEvent {
  sessionId: string;
  roomId: string;
  playerId: string;
  playerName: string;
  timestamp: number;
}

export interface PlayerLeaveEvent {
  sessionId: string;
  roomId: string;
  playerId: string;
  playerName: string;
  reason: 'disconnect' | 'kick' | 'leave' | 'timeout';
  timestamp: number;
}

export interface PlayerReconnectEvent {
  sessionId: string;
  roomId: string;
  playerId: string;
  playerName: string;
  disconnectedAt: number;
  reconnectedAt: number;
}

export interface ChatEvent {
  sessionId: string;
  roomId: string;
  message: ChatMessage;
}

export interface BattleEvent {
  sessionId: string;
  roomId: string;
  action: BattleAction;
  result?: {
    success: boolean;
    damage?: number;
    effects?: string[];
    message?: string;
  };
}

export interface InterrogationEvent {
  sessionId: string;
  roomId: string;
  type: 'question_asked' | 'answer_received' | 'clue_revealed' | 'mood_change';
  playerId: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface ScenarioEvent {
  sessionId: string;
  roomId: string;
  type: 'choice_made' | 'consequence_revealed' | 'scenario_complete';
  playerId?: string;
  data: Record<string, any>;
  timestamp: number;
}

export interface GameStateEvent {
  sessionId: string;
  roomId: string;
  type: 'state_update' | 'sync_request' | 'sync_complete';
  state?: Record<string, any>;
  timestamp: number;
}

export interface NotificationEvent {
  sessionId?: string;
  roomId?: string;
  playerId?: string; // If null, broadcast to all
  type: 'info' | 'warning' | 'error' | 'success' | 'achievement';
  title: string;
  message: string;
  duration?: number;
  data?: Record<string, any>;
  timestamp: number;
}

// ============================================
// Event Map
// ============================================

export interface GameEventMap {
  'phase:change': (event: PhaseChangeEvent) => void;
  'turn:change': (event: TurnChangeEvent) => void;
  'player:join': (event: PlayerJoinEvent) => void;
  'player:leave': (event: PlayerLeaveEvent) => void;
  'player:reconnect': (event: PlayerReconnectEvent) => void;
  'chat:message': (event: ChatEvent) => void;
  'battle:action': (event: BattleEvent) => void;
  'interrogation:event': (event: InterrogationEvent) => void;
  'scenario:event': (event: ScenarioEvent) => void;
  'game:state': (event: GameStateEvent) => void;
  'notification:send': (event: NotificationEvent) => void;
  'global:event': (event: GlobalEvent) => void;
}

// ============================================
// Queued Event for Replay
// ============================================

interface QueuedEvent {
  eventType: keyof GameEventMap;
  event: any;
  timestamp: number;
  sessionId: string;
}

// ============================================
// Event Bus Service
// ============================================

export class EventBus extends TypedEmitter<GameEventMap> {
  private static instance: EventBus;

  // Event queues per session for replay
  private eventQueues: Map<string, QueuedEvent[]> = new Map();

  // Maximum events to keep per session
  private readonly MAX_QUEUE_SIZE = 1000;

  // Event TTL in milliseconds (30 minutes)
  private readonly EVENT_TTL_MS = 30 * 60 * 1000;

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startCleanup();
    gameLogger.info('EventBus initialized');
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  // ============================================
  // Enhanced Emit with Queueing
  // ============================================

  /**
   * Emit an event and queue it for potential replay
   */
  emitWithQueue<K extends keyof GameEventMap>(
    eventType: K,
    event: Parameters<GameEventMap[K]>[0],
    sessionId: string
  ): boolean {
    // Queue the event
    this.queueEvent(sessionId, eventType, event);

    // Emit the event - cast to any to bypass strict typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this as any).emit(eventType, event);
  }

  /**
   * Emit phase change event
   */
  emitPhaseChange(event: PhaseChangeEvent): void {
    this.emitWithQueue('phase:change', event, event.sessionId);

    // Also emit a global event for UI notifications
    const globalEvent: GlobalEvent = {
      id: `phase-${Date.now()}`,
      type: 'phase_change',
      message: `Game phase changed to ${event.newPhase}`,
      timestamp: event.timestamp,
      data: { previousPhase: event.previousPhase, newPhase: event.newPhase }
    };
    this.emitWithQueue('global:event', globalEvent, event.sessionId);

    gameLogger.info({ event }, 'Phase change event emitted');
  }

  /**
   * Emit turn change event
   */
  emitTurnChange(event: TurnChangeEvent): void {
    this.emitWithQueue('turn:change', event, event.sessionId);
    gameLogger.debug({ event }, 'Turn change event emitted');
  }

  /**
   * Emit player join event
   */
  emitPlayerJoin(event: PlayerJoinEvent): void {
    this.emitWithQueue('player:join', event, event.sessionId);

    const globalEvent: GlobalEvent = {
      id: `join-${Date.now()}`,
      type: 'player_joined',
      message: `${event.playerName} joined the game`,
      timestamp: event.timestamp,
      data: { playerId: event.playerId }
    };
    this.emitWithQueue('global:event', globalEvent, event.sessionId);

    gameLogger.info({ event }, 'Player join event emitted');
  }

  /**
   * Emit player leave event
   */
  emitPlayerLeave(event: PlayerLeaveEvent): void {
    this.emitWithQueue('player:leave', event, event.sessionId);

    const globalEvent: GlobalEvent = {
      id: `leave-${Date.now()}`,
      type: 'player_left',
      message: `${event.playerName} left the game`,
      timestamp: event.timestamp,
      data: { playerId: event.playerId, reason: event.reason }
    };
    this.emitWithQueue('global:event', globalEvent, event.sessionId);

    gameLogger.info({ event }, 'Player leave event emitted');
  }

  /**
   * Emit player reconnect event
   */
  emitPlayerReconnect(event: PlayerReconnectEvent): void {
    this.emitWithQueue('player:reconnect', event, event.sessionId);
    gameLogger.info({ event }, 'Player reconnect event emitted');
  }

  /**
   * Emit chat message event
   */
  emitChatMessage(event: ChatEvent): void {
    this.emitWithQueue('chat:message', event, event.sessionId);
  }

  /**
   * Emit battle action event
   */
  emitBattleAction(event: BattleEvent): void {
    this.emitWithQueue('battle:action', event, event.sessionId);
    gameLogger.debug({ event }, 'Battle action event emitted');
  }

  /**
   * Emit interrogation event
   */
  emitInterrogationEvent(event: InterrogationEvent): void {
    this.emitWithQueue('interrogation:event', event, event.sessionId);
  }

  /**
   * Emit scenario event
   */
  emitScenarioEvent(event: ScenarioEvent): void {
    this.emitWithQueue('scenario:event', event, event.sessionId);
  }

  /**
   * Emit game state event
   */
  emitGameState(event: GameStateEvent): void {
    this.emitWithQueue('game:state', event, event.sessionId);
  }

  /**
   * Emit notification event
   */
  emitNotification(event: NotificationEvent): void {
    if (event.sessionId) {
      this.emitWithQueue('notification:send', event, event.sessionId);
    } else {
      // Global notification, just emit without queueing
      this.emit('notification:send', event);
    }
  }

  // ============================================
  // Event Queue Management
  // ============================================

  /**
   * Queue an event for potential replay
   */
  private queueEvent(sessionId: string, eventType: keyof GameEventMap, event: any): void {
    if (!this.eventQueues.has(sessionId)) {
      this.eventQueues.set(sessionId, []);
    }

    const queue = this.eventQueues.get(sessionId)!;

    queue.push({
      eventType,
      event,
      timestamp: Date.now(),
      sessionId
    });

    // Trim if exceeds max size
    if (queue.length > this.MAX_QUEUE_SIZE) {
      queue.splice(0, queue.length - this.MAX_QUEUE_SIZE);
    }
  }

  /**
   * Get events for replay (events after a given timestamp)
   */
  getEventsForReplay(sessionId: string, sinceTimestamp: number): QueuedEvent[] {
    const queue = this.eventQueues.get(sessionId);
    if (!queue) {
      return [];
    }

    return queue.filter(event => event.timestamp > sinceTimestamp);
  }

  /**
   * Get all events for a session
   */
  getSessionEvents(sessionId: string): QueuedEvent[] {
    return this.eventQueues.get(sessionId) || [];
  }

  /**
   * Clear events for a session
   */
  clearSessionEvents(sessionId: string): void {
    this.eventQueues.delete(sessionId);
  }

  /**
   * Get event count for a session
   */
  getEventCount(sessionId: string): number {
    return this.eventQueues.get(sessionId)?.length || 0;
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Start periodic cleanup of old events
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupOldEvents();
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Clean up old events from all queues
   */
  private cleanupOldEvents(): void {
    const cutoffTime = Date.now() - this.EVENT_TTL_MS;
    let totalRemoved = 0;

    for (const [sessionId, queue] of this.eventQueues.entries()) {
      const originalLength = queue.length;
      const filtered = queue.filter(event => event.timestamp > cutoffTime);

      if (filtered.length === 0) {
        this.eventQueues.delete(sessionId);
        totalRemoved += originalLength;
      } else if (filtered.length < originalLength) {
        this.eventQueues.set(sessionId, filtered);
        totalRemoved += originalLength - filtered.length;
      }
    }

    if (totalRemoved > 0) {
      gameLogger.debug({ totalRemoved }, 'Cleaned up old events');
    }
  }

  /**
   * Shutdown the event bus
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.eventQueues.clear();
    this.removeAllListeners();
    gameLogger.info('EventBus shut down');
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get event bus statistics
   */
  getStats(): {
    totalSessions: number;
    totalEvents: number;
    averageEventsPerSession: number;
  } {
    let totalEvents = 0;
    for (const queue of this.eventQueues.values()) {
      totalEvents += queue.length;
    }

    const totalSessions = this.eventQueues.size;
    return {
      totalSessions,
      totalEvents,
      averageEventsPerSession: totalSessions > 0 ? Math.round(totalEvents / totalSessions) : 0
    };
  }
}
