# HermesAI Swap - Complete Production Package

## Overview
Professional DeFi swap platform built with React, TypeScript, Node.js, and PostgreSQL. Supports token swapping with 600+ PancakeSwap tokens, staking (81.11% APY), referral system, and mobile PWA.

## Quick Start
```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Setup database
npm run db:push

# Development
npm run dev

# Production build
npm run build
npm start
```

## System Requirements
- Node.js 18+ or 20+
- PostgreSQL database
- 2GB+ RAM
- 10GB+ storage

## Environment Variables
See `.env.example` for complete list. Required:
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - production/development

## Deployment Platforms

### Vercel
1. Import repository to Vercel
2. Add environment variables in dashboard
3. Deploy automatically

### Netlify  
1. Connect repository to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables

### Railway/DigitalOcean
1. Connect repository
2. Add PostgreSQL addon
3. Configure environment variables
4. Deploy

## Features
- ✅ Token swapping (BNB, USDT, CAKE, HERMES + 600 tokens)
- ✅ Staking with 81.11% APY
- ✅ Referral system with rewards
- ✅ Multi-language support (11 languages)
- ✅ Mobile PWA optimization
- ✅ Web3 wallet integration
- ✅ Real-time price feeds

## Support
For deployment assistance, contact: support@hermesaiswap.com

## License
MIT License - See deployment-guide.md for commercial usage terms.