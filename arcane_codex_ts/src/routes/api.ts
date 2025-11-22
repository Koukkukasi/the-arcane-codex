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