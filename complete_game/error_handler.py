"""
The Arcane Codex - Error Handling and Recovery System
Phase 6: Polish and Error Management
"""

import logging
import traceback
import json
from typing import Dict, Any, Optional, Callable
from functools import wraps
from datetime import datetime
import asyncio
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class ErrorSeverity(Enum):
    """Error severity levels"""
    LOW = "low"        # Log and continue
    MEDIUM = "medium"  # Notify user, attempt recovery
    HIGH = "high"      # Alert all players, pause game
    CRITICAL = "critical"  # Stop game, save state

class ErrorCategory(Enum):
    """Error categories for targeted handling"""
    CONNECTION = "connection"
    DATABASE = "database"
    AI_GM = "ai_gm"
    GAME_LOGIC = "game_logic"
    VALIDATION = "validation"
    MCP = "mcp"
    SENSORY = "sensory"
    DIVINE = "divine"

@dataclass
class GameError:
    """Structured error information"""
    severity: ErrorSeverity
    category: ErrorCategory
    message: str
    details: Dict[str, Any]
    timestamp: datetime
    game_id: Optional[str] = None
    player_id: Optional[str] = None
    traceback: Optional[str] = None
    recovery_action: Optional[str] = None

class ErrorHandler:
    """
    Centralized error handling system with recovery strategies
    """

    def __init__(self, socketio=None, db=None):
        self.socketio = socketio
        self.db = db
        self.error_log = []
        self.recovery_strategies = {}
        self.error_counts = {}  # Track error frequency
        self.circuit_breakers = {}  # Prevent cascading failures

        # Register default recovery strategies
        self._register_default_strategies()

    def _register_default_strategies(self):
        """Register default recovery strategies for each category"""

        # Connection errors
        self.register_recovery(
            ErrorCategory.CONNECTION,
            self._recover_connection
        )

        # Database errors
        self.register_recovery(
            ErrorCategory.DATABASE,
            self._recover_database
        )

        # AI GM errors
        self.register_recovery(
            ErrorCategory.AI_GM,
            self._recover_ai_gm
        )

        # MCP errors
        self.register_recovery(
            ErrorCategory.MCP,
            self._recover_mcp
        )

    def register_recovery(self, category: ErrorCategory, strategy: Callable):
        """Register a recovery strategy for an error category"""
        self.recovery_strategies[category] = strategy

    def handle_error(self, error: Exception,
                    category: ErrorCategory,
                    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
                    game_id: str = None,
                    player_id: str = None,
                    context: Dict = None) -> bool:
        """
        Main error handling method
        Returns True if recovery succeeded, False otherwise
        """
        try:
            # Create structured error
            game_error = GameError(
                severity=severity,
                category=category,
                message=str(error),
                details=context or {},
                timestamp=datetime.now(),
                game_id=game_id,
                player_id=player_id,
                traceback=traceback.format_exc()
            )

            # Log error
            self._log_error(game_error)

            # Check circuit breaker
            if self._is_circuit_broken(category):
                logger.warning(f"Circuit breaker open for {category}")
                return False

            # Track error frequency
            self._track_error_frequency(category)

            # Attempt recovery based on severity
            if severity == ErrorSeverity.LOW:
                # Just log and continue
                return True

            elif severity == ErrorSeverity.MEDIUM:
                # Attempt recovery
                return self._attempt_recovery(game_error)

            elif severity == ErrorSeverity.HIGH:
                # Pause game and alert players
                self._pause_game(game_id)
                self._alert_players(game_error)
                return self._attempt_recovery(game_error)

            elif severity == ErrorSeverity.CRITICAL:
                # Save state and stop
                self._emergency_save(game_id)
                self._stop_game(game_id)
                return False

        except Exception as e:
            logger.critical(f"Error handler failed: {e}")
            return False

    def _log_error(self, error: GameError):
        """Log error to file and memory"""
        self.error_log.append(error)

        # Keep only last 1000 errors in memory
        if len(self.error_log) > 1000:
            self.error_log = self.error_log[-1000:]

        # Log to file
        log_entry = {
            'timestamp': error.timestamp.isoformat(),
            'severity': error.severity.value,
            'category': error.category.value,
            'message': error.message,
            'game_id': error.game_id,
            'player_id': error.player_id,
            'details': error.details
        }

        logger.error(f"Game Error: {json.dumps(log_entry)}")

        # Write to error log file
        try:
            with open("error_log.jsonl", "a") as f:
                f.write(json.dumps(log_entry) + "\n")
        except:
            pass  # Don't fail on logging failure

    def _track_error_frequency(self, category: ErrorCategory):
        """Track error frequency for circuit breaking"""
        key = category.value
        now = datetime.now()

        if key not in self.error_counts:
            self.error_counts[key] = []

        # Add current timestamp
        self.error_counts[key].append(now)

        # Remove old timestamps (older than 1 minute)
        cutoff = datetime.now().timestamp() - 60
        self.error_counts[key] = [
            t for t in self.error_counts[key]
            if t.timestamp() > cutoff
        ]

        # Open circuit breaker if too many errors
        if len(self.error_counts[key]) > 10:  # More than 10 errors per minute
            self.circuit_breakers[key] = now
            logger.warning(f"Circuit breaker opened for {category.value}")

    def _is_circuit_broken(self, category: ErrorCategory) -> bool:
        """Check if circuit breaker is open"""
        key = category.value
        if key not in self.circuit_breakers:
            return False

        # Circuit breaker resets after 30 seconds
        opened_at = self.circuit_breakers[key]
        if (datetime.now() - opened_at).seconds > 30:
            del self.circuit_breakers[key]
            logger.info(f"Circuit breaker reset for {category.value}")
            return False

        return True

    def _attempt_recovery(self, error: GameError) -> bool:
        """Attempt to recover from error"""
        if error.category in self.recovery_strategies:
            strategy = self.recovery_strategies[error.category]
            try:
                return strategy(error)
            except Exception as e:
                logger.error(f"Recovery strategy failed: {e}")
                return False
        return False

    def _recover_connection(self, error: GameError) -> bool:
        """Recover from connection errors"""
        try:
            if self.socketio and error.player_id:
                # Try to reconnect player
                self.socketio.emit('reconnect_required', {
                    'reason': error.message
                }, room=f"player_{error.player_id}")
            return True
        except:
            return False

    def _recover_database(self, error: GameError) -> bool:
        """Recover from database errors"""
        try:
            if self.db:
                # Try to reconnect to database
                self.db.reconnect()

                # Retry the failed operation if possible
                if 'operation' in error.details:
                    # Would retry operation here
                    pass
            return True
        except:
            return False

    def _recover_ai_gm(self, error: GameError) -> bool:
        """Recover from AI GM errors"""
        try:
            # Use fallback scenario
            if error.game_id and self.socketio:
                self.socketio.emit('ai_gm_fallback', {
                    'message': 'AI GM temporarily unavailable, using fallback scenario'
                }, room=error.game_id)
            return True
        except:
            return False

    def _recover_mcp(self, error: GameError) -> bool:
        """Recover from MCP/Claude connection errors"""
        try:
            # Attempt to reconnect to Claude Desktop
            logger.info("Attempting to reconnect to Claude Desktop...")

            # Would trigger MCP reconnection here
            # For now, notify and use fallback
            if error.game_id and self.socketio:
                self.socketio.emit('mcp_fallback', {
                    'message': 'Claude connection lost, using fallback AI'
                }, room=error.game_id)
            return True
        except:
            return False

    def _pause_game(self, game_id: str):
        """Pause a game due to error"""
        try:
            if self.db and game_id:
                with self.db.get_connection() as conn:
                    conn.execute("""
                        UPDATE games
                        SET phase = 'paused',
                            paused_reason = 'System error'
                        WHERE id = ?
                    """, (game_id,))

            if self.socketio:
                self.socketio.emit('game_paused', {
                    'reason': 'System error detected'
                }, room=game_id)
        except:
            pass

    def _alert_players(self, error: GameError):
        """Alert players about error"""
        try:
            if self.socketio and error.game_id:
                self.socketio.emit('system_alert', {
                    'severity': error.severity.value,
                    'message': f"System issue detected: {error.category.value}",
                    'recovery': 'Attempting automatic recovery...'
                }, room=error.game_id)
        except:
            pass

    def _emergency_save(self, game_id: str):
        """Emergency save of game state"""
        try:
            if self.db and game_id:
                # Get full game state
                with self.db.get_connection() as conn:
                    game = conn.execute("""
                        SELECT * FROM games WHERE id = ?
                    """, (game_id,)).fetchone()

                    if game:
                        # Save to emergency backup
                        backup = {
                            'game': dict(game),
                            'timestamp': datetime.now().isoformat(),
                            'reason': 'emergency_save'
                        }

                        with open(f"emergency_backup_{game_id}.json", "w") as f:
                            json.dump(backup, f)

                        logger.info(f"Emergency save completed for game {game_id}")
        except Exception as e:
            logger.critical(f"Emergency save failed: {e}")

    def _stop_game(self, game_id: str):
        """Stop a game due to critical error"""
        try:
            if self.db and game_id:
                with self.db.get_connection() as conn:
                    conn.execute("""
                        UPDATE games
                        SET phase = 'error_stopped'
                        WHERE id = ?
                    """, (game_id,))

            if self.socketio:
                self.socketio.emit('game_stopped', {
                    'reason': 'Critical error - game saved and stopped'
                }, room=game_id)
        except:
            pass

    def get_error_stats(self, game_id: str = None) -> Dict:
        """Get error statistics"""
        stats = {
            'total_errors': len(self.error_log),
            'by_severity': {},
            'by_category': {},
            'recent_errors': []
        }

        # Filter by game if specified
        errors = self.error_log
        if game_id:
            errors = [e for e in errors if e.game_id == game_id]

        # Count by severity
        for severity in ErrorSeverity:
            count = len([e for e in errors if e.severity == severity])
            stats['by_severity'][severity.value] = count

        # Count by category
        for category in ErrorCategory:
            count = len([e for e in errors if e.category == category])
            stats['by_category'][category.value] = count

        # Recent errors
        stats['recent_errors'] = [
            {
                'timestamp': e.timestamp.isoformat(),
                'severity': e.severity.value,
                'category': e.category.value,
                'message': e.message
            }
            for e in errors[-10:]  # Last 10 errors
        ]

        return stats

# Decorator for automatic error handling
def handle_errors(category: ErrorCategory = ErrorCategory.GAME_LOGIC,
                  severity: ErrorSeverity = ErrorSeverity.MEDIUM):
    """Decorator for automatic error handling"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # Try to extract context
                context = {
                    'function': func.__name__,
                    'args': str(args)[:200],  # Truncate for safety
                    'kwargs': str(kwargs)[:200]
                }

                # Get error handler instance (would be injected)
                # For now, just log
                logger.error(f"Error in {func.__name__}: {e}")
                logger.error(f"Context: {context}")

                # Re-raise for now
                raise

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            try:
                return await func(*args, **kwargs)
            except Exception as e:
                context = {
                    'function': func.__name__,
                    'args': str(args)[:200],
                    'kwargs': str(kwargs)[:200]
                }

                logger.error(f"Error in {func.__name__}: {e}")
                logger.error(f"Context: {context}")
                raise

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return wrapper
    return decorator

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    # Test error handler
    handler = ErrorHandler()

    # Simulate various errors
    print("Testing error handler...")

    # Low severity error
    handler.handle_error(
        Exception("Minor validation issue"),
        ErrorCategory.VALIDATION,
        ErrorSeverity.LOW,
        game_id="test_game"
    )

    # Medium severity error
    handler.handle_error(
        Exception("Database connection lost"),
        ErrorCategory.DATABASE,
        ErrorSeverity.MEDIUM,
        game_id="test_game"
    )

    # High severity error
    handler.handle_error(
        Exception("AI GM not responding"),
        ErrorCategory.AI_GM,
        ErrorSeverity.HIGH,
        game_id="test_game"
    )

    # Get statistics
    stats = handler.get_error_stats()
    print(f"\nError Statistics:")
    print(json.dumps(stats, indent=2))

    print("\nError handler test completed!")