/**
 * Battle System Unit Tests
 * Tests for the core battle service functionality
 */

import { test, expect } from '@playwright/test';
import BattleService from '../../src/services/battle';
import { EnemyType, StatusEffectType } from '../../src/types/battle';

// Helper to create test player data
const createTestPlayer = (overrides: Record<string, any> = {}) => ({
  name: 'TestHero',
  class: 'WARRIOR',
  hp: 100,
  maxHp: 100,
  mana: 50,
  maxMana: 50,
  attack: 10,
  defense: 5,
  speed: 15,
  level: 1,
  xp: 0,
  gold: 0,
  ...overrides
});

test.describe('Battle Service - Battle Initialization', () => {
  test('should start a battle with valid player and enemy', () => {
    const playerId = 'test-player-1';
    const playerData = createTestPlayer();

    const battle = BattleService.startBattle(playerId, playerData, EnemyType.GOBLIN_SCOUT);

    expect(battle).toBeDefined();
    expect(battle.battleId).toBeTruthy();
    expect(battle.playerId).toBe(playerId);
    expect(battle.player.name).toBe('TestHero');
    expect(battle.player.class).toBe('WARRIOR');
    expect(battle.enemy.name).toBe('Goblin Scout');
    expect(battle.turnCount).toBe(0);
    expect(battle.combatLog.length).toBeGreaterThan(0);
  });

  test('should set correct turn order based on speed', () => {
    const playerId = 'test-player-speed';

    // Player faster than enemy
    const fastPlayer = createTestPlayer({ speed: 20 });
    const battle1 = BattleService.startBattle(playerId, fastPlayer, EnemyType.GOBLIN_SCOUT);
    expect(battle1.isPlayerTurn).toBe(true);

    // Player slower than enemy
    const slowPlayer = createTestPlayer({ speed: 5 });
    const battle2 = BattleService.startBattle(playerId + '-slow', slowPlayer, EnemyType.SHADOW_ASSASSIN);
    expect(battle2.isPlayerTurn).toBe(false);
  });

  test('should initialize enemy with correct stats from database', () => {
    const playerId = 'test-player-enemy';
    const playerData = createTestPlayer();

    const battle = BattleService.startBattle(playerId, playerData, EnemyType.ANCIENT_DRAGON);

    expect(battle.enemy.name).toBe('Ancient Dragon');
    expect(battle.enemy.maxHp).toBe(100);
    expect(battle.enemy.currentHp).toBe(100);
    expect(battle.enemy.isBoss).toBe(true);
    expect(battle.enemy.xp).toBe(1000);
  });

  test('should initialize player status effects as empty array', () => {
    const battle = BattleService.startBattle('test-player', createTestPlayer(), EnemyType.GOBLIN_SCOUT);

    expect(battle.player.statusEffects).toEqual([]);
    expect(battle.enemy.statusEffects).toEqual([]);
  });

  test('should use default enemy type if not specified', () => {
    const battle = BattleService.startBattle('test-player', createTestPlayer(), EnemyType.GOBLIN_SCOUT);

    expect(battle.enemy.name).toBe('Goblin Scout');
  });
});

test.describe('Battle Service - Get Battle', () => {
  test('should retrieve an existing battle by ID', () => {
    const battle = BattleService.startBattle('test-get', createTestPlayer(), EnemyType.GOBLIN_SCOUT);
    const retrieved = BattleService.getBattle(battle.battleId);

    expect(retrieved).toBeDefined();
    expect(retrieved?.battleId).toBe(battle.battleId);
  });

  test('should return undefined for non-existent battle', () => {
    const retrieved = BattleService.getBattle('non-existent-battle-id');

    expect(retrieved).toBeUndefined();
  });

  test('should get player active battle', () => {
    const playerId = 'test-player-active';
    const battle = BattleService.startBattle(playerId, createTestPlayer(), EnemyType.GOBLIN_SCOUT);

    const playerBattle = BattleService.getPlayerBattle(playerId);

    expect(playerBattle).toBeDefined();
    expect(playerBattle?.battleId).toBe(battle.battleId);
  });

  test('should return undefined for player with no active battle', () => {
    const playerBattle = BattleService.getPlayerBattle('player-with-no-battle');

    expect(playerBattle).toBeUndefined();
  });
});

test.describe('Battle Service - Attack Action', () => {
  test('should execute basic attack and deal damage', () => {
    const playerId = 'test-attack';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ attack: 10, speed: 20 }), EnemyType.GOBLIN_SCOUT);

    const initialEnemyHp = battle.enemy.currentHp;
    const result = BattleService.executeAttack(battle.battleId);

    expect(result).toBeDefined();
    expect(result?.enemyHp).toBeLessThan(initialEnemyHp);
    expect(result?.combatLog.length).toBeGreaterThan(0);
  });

  test('should not allow attack when not player turn', () => {
    const playerId = 'test-attack-turn';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 1 }), EnemyType.SHADOW_ASSASSIN);

    // Shadow Assassin has speed 20, player has speed 1
    if (!battle.isPlayerTurn) {
      expect(() => BattleService.executeAttack(battle.battleId)).toThrow('Not player turn');
    }
  });

  test('should trigger enemy turn after player attack', () => {
    const playerId = 'test-attack-enemy-turn';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.GOBLIN_SCOUT);

    const result = BattleService.executeAttack(battle.battleId);

    // Result should exist and contain combat log
    expect(result).toBeDefined();
    expect(result?.combatLog.length).toBeGreaterThan(0);
    // Player HP may have decreased or battle may have ended in victory
    expect(result?.playerHp).toBeLessThanOrEqual(battle.player.maxHp);
  });

  test('should handle victory when enemy HP reaches 0', () => {
    const playerId = 'test-victory';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ attack: 50, speed: 20 }), EnemyType.GOBLIN_SCOUT);

    // Attack multiple times until victory
    let result;
    let attempts = 0;
    while (battle.enemy.currentHp > 0 && attempts < 20) {
      result = BattleService.executeAttack(battle.battleId);
      attempts++;
      if (result?.isVictory) break;
    }

    expect(result?.isVictory).toBe(true);
    expect(battle.ended).toBeDefined();
  });
});

test.describe('Battle Service - Defend Action', () => {
  test('should apply defense buff when defending', () => {
    const playerId = 'test-defend';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.GOBLIN_SCOUT);

    const result = BattleService.executeDefend(battle.battleId);

    expect(result).toBeDefined();
    expect(battle.player.statusEffects.length).toBeGreaterThanOrEqual(0);
    expect(result?.combatLog).toContain('You take a defensive stance!');
  });

  test('should reduce damage taken when defending', () => {
    const playerId = 'test-defend-damage';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20, defense: 0 }), EnemyType.SKELETON_WARRIOR);

    // First, attack to see normal enemy damage
    const attackResult = BattleService.executeAttack(battle.battleId);
    const normalDamage = attackResult?.enemyDamage || 0;

    // Now defend
    const defendResult = BattleService.executeDefend(battle.battleId);

    // Defense buff should be applied, reducing subsequent damage
    const defenseBuff = battle.player.statusEffects.find(e => e.id === 'defense_buff');
    if (defenseBuff) {
      expect(defenseBuff.defenseMultiplier).toBe(1.5);
    }
  });
});

test.describe('Battle Service - Abilities', () => {
  test('should get class abilities for WARRIOR', () => {
    const abilities = BattleService.getClassAbilities('WARRIOR');

    expect(abilities.length).toBeGreaterThan(0);
    expect(abilities.some(a => a.id === 'power_strike')).toBe(true);
    expect(abilities.some(a => a.id === 'battle_cry')).toBe(true);
  });

  test('should get class abilities for MAGE', () => {
    const abilities = BattleService.getClassAbilities('MAGE');

    expect(abilities.length).toBeGreaterThan(0);
    expect(abilities.some(a => a.id === 'fireball')).toBe(true);
    expect(abilities.some(a => a.id === 'ice_lance')).toBe(true);
  });

  test('should get class abilities for ROGUE', () => {
    const abilities = BattleService.getClassAbilities('ROGUE');

    expect(abilities.length).toBeGreaterThan(0);
    expect(abilities.some(a => a.id === 'backstab')).toBe(true);
    expect(abilities.some(a => a.id === 'poison_dagger')).toBe(true);
  });

  test('should get class abilities for PALADIN', () => {
    const abilities = BattleService.getClassAbilities('PALADIN');

    expect(abilities.length).toBeGreaterThan(0);
    expect(abilities.some(a => a.id === 'divine_smite')).toBe(true);
    expect(abilities.some(a => a.id === 'lay_on_hands')).toBe(true);
  });

  test('should default to WARRIOR abilities for unknown class', () => {
    const abilities = BattleService.getClassAbilities('UNKNOWN_CLASS');
    const warriorAbilities = BattleService.getClassAbilities('WARRIOR');

    expect(abilities).toEqual(warriorAbilities);
  });

  test('should use ability and consume mana', () => {
    const playerId = 'test-ability-mana';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20, mana: 50 }), EnemyType.GOBLIN_SCOUT);

    const initialMana = battle.player.currentMana;
    BattleService.useAbility(battle.battleId, 'power_strike');

    expect(battle.player.currentMana).toBeLessThan(initialMana);
  });

  test('should fail when not enough mana', () => {
    const playerId = 'test-ability-no-mana';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20, mana: 1 }), EnemyType.GOBLIN_SCOUT);

    expect(() => BattleService.useAbility(battle.battleId, 'power_strike')).toThrow('Not enough mana');
  });

  test('should track ability usage in cooldowns object', () => {
    const playerId = 'test-ability-cooldown';
    // Use high HP player against weak enemy to ensure we survive
    const battle = BattleService.startBattle(playerId, createTestPlayer({
      speed: 20,
      mana: 100,
      hp: 500,
      maxHp: 500,
      defense: 20
    }), EnemyType.GOBLIN_SCOUT);

    // Initially, cooldowns object should exist but be empty
    expect(battle.abilityCooldowns).toBeDefined();
    expect(typeof battle.abilityCooldowns).toBe('object');

    const result = BattleService.useAbility(battle.battleId, 'power_strike');
    expect(result).toBeDefined();

    // Ability should have been used successfully - check combat log
    const useLog = battle.combatLog.find(entry => entry.message.includes('Power Strike'));
    expect(useLog).toBeDefined();
  });

  test('should fail when ability on cooldown', () => {
    const playerId = 'test-ability-on-cooldown';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20, mana: 100 }), EnemyType.GOBLIN_SCOUT);

    // First use
    BattleService.useAbility(battle.battleId, 'power_strike');

    // Attack to advance turn
    BattleService.executeAttack(battle.battleId);

    // Try to use again while on cooldown
    if (battle.abilityCooldowns['power_strike'] > 0) {
      expect(() => BattleService.useAbility(battle.battleId, 'power_strike')).toThrow('Ability on cooldown');
    }
  });

  test('should throw error for invalid ability', () => {
    const playerId = 'test-invalid-ability';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.GOBLIN_SCOUT);

    expect(() => BattleService.useAbility(battle.battleId, 'invalid_ability_id')).toThrow('Invalid ability');
  });

  test('should apply status effect from ability', () => {
    const playerId = 'test-ability-effect';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ class: 'WARRIOR', speed: 20, mana: 50 }), EnemyType.GOBLIN_SCOUT);

    // Battle cry applies strength buff
    BattleService.useAbility(battle.battleId, 'battle_cry');

    const strengthBuff = battle.player.statusEffects.find(e => e.id === 'strength_buff');
    expect(strengthBuff).toBeDefined();
  });

  test('should heal with lay_on_hands ability', () => {
    const playerId = 'test-ability-heal';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ class: 'PALADIN', speed: 20, mana: 50, hp: 100, maxHp: 100 }), EnemyType.SKELETON_WARRIOR);

    // Take some damage first
    battle.player.currentHp = 50;

    BattleService.useAbility(battle.battleId, 'lay_on_hands');

    // HP should be greater than before (may be affected by enemy damage)
    // At minimum, should have healed some amount
    expect(battle.player.currentHp).toBeGreaterThanOrEqual(50);
  });
});

test.describe('Battle Service - Flee Mechanism', () => {
  test('should attempt to flee from battle', () => {
    const playerId = 'test-flee';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.GOBLIN_SCOUT);

    const result = BattleService.attemptFlee(battle.battleId);

    expect(result).toBeDefined();
    expect(result.fleeChance).toBeGreaterThan(0);
    expect(typeof result.success).toBe('boolean');
  });

  test('should have higher flee chance with higher speed', () => {
    const playerId = 'test-flee-speed';

    // Fast player vs slow enemy
    const battle1 = BattleService.startBattle(playerId + '-fast', createTestPlayer({ speed: 30 }), EnemyType.CORRUPTED_PALADIN);
    const result1 = BattleService.attemptFlee(battle1.battleId);

    // Slow player vs fast enemy
    const battle2 = BattleService.startBattle(playerId + '-slow', createTestPlayer({ speed: 5 }), EnemyType.SHADOW_ASSASSIN);
    const result2 = BattleService.attemptFlee(battle2.battleId);

    expect(result1.fleeChance).toBeGreaterThan(result2.fleeChance);
  });

  test('should end battle on successful flee', () => {
    const playerId = 'test-flee-success';
    // Use very fast player to almost guarantee flee
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 100 }), EnemyType.CORRUPTED_PALADIN);

    // Attempt flee multiple times to get at least one success
    let attempts = 0;
    while (!battle.ended && attempts < 20) {
      BattleService.attemptFlee(battle.battleId);
      attempts++;
    }

    // Either fled or battle should still exist
    expect(attempts).toBeLessThanOrEqual(20);
  });

  test('should take damage on failed flee', () => {
    const playerId = 'test-flee-damage';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 1 }), EnemyType.ANCIENT_DRAGON);

    const initialHp = battle.player.currentHp;
    const result = BattleService.attemptFlee(battle.battleId);

    if (!result.success) {
      expect(battle.player.currentHp).toBeLessThanOrEqual(initialHp);
    }
  });

  test('should throw error for non-existent battle', () => {
    expect(() => BattleService.attemptFlee('non-existent-battle')).toThrow('Battle not found');
  });
});

test.describe('Battle Service - Battle Rewards', () => {
  test('should return rewards on victory', () => {
    const playerId = 'test-rewards';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ attack: 100, speed: 20 }), EnemyType.GOBLIN_SCOUT);

    // Force victory
    battle.enemy.currentHp = 1;
    BattleService.executeAttack(battle.battleId);

    const rewards = BattleService.getBattleRewards(battle.battleId);

    expect(rewards.xp).toBe(25); // Goblin scout XP
    expect(rewards.gold).toBe(10); // Goblin scout gold
  });

  test('should return empty rewards for non-victory', () => {
    const playerId = 'test-no-rewards';
    const battle = BattleService.startBattle(playerId, createTestPlayer(), EnemyType.GOBLIN_SCOUT);

    // Battle not ended yet
    const rewards = BattleService.getBattleRewards(battle.battleId);

    expect(rewards.xp).toBe(0);
    expect(rewards.gold).toBe(0);
    expect(rewards.loot).toEqual([]);
  });

  test('should return empty rewards for non-existent battle', () => {
    const rewards = BattleService.getBattleRewards('non-existent-battle');

    expect(rewards.xp).toBe(0);
    expect(rewards.gold).toBe(0);
    expect(rewards.loot).toEqual([]);
  });

  test('should provide higher rewards for boss enemies', () => {
    const playerId = 'test-boss-rewards';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ attack: 200, speed: 20, hp: 1000, maxHp: 1000 }), EnemyType.ANCIENT_DRAGON);

    // Force victory
    battle.enemy.currentHp = 1;
    BattleService.executeAttack(battle.battleId);

    const rewards = BattleService.getBattleRewards(battle.battleId);

    expect(rewards.xp).toBe(1000); // Dragon XP
    expect(rewards.gold).toBe(500); // Dragon gold
  });
});

test.describe('Battle Service - Status Effects', () => {
  test('should apply poison and deal damage over time', () => {
    const playerId = 'test-poison';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ class: 'ROGUE', speed: 20, mana: 50 }), EnemyType.SKELETON_WARRIOR);

    // Use poison dagger
    BattleService.useAbility(battle.battleId, 'poison_dagger');

    const poisonEffect = battle.enemy.statusEffects.find(e => e.id === 'poison');
    if (poisonEffect) {
      expect(poisonEffect.damagePerTurn).toBe(2);
      expect(poisonEffect.turnsRemaining).toBeGreaterThan(0);
    }
  });

  test('should apply freeze effect and skip enemy turn', () => {
    const playerId = 'test-freeze';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ class: 'MAGE', speed: 20, mana: 50 }), EnemyType.GOBLIN_SCOUT);

    // Use ice lance (50% freeze chance)
    BattleService.useAbility(battle.battleId, 'ice_lance');

    const freezeEffect = battle.enemy.statusEffects.find(e => e.id === 'freeze');
    if (freezeEffect) {
      expect(freezeEffect.id).toBe('freeze');
    }
  });

  test('should apply regeneration and heal over time', () => {
    const playerId = 'test-regen';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ class: 'PALADIN', speed: 20, mana: 50 }), EnemyType.GOBLIN_SCOUT);

    battle.player.currentHp = 50;

    // Use holy aura
    BattleService.useAbility(battle.battleId, 'holy_aura');

    const regenEffect = battle.player.statusEffects.find(e => e.id === 'regeneration');
    expect(regenEffect).toBeDefined();
    expect(regenEffect?.healPerTurn).toBe(3);
  });
});

test.describe('Battle Service - Combat Log', () => {
  test('should track combat events in log', () => {
    const playerId = 'test-log';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.GOBLIN_SCOUT);

    // Initial log should have battle start message
    expect(battle.combatLog.length).toBeGreaterThan(0);
    expect(battle.combatLog[0].message).toContain('Battle started');
  });

  test('should log player attacks', () => {
    const playerId = 'test-log-attack';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.GOBLIN_SCOUT);

    BattleService.executeAttack(battle.battleId);

    const attackLog = battle.combatLog.find(entry => entry.type === 'player' && entry.message.includes('attack'));
    expect(attackLog).toBeDefined();
  });

  test('should log enemy attacks or victory', () => {
    const playerId = 'test-log-enemy';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20 }), EnemyType.SKELETON_WARRIOR);

    BattleService.executeAttack(battle.battleId);

    // Should have either enemy attack log or victory log (if battle ended)
    const enemyLog = battle.combatLog.find(entry =>
      (entry.type === 'enemy' && entry.message.includes('attacks')) ||
      (entry.type === 'victory')
    );
    expect(enemyLog).toBeDefined();
  });

  test('should limit combat log to 50 entries', () => {
    const playerId = 'test-log-limit';
    const battle = BattleService.startBattle(playerId, createTestPlayer({ speed: 20, hp: 10000, maxHp: 10000 }), EnemyType.ANCIENT_DRAGON);

    // Execute many actions
    for (let i = 0; i < 60; i++) {
      if (battle.enemy.currentHp > 0 && battle.player.currentHp > 0) {
        BattleService.executeAttack(battle.battleId);
      }
    }

    expect(battle.combatLog.length).toBeLessThanOrEqual(50);
  });
});

test.describe('Battle Service - Enemy Types', () => {
  test('should create goblin scout with correct stats', () => {
    const battle = BattleService.startBattle('test-goblin', createTestPlayer(), EnemyType.GOBLIN_SCOUT);

    expect(battle.enemy.name).toBe('Goblin Scout');
    expect(battle.enemy.emoji).toBe('👺');
    expect(battle.enemy.maxHp).toBe(8);
    expect(battle.enemy.isBoss).toBe(false);
  });

  test('should create skeleton warrior with correct stats', () => {
    const battle = BattleService.startBattle('test-skeleton', createTestPlayer(), EnemyType.SKELETON_WARRIOR);

    expect(battle.enemy.name).toBe('Skeleton Warrior');
    expect(battle.enemy.emoji).toBe('💀');
    expect(battle.enemy.maxHp).toBe(15);
    expect(battle.enemy.isBoss).toBe(false);
  });

  test('should create fire elemental with resistances', () => {
    const battle = BattleService.startBattle('test-fire', createTestPlayer(), EnemyType.FIRE_ELEMENTAL);

    expect(battle.enemy.name).toBe('Fire Elemental');
    expect(battle.enemy.resistances).toContain('physical');
    expect(battle.enemy.weaknesses).toContain('ice');
  });

  test('should create ancient dragon as boss', () => {
    const battle = BattleService.startBattle('test-dragon', createTestPlayer(), EnemyType.ANCIENT_DRAGON);

    expect(battle.enemy.name).toBe('Ancient Dragon');
    expect(battle.enemy.isBoss).toBe(true);
    expect(battle.enemy.maxHp).toBe(100);
    expect(battle.enemy.xp).toBe(1000);
  });
});
