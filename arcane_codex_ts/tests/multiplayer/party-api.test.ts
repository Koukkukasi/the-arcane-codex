/**
 * Party Management API Tests
 * Tests for party creation, joining, leaving, and management
 */

import { test, expect } from '@playwright/test';

const API_BASE = 'http://localhost:3000/api/multiplayer';

test.describe('Party Management API', () => {
  let partyCode: string;
  const hostId = `host_${Date.now()}`;
  const playerId1 = `player1_${Date.now()}`;
  const playerId2 = `player2_${Date.now()}`;

  test.describe('Party Creation', () => {
    test('should create a new party successfully', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId,
          partyName: 'Test Adventure Party',
          maxPlayers: 4
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.code).toBeTruthy();
      expect(data.data.code).toMatch(/^[A-Z0-9]{6}$/);
      expect(data.data.name).toBe('Test Adventure Party');
      expect(data.data.host).toBe(hostId);
      expect(data.data.playerCount).toBe(1);
      expect(data.data.settings.maxPlayers).toBe(4);

      partyCode = data.data.code;
    });

    test('should fail to create party without hostId', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          partyName: 'Test Party'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Host ID and party name are required');
    });

    test('should fail to create party without partyName', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: 'test-host'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Host ID and party name are required');
    });

    test('should enforce party size limits (min 2)', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_min_${Date.now()}`,
          partyName: 'Min Size Test',
          maxPlayers: 1
        }
      });

      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Party size must be between 2 and 6 players');
    });

    test('should enforce party size limits (max 6)', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_max_${Date.now()}`,
          partyName: 'Max Size Test',
          maxPlayers: 7
        }
      });

      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Party size must be between 2 and 6 players');
    });

    test('should prevent host from creating multiple parties', async ({ request }) => {
      const testHostId = `host_duplicate_${Date.now()}`;

      // Create first party
      await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: testHostId,
          partyName: 'First Party',
          maxPlayers: 4
        }
      });

      // Try to create second party with same host
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: testHostId,
          partyName: 'Second Party',
          maxPlayers: 4
        }
      });

      expect(response.status()).toBe(500);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Host is already in a party');
    });
  });

  test.describe('Party Joining', () => {
    test.beforeEach(async ({ request }) => {
      // Create a party for joining tests
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_join_${Date.now()}`,
          partyName: 'Join Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      partyCode = data.data.code;
    });

    test('should join existing party successfully', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode,
          playerId: playerId1,
          playerName: 'TestPlayer1'
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.code).toBe(partyCode);
      expect(data.data.playerCount).toBe(2);
      expect(data.data.players).toHaveLength(2);
    });

    test('should fail to join non-existent party', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode: 'FAKE99',
          playerId: playerId2,
          playerName: 'TestPlayer2'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Party not found');
    });

    test('should fail to join without required fields', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode
          // Missing playerId and playerName
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('required');
    });

    test('should prevent joining when party is full', async ({ request }) => {
      // Create party with max 2 players
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_full_${Date.now()}`,
          partyName: 'Full Party Test',
          maxPlayers: 2
        }
      });
      const createData = await createResponse.json();
      const fullPartyCode = createData.data.code;

      // Join with first player (party now full: host + 1 player = 2)
      await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode: fullPartyCode,
          playerId: `player_full1_${Date.now()}`,
          playerName: 'Player1'
        }
      });

      // Try to join with second player (should fail)
      const response = await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode: fullPartyCode,
          playerId: `player_full2_${Date.now()}`,
          playerName: 'Player2'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Party is full');
    });

    test('should prevent player from joining multiple parties', async ({ request }) => {
      const duplicatePlayerId = `player_dup_${Date.now()}`;

      // Join first party
      await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode,
          playerId: duplicatePlayerId,
          playerName: 'DuplicatePlayer'
        }
      });

      // Create second party
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_dup_${Date.now()}`,
          partyName: 'Second Party',
          maxPlayers: 4
        }
      });
      const createData = await createResponse.json();
      const secondPartyCode = createData.data.code;

      // Try to join second party with same player
      const response = await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode: secondPartyCode,
          playerId: duplicatePlayerId,
          playerName: 'DuplicatePlayer'
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Player is already in a party');
    });
  });

  test.describe('Party Details', () => {
    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_details_${Date.now()}`,
          partyName: 'Details Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      partyCode = data.data.code;
    });

    test('should get party details successfully', async ({ request }) => {
      const response = await request.get(`${API_BASE}/party/${partyCode}`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.code).toBe(partyCode);
      expect(data.data.name).toBe('Details Test Party');
      expect(data.data.playerCount).toBe(1);
      expect(data.data.maxPlayers).toBe(4);
      expect(data.data.players).toBeDefined();
      expect(data.data.createdAt).toBeDefined();
      expect(data.data.lastActivity).toBeDefined();
    });

    test('should return 404 for non-existent party', async ({ request }) => {
      const response = await request.get(`${API_BASE}/party/NOTFND`);

      expect(response.status()).toBe(404);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toBe('Party not found');
    });
  });

  test.describe('Party Leaving', () => {
    let leavePartyCode: string;
    let leavePlayerId: string;

    test.beforeEach(async ({ request }) => {
      // Create party
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_leave_${Date.now()}`,
          partyName: 'Leave Test Party',
          maxPlayers: 4
        }
      });
      const createData = await createResponse.json();
      leavePartyCode = createData.data.code;

      // Add a player
      leavePlayerId = `player_leave_${Date.now()}`;
      await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode: leavePartyCode,
          playerId: leavePlayerId,
          playerName: 'LeaveTestPlayer'
        }
      });
    });

    test('should leave party successfully', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/${leavePartyCode}/leave`, {
        data: {
          playerId: leavePlayerId
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);

      // Verify player is no longer in party
      const detailsResponse = await request.get(`${API_BASE}/party/${leavePartyCode}`);
      const detailsData = await detailsResponse.json();
      expect(detailsData.data.playerCount).toBe(1); // Only host remains
    });

    test('should fail to leave without playerId', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/${leavePartyCode}/leave`, {
        data: {}
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
      expect(data.error).toContain('Player ID is required');
    });
  });

  test.describe('Party Ready Status', () => {
    let readyPartyCode: string;
    let readyPlayerId: string;

    test.beforeEach(async ({ request }) => {
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_ready_${Date.now()}`,
          partyName: 'Ready Test Party',
          maxPlayers: 4
        }
      });
      const createData = await createResponse.json();
      readyPartyCode = createData.data.code;

      readyPlayerId = `player_ready_${Date.now()}`;
      await request.post(`${API_BASE}/party/join`, {
        data: {
          partyCode: readyPartyCode,
          playerId: readyPlayerId,
          playerName: 'ReadyTestPlayer'
        }
      });
    });

    test('should set player ready status', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/${readyPartyCode}/ready`, {
        data: {
          playerId: readyPlayerId,
          ready: true
        }
      });

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.allPlayersReady).toBe(false); // Host is not ready
    });

    test('should detect when all players are ready', async ({ request }) => {
      // Get host ID from party details
      const detailsResponse = await request.get(`${API_BASE}/party/${readyPartyCode}`);
      const detailsData = await detailsResponse.json();
      const hostPlayerId = detailsData.data.host;

      // Set player ready
      await request.post(`${API_BASE}/party/${readyPartyCode}/ready`, {
        data: {
          playerId: readyPlayerId,
          ready: true
        }
      });

      // Set host ready
      const response = await request.post(`${API_BASE}/party/${readyPartyCode}/ready`, {
        data: {
          playerId: hostPlayerId,
          ready: true
        }
      });

      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.allPlayersReady).toBe(true);
    });

    test('should fail to set ready without required fields', async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/${readyPartyCode}/ready`, {
        data: {
          playerId: readyPlayerId
          // Missing ready field
        }
      });

      expect(response.status()).toBe(400);
      const data = await response.json();
      expect(data.success).toBe(false);
    });
  });

  test.describe('Public Party Listing', () => {
    test('should list public parties', async ({ request }) => {
      const response = await request.get(`${API_BASE}/parties/public`);

      expect(response.status()).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data)).toBe(true);
      // Note: May be empty array if no public parties exist
    });
  });
});
