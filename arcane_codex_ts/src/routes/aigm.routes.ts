/**
 * AI Game Master Routes
 * Handles AI-driven scenario generation, choices, and world state
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit from 'express-rate-limit';
import GameService from '../services/game';
import { io } from '../server';
import { requireAuth, requireGameSession } from './auth.routes';
import { gameLogger } from '../services/logger';
import { AIGMService } from '../services/ai_gm_core';
import { ScenarioType, ScenarioRequest, ScenarioContext, PlayerHistory } from '../types/ai_gm';
import { CharacterClass, God } from '../types/game';

const router = Router();

// Rate limiter for AI GM scenario generation (prevent abuse)
const aiGMScenarioLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 scenarios per hour per player
  message: 'Too many scenarios generated. Please wait before creating more.',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request): string => {
    return req.session.player_id || 'unknown';
  }
});

/**
 * POST /scenario/generate
 * Generate a new AI GM scenario using Claude AI
 */
router.post('/scenario/generate', requireAuth, requireGameSession, aiGMScenarioLimiter, async (req: Request, res: Response): Promise<void> => {
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

    // Get AIGMService instance
    const aigmService = AIGMService.getInstance();

    // Build ScenarioRequest from game session
    const scenarioRequest: ScenarioRequest = {
      context: buildScenarioContext(gameSession),
      desiredType: mapScenarioType(scenario_type),
      difficulty: difficulty || 5,
      theme: context?.theme
    };

    // Generate scenario using AI GM Service (calls Claude via MCP)
    gameLogger.info({ gameCode, scenarioType: scenario_type }, 'Requesting AI scenario generation');
    const aiScenario = await aigmService.generateScenario(scenarioRequest);

    // Convert to game session format
    const scenario = {
      scenario_id: aiScenario.id,
      scenario_type: aiScenario.type,
      difficulty: difficulty || 'medium',
      title: aiScenario.title,
      description: aiScenario.narrative,
      player_count: gameSession.players.size,
      public_info: {
        scene: aiScenario.narrative,
        npcs: [],
        observations: []
      },
      choices: aiScenario.choices.map(c => ({
        choice_id: c.id,
        text: c.text,
        visible_to: c.visibility === 'ALL' ? 'all' : c.visibleTo
      })),
      asymmetric_info: new Map(),
      created_at: new Date().toISOString(),
      context: context || {},
      ai_generated: true
    };

    gameSession.current_scenario = scenario;

    io.to(gameCode).emit('scenario_generated', {
      scenario_id: scenario.scenario_id,
      scenario_type: scenario.scenario_type,
      generated_by: req.session.username,
      ai_generated: true
    });

    gameLogger.info({ scenarioId: scenario.scenario_id, gameCode }, 'AI GM scenario generated successfully');

    res.json({
      success: true,
      scenario_id: scenario.scenario_id,
      scenario,
      message: 'AI scenario generated successfully'
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to generate AI GM scenario, using fallback');

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
        { choice_id: 'fallback_1', text: 'Continue forward', visible_to: 'all' },
        { choice_id: 'fallback_2', text: 'Investigate surroundings', visible_to: 'all' }
      ],
      created_at: new Date().toISOString(),
      ai_generated: false
    };

    res.status(500).json({
      success: false,
      error: 'Failed to generate AI scenario, using fallback',
      scenario_id: fallbackScenario.scenario_id,
      scenario: fallbackScenario
    });
  }
});

/**
 * Build ScenarioContext from game session data
 */
function buildScenarioContext(gameSession: any): ScenarioContext {
  const playerEntries: [string, string][] = Array.from(gameSession.players.entries());
  const playerHistories: PlayerHistory[] = playerEntries.map(([id, name]) => ({
    playerId: id,
    playerName: name,
    characterClass: gameSession.player_classes?.get(id) || CharacterClass.WARRIOR,
    godFavor: new Map<God, number>(),
    specialItems: [],
    npcRelationships: new Map<string, number>(),
    knownSecrets: [],
    personalGoals: [],
    moralAlignment: { lawChaos: 0, goodEvil: 0 }
  }));

  return {
    playerHistories,
    partyState: {
      location: gameSession.location || 'Unknown',
      activeQuests: gameSession.active_quests || [],
      sharedInventory: gameSession.shared_inventory || [],
      partyReputation: gameSession.reputation || 0,
      resources: { gold: gameSession.gold || 0, supplies: 100, influence: 0 },
      partyModifiers: []
    },
    partyComposition: {
      playerIds: Array.from(gameSession.players.keys()),
      classes: gameSession.player_classes ? Array.from(gameSession.player_classes.values()) : [],
      averageLevel: 1,
      partySize: gameSession.players.size
    },
    worldState: {
      factions: new Map(),
      majorEvents: [],
      playerActionsHistory: [],
      worldTime: { day: 1, season: 'SPRING', year: 1 },
      globalFlags: new Map()
    }
  };
}

/**
 * Map scenario type string to ScenarioType enum
 */
function mapScenarioType(type?: string): ScenarioType | undefined {
  if (!type) return undefined;
  const typeMap: Record<string, ScenarioType> = {
    'divine_interrogation': ScenarioType.DIVINE_INTERROGATION,
    'moral_dilemma': ScenarioType.MORAL_DILEMMA,
    'investigation': ScenarioType.INVESTIGATION,
    'mystery': ScenarioType.INVESTIGATION,
    'combat': ScenarioType.COMBAT_CHOICE,
    'negotiation': ScenarioType.NEGOTIATION,
    'betrayal': ScenarioType.BETRAYAL,
    'discovery': ScenarioType.DISCOVERY
  };
  return typeMap[type.toLowerCase()];
}

/**
 * POST /scenario/:scenario_id/choose
 * Make a choice in a scenario
 */
router.post('/scenario/:scenario_id/choose', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
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

    const choice = scenario.choices?.find((c: any) => c.choice_id === choice_id);
    if (!choice) {
      res.status(400).json({
        success: false,
        error: 'Invalid choice'
      });
      return;
    }

    // Get AIGMService to register the choice and apply consequences
    const aigmService = AIGMService.getInstance();

    // Register the choice
    const choiceRegistered = aigmService.registerChoice(scenario_id, playerId, choice_id);
    if (!choiceRegistered) {
      res.status(400).json({
        success: false,
        error: 'Choice already made or invalid'
      });
      return;
    }

    // Apply consequences for this choice
    gameLogger.info({ playerId, choiceId: choice_id, scenarioId: scenario_id }, 'Applying choice consequences');

    const consequenceResult = await aigmService.applyChoiceConsequences(
      scenario_id,
      choice_id,
      playerId,
      gameCode
    );

    // Build the choice result with actual consequences
    const choiceResult = {
      player_id: playerId,
      player_name: req.session.username,
      choice_id,
      choice_text: choice.text,
      timestamp: new Date().toISOString(),
      consequences: {
        applied: consequenceResult.appliedConsequences.length,
        worldEffects: consequenceResult.worldEffects.map(e => e.description),
        playerEffects: Array.from(consequenceResult.playerEffects.entries()).map(([pid, effects]) => ({
          playerId: pid,
          effects: effects.map(e => e.description)
        }))
      }
    };

    // Broadcast choice made event
    io.to(gameCode).emit('choice_made', {
      scenario_id,
      player_name: req.session.username,
      choice_revealed: false
    });

    // Broadcast consequence resolution
    if (consequenceResult.appliedConsequences.length > 0) {
      io.to(gameCode).emit('consequences_resolved', {
        scenario_id,
        player_id: playerId,
        world_effects: consequenceResult.worldEffects.map(e => ({
          type: e.effectType,
          description: e.description
        })),
        timestamp: Date.now()
      });
    }

    gameLogger.info({
      playerId,
      choiceId: choice_id,
      scenarioId: scenario_id,
      consequencesApplied: consequenceResult.appliedConsequences.length
    }, 'Player made choice and consequences applied');

    res.json({
      success: true,
      scenario_id,
      choice_id,
      result: choiceResult,
      consequences_applied: consequenceResult.appliedConsequences.length,
      message: 'Choice recorded and consequences applied'
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to process choice');
    res.status(500).json({
      success: false,
      error: 'Failed to process choice'
    });
  }
});

/**
 * GET /scenario/:scenario_id
 * Get scenario details (filtered by player's knowledge)
 */
router.get('/scenario/:scenario_id', requireAuth, requireGameSession, (req: Request, res: Response): void => {
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
    gameLogger.error({ error }, 'Failed to get scenario');
    res.status(500).json({
      success: false,
      error: 'Failed to get scenario'
    });
  }
});

/**
 * GET /player/knowledge
 * Get player's current knowledge/clues
 */
router.get('/player/knowledge', requireAuth, requireGameSession, (req: Request, res: Response): void => {
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

    const playerKnowledge = {
      player_id: playerId,
      clues: [],
      secrets: [],
      shared_clues: [],
      knowledge_level: 0,
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      knowledge: playerKnowledge
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to get player knowledge');
    res.status(500).json({
      success: false,
      error: 'Failed to get player knowledge'
    });
  }
});

/**
 * GET /world/state
 * Get current world state (public info)
 */
router.get('/world/state', requireAuth, requireGameSession, (req: Request, res: Response): void => {
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
      world_events: [],
      last_updated: new Date().toISOString()
    };

    res.json({
      success: true,
      world_state: worldState
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to get world state');
    res.status(500).json({
      success: false,
      error: 'Failed to get world state'
    });
  }
});

/**
 * GET /player/history
 * Get player's choice history and consequences
 */
router.get('/player/history', requireAuth, requireGameSession, (req: Request, res: Response): void => {
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

    const playerHistory = {
      player_id: playerId,
      choices: [],
      consequences: [],
      divine_favor_changes: [],
      total_choices: 0,
      last_choice_at: null
    };

    res.json({
      success: true,
      history: playerHistory
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to get player history');
    res.status(500).json({
      success: false,
      error: 'Failed to get player history'
    });
  }
});

/**
 * POST /share_clue
 * Share a clue with another player
 */
router.post('/share_clue', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
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

    if (!gameSession.players.has(to_player_id)) {
      res.status(400).json({
        success: false,
        error: 'Recipient player not in game'
      });
      return;
    }

    if (fromPlayerId === to_player_id) {
      res.status(400).json({
        success: false,
        error: 'Cannot share clue with yourself'
      });
      return;
    }

    const sharedClue = {
      clue_id,
      from_player_id: fromPlayerId,
      from_player_name: req.session.username,
      to_player_id,
      to_player_name: gameSession.players.get(to_player_id),
      shared_at: new Date().toISOString()
    };

    io.to(gameCode).emit('clue_shared', {
      to_player_id,
      from_player_name: req.session.username,
      clue_id
    });

    gameLogger.info({ fromPlayerId, toPlayerId: to_player_id, clueId: clue_id }, 'Clue shared');

    res.json({
      success: true,
      shared_clue: sharedClue,
      message: 'Clue shared successfully'
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to share clue');
    res.status(500).json({
      success: false,
      error: 'Failed to share clue'
    });
  }
});

export default router;
