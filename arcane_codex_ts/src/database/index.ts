/**
 * Database Module
 * Central export for all database functionality
 */

// Configuration
export { getDatabaseConfig, getTestDatabaseConfig } from './config';
export type { DatabaseConfig } from './config';

// Connection
export { DatabaseConnection } from './connection';
export { SQLiteConnection } from './sqlite-connection';

// Database Factory
export type DatabaseType = 'sqlite' | 'postgres';

/**
 * Get the active database connection based on DB_TYPE env var
 */
export function getDatabase() {
  const dbType = (process.env.DB_TYPE || 'sqlite') as DatabaseType;

  if (dbType === 'sqlite') {
    const { SQLiteConnection } = require('./sqlite-connection');
    return SQLiteConnection.getInstance();
  } else {
    const { DatabaseConnection } = require('./connection');
    return DatabaseConnection.getInstance();
  }
}

// Models
export * from './models/player.model';
export * from './models/party.model';
export * from './models/session.model';

// Repositories
export * from './repositories';
