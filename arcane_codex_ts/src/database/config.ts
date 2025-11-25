/**
 * Database Configuration
 * PostgreSQL connection settings and pool configuration
 */

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  max: number;  // Maximum number of clients in pool
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

/**
 * Get database configuration from environment variables or defaults
 */
export function getDatabaseConfig(): DatabaseConfig {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'arcane_codex',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: parseInt(process.env.DB_POOL_MAX || '20'),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  };
}

/**
 * Get test database configuration (separate database for testing)
 */
export function getTestDatabaseConfig(): DatabaseConfig {
  return {
    ...getDatabaseConfig(),
    database: process.env.DB_TEST_NAME || 'arcane_codex_test',
    max: 5  // Smaller pool for tests
  };
}
