"""Admin API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.core.orchestrator import Orchestrator, get_orchestrator

router = APIRouter()


@router.get("/stats")
async def get_system_stats(
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get system statistics."""
    stats = await orchestrator.get_system_stats()
    return stats


@router.get("/players")
async def get_all_players(
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get all active players."""
    players = await orchestrator.get_all_players()
    return {"players": players, "count": len(players)}


@router.get("/npcs")
async def get_all_npcs(
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get all NPCs."""
    npcs = await orchestrator.get_all_npcs()
    return {"npcs": npcs, "count": len(npcs)}


@router.get("/metrics/gpu")
async def get_gpu_metrics(
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get GPU performance metrics."""
    metrics = await orchestrator.get_gpu_metrics()
    return metrics


@router.get("/metrics/cache")
async def get_cache_metrics(
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get cache performance metrics."""
    metrics = await orchestrator.get_cache_metrics()
    return metrics
