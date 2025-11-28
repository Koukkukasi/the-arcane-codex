/**
 * Player Repository
 * Handles all database operations for players
 */

import { DatabaseConnection } from '../connection';
import { SQLiteConnection } from '../sqlite-connection';
import { getDatabase } from '../index';
import { PlayerModel, CreatePlayerDTO, UpdatePlayerDTO, PlayerStatsDTO } from '../models/player.model';

export class PlayerRepository {
  private db: DatabaseConnection | SQLiteConnection;

  constructor(db?: DatabaseConnection | SQLiteConnection) {
    this.db = db || getDatabase();
  }

  /**
   * Create a new player
   */
  async createPlayer(data: CreatePlayerDTO): Promise<PlayerModel> {
    const query = `
      INSERT INTO players (player_id, username, email, preferred_role)
      VALUES (?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.player_id,
      data.username,
      data.email || null,
      data.preferred_role || null
    ]);

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Get player by internal UUID
   */
  async getPlayerById(id: string): Promise<PlayerModel | null> {
    const query = 'SELECT * FROM players WHERE id = ?';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Get player by external player_id
   */
  async getPlayerByPlayerId(playerId: string): Promise<PlayerModel | null> {
    const query = 'SELECT * FROM players WHERE player_id = ?';
    const result = await this.db.query(query, [playerId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Get player by username
   */
  async getPlayerByUsername(username: string): Promise<PlayerModel | null> {
    const query = 'SELECT * FROM players WHERE username = ?';
    const result = await this.db.query(query, [username]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Find players by username pattern (case-insensitive)
   */
  async findPlayersByUsername(pattern: string, limit: number = 10): Promise<PlayerModel[]> {
    const query = `
      SELECT * FROM players
      WHERE username LIKE ? COLLATE NOCASE
      ORDER BY username
      LIMIT ?
    `;
    const result = await this.db.query(query, [`%${pattern}%`, limit]);

    return result.rows.map(row => this.mapRowToPlayer(row));
  }

  /**
   * Update player information
   */
  async updatePlayer(playerId: string, data: UpdatePlayerDTO): Promise<PlayerModel | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (data.username !== undefined) {
      updates.push(`username = ?`);
      values.push(data.username);
    }
    if (data.email !== undefined) {
      updates.push(`email = ?`);
      values.push(data.email);
    }
    if (data.preferred_role !== undefined) {
      updates.push(`preferred_role = ?`);
      values.push(data.preferred_role);
    }
    if (data.avatar_url !== undefined) {
      updates.push(`avatar_url = ?`);
      values.push(data.avatar_url);
    }
    if (data.theme !== undefined) {
      updates.push(`theme = ?`);
      values.push(data.theme);
    }

    if (updates.length === 0) {
      return this.getPlayerByPlayerId(playerId);
    }

    updates.push(`updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')`);
    values.push(playerId);

    const query = `
      UPDATE players
      SET ${updates.join(', ')}
      WHERE player_id = ?
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Update player stats
   */
  async updatePlayerStats(
    playerId: string,
    stats: {
      sessions?: number;
      playtimeMinutes?: number;
      victories?: number;
      defeats?: number;
    }
  ): Promise<PlayerModel | null> {
    const updates: string[] = [];
    const values: any[] = [];

    if (stats.sessions !== undefined) {
      updates.push(`total_sessions = total_sessions + ?`);
      values.push(stats.sessions);
    }
    if (stats.playtimeMinutes !== undefined) {
      updates.push(`total_playtime_minutes = total_playtime_minutes + ?`);
      values.push(stats.playtimeMinutes);
    }
    if (stats.victories !== undefined) {
      updates.push(`victories = victories + ?`);
      values.push(stats.victories);
    }
    if (stats.defeats !== undefined) {
      updates.push(`defeats = defeats + ?`);
      values.push(stats.defeats);
    }

    if (updates.length === 0) {
      return this.getPlayerByPlayerId(playerId);
    }

    updates.push(`updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')`);
    values.push(playerId);

    const query = `
      UPDATE players
      SET ${updates.join(', ')}
      WHERE player_id = ?
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Get player statistics with calculated fields
   */
  async getPlayerStats(playerId: string): Promise<PlayerStatsDTO | null> {
    const player = await this.getPlayerByPlayerId(playerId);
    if (!player) {
      return null;
    }

    const totalGames = player.victories + player.defeats;
    const winRate = totalGames > 0 ? (player.victories / totalGames) * 100 : 0;
    const avgSessionLength = player.total_sessions > 0
      ? player.total_playtime_minutes / player.total_sessions
      : 0;

    return {
      total_sessions: player.total_sessions,
      total_playtime_minutes: player.total_playtime_minutes,
      victories: player.victories,
      defeats: player.defeats,
      win_rate: winRate.toFixed(2),
      avg_session_length: Math.round(avgSessionLength * 100) / 100
    };
  }

  /**
   * Update player's last seen timestamp
   */
  async updateLastSeen(playerId: string): Promise<void> {
    const query = `
      UPDATE players
      SET last_seen = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE player_id = ?
    `;
    await this.db.query(query, [playerId]);
  }

  /**
   * Delete a player (hard delete for tests)
   */
  async deletePlayer(playerId: string): Promise<boolean> {
    const query = 'DELETE FROM players WHERE player_id = ?';
    const result = await this.db.query(query, [playerId]);
    // Use rowCount since SQLite doesn't return rows for DELETE
    return (result.rowCount ?? 0) > 0;
  }

  /**
   * Hard delete a player (USE WITH CAUTION)
   */
  async hardDeletePlayer(playerId: string): Promise<boolean> {
    const query = 'DELETE FROM players WHERE player_id = ? RETURNING id';
    const result = await this.db.query(query, [playerId]);
    return result.rows.length > 0;
  }

  /**
   * Get top players by victories
   */
  async getTopPlayers(limit: number = 10): Promise<PlayerModel[]> {
    const query = `
      SELECT * FROM players
      WHERE victories > 0
      ORDER BY victories DESC, (CAST(victories AS REAL) / NULLIF(victories + defeats, 0)) DESC
      LIMIT ?
    `;
    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => this.mapRowToPlayer(row));
  }

  /**
   * Get recently active players
   */
  async getRecentlyActivePlayers(limit: number = 10): Promise<PlayerModel[]> {
    const query = `
      SELECT * FROM players
      ORDER BY last_seen DESC
      LIMIT ?
    `;
    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => this.mapRowToPlayer(row));
  }

  /**
   * Check if username is available
   */
  async isUsernameAvailable(username: string): Promise<boolean> {
    const query = 'SELECT COUNT(*) as count FROM players WHERE username = ?';
    const result = await this.db.query(query, [username]);
    return parseInt(result.rows[0].count) === 0;
  }

  /**
   * Get leaderboard (alias for getTopPlayers for backward compatibility)
   */
  async getLeaderboard(limit: number = 10): Promise<PlayerModel[]> {
    return this.getTopPlayers(limit);
  }


  /**
   * Update player's password hash
   */
  async updatePasswordHash(playerId: string, passwordHash: string): Promise<boolean> {
    const query = `
      UPDATE players
      SET password_hash = ?, updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE player_id = ?
    `;
    const result = await this.db.query(query, [passwordHash, playerId]);
    const rowCount: number = result.rowCount ?? 0;
    return rowCount > 0;
  }

  /**
   * Get player's password hash for authentication
   */
  async getPasswordHash(playerId: string): Promise<string | null> {
    const query = 'SELECT password_hash FROM players WHERE player_id = ?';
    const result = await this.db.query(query, [playerId]);

    if (result.rows.length === 0 || !result.rows[0].password_hash) {
      return null;
    }

    return result.rows[0].password_hash;
  }

  /**
   * Create player with password hash
   */
  async createPlayerWithPassword(data: CreatePlayerDTO & { password_hash: string }): Promise<PlayerModel> {
    const query = `
      INSERT INTO players (player_id, username, email, preferred_role, password_hash)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.player_id,
      data.username,
      data.email || null,
      data.preferred_role || null,
      data.password_hash
    ]);

    return this.mapRowToPlayer(result.rows[0]);
  }

  /**
   * Map database row to PlayerModel
   */
  private mapRowToPlayer(row: any): PlayerModel {
    return {
      id: row.id,
      player_id: row.player_id,
      username: row.username,
      email: row.email,
      password_hash: row.password_hash,
      total_sessions: row.total_sessions,
      total_playtime_minutes: row.total_playtime_minutes,
      victories: row.victories,
      defeats: row.defeats,
      preferred_role: row.preferred_role,
      avatar_url: row.avatar_url,
      theme: row.theme,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      last_seen: new Date(row.last_seen)
    };
  }
}
