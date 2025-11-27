/**
 * Party Repository
 * Handles all database operations for parties and party members
 */

import { DatabaseConnection } from '../connection';
import { SQLiteConnection } from '../sqlite-connection';
import { getDatabase } from '../index';
import {
  PartyModel,
  CreatePartyDTO,
  UpdatePartyDTO,
  PartyMemberModel,
  AddPartyMemberDTO,
  UpdatePartyMemberDTO,
  PartyWithMembersDTO
} from '../models/party.model';

export class PartyRepository {
  private db: DatabaseConnection | SQLiteConnection;

  constructor(db?: DatabaseConnection | SQLiteConnection) {
    this.db = db || getDatabase();
  }

  /**
   * Create a new party
   */
  async createParty(data: CreatePartyDTO): Promise<PartyModel> {
    const query = `
      INSERT INTO parties (code, name, host_player_id, max_players, is_public, settings)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.code,
      data.name,
      data.host_player_id,
      data.max_players ?? 4,
      data.is_public ?? true,
      data.settings ? JSON.stringify(data.settings) : null
    ]);

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Get party by UUID
   */
  async getPartyById(id: string): Promise<PartyModel | null> {
    const query = 'SELECT * FROM parties WHERE id = ?';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Get party by join code
   */
  async getPartyByCode(code: string): Promise<PartyModel | null> {
    const query = 'SELECT * FROM parties WHERE code = ?';
    const result = await this.db.query(query, [code]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Get party with all members
   */
  async getPartyWithMembers(code: string): Promise<PartyWithMembersDTO | null> {
    const party = await this.getPartyByCode(code);
    if (!party) {
      return null;
    }

    const members = await this.getPartyMembers(party.id);

    return {
      ...party,
      members,
      member_count: members.length
    };
  }

  /**
   * Update party information
   */
  async updateParty(partyId: string, data: UpdatePartyDTO): Promise<PartyModel | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push(`name = ?`);
      values.push(data.name);
    }
    if (data.host_player_id !== undefined) {
      updates.push(`host_player_id = ?`);
      values.push(data.host_player_id);
    }
    if (data.status !== undefined) {
      updates.push(`status = ?`);
      values.push(data.status);
    }
    if (data.member_count !== undefined) {
      updates.push(`member_count = ?`);
      values.push(data.member_count);
    }

    if (updates.length === 0) {
      return this.getPartyById(partyId);
    }

    updates.push(`updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')`);
    values.push(partyId);

    const query = `
      UPDATE parties
      SET ${updates.join(', ')}
      WHERE id = ?
    `;

    const result = await this.db.query(query, values);

    // SQLite doesn't return rows from UPDATE, so fetch the updated party
    if (result.rowCount === 0) {
      return null;
    }

    return this.getPartyById(partyId);
  }

  /**
   * Mark party as started
   */
  async startParty(partyId: string): Promise<PartyModel | null> {
    const query = `
      UPDATE parties
      SET status = 'in_progress',
          updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rowCount === 0) {
      return null;
    }

    return this.getPartyById(partyId);
  }

  /**
   * Mark party as completed
   */
  async completeParty(partyId: string): Promise<PartyModel | null> {
    const query = `
      UPDATE parties
      SET status = 'completed',
          updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rowCount === 0) {
      return null;
    }

    return this.getPartyById(partyId);
  }

  /**
   * Disband a party
   */
  async disbandParty(partyId: string): Promise<boolean> {
    const query = `
      UPDATE parties
      SET status = 'disbanded',
          updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = ?
    `;

    const result = await this.db.query(query, [partyId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Delete a party (hard delete)
   */
  async deleteParty(partyId: string): Promise<boolean> {
    const query = 'DELETE FROM parties WHERE id = ?';
    const result = await this.db.query(query, [partyId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Check if player is in a party
   */
  async isPlayerInParty(partyId: string, playerId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count FROM party_members
      WHERE party_id = ? AND player_id = ?
    `;
    const result = await this.db.query(query, [partyId, playerId]);
    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * List public parties (for matchmaking)
   */
  async listPublicParties(limit: number = 20): Promise<PartyWithMembersDTO[]> {
    const query = `
      SELECT * FROM parties
      WHERE is_public = 1
        AND status = 'waiting'
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const result = await this.db.query(query, [limit]);

    const parties: PartyWithMembersDTO[] = [];
    for (const row of result.rows) {
      const party = this.mapRowToParty(row);
      const members = await this.getPartyMembers(party.id);
      parties.push({
        ...party,
        members,
        member_count: members.length
      });
    }

    return parties;
  }

  /**
   * Get parties hosted by a player
   */
  async getPartiesByHost(playerId: string, limit: number = 10): Promise<PartyModel[]> {
    const query = `
      SELECT * FROM parties
      WHERE host_player_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const result = await this.db.query(query, [playerId, limit]);
    return result.rows.map(row => this.mapRowToParty(row));
  }

  // ==================== Party Members ====================

  /**
   * Add a member to a party (simple version)
   */
  async addMember(data: AddPartyMemberDTO): Promise<PartyMemberModel> {
    const query = `
      INSERT INTO party_members (party_id, player_id, role, character_data)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.party_id,
      data.player_id,
      data.role || 'player',
      data.character_data ? JSON.stringify(data.character_data) : null
    ]);

    return this.mapRowToPartyMember(result.rows[0]);
  }

  /**
   * Get all members in a party
   */
  async getPartyMembers(partyId: string): Promise<PartyMemberModel[]> {
    const query = `
      SELECT pm.*, p.username
      FROM party_members pm
      LEFT JOIN players p ON pm.player_id = p.player_id
      WHERE pm.party_id = ?
      ORDER BY pm.joined_at ASC
    `;

    const result = await this.db.query(query, [partyId]);
    return result.rows.map(row => this.mapRowToPartyMember(row));
  }

  /**
   * Get a specific party member
   */
  async getPartyMember(partyId: string, playerId: string): Promise<PartyMemberModel | null> {
    const query = `
      SELECT * FROM party_members
      WHERE party_id = ? AND player_id = ?
    `;

    const result = await this.db.query(query, [partyId, playerId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPartyMember(result.rows[0]);
  }

  /**
   * Update party member
   */
  async updateMember(
    partyId: string,
    playerId: string,
    data: UpdatePartyMemberDTO
  ): Promise<PartyMemberModel | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.role !== undefined) {
      updates.push(`role = ?`);
      values.push(data.role);
    }
    if (data.is_ready !== undefined) {
      updates.push(`is_ready = ?`);
      values.push(data.is_ready);
    }
    if (data.character_data !== undefined) {
      updates.push(`character_data = ?`);
      values.push(JSON.stringify(data.character_data));
    }

    if (updates.length === 0) {
      return this.getPartyMember(partyId, playerId);
    }

    updates.push(`updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')`);
    values.push(partyId);
    values.push(playerId);

    const query = `
      UPDATE party_members
      SET ${updates.join(', ')}
      WHERE party_id = ? AND player_id = ?
    `;

    const result = await this.db.query(query, values);

    if (result.rowCount === 0) {
      return null;
    }

    return this.getPartyMember(partyId, playerId);
  }

  /**
   * Remove a member from a party (hard delete)
   */
  async removeMember(partyId: string, playerId: string): Promise<boolean> {
    const query = `
      DELETE FROM party_members
      WHERE party_id = ? AND player_id = ?
    `;

    const result = await this.db.query(query, [partyId, playerId]);
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Get party member count
   */
  async getPartyMemberCount(partyId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM party_members
      WHERE party_id = ?
    `;

    const result = await this.db.query(query, [partyId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if party is full
   */
  async isPartyFull(partyId: string): Promise<boolean> {
    const query = `
      SELECT p.max_players, COUNT(pm.player_id) as current_members
      FROM parties p
      LEFT JOIN party_members pm ON p.id = pm.party_id
      WHERE p.id = ?
      GROUP BY p.id, p.max_players
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rows.length === 0) {
      return true;
    }

    const { max_players, current_members } = result.rows[0];
    return parseInt(current_members) >= max_players;
  }

  /**
   * Check if all party members are ready
   */
  async areAllMembersReady(partyId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as total_members,
             COUNT(CASE WHEN is_ready = 1 THEN 1 END) as ready_members
      FROM party_members
      WHERE party_id = ?
    `;

    const result = await this.db.query(query, [partyId]);
    const { total_members, ready_members } = result.rows[0];

    return parseInt(total_members) > 0 && total_members === ready_members;
  }

  /**
   * Get parties a player is currently in
   */
  async getPlayerParties(playerId: string): Promise<PartyModel[]> {
    const query = `
      SELECT p.*
      FROM parties p
      INNER JOIN party_members pm ON p.id = pm.party_id
      WHERE pm.player_id = ?
        AND p.status IN ('waiting', 'in_progress')
      ORDER BY p.created_at DESC
    `;

    const result = await this.db.query(query, [playerId]);
    return result.rows.map(row => this.mapRowToParty(row));
  }

  // ==================== Mappers ====================

  /**
   * Map database row to PartyModel
   */
  private mapRowToParty(row: any): PartyModel {
    return {
      id: row.id,
      code: row.code,
      name: row.name,
      host_player_id: row.host_player_id,
      max_players: row.max_players,
      is_public: Boolean(row.is_public),
      status: row.status,
      member_count: row.member_count || 0,
      settings: row.settings ? (typeof row.settings === 'string' ? JSON.parse(row.settings) : row.settings) : null,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at)
    };
  }

  /**
   * Map database row to PartyMemberModel
   */
  private mapRowToPartyMember(row: any): PartyMemberModel {
    return {
      party_id: row.party_id,
      player_id: row.player_id,
      role: row.role,
      is_ready: Boolean(row.is_ready),
      character_data: row.character_data ? (typeof row.character_data === 'string' ? JSON.parse(row.character_data) : row.character_data) : null,
      joined_at: new Date(row.joined_at),
      updated_at: row.updated_at ? new Date(row.updated_at) : new Date(row.joined_at),
      username: row.username
    };
  }
}
