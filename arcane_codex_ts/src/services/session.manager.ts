/**
 * Session Manager Service
 * Bridges in-memory game state with database persistence
 * Provides unified API for game session lifecycle management
 */

import { SessionRepository } from '../database/repositories/session.repository';
import { PartyRepository } from '../database/repositories/party.repository';
import { GameSessionModel, CreateGameSessionDTO } from '../database/models/session.model';
import { GamePhase } from '../types/multiplayer';
import { gameLogger } from './logger';

// ============================================
// Types
// ============================================

export interface SessionPlayer {
  playerId: string;
  playerName: string;
  characterClass?: string;
  godFavor?: Record<string, number>;
  isReady: boolean;
  isConnected: boolean;
  socketId?: string;
  answers?: Record<number, string>;
  currentQuestion?: number;
}

export interface ManagedSession {
  id: string;
  partyId: string;
  partyCode: string;
  hostPlayerId: string;
  currentPhase: GamePhase;
  players: Map<string, SessionPlayer>;
  turnOrder: string[];
  currentTurnIndex: number;
  turnNumber: number;
  phaseData: Record<string, any>;
  sharedState: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export interface CreateSessionOptions {
  partyCode: string;
  hostPlayerId: string;
  hostPlayerName: string;
  maxPlayers?: number;
  settings?: Record<string, any>;
}

export interface SessionStateSnapshot {
  players: Array<{
    playerId: string;
    playerName: string;
    characterClass?: string;
    godFavor?: Record<string, number>;
    isReady: boolean;
    isConnected?: boolean;
  }>;
  turnOrder: string[];
  currentTurnIndex: number;
  turnNumber: number;
  phaseData: Record<string, any>;
  sharedState: Record<string, any>;
}

// ============================================
// Session Manager
// ============================================

export class SessionManager {
  private static instance: SessionManager;

  private sessionRepository: SessionRepository;
  private partyRepository: PartyRepository;

  // In-memory cache for active sessions
  private activeSessions: Map<string, ManagedSession> = new Map();
  private partyCodeToSessionId: Map<string, string> = new Map();

  // Auto-save interval (5 seconds)
  private saveInterval: NodeJS.Timeout | null = null;
  private readonly SAVE_INTERVAL_MS = 5000;

  // Dirty tracking for efficient saves
  private dirtySessions: Set<string> = new Set();

  private constructor() {
    this.sessionRepository = new SessionRepository();
    this.partyRepository = new PartyRepository();
    this.startAutoSave();
  }

  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  // ============================================
  // Session Lifecycle
  // ============================================

  /**
   * Create a new game session
   */
  async createSession(options: CreateSessionOptions): Promise<ManagedSession> {
    const { partyCode, hostPlayerId, hostPlayerName, maxPlayers = 4, settings = {} } = options;

    // Create party in database
    const party = await this.partyRepository.createParty({
      code: partyCode,
      host_player_id: hostPlayerId,
      name: `Game ${partyCode}`,
      max_players: maxPlayers,
      is_public: true,
      settings
    });

    // Add host as party member
    await this.partyRepository.addMember({
      party_id: party.id,
      player_id: hostPlayerId,
      role: 'host'
    });

    // Create initial session state
    const initialState: SessionStateSnapshot = {
      players: [{
        playerId: hostPlayerId,
        playerName: hostPlayerName,
        isReady: false,
        isConnected: true
      }],
      turnOrder: [hostPlayerId],
      currentTurnIndex: 0,
      turnNumber: 1,
      phaseData: {},
      sharedState: {}
    };

    // Create database session
    const createDTO: CreateGameSessionDTO = {
      party_id: party.id,
      session_state: initialState,
      current_phase: 'LOBBY',
      phase_data: {}
    };

    const dbSession = await this.sessionRepository.createSession(createDTO);

    // Create in-memory session
    const managedSession: ManagedSession = {
      id: dbSession.id,
      partyId: party.id,
      partyCode: partyCode,
      hostPlayerId,
      currentPhase: GamePhase.LOBBY,
      players: new Map([[hostPlayerId, {
        playerId: hostPlayerId,
        playerName: hostPlayerName,
        isReady: false,
        isConnected: true
      }]]),
      turnOrder: [hostPlayerId],
      currentTurnIndex: 0,
      turnNumber: 1,
      phaseData: {},
      sharedState: {},
      createdAt: dbSession.created_at,
      updatedAt: dbSession.updated_at,
      version: 1
    };

    // Cache the session
    this.activeSessions.set(dbSession.id, managedSession);
    this.partyCodeToSessionId.set(partyCode.toUpperCase(), dbSession.id);

    gameLogger.info({ sessionId: dbSession.id, partyCode, hostPlayerId }, 'Session created');
    return managedSession;
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<ManagedSession | null> {
    // Check cache first
    if (this.activeSessions.has(sessionId)) {
      return this.activeSessions.get(sessionId)!;
    }

    // Load from database
    const dbSession = await this.sessionRepository.getSessionById(sessionId);
    if (!dbSession) {
      return null;
    }

    // Get party info
    const party = await this.partyRepository.getPartyById(dbSession.party_id);
    if (!party) {
      return null;
    }

    // Reconstruct managed session
    const managedSession = this.reconstructSession(dbSession, party.code, party.host_player_id);
    this.activeSessions.set(sessionId, managedSession);
    this.partyCodeToSessionId.set(party.code.toUpperCase(), sessionId);

    return managedSession;
  }

  /**
   * Get session by party code
   */
  async getSessionByCode(partyCode: string): Promise<ManagedSession | null> {
    const normalizedCode = partyCode.toUpperCase();

    // Check cache
    const cachedSessionId = this.partyCodeToSessionId.get(normalizedCode);
    if (cachedSessionId) {
      return this.activeSessions.get(cachedSessionId) || null;
    }

    // Look up party in database
    const party = await this.partyRepository.getPartyByCode(normalizedCode);
    if (!party) {
      return null;
    }

    // Get latest session for this party
    const dbSession = await this.sessionRepository.getLatestSessionForParty(party.id);
    if (!dbSession) {
      return null;
    }

    // Reconstruct and cache
    const managedSession = this.reconstructSession(dbSession, party.code, party.host_player_id);
    this.activeSessions.set(dbSession.id, managedSession);
    this.partyCodeToSessionId.set(normalizedCode, dbSession.id);

    return managedSession;
  }

  // ============================================
  // Player Management
  // ============================================

  /**
   * Add a player to a session
   */
  async addPlayer(
    sessionId: string,
    playerId: string,
    playerName: string
  ): Promise<{ success: boolean; error?: string }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    if (session.currentPhase !== GamePhase.LOBBY) {
      return { success: false, error: 'Cannot join - game already started' };
    }

    if (session.players.size >= 4) {
      return { success: false, error: 'Session is full' };
    }

    // Check if already in session
    if (session.players.has(playerId)) {
      return { success: true }; // Idempotent - already joined
    }

    // Add to database
    await this.partyRepository.addMember({
      party_id: session.partyId,
      player_id: playerId,
      role: 'player'
    });

    // Add to in-memory session
    session.players.set(playerId, {
      playerId,
      playerName,
      isReady: false,
      isConnected: true
    });
    session.turnOrder.push(playerId);
    session.version++;

    this.markDirty(sessionId);
    gameLogger.info({ sessionId, playerId, playerName }, 'Player joined session');

    return { success: true };
  }

  /**
   * Remove a player from a session
   */
  async removePlayer(sessionId: string, playerId: string): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    if (!session.players.has(playerId)) {
      return false;
    }

    // Remove from database
    await this.partyRepository.removeMember(session.partyId, playerId);

    // Remove from in-memory
    session.players.delete(playerId);
    session.turnOrder = session.turnOrder.filter(id => id !== playerId);

    // Adjust current turn index if needed
    if (session.currentTurnIndex >= session.turnOrder.length) {
      session.currentTurnIndex = 0;
    }

    session.version++;
    this.markDirty(sessionId);

    gameLogger.info({ sessionId, playerId }, 'Player removed from session');
    return true;
  }

  /**
   * Update player data
   */
  async updatePlayer(
    sessionId: string,
    playerId: string,
    updates: Partial<SessionPlayer>
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    const player = session.players.get(playerId);
    if (!player) {
      return false;
    }

    // Apply updates
    Object.assign(player, updates);
    session.version++;
    this.markDirty(sessionId);

    return true;
  }

  /**
   * Set player ready status
   */
  async setPlayerReady(sessionId: string, playerId: string, isReady: boolean): Promise<boolean> {
    return this.updatePlayer(sessionId, playerId, { isReady });
  }

  /**
   * Check if all players are ready
   */
  areAllPlayersReady(session: ManagedSession): boolean {
    if (session.players.size === 0) return false;

    for (const player of session.players.values()) {
      if (!player.isReady) return false;
    }
    return true;
  }

  // ============================================
  // Phase Management
  // ============================================

  /**
   * Transition to a new phase
   */
  async transitionPhase(
    sessionId: string,
    newPhase: GamePhase,
    phaseData?: Record<string, any>
  ): Promise<{ success: boolean; error?: string }> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    // Validate phase transition
    if (!this.isValidPhaseTransition(session.currentPhase, newPhase)) {
      return {
        success: false,
        error: `Invalid phase transition: ${session.currentPhase} -> ${newPhase}`
      };
    }

    // Update session
    session.currentPhase = newPhase;
    session.phaseData = phaseData || {};
    session.version++;

    // Update database
    await this.sessionRepository.updateSession(sessionId, {
      current_phase: newPhase,
      phase_data: phaseData
    });

    this.markDirty(sessionId);
    gameLogger.info({ sessionId, from: session.currentPhase, to: newPhase }, 'Phase transition');

    return { success: true };
  }

  /**
   * Validate phase transition
   */
  private isValidPhaseTransition(from: GamePhase, to: GamePhase): boolean {
    const validTransitions: Record<GamePhase, GamePhase[]> = {
      [GamePhase.LOBBY]: [GamePhase.INTERROGATION],
      [GamePhase.INTERROGATION]: [GamePhase.EXPLORATION, GamePhase.LOBBY],
      [GamePhase.EXPLORATION]: [GamePhase.BATTLE, GamePhase.SCENARIO, GamePhase.LOBBY],
      [GamePhase.BATTLE]: [GamePhase.EXPLORATION, GamePhase.SCENARIO, GamePhase.VICTORY],
      [GamePhase.SCENARIO]: [GamePhase.EXPLORATION, GamePhase.BATTLE, GamePhase.VICTORY],
      [GamePhase.VICTORY]: [GamePhase.LOBBY]
    };

    return validTransitions[from]?.includes(to) || false;
  }

  // ============================================
  // Turn Management
  // ============================================

  /**
   * Advance to the next turn
   */
  async advanceTurn(sessionId: string): Promise<{ playerId: string; turnNumber: number } | null> {
    const session = await this.getSession(sessionId);
    if (!session || session.turnOrder.length === 0) {
      return null;
    }

    // Move to next player
    session.currentTurnIndex = (session.currentTurnIndex + 1) % session.turnOrder.length;

    // If we've cycled through all players, increment turn number
    if (session.currentTurnIndex === 0) {
      session.turnNumber++;
    }

    session.version++;
    this.markDirty(sessionId);

    const currentPlayerId = session.turnOrder[session.currentTurnIndex];
    return { playerId: currentPlayerId, turnNumber: session.turnNumber };
  }

  /**
   * Get current turn info
   */
  getCurrentTurn(session: ManagedSession): { playerId: string; turnNumber: number } | null {
    if (session.turnOrder.length === 0) {
      return null;
    }

    return {
      playerId: session.turnOrder[session.currentTurnIndex],
      turnNumber: session.turnNumber
    };
  }

  /**
   * Shuffle turn order (for new phase)
   */
  async shuffleTurnOrder(sessionId: string): Promise<string[]> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return [];
    }

    // Fisher-Yates shuffle
    const order = [...session.turnOrder];
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }

    session.turnOrder = order;
    session.currentTurnIndex = 0;
    session.version++;
    this.markDirty(sessionId);

    return order;
  }

  // ============================================
  // State Management
  // ============================================

  /**
   * Update shared state
   */
  async updateSharedState(
    sessionId: string,
    updates: Record<string, any>
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    Object.assign(session.sharedState, updates);
    session.version++;
    this.markDirty(sessionId);

    return true;
  }

  /**
   * Get session state snapshot for sync
   */
  getStateSnapshot(session: ManagedSession): SessionStateSnapshot {
    return {
      players: Array.from(session.players.values()).map(p => ({
        playerId: p.playerId,
        playerName: p.playerName,
        characterClass: p.characterClass,
        godFavor: p.godFavor,
        isReady: p.isReady
      })),
      turnOrder: session.turnOrder,
      currentTurnIndex: session.currentTurnIndex,
      turnNumber: session.turnNumber,
      phaseData: session.phaseData,
      sharedState: session.sharedState
    };
  }

  // ============================================
  // Session Completion
  // ============================================

  /**
   * Complete a session
   */
  async completeSession(
    sessionId: string,
    outcome: 'victory' | 'defeat' | 'abandoned',
    finalScore?: number
  ): Promise<boolean> {
    const session = await this.getSession(sessionId);
    if (!session) {
      return false;
    }

    // Update database
    await this.sessionRepository.completeSession(sessionId, outcome, finalScore);

    // Update party status
    await this.partyRepository.updateParty(session.partyId, {
      status: 'completed'
    });

    // Remove from active cache
    this.activeSessions.delete(sessionId);
    this.partyCodeToSessionId.delete(session.partyCode.toUpperCase());
    this.dirtySessions.delete(sessionId);

    gameLogger.info({ sessionId, outcome, finalScore }, 'Session completed');
    return true;
  }

  // ============================================
  // Persistence
  // ============================================

  /**
   * Mark a session as needing to be saved
   */
  private markDirty(sessionId: string): void {
    this.dirtySessions.add(sessionId);
  }

  /**
   * Save all dirty sessions to database
   */
  async saveAllDirty(): Promise<void> {
    for (const sessionId of this.dirtySessions) {
      await this.saveSession(sessionId);
    }
    this.dirtySessions.clear();
  }

  /**
   * Save a specific session to database
   */
  async saveSession(sessionId: string): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      return false;
    }

    const snapshot = this.getStateSnapshot(session);

    await this.sessionRepository.saveSessionState(
      sessionId,
      snapshot,
      session.currentPhase
    );

    session.updatedAt = new Date();
    this.dirtySessions.delete(sessionId);

    return true;
  }

  /**
   * Force save a session immediately
   */
  async forceSave(sessionId: string): Promise<boolean> {
    return this.saveSession(sessionId);
  }

  /**
   * Start auto-save interval
   */
  private startAutoSave(): void {
    if (this.saveInterval) {
      return;
    }

    this.saveInterval = setInterval(async () => {
      if (this.dirtySessions.size > 0) {
        await this.saveAllDirty();
      }
    }, this.SAVE_INTERVAL_MS);
  }

  /**
   * Stop auto-save and save all pending
   */
  async shutdown(): Promise<void> {
    if (this.saveInterval) {
      clearInterval(this.saveInterval);
      this.saveInterval = null;
    }

    await this.saveAllDirty();
    gameLogger.info('SessionManager shutdown complete');
  }

  // ============================================
  // Helpers
  // ============================================

  /**
   * Reconstruct a managed session from database model
   */
  private reconstructSession(
    dbSession: GameSessionModel,
    partyCode: string,
    hostPlayerId: string
  ): ManagedSession {
    const state = dbSession.session_state as SessionStateSnapshot;

    const players = new Map<string, SessionPlayer>();
    for (const p of state.players || []) {
      players.set(p.playerId, {
        playerId: p.playerId,
        playerName: p.playerName,
        characterClass: p.characterClass,
        godFavor: p.godFavor,
        isReady: p.isReady,
        isConnected: p.isConnected ?? true // Default to true when reconstructing
      });
    }

    return {
      id: dbSession.id,
      partyId: dbSession.party_id,
      partyCode,
      hostPlayerId,
      currentPhase: dbSession.current_phase as GamePhase,
      players,
      turnOrder: state.turnOrder || [],
      currentTurnIndex: state.currentTurnIndex || 0,
      turnNumber: state.turnNumber || 1,
      phaseData: dbSession.phase_data || {},
      sharedState: state.sharedState || {},
      createdAt: dbSession.created_at,
      updatedAt: dbSession.updated_at,
      version: 1
    };
  }

  /**
   * Generate a unique party code
   */
  static generatePartyCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Get session statistics
   */
  async getStats(): Promise<{
    activeSessions: number;
    cachedSessions: number;
    dirtySessions: number;
  }> {
    const dbStats = await this.sessionRepository.getSessionStats();
    return {
      activeSessions: dbStats.active_sessions,
      cachedSessions: this.activeSessions.size,
      dirtySessions: this.dirtySessions.size
    };
  }
}

export default SessionManager;
