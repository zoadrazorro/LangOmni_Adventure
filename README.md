# LangOmni Adventure

An infinite quest in the weird world of LangOmni, a pocket dimension where dreams are born.

## 🏗️ Architecture

A high-performance multiplayer LLM adventure game powered by dual AMD Radeon 7900 XT GPUs, capable of serving 50-80 concurrent players with rich, contextual AI-generated content.

### System Components

- **GPU 0**: World Simulator (Llama 3.1 70B 4-bit) - Physics, environment, consequences
- **GPU 1**: NPC Engine (4x Llama 3.1 8B instances) - Character interactions and dialogue
- **Central Orchestrator**: FastAPI + asyncio for request routing and GPU load balancing
- **Redis Cluster**: Hot state cache, pub/sub, rate limiting
- **PostgreSQL + TimescaleDB**: Persistent world state, player data, event logging
- **Qdrant Vector DB**: Semantic memory for NPCs, context retrieval
- **WebSocket Gateway**: Real-time player connections (5000+ concurrent)
- **CPU Workers**: 16-core AMD 7950X for game logic, validation, orchestration

### Performance Metrics

- **Player Capacity**: 50-80 concurrent players
- **Avg Response Time**: 1.5-3 seconds
- **P95 Response Time**: < 5 seconds
- **Actions/Second**: 25-40 total throughput
- **Uptime Target**: 99.9%

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- 32GB+ RAM (64GB recommended)
- AMD Radeon 7900 XT (2x) or similar GPUs
- AMD ROCm 6.0+ (for GPU inference)
- Node.js 20+ (for frontend development)
- Python 3.11+ (for backend development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/LangOmni_Adventure.git
   cd LangOmni_Adventure
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Start infrastructure services**
   ```bash
   docker-compose up -d redis postgres qdrant
   ```

4. **Set up GPU inference servers**

   For GPU 0 (World Simulator):
   ```bash
   python -m vllm.entrypoints.openai.api_server \
     --model meta-llama/Llama-3.1-70B-Instruct \
     --quantization awq \
     --dtype auto \
     --gpu-memory-utilization 0.90 \
     --max-model-len 4096 \
     --port 8001
   ```

   For GPU 1 (NPC Engine - run 4 instances on different ports):
   ```bash
   # Instance 1
   CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
     --model meta-llama/Llama-3.1-8B-Instruct \
     --quantization awq \
     --port 8002 &

   # Instances 2-4 on ports 8003-8005...
   ```

5. **Start the backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. **Start the frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

7. **Access the application**
   - Game Server: http://localhost:8000
   - Admin Panel: http://localhost:3000
   - Grafana Dashboards: http://localhost:3001
   - Prometheus Metrics: http://localhost:9090

## 📁 Project Structure

```
LangOmni_Adventure/
├── frontend/                 # React admin panel & architecture viewer
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Utilities and helpers
│   │   ├── hooks/           # React hooks
│   │   └── types/           # TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                 # FastAPI game server
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── core/           # Core orchestrator logic
│   │   ├── models/         # Database models
│   │   ├── services/       # Business logic
│   │   ├── gpu/            # GPU manager & vLLM integration
│   │   └── db/             # Database utilities
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker/                 # Docker configurations
│   ├── nginx/
│   ├── prometheus/
│   └── grafana/
│
├── docs/                   # Documentation
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🎮 Game Features

### Dynamic World Generation
- Procedural dungeon generation powered by GPU 0
- Weather systems that affect gameplay
- Day/night cycles with NPC behavior changes
- Economy simulation based on player actions

### Advanced NPC Intelligence
- Long-term memory via vector embeddings
- Relationship tracking between NPCs
- Personality consistency across sessions
- NPCs remember player reputation and past interactions

### Multiplayer Features
- Real-time collaborative quests
- Player-to-player trading system
- Guild creation with shared resources
- PvP combat zones with rankings

### Performance Optimizations
- Speculative decoding for common actions
- KV-cache persistence across requests
- Prompt compression (40% token reduction)
- Dynamic batch sizing based on load
- Smart caching with probabilistic invalidation

## 🔧 Development

### Backend Development
```bash
cd backend
python -m pytest tests/
python -m black app/
python -m ruff check app/
```

### Frontend Development
```bash
cd frontend
npm run test
npm run lint
npm run build
```

## 📊 Monitoring

Access Grafana at http://localhost:3001 to view:
- GPU utilization and inference times
- Player connection metrics
- Request latency (P50, P95, P99)
- Cache hit rates
- Database query performance
- WebSocket connection health

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with FastAPI, React, and vLLM
- Powered by Llama 3.1 models from Meta
- Inspired by classic text adventures and modern MMORPGs
