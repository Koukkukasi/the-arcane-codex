"""
The Arcane Codex - Main Integration and Testing Framework
Phase 6: Final Integration and Polish
"""

import logging
import asyncio
import json
import sys
import os
from typing import Dict, Optional, Any
from datetime import datetime
import signal

# Import all game modules
from database import ArcaneDatabase
from app import app, socketio
from ai_gm_auto import AIGameMaster, start_ai_gm_thread
from mcp_client import SyncMCPClient
from sensory_system import SensorySystem
from divine_interrogation import DivineInterrogation
from scenarios import ScenarioGenerator
from error_handler import ErrorHandler, ErrorCategory, ErrorSeverity
from performance_monitor import PerformanceMonitor, GameOptimizer
from reconnection_handler import ReconnectionHandler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('arcane_codex.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ArcaneCodexGame:
    """
    Main game integration class that ties all components together
    """

    def __init__(self, config: Dict = None):
        self.config = config or self.load_default_config()
        self.running = False
        self.components = {}

        logger.info("="*60)
        logger.info("  The Arcane Codex - Initializing")
        logger.info("  AI-Powered Asymmetric Information RPG")
        logger.info("="*60)

    def load_default_config(self) -> Dict:
        """Load default configuration"""
        return {
            'server': {
                'host': '0.0.0.0',
                'port': 5000,
                'debug': False
            },
            'database': {
                'path': 'arcane_codex.db'
            },
            'ai_gm': {
                'enabled': True,
                'check_interval': 2,
                'use_mcp': True
            },
            'performance': {
                'monitoring_enabled': True,
                'alert_threshold': 0.8
            },
            'reconnection': {
                'timeout_minutes': 10,
                'ai_takeover': True
            },
            'error_handling': {
                'enabled': True,
                'save_on_critical': True
            }
        }

    def initialize_components(self):
        """Initialize all game components"""
        logger.info("Initializing game components...")

        try:
            # 1. Database
            logger.info("  [1/9] Database...")
            self.components['db'] = ArcaneDatabase(
                self.config['database']['path']
            )

            # 2. Error Handler
            logger.info("  [2/9] Error Handler...")
            self.components['error_handler'] = ErrorHandler(
                socketio=socketio,
                db=self.components['db']
            )

            # 3. Performance Monitor
            logger.info("  [3/9] Performance Monitor...")
            self.components['performance'] = PerformanceMonitor(
                alert_threshold=self.config['performance']['alert_threshold']
            )

            # 4. Game Optimizer
            logger.info("  [4/9] Game Optimizer...")
            self.components['optimizer'] = GameOptimizer(
                monitor=self.components['performance'],
                db=self.components['db']
            )

            # 5. Reconnection Handler
            logger.info("  [5/9] Reconnection Handler...")
            self.components['reconnection'] = ReconnectionHandler(
                socketio=socketio,
                db=self.components['db'],
                timeout_minutes=self.config['reconnection']['timeout_minutes']
            )

            # 6. Sensory System
            logger.info("  [6/9] Sensory System...")
            self.components['sensory'] = SensorySystem(
                db=self.components['db'],
                socketio=socketio
            )

            # 7. Divine Interrogation
            logger.info("  [7/9] Divine Interrogation...")
            self.components['divine'] = DivineInterrogation(
                db=self.components['db']
            )

            # 8. Scenario Generator
            logger.info("  [8/9] Scenario Generator...")
            self.components['scenarios'] = ScenarioGenerator(
                db=self.components['db']
            )

            # 9. AI Game Master
            if self.config['ai_gm']['enabled']:
                logger.info("  [9/9] AI Game Master...")
                self.components['ai_gm'] = AIGameMaster(socketio=socketio)

                # Test MCP connection
                if self.config['ai_gm']['use_mcp']:
                    if self.components['ai_gm'].connect_to_claude():
                        logger.info("    ✅ Connected to Claude Desktop via MCP")
                    else:
                        logger.warning("    ⚠️  Failed to connect to Claude Desktop")
                        logger.warning("    ⚠️  AI GM will use fallback scenarios")

            logger.info("All components initialized successfully!")

            # Register error callbacks
            self._setup_error_callbacks()

            # Register performance alerts
            self._setup_performance_alerts()

            return True

        except Exception as e:
            logger.error(f"Failed to initialize components: {e}")
            if self.components.get('error_handler'):
                self.components['error_handler'].handle_error(
                    e, ErrorCategory.GAME_LOGIC, ErrorSeverity.CRITICAL
                )
            return False

    def _setup_error_callbacks(self):
        """Setup error handling callbacks"""
        if 'error_handler' not in self.components:
            return

        # Register component error handlers
        def handle_ai_error(error: Exception, context: Dict):
            self.components['error_handler'].handle_error(
                error, ErrorCategory.AI_GM, ErrorSeverity.HIGH,
                game_id=context.get('game_id')
            )

        def handle_db_error(error: Exception, context: Dict):
            self.components['error_handler'].handle_error(
                error, ErrorCategory.DATABASE, ErrorSeverity.MEDIUM,
                game_id=context.get('game_id')
            )

        # Would register these with actual components
        # self.components['ai_gm'].on_error = handle_ai_error
        # self.components['db'].on_error = handle_db_error

    def _setup_performance_alerts(self):
        """Setup performance monitoring alerts"""
        if 'performance' not in self.components:
            return

        def on_performance_alert(alert_type: str, value: Any):
            logger.warning(f"Performance Alert: {alert_type} = {value}")

            # Take action based on alert type
            if alert_type == 'slow_turns' and value > 3000:
                # Clear caches if turns are too slow
                if 'optimizer' in self.components:
                    self.components['optimizer'].monitor.cache_clear()

            elif alert_type == 'high_memory' and value > 90:
                # Trigger cleanup if memory is too high
                if 'reconnection' in self.components:
                    self.components['reconnection'].cleanup_old_sessions()

        self.components['performance'].register_alert_callback(on_performance_alert)

    def start(self):
        """Start the game server"""
        if not self.initialize_components():
            logger.error("Failed to initialize, aborting startup")
            return False

        self.running = True

        logger.info("\n" + "="*60)
        logger.info("  Starting Arcane Codex Server")
        logger.info("="*60)

        try:
            # Start AI GM in background thread
            if self.config['ai_gm']['enabled']:
                logger.info("Starting AI Game Master thread...")
                self.ai_gm_thread = start_ai_gm_thread(socketio)

            # Setup graceful shutdown
            signal.signal(signal.SIGINT, self._signal_handler)
            signal.signal(signal.SIGTERM, self._signal_handler)

            # Start Flask/SocketIO server
            logger.info(f"Starting web server on {self.config['server']['host']}:{self.config['server']['port']}")
            logger.info("\n" + "🎮"*30)
            logger.info("  The Arcane Codex is ready!")
            logger.info(f"  Access at: http://localhost:{self.config['server']['port']}")
            logger.info("🎮"*30 + "\n")

            socketio.run(
                app,
                debug=self.config['server']['debug'],
                host=self.config['server']['host'],
                port=self.config['server']['port'],
                allow_unsafe_werkzeug=True
            )

        except Exception as e:
            logger.error(f"Server error: {e}")
            self.shutdown()

    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info("\nShutdown signal received, stopping gracefully...")
        self.shutdown()
        sys.exit(0)

    def shutdown(self):
        """Graceful shutdown"""
        logger.info("Shutting down Arcane Codex...")
        self.running = False

        # Stop AI GM
        if 'ai_gm' in self.components:
            self.components['ai_gm'].stop()

        # Stop performance monitor
        if 'performance' in self.components:
            self.components['performance'].stop()

        # Generate final reports
        self.generate_final_reports()

        logger.info("Shutdown complete")

    def generate_final_reports(self):
        """Generate final performance and error reports"""
        try:
            report = {
                'timestamp': datetime.now().isoformat(),
                'components': list(self.components.keys())
            }

            # Performance report
            if 'performance' in self.components:
                perf_report = self.components['performance'].get_report(period_minutes=60)
                report['performance'] = {
                    'warnings': perf_report.warnings,
                    'recommendations': perf_report.recommendations,
                    'cache_stats': {
                        'hits': self.components['performance'].cache_hits,
                        'misses': self.components['performance'].cache_misses
                    }
                }

            # Error report
            if 'error_handler' in self.components:
                error_stats = self.components['error_handler'].get_error_stats()
                report['errors'] = error_stats

            # Save report
            with open(f"session_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json", "w") as f:
                json.dump(report, f, indent=2)

            logger.info("Final reports generated")

        except Exception as e:
            logger.error(f"Failed to generate reports: {e}")

    def run_tests(self):
        """Run integration tests"""
        logger.info("\n" + "="*60)
        logger.info("  Running Integration Tests")
        logger.info("="*60)

        test_results = {
            'passed': 0,
            'failed': 0,
            'errors': []
        }

        # Test 1: Database
        try:
            logger.info("Test 1: Database operations...")
            test_game_id = self.components['db'].create_game("TEST01")
            assert test_game_id is not None
            test_results['passed'] += 1
            logger.info("  ✅ Database test passed")
        except Exception as e:
            test_results['failed'] += 1
            test_results['errors'].append(f"Database: {e}")
            logger.error(f"  ❌ Database test failed: {e}")

        # Test 2: AI GM Connection
        try:
            logger.info("Test 2: AI GM connection...")
            if 'ai_gm' in self.components:
                connected = self.components['ai_gm'].mcp_client.connect()
                if connected:
                    test_results['passed'] += 1
                    logger.info("  ✅ AI GM test passed")
                else:
                    test_results['failed'] += 1
                    logger.warning("  ⚠️  AI GM connection failed (non-critical)")
        except Exception as e:
            test_results['failed'] += 1
            test_results['errors'].append(f"AI GM: {e}")
            logger.error(f"  ❌ AI GM test failed: {e}")

        # Test 3: Sensory System
        try:
            logger.info("Test 3: Sensory system...")
            test_scene = self.components['sensory'].generate_sensory_scene({
                'location': 'Test Location',
                'players': [{'id': 'p1', 'class_type': 'Fighter'}]
            })
            assert test_scene is not None
            test_results['passed'] += 1
            logger.info("  ✅ Sensory system test passed")
        except Exception as e:
            test_results['failed'] += 1
            test_results['errors'].append(f"Sensory: {e}")
            logger.error(f"  ❌ Sensory system test failed: {e}")

        # Test 4: Error Handling
        try:
            logger.info("Test 4: Error handling...")
            test_error = Exception("Test error")
            handled = self.components['error_handler'].handle_error(
                test_error, ErrorCategory.VALIDATION, ErrorSeverity.LOW
            )
            assert handled
            test_results['passed'] += 1
            logger.info("  ✅ Error handling test passed")
        except Exception as e:
            test_results['failed'] += 1
            test_results['errors'].append(f"Error Handler: {e}")
            logger.error(f"  ❌ Error handling test failed: {e}")

        # Test 5: Performance Monitoring
        try:
            logger.info("Test 5: Performance monitoring...")
            self.components['performance'].record_metric('test.metric', 42, 'units')
            report = self.components['performance'].get_report(period_minutes=1)
            assert report is not None
            test_results['passed'] += 1
            logger.info("  ✅ Performance monitoring test passed")
        except Exception as e:
            test_results['failed'] += 1
            test_results['errors'].append(f"Performance: {e}")
            logger.error(f"  ❌ Performance monitoring test failed: {e}")

        # Summary
        logger.info("\n" + "="*60)
        logger.info("  Test Results")
        logger.info("="*60)
        logger.info(f"  Passed: {test_results['passed']}")
        logger.info(f"  Failed: {test_results['failed']}")
        if test_results['errors']:
            logger.info("  Errors:")
            for error in test_results['errors']:
                logger.info(f"    - {error}")
        logger.info("="*60)

        return test_results['failed'] == 0

# CLI entry point
def main():
    """Main entry point"""
    import argparse

    parser = argparse.ArgumentParser(description='The Arcane Codex - AI RPG')
    parser.add_argument('--test', action='store_true', help='Run tests only')
    parser.add_argument('--config', type=str, help='Path to config file')
    parser.add_argument('--port', type=int, default=5000, help='Server port')
    parser.add_argument('--debug', action='store_true', help='Enable debug mode')

    args = parser.parse_args()

    # Create game instance
    game = ArcaneCodexGame()

    # Override config with CLI args
    if args.port:
        game.config['server']['port'] = args.port
    if args.debug:
        game.config['server']['debug'] = True

    if args.test:
        # Run tests only
        success = game.run_tests()
        sys.exit(0 if success else 1)
    else:
        # Start game server
        game.start()

if __name__ == "__main__":
    main()