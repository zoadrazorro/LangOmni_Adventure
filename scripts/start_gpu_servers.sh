#!/bin/bash
# Start all GPU inference servers for LangOmni Adventure

set -e

echo "Starting GPU inference servers..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if models exist
if [ ! -d "models" ]; then
    echo "Error: models directory not found. Please download models first."
    exit 1
fi

# Start GPU 0 (World Simulator)
echo "Starting GPU 0: World Simulator on port 8001..."
CUDA_VISIBLE_DEVICES=0 python -m vllm.entrypoints.openai.api_server \
    --model "${VLLM_GPU_0_MODEL}" \
    --quantization "${VLLM_GPU_0_QUANTIZATION}" \
    --dtype auto \
    --gpu-memory-utilization "${VLLM_GPU_0_GPU_MEMORY_UTILIZATION}" \
    --max-model-len "${VLLM_GPU_0_MAX_MODEL_LEN}" \
    --port 8001 \
    --host 0.0.0.0 \
    > logs/gpu_0.log 2>&1 &

GPU_0_PID=$!
echo "GPU 0 started with PID: $GPU_0_PID"

# Start GPU 1 instances (NPC Engine)
echo "Starting GPU 1: NPC Engine (4 instances)..."

for port in {8002..8005}; do
    echo "  Starting instance on port $port..."
    CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
        --model "${VLLM_GPU_1_MODEL}" \
        --quantization "${VLLM_GPU_1_QUANTIZATION}" \
        --dtype auto \
        --gpu-memory-utilization 0.22 \
        --max-model-len "${VLLM_GPU_1_MAX_MODEL_LEN}" \
        --port "$port" \
        --host 0.0.0.0 \
        > "logs/gpu_1_instance_$port.log" 2>&1 &

    echo "  Instance started with PID: $!"
    sleep 2
done

echo ""
echo "All GPU servers started successfully!"
echo "GPU 0: http://localhost:8001"
echo "GPU 1: http://localhost:8002-8005"
echo ""
echo "Logs are in the logs/ directory"
echo "To stop all servers, run: ./scripts/stop_gpu_servers.sh"
