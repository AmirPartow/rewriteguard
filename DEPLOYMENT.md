# 🚀 RewriteGuard Production Deployment Guide

## 💰 Cost: ~$0/month (AWS Free Tier) → ~$8/month after

Everything runs on a **single EC2 t3.micro instance** using Docker Compose.

| Component  | Platform     | Domain                  | Cost      |
|------------|-------------|-------------------------|-----------|
| Frontend   | Vercel       | `rewritguard.com`       | Free      |
| API        | EC2 (Docker) | `api.rewritguard.com`   | Free tier |
| Database   | PostgreSQL (Docker on EC2) | internal     | $0        |
| Cache      | Redis (Docker on EC2)      | internal     | $0        |
| SSL        | Let's Encrypt | auto-renew             | Free      |

---

## Step 1: Launch EC2 Instance (Free Tier)

### 1a. Create the Instance

1. Go to [AWS Console → EC2](https://console.aws.amazon.com/ec2)
2. Click **Launch Instance**
3. Settings:
   - **Name**: `rewriteguard`
   - **AMI**: Amazon Linux 2023 (free tier eligible ✅)
   - **Instance type**: `t3.micro` (free tier eligible ✅)
   - **Key pair**: Create new → download the `.pem` file → save it safely
   - **Security Group**: Create new with these rules:

| Type  | Port | Source    | Purpose       |
|-------|------|-----------|---------------|
| SSH   | 22   | My IP     | SSH access    |
| HTTP  | 80   | 0.0.0.0/0 | Web traffic   |
| HTTPS | 443  | 0.0.0.0/0 | SSL traffic   |

4. **Storage**: 20 GB gp3 (free tier allows up to 30 GB)
5. Click **Launch Instance**

### 1b. Get Your Public IP

After launch, go to the instance details and copy the **Public IPv4 address**.
You'll need this for DNS setup.

> 💡 **Tip**: Allocate an **Elastic IP** (free while attached to a running instance)
> so your IP doesn't change on reboot:
> EC2 → Elastic IPs → Allocate → Associate with your instance

### 1c. Set Up the Server

```bash
# SSH into your EC2 instance
ssh -i ~/path/to/rewriteguard-key.pem ec2-user@YOUR_EC2_IP

# Download and run the setup script
# (or copy infra/ec2-setup.sh to the server first)
sudo bash ec2-setup.sh

# Log out and back in for Docker permissions
exit
ssh -i ~/path/to/rewriteguard-key.pem ec2-user@YOUR_EC2_IP
```

---

## Step 2: Configure DNS

### 2a. Frontend Domain (Vercel)

1. Go to [Vercel Dashboard](https://vercel.com) → your project → **Settings → Domains**
2. Add: `rewritguard.com`
3. Add: `www.rewritguard.com` (redirect to apex)
4. At your **domain registrar**, add the DNS records Vercel shows you:
   ```
   Type: A     | Name: @   | Value: 76.76.21.21
   Type: CNAME | Name: www | Value: cname.vercel-dns.com
   ```

### 2b. API Domain (EC2)

At your **domain registrar**, add:
```
Type: A | Name: api | Value: YOUR_EC2_ELASTIC_IP
```

Wait 5-10 minutes for DNS to propagate. Verify:
```bash
nslookup api.rewritguard.com
# Should show your EC2 IP
```

---

## Step 3: Deploy Backend

### 3a. Clone and Configure

```bash
# On your EC2 instance:
cd ~
git clone https://github.com/YOUR_USERNAME/rewriteguard.git
cd rewriteguard/backend

# Create production .env
cp .env.production .env
nano .env
# Change DB_PASSWORD to something strong
# Add your Stripe keys if you have them
```

### 3b. Start Everything

```bash
docker compose up -d
```

That's it! This starts:
- ✅ FastAPI backend (port 8000)
- ✅ PostgreSQL database (port 5432, internal)
- ✅ Redis cache (port 6379, internal)
- ✅ Nginx reverse proxy (port 80)
- ✅ Certbot (SSL cert manager)

### 3c. Verify

```bash
# Check all containers are running
docker compose ps

# Check API health
curl http://localhost:8000/health

# Check via Nginx
curl http://api.rewritguard.com/health
```

---

## Step 4: Set Up SSL (Free)

After DNS is pointing to your EC2:

```bash
cd ~/rewriteguard/backend

# Get SSL certificate from Let's Encrypt
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email YOUR_EMAIL@example.com \
    --agree-tos \
    --no-eff-email \
    -d api.rewritguard.com
```

Then enable HTTPS in Nginx:
```bash
nano nginx.conf
# 1. Uncomment the HTTPS server block at the bottom
# 2. Uncomment "return 301 https://..." in the HTTP block

# Reload Nginx
docker compose exec nginx nginx -s reload

# Test HTTPS
curl https://api.rewritguard.com/health
```

SSL auto-renews every 12 hours via the certbot container. ✅

---

## Step 5: Set Vercel Environment Variables

In Vercel Dashboard → Project → Settings → **Environment Variables**:

| Variable       | Value                           | Environment |
|----------------|---------------------------------|-------------|
| `VITE_API_URL` | `https://api.rewritguard.com`   | Production  |

Then redeploy: Vercel Dashboard → Deployments → Redeploy latest.

---

## Step 6: Configure Stripe Webhook (if using payments)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://api.rewritguard.com/v1/subscriptions/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the webhook signing secret → update `.env` on EC2

---

## Step 7: Set Up GitHub Auto-Deploy (Optional)

Add these secrets in GitHub → Repo → Settings → **Secrets → Actions**:

| Secret        | Value                              |
|---------------|------------------------------------|
| `EC2_HOST`    | Your EC2 Elastic IP                |
| `EC2_USER`    | `ec2-user` (Amazon Linux)          |
| `EC2_SSH_KEY` | Contents of your `.pem` key file   |

Now every push to `main` will auto-deploy to EC2. ✅

---

## Useful Commands

```bash
# --- On your EC2 instance ---

# View live logs
docker compose logs -f api

# Restart API only
docker compose restart api

# Rebuild after code changes
docker compose build api && docker compose up -d api

# Check database
docker compose exec postgres psql -U rewriteguard -d rewriteguard_db

# Check Redis
docker compose exec redis redis-cli info stats

# Check disk space
df -h

# Check memory
free -h

# Manual deploy (pull latest code + rebuild)
cd ~/rewriteguard && git pull && cd backend && docker compose build api && docker compose up -d api
```

---

## Health Check Endpoints

| Endpoint        | Purpose           | URL                                         |
|-----------------|-------------------|---------------------------------------------|
| `/health/live`  | Is app running?   | `https://api.rewritguard.com/health/live`   |
| `/health/ready` | Are deps healthy? | `https://api.rewritguard.com/health/ready`  |
| `/health`       | Simple status     | `https://api.rewritguard.com/health`        |

---

## Troubleshooting

**Container won't start?**
```bash
docker compose logs api    # Check for errors
docker compose logs postgres  # Check DB
```

**Out of memory?**
```bash
free -h                    # Check swap is active
docker stats               # See per-container memory
```

**SSL cert expired?**
```bash
docker compose run --rm certbot renew
docker compose exec nginx nginx -s reload
```

**Database migrations?**
```bash
# SQL files in ddl/ are auto-run on first start
# For new migrations, exec into postgres:
docker compose exec postgres psql -U rewriteguard -d rewriteguard_db -f /docker-entrypoint-initdb.d/005_new_migration.sql
```
