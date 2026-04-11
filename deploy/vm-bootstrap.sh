#!/usr/bin/env bash
# One-time VM bootstrap script for Yandex Cloud Ubuntu 22.04/24.04
#
# Usage (run on the VM as the SSH user):
#   curl -fsSL https://raw.githubusercontent.com/<owner>/<repo>/<branch>/deploy/vm-bootstrap.sh | bash
# Or:
#   scp deploy/vm-bootstrap.sh user@vm:/tmp/ && ssh user@vm 'bash /tmp/vm-bootstrap.sh'
#
# What it does:
#   1. Updates apt, installs Docker, Docker Compose, Nginx-less (Nginx runs in container), curl, git
#   2. Adds the current user to the docker group
#   3. Creates /opt/clo directory for the deployment
#   4. Prints next steps

set -euo pipefail

echo "═══════════════════════════════════════════"
echo "  CLO backend — VM bootstrap"
echo "═══════════════════════════════════════════"

# 1. System packages
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    git \
    ufw

# 2. Docker (official install script — always current version)
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com | sudo sh
fi

# 3. Add current user to docker group
if ! groups "$USER" | grep -q '\bdocker\b'; then
    sudo usermod -aG docker "$USER"
    echo "Added $USER to docker group (re-login required to take effect)."
fi

# 4. Firewall: allow SSH, HTTP, HTTPS
sudo ufw --force enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 5. Deploy directory
sudo mkdir -p /opt/clo
sudo chown "$USER:$USER" /opt/clo

# 6. Yandex Container Registry auth helper
# Creates a credentials file for docker login to cr.yandex
if [ ! -f ~/.docker/config.json ] || ! grep -q "cr.yandex" ~/.docker/config.json 2>/dev/null; then
    echo ""
    echo "────────────────────────────────────────────"
    echo "  Next: authenticate Docker with Yandex CR"
    echo "────────────────────────────────────────────"
    echo ""
    echo "Run ONE of these on this VM:"
    echo ""
    echo "  Option A — using IAM token (one-time, 12h valid):"
    echo "    yc iam create-token | docker login --username iam --password-stdin cr.yandex"
    echo ""
    echo "  Option B — using service account key file (persistent):"
    echo "    1. On your machine: yc iam key create --service-account-name beeline-clo-app -o sa-key.json"
    echo "    2. Copy sa-key.json to VM: scp sa-key.json $USER@<vm-ip>:/opt/clo/"
    echo "    3. On VM:"
    echo "       cat /opt/clo/sa-key.json | docker login --username json_key --password-stdin cr.yandex"
    echo ""
    echo "  Option C — GitHub Actions handles it (recommended):"
    echo "    No manual step needed. CI/CD pushes images using its own OIDC auth."
    echo ""
fi

echo ""
echo "═══════════════════════════════════════════"
echo "  Bootstrap complete!"
echo "═══════════════════════════════════════════"
echo ""
echo "NEXT STEPS:"
echo ""
echo "1. Log out and back in (or 'newgrp docker') for docker group membership"
echo ""
echo "2. Copy deployment files to /opt/clo:"
echo "     scp docker-compose.prod.yml user@vm:/opt/clo/"
echo "     scp -r deploy/nginx user@vm:/opt/clo/deploy/"
echo "     scp .env.example user@vm:/opt/clo/.env"
echo ""
echo "3. Edit /opt/clo/.env with real credentials:"
echo "     nano /opt/clo/.env"
echo ""
echo "4. First run (after CI/CD has pushed the image):"
echo "     cd /opt/clo"
echo "     docker compose -f docker-compose.prod.yml --env-file .env pull"
echo "     docker compose -f docker-compose.prod.yml --env-file .env run --rm api alembic upgrade head"
echo "     docker compose -f docker-compose.prod.yml --env-file .env run --rm api python seed.py"
echo "     docker compose -f docker-compose.prod.yml --env-file .env up -d"
echo ""
echo "5. Check health:"
echo "     curl http://localhost/api/health"
echo ""
