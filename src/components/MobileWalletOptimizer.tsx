import React, { useEffect, useState } from 'react';
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { BrowserProvider } from 'ethers';
import { isMobile } from '@/lib/mobileWallet';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Smartphone, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

interface MobileWalletOptimizerProps {
  children: React.ReactNode;
}

export default function MobileWalletOptimizer({ children }: MobileWalletOptimizerProps) {
  const { walletProvider } = useWeb3ModalProvider();
  const { address, isConnected } = useWeb3ModalAccount();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [walletStatus, setWalletStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');

  // Monitor network status for PWA
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "Connection Restored",
        description: "You're back online. All features are now available.",
        duration: 3000,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "Offline Mode",
        description: "Limited functionality available while offline.",
        duration: 5000,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Monitor wallet connection status
  useEffect(() => {
    if (isConnected && address) {
      setWalletStatus('connected');
    } else if (walletProvider) {
      setWalletStatus('connecting');
    } else {
      setWalletStatus('disconnected');
    }
  }, [isConnected, address, walletProvider]);

  // Enhance mobile wallet provider detection and MetaMask browser optimization
  useEffect(() => {
    // Detect if running inside MetaMask mobile browser
    const isMetaMaskBrowser = window.navigator.userAgent.includes('MetaMask') || 
                             window.ethereum?.isMetaMask;
    
    if (isMetaMaskBrowser) {
      // Optimize specifically for MetaMask mobile browser
      const style = document.createElement('style');
      style.textContent = `
        /* MetaMask mobile browser optimizations */
        html, body {
          height: 100vh;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Ensure buttons are properly sized for MetaMask browser */
        button {
          min-height: 48px;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Optimize inputs for wallet browser */
        input, select {
          -webkit-appearance: none;
          border-radius: 8px;
          font-size: 16px; /* Prevents zoom on iOS */
        }
        
        /* Fix MetaMask browser scrolling issues */
        .min-h-screen {
          min-height: 100vh;
          min-height: -webkit-fill-available;
        }
      `;
      document.head.appendChild(style);
      
      // Add MetaMask-specific meta tags
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        );
      }
    }

    if (isMobile() && walletProvider) {
      const provider = new BrowserProvider(walletProvider);
      
      // Optimize for mobile wallet apps
      provider.getNetwork().then((network) => {
        if (Number(network.chainId) !== 56) {
          toast({
            title: "Network Warning",
            description: "Please switch to BSC (Binance Smart Chain)",
            duration: 5000,
          });
        }
      }).catch(() => {
        // Silent fail for network detection
      });
    }
  }, [walletProvider, toast]);

  // Mobile-specific optimizations
  const mobileOptimizations = {
    // Prevent zoom on input focus (mobile UX)
    preventZoom: () => {
      if (isMobile()) {
        const viewportMeta = document.querySelector('meta[name="viewport"]');
        if (viewportMeta) {
          viewportMeta.setAttribute('content', 
            'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
          );
        }
      }
    },

    // Optimize touch targets
    optimizeTouchTargets: () => {
      if (isMobile()) {
        const style = document.createElement('style');
        style.textContent = `
          /* Mobile touch optimization */
          button, input, select, textarea {
            min-height: 44px;
            touch-action: manipulation;
          }
          
          /* Prevent 300ms click delay */
          * {
            touch-action: manipulation;
          }
          
          /* Smooth scrolling for mobile */
          body {
            -webkit-overflow-scrolling: touch;
          }
          
          /* Hide mobile browser UI when scrolling */
          html {
            height: 100%;
            overflow: hidden;
          }
          
          body {
            height: 100%;
            overflow: auto;
          }
        `;
        document.head.appendChild(style);
      }
    }
  };

  useEffect(() => {
    mobileOptimizations.preventZoom();
    mobileOptimizations.optimizeTouchTargets();
  }, []);

  // Status indicator for mobile
  const StatusIndicator = () => {
    if (!isMobile()) return null;

    return (
      <div className="fixed top-2 right-2 z-50 flex items-center space-x-2">
        {/* Network Status */}
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          isOnline ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
        }`}>
          {isOnline ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
        </div>

        {/* Wallet Status */}
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${
          walletStatus === 'connected' ? 'bg-green-500/20 text-green-300' :
          walletStatus === 'connecting' ? 'bg-[#62cbc1]/20 text-[#62cbc1]' :
          walletStatus === 'error' ? 'bg-red-500/20 text-red-300' :
          'bg-gray-500/20 text-gray-300'
        }`}>
          {walletStatus === 'connected' ? (
            <CheckCircle className="w-3 h-3" />
          ) : walletStatus === 'connecting' ? (
            <div className="w-3 h-3 border border-[#62cbc1] border-t-transparent rounded-full animate-spin"></div>
          ) : walletStatus === 'error' ? (
            <AlertCircle className="w-3 h-3" />
          ) : (
            <Smartphone className="w-3 h-3" />
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <StatusIndicator />
      {children}
    </>
  );
}