import { create } from "zustand";
import { apiRequest } from "../lib/queryClient";

interface UserStats {
  totalSwaps: number;
  totalVolumeBNB: string;
  totalEarnedHermes: string;
  pendingRewards: string;
  feesSaved: string;
  feesSavedBNB: string;
}

interface RecentActivity {
  id: string;
  type: "swap" | "claim";
  description: string;
  amount: string;
  timestamp: Date;
  status: "completed" | "pending" | "failed";
}

interface RewardsState {
  stats: UserStats;
  recentActivity: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadUserStats: (walletAddress: string) => Promise<void>;
  recordSwap: (txHash: string, fromAmount: string, toAmount: string, fromToken?: string, toToken?: string) => Promise<any>;
  claimRewards: (walletAddress: string) => Promise<void>;
  clearError: () => void;
}

const initialStats: UserStats = {
  totalSwaps: 0,
  totalVolumeBNB: "0.00",
  totalEarnedHermes: "0.00",
  pendingRewards: "0.00",
  feesSaved: "0.00",
  feesSavedBNB: "0.000000",
};

export const useRewardsStore = create<RewardsState>((set, get) => ({
  stats: initialStats,
  recentActivity: [],
  isLoading: false,
  error: null,

  loadUserStats: async (walletAddress: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Try to load user stats from API
      const response = await apiRequest("GET", `/api/users/${walletAddress}/stats`);
      const data = await response.json();
      
      set({ 
        stats: {
          totalSwaps: data.totalSwaps || 0,
          totalVolumeBNB: data.totalVolumeBNB || "0.00",
          totalEarnedHermes: data.totalEarnedHermes || "0.00",
          pendingRewards: data.pendingRewards || "0.00",
          feesSaved: data.feesSaved || "0.00", // Use backend calculated value
          feesSavedBNB: data.feesSavedBNB || "0.000000", // Use backend calculated value
        },
        isLoading: false 
      });

      // Try to load recent activity
      try {
        const activityResponse = await apiRequest("GET", `/api/users/${walletAddress}/activity`);
        const activityData = await activityResponse.json();
        set({ recentActivity: activityData });
      } catch (activityError) {
        console.warn("Failed to load recent activity, using empty array:", activityError);
        set({ recentActivity: [] });
      }
    } catch (error: any) {
      console.warn("Failed to load user stats, using default values:", error);
      // Use default values instead of throwing error
      set({ 
        stats: initialStats,
        recentActivity: [],
        isLoading: false,
        error: null // Don't show error to user for now
      });
    }
  },

  recordSwap: async (txHash: string, fromAmount: string, toAmount: string, fromToken?: string, toToken?: string) => {
    try {
      // Get wallet address from wallet store
      const { useWalletStore } = await import('./useWalletStore');
      const walletAddress = useWalletStore.getState().address;
      
      if (!walletAddress) {
        throw new Error("Wallet not connected");
      }

      const response = await apiRequest("POST", "/api/swaps", {
        txHash,
        walletAddress,
        fromToken: fromToken || "BNB",
        toToken: toToken || "HERMES",
        fromAmount,
        toAmount,
      });
      
      const swapResult = await response.json();

      // Update stats locally with proper HERMES reward tracking
      const currentStats = get().stats;
      const rewardAmount = 100000; // 100,000 HERMES per swap
      
      // Calculate volume correctly: only count BNB volume
      let volumeToAdd = 0;
      if (fromToken === "BNB" || fromToken === "WBNB") {
        volumeToAdd = parseFloat(fromAmount);
      } else if (toToken === "BNB" || toToken === "WBNB") {
        volumeToAdd = parseFloat(toAmount);
      } else {
        // For token-to-token swaps, estimate BNB equivalent (rough estimation)
        volumeToAdd = parseFloat(fromAmount) * 0.001; // Very rough BNB equivalent
      }
      
      // Generate random fees saved between 10-22 cents
      const feesSavedUSD = (Math.random() * (0.22 - 0.10) + 0.10);
      const currentFeesSaved = parseFloat(currentStats.feesSaved || "0");
      
      set({
        stats: {
          ...currentStats,
          totalSwaps: currentStats.totalSwaps + 1,
          totalVolumeBNB: (parseFloat(currentStats.totalVolumeBNB) + volumeToAdd).toFixed(4),
          totalEarnedHermes: (parseFloat(currentStats.totalEarnedHermes) + rewardAmount).toFixed(0),
          pendingRewards: (parseFloat(currentStats.pendingRewards) + rewardAmount).toFixed(0),
          feesSaved: (currentFeesSaved + feesSavedUSD).toFixed(2),
        },
      });

      // Add to recent activity (limit to 3 items)
      const newActivity: RecentActivity = {
        id: txHash,
        type: "swap",
        description: `${fromAmount} BNB → ${toAmount} HERMES`,
        amount: "+100K",
        timestamp: new Date(),
        status: "completed",
      };

      set(state => ({
        recentActivity: [newActivity, ...state.recentActivity.slice(0, 2)]
      }));
      
      // Return swap result for referral processing
      return swapResult;
    } catch (error: any) {
      console.error("Failed to record swap:", error);
      set({ error: "Failed to record swap" });
      throw error; // Re-throw to handle in SwapInterface
    }
  },

  claimRewards: async (walletAddress: string) => {
    try {
      // Use smart contract interaction for claiming HERMES
      const { web3Service } = await import('../lib/web3');
      const provider = web3Service.provider;
      
      if (!provider) {
        throw new Error("Wallet connection not found");
      }

      const { claimHermesReward } = await import('../lib/swapEngine');
      const result = await claimHermesReward(provider);

      // Update stats
      const currentStats = get().stats;
      const claimedAmount = currentStats.pendingRewards;
      
      set({
        stats: {
          ...currentStats,
          totalEarnedHermes: (parseFloat(currentStats.totalEarnedHermes) + parseFloat(claimedAmount)).toFixed(2),
          pendingRewards: "0.00",
        },
      });

      // Add to recent activity (limit to 3 items)
      const newActivity: RecentActivity = {
        id: `claim-${Date.now()}`, // Generate unique ID for claim activity
        type: "claim",
        description: `${parseFloat(claimedAmount).toLocaleString()} HERMES claimed`,
        amount: `+${parseFloat(claimedAmount).toLocaleString()}`,
        timestamp: new Date(),
        status: "completed",
      };

      set(state => ({
        recentActivity: [newActivity, ...state.recentActivity.slice(0, 2)]
      }));
    } catch (error: any) {
      console.error("Failed to claim rewards:", error);
      set({ error: "Failed to claim rewards" });
    }
  },

  clearError: () => set({ error: null }),
}));
