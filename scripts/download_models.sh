#!/bin/bash
# Download required models for LangOmni Adventure using Ollama

set -e

echo "LangOmni Adventure - Model Download Script"
echo "=========================================="

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "Error: Ollama not found. Please install Ollama first."
    echo "Visit: https://ollama.ai/download"
    exit 1
fi

echo ""
echo "Pulling Llama 3.1 70B model..."
echo "This may take a while depending on your connection..."
ollama pull llama3.1:70b

echo ""
echo "Pulling Llama 3.1 8B model..."
ollama pull llama3.1:8b

echo ""
echo "Model download complete!"
echo "You can verify the models with: ollama list"
echo ""
echo "You can now start the Ollama servers with:"
echo "  ./scripts/start_gpu_servers.sh"
