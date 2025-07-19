import { ethers } from 'ethers';

export interface WalletProvider {
  name: string;
  icon: string;
  isInstalled: () => boolean;
  connect: () => Promise<{ provider: ethers.BrowserProvider; signer: ethers.JsonRpcSigner; address: string }>;
  isConnected: () => boolean;
  getAddress: () => Promise<string>;
}

// MetaMask Provider
export const metamaskProvider: WalletProvider = {
  name: 'MetaMask',
  icon: '🦊',
  isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
  connect: async () => {
    if (!window.ethereum?.isMetaMask) {
      throw new Error('MetaMask not installed');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.ethereum?.isConnected() || false,
  getAddress: async () => {
    if (!window.ethereum?.isMetaMask) throw new Error('MetaMask not available');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

// Trust Wallet Provider
export const trustWalletProvider: WalletProvider = {
  name: 'Trust Wallet',
  icon: '🛡️',
  isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isTrust,
  connect: async () => {
    if (!window.ethereum?.isTrust) {
      throw new Error('Trust Wallet not installed');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.ethereum?.isConnected() || false,
  getAddress: async () => {
    if (!window.ethereum?.isTrust) throw new Error('Trust Wallet not available');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

// Binance Wallet Provider
export const binanceWalletProvider: WalletProvider = {
  name: 'Binance Wallet',
  icon: '🟡',
  isInstalled: () => typeof window !== 'undefined' && !!window.BinanceChain,
  connect: async () => {
    if (!window.BinanceChain) {
      throw new Error('Binance Wallet not installed');
    }
    
    await window.BinanceChain.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.BinanceChain);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.BinanceChain?.isConnected() || false,
  getAddress: async () => {
    if (!window.BinanceChain) throw new Error('Binance Wallet not available');
    const provider = new ethers.BrowserProvider(window.BinanceChain);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

// Coinbase Wallet Provider
export const coinbaseWalletProvider: WalletProvider = {
  name: 'Coinbase Wallet',
  icon: '🔵',
  isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isCoinbaseWallet,
  connect: async () => {
    if (!window.ethereum?.isCoinbaseWallet) {
      throw new Error('Coinbase Wallet not installed');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.ethereum?.isConnected() || false,
  getAddress: async () => {
    if (!window.ethereum?.isCoinbaseWallet) throw new Error('Coinbase Wallet not available');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

// OKX Wallet Provider
export const okxWalletProvider: WalletProvider = {
  name: 'OKX Wallet',
  icon: '⬛',
  isInstalled: () => typeof window !== 'undefined' && !!window.okxwallet,
  connect: async () => {
    if (!window.okxwallet) {
      throw new Error('OKX Wallet not installed');
    }
    
    await window.okxwallet.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.okxwallet);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.okxwallet?.isConnected() || false,
  getAddress: async () => {
    if (!window.okxwallet) throw new Error('OKX Wallet not available');
    const provider = new ethers.BrowserProvider(window.okxwallet);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

// Brave Wallet Provider
export const braveWalletProvider: WalletProvider = {
  name: 'Brave Wallet',
  icon: '🦁',
  isInstalled: () => typeof window !== 'undefined' && !!window.ethereum?.isBraveWallet,
  connect: async () => {
    if (!window.ethereum?.isBraveWallet) {
      throw new Error('Brave Wallet not installed');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.ethereum?.isConnected() || false,
  getAddress: async () => {
    if (!window.ethereum?.isBraveWallet) throw new Error('Brave Wallet not available');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

// Generic Ethereum Provider (fallback)
export const genericEthereumProvider: WalletProvider = {
  name: 'Ethereum Wallet',
  icon: '💎',
  isInstalled: () => typeof window !== 'undefined' && !!window.ethereum,
  connect: async () => {
    if (!window.ethereum) {
      throw new Error('No Ethereum wallet found');
    }
    
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  },
  isConnected: () => window.ethereum?.isConnected() || false,
  getAddress: async () => {
    if (!window.ethereum) throw new Error('No Ethereum wallet available');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return await signer.getAddress();
  }
};

export const supportedWallets: WalletProvider[] = [
  metamaskProvider,
  trustWalletProvider,
  binanceWalletProvider,
  coinbaseWalletProvider,
  okxWalletProvider,
  braveWalletProvider,
  genericEthereumProvider
];

export function getAvailableWallets(): WalletProvider[] {
  return supportedWallets.filter(wallet => wallet.isInstalled());
}

export function detectWalletType(): string {
  if (window.ethereum?.isMetaMask) return 'MetaMask';
  if (window.ethereum?.isTrust) return 'Trust Wallet';
  if (window.ethereum?.isCoinbaseWallet) return 'Coinbase Wallet';
  if (window.ethereum?.isBraveWallet) return 'Brave Wallet';
  if (window.BinanceChain) return 'Binance Wallet';
  if (window.okxwallet) return 'OKX Wallet';
  if (window.ethereum) return 'Unknown Wallet';
  return 'No Wallet';
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
    BinanceChain?: any;
    okxwallet?: any;
  }
}