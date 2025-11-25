/**
 * Database Connection Manager
 * Handles PostgreSQL connection pooling and lifecycle
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { getDatabaseConfig, DatabaseConfig } from './config';
import { dbLogger } from '../services/logger';

/**
 * Options for transaction execution
 */
export interface TransactionOptions {
  /** Timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Maximum retry attempts for deadlocks (default: 3) */
  maxRetries?: number;
  /** Initial retry delay in milliseconds (default: 100) */
  retryDelay?: number;
  /** Isolation level (default: READ COMMITTED) */
  isolationLevel?: 'READ UNCOMMITTED' | 'READ COMMITTED' | 'REPEATABLE READ' | 'SERIALIZABLE';
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  private constructor(config?: DatabaseConfig) {
    this.config = config || getDatabaseConfig();
  }

  /**
   * Get singleton instance of database connection
   */
  public static getInstance(config?: DatabaseConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  /**
   * Initialize connection pool
   */
  public async connect(): Promise<void> {
    if (this.pool) {
      dbLogger.debug('Database pool already initialized');
      return;
    }

    try {
      this.pool = new Pool(this.config);

      // Test connection
      const client = await this.pool.connect();
      dbLogger.info({ database: this.config.database }, 'Connected to PostgreSQL database');
      client.release();

      // Handle pool errors
      this.pool.on('error', (err) => {
        dbLogger.error({ err }, 'Unexpected error on idle client');
      });
    } catch (error) {
      dbLogger.error({ error }, 'Failed to connect to database');
      throw error;
    }
  }

  /**
   * Execute a query with automatic connection management
   */
  public async query<T extends Record<string, any> = Record<string, any>>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call connect() first.');
    }

    try {
      const start = Date.now();
      const result = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;

      // Log slow queries (> 100ms)
      if (duration > 100) {
        dbLogger.warn({ duration, query: text.substring(0, 100) }, 'Slow query detected');
      }

      return result;
    } catch (error) {
      dbLogger.error({ error, query: text, params }, 'Query execution failed');
      throw error;
    }
  }

  /**
   * Get a client from the pool for transactions
   */
  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized. Call connect() first.');
    }

    return this.pool.connect();
  }

  /**
   * Execute a transaction with automatic rollback on error
   * Supports timeout, deadlock retry, and isolation levels
   */
  public async transaction<T>(
    callback: (client: PoolClient) => Promise<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    const {
      timeout = 30000,
      maxRetries = 3,
      retryDelay = 100,
      isolationLevel = 'READ COMMITTED'
    } = options;

    let lastError: Error | null = null;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      const client = await this.getClient();

      try {
        // Set statement timeout for this transaction
        await client.query(`SET LOCAL statement_timeout = ${timeout}`);

        // Begin transaction with isolation level
        await client.query(`BEGIN ISOLATION LEVEL ${isolationLevel}`);

        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error: any) {
        await client.query('ROLLBACK').catch(() => {});

        const isDeadlock = error.code === '40P01';
        const isTimeout = error.code === '57014';
        const isSerializationFailure = error.code === '40001';

        if ((isDeadlock || isSerializationFailure) && attempt < maxRetries) {
          lastError = error;
          const delay = retryDelay * Math.pow(2, attempt - 1);
          dbLogger.warn({
            attempt,
            maxRetries,
            errorCode: error.code,
            delay
          }, 'Transaction deadlock/serialization failure, retrying');
          await this.sleep(delay);
          continue;
        }

        if (isTimeout) {
          dbLogger.error({ timeout }, 'Transaction timeout exceeded');
        }

        throw error;
      } finally {
        client.release();
      }
    }

    throw lastError || new Error('Transaction failed after max retries');
  }

  /**
   * Sleep helper for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Close all connections in the pool
   */
  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      dbLogger.info('Database connection pool closed');
    }
  }

  /**
   * Check if connection is healthy
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.query('SELECT 1 as health');
      return result.rows[0].health === 1;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get current pool statistics
   */
  public getPoolStats(): {
    total: number;
    idle: number;
    waiting: number;
  } | null {
    if (!this.pool) return null;

    return {
      total: this.pool.totalCount,
      idle: this.pool.idleCount,
      waiting: this.pool.waitingCount
    };
  }
}

/**
 * Get database connection instance
 */
export function getDatabase(config?: DatabaseConfig): DatabaseConnection {
  return DatabaseConnection.getInstance(config);
}
