#!/bin/bash
# Download required models for LangOmni Adventure

set -e

echo "LangOmni Adventure - Model Download Script"
echo "=========================================="

# Create models directory
mkdir -p models

# Check if huggingface-cli is installed
if ! command -v huggingface-cli &> /dev/null; then
    echo "Installing huggingface-cli..."
    pip install huggingface-hub
fi

echo ""
echo "Downloading Llama 3.1 70B Instruct (AWQ quantized)..."
echo "This may take a while (~40GB)..."
huggingface-cli download TheBloke/Llama-3.1-70B-Instruct-AWQ \
    --local-dir models/llama-70b-awq \
    --local-dir-use-symlinks False

echo ""
echo "Downloading Llama 3.1 8B Instruct (AWQ quantized)..."
echo "This will be ~5GB..."
huggingface-cli download TheBloke/Llama-3.1-8B-Instruct-AWQ \
    --local-dir models/llama-8b-awq \
    --local-dir-use-symlinks False

echo ""
echo "Model download complete!"
echo "Models are located in: ./models/"
echo ""
echo "You can now start the GPU servers with:"
echo "  ./scripts/start_gpu_servers.sh"
