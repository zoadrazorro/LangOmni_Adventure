# API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Currently, most endpoints are open. For production, implement JWT authentication.

## Endpoints

### Health Checks

#### GET /api/health

Basic health check

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET /api/health/detailed

Detailed health check including all services

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "services": {
    "database": {"status": "healthy"},
    "redis": {"status": "healthy"},
    "gpu_0": {"status": "healthy"},
    "gpu_1": {"status": "healthy"}
  }
}
```

### Game Actions

#### POST /api/game/action

Process a player action

**Request Body**:
```json
{
  "player_id": "player_123",
  "action_type": "talk",
  "action_data": {
    "npc": "Elder Zorathian",
    "message": "Hello!"
  }
}
```

**Response**:
```json
{
  "success": true,
  "result": "The elder greets you warmly...",
  "world_state": {},
  "npc_responses": [
    {
      "npc": "Elder Zorathian",
      "response": "Greetings, traveler!",
      "emotion": "friendly"
    }
  ]
}
```

**Action Types**:
- `move`: Move to a new location
- `explore`: Explore current location
- `talk`: Talk to an NPC
- `trade`: Trade with a merchant
- `combat`: Initiate combat
- `craft`: Craft an item
- `quest`: Quest-related actions

#### GET /api/game/player/{player_id}

Get player statistics

**Response**:
```json
{
  "player_id": "player_123",
  "username": "DragonSlayer42",
  "level": 15,
  "hp": 85,
  "max_hp": 100,
  "location": "Crystal Caverns",
  "inventory": [
    {
      "item": "Health Potion",
      "quantity": 3
    }
  ]
}
```

#### GET /api/game/world/{location}

Get location information

**Response**:
```json
{
  "name": "Crystal Caverns",
  "description": "A mysterious cave filled with glowing crystals.",
  "npcs": ["Cave Dweller", "Mysterious Spirit"],
  "items": ["Crystal Shard"],
  "connected_locations": ["Forest Path", "Underground Lake"]
}
```

#### GET /api/game/npcs/{location}

Get NPCs at a specific location

**Response**:
```json
{
  "location": "Starting Town",
  "npcs": [
    {
      "name": "Elder Zorathian",
      "type": "quest_giver",
      "available_quests": ["The Lost Artifact"]
    },
    {
      "name": "Blacksmith Gornak",
      "type": "merchant",
      "shop_items": ["Iron Sword", "Steel Armor"]
    }
  ]
}
```

### Admin Endpoints

#### GET /api/admin/stats

Get system statistics

**Response**:
```json
{
  "active_players": 42,
  "total_actions": 1247,
  "gpu_0_status": "online",
  "gpu_1_status": "online",
  "uptime_seconds": 86400
}
```

#### GET /api/admin/players

Get all active players

**Response**:
```json
{
  "players": [
    {
      "player_id": "player_123",
      "username": "DragonSlayer42",
      "level": 15,
      "location": "Crystal Caverns",
      "online": true
    }
  ],
  "count": 1
}
```

#### GET /api/admin/npcs

Get all NPCs

**Response**:
```json
{
  "npcs": [
    {
      "id": "npc_001",
      "name": "Elder Zorathian",
      "type": "quest_giver",
      "location": "Starting Town",
      "conversation_count": 127,
      "memory_vectors": 12453
    }
  ],
  "count": 1
}
```

#### GET /api/admin/metrics/gpu

Get GPU performance metrics

**Response**:
```json
{
  "gpu_0": {
    "total_requests": 1523,
    "failed_requests": 3,
    "success_rate": 0.998,
    "total_tokens": 284561,
    "avg_latency": 2.1
  },
  "gpu_1": {
    "total_requests": 2847,
    "failed_requests": 12,
    "success_rate": 0.996,
    "total_tokens": 421893,
    "avg_latency": 1.4
  }
}
```

#### GET /api/admin/metrics/cache

Get cache performance metrics

**Response**:
```json
{
  "hits": 8521,
  "misses": 1479,
  "hit_rate": 85.2,
  "total_requests": 10000
}
```

## WebSocket API

### Connection

Connect to: `ws://localhost:8000/ws/game/{player_id}`

### Message Format

All messages are JSON.

#### Client → Server

**Ping**:
```json
{
  "type": "ping"
}
```

**Action**:
```json
{
  "type": "action",
  "data": {
    "action_type": "move",
    "action_data": {
      "destination": "Forest Path"
    }
  }
}
```

**Chat**:
```json
{
  "type": "chat",
  "message": "Hello everyone!"
}
```

#### Server → Client

**Pong**:
```json
{
  "type": "pong"
}
```

**Connection Confirmation**:
```json
{
  "type": "connected",
  "message": "Welcome to LangOmni Adventure, DragonSlayer42!",
  "player_id": "player_123"
}
```

**Action Received**:
```json
{
  "type": "action_received",
  "action_type": "move"
}
```

**Action Result**:
```json
{
  "type": "action_result",
  "result": {
    "success": true,
    "result": "You move to Forest Path...",
    "world_state": {...},
    "npc_responses": [...]
  }
}
```

**Game Event** (broadcast to all):
```json
{
  "type": "game_event",
  "event": {
    "type": "player_joined",
    "player": "NewPlayer123",
    "location": "Starting Town"
  }
}
```

**Chat Message** (broadcast):
```json
{
  "type": "chat",
  "player_id": "player_123",
  "message": "Hello everyone!"
}
```

**Error**:
```json
{
  "type": "error",
  "message": "Invalid JSON format"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message here"
}
```

**HTTP Status Codes**:
- `400`: Bad Request (invalid input)
- `404`: Not Found (player, location, or NPC not found)
- `429`: Too Many Requests (rate limit exceeded)
- `500`: Internal Server Error
- `504`: Gateway Timeout (action took too long)

## Rate Limiting

- **Per Player**: 4 actions/second
- **Per IP**: 10 API requests/second
- **WebSocket**: 5 connections/second per IP

Rate limit headers:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 8
X-RateLimit-Reset: 1610712000
```

## Pagination

For endpoints returning lists (future implementation):

**Request**:
```
GET /api/admin/players?page=1&limit=50
```

**Response**:
```json
{
  "items": [...],
  "total": 150,
  "page": 1,
  "limit": 50,
  "pages": 3
}
```

## Metrics Endpoint

Prometheus-compatible metrics are exposed at:

```
GET /metrics
```

**Sample Metrics**:
```
# HELP langomni_requests_total Total number of requests
# TYPE langomni_requests_total counter
langomni_requests_total{method="POST",endpoint="/api/game/action"} 1523

# HELP langomni_request_duration_seconds Request duration
# TYPE langomni_request_duration_seconds histogram
langomni_request_duration_seconds_bucket{le="0.5"} 1200
langomni_request_duration_seconds_bucket{le="1.0"} 1450
langomni_request_duration_seconds_bucket{le="5.0"} 1520

# HELP langomni_active_players Number of active players
# TYPE langomni_active_players gauge
langomni_active_players 42
```
