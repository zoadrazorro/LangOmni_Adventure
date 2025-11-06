#!/bin/bash
# Stop all Ollama inference servers

echo "Stopping all Ollama inference servers..."

pkill -f "ollama serve"

echo "All Ollama servers stopped."
