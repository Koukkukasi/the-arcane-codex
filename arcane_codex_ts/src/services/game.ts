import { GameSession, PlayerSessionData, God } from '../types/game';
import { getMockInterrogationQuestion } from '../data/questions';
import { gameLogger } from './logger';
import { SessionManager, ManagedSession, SessionPlayer } from './session.manager';
import { GamePhase } from '../types/multiplayer';

// In-memory game storage for legacy compatibility (will be deprecated)
const gameSessions = new Map<string, GameSession>();
const playerSessions = new Map<string, PlayerSessionData>();

/**
 * Game service class for managing game sessions and player data
 * Now integrates with SessionManager for database persistence
 */
export class GameService {
  private static sessionManager = SessionManager.getInstance();

  /**
   * Generate a unique game code
   */
  static generateGameCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Create a new game session (uses SessionManager for persistence)
   */
  static async createGameAsync(playerId: string, playerName: string): Promise<{ gameCode: string; session: ManagedSession }> {
    let gameCode = this.generateGameCode();

    // Ensure unique game code
    let existing = await this.sessionManager.getSessionByCode(gameCode);
    while (existing) {
      gameCode = this.generateGameCode();
      existing = await this.sessionManager.getSessionByCode(gameCode);
    }

    // Create session with database persistence
    const session = await this.sessionManager.createSession({
      partyCode: gameCode,
      hostPlayerId: playerId,
      hostPlayerName: playerName,
      maxPlayers: 4
    });

    gameLogger.info({ gameCode, playerName, sessionId: session.id }, 'Game created with persistence');
    return { gameCode, session };
  }

  /**
   * Create a new game session (legacy in-memory only)
   */
  static createGame(playerId: string, playerName: string): { gameCode: string; session: GameSession } {
    let gameCode = this.generateGameCode();

    // Ensure unique game code
    while (gameSessions.has(gameCode)) {
      gameCode = this.generateGameCode();
    }

    const session: GameSession = {
      code: gameCode,
      players: new Map([[playerId, playerName]]),
      player_classes: new Map(),
      max_players: 4,
      game_started: false,
      interrogation_complete: new Set(),
      scenario_history: []
    };

    gameSessions.set(gameCode, session);

    // Create player session
    const playerSession: PlayerSessionData = {
      game_code: gameCode,
      player_id: playerId,
      player_name: playerName,
      god_favor: this.initializeGodFavor()
    };
    playerSessions.set(playerId, playerSession);

    gameLogger.info({ gameCode, playerName }, 'Game created');
    return { gameCode, session };
  }

  /**
   * Join an existing game (uses SessionManager for persistence)
   */
  static async joinGameAsync(
    gameCode: string,
    playerId: string,
    playerName: string
  ): Promise<{ success: boolean; error?: string; rejoined?: boolean; session?: ManagedSession }> {
    const session = await this.sessionManager.getSessionByCode(gameCode);

    if (!session) {
      return { success: false, error: 'Game not found' };
    }

    // Check if game has started
    if (session.currentPhase !== GamePhase.LOBBY) {
      return { success: false, error: 'Game already started' };
    }

    // Check if player is already in game
    if (session.players.has(playerId)) {
      gameLogger.info({ playerName, gameCode }, 'Player rejoined game');
      return { success: true, rejoined: true, session };
    }

    // Check max players
    if (session.players.size >= 4) {
      return { success: false, error: 'Game is full' };
    }

    // Add player to session
    const result = await this.sessionManager.addPlayer(session.id, playerId, playerName);
    if (!result.success) {
      return { success: false, error: result.error };
    }

    gameLogger.info({ playerName, gameCode, sessionId: session.id }, 'Player joined game with persistence');
    return { success: true, session };
  }

  /**
   * Join an existing game (legacy in-memory only)
   */
  static joinGame(gameCode: string, playerId: string, playerName: string): { success: boolean; error?: string; rejoined?: boolean } {
    const session = gameSessions.get(gameCode.toUpperCase());

    if (!session) {
      return { success: false, error: 'Game not found' };
    }

    if (session.game_started) {
      return { success: false, error: 'Game already started' };
    }

    if (session.players.size >= session.max_players) {
      return { success: false, error: 'Game is full' };
    }

    // Check if player is already in game (idempotent - just return success)
    if (session.players.has(playerId)) {
      gameLogger.info({ playerName, gameCode }, 'Player rejoined game');
      return { success: true, rejoined: true };
    }

    // Add player to game
    session.players.set(playerId, playerName);

    // Create player session
    const playerSession: PlayerSessionData = {
      game_code: gameCode,
      player_id: playerId,
      player_name: playerName,
      god_favor: this.initializeGodFavor()
    };
    playerSessions.set(playerId, playerSession);

    gameLogger.info({ playerName, gameCode }, 'Player joined game');
    return { success: true };
  }

  /**
   * Get game session (with SessionManager fallback)
   */
  static async getGameSessionAsync(gameCode: string): Promise<ManagedSession | null> {
    return this.sessionManager.getSessionByCode(gameCode);
  }

  /**
   * Get game session (legacy in-memory)
   */
  static getGameSession(gameCode: string): GameSession | undefined {
    return gameSessions.get(gameCode.toUpperCase());
  }

  /**
   * Get player session (legacy in-memory)
   */
  static getPlayerSession(playerId: string): PlayerSessionData | undefined {
    return playerSessions.get(playerId);
  }

  /**
   * Get player from managed session
   */
  static async getPlayerAsync(gameCode: string, playerId: string): Promise<SessionPlayer | null> {
    const session = await this.sessionManager.getSessionByCode(gameCode);
    if (!session) {
      return null;
    }
    return session.players.get(playerId) || null;
  }

  /**
   * Start interrogation for a player (uses SessionManager)
   */
  static async startInterrogationAsync(
    sessionId: string,
    playerId: string
  ): Promise<{ success: boolean; question?: any; error?: string }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const player = session.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found in session' };
    }

    // Initialize interrogation data for player
    player.currentQuestion = 1;
    player.answers = {};
    player.godFavor = this.initializeGodFavor();

    // Get first question
    const question = getMockInterrogationQuestion(1);

    gameLogger.info({ sessionId, playerId }, 'Interrogation started');
    return { success: true, question };
  }

  /**
   * Start interrogation for a player (legacy)
   */
  static startInterrogation(playerId: string): { success: boolean; question?: any; error?: string } {
    const playerSession = playerSessions.get(playerId);

    if (!playerSession) {
      return { success: false, error: 'Player session not found' };
    }

    // Initialize interrogation
    playerSession.current_question = 1;
    playerSession.answers = {};

    // Get first question
    const question = getMockInterrogationQuestion(1);

    gameLogger.info({ playerId }, 'Interrogation started');
    return { success: true, question };
  }

  /**
   * Answer an interrogation question (uses SessionManager)
   */
  static async answerQuestionAsync(
    sessionId: string,
    playerId: string,
    questionNumber: number,
    answerId: string
  ): Promise<{ success: boolean; nextQuestion?: any; completed?: boolean; error?: string }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const player = session.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found in session' };
    }

    if (!player.currentQuestion || player.currentQuestion !== questionNumber) {
      return { success: false, error: 'Invalid question number' };
    }

    // Get the current question to calculate favor
    const currentQuestion = getMockInterrogationQuestion(questionNumber);
    const selectedOption = currentQuestion.options.find(opt => opt.id === answerId);

    if (!selectedOption) {
      return { success: false, error: 'Invalid answer' };
    }

    // Store answer
    if (!player.answers) {
      player.answers = {};
    }
    player.answers[questionNumber] = answerId;

    // Update god favor
    if (!player.godFavor) {
      player.godFavor = this.initializeGodFavor();
    }

    for (const [god, favorChange] of Object.entries(selectedOption.favor)) {
      player.godFavor[god] = (player.godFavor[god] || 0) + favorChange;
    }

    // Check if interrogation is complete (10 questions for now)
    const totalQuestions = 10;
    if (questionNumber >= totalQuestions) {
      // Mark player as ready after completing interrogation
      player.isReady = true;

      gameLogger.info({ sessionId, playerId }, 'Interrogation completed');
      return {
        success: true,
        completed: true
      };
    }

    // Get next question
    player.currentQuestion = questionNumber + 1;
    const nextQuestion = getMockInterrogationQuestion(player.currentQuestion);

    return {
      success: true,
      nextQuestion,
      completed: false
    };
  }

  /**
   * Answer an interrogation question (legacy)
   */
  static answerQuestion(
    playerId: string,
    questionNumber: number,
    answerId: string
  ): { success: boolean; nextQuestion?: any; completed?: boolean; error?: string } {
    const playerSession = playerSessions.get(playerId);

    if (!playerSession) {
      return { success: false, error: 'Player session not found' };
    }

    if (!playerSession.current_question || playerSession.current_question !== questionNumber) {
      return { success: false, error: 'Invalid question number' };
    }

    // Get the current question to calculate favor
    const currentQuestion = getMockInterrogationQuestion(questionNumber);
    const selectedOption = currentQuestion.options.find(opt => opt.id === answerId);

    if (!selectedOption) {
      return { success: false, error: 'Invalid answer' };
    }

    // Store answer
    if (!playerSession.answers) {
      playerSession.answers = {};
    }
    playerSession.answers[questionNumber] = answerId;

    // Update god favor
    if (!playerSession.god_favor) {
      playerSession.god_favor = this.initializeGodFavor();
    }

    for (const [god, favorChange] of Object.entries(selectedOption.favor)) {
      playerSession.god_favor[god] = (playerSession.god_favor[god] || 0) + favorChange;
    }

    // Check if interrogation is complete (10 questions for now, can be configured)
    const totalQuestions = 10;
    if (questionNumber >= totalQuestions) {
      // Mark interrogation as complete
      if (playerSession.game_code) {
        const gameSession = gameSessions.get(playerSession.game_code);
        if (gameSession) {
          gameSession.interrogation_complete.add(playerId);
        }
      }

      gameLogger.info({ playerId }, 'Interrogation completed');
      return {
        success: true,
        completed: true
      };
    }

    // Get next question
    playerSession.current_question = questionNumber + 1;
    const nextQuestion = getMockInterrogationQuestion(playerSession.current_question);

    return {
      success: true,
      nextQuestion,
      completed: false
    };
  }

  /**
   * Get interrogation results (uses SessionManager)
   */
  static async getInterrogationResultsAsync(
    sessionId: string,
    playerId: string
  ): Promise<{ success: boolean; results?: any; error?: string }> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const player = session.players.get(playerId);
    if (!player) {
      return { success: false, error: 'Player not found' };
    }

    if (!player.godFavor) {
      return { success: false, error: 'No interrogation data found' };
    }

    // Find patron god (highest favor)
    let patronGod = '';
    let highestFavor = -Infinity;

    for (const [god, favor] of Object.entries(player.godFavor)) {
      if (favor > highestFavor) {
        highestFavor = favor;
        patronGod = god;
      }
    }

    return {
      success: true,
      results: {
        patron_god: patronGod,
        god_favor: player.godFavor,
        answers: player.answers,
        player_name: player.playerName
      }
    };
  }

  /**
   * Get interrogation results (legacy)
   */
  static getInterrogationResults(playerId: string): { success: boolean; results?: any; error?: string } {
    const playerSession = playerSessions.get(playerId);

    if (!playerSession) {
      return { success: false, error: 'Player session not found' };
    }

    if (!playerSession.god_favor) {
      return { success: false, error: 'No interrogation data found' };
    }

    // Find patron god (highest favor)
    let patronGod = '';
    let highestFavor = -Infinity;

    for (const [god, favor] of Object.entries(playerSession.god_favor)) {
      if (favor > highestFavor) {
        highestFavor = favor;
        patronGod = god;
      }
    }

    return {
      success: true,
      results: {
        patron_god: patronGod,
        god_favor: playerSession.god_favor,
        answers: playerSession.answers,
        player_name: playerSession.player_name
      }
    };
  }

  /**
   * Initialize god favor scores
   */
  private static initializeGodFavor(): Record<string, number> {
    return {
      [God.VALDRIS]: 0,
      [God.KAITHA]: 0,
      [God.MORVANE]: 0,
      [God.SYLARA]: 0,
      [God.KORVAN]: 0,
      [God.ATHENA]: 0,
      [God.MERCUS]: 0
    };
  }

  /**
   * Get all players in a game (uses SessionManager)
   */
  static async getGamePlayersAsync(gameCode: string): Promise<Array<{ id: string; name: string; class?: string; isReady: boolean }>> {
    const session = await this.sessionManager.getSessionByCode(gameCode);
    if (!session) {
      return [];
    }

    const players = [];
    for (const [playerId, player] of session.players) {
      players.push({
        id: playerId,
        name: player.playerName,
        class: player.characterClass,
        isReady: player.isReady
      });
    }
    return players;
  }

  /**
   * Get all players in a game (legacy)
   */
  static getGamePlayers(gameCode: string): Array<{ id: string; name: string; class?: string }> {
    const session = gameSessions.get(gameCode.toUpperCase());
    if (!session) {
      return [];
    }

    const players = [];
    for (const [playerId, playerName] of session.players) {
      players.push({
        id: playerId,
        name: playerName,
        class: session.player_classes.get(playerId)
      });
    }
    return players;
  }

  /**
   * Set player character class (uses SessionManager)
   */
  static async setPlayerClassAsync(sessionId: string, playerId: string, characterClass: string): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return false;
    }

    const player = session.players.get(playerId);
    if (!player) {
      return false;
    }

    player.characterClass = characterClass;
    gameLogger.info({ sessionId, playerId, characterClass }, 'Player selected class');
    return true;
  }

  /**
   * Set player character class (legacy)
   */
  static setPlayerClass(playerId: string, characterClass: string): boolean {
    const playerSession = playerSessions.get(playerId);
    if (!playerSession || !playerSession.game_code) {
      return false;
    }

    const gameSession = gameSessions.get(playerSession.game_code);
    if (!gameSession) {
      return false;
    }

    gameSession.player_classes.set(playerId, characterClass);
    playerSession.character_class = characterClass;

    gameLogger.info({ playerId, characterClass }, 'Player selected class');
    return true;
  }

  /**
   * Set player ready status (uses SessionManager)
   */
  static async setPlayerReadyAsync(sessionId: string, playerId: string, isReady: boolean): Promise<boolean> {
    return this.sessionManager.setPlayerReady(sessionId, playerId, isReady);
  }

  /**
   * Check if all players are ready (uses SessionManager)
   */
  static async areAllPlayersReadyAsync(sessionId: string): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session || session.players.size === 0) {
      return false;
    }

    for (const player of session.players.values()) {
      if (!player.isReady) {
        return false;
      }
    }
    return true;
  }

  /**
   * Check if all players are ready (legacy)
   */
  static areAllPlayersReady(gameCode: string): boolean {
    const session = gameSessions.get(gameCode.toUpperCase());
    if (!session) {
      return false;
    }

    // All players must have selected a class
    return session.players.size > 0 &&
           session.player_classes.size === session.players.size;
  }

  /**
   * Start the game (uses SessionManager with PhaseManager)
   */
  static async startGameAsync(sessionId: string): Promise<boolean> {
    const session = await this.sessionManager.getSession(sessionId);
    if (!session) {
      return false;
    }

    if (session.currentPhase !== GamePhase.LOBBY) {
      return false; // Already started
    }

    // Transition to interrogation phase
    const result = await this.sessionManager.transitionPhase(sessionId, GamePhase.INTERROGATION);
    if (!result.success) {
      gameLogger.error({ sessionId, error: result.error }, 'Failed to start game');
      return false;
    }

    gameLogger.info({ sessionId, playerCount: session.players.size }, 'Game started with persistence');
    return true;
  }

  /**
   * Start the game (legacy)
   */
  static startGame(gameCode: string): boolean {
    const session = gameSessions.get(gameCode.toUpperCase());
    if (!session) {
      return false;
    }

    if (session.game_started) {
      return false; // Already started
    }

    if (!this.areAllPlayersReady(gameCode)) {
      return false; // Not all players ready
    }

    session.game_started = true;
    gameLogger.info({ gameCode, playerCount: session.players.size }, 'Game started');
    return true;
  }

  /**
   * Clean up old game sessions (call periodically)
   */
  static cleanupOldSessions(_maxAgeHours = 4): void {
    // This would need timestamps to be properly implemented
    // For now, it's a placeholder
    gameLogger.debug('Session cleanup not yet implemented');
  }

  /**
   * Get SessionManager instance (for direct access when needed)
   */
  static getSessionManager(): SessionManager {
    return this.sessionManager;
  }
}

export default GameService;
