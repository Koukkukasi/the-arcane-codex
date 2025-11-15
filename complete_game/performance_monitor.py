"""
The Arcane Codex - Performance Monitoring and Optimization
Phase 6: System Performance and Caching
"""

import time
import psutil
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime, timedelta
from dataclasses import dataclass, field
from functools import lru_cache, wraps
from collections import deque, defaultdict
import threading

logger = logging.getLogger(__name__)

@dataclass
class PerformanceMetric:
    """Single performance measurement"""
    name: str
    value: float
    unit: str
    timestamp: datetime
    context: Dict[str, Any] = field(default_factory=dict)

@dataclass
class PerformanceReport:
    """Performance report for a time period"""
    period_start: datetime
    period_end: datetime
    metrics: Dict[str, List[float]]
    averages: Dict[str, float]
    peaks: Dict[str, float]
    warnings: List[str]
    recommendations: List[str]

class PerformanceMonitor:
    """
    Monitor and optimize game performance
    """

    def __init__(self, alert_threshold: float = 0.8):
        self.metrics = defaultdict(lambda: deque(maxlen=1000))
        self.alert_threshold = alert_threshold
        self.cache = {}
        self.cache_hits = 0
        self.cache_misses = 0
        self.operation_timings = defaultdict(list)
        self.monitoring = True
        self.alert_callbacks = []

        # Start monitoring thread
        self.monitor_thread = threading.Thread(target=self._monitor_loop, daemon=True)
        self.monitor_thread.start()

    def _monitor_loop(self):
        """Background monitoring loop"""
        while self.monitoring:
            try:
                # System metrics
                self._collect_system_metrics()

                # Check for alerts
                self._check_alerts()

                time.sleep(5)  # Check every 5 seconds

            except Exception as e:
                logger.error(f"Monitor loop error: {e}")

    def _collect_system_metrics(self):
        """Collect system performance metrics"""
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=1)
            self.record_metric('system.cpu', cpu_percent, '%')

            # Memory usage
            memory = psutil.virtual_memory()
            self.record_metric('system.memory', memory.percent, '%')
            self.record_metric('system.memory_mb', memory.used / 1024 / 1024, 'MB')

            # Disk I/O
            disk = psutil.disk_io_counters()
            if disk:
                self.record_metric('system.disk_read', disk.read_bytes, 'bytes')
                self.record_metric('system.disk_write', disk.write_bytes, 'bytes')

            # Network I/O
            network = psutil.net_io_counters()
            if network:
                self.record_metric('system.network_sent', network.bytes_sent, 'bytes')
                self.record_metric('system.network_recv', network.bytes_recv, 'bytes')

        except Exception as e:
            logger.error(f"Error collecting system metrics: {e}")

    def record_metric(self, name: str, value: float, unit: str = '',
                     context: Dict = None):
        """Record a performance metric"""
        metric = PerformanceMetric(
            name=name,
            value=value,
            unit=unit,
            timestamp=datetime.now(),
            context=context or {}
        )

        self.metrics[name].append(metric)

        # Check if metric exceeds threshold
        if name.endswith('.cpu') or name.endswith('.memory'):
            if value > self.alert_threshold * 100:
                self._trigger_alert(name, value)

    def record_operation_time(self, operation: str, duration: float):
        """Record time taken for an operation"""
        self.operation_timings[operation].append(duration)

        # Keep only last 100 timings per operation
        if len(self.operation_timings[operation]) > 100:
            self.operation_timings[operation] = self.operation_timings[operation][-100:]

        # Record as metric
        self.record_metric(f'operation.{operation}', duration * 1000, 'ms')

        # Alert on slow operations
        if duration > 1.0:  # More than 1 second
            logger.warning(f"Slow operation: {operation} took {duration:.2f}s")

    def _check_alerts(self):
        """Check for performance alerts"""
        # Check average response time
        if 'operation.process_turn' in self.metrics:
            recent = list(self.metrics['operation.process_turn'])[-20:]
            if recent:
                avg = sum(m.value for m in recent) / len(recent)
                if avg > 2000:  # More than 2 seconds average
                    self._trigger_alert('slow_turns', avg)

        # Check cache efficiency
        total_cache_ops = self.cache_hits + self.cache_misses
        if total_cache_ops > 100:
            hit_rate = self.cache_hits / total_cache_ops
            if hit_rate < 0.5:  # Less than 50% hit rate
                self._trigger_alert('low_cache_hit_rate', hit_rate)

    def _trigger_alert(self, alert_type: str, value: Any):
        """Trigger a performance alert"""
        logger.warning(f"Performance alert: {alert_type} = {value}")

        for callback in self.alert_callbacks:
            try:
                callback(alert_type, value)
            except Exception as e:
                logger.error(f"Alert callback error: {e}")

    def register_alert_callback(self, callback):
        """Register a callback for performance alerts"""
        self.alert_callbacks.append(callback)

    def get_report(self, period_minutes: int = 60) -> PerformanceReport:
        """Generate performance report for the last period"""
        now = datetime.now()
        period_start = now - timedelta(minutes=period_minutes)

        metrics_summary = {}
        averages = {}
        peaks = {}
        warnings = []
        recommendations = []

        # Analyze each metric
        for metric_name, values in self.metrics.items():
            recent_values = [
                m.value for m in values
                if m.timestamp >= period_start
            ]

            if recent_values:
                metrics_summary[metric_name] = recent_values
                averages[metric_name] = sum(recent_values) / len(recent_values)
                peaks[metric_name] = max(recent_values)

                # Generate warnings
                if metric_name == 'system.cpu' and peaks[metric_name] > 90:
                    warnings.append(f"High CPU usage detected: {peaks[metric_name]:.1f}%")

                if metric_name == 'system.memory' and peaks[metric_name] > 85:
                    warnings.append(f"High memory usage: {peaks[metric_name]:.1f}%")

        # Analyze operation timings
        for op_name, timings in self.operation_timings.items():
            if timings:
                avg_time = sum(timings) / len(timings)
                if avg_time > 0.5:  # More than 500ms average
                    warnings.append(f"Slow operation '{op_name}': {avg_time*1000:.0f}ms avg")

        # Generate recommendations
        if self.cache_hits + self.cache_misses > 0:
            hit_rate = self.cache_hits / (self.cache_hits + self.cache_misses)
            if hit_rate < 0.7:
                recommendations.append("Consider increasing cache size or TTL")

        if 'system.memory' in averages and averages['system.memory'] > 75:
            recommendations.append("High memory usage - consider optimizing data structures")

        if len(warnings) > 5:
            recommendations.append("Multiple performance issues detected - consider scaling resources")

        return PerformanceReport(
            period_start=period_start,
            period_end=now,
            metrics=metrics_summary,
            averages=averages,
            peaks=peaks,
            warnings=warnings,
            recommendations=recommendations
        )

    def cache_get(self, key: str, generator=None, ttl: int = 300):
        """Get value from cache or generate and cache it"""
        # Check if cached and not expired
        if key in self.cache:
            cached_value, cached_time = self.cache[key]
            if time.time() - cached_time < ttl:
                self.cache_hits += 1
                return cached_value

        self.cache_misses += 1

        # Generate new value if generator provided
        if generator:
            value = generator()
            self.cache[key] = (value, time.time())
            return value

        return None

    def cache_set(self, key: str, value: Any):
        """Set cache value"""
        self.cache[key] = (value, time.time())

    def cache_clear(self, pattern: str = None):
        """Clear cache entries"""
        if pattern:
            keys_to_clear = [k for k in self.cache.keys() if pattern in k]
            for key in keys_to_clear:
                del self.cache[key]
        else:
            self.cache.clear()

    def stop(self):
        """Stop monitoring"""
        self.monitoring = False

# Performance decorator
def measure_performance(monitor: PerformanceMonitor = None):
    """Decorator to measure function performance"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                if monitor:
                    monitor.record_operation_time(func.__name__, duration)
                else:
                    logger.debug(f"{func.__name__} took {duration*1000:.2f}ms")

        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            start_time = time.time()
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                if monitor:
                    monitor.record_operation_time(func.__name__, duration)
                else:
                    logger.debug(f"{func.__name__} took {duration*1000:.2f}ms")

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return wrapper
    return decorator

class GameOptimizer:
    """
    Optimize game operations for better performance
    """

    def __init__(self, monitor: PerformanceMonitor, db=None):
        self.monitor = monitor
        self.db = db

    @lru_cache(maxsize=128)
    def get_cached_player_state(self, player_id: str) -> Dict:
        """Get cached player state"""
        if self.db:
            player = self.db.get_player(player_id)
            return player
        return {}

    @lru_cache(maxsize=32)
    def get_cached_game_state(self, game_id: str) -> Dict:
        """Get cached game state"""
        if self.db:
            with self.db.get_connection() as conn:
                game = conn.execute("""
                    SELECT * FROM games WHERE id = ?
                """, (game_id,)).fetchone()
                if game:
                    return dict(game)
        return {}

    def optimize_scenario_generation(self, game_state: Dict) -> Dict:
        """Optimize scenario generation with caching"""
        cache_key = f"scenario_{game_state['game_id']}_{game_state['turn']}"

        def generate():
            # Actual scenario generation would happen here
            return {
                'optimized': True,
                'cached_at': datetime.now().isoformat()
            }

        return self.monitor.cache_get(cache_key, generate, ttl=60)

    def batch_database_operations(self, operations: List[Tuple[str, tuple]]):
        """Batch multiple database operations"""
        if not self.db:
            return

        start_time = time.time()
        results = []

        with self.db.get_connection() as conn:
            for query, params in operations:
                results.append(conn.execute(query, params))
            conn.commit()

        duration = time.time() - start_time
        self.monitor.record_operation_time('batch_db_ops', duration)

        return results

    def preload_game_data(self, game_id: str):
        """Preload all game data for faster access"""
        if not self.db:
            return

        # Preload and cache all relevant data
        with self.db.get_connection() as conn:
            # Game data
            game = conn.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
            if game:
                self.monitor.cache_set(f"game_{game_id}", dict(game))

            # Players
            players = conn.execute("SELECT * FROM players WHERE game_id = ?", (game_id,)).fetchall()
            for player in players:
                self.monitor.cache_set(f"player_{player['id']}", dict(player))

            # NPCs
            npcs = conn.execute("SELECT * FROM npcs WHERE game_id = ?", (game_id,)).fetchall()
            self.monitor.cache_set(f"npcs_{game_id}", [dict(n) for n in npcs])

    def clear_game_cache(self, game_id: str):
        """Clear all cache entries for a game"""
        self.monitor.cache_clear(f"game_{game_id}")
        self.monitor.cache_clear(f"scenario_{game_id}")
        self.monitor.cache_clear(f"npcs_{game_id}")

        # Clear player caches
        if self.db:
            players = self.db.get_players_in_game(game_id)
            for player in players:
                self.monitor.cache_clear(f"player_{player['id']}")

# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Performance Monitor...")

    monitor = PerformanceMonitor(alert_threshold=0.7)

    # Simulate some operations
    for i in range(10):
        monitor.record_operation_time('test_operation', 0.1 * (i % 3 + 1))
        time.sleep(0.1)

    # Simulate cache operations
    for i in range(20):
        key = f"test_{i % 5}"
        if i % 3 == 0:
            monitor.cache_set(key, f"value_{i}")
        else:
            monitor.cache_get(key)

    # Generate report
    report = monitor.get_report(period_minutes=1)

    print("\nPerformance Report:")
    print(f"Period: {report.period_start} to {report.period_end}")
    print(f"Warnings: {report.warnings}")
    print(f"Recommendations: {report.recommendations}")
    print(f"Cache Hit Rate: {monitor.cache_hits / (monitor.cache_hits + monitor.cache_misses) * 100:.1f}%")

    # Test optimizer
    optimizer = GameOptimizer(monitor)

    # Test cached operations
    for i in range(5):
        result = optimizer.get_cached_player_state('test_player')
        print(f"Cached result {i}: {result}")

    monitor.stop()
    print("\nPerformance monitor test completed!")