import React from 'react';
import { Button } from '../components/ui/button';
import { ExternalLink, Smartphone } from 'lucide-react';
import { 
  isMobileDevice, 
  isInWalletBrowser, 
  showWalletSelectionModal 
} from '../lib/walletBrowserRedirect';

interface WalletRedirectButtonProps {
  className?: string;
  children?: React.ReactNode;
}

export default function WalletRedirectButton({ 
  className = "", 
  children = "Open in Wallet Browser" 
}: WalletRedirectButtonProps) {
  
  const handleClick = () => {
    if (isMobileDevice()) {
      showWalletSelectionModal();
    } else {
      // Desktop users get a simple message
      alert('This feature is designed for mobile devices. Please access www.hermesaiswap.com from your mobile device.');
    }
  };

  // Don't show if already in wallet browser
  if (isInWalletBrowser()) {
    return null;
  }

  // Don't show on desktop (optional - you might want to show different message)
  if (!isMobileDevice()) {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className={`flex items-center space-x-2 ${className}`}
      variant="outline"
    >
      <Smartphone className="w-4 h-4" />
      <span>{children}</span>
      <ExternalLink className="w-3 h-3" />
    </Button>
  );
}