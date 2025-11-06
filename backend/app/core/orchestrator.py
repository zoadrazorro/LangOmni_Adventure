"""
Central Orchestrator - The brain of the LangOmni Adventure server.

Responsibilities:
- Request routing and prioritization
- GPU load balancing
- Timeout handling
- Fallback to rule-based systems
- Player session management
- Coordinated multi-GPU queries
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from functools import lru_cache

import redis.asyncio as aioredis
from app.config import get_settings
from app.gpu.manager import GPUManager
from app.services.cache import CacheService
from app.services.rate_limiter import RateLimiter

logger = logging.getLogger(__name__)
settings = get_settings()


class Orchestrator:
    """Central orchestrator for game server coordination."""

    def __init__(self):
        self.settings = settings
        self.redis_client: Optional[aioredis.Redis] = None
        self.gpu_0_manager: Optional[GPUManager] = None
        self.gpu_1_manager: Optional[GPUManager] = None
        self.cache_service: Optional[CacheService] = None
        self.rate_limiter: Optional[RateLimiter] = None
        self.initialized = False

    async def initialize(self):
        """Initialize all services."""
        if self.initialized:
            return

        logger.info("Initializing orchestrator...")

        # Initialize Redis
        try:
            self.redis_client = await aioredis.from_url(
                self.settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
            )
            await self.redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise

        # Initialize cache service
        self.cache_service = CacheService(self.redis_client)

        # Initialize rate limiter
        self.rate_limiter = RateLimiter(
            self.redis_client,
            max_requests=self.settings.RATE_LIMIT_PER_PLAYER,
        )

        # Initialize GPU managers
        if self.settings.GPU_0_ENABLED:
            self.gpu_0_manager = GPUManager(
                gpu_id="gpu_0",
                model_url=self.settings.OLLAMA_GPU_0_URL,
                model_name=self.settings.OLLAMA_GPU_0_MODEL,
            )
            await self.gpu_0_manager.initialize()
            logger.info("GPU 0 manager initialized")

        if self.settings.GPU_1_ENABLED:
            self.gpu_1_manager = GPUManager(
                gpu_id="gpu_1",
                model_url=self.settings.OLLAMA_GPU_1_URL,
                model_name=self.settings.OLLAMA_GPU_1_MODEL,
            )
            await self.gpu_1_manager.initialize()
            logger.info("GPU 1 manager initialized")

        self.initialized = True
        logger.info("Orchestrator initialized successfully")

    async def shutdown(self):
        """Shutdown all services."""
        logger.info("Shutting down orchestrator...")

        if self.gpu_0_manager:
            await self.gpu_0_manager.shutdown()
        if self.gpu_1_manager:
            await self.gpu_1_manager.shutdown()
        if self.redis_client:
            await self.redis_client.close()

        self.initialized = False
        logger.info("Orchestrator shutdown complete")

    async def process_action(
        self,
        player_id: str,
        action_type: str,
        action_data: Dict[str, Any],
    ) -> Dict[str, Any]:
        """
        Process a player action.

        Flow:
        1. Check rate limits
        2. Check cache for similar actions
        3. Route to appropriate GPU(s)
        4. Combine results
        5. Update cache and state
        """
        # Rate limiting
        if not await self.rate_limiter.check_rate_limit(player_id):
            raise ValueError("Rate limit exceeded")

        # Check cache
        cache_key = f"action:{player_id}:{action_type}"
        cached_result = await self.cache_service.get(cache_key)
        if cached_result:
            logger.debug(f"Cache hit for {cache_key}")
            return cached_result

        # Route based on action type
        tasks = []

        # World simulation (GPU 0)
        if action_type in ["move", "explore", "combat", "craft"]:
            if self.gpu_0_manager:
                tasks.append(
                    self._query_world_simulator(player_id, action_type, action_data)
                )
            else:
                tasks.append(self._fallback_world_simulation(action_type, action_data))

        # NPC interaction (GPU 1)
        if action_type in ["talk", "trade", "quest"]:
            if self.gpu_1_manager:
                tasks.append(
                    self._query_npc_engine(player_id, action_type, action_data)
                )
            else:
                tasks.append(self._fallback_npc_response(action_type, action_data))

        # Execute tasks with timeout
        try:
            results = await asyncio.wait_for(
                asyncio.gather(*tasks, return_exceptions=True),
                timeout=self.settings.ACTION_TIMEOUT,
            )
        except asyncio.TimeoutError:
            logger.warning(f"Action timeout for player {player_id}")
            results = [self._fallback_response(action_type)]

        # Combine results
        combined_result = self._combine_results(results)

        # Cache result
        await self.cache_service.set(
            cache_key,
            combined_result,
            ttl=self.settings.CACHE_TTL_SECONDS,
        )

        return combined_result

    async def _query_world_simulator(
        self, player_id: str, action_type: str, action_data: Dict
    ) -> Dict:
        """Query GPU 0 for world simulation."""
        prompt = self._build_world_prompt(player_id, action_type, action_data)
        response = await self.gpu_0_manager.generate(prompt, max_tokens=256)
        return {"type": "world", "response": response}

    async def _query_npc_engine(
        self, player_id: str, action_type: str, action_data: Dict
    ) -> Dict:
        """Query GPU 1 for NPC interaction."""
        prompt = self._build_npc_prompt(player_id, action_type, action_data)
        response = await self.gpu_1_manager.generate(prompt, max_tokens=128)
        return {"type": "npc", "response": response}

    def _build_world_prompt(self, player_id: str, action_type: str, action_data: Dict) -> str:
        """Build prompt for world simulator."""
        return f"""You are the world simulator for an adventure game.
Player: {player_id}
Action: {action_type}
Data: {action_data}

Describe the consequences and world changes from this action."""

    def _build_npc_prompt(self, player_id: str, action_type: str, action_data: Dict) -> str:
        """Build prompt for NPC engine."""
        npc_name = action_data.get("npc", "Unknown")
        return f"""You are {npc_name}, an NPC in an adventure game.
Player {player_id} wants to: {action_type}
Context: {action_data}

Respond in character."""

    async def _fallback_world_simulation(self, action_type: str, action_data: Dict) -> Dict:
        """Fallback when GPU 0 is unavailable."""
        return {
            "type": "world",
            "response": f"You performed {action_type}. The world changes slightly.",
        }

    async def _fallback_npc_response(self, action_type: str, action_data: Dict) -> Dict:
        """Fallback when GPU 1 is unavailable."""
        return {
            "type": "npc",
            "response": "The NPC nods silently.",
        }

    def _fallback_response(self, action_type: str) -> Dict:
        """General fallback response."""
        return {
            "type": "fallback",
            "response": f"Action '{action_type}' processed with basic response.",
        }

    def _combine_results(self, results: List[Dict]) -> Dict:
        """Combine results from multiple sources."""
        combined = {
            "success": True,
            "timestamp": datetime.utcnow().isoformat(),
            "result": "",
            "world_state": None,
            "npc_responses": [],
        }

        for result in results:
            if isinstance(result, Exception):
                logger.error(f"Task failed: {result}")
                continue

            if result.get("type") == "world":
                combined["result"] = result.get("response", "")
            elif result.get("type") == "npc":
                combined["npc_responses"].append(result.get("response", ""))

        return combined

    async def get_player_state(self, player_id: str) -> Optional[Dict]:
        """Get player state from cache/database."""
        # TODO: Implement actual database query
        return {
            "player_id": player_id,
            "username": player_id,
            "level": 1,
            "hp": 100,
            "max_hp": 100,
            "location": "Starting Town",
            "inventory": [],
        }

    async def get_location_info(self, location: str) -> Optional[Dict]:
        """Get location information."""
        # TODO: Implement actual location query
        return {
            "name": location,
            "description": "A mysterious location.",
            "npcs": [],
            "items": [],
        }

    async def get_npcs_at_location(self, location: str) -> List[Dict]:
        """Get NPCs at a location."""
        # TODO: Implement actual NPC query
        return []

    async def get_system_stats(self) -> Dict:
        """Get system statistics."""
        return {
            "active_players": await self._count_active_players(),
            "total_actions": await self._count_total_actions(),
            "gpu_0_status": "online" if self.gpu_0_manager else "offline",
            "gpu_1_status": "online" if self.gpu_1_manager else "offline",
        }

    async def get_all_players(self) -> List[Dict]:
        """Get all active players."""
        # TODO: Implement actual player query
        return []

    async def get_all_npcs(self) -> List[Dict]:
        """Get all NPCs."""
        # TODO: Implement actual NPC query
        return []

    async def get_gpu_metrics(self) -> Dict:
        """Get GPU metrics."""
        metrics = {}
        if self.gpu_0_manager:
            metrics["gpu_0"] = await self.gpu_0_manager.get_metrics()
        if self.gpu_1_manager:
            metrics["gpu_1"] = await self.gpu_1_manager.get_metrics()
        return metrics

    async def get_cache_metrics(self) -> Dict:
        """Get cache metrics."""
        return await self.cache_service.get_metrics()

    async def redis_health_check(self) -> bool:
        """Check Redis health."""
        try:
            await self.redis_client.ping()
            return True
        except:
            return False

    async def gpu_0_health_check(self) -> bool:
        """Check GPU 0 health."""
        if not self.gpu_0_manager:
            return False
        return await self.gpu_0_manager.health_check()

    async def gpu_1_health_check(self) -> bool:
        """Check GPU 1 health."""
        if not self.gpu_1_manager:
            return False
        return await self.gpu_1_manager.health_check()

    async def _count_active_players(self) -> int:
        """Count active players."""
        # TODO: Implement actual count
        return 0

    async def _count_total_actions(self) -> int:
        """Count total actions processed."""
        # TODO: Implement actual count
        return 0


# Singleton instance
_orchestrator: Optional[Orchestrator] = None


def get_orchestrator() -> Orchestrator:
    """Get orchestrator singleton instance."""
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = Orchestrator()
    return _orchestrator
