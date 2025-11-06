# LangOmni Adventure - Architecture Documentation

## System Overview

LangOmni Adventure is a high-performance multiplayer LLM-powered adventure game server designed to leverage dual AMD Radeon 7900 XT GPUs for maximum throughput and player capacity.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Players                              │
│                    (WebSocket Clients)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Load Balancer                       │
│              (Rate Limiting, SSL Termination)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   WebSocket Gateway                          │
│            (FastAPI WebSockets, 5000+ conns)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│               Central Orchestrator (Brain)                   │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  • Request routing & prioritization                  │    │
│  │  • GPU load balancing                                │    │
│  │  • Timeout handling (5s limit)                       │    │
│  │  • Fallback systems                                  │    │
│  │  • Player session management                         │    │
│  └─────────────────────────────────────────────────────┘    │
└────┬───────────────────┬─────────────────┬──────────────────┘
     │                   │                 │
     ▼                   ▼                 ▼
┌─────────┐      ┌──────────────┐   ┌─────────────────┐
│ GPU 0   │      │   GPU 1      │   │  Redis Cluster  │
│ World   │      │   NPC        │   │  ┌───────────┐  │
│ Sim     │      │   Engine     │   │  │ Cache     │  │
│         │      │              │   │  │ Pub/Sub   │  │
│ Llama   │      │ Llama        │   │  │ Rate Lim  │  │
│ 70B     │      │ 8B           │   │  │ Sessions  │  │
│         │      │              │   │  └───────────┘  │
│ ~18GB   │      │ ~4GB         │   └─────────────────┘
│         │      │              │
│ Ollama  │      │ Ollama       │
└────┬────┘      └──────┬───────┘
     │                  │
     └─────────┬────────┘
               ▼
     ┌─────────────────────┐
     │  Persistence Layer  │
     ├─────────────────────┤
     │ PostgreSQL +        │
     │ TimescaleDB         │
     │ (World state,       │
     │  player data,       │
     │  events)            │
     ├─────────────────────┤
     │ Qdrant Vector DB    │
     │ (NPC memory,        │
     │  semantic search)   │
     └─────────────────────┘
```

## Component Details

### 1. WebSocket Gateway

**Purpose**: Real-time bidirectional communication with players

**Technology**:
- FastAPI WebSockets
- Nginx for load balancing
- Connection pooling

**Capacity**: 5000+ concurrent connections

**Features**:
- Sub-100ms latency for player input
- Automatic reconnection handling
- Message compression
- Server-sent events for broadcasts

### 2. Central Orchestrator

**Purpose**: Brain of the operation - coordinates all system components

**Responsibilities**:
- Route player actions to appropriate GPU(s)
- Manage GPU load balancing (round-robin for GPU 1 instances)
- Handle timeouts (5s hard limit)
- Implement fallback to rule-based systems
- Manage player sessions
- Coordinate multi-GPU queries for complex actions

**Technology**: Python asyncio + FastAPI

### 3. GPU 0: World Simulator

**Model**: Llama 3.1 70B Instruct

**VRAM**: ~18GB

**Performance**: 15-25 tokens/sec

**Batch Size**: Handled by Ollama

**Responsibilities**:
- Physics simulation
- Environment changes
- Action consequences
- Procedural generation
- Weather systems
- World state updates

**Framework**: Ollama

### 4. GPU 1: NPC Engine

**Setup**: Single instance deployment

**Models**: Llama 3.1 8B Instruct

**VRAM**: ~4GB

**Performance**: 30-40 tokens/sec

**Responsibilities**:
- NPC dialogue generation
- Character personality injection
- Relationship tracking
- Quest interaction
- Memory retrieval from vector DB

### 5. Redis Cluster

**Purpose**: Hot state cache and real-time coordination

**Use Cases**:
- Player positions, HP, inventory (hot data)
- GPU result queue (pub/sub pattern)
- Rate limiting (per-player action throttle)
- WebSocket session store
- Real-time event broadcasting

**Configuration**:
- 2GB max memory
- LRU eviction policy
- AOF persistence for critical data

### 6. PostgreSQL + TimescaleDB

**Purpose**: Persistent world state and historical data

**Schema**:
- Player profiles & progression
- NPC definitions & relationship graphs
- Quest chains & completion tracking
- Conversation history
- World locations & connections
- Time-series event logging (TimescaleDB hypertables)

**Features**:
- Full-text search for world content
- Connection pooling (20 base, 40 max overflow)
- Async queries via asyncpg

### 7. Qdrant Vector Database

**Purpose**: Semantic memory for NPCs and context retrieval

**Data**:
- NPC memory embeddings (10k+ vectors per major NPC)
- Player action history embeddings
- Similar situation lookup for context
- Dynamic prompt augmentation

**Integration**: Used by GPU 1 to retrieve relevant memories before generating NPC responses

## Request Flow

### Typical Action Flow

1. **Player sends action** via WebSocket
   ```json
   {
     "type": "action",
     "data": {
       "action_type": "talk",
       "npc": "Elder Zorathian",
       "message": "Tell me about the ancient prophecy"
     }
   }
   ```

2. **WebSocket Gateway** receives and validates

3. **Orchestrator** processes:
   - Checks rate limits (4 actions/sec per player)
   - Checks cache for similar recent actions
   - Determines routing:
     - "talk" → GPU 1 (NPC Engine)
     - Also queries Qdrant for NPC memories

4. **GPU 1** generates response:
   - Retrieves NPC personality from database
   - Gets relevant memories from Qdrant
   - Generates contextual response
   - Returns in ~1-2 seconds

5. **Orchestrator** post-processing:
   - Updates NPC conversation count
   - Stores interaction in database
   - Creates memory embedding (background task)
   - Caches response (5 min TTL)

6. **WebSocket Gateway** sends response to player
   ```json
   {
     "type": "action_result",
     "result": {
       "npc_response": "Ah, the prophecy... it speaks of...",
       "npc_emotion": "thoughtful",
       "relationship_change": +2
     }
   }
   ```

### Complex Action Flow (Combat)

When a player initiates combat:

1. **Parallel GPU queries**:
   - GPU 0: "Simulate combat physics and damage"
   - GPU 1: "Generate enemy taunts/responses"

2. **Results combined** by orchestrator

3. **Broadcast** to nearby players via WebSocket

## Performance Optimizations

### 1. Inference Optimization

- **Speculative decoding**: Pre-compute common action templates
- **KV-cache persistence**: Reuse attention cache across requests
- **Prompt compression**: Reduce tokens by 40% via summarization
- **Pre-computed embeddings**: Cache location/NPC descriptions
- **Dynamic batch sizing**: Adjust based on queue depth

### 2. Concurrency Strategy

- **Priority queue**: Combat > Dialogue > Exploration
- **Async everything**: Zero blocking I/O
- **Connection pooling**: Database and HTTP clients
- **Background tasks**: Non-critical updates (analytics, embeddings)

### 3. Smart Caching

| Data Type | Cache Location | TTL | Invalidation |
|-----------|---------------|-----|--------------|
| Player position | Redis | 30s | On movement |
| Location descriptions | Redis | 5 min | Manual |
| NPC greetings | Redis | 10 min | On personality change |
| World rules | In-memory | Permanent | On server restart |
| Player last actions | Redis | 60s | Rolling window |

### 4. Fallback Systems

| Condition | Fallback | Example |
|-----------|----------|---------|
| GPU queue > 3s | Template response | "The NPC nods thoughtfully" |
| GPU offline | Rule-based AI | Simple state machine responses |
| Database slow | Read-through cache | Serve stale data with warning |
| Vector DB down | Skip memory retrieval | Generic NPC personality |

## Scalability Considerations

### Current Capacity

- **50-80 concurrent players**
- **25-40 actions/second** total throughput
- **P95 response time**: < 5 seconds
- **P50 response time**: 1.5-3 seconds

### Bottlenecks

1. **GPU inference speed** (primary bottleneck)
2. **Redis memory** (mitigated via LRU eviction)
3. **PostgreSQL writes** (mitigated via batching)

### Scaling Strategies

**Horizontal Scaling** (future):
- Add more GPU 1 instances (NPC engine scales linearly)
- Multiple GPU 0 instances with consistent hashing
- Redis cluster with sharding
- Database read replicas

**Vertical Scaling**:
- Upgrade to 7900 XTX (24GB → more batch capacity)
- More CPU cores for orchestration
- Faster NVMe for database

## Monitoring & Observability

### Metrics Collected

**System Level**:
- CPU usage per core
- GPU memory utilization
- GPU temperature
- Network throughput

**Application Level**:
- Request latency (P50, P95, P99)
- GPU queue depth
- Cache hit rate
- WebSocket connection count
- Active player count
- Actions per second

**Business Level**:
- Player session duration
- Quest completion rate
- NPC interaction frequency
- Player retention

### Dashboards

1. **System Health**: CPU, GPU, memory, disk
2. **Performance**: Latency distributions, throughput
3. **Player Analytics**: Active users, engagement metrics
4. **GPU Utilization**: Batch sizes, queue depth, token/sec

### Alerting

- GPU temperature > 85°C
- Response time P95 > 8s
- Cache hit rate < 60%
- Database connection pool exhausted
- WebSocket disconnects > 10/min

## Security Considerations

### Authentication

- JWT tokens for API access
- WebSocket connection requires valid token
- Admin endpoints protected with additional auth layer

### Rate Limiting

- Per-player: 4 actions/second
- Per-IP: 10 API requests/second
- WebSocket: 5 connections/second per IP

### Input Validation

- All player input sanitized
- Action data validated against schemas
- Prompt injection prevention for LLM queries

### Data Protection

- Player passwords hashed with bcrypt
- Sensitive data encrypted at rest
- SSL/TLS for all external connections

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## API Documentation

See [API.md](./API.md) for complete API reference.

## Future Enhancements

1. **Persistent player sessions** across server restarts
2. **Voice chat integration** via WebRTC
3. **Mobile client** support
4. **Advanced quest system** with branching narratives
5. **Player-created content** (user-generated quests, items)
6. **Distributed world simulation** across multiple GPU 0 instances
7. **Machine learning** for player behavior prediction
8. **Blockchain integration** for item ownership (optional)
