/**
 * Database Module
 * Central export for all database functionality
 */

// Configuration
export { getDatabaseConfig, getTestDatabaseConfig } from './config';
export type { DatabaseConfig } from './config';

// Connection
import { DatabaseConnection } from './connection';
import { SQLiteConnection } from './sqlite-connection';

export { DatabaseConnection, SQLiteConnection };

// Database Factory
export type DatabaseType = 'sqlite' | 'postgres';

/**
 * Get the active database connection based on DB_TYPE env var
 */
export function getDatabase(): DatabaseConnection | SQLiteConnection {
  const dbType = (process.env.DB_TYPE || 'sqlite') as DatabaseType;

  if (dbType === 'sqlite') {
    return SQLiteConnection.getInstance();
  } else {
    return DatabaseConnection.getInstance();
  }
}

// Models
export * from './models/player.model';
export * from './models/party.model';
export * from './models/session.model';

// Repositories
export * from './repositories';
