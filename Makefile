.PHONY: help install dev build up down logs clean test

help:
	@echo "LangOmni Adventure - Makefile Commands"
	@echo "======================================"
	@echo ""
	@echo "Setup:"
	@echo "  make install       Install all dependencies"
	@echo "  make models        Download required models"
	@echo ""
	@echo "Development:"
	@echo "  make dev           Start all services in development mode"
	@echo "  make dev-backend   Start only backend in development mode"
	@echo "  make dev-frontend  Start only frontend in development mode"
	@echo ""
	@echo "Docker:"
	@echo "  make up            Start all Docker services"
	@echo "  make down          Stop all Docker services"
	@echo "  make logs          View Docker logs"
	@echo "  make build         Build Docker images"
	@echo ""
	@echo "GPU Servers:"
	@echo "  make gpu-start     Start GPU inference servers"
	@echo "  make gpu-stop      Stop GPU inference servers"
	@echo ""
	@echo "Maintenance:"
	@echo "  make clean         Clean up temporary files"
	@echo "  make test          Run tests"
	@echo "  make format        Format code"
	@echo ""

install:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt
	@echo "Installing frontend dependencies..."
	cd frontend && npm install
	@echo "Installation complete!"

models:
	@echo "Downloading models..."
	chmod +x scripts/download_models.sh
	./scripts/download_models.sh

dev:
	@echo "Starting all services in development mode..."
	docker-compose up -d redis postgres qdrant
	@echo "Infrastructure started. Starting GPU servers..."
	make gpu-start
	@echo "Starting backend..."
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
	@echo "Starting frontend..."
	cd frontend && npm run dev

dev-backend:
	cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	cd frontend && npm run dev

up:
	docker-compose up -d

down:
	docker-compose down

logs:
	docker-compose logs -f

build:
	docker-compose build

gpu-start:
	chmod +x scripts/start_gpu_servers.sh
	./scripts/start_gpu_servers.sh

gpu-stop:
	chmod +x scripts/stop_gpu_servers.sh
	./scripts/stop_gpu_servers.sh

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name "dist" -exec rm -rf {} + 2>/dev/null || true
	@echo "Cleanup complete!"

test:
	cd backend && pytest tests/
	cd frontend && npm run test

format:
	cd backend && black app/ && ruff check app/ --fix
	cd frontend && npm run format
