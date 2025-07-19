import { create } from 'zustand';
import { walletService } from '../lib/walletService';
import { contractService } from '../lib/contractService';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  bnbBalance: string;
  hermesBalance: string;
  isLoading: boolean;
  error: string | null;
  userStats: {
    swapCount: number;
    claimableRewards: string;
    canClaim: boolean;
  } | null;
  
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateBalances: () => Promise<void>;
  getUserStats: () => Promise<void>;
  clearError: () => void;
}

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  bnbBalance: '0.00',
  hermesBalance: '0.00',
  isLoading: false,
  error: null,
  userStats: null,

  connectWallet: async () => {
    console.log('🔧 Starting wallet connection...');
    try {
      set({ isLoading: true, error: null });
      
      const address = await walletService.connectWallet();
      console.log('✅ Address obtained:', address);

      set({
        isConnected: true,
        address,
        isLoading: false,
      });

      console.log('🔧 Updating balances...');
      await get().updateBalances();
      await get().getUserStats();
      console.log('✅ Wallet connection complete');
      
    } catch (error: any) {
      console.error('❌ Wallet connection failed:', error);
      set({
        error: error.message,
        isLoading: false,
      });
    }
  },

  disconnectWallet: () => {
    console.log('🔧 Disconnecting wallet...');
    walletService.disconnect();
    set({
      isConnected: false,
      address: null,
      bnbBalance: '0.00',
      hermesBalance: '0.00',
      userStats: null,
      error: null,
    });
    console.log('✅ Wallet disconnected');
  },

  updateBalances: async () => {
    console.log('🔧 Updating balances...');
    try {
      const { address } = get();
      if (!address) {
        console.log('❌ No address available');
        return;
      }

      console.log('🔧 Fetching BNB balance...');
      const bnbBalance = await walletService.getTokenBalance("BNB", address);
      console.log('✅ BNB balance:', bnbBalance);

      console.log('🔧 Fetching HERMES balance...');
      const hermesBalance = await walletService.getTokenBalance("0x9495aB3549338BF14aD2F86CbcF79C7b574bba37", address);
      console.log('✅ HERMES balance:', hermesBalance);

      set({
        bnbBalance: parseFloat(bnbBalance).toFixed(4),
        hermesBalance: parseFloat(hermesBalance).toFixed(2),
      });
      
      console.log('✅ Balance update complete');
    } catch (error: any) {
      console.error('❌ Balance update error:', error);
      set({ error: error.message });
    }
  },

  getUserStats: async () => {
    console.log('🔧 Getting user stats...');
    try {
      const { address } = get();
      if (!address) {
        console.log('❌ No address available');
        return;
      }

      const stats = await contractService.getUserStats(address);
      console.log('✅ User stats loaded:', stats);

      set({ userStats: stats });
    } catch (error: any) {
      console.error('❌ User stats error:', error);
      set({ 
        userStats: { swapCount: 0, claimableRewards: "0", canClaim: false }
      });
    }
  },

  clearError: () => set({ error: null }),
}));
