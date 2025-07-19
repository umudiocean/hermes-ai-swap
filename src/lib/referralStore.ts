import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ReferralStats {
  totalReferrals: number;
  totalReferralSwaps: number;
  totalUnclaimedRewards: string;
  totalClaimedRewards: string;
}

interface ReferralReward {
  id: number;
  referrerUserId: number;
  referredUserId: number;
  swapTransactionId: number;
  rewardAmount: string;
  claimed: boolean;
  claimedAt: Date | null;
  createdAt: Date;
}

interface Referral {
  id: number;
  referrerUserId: number;
  referredUserId: number;
  referredWalletAddress: string;
  totalSwaps: number;
  totalRewardsEarned: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ReferralStore {
  // State
  referralCode: string | null;
  referralStats: ReferralStats | null;
  referrals: Referral[];
  unclaimedRewards: ReferralReward[];
  isLoading: boolean;
  
  // Actions
  setReferralCode: (code: string | null) => void;
  generateReferralLink: (walletAddress: string) => string;
  checkForReferralCode: () => string | null;
  createReferralRelationship: (referrerWallet: string, referredWallet: string) => Promise<void>;
  fetchReferralStats: (walletAddress: string) => Promise<void>;
  fetchReferrals: (walletAddress: string) => Promise<void>;
  fetchUnclaimedRewards: (walletAddress: string) => Promise<void>;
  claimRewards: (walletAddress: string, rewardIds: number[]) => Promise<void>;
  processReferralSwap: (swapTxId: number, referredWallet: string) => Promise<void>;
}

export const useReferralStore = create<ReferralStore>()(
  persist(
    (set, get) => ({
      // Initial state
      referralCode: null,
      referralStats: null,
      referrals: [],
      unclaimedRewards: [],
      isLoading: false,

      // Actions
      setReferralCode: (code) => {
        set({ referralCode: code });
      },

      generateReferralLink: (walletAddress) => {
        // Use Replit development domain for testing
        const baseUrl = 'https://hermes-ai-swap.replit.app';
        return `${baseUrl}/swap?ref=${walletAddress}`;
      },

      checkForReferralCode: () => {
        const urlParams = new URLSearchParams(window.location.search);
        const refCode = urlParams.get('ref');
        if (refCode && refCode !== get().referralCode) {
          set({ referralCode: refCode });
          return refCode;
        }
        return get().referralCode;
      },

      createReferralRelationship: async (referrerWallet, referredWallet) => {
        try {
          const response = await fetch('/api/referrals', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referrerWalletAddress: referrerWallet,
              referredWalletAddress: referredWallet,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to create referral relationship');
          }

          console.log('Referral relationship created successfully');
        } catch (error) {
          console.error('Error creating referral relationship:', error);
        }
      },

      fetchReferralStats: async (walletAddress) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`/api/referrals/${walletAddress}/stats`);
          
          if (response.ok) {
            const stats = await response.json();
            set({ referralStats: stats });
          }
        } catch (error) {
          console.error('Error fetching referral stats:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      fetchReferrals: async (walletAddress) => {
        try {
          const response = await fetch(`/api/referrals/${walletAddress}`);
          
          if (response.ok) {
            const referrals = await response.json();
            set({ referrals });
          }
        } catch (error) {
          console.error('Error fetching referrals:', error);
        }
      },

      fetchUnclaimedRewards: async (walletAddress) => {
        try {
          const response = await fetch(`/api/referrals/${walletAddress}/rewards`);
          
          if (response.ok) {
            const rewards = await response.json();
            set({ unclaimedRewards: rewards });
          }
        } catch (error) {
          console.error('Error fetching unclaimed rewards:', error);
        }
      },

      claimRewards: async (walletAddress, rewardIds) => {
        try {
          set({ isLoading: true });
          const response = await fetch(`/api/referrals/${walletAddress}/claim`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rewardIds }),
          });

          if (response.ok) {
            // Refresh data after claiming
            await get().fetchReferralStats(walletAddress);
            await get().fetchUnclaimedRewards(walletAddress);
          }
        } catch (error) {
          console.error('Error claiming rewards:', error);
        } finally {
          set({ isLoading: false });
        }
      },

      processReferralSwap: async (swapTxId, referredWallet) => {
        const referralCode = get().referralCode;
        if (!referralCode || referralCode === referredWallet) {
          return; // No referral or self-referral
        }

        try {
          // Create referral relationship if it doesn't exist
          await get().createReferralRelationship(referralCode, referredWallet);

          // Create referral reward for the swap
          const response = await fetch('/api/referral-rewards', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              referrerWalletAddress: referralCode,
              referredWalletAddress: referredWallet,
              swapTransactionId: swapTxId,
              rewardAmount: "10000",
            }),
          });

          if (response.ok) {
            console.log('Referral reward created for swap:', swapTxId);
          }
        } catch (error) {
          console.error('Error processing referral swap:', error);
        }
      },
    }),
    {
      name: 'hermes-referral-store',
      partialize: (state) => ({
        referralCode: state.referralCode,
      }),
    }
  )
);