import { ethers } from "ethers";
import { bscRpcManager } from "./bscRpcManager";

// Token interface
interface Token {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

// Price cache
const priceCache = new Map<string, { price: number; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds

export class PriceService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = bscRpcManager.getOptimalProvider();
  }

  // Get token price from CoinGecko
  async getTokenPrice(tokenId: string): Promise<number> {
    const cacheKey = `coingecko_${tokenId}`;
    const cached = priceCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.price;
    }

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenId}&vs_currencies=usd`
      );
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }
      
      const data = await response.json();
      const price = data[tokenId]?.usd || 0;
      
      priceCache.set(cacheKey, { price, timestamp: Date.now() });
      return price;
    } catch (error) {
      console.error(`Failed to get price for ${tokenId}:`, error);
      return 0;
    }
  }

  // Get BNB price
  async getBNBPrice(): Promise<number> {
    return this.getTokenPrice("binancecoin");
  }

  // Get HERMES price
  async getHermesPrice(): Promise<number> {
    return this.getTokenPrice("hermes-protocol");
  }

  // Get swap quote from PancakeSwap
  async getSwapQuote(
    amountIn: string,
    fromToken: Token,
    toToken: Token
  ): Promise<{
    amountOut: string;
    priceImpact: number;
    gasEstimate: string;
  }> {
    try {
      // For BNB -> HERMES swap, use simple calculation
      if (fromToken.symbol === "BNB" && toToken.symbol === "HERMES") {
        const bnbPrice = await this.getBNBPrice();
        const hermesPrice = await this.getHermesPrice();
        
        if (bnbPrice === 0 || hermesPrice === 0) {
          throw new Error("Unable to get token prices");
        }

        const amountInBNB = parseFloat(amountIn);
        const amountInUSD = amountInBNB * bnbPrice;
        const amountOutHERMES = amountInUSD / hermesPrice;
        
        // Apply 0.1% fee
        const fee = amountOutHERMES * 0.001;
        const finalAmount = amountOutHERMES - fee;

        return {
          amountOut: finalAmount.toFixed(6),
          priceImpact: 0.1, // 0.1% fee
          gasEstimate: "0.002" // Estimated gas cost
        };
      }

      // For HERMES -> BNB swap
      if (fromToken.symbol === "HERMES" && toToken.symbol === "BNB") {
        const bnbPrice = await this.getBNBPrice();
        const hermesPrice = await this.getHermesPrice();
        
        if (bnbPrice === 0 || hermesPrice === 0) {
          throw new Error("Unable to get token prices");
        }

        const amountInHERMES = parseFloat(amountIn);
        const amountInUSD = amountInHERMES * hermesPrice;
        const amountOutBNB = amountInUSD / bnbPrice;
        
        // Apply 0.1% fee
        const fee = amountOutBNB * 0.001;
        const finalAmount = amountOutBNB - fee;

        return {
          amountOut: finalAmount.toFixed(6),
          priceImpact: 0.1, // 0.1% fee
          gasEstimate: "0.002" // Estimated gas cost
        };
      }

      throw new Error("Unsupported token pair");
    } catch (error) {
      console.error("Failed to get swap quote:", error);
      return {
        amountOut: "0",
        priceImpact: 0,
        gasEstimate: "0.002"
      };
    }
  }

  // Calculate price impact
  calculatePriceImpact(amountIn: string, amountOut: string, fromToken: Token, toToken: Token): number {
    try {
      const inputValue = parseFloat(amountIn);
      const outputValue = parseFloat(amountOut);
      
      if (inputValue === 0) return 0;
      
      // Simple price impact calculation
      const impact = ((inputValue - outputValue) / inputValue) * 100;
      return Math.max(0, Math.min(impact, 100)); // Clamp between 0-100%
    } catch (error) {
      console.error("Failed to calculate price impact:", error);
      return 0;
    }
  }

  // Get minimum amount out for slippage protection
  calculateMinimumAmountOut(amountOut: string, slippage: number): string {
    try {
      const amount = parseFloat(amountOut);
      const slippageMultiplier = 1 - (slippage / 100);
      const minimumAmount = amount * slippageMultiplier;
      return minimumAmount.toFixed(6);
    } catch (error) {
      console.error("Failed to calculate minimum amount out:", error);
      return "0";
    }
  }

  // Format token amount with proper decimals
  formatTokenAmount(amount: string, decimals: number): string {
    try {
      const parsed = ethers.parseUnits(amount, decimals);
      return ethers.formatUnits(parsed, decimals);
    } catch (error) {
      console.error("Failed to format token amount:", error);
      return "0";
    }
  }

  // Get USD value of token amount
  async getUSDValue(amount: string, tokenId: string): Promise<number> {
    try {
      const price = await this.getTokenPrice(tokenId);
      const amountNum = parseFloat(amount);
      return amountNum * price;
    } catch (error) {
      console.error("Failed to get USD value:", error);
      return 0;
    }
  }

  // Clear price cache
  clearCache(): void {
    priceCache.clear();
  }

  // Get cache stats
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: priceCache.size,
      entries: Array.from(priceCache.keys())
    };
  }
}

export const priceService = new PriceService();