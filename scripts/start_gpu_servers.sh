#!/bin/bash
# Start all Ollama inference servers for LangOmni Adventure

set -e

echo "Starting Ollama inference servers..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Error: Ollama not found. Please install Ollama first."
    echo "Visit: https://ollama.ai/download"
    exit 1
fi

# Create logs directory
mkdir -p logs

# Start GPU 0 (World Simulator) on default port 11434
echo "Starting GPU 0: World Simulator on port 11434..."
ollama serve > logs/gpu_0.log 2>&1 &
GPU_0_PID=$!
echo "GPU 0 started with PID: $GPU_0_PID"
sleep 2

# Start GPU 1 (NPC Engine) on port 11435
echo "Starting GPU 1: NPC Engine on port 11435..."
OLLAMA_HOST=0.0.0.0:11435 ollama serve > logs/gpu_1.log 2>&1 &
GPU_1_PID=$!
echo "GPU 1 started with PID: $GPU_1_PID"
sleep 2

echo ""
echo "All Ollama servers started successfully!"
echo "GPU 0: http://localhost:11434"
echo "GPU 1: http://localhost:11435"
echo ""
echo "Logs are in the logs/ directory"
echo "To stop all servers, run: ./scripts/stop_gpu_servers.sh"
