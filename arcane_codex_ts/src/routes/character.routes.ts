/**
 * Character Routes
 * Handles character class selection and divine favor
 */

import { Router, Request, Response } from 'express';
import GameService from '../services/game';
import { getMCPService } from '../services/mcp';
import { io } from '../server';
import { requireAuth, requireGameSession } from './auth.routes';
import { gameLogger } from '../services/logger';

const router = Router();
const mcpService = getMCPService();

const VALID_CLASSES = ['warrior', 'mage', 'rogue', 'cleric', 'ranger'];

/**
 * POST /set_character_class
 * Set the player's character class
 */
router.post('/set_character_class', requireAuth, requireGameSession, (req: Request, res: Response): void => {
  const { character_class } = req.body;
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  if (!character_class || !VALID_CLASSES.includes(character_class)) {
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

    io.to(gameCode).emit('player_class_selected', {
      player_id: playerId,
      player_name: req.session.username,
      character_class
    });

    gameLogger.info({ playerId, characterClass: character_class }, 'Character class selected');

    res.json({
      success: true,
      character_class,
      message: `Selected ${character_class} class`
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to set character class');
    res.status(500).json({
      success: false,
      error: 'Failed to set character class'
    });
  }
});

/**
 * GET /divine_favor
 * Get the player's divine favor with each god
 */
router.get('/divine_favor', requireAuth, (req: Request, res: Response): void => {
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
    gameLogger.error({ error }, 'Failed to get divine favor');
    res.status(500).json({
      success: false,
      error: 'Failed to get divine favor'
    });
  }
});

/**
 * POST /start_interrogation
 * Start the divine interrogation process
 */
router.post('/start_interrogation', requireAuth, requireGameSession, async (req: Request, res: Response): Promise<void> => {
  const playerId = req.session.player_id!;
  const gameCode = req.session.game_code!;

  try {
    const gameSession = GameService.getGameSession(gameCode);
    if (gameSession && gameSession.interrogation_complete.has(playerId)) {
      res.status(400).json({
        success: false,
        error: 'Interrogation already completed'
      });
      return;
    }

    const result = GameService.startInterrogation(playerId);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    req.session.current_question = 1;
    req.session.answers = {};

    let question = result.question;
    if (mcpService.checkAvailability()) {
      try {
        question = await mcpService.generateInterrogationQuestion(playerId, 1, []);
      } catch (error) {
        gameLogger.warn({ error }, 'MCP failed to generate question, using mock');
      }
    }

    gameLogger.info({ playerId }, 'Interrogation started');

    res.json({
      success: true,
      question,
      message: 'Divine Interrogation has begun'
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to start interrogation');
    res.status(500).json({
      success: false,
      error: 'Failed to start interrogation'
    });
  }
});

/**
 * POST /answer_question
 * Answer an interrogation question
 */
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
    const result = GameService.answerQuestion(playerId, question_number, answer_id);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.error
      });
      return;
    }

    if (!req.session.answers) {
      req.session.answers = {};
    }
    req.session.answers[question_number] = answer_id;

    if (result.completed) {
      const finalResults = GameService.getInterrogationResults(playerId);

      io.to(gameCode).emit('interrogation_complete', {
        player_id: playerId,
        player_name: req.session.username,
        patron_god: finalResults.results?.patron_god
      });

      gameLogger.info({ playerId, patronGod: finalResults.results?.patron_god }, 'Interrogation completed');

      res.json({
        success: true,
        completed: true,
        results: finalResults.results,
        message: 'Divine Interrogation complete!'
      });
      return;
    }

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
        gameLogger.warn({ error }, 'MCP failed to generate question, using mock');
      }
    }

    res.json({
      success: true,
      completed: false,
      next_question: nextQuestion,
      current_question: result.nextQuestion?.question_number
    });

  } catch (error) {
    gameLogger.error({ error }, 'Failed to answer question');
    res.status(500).json({
      success: false,
      error: 'Failed to process answer'
    });
  }
});

export default router;
