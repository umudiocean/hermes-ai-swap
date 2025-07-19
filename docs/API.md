# HermesAI Swap API Documentation

## Base URL
- Development: `http://localhost:5000`
- Production: `https://yourdomain.com`

## Authentication
Most endpoints require wallet address authentication through Web3 wallet connection.

## Endpoints

### Users

#### GET /api/users/:walletAddress
Get or create user by wallet address.

**Parameters:**
- `walletAddress` (string): Ethereum wallet address

**Response:**
```json
{
  "id": 1,
  "walletAddress": "0x...",
  "createdAt": "2025-07-18T00:00:00.000Z"
}
```

#### GET /api/users/:walletAddress/stats
Get user statistics and rewards.

**Response:**
```json
{
  "totalSwaps": 5,
  "totalVolume": "1500.50",
  "totalRewards": "500000",
  "pendingRewards": "100000",
  "claimedRewards": "400000"
}
```

#### GET /api/users/:walletAddress/activity
Get user activity history.

**Response:**
```json
[
  {
    "id": 1,
    "type": "swap",
    "fromToken": "BNB",
    "toToken": "USDT",
    "amount": "1.0",
    "reward": "100000",
    "timestamp": "2025-07-18T00:00:00.000Z",
    "txHash": "0x..."
  }
]
```

### Swaps

#### POST /api/swaps
Record a new swap transaction.

**Request Body:**
```json
{
  "userWalletAddress": "0x...",
  "fromToken": "BNB",
  "toToken": "USDT",
  "fromAmount": "1.0",
  "toAmount": "650.5",
  "txHash": "0x...",
  "referralCode": "1001"
}
```

**Response:**
```json
{
  "id": 1,
  "reward": "100000",
  "referralReward": "10000",
  "success": true
}
```

### Referrals

#### GET /api/referrals/:walletAddress/code
Get referral code for user.

**Response:**
```json
{
  "referralCode": "1001",
  "referralUrl": "https://hermesaiswap.com/?ref=1001"
}
```

#### POST /api/referrals/generate
Generate new referral code (costs 0.0006 BNB).

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "txHash": "0x..."
}
```

#### GET /api/referrals/:walletAddress/stats
Get referral statistics.

**Response:**
```json
{
  "totalReferrals": 10,
  "totalSwapsByReferrals": 25,
  "totalRewardsEarned": "250000",
  "unclaimedRewards": "50000"
}
```

#### GET /api/referrals/:walletAddress/list
Get list of referrals.

**Response:**
```json
[
  {
    "referredWallet": "0x...",
    "joinDate": "2025-07-18T00:00:00.000Z",
    "totalSwaps": 3,
    "totalRewards": "30000"
  }
]
```

#### GET /api/referrals/:walletAddress/rewards
Get claimable referral rewards.

**Response:**
```json
{
  "totalEarned": "100000",
  "totalClaimed": "50000",
  "unclaimedRewards": "50000",
  "rewards": [
    {
      "amount": "10000",
      "fromSwap": "0x...",
      "timestamp": "2025-07-18T00:00:00.000Z",
      "claimed": false
    }
  ]
}
```

#### POST /api/referrals/claim
Claim referral rewards.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "amount": "50000"
}
```

### Health Check

#### GET /api/health
Check API health status.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "uptime": 3600,
  "version": "1.0.0"
}
```

## Error Responses

All endpoints may return these error formats:

### 400 Bad Request
```json
{
  "error": "Invalid wallet address format"
}
```

### 404 Not Found
```json
{
  "error": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database connection failed"
}
```

## Rate Limiting
- Default: 100 requests per 15 minutes per IP
- Adjustable via `RATE_LIMIT_MAX_REQUESTS` environment variable

## CORS
- Development: All origins allowed
- Production: Configure specific domains

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Swap Transactions Table
```sql
CREATE TABLE swap_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  from_token VARCHAR(10) NOT NULL,
  to_token VARCHAR(10) NOT NULL,
  from_amount DECIMAL(20,8) NOT NULL,
  to_amount DECIMAL(20,8) NOT NULL,
  reward_amount DECIMAL(20,8) DEFAULT 100000,
  tx_hash VARCHAR(66) UNIQUE,
  referral_code INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Referrals Table
```sql
CREATE TABLE referrals (
  id SERIAL PRIMARY KEY,
  referrer_wallet VARCHAR(42) NOT NULL,
  referred_wallet VARCHAR(42) NOT NULL,
  referral_code INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(referrer_wallet, referred_wallet)
);
```

## SDK Usage (Future)

```javascript
import { HermesAI } from 'hermesai-swap-sdk';

const hermesai = new HermesAI({
  apiUrl: 'https://yourdomain.com',
  walletAddress: '0x...'
});

// Get user stats
const stats = await hermesai.getUserStats();

// Record swap
await hermesai.recordSwap({
  fromToken: 'BNB',
  toToken: 'USDT',
  fromAmount: '1.0',
  toAmount: '650.5',
  txHash: '0x...'
});
```

## Webhooks (Optional Enhancement)

Configure webhooks for real-time notifications:

```javascript
// Webhook payload example
{
  "event": "swap.completed",
  "data": {
    "userWallet": "0x...",
    "fromToken": "BNB",
    "toToken": "USDT",
    "amount": "1.0",
    "reward": "100000",
    "timestamp": "2025-07-18T00:00:00.000Z"
  }
}
```

## Testing

```bash
# Test API endpoints
curl -X GET https://yourdomain.com/api/health
curl -X GET https://yourdomain.com/api/users/0x.../stats
```

For complete API testing, use the provided Postman collection in `/docs/postman/`.