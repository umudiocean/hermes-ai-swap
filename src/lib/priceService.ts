import { ethers } from "ethers";

interface TokenPrice {
  usd: number;
  usd_24h_change?: number;
}

interface PriceCache {
  [symbol: string]: {
    price: TokenPrice;
    timestamp: number;
  };
}

class PriceService {
  private cache: PriceCache = {};
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async getTokenPrice(symbol: string): Promise<TokenPrice> {
    console.log(`🔧 Fetching price for ${symbol}...`);
    const cacheKey = symbol.toLowerCase();
    const cached = this.cache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log(`✅ Using cached price for ${symbol}: $${cached.price.usd}`);
      return cached.price;
    }

    try {
      const coinId = this.getCoinGeckoId(symbol);
      console.log(`🔧 Fetching from CoinGecko for ${symbol} (${coinId})...`);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const price = data[coinId];
      
      if (!price) {
        throw new Error(`Price not found for ${symbol}`);
      }

      const result: TokenPrice = {
        usd: price.usd,
        usd_24h_change: price.usd_24h_change,
      };

      this.cache[cacheKey] = {
        price: result,
        timestamp: Date.now(),
      };

      console.log(`✅ Price fetched for ${symbol}: $${result.usd}`);
      return result;
    } catch (error) {
      console.error(`❌ Price fetch error for ${symbol}:`, error);
      return { usd: 0 };
    }
  }

  private getCoinGeckoId(symbol: string): string {
    const mapping: { [key: string]: string } = {
      'BNB': 'binancecoin',
      'HERMES': 'hermes-protocol',
      'BUSD': 'binance-usd',
      'USDT': 'tether',
      'USDC': 'usd-coin',
    };
    return mapping[symbol.toUpperCase()] || symbol.toLowerCase();
  }

  // Clear cache
  clearCache() {
    this.cache = {};
    console.log('🔧 Price cache cleared');
  }

  // Get cache status
  getCacheStatus() {
    return {
      cachedSymbols: Object.keys(this.cache),
      cacheSize: Object.keys(this.cache).length,
    };
  }
}

export const priceService = new PriceService();