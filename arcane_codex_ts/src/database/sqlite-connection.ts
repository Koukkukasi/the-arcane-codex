/**
 * SQLite Database Connection
 * Simpler alternative to PostgreSQL for development
 */
import Database from 'better-sqlite3';
import { dbLogger } from '../services/logger';
import path from 'path';

export class SQLiteConnection {
  private static instance: SQLiteConnection;
  private db: Database.Database;
  private dbPath: string;

  private constructor() {
    // Use in-memory database for tests, file-based for development
    this.dbPath = process.env.NODE_ENV === 'test'
      ? ':memory:'
      : path.join(process.cwd(), 'arcane_codex.db');

    this.db = new Database(this.dbPath, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
    });

    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');

    dbLogger.info({ dbPath: this.dbPath }, 'Connected to SQLite database');
  }

  public static getInstance(): SQLiteConnection {
    if (!SQLiteConnection.instance) {
      SQLiteConnection.instance = new SQLiteConnection();
    }
    return SQLiteConnection.instance;
  }

  public async connect(): Promise<void> {
    // SQLite connects immediately, but keep method for compatibility
    dbLogger.info({ database: this.dbPath }, 'SQLite connection ready');
  }

  public async disconnect(): Promise<void> {
    if (this.db) {
      this.db.close();
      dbLogger.info('SQLite connection closed');
    }
  }

  /**
   * Get the raw database instance (for exec and other advanced features)
   */
  public getRawDb(): Database.Database {
    return this.db;
  }

  /**
   * Convert PostgreSQL syntax to SQLite syntax
   */
  private convertPostgresToSQLite(sql: string): string {
    // Replace $1, $2, etc with ?
    let converted = sql.replace(/\$\d+/g, '?');

    // Remove ::type casts (including float, real, numeric, etc)
    converted = converted.replace(/::(text|integer|int|varchar|boolean|json|jsonb|uuid|timestamp|float|real|numeric|double)/gi, '');

    // Replace ILIKE with LIKE (case-insensitive in SQLite)
    converted = converted.replace(/\bILIKE\b/gi, 'LIKE');

    // Replace RETURNING * with just the INSERT/UPDATE (handle separately)
    // We'll handle RETURNING in the query method itself

    return converted;
  }

  /**
   * Execute a query (compatible with pg interface)
   */
  public async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    try {
      // Convert PostgreSQL syntax to SQLite
      const convertedSql = this.convertPostgresToSQLite(sql);
      const hasReturning = sql.toUpperCase().includes('RETURNING');

      // Remove RETURNING clause for SQLite
      const sqlWithoutReturning = hasReturning
        ? convertedSql.replace(/RETURNING\s+.*/i, '').trim()
        : convertedSql;

      // Convert boolean values to 0/1 for SQLite
      const convertedParams = params.map(p => typeof p === 'boolean' ? (p ? 1 : 0) : p);

      if (convertedSql.trim().toUpperCase().startsWith('SELECT') ||
          convertedSql.trim().toUpperCase().startsWith('WITH')) {
        // SELECT query - return rows
        const stmt = this.db.prepare(convertedSql);
        const rows = stmt.all(...convertedParams);
        return { rows, rowCount: rows.length };
      } else {
        // INSERT/UPDATE/DELETE
        const stmt = this.db.prepare(sqlWithoutReturning);
        const info = stmt.run(...convertedParams);

        // For INSERT with RETURNING, fetch the inserted row
        if (hasReturning) {
          const lastRowid = info.lastInsertRowid;
          const tableName = sql.match(/INSERT INTO (\w+)/i)?.[1];
          if (tableName && lastRowid) {
            // Use ROWID to fetch the just-inserted row (works for all primary key types)
            const row = this.db.prepare(`SELECT * FROM ${tableName} WHERE ROWID = ?`).get(lastRowid);
            return { rows: row ? [row] : [], rowCount: info.changes };
          }
        }

        return { rows: [], rowCount: info.changes };
      }
    } catch (error: any) {
      dbLogger.error({
        sql,
        params,
        error,
        message: error?.message,
        code: error?.code,
        stack: error?.stack
      }, 'Query error');
      throw error;
    }
  }

  /**
   * Get a client (for transaction support)
   */
  public async getClient(): Promise<SQLiteClient> {
    return new SQLiteClient(this.db);
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as healthy');
      return result.rows[0]?.healthy === 1;
    } catch {
      return false;
    }
  }

  /**
   * Get pool stats (compatibility method)
   */
  public getPoolStats() {
    return {
      total: 1,
      idle: 1,
      waiting: 0
    };
  }
}

/**
 * SQLite Client (for transaction support)
 */
class SQLiteClient {
  private inTransaction = false;

  constructor(private db: Database.Database) {}

  private convertPostgresToSQLite(sql: string): string {
    // Replace $1, $2, etc with ?
    let converted = sql.replace(/\$\d+/g, '?');

    // Remove ::type casts (including float, real, numeric, etc)
    converted = converted.replace(/::(text|integer|int|varchar|boolean|json|jsonb|uuid|timestamp|float|real|numeric|double)/gi, '');

    // Replace ILIKE with LIKE
    converted = converted.replace(/\bILIKE\b/gi, 'LIKE');

    return converted;
  }

  async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    try {
      const convertedSql = this.convertPostgresToSQLite(sql);

      if (convertedSql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = this.db.prepare(convertedSql);
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else if (convertedSql.trim().toUpperCase() === 'BEGIN') {
        this.db.prepare('BEGIN').run();
        this.inTransaction = true;
        return { rows: [], rowCount: 0 };
      } else if (convertedSql.trim().toUpperCase() === 'COMMIT') {
        this.db.prepare('COMMIT').run();
        this.inTransaction = false;
        return { rows: [], rowCount: 0 };
      } else if (convertedSql.trim().toUpperCase() === 'ROLLBACK') {
        this.db.prepare('ROLLBACK').run();
        this.inTransaction = false;
        return { rows: [], rowCount: 0 };
      } else {
        const stmt = this.db.prepare(convertedSql);
        const info = stmt.run(...params);
        return { rows: [], rowCount: info.changes };
      }
    } catch (error) {
      if (this.inTransaction) {
        this.db.prepare('ROLLBACK').run();
        this.inTransaction = false;
      }
      throw error;
    }
  }

  release(): void {
    // SQLite doesn't need connection release, but keep for compatibility
    if (this.inTransaction) {
      this.db.prepare('ROLLBACK').run();
      this.inTransaction = false;
    }
  }
}

// Export singleton instance
export const sqliteDb = SQLiteConnection.getInstance();
