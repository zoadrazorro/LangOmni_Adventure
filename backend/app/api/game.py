"""Game API endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.core.orchestrator import Orchestrator, get_orchestrator

router = APIRouter()


class ActionRequest(BaseModel):
    """Player action request."""
    player_id: str
    action_type: str
    action_data: dict


class ActionResponse(BaseModel):
    """Action response."""
    success: bool
    result: str
    world_state: Optional[dict] = None
    npc_responses: Optional[List[dict]] = None


class PlayerStats(BaseModel):
    """Player statistics."""
    player_id: str
    username: str
    level: int
    hp: int
    max_hp: int
    location: str
    inventory: List[dict]


@router.post("/action", response_model=ActionResponse)
async def perform_action(
    action: ActionRequest,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """
    Process a player action.

    This endpoint:
    1. Validates the action
    2. Routes to appropriate GPU(s)
    3. Combines world simulation + NPC responses
    4. Updates game state
    """
    try:
        result = await orchestrator.process_action(
            player_id=action.player_id,
            action_type=action.action_type,
            action_data=action.action_data,
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail="Action timed out")
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/player/{player_id}", response_model=PlayerStats)
async def get_player_stats(
    player_id: str,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get player statistics and state."""
    player_data = await orchestrator.get_player_state(player_id)
    if not player_data:
        raise HTTPException(status_code=404, detail="Player not found")
    return player_data


@router.get("/world/{location}")
async def get_location_info(
    location: str,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get information about a location."""
    location_data = await orchestrator.get_location_info(location)
    if not location_data:
        raise HTTPException(status_code=404, detail="Location not found")
    return location_data


@router.get("/npcs/{location}")
async def get_npcs_at_location(
    location: str,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """Get NPCs at a specific location."""
    npcs = await orchestrator.get_npcs_at_location(location)
    return {"location": location, "npcs": npcs}
