// Mobile wallet deep linking utility
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

export const isMetaMaskMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if running inside MetaMask mobile app
  return Boolean(
    window.ethereum?.isMetaMask && 
    window.navigator.userAgent.includes('Mobile')
  );
};

export const isTrustWalletMobileApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if running inside Trust Wallet mobile app
  return Boolean(
    window.ethereum?.isTrust ||
    window.navigator.userAgent.includes('TrustWallet')
  );
};

// Universal wallet connection - no forced deep links
export const generateWalletDeepLink = (wallet: string, dappUrl: string): string => {
  // Return same URL for all wallets - let Web3Modal handle connections
  return dappUrl;
};

// Universal mobile access - no forced redirects
export const redirectToWalletApp = (): void => {
  // No automatic redirects - let users choose their wallet via Web3Modal
  // Mobile device detected - Web3Modal will handle wallet selection
};

// Universal mobile wallet detection - no forced redirects
export const setupMobileWalletDetection = (): void => {
  if (typeof window === 'undefined') return;
  
  // Detect mobile device
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
  
  // Just log mobile detection - no redirects
  if (isMobileDevice) {
    console.log('Mobile device detected - Web3Modal will provide wallet options');
  }
};