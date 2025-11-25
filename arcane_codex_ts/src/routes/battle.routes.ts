/**
 * Battle System Routes
 * Handles combat, abilities, and battle state
 */

import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import GameService from '../services/game';
import BattleService from '../services/battle';
import { io } from '../server';
import { requireAuth } from './auth.routes';
import { battleLogger } from '../services/logger';
import { EnemyType } from '../types/battle';

const router = Router();

// Rate limiter for battle actions (prevent spam)
const battleActionLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 3, // 3 actions per second
  message: 'Too many battle actions, slow down!',
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * POST /start
 * Start a new battle
 */
router.post('/start', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
  const { player_id, enemy_type } = req.body;
  const playerId = player_id || req.session.player_id;

  if (!playerId) {
    res.status(400).json({
      success: false,
      error: 'Player ID required'
    });
    return;
  }

  const validEnemyTypes = Object.values(EnemyType);
  const enemyTypeEnum = enemy_type && validEnemyTypes.includes(enemy_type)
    ? enemy_type
    : EnemyType.GOBLIN_SCOUT;

  try {
    const existingBattle = BattleService.getPlayerBattle(playerId);
    if (existingBattle) {
      res.status(400).json({
        success: false,
        error: 'Already in a battle',
        battle_id: existingBattle.battleId
      });
      return;
    }

    const playerSession = GameService.getPlayerSession(playerId);
    const characterClass = playerSession?.character_class || req.session.character_class || 'warrior';

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

    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_started', {
        player_id: playerId,
        player_name: req.session.username,
        enemy: battle.enemy.name,
        battle_id: battle.battleId
      });
    }

    battleLogger.info({
      battleId: battle.battleId,
      playerId,
      enemy: battle.enemy.name
    }, 'Battle started');

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
    battleLogger.error({ error }, 'Failed to start battle');
    res.status(500).json({
      success: false,
      error: 'Failed to start battle'
    });
  }
});

/**
 * POST /:battle_id/action
 * Execute a combat action (attack, defend, or ability)
 */
router.post('/:battle_id/action', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
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

    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_action', {
        battle_id,
        player_name: req.session.username,
        action_type,
        result
      });
    }

    battleLogger.debug({ battleId: battle_id, actionType: action_type }, 'Battle action executed');

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
    battleLogger.error({ error }, 'Failed to execute action');
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to execute action'
    });
  }
});

/**
 * POST /:battle_id/use_ability
 * Use a class-specific ability
 */
router.post('/:battle_id/use_ability', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
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

    if (battle.playerId !== req.session.player_id) {
      res.status(403).json({
        success: false,
        error: 'Not your battle'
      });
      return;
    }

    const abilities = BattleService.getClassAbilities(battle.player.class);
    const ability = abilities.find(a => a.id === ability_id);

    if (!ability) {
      res.status(400).json({
        success: false,
        error: 'Invalid ability for your class'
      });
      return;
    }

    const result = BattleService.useAbility(battle_id, ability_id);

    if (!result) {
      res.status(500).json({
        success: false,
        error: 'Failed to use ability'
      });
      return;
    }

    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_ability_used', {
        battle_id,
        player_name: req.session.username,
        ability_name: ability.name,
        result
      });
    }

    battleLogger.debug({ battleId: battle_id, abilityId: ability_id }, 'Ability used');

    res.json({
      success: true,
      ability: ability.name,
      mana_cost: ability.manaCost,
      cooldown: ability.cooldown,
      ...result
    });

  } catch (error: any) {
    battleLogger.error({ error }, 'Failed to use ability');
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to use ability'
    });
  }
});

/**
 * GET /:battle_id/status
 * Get current battle status
 */
router.get('/:battle_id/status', requireAuth, (req: Request, res: Response): void => {
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
      combat_log: battle.combatLog.slice(-10),
      ability_cooldowns: battle.abilityCooldowns,
      abilities: BattleService.getClassAbilities(battle.player.class)
    });

  } catch (error) {
    battleLogger.error({ error }, 'Failed to get battle status');
    res.status(500).json({
      success: false,
      error: 'Failed to get battle status'
    });
  }
});

/**
 * POST /:battle_id/flee
 * Attempt to flee from battle
 */
router.post('/:battle_id/flee', requireAuth, battleActionLimiter, (req: Request, res: Response): void => {
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

    const result = BattleService.attemptFlee(battle_id);

    if (req.session.game_code) {
      io.to(req.session.game_code).emit('battle_flee_attempt', {
        battle_id,
        player_name: req.session.username,
        success: result.success
      });
    }

    battleLogger.info({ battleId: battle_id, fled: result.success }, 'Flee attempted');

    res.json({
      success: true,
      fled: result.success,
      flee_chance: result.fleeChance,
      message: result.success ? 'Successfully fled from battle!' : 'Failed to flee!'
    });

  } catch (error) {
    battleLogger.error({ error }, 'Failed to flee');
    res.status(500).json({
      success: false,
      error: 'Failed to flee from battle'
    });
  }
});

export default router;
