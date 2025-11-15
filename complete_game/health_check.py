"""
The Arcane Codex - Health Check System
Kubernetes-ready health endpoints and monitoring
"""

import time
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from flask import jsonify

logger = logging.getLogger(__name__)

class HealthCheck:
    """
    Health check system for load balancers and orchestration
    """

    def __init__(self, db=None, cache=None):
        self.db = db
        self.cache = cache
        self.start_time = time.time()
        self.last_check = None
        self.check_results = {}

    def get_health_status(self) -> tuple:
        """
        Comprehensive health check
        Returns (response, status_code)
        """
        checks = {}
        overall_healthy = True

        # Check database
        db_healthy, db_message = self._check_database()
        checks['database'] = {
            'healthy': db_healthy,
            'message': db_message
        }
        if not db_healthy:
            overall_healthy = False

        # Check cache
        cache_healthy, cache_message = self._check_cache()
        checks['cache'] = {
            'healthy': cache_healthy,
            'message': cache_message
        }
        # Cache is optional, don't fail if unavailable

        # System uptime
        uptime_seconds = time.time() - self.start_time
        checks['uptime'] = {
            'healthy': True,
            'uptime_seconds': uptime_seconds,
            'uptime_formatted': self._format_uptime(uptime_seconds)
        }

        # Response time
        checks['response_time'] = {
            'healthy': True,
            'timestamp': datetime.now().isoformat()
        }

        # Overall status
        status_code = 200 if overall_healthy else 503

        response = {
            'status': 'healthy' if overall_healthy else 'unhealthy',
            'timestamp': datetime.now().isoformat(),
            'checks': checks,
            'version': '1.0.0'
        }

        self.last_check = datetime.now()
        self.check_results = checks

        return jsonify(response), status_code

    def get_readiness_status(self) -> tuple:
        """
        Readiness check - can the service handle requests?
        Used by load balancers to determine if instance should receive traffic
        Returns (response, status_code)
        """
        ready = True
        reasons = []

        # Must have database connection
        db_healthy, db_message = self._check_database()
        if not db_healthy:
            ready = False
            reasons.append(f"Database not ready: {db_message}")

        # Check if warming up (first 10 seconds)
        uptime = time.time() - self.start_time
        if uptime < 10:
            ready = False
            reasons.append(f"Still warming up ({uptime:.1f}s)")

        status_code = 200 if ready else 503

        response = {
            'ready': ready,
            'timestamp': datetime.now().isoformat(),
            'reasons': reasons if not ready else []
        }

        return jsonify(response), status_code

    def get_liveness_status(self) -> tuple:
        """
        Liveness check - is the service alive?
        Used by orchestration to determine if instance should be restarted
        Returns (response, status_code)
        """
        # Simple check - if we can respond, we're alive
        response = {
            'alive': True,
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(response), 200

    def get_metrics(self) -> Dict[str, Any]:
        """Get health metrics for monitoring"""
        metrics = {
            'uptime_seconds': time.time() - self.start_time,
            'last_health_check': self.last_check.isoformat() if self.last_check else None,
            'checks': self.check_results
        }

        # Add database metrics
        if self.db:
            try:
                db_stats = self.db.get_pool_stats()
                metrics['database'] = db_stats
            except Exception as e:
                logger.error(f"Failed to get database stats: {e}")

        # Add cache metrics
        if self.cache:
            try:
                cache_stats = self.cache.get_stats()
                metrics['cache'] = cache_stats
            except Exception as e:
                logger.error(f"Failed to get cache stats: {e}")

        return metrics

    def _check_database(self) -> tuple[bool, str]:
        """Check database connectivity"""
        if not self.db:
            return False, "Database not configured"

        try:
            # Try a simple query
            with self.db.get_connection() as conn:
                result = conn.execute("SELECT 1").fetchone()
                if result:
                    return True, "Connected"
                else:
                    return False, "Query failed"
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return False, str(e)

    def _check_cache(self) -> tuple[bool, str]:
        """Check cache connectivity"""
        if not self.cache:
            return True, "Cache not configured (optional)"

        try:
            # Try a set and get
            test_key = "__health_check__"
            test_value = time.time()

            self.cache.set(test_key, test_value, ttl=10)
            retrieved = self.cache.get(test_key)

            if retrieved == test_value:
                self.cache.delete(test_key)
                return True, "Connected"
            else:
                return False, "Cache read/write failed"
        except Exception as e:
            logger.error(f"Cache health check failed: {e}")
            return True, f"Cache unavailable (optional): {str(e)}"

    def _format_uptime(self, seconds: float) -> str:
        """Format uptime in human-readable format"""
        days = int(seconds // 86400)
        hours = int((seconds % 86400) // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)

        parts = []
        if days > 0:
            parts.append(f"{days}d")
        if hours > 0:
            parts.append(f"{hours}h")
        if minutes > 0:
            parts.append(f"{minutes}m")
        parts.append(f"{secs}s")

        return " ".join(parts)


# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Health Check System...")

    health = HealthCheck()

    # Simulate Flask app context for testing
    class MockRequest:
        pass

    # Test health status
    print("\nHealth Status:")
    response, status = health.get_health_status()
    print(f"Status Code: {status}")
    print(f"Response: {response.get_json()}")

    # Test readiness
    print("\nReadiness Status:")
    response, status = health.get_readiness_status()
    print(f"Status Code: {status}")
    print(f"Response: {response.get_json()}")

    # Test liveness
    print("\nLiveness Status:")
    response, status = health.get_liveness_status()
    print(f"Status Code: {status}")
    print(f"Response: {response.get_json()}")

    # Wait a bit and check again
    print("\nWaiting 11 seconds to test warmup...")
    time.sleep(11)

    response, status = health.get_readiness_status()
    print(f"Readiness after warmup - Status Code: {status}")
    print(f"Response: {response.get_json()}")

    print("\nHealth check system test completed!")
