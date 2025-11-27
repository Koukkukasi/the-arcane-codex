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
  settings?: any;

  // State
  status: 'waiting' | 'in_progress' | 'completed';
  member_count: number;

  // Metadata
  created_at: Date;
  updated_at: Date;
}

export interface CreatePartyDTO {
  code: string;
  name: string;
  host_player_id: string;
  max_players?: number;
  is_public?: boolean;
  settings?: any;
}

export interface UpdatePartyDTO {
  name?: string;
  host_player_id?: string;
  status?: 'waiting' | 'in_progress' | 'completed';
  member_count?: number;
}

export interface PartyMemberModel {
  party_id: string;
  player_id: string;

  // Member details
  role?: 'host' | 'player';
  is_ready: boolean;
  character_data?: any;

  // Metadata
  joined_at: Date;
  updated_at: Date;
  username?: string;
}

export interface AddPartyMemberDTO {
  party_id: string;
  player_id: string;
  role?: 'host' | 'player';
  character_data?: any;
}

export interface UpdatePartyMemberDTO {
  role?: 'host' | 'player';
  is_ready?: boolean;
  character_data?: any;
}

export interface PartyWithMembersDTO extends PartyModel {
  members: PartyMemberModel[];
  member_count: number;
}
