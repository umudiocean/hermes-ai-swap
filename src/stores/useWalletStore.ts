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

const HERMES_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955'; // USDT as fallback

// Multiple RPC endpoints for fallback - Updated with more reliable endpoints
const BSC_RPC_URLS = [
  'https://bsc-dataseed.binance.org',
  'https://bsc-dataseed1.defibit.io',
  'https://bsc-dataseed1.ninicoin.io',
  'https://bsc.nodereal.io',
  'https://bsc-mainnet.nodereal.io/v1/64a9df0874fb4a93b9d0a3849de012d3',
  'https://bsc.publicnode.com',
  'https://bsc-rpc.publicnode.com',
  'https://bsc.blockpi.network/v1/rpc/public',
];

// Enhanced fallback provider with better error handling
const createFallbackProvider = () => {
  const providers = BSC_RPC_URLS.map(url => {
    const provider = new ethers.JsonRpcProvider(url);
    return provider;
  });
  
  // Use priority-based fallback
  return new ethers.FallbackProvider(providers, 1);
};

// Enhanced balance fetching with multiple fallbacks
const fetchBalanceWithFallback = async (address: string, contractAddress?: string) => {
  const errors = [];
  
  // Try MetaMask first
  try {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Configure provider for BSC (disable EIP-1559 features)
      // Note: BSC doesn't support EIP-1559, so we'll handle this in the provider configuration
      
      if (contractAddress) {
        const contract = new ethers.Contract(
          contractAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await contract.balanceOf(address);
        return ethers.formatEther(balance);
      } else {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      }
    }
  } catch (error: any) {
    errors.push(`MetaMask: ${error.message}`);
  }
  
  // Try fallback providers
  for (let i = 0; i < BSC_RPC_URLS.length; i++) {
    try {
      const provider = new ethers.JsonRpcProvider(BSC_RPC_URLS[i], {
        chainId: 56,
        name: 'BSC'
      });
      
      if (contractAddress) {
        const contract = new ethers.Contract(
          contractAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        const balance = await contract.balanceOf(address);
        return ethers.formatEther(balance);
      } else {
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      }
    } catch (error: any) {
      errors.push(`RPC ${i + 1}: ${error.message}`);
    }
  }
  
  // If all failed, return 0
  console.warn('⚠️ All RPC endpoints failed:', errors);
  return "0.00";
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
      const { address } = get();
      if (!address) {
        console.log('❌ No address available');
        return;
      }

      console.log('🔧 Fetching BNB balance with enhanced fallback...');
      const bnbFormatted = await fetchBalanceWithFallback(address);
      console.log('✅ BNB balance:', bnbFormatted);

      console.log('🔧 Fetching HERMES balance with enhanced fallback...');
      const hermesFormatted = await fetchBalanceWithFallback(address, HERMES_CONTRACT_ADDRESS);
      console.log('✅ HERMES balance:', hermesFormatted);

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
