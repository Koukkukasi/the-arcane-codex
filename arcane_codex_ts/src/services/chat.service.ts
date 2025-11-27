/**
 * Chat Service
 * Handles chat messaging, system messages, and chat history
 */

import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from '../types/multiplayer';
import { EventBus, ChatEvent } from './event.bus';
import { ChatRepository } from '../database/repositories/chat.repository';
import { gameLogger } from './logger';

// ============================================
// Types
// ============================================

export interface SendMessageOptions {
  sessionId: string;
  roomId: string;
  playerId: string;
  playerName: string;
  message: string;
  type?: 'chat' | 'system' | 'action';
}

export interface SystemMessageOptions {
  sessionId: string;
  roomId: string;
  message: string;
  type?: 'system' | 'action';
}

export interface ChatHistoryOptions {
  sessionId: string;
  limit?: number;
  beforeTimestamp?: number;
}

// ============================================
// Chat Service
// ============================================

export class ChatService {
  private static instance: ChatService;

  private eventBus: EventBus;
  private chatRepository: ChatRepository;

  // In-memory chat cache per session (for fast access)
  private chatCache: Map<string, ChatMessage[]> = new Map();
  private readonly MAX_CACHE_SIZE = 100; // Max messages per session

  // Spam prevention
  private messageRateLimits: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly RATE_LIMIT_WINDOW_MS = 10000; // 10 seconds
  private readonly MAX_MESSAGES_PER_WINDOW = 10;

  // Cleanup interval
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.chatRepository = new ChatRepository();
    this.startCleanup();
  }

  static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // ============================================
  // Message Sending
  // ============================================

  /**
   * Send a chat message
   */
  async sendMessage(options: SendMessageOptions): Promise<ChatMessage | null> {
    const { sessionId, roomId, playerId, playerName, message, type = 'chat' } = options;

    // Check rate limit
    if (!this.checkRateLimit(playerId)) {
      gameLogger.warn({ playerId }, 'Chat rate limit exceeded');
      return null;
    }

    // Validate message
    if (!this.validateMessage(message)) {
      gameLogger.warn({ playerId, messageLength: message.length }, 'Invalid chat message');
      return null;
    }

    // Create message
    const chatMessage: ChatMessage = {
      id: uuidv4(),
      playerId,
      playerName,
      message: this.sanitizeMessage(message),
      timestamp: Date.now(),
      type
    };

    // Add to cache
    this.addToCache(sessionId, chatMessage);

    // Save to database (async, don't block)
    this.saveToDatabaseAsync(sessionId, roomId, chatMessage);

    // Emit event
    const chatEvent: ChatEvent = {
      sessionId,
      roomId,
      message: chatMessage
    };
    this.eventBus.emitChatMessage(chatEvent);

    return chatMessage;
  }

  /**
   * Send a system message
   */
  async sendSystemMessage(options: SystemMessageOptions): Promise<ChatMessage> {
    const { sessionId, roomId, message, type = 'system' } = options;

    const chatMessage: ChatMessage = {
      id: uuidv4(),
      playerId: 'system',
      playerName: 'System',
      message,
      timestamp: Date.now(),
      type
    };

    // Add to cache
    this.addToCache(sessionId, chatMessage);

    // Emit event
    const chatEvent: ChatEvent = {
      sessionId,
      roomId,
      message: chatMessage
    };
    this.eventBus.emitChatMessage(chatEvent);

    return chatMessage;
  }

  /**
   * Send an action message (player did something)
   */
  async sendActionMessage(
    sessionId: string,
    roomId: string,
    playerName: string,
    action: string
  ): Promise<ChatMessage> {
    return this.sendSystemMessage({
      sessionId,
      roomId,
      message: `${playerName} ${action}`,
      type: 'action'
    });
  }

  // ============================================
  // Chat History
  // ============================================

  /**
   * Get chat history for a session
   */
  async getChatHistory(options: ChatHistoryOptions): Promise<ChatMessage[]> {
    const { sessionId, limit = 50, beforeTimestamp } = options;

    // Try cache first
    const cached = this.chatCache.get(sessionId);
    if (cached && cached.length >= limit && !beforeTimestamp) {
      return cached.slice(-limit);
    }

    // Fetch from database
    try {
      const dbMessages = await this.chatRepository.getMessages(sessionId, limit);

      // Convert from ChatMessageModel to ChatMessage
      const messages: ChatMessage[] = dbMessages.map(msg => ({
        id: msg.id.toString(),
        playerId: msg.player_id,
        playerName: msg.player_id, // We don't store player_name in DB
        message: msg.content,
        timestamp: msg.created_at.getTime(),
        type: msg.message_type as 'chat' | 'system' | 'action'
      }));

      // Update cache if fetching recent messages
      if (!beforeTimestamp && messages.length > 0) {
        this.chatCache.set(sessionId, messages);
      }

      return messages;
    } catch (error) {
      gameLogger.error({ error, sessionId }, 'Failed to fetch chat history');
      return cached || [];
    }
  }

  /**
   * Get cached chat history (fast, in-memory only)
   */
  getCachedHistory(sessionId: string): ChatMessage[] {
    return this.chatCache.get(sessionId) || [];
  }

  // ============================================
  // Cache Management
  // ============================================

  /**
   * Add message to cache
   */
  private addToCache(sessionId: string, message: ChatMessage): void {
    if (!this.chatCache.has(sessionId)) {
      this.chatCache.set(sessionId, []);
    }

    const cache = this.chatCache.get(sessionId)!;
    cache.push(message);

    // Trim if exceeds max size
    if (cache.length > this.MAX_CACHE_SIZE) {
      cache.splice(0, cache.length - this.MAX_CACHE_SIZE);
    }
  }

  /**
   * Clear cache for a session
   */
  clearCache(sessionId: string): void {
    this.chatCache.delete(sessionId);
  }

  /**
   * Initialize cache from database
   */
  async initializeCache(sessionId: string): Promise<void> {
    try {
      const dbMessages = await this.chatRepository.getMessages(sessionId, this.MAX_CACHE_SIZE);
      const messages: ChatMessage[] = dbMessages.map(msg => ({
        id: msg.id.toString(),
        playerId: msg.player_id,
        playerName: msg.player_id,
        message: msg.content,
        timestamp: msg.created_at.getTime(),
        type: msg.message_type as 'chat' | 'system' | 'action'
      }));
      this.chatCache.set(sessionId, messages);
    } catch (error) {
      gameLogger.error({ error, sessionId }, 'Failed to initialize chat cache');
    }
  }

  // ============================================
  // Rate Limiting
  // ============================================

  /**
   * Check if player is within rate limit
   */
  private checkRateLimit(playerId: string): boolean {
    const now = Date.now();
    const rateLimit = this.messageRateLimits.get(playerId);

    if (!rateLimit || now > rateLimit.resetTime) {
      // New window
      this.messageRateLimits.set(playerId, {
        count: 1,
        resetTime: now + this.RATE_LIMIT_WINDOW_MS
      });
      return true;
    }

    if (rateLimit.count >= this.MAX_MESSAGES_PER_WINDOW) {
      return false;
    }

    rateLimit.count++;
    return true;
  }

  // ============================================
  // Validation & Sanitization
  // ============================================

  /**
   * Validate message content
   */
  private validateMessage(message: string): boolean {
    if (!message || typeof message !== 'string') {
      return false;
    }

    const trimmed = message.trim();
    if (trimmed.length === 0 || trimmed.length > 500) {
      return false;
    }

    return true;
  }

  /**
   * Sanitize message content (basic XSS prevention)
   */
  private sanitizeMessage(message: string): string {
    return message
      .trim()
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .substring(0, 500);
  }

  // ============================================
  // Database Operations
  // ============================================

  /**
   * Save message to database asynchronously
   */
  private saveToDatabaseAsync(sessionId: string, _roomId: string, message: ChatMessage): void {
    this.chatRepository.addMessage({
      party_id: sessionId, // Use sessionId as party_id
      player_id: message.playerId,
      message_type: message.type,
      content: message.message
    }).catch((error: Error) => {
      gameLogger.error({ error, sessionId }, 'Failed to save chat message to database');
    });
  }

  // ============================================
  // Cleanup
  // ============================================

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupRateLimits();
    }, 60000); // Every minute
  }

  /**
   * Clean up expired rate limits
   */
  private cleanupRateLimits(): void {
    const now = Date.now();
    for (const [playerId, rateLimit] of this.messageRateLimits.entries()) {
      if (now > rateLimit.resetTime) {
        this.messageRateLimits.delete(playerId);
      }
    }
  }

  /**
   * Shutdown service
   */
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.chatCache.clear();
    this.messageRateLimits.clear();
    gameLogger.info('ChatService shut down');
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get service statistics
   */
  getStats(): {
    cachedSessions: number;
    totalCachedMessages: number;
    rateLimitedPlayers: number;
  } {
    let totalMessages = 0;
    for (const cache of this.chatCache.values()) {
      totalMessages += cache.length;
    }

    return {
      cachedSessions: this.chatCache.size,
      totalCachedMessages: totalMessages,
      rateLimitedPlayers: this.messageRateLimits.size
    };
  }
}
