"""Health check endpoints."""

from fastapi import APIRouter, Depends
from datetime import datetime
from app.core.orchestrator import Orchestrator, get_orchestrator
from app.db.session import DatabaseManager, get_db_manager

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
    }


@router.get("/health/detailed")
async def detailed_health_check(
    orchestrator: Orchestrator = Depends(get_orchestrator),
    db: DatabaseManager = Depends(get_db_manager),
):
    """Detailed health check including all services."""
    health = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {},
    }

    # Check database
    try:
        db_status = await db.health_check()
        health["services"]["database"] = {"status": "healthy" if db_status else "unhealthy"}
    except Exception as e:
        health["services"]["database"] = {"status": "unhealthy", "error": str(e)}

    # Check Redis
    try:
        redis_status = await orchestrator.redis_health_check()
        health["services"]["redis"] = {"status": "healthy" if redis_status else "unhealthy"}
    except Exception as e:
        health["services"]["redis"] = {"status": "unhealthy", "error": str(e)}

    # Check GPU 0
    try:
        gpu0_status = await orchestrator.gpu_0_health_check()
        health["services"]["gpu_0"] = {"status": "healthy" if gpu0_status else "unhealthy"}
    except Exception as e:
        health["services"]["gpu_0"] = {"status": "unhealthy", "error": str(e)}

    # Check GPU 1
    try:
        gpu1_status = await orchestrator.gpu_1_health_check()
        health["services"]["gpu_1"] = {"status": "healthy" if gpu1_status else "unhealthy"}
    except Exception as e:
        health["services"]["gpu_1"] = {"status": "unhealthy", "error": str(e)}

    # Overall status
    all_healthy = all(
        svc.get("status") == "healthy"
        for svc in health["services"].values()
    )
    health["status"] = "healthy" if all_healthy else "degraded"

    return health
