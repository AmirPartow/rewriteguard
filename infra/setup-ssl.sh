#!/usr/bin/env bash
# =============================================================================
# RewriteGuard — SSL Certificate Setup (Let's Encrypt)
# =============================================================================
# Run this AFTER:
#   1. DNS for api.rewritguard.com points to your EC2 IP
#   2. Docker Compose is running (nginx must be up on port 80)
#
# Usage:
#   chmod +x setup-ssl.sh
#   ./setup-ssl.sh
# =============================================================================

set -euo pipefail

DOMAIN="api.rewritguard.com"
EMAIL="your-email@example.com"   # <-- Change this to your real email

echo "🔐 Setting up SSL for ${DOMAIN}..."

# Step 1: Get certificate
echo "📜 Requesting certificate from Let's Encrypt..."
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "${EMAIL}" \
    --agree-tos \
    --no-eff-email \
    -d "${DOMAIN}"

if [ $? -eq 0 ]; then
    echo "✅ Certificate obtained!"
    echo ""
    echo "Now do these steps:"
    echo ""
    echo "  1. Edit nginx.conf:"
    echo "     - Uncomment the HTTPS server block at the bottom"
    echo "     - Uncomment 'return 301 https://...' in the HTTP block"
    echo ""
    echo "  2. Reload nginx:"
    echo "     docker compose exec nginx nginx -s reload"
    echo ""
    echo "  3. Test HTTPS:"
    echo "     curl https://${DOMAIN}/health"
    echo ""
    echo "SSL auto-renewal is handled by the certbot container (checks every 12h)"
else
    echo "❌ Certificate request failed!"
    echo "Make sure:"
    echo "  - DNS for ${DOMAIN} points to this server's IP"
    echo "  - Port 80 is open in your security group"
    echo "  - Nginx is running: docker compose ps"
fi
