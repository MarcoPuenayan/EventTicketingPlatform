# Deployment Guide - Event Ticketing Platform API

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Local Development](#local-development)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Monitoring & Logging](#monitoring--logging)
9. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

### Required Software
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- **SQL Server**: 2019 or higher (Express, Developer, or Standard)
- **Git**: Latest version

### Optional Tools
- **Docker**: v24.0+ (for containerized deployment)
- **Docker Compose**: v2.20+ (for orchestration)
- **PM2**: For process management (production)

### System Requirements
**Development**:
- RAM: 4GB minimum
- CPU: 2 cores
- Disk: 10GB free space

**Production**:
- RAM: 8GB minimum (16GB recommended)
- CPU: 4 cores (8 cores recommended)
- Disk: 50GB free space
- Network: 100 Mbps

---

## ⚙️ Environment Setup

### 1. Clone Repository
```bash
git clone https://github.com/MarcoPuenayan/EventTicketingPlatform.git
cd EventTicketingPlatform/event-ticketing-api
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000

# Database Configuration
DB_TYPE=mssql
DB_HOST=localhost
DB_PORT=1433
DB_USERNAME=sa
DB_PASSWORD=YourStrongPassword123!
DB_DATABASE=EventTicketing
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=true

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRATION=24h

# Image Storage
IMAGE_STORAGE_PATH=./uploads

# CORS Configuration (comma-separated origins)
CORS_ORIGINS=http://localhost:3001,http://localhost:4200

# API Rate Limiting
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=100

# Logging
LOG_LEVEL=debug
```

### Production Environment Variables
Create `.env.production`:

```env
NODE_ENV=production
PORT=3000

# Database - Use managed SQL Server
DB_TYPE=mssql
DB_HOST=your-production-server.database.windows.net
DB_PORT=1433
DB_USERNAME=adminuser
DB_PASSWORD=SuperSecureProductionPassword123!
DB_DATABASE=EventTicketingProd
DB_ENCRYPT=true
DB_TRUST_SERVER_CERTIFICATE=false

# JWT - Generate strong secret
JWT_SECRET=use-openssl-rand-base64-32-to-generate-this
JWT_EXPIRATION=24h

# Image Storage - Use cloud storage in production
IMAGE_STORAGE_PATH=/var/www/uploads

# CORS - Production domains only
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting - Stricter in production
RATE_LIMIT_TTL=60
RATE_LIMIT_MAX=50

# Logging
LOG_LEVEL=info
```

---

## 🗄️ Database Configuration

### SQL Server Setup

#### Windows (SQL Server Express)
1. Download SQL Server Express from Microsoft
2. Install with default settings
3. Enable TCP/IP protocol in SQL Server Configuration Manager
4. Restart SQL Server service

#### Linux (Docker)
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/mssql/server:2019-latest
```

#### macOS (Docker)
```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=YourPassword123!" \
  -p 1433:1433 --name sqlserver \
  -d mcr.microsoft.com/azure-sql-edge
```

### Create Database
```sql
CREATE DATABASE EventTicketing;
GO

USE EventTicketing;
GO
```

### Run Migrations
```bash
# Generate migration from entities
npm run migration:generate -- src/migrations/InitialMigration

# Run migrations
npm run migration:run

# Revert last migration (if needed)
npm run migration:revert
```

### Seed Data (Optional)
Create seed script `src/database/seeds/seed.ts`:
```typescript
// Create initial categories, venues, and admin user
```

Run seed:
```bash
npx ts-node src/database/seeds/seed.ts
```

---

## 💻 Local Development

### Start Development Server
```bash
# Development mode with hot-reload
npm run start:dev

# Debug mode
npm run start:debug
```

### Access Points
- **API**: http://localhost:3000
- **Swagger UI**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### Development Workflow
1. Make code changes
2. Auto-reload occurs
3. Test endpoints via Swagger or Postman
4. Run tests: `npm test`
5. Check coverage: `npm run test:cov`

---

## 🚀 Production Deployment

### Option 1: Traditional Server (Linux/Ubuntu)

#### 1. Prepare Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /var/www/event-ticketing-api
sudo chown -R $USER:$USER /var/www/event-ticketing-api
```

#### 2. Deploy Application
```bash
# Clone or copy files
cd /var/www/event-ticketing-api
git clone https://github.com/MarcoPuenayan/EventTicketingPlatform.git .
cd event-ticketing-api

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Create production env file
nano .env.production
```

#### 3. Configure PM2
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'event-ticketing-api',
    script: './dist/main.js',
    instances: 4,
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};
```

#### 4. Start Application
```bash
# Start with PM2
pm2 start ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Follow the instructions from the command output

# Monitor
pm2 monit
```

#### 5. Configure Nginx (Reverse Proxy)
```bash
sudo apt install nginx -y
```

Create `/etc/nginx/sites-available/event-ticketing-api`:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/event-ticketing-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 6. SSL Certificate (Let's Encrypt)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.yourdomain.com
```

### Option 2: Cloud Platform Deployment

#### Azure App Service
1. Create App Service (Node 20 runtime)
2. Configure environment variables in Application Settings
3. Connect to Azure SQL Database
4. Deploy via GitHub Actions or Azure DevOps

```yaml
# .github/workflows/azure-deploy.yml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: azure/webapps-deploy@v2
        with:
          app-name: event-ticketing-api
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

#### AWS EC2 + RDS
1. Launch EC2 instance (t3.medium or larger)
2. Create RDS SQL Server instance
3. Configure security groups
4. Follow traditional server deployment steps
5. Use Application Load Balancer for scaling

#### Google Cloud Run
```bash
# Build container
gcloud builds submit --tag gcr.io/PROJECT_ID/event-ticketing-api

# Deploy
gcloud run deploy event-ticketing-api \
  --image gcr.io/PROJECT_ID/event-ticketing-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

---

## 🐳 Docker Deployment

### Dockerfile
Create `Dockerfile` in project root:
```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install dumb-init
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

# Copy dependencies and build
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Create uploads directory
RUN mkdir -p /app/uploads && chown nestjs:nodejs /app/uploads

USER nestjs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]
```

### Docker Compose
Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=sqlserver
      - DB_PORT=1433
      - DB_USERNAME=sa
      - DB_PASSWORD=YourPassword123!
      - DB_DATABASE=EventTicketing
      - JWT_SECRET=your-jwt-secret
    depends_on:
      - sqlserver
    volumes:
      - ./uploads:/app/uploads
    restart: unless-stopped

  sqlserver:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    restart: unless-stopped

volumes:
  sqlserver-data:
```

### Build and Run
```bash
# Build image
docker build -t event-ticketing-api .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions
Create `.github/workflows/ci-cd.yml`:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      sqlserver:
        image: mcr.microsoft.com/mssql/server:2019-latest
        env:
          ACCEPT_EULA: Y
          SA_PASSWORD: TestPassword123!
        ports:
          - 1433:1433
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run tests
        run: npm run test:cov
        env:
          DB_HOST: localhost
          DB_PASSWORD: TestPassword123!
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
  
  build:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Build Docker image
        run: docker build -t event-ticketing-api:${{ github.sha }} .
      
      - name: Push to registry
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker push event-ticketing-api:${{ github.sha }}
```

---

## 📊 Monitoring & Logging

### Application Logging
The application uses built-in NestJS Logger. Logs are written to:
- Console (development)
- Files (production): `logs/error.log`, `logs/combined.log`

### PM2 Monitoring
```bash
# Real-time monitoring
pm2 monit

# View logs
pm2 logs event-ticketing-api

# View specific log types
pm2 logs event-ticketing-api --err
pm2 logs event-ticketing-api --out
```

### Health Checks
Create `src/health/health.controller.ts` for monitoring:
```typescript
@Get('health')
healthCheck() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
}
```

### Recommended Monitoring Tools
- **Application Performance**: New Relic, Datadog
- **Error Tracking**: Sentry
- **Log Management**: ELK Stack, Splunk
- **Uptime Monitoring**: UptimeRobot, Pingdom

---

## 🔍 Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check SQL Server is running
systemctl status mssql-server  # Linux
# or
services.msc  # Windows

# Test connection
sqlcmd -S localhost -U sa -P YourPassword123!

# Check firewall
sudo ufw allow 1433/tcp  # Linux
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000  # Linux/Mac
netstat -ano | findstr :3000  # Windows

# Kill process
kill -9 <PID>  # Linux/Mac
taskkill /PID <PID> /F  # Windows
```

#### Out of Memory
```javascript
// Increase Node.js memory limit in ecosystem.config.js
node_args: '--max-old-space-size=4096'
```

#### JWT Token Issues
- Verify JWT_SECRET matches between deployments
- Check token expiration time
- Ensure clock synchronization on servers

#### Image Upload Failures
```bash
# Check directory permissions
chmod 755 uploads/
chown -R nodejs:nodejs uploads/

# Verify disk space
df -h
```

### Logs Location
- **Development**: Console output
- **Production (PM2)**: `~/.pm2/logs/`
- **Docker**: `docker logs <container-id>`

### Debug Mode
```bash
# Enable debug logging
export LOG_LEVEL=debug
npm run start:debug
```

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Code reviewed and merged
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates obtained
- [ ] Backup strategy in place

### Deployment
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Check error logs
- [ ] Monitor resource usage
- [ ] Deploy to production
- [ ] Run production smoke tests

### Post-Deployment
- [ ] Verify all endpoints responding
- [ ] Check database connectivity
- [ ] Monitor error rates
- [ ] Review performance metrics
- [ ] Update documentation
- [ ] Notify team

---

## 🆘 Support

For deployment issues:
- **Email**: devops@eventtickets.com
- **Slack**: #deployment-support
- **Documentation**: https://docs.eventtickets.com

---

**Last Updated**: November 14, 2025
**Version**: 1.0.0
