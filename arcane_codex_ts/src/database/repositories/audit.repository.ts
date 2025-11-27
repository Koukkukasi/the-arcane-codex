/**
 * Audit Repository
 * Handles database operations for audit logging
 */

import { DatabaseConnection } from '../connection';
import { SQLiteConnection } from '../sqlite-connection';
import { getDatabase } from '../index';
import { AuditLogModel, CreateAuditLogDTO } from '../models/session.model';

export class AuditRepository {
  private db: DatabaseConnection | SQLiteConnection;

  constructor(db?: DatabaseConnection | SQLiteConnection) {
    this.db = db || getDatabase();
  }

  /**
   * Log an event
   */
  async logEvent(data: CreateAuditLogDTO): Promise<AuditLogModel> {
    const query = `
      INSERT INTO audit_logs (
        event_type, entity_type, entity_id,
        actor_id, actor_type,
        event_data, metadata,
        ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.event_type,
      data.entity_type || null,
      data.entity_id || null,
      data.actor_id || null,
      data.actor_type || null,
      data.event_data ? JSON.stringify(data.event_data) : null,
      data.metadata ? JSON.stringify(data.metadata) : null,
      data.ip_address || null,
      data.user_agent || null
    ]);

    return this.mapRowToAuditLog(result.rows[0]);
  }

  /**
   * Get audit logs by event type
   */
  async getLogsByEventType(
    eventType: string,
    limit: number = 100
  ): Promise<AuditLogModel[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE event_type = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [eventType, limit]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get audit logs for a specific entity
   */
  async getLogsByEntity(
    entityType: string,
    entityId: string,
    limit: number = 100
  ): Promise<AuditLogModel[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const result = await this.db.query(query, [entityType, entityId, limit]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get audit logs by actor
   */
  async getLogsByActor(
    actorId: string,
    limit: number = 100
  ): Promise<AuditLogModel[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE actor_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [actorId, limit]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get audit trail for an entity (complete history)
   */
  async getAuditTrail(
    entityType: string,
    entityId: string
  ): Promise<AuditLogModel[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE entity_type = $1 AND entity_id = $2
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [entityType, entityId]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get recent audit logs
   */
  async getRecentLogs(
    minutes: number = 60,
    limit: number = 100
  ): Promise<AuditLogModel[]> {
    // Validate and sanitize minutes parameter (1 minute to 1 week max)
    const safeMinutes = Math.max(1, Math.min(Math.floor(minutes), 10080));

    const query = `
      SELECT * FROM audit_logs
      WHERE created_at > datetime('now', '-' || $1 || ' minutes')
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [safeMinutes, limit]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Search audit logs by event data
   */
  async searchLogs(
    searchTerm: string,
    limit: number = 50
  ): Promise<AuditLogModel[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE event_data LIKE $1
         OR metadata LIKE $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [`%${searchTerm}%`, limit]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get logs by IP address (for security monitoring)
   */
  async getLogsByIp(
    ipAddress: string,
    limit: number = 100
  ): Promise<AuditLogModel[]> {
    const query = `
      SELECT * FROM audit_logs
      WHERE ip_address = $1
      ORDER BY created_at DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [ipAddress, limit]);
    return result.rows.map(row => this.mapRowToAuditLog(row));
  }

  /**
   * Get audit statistics
   */
  async getAuditStats(): Promise<{
    total_events: number;
    unique_event_types: number;
    unique_actors: number;
    events_last_hour: number;
    events_last_day: number;
  }> {
    const query = `
      SELECT
        COUNT(*) as total_events,
        COUNT(DISTINCT event_type) as unique_event_types,
        COUNT(DISTINCT actor_id) as unique_actors,
        COUNT(CASE WHEN created_at > datetime('now', '-1 hour') THEN 1 END) as events_last_hour,
        COUNT(CASE WHEN created_at > datetime('now', '-1 day') THEN 1 END) as events_last_day
      FROM audit_logs
    `;

    const result = await this.db.query(query);
    const row = result.rows[0];

    return {
      total_events: parseInt(row.total_events),
      unique_event_types: parseInt(row.unique_event_types),
      unique_actors: parseInt(row.unique_actors),
      events_last_hour: parseInt(row.events_last_hour),
      events_last_day: parseInt(row.events_last_day)
    };
  }

  /**
   * Get event type distribution
   */
  async getEventTypeDistribution(limit: number = 10): Promise<Array<{
    event_type: string;
    count: number;
    percentage: number;
  }>> {
    const query = `
      WITH event_counts AS (
        SELECT event_type, COUNT(*) as count
        FROM audit_logs
        GROUP BY event_type
      ),
      total AS (
        SELECT SUM(count) as total_count
        FROM event_counts
      )
      SELECT
        ec.event_type,
        ec.count,
        ROUND(CAST(ec.count AS REAL) / t.total_count * 100, 2) as percentage
      FROM event_counts ec
      CROSS JOIN total t
      ORDER BY ec.count DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => ({
      event_type: row.event_type,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage)
    }));
  }

  /**
   * Get most active users (by audit events)
   */
  async getMostActiveUsers(limit: number = 10): Promise<Array<{
    actor_id: string;
    event_count: number;
  }>> {
    const query = `
      SELECT actor_id, COUNT(*) as event_count
      FROM audit_logs
      WHERE actor_id IS NOT NULL
      GROUP BY actor_id
      ORDER BY event_count DESC
      LIMIT $1
    `;

    const result = await this.db.query(query, [limit]);
    return result.rows.map(row => ({
      actor_id: row.actor_id,
      event_count: parseInt(row.event_count)
    }));
  }

  /**
   * Delete old audit logs (for data retention)
   */
  async deleteOldLogs(daysOld: number = 90): Promise<number> {
    // Validate and sanitize daysOld parameter (7 days to 365 days max)
    const safeDays = Math.max(7, Math.min(Math.floor(daysOld), 365));

    const query = `
      DELETE FROM audit_logs
      WHERE created_at < datetime('now', '-' || $1 || ' days')
    `;

    const result = await this.db.query(query, [safeDays]);
    return result.rowCount ?? 0;
  }

  /**
   * Get suspicious activity (multiple failed attempts, etc.)
   */
  async getSuspiciousActivity(
    hours: number = 24,
    threshold: number = 10
  ): Promise<Array<{
    actor_id: string;
    ip_address: string;
    event_count: number;
    event_types: string[];
  }>> {
    // Validate and sanitize hours parameter (1 hour to 168 hours / 1 week max)
    const safeHours = Math.max(1, Math.min(Math.floor(hours), 168));

    const query = `
      SELECT
        actor_id,
        ip_address,
        COUNT(*) as event_count,
        GROUP_CONCAT(DISTINCT event_type) as event_types
      FROM audit_logs
      WHERE created_at > datetime('now', '-' || $1 || ' hours')
        AND event_type LIKE '%_failed%'
      GROUP BY actor_id, ip_address
      HAVING COUNT(*) >= $2
      ORDER BY event_count DESC
    `;

    const result = await this.db.query(query, [safeHours, threshold]);
    return result.rows.map(row => ({
      actor_id: row.actor_id,
      ip_address: row.ip_address,
      event_count: parseInt(row.event_count),
      event_types: row.event_types ? row.event_types.split(',') : []
    }));
  }

  /**
   * Get timeline of events for visualization
   */
  async getEventTimeline(
    hours: number = 24,
    _bucketMinutes: number = 60
  ): Promise<Array<{
    time_bucket: Date;
    event_count: number;
  }>> {
    // Validate and sanitize hours parameter (1 hour to 168 hours / 1 week max)
    const safeHours = Math.max(1, Math.min(Math.floor(hours), 168));

    const query = `
      SELECT
        strftime('%Y-%m-%d %H:00:00', created_at) as time_bucket,
        COUNT(*) as event_count
      FROM audit_logs
      WHERE created_at > datetime('now', '-' || $1 || ' hours')
      GROUP BY time_bucket
      ORDER BY time_bucket ASC
    `;

    const result = await this.db.query(query, [safeHours]);
    return result.rows.map(row => ({
      time_bucket: new Date(row.time_bucket),
      event_count: parseInt(row.event_count)
    }));
  }

  /**
   * Map database row to AuditLogModel
   */
  private mapRowToAuditLog(row: any): AuditLogModel {
    return {
      id: row.id,
      event_type: row.event_type,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      actor_id: row.actor_id,
      actor_type: row.actor_type,
      event_data: row.event_data
        ? (typeof row.event_data === 'string' ? JSON.parse(row.event_data) : row.event_data)
        : undefined,
      metadata: row.metadata
        ? (typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata)
        : undefined,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      created_at: new Date(row.created_at)
    };
  }
}
