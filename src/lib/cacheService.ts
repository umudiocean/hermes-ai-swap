// Smart caching service for performance optimization
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expires: number;
}

class CacheService {
  private cache = new Map<string, CacheItem<any>>();
  
  // Cache durations in milliseconds
  private readonly CACHE_DURATIONS = {
    TOKEN_PRICE: 30000,      // 30 seconds for token prices
    TOKEN_BALANCE: 15000,    // 15 seconds for balances
    TOKEN_LIST: 300000,      // 5 minutes for token list
    SWAP_QUOTE: 10000,       // 10 seconds for swap quotes
    GAS_ESTIMATE: 60000,     // 1 minute for gas estimates
  };

  set<T>(key: string, data: T, duration?: keyof typeof this.CACHE_DURATIONS | number): void {
    const expires = typeof duration === 'number' 
      ? duration 
      : this.CACHE_DURATIONS[duration || 'TOKEN_PRICE'];
      
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + expires
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  // Generate smart cache keys
  generateTokenPriceKey(address: string): string {
    return `token_price_${address.toLowerCase()}`;
  }

  generateBalanceKey(tokenAddress: string, walletAddress: string): string {
    return `balance_${tokenAddress.toLowerCase()}_${walletAddress.toLowerCase()}`;
  }

  generateSwapQuoteKey(fromToken: string, toToken: string, amount: string): string {
    return `swap_quote_${fromToken.toLowerCase()}_${toToken.toLowerCase()}_${amount}`;
  }

  // Optimistic cache update for instant UI feedback
  setOptimistic<T>(key: string, data: T, duration?: keyof typeof this.CACHE_DURATIONS): void {
    this.set(`optimistic_${key}`, data, duration);
  }

  getOptimistic<T>(key: string): T | null {
    return this.get(`optimistic_${key}`);
  }

  confirmOptimistic<T>(key: string, confirmedData: T, duration?: keyof typeof this.CACHE_DURATIONS): void {
    this.invalidate(`optimistic_${key}`);
    this.set(key, confirmedData, duration);
  }
}

export const cacheService = new CacheService();