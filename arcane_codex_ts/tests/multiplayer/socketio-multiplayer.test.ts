/**
 * Socket.IO Multiplayer Tests
 * Tests for real-time multiplayer features via Socket.IO
 */

import { test, expect } from '@playwright/test';
import { io, Socket } from 'socket.io-client';

const SERVER_URL = 'http://localhost:5000';
const API_BASE = `${SERVER_URL}/api/multiplayer`;

// Helper to create Socket.IO client
function createSocket(): Socket {
  return io(SERVER_URL, {
    reconnection: false,
    timeout: 5000
  });
}

// Helper to wait for event
function waitForEvent(socket: Socket, event: string, timeout = 5000): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${event}`));
    }, timeout);

    socket.once(event, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
}

test.describe('Socket.IO Multiplayer', () => {
  let socket1: Socket;
  let socket2: Socket;

  test.afterEach(() => {
    if (socket1?.connected) socket1.disconnect();
    if (socket2?.connected) socket2.disconnect();
  });

  test.describe('Connection Management', () => {
    test('should connect to Socket.IO server', async () => {
      socket1 = createSocket();

      const connected = await new Promise<boolean>((resolve) => {
        socket1.on('connect', () => {
          resolve(true);
        });
        socket1.on('connect_error', () => {
          resolve(false);
        });
      });

      expect(connected).toBe(true);
      expect(socket1.connected).toBe(true);
      expect(socket1.id).toBeTruthy();
    });

    test('should disconnect cleanly', async () => {
      socket1 = createSocket();

      await waitForEvent(socket1, 'connect');
      socket1.disconnect();

      await new Promise(resolve => setTimeout(resolve, 100));
      expect(socket1.connected).toBe(false);
    });

    test('should handle connection errors gracefully', async () => {
      socket1 = io('http://localhost:9999', { // Invalid port
        reconnection: false,
        timeout: 1000
      });

      const error = await new Promise<boolean>((resolve) => {
        socket1.on('connect_error', () => {
          resolve(true);
        });
        setTimeout(() => resolve(false), 2000);
      });

      expect(error).toBe(true);
    });
  });

  test.describe('Room Joining', () => {
    let roomId: string;

    test.beforeEach(async ({ request }) => {
      // Create a party via API
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_socket_${Date.now()}`,
          partyName: 'Socket Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;
    });

    test('should join room successfully', async () => {
      socket1 = createSocket();
      await waitForEvent(socket1, 'connect');

      const joinResponse = await new Promise<any>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId: `player1_${Date.now()}`,
          playerName: 'SocketPlayer1',
          rejoin: false
        }, (response: any) => {
          resolve(response);
        });
      });

      expect(joinResponse.success).toBe(true);
      expect(joinResponse.data).toBeDefined();
      expect(joinResponse.data.room).toBeDefined();
    });

    test('should notify other players when someone joins', async () => {
      socket1 = createSocket();
      socket2 = createSocket();

      await waitForEvent(socket1, 'connect');
      await waitForEvent(socket2, 'connect');

      // Socket 1 joins
      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId: `player1_${Date.now()}`,
          playerName: 'SocketPlayer1',
          rejoin: false
        }, () => resolve());
      });

      // Socket 2 joins and Socket 1 should be notified
      const notification = waitForEvent(socket1, 'player_joined');

      await new Promise<void>((resolve) => {
        socket2.emit('join_room', {
          roomId,
          playerId: `player2_${Date.now()}`,
          playerName: 'SocketPlayer2',
          rejoin: false
        }, () => resolve());
      });

      const joinedData = await notification;
      expect(joinedData).toBeDefined();
      expect(joinedData.playerName).toBe('SocketPlayer2');
    });

    test('should fail to join non-existent room', async () => {
      socket1 = createSocket();
      await waitForEvent(socket1, 'connect');

      const joinResponse = await new Promise<any>((resolve) => {
        socket1.emit('join_room', {
          roomId: 'FAKE99',
          playerId: `player_fake_${Date.now()}`,
          playerName: 'FakePlayer',
          rejoin: false
        }, (response: any) => {
          resolve(response);
        });
      });

      expect(joinResponse.success).toBe(false);
      expect(joinResponse.error).toBeDefined();
    });
  });

  test.describe('Chat Messaging', () => {
    let roomId: string;
    const playerId1 = `chat_player1_${Date.now()}`;
    const playerId2 = `chat_player2_${Date.now()}`;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_chat_${Date.now()}`,
          partyName: 'Chat Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;

      // Connect sockets
      socket1 = createSocket();
      socket2 = createSocket();
      await waitForEvent(socket1, 'connect');
      await waitForEvent(socket2, 'connect');

      // Join room
      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId: playerId1,
          playerName: 'ChatPlayer1',
          rejoin: false
        }, () => resolve());
      });

      await new Promise<void>((resolve) => {
        socket2.emit('join_room', {
          roomId,
          playerId: playerId2,
          playerName: 'ChatPlayer2',
          rejoin: false
        }, () => resolve());
      });
    });

    test('should send and receive chat messages', async () => {
      const messagePromise = waitForEvent(socket2, 'chat_message');

      await new Promise<void>((resolve) => {
        socket1.emit('chat_message', {
          roomId,
          playerId: playerId1,
          message: 'Hello from Player 1!'
        }, () => resolve());
      });

      const receivedMessage = await messagePromise;
      expect(receivedMessage).toBeDefined();
      expect(receivedMessage.message).toBe('Hello from Player 1!');
      expect(receivedMessage.playerName).toBe('ChatPlayer1');
      expect(receivedMessage.type).toBe('chat');
    });

    test('should broadcast chat to all players in room', async () => {
      const message1Promise = waitForEvent(socket1, 'chat_message');
      const message2Promise = waitForEvent(socket2, 'chat_message');

      // Both should receive the message
      await new Promise<void>((resolve) => {
        socket1.emit('chat_message', {
          roomId,
          playerId: playerId1,
          message: 'Broadcast test'
        }, () => resolve());
      });

      const [msg1, msg2] = await Promise.all([message1Promise, message2Promise]);
      expect(msg1.message).toBe('Broadcast test');
      expect(msg2.message).toBe('Broadcast test');
    });

    test('should fail to send chat without being in room', async () => {
      const socket3 = createSocket();
      await waitForEvent(socket3, 'connect');

      const response = await new Promise<any>((resolve) => {
        socket3.emit('chat_message', {
          roomId,
          playerId: `not_in_room_${Date.now()}`,
          message: 'Should fail'
        }, (res: any) => resolve(res));
      });

      expect(response.success).toBe(false);
      socket3.disconnect();
    });
  });

  test.describe('Ready Status', () => {
    let roomId: string;
    const playerId1 = `ready_player1_${Date.now()}`;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_ready_${Date.now()}`,
          partyName: 'Ready Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;

      socket1 = createSocket();
      socket2 = createSocket();
      await waitForEvent(socket1, 'connect');
      await waitForEvent(socket2, 'connect');

      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId: playerId1,
          playerName: 'ReadyPlayer1',
          rejoin: false
        }, () => resolve());
      });
    });

    test('should broadcast ready status changes', async () => {
      const readyChangePromise = waitForEvent(socket2, 'player_ready_changed');

      // Socket 2 joins
      await new Promise<void>((resolve) => {
        socket2.emit('join_room', {
          roomId,
          playerId: `ready_player2_${Date.now()}`,
          playerName: 'ReadyPlayer2',
          rejoin: false
        }, () => resolve());
      });

      // Socket 1 sets ready status
      await new Promise<void>((resolve) => {
        socket1.emit('ready_status', {
          roomId,
          playerId: playerId1,
          isReady: true
        }, () => resolve());
      });

      const readyChange = await readyChangePromise;
      expect(readyChange).toBeDefined();
      expect(readyChange.playerId).toBe(playerId1);
      expect(readyChange.isReady).toBe(true);
    });
  });

  test.describe('Heartbeat System', () => {
    let roomId: string;
    const playerId = `heartbeat_player_${Date.now()}`;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_heartbeat_${Date.now()}`,
          partyName: 'Heartbeat Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;

      socket1 = createSocket();
      await waitForEvent(socket1, 'connect');

      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId,
          playerName: 'HeartbeatPlayer',
          rejoin: false
        }, () => resolve());
      });
    });

    test('should respond to heartbeat pings', async () => {
      const response = await new Promise<any>((resolve) => {
        socket1.emit('heartbeat', {
          roomId,
          playerId,
          timestamp: Date.now()
        }, (res: any) => resolve(res));
      });

      expect(response.success).toBe(true);
    });
  });

  test.describe('Disconnection & Reconnection', () => {
    let roomId: string;
    const playerId = `disconnect_player_${Date.now()}`;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_disconnect_${Date.now()}`,
          partyName: 'Disconnect Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;
    });

    test('should notify others when player disconnects', async () => {
      socket1 = createSocket();
      socket2 = createSocket();

      await waitForEvent(socket1, 'connect');
      await waitForEvent(socket2, 'connect');

      // Join both players
      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId,
          playerName: 'DisconnectPlayer',
          rejoin: false
        }, () => resolve());
      });

      await new Promise<void>((resolve) => {
        socket2.emit('join_room', {
          roomId,
          playerId: `observer_${Date.now()}`,
          playerName: 'Observer',
          rejoin: false
        }, () => resolve());
      });

      // Wait for disconnect notification
      const disconnectPromise = waitForEvent(socket2, 'player_disconnected');

      // Disconnect socket1
      socket1.disconnect();

      const disconnectData = await disconnectPromise;
      expect(disconnectData).toBeDefined();
      expect(disconnectData.playerId).toBe(playerId);
    });
  });

  test.describe('Scenario Choice (Asymmetric)', () => {
    let roomId: string;
    const playerId = `scenario_player_${Date.now()}`;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_scenario_${Date.now()}`,
          partyName: 'Scenario Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;

      socket1 = createSocket();
      socket2 = createSocket();
      await waitForEvent(socket1, 'connect');
      await waitForEvent(socket2, 'connect');

      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId,
          playerName: 'ScenarioPlayer',
          rejoin: false
        }, () => resolve());
      });

      await new Promise<void>((resolve) => {
        socket2.emit('join_room', {
          roomId,
          playerId: `observer_scenario_${Date.now()}`,
          playerName: 'ObserverPlayer',
          rejoin: false
        }, () => resolve());
      });
    });

    test('should broadcast scenario choice without revealing details', async () => {
      const choicePromise = waitForEvent(socket2, 'scenario_choice_made');

      await new Promise<void>((resolve) => {
        socket1.emit('scenario_choice', {
          playerId,
          scenarioId: 'scenario_123',
          choiceId: 'choice_a'
        }, () => resolve());
      });

      const choiceData = await choicePromise;
      expect(choiceData).toBeDefined();
      expect(choiceData.playerId).toBe(playerId);
      expect(choiceData.scenarioId).toBe('scenario_123');
      // Choice ID should NOT be revealed
      expect(choiceData.choiceId).toBeUndefined();
    });
  });

  test.describe('Request Sync', () => {
    let roomId: string;
    const playerId = `sync_player_${Date.now()}`;

    test.beforeEach(async ({ request }) => {
      const response = await request.post(`${API_BASE}/party/create`, {
        data: {
          hostId: `host_sync_${Date.now()}`,
          partyName: 'Sync Test Party',
          maxPlayers: 4
        }
      });
      const data = await response.json();
      roomId = data.data.code;

      socket1 = createSocket();
      await waitForEvent(socket1, 'connect');

      await new Promise<void>((resolve) => {
        socket1.emit('join_room', {
          roomId,
          playerId,
          playerName: 'SyncPlayer',
          rejoin: false
        }, () => resolve());
      });
    });

    test('should sync full game state', async () => {
      const response = await new Promise<any>((resolve) => {
        socket1.emit('request_sync', {
          roomId,
          playerId,
          syncType: 'full'
        }, (res: any) => resolve(res));
      });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.data.roomId).toBe(roomId);
      expect(response.data.gamePhase).toBeDefined();
    });

    test('should sync specific game state (battle)', async () => {
      const response = await new Promise<any>((resolve) => {
        socket1.emit('request_sync', {
          roomId,
          playerId,
          syncType: 'battle'
        }, (res: any) => resolve(res));
      });

      expect(response.success).toBe(true);
      // Data may be null if no active battle
    });
  });
});
