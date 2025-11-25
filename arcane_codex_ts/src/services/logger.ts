import pino from 'pino';

/**
 * Structured logging service using Pino
 * Fast, JSON-based logging with category support
 */

const isDevelopment = process.env.NODE_ENV !== 'production';

// Base logger configuration
const baseLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => ({ level: label })
  },
  // Pretty print in development
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined
});

// Create child loggers for different categories
export const logger = baseLogger;
export const dbLogger = baseLogger.child({ category: 'database' });
export const socketLogger = baseLogger.child({ category: 'socket' });
export const apiLogger = baseLogger.child({ category: 'api' });
export const securityLogger = baseLogger.child({ category: 'security' });
export const gameLogger = baseLogger.child({ category: 'game' });
export const battleLogger = baseLogger.child({ category: 'battle' });
export const mcpLogger = baseLogger.child({ category: 'mcp' });
export const partyLogger = baseLogger.child({ category: 'party' });
export const multiplayerLogger = baseLogger.child({ category: 'multiplayer' });
export const consequenceLogger = baseLogger.child({ category: 'consequence' });
export const asymmetricLogger = baseLogger.child({ category: 'asymmetric' });

// Type exports for use in other modules
export type Logger = pino.Logger;

// Default export
export default logger;
