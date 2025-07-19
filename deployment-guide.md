# HermesAI Swap - Complete Deployment Guide

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)  
3. [Platform-Specific Deployment](#platform-specific-deployment)
4. [Environment Configuration](#environment-configuration)
5. [Build & Deploy](#build--deploy)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

## Prerequisites
- Node.js 18+ installed
- PostgreSQL database access
- Git repository access
- Domain name (optional)

## Database Setup

### Option 1: Neon (Recommended)
1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `DATABASE_URL` in environment

### Option 2: Supabase
1. Go to https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string
5. Add to `DATABASE_URL`

### Option 3: Self-hosted PostgreSQL
```sql
CREATE DATABASE hermesai_swap;
CREATE USER hermesai_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE hermesai_swap TO hermesai_user;
```

## Platform-Specific Deployment

### Vercel Deployment
```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel

# 4. Add environment variables in Vercel dashboard
# - DATABASE_URL
# - NODE_ENV=production

# 5. Set build settings:
# Build Command: npm run build
# Output Directory: dist
# Install Command: npm install --legacy-peer-deps
```

### Netlify Deployment
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Initialize
netlify init

# 4. Deploy
netlify deploy --prod

# Build settings in netlify.toml:
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

### Railway Deployment
1. Go to https://railway.app
2. Connect GitHub repository
3. Add PostgreSQL addon
4. Set environment variables:
   - Copy `DATABASE_URL` from PostgreSQL addon
   - Set `NODE_ENV=production`
5. Deploy automatically

### DigitalOcean App Platform
```yaml
# .do/app.yaml
name: hermesai-swap
services:
- name: web
  source_dir: /
  github:
    repo: your-username/hermesai-swap
    branch: main
  run_command: npm start
  build_command: npm run build
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
databases:
- name: db
  engine: PG
  version: "13"
```

### AWS EC2 / VPS Deployment
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Install PM2
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/your-username/hermesai-swap.git
cd hermesai-swap

# 5. Install dependencies
npm install --legacy-peer-deps

# 6. Build
npm run build

# 7. Setup environment
cp .env.example .env
nano .env  # Edit with your configuration

# 8. Setup database
npm run db:push

# 9. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Environment Configuration

### Required Variables
```bash
DATABASE_URL="postgresql://user:pass@host:port/db"
NODE_ENV="production"
PORT="5000"
```

### Optional but Recommended
```bash
DOMAIN="yourdomain.com"
HTTPS="true"
RATE_LIMIT_MAX_REQUESTS="100"
LOG_LEVEL="info"
```

## Build & Deploy

### Standard Build Process
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Environment setup
cp .env.example .env
# Edit .env with your database URL

# 3. Database migration
npm run db:push

# 4. Build frontend & backend
npm run build

# 5. Start production server
npm start
```

### Docker Deployment (Optional)
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

```bash
# Build and run
docker build -t hermesai-swap .
docker run -p 5000:5000 --env-file .env hermesai-swap
```

## Post-Deployment Verification

### Health Checks
```bash
# 1. Check server status
curl https://yourdomain.com/api/health

# 2. Test database connection
curl https://yourdomain.com/api/users/test

# 3. Verify static assets
curl https://yourdomain.com/assets/index-*.js

# 4. Test swap functionality (in browser)
# - Connect wallet
# - Check token prices
# - Perform test swap
```

### Performance Monitoring
```bash
# Check response times
curl -w "@curl-format.txt" -s https://yourdomain.com/

# Monitor server logs
pm2 logs hermesai-swap

# Database performance
# Run EXPLAIN ANALYZE on key queries
```

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist
npm install --legacy-peer-deps
npm run build
```

#### 2. Database Connection Issues
```bash
# Test connection
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT version()\`.then(console.log).catch(console.error);
"
```

#### 3. Static Assets Not Loading
```bash
# Check file structure
ls -la dist/assets/

# Verify server configuration
grep -n "express.static" server/index.ts
```

#### 4. Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Or in PM2
pm2 start npm --name "hermesai-swap" -- start --node-args="--max-old-space-size=4096"
```

#### 5. Port Issues
```bash
# Check if port is in use
lsof -i :5000

# Kill process on port
sudo kill -9 $(lsof -t -i:5000)
```

### Performance Optimization

#### 1. Enable Gzip Compression
```javascript
// In server/index.ts
import compression from 'compression';
app.use(compression());
```

#### 2. Database Optimization
```sql
-- Add indexes for common queries
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_swap_transactions_user_id ON swap_transactions(user_id);
CREATE INDEX idx_swap_transactions_created_at ON swap_transactions(created_at);
```

#### 3. CDN Setup (Optional)
- Use Cloudflare for static asset caching
- Enable browser caching headers
- Optimize images with WebP format

### Security Checklist

#### Production Security
- [ ] HTTPS enabled
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Security headers implemented
- [ ] Regular dependency updates
- [ ] Error logging configured
- [ ] Backup strategy implemented

### Monitoring & Maintenance

#### 1. Set up Monitoring
```bash
# Install monitoring tools
npm install --save @sentry/node newrelic

# Configure in server/index.ts
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

#### 2. Automated Backups
```bash
# Database backup script
#!/bin/bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

#### 3. Update Strategy
```bash
# Regular updates
npm audit
npm update
npm run build
npm test  # If tests are available
```

### Support & Resources

- **Documentation**: See README.md for detailed setup
- **Issues**: Check GitHub issues for known problems
- **Community**: Join Discord/Telegram for support
- **Commercial Support**: contact@hermesaiswap.com

### Migration Checklist

Before going live:
- [ ] Database migrated and tested
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Performance testing completed
- [ ] Backup strategy implemented
- [ ] Monitoring tools configured
- [ ] User acceptance testing passed
- [ ] Rollback plan prepared

## Conclusion

This guide covers complete deployment to any major platform. For specific issues or custom requirements, refer to the platform-specific documentation or contact support.

**Production URL**: https://yourdomain.com
**Admin Panel**: Configure post-deployment
**API Health**: https://yourdomain.com/api/health