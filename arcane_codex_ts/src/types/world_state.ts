// World State and Consequence Management Types for The Arcane Codex

// Faction system based on the 7 gods
export enum Faction {
  VALDRIS = 'VALDRIS',  // God of Order and Justice
  KAITHA = 'KAITHA',    // Goddess of Chaos and Change
  MORVANE = 'MORVANE',  // God of Knowledge and Secrets
  SYLARA = 'SYLARA',    // Goddess of Nature and Balance
  KORVAN = 'KORVAN',    // God of War and Strength
  ATHENA = 'ATHENA',    // Goddess of Wisdom and Strategy
  MERCUS = 'MERCUS',    // God of Trade and Diplomacy
  NEUTRAL = 'NEUTRAL'   // Independent factions
}

// Consequence severity levels
export enum ConsequenceSeverity {
  MINOR = 'minor',
  MODERATE = 'moderate',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

// Consequence duration types
export enum ConsequenceDuration {
  IMMEDIATE = 'immediate',    // Resolves instantly
  SHORT = 'short',            // 1-3 scenarios
  MEDIUM = 'medium',          // 4-10 scenarios
  LONG = 'long',              // 11+ scenarios
  PERMANENT = 'permanent'     // Never expires
}

// Base consequence interface
export interface Consequence {
  id: string;
  type: 'reputation' | 'world_event' | 'character_effect' | 'faction_relation' | 'hidden_reveal';
  severity: ConsequenceSeverity;
  duration: ConsequenceDuration;
  description: string;
  appliedAt: number;  // Timestamp
  expiresAt?: number; // Optional expiration timestamp
  scenarioId: string;
  choiceId: string;
  resolved: boolean;
  metadata?: Record<string, any>;
}

// Specific consequence types
export interface ReputationConsequence extends Consequence {
  type: 'reputation';
  faction: Faction;
  change: number;  // Can be positive or negative
  reason: string;
}

export interface WorldEventConsequence extends Consequence {
  type: 'world_event';
  eventId: string;
  eventName: string;
  affectedRegions: string[];
  triggerConditions?: string[];
}

export interface CharacterEffectConsequence extends Consequence {
  type: 'character_effect';
  effectType: 'buff' | 'debuff' | 'status' | 'unlock';
  effectName: string;
  effectValue: number | string;
  targetPlayerId?: string;  // If null, applies to choice maker
}

export interface FactionRelationConsequence extends Consequence {
  type: 'faction_relation';
  faction1: Faction;
  faction2: Faction;
  relationChange: number;
  newRelationStatus: 'allied' | 'friendly' | 'neutral' | 'hostile' | 'war';
}

export interface HiddenRevealConsequence extends Consequence {
  type: 'hidden_reveal';
  revealId: string;
  revealType: 'plot' | 'character' | 'location' | 'item';
  condition: string;
  revealed: boolean;
}

// World state change tracking
export interface WorldStateChange {
  id: string;
  timestamp: number;
  playerId: string;
  changeType: 'faction_reputation' | 'world_event' | 'faction_relation' | 'region_status';
  previousValue: any;
  newValue: any;
  description: string;
  scenarioId?: string;
  consequenceId?: string;
}

// Player choice history
export interface PlayerChoice {
  scenarioId: string;
  choiceId: string;
  timestamp: number;
  consequences: string[];  // Consequence IDs
  immediateEffects: Record<string, any>;
}

// Player history tracking
export interface PlayerHistory {
  playerId: string;
  choices: PlayerChoice[];
  activeConsequences: string[];  // Consequence IDs
  resolvedConsequences: string[];
  factionReputation: Map<Faction, number>;
  unlockedContent: string[];
  discoveredClues: string[];
  sharedClues: string[];
  totalChoicesMade: number;
  lastActiveTimestamp: number;
}

// Region status for world tracking
export interface RegionStatus {
  regionId: string;
  regionName: string;
  controllingFaction: Faction;
  stability: number;  // 0-100
  resources: Record<string, number>;
  activeEvents: string[];
  accessibility: 'open' | 'restricted' | 'closed';
}

// Faction relations
export interface FactionRelation {
  faction1: Faction;
  faction2: Faction;
  relationValue: number;  // -100 to 100
  status: 'allied' | 'friendly' | 'neutral' | 'hostile' | 'war';
  lastChangeTimestamp: number;
  history: Array<{
    timestamp: number;
    change: number;
    reason: string;
  }>;
}

// Complete world state
export interface WorldState {
  id: string;
  serverTimestamp: number;
  scenarioCount: number;

  // Faction system
  factionRelations: Map<string, FactionRelation>;  // Key: "faction1-faction2"
  factionPower: Map<Faction, number>;
  factionLeaders: Map<Faction, string>;

  // World regions
  regions: Map<string, RegionStatus>;

  // Active world events
  activeWorldEvents: WorldEventConsequence[];
  completedWorldEvents: string[];

  // Global flags and variables
  globalFlags: Map<string, boolean>;
  globalVariables: Map<string, any>;

  // Narrative progression
  mainQuestProgress: number;
  sideQuestsActive: string[];
  sideQuestsCompleted: string[];

  // Statistics
  totalPlayerChoices: number;
  mostInfluentialPlayers: Array<{ playerId: string; influence: number }>;
  lastMajorEvent: string;
  lastMajorEventTimestamp: number;
}

// Asymmetric information types
export interface AsymmetricInfo {
  playerId: string;
  scenarioId: string;

  // What this player knows
  visibleChoices: string[];
  hiddenChoices: string[];

  // Clues and secrets
  availableClues: Clue[];
  discoveredClues: string[];

  // Hidden information that could be revealed
  potentialReveals: Array<{
    revealId: string;
    condition: string;
    hint?: string;
  }>;

  // Information from other players
  sharedInfo: Array<{
    fromPlayerId: string;
    clueId: string;
    sharedAt: number;
  }>;

  // Player's deductions
  deductions: Array<{
    id: string;
    hypothesis: string;
    confidence: number;
    supportingClues: string[];
  }>;
}

// Clue system
export interface Clue {
  id: string;
  name: string;
  description: string;
  category: 'physical' | 'testimony' | 'document' | 'observation' | 'magical';
  scenarioId: string;
  discoveryCondition?: string;
  shareability: 'private' | 'shareable' | 'public';
  reliability: number;  // 0-1, how trustworthy is this clue
  relatedClues: string[];
  metadata?: Record<string, any>;
}

// Export type guards
export function isReputationConsequence(c: Consequence): c is ReputationConsequence {
  return c.type === 'reputation';
}

export function isWorldEventConsequence(c: Consequence): c is WorldEventConsequence {
  return c.type === 'world_event';
}

export function isCharacterEffectConsequence(c: Consequence): c is CharacterEffectConsequence {
  return c.type === 'character_effect';
}

export function isFactionRelationConsequence(c: Consequence): c is FactionRelationConsequence {
  return c.type === 'faction_relation';
}

export function isHiddenRevealConsequence(c: Consequence): c is HiddenRevealConsequence {
  return c.type === 'hidden_reveal';
}