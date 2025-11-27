/**
 * Notification Service
 * Handles in-game notifications, achievements, and alerts
 */

import { EventBus, NotificationEvent } from './event.bus';
import { gameLogger } from './logger';

// ============================================
// Types
// ============================================

export type NotificationType = 'info' | 'warning' | 'error' | 'success' | 'achievement';

export interface NotificationOptions {
  sessionId?: string;
  roomId?: string;
  playerId?: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // milliseconds, 0 for persistent
  data?: Record<string, any>;
}

export interface AchievementNotification {
  sessionId: string;
  playerId: string;
  achievementId: string;
  title: string;
  description: string;
  iconUrl?: string;
  points?: number;
}

// ============================================
// Notification Templates
// ============================================

export const NotificationTemplates = {
  // Phase transitions
  PHASE_INTERROGATION: {
    type: 'info' as NotificationType,
    title: 'Interrogation Phase',
    message: 'The interrogation has begun. Choose your questions wisely.',
    duration: 5000
  },
  PHASE_EXPLORATION: {
    type: 'info' as NotificationType,
    title: 'Exploration Phase',
    message: 'Explore the environment and gather clues.',
    duration: 5000
  },
  PHASE_BATTLE: {
    type: 'warning' as NotificationType,
    title: 'Battle Initiated!',
    message: 'Prepare for combat!',
    duration: 5000
  },
  PHASE_SCENARIO: {
    type: 'info' as NotificationType,
    title: 'Scenario Phase',
    message: 'A critical decision awaits.',
    duration: 5000
  },
  PHASE_VICTORY: {
    type: 'success' as NotificationType,
    title: 'Victory!',
    message: 'Congratulations! You have completed the game.',
    duration: 0 // Persistent
  },

  // Turn notifications
  YOUR_TURN: {
    type: 'info' as NotificationType,
    title: 'Your Turn',
    message: "It's your turn to act.",
    duration: 3000
  },
  TURN_ENDING: {
    type: 'warning' as NotificationType,
    title: 'Turn Ending',
    message: 'Your turn is about to end.',
    duration: 3000
  },

  // Player events
  PLAYER_JOINED: {
    type: 'info' as NotificationType,
    title: 'Player Joined',
    message: '{playerName} has joined the game.',
    duration: 3000
  },
  PLAYER_LEFT: {
    type: 'info' as NotificationType,
    title: 'Player Left',
    message: '{playerName} has left the game.',
    duration: 3000
  },
  PLAYER_RECONNECTED: {
    type: 'success' as NotificationType,
    title: 'Player Reconnected',
    message: '{playerName} has reconnected.',
    duration: 3000
  },

  // Errors
  CONNECTION_ERROR: {
    type: 'error' as NotificationType,
    title: 'Connection Error',
    message: 'Unable to connect to the server. Retrying...',
    duration: 5000
  },
  ACTION_FAILED: {
    type: 'error' as NotificationType,
    title: 'Action Failed',
    message: 'Your action could not be completed.',
    duration: 5000
  },

  // Success
  CLUE_DISCOVERED: {
    type: 'success' as NotificationType,
    title: 'Clue Discovered!',
    message: 'You have found a new clue.',
    duration: 4000
  },
  BATTLE_WON: {
    type: 'success' as NotificationType,
    title: 'Battle Won!',
    message: 'You have defeated the enemy.',
    duration: 5000
  }
};

// ============================================
// Notification Service
// ============================================

export class NotificationService {
  private static instance: NotificationService;

  private eventBus: EventBus;

  private constructor() {
    this.eventBus = EventBus.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // ============================================
  // Core Notification Methods
  // ============================================

  /**
   * Send a notification
   */
  send(options: NotificationOptions): void {
    const event: NotificationEvent = {
      sessionId: options.sessionId,
      roomId: options.roomId,
      playerId: options.playerId,
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration ?? 5000,
      data: options.data,
      timestamp: Date.now()
    };

    this.eventBus.emitNotification(event);

    gameLogger.debug({
      title: options.title,
      playerId: options.playerId,
      sessionId: options.sessionId
    }, 'Notification sent');
  }

  /**
   * Send notification from template
   */
  sendFromTemplate(
    templateKey: keyof typeof NotificationTemplates,
    options: Partial<NotificationOptions> & {
      replacements?: Record<string, string>
    }
  ): void {
    const template = NotificationTemplates[templateKey];

    let message = template.message;
    if (options.replacements) {
      for (const [key, value] of Object.entries(options.replacements)) {
        message = message.replace(`{${key}}`, value);
      }
    }

    this.send({
      ...template,
      ...options,
      message
    });
  }

  // ============================================
  // Convenience Methods
  // ============================================

  /**
   * Send info notification
   */
  info(title: string, message: string, options?: Partial<NotificationOptions>): void {
    this.send({ type: 'info', title, message, ...options });
  }

  /**
   * Send warning notification
   */
  warning(title: string, message: string, options?: Partial<NotificationOptions>): void {
    this.send({ type: 'warning', title, message, ...options });
  }

  /**
   * Send error notification
   */
  error(title: string, message: string, options?: Partial<NotificationOptions>): void {
    this.send({ type: 'error', title, message, ...options });
  }

  /**
   * Send success notification
   */
  success(title: string, message: string, options?: Partial<NotificationOptions>): void {
    this.send({ type: 'success', title, message, ...options });
  }

  /**
   * Send achievement notification
   */
  achievement(achievement: AchievementNotification): void {
    this.send({
      sessionId: achievement.sessionId,
      playerId: achievement.playerId,
      type: 'achievement',
      title: achievement.title,
      message: achievement.description,
      duration: 8000,
      data: {
        achievementId: achievement.achievementId,
        iconUrl: achievement.iconUrl,
        points: achievement.points
      }
    });

    gameLogger.info({ achievement }, 'Achievement unlocked');
  }

  // ============================================
  // Room-wide Notifications
  // ============================================

  /**
   * Notify all players in a room
   */
  notifyRoom(sessionId: string, roomId: string, options: Omit<NotificationOptions, 'sessionId' | 'roomId' | 'playerId'>): void {
    this.send({
      sessionId,
      roomId,
      ...options
    });
  }

  /**
   * Notify phase change
   */
  notifyPhaseChange(sessionId: string, roomId: string, phase: string): void {
    const templateKey = `PHASE_${phase.toUpperCase()}` as keyof typeof NotificationTemplates;
    if (NotificationTemplates[templateKey]) {
      this.sendFromTemplate(templateKey, { sessionId, roomId });
    } else {
      this.info('Phase Changed', `Now entering ${phase} phase.`, { sessionId, roomId });
    }
  }

  /**
   * Notify turn change
   */
  notifyTurnChange(sessionId: string, currentPlayerId: string, playerName: string): void {
    // Notify the player whose turn it is
    this.sendFromTemplate('YOUR_TURN', {
      sessionId,
      playerId: currentPlayerId,
      message: `It's your turn, ${playerName}!`
    });
  }

  /**
   * Notify turn ending soon
   */
  notifyTurnEnding(sessionId: string, playerId: string, secondsRemaining: number): void {
    this.send({
      sessionId,
      playerId,
      type: 'warning',
      title: 'Turn Ending',
      message: `${secondsRemaining} seconds remaining in your turn.`,
      duration: 3000
    });
  }

  // ============================================
  // Player-specific Notifications
  // ============================================

  /**
   * Notify player joined
   */
  notifyPlayerJoined(sessionId: string, roomId: string, playerName: string): void {
    this.sendFromTemplate('PLAYER_JOINED', {
      sessionId,
      roomId,
      replacements: { playerName }
    });
  }

  /**
   * Notify player left
   */
  notifyPlayerLeft(sessionId: string, roomId: string, playerName: string): void {
    this.sendFromTemplate('PLAYER_LEFT', {
      sessionId,
      roomId,
      replacements: { playerName }
    });
  }

  /**
   * Notify player reconnected
   */
  notifyPlayerReconnected(sessionId: string, roomId: string, playerName: string): void {
    this.sendFromTemplate('PLAYER_RECONNECTED', {
      sessionId,
      roomId,
      replacements: { playerName }
    });
  }

  // ============================================
  // Game Event Notifications
  // ============================================

  /**
   * Notify clue discovered
   */
  notifyClueDiscovered(sessionId: string, playerId: string, clueName: string): void {
    this.send({
      sessionId,
      playerId,
      type: 'success',
      title: 'Clue Discovered!',
      message: `You found: ${clueName}`,
      duration: 4000,
      data: { clueName }
    });
  }

  /**
   * Notify battle started
   */
  notifyBattleStarted(sessionId: string, roomId: string, enemyName: string): void {
    this.send({
      sessionId,
      roomId,
      type: 'warning',
      title: 'Battle Started!',
      message: `${enemyName} attacks!`,
      duration: 5000,
      data: { enemyName }
    });
  }

  /**
   * Notify battle won
   */
  notifyBattleWon(sessionId: string, roomId: string): void {
    this.sendFromTemplate('BATTLE_WON', { sessionId, roomId });
  }

  /**
   * Notify scenario choice required
   */
  notifyScenarioChoice(sessionId: string, playerId: string, choiceDescription: string): void {
    this.send({
      sessionId,
      playerId,
      type: 'info',
      title: 'Decision Required',
      message: choiceDescription,
      duration: 0, // Persistent until choice made
      data: { requiresAction: true }
    });
  }

  // ============================================
  // Error Notifications
  // ============================================

  /**
   * Notify connection error
   */
  notifyConnectionError(sessionId?: string, playerId?: string): void {
    this.sendFromTemplate('CONNECTION_ERROR', { sessionId, playerId });
  }

  /**
   * Notify action failed
   */
  notifyActionFailed(sessionId: string, playerId: string, reason: string): void {
    this.send({
      sessionId,
      playerId,
      type: 'error',
      title: 'Action Failed',
      message: reason,
      duration: 5000
    });
  }

  // ============================================
  // Global Notifications
  // ============================================

  /**
   * Send global notification to all connected clients
   */
  broadcast(options: Omit<NotificationOptions, 'sessionId' | 'roomId' | 'playerId'>): void {
    this.send(options);
  }

  /**
   * Notify server maintenance
   */
  notifyMaintenance(message: string, minutesUntil: number): void {
    this.broadcast({
      type: 'warning',
      title: 'Server Maintenance',
      message: `${message} in ${minutesUntil} minutes.`,
      duration: 0
    });
  }
}
