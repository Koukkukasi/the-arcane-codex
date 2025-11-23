/**
 * End-to-End Multiplayer Session Tests
 * Tests complete multiplayer game flow with real browser instances
 */

import { test, expect, Page } from '@playwright/test';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';
const API_BASE = `${SERVER_URL}/api/multiplayer`;

test.describe('End-to-End Multiplayer Session', () => {
  test.describe('Two-Player Session Flow', () => {
    let partyCode: string;
    let socket1: Socket;
    let socket2: Socket;
    const hostId = `host_e2e_${Date.now()}`;
    const player1Id = `player1_e2e_${Date.now()}`;
    const player2Id = `player2_e2e_${Date.now()}`;

    test.afterEach(() => {
      if (socket1?.connected) socket1.disconnect();
      if (socket2?.connected) socket2.disconnect();
    });

    test('should complete full multiplayer session lifecycle', async ({ request }) => {
      // Step 1: Create party
      console.log('[E2E] Step 1: Creating party...');
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId,
          partyName: 'E2E Test Adventure',
          maxPlayers: 4
        }
      });

      expect(createResponse.status()).toBe(200);
      const createData = await createResponse.json();
      partyCode = createData.data.code;
      console.log(`[E2E] Party created: ${partyCode}`);

      // Step 2: Connect Socket.IO clients
      console.log('[E2E] Step 2: Connecting Socket.IO clients...');
      socket1 = io(SERVER_URL, { reconnection: false });
      socket2 = io(SERVER_URL, { reconnection: false });

      await Promise.all([
        new Promise(resolve => socket1.on('connect', resolve)),
        new Promise(resolve => socket2.on('connect', resolve))
      ]);

      expect(socket1.connected).toBe(true);
      expect(socket2.connected).toBe(true);
      console.log('[E2E] Sockets connected');

      // Step 3: Join room with both players
      console.log('[E2E] Step 3: Joining room...');
      const join1Promise = new Promise<any>((resolve) => {
        socket1.emit('join_room', {
          roomId: partyCode,
          playerId: player1Id,
          playerName: 'Player One',
          rejoin: false
        }, resolve);
      });

      const join2Promise = new Promise<any>((resolve) => {
        socket2.emit('join_room', {
          roomId: partyCode,
          playerId: player2Id,
          playerName: 'Player Two',
          rejoin: false
        }, resolve);
      });

      const [join1Response, join2Response] = await Promise.all([join1Promise, join2Promise]);
      expect(join1Response.success).toBe(true);
      expect(join2Response.success).toBe(true);
      console.log('[E2E] Both players joined room');

      // Step 4: Test chat communication
      console.log('[E2E] Step 4: Testing chat...');
      const chatPromise = new Promise((resolve) => {
        socket2.once('chat_message', resolve);
      });

      await new Promise<void>((resolve) => {
        socket1.emit('chat_message', {
          roomId: partyCode,
          playerId: player1Id,
          message: 'Ready to start the adventure!'
        }, () => resolve());
      });

      const chatMessage: any = await chatPromise;
      expect(chatMessage.message).toBe('Ready to start the adventure!');
      expect(chatMessage.playerName).toBe('Player One');
      console.log('[E2E] Chat communication successful');

      // Step 5: Set ready status
      console.log('[E2E] Step 5: Setting ready status...');
      const readyPromise = new Promise((resolve) => {
        socket2.once('player_ready_changed', resolve);
      });

      await new Promise<void>((resolve) => {
        socket1.emit('ready_status', {
          roomId: partyCode,
          playerId: player1Id,
          isReady: true
        }, () => resolve());
      });

      const readyChange: any = await readyPromise;
      expect(readyChange.playerId).toBe(player1Id);
      expect(readyChange.isReady).toBe(true);
      console.log('[E2E] Ready status broadcast successful');

      // Step 6: Test scenario choice (asymmetric)
      console.log('[E2E] Step 6: Testing scenario choice...');
      const scenarioPromise = new Promise((resolve) => {
        socket2.once('scenario_choice_made', resolve);
      });

      await new Promise<void>((resolve) => {
        socket1.emit('scenario_choice', {
          playerId: player1Id,
          scenarioId: 'test_scenario_1',
          choiceId: 'choice_a'
        }, () => resolve());
      });

      const scenarioData: any = await scenarioPromise;
      expect(scenarioData.playerId).toBe(player1Id);
      expect(scenarioData.choiceId).toBeUndefined(); // Should be hidden
      console.log('[E2E] Scenario choice (asymmetric) successful');

      // Step 7: Test heartbeat
      console.log('[E2E] Step 7: Testing heartbeat...');
      const heartbeatResponse = await new Promise<any>((resolve) => {
        socket1.emit('heartbeat', {
          roomId: partyCode,
          playerId: player1Id,
          timestamp: Date.now()
        }, resolve);
      });

      expect(heartbeatResponse.success).toBe(true);
      console.log('[E2E] Heartbeat successful');

      // Step 8: Test sync
      console.log('[E2E] Step 8: Testing state sync...');
      const syncResponse = await new Promise<any>((resolve) => {
        socket1.emit('request_sync', {
          roomId: partyCode,
          playerId: player1Id,
          syncType: 'full'
        }, resolve);
      });

      expect(syncResponse.success).toBe(true);
      expect(syncResponse.data.roomId).toBe(partyCode);
      console.log('[E2E] State sync successful');

      // Step 9: Player 1 leaves
      console.log('[E2E] Step 9: Testing leave...');
      const leavePromise = new Promise((resolve) => {
        socket2.once('player_left', resolve);
      });

      await new Promise<void>((resolve) => {
        socket1.emit('leave_room', {
          roomId: partyCode,
          playerId: player1Id,
          reason: 'manual'
        }, () => resolve());
      });

      const leaveData: any = await leavePromise;
      expect(leaveData.playerId).toBe(player1Id);
      console.log('[E2E] Leave notification successful');

      // Step 10: Verify party state via API
      console.log('[E2E] Step 10: Verifying final party state...');
      const detailsResponse = await request.get(`${API_BASE}/party/${partyCode}`);
      const detailsData = await detailsResponse.json();
      expect(detailsData.data.playerCount).toBe(2); // Host + Player2
      console.log('[E2E] Final party state verified');

      console.log('[E2E] ✅ Full multiplayer session lifecycle complete!');
    });
  });

  test.describe('Reconnection Flow', () => {
    let partyCode: string;
    let socket1: Socket;
    const playerId = `reconnect_player_${Date.now()}`;

    test.afterEach(() => {
      if (socket1?.connected) socket1.disconnect();
    });

    test('should reconnect and recover session', async ({ request }) => {
      // Create party
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_reconnect_${Date.now()}`,
          partyName: 'Reconnect Test Party',
          maxPlayers: 4
        }
      });
      const createData = await createResponse.json();
      partyCode = createData.data.code;

      // Initial connection
      socket1 = io(SERVER_URL, { reconnection: true, reconnectionAttempts: 3 });
      await new Promise(resolve => socket1.on('connect', resolve));

      // Join room
      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId: partyCode,
          playerId,
          playerName: 'ReconnectPlayer',
          rejoin: false
        }, () => resolve());
      });

      // Disconnect
      socket1.disconnect();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Reconnect
      socket1.connect();
      await new Promise(resolve => socket1.on('connect', resolve));

      // Rejoin with same player ID
      const rejoinResponse = await new Promise<any>((resolve) => {
        socket1.emit('join_room', {
          roomId: partyCode,
          playerId,
          playerName: 'ReconnectPlayer',
          rejoin: true
        }, resolve);
      });

      expect(rejoinResponse.success).toBe(true);
      expect(rejoinResponse.data.reconnected).toBe(true);
    });
  });

  test.describe('Multi-Player Coordination', () => {
    let partyCode: string;
    const sockets: Socket[] = [];
    const playerIds: string[] = [];

    test.afterEach(() => {
      sockets.forEach(s => s?.connected && s.disconnect());
    });

    test('should coordinate 3-player session', async ({ request }) => {
      // Create party
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_multi_${Date.now()}`,
          partyName: 'Multi-Player Test',
          maxPlayers: 6
        }
      });
      const createData = await createResponse.json();
      partyCode = createData.data.code;

      // Connect 3 players
      for (let i = 0; i < 3; i++) {
        const socket = io(SERVER_URL, { reconnection: false });
        const playerId = `player${i + 1}_multi_${Date.now()}`;
        sockets.push(socket);
        playerIds.push(playerId);

        await new Promise(resolve => socket.on('connect', resolve));

        await new Promise<void>((resolve) => {
          socket.emit('join_room', {
            roomId: partyCode,
            playerId,
            playerName: `Player ${i + 1}`,
            rejoin: false
          }, () => resolve());
        });
      }

      // All players should be connected
      expect(sockets.every(s => s.connected)).toBe(true);

      // Test broadcast to all
      const chatPromises = sockets.slice(1).map(s =>
        new Promise(resolve => s.once('chat_message', resolve))
      );

      await new Promise<void>((resolve) => {
        sockets[0].emit('chat_message', {
          roomId: partyCode,
          playerId: playerIds[0],
          message: 'Hello everyone!'
        }, () => resolve());
      });

      const messages = await Promise.all(chatPromises);
      expect(messages.length).toBe(2); // Other 2 players received
      expect((messages[0] as any).message).toBe('Hello everyone!');

      // Verify party has 4 players (host + 3 players)
      const detailsResponse = await request.get(`${API_BASE}/party/${partyCode}`);
      const detailsData = await detailsResponse.json();
      expect(detailsData.data.playerCount).toBe(4);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle invalid room gracefully', async () => {
      const socket = io(SERVER_URL, { reconnection: false });
      await new Promise(resolve => socket.on('connect', resolve));

      const response = await new Promise<any>((resolve) => {
        socket.emit('join_room', {
          roomId: 'INVALID',
          playerId: `error_test_${Date.now()}`,
          playerName: 'ErrorTest',
          rejoin: false
        }, resolve);
      });

      expect(response.success).toBe(false);
      socket.disconnect();
    });

    test('should handle missing player ID', async () => {
      const socket = io(SERVER_URL, { reconnection: false });
      await new Promise(resolve => socket.on('connect', resolve));

      const response = await new Promise<any>((resolve) => {
        socket.emit('chat_message', {
          roomId: 'TEST123',
          message: 'Should fail'
        }, resolve);
      });

      expect(response.success).toBe(false);
      socket.disconnect();
    });
  });

  test.describe('Performance & Stress', () => {
    test('should handle rapid message sending', async ({ request }) => {
      // Create party
      const createResponse = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_perf_${Date.now()}`,
          partyName: 'Performance Test',
          maxPlayers: 4
        }
      });
      const createData = await createResponse.json();
      const partyCode = createData.data.code;

      const socket = io(SERVER_URL, { reconnection: false });
      await new Promise(resolve => socket.on('connect', resolve));

      const playerId = `perf_player_${Date.now()}`;
      await new Promise<void>((resolve) => {
        socket.emit('join_room', {
          roomId: partyCode,
          playerId,
          playerName: 'PerfPlayer',
          rejoin: false
        }, () => resolve());
      });

      // Send 10 rapid messages
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(new Promise<void>((resolve) => {
          socket.emit('chat_message', {
            roomId: partyCode,
            playerId,
            message: `Message ${i}`
          }, () => resolve());
        }));
      }

      await Promise.all(promises);
      socket.disconnect();
    });
  });
});
