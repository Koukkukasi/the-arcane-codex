import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import GameService from '../services/game';
import { getMCPService } from '../services/mcp';
import { io } from '../server';

const router = Router();
const mcpService = getMCPService();

// Middleware to ensure player has an ID
const ensurePlayerId = (req: Request, _res: Response, next: NextFunction): void => {
  if (!req.session.player_id) {
    req.session.player_id = uuidv4();
  }
  next();
};

// Middleware to require authentication
const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.username || !req.session.player_id) {
    res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
    return;
  }
  next();
};

// Middleware to require game session
const requireGameSession = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.session.game_code) {
    res.status(400).json({
      success: false,
      error: 'Not in a game session'
    });
    return;
  }
  next();
};

// ============================================================================
// Session Management
// ============================================================================

// Clear session to start fresh game
router.post('/clear_session', (req: Request, res: Response): void => {
  // Clear game-related session data but keep player_id for continuity
  delete req.session.game_code;
  delete req.session.username;

  console.log(`[SESSION] Session cleared for player ${req.session.player_id}`);

  res.json({
    success: true,
    message: 'Session cleared successfully'
  });
});

// ============================================================================
// CSRF Token Endpoint
// ============================================================================

router.get('/csrf-token', (req: Request, res: Response): void => {
  // Generate CSRF token
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrf_token = token;

  res.json({
    success: true,
    csrf_token: token
  });
});

// ============================================================================
// Authentication Endpoints
// ============================================================================

router.post('/set_username', ensurePlayerId, (req: Request, res: Response): void => {
  const { username } = req.body;

  if (!username || username.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: 'Username is required'
    });
    return;
  }

  const trimmedUsername = username.trim();
  if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
    res.status(400).json({
      success: false,
      error: 'Username must be between 2 and 20 characters'
    });
    return;
  }

  // Set session data
  req.session.username = trimmedUsername;

  console.log(`[AUTH] User ${trimmedUsername} logged in (ID: ${req.session.player_id})`);

  res.json({
    success: true,
    message: 'Username set successfully',
    username: trimmedUsername,
    player_id: req.session.player_id
  });
});

router.get('/get_username', (req: Request, res: Response): void => {
  const username = req.session.username;

  if (!username) {
    res.json({
      success: false,
      message: 'No username set'
    });
    return;
  }

  res.json({
    success: true,
    username,
    player_id: req.session.player_id
  });
});

// ============================================================================
// Game Session Endpoints
// ============================================================================

router.post('/create_game', requireAuth, (req: Request, res: Response): void => {
  const playerId = req.session.player_id!;
  const username = req.session.username!;

  try {
    // Check if player is already in a game
    if (req.session.game_code) {
      res.status(400).json({
        success: false,
        error: 'Already in a game'
      });
      return;
    }

    // Create new game
    const { gameCode, session } = GameService.createGame(playerId, username);

    // Update player session
    req.session.game_code = gameCode;

    // Emit socket event
    io.to(gameCode).emit('game_created', {
      game_code: gameCode,
      creator: username,
      max_players: session.max_players
    });

    res.json({
      success: true,
      game_code: gameCode,
      message: `Game ${gameCode} created successfully`
    });

  } catch (error) {
    console.error('[ERROR] Failed to create game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create game'
    });
    return;
  }
});

router.post('/join_game', requireAuth, (req: Request, res: Response): void => {
  const { game_code } = req.body;
  const playerId = req.session.player_id!;
  const username = req.session.username!;

  if (!game_code) {
    res.status(400).json({
      success: false,
      error: 'Game code is required'
    });
    return;
  }

  try {
    const result = GameService.joinGame(game_code, playerId, username);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    // Update session
    req.session.game_code = game_code.toUpperCase();

    // Emit socket event
    io.to(game_code.toUpperCase()).emit('player_joined', {
      player_name: username,
      player_id: playerId
    });

    res.json({
      success: true,
      game_code: game_code.toUpperCase(),
      message: `Joined game ${game_code.toUpperCase()} successfully`
    });

  } catch (error) {
    console.error('[ERROR] Failed to join game:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join game'
    });
    return;
  }
});

router.get('/session_info', (req: Request, res: Response): void => {
  const gameCode = req.session.game_code;
  const playerId = req.session.player_id;
  const username = req.session.username;

  if (!gameCode) {
    res.json({
      success: true,
      in_game: false,
      username
    });
    return;
  }

  const gameSession = GameService.getGameSession(gameCode);
  if (!gameSession) {
    // Clear invalid game code
    req.session.game_code = undefined;
    res.json({
      success: true,
      in_game: false,
      username
    });
    return;
  }

  const players = GameService.getGamePlayers(gameCode);

  res.json({
    success: true,
    in_game: true,
    game_code: gameCode,
    username,
    player_id: playerId,
    players,
    max_players: gameSession.max_players,
    game_started: gameSession.game_started
  });
});

// ============================================================================
// Interrogation Endpoints
// ============================================================================

router.post('/start_interrogation', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  try {
    // Check if already completed interrogation
    const gameSession = GameService.getGameSession(gameCode);
    if (gameSession && gameSession.interrogation_complete.has(playerId)) {
      res.status(400).json({
        success: false,
        error: 'Interrogation already completed'
      });
      return;
    }

    // Start interrogation
    const result = GameService.startInterrogation(playerId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    // Update session
    req.session.current_question = 1;
    req.session.answers = {};

    // Try MCP service first, fall back to mock
    let question = result.question;
    if (mcpService.checkAvailability()) {
      try {
        question = await mcpService.generateInterrogationQuestion(playerId, 1, []);
      } catch (error) {
        console.error('[MCP] Failed to generate question, using mock:', error);
      }
    }

    res.json({
      success: true,
      question,
      message: 'Divine Interrogation has begun'
    });

  } catch (error) {
    console.error('[ERROR] Failed to start interrogation:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start interrogation'
    });
    return;
  }
});

router.post('/answer_question', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
  const { question_number, answer_id } = req.body;
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  if (!question_number || !answer_id) {
    res.status(400).json({
      success: false,
      error: 'Question number and answer are required'
    });
    return;
  }

  try {
    // Answer the question
    const result = GameService.answerQuestion(playerId, question_number, answer_id);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    // Update session
    if (!req.session.answers) {
      req.session.answers = {};
    }
    req.session.answers[question_number] = answer_id;

    if (result.completed) {
      // Get final results
      const finalResults = GameService.getInterrogationResults(playerId);

      // Emit completion event
      io.to(gameCode).emit('interrogation_complete', {
        player_id: playerId,
        player_name: req.session.username,
        patron_god: finalResults.results?.patron_god
      });

      res.json({
        success: true,
        completed: true,
        results: finalResults.results,
        message: 'Divine Interrogation complete!'
      });
      return;
    }

    // Get next question
    let nextQuestion = result.nextQuestion;
    if (mcpService.checkAvailability() && nextQuestion) {
      try {
        const previousAnswers = Object.entries(req.session.answers || {}).map(([q, a]) => ({
          question: parseInt(q),
          answer: a
        }));
        nextQuestion = await mcpService.generateInterrogationQuestion(
          playerId,
          nextQuestion.question_number,
          previousAnswers
        );
      } catch (error) {
        console.error('[MCP] Failed to generate question, using mock:', error);
      }
    }

    res.json({
      success: true,
      completed: false,
      next_question: nextQuestion,
      current_question: result.nextQuestion?.question_number
    });

  } catch (error) {
    console.error('[ERROR] Failed to answer question:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process answer'
    });
    return;
  }
});

// ============================================================================
// Game State Endpoints
// ============================================================================

router.get('/game_state', requireAuth, requireGameSession, (req: Request, res: Response): void => {
  const gameCode = req.session.game_code!;
  const playerId = req.session.player_id!;

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (!gameSession) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    const players = GameService.getGamePlayers(gameCode);
    const playerSession = GameService.getPlayerSession(playerId);

    res.json({
      success: true,
      game_code: gameCode,
      players,
      max_players: gameSession.max_players,
      game_started: gameSession.game_started,
      current_player: {
        id: playerId,
        name: req.session.username,
        class: playerSession?.character_class,
        interrogation_complete: gameSession.interrogation_complete.has(playerId)
      },
      scenario: gameSession.current_scenario
    });

  } catch (error) {
    console.error('[ERROR] Failed to get game state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    });
    return;
  }
});

// ============================================================================
// Character Endpoints
// ============================================================================

router.post('/set_character_class', requireAuth, requireGameSession, (req: Request, res: Response): void => {
  const { character_class } = req.body;
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  const validClasses = ['warrior', 'mage', 'rogue', 'cleric', 'ranger'];
  if (!character_class || !validClasses.includes(character_class)) {
    res.status(400).json({
      success: false,
      error: 'Invalid character class'
    });
    return;
  }

  try {
    const success = GameService.setPlayerClass(playerId, character_class);

    if (!success) {
      res.status(400).json({
        success: false,
        error: 'Failed to set character class'
      });
      return;
    }

    req.session.character_class = character_class;

    // Emit update event
    io.to(gameCode).emit('player_class_selected', {
      player_id: playerId,
      player_name: req.session.username,
      character_class
    });

    res.json({
      success: true,
      character_class,
      message: `Selected ${character_class} class`
    });

  } catch (error) {
    console.error('[ERROR] Failed to set character class:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set character class'
    });
    return;
  }
});

router.get('/character/divine_favor', requireAuth, (req: Request, res: Response): void => {
  const playerId = req.session.player_id!;

  try {
    const playerSession = GameService.getPlayerSession(playerId);

    if (!playerSession || !playerSession.god_favor) {
      res.json({
        success: true,
        god_favor: {
          VALDRIS: 0,
          KAITHA: 0,
          MORVANE: 0,
          SYLARA: 0,
          KORVAN: 0,
          ATHENA: 0,
          MERCUS: 0
        }
      });
      return;
    }

    res.json({
      success: true,
      god_favor: playerSession.god_favor
    });

  } catch (error) {
    console.error('[ERROR] Failed to get divine favor:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get divine favor'
    });
    return;
  }
});

// ============================================================================
// Scenario Generation Endpoints
// ============================================================================

router.post('/generate_scenario', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
  const { theme } = req.body;
  const gameCode = req.session.game_code!;

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (!gameSession) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    const players = Array.from(gameSession.players.values());
    const scenario = await mcpService.generateScenario(gameCode, players, theme);

    // Store scenario in game session
    gameSession.current_scenario = scenario;
    if (theme) {
      gameSession.scenario_history.push(theme);
    }

    // Emit scenario to all players
    io.to(gameCode).emit('new_scenario', scenario);

    res.json({
      success: true,
      scenario,
      message: 'Scenario generated successfully'
    });

  } catch (error) {
    console.error('[ERROR] Failed to generate scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate scenario'
    });
    return;
  }
});

router.get('/current_scenario', requireGameSession, (req: Request, res: Response): void => {
  const gameCode = req.session.game_code!;

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (!gameSession) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    if (!gameSession.current_scenario) {
      res.json({
        success: true,
        scenario: null,
        message: 'No scenario active'
      });
      return;
    }

    res.json({
      success: true,
      scenario: gameSession.current_scenario
    });

  } catch (error) {
    console.error('[ERROR] Failed to get scenario:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get scenario'
    });
    return;
  }
});

// ============================================================================
// Error Logging Endpoint
// ============================================================================

router.post('/log_client_error', (req: Request, res: Response): void => {
  const { error, context, stack } = req.body;

  console.error('[CLIENT ERROR]', {
    error,
    context,
    stack,
    user: req.session.username || 'anonymous',
    timestamp: new Date().toISOString()
  });

  res.json({
    success: true,
    message: 'Error logged'
  });
});

// ============================================================================
// Health Check
// ============================================================================

router.get('/health', (_req: Request, res: Response): void => {
  res.json({
    success: true,
    status: 'healthy',
    mcp_available: mcpService.checkAvailability(),
    timestamp: new Date().toISOString()
  });
});

export default router;