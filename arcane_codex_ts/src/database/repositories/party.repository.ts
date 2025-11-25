/**
 * Party Repository
 * Handles all database operations for parties and party members
 */

import { DatabaseConnection } from '../connection';
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
  private db: DatabaseConnection;

  constructor(db?: DatabaseConnection) {
    this.db = db || DatabaseConnection.getInstance();
  }

  /**
   * Create a new party
   */
  async createParty(data: CreatePartyDTO): Promise<PartyModel> {
    const query = `
      INSERT INTO parties (code, name, host_player_id, max_players, is_public)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.code,
      data.name,
      data.host_player_id,
      data.max_players,
      data.is_public || false
    ]);

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Get party by UUID
   */
  async getPartyById(id: string): Promise<PartyModel | null> {
    const query = 'SELECT * FROM parties WHERE id = $1';
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
    const query = 'SELECT * FROM parties WHERE code = $1';
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
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.host_player_id !== undefined) {
      updates.push(`host_player_id = $${paramCount++}`);
      values.push(data.host_player_id);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.current_phase !== undefined) {
      updates.push(`current_phase = $${paramCount++}`);
      values.push(data.current_phase);
    }

    if (updates.length === 0) {
      return this.getPartyById(partyId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(partyId);

    const query = `
      UPDATE parties
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Mark party as started
   */
  async startParty(partyId: string): Promise<PartyModel | null> {
    const query = `
      UPDATE parties
      SET status = 'active',
          started_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Mark party as completed
   */
  async completeParty(partyId: string): Promise<PartyModel | null> {
    const query = `
      UPDATE parties
      SET status = 'completed',
          completed_at = NOW(),
          updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToParty(result.rows[0]);
  }

  /**
   * Disband a party
   */
  async disbandParty(partyId: string): Promise<boolean> {
    const query = `
      UPDATE parties
      SET status = 'disbanded',
          updated_at = NOW()
      WHERE id = $1
      RETURNING id
    `;

    const result = await this.db.query(query, [partyId]);
    return result.rows.length > 0;
  }

  /**
   * Delete a party (hard delete)
   */
  async deleteParty(partyId: string): Promise<boolean> {
    const query = 'DELETE FROM parties WHERE id = $1 RETURNING id';
    const result = await this.db.query(query, [partyId]);
    return result.rows.length > 0;
  }

  /**
   * List public parties (for matchmaking)
   */
  async listPublicParties(limit: number = 20): Promise<PartyWithMembersDTO[]> {
    const query = `
      SELECT p.*, COUNT(pm.id) as member_count
      FROM parties p
      LEFT JOIN party_members pm ON p.id = pm.party_id AND pm.left_at IS NULL
      WHERE p.is_public = true
        AND p.status = 'lobby'
      GROUP BY p.id
      HAVING COUNT(pm.id) < p.max_players
      ORDER BY p.created_at DESC
      LIMIT $1
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
      WHERE host_player_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [playerId, limit]);
    return result.rows.map(row => this.mapRowToParty(row));
  }

  // ==================== Party Members ====================

  /**
   * Add a member to a party (simple version - use addMemberAtomic for race-safe operations)
   */
  async addMember(data: AddPartyMemberDTO): Promise<PartyMemberModel> {
    const query = `
      INSERT INTO party_members (party_id, player_id, role)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.party_id,
      data.player_id,
      data.role || null
    ]);

    return this.mapRowToPartyMember(result.rows[0]);
  }

  /**
   * Add a member to a party atomically with capacity check
   * Prevents race condition where two players could join simultaneously and exceed max_players
   */
  async addMemberAtomic(data: AddPartyMemberDTO): Promise<{
    success: boolean;
    member?: PartyMemberModel;
    error?: string;
  }> {
    return this.db.transaction(async (client) => {
      // Lock the party row and check capacity atomically
      const partyCheck = await client.query(`
        SELECT p.id, p.max_players, p.status, COUNT(pm.id) as current_members
        FROM parties p
        LEFT JOIN party_members pm ON p.id = pm.party_id AND pm.left_at IS NULL
        WHERE p.id = $1
        GROUP BY p.id
        FOR UPDATE OF p
      `, [data.party_id]);

      if (partyCheck.rows.length === 0) {
        return { success: false, error: 'Party not found' };
      }

      const { max_players, current_members, status } = partyCheck.rows[0];

      // Check party status
      if (status !== 'lobby') {
        return { success: false, error: 'Party is not accepting new members' };
      }

      // Check capacity
      if (parseInt(current_members) >= max_players) {
        return { success: false, error: 'Party is full' };
      }

      // Check if player is already in this party
      const existingMember = await client.query(`
        SELECT id FROM party_members
        WHERE party_id = $1 AND player_id = $2 AND left_at IS NULL
      `, [data.party_id, data.player_id]);

      if (existingMember.rows.length > 0) {
        return { success: false, error: 'Player is already in this party' };
      }

      // Safe to add member now
      const insertResult = await client.query(`
        INSERT INTO party_members (party_id, player_id, role)
        VALUES ($1, $2, $3)
        RETURNING *
      `, [data.party_id, data.player_id, data.role || null]);

      return {
        success: true,
        member: this.mapRowToPartyMember(insertResult.rows[0])
      };
    });
  }

  /**
   * Get all members in a party (active only)
   */
  async getPartyMembers(partyId: string): Promise<PartyMemberModel[]> {
    const query = `
      SELECT * FROM party_members
      WHERE party_id = $1 AND left_at IS NULL
      ORDER BY joined_at ASC
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
      WHERE party_id = $1 AND player_id = $2 AND left_at IS NULL
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
    let paramCount = 1;

    if (data.role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(data.role);
    }
    if (data.is_ready !== undefined) {
      updates.push(`is_ready = $${paramCount++}`);
      values.push(data.is_ready);
    }
    if (data.is_connected !== undefined) {
      updates.push(`is_connected = $${paramCount++}`);
      values.push(data.is_connected);
    }

    if (updates.length === 0) {
      return this.getPartyMember(partyId, playerId);
    }

    values.push(partyId);
    values.push(playerId);

    const query = `
      UPDATE party_members
      SET ${updates.join(', ')}
      WHERE party_id = $${paramCount++} AND player_id = $${paramCount} AND left_at IS NULL
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPartyMember(result.rows[0]);
  }

  /**
   * Remove a member from a party (soft delete - sets left_at)
   */
  async removeMember(partyId: string, playerId: string): Promise<boolean> {
    const query = `
      UPDATE party_members
      SET left_at = NOW(), is_connected = false
      WHERE party_id = $1 AND player_id = $2 AND left_at IS NULL
      RETURNING id
    `;

    const result = await this.db.query(query, [partyId, playerId]);
    return result.rows.length > 0;
  }

  /**
   * Get party member count
   */
  async getPartyMemberCount(partyId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM party_members
      WHERE party_id = $1 AND left_at IS NULL
    `;

    const result = await this.db.query(query, [partyId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Check if party is full
   */
  async isPartyFull(partyId: string): Promise<boolean> {
    const query = `
      SELECT p.max_players, COUNT(pm.id) as current_members
      FROM parties p
      LEFT JOIN party_members pm ON p.id = pm.party_id AND pm.left_at IS NULL
      WHERE p.id = $1
      GROUP BY p.id, p.max_players
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rows.length === 0) {
      return true; // Party doesn't exist, consider it "full"
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
             COUNT(CASE WHEN is_ready = true THEN 1 END) as ready_members
      FROM party_members
      WHERE party_id = $1 AND left_at IS NULL
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
      WHERE pm.player_id = $1
        AND pm.left_at IS NULL
        AND p.status IN ('lobby', 'active')
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
      is_public: row.is_public,
      status: row.status,
      current_phase: row.current_phase,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      started_at: row.started_at ? new Date(row.started_at) : undefined,
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined
    };
  }

  /**
   * Map database row to PartyMemberModel
   */
  private mapRowToPartyMember(row: any): PartyMemberModel {
    return {
      id: row.id,
      party_id: row.party_id,
      player_id: row.player_id,
      role: row.role,
      is_ready: row.is_ready,
      is_connected: row.is_connected,
      joined_at: new Date(row.joined_at),
      left_at: row.left_at ? new Date(row.left_at) : undefined
    };
  }
}
