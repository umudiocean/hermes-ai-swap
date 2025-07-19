import { ethers } from "ethers";

// BSC RPC endpoints with reliability ranking
const BSC_RPC_ENDPOINTS = [
  "https://bsc-dataseed.binance.org",           // Ana endpoint
  "https://bsc-dataseed1.binance.org",          // Binance yedek
  "https://bsc.publicnode.com",                 // Public node
  "https://rpc.ankr.com/bsc",                   // Ankr RPC
  "https://bsc-dataseed1.defibit.io",           // Defibit
  "https://bsc-dataseed1.ninicoin.io",          // Ninicoin
  "https://bsc.nodereal.io",                    // NodeReal
  "https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3"
];

// BSC için özel gas yapılandırması
export const BSC_GAS_CONFIG = {
  gasPrice: ethers.parseUnits("3", "gwei"),     // BSC için 3 Gwei
  gasLimit: 300000,                             // Yeterli gas limit
  type: 0,                                      // Legacy transaction (EIP-1559 yok)
};

interface RPCStats {
  endpoint: string;
  successCount: number;
  errorCount: number;
  lastUsed: number;
  averageResponseTime: number;
}

class BSCRpcManager {
  private providers: ethers.JsonRpcProvider[] = [];
  private stats: Map<string, RPCStats> = new Map();
  private currentProviderIndex = 0;

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    BSC_RPC_ENDPOINTS.forEach((endpoint, index) => {
      try {
        const provider = new ethers.JsonRpcProvider(endpoint, {
          chainId: 56,
          name: "binance-smart-chain"
        });
        
        this.providers.push(provider);
        
        this.stats.set(endpoint, {
          endpoint,
          successCount: 0,
          errorCount: 0,
          lastUsed: 0,
          averageResponseTime: 0
        });
      } catch (error) {
        console.warn(`Failed to initialize RPC provider ${endpoint}:`, error);
      }
    });
  }

  getOptimalProvider(): ethers.JsonRpcProvider {
    if (this.providers.length === 0) {
      throw new Error("No RPC providers available");
    }

    // Get the provider with best stats
    const bestProvider = this.getBestProvider();
    return bestProvider;
  }

  private getBestProvider(): ethers.JsonRpcProvider {
    let bestEndpoint = BSC_RPC_ENDPOINTS[0];
    let bestScore = -1;

    for (const [endpoint, stats] of this.stats) {
      const successRate = stats.successCount / (stats.successCount + stats.errorCount);
      const timeSinceLastUse = Date.now() - stats.lastUsed;
      const score = successRate * 100 + (timeSinceLastUse / 1000); // Prefer unused providers

      if (score > bestScore) {
        bestScore = score;
        bestEndpoint = endpoint;
      }
    }

    const providerIndex = BSC_RPC_ENDPOINTS.indexOf(bestEndpoint);
    return this.providers[providerIndex] || this.providers[0];
  }

  async executeWithRetry<T>(operation: (provider: ethers.JsonRpcProvider) => Promise<T>): Promise<T> {
    const errors: Error[] = [];

    for (let attempt = 0; attempt < this.providers.length; attempt++) {
      const provider = this.providers[attempt];
      const endpoint = BSC_RPC_ENDPOINTS[attempt];

      try {
        const startTime = Date.now();
        const result = await operation(provider);
        const responseTime = Date.now() - startTime;

        // Update stats
        const stats = this.stats.get(endpoint);
        if (stats) {
          stats.successCount++;
          stats.lastUsed = Date.now();
          stats.averageResponseTime = (stats.averageResponseTime + responseTime) / 2;
        }

        return result;
      } catch (error: any) {
        errors.push(error);
        
        // Update stats
        const stats = this.stats.get(endpoint);
        if (stats) {
          stats.errorCount++;
          stats.lastUsed = Date.now();
        }

        console.warn(`RPC attempt ${attempt + 1} failed (${endpoint}):`, error.message);
        
        // Continue to next provider
        continue;
      }
    }

    // All providers failed
    throw new Error(`All RPC providers failed: ${errors.map(e => e.message).join(', ')}`);
  }

  async testConnection(): Promise<boolean> {
    try {
      const provider = this.getOptimalProvider();
      const blockNumber = await provider.getBlockNumber();
      console.log("✅ BSC RPC connection successful - Block:", blockNumber);
      return true;
    } catch (error) {
      console.error("❌ BSC RPC connection failed:", error);
      return false;
    }
  }

  getStats(): RPCStats[] {
    return Array.from(this.stats.values());
  }

  // BSC için özel hata yönetimi
  handleBSCError(error: any): string {
    if (error.message.includes("eth_maxPriorityFeePerGas")) {
      return "BSC doesn't support EIP-1559, using legacy transaction";
    }
    
    if (error.message.includes("missing trie node")) {
      return "RPC node sync issue, trying fallback provider";
    }
    
    if (error.message.includes("missing revert data")) {
      return "Contract call failed, contract may not exist";
    }
    
    return error.message || "Unknown BSC error";
  }
}

export const bscRpcManager = new BSCRpcManager();