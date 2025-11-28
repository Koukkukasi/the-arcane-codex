/**
 * Game Session Repository
 * Handles database operations for game sessions and state persistence
 */

import { DatabaseConnection } from '../connection';
import { SQLiteConnection } from '../sqlite-connection';
import { getDatabase } from '../index';
import {
  GameSessionModel,
  CreateGameSessionDTO,
  UpdateGameSessionDTO
} from '../models/session.model';

export class SessionRepository {
  private db: DatabaseConnection | SQLiteConnection;

  constructor(db?: DatabaseConnection | SQLiteConnection) {
    this.db = db || getDatabase();
  }

  /**
   * Create a new game session
   */
  async createSession(data: CreateGameSessionDTO): Promise<GameSessionModel> {
    const query = `
      INSERT INTO game_sessions (party_id, session_state, current_phase, phase_data)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.party_id,
      JSON.stringify(data.session_state),
      data.current_phase,
      data.phase_data ? JSON.stringify(data.phase_data) : null
    ]);

    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Get session by UUID
   */
  async getSessionById(id: string): Promise<GameSessionModel | null> {
    const query = 'SELECT * FROM game_sessions WHERE id = $1';
    const result = await this.db.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Get the latest session for a party
   */
  async getLatestSessionForParty(partyId: string): Promise<GameSessionModel | null> {
    const query = `
      SELECT * FROM game_sessions
      WHERE party_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const result = await this.db.query(query, [partyId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Get all sessions for a party (history)
   */
  async getSessionHistory(partyId: string, limit: number = 10): Promise<GameSessionModel[]> {
    const query = `
      SELECT * FROM game_sessions
      WHERE party_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [partyId, limit]);
    return result.rows.map(row => this.mapRowToSession(row));
  }

  /**
   * Update session state
   */
  async updateSession(sessionId: string, data: UpdateGameSessionDTO): Promise<GameSessionModel | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.session_state !== undefined) {
      updates.push(`session_state = $${paramCount++}`);
      values.push(JSON.stringify(data.session_state));
    }
    if (data.current_phase !== undefined) {
      updates.push(`current_phase = $${paramCount++}`);
      values.push(data.current_phase);
    }
    if (data.phase_data !== undefined) {
      updates.push(`phase_data = $${paramCount++}`);
      values.push(JSON.stringify(data.phase_data));
    }
    if (data.outcome !== undefined) {
      updates.push(`outcome = $${paramCount++}`);
      values.push(data.outcome);
    }
    if (data.final_score !== undefined) {
      updates.push(`final_score = $${paramCount++}`);
      values.push(data.final_score);
    }

    if (updates.length === 0) {
      return this.getSessionById(sessionId);
    }

    updates.push(`updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')`);
    values.push(sessionId);

    const query = `
      UPDATE game_sessions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Save complete session state (shorthand for full state update)
   */
  async saveSessionState(
    sessionId: string,
    sessionState: Record<string, any>,
    currentPhase?: string
  ): Promise<GameSessionModel | null> {
    const updates = [`session_state = $1`, `updated_at = NOW()`];
    const values: any[] = [JSON.stringify(sessionState)];
    let paramCount = 2;

    if (currentPhase) {
      updates.splice(1, 0, `current_phase = $${paramCount++}`);
      values.push(currentPhase);
    }

    values.push(sessionId);

    const query = `
      UPDATE game_sessions
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await this.db.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Complete a session
   */
  async completeSession(
    sessionId: string,
    outcome: 'victory' | 'defeat' | 'abandoned',
    finalScore?: number
  ): Promise<GameSessionModel | null> {
    const startedAt = await this.getSessionStartTime(sessionId);
    const durationMinutes = startedAt
      ? Math.round((Date.now() - startedAt.getTime()) / 60000)
      : null;

    const query = `
      UPDATE game_sessions
      SET outcome = $1,
          final_score = $2,
          duration_minutes = $3,
          completed_at = strftime('%Y-%m-%d %H:%M:%f', 'now'),
          updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE id = $4
      RETURNING *
    `;

    const result = await this.db.query(query, [
      outcome,
      finalScore || null,
      durationMinutes,
      sessionId
    ]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToSession(result.rows[0]);
  }

  /**
   * Get session start time
   */
  private async getSessionStartTime(sessionId: string): Promise<Date | null> {
    const query = 'SELECT created_at FROM game_sessions WHERE id = $1';
    const result = await this.db.query(query, [sessionId]);

    if (result.rows.length === 0) {
      return null;
    }

    return new Date(result.rows[0].created_at);
  }

  /**
   * Delete a session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    const query = 'DELETE FROM game_sessions WHERE id = $1 RETURNING id';
    const result = await this.db.query(query, [sessionId]);
    return result.rows.length > 0;
  }

  /**
   * Get active sessions (not completed)
   */
  async getActiveSessions(limit: number = 50): Promise<GameSessionModel[]> {
    const query = `
      SELECT * FROM game_sessions
      WHERE completed_at IS NULL
      ORDER BY created_at DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => this.mapRowToSession(row));
  }

  /**
   * Get completed sessions with specific outcome
   */
  async getSessionsByOutcome(
    outcome: 'victory' | 'defeat' | 'abandoned',
    limit: number = 20
  ): Promise<GameSessionModel[]> {
    const query = `
      SELECT * FROM game_sessions
      WHERE outcome = $1
      ORDER BY completed_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [outcome, limit]);
    return result.rows.map(row => this.mapRowToSession(row));
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total_sessions: number;
    active_sessions: number;
    completed_sessions: number;
    victories: number;
    defeats: number;
    abandoned: number;
    avg_duration_minutes: number;
  }> {
    const query = `
      SELECT
        COUNT(*) as total_sessions,
        COUNT(CASE WHEN completed_at IS NULL THEN 1 END) as active_sessions,
        COUNT(CASE WHEN completed_at IS NOT NULL THEN 1 END) as completed_sessions,
        COUNT(CASE WHEN outcome = 'victory' THEN 1 END) as victories,
        COUNT(CASE WHEN outcome = 'defeat' THEN 1 END) as defeats,
        COUNT(CASE WHEN outcome = 'abandoned' THEN 1 END) as abandoned,
        CAST(AVG(duration_minutes) AS INTEGER) as avg_duration_minutes
      FROM game_sessions
    `;

    const result = await this.db.query(query);
    const row = result.rows[0];

    return {
      total_sessions: parseInt(row.total_sessions),
      active_sessions: parseInt(row.active_sessions),
      completed_sessions: parseInt(row.completed_sessions),
      victories: parseInt(row.victories),
      defeats: parseInt(row.defeats),
      abandoned: parseInt(row.abandoned),
      avg_duration_minutes: parseInt(row.avg_duration_minutes) || 0
    };
  }

  /**
   * Clean up old abandoned sessions (older than specified days)
   */
  async cleanupOldSessions(daysOld: number = 30): Promise<number> {
    // Validate and sanitize daysOld parameter (1 day to 365 days max)
    const safeDays = Math.max(1, Math.min(Math.floor(daysOld), 365));

    const query = `
      DELETE FROM game_sessions
      WHERE outcome = 'abandoned'
        AND completed_at < datetime('now', '-' || ? || ' days')
    `;

    const result = await this.db.query(query, [safeDays]);
    return typeof result.rowCount === 'number' ? result.rowCount : 0;
  }

  /**
   * Get stale sessions (active but not updated for specified hours)
   * These are sessions that may have been abandoned without proper cleanup
   */
  async getStaleSessions(hoursStale: number = 4): Promise<GameSessionModel[]> {
    const safeHours = Math.max(1, Math.min(Math.floor(hoursStale), 168)); // 1 hour to 7 days

    const query = `
      SELECT * FROM game_sessions
      WHERE completed_at IS NULL
        AND updated_at < datetime('now', '-' || ? || ' hours')
      ORDER BY updated_at ASC
    `;

    const result = await this.db.query(query, [safeHours]);
    return result.rows.map(row => this.mapRowToSession(row));
  }

  /**
   * Mark stale sessions as abandoned
   * Returns the number of sessions marked as abandoned
   */
  async markStaleSessions(hoursStale: number = 4): Promise<number> {
    const safeHours = Math.max(1, Math.min(Math.floor(hoursStale), 168));

    const query = `
      UPDATE game_sessions
      SET outcome = 'abandoned',
          completed_at = strftime('%Y-%m-%d %H:%M:%f', 'now'),
          updated_at = strftime('%Y-%m-%d %H:%M:%f', 'now')
      WHERE completed_at IS NULL
        AND updated_at < datetime('now', '-' || ? || ' hours')
    `;

    const result = await this.db.query(query, [safeHours]);
    return typeof result.rowCount === 'number' ? result.rowCount : 0;
  }

  /**
   * Get all active sessions that need to be restored on server restart
   * These are sessions that are not completed and were updated recently
   */
  async getRestorableSessions(maxAgeHours: number = 24): Promise<GameSessionModel[]> {
    const safeHours = Math.max(1, Math.min(Math.floor(maxAgeHours), 168));

    const query = `
      SELECT * FROM game_sessions
      WHERE completed_at IS NULL
        AND updated_at > datetime('now', '-' || ? || ' hours')
      ORDER BY updated_at DESC
    `;

    const result = await this.db.query(query, [safeHours]);
    return result.rows.map(row => this.mapRowToSession(row));
  }

  /**
   * Clean up timed out sessions
   * Marks stale sessions as abandoned and deletes old abandoned sessions
   * Returns statistics about the cleanup operation
   */
  async cleanupTimedOutSessions(
    staleHours: number = 4,
    deleteAbandonedDays: number = 7
  ): Promise<{
    markedAbandoned: number;
    deletedSessions: number;
  }> {
    // Mark stale sessions as abandoned
    const markedAbandoned = await this.markStaleSessions(staleHours);

    // Delete old abandoned sessions
    const deletedSessions = await this.cleanupOldSessions(deleteAbandonedDays);

    return {
      markedAbandoned,
      deletedSessions
    };
  }

  /**
   * Map database row to GameSessionModel
   */
  private mapRowToSession(row: any): GameSessionModel {
    return {
      id: row.id,
      party_id: row.party_id,
      session_state: typeof row.session_state === 'string'
        ? JSON.parse(row.session_state)
        : row.session_state,
      current_phase: row.current_phase,
      phase_data: row.phase_data
        ? (typeof row.phase_data === 'string' ? JSON.parse(row.phase_data) : row.phase_data)
        : undefined,
      outcome: row.outcome,
      final_score: row.final_score,
      duration_minutes: row.duration_minutes,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
      completed_at: row.completed_at ? new Date(row.completed_at) : undefined
    };
  }
}
