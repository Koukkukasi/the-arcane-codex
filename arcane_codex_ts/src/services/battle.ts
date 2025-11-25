import { v4 as uuidv4 } from 'uuid';
import {
  BattleState,
  BattlePlayer,
  BattleEnemy,
  BattleAbility,
  StatusEffect,
  BattleTurnResult,
  BattleRewards,
  EnemyType,
  StatusEffectType
} from '../types/battle';
import { battleLogger } from './logger';

// In-memory battle state storage (use Redis in production)
const activeBattles = new Map<string, BattleState>();

/**
 * Enemy database with all enemy types
 */
const ENEMY_DATABASE: Record<EnemyType, Omit<BattleEnemy, 'currentHp' | 'statusEffects'>> = {
  [EnemyType.GOBLIN_SCOUT]: {
    id: 'goblin_scout',
    name: 'Goblin Scout',
    emoji: '👺',
    hp: 8,
    maxHp: 8,
    attack: 3,
    defense: 1,
    speed: 15,
    xp: 25,
    gold: 10,
    description: 'A sneaky goblin scout. Weak but cunning.',
    abilities: ['Quick Strike'],
    lootTable: ['Rusty Dagger', 'Goblin Ear', 'Small Health Potion'],
    isBoss: false
  },
  [EnemyType.SKELETON_WARRIOR]: {
    id: 'skeleton_warrior',
    name: 'Skeleton Warrior',
    emoji: '💀',
    hp: 15,
    maxHp: 15,
    attack: 5,
    defense: 3,
    speed: 10,
    xp: 50,
    gold: 20,
    description: 'An undead warrior, relentless and fearless.',
    abilities: ['Bone Slash', 'Undead Resilience'],
    lootTable: ['Ancient Bone', 'Rusty Sword', 'Health Potion'],
    isBoss: false
  },
  [EnemyType.SHADOW_ASSASSIN]: {
    id: 'shadow_assassin',
    name: 'Shadow Assassin',
    emoji: '🥷',
    hp: 12,
    maxHp: 12,
    attack: 8,
    defense: 2,
    speed: 20,
    xp: 75,
    gold: 35,
    description: 'Strikes from darkness with deadly precision.',
    abilities: ['Shadow Strike', 'Vanish', 'Critical Hit'],
    lootTable: ['Shadow Cloak', 'Assassin\'s Blade', 'Poison Vial'],
    isBoss: false
  },
  [EnemyType.FIRE_ELEMENTAL]: {
    id: 'fire_elemental',
    name: 'Fire Elemental',
    emoji: '🔥',
    hp: 20,
    maxHp: 20,
    attack: 7,
    defense: 4,
    speed: 12,
    xp: 100,
    gold: 50,
    description: 'A being of pure flame. Resistant to physical attacks.',
    abilities: ['Fireball', 'Flame Aura', 'Burning Touch'],
    lootTable: ['Fire Crystal', 'Ember Core', 'Flame Staff'],
    resistances: ['physical'],
    weaknesses: ['ice', 'water'],
    isBoss: false
  },
  [EnemyType.ICE_WRAITH]: {
    id: 'ice_wraith',
    name: 'Ice Wraith',
    emoji: '❄️',
    hp: 18,
    maxHp: 18,
    attack: 6,
    defense: 5,
    speed: 14,
    xp: 90,
    gold: 45,
    description: 'A chilling spirit that freezes its victims.',
    abilities: ['Frost Bolt', 'Ice Shield', 'Freeze'],
    lootTable: ['Frost Shard', 'Frozen Heart', 'Ice Wand'],
    resistances: ['ice'],
    weaknesses: ['fire'],
    isBoss: false
  },
  [EnemyType.CORRUPTED_PALADIN]: {
    id: 'corrupted_paladin',
    name: 'Corrupted Paladin',
    emoji: '⚔️',
    hp: 35,
    maxHp: 35,
    attack: 10,
    defense: 8,
    speed: 8,
    xp: 200,
    gold: 100,
    description: 'Once a holy warrior, now twisted by dark magic.',
    abilities: ['Dark Smite', 'Unholy Shield', 'Corruption Aura'],
    lootTable: ['Corrupted Plate', 'Dark Sword', 'Cursed Amulet'],
    isBoss: true
  },
  [EnemyType.ANCIENT_DRAGON]: {
    id: 'ancient_dragon',
    name: 'Ancient Dragon',
    emoji: '🐉',
    hp: 100,
    maxHp: 100,
    attack: 15,
    defense: 12,
    speed: 10,
    xp: 1000,
    gold: 500,
    description: 'A legendary beast of immense power and wisdom.',
    abilities: ['Dragon Breath', 'Wing Buffet', 'Tail Sweep', 'Roar'],
    lootTable: ['Dragon Scale', 'Dragon Tooth', 'Legendary Weapon'],
    resistances: ['fire', 'physical'],
    weaknesses: ['ice', 'lightning'],
    isBoss: true
  }
};

/**
 * Status effects database
 */
const STATUS_EFFECTS_DB: Record<StatusEffectType, Omit<StatusEffect, 'turnsRemaining'>> = {
  [StatusEffectType.POISON]: {
    id: 'poison',
    name: 'Poisoned',
    emoji: '🧪',
    type: 'debuff',
    description: 'Takes damage over time',
    damagePerTurn: 2,
    duration: 3,
    color: '#9333ea'
  },
  [StatusEffectType.STUN]: {
    id: 'stun',
    name: 'Stunned',
    emoji: '💫',
    type: 'debuff',
    description: 'Cannot act this turn',
    duration: 1,
    color: '#facc15'
  },
  [StatusEffectType.BURN]: {
    id: 'burn',
    name: 'Burning',
    emoji: '🔥',
    type: 'debuff',
    description: 'Takes fire damage over time',
    damagePerTurn: 3,
    duration: 2,
    color: '#ef4444'
  },
  [StatusEffectType.FREEZE]: {
    id: 'freeze',
    name: 'Frozen',
    emoji: '❄️',
    type: 'debuff',
    description: 'Cannot act and takes extra damage',
    duration: 1,
    damageMultiplier: 1.5,
    color: '#06b6d4'
  },
  [StatusEffectType.STRENGTH_BUFF]: {
    id: 'strength_buff',
    name: 'Strengthened',
    emoji: '💪',
    type: 'buff',
    description: 'Attack increased by 50%',
    attackMultiplier: 1.5,
    duration: 3,
    color: '#22c55e'
  },
  [StatusEffectType.DEFENSE_BUFF]: {
    id: 'defense_buff',
    name: 'Shielded',
    emoji: '🛡️',
    type: 'buff',
    description: 'Defense increased by 50%',
    defenseMultiplier: 1.5,
    duration: 3,
    color: '#3b82f6'
  },
  [StatusEffectType.REGENERATION]: {
    id: 'regeneration',
    name: 'Regenerating',
    emoji: '✨',
    type: 'buff',
    description: 'Restores health over time',
    healPerTurn: 3,
    duration: 3,
    color: '#10b981'
  }
};

/**
 * Class abilities database
 */
const CLASS_ABILITIES: Record<string, BattleAbility[]> = {
  WARRIOR: [
    {
      id: 'power_strike',
      name: 'Power Strike',
      emoji: '⚔️',
      description: 'A mighty blow dealing 150% damage',
      manaCost: 10,
      damage: 1.5,
      cooldown: 2,
    },
    {
      id: 'battle_cry',
      name: 'Battle Cry',
      emoji: '📢',
      description: 'Increases attack for 3 turns',
      manaCost: 15,
      damage: 0,
      cooldown: 4,
      effect: StatusEffectType.STRENGTH_BUFF
    },
    {
      id: 'shield_wall',
      name: 'Shield Wall',
      emoji: '🛡️',
      description: 'Increases defense for 3 turns',
      manaCost: 15,
      damage: 0,
      cooldown: 4,
      effect: StatusEffectType.DEFENSE_BUFF
    }
  ],
  MAGE: [
    {
      id: 'fireball',
      name: 'Fireball',
      emoji: '🔥',
      description: 'Hurls a ball of flame dealing high damage',
      manaCost: 20,
      damage: 2.0,
      cooldown: 3,
      effect: StatusEffectType.BURN,
      effectChance: 0.3
    },
    {
      id: 'ice_lance',
      name: 'Ice Lance',
      emoji: '❄️',
      description: 'Piercing ice that may freeze the enemy',
      manaCost: 18,
      damage: 1.8,
      cooldown: 3,
      effect: StatusEffectType.FREEZE,
      effectChance: 0.5
    },
    {
      id: 'arcane_shield',
      name: 'Arcane Shield',
      emoji: '🔮',
      description: 'Magical barrier that absorbs damage',
      manaCost: 25,
      damage: 0,
      cooldown: 5,
      effect: StatusEffectType.DEFENSE_BUFF
    }
  ],
  ROGUE: [
    {
      id: 'backstab',
      name: 'Backstab',
      emoji: '🗡️',
      description: 'Critical strike from shadows',
      manaCost: 12,
      damage: 2.2,
      cooldown: 2,
    },
    {
      id: 'poison_dagger',
      name: 'Poison Dagger',
      emoji: '🧪',
      description: 'Strikes with poisoned blade',
      manaCost: 15,
      damage: 1.2,
      cooldown: 3,
      effect: StatusEffectType.POISON,
      effectChance: 0.8
    },
    {
      id: 'vanish',
      name: 'Vanish',
      emoji: '💨',
      description: 'Becomes untargetable for 1 turn',
      manaCost: 20,
      damage: 0,
      cooldown: 5,
      special: 'dodge_next'
    }
  ],
  PALADIN: [
    {
      id: 'divine_smite',
      name: 'Divine Smite',
      emoji: '⚡',
      description: 'Holy power smites the enemy',
      manaCost: 18,
      damage: 1.8,
      cooldown: 3,
    },
    {
      id: 'lay_on_hands',
      name: 'Lay on Hands',
      emoji: '✋',
      description: 'Heals self for 20 HP',
      manaCost: 25,
      damage: 0,
      cooldown: 4,
      special: 'heal_20'
    },
    {
      id: 'holy_aura',
      name: 'Holy Aura',
      emoji: '✨',
      description: 'Grants regeneration for 3 turns',
      manaCost: 20,
      damage: 0,
      cooldown: 5,
      effect: StatusEffectType.REGENERATION
    }
  ]
};

/**
 * Battle Service - Manages all battle logic
 */
export class BattleService {
  /**
   * Start a new battle
   */
  static startBattle(
    playerId: string,
    playerData: Partial<BattlePlayer>,
    enemyType: EnemyType = EnemyType.GOBLIN_SCOUT
  ): BattleState {
    const battleId = uuidv4();

    // Create enemy from template
    const enemyTemplate = ENEMY_DATABASE[enemyType];
    const enemy: BattleEnemy = {
      ...enemyTemplate,
      currentHp: enemyTemplate.hp,
      statusEffects: []
    };

    // Create player state
    const player: BattlePlayer = {
      id: playerId,
      name: playerData.name || 'Hero',
      class: playerData.class || 'WARRIOR',
      hp: playerData.hp || 100,
      maxHp: playerData.maxHp || 100,
      currentHp: playerData.currentHp || playerData.hp || 100,
      mana: playerData.mana || 50,
      maxMana: playerData.maxMana || 50,
      currentMana: playerData.currentMana || playerData.mana || 50,
      attack: playerData.attack || 5,
      defense: playerData.defense || 2,
      speed: playerData.speed || 10,
      level: playerData.level || 1,
      xp: playerData.xp || 0,
      gold: playerData.gold || 0,
      statusEffects: []
    };

    // Calculate turn order
    const turnOrder = player.speed >= enemy.speed ? ['player', 'enemy'] : ['enemy', 'player'];
    const isPlayerTurn = turnOrder[0] === 'player';

    // Create battle state
    const battleState: BattleState = {
      battleId,
      playerId,
      player,
      enemy,
      turnCount: 0,
      isPlayerTurn,
      turnOrder,
      started: Date.now(),
      combatLog: [],
      abilityCooldowns: {}
    };

    // Store battle
    activeBattles.set(battleId, battleState);

    // Add initial log
    this.addLogEntry(battleState, `Battle started against ${enemy.name}!`, 'system');

    battleLogger.info({ battleId, playerName: player.name, enemyName: enemy.name }, 'Battle started');
    return battleState;
  }

  /**
   * Get battle state
   */
  static getBattle(battleId: string): BattleState | undefined {
    return activeBattles.get(battleId);
  }

  /**
   * Get player's active battle
   */
  static getPlayerBattle(playerId: string): BattleState | undefined {
    for (const battle of activeBattles.values()) {
      if (battle.playerId === playerId && !battle.ended) {
        return battle;
      }
    }
    return undefined;
  }

  /**
   * Execute basic attack action
   */
  static executeAttack(battleId: string): BattleTurnResult | null {
    const battle = activeBattles.get(battleId);
    if (!battle) return null;

    if (!battle.isPlayerTurn) {
      throw new Error('Not player turn');
    }

    const combatLog: string[] = [];

    // Calculate player damage
    let damage = battle.player.attack + Math.floor(Math.random() * 3);

    // Apply strength buff
    const strengthBuff = battle.player.statusEffects.find(e => e.id === 'strength_buff');
    if (strengthBuff && strengthBuff.attackMultiplier) {
      damage = Math.floor(damage * strengthBuff.attackMultiplier);
    }

    // Apply enemy defense
    damage = Math.max(1, damage - battle.enemy.defense);

    // Apply damage
    battle.enemy.currentHp = Math.max(0, battle.enemy.currentHp - damage);
    this.addLogEntry(battle, `You attack for ${damage} damage!`, 'player');
    combatLog.push(`You attack for ${damage} damage!`);

    // Check for victory
    if (battle.enemy.currentHp <= 0) {
      return this.handleVictory(battle, combatLog);
    }

    // Enemy turn
    return this.executeEnemyTurn(battle, combatLog);
  }

  /**
   * Execute defend action
   */
  static executeDefend(battleId: string): BattleTurnResult | null {
    const battle = activeBattles.get(battleId);
    if (!battle) return null;

    if (!battle.isPlayerTurn) {
      throw new Error('Not player turn');
    }

    const combatLog: string[] = [];

    // Apply defense buff for this turn
    this.applyStatusEffect(battle, battle.player, StatusEffectType.DEFENSE_BUFF);
    this.addLogEntry(battle, 'You take a defensive stance!', 'player');
    combatLog.push('You take a defensive stance!');

    // Enemy turn
    return this.executeEnemyTurn(battle, combatLog);
  }

  /**
   * Use ability
   */
  static useAbility(battleId: string, abilityId: string): BattleTurnResult | null {
    const battle = activeBattles.get(battleId);
    if (!battle) return null;

    if (!battle.isPlayerTurn) {
      throw new Error('Not player turn');
    }

    // Get ability
    const classAbilities = CLASS_ABILITIES[battle.player.class.toUpperCase()] || CLASS_ABILITIES.WARRIOR;
    const ability = classAbilities.find(a => a.id === abilityId);

    if (!ability) {
      throw new Error('Invalid ability');
    }

    // Check mana
    if (battle.player.currentMana < ability.manaCost) {
      throw new Error('Not enough mana');
    }

    // Check cooldown
    if (battle.abilityCooldowns[abilityId] && battle.abilityCooldowns[abilityId] > 0) {
      throw new Error('Ability on cooldown');
    }

    const combatLog: string[] = [];

    // Deduct mana
    battle.player.currentMana -= ability.manaCost;

    // Handle special abilities
    if (ability.special === 'heal_20') {
      const healAmount = 20;
      battle.player.currentHp = Math.min(battle.player.maxHp, battle.player.currentHp + healAmount);
      this.addLogEntry(battle, `You used ${ability.name}! Healed for ${healAmount} HP!`, 'player');
      combatLog.push(`You used ${ability.name}! Healed for ${healAmount} HP!`);
    } else if (ability.damage > 0) {
      // Calculate damage
      let damage = Math.floor(battle.player.attack * ability.damage);

      // Apply strength buff
      const strengthBuff = battle.player.statusEffects.find(e => e.id === 'strength_buff');
      if (strengthBuff && strengthBuff.attackMultiplier) {
        damage = Math.floor(damage * strengthBuff.attackMultiplier);
      }

      // Apply damage
      battle.enemy.currentHp = Math.max(0, battle.enemy.currentHp - damage);
      this.addLogEntry(battle, `You used ${ability.name}! Dealt ${damage} damage!`, 'player');
      combatLog.push(`You used ${ability.name}! Dealt ${damage} damage!`);

      // Check for victory
      if (battle.enemy.currentHp <= 0) {
        return this.handleVictory(battle, combatLog);
      }
    }

    // Apply status effect
    if (ability.effect) {
      const effectChance = ability.effectChance || 1.0;
      if (Math.random() < effectChance) {
        const target = ability.damage > 0 ? battle.enemy : battle.player;
        this.applyStatusEffect(battle, target, ability.effect as StatusEffectType);
        combatLog.push(`Applied ${ability.effect}!`);
      }
    }

    // Set cooldown
    battle.abilityCooldowns[abilityId] = ability.cooldown;

    // Enemy turn
    return this.executeEnemyTurn(battle, combatLog);
  }

  /**
   * Execute enemy turn
   */
  private static executeEnemyTurn(battle: BattleState, combatLog: string[]): BattleTurnResult {
    // Process status effects first
    this.processStatusEffects(battle, combatLog);

    // Reduce cooldowns
    this.reduceCooldowns(battle);

    // Increment turn count
    battle.turnCount++;

    // Check if enemy is stunned or frozen
    const stunned = battle.enemy.statusEffects.find(e => e.id === 'stun' || e.id === 'freeze');
    if (stunned) {
      this.addLogEntry(battle, `${battle.enemy.name} is ${stunned.name} and cannot act!`, 'buff');
      combatLog.push(`${battle.enemy.name} is ${stunned.name} and cannot act!`);
      battle.isPlayerTurn = true;

      return {
        damage: 0,
        statusEffects: [...battle.player.statusEffects, ...battle.enemy.statusEffects],
        enemyHp: battle.enemy.currentHp,
        playerHp: battle.player.currentHp,
        turnResult: 'Enemy stunned',
        combatLog
      };
    }

    // Enemy attacks
    let enemyDamage = battle.enemy.attack + Math.floor(Math.random() * 3);

    // Apply player's defense
    let playerDefense = battle.player.defense;
    const defenseBuff = battle.player.statusEffects.find(e => e.id === 'defense_buff');
    if (defenseBuff && defenseBuff.defenseMultiplier) {
      playerDefense = Math.floor(playerDefense * defenseBuff.defenseMultiplier);
    }

    enemyDamage = Math.max(1, enemyDamage - playerDefense);

    // Apply damage
    battle.player.currentHp = Math.max(0, battle.player.currentHp - enemyDamage);
    this.addLogEntry(battle, `${battle.enemy.name} attacks! You take ${enemyDamage} damage!`, 'enemy');
    combatLog.push(`${battle.enemy.name} attacks! You take ${enemyDamage} damage!`);

    // Check for defeat
    if (battle.player.currentHp <= 0) {
      return this.handleDefeat(battle, combatLog);
    }

    // Player's turn
    battle.isPlayerTurn = true;

    return {
      damage: 0,
      statusEffects: [...battle.player.statusEffects, ...battle.enemy.statusEffects],
      enemyHp: battle.enemy.currentHp,
      playerHp: battle.player.currentHp,
      turnResult: 'Turn complete',
      enemyDamage,
      combatLog
    };
  }

  /**
   * Process status effects
   */
  private static processStatusEffects(battle: BattleState, combatLog: string[]): void {
    // Process player status effects
    battle.player.statusEffects = battle.player.statusEffects.filter(effect => {
      effect.turnsRemaining--;

      // Apply damage
      if (effect.damagePerTurn) {
        battle.player.currentHp = Math.max(0, battle.player.currentHp - effect.damagePerTurn);
        this.addLogEntry(battle, `${effect.name} deals ${effect.damagePerTurn} damage to you!`, 'debuff');
        combatLog.push(`${effect.name} deals ${effect.damagePerTurn} damage to you!`);
      }

      // Apply healing
      if (effect.healPerTurn) {
        const healAmount = effect.healPerTurn;
        battle.player.currentHp = Math.min(battle.player.maxHp, battle.player.currentHp + healAmount);
        this.addLogEntry(battle, `${effect.name} heals you for ${healAmount} HP!`, 'buff');
        combatLog.push(`${effect.name} heals you for ${healAmount} HP!`);
      }

      return effect.turnsRemaining > 0;
    });

    // Process enemy status effects
    battle.enemy.statusEffects = battle.enemy.statusEffects.filter(effect => {
      effect.turnsRemaining--;

      // Apply damage
      if (effect.damagePerTurn) {
        battle.enemy.currentHp = Math.max(0, battle.enemy.currentHp - effect.damagePerTurn);
        this.addLogEntry(battle, `${effect.name} deals ${effect.damagePerTurn} damage to ${battle.enemy.name}!`, 'buff');
        combatLog.push(`${effect.name} deals ${effect.damagePerTurn} damage to ${battle.enemy.name}!`);
      }

      return effect.turnsRemaining > 0;
    });
  }

  /**
   * Reduce ability cooldowns
   */
  private static reduceCooldowns(battle: BattleState): void {
    for (const abilityId in battle.abilityCooldowns) {
      if (battle.abilityCooldowns[abilityId] > 0) {
        battle.abilityCooldowns[abilityId]--;
      }
    }
  }

  /**
   * Apply status effect
   */
  private static applyStatusEffect(
    battle: BattleState,
    target: BattlePlayer | BattleEnemy,
    effectType: StatusEffectType
  ): void {
    const effectTemplate = STATUS_EFFECTS_DB[effectType];
    const effect: StatusEffect = {
      ...effectTemplate,
      turnsRemaining: effectTemplate.duration
    };

    target.statusEffects.push(effect);

    const targetName = 'currentMana' in target ? 'You' : battle.enemy.name;
    const logType = effect.type === 'buff' ? 'buff' : 'debuff';
    this.addLogEntry(battle, `${targetName} are now ${effect.name}!`, logType);
  }

  /**
   * Handle battle victory
   */
  private static handleVictory(battle: BattleState, combatLog: string[]): BattleTurnResult {
    battle.ended = Date.now();
    battle.isVictory = true;

    this.addLogEntry(battle, `Victory! ${battle.enemy.name} defeated!`, 'victory');
    this.addLogEntry(battle, `You gained ${battle.enemy.xp} XP and ${battle.enemy.gold} gold!`, 'victory');
    combatLog.push(`Victory! ${battle.enemy.name} defeated!`);
    combatLog.push(`You gained ${battle.enemy.xp} XP and ${battle.enemy.gold} gold!`);

    return {
      damage: 0,
      statusEffects: battle.player.statusEffects,
      enemyHp: 0,
      playerHp: battle.player.currentHp,
      turnResult: 'Victory!',
      isVictory: true,
      combatLog
    };
  }

  /**
   * Handle battle defeat
   */
  private static handleDefeat(battle: BattleState, combatLog: string[]): BattleTurnResult {
    battle.ended = Date.now();
    battle.isVictory = false;

    this.addLogEntry(battle, 'You have been defeated...', 'defeat');
    combatLog.push('You have been defeated...');

    return {
      damage: 0,
      statusEffects: battle.player.statusEffects,
      enemyHp: battle.enemy.currentHp,
      playerHp: 0,
      turnResult: 'Defeat...',
      isDefeat: true,
      combatLog
    };
  }

  /**
   * Attempt to flee from battle
   */
  static attemptFlee(battleId: string): { success: boolean; fleeChance: number } {
    const battle = activeBattles.get(battleId);
    if (!battle) {
      throw new Error('Battle not found');
    }

    // Calculate flee chance based on speed difference
    const speedDiff = battle.player.speed - battle.enemy.speed;
    const baseChance = 0.5;
    const fleeChance = Math.max(0.2, Math.min(0.9, baseChance + (speedDiff * 0.05)));

    const success = Math.random() < fleeChance;

    if (success) {
      battle.ended = Date.now();
      this.addLogEntry(battle, 'You successfully fled from battle!', 'system');
      activeBattles.delete(battleId);
    } else {
      this.addLogEntry(battle, 'Failed to flee!', 'error');
      // Enemy gets a free attack
      const damage = Math.max(1, battle.enemy.attack - battle.player.defense);
      battle.player.currentHp = Math.max(0, battle.player.currentHp - damage);
      this.addLogEntry(battle, `${battle.enemy.name} attacks as you flee! ${damage} damage!`, 'enemy');
    }

    return { success, fleeChance };
  }

  /**
   * Get battle rewards
   */
  static getBattleRewards(battleId: string): BattleRewards {
    const battle = activeBattles.get(battleId);
    if (!battle || !battle.isVictory) {
      return { xp: 0, gold: 0, loot: [] };
    }

    // Roll for loot (50% chance per item)
    const loot = battle.enemy.lootTable.filter(() => Math.random() > 0.5);

    return {
      xp: battle.enemy.xp,
      gold: battle.enemy.gold,
      loot
    };
  }

  /**
   * Get class abilities
   */
  static getClassAbilities(characterClass: string): BattleAbility[] {
    return CLASS_ABILITIES[characterClass.toUpperCase()] || CLASS_ABILITIES.WARRIOR;
  }

  /**
   * Add log entry
   */
  private static addLogEntry(
    battle: BattleState,
    message: string,
    type: 'player' | 'enemy' | 'system' | 'buff' | 'debuff' | 'victory' | 'defeat' | 'error'
  ): void {
    battle.combatLog.push({
      message,
      type,
      timestamp: Date.now(),
      turn: battle.turnCount
    });

    // Keep only last 50 entries
    if (battle.combatLog.length > 50) {
      battle.combatLog.shift();
    }
  }

  /**
   * Clean up ended battles
   */
  static cleanupBattles(maxAgeMinutes = 30): void {
    const now = Date.now();
    const maxAge = maxAgeMinutes * 60 * 1000;

    for (const [battleId, battle] of activeBattles.entries()) {
      if (battle.ended && now - battle.ended > maxAge) {
        activeBattles.delete(battleId);
        battleLogger.debug({ battleId }, 'Battle cleaned up');
      }
    }
  }
}

export default BattleService;
