"""
Health Check and Metrics Endpoint for The Arcane Codex
To be integrated into web_game.py
"""
import os
import sqlite3
import psutil
import time
from datetime import datetime
from flask import jsonify, Response


def get_database_health(db_path):
    """Check database connectivity and health"""
    try:
        conn = sqlite3.connect(db_path, timeout=5)
        cursor = conn.cursor()

        # Simple query to test connectivity
        cursor.execute("SELECT COUNT(*) FROM sqlite_master WHERE type='table'")
        table_count = cursor.fetchone()[0]

        # Check database integrity
        cursor.execute("PRAGMA integrity_check")
        integrity_result = cursor.fetchone()[0]

        conn.close()

        return {
            'status': 'healthy' if integrity_result == 'ok' else 'degraded',
            'table_count': table_count,
            'integrity': integrity_result
        }
    except Exception as e:
        return {
            'status': 'unhealthy',
            'error': str(e)
        }


def get_system_metrics():
    """Get system resource metrics"""
    try:
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')

        return {
            'cpu': {
                'percent': cpu_percent,
                'count': psutil.cpu_count()
            },
            'memory': {
                'percent': memory.percent,
                'used_mb': round(memory.used / 1024 / 1024, 2),
                'total_mb': round(memory.total / 1024 / 1024, 2)
            },
            'disk': {
                'percent': disk.percent,
                'used_gb': round(disk.used / 1024 / 1024 / 1024, 2),
                'total_gb': round(disk.total / 1024 / 1024 / 1024, 2)
            }
        }
    except Exception as e:
        return {
            'error': str(e)
        }


def register_health_endpoints(app, game_sessions=None):
    """
    Register health check and metrics endpoints

    Args:
        app: Flask application instance
        game_sessions: Optional game sessions manager for additional metrics
    """

    @app.route('/health', methods=['GET'])
    def health_check():
        """
        Basic health check endpoint
        Returns 200 if service is healthy, 503 if unhealthy
        """
        db_path = os.getenv('DB_PATH', 'arcane_codex.db')
        db_health = get_database_health(db_path)

        # Determine overall health
        is_healthy = db_health['status'] == 'healthy'

        health_data = {
            'status': 'healthy' if is_healthy else 'unhealthy',
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'service': 'arcane-codex',
            'version': os.getenv('APP_VERSION', '1.0.0'),
            'database': db_health
        }

        status_code = 200 if is_healthy else 503
        return jsonify(health_data), status_code

    @app.route('/health/ready', methods=['GET'])
    def readiness_check():
        """
        Readiness check for Kubernetes/container orchestration
        Returns 200 if service is ready to accept traffic
        """
        db_path = os.getenv('DB_PATH', 'arcane_codex.db')
        db_health = get_database_health(db_path)

        # Check if database is accessible
        is_ready = db_health['status'] in ['healthy', 'degraded']

        readiness_data = {
            'ready': is_ready,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'checks': {
                'database': db_health['status']
            }
        }

        status_code = 200 if is_ready else 503
        return jsonify(readiness_data), status_code

    @app.route('/health/live', methods=['GET'])
    def liveness_check():
        """
        Liveness check for Kubernetes/container orchestration
        Returns 200 if service is alive (even if not ready)
        """
        return jsonify({
            'alive': True,
            'timestamp': datetime.utcnow().isoformat() + 'Z'
        }), 200

    @app.route('/metrics', methods=['GET'])
    def metrics():
        """
        Metrics endpoint for monitoring
        Returns detailed application and system metrics
        """
        db_path = os.getenv('DB_PATH', 'arcane_codex.db')

        metrics_data = {
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'service': 'arcane-codex',
            'version': os.getenv('APP_VERSION', '1.0.0'),
            'uptime_seconds': time.time() - getattr(app, 'start_time', time.time()),
            'database': get_database_health(db_path),
            'system': get_system_metrics()
        }

        # Add game-specific metrics if available
        if game_sessions:
            try:
                metrics_data['game'] = {
                    'active_sessions': len(game_sessions),
                    'total_players': sum(
                        len(session.get('players', []))
                        for session in game_sessions.values()
                    )
                }
            except Exception:
                pass

        return jsonify(metrics_data), 200

    @app.route('/metrics/prometheus', methods=['GET'])
    def prometheus_metrics():
        """
        Prometheus-compatible metrics endpoint
        Returns metrics in Prometheus text format
        """
        db_path = os.getenv('DB_PATH', 'arcane_codex.db')
        db_health = get_database_health(db_path)
        system_metrics = get_system_metrics()

        # Generate Prometheus format
        metrics_lines = [
            '# HELP arcane_codex_up Service is up and running',
            '# TYPE arcane_codex_up gauge',
            'arcane_codex_up 1',
            '',
            '# HELP arcane_codex_database_healthy Database health status',
            '# TYPE arcane_codex_database_healthy gauge',
            f'arcane_codex_database_healthy {1 if db_health["status"] == "healthy" else 0}',
            '',
            '# HELP arcane_codex_cpu_percent CPU usage percentage',
            '# TYPE arcane_codex_cpu_percent gauge',
            f'arcane_codex_cpu_percent {system_metrics.get("cpu", {}).get("percent", 0)}',
            '',
            '# HELP arcane_codex_memory_percent Memory usage percentage',
            '# TYPE arcane_codex_memory_percent gauge',
            f'arcane_codex_memory_percent {system_metrics.get("memory", {}).get("percent", 0)}',
            '',
            '# HELP arcane_codex_disk_percent Disk usage percentage',
            '# TYPE arcane_codex_disk_percent gauge',
            f'arcane_codex_disk_percent {system_metrics.get("disk", {}).get("percent", 0)}',
        ]

        # Add game metrics if available
        if game_sessions:
            try:
                active_count = len(game_sessions)
                player_count = sum(
                    len(session.get('players', []))
                    for session in game_sessions.values()
                )

                metrics_lines.extend([
                    '',
                    '# HELP arcane_codex_active_sessions Number of active game sessions',
                    '# TYPE arcane_codex_active_sessions gauge',
                    f'arcane_codex_active_sessions {active_count}',
                    '',
                    '# HELP arcane_codex_total_players Total number of connected players',
                    '# TYPE arcane_codex_total_players gauge',
                    f'arcane_codex_total_players {player_count}',
                ])
            except Exception:
                pass

        return Response('\n'.join(metrics_lines), mimetype='text/plain')

    # Store app start time for uptime calculation
    app.start_time = time.time()

    return app


# Example integration into web_game.py:
"""
from health_endpoint import register_health_endpoints

# After creating Flask app
app = Flask(__name__)

# Register health endpoints
register_health_endpoints(app, game_sessions=game_sessions)
"""
