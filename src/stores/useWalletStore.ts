import { create } from 'zustand';
import { ethers } from 'ethers';
import { Web3Service } from '../lib/web3';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  bnbBalance: string;
  hermesBalance: string;
  provider: any;
  signer: any;
  web3Service: Web3Service | null;
  isLoading: boolean;
  error: string | null;
  
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updateBalances: () => Promise<void>;
  clearError: () => void;
}

const HERMES_CONTRACT_ADDRESS = '0x9495aB3549338BF14aD2F86CbcF79C7b574bba37';

// Multiple RPC endpoints for fallback
const BSC_RPC_URLS = [
  'https://bsc-dataseed1.binance.org',
  'https://bsc-dataseed2.binance.org',
  'https://bsc-dataseed3.binance.org',
  'https://bsc-dataseed4.binance.org',
  'https://bsc.nodereal.io',
  'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
];

// Fallback provider for when MetaMask RPC fails
const createFallbackProvider = () => {
  const providers = BSC_RPC_URLS.map(url => new ethers.JsonRpcProvider(url));
  return new ethers.FallbackProvider(providers, 1);
};

export const useWalletStore = create<WalletState>((set, get) => ({
  isConnected: false,
  address: null,
  bnbBalance: '0.00',
  hermesBalance: '0.00',
  provider: null,
  signer: null,
  web3Service: null,
  isLoading: false,
  error: null,

  connectWallet: async () => {
    console.log('🔧 Starting wallet connection...');
    try {
      set({ isLoading: true, error: null });
      
      console.log('🔧 Checking MetaMask...');
      if (typeof window.ethereum === 'undefined') {
        console.error('❌ MetaMask not installed');
        throw new Error('MetaMask not installed');
      }
      console.log('✅ MetaMask found');
      
      console.log('🔧 Requesting accounts...');
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      console.log('✅ Accounts approved');
      
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      console.log('✅ Address obtained:', address);

      // Initialize Web3Service
      const web3Service = new Web3Service();
      web3Service.setProvider(provider, signer);

      set({
        isConnected: true,
        address,
        provider,
        signer,
        web3Service,
        isLoading: false,
      });

      console.log('🔧 Updating balances...');
      await get().updateBalances();
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
    set({
      isConnected: false,
      address: null,
      bnbBalance: '0.00',
      hermesBalance: '0.00',
      provider: null,
      signer: null,
      web3Service: null,
      error: null,
    });
    console.log('✅ Wallet disconnected');
  },

  updateBalances: async () => {
    console.log('🔧 Updating balances...');
    try {
      const { address, provider } = get();
      if (!address || !provider) {
        console.log('❌ No address or provider available');
        return;
      }

      console.log('🔧 Fetching BNB balance...');
      // Try to get BNB balance with fallback
      let bnbFormatted = "0.00";
      try {
        const bnbBalance = await provider.getBalance(address);
        bnbFormatted = ethers.formatEther(bnbBalance);
        console.log('✅ BNB balance:', bnbFormatted);
      } catch (error: any) {
        console.warn('⚠️ MetaMask RPC failed, trying fallback provider...');
        try {
          const fallbackProvider = createFallbackProvider();
          const bnbBalance = await fallbackProvider.getBalance(address);
          bnbFormatted = ethers.formatEther(bnbBalance);
          console.log('✅ BNB balance (fallback):', bnbFormatted);
        } catch (fallbackError) {
          console.error('❌ Both MetaMask and fallback RPC failed:', fallbackError);
          bnbFormatted = "0.00";
        }
      }

      console.log('🔧 Fetching HERMES balance...');
      // Get HERMES balance with fallback
      let hermesFormatted = "0.00";
      try {
        const hermesContract = new ethers.Contract(
          HERMES_CONTRACT_ADDRESS,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        
        const hermesBalance = await hermesContract.balanceOf(address);
        hermesFormatted = ethers.formatEther(hermesBalance);
        console.log('✅ HERMES balance:', hermesFormatted);
      } catch (error: any) {
        console.warn('⚠️ MetaMask HERMES balance failed, trying fallback...');
        try {
          const fallbackProvider = createFallbackProvider();
          const hermesContract = new ethers.Contract(
            HERMES_CONTRACT_ADDRESS,
            ['function balanceOf(address) view returns (uint256)'],
            fallbackProvider
          );
          
          const hermesBalance = await hermesContract.balanceOf(address);
          hermesFormatted = ethers.formatEther(hermesBalance);
          console.log('✅ HERMES balance (fallback):', hermesFormatted);
        } catch (fallbackError) {
          console.warn('⚠️ Failed to get HERMES balance:', fallbackError);
          hermesFormatted = "0.00";
        }
      }

      set({
        bnbBalance: parseFloat(bnbFormatted).toFixed(4),
        hermesBalance: parseFloat(hermesFormatted).toFixed(2),
      });
      
      console.log('✅ Balance update complete');
    } catch (error: any) {
      console.error('❌ Balance update error:', error);
      set({ error: error.message });
    }
  },

  clearError: () => set({ error: null }),
}));
