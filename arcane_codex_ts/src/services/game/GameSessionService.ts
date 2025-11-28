/**
 * Game Session Service
 * Manages game sessions linking multiplayer parties to actual gameplay
 * Coordinates battle system, scenario progression, and session persistence
 */

import { v4 as uuidv4 } from 'uuid';
import { SessionRepository } from '../../database/repositories/session.repository';
import { BattleService } from '../battle';
import { BattleState, BattlePlayer, EnemyType } from '../../types/battle';
import { GamePhase } from '../../types/multiplayer';
import { gameLogger } from '../logger';

/**
 * Game session state in memory
 */
export interface GameSession {
  sessionId: string;
  partyCode: string;
  partyId?: string;
  players: Map<string, SessionPlayer>;
  currentPhase: GamePhase;
  battleState?: BattleState;
  scenarioState?: ScenarioSessionState;
  sessionData: Record<string, any>;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Player in a session
 */
export interface SessionPlayer {
  playerId: string;
  playerName: string;
  characterClass?: string;
  level: number;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  experience: number;
  gold: number;
  isReady: boolean;
  isAlive: boolean;
}

/**
 * Scenario session state
 */
export interface ScenarioSessionState {
  scenarioId: string;
  scenarioData: any;
  playerChoices: Map<string, string>; // playerId -> choiceId
  choicesLocked: boolean;
  startedAt: Date;
  completedAt?: Date;
}

/**
 * Service for managing game sessions
 */
export class GameSessionService {
  private static instance: GameSessionService;
  private sessionRepository: SessionRepository;
  private activeSessions: Map<string, GameSession> = new Map();
  private partyToSession: Map<string, string> = new Map(); // partyCode -> sessionId

  private constructor() {
    this.sessionRepository = new SessionRepository();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GameSessionService {
    if (!GameSessionService.instance) {
      GameSessionService.instance = new GameSessionService();
    }
    return GameSessionService.instance;
  }

  /**
   * Start a new game session for a party
   */
  public async startGameSession(
    partyCode: string,
    playerData: Array<{ playerId: string; playerName: string; characterClass?: string }>
  ): Promise<GameSession> {
    try {
      // Check if session already exists
      if (this.partyToSession.has(partyCode)) {
        const existingSessionId = this.partyToSession.get(partyCode)!;
        const existingSession = this.activeSessions.get(existingSessionId);
        if (existingSession) {
          gameLogger.info({ partyCode, sessionId: existingSessionId }, 'Session already exists for party');
          return existingSession;
        }
      }

      const sessionId = uuidv4();
      const players = new Map<string, SessionPlayer>();

      // Initialize players
      for (const player of playerData) {
        players.set(player.playerId, {
          playerId: player.playerId,
          playerName: player.playerName,
          characterClass: player.characterClass || 'WARRIOR',
          level: 1,
          hp: 100,
          maxHp: 100,
          mana: 50,
          maxMana: 50,
          experience: 0,
          gold: 0,
          isReady: false,
          isAlive: true
        });
      }

      // Create session
      const session: GameSession = {
        sessionId,
        partyCode,
        players,
        currentPhase: GamePhase.LOBBY,
        sessionData: {
          encountersCompleted: 0,
          scenariosCompleted: 0,
          battlesWon: 0,
          totalDamageDealt: 0,
          cluesFound: 0
        },
        createdAt: new Date(),
        lastActivity: new Date()
      };

      // Store in memory
      this.activeSessions.set(sessionId, session);
      this.partyToSession.set(partyCode, sessionId);

      // Persist to database
      await this.sessionRepository.createSession({
        party_id: partyCode,
        session_state: {
          players: Array.from(players.entries()).map(([id, p]) => ({ id, ...p })),
          sessionData: session.sessionData
        },
        current_phase: 'LOBBY'
      });

      gameLogger.info({ sessionId, partyCode, playerCount: players.size }, 'Game session started');
      return session;
    } catch (error: any) {
      gameLogger.error({ error, partyCode }, 'Failed to start game session');
      throw new Error(`Failed to start game session: ${error.message}`);
    }
  }

  /**
   * Get session by ID
   */
  public getSession(sessionId: string): GameSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get session by party code
   */
  public getSessionByPartyCode(partyCode: string): GameSession | null {
    const sessionId = this.partyToSession.get(partyCode);
    if (!sessionId) return null;
    return this.activeSessions.get(sessionId) || null;
  }

  /**
   * Get current session state
   */
  public getSessionState(sessionId: string): any {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    return {
      sessionId: session.sessionId,
      partyCode: session.partyCode,
      currentPhase: session.currentPhase,
      players: Array.from(session.players.values()),
      battleState: session.battleState,
      scenarioState: session.scenarioState,
      sessionData: session.sessionData,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity
    };
  }

  /**
   * Save session state to database
   */
  public async saveSessionState(sessionId: string, additionalData?: Record<string, any>): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      session.lastActivity = new Date();

      const dbSession = await this.sessionRepository.getLatestSessionForParty(session.partyCode);
      if (!dbSession) {
        gameLogger.warn({ sessionId }, 'No database session found for save');
        return;
      }

      const sessionState = {
        players: Array.from(session.players.entries()).map(([id, p]) => ({ id, ...p })),
        sessionData: { ...session.sessionData, ...additionalData },
        battleState: session.battleState,
        scenarioState: session.scenarioState
          ? {
              ...session.scenarioState,
              playerChoices: Array.from(session.scenarioState.playerChoices.entries())
            }
          : undefined
      };

      await this.sessionRepository.updateSession(dbSession.id, {
        session_state: sessionState,
        current_phase: session.currentPhase
      });

      gameLogger.debug({ sessionId }, 'Session state saved');
    } catch (error: any) {
      gameLogger.error({ error, sessionId }, 'Failed to save session state');
      throw error;
    }
  }

  /**
   * Start a battle in the session
   */
  public async startBattle(
    sessionId: string,
    enemyType: EnemyType = EnemyType.GOBLIN_SCOUT
  ): Promise<BattleState> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Use first player for battle (in multiplayer, this could be expanded)
      const firstPlayer = Array.from(session.players.values())[0];
      if (!firstPlayer) {
        throw new Error('No players in session');
      }

      const battlePlayerData: Partial<BattlePlayer> = {
        name: firstPlayer.playerName,
        class: firstPlayer.characterClass,
        hp: firstPlayer.hp,
        maxHp: firstPlayer.maxHp,
        currentHp: firstPlayer.hp,
        mana: firstPlayer.mana,
        maxMana: firstPlayer.maxMana,
        currentMana: firstPlayer.mana,
        level: firstPlayer.level,
        xp: firstPlayer.experience,
        gold: firstPlayer.gold
      };

      const battleState = BattleService.startBattle(
        firstPlayer.playerId,
        battlePlayerData,
        enemyType
      );

      session.battleState = battleState;
      session.currentPhase = GamePhase.BATTLE;

      await this.saveSessionState(sessionId);

      gameLogger.info({ sessionId, battleId: battleState.battleId, enemyType }, 'Battle started');
      return battleState;
    } catch (error: any) {
      gameLogger.error({ error, sessionId }, 'Failed to start battle');
      throw error;
    }
  }

  /**
   * Update player stats after battle
   */
  public async updatePlayerAfterBattle(
    sessionId: string,
    playerId: string,
    battleState: BattleState
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const player = session.players.get(playerId);
    if (!player) {
      throw new Error('Player not found in session');
    }

    // Update player state from battle
    player.hp = battleState.player.currentHp;
    player.mana = battleState.player.currentMana;

    if (battleState.isVictory) {
      player.experience += battleState.enemy.xp;
      player.gold += battleState.enemy.gold;
      session.sessionData.battlesWon = (session.sessionData.battlesWon || 0) + 1;
    }

    player.isAlive = player.hp > 0;

    await this.saveSessionState(sessionId);
    gameLogger.info({ sessionId, playerId, victory: battleState.isVictory }, 'Player updated after battle');
  }

  /**
   * Start a scenario in the session
   */
  public async startScenario(
    sessionId: string,
    scenarioId: string,
    scenarioData: any
  ): Promise<ScenarioSessionState> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const scenarioState: ScenarioSessionState = {
      scenarioId,
      scenarioData,
      playerChoices: new Map(),
      choicesLocked: false,
      startedAt: new Date()
    };

    session.scenarioState = scenarioState;
    session.currentPhase = GamePhase.SCENARIO;

    await this.saveSessionState(sessionId);

    gameLogger.info({ sessionId, scenarioId }, 'Scenario started');
    return scenarioState;
  }

  /**
   * Record a player's scenario choice
   */
  public async recordScenarioChoice(
    sessionId: string,
    playerId: string,
    choiceId: string
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.scenarioState) {
      throw new Error('No active scenario in session');
    }

    if (session.scenarioState.choicesLocked) {
      throw new Error('Choices are locked');
    }

    session.scenarioState.playerChoices.set(playerId, choiceId);

    await this.saveSessionState(sessionId);

    gameLogger.info({ sessionId, playerId, choiceId }, 'Scenario choice recorded');
  }

  /**
   * Complete the current scenario
   */
  public async completeScenario(sessionId: string): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session || !session.scenarioState) {
      throw new Error('No active scenario in session');
    }

    session.scenarioState.completedAt = new Date();
    session.scenarioState.choicesLocked = true;
    session.sessionData.scenariosCompleted = (session.sessionData.scenariosCompleted || 0) + 1;

    await this.saveSessionState(sessionId);

    gameLogger.info({ sessionId, scenarioId: session.scenarioState.scenarioId }, 'Scenario completed');
  }

  /**
   * Transition session to a new phase
   */
  public async transitionPhase(sessionId: string, newPhase: GamePhase): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const oldPhase = session.currentPhase;
    session.currentPhase = newPhase;

    await this.saveSessionState(sessionId);

    gameLogger.info({ sessionId, oldPhase, newPhase }, 'Session phase transitioned');
  }

  /**
   * End the game session
   */
  public async endGameSession(
    sessionId: string,
    outcome: 'victory' | 'defeat' | 'abandoned',
    finalScore?: number
  ): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      // Calculate final score if not provided
      if (!finalScore) {
        finalScore = this.calculateFinalScore(session);
      }

      // Get database session
      const dbSession = await this.sessionRepository.getLatestSessionForParty(session.partyCode);
      if (dbSession) {
        await this.sessionRepository.completeSession(dbSession.id, outcome, finalScore);
      }

      // Clean up memory
      this.activeSessions.delete(sessionId);
      this.partyToSession.delete(session.partyCode);

      gameLogger.info({ sessionId, outcome, finalScore }, 'Game session ended');
    } catch (error: any) {
      gameLogger.error({ error, sessionId }, 'Failed to end game session');
      throw error;
    }
  }

  /**
   * Calculate final score for a session
   */
  private calculateFinalScore(session: GameSession): number {
    let score = 0;

    score += (session.sessionData.battlesWon || 0) * 100;
    score += (session.sessionData.scenariosCompleted || 0) * 50;
    score += (session.sessionData.cluesFound || 0) * 25;

    // Bonus for all players surviving
    const allAlive = Array.from(session.players.values()).every(p => p.isAlive);
    if (allAlive) {
      score += 200;
    }

    return score;
  }

  /**
   * Get all active sessions
   */
  public getActiveSessions(): GameSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Clean up inactive sessions
   */
  public async cleanupInactiveSessions(maxInactiveMinutes: number = 120): Promise<number> {
    const now = new Date();
    const maxAge = maxInactiveMinutes * 60 * 1000;
    let cleanedCount = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const inactiveTime = now.getTime() - session.lastActivity.getTime();

      if (inactiveTime > maxAge) {
        await this.endGameSession(sessionId, 'abandoned');
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      gameLogger.info({ cleanedCount }, 'Inactive sessions cleaned up');
    }

    return cleanedCount;
  }

  /**
   * Restore active sessions from database on startup
   */
  public async restoreActiveSessions(): Promise<number> {
    try {
      const restorableSessions = await this.sessionRepository.getRestorableSessions(24);
      let restoredCount = 0;

      for (const dbSession of restorableSessions) {
        try {
          const sessionState = dbSession.session_state as any;
          const players = new Map<string, SessionPlayer>();

          // Restore players
          if (Array.isArray(sessionState.players)) {
            for (const playerData of sessionState.players) {
              players.set(playerData.id || playerData.playerId, {
                playerId: playerData.id || playerData.playerId,
                playerName: playerData.playerName,
                characterClass: playerData.characterClass,
                level: playerData.level || 1,
                hp: playerData.hp || 100,
                maxHp: playerData.maxHp || 100,
                mana: playerData.mana || 50,
                maxMana: playerData.maxMana || 50,
                experience: playerData.experience || 0,
                gold: playerData.gold || 0,
                isReady: false,
                isAlive: playerData.isAlive !== false
              });
            }
          }

          const session: GameSession = {
            sessionId: dbSession.id,
            partyCode: dbSession.party_id,
            players,
            currentPhase: dbSession.current_phase as GamePhase,
            sessionData: sessionState.sessionData || {},
            createdAt: new Date(dbSession.created_at),
            lastActivity: new Date(dbSession.updated_at)
          };

          // Restore scenario state if exists
          if (sessionState.scenarioState) {
            session.scenarioState = {
              scenarioId: sessionState.scenarioState.scenarioId,
              scenarioData: sessionState.scenarioState.scenarioData,
              playerChoices: new Map(sessionState.scenarioState.playerChoices || []),
              choicesLocked: sessionState.scenarioState.choicesLocked || false,
              startedAt: new Date(sessionState.scenarioState.startedAt),
              completedAt: sessionState.scenarioState.completedAt
                ? new Date(sessionState.scenarioState.completedAt)
                : undefined
            };
          }

          this.activeSessions.set(session.sessionId, session);
          this.partyToSession.set(session.partyCode, session.sessionId);
          restoredCount++;
        } catch (error: any) {
          gameLogger.error({ error, sessionId: dbSession.id }, 'Failed to restore session');
        }
      }

      gameLogger.info({ restoredCount }, 'Active sessions restored from database');
      return restoredCount;
    } catch (error: any) {
      gameLogger.error({ error }, 'Failed to restore active sessions');
      return 0;
    }
  }
}

export default GameSessionService;
