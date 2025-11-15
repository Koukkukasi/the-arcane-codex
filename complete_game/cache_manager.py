"""
The Arcane Codex - Cache Manager
Redis-backed caching with in-memory fallback
"""

import json
import time
import logging
from typing import Any, Optional, Dict, Callable
from datetime import timedelta

logger = logging.getLogger(__name__)

class CacheManager:
    """
    Multi-level cache manager with Redis primary and in-memory fallback
    """

    def __init__(self, redis_url: Optional[str] = None, default_ttl: int = 300):
        self.default_ttl = default_ttl
        self.redis_client = None
        self.in_memory_cache: Dict[str, tuple] = {}
        self.cache_hits = 0
        self.cache_misses = 0

        # Try to connect to Redis
        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(
                    redis_url,
                    decode_responses=True,
                    socket_connect_timeout=5,
                    socket_timeout=5
                )
                # Test connection
                self.redis_client.ping()
                logger.info(f"Redis cache connected: {redis_url}")
            except ImportError:
                logger.warning("Redis library not installed, using in-memory cache")
                self.redis_client = None
            except Exception as e:
                logger.warning(f"Failed to connect to Redis: {e}, using in-memory cache")
                self.redis_client = None
        else:
            logger.info("No Redis URL provided, using in-memory cache")

    def get(self, key: str) -> Optional[Any]:
        """Get value from cache"""
        try:
            # Try Redis first
            if self.redis_client:
                try:
                    value = self.redis_client.get(key)
                    if value is not None:
                        self.cache_hits += 1
                        return json.loads(value)
                except Exception as e:
                    logger.error(f"Redis get error: {e}")

            # Fallback to in-memory
            if key in self.in_memory_cache:
                value, expiry = self.in_memory_cache[key]
                if expiry is None or time.time() < expiry:
                    self.cache_hits += 1
                    return value
                else:
                    # Expired
                    del self.in_memory_cache[key]

            self.cache_misses += 1
            return None

        except Exception as e:
            logger.error(f"Cache get error for key {key}: {e}")
            self.cache_misses += 1
            return None

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """Set value in cache"""
        ttl = ttl or self.default_ttl

        try:
            # Set in Redis
            if self.redis_client:
                try:
                    self.redis_client.setex(
                        key,
                        ttl,
                        json.dumps(value)
                    )
                except Exception as e:
                    logger.error(f"Redis set error: {e}")

            # Also set in memory as fallback
            expiry = time.time() + ttl if ttl else None
            self.in_memory_cache[key] = (value, expiry)

            # Limit in-memory cache size
            if len(self.in_memory_cache) > 1000:
                # Remove oldest entries
                sorted_keys = sorted(
                    self.in_memory_cache.items(),
                    key=lambda x: x[1][1] if x[1][1] else float('inf')
                )
                # Keep only 800 most recent
                self.in_memory_cache = dict(sorted_keys[-800:])

        except Exception as e:
            logger.error(f"Cache set error for key {key}: {e}")

    def delete(self, key: str):
        """Delete value from cache"""
        try:
            # Delete from Redis
            if self.redis_client:
                try:
                    self.redis_client.delete(key)
                except Exception as e:
                    logger.error(f"Redis delete error: {e}")

            # Delete from memory
            if key in self.in_memory_cache:
                del self.in_memory_cache[key]

        except Exception as e:
            logger.error(f"Cache delete error for key {key}: {e}")

    def get_or_set(self, key: str, generator: Callable, ttl: Optional[int] = None) -> Any:
        """Get from cache or generate and cache"""
        value = self.get(key)

        if value is not None:
            return value

        # Generate new value
        value = generator()
        self.set(key, value, ttl)
        return value

    def clear(self, pattern: Optional[str] = None):
        """Clear cache entries"""
        try:
            if pattern:
                # Clear matching keys
                if self.redis_client:
                    try:
                        keys = self.redis_client.keys(f"*{pattern}*")
                        if keys:
                            self.redis_client.delete(*keys)
                    except Exception as e:
                        logger.error(f"Redis pattern delete error: {e}")

                # Clear from memory
                keys_to_delete = [k for k in self.in_memory_cache.keys() if pattern in k]
                for key in keys_to_delete:
                    del self.in_memory_cache[key]
            else:
                # Clear all
                if self.redis_client:
                    try:
                        self.redis_client.flushdb()
                    except Exception as e:
                        logger.error(f"Redis flush error: {e}")

                self.in_memory_cache.clear()

        except Exception as e:
            logger.error(f"Cache clear error: {e}")

    def get_hit_rate(self) -> float:
        """Get cache hit rate"""
        total = self.cache_hits + self.cache_misses
        if total == 0:
            return 0.0
        return self.cache_hits / total

    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics"""
        stats = {
            'backend': 'redis' if self.redis_client else 'memory',
            'hits': self.cache_hits,
            'misses': self.cache_misses,
            'hit_rate': self.get_hit_rate(),
            'in_memory_size': len(self.in_memory_cache)
        }

        # Add Redis stats if available
        if self.redis_client:
            try:
                info = self.redis_client.info('stats')
                stats['redis_keys'] = self.redis_client.dbsize()
                stats['redis_memory'] = info.get('used_memory_human', 'N/A')
            except Exception as e:
                logger.error(f"Failed to get Redis stats: {e}")

        return stats

    def close(self):
        """Close cache connections"""
        if self.redis_client:
            try:
                self.redis_client.close()
                logger.info("Redis connection closed")
            except Exception as e:
                logger.error(f"Error closing Redis: {e}")


class SessionManager:
    """
    Session manager using cache backend
    """

    def __init__(self, cache: CacheManager, session_ttl: int = 3600):
        self.cache = cache
        self.session_ttl = session_ttl

    def create_session(self, session_id: str, data: Dict[str, Any]):
        """Create a new session"""
        self.cache.set(f"session:{session_id}", data, ttl=self.session_ttl)

    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        return self.cache.get(f"session:{session_id}")

    def update_session(self, session_id: str, data: Dict[str, Any]):
        """Update session data"""
        existing = self.get_session(session_id) or {}
        existing.update(data)
        self.cache.set(f"session:{session_id}", existing, ttl=self.session_ttl)

    def delete_session(self, session_id: str):
        """Delete session"""
        self.cache.delete(f"session:{session_id}")

    def refresh_session(self, session_id: str):
        """Refresh session TTL"""
        data = self.get_session(session_id)
        if data:
            self.cache.set(f"session:{session_id}", data, ttl=self.session_ttl)


# Testing
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    print("Testing Cache Manager...")

    # Test with in-memory cache
    cache = CacheManager()

    # Set values
    cache.set("test:1", {"name": "Fighter", "hp": 100})
    cache.set("test:2", {"name": "Mage", "hp": 60}, ttl=5)

    # Get values
    print(f"Get test:1: {cache.get('test:1')}")
    print(f"Get test:2: {cache.get('test:2')}")
    print(f"Get missing: {cache.get('test:3')}")

    # Test get_or_set
    def generate_player():
        return {"name": "Ranger", "hp": 80}

    player = cache.get_or_set("test:3", generate_player)
    print(f"Generated: {player}")

    # Stats
    stats = cache.get_stats()
    print(f"\nCache stats: {json.dumps(stats, indent=2)}")

    # Test session manager
    session_mgr = SessionManager(cache)
    session_mgr.create_session("session123", {"user_id": "user1", "game_id": "game1"})
    session_data = session_mgr.get_session("session123")
    print(f"\nSession data: {session_data}")

    # Test expiry
    print("\nWaiting for TTL expiry...")
    time.sleep(6)
    print(f"Get expired test:2: {cache.get('test:2')}")

    print("\nCache manager test completed!")
