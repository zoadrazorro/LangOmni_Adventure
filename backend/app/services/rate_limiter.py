"""Rate limiter service."""

import logging
from typing import Optional
import redis.asyncio as aioredis

logger = logging.getLogger(__name__)


class RateLimiter:
    """Redis-based rate limiter."""

    def __init__(self, redis_client: aioredis.Redis, max_requests: int = 4, window: int = 1):
        """
        Initialize rate limiter.

        Args:
            redis_client: Redis client instance
            max_requests: Maximum requests allowed per window
            window: Time window in seconds
        """
        self.redis = redis_client
        self.max_requests = max_requests
        self.window = window

    async def check_rate_limit(self, player_id: str) -> bool:
        """
        Check if player is within rate limit.

        Returns:
            True if request is allowed, False if rate limited
        """
        key = f"ratelimit:{player_id}"

        try:
            # Increment counter
            count = await self.redis.incr(key)

            # Set expiration on first request
            if count == 1:
                await self.redis.expire(key, self.window)

            # Check if over limit
            if count > self.max_requests:
                logger.warning(f"Rate limit exceeded for player {player_id}")
                return False

            return True

        except Exception as e:
            logger.error(f"Rate limiter error for player {player_id}: {e}")
            # Fail open - allow request if rate limiter fails
            return True

    async def reset(self, player_id: str):
        """Reset rate limit for a player."""
        key = f"ratelimit:{player_id}"
        try:
            await self.redis.delete(key)
        except Exception as e:
            logger.error(f"Rate limiter reset error for player {player_id}: {e}")
