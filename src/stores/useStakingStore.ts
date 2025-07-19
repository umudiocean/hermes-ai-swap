import { create } from 'zustand';
import { web3Service } from '../lib/web3';
import { stakingService } from '../lib/stakingService';

interface StakingState {
  // State
  isLoading: boolean;
  error: string | null;
  stakingInfo: any;
  
  // Actions
  stakeTokens: (userAddress: string, poolId: string, amount: string) => Promise<void>;
  unstakeTokens: (userAddress: string, poolId: string, amount: string) => Promise<void>;
  claimRewards: (userAddress: string, poolId: string) => Promise<void>;
  getStakingInfo: (userAddress: string, poolId: string) => Promise<any>;
  clearError: () => void;
}

export const useStakingStore = create<StakingState>((set, get) => ({
  // Initial state
  isLoading: false,
  error: null,
  stakingInfo: null,

  // Stake tokens
  stakeTokens: async (userAddress: string, poolId: string, amount: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log(`🔒 Staking ${amount} tokens in pool ${poolId} for ${userAddress}`);
      
      const provider = web3Service.provider;
      const signer = web3Service.signer;
      
      if (!provider || !signer) {
        throw new Error("Web3 provider not available");
      }

      // Initialize staking service
      await stakingService.initialize(provider, signer);
      
      // Execute stake transaction
      const txHash = await stakingService.stakeTokens(userAddress, poolId, amount);
      
      console.log(`✅ Stake successful: ${txHash}`);
      
      // Refresh staking info
      const info = await get().getStakingInfo(userAddress, poolId);
      set({ stakingInfo: info });
      
    } catch (error: any) {
      console.error("❌ Stake failed:", error);
      set({ error: error.message || "Stake failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Unstake tokens
  unstakeTokens: async (userAddress: string, poolId: string, amount: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log(`🔓 Unstaking ${amount} tokens from pool ${poolId} for ${userAddress}`);
      
      const provider = web3Service.provider;
      const signer = web3Service.signer;
      
      if (!provider || !signer) {
        throw new Error("Web3 provider not available");
      }

      // Initialize staking service
      await stakingService.initialize(provider, signer);
      
      // Execute unstake transaction
      const txHash = await stakingService.unstakeTokens(userAddress, poolId, amount);
      
      console.log(`✅ Unstake successful: ${txHash}`);
      
      // Refresh staking info
      const info = await get().getStakingInfo(userAddress, poolId);
      set({ stakingInfo: info });
      
    } catch (error: any) {
      console.error("❌ Unstake failed:", error);
      set({ error: error.message || "Unstake failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Claim rewards
  claimRewards: async (userAddress: string, poolId: string) => {
    set({ isLoading: true, error: null });
    
    try {
      console.log(`🎁 Claiming rewards from pool ${poolId} for ${userAddress}`);
      
      const provider = web3Service.provider;
      const signer = web3Service.signer;
      
      if (!provider || !signer) {
        throw new Error("Web3 provider not available");
      }

      // Initialize staking service
      await stakingService.initialize(provider, signer);
      
      // Execute claim transaction
      const txHash = await stakingService.claimRewards(userAddress, poolId);
      
      console.log(`✅ Claim successful: ${txHash}`);
      
      // Refresh staking info
      const info = await get().getStakingInfo(userAddress, poolId);
      set({ stakingInfo: info });
      
    } catch (error: any) {
      console.error("❌ Claim failed:", error);
      set({ error: error.message || "Claim failed" });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // Get staking info
  getStakingInfo: async (userAddress: string, poolId: string) => {
    try {
      console.log(`📊 Loading staking info for ${userAddress} in pool ${poolId}`);
      
      const provider = web3Service.provider;
      if (!provider) {
        throw new Error("Web3 provider not available");
      }

      // Initialize staking service
      await stakingService.initialize(provider, null);
      
      // Get staking information
      const info = await stakingService.getStakingInfo(userAddress, poolId);
      
      console.log(`✅ Staking info loaded:`, info);
      return info;
      
    } catch (error: any) {
      console.error("❌ Failed to load staking info:", error);
      
      // Return fallback info
      return {
        userStaked: "0",
        userRewards: "0",
        userBalance: "0",
        totalStaked: "0",
        apy: 0,
        lockPeriod: 0
      };
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  }
})); 