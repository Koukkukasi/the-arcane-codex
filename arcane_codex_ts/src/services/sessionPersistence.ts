/**
 * Session Persistence Service
 * Handles session cleanup and restoration on server restart
 */

import { SessionRepository } from '../database/repositories/session.repository';
import { SessionManager } from './session.manager';
import { logger, gameLogger } from './logger';

export interface SessionPersistenceConfig {
  staleSessionHours?: number;      // Hours before session is considered stale (default: 4)
  deleteAbandonedDays?: number;    // Days before abandoned sessions are deleted (default: 7)
  cleanupIntervalMinutes?: number; // How often to run cleanup (default: 15)
  restoreOnStartup?: boolean;      // Whether to restore sessions on startup (default: true)
  maxRestoreAgeHours?: number;     // Maximum age of sessions to restore (default: 24)
}

export class SessionPersistenceService {
  private static instance: SessionPersistenceService;

  private sessionRepository: SessionRepository;
  private sessionManager: SessionManager;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private config: Required<SessionPersistenceConfig>;

  private constructor(config: SessionPersistenceConfig = {}) {
    this.config = {
      staleSessionHours: config.staleSessionHours ?? 4,
      deleteAbandonedDays: config.deleteAbandonedDays ?? 7,
      cleanupIntervalMinutes: config.cleanupIntervalMinutes ?? 15,
      restoreOnStartup: config.restoreOnStartup ?? true,
      maxRestoreAgeHours: config.maxRestoreAgeHours ?? 24
    };

    this.sessionRepository = new SessionRepository();
    this.sessionManager = SessionManager.getInstance();
  }

  /**
   * Get the singleton instance
   */
  static getInstance(config?: SessionPersistenceConfig): SessionPersistenceService {
    if (!SessionPersistenceService.instance) {
      SessionPersistenceService.instance = new SessionPersistenceService(config);
    }
    return SessionPersistenceService.instance;
  }

  /**
   * Initialize the service (restore sessions and start cleanup)
   */
  async initialize(): Promise<void> {
    try {
      // Restore sessions from database if enabled
      if (this.config.restoreOnStartup) {
        await this.restoreSessions();
      }

      // Start cleanup job
      this.startCleanup();

      logger.info(
        { config: this.config },
        'Session persistence service initialized'
      );
    } catch (error) {
      logger.error({ err: error }, 'Failed to initialize session persistence service');
      throw error;
    }
  }

  /**
   * Restore active sessions from database on server restart
   */
  async restoreSessions(): Promise<{
    restored: number;
    skipped: number;
    errors: number;
  }> {
    try {
      const startTime = Date.now();
      gameLogger.info('Starting session restoration...');

      // Get restorable sessions from database
      const sessions = await this.sessionRepository.getRestorableSessions(
        this.config.maxRestoreAgeHours
      );

      let restored = 0;
      let skipped = 0;
      let errors = 0;

      for (const dbSession of sessions) {
        try {
          // Check if session is already in memory (shouldn't happen on startup)
          const existing = await this.sessionManager.getSession(dbSession.id);
          if (existing) {
            gameLogger.debug(
              { sessionId: dbSession.id },
              'Session already in memory, skipping restore'
            );
            skipped++;
            continue;
          }

          // The SessionManager.getSession() will automatically restore from DB
          // if not in memory, so we just need to trigger it
          await this.sessionManager.getSession(dbSession.id);
          restored++;

          gameLogger.debug(
            { sessionId: dbSession.id, partyId: dbSession.party_id },
            'Session restored'
          );
        } catch (error) {
          errors++;
          gameLogger.error(
            { err: error, sessionId: dbSession.id },
            'Failed to restore session'
          );
        }
      }

      const duration = Date.now() - startTime;
      gameLogger.info(
        { restored, skipped, errors, durationMs: duration },
        'Session restoration completed'
      );

      return { restored, skipped, errors };
    } catch (error) {
      gameLogger.error({ err: error }, 'Session restoration failed');
      throw error;
    }
  }

  /**
   * Start the cleanup job
   */
  startCleanup(): void {
    if (this.cleanupInterval) {
      logger.warn('Session cleanup job is already running');
      return;
    }

    // Run immediately on start
    this.runCleanup().catch(error => {
      logger.error({ err: error }, 'Initial session cleanup failed');
    });

    // Schedule recurring cleanup
    const intervalMs = this.config.cleanupIntervalMinutes * 60 * 1000;
    this.cleanupInterval = setInterval(async () => {
      await this.runCleanup();
    }, intervalMs);

    logger.info(
      { intervalMinutes: this.config.cleanupIntervalMinutes },
      'Session cleanup job started'
    );
  }

  /**
   * Stop the cleanup job
   */
  stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
      logger.info('Session cleanup job stopped');
    }
  }

  /**
   * Run the cleanup operation
   */
  private async runCleanup(): Promise<void> {
    try {
      const startTime = Date.now();

      // Clean up timed out sessions
      const result = await this.sessionRepository.cleanupTimedOutSessions(
        this.config.staleSessionHours,
        this.config.deleteAbandonedDays
      );

      const duration = Date.now() - startTime;

      if (result.markedAbandoned > 0 || result.deletedSessions > 0) {
        gameLogger.info(
          {
            markedAbandoned: result.markedAbandoned,
            deletedSessions: result.deletedSessions,
            durationMs: duration
          },
          'Session cleanup completed'
        );
      } else {
        gameLogger.debug(
          { durationMs: duration },
          'Session cleanup completed (no sessions cleaned)'
        );
      }

      // Get session statistics for monitoring
      const stats = await this.sessionRepository.getSessionStats();
      if (stats.active_sessions > 50) {
        gameLogger.info(
          { stats },
          'Session statistics (high active session count)'
        );
      }
    } catch (error) {
      gameLogger.error({ err: error }, 'Session cleanup failed');
    }
  }

  /**
   * Manually trigger session cleanup
   */
  async manualCleanup(): Promise<{
    markedAbandoned: number;
    deletedSessions: number;
    stats: any;
  }> {
    gameLogger.info('Manual session cleanup triggered');

    const result = await this.sessionRepository.cleanupTimedOutSessions(
      this.config.staleSessionHours,
      this.config.deleteAbandonedDays
    );

    const stats = await this.sessionRepository.getSessionStats();

    gameLogger.info(
      { markedAbandoned: result.markedAbandoned, deletedSessions: result.deletedSessions, stats },
      'Manual session cleanup completed'
    );

    return { ...result, stats };
  }

  /**
   * Get stale sessions that will be cleaned up
   */
  async getStaleSessions(): Promise<any[]> {
    return await this.sessionRepository.getStaleSessions(this.config.staleSessionHours);
  }

  /**
   * Shutdown the service gracefully
   */
  async shutdown(): Promise<void> {
    gameLogger.info('Shutting down session persistence service...');

    // Stop cleanup job
    this.stopCleanup();

    // Save all dirty sessions
    await this.sessionManager.shutdown();

    gameLogger.info('Session persistence service shutdown complete');
  }

  /**
   * Get current configuration
   */
  getConfig(): Required<SessionPersistenceConfig> {
    return { ...this.config };
  }

  /**
   * Check if cleanup job is running
   */
  isCleanupRunning(): boolean {
    return this.cleanupInterval !== null;
  }
}

// Export singleton instance creator
export const createSessionPersistenceService = (
  config?: SessionPersistenceConfig
): SessionPersistenceService => {
  return SessionPersistenceService.getInstance(config);
};

// Default export
export default SessionPersistenceService;
