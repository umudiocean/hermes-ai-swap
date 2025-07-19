# HermesAI Swap - Troubleshooting Guide

## Common Issues & Solutions

### 1. Build & Deployment Issues

#### Issue: "Module not found" errors during build
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json dist
npm install --legacy-peer-deps
npm run build
```

#### Issue: Build succeeds but static assets not loading
```bash
# Check file structure
ls -la dist/assets/

# Verify server static path configuration
grep -n "express.static" server/index.ts

# Ensure server serves from correct directory
# Should be: app.use(express.static("dist"))
```

#### Issue: Vite build timeout or memory errors
```bash
# Increase Node.js memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Alternative: Split build process
npm run build:client
npm run build:server
```

### 2. Database Issues

#### Issue: "relation does not exist" error
```bash
# Run database migrations
npm run db:push

# If still failing, check database URL
echo $DATABASE_URL

# Test connection manually
node -e "
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
sql\`SELECT version()\`.then(console.log).catch(console.error);
"
```

#### Issue: Database connection timeout
```bash
# Check if database URL includes SSL
# Should include: ?sslmode=require

# Test with explicit SSL config
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
```

#### Issue: Permission denied on database operations
```sql
-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE hermesai_swap TO your_user;
GRANT USAGE ON SCHEMA public TO your_user;
GRANT CREATE ON SCHEMA public TO your_user;
```

### 3. Web3 & Wallet Issues

#### Issue: Wallet connection fails
```javascript
// Check Web3Modal configuration
// Ensure projectId is valid
const projectId = "your-project-id"; // From WalletConnect Cloud

// Verify network configuration
const chains = [bsc]; // BSC mainnet
```

#### Issue: Transaction failures
```javascript
// Check gas limits
const gasLimit = {
  'BNB->Token': 500000,
  'Token->BNB': 600000,
  'Token->Token': 700000
};

// Verify contract addresses
const CONTRACT_ADDRESS = "0x..."; // Ensure correct address
```

#### Issue: Token balance not updating
```bash
# Clear browser cache and localStorage
# Check token contract address
# Verify decimals configuration in tokens.ts
```

### 4. Server & Deployment Issues

#### Issue: Server crashes with memory errors
```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=2048" npm start

# Use PM2 for production
pm2 start npm --name "hermesai-swap" -- start --node-args="--max-old-space-size=2048"
```

#### Issue: Port already in use
```bash
# Find process using port
lsof -i :5000

# Kill process
sudo kill -9 $(lsof -t -i:5000)

# Or use different port
PORT=3000 npm start
```

#### Issue: CORS errors in production
```javascript
// Configure CORS properly in server/index.ts
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : true,
  credentials: true
}));
```

### 5. Performance Issues

#### Issue: Slow page load times
```bash
# Enable gzip compression
# Add to server/index.ts:
import compression from 'compression';
app.use(compression());

# Optimize bundle size
npm run build -- --analyze

# Check for large dependencies
npx webpack-bundle-analyzer dist/static/js/*.js
```

#### Issue: High memory usage
```bash
# Monitor memory usage
ps aux | grep node

# Use Node.js profiler
node --inspect npm start

# Check for memory leaks in React components
# Use React DevTools Profiler
```

### 6. Environment Issues

#### Issue: Environment variables not loading
```bash
# Check .env file location (should be in root)
ls -la .env

# Verify environment loading
node -e "console.log(process.env.DATABASE_URL)"

# For frontend vars, ensure VITE_ prefix
VITE_API_URL="https://yourdomain.com"
```

#### Issue: SSL/HTTPS issues
```bash
# Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 7. Platform-Specific Issues

#### Vercel Issues
```bash
# Increase function timeout
# In vercel.json:
{
  "functions": {
    "app.js": {
      "maxDuration": 30
    }
  }
}

# Fix serverless function size
# Move large dependencies to devDependencies
```

#### Netlify Issues
```bash
# Add _redirects file for SPA routing
echo "/*    /index.html   200" > dist/_redirects

# Fix build command in netlify.toml
[build]
  command = "npm run build"
  publish = "dist"
```

#### Railway Issues
```bash
# Add railway.json for configuration
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### 8. Mobile PWA Issues

#### Issue: PWA not installing on mobile
```javascript
// Check manifest.json validity
// Ensure service worker registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

// Verify HTTPS requirement
// PWA requires HTTPS in production
```

#### Issue: Mobile wallet connection fails
```javascript
// Check mobile deep linking
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
if (isMobile) {
  // Use mobile-specific wallet connection
  window.open(`https://metamask.app.link/dapp/${window.location.host}`);
}
```

### 9. API Issues

#### Issue: API endpoints returning 404
```bash
# Check route registration order
# API routes should be before catch-all route

# Verify route paths
curl -X GET https://yourdomain.com/api/health

# Check middleware interference
# Ensure static middleware doesn't catch API routes
```

#### Issue: Database query timeouts
```sql
-- Add indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_swap_transactions_user_id ON swap_transactions(user_id);

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM users WHERE wallet_address = '0x...';
```

### 10. Production Monitoring

#### Issue: High error rates
```bash
# Add error tracking
npm install @sentry/node

# Configure in server/index.ts
import * as Sentry from '@sentry/node';
Sentry.init({ dsn: process.env.SENTRY_DSN });

# Monitor with logs
pm2 logs hermesai-swap --lines 100
```

#### Issue: Memory leaks
```bash
# Use Node.js heap dump
node --inspect --heap-prof npm start

# Monitor with PM2
pm2 monit

# Check for unclosed connections
# Review database connection pooling
```

## Debugging Tools

### 1. Development Tools
```bash
# Enable debug mode
DEBUG=* npm start

# Use React DevTools
# Browser extension for React debugging

# Use Redux DevTools (if using Redux)
# Browser extension for state debugging
```

### 2. Production Monitoring
```bash
# PM2 monitoring
pm2 install pm2-server-monit

# Log aggregation
npm install winston
npm install winston-cloudwatch

# Performance monitoring
npm install newrelic
```

### 3. Database Debugging
```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';

-- Check slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC;

-- Monitor connections
SELECT count(*) as connections 
FROM pg_stat_activity;
```

## Emergency Procedures

### 1. Site Down Emergency
```bash
# Quick health check
curl -I https://yourdomain.com/

# Check server status
pm2 status

# Restart application
pm2 restart hermesai-swap

# Rollback to previous version
git checkout HEAD~1
npm run build
pm2 restart hermesai-swap
```

### 2. Database Emergency
```bash
# Check database connectivity
pg_isready -h hostname -p port

# Emergency database backup
pg_dump $DATABASE_URL > emergency_backup.sql

# Restore from backup
psql $DATABASE_URL < emergency_backup.sql
```

### 3. High Traffic Emergency
```bash
# Scale horizontally
pm2 scale hermesai-swap 4

# Enable rate limiting
# Check server/index.ts for rate limiting config

# Monitor resources
htop
iostat 1
```

## Prevention Best Practices

### 1. Monitoring Setup
```bash
# Set up alerts for:
# - High memory usage (>80%)
# - High CPU usage (>80%)
# - Database connection failures
# - API response time >2s
# - Error rate >1%
```

### 2. Backup Strategy
```bash
# Automated daily backups
0 2 * * * pg_dump $DATABASE_URL > backup_$(date +\%Y\%m\%d).sql

# Code backup to multiple repositories
git remote add backup https://github.com/backup/repo.git
git push backup main
```

### 3. Testing
```bash
# Load testing
npm install -g artillery
artillery quick --count 100 --num 10 https://yourdomain.com/

# API testing
npm install -g newman
newman run api-tests.postman_collection.json
```

## Getting Help

### 1. Log Analysis
```bash
# Collect relevant logs
pm2 logs hermesai-swap --lines 1000 > logs.txt

# Database logs
tail -f /var/log/postgresql/postgresql.log

# System logs
tail -f /var/log/syslog
```

### 2. Support Channels
- **GitHub Issues**: Technical problems
- **Discord**: Community support
- **Email**: support@hermesaiswap.com
- **Documentation**: Check README.md and docs/

### 3. Diagnostic Information
When reporting issues, include:
- Node.js version: `node --version`
- NPM version: `npm --version`
- OS: `uname -a`
- Error logs
- Steps to reproduce
- Expected vs actual behavior

Remember: Most issues can be resolved by following the systematic debugging approach outlined above. Start with the most common solutions and work your way to more complex diagnostics.