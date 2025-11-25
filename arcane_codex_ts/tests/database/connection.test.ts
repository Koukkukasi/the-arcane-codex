import { test, expect } from '@playwright/test';
import { DatabaseConnection } from '../../src/database/connection';

/**
 * Database Connection Tests
 * Tests connection pooling, transactions, and error handling
 */

test.describe('Database Connection', () => {
  let dbConnection: DatabaseConnection;

  test.beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();
  });

  test.afterAll(async () => {
    await dbConnection.disconnect();
  });

  test('should create singleton instance', async () => {
    const instance1 = DatabaseConnection.getInstance();
    const instance2 = DatabaseConnection.getInstance();
    expect(instance1).toBe(instance2);
  });

  test('should execute simple query', async () => {
    const result = await dbConnection.query('SELECT 1 as test');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].test).toBe(1);
  });

  test('should handle parameterized queries', async () => {
    const result = await dbConnection.query(
      'SELECT $1::text as value',
      ['hello world']
    );
    expect(result.rows[0].value).toBe('hello world');
  });

  test('should prevent SQL injection', async () => {
    const maliciousInput = "'; DROP TABLE players; --";
    const result = await dbConnection.query(
      'SELECT $1::text as safe_value',
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
          id SERIAL PRIMARY KEY,
          value TEXT
        )
      `);

      await client.query(
        'INSERT INTO test_transaction (value) VALUES ($1)',
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
    const client = await dbConnection.getClient();

    try {
      await client.query('BEGIN');

      await client.query(`
        CREATE TEMP TABLE test_rollback (
          id SERIAL PRIMARY KEY,
          value TEXT NOT NULL
        )
      `);

      await client.query(
        'INSERT INTO test_rollback (value) VALUES ($1)',
        ['test1']
      );

      // This should fail (NULL constraint violation)
      await expect(
        client.query('INSERT INTO test_rollback (value) VALUES (NULL)')
      ).rejects.toThrow();

      await client.query('ROLLBACK');

      // Table should not exist after rollback
      await expect(
        client.query('SELECT * FROM test_rollback')
      ).rejects.toThrow();

    } finally {
      client.release();
    }
  });

  test('should handle concurrent queries', async () => {
    const queries = Array.from({ length: 10 }, (_, i) =>
      dbConnection.query('SELECT $1::int as num', [i])
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

  test('should handle query timeout', async () => {
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
    expect(stats.idle).toBeGreaterThanOrEqual(2);
  });

  test('should handle multiple transactions in parallel', async () => {
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

    await Promise.all([transaction1(), transaction2()]);
  });
});
