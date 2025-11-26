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
   * Execute a query (compatible with pg interface)
   */
  public async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT') ||
          sql.trim().toUpperCase().startsWith('WITH')) {
        // SELECT query - return rows
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else {
        // INSERT/UPDATE/DELETE
        const stmt = this.db.prepare(sql);
        const info = stmt.run(...params);

        // For INSERT with RETURNING, need to fetch the inserted row
        if (sql.toUpperCase().includes('RETURNING')) {
          // SQLite doesn't support RETURNING, so we'll fetch last insert
          const lastId = info.lastInsertRowid;
          const tableName = sql.match(/INSERT INTO (\w+)/i)?.[1];
          if (tableName && lastId) {
            const row = this.db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(lastId);
            return { rows: row ? [row] : [], rowCount: info.changes };
          }
        }

        return { rows: [], rowCount: info.changes };
      }
    } catch (error) {
      dbLogger.error({ sql, params, error }, 'Query error');
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

  async query(sql: string, params: any[] = []): Promise<{ rows: any[]; rowCount: number }> {
    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const stmt = this.db.prepare(sql);
        const rows = stmt.all(...params);
        return { rows, rowCount: rows.length };
      } else if (sql.trim().toUpperCase() === 'BEGIN') {
        this.db.prepare('BEGIN').run();
        this.inTransaction = true;
        return { rows: [], rowCount: 0 };
      } else if (sql.trim().toUpperCase() === 'COMMIT') {
        this.db.prepare('COMMIT').run();
        this.inTransaction = false;
        return { rows: [], rowCount: 0 };
      } else if (sql.trim().toUpperCase() === 'ROLLBACK') {
        this.db.prepare('ROLLBACK').run();
        this.inTransaction = false;
        return { rows: [], rowCount: 0 };
      } else {
        const stmt = this.db.prepare(sql);
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
