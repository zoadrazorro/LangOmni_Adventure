# LangOmni Adventure - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Docker and Docker Compose installed
- 32GB+ RAM
- (Optional) AMD Radeon 7900 XT GPUs with ROCm for full functionality

## Option 1: Infrastructure Only (No GPU)

Perfect for testing the frontend and backend without LLM inference.

```bash
# 1. Clone and setup
git clone <your-repo-url>
cd LangOmni_Adventure
cp .env.example .env

# 2. Start all services (without GPU servers)
docker-compose up -d

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
# Grafana: http://localhost:3001 (admin/admin)
```

The backend will use fallback responses instead of GPU inference.

## Option 2: Full Setup with GPUs

Complete setup with LLM inference.

```bash
# 1. Install dependencies
make install

# 2. Download models (one-time, ~45GB download)
make models

# 3. Start infrastructure
docker-compose up -d redis postgres qdrant

# 4. Start GPU servers (requires ROCm)
make gpu-start

# 5. Start backend and frontend
make dev
```

## Common Commands

```bash
# Start everything in dev mode
make dev

# Start infrastructure only
docker-compose up -d

# View logs
docker-compose logs -f

# Stop everything
make down

# Clean up
make clean
```

## Testing the System

### 1. Check Health
```bash
curl http://localhost:8000/api/health/detailed
```

### 2. Process an Action
```bash
curl -X POST http://localhost:8000/api/game/action \
  -H "Content-Type: application/json" \
  -d '{
    "player_id": "test_player",
    "action_type": "explore",
    "action_data": {}
  }'
```

### 3. WebSocket Test
Open browser console at http://localhost:3000 and run:
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/game/test_player');
ws.onmessage = (event) => console.log(JSON.parse(event.data));
ws.send(JSON.stringify({type: 'ping'}));
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
sudo lsof -i :8000

# Kill the process or change the port in .env
```

### Docker Issues
```bash
# Clean restart
docker-compose down -v
docker-compose up -d
```

### GPU Server Issues
```bash
# Check GPU status
rocm-smi

# View GPU server logs
tail -f logs/gpu_0.log
```

## Next Steps

1. **Explore the Admin Panel**: http://localhost:3000
2. **Read the Architecture**: docs/ARCHITECTURE.md
3. **Check the API Docs**: http://localhost:8000/docs
4. **View Metrics**: http://localhost:3001 (Grafana)
5. **Start Developing**: See CONTRIBUTING.md

## Support

- Issues: https://github.com/yourusername/LangOmni_Adventure/issues
- Docs: docs/ directory
- Examples: See API.md for request examples

Happy adventuring! 🎮✨
