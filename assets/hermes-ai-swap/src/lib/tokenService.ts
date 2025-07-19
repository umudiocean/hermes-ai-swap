export interface Token {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_24h: number;
  address?: string;
  decimals?: number;
}

export interface TokenPrice {
  usd: number;
  usd_24h_change: number;
}

// Popular tokens with their contract addresses
export const POPULAR_TOKENS: Token[] = [
  {
    id: 'bitcoin',
    symbol: 'BTC',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 1,
    price_change_percentage_24h: 0,
    decimals: 8
  },
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 2,
    price_change_percentage_24h: 0,
    address: '0x0000000000000000000000000000000000000000',
    decimals: 18
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 3,
    price_change_percentage_24h: 0,
    address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    decimals: 6
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 4,
    price_change_percentage_24h: 0,
    address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    decimals: 18
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 5,
    price_change_percentage_24h: 0,
    address: '0xA0b86a33E6417c8c6C87dC70c0FEe2d08E3c01E5',
    decimals: 6
  },
  {
    id: 'binance-usd',
    symbol: 'BUSD',
    name: 'Binance USD',
    image: 'https://assets.coingecko.com/coins/images/9576/large/BUSD.png',
    current_price: 0,
    market_cap: 0,
    market_cap_rank: 6,
    price_change_percentage_24h: 0,
    address: '0x4Fabb145d64652a948d72533023f6E7A623C7C53',
    decimals: 18
  }
];

class TokenService {
  private baseUrl = 'https://api.coingecko.com/api/v3';
  private cache = new Map<string, { data: any; timestamp: number }>();
  private cacheTimeout = 30000; // 30 seconds

  private isValidCache(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;
    return Date.now() - cached.timestamp < this.cacheTimeout;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  private getCache(key: string): any {
    const cached = this.cache.get(key);
    return cached?.data;
  }

  async fetchTokenPrices(tokenIds: string[]): Promise<Record<string, TokenPrice>> {
    const cacheKey = `prices-${tokenIds.join(',')}`;

    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/simple/price?ids=${tokenIds.join(',')}&vs_currencies=usd&include_24hr_change=true`,
        { next: { revalidate: 30 } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch token prices');
      }

      const data = await response.json();
      const formatted: Record<string, TokenPrice> = {};

      Object.keys(data).forEach(tokenId => {
        formatted[tokenId] = {
          usd: data[tokenId].usd,
          usd_24h_change: data[tokenId].usd_24h_change || 0
        };
      });

      this.setCache(cacheKey, formatted);
      return formatted;
    } catch (error) {
      console.error('Error fetching token prices:', error);
      return {};
    }
  }

  async fetchPopularTokens(): Promise<Token[]> {
    const cacheKey = 'popular-tokens';

    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const tokenIds = POPULAR_TOKENS.map(token => token.id);
      const prices = await this.fetchTokenPrices(tokenIds);

      const updatedTokens = POPULAR_TOKENS.map(token => ({
        ...token,
        current_price: prices[token.id]?.usd || 0,
        price_change_percentage_24h: prices[token.id]?.usd_24h_change || 0
      }));

      this.setCache(cacheKey, updatedTokens);
      return updatedTokens;
    } catch (error) {
      console.error('Error fetching popular tokens:', error);
      return POPULAR_TOKENS;
    }
  }

  async searchTokens(query: string, limit = 10): Promise<Token[]> {
    const cacheKey = `search-${query}-${limit}`;

    if (this.isValidCache(cacheKey)) {
      return this.getCache(cacheKey);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/search?query=${encodeURIComponent(query)}`,
        { next: { revalidate: 300 } }
      );

      if (!response.ok) {
        throw new Error('Failed to search tokens');
      }

      const data = await response.json();
      const results: Token[] = data.coins.slice(0, limit).map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.large,
        current_price: 0,
        market_cap: coin.market_cap_rank || 0,
        market_cap_rank: coin.market_cap_rank || 0,
        price_change_percentage_24h: 0
      }));

      this.setCache(cacheKey, results);
      return results;
    } catch (error) {
      console.error('Error searching tokens:', error);
      return [];
    }
  }

  async getTokenPrice(tokenId: string): Promise<number> {
    try {
      const prices = await this.fetchTokenPrices([tokenId]);
      return prices[tokenId]?.usd || 0;
    } catch (error) {
      console.error('Error fetching token price:', error);
      return 0;
    }
  }

  // Calculate swap rate between two tokens
  calculateSwapRate(fromToken: Token, toToken: Token, amount: number): number {
    if (fromToken.current_price === 0 || toToken.current_price === 0) return 0;
    return (amount * fromToken.current_price) / toToken.current_price;
  }

  // Format price with appropriate decimals
  formatPrice(price: number): string {
    if (price >= 1) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } else {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 4,
        maximumFractionDigits: 8
      }).format(price);
    }
  }

  // Format percentage change
  formatPercentageChange(change: number): string {
    const formatted = Math.abs(change).toFixed(2);
    return change >= 0 ? `+${formatted}%` : `-${formatted}%`;
  }
}

export const tokenService = new TokenService();
