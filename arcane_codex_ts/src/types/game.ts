// Type definitions for The Arcane Codex game

// Player and session types
export interface Player {
  id: string;
  username: string;
  gameCode?: string;
  characterClass?: string;
}

// Question and option types
export interface QuestionOption {
  id: string;
  letter?: string;
  text: string;
  favor: Record<string, number>;
}

export interface InterrogationQuestion {
  question_number: number;
  question_text: string;
  god?: string;
  options: QuestionOption[];
  total_questions: number;
}

// Game session types
export interface GameSession {
  code: string;
  players: Map<string, string>; // player_id -> player_name
  player_classes: Map<string, string>; // player_id -> class
  max_players: number;
  game_started: boolean;
  interrogation_complete: Set<string>; // players who completed interrogation
  current_scenario?: any; // TODO: Add scenario type when needed
  scenario_history: string[];
}

// Player session data
export interface PlayerSessionData {
  game_code: string;
  player_id: string;
  player_name: string;
  current_question?: number;
  answers?: Record<number, string>;
  god_favor?: Record<string, number>;
  character_class?: string;
}

// God names enum
export enum God {
  VALDRIS = "VALDRIS",
  KAITHA = "KAITHA",
  MORVANE = "MORVANE",
  SYLARA = "SYLARA",
  KORVAN = "KORVAN",
  ATHENA = "ATHENA",
  MERCUS = "MERCUS"
}

// Character classes
export enum CharacterClass {
  WARRIOR = "warrior",
  MAGE = "mage",
  ROGUE = "rogue",
  CLERIC = "cleric",
  RANGER = "ranger"
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Session store extension
declare module 'express-session' {
  interface SessionData {
    player_id?: string;
    username?: string;
    game_code?: string;
    current_question?: number;
    answers?: Record<number, string>;
    god_favor?: Record<string, number>;
    character_class?: string;
    csrf_token?: string;
  }
}