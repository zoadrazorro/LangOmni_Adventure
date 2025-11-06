#!/bin/bash
# Stop all GPU inference servers

echo "Stopping all GPU inference servers..."

pkill -f "vllm.entrypoints.openai.api_server"

echo "All GPU servers stopped."
