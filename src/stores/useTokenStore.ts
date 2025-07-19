import { create } from "zustand";
import { pancakeSwapService, type Token } from "@/lib/pancakeswap";

interface TokenState {
  tokens: Token[];
  customTokens: Token[];
  fromToken: Token | null;
  toToken: Token | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadTokens: () => Promise<void>;
  addCustomToken: (address: string) => Promise<Token | null>;
  setFromToken: (token: Token) => void;
  setToToken: (token: Token) => void;
  swapTokens: () => void;
  clearError: () => void;
}

// Default tokens
const DEFAULT_BNB_TOKEN: Token = {
  chainId: 56,
  address: "BNB",
  name: "Binance Coin",
  symbol: "BNB",
  decimals: 18,
  logoURI: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaeBF2De08d9173bc095c.png"
};

const DEFAULT_HERMES_TOKEN: Token = {
  chainId: 56,
  address: "0x9495ab3549338bf14ad2f86cbcf79c7b574bba37",
  name: "Hermes AI Token",
  symbol: "HERMES",
  decimals: 18,
  logoURI: "https://i.ibb.co/hXr6j8h/10xlogo.jpg"
};

export const useTokenStore = create<TokenState>((set, get) => ({
  tokens: [],
  customTokens: [],
  fromToken: DEFAULT_BNB_TOKEN,
  toToken: DEFAULT_HERMES_TOKEN,
  isLoading: false,
  error: null,

  loadTokens: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const tokens = await pancakeSwapService.fetchTokenList();
      
      // Add our custom HERMES token at the beginning, then all real tokens from PancakeSwap
      const allTokens = [DEFAULT_HERMES_TOKEN, ...tokens];
      
      // Sort tokens: put popular ones first (BNB, CAKE, USDT, etc.) then alphabetically
      const sortedTokens = allTokens.sort((a, b) => {
        // Priority order for popular tokens
        const priorityOrder = ['HERMES', 'BNB', 'CAKE', 'USDT', 'USDC', 'BUSD', 'ETH', 'BTC'];
        const aIndex = priorityOrder.indexOf(a.symbol);
        const bIndex = priorityOrder.indexOf(b.symbol);
        
        // If both tokens are in priority list, sort by priority
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        }
        // If only one is in priority list, prioritize it
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
        
        // Otherwise sort alphabetically by symbol
        return a.symbol.localeCompare(b.symbol);
      });
      
      set({ 
        tokens: sortedTokens,
        isLoading: false 
      });
    } catch (error: any) {
      console.error("Failed to load tokens:", error);
      
      // Fallback to essential tokens if API fails
      set({ 
        tokens: [DEFAULT_BNB_TOKEN, DEFAULT_HERMES_TOKEN],
        isLoading: false,
        error: "Failed to load full token list. Using essential tokens." 
      });
    }
  },

  addCustomToken: async (address: string): Promise<Token | null> => {
    try {
      console.log("🔍 Adding custom token:", address);
      set({ isLoading: true, error: null });
      
      // Validate address format
      if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
        console.error("❌ Invalid address format:", address);
        throw new Error("Invalid contract address format");
      }

      // Check if token already exists
      const { tokens, customTokens } = get();
      const allTokens = [...tokens, ...customTokens];
      const existingToken = allTokens.find(t => 
        t.address.toLowerCase() === address.toLowerCase()
      );
      
      if (existingToken) {
        console.log("✅ Token already exists:", existingToken);
        set({ isLoading: false });
        return existingToken;
      }

      console.log("🔗 Connecting to BSC blockchain...");
      
      // Use multiple RPC endpoints for reliability
      const rpcEndpoints = [
        "https://bsc-dataseed1.binance.org/",
        "https://bsc-dataseed2.binance.org/", 
        "https://bsc-dataseed3.binance.org/",
        "https://bsc-dataseed4.binance.org/"
      ];
      
      let provider;
      let tokenContract;
      
      // Try multiple RPC endpoints
      for (const rpc of rpcEndpoints) {
        try {
          console.log(`📡 Trying RPC: ${rpc}`);
          provider = new (await import("ethers")).ethers.JsonRpcProvider(rpc);
          
          tokenContract = new (await import("ethers")).ethers.Contract(
            address,
            [
              "function name() view returns (string)",
              "function symbol() view returns (string)", 
              "function decimals() view returns (uint8)"
            ],
            provider
          );
          
          // Test connection by calling name()
          await tokenContract.name();
          console.log(`✅ Connected successfully via ${rpc}`);
          break;
        } catch (error) {
          console.warn(`❌ RPC failed: ${rpc}`, error);
          continue;
        }
      }
      
      if (!tokenContract) {
        throw new Error("Failed to connect to BSC network");
      }

      console.log("📋 Fetching token details...");
      
      // Get token details with timeout and retry
      const fetchWithTimeout = async (promise: Promise<any>, timeout = 10000) => {
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        );
        return Promise.race([promise, timeoutPromise]);
      };
      
      const [tokenName, tokenSymbol, tokenDecimals] = await Promise.all([
        fetchWithTimeout(tokenContract.name()),
        fetchWithTimeout(tokenContract.symbol()),
        fetchWithTimeout(tokenContract.decimals())
      ]);
      
      console.log("✅ Token details fetched:", { 
        name: tokenName, 
        symbol: tokenSymbol, 
        decimals: Number(tokenDecimals) 
      });

      const newCustomToken: Token = {
        chainId: 56,
        address: address,
        name: tokenName,
        symbol: tokenSymbol,
        decimals: Number(tokenDecimals),
        logoURI: `https://via.placeholder.com/32x32/FFD700/000000?text=${tokenSymbol.charAt(0)}`
      };

      // Add to custom tokens
      set(state => ({
        customTokens: [...state.customTokens, newCustomToken],
        isLoading: false,
        error: null
      }));

      console.log("✅ Custom token added successfully:", newCustomToken);
      return newCustomToken;

    } catch (error: any) {
      console.error("❌ Failed to add custom token:", error);
      
      let errorMessage = "Could not retrieve token information";
      
      if (error.message?.includes("Timeout")) {
        errorMessage = "Network timeout - please try again";
      } else if (error.message?.includes("CALL_EXCEPTION")) {
        errorMessage = "Invalid token contract or not on BSC network";
      } else if (error.message?.includes("network")) {
        errorMessage = "Network connection failed - check BSC network";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ 
        isLoading: false,
        error: errorMessage
      });
      return null;
    }
  },

  setFromToken: (token: Token) => {
    const { toToken } = get();
    
    // Prevent selecting the same token for both from and to
    if (toToken && token.address === toToken.address) {
      set({ 
        fromToken: token,
        toToken: null 
      });
    } else {
      set({ fromToken: token });
    }
  },

  setToToken: (token: Token) => {
    const { fromToken } = get();
    
    // Prevent selecting the same token for both from and to
    if (fromToken && token.address === fromToken.address) {
      set({ 
        toToken: token,
        fromToken: null 
      });
    } else {
      set({ toToken: token });
    }
  },

  swapTokens: () => {
    const { fromToken, toToken } = get();
    set({ 
      fromToken: toToken,
      toToken: fromToken 
    });
  },

  clearError: () => set({ error: null }),
}));