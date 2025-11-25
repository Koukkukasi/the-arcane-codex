/**
 * Chat Repository
 * Handles database operations for chat messages
 */

import { DatabaseConnection } from '../connection';
import { ChatMessageModel, CreateChatMessageDTO } from '../models/session.model';

export class ChatRepository {
  private db: DatabaseConnection;

  constructor(db?: DatabaseConnection) {
    this.db = db || DatabaseConnection.getInstance();
  }

  /**
   * Add a chat message
   */
  async addMessage(data: CreateChatMessageDTO): Promise<ChatMessageModel> {
    const query = `
      INSERT INTO chat_messages (party_id, player_id, message_type, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const result = await this.db.query(query, [
      data.party_id,
      data.player_id,
      data.message_type || 'chat',
      data.content
    ]);

    return this.mapRowToChatMessage(result.rows[0]);
  }

  /**
   * Get messages for a party
   */
  async getMessages(
    partyId: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ChatMessageModel[]> {
    const query = `
      SELECT * FROM chat_messages
      WHERE party_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.db.query(query, [partyId, limit, offset]);
    // Reverse to show oldest first
    return result.rows.reverse().map(row => this.mapRowToChatMessage(row));
  }

  /**
   * Get recent messages for a party
   */
  async getRecentMessages(partyId: string, minutes: number = 60): Promise<ChatMessageModel[]> {
    // Validate and sanitize minutes parameter (1 minute to 1 week max)
    const safeMinutes = Math.max(1, Math.min(Math.floor(minutes), 10080));

    const query = `
      SELECT * FROM chat_messages
      WHERE party_id = $1
        AND created_at > NOW() - make_interval(mins => $2)
      ORDER BY created_at ASC
    `;

    const result = await this.db.query(query, [partyId, safeMinutes]);
    return result.rows.map(row => this.mapRowToChatMessage(row));
  }

  /**
   * Get messages by type
   */
  async getMessagesByType(
    partyId: string,
    messageType: 'chat' | 'system' | 'action',
    limit: number = 50
  ): Promise<ChatMessageModel[]> {
    const query = `
      SELECT * FROM chat_messages
      WHERE party_id = $1 AND message_type = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const result = await this.db.query(query, [partyId, messageType, limit]);
    return result.rows.reverse().map(row => this.mapRowToChatMessage(row));
  }

  /**
   * Get messages from a specific player
   */
  async getPlayerMessages(
    partyId: string,
    playerId: string,
    limit: number = 50
  ): Promise<ChatMessageModel[]> {
    const query = `
      SELECT * FROM chat_messages
      WHERE party_id = $1 AND player_id = $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const result = await this.db.query(query, [partyId, playerId, limit]);
    return result.rows.reverse().map(row => this.mapRowToChatMessage(row));
  }

  /**
   * Search messages by content
   */
  async searchMessages(
    partyId: string,
    searchTerm: string,
    limit: number = 20
  ): Promise<ChatMessageModel[]> {
    const query = `
      SELECT * FROM chat_messages
      WHERE party_id = $1
        AND content ILIKE $2
      ORDER BY created_at DESC
      LIMIT $3
    `;

    const result = await this.db.query(query, [partyId, `%${searchTerm}%`, limit]);
    return result.rows.map(row => this.mapRowToChatMessage(row));
  }

  /**
   * Get message count for a party
   */
  async getMessageCount(partyId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE party_id = $1
    `;

    const result = await this.db.query(query, [partyId]);
    return parseInt(result.rows[0].count);
  }

  /**
   * Get message count by type
   */
  async getMessageCountByType(partyId: string): Promise<{
    chat: number;
    system: number;
    action: number;
    total: number;
  }> {
    const query = `
      SELECT
        COUNT(CASE WHEN message_type = 'chat' THEN 1 END) as chat,
        COUNT(CASE WHEN message_type = 'system' THEN 1 END) as system,
        COUNT(CASE WHEN message_type = 'action' THEN 1 END) as action,
        COUNT(*) as total
      FROM chat_messages
      WHERE party_id = $1
    `;

    const result = await this.db.query(query, [partyId]);
    const row = result.rows[0];

    return {
      chat: parseInt(row.chat),
      system: parseInt(row.system),
      action: parseInt(row.action),
      total: parseInt(row.total)
    };
  }

  /**
   * Delete old messages (older than specified days)
   */
  async deleteOldMessages(partyId: string, daysOld: number = 7): Promise<number> {
    // Validate and sanitize daysOld parameter (1 day to 365 days max)
    const safeDays = Math.max(1, Math.min(Math.floor(daysOld), 365));

    const query = `
      DELETE FROM chat_messages
      WHERE party_id = $1
        AND created_at < NOW() - make_interval(days => $2)
      RETURNING id
    `;

    const result = await this.db.query(query, [partyId, safeDays]);
    return result.rows.length;
  }

  /**
   * Delete all messages for a party
   */
  async deleteAllMessages(partyId: string): Promise<number> {
    const query = `
      DELETE FROM chat_messages
      WHERE party_id = $1
      RETURNING id
    `;

    const result = await this.db.query(query, [partyId]);
    return result.rows.length;
  }

  /**
   * Delete a specific message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    const query = 'DELETE FROM chat_messages WHERE id = $1 RETURNING id';
    const result = await this.db.query(query, [messageId]);
    return result.rows.length > 0;
  }

  /**
   * Get most active chatters in a party
   */
  async getMostActiveChatters(partyId: string, limit: number = 5): Promise<Array<{
    player_id: string;
    message_count: number;
  }>> {
    const query = `
      SELECT player_id, COUNT(*) as message_count
      FROM chat_messages
      WHERE party_id = $1
        AND message_type = 'chat'
      GROUP BY player_id
      ORDER BY message_count DESC
      LIMIT $2
    `;

    const result = await this.db.query(query, [partyId, limit]);
    return result.rows.map(row => ({
      player_id: row.player_id,
      message_count: parseInt(row.message_count)
    }));
  }

  /**
   * Check if player has sent messages recently (anti-spam)
   */
  async hasRecentMessages(
    partyId: string,
    playerId: string,
    seconds: number = 5,
    threshold: number = 3
  ): Promise<boolean> {
    // Validate and sanitize seconds parameter (1 second to 300 seconds max)
    const safeSeconds = Math.max(1, Math.min(Math.floor(seconds), 300));

    const query = `
      SELECT COUNT(*) as count
      FROM chat_messages
      WHERE party_id = $1
        AND player_id = $2
        AND created_at > NOW() - make_interval(secs => $3)
    `;

    const result = await this.db.query(query, [partyId, playerId, safeSeconds]);
    return parseInt(result.rows[0].count) >= threshold;
  }

  /**
   * Map database row to ChatMessageModel
   */
  private mapRowToChatMessage(row: any): ChatMessageModel {
    return {
      id: row.id,
      party_id: row.party_id,
      player_id: row.player_id,
      message_type: row.message_type,
      content: row.content,
      created_at: new Date(row.created_at)
    };
  }
}
