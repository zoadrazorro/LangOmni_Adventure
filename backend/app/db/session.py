"""Database session management."""

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

Base = declarative_base()


class DatabaseManager:
    """Manage database connections and sessions."""

    def __init__(self):
        self.engine = None
        self.session_factory = None

    async def initialize(self):
        """Initialize database engine and session factory."""
        # Convert postgres:// to postgresql+asyncpg://
        db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

        self.engine = create_async_engine(
            db_url,
            echo=False,
            pool_size=20,
            max_overflow=40,
            pool_pre_ping=True,
        )

        self.session_factory = async_sessionmaker(
            self.engine,
            class_=AsyncSession,
            expire_on_commit=False,
        )

        logger.info("Database manager initialized")

    async def close(self):
        """Close database connections."""
        if self.engine:
            await self.engine.dispose()
        logger.info("Database connections closed")

    async def health_check(self) -> bool:
        """Check database health."""
        try:
            async with self.session_factory() as session:
                await session.execute("SELECT 1")
            return True
        except:
            return False

    def get_session(self) -> AsyncSession:
        """Get a new database session."""
        return self.session_factory()


# Singleton instance
_db_manager: Optional[DatabaseManager] = None


def get_db_manager() -> DatabaseManager:
    """Get database manager singleton."""
    global _db_manager
    if _db_manager is None:
        _db_manager = DatabaseManager()
    return _db_manager


async def get_db() -> AsyncSession:
    """Dependency to get database session."""
    db_manager = get_db_manager()
    async with db_manager.get_session() as session:
        yield session
