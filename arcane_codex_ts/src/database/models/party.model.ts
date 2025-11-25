/**
 * Party Database Model
 * Represents a multiplayer party with settings and state
 */

export interface PartyModel {
  id: string;  // UUID
  code: string;  // 6-8 character join code
  name: string;

  // Settings
  host_player_id: string;
  max_players: number;
  is_public: boolean;

  // State
  status: 'lobby' | 'active' | 'completed' | 'disbanded';
  current_phase: 'LOBBY' | 'INTERROGATION' | 'EXPLORATION' | 'BATTLE' | 'SCENARIO' | 'VICTORY';

  // Metadata
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface CreatePartyDTO {
  code: string;
  name: string;
  host_player_id: string;
  max_players: number;
  is_public?: boolean;
}

export interface UpdatePartyDTO {
  name?: string;
  host_player_id?: string;
  status?: 'lobby' | 'active' | 'completed' | 'disbanded';
  current_phase?: 'LOBBY' | 'INTERROGATION' | 'EXPLORATION' | 'BATTLE' | 'SCENARIO' | 'VICTORY';
}

export interface PartyMemberModel {
  id: string;  // UUID
  party_id: string;
  player_id: string;

  // Member details
  role?: 'tank' | 'dps' | 'healer' | 'support';
  is_ready: boolean;
  is_connected: boolean;

  // Metadata
  joined_at: Date;
  left_at?: Date;
}

export interface AddPartyMemberDTO {
  party_id: string;
  player_id: string;
  role?: 'tank' | 'dps' | 'healer' | 'support';
}

export interface UpdatePartyMemberDTO {
  role?: 'tank' | 'dps' | 'healer' | 'support';
  is_ready?: boolean;
  is_connected?: boolean;
}

export interface PartyWithMembersDTO extends PartyModel {
  members: PartyMemberModel[];
  member_count: number;
}
