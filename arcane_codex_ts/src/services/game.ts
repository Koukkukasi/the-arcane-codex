import { GameSession, PlayerSessionData, God } from '../types/game';
import { getMockInterrogationQuestion } from '../data/questions';

// In-memory game storage (in production, use Redis or a database)
const gameSessions = new Map<string, GameSession>();
const playerSessions = new Map<string, PlayerSessionData>();

/**
 * Game service class for managing game sessions and player data
 */
export class GameService {
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
   * Create a new game session
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

    console.log(`[GAME] Created game ${gameCode} by ${playerName}`);
    return { gameCode, session };
  }

  /**
   * Join an existing game
   */
  static joinGame(gameCode: string, playerId: string, playerName: string): { success: boolean; error?: string } {
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

    if (session.players.has(playerId)) {
      return { success: false, error: 'Already in this game' };
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

    console.log(`[GAME] ${playerName} joined game ${gameCode}`);
    return { success: true };
  }

  /**
   * Get game session
   */
  static getGameSession(gameCode: string): GameSession | undefined {
    return gameSessions.get(gameCode.toUpperCase());
  }

  /**
   * Get player session
   */
  static getPlayerSession(playerId: string): PlayerSessionData | undefined {
    return playerSessions.get(playerId);
  }

  /**
   * Start interrogation for a player
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

    console.log(`[INTERROGATION] Started for player ${playerId}`);
    return { success: true, question };
  }

  /**
   * Answer an interrogation question
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

      console.log(`[INTERROGATION] Completed for player ${playerId}`);
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
   * Get interrogation results
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
   * Get all players in a game
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
   * Set player character class
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

    console.log(`[GAME] Player ${playerId} selected class: ${characterClass}`);
    return true;
  }

  /**
   * Check if all players are ready
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
   * Start the game
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
    console.log(`[GAME] Game ${gameCode} started with ${session.players.size} players`);
    return true;
  }

  /**
   * Clean up old game sessions (call periodically)
   */
  static cleanupOldSessions(_maxAgeHours = 4): void {
    // This would need timestamps to be properly implemented
    // For now, it's a placeholder
    console.log('[CLEANUP] Session cleanup not yet implemented');
  }
}

export default GameService;