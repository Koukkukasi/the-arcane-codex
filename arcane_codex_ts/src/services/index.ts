// Export all services for The Arcane Codex

// AI GM System
export { ConsequenceTracker } from './consequence_tracker';
export type { ConsequenceTrackerEvents } from './consequence_tracker';

export { AsymmetricInfoManager } from './asymmetric_info_manager';
export type { AsymmetricInfoEvents, ScenarioResponse } from './asymmetric_info_manager';

// Session & Turn Management (Phase 2)
export { SessionManager } from './session.manager';
export type { ManagedSession, SessionPlayer, CreateSessionOptions } from './session.manager';

export { PhaseManager } from './phase.manager';
export type { PhaseTransitionResult } from './phase.manager';

export { TurnManager } from './turn.manager';
export type { TurnAdvanceResult, TurnActionResult } from './turn.manager';

// Real-time Communication (Phase 3)
export { EventBus } from './event.bus';
export type {
  PhaseChangeEvent,
  TurnChangeEvent,
  PlayerJoinEvent,
  PlayerLeaveEvent,
  ChatEvent,
  BattleEvent,
  NotificationEvent,
  GameEventMap
} from './event.bus';

export { SocketBroadcaster, SocketEvents } from './socket.broadcaster';
export { ChatService } from './chat.service';
export { NotificationService, NotificationTemplates } from './notification.service';
export type { NotificationType, NotificationOptions } from './notification.service';

// Logger
export { gameLogger } from './logger';

// Re-export world state types for convenience
export * from '../types/world_state';