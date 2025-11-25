import { z } from 'zod';

/**
 * Zod validation schemas for Socket.IO events
 * Provides runtime validation for all incoming socket data
 */

// ============================================
// Common Schemas
// ============================================

export const playerIdSchema = z.string().min(1).max(100);
export const roomIdSchema = z.string().min(4).max(20).regex(/^[A-Z0-9]+$/i, 'Room ID must be alphanumeric');
export const partyCodeSchema = z.string().length(6).regex(/^[A-Z0-9]+$/, 'Party code must be 6 uppercase alphanumeric characters');
export const playerNameSchema = z.string().min(2).max(30).trim();
export const messageSchema = z.string().min(1).max(500).trim();

// ============================================
// Join/Leave Room Schemas
// ============================================

export const joinRoomSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  playerName: playerNameSchema,
  isRejoin: z.boolean().optional()
});

export const leaveRoomSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema
});

// ============================================
// Chat Schemas
// ============================================

export const chatMessageSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  message: messageSchema
});

// ============================================
// Ready Status Schemas
// ============================================

export const readyStatusSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  isReady: z.boolean()
});

// ============================================
// Role Selection Schemas
// ============================================

export const roleSchema = z.enum(['tank', 'dps', 'healer', 'support']);

export const roleSelectSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  role: roleSchema
});

// ============================================
// Scenario Choice Schemas
// ============================================

export const scenarioChoiceSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  scenarioId: z.string().min(1).max(100),
  choiceId: z.string().min(1).max(100)
});

// ============================================
// Battle Action Schemas
// ============================================

export const battleActionSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  actionType: z.enum(['attack', 'defend', 'ability', 'flee', 'item']),
  targetId: z.string().optional(),
  abilityId: z.string().optional(),
  itemId: z.string().optional()
});

// ============================================
// Clue Sharing Schemas
// ============================================

export const shareClueSchema = z.object({
  roomId: roomIdSchema,
  fromPlayerId: playerIdSchema,
  toPlayerId: playerIdSchema,
  clueId: z.string().min(1).max(100)
});

// ============================================
// Sync Request Schemas
// ============================================

export const requestSyncSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  syncType: z.enum(['full', 'battle', 'scenario', 'players']).optional()
});

// ============================================
// Heartbeat Schemas
// ============================================

export const heartbeatSchema = z.object({
  roomId: roomIdSchema,
  playerId: playerIdSchema,
  timestamp: z.number().optional()
});

// ============================================
// Legacy Game Events
// ============================================

export const joinGameSchema = z.object({
  game_code: z.string().min(4).max(10),
  player_name: playerNameSchema.optional()
});

export const leaveGameSchema = z.object({
  game_code: z.string().min(4).max(10),
  player_name: playerNameSchema.optional()
});

export const gameUpdateSchema = z.object({
  game_code: z.string().min(4).max(10),
  update_type: z.string().min(1).max(50),
  payload: z.record(z.string(), z.unknown())
});

// ============================================
// Validation Helper
// ============================================

/**
 * Validates data against a schema and returns typed result
 */
export function validateSocketData<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Format error message
  const errors = result.error.issues.map((e: z.ZodIssue) => `${e.path.join('.')}: ${e.message}`).join(', ');
  return { success: false, error: errors };
}

/**
 * Creates a validated event handler wrapper
 */
export function createValidatedHandler<T>(
  schema: z.ZodType<T>,
  handler: (data: T, callback?: (response: unknown) => void) => void
): (data: unknown, callback?: (response: unknown) => void) => void {
  return (data: unknown, callback?: (response: unknown) => void) => {
    const validation = validateSocketData(schema, data);

    if (!validation.success) {
      if (callback) {
        callback({ success: false, error: validation.error });
      }
      return;
    }

    handler(validation.data, callback);
  };
}

// ============================================
// Type Exports
// ============================================

export type JoinRoomPayload = z.infer<typeof joinRoomSchema>;
export type LeaveRoomPayload = z.infer<typeof leaveRoomSchema>;
export type ChatMessagePayload = z.infer<typeof chatMessageSchema>;
export type ReadyStatusPayload = z.infer<typeof readyStatusSchema>;
export type RoleSelectPayload = z.infer<typeof roleSelectSchema>;
export type ScenarioChoicePayload = z.infer<typeof scenarioChoiceSchema>;
export type BattleActionPayload = z.infer<typeof battleActionSchema>;
export type ShareCluePayload = z.infer<typeof shareClueSchema>;
export type RequestSyncPayload = z.infer<typeof requestSyncSchema>;
export type HeartbeatPayload = z.infer<typeof heartbeatSchema>;
export type JoinGamePayload = z.infer<typeof joinGameSchema>;
export type LeaveGamePayload = z.infer<typeof leaveGameSchema>;
export type GameUpdatePayload = z.infer<typeof gameUpdateSchema>;

export default {
  validateSocketData,
  createValidatedHandler,
  schemas: {
    joinRoom: joinRoomSchema,
    leaveRoom: leaveRoomSchema,
    chatMessage: chatMessageSchema,
    readyStatus: readyStatusSchema,
    roleSelect: roleSelectSchema,
    scenarioChoice: scenarioChoiceSchema,
    battleAction: battleActionSchema,
    shareClue: shareClueSchema,
    requestSync: requestSyncSchema,
    heartbeat: heartbeatSchema,
    joinGame: joinGameSchema,
    leaveGame: leaveGameSchema,
    gameUpdate: gameUpdateSchema
  }
};
