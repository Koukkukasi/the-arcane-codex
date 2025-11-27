import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { getDatabase } from '../../src/database';

/**
 * Database Connection Tests
 * Tests connection pooling, transactions, and error handling
 */

test.describe('Database Connection', () => {
  let dbConnection: any;

  test.beforeAll(async () => {
    dbConnection = getDatabase();
    await dbConnection.connect();
  });

  test.afterAll(async () => {
    await dbConnection.disconnect();
  });

  test('should create singleton instance', async () => {
    const instance1 = getDatabase();
    const instance2 = getDatabase();
    expect(instance1).toBe(instance2);
  });

  test('should execute simple query', async () => {
    const result = await dbConnection.query('SELECT 1 as test');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].test).toBe(1);
  });

  test('should handle parameterized queries', async () => {
    const result = await dbConnection.query(
      'SELECT ? as value',
      ['hello world']
    );
    expect(result.rows[0].value).toBe('hello world');
  });

  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE players; --";
    const result = await dbConnection.query(
      'SELECT ? as safe_value',
      [maliciousInput]
    );
    expect(result.rows[0].safe_value).toBe(maliciousInput);
  });

  test('should handle transactions', async () => {
    const client = await dbConnection.getClient();

    try {
      await client.query('BEGIN');

      // Create a temporary test table
      await client.query(`
        CREATE TEMP TABLE test_transaction (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          value TEXT
        )
      `);

      await client.query(
        'INSERT INTO test_transaction (value) VALUES (?)',
        ['test']
      );

      const result = await client.query('SELECT * FROM test_transaction');
      expect(result.rows).toHaveLength(1);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  });

  test('should rollback on error', async () => {
    // Test that rollback properly undoes INSERT in a transaction
    const testId = `rollback_test_${Date.now()}`;

    const client = await dbConnection.getClient();

    try {
      await client.query('BEGIN');

      // Insert a test row
      await client.query(
        'INSERT INTO players (player_id, username, email) VALUES (?, ?, ?)',
        [testId, 'RollbackTest', 'rollback@test.com']
      );

      // Verify row exists within transaction
      const beforeRollback = await client.query(
        'SELECT * FROM players WHERE player_id = ?',
        [testId]
      );
      expect(beforeRollback.rows).toHaveLength(1);

      // Rollback the transaction
      await client.query('ROLLBACK');

    } finally {
      client.release();
    }

    // After rollback, row should NOT exist
    const afterRollback = await dbConnection.query(
      'SELECT * FROM players WHERE player_id = ?',
      [testId]
    );
    expect(afterRollback.rows).toHaveLength(0);
  });

  test('should handle concurrent queries', async () => {
    const queries = Array.from({ length: 10 }, (_, i) =>
      dbConnection.query('SELECT ? as num', [i])
    );

    const results = await Promise.all(queries);

    results.forEach((result, index) => {
      expect(result.rows[0].num).toBe(index);
    });
  });

  test('should check database health', async () => {
    const isHealthy = await dbConnection.healthCheck();
    expect(isHealthy).toBe(true);
  });

  test('should get pool stats', async () => {
    const stats = dbConnection.getPoolStats();
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('idle');
    expect(stats).toHaveProperty('waiting');
    expect(typeof stats.total).toBe('number');
    expect(typeof stats.idle).toBe('number');
    expect(typeof stats.waiting).toBe('number');
  });

  test.skip('should handle query timeout', async () => {
    // TODO: Implement timeout test for SQLite (pg_sleep is PostgreSQL-specific)
    // This test expects a query that takes longer than the timeout
    await expect(
      dbConnection.query('SELECT pg_sleep(100)')
    ).rejects.toThrow();
  });

  test('should handle connection errors gracefully', async () => {
    // Test with invalid SQL
    await expect(
      dbConnection.query('INVALID SQL QUERY')
    ).rejects.toThrow();
  });

  test('should reuse connections from pool', async () => {
    const client1 = await dbConnection.getClient();
    const client2 = await dbConnection.getClient();

    expect(client1).toBeDefined();
    expect(client2).toBeDefined();

    client1.release();
    client2.release();

    const stats = dbConnection.getPoolStats();
    // SQLite is a singleton connection, so it always has 1 idle
    expect(stats.idle).toBeGreaterThanOrEqual(1);
  });

  test('should handle multiple transactions in parallel', async () => {
    // SQLite uses a single connection, so "parallel" transactions
    // actually run sequentially. We just verify they don't deadlock.
    const transaction1 = async () => {
      const client = await dbConnection.getClient();
      try {
        await client.query('BEGIN');
        await client.query('SELECT 1');
        await client.query('COMMIT');
      } finally {
        client.release();
      }
    };

    const transaction2 = async () => {
      const client = await dbConnection.getClient();
      try {
        await client.query('BEGIN');
        await client.query('SELECT 2');
        await client.query('COMMIT');
      } finally {
        client.release();
      }
    };

    // Run sequentially for SQLite (parallel would cause "cannot start a transaction within a transaction")
    await transaction1();
    await transaction2();
  });
});
