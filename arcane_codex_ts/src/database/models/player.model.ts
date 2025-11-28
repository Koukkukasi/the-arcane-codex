/**
 * Player Database Model
 * Represents a player account with stats and preferences
 */

export interface PlayerModel {
  id: string;  // UUID
  player_id: string;  // External player ID
  username: string;
  email?: string;
  password_hash?: string;  // Hashed password for authentication

  // Stats
  total_sessions: number;
  total_playtime_minutes: number;
  victories: number;
  defeats: number;

  // Preferences
  preferred_role?: 'tank' | 'dps' | 'healer' | 'support';
  avatar_url?: string;
  theme: string;

  // Metadata
  created_at: Date;
  updated_at: Date;
  last_seen: Date;
}

export interface CreatePlayerDTO {
  player_id: string;
  username: string;
  email?: string;
  password_hash?: string;  // Hashed password for authentication
  preferred_role?: 'tank' | 'dps' | 'healer' | 'support';
}

export interface UpdatePlayerDTO {
  username?: string;
  email?: string;
  password_hash?: string;  // Hashed password for authentication
  preferred_role?: 'tank' | 'dps' | 'healer' | 'support';
  avatar_url?: string;
  theme?: string;
}

export interface PlayerStatsDTO {
  total_sessions: number;
  total_playtime_minutes: number;
  victories: number;
  defeats: number;
  win_rate: string;  // Calculated as string with 2 decimal places
  avg_session_length: number;  // Calculated
}
