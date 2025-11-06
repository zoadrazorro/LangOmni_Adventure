
# Deployment Guide

## Prerequisites

### Hardware Requirements

- **CPU**: AMD Ryzen 9 7950X (16 cores) or equivalent
- **RAM**: 64GB recommended (32GB minimum)
- **GPU**: 2x AMD Radeon 7900 XT (24GB VRAM each)
- **Storage**: 500GB NVMe SSD (for models and data)
- **Network**: Gigabit internet connection

### Software Requirements

- **OS**: Ubuntu 22.04 LTS (or compatible Linux distribution)
- **Docker**: 24.0.0+
- **Docker Compose**: 2.20.0+
- **AMD ROCm**: 6.0+ (for GPU inference)
- **Python**: 3.11+ (for local development)
- **Node.js**: 20+ (for frontend development)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/LangOmni_Adventure.git
cd LangOmni_Adventure
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your configuration
nano .env
```

**Critical settings to change**:
- `POSTGRES_PASSWORD`: Strong password for database
- `JWT_SECRET`: Generate with `openssl rand -hex 32`
- `ADMIN_PASSWORD`: Change from default
- `GRAFANA_PASSWORD`: Admin password for Grafana

### 3. Start Infrastructure Services

```bash
# Start database, cache, and vector DB
docker-compose up -d postgres redis qdrant

# Wait for services to be healthy
docker-compose ps
```

### 4. Set Up GPU Inference Servers

#### Install ROCm (if not already installed)

```bash
wget https://repo.radeon.com/amdgpu-install/6.0/ubuntu/jammy/amdgpu-install_6.0.60000-1_all.deb
sudo apt install ./amdgpu-install_6.0.60000-1_all.deb
sudo amdgpu-install --usecase=rocm
```

#### Install vLLM

```bash
pip install vllm
# Or with ROCm support
pip install vllm-rocm
```

#### Download Models

```bash
# Create models directory
mkdir -p models

# Download Llama 3.1 70B (quantized)
huggingface-cli download TheBloke/Llama-3.1-70B-Instruct-AWQ --local-dir models/llama-70b-awq

# Download Llama 3.1 8B (quantized)
huggingface-cli download TheBloke/Llama-3.1-8B-Instruct-AWQ --local-dir models/llama-8b-awq
```

#### Start GPU 0 (World Simulator)

```bash
# Terminal 1
CUDA_VISIBLE_DEVICES=0 python -m vllm.entrypoints.openai.api_server \
  --model models/llama-70b-awq \
  --quantization awq \
  --dtype auto \
  --gpu-memory-utilization 0.90 \
  --max-model-len 4096 \
  --port 8001 \
  --host 0.0.0.0
```

#### Start GPU 1 Instances (NPC Engine)

```bash
# Terminal 2 - Instance 1
CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
  --model models/llama-8b-awq \
  --quantization awq \
  --gpu-memory-utilization 0.22 \
  --max-model-len 2048 \
  --port 8002 \
  --host 0.0.0.0 &

# Terminal 3 - Instance 2
CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
  --model models/llama-8b-awq \
  --quantization awq \
  --gpu-memory-utilization 0.22 \
  --max-model-len 2048 \
  --port 8003 \
  --host 0.0.0.0 &

# Terminal 4 - Instance 3
CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
  --model models/llama-8b-awq \
  --quantization awq \
  --gpu-memory-utilization 0.22 \
  --max-model-len 2048 \
  --port 8004 \
  --host 0.0.0.0 &

# Terminal 5 - Instance 4
CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
  --model models/llama-8b-awq \
  --quantization awq \
  --gpu-memory-utilization 0.22 \
  --max-model-len 2048 \
  --port 8005 \
  --host 0.0.0.0 &
```

**Note**: Adjust `--gpu-memory-utilization` based on your actual VRAM availability.

### 5. Start Backend Server

```bash
# Using Docker
docker-compose up -d backend

# OR run locally for development
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Start Frontend

```bash
# Using Docker
docker-compose up -d frontend

# OR run locally for development
cd frontend
npm install
npm run dev
```

### 7. Start Monitoring Stack

```bash
docker-compose up -d prometheus grafana nginx
```

### 8. Verify Deployment

Visit these URLs to verify everything is working:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/health/detailed
- **Grafana**: http://localhost:3001 (admin/your_password)
- **Prometheus**: http://localhost:9090

## Production Deployment

### Security Hardening

1. **Change all default passwords**
   ```bash
   # Generate secure passwords
   openssl rand -base64 32
   ```

2. **Enable SSL/TLS**
   ```bash
   # Generate self-signed certificate (for testing)
   openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
     -keyout docker/nginx/ssl/server.key \
     -out docker/nginx/ssl/server.crt
   ```

3. **Restrict access to admin endpoints**
   - Update `docker/nginx/nginx.conf` to add IP whitelisting
   - Enable authentication for Grafana and Prometheus

4. **Enable firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

### Database Backups

Set up automated backups:

```bash
# Create backup script
cat > /usr/local/bin/backup-langomni.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/backups/langomni"
DATE=$(date +%Y%m%d_%H%M%S)
docker exec langomni_postgres pg_dump -U langomni_user langomni_adventure | gzip > $BACKUP_DIR/backup_$DATE.sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete
EOF

chmod +x /usr/local/bin/backup-langomni.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /usr/local/bin/backup-langomni.sh" | sudo crontab -
```

### Monitoring Setup

1. **Configure Grafana**
   - Import pre-built dashboards
   - Set up alerts for critical metrics
   - Configure notification channels (email, Slack)

2. **Set up log aggregation**
   ```bash
   # Consider using Loki or ELK stack
   docker-compose -f docker-compose.monitoring.yml up -d
   ```

### Scaling for Production

#### Increase GPU Instances

For GPU 1, you can run more instances:

```bash
# Run 8 instances instead of 4
for port in {8002..8009}; do
  CUDA_VISIBLE_DEVICES=1 python -m vllm.entrypoints.openai.api_server \
    --model models/llama-8b-awq \
    --quantization awq \
    --gpu-memory-utilization 0.11 \
    --max-model-len 2048 \
    --port $port \
    --host 0.0.0.0 &
done
```

#### Load Balancing

For multiple backend instances:

```bash
# docker-compose.scale.yml
services:
  backend:
    deploy:
      replicas: 3

# Start with scaling
docker-compose -f docker-compose.yml -f docker-compose.scale.yml up -d
```

#### Redis Clustering

For high availability:

```yaml
# docker-compose.redis-cluster.yml
services:
  redis-master:
    image: redis:7-alpine
    command: redis-server --appendonly yes

  redis-replica-1:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379

  redis-replica-2:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379
```

## Troubleshooting

### GPU Not Detected

```bash
# Check ROCm installation
rocm-smi

# Verify vLLM can see GPUs
python -c "import torch; print(torch.cuda.is_available())"
```

### High Memory Usage

```bash
# Check memory usage
docker stats

# Reduce vLLM memory utilization
# Edit --gpu-memory-utilization to 0.80 or lower
```

### Database Connection Issues

```bash
# Check database logs
docker logs langomni_postgres

# Test connection
docker exec -it langomni_postgres psql -U langomni_user -d langomni_adventure
```

### Slow Response Times

1. **Check GPU utilization**
   ```bash
   watch -n 1 rocm-smi
   ```

2. **Check cache hit rate**
   ```bash
   curl http://localhost:8000/api/admin/metrics/cache
   ```

3. **Check queue depth**
   - Look at Grafana dashboards
   - If queue is deep, add more GPU instances

### WebSocket Disconnections

```bash
# Check nginx logs
docker logs langomni_nginx

# Increase timeout in nginx.conf
proxy_read_timeout 3600;
proxy_send_timeout 3600;
```

## Performance Tuning

### Optimize vLLM

```bash
# Enable KV cache
--enable-prefix-caching

# Adjust batch size
--max-num-batched-tokens 8192

# Enable speculative decoding (if supported)
--use-speculative-decoding
```

### Optimize PostgreSQL

```sql
-- Increase shared buffers
ALTER SYSTEM SET shared_buffers = '4GB';

-- Increase work memory
ALTER SYSTEM SET work_mem = '64MB';

-- Reload configuration
SELECT pg_reload_conf();
```

### Optimize Redis

```bash
# Edit redis.conf
maxmemory 4gb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
save 60 10000
```

## Maintenance

### Update Models

```bash
# Download new model version
huggingface-cli download TheBloke/Llama-3.2-70B-Instruct-AWQ --local-dir models/llama-70b-new

# Stop old server
pkill -f "vllm.*port 8001"

# Start new server
CUDA_VISIBLE_DEVICES=0 python -m vllm.entrypoints.openai.api_server \
  --model models/llama-70b-new \
  --port 8001 \
  # ... other flags
```

### Database Migrations

```bash
cd backend
alembic revision --autogenerate -m "Add new table"
alembic upgrade head
```

### Update Docker Images

```bash
docker-compose pull
docker-compose up -d
```

## Monitoring Checklist

Daily:
- [ ] Check Grafana dashboards for anomalies
- [ ] Review error logs
- [ ] Verify backup completion

Weekly:
- [ ] Review player engagement metrics
- [ ] Check disk space
- [ ] Update dependencies

Monthly:
- [ ] Security updates
- [ ] Performance review
- [ ] Capacity planning

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/LangOmni_Adventure/issues
- Documentation: https://docs.langomni-adventure.com
- Discord: https://discord.gg/langomni (example)
