#!/usr/bin/env bash
# =============================================================================
# RewriteGuard — Deploy to EC2 Instance
# =============================================================================
# Deploys the backend to your EC2 instance via SSH + Docker Compose.
#
# Prerequisites:
#   - EC2 instance running with Docker + Docker Compose installed
#   - SSH key file (.pem) downloaded
#   - Security group allows ports 22 (SSH), 80 (HTTP), 443 (HTTPS)
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# =============================================================================

set -euo pipefail

# ---- CONFIGURATION ----
EC2_HOST="ec2-user@52.32.253.222"
SSH_KEY="~/.ssh/rewriteguard-key.pem"
REMOTE_DIR="/home/ec2-user/rewriteguard"
# ------------------------

echo "🚀 Deploying RewriteGuard to ${EC2_HOST}..."

# 1. Sync backend code to EC2
echo "📦 Syncing files..."
rsync -avz --delete \
    -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" \
    --exclude '__pycache__' \
    --exclude '.env' \
    --exclude '*.pyc' \
    --exclude '.pytest_cache' \
    ../backend/ "${EC2_HOST}:${REMOTE_DIR}/"

# 2. SSH in and deploy
echo "🐳 Building and starting containers..."
ssh -i "${SSH_KEY}" "${EC2_HOST}" << 'EOF'
    cd /home/ec2-user/rewriteguard

    # Pull latest images
    docker compose pull redis postgres nginx certbot

    # Build API image
    docker compose build api

    # Start/restart all services
    docker compose up -d

    # Wait for health check
    echo "⏳ Waiting for API to be healthy..."
    sleep 10
    curl -sf http://localhost:8000/health || echo "⚠️  Health check pending..."

    # Show status
    docker compose ps
    echo ""
    echo "✅ Deployment complete!"
EOF
