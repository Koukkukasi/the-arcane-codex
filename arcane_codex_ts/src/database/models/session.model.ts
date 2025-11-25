/**
 * Game Session Database Model
 * Represents a complete game session with state and results
 */

export interface GameSessionModel {
  id: string;  // UUID
  party_id: string;

  // Session data
  session_state: Record<string, any>;  // JSONB - complete game state
  current_phase: 'LOBBY' | 'INTERROGATION' | 'EXPLORATION' | 'BATTLE' | 'SCENARIO' | 'VICTORY';
  phase_data?: Record<string, any>;  // JSONB - phase-specific data

  // Results
  outcome?: 'victory' | 'defeat' | 'abandoned';
  final_score?: number;
  duration_minutes?: number;

  // Metadata
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
}

export interface CreateGameSessionDTO {
  party_id: string;
  session_state: Record<string, any>;
  current_phase: 'LOBBY' | 'INTERROGATION' | 'EXPLORATION' | 'BATTLE' | 'SCENARIO' | 'VICTORY';
  phase_data?: Record<string, any>;
}

export interface UpdateGameSessionDTO {
  session_state?: Record<string, any>;
  current_phase?: 'LOBBY' | 'INTERROGATION' | 'EXPLORATION' | 'BATTLE' | 'SCENARIO' | 'VICTORY';
  phase_data?: Record<string, any>;
  outcome?: 'victory' | 'defeat' | 'abandoned';
  final_score?: number;
}

export interface ChatMessageModel {
  id: string;  // UUID
  party_id: string;
  player_id: string;

  // Message data
  message_type: 'chat' | 'system' | 'action';
  content: string;

  // Metadata
  created_at: Date;
}

export interface CreateChatMessageDTO {
  party_id: string;
  player_id: string;
  message_type?: 'chat' | 'system' | 'action';
  content: string;
}

export interface AuditLogModel {
  id: string;  // UUID

  // Event details
  event_type: string;
  entity_type?: string;
  entity_id?: string;

  // Actor
  actor_id?: string;
  actor_type?: 'player' | 'system';

  // Data
  event_data?: Record<string, any>;
  metadata?: Record<string, any>;

  // Context
  ip_address?: string;
  user_agent?: string;

  // Metadata
  created_at: Date;
}

export interface CreateAuditLogDTO {
  event_type: string;
  entity_type?: string;
  entity_id?: string;
  actor_id?: string;
  actor_type?: 'player' | 'system';
  event_data?: Record<string, any>;
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}
