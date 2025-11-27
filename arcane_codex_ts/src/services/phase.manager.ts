/**
 * Phase Manager Service
 * Manages game phase transitions with a state machine pattern
 * Handles phase-specific logic, validations, and timeouts
 */

import { GamePhase } from '../types/multiplayer';
import { SessionManager, ManagedSession } from './session.manager';
import { gameLogger } from './logger';

// ============================================
// Types
// ============================================

export interface PhaseTransitionResult {
  success: boolean;
  previousPhase?: GamePhase;
  newPhase?: GamePhase;
  error?: string;
  phaseData?: Record<string, any>;
}

export interface PhaseRequirement {
  minPlayers?: number;
  maxPlayers?: number;
  allPlayersReady?: boolean;
  requiredData?: string[];
  customValidator?: (session: ManagedSession) => boolean;
}

export interface PhaseConfig {
  allowedTransitions: GamePhase[];
  requirements?: PhaseRequirement;
  timeoutSeconds?: number;
  onEnter?: (session: ManagedSession) => Promise<Record<string, any>>;
  onExit?: (session: ManagedSession) => Promise<void>;
}

export interface PhaseTimeout {
  sessionId: string;
  phase: GamePhase;
  expiresAt: number;
  timer: NodeJS.Timeout;
}

// ============================================
// Phase Configuration
// ============================================

const PHASE_CONFIG: Record<GamePhase, PhaseConfig> = {
  [GamePhase.LOBBY]: {
    allowedTransitions: [GamePhase.INTERROGATION],
    requirements: {
      minPlayers: 1,
      maxPlayers: 4,
      allPlayersReady: true
    },
    onEnter: async (session) => {
      // Reset all players' ready status when entering lobby
      for (const player of session.players.values()) {
        player.isReady = false;
      }
      return { enteredAt: Date.now() };
    }
  },

  [GamePhase.INTERROGATION]: {
    allowedTransitions: [GamePhase.EXPLORATION, GamePhase.LOBBY],
    timeoutSeconds: 600, // 10 minutes max
    onEnter: async (session) => {
      // Initialize interrogation state for all players
      const interrogationState: Record<string, any> = {
        startedAt: Date.now(),
        playerProgress: {}
      };

      for (const player of session.players.values()) {
        interrogationState.playerProgress[player.playerId] = {
          currentQuestion: 1,
          completed: false,
          answers: {}
        };
      }

      return interrogationState;
    },
    onExit: async (_session) => {
      // Calculate god favor results for each player
      gameLogger.info('Interrogation phase complete');
    }
  },

  [GamePhase.EXPLORATION]: {
    allowedTransitions: [GamePhase.BATTLE, GamePhase.SCENARIO, GamePhase.LOBBY],
    timeoutSeconds: 1800, // 30 minutes
    onEnter: async (_session) => {
      return {
        startedAt: Date.now(),
        currentLocation: 'starting_area',
        exploredLocations: [],
        discoveredItems: [],
        encountersTriggered: 0
      };
    }
  },

  [GamePhase.BATTLE]: {
    allowedTransitions: [GamePhase.EXPLORATION, GamePhase.SCENARIO, GamePhase.VICTORY],
    timeoutSeconds: 300, // 5 minutes per battle
    requirements: {
      requiredData: ['enemyId']
    },
    onEnter: async (session) => {
      return {
        startedAt: Date.now(),
        battleId: `battle_${Date.now()}`,
        currentTurnPlayerId: session.turnOrder[0],
        turnNumber: 1,
        enemyHealth: 100,
        enemyMaxHealth: 100,
        playerHealth: {},
        battleLog: []
      };
    }
  },

  [GamePhase.SCENARIO]: {
    allowedTransitions: [GamePhase.EXPLORATION, GamePhase.BATTLE, GamePhase.VICTORY],
    timeoutSeconds: 600, // 10 minutes
    onEnter: async (_session) => {
      return {
        startedAt: Date.now(),
        scenarioId: null,
        scenarioPhase: 0,
        playerChoices: {},
        cluesRevealed: [],
        consequencesApplied: false
      };
    }
  },

  [GamePhase.VICTORY]: {
    allowedTransitions: [GamePhase.LOBBY],
    onEnter: async (session) => {
      // Calculate final scores
      let totalScore = 0;
      const playerScores: Record<string, number> = {};

      for (const player of session.players.values()) {
        const playerScore = 100; // Base score
        playerScores[player.playerId] = playerScore;
        totalScore += playerScore;
      }

      return {
        completedAt: Date.now(),
        totalScore,
        playerScores,
        achievements: [],
        statistics: {
          totalTurns: session.turnNumber,
          phasesCompleted: Object.keys(session.phaseData).length
        }
      };
    }
  }
};

// ============================================
// Phase Manager
// ============================================

export class PhaseManager {
  private static instance: PhaseManager;
  private sessionManager: SessionManager;
  private activeTimeouts: Map<string, PhaseTimeout> = new Map();

  private constructor() {
    this.sessionManager = SessionManager.getInstance();
  }

  static getInstance(): PhaseManager {
    if (!PhaseManager.instance) {
      PhaseManager.instance = new PhaseManager();
    }
    return PhaseManager.instance;
  }

  // ============================================
  // Phase Transitions
  // ============================================

  /**
   * Attempt to transition to a new phase
   */
  async transitionTo(
    sessionId: string,
    targetPhase: GamePhase,
    additionalData?: Record<string, any>
  ): Promise<PhaseTransitionResult> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const currentPhase = session.currentPhase;
    const config = PHASE_CONFIG[currentPhase];

    // Check if transition is allowed
    if (!config.allowedTransitions.includes(targetPhase)) {
      return {
        success: false,
        error: `Cannot transition from ${currentPhase} to ${targetPhase}`,
        previousPhase: currentPhase
      };
    }

    // Check target phase requirements
    const targetConfig = PHASE_CONFIG[targetPhase];
    const requirementCheck = this.checkRequirements(session, targetConfig.requirements);
    if (!requirementCheck.met) {
      return {
        success: false,
        error: requirementCheck.reason,
        previousPhase: currentPhase
      };
    }

    try {
      // Execute onExit for current phase
      if (config.onExit) {
        await config.onExit(session);
      }

      // Cancel any existing timeout for this session
      this.cancelTimeout(sessionId);

      // Execute onEnter for target phase
      let phaseData = additionalData || {};
      if (targetConfig.onEnter) {
        const enterData = await targetConfig.onEnter(session);
        phaseData = { ...enterData, ...phaseData };
      }

      // Perform the transition
      const result = await this.sessionManager.transitionPhase(sessionId, targetPhase, phaseData);
      if (!result.success) {
        return {
          success: false,
          error: result.error,
          previousPhase: currentPhase
        };
      }

      // Set up phase timeout if configured
      if (targetConfig.timeoutSeconds) {
        this.setPhaseTimeout(sessionId, targetPhase, targetConfig.timeoutSeconds);
      }

      gameLogger.info({
        sessionId,
        from: currentPhase,
        to: targetPhase
      }, 'Phase transition successful');

      return {
        success: true,
        previousPhase: currentPhase,
        newPhase: targetPhase,
        phaseData
      };

    } catch (error: any) {
      gameLogger.error({ sessionId, error }, 'Phase transition failed');
      return {
        success: false,
        error: error.message,
        previousPhase: currentPhase
      };
    }
  }

  /**
   * Force transition (bypasses requirements - for admin/testing)
   */
  async forceTransition(
    sessionId: string,
    targetPhase: GamePhase,
    phaseData?: Record<string, any>
  ): Promise<PhaseTransitionResult> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const previousPhase = session.currentPhase;

    // Cancel any existing timeout
    this.cancelTimeout(sessionId);

    const result = await this.sessionManager.transitionPhase(sessionId, targetPhase, phaseData || {});
    if (!result.success) {
      return {
        success: false,
        error: result.error,
        previousPhase
      };
    }

    gameLogger.warn({
      sessionId,
      from: previousPhase,
      to: targetPhase
    }, 'Forced phase transition');

    return {
      success: true,
      previousPhase,
      newPhase: targetPhase,
      phaseData
    };
  }

  // ============================================
  // Requirement Checking
  // ============================================

  /**
   * Check if phase requirements are met
   */
  private checkRequirements(
    session: ManagedSession,
    requirements?: PhaseRequirement
  ): { met: boolean; reason?: string } {
    if (!requirements) {
      return { met: true };
    }

    const playerCount = session.players.size;

    if (requirements.minPlayers !== undefined && playerCount < requirements.minPlayers) {
      return {
        met: false,
        reason: `Minimum ${requirements.minPlayers} players required, currently ${playerCount}`
      };
    }

    if (requirements.maxPlayers !== undefined && playerCount > requirements.maxPlayers) {
      return {
        met: false,
        reason: `Maximum ${requirements.maxPlayers} players allowed, currently ${playerCount}`
      };
    }

    if (requirements.allPlayersReady) {
      for (const player of session.players.values()) {
        if (!player.isReady) {
          return {
            met: false,
            reason: `Player ${player.playerName} is not ready`
          };
        }
      }
    }

    if (requirements.requiredData) {
      for (const key of requirements.requiredData) {
        if (!(key in session.phaseData)) {
          return {
            met: false,
            reason: `Missing required data: ${key}`
          };
        }
      }
    }

    if (requirements.customValidator && !requirements.customValidator(session)) {
      return {
        met: false,
        reason: 'Custom requirement not met'
      };
    }

    return { met: true };
  }

  // ============================================
  // Phase Timeouts
  // ============================================

  /**
   * Set a timeout for a phase
   */
  private setPhaseTimeout(sessionId: string, phase: GamePhase, seconds: number): void {
    const expiresAt = Date.now() + seconds * 1000;

    const timer = setTimeout(async () => {
      await this.handlePhaseTimeout(sessionId, phase);
    }, seconds * 1000);

    this.activeTimeouts.set(sessionId, {
      sessionId,
      phase,
      expiresAt,
      timer
    });

    gameLogger.debug({
      sessionId,
      phase,
      timeoutSeconds: seconds
    }, 'Phase timeout set');
  }

  /**
   * Cancel a phase timeout
   */
  private cancelTimeout(sessionId: string): void {
    const timeout = this.activeTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout.timer);
      this.activeTimeouts.delete(sessionId);
      gameLogger.debug({ sessionId }, 'Phase timeout cancelled');
    }
  }

  /**
   * Handle phase timeout expiration
   */
  private async handlePhaseTimeout(sessionId: string, phase: GamePhase): Promise<void> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session || session.currentPhase !== phase) {
      // Session moved on already
      this.activeTimeouts.delete(sessionId);
      return;
    }

    gameLogger.warn({ sessionId, phase }, 'Phase timeout expired');

    // Default timeout behavior - return to exploration or lobby
    let fallbackPhase: GamePhase;
    switch (phase) {
      case GamePhase.BATTLE:
      case GamePhase.SCENARIO:
        fallbackPhase = GamePhase.EXPLORATION;
        break;
      case GamePhase.INTERROGATION:
      case GamePhase.EXPLORATION:
        fallbackPhase = GamePhase.LOBBY;
        break;
      default:
        fallbackPhase = GamePhase.LOBBY;
    }

    await this.transitionTo(sessionId, fallbackPhase, {
      reason: 'timeout',
      timedOutPhase: phase
    });
  }

  /**
   * Get remaining time for current phase
   */
  getRemainingTime(sessionId: string): number | null {
    const timeout = this.activeTimeouts.get(sessionId);
    if (!timeout) {
      return null;
    }
    return Math.max(0, timeout.expiresAt - Date.now());
  }

  /**
   * Extend phase timeout
   */
  extendTimeout(sessionId: string, additionalSeconds: number): boolean {
    const timeout = this.activeTimeouts.get(sessionId);
    if (!timeout) {
      return false;
    }

    // Cancel existing timer
    clearTimeout(timeout.timer);

    // Create new extended timeout
    const newExpiresAt = timeout.expiresAt + additionalSeconds * 1000;
    const remainingMs = newExpiresAt - Date.now();

    timeout.expiresAt = newExpiresAt;
    timeout.timer = setTimeout(async () => {
      await this.handlePhaseTimeout(sessionId, timeout.phase);
    }, remainingMs);

    gameLogger.info({
      sessionId,
      phase: timeout.phase,
      additionalSeconds
    }, 'Phase timeout extended');

    return true;
  }

  // ============================================
  // Phase Queries
  // ============================================

  /**
   * Get valid transitions for current phase
   */
  getValidTransitions(currentPhase: GamePhase): GamePhase[] {
    return PHASE_CONFIG[currentPhase].allowedTransitions;
  }

  /**
   * Check if a specific transition is allowed
   */
  canTransitionTo(currentPhase: GamePhase, targetPhase: GamePhase): boolean {
    return PHASE_CONFIG[currentPhase].allowedTransitions.includes(targetPhase);
  }

  /**
   * Get phase configuration
   */
  getPhaseConfig(phase: GamePhase): PhaseConfig {
    return PHASE_CONFIG[phase];
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Clean up all timeouts
   */
  cleanup(): void {
    for (const [_sessionId, timeout] of this.activeTimeouts) {
      clearTimeout(timeout.timer);
    }
    this.activeTimeouts.clear();
    gameLogger.info('PhaseManager cleanup complete');
  }
}

export default PhaseManager;
