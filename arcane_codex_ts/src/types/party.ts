/**
 * Party System Type Definitions
 * Defines all types and interfaces for the multiplayer party system
 */

/**
 * Party role that a player can fulfill in combat
 */
export enum PartyRole {
  TANK = 'TANK',
  DPS = 'DPS',
  HEALER = 'HEALER',
  SUPPORT = 'SUPPORT'
}

/**
 * Difficulty levels for party sessions
 */
export enum DifficultyLevel {
  EASY = 'EASY',
  NORMAL = 'NORMAL',
  HARD = 'HARD',
  NIGHTMARE = 'NIGHTMARE'
}

/**
 * Represents a player within a party
 */
export interface PartyPlayer {
  id: string;
  name: string;
  characterClass?: string;
  level: number;
  isReady: boolean;
  role?: PartyRole;
  joinedAt: Date;
}

/**
 * Configurable settings for a party
 */
export interface PartySettings {
  maxPlayers: number;
  isPublic: boolean;
  difficulty: DifficultyLevel;
  allowSpectators: boolean;
}

/**
 * Represents a multiplayer party
 */
export interface Party {
  code: string;
  name: string;
  host: string;
  players: Map<string, PartyPlayer>;
  settings: PartySettings;
  createdAt: Date;
  lastActivity: Date;
}

/**
 * Result of attempting to join a party
 */
export type JoinResult = {
  success: boolean;
  party?: Party;
  error?: string;
};

/**
 * Party update payload for real-time notifications
 */
export interface PartyUpdate {
  type: 'player_joined' | 'player_left' | 'ready_changed' | 'settings_changed' | 'host_changed' | 'player_kicked';
  partyCode: string;
  playerId?: string;
  playerName?: string;
  newHost?: string;
  settings?: PartySettings;
  isReady?: boolean;
}

/**
 * Public party listing information
 */
export interface PublicPartyInfo {
  code: string;
  name: string;
  hostName: string;
  playerCount: number;
  maxPlayers: number;
  difficulty: DifficultyLevel;
  allowSpectators: boolean;
}