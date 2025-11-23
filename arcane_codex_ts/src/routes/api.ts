import { Router, Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import GameService from '../services/game';
import BattleService from '../services/battle';
import { getMCPService } from '../services/mcp';
import { io } from '../server';
import { EnemyType } from '../types/battle';

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
// Battle System Endpoints - Phase 2
// ============================================================================

// Rate limiter for battle actions (prevent spam)
const battleActionLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 3, // 3 actions per second
  message: 'Too many battle actions, slow down!',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /api/battle/start
 * Start a new battle
 */
router.post('/battle/start', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
  const { player_id, enemy_type } = req.body;
  const playerId = player_id || req.session.player_id;

  if (!playerId) {
    res.status(400).json({
      success: false,
      error: 'Player ID required'
    });
    return;
  }

  // Validate enemy type
  const validEnemyTypes = Object.values(EnemyType);
  const enemyTypeEnum = enemy_type && validEnemyTypes.includes(enemy_type)
    ? enemy_type
    : EnemyType.GOBLIN_SCOUT;

  try {
    // Check if player already has an active battle
    const existingBattle = BattleService.getPlayerBattle(playerId);
    if (existingBattle) {
      res.status(400).json({
        success: false,
        error: 'Already in a battle',
        battle_id: existingBattle.battleId
      });
      return;
    }

    // Get player session for stats
    const playerSession = GameService.getPlayerSession(playerId);
    const characterClass = playerSession?.character_class || req.session.character_class || 'warrior';

    // Create battle
    const battle = BattleService.startBattle(
      playerId,
      {
        name: req.session.username || 'Hero',
        class: characterClass,
        hp: 100,
        maxHp: 100,
        mana: 50,
        maxMana: 50,
        attack: 5,
        defense: 2,
        speed: 10,
        level: 1,
        xp: 0,
        gold: 0
      },
      enemyTypeEnum
    );

    // Emit to Socket.IO if in a game
    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_started', {
        player_id: playerId,
        player_name: req.session.username,
        enemy: battle.enemy.name,
        battle_id: battle.battleId
      });
    }

    res.json({
      success: true,
      battle_id: battle.battleId,
      player: battle.player,
      enemy: battle.enemy,
      turn_order: battle.turnOrder,
      is_player_turn: battle.isPlayerTurn,
      abilities: BattleService.getClassAbilities(characterClass)
    });

  } catch (error) {
    console.error('[ERROR] Failed to start battle:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start battle'
    });
    return;
  }
});

/**
 * POST /api/battle/:battle_id/action
 * Execute a combat action (attack or defend)
 */
router.post('/battle/:battle_id/action', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
  const { battle_id } = req.params;
  const { action_type, ability_id } = req.body;

  if (!battle_id) {
    res.status(400).json({
      success: false,
      error: 'Battle ID required'
    });
    return;
  }

  if (!action_type || !['attack', 'defend', 'ability'].includes(action_type)) {
    res.status(400).json({
      success: false,
      error: 'Invalid action type. Must be: attack, defend, or ability'
    });
    return;
  }

  try {
    const battle = BattleService.getBattle(battle_id);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
      return;
    }

    // Verify player owns this battle
    if (battle.playerId !== req.session.player_id) {
      res.status(403).json({
        success: false,
        error: 'Not your battle'
      });
      return;
    }

    if (!battle.isPlayerTurn) {
      res.status(400).json({
        success: false,
        error: 'Not your turn'
      });
      return;
    }

    let result;

    // Execute action
    switch (action_type) {
      case 'attack':
        result = BattleService.executeAttack(battle_id);
        break;
      case 'defend':
        result = BattleService.executeDefend(battle_id);
        break;
      case 'ability':
        if (!ability_id) {
          res.status(400).json({
            success: false,
            error: 'Ability ID required for ability action'
          });
          return;
        }
        result = BattleService.useAbility(battle_id, ability_id);
        break;
      default:
        res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
        return;
    }

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to execute action'
      });
      return;
    }

    // Emit to Socket.IO
    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_action', {
        battle_id,
        player_name: req.session.username,
        action_type,
        result
      });
    }

    res.json({
      success: true,
      ...result,
      battle_state: {
        player_hp: battle.player.currentHp,
        player_mana: battle.player.currentMana,
        enemy_hp: battle.enemy.currentHp,
        turn_count: battle.turnCount,
        is_player_turn: battle.isPlayerTurn
      }
    });

  } catch (error: any) {
    console.error('[ERROR] Failed to execute action:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute action'
    });
    return;
  }
});

/**
 * POST /api/battle/:battle_id/use_ability
 * Use a class-specific ability
 */
router.post('/battle/:battle_id/use_ability', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
  const { battle_id } = req.params;
  const { ability_id } = req.body;

  if (!battle_id || !ability_id) {
    res.status(400).json({
      success: false,
      error: 'Battle ID and ability ID required'
    });
    return;
  }

  try {
    const battle = BattleService.getBattle(battle_id);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
      return;
    }

    // Verify player owns this battle
    if (battle.playerId !== req.session.player_id) {
      res.status(403).json({
        success: false,
        error: 'Not your battle'
      });
      return;
    }

    // Get ability info
    const abilities = BattleService.getClassAbilities(battle.player.class);
    const ability = abilities.find(a => a.id === ability_id);

    if (!ability) {
      res.status(400).json({
        success: false,
        error: 'Invalid ability for your class'
      });
      return;
    }

    // Execute ability
    const result = BattleService.useAbility(battle_id, ability_id);

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to use ability'
      });
      return;
    }

    // Emit to Socket.IO
    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_ability_used', {
        battle_id,
        player_name: req.session.username,
        ability_name: ability.name,
        result
      });
    }

    res.json({
      success: true,
      ability: ability.name,
      mana_cost: ability.manaCost,
      cooldown: ability.cooldown,
      ...result
    });

  } catch (error: any) {
    console.error('[ERROR] Failed to use ability:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to use ability'
    });
    return;
  }
});

/**
 * GET /api/battle/:battle_id/status
 * Get current battle status
 */
router.get('/battle/:battle_id/status', requireAuth, (req: Request, res: Response): void => {
  const { battle_id } = req.params;

  if (!battle_id) {
    res.status(400).json({
      success: false,
      error: 'Battle ID required'
    });
    return;
  }

  try {
    const battle = BattleService.getBattle(battle_id);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
      return;
    }

    // Verify player owns this battle
    if (battle.playerId !== req.session.player_id) {
      res.status(403).json({
        success: false,
        error: 'Not your battle'
      });
      return;
    }

    res.json({
      success: true,
      battle_id: battle.battleId,
      player: {
        hp: battle.player.currentHp,
        max_hp: battle.player.maxHp,
        mana: battle.player.currentMana,
        max_mana: battle.player.maxMana,
        status_effects: battle.player.statusEffects
      },
      enemy: {
        name: battle.enemy.name,
        emoji: battle.enemy.emoji,
        hp: battle.enemy.currentHp,
        max_hp: battle.enemy.maxHp,
        status_effects: battle.enemy.statusEffects
      },
      turn_count: battle.turnCount,
      is_player_turn: battle.isPlayerTurn,
      is_victory: battle.isVictory,
      ended: battle.ended,
      combat_log: battle.combatLog.slice(-10), // Last 10 entries
      ability_cooldowns: battle.abilityCooldowns,
      abilities: BattleService.getClassAbilities(battle.player.class)
    });

  } catch (error) {
    console.error('[ERROR] Failed to get battle status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get battle status'
    });
    return;
  }
});

/**
 * POST /api/battle/:battle_id/flee
 * Attempt to flee from battle
 */
router.post('/battle/:battle_id/flee', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
  const { battle_id } = req.params;

  if (!battle_id) {
    res.status(400).json({
      success: false,
      error: 'Battle ID required'
    });
    return;
  }

  try {
    const battle = BattleService.getBattle(battle_id);

    if (!battle) {
      res.status(404).json({
        success: false,
        error: 'Battle not found'
      });
      return;
    }

    // Verify player owns this battle
    if (battle.playerId !== req.session.player_id) {
      res.status(403).json({
        success: false,
        error: 'Not your battle'
      });
      return;
    }

    if (!battle.isPlayerTurn) {
      res.status(400).json({
        success: false,
        error: 'Not your turn'
      });
      return;
    }

    // Attempt to flee
    const result = BattleService.attemptFlee(battle_id);

    // Emit to Socket.IO
    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_flee_attempt', {
        battle_id,
        player_name: req.session.username,
        success: result.success
      });
    }

    res.json({
      success: true,
      fled: result.success,
      flee_chance: result.fleeChance,
      message: result.success ? 'Successfully fled from battle!' : 'Failed to flee!'
    });

  } catch (error) {
    console.error('[ERROR] Failed to flee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to flee from battle'
    });
    return;
  }
});

// ============================================================================
// AI GM System Endpoints - Phase 4
// ============================================================================

// Rate limiter for AI GM scenario generation (prevent abuse)
const aiGMScenarioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 scenarios per hour per player
  message: 'Too many scenarios generated. Please wait before creating more.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.session.player_id || req.ip || 'unknown';
  }
});

/**
 * POST /api/ai_gm/scenario/generate
 * Generate a new AI GM scenario
 * Body: { scenario_type?, difficulty?, context? }
 */
router.post('/ai_gm/scenario/generate', requireAuth, requireGameSession, aiGMScenarioLimiter, async (req: Request, res: Response): Promise<void> => {
  const { scenario_type, difficulty, context } = req.body;
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

    // For now, generate a basic scenario structure
    // This will be replaced with actual AIGMService call when implemented
    // TODO: Use AIGMService.generateScenario(gameCode, Array.from(gameSession.players.values()), scenario_type, difficulty, context)
    const scenario = {
      scenario_id: uuidv4(),
      scenario_type: scenario_type || 'mystery',
      difficulty: difficulty || 'medium',
      title: 'A New Adventure Begins',
      description: 'The AI GM weaves a tale of intrigue and danger...',
      player_count: gameSession.players.size,
      public_info: {
        scene: 'You find yourselves at a crossroads in the ancient forest...',
        npcs: [],
        observations: []
      },
      choices: [
        {
          choice_id: 'choice_1',
          text: 'Investigate the mysterious sounds',
          visible_to: 'all'
        },
        {
          choice_id: 'choice_2',
          text: 'Set up camp and wait',
          visible_to: 'all'
        }
      ],
      asymmetric_info: new Map(), // Player-specific info managed by AsymmetricInfoManager
      created_at: new Date().toISOString(),
      context: context || {}
    };

    // Store scenario in game session
    gameSession.current_scenario = scenario;

    // Broadcast scenario generation to all players
    io.to(gameCode).emit('scenario_generated', {
      scenario_id: scenario.scenario_id,
      scenario_type: scenario.scenario_type,
      generated_by: req.session.username
    });

    console.log(`[AI_GM] Scenario ${scenario.scenario_id} generated for game ${gameCode}`);

    res.json({
      success: true,
      scenario_id: scenario.scenario_id,
      scenario,
      message: 'Scenario generated successfully'
    });

  } catch (error) {
    console.error('[ERROR] Failed to generate AI GM scenario:', error);

    // Fallback to template-based scenario on API failure
    const fallbackScenario = {
      scenario_id: uuidv4(),
      scenario_type: 'template',
      difficulty: 'medium',
      title: 'Fallback Adventure',
      description: 'A template scenario for when AI generation fails',
      public_info: {
        scene: 'A simple scenario unfolds...',
        npcs: [],
        observations: []
      },
      choices: [
        { choice_id: 'fallback_1', text: 'Continue forward', visible_to: 'all' }
      ],
      created_at: new Date().toISOString()
    };

    res.status(500).json({
      success: false,
      error: 'Failed to generate scenario, using fallback',
      scenario_id: fallbackScenario.scenario_id,
      scenario: fallbackScenario
    });
    return;
  }
});

/**
 * POST /api/ai_gm/scenario/:scenario_id/choose
 * Make a choice in a scenario
 * Body: { choice_id }
 */
router.post('/ai_gm/scenario/:scenario_id/choose', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
  const { scenario_id } = req.params;
  const { choice_id } = req.body;
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  if (!choice_id) {
    res.status(400).json({
      success: false,
      error: 'Choice ID required'
    });
    return;
  }

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (!gameSession || !gameSession.current_scenario) {
      res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
      return;
    }

    const scenario = gameSession.current_scenario;

    if (scenario.scenario_id !== scenario_id) {
      res.status(400).json({
        success: false,
        error: 'Scenario ID mismatch'
      });
      return;
    }

    // Validate choice exists
    const choice = scenario.choices?.find((c: any) => c.choice_id === choice_id);
    if (!choice) {
      res.status(400).json({
        success: false,
        error: 'Invalid choice'
      });
      return;
    }

    // Record the choice (this will be handled by ConsequenceTracker when implemented)
    const choiceResult = {
      player_id: playerId,
      player_name: req.session.username,
      choice_id,
      choice_text: choice.text,
      timestamp: new Date().toISOString(),
      consequences: {
        immediate: 'Your choice has been recorded...',
        preview: 'This decision may have far-reaching effects...'
      }
    };

    // Notify other players that a choice was made (without revealing what it was)
    io.to(gameCode).emit('choice_made', {
      scenario_id,
      player_name: req.session.username,
      choice_revealed: false // For asymmetric gameplay
    });

    console.log(`[AI_GM] Player ${playerId} made choice ${choice_id} in scenario ${scenario_id}`);

    res.json({
      success: true,
      scenario_id,
      choice_id,
      result: choiceResult,
      message: 'Choice recorded successfully'
    });

  } catch (error) {
    console.error('[ERROR] Failed to process choice:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process choice'
    });
    return;
  }
});

/**
 * GET /api/ai_gm/scenario/:scenario_id
 * Get scenario details (filtered by player's knowledge)
 */
router.get('/ai_gm/scenario/:scenario_id', requireAuth, requireGameSession, (req: Request, res: Response): void => {
  const { scenario_id } = req.params;
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (!gameSession || !gameSession.current_scenario) {
      res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
      return;
    }

    const scenario = gameSession.current_scenario;

    if (scenario.scenario_id !== scenario_id) {
      res.status(404).json({
        success: false,
        error: 'Scenario not found'
      });
      return;
    }

    // Filter scenario based on player's knowledge (AsymmetricInfoManager)
    // For now, return public info + player-specific info
    const filteredScenario = {
      scenario_id: scenario.scenario_id,
      scenario_type: scenario.scenario_type,
      difficulty: scenario.difficulty,
      title: scenario.title,
      description: scenario.description,
      public_info: scenario.public_info,
      choices: scenario.choices,
      player_specific_info: scenario.asymmetric_info?.get(playerId) || null,
      created_at: scenario.created_at
    };

    res.json({
      success: true,
      scenario: filteredScenario
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

/**
 * GET /api/ai_gm/player/knowledge
 * Get player's current knowledge/clues
 */
router.get('/ai_gm/player/knowledge', requireAuth, requireGameSession, (req: Request, res: Response): void => {
  const playerId = req.session.player_id!;
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

    // This will be managed by AsymmetricInfoManager when implemented
    const playerKnowledge = {
      player_id: playerId,
      clues: [], // Player's discovered clues
      secrets: [], // Player's secret information
      shared_clues: [], // Clues shared by other players
      knowledge_level: 0,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      knowledge: playerKnowledge
    });

  } catch (error) {
    console.error('[ERROR] Failed to get player knowledge:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get player knowledge'
    });
    return;
  }
});

/**
 * GET /api/ai_gm/world/state
 * Get current world state (public info)
 */
router.get('/ai_gm/world/state', requireAuth, requireGameSession, (req: Request, res: Response): void => {
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

    // Public world state visible to all players
    const worldState = {
      game_code: gameCode,
      current_scenario: gameSession.current_scenario ? {
        scenario_id: gameSession.current_scenario.scenario_id,
        title: gameSession.current_scenario.title,
        public_info: gameSession.current_scenario.public_info
      } : null,
      players: Array.from(gameSession.players.entries()).map(([id, name]) => ({
        id,
        name,
        class: gameSession.player_classes.get(id)
      })),
      scenario_count: gameSession.scenario_history.length,
      world_events: [], // Global events that affect all players
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      world_state: worldState
    });

  } catch (error) {
    console.error('[ERROR] Failed to get world state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get world state'
    });
    return;
  }
});

/**
 * GET /api/ai_gm/player/history
 * Get player's choice history and consequences
 */
router.get('/ai_gm/player/history', requireAuth, requireGameSession, (req: Request, res: Response): void => {
  const playerId = req.session.player_id!;
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

    // This will be managed by ConsequenceTracker when implemented
    const playerHistory = {
      player_id: playerId,
      choices: [], // Array of past choices
      consequences: [], // Array of consequences from choices
      divine_favor_changes: [], // Changes in god favor from choices
      total_choices: 0,
      last_choice_at: null
    };

    res.json({
      success: true,
      history: playerHistory
    });

  } catch (error) {
    console.error('[ERROR] Failed to get player history:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get player history'
    });
    return;
  }
});

/**
 * POST /api/ai_gm/share_clue
 * Share a clue with another player
 * Body: { to_player_id, clue_id }
 */
router.post('/ai_gm/share_clue', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
  const { to_player_id, clue_id } = req.body;
  const fromPlayerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  if (!to_player_id || !clue_id) {
    res.status(400).json({
      success: false,
      error: 'Recipient player ID and clue ID required'
    });
    return;
  }

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (!gameSession) {
      res.status(404).json({
        success: false,
        error: 'Game not found'
      });
      return;
    }

    // Verify recipient is in the game
    if (!gameSession.players.has(to_player_id)) {
      res.status(400).json({
        success: false,
        error: 'Recipient player not in game'
      });
      return;
    }

    // Cannot share with yourself
    if (fromPlayerId === to_player_id) {
      res.status(400).json({
        success: false,
        error: 'Cannot share clue with yourself'
      });
      return;
    }

    // This will be managed by AsymmetricInfoManager when implemented
    const sharedClue = {
      clue_id,
      from_player_id: fromPlayerId,
      from_player_name: req.session.username,
      to_player_id,
      to_player_name: gameSession.players.get(to_player_id),
      shared_at: new Date().toISOString()
    };

    // Notify the recipient
    io.to(gameCode).emit('clue_shared', {
      to_player_id,
      from_player_name: req.session.username,
      clue_id
    });

    console.log(`[AI_GM] Player ${fromPlayerId} shared clue ${clue_id} with ${to_player_id}`);

    res.json({
      success: true,
      shared_clue: sharedClue,
      message: 'Clue shared successfully'
    });

  } catch (error) {
    console.error('[ERROR] Failed to share clue:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share clue'
    });
    return;
  }
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