/**
 * Consequence Applier Service
 * Bridges AIGMService consequences to ConsequenceTracker and GameSessionService
 * Handles the conversion between AI GM consequence types and world state types
 */

import { v4 as uuidv4 } from 'uuid';
import { ConsequenceTracker } from './consequence_tracker';
import { GameSessionService } from './game/GameSessionService';
import { gameLogger } from './logger';
import { Server as SocketIOServer } from 'socket.io';
import {
  Consequence as AIGMConsequence,
  ConsequenceType,
  StatEffect,
  WorldEffect
} from '../types/ai_gm';
import {
  Consequence as WorldConsequence,
  ConsequenceSeverity,
  ConsequenceDuration,
  ReputationConsequence,
  WorldEventConsequence,
  CharacterEffectConsequence,
  Faction
} from '../types/world_state';

/**
 * Result of applying consequences
 */
export interface ConsequenceApplicationResult {
  success: boolean;
  appliedConsequences: string[];
  playerEffects: Map<string, PlayerEffect[]>;
  worldEffects: WorldEffectResult[];
  errors: string[];
}

export interface PlayerEffect {
  playerId: string;
  effectType: 'stat_change' | 'reputation_change' | 'unlock' | 'status';
  stat?: string;
  oldValue?: number;
  newValue?: number;
  faction?: string;
  description: string;
}

export interface WorldEffectResult {
  effectType: string;
  target: string;
  description: string;
  timestamp: number;
}

/**
 * Service for applying AI GM consequences to the game world
 */
export class ConsequenceApplier {
  private static instance: ConsequenceApplier;
  private consequenceTracker: ConsequenceTracker;
  private gameSessionService: GameSessionService;
  private io?: SocketIOServer;

  private constructor() {
    this.consequenceTracker = ConsequenceTracker.getInstance();
    this.gameSessionService = GameSessionService.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ConsequenceApplier {
    if (!ConsequenceApplier.instance) {
      ConsequenceApplier.instance = new ConsequenceApplier();
    }
    return ConsequenceApplier.instance;
  }

  /**
   * Set Socket.IO server for broadcasting
   */
  public setSocketServer(io: SocketIOServer): void {
    this.io = io;
    gameLogger.info('ConsequenceApplier connected to Socket.IO');
  }

  /**
   * Apply consequences from an AI GM scenario choice
   */
  public async applyConsequences(
    scenarioId: string,
    choiceId: string,
    playerId: string,
    partyCode: string,
    consequences: AIGMConsequence[]
  ): Promise<ConsequenceApplicationResult> {
    const result: ConsequenceApplicationResult = {
      success: true,
      appliedConsequences: [],
      playerEffects: new Map(),
      worldEffects: [],
      errors: []
    };

    gameLogger.info({ scenarioId, choiceId, playerId, consequenceCount: consequences.length },
      'Applying consequences');

    try {
      // Get game session
      const session = this.gameSessionService.getSessionByPartyCode(partyCode);

      for (const aigmConsequence of consequences) {
        try {
          // Convert and apply based on type
          await this.applyConsequence(
            aigmConsequence,
            scenarioId,
            choiceId,
            playerId,
            partyCode,
            session,
            result
          );
          result.appliedConsequences.push(aigmConsequence.id);
        } catch (error: any) {
          gameLogger.error({ error, consequenceId: aigmConsequence.id }, 'Failed to apply consequence');
          result.errors.push(`Failed to apply consequence ${aigmConsequence.id}: ${error.message}`);
        }
      }

      // Record the choice with converted consequences
      const worldConsequences = this.convertToWorldConsequences(
        consequences,
        scenarioId,
        choiceId
      );

      this.consequenceTracker.recordChoice(
        playerId,
        scenarioId,
        choiceId,
        worldConsequences
      );

      // Broadcast updates if Socket.IO is available
      if (this.io) {
        this.broadcastConsequences(partyCode, playerId, result);
      }

      // Save session state
      if (session) {
        await this.gameSessionService.saveSessionState(session.sessionId, {
          lastConsequenceApplication: Date.now(),
          consequenceCount: result.appliedConsequences.length
        });
      }

      result.success = result.errors.length === 0;
      gameLogger.info({
        scenarioId,
        appliedCount: result.appliedConsequences.length,
        errorCount: result.errors.length
      }, 'Consequences applied');

    } catch (error: any) {
      gameLogger.error({ error, scenarioId }, 'Failed to apply consequences');
      result.success = false;
      result.errors.push(`Global failure: ${error.message}`);
    }

    return result;
  }

  /**
   * Apply a single consequence
   */
  private async applyConsequence(
    consequence: AIGMConsequence,
    _scenarioId: string,
    _choiceId: string,
    playerId: string,
    _partyCode: string,
    session: any,
    result: ConsequenceApplicationResult
  ): Promise<void> {
    // Apply stat effects to players
    if (consequence.statEffects && consequence.statEffects.length > 0) {
      for (const statEffect of consequence.statEffects) {
        await this.applyStatEffect(
          statEffect,
          consequence.target,
          consequence.targetId || playerId,
          session,
          result
        );
      }
    }

    // Apply world effects
    if (consequence.worldEffects && consequence.worldEffects.length > 0) {
      for (const worldEffect of consequence.worldEffects) {
        await this.applyWorldEffect(worldEffect, playerId, result);
      }
    }

    // Log the consequence application
    gameLogger.debug({
      consequenceId: consequence.id,
      type: consequence.type,
      target: consequence.target,
      severity: consequence.severity
    }, 'Applied consequence');
  }

  /**
   * Apply a stat effect to a player
   */
  private async applyStatEffect(
    effect: StatEffect,
    target: string,
    targetId: string,
    session: any,
    result: ConsequenceApplicationResult
  ): Promise<void> {
    const affectedPlayers: string[] = [];

    // Determine affected players
    if (target === 'PARTY') {
      // Apply to all players in party
      if (session) {
        const playerKeys = Array.from(session.players.keys()) as string[];
        affectedPlayers.push(...playerKeys);
      }
    } else if (target === 'SELF' || target === 'SPECIFIC_PLAYER') {
      affectedPlayers.push(targetId);
    }

    for (const affectedPlayerId of affectedPlayers) {
      const player = session?.players.get(affectedPlayerId);
      if (!player) continue;

      let oldValue: number | undefined;
      let newValue: number | undefined;

      // Apply the stat modification
      switch (effect.stat.toLowerCase()) {
        case 'hp':
        case 'health':
          oldValue = player.hp;
          player.hp = Math.max(0, Math.min(player.maxHp, player.hp + effect.modifier));
          newValue = player.hp;
          player.isAlive = player.hp > 0;
          break;

        case 'mana':
        case 'mp':
          oldValue = player.mana;
          player.mana = Math.max(0, Math.min(player.maxMana, player.mana + effect.modifier));
          newValue = player.mana;
          break;

        case 'gold':
          oldValue = player.gold;
          player.gold = Math.max(0, player.gold + effect.modifier);
          newValue = player.gold;
          break;

        case 'experience':
        case 'xp':
          oldValue = player.experience;
          player.experience = Math.max(0, player.experience + effect.modifier);
          newValue = player.experience;
          // Check for level up
          this.checkLevelUp(player);
          break;

        default:
          gameLogger.debug({ stat: effect.stat }, 'Unknown stat effect, skipping');
          continue;
      }

      // Record the effect
      const playerEffect: PlayerEffect = {
        playerId: affectedPlayerId,
        effectType: 'stat_change',
        stat: effect.stat,
        oldValue,
        newValue,
        description: `${effect.stat} ${effect.modifier >= 0 ? '+' : ''}${effect.modifier}`
      };

      if (!result.playerEffects.has(affectedPlayerId)) {
        result.playerEffects.set(affectedPlayerId, []);
      }
      result.playerEffects.get(affectedPlayerId)!.push(playerEffect);

      gameLogger.debug({
        playerId: affectedPlayerId,
        stat: effect.stat,
        oldValue,
        newValue,
        modifier: effect.modifier
      }, 'Applied stat effect');
    }
  }

  /**
   * Check and apply level up if experience threshold reached
   */
  private checkLevelUp(player: any): void {
    const xpThreshold = player.level * 100; // Simple: 100 XP per level
    if (player.experience >= xpThreshold) {
      player.level++;
      player.experience -= xpThreshold;
      player.maxHp += 10;
      player.hp += 10;
      player.maxMana += 5;
      player.mana += 5;
      gameLogger.info({ playerId: player.playerId, newLevel: player.level }, 'Player leveled up');
    }
  }

  /**
   * Apply a world effect
   */
  private async applyWorldEffect(
    effect: WorldEffect,
    playerId: string,
    result: ConsequenceApplicationResult
  ): Promise<void> {
    const worldState = this.consequenceTracker.getWorldState();
    const effectResult: WorldEffectResult = {
      effectType: effect.type,
      target: effect.target,
      description: '',
      timestamp: Date.now()
    };

    switch (effect.type) {
      case 'FACTION_REP':
        // Apply faction reputation change
        const faction = effect.target as Faction;
        const repChange = effect.value as number;

        const playerHistory = this.consequenceTracker.getPlayerHistory(playerId);
        const currentRep = playerHistory.factionReputation.get(faction) || 0;
        playerHistory.factionReputation.set(faction, currentRep + repChange);

        effectResult.description = `${faction} reputation ${repChange >= 0 ? '+' : ''}${repChange}`;

        // Record as player effect too
        const repEffect: PlayerEffect = {
          playerId,
          effectType: 'reputation_change',
          faction: effect.target,
          oldValue: currentRep,
          newValue: currentRep + repChange,
          description: effectResult.description
        };

        if (!result.playerEffects.has(playerId)) {
          result.playerEffects.set(playerId, []);
        }
        result.playerEffects.get(playerId)!.push(repEffect);
        break;

      case 'SET_FLAG':
        worldState.globalFlags.set(effect.target, effect.value);
        effectResult.description = `Global flag "${effect.target}" set to ${effect.value}`;
        break;

      case 'SPAWN_EVENT':
        effectResult.description = `World event triggered: ${effect.target}`;
        break;

      case 'UNLOCK_LOCATION':
        effectResult.description = `Location unlocked: ${effect.target}`;
        break;

      case 'SPAWN_NPC':
        effectResult.description = `NPC appeared: ${effect.target}`;
        break;

      case 'MODIFY_QUEST':
        effectResult.description = `Quest modified: ${effect.target}`;
        break;

      default:
        effectResult.description = `Unknown world effect: ${effect.type}`;
    }

    result.worldEffects.push(effectResult);
    gameLogger.debug({ effect, description: effectResult.description }, 'Applied world effect');
  }

  /**
   * Convert AI GM consequences to world state consequences
   */
  private convertToWorldConsequences(
    aigmConsequences: AIGMConsequence[],
    scenarioId: string,
    choiceId: string
  ): WorldConsequence[] {
    return aigmConsequences.map(aigm => {
      // Map consequence type to duration
      const duration = this.mapConsequenceTypeToDuration(aigm.type);

      // Map severity
      const severity = this.mapSeverity(aigm.severity);

      // Determine world state consequence type based on effects
      let type: WorldConsequence['type'] = 'character_effect';

      if (aigm.worldEffects?.some(e => e.type === 'FACTION_REP')) {
        type = 'reputation';
      } else if (aigm.worldEffects?.some(e => e.type === 'SPAWN_EVENT')) {
        type = 'world_event';
      }

      const baseConsequence: WorldConsequence = {
        id: aigm.id || uuidv4(),
        type,
        severity,
        duration,
        description: aigm.description,
        appliedAt: Date.now(),
        scenarioId,
        choiceId,
        resolved: false
      };

      // Add type-specific fields
      if (type === 'reputation' && aigm.worldEffects) {
        const repEffect = aigm.worldEffects.find(e => e.type === 'FACTION_REP');
        if (repEffect) {
          (baseConsequence as ReputationConsequence).faction = repEffect.target as Faction;
          (baseConsequence as ReputationConsequence).change = repEffect.value as number;
          (baseConsequence as ReputationConsequence).reason = aigm.description;
        }
      } else if (type === 'world_event' && aigm.worldEffects) {
        const eventEffect = aigm.worldEffects.find(e => e.type === 'SPAWN_EVENT');
        if (eventEffect) {
          (baseConsequence as WorldEventConsequence).eventId = eventEffect.target;
          (baseConsequence as WorldEventConsequence).eventName = eventEffect.value as string || eventEffect.target;
          (baseConsequence as WorldEventConsequence).affectedRegions = [];
        }
      } else if (type === 'character_effect' && aigm.statEffects) {
        const statEffect = aigm.statEffects[0];
        if (statEffect) {
          (baseConsequence as CharacterEffectConsequence).effectType = statEffect.modifier >= 0 ? 'buff' : 'debuff';
          (baseConsequence as CharacterEffectConsequence).effectName = statEffect.stat;
          (baseConsequence as CharacterEffectConsequence).effectValue = statEffect.modifier;
        }
      }

      return baseConsequence;
    });
  }

  /**
   * Map AI GM ConsequenceType to world state ConsequenceDuration
   */
  private mapConsequenceTypeToDuration(type: ConsequenceType): ConsequenceDuration {
    switch (type) {
      case ConsequenceType.IMMEDIATE:
        return ConsequenceDuration.IMMEDIATE;
      case ConsequenceType.SHORT_TERM:
        return ConsequenceDuration.SHORT;
      case ConsequenceType.LONG_TERM:
        return ConsequenceDuration.LONG;
      case ConsequenceType.WORLD_STATE:
        return ConsequenceDuration.PERMANENT;
      default:
        return ConsequenceDuration.SHORT;
    }
  }

  /**
   * Map severity string to enum
   */
  private mapSeverity(severity: string): ConsequenceSeverity {
    const severityMap: Record<string, ConsequenceSeverity> = {
      'TRIVIAL': ConsequenceSeverity.MINOR,
      'MINOR': ConsequenceSeverity.MINOR,
      'MODERATE': ConsequenceSeverity.MODERATE,
      'MAJOR': ConsequenceSeverity.MAJOR,
      'CRITICAL': ConsequenceSeverity.CRITICAL
    };
    return severityMap[severity] || ConsequenceSeverity.MODERATE;
  }

  /**
   * Broadcast consequence results via Socket.IO
   */
  private broadcastConsequences(
    partyCode: string,
    playerId: string,
    result: ConsequenceApplicationResult
  ): void {
    if (!this.io) return;

    // Broadcast to the party room
    this.io.to(partyCode).emit('consequences_applied', {
      playerId,
      timestamp: Date.now(),
      appliedCount: result.appliedConsequences.length,
      worldEffects: result.worldEffects.map(e => ({
        type: e.effectType,
        description: e.description
      }))
    });

    // Send individual player effects privately
    for (const [affectedPlayerId, effects] of result.playerEffects.entries()) {
      // Find the socket for this player and emit directly
      this.io.to(partyCode).emit('player_effects', {
        targetPlayerId: affectedPlayerId,
        effects: effects.map(e => ({
          type: e.effectType,
          stat: e.stat,
          oldValue: e.oldValue,
          newValue: e.newValue,
          description: e.description
        })),
        timestamp: Date.now()
      });
    }
  }

  /**
   * Get active consequences for a player
   */
  public getActiveConsequences(playerId: string): WorldConsequence[] {
    return this.consequenceTracker.getActiveConsequences(playerId);
  }

  /**
   * Get player history from consequence tracker
   */
  public getPlayerHistory(playerId: string): any {
    return this.consequenceTracker.getPlayerHistory(playerId);
  }

  /**
   * Get world state from consequence tracker
   */
  public getWorldState(): any {
    return this.consequenceTracker.getWorldState();
  }

  /**
   * Resolve a consequence early
   */
  public resolveConsequence(consequenceId: string): void {
    this.consequenceTracker.resolveConsequence(consequenceId);
  }
}

export default ConsequenceApplier;
