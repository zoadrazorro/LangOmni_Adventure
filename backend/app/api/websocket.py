"""WebSocket endpoints for real-time communication."""

import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Set
from app.core.orchestrator import Orchestrator, get_orchestrator

router = APIRouter()
logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manage WebSocket connections."""

    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
        self.player_connections: Dict[str, str] = {}  # player_id -> connection_id

    async def connect(self, websocket: WebSocket, player_id: str) -> str:
        """Accept and register a new connection."""
        await websocket.accept()
        connection_id = f"{player_id}_{id(websocket)}"
        self.active_connections[connection_id] = websocket
        self.player_connections[player_id] = connection_id
        logger.info(f"Player {player_id} connected (connection {connection_id})")
        return connection_id

    def disconnect(self, connection_id: str, player_id: str):
        """Remove a connection."""
        if connection_id in self.active_connections:
            del self.active_connections[connection_id]
        if player_id in self.player_connections:
            del self.player_connections[player_id]
        logger.info(f"Player {player_id} disconnected (connection {connection_id})")

    async def send_personal_message(self, message: dict, player_id: str):
        """Send a message to a specific player."""
        connection_id = self.player_connections.get(player_id)
        if connection_id and connection_id in self.active_connections:
            websocket = self.active_connections[connection_id]
            await websocket.send_json(message)

    async def broadcast(self, message: dict):
        """Broadcast a message to all connected players."""
        disconnected = []
        for connection_id, websocket in self.active_connections.items():
            try:
                await websocket.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to {connection_id}: {e}")
                disconnected.append(connection_id)

        # Clean up disconnected clients
        for connection_id in disconnected:
            if connection_id in self.active_connections:
                del self.active_connections[connection_id]


manager = ConnectionManager()


@router.websocket("/game/{player_id}")
async def game_websocket(
    websocket: WebSocket,
    player_id: str,
    orchestrator: Orchestrator = Depends(get_orchestrator),
):
    """
    WebSocket endpoint for real-time game communication.

    Message format:
    {
        "type": "action",
        "data": {
            "action_type": "move",
            "action_data": {...}
        }
    }
    """
    connection_id = await manager.connect(websocket, player_id)

    try:
        # Send welcome message
        await websocket.send_json({
            "type": "connected",
            "message": f"Welcome to LangOmni Adventure, {player_id}!",
            "player_id": player_id,
        })

        # Main message loop
        while True:
            try:
                # Receive message from client
                data = await websocket.receive_json()

                message_type = data.get("type")

                if message_type == "ping":
                    # Handle ping/pong for connection health
                    await websocket.send_json({"type": "pong"})

                elif message_type == "action":
                    # Process game action
                    action_data = data.get("data", {})
                    action_type = action_data.get("action_type")

                    # Send acknowledgment
                    await websocket.send_json({
                        "type": "action_received",
                        "action_type": action_type,
                    })

                    # Process action through orchestrator
                    result = await orchestrator.process_action(
                        player_id=player_id,
                        action_type=action_type,
                        action_data=action_data.get("action_data", {}),
                    )

                    # Send result back to player
                    await websocket.send_json({
                        "type": "action_result",
                        "result": result,
                    })

                    # Broadcast to other players if needed
                    if result.get("broadcast"):
                        await manager.broadcast({
                            "type": "game_event",
                            "event": result.get("broadcast"),
                        })

                elif message_type == "chat":
                    # Handle chat messages
                    chat_message = data.get("message", "")
                    await manager.broadcast({
                        "type": "chat",
                        "player_id": player_id,
                        "message": chat_message,
                    })

                else:
                    logger.warning(f"Unknown message type: {message_type}")

            except json.JSONDecodeError:
                await websocket.send_json({
                    "type": "error",
                    "message": "Invalid JSON format",
                })

    except WebSocketDisconnect:
        manager.disconnect(connection_id, player_id)
        await manager.broadcast({
            "type": "player_disconnected",
            "player_id": player_id,
        })

    except Exception as e:
        logger.error(f"WebSocket error for player {player_id}: {e}", exc_info=True)
        manager.disconnect(connection_id, player_id)
