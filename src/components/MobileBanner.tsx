import React, { useState, useEffect } from 'react';
import { X, Smartphone, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isMobile, generateWalletDeepLink } from '@/lib/mobileWallet';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  isMobileDevice, 
  isInWalletBrowser, 
  showWalletSelectionModal,
  getPreferredWallet 
} from '@/lib/walletBrowserRedirect';

export default function MobileBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    // PancakeSwap-style wallet browser detection
    const shouldShow = () => {
      // Only on mobile devices
      if (!isMobileDevice()) return false;
      
      // Don't show if already in wallet browser
      if (isInWalletBrowser()) {
        // Already in wallet browser - PancakeSwap style
        return false;
      }
      
      // Disable mobile banner completely
      return false;
    };

    if (shouldShow()) {
      setIsVisible(true);
      // PancakeSwap-style mobile banner activated
    }
  }, [dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
    // Remember dismissal for this session and longer term
    sessionStorage.setItem('mobileBannerDismissed', 'true');
    localStorage.setItem('hermes-wallet-redirect-dismissed', Date.now().toString());
  };

  const handleOpenInWallet = () => {
    // PancakeSwap-style wallet selection triggered
    
    // Show wallet selection modal instead of direct redirect
    showWalletSelectionModal();
    
    // Dismiss banner after user action
    handleDismiss();
  };

  // Don't render if not mobile or dismissed
  if (!isMobileDevice() || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-gradient-to-r from-[#6495ed] to-[#4169e1] text-white p-3 rounded-lg shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <Smartphone className="w-4 h-4 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-medium text-sm mb-1">
                🚀 Open in wallet browser for best experience
              </h3>
              <p className="text-xs text-white/90 mb-2">
                Better performance in MetaMask, Trust Wallet or other wallet apps
              </p>
              <div className="flex space-x-2">
                <Button
                  onClick={handleOpenInWallet}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white text-xs px-2 py-1 h-auto rounded"
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Open
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="text-white/80 hover:text-white text-xs px-2 py-1 h-auto"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="ghost"
            className="text-white/80 hover:text-white p-1 h-auto ml-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}