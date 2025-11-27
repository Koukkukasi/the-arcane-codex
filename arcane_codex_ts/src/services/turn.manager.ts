/**
 * Turn Manager Service
 * Manages turn order, turn cycles, and turn-based game mechanics
 * Handles turn timeouts, skip logic, and turn notifications
 */

import { GamePhase } from '../types/multiplayer';
import { SessionManager, SessionPlayer } from './session.manager';
import { gameLogger } from './logger';

// ============================================
// Types
// ============================================

export interface TurnState {
  sessionId: string;
  currentPlayerIndex: number;
  turnOrder: string[];
  turnNumber: number;
  turnStartedAt: number;
  turnTimeoutMs: number | null;
  isPaused: boolean;
}

export interface TurnAdvanceResult {
  success: boolean;
  previousPlayerId?: string;
  currentPlayerId?: string;
  turnNumber?: number;
  isNewRound?: boolean;
  error?: string;
}

export interface TurnTimeout {
  sessionId: string;
  playerId: string;
  expiresAt: number;
  timer: NodeJS.Timeout;
}

export interface TurnActionResult {
  success: boolean;
  canAct: boolean;
  reason?: string;
}

export type TurnOrderStrategy = 'sequential' | 'speed' | 'random' | 'initiative';

export interface TurnOrderOptions {
  strategy: TurnOrderStrategy;
  playerSpeeds?: Map<string, number>;
  initiatives?: Map<string, number>;
}

// ============================================
// Turn Configuration
// ============================================

const TURN_TIMEOUTS_BY_PHASE: Partial<Record<GamePhase, number>> = {
  [GamePhase.BATTLE]: 60000,      // 60 seconds per battle turn
  [GamePhase.SCENARIO]: 120000,   // 2 minutes per scenario turn
  [GamePhase.EXPLORATION]: 300000 // 5 minutes per exploration turn
};

const DEFAULT_TURN_TIMEOUT = 120000; // 2 minutes default

// ============================================
// Turn Manager
// ============================================

export class TurnManager {
  private static instance: TurnManager;
  private sessionManager: SessionManager;
  private activeTimeouts: Map<string, TurnTimeout> = new Map();
  private onTurnTimeoutCallbacks: Map<string, (sessionId: string, playerId: string) => void> = new Map();

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
  }

  static getInstance(): TurnManager {
    if (!TurnManager.instance) {
      TurnManager.instance = new TurnManager();
    }
    return TurnManager.instance;
  }

  // ============================================
  // Turn Order Management
  // ============================================

  /**
   * Initialize turn order for a session
   */
  async initializeTurnOrder(
    sessionId: string,
    options: TurnOrderOptions = { strategy: 'sequential' }
  ): Promise<TurnAdvanceResult> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const playerIds = Array.from(session.players.keys());
    if (playerIds.length === 0) {
      return { success: false, error: 'No players in session' };
    }

    let orderedPlayerIds: string[];

    switch (options.strategy) {
      case 'speed':
        orderedPlayerIds = this.orderBySpeed(playerIds, options.playerSpeeds);
        break;
      case 'initiative':
        orderedPlayerIds = this.orderByInitiative(playerIds, options.initiatives);
        break;
      case 'random':
        orderedPlayerIds = this.shuffleArray([...playerIds]);
        break;
      case 'sequential':
      default:
        orderedPlayerIds = playerIds;
    }

    // Update session with new turn order
    session.turnOrder = orderedPlayerIds;
    session.currentTurnIndex = 0;
    session.turnNumber = 1;

    const currentPlayerId = orderedPlayerIds[0];

    gameLogger.info({
      sessionId,
      strategy: options.strategy,
      turnOrder: orderedPlayerIds,
      firstPlayer: currentPlayerId
    }, 'Turn order initialized');

    // Start turn timeout if applicable
    this.startTurnTimeout(sessionId, currentPlayerId, session.currentPhase);

    return {
      success: true,
      currentPlayerId,
      turnNumber: 1,
      isNewRound: true
    };
  }

  /**
   * Order players by speed stat (highest first)
   */
  private orderBySpeed(playerIds: string[], speeds?: Map<string, number>): string[] {
    if (!speeds) {
      return playerIds;
    }

    return [...playerIds].sort((a, b) => {
      const speedA = speeds.get(a) ?? 0;
      const speedB = speeds.get(b) ?? 0;
      return speedB - speedA; // Descending order
    });
  }

  /**
   * Order players by initiative roll (highest first)
   */
  private orderByInitiative(playerIds: string[], initiatives?: Map<string, number>): string[] {
    if (!initiatives) {
      // Roll random initiatives
      const rolled = new Map<string, number>();
      for (const id of playerIds) {
        rolled.set(id, Math.floor(Math.random() * 20) + 1);
      }
      return this.orderBySpeed(playerIds, rolled);
    }

    return [...playerIds].sort((a, b) => {
      const initA = initiatives.get(a) ?? 0;
      const initB = initiatives.get(b) ?? 0;
      return initB - initA;
    });
  }

  /**
   * Fisher-Yates shuffle
   */
  private shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // ============================================
  // Turn Advancement
  // ============================================

  /**
   * Advance to the next player's turn
   */
  async advanceTurn(sessionId: string): Promise<TurnAdvanceResult> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.turnOrder.length === 0) {
      return { success: false, error: 'Turn order not initialized' };
    }

    // Cancel any existing timeout
    this.cancelTurnTimeout(sessionId);

    const previousIndex = session.currentTurnIndex;
    const previousPlayerId = session.turnOrder[previousIndex];

    // Calculate next index
    let nextIndex = (previousIndex + 1) % session.turnOrder.length;
    let isNewRound = false;

    // Check if we've completed a round
    if (nextIndex === 0) {
      isNewRound = true;
      session.turnNumber++;
    }

    // Skip disconnected players
    let attempts = 0;
    while (attempts < session.turnOrder.length) {
      const playerId = session.turnOrder[nextIndex];
      const player = session.players.get(playerId);

      if (player && player.isConnected) {
        break;
      }

      nextIndex = (nextIndex + 1) % session.turnOrder.length;
      if (nextIndex === 0) {
        isNewRound = true;
        session.turnNumber++;
      }
      attempts++;
    }

    // All players disconnected
    if (attempts >= session.turnOrder.length) {
      return { success: false, error: 'No connected players available' };
    }

    session.currentTurnIndex = nextIndex;
    const currentPlayerId = session.turnOrder[nextIndex];

    // Use SessionManager to advance turn (for persistence)
    await this.sessionManager.advanceTurn(sessionId);

    gameLogger.info({
      sessionId,
      from: previousPlayerId,
      to: currentPlayerId,
      turnNumber: session.turnNumber,
      isNewRound
    }, 'Turn advanced');

    // Start turn timeout for new player
    this.startTurnTimeout(sessionId, currentPlayerId, session.currentPhase);

    return {
      success: true,
      previousPlayerId,
      currentPlayerId,
      turnNumber: session.turnNumber,
      isNewRound
    };
  }

  /**
   * Skip a specific player's turn
   */
  async skipPlayerTurn(sessionId: string, playerId: string, reason?: string): Promise<TurnAdvanceResult> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const currentPlayerId = session.turnOrder[session.currentTurnIndex];
    if (currentPlayerId !== playerId) {
      return { success: false, error: 'Not this player\'s turn' };
    }

    gameLogger.info({ sessionId, playerId, reason }, 'Player turn skipped');

    return this.advanceTurn(sessionId);
  }

  // ============================================
  // Turn Validation
  // ============================================

  /**
   * Check if it's a specific player's turn
   */
  async isPlayerTurn(sessionId: string, playerId: string): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session || session.turnOrder.length === 0) {
      return false;
    }

    return session.turnOrder[session.currentTurnIndex] === playerId;
  }

  /**
   * Validate if a player can perform an action
   */
  async validateTurnAction(sessionId: string, playerId: string): Promise<TurnActionResult> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, canAct: false, reason: 'Session not found' };
    }

    // Check if turn order is initialized
    if (session.turnOrder.length === 0) {
      return { success: false, canAct: false, reason: 'Turn order not initialized' };
    }

    // Check if it's this player's turn
    const currentPlayerId = session.turnOrder[session.currentTurnIndex];
    if (currentPlayerId !== playerId) {
      return {
        success: true,
        canAct: false,
        reason: `Not your turn. Current turn: ${currentPlayerId}`
      };
    }

    // Check if player is in session
    const player = session.players.get(playerId);
    if (!player) {
      return { success: false, canAct: false, reason: 'Player not in session' };
    }

    // Check if player is connected
    if (!player.isConnected) {
      return { success: true, canAct: false, reason: 'Player is disconnected' };
    }

    return { success: true, canAct: true };
  }

  /**
   * Get current turn state
   */
  async getTurnState(sessionId: string): Promise<TurnState | null> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return null;
    }

    const timeout = this.activeTimeouts.get(sessionId);

    return {
      sessionId,
      currentPlayerIndex: session.currentTurnIndex,
      turnOrder: session.turnOrder,
      turnNumber: session.turnNumber,
      turnStartedAt: timeout ? timeout.expiresAt - (TURN_TIMEOUTS_BY_PHASE[session.currentPhase] || DEFAULT_TURN_TIMEOUT) : Date.now(),
      turnTimeoutMs: timeout ? timeout.expiresAt - Date.now() : null,
      isPaused: false // Could be extended for pause functionality
    };
  }

  /**
   * Get the current player
   */
  async getCurrentPlayer(sessionId: string): Promise<SessionPlayer | null> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session || session.turnOrder.length === 0) {
      return null;
    }

    const currentPlayerId = session.turnOrder[session.currentTurnIndex];
    return session.players.get(currentPlayerId) || null;
  }

  // ============================================
  // Turn Timeouts
  // ============================================

  /**
   * Start turn timeout for a player
   */
  private startTurnTimeout(sessionId: string, playerId: string, phase: GamePhase): void {
    // Cancel any existing timeout
    this.cancelTurnTimeout(sessionId);

    const timeoutMs = TURN_TIMEOUTS_BY_PHASE[phase] || DEFAULT_TURN_TIMEOUT;
    const expiresAt = Date.now() + timeoutMs;

    const timer = setTimeout(async () => {
      await this.handleTurnTimeout(sessionId, playerId);
    }, timeoutMs);

    this.activeTimeouts.set(sessionId, {
      sessionId,
      playerId,
      expiresAt,
      timer
    });

    gameLogger.debug({
      sessionId,
      playerId,
      timeoutMs
    }, 'Turn timeout started');
  }

  /**
   * Cancel turn timeout for a session
   */
  cancelTurnTimeout(sessionId: string): void {
    const timeout = this.activeTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout.timer);
      this.activeTimeouts.delete(sessionId);
      gameLogger.debug({ sessionId }, 'Turn timeout cancelled');
    }
  }

  /**
   * Handle turn timeout expiration
   */
  private async handleTurnTimeout(sessionId: string, playerId: string): Promise<void> {
    gameLogger.warn({ sessionId, playerId }, 'Turn timeout expired');

    // Execute registered callback if any
    const callback = this.onTurnTimeoutCallbacks.get(sessionId);
    if (callback) {
      callback(sessionId, playerId);
    }

    // Auto-advance turn
    await this.advanceTurn(sessionId);
  }

  /**
   * Register a callback for turn timeout
   */
  onTurnTimeout(sessionId: string, callback: (sessionId: string, playerId: string) => void): void {
    this.onTurnTimeoutCallbacks.set(sessionId, callback);
  }

  /**
   * Unregister turn timeout callback
   */
  offTurnTimeout(sessionId: string): void {
    this.onTurnTimeoutCallbacks.delete(sessionId);
  }

  /**
   * Get remaining time for current turn
   */
  getRemainingTurnTime(sessionId: string): number | null {
    const timeout = this.activeTimeouts.get(sessionId);
    if (!timeout) {
      return null;
    }
    return Math.max(0, timeout.expiresAt - Date.now());
  }

  /**
   * Extend the current turn timeout
   */
  extendTurnTimeout(sessionId: string, additionalMs: number): boolean {
    const timeout = this.activeTimeouts.get(sessionId);
    if (!timeout) {
      return false;
    }

    clearTimeout(timeout.timer);

    const newExpiresAt = timeout.expiresAt + additionalMs;
    const remainingMs = newExpiresAt - Date.now();

    timeout.expiresAt = newExpiresAt;
    timeout.timer = setTimeout(async () => {
      await this.handleTurnTimeout(sessionId, timeout.playerId);
    }, remainingMs);

    gameLogger.info({
      sessionId,
      playerId: timeout.playerId,
      additionalMs
    }, 'Turn timeout extended');

    return true;
  }

  // ============================================
  // Turn Order Modifications
  // ============================================

  /**
   * Add a player to turn order
   */
  async addPlayerToTurnOrder(
    sessionId: string,
    playerId: string,
    position: 'end' | 'next' | number = 'end'
  ): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return false;
    }

    // Don't add if already in order
    if (session.turnOrder.includes(playerId)) {
      return true;
    }

    if (position === 'end') {
      session.turnOrder.push(playerId);
    } else if (position === 'next') {
      const insertIndex = (session.currentTurnIndex + 1) % (session.turnOrder.length + 1);
      session.turnOrder.splice(insertIndex, 0, playerId);
    } else if (typeof position === 'number') {
      session.turnOrder.splice(position, 0, playerId);
      // Adjust current index if needed
      if (position <= session.currentTurnIndex) {
        session.currentTurnIndex++;
      }
    }

    gameLogger.info({ sessionId, playerId, position }, 'Player added to turn order');
    return true;
  }

  /**
   * Remove a player from turn order
   */
  async removePlayerFromTurnOrder(sessionId: string, playerId: string): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return false;
    }

    const index = session.turnOrder.indexOf(playerId);
    if (index === -1) {
      return true; // Already not in order
    }

    // If it's this player's turn, advance first
    if (index === session.currentTurnIndex) {
      this.cancelTurnTimeout(sessionId);
    }

    session.turnOrder.splice(index, 1);

    // Adjust current index if needed
    if (index < session.currentTurnIndex) {
      session.currentTurnIndex--;
    } else if (session.currentTurnIndex >= session.turnOrder.length) {
      session.currentTurnIndex = 0;
    }

    gameLogger.info({ sessionId, playerId }, 'Player removed from turn order');
    return true;
  }

  /**
   * Reorder players (for effects that change turn order mid-game)
   */
  async reorderPlayers(sessionId: string, newOrder: string[]): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return false;
    }

    // Validate all players exist
    for (const playerId of newOrder) {
      if (!session.players.has(playerId)) {
        gameLogger.warn({ sessionId, playerId }, 'Invalid player in new turn order');
        return false;
      }
    }

    // Preserve current player's turn if possible
    const currentPlayerId = session.turnOrder[session.currentTurnIndex];
    session.turnOrder = newOrder;

    const newIndex = newOrder.indexOf(currentPlayerId);
    session.currentTurnIndex = newIndex >= 0 ? newIndex : 0;

    gameLogger.info({ sessionId, newOrder }, 'Turn order reordered');
    return true;
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clean up all timeouts for a session
   */
  cleanupSession(sessionId: string): void {
    this.cancelTurnTimeout(sessionId);
    this.onTurnTimeoutCallbacks.delete(sessionId);
  }

  /**
   * Clean up all timeouts
   */
  cleanup(): void {
    for (const [_sessionId, timeout] of this.activeTimeouts) {
      clearTimeout(timeout.timer);
    }
    this.activeTimeouts.clear();
    this.onTurnTimeoutCallbacks.clear();
    gameLogger.info('TurnManager cleanup complete');
  }
}

export default TurnManager;
