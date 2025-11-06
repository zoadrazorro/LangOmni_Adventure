"""
GPU Manager - Interface to vLLM inference servers.

Handles:
- Connection to vLLM OpenAI-compatible API
- Load balancing for multi-instance setups
- Request queuing and batching
- Health monitoring
- Metrics collection
"""

import asyncio
import logging
from typing import Optional, Dict, Any
from datetime import datetime
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


class GPUManager:
    """Manage GPU inference requests."""

    def __init__(self, gpu_id: str, model_url: str, model_name: str):
        self.gpu_id = gpu_id
        self.model_url = model_url
        self.model_name = model_name
        self.client: Optional[httpx.AsyncClient] = None

        # Metrics
        self.total_requests = 0
        self.failed_requests = 0
        self.total_tokens = 0
        self.total_latency = 0.0

    async def initialize(self):
        """Initialize the GPU manager."""
        self.client = httpx.AsyncClient(
            base_url=self.model_url,
            timeout=httpx.Timeout(30.0, read=60.0),
        )
        logger.info(f"GPU manager {self.gpu_id} initialized with model {self.model_name}")

    async def shutdown(self):
        """Shutdown the GPU manager."""
        if self.client:
            await self.client.aclose()
        logger.info(f"GPU manager {self.gpu_id} shutdown")

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
    )
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 256,
        temperature: float = 0.7,
        top_p: float = 0.9,
    ) -> str:
        """
        Generate text using the LLM.

        Uses OpenAI-compatible API format for vLLM.
        """
        start_time = datetime.utcnow()

        try:
            response = await self.client.post(
                "/v1/completions",
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                    "top_p": top_p,
                    "stream": False,
                },
            )
            response.raise_for_status()

            data = response.json()
            generated_text = data["choices"][0]["text"]

            # Update metrics
            self.total_requests += 1
            self.total_tokens += data.get("usage", {}).get("total_tokens", 0)

            elapsed = (datetime.utcnow() - start_time).total_seconds()
            self.total_latency += elapsed

            logger.debug(
                f"GPU {self.gpu_id} generated {len(generated_text)} chars in {elapsed:.2f}s"
            )

            return generated_text

        except httpx.HTTPError as e:
            self.failed_requests += 1
            logger.error(f"GPU {self.gpu_id} request failed: {e}")
            raise
        except Exception as e:
            self.failed_requests += 1
            logger.error(f"GPU {self.gpu_id} unexpected error: {e}")
            raise

    async def health_check(self) -> bool:
        """Check if the GPU server is healthy."""
        try:
            response = await self.client.get("/health", timeout=5.0)
            return response.status_code == 200
        except:
            return False

    async def get_metrics(self) -> Dict[str, Any]:
        """Get performance metrics."""
        avg_latency = (
            self.total_latency / self.total_requests if self.total_requests > 0 else 0
        )

        return {
            "gpu_id": self.gpu_id,
            "total_requests": self.total_requests,
            "failed_requests": self.failed_requests,
            "success_rate": (
                (self.total_requests - self.failed_requests) / self.total_requests
                if self.total_requests > 0
                else 0
            ),
            "total_tokens": self.total_tokens,
            "avg_latency": avg_latency,
        }
