/**
 * Game Session Routes
 * Handles game creation, joining, and state management
 */

import { Router, Request, Response } from 'express';
import GameService from '../services/game';
import { getMCPService } from '../services/mcp';
import { io } from '../server';
import { requireAuth, requireGameSession } from './auth.routes';
import { gameLogger } from '../services/logger';

const router = Router();
const mcpService = getMCPService();

/**
 * POST /create_game
 * Create a new game session
 */
router.post('/create_game', requireAuth, (req: Request, res: Response): void => {
  const playerId = req.session.player_id!;
  const username = req.session.username!;

  try {
    if (req.session.game_code) {
      res.status(400).json({
        success: false,
        error: 'Already in a game'
      });
      return;
    }

    const { gameCode, session } = GameService.createGame(playerId, username);
    req.session.game_code = gameCode;

    io.to(gameCode).emit('game_created', {
      game_code: gameCode,
      creator: username,
      max_players: session.max_players
    });

    gameLogger.info({ gameCode, creator: username }, 'Game created');

    res.json({
      success: true,
      game_code: gameCode,
      message: `Game ${gameCode} created successfully`
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to create game');
    res.status(500).json({
      success: false,
      error: 'Failed to create game'
    });
  }
});

/**
 * POST /join_game
 * Join an existing game
 */
router.post('/join_game', requireAuth, (req: Request, res: Response): void => {
  const { game_code } = req.body;
  const playerId = req.session.player_id!;
  const username = req.session.username!;

  if (!game_code) {
    gameLogger.warn({ username }, 'Join game failed: No game code provided');
    res.status(400).json({
      success: false,
      error: 'Game code is required'
    });
    return;
  }

  try {
    const result = GameService.joinGame(game_code, playerId, username);

    if (!result.success) {
      gameLogger.warn({ username, gameCode: game_code, error: result.error }, 'Join game failed');
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    req.session.game_code = game_code.toUpperCase();

    io.to(game_code.toUpperCase()).emit('player_joined', {
      player_name: username,
      player_id: playerId
    });

    gameLogger.info({ gameCode: game_code, username }, 'Player joined game');

    res.json({
      success: true,
      game_code: game_code.toUpperCase(),
      message: `Joined game ${game_code.toUpperCase()} successfully`
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to join game');
    res.status(500).json({
      success: false,
      error: 'Failed to join game'
    });
  }
});

/**
 * GET /session_info
 * Get current session information
 */
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

/**
 * GET /game_state
 * Get full game state
 */
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
    gameLogger.error({ error }, 'Failed to get game state');
    res.status(500).json({
      success: false,
      error: 'Failed to get game state'
    });
  }
});

/**
 * POST /generate_scenario
 * Generate a new scenario using AI
 */
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

    gameSession.current_scenario = scenario;
    if (theme) {
      gameSession.scenario_history.push(theme);
    }

    io.to(gameCode).emit('new_scenario', scenario);

    gameLogger.info({ gameCode, theme }, 'Scenario generated');

    res.json({
      success: true,
      scenario,
      message: 'Scenario generated successfully'
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to generate scenario');
    res.status(500).json({
      success: false,
      error: 'Failed to generate scenario'
    });
  }
});

/**
 * GET /current_scenario
 * Get the current active scenario
 */
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
    gameLogger.error({ error }, 'Failed to get scenario');
    res.status(500).json({
      success: false,
      error: 'Failed to get scenario'
    });
  }
});

export default router;
