# HackEX Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Building the Application](#building-the-application)
6. [Deployment Options](#deployment-options)
7. [Post-Deployment Tasks](#post-deployment-tasks)
8. [Monitoring and Maintenance](#monitoring-and-maintenance)

## Prerequisites

Before deploying HackEX, ensure you have the following:

1. **Server Requirements**:
   - Ubuntu 20.04 LTS or newer (recommended)
   - Minimum 4GB RAM, 2 CPU cores
   - At least 20GB disk space
   - Root or sudo access

2. **Software Dependencies**:
   - Docker Engine 20.10+
   - Docker Compose 1.29+
   - Git
   - Node.js 18+ (for local builds)
   - PostgreSQL 15+ (if not using Docker)
   - Redis 7+ (if not using Docker)
   - Nginx 1.20+ (for reverse proxy)

3. **Domain and SSL**:
   - Registered domain name
   - SSL certificate (Let's Encrypt recommended)

## Environment Setup

### 1. Server Preparation

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git nginx docker.io docker-compose

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group
sudo usermod -aG docker $USER

# Reboot to apply group changes
sudo reboot
```

### 2. Clone Repository

```bash
# Clone the repository
git clone <repository-url> hackex
cd hackex

# Switch to the production branch (if applicable)
git checkout main
```

## Configuration

### 1. Environment Variables

Create `.env.production` files in both frontend and backend directories:

**Backend (.env.production)**:
```env
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://hackex_user:hackex_password@postgres:5432/hackex_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-here-32-chars-min
BCRYPT_ROUNDS=12
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
```

**Frontend (.env.production)**:
```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 2. Nginx Configuration

Update `nginx/nginx.conf` with your domain and SSL paths:

```nginx
# In the HTTPS server block
server_name yourdomain.com;

# SSL certificate paths
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
```

### 3. SSL Certificate Setup

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com

# Set up automatic renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

## Database Setup

### Option 1: Using Docker (Recommended)

No additional setup needed - Docker Compose will handle this automatically.

### Option 2: Manual Database Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database user and database
sudo -u postgres psql
CREATE USER hackex_user WITH PASSWORD 'hackex_password';
CREATE DATABASE hackex_db OWNER hackex_user;
\q

# Install Redis
sudo apt install redis-server -y

# Start Redis service
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## Building the Application

### 1. Build Docker Images

```bash
# Build backend image
docker build -t hackex-backend -f docker/Dockerfile.backend .

# Build frontend image
docker build -t hackex-frontend -f docker/Dockerfile.frontend .
```

### 2. Push Images to Registry (Optional)

```bash
# Tag images
docker tag hackex-backend your-dockerhub-username/hackex-backend:latest
docker tag hackex-frontend your-dockerhub-username/hackex-frontend:latest

# Push to Docker Hub
docker push your-dockerhub-username/hackex-backend:latest
docker push your-dockerhub-username/hackex-frontend:latest
```

## Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Deploy using Docker Compose
docker-compose -f docker-compose.yml up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Option 2: Manual Deployment

#### Backend Deployment

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm ci --only=production

# Run database migrations
npx prisma migrate deploy

# Start the application
npm start
```

#### Frontend Deployment

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm ci --only=production

# Build the application
npm run build

# Serve the application
npx serve -s out -l 3000
```

#### Nginx Configuration

```bash
# Copy Nginx configuration
sudo cp nginx/nginx.conf /etc/nginx/sites-available/hackex
sudo ln -s /etc/nginx/sites-available/hackex /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Post-Deployment Tasks

### 1. Database Seeding (Optional)

```bash
# Run seed script to populate initial data
cd backend
npx prisma db seed
```

### 2. Create Initial Admin User

Use the API to create an admin user:

```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@yourdomain.com",
    "password": "SecureAdminPass123!",
    "confirmPassword": "SecureAdminPass123!"
  }'
```

### 3. Configure Cron Jobs

Set up scheduled tasks for maintenance:

```bash
# Edit crontab
crontab -e

# Add these lines:
# Daily backup at 2 AM
0 2 * * * /path/to/hackex/scripts/backup.sh

# Weekly cleanup on Sundays at 3 AM
0 3 * * 0 /path/to/hackex/scripts/cleanup.sh

# Daily market reset at midnight
0 0 * * * cd /path/to/hackex/backend && npx ts-node scripts/market-reset.ts
```

## Monitoring and Maintenance

### 1. Health Checks

Set up health check endpoints:

```bash
# Backend health check
curl https://api.yourdomain.com/health

# Frontend health check
curl https://yourdomain.com/health
```

### 2. Log Monitoring

```bash
# View Docker logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 3. Performance Monitoring

Install and configure monitoring tools:

```bash
# Install htop for system monitoring
sudo apt install htop -y

# Install Docker monitoring
docker run --rm -it \
  --name cadvisor \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:rw \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  google/cadvisor:latest
```

### 4. Backup Strategy

Implement regular backups:

```bash
# Database backup script (backup.sh)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/hackex"
mkdir -p $BACKUP_DIR

# Backup database
docker exec hackex-postgres pg_dump -U hackex_user hackex_db > $BACKUP_DIR/db_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/db_backup_$DATE.sql

# Remove backups older than 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

### 5. Updating the Application

To update to a new version:

```bash
# Pull latest code
git pull origin main

# Rebuild Docker images
docker-compose build

# Stop and remove containers
docker-compose down

# Start updated services
docker-compose up -d

# Run database migrations if needed
docker-compose exec backend npx prisma migrate deploy
```

## Troubleshooting

### Common Issues

1. **Application not accessible**:
   - Check Nginx configuration
   - Verify SSL certificates
   - Ensure firewall allows traffic on ports 80/443

2. **Database connection failures**:
   - Verify DATABASE_URL in environment variables
   - Check if PostgreSQL service is running
   - Ensure database user has proper permissions

3. **WebSocket connection issues**:
   - Check Nginx WebSocket proxy configuration
   - Verify firewall allows WebSocket traffic
   - Ensure backend is properly configured for WebSockets

4. **Performance issues**:
   - Monitor system resources with htop
   - Check Docker container resource limits
   - Optimize database queries and indexes

### Useful Commands

```bash
# Check Docker container status
docker-compose ps

# View container resource usage
docker stats

# Restart specific service
docker-compose restart backend

# Access container shell
docker-compose exec backend sh

# View application logs
docker-compose logs backend
```

## Security Considerations

1. **Keep software updated**:
   - Regularly update Docker, OS, and application dependencies

2. **Secure environment variables**:
   - Never commit secrets to version control
   - Use secret management tools in production

3. **Implement rate limiting**:
   - Configure Nginx rate limiting
   - Use application-level rate limiting

4. **Regular security audits**:
   - Scan Docker images for vulnerabilities
   - Audit application dependencies
   - Perform penetration testing

5. **Backup and disaster recovery**:
   - Implement automated backups
   - Test restore procedures regularly
   - Store backups in secure, separate locations