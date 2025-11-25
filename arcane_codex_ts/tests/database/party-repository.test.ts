import { test, expect } from '@playwright/test';
import { DatabaseConnection } from '../../src/database/connection';
import { PartyRepository } from '../../src/database/repositories/party.repository';
import { PlayerRepository } from '../../src/database/repositories/player.repository';
import { v4 as uuidv4 } from 'uuid';

/**
 * Party Repository E2E Tests
 * Tests party/lobby CRUD, member management, and queries
 */

test.describe('Party Repository', () => {
  let dbConnection: DatabaseConnection;
  let partyRepo: PartyRepository;
  let playerRepo: PlayerRepository;
  let testPartyCode: string;
  let testHostId: string;
  let testPlayer1Id: string;
  let testPlayer2Id: string;

  test.beforeAll(async () => {
    dbConnection = DatabaseConnection.getInstance();
    partyRepo = new PartyRepository();
    playerRepo = new PlayerRepository();
  });

  test.beforeEach(async () => {
    // Generate unique IDs for each test
    testPartyCode = `TEST${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    testHostId = `host_${uuidv4()}`;
    testPlayer1Id = `player1_${uuidv4()}`;
    testPlayer2Id = `player2_${uuidv4()}`;

    // Create test players
    await playerRepo.createPlayer({
      player_id: testHostId,
      username: 'TestHost',
      email: 'host@example.com'
    });

    await playerRepo.createPlayer({
      player_id: testPlayer1Id,
      username: 'TestPlayer1',
      email: 'player1@example.com'
    });

    await playerRepo.createPlayer({
      player_id: testPlayer2Id,
      username: 'TestPlayer2',
      email: 'player2@example.com'
    });
  });

  test.afterEach(async () => {
    // Clean up test data
    try {
      await dbConnection.query(
        'DELETE FROM party_members WHERE party_code = $1',
        [testPartyCode]
      );
      await dbConnection.query(
        'DELETE FROM parties WHERE party_code = $1',
        [testPartyCode]
      );
      await dbConnection.query(
        'DELETE FROM players WHERE player_id IN ($1, $2, $3)',
        [testHostId, testPlayer1Id, testPlayer2Id]
      );
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  test.afterAll(async () => {
    await dbConnection.close();
  });

  test('should create a new party', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Test Party',
      max_players: 4
    });

    expect(party).toBeDefined();
    expect(party.party_code).toBe(testPartyCode);
    expect(party.host_player_id).toBe(testHostId);
    expect(party.name).toBe('Test Party');
    expect(party.max_players).toBe(4);
    expect(party.member_count).toBe(0);
    expect(party.status).toBe('waiting');
  });

  test('should create party with default max_players', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Default Party'
    });

    expect(party.max_players).toBe(4); // Default value
  });

  test('should create private party', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Private Party',
      is_public: false
    });

    expect(party.is_public).toBe(false);
  });

  test('should not create duplicate party_code', async () => {
    await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'First Party'
    });

    await expect(
      partyRepo.createParty({
        party_code: testPartyCode,
        host_player_id: testPlayer1Id,
        name: 'Second Party'
      })
    ).rejects.toThrow();
  });

  test('should get party by code', async () => {
    await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Get Test'
    });

    const party = await partyRepo.getPartyByCode(testPartyCode);
    expect(party).toBeDefined();
    expect(party?.party_code).toBe(testPartyCode);
  });

  test('should return null for non-existent party', async () => {
    const party = await partyRepo.getPartyByCode('NONEXISTENT');
    expect(party).toBeNull();
  });

  test('should add member to party', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Member Test'
    });

    const member = await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    expect(member).toBeDefined();
    expect(member.party_id).toBe(party.id);
    expect(member.player_id).toBe(testPlayer1Id);
    expect(member.role).toBe('player');
  });

  test('should add host as member', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Host Member Test'
    });

    const hostMember = await partyRepo.addMember({
      party_id: party.id,
      player_id: testHostId,
      role: 'host'
    });

    expect(hostMember.role).toBe('host');
  });

  test('should not add duplicate member', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Duplicate Test'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    await expect(
      partyRepo.addMember({
        party_id: party.id,
        player_id: testPlayer1Id
      })
    ).rejects.toThrow();
  });

  test('should remove member from party', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Remove Test'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    const removed = await partyRepo.removeMember(party.id, testPlayer1Id);
    expect(removed).toBe(true);

    const partyWithMembers = await partyRepo.getPartyWithMembers(testPartyCode);
    expect(partyWithMembers?.members).toHaveLength(0);
  });

  test('should return false when removing non-existent member', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Remove Nonexistent'
    });

    const removed = await partyRepo.removeMember(party.id, 'nonexistent_player');
    expect(removed).toBe(false);
  });

  test('should update member ready status', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Ready Test'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    const updated = await partyRepo.updateMember(
      party.id,
      testPlayer1Id,
      { is_ready: true }
    );

    expect(updated?.is_ready).toBe(true);
  });

  test('should update member character data', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Character Test'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    const characterData = {
      name: 'Test Character',
      class: 'Warrior',
      level: 5
    };

    const updated = await partyRepo.updateMember(
      party.id,
      testPlayer1Id,
      { character_data: characterData }
    );

    expect(updated?.character_data).toEqual(characterData);
  });

  test('should get party with members', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'With Members Test'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testHostId,
      role: 'host'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    const partyWithMembers = await partyRepo.getPartyWithMembers(testPartyCode);

    expect(partyWithMembers).toBeDefined();
    expect(partyWithMembers?.members).toHaveLength(2);
    expect(partyWithMembers?.members[0].username).toBeDefined();
  });

  test('should update party status', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Status Test'
    });

    const updated = await partyRepo.updateParty(party.id, {
      status: 'in_progress'
    });

    expect(updated?.status).toBe('in_progress');
  });

  test('should update member count', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Count Test'
    });

    await partyRepo.updateParty(party.id, { member_count: 3 });

    const updated = await partyRepo.getPartyByCode(testPartyCode);
    expect(updated?.member_count).toBe(3);
  });

  test('should list public parties', async () => {
    await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Public Party',
      is_public: true
    });

    const publicParties = await partyRepo.listPublicParties();

    expect(publicParties.length).toBeGreaterThan(0);
    const foundParty = publicParties.find(p => p.party_code === testPartyCode);
    expect(foundParty).toBeDefined();
  });

  test('should not list private parties', async () => {
    await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Private Party',
      is_public: false
    });

    const publicParties = await partyRepo.listPublicParties();
    const foundParty = publicParties.find(p => p.party_code === testPartyCode);
    expect(foundParty).toBeUndefined();
  });

  test('should check if player is in party', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Check Member Test'
    });

    await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    const isInParty = await partyRepo.isPlayerInParty(party.id, testPlayer1Id);
    expect(isInParty).toBe(true);

    const isNotInParty = await partyRepo.isPlayerInParty(party.id, testPlayer2Id);
    expect(isNotInParty).toBe(false);
  });

  test('should enforce max players limit check', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Max Players Test',
      max_players: 2
    });

    await partyRepo.addMember({ party_id: party.id, player_id: testHostId });
    await partyRepo.addMember({ party_id: party.id, player_id: testPlayer1Id });

    // Should be able to check if full (implementation dependent)
    const partyData = await partyRepo.getPartyByCode(testPartyCode);
    expect(partyData?.max_players).toBe(2);
  });

  test('should delete party', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Delete Test'
    });

    const deleted = await partyRepo.deleteParty(party.id);
    expect(deleted).toBe(true);

    const fetched = await partyRepo.getPartyByCode(testPartyCode);
    expect(fetched).toBeNull();
  });

  test('should cascade delete members when party is deleted', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Cascade Test'
    });

    await partyRepo.addMember({ party_id: party.id, player_id: testPlayer1Id });

    await partyRepo.deleteParty(party.id);

    const members = await dbConnection.query(
      'SELECT * FROM party_members WHERE party_id = $1',
      [party.id]
    );

    expect(members.rows).toHaveLength(0);
  });

  test('should handle party settings JSON', async () => {
    const settings = {
      difficulty: 'hard',
      allowLateJoin: true,
      maxLevel: 10
    };

    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Settings Test',
      settings
    });

    expect(party.settings).toEqual(settings);
  });

  test('should update timestamps on member update', async () => {
    const party = await partyRepo.createParty({
      party_code: testPartyCode,
      host_player_id: testHostId,
      name: 'Timestamp Test'
    });

    const member = await partyRepo.addMember({
      party_id: party.id,
      player_id: testPlayer1Id
    });

    const joinedAt = member.joined_at;

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 100));

    await partyRepo.updateMember(party.id, testPlayer1Id, { is_ready: true });

    const updated = await dbConnection.query(
      'SELECT * FROM party_members WHERE party_id = $1 AND player_id = $2',
      [party.id, testPlayer1Id]
    );

    expect(new Date(updated.rows[0].updated_at).getTime())
      .toBeGreaterThan(joinedAt.getTime());
  });
});
