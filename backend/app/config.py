"""Application configuration."""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    LOG_LEVEL: str = "info"
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:80"

    # Database
    DATABASE_URL: str = "postgresql://langomni_user:changeme@localhost:5432/langomni_adventure"

    # Redis
    REDIS_URL: str = "redis://localhost:6379"

    # Qdrant Vector DB
    QDRANT_URL: str = "http://localhost:6333"

    # GPU Configuration
    GPU_0_ENABLED: bool = False
    GPU_1_ENABLED: bool = False
    VLLM_GPU_0_URL: str = "http://localhost:8001"
    VLLM_GPU_1_URL: str = "http://localhost:8002"

    # vLLM Settings for GPU 0 (World Simulator)
    VLLM_GPU_0_MODEL: str = "meta-llama/Llama-3.1-70B-Instruct"
    VLLM_GPU_0_QUANTIZATION: str = "awq"
    VLLM_GPU_0_MAX_MODEL_LEN: int = 4096
    VLLM_GPU_0_GPU_MEMORY_UTILIZATION: float = 0.90

    # vLLM Settings for GPU 1 (NPC Engine)
    VLLM_GPU_1_MODEL: str = "meta-llama/Llama-3.1-8B-Instruct"
    VLLM_GPU_1_QUANTIZATION: str = "awq"
    VLLM_GPU_1_MAX_MODEL_LEN: int = 2048
    VLLM_GPU_1_GPU_MEMORY_UTILIZATION: float = 0.90

    # Game Configuration
    MAX_CONCURRENT_PLAYERS: int = 80
    ACTION_TIMEOUT: float = 5.0
    RATE_LIMIT_PER_PLAYER: int = 4
    CACHE_TTL_SECONDS: int = 300

    # JWT Secret
    JWT_SECRET: str = "your_jwt_secret_here_change_in_production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    # Admin Credentials
    ADMIN_USERNAME: str = "admin"
    ADMIN_PASSWORD: str = "changeme_in_production"

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
