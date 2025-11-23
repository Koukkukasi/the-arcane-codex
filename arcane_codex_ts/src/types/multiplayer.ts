/**
 * Multiplayer type definitions for The Arcane Codex
 * Defines all types related to Socket.IO real-time communication
 */

/**
 * Game phase enumeration
 */
export enum GamePhase {
  LOBBY = 'LOBBY',
  INTERROGATION = 'INTERROGATION',
  EXPLORATION = 'EXPLORATION',
  BATTLE = 'BATTLE',
  SCENARIO = 'SCENARIO',
  VICTORY = 'VICTORY'
}

/**
 * Player connection information
 */
export interface PlayerConnection {
  playerId: string;
  socketId: string;
  lastSeen: number;
  isConnected: boolean;
  playerName: string;
  roomId?: string;
}

/**
 * Turn order management
 */
export type TurnOrder = {
  currentPlayerIndex: number;
  playerOrder: string[];
  turnNumber: number;
  phaseStartTime: number;
};

/**
 * Room state interface
 */
export interface RoomState {
  roomId: string;
  hostPlayerId: string;
  players: Map<string, PlayerConnection>;
  currentTurn: TurnOrder;
  gamePhase: GamePhase;
  sharedState: SharedGameState;
  createdAt: number;
  lastActivity: number;
  settings: RoomSettings;
}

/**
 * Room settings
 */
export interface RoomSettings {
  maxPlayers: number;
  turnTimeLimit?: number; // in seconds
  allowSpectators: boolean;
  autoCleanupAfter: number; // minutes
}

/**
 * Shared game state accessible by all players
 */
export interface SharedGameState {
  battleState?: BattleSync;
  scenarioState?: ScenarioSync;
  explorationState?: ExplorationSync;
  interrogationState?: InterrogationSync;
  chatHistory: ChatMessage[];
  globalEvents: GlobalEvent[];
}

/**
 * Battle synchronization state
 */
export interface BattleSync {
  battleId: string;
  activePlayers: string[];
  defeatedPlayers: string[];
  currentTurnPlayer: string;
  turnTimeRemaining?: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyStatus: string[];
  lastAction?: BattleAction;
  spectators: string[];
}

/**
 * Battle action details
 */
export interface BattleAction {
  playerId: string;
  actionType: 'attack' | 'ability' | 'item' | 'defend' | 'flee';
  targetId?: string;
  abilityId?: string;
  damage?: number;
  effects?: string[];
  timestamp: number;
}

/**
 * Scenario synchronization state
 */
export interface ScenarioSync {
  scenarioId: string;
  scenarioPhase: number;
  playersReady: string[];
  choicesMade: Map<string, boolean>; // playerId -> made choice (not revealing what)
  sharedClues: string[];
  consequencesRevealed: boolean;
  scenarioOutcome?: 'success' | 'failure' | 'partial';
}

/**
 * Exploration synchronization state
 */
export interface ExplorationSync {
  currentLocation: string;
  exploredLocations: string[];
  discoveredItems: string[];
  activeEvents: string[];
  playerPositions: Map<string, { x: number; y: number }>;
}

/**
 * Interrogation synchronization state
 */
export interface InterrogationSync {
  currentSuspect: string;
  questionsAsked: number;
  cluesRevealed: string[];
  suspectMood: 'cooperative' | 'neutral' | 'hostile';
  interrogationProgress: number; // 0-100
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'system' | 'action';
}

/**
 * Global event notification
 */
export interface GlobalEvent {
  id: string;
  type: 'player_joined' | 'player_left' | 'phase_change' | 'achievement' | 'discovery';
  message: string;
  timestamp: number;
  data?: any;
}

/**
 * Socket event payloads
 */
export interface JoinRoomPayload {
  roomId: string;
  playerId: string;
  playerName: string;
  rejoin?: boolean;
}

export interface LeaveRoomPayload {
  roomId: string;
  playerId: string;
  reason?: 'manual' | 'disconnect' | 'timeout' | 'kick';
}

export interface ReadyStatusPayload {
  roomId: string;
  playerId: string;
  isReady: boolean;
}

export interface ChatMessagePayload {
  roomId: string;
  playerId: string;
  message: string;
}

export interface PlayerActionPayload {
  roomId: string;
  playerId: string;
  actionType: string;
  actionData: any;
}

export interface RequestSyncPayload {
  roomId: string;
  playerId: string;
  syncType: 'full' | 'battle' | 'scenario' | 'exploration';
}

export interface HeartbeatPayload {
  roomId: string;
  playerId: string;
  timestamp: number;
}

/**
 * Union type for all multiplayer events
 */
export type MultiplayerEvent =
  | { type: 'join_room'; payload: JoinRoomPayload }
  | { type: 'leave_room'; payload: LeaveRoomPayload }
  | { type: 'ready_status'; payload: ReadyStatusPayload }
  | { type: 'chat_message'; payload: ChatMessagePayload }
  | { type: 'player_action'; payload: PlayerActionPayload }
  | { type: 'request_sync'; payload: RequestSyncPayload }
  | { type: 'heartbeat'; payload: HeartbeatPayload }
  | { type: 'battle_turn'; payload: BattleAction }
  | { type: 'scenario_choice'; payload: { playerId: string; choiceMade: boolean } }
  | { type: 'clue_shared'; payload: { playerId: string; clue: string } };

/**
 * Socket response types
 */
export interface SocketResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Room list item for lobby
 */
export interface RoomListItem {
  roomId: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  gamePhase: GamePhase;
  createdAt: number;
}

/**
 * Player stats for multiplayer session
 */
export interface PlayerSessionStats {
  playerId: string;
  damageDealt: number;
  damageReceived: number;
  abilitiesUsed: number;
  cluesDiscovered: number;
  battlesWon: number;
  scenariosCompleted: number;
}

/**
 * Reconnection data
 */
export interface ReconnectionData {
  playerId: string;
  roomId: string;
  lastSocketId: string;
  disconnectTime: number;
  gamePhase: GamePhase;
  playerState: any; // Preserved player-specific state
}