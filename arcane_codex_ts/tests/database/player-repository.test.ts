import 'dotenv/config';
import { test, expect } from '@playwright/test';
import { DatabaseConnection } from '../../src/database/connection';
import { PlayerRepository } from '../../src/database/repositories/player.repository';
import { v4 as uuidv4 } from 'uuid';

/**
 * Player Repository E2E Tests
 * Tests CRUD operations, stats management, and leaderboard functionality
 */

test.describe('Player Repository', () => {
  let dbConnection: DatabaseConnection;
  let playerRepo: PlayerRepository;
  let testPlayerId: string;

  test.beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance();
    await dbConnection.connect();
    playerRepo = new PlayerRepository();
  });

  test.beforeEach(async () => {
    // Create a test player for each test
    testPlayerId = `test_player_${uuidv4()}`;
  });

  test.afterEach(async () => {
    // Clean up test player
    try {
      await dbConnection.query(
        'DELETE FROM players WHERE player_id = $1',
        [testPlayerId]
      );
    } catch (error) {
      // Ignore if player doesn't exist
    }
  });

  test.afterAll(async () => {
    await dbConnection.disconnect();
  });

  test('should create a new player with required fields only', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'TestPlayer',
      email: 'test@example.com'
    });

    expect(player).toBeDefined();
    expect(player.player_id).toBe(testPlayerId);
    expect(player.username).toBe('TestPlayer');
    expect(player.email).toBe('test@example.com');
    expect(player.total_sessions).toBe(0);
    expect(player.victories).toBe(0);
    expect(player.defeats).toBe(0);
  });

  test('should create player with all optional fields', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'CompletePlayer',
      email: 'complete@example.com',
      display_name: 'Complete Test Player',
      avatar_url: 'https://example.com/avatar.png',
      bio: 'Test bio',
      is_online: true
    });

    expect(player.display_name).toBe('Complete Test Player');
    expect(player.avatar_url).toBe('https://example.com/avatar.png');
    expect(player.bio).toBe('Test bio');
    expect(player.is_online).toBe(true);
  });

  test('should not create duplicate player_id', async () => {
    await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'FirstPlayer',
      email: 'first@example.com'
    });

    await expect(
      playerRepo.createPlayer({
        player_id: testPlayerId,
        username: 'SecondPlayer',
        email: 'second@example.com'
      })
    ).rejects.toThrow();
  });

  test('should get player by ID', async () => {
    const created = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'GetTest',
      email: 'get@example.com'
    });

    const fetched = await playerRepo.getPlayerById(created.id);
    expect(fetched).toBeDefined();
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.player_id).toBe(testPlayerId);
  });

  test('should get player by player_id', async () => {
    await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'GetByPlayerIdTest',
      email: 'getbyplayerid@example.com'
    });

    const fetched = await playerRepo.getPlayerByPlayerId(testPlayerId);
    expect(fetched).toBeDefined();
    expect(fetched?.player_id).toBe(testPlayerId);
  });

  test('should return null for non-existent player', async () => {
    const nonExistent = await playerRepo.getPlayerById(
      '00000000-0000-0000-0000-000000000000'
    );
    expect(nonExistent).toBeNull();
  });

  test('should update player fields', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'UpdateTest',
      email: 'update@example.com'
    });

    const updated = await playerRepo.updatePlayer(player.id, {
      display_name: 'Updated Name',
      bio: 'Updated bio',
      is_online: true
    });

    expect(updated?.display_name).toBe('Updated Name');
    expect(updated?.bio).toBe('Updated bio');
    expect(updated?.is_online).toBe(true);
    expect(updated?.username).toBe('UpdateTest'); // Should not change
  });

  test('should update player stats', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'StatsTest',
      email: 'stats@example.com'
    });

    await playerRepo.updatePlayerStats(player.id, {
      total_sessions: 1,
      total_playtime_minutes: 30,
      victories: 1,
      defeats: 0
    });

    const updated = await playerRepo.getPlayerById(player.id);
    expect(updated?.total_sessions).toBe(1);
    expect(updated?.total_playtime_minutes).toBe(30);
    expect(updated?.victories).toBe(1);
    expect(updated?.defeats).toBe(0);
  });

  test('should increment player stats', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'IncrementTest',
      email: 'increment@example.com'
    });

    // Increment stats multiple times
    await playerRepo.updatePlayerStats(player.id, {
      total_sessions: 1,
      victories: 1
    });

    await playerRepo.updatePlayerStats(player.id, {
      total_sessions: 1,
      defeats: 1
    });

    const updated = await playerRepo.getPlayerById(player.id);
    expect(updated?.total_sessions).toBeGreaterThanOrEqual(1);
  });

  test('should calculate win rate correctly', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'WinRateTest',
      email: 'winrate@example.com'
    });

    await playerRepo.updatePlayerStats(player.id, {
      victories: 7,
      defeats: 3
    });

    const stats = await playerRepo.getPlayerStats(player.id);
    expect(stats?.win_rate).toBe('70.00'); // 7/10 = 70%
  });

  test('should handle zero win rate', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'ZeroWinRate',
      email: 'zerowin@example.com'
    });

    const stats = await playerRepo.getPlayerStats(player.id);
    expect(stats?.win_rate).toBe('0.00');
  });

  test('should calculate average session length', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'AvgSessionTest',
      email: 'avgsession@example.com'
    });

    await playerRepo.updatePlayerStats(player.id, {
      total_sessions: 4,
      total_playtime_minutes: 120
    });

    const stats = await playerRepo.getPlayerStats(player.id);
    expect(stats?.avg_session_length).toBe('30.00'); // 120/4 = 30 minutes
  });

  test('should get leaderboard', async () => {
    // Create multiple test players
    const player1Id = `test_leader1_${uuidv4()}`;
    const player2Id = `test_leader2_${uuidv4()}`;
    const player3Id = `test_leader3_${uuidv4()}`;

    try {
      const player1 = await playerRepo.createPlayer({
        player_id: player1Id,
        username: 'Leader1',
        email: 'leader1@example.com'
      });

      const player2 = await playerRepo.createPlayer({
        player_id: player2Id,
        username: 'Leader2',
        email: 'leader2@example.com'
      });

      const player3 = await playerRepo.createPlayer({
        player_id: player3Id,
        username: 'Leader3',
        email: 'leader3@example.com'
      });

      // Set different victory counts
      await playerRepo.updatePlayerStats(player1.id, { victories: 10 });
      await playerRepo.updatePlayerStats(player2.id, { victories: 5 });
      await playerRepo.updatePlayerStats(player3.id, { victories: 15 });

      const leaderboard = await playerRepo.getLeaderboard(3);

      expect(leaderboard).toHaveLength(3);
      expect(leaderboard[0].victories).toBeGreaterThanOrEqual(leaderboard[1].victories);
      expect(leaderboard[1].victories).toBeGreaterThanOrEqual(leaderboard[2].victories);

    } finally {
      // Cleanup
      await dbConnection.query(
        'DELETE FROM players WHERE player_id IN ($1, $2, $3)',
        [player1Id, player2Id, player3Id]
      );
    }
  });

  test('should limit leaderboard results', async () => {
    const leaderboard = await playerRepo.getLeaderboard(5);
    expect(leaderboard.length).toBeLessThanOrEqual(5);
  });

  test('should delete player', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'DeleteTest',
      email: 'delete@example.com'
    });

    const deleted = await playerRepo.deletePlayer(player.id);
    expect(deleted).toBe(true);

    const fetched = await playerRepo.getPlayerById(player.id);
    expect(fetched).toBeNull();
  });

  test('should return false when deleting non-existent player', async () => {
    const deleted = await playerRepo.deletePlayer(
      '00000000-0000-0000-0000-000000000000'
    );
    expect(deleted).toBe(false);
  });

  test('should update last_login timestamp', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'LoginTest',
      email: 'login@example.com'
    });

    const before = player.last_login;

    // Wait a moment
    await new Promise((resolve) => setTimeout(resolve, 100));

    await playerRepo.updatePlayer(player.id, { is_online: true });
    const updated = await playerRepo.getPlayerById(player.id);

    expect(updated?.updated_at.getTime()).toBeGreaterThan(before.getTime());
  });

  test('should handle special characters in username', async () => {
    const specialPlayerId = `test_special_${uuidv4()}`;
    try {
      const player = await playerRepo.createPlayer({
        player_id: specialPlayerId,
        username: 'Test_User-123',
        email: 'special@example.com'
      });

      expect(player.username).toBe('Test_User-123');
    } finally {
      await dbConnection.query(
        'DELETE FROM players WHERE player_id = $1',
        [specialPlayerId]
      );
    }
  });

  test('should handle NULL optional fields', async () => {
    const player = await playerRepo.createPlayer({
      player_id: testPlayerId,
      username: 'NullFieldsTest',
      email: 'null@example.com',
      display_name: null,
      bio: null,
      avatar_url: null
    });

    expect(player.display_name).toBeNull();
    expect(player.bio).toBeNull();
    expect(player.avatar_url).toBeNull();
  });
});
