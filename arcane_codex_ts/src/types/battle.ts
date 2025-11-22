// Battle system type definitions

export interface BattleEnemy {
  id: string;
  name: string;
  emoji: string;
  hp: number;
  maxHp: number;
  currentHp: number;
  attack: number;
  defense: number;
  speed: number;
  xp: number;
  gold: number;
  description: string;
  abilities: string[];
  lootTable: string[];
  resistances?: string[];
  weaknesses?: string[];
  isBoss: boolean;
  statusEffects: StatusEffect[];
}

export interface StatusEffect {
  id: string;
  name: string;
  emoji: string;
  type: 'buff' | 'debuff';
  description: string;
  duration: number;
  turnsRemaining: number;
  damagePerTurn?: number;
  healPerTurn?: number;
  attackMultiplier?: number;
  defenseMultiplier?: number;
  damageMultiplier?: number;
  color: string;
}

export interface BattleAbility {
  id: string;
  name: string;
  emoji: string;
  description: string;
  manaCost: number;
  damage: number;
  cooldown: number;
  currentCooldown?: number;
  effect?: string;
  effectChance?: number;
  special?: string;
}

export interface BattlePlayer {
  id: string;
  name: string;
  class: string;
  hp: number;
  maxHp: number;
  currentHp: number;
  mana: number;
  maxMana: number;
  currentMana: number;
  attack: number;
  defense: number;
  speed: number;
  level: number;
  xp: number;
  gold: number;
  statusEffects: StatusEffect[];
}

export interface BattleState {
  battleId: string;
  playerId: string;
  player: BattlePlayer;
  enemy: BattleEnemy;
  turnCount: number;
  isPlayerTurn: boolean;
  turnOrder: string[];
  started: number;
  ended?: number;
  isVictory?: boolean;
  combatLog: CombatLogEntry[];
  abilityCooldowns: Record<string, number>;
}

export interface CombatLogEntry {
  message: string;
  type: 'player' | 'enemy' | 'system' | 'buff' | 'debuff' | 'victory' | 'defeat' | 'error';
  timestamp: number;
  turn: number;
  damage?: number;
}

export interface BattleTurnResult {
  damage: number;
  statusEffects: StatusEffect[];
  enemyHp: number;
  playerHp: number;
  turnResult: string;
  isVictory?: boolean;
  isDefeat?: boolean;
  enemyAction?: string;
  enemyDamage?: number;
  combatLog: string[];
}

export interface BattleRewards {
  xp: number;
  gold: number;
  loot: string[];
}

export enum EnemyType {
  GOBLIN_SCOUT = 'GOBLIN_SCOUT',
  SKELETON_WARRIOR = 'SKELETON_WARRIOR',
  SHADOW_ASSASSIN = 'SHADOW_ASSASSIN',
  FIRE_ELEMENTAL = 'FIRE_ELEMENTAL',
  ICE_WRAITH = 'ICE_WRAITH',
  CORRUPTED_PALADIN = 'CORRUPTED_PALADIN',
  ANCIENT_DRAGON = 'ANCIENT_DRAGON'
}

export enum StatusEffectType {
  POISON = 'POISON',
  STUN = 'STUN',
  BURN = 'BURN',
  FREEZE = 'FREEZE',
  STRENGTH_BUFF = 'STRENGTH_BUFF',
  DEFENSE_BUFF = 'DEFENSE_BUFF',
  REGENERATION = 'REGENERATION'
}
