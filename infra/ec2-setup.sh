#!/usr/bin/env bash
# =============================================================================
# RewriteGuard — EC2 Instance Setup Script
# =============================================================================
# Run this ONCE on a fresh Amazon Linux 2023 / Ubuntu EC2 instance.
# It installs Docker, Docker Compose, and prepares the server.
#
# Usage (run on the EC2 instance):
#   chmod +x ec2-setup.sh
#   sudo ./ec2-setup.sh
# =============================================================================

set -euo pipefail

echo "🔧 Setting up RewriteGuard server..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="unknown"
fi

echo "📦 Installing Docker..."

if [ "$OS" = "amzn" ]; then
    # Amazon Linux 2023
    dnf update -y
    dnf install -y docker git curl
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user

    # Install Docker Compose plugin
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
        -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

elif [ "$OS" = "ubuntu" ]; then
    # Ubuntu
    apt-get update
    apt-get install -y docker.io docker-compose-v2 git curl
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

# Create app directory
APP_DIR="/home/$([ "$OS" = "ubuntu" ] && echo "ubuntu" || echo "ec2-user")/rewriteguard"
mkdir -p "$APP_DIR"

# Set up swap (t3.micro only has 1GB RAM — swap helps a lot)
echo "💾 Setting up 2GB swap file..."
if [ ! -f /swapfile ]; then
    dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    echo "   Swap enabled: 2GB"
else
    echo "   Swap already exists"
fi

# Set up automatic security updates
echo "🔒 Enabling automatic security updates..."
if [ "$OS" = "amzn" ]; then
    dnf install -y dnf-automatic
    systemctl enable dnf-automatic-install.timer
    systemctl start dnf-automatic-install.timer
elif [ "$OS" = "ubuntu" ]; then
    apt-get install -y unattended-upgrades
    dpkg-reconfigure -plow unattended-upgrades
fi

# Set up log rotation for Docker
echo "📋 Configuring Docker log rotation..."
cat > /etc/docker/daemon.json << 'DOCKER_JSON'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
DOCKER_JSON
systemctl restart docker

echo ""
echo "============================================"
echo "✅ Server setup complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Log out and back in (for Docker group to take effect)"
echo "  2. Copy your backend code to: $APP_DIR"
echo "  3. Create .env file with your secrets"
echo "  4. Run: cd $APP_DIR && docker compose up -d"
echo ""
echo "Memory info:"
free -h
echo ""
echo "Disk info:"
df -h /
