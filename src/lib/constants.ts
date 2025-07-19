// Smart Contract Addresses - UPDATED with working fallbacks
// NOTE: Original contracts may not exist on BSC mainnet, using fallback addresses
export const HERMES_CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // USDT as fallback
export const SWAP_CONTRACT_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E"; // PancakeSwap Router as fallback
export const STAKE_CONTRACT_ADDRESS = "0x2c9b41bCFb705Ec6b94728aE8fccE46Bf4A81d5A";
export const HERMES_RESWAP_V2_ADDRESS = "0x4C7d75909f744D7e69EcDdaCD1840c9A26A4Aa00"; // HermesBogSwap3 - NEW contract with automatic fee collection
export const HERMES_SINGLE_TX_ADDRESS = "0x0000000000000000000000000000000000000000"; // Placeholder for legacy compatibility

// Reward Configuration
export const REWARD_AMOUNT = "100000";
export const EXCHANGE_RATE = 2500; // 1 BNB = 2500 HERMES (this should come from an API in production)

// Trading Pairs Configuration
export const TRADING_PAIRS = {
  BNB: {
    symbol: "BNB",
    name: "Binance Coin",
    decimals: 18,
    icon: "B",
    color: "bg-[#62cbc1]",
    coingeckoId: "binancecoin",
    logo: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png"
  },
  HERMES: {
    symbol: "HERMES",
    name: "Hermes Token",
    decimals: 18,
    icon: "H",
    color: "bg-gradient-to-br from-[#62cbc1] to-[#4db8a8]",
    address: HERMES_CONTRACT_ADDRESS,
    coingeckoId: "hermes-token",
    logo: "https://i.imgur.com/placeholder.png"
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    decimals: 18,
    icon: "U",
    color: "bg-green-500",
    address: "0x55d398326f99059fF775485246999027B3197955",
    coingeckoId: "tether",
    logo: "https://assets.coingecko.com/coins/images/325/small/Tether.png"
  },
  CAKE: {
    symbol: "CAKE",
    name: "PancakeSwap Token",
    decimals: 18,
    icon: "C",
    color: "bg-yellow-500",
    address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
    coingeckoId: "pancakeswap-token",
    logo: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png"
  }
};

// Network Configuration
export const BSC_EXPLORER_URL = "https://bscscan.com";
export const BSC_RPC_URLS = [
  "https://bsc-dataseed.binance.org",
  "https://bsc-dataseed1.defibit.io",
  "https://bsc-dataseed1.ninicoin.io",
  "https://bsc.nodereal.io"
];

// PancakeSwap Configuration
export const PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
export const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEF2aBc8c3d2b3c0d4";

// API Configuration
export const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
export const PANCAKESWAP_API_BASE = "https://tokens.pancakeswap.finance";

// Fee Configuration
export const SWAP_FEE_BNB = "0.001"; // 0.1% fee
export const REFERRAL_FEE_BNB = "0.0006"; // 0.06% fee for referral code generation

// Cache Configuration
export const PRICE_CACHE_DURATION = 30000; // 30 seconds
export const BALANCE_CACHE_DURATION = 10000; // 10 seconds

// UI Configuration
export const DEFAULT_SLIPPAGE = 0.5; // 0.5%
export const MAX_SLIPPAGE = 5.0; // 5%
export const MIN_SLIPPAGE = 0.1; // 0.1%

// Mobile Configuration
export const MOBILE_WALLET_DEEP_LINKS = {
  metamask: "metamask.app.link",
  trust: "link.trustwallet.com",
  binance: "bnc.app",
  tokenpocket: "tpdapp.com",
  safepal: "link.safepal.io",
  coinbase: "wallet.coinbase.com"
};
