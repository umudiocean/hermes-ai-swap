/**
 * PancakeSwap-style wallet browser redirect system
 * Automatically detects mobile browsers and redirects to appropriate wallet browser
 */

interface WalletInfo {
  name: string;
  deepLink: string;
  userAgent: string[];
  downloadUrl: string;
}

const WALLET_CONFIGS: WalletInfo[] = [
  {
    name: "MetaMask",
    deepLink: "https://metamask.app.link/dapp/www.hermesaiswap.com",
    userAgent: ["MetaMask"],
    downloadUrl: "https://metamask.io/download/"
  },
  {
    name: "Trust Wallet",
    deepLink: "https://link.trustwallet.com/open_url?coin_id=20000714&url=https://www.hermesaiswap.com",
    userAgent: ["Trust", "TrustWallet"],
    downloadUrl: "https://trustwallet.com/"
  },
  {
    name: "Binance Wallet",
    deepLink: "bnc://app.binance.com/cedefi/dapp?url=https://www.hermesaiswap.com",
    userAgent: ["Binance"],
    downloadUrl: "https://www.binance.com/en/download"
  },
  {
    name: "TokenPocket",
    deepLink: "tpoutside://params?blockchain=bsc&dappUrl=https://www.hermesaiswap.com",
    userAgent: ["TokenPocket"],
    downloadUrl: "https://www.tokenpocket.pro/"
  },
  {
    name: "SafePal",
    deepLink: "safepalwallet://open_url?url=https://www.hermesaiswap.com",
    userAgent: ["SafePal"],
    downloadUrl: "https://safepal.io/"
  },
  {
    name: "Coinbase Wallet",
    deepLink: "https://go.cb-w.com/dapp?cb_url=https://www.hermesaiswap.com",
    userAgent: ["CoinbaseWallet", "Coinbase"],
    downloadUrl: "https://wallet.coinbase.com/"
  }
];

/**
 * Detects current wallet browser from user agent
 */
export function detectCurrentWallet(): WalletInfo | null {
  const userAgent = navigator.userAgent;
  
  for (const wallet of WALLET_CONFIGS) {
    for (const identifier of wallet.userAgent) {
      if (userAgent.includes(identifier)) {
        console.log(`🔍 Detected wallet browser: ${wallet.name}`);
        return wallet;
      }
    }
  }
  
  return null;
}

/**
 * Checks if device is mobile
 */
export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Checks if running in wallet browser
 */
export function isInWalletBrowser(): boolean {
  return detectCurrentWallet() !== null;
}

/**
 * PancakeSwap-style automatic wallet redirect
 * If mobile and not in wallet browser, redirect to most popular wallet
 */
export function redirectToWalletBrowser(forceRedirect = false): boolean {
  // Skip if already in wallet browser
  if (isInWalletBrowser() && !forceRedirect) {
    // Already in wallet browser, no redirect needed
    return false;
  }

  // Skip if not mobile
  if (!isMobileDevice()) {
    console.log('ℹ️ Desktop detected, no wallet redirect needed');
    return false;
  }

  // Get preferred wallet from localStorage
  const preferredWallet = getPreferredWallet();
  const targetWallet = preferredWallet || WALLET_CONFIGS[0]; // Default to MetaMask

  console.log(`🚀 Redirecting to ${targetWallet.name} browser...`);
  
  try {
    // Try deep link first
    window.location.href = targetWallet.deepLink;
    
    // Fallback to download page after delay
    setTimeout(() => {
      if (document.visibilityState === 'visible') {
        window.open(targetWallet.downloadUrl, '_blank');
      }
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('Failed to redirect to wallet browser:', error);
    return false;
  }
}

/**
 * Gets user's preferred wallet from localStorage
 */
export function getPreferredWallet(): WalletInfo | null {
  try {
    const preferred = localStorage.getItem('hermesPreferredWallet');
    if (preferred) {
      return WALLET_CONFIGS.find(w => w.name === preferred) || null;
    }
  } catch (error) {
    console.error('Failed to get preferred wallet:', error);
  }
  return null;
}

/**
 * Sets user's preferred wallet
 */
export function setPreferredWallet(walletName: string): void {
  try {
    localStorage.setItem('hermesPreferredWallet', walletName);
    console.log(`✅ Set preferred wallet: ${walletName}`);
  } catch (error) {
    console.error('Failed to set preferred wallet:', error);
  }
}

/**
 * Shows wallet selection modal for mobile users
 */
export function showWalletSelectionModal(): void {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.className = 'wallet-selection-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
  `;

  // Create modal content
  const content = document.createElement('div');
  content.style.cssText = `
    background: #1a1a1a;
    border-radius: 16px;
    padding: 24px;
    max-width: 90%;
    width: 400px;
    color: white;
    text-align: center;
  `;

  content.innerHTML = `
    <h3 style="margin: 0 0 16px 0; font-size: 20px; color: #62cbc1;">Choose Wallet</h3>
    <p style="margin: 0 0 24px 0; color: #ccc;">Which wallet browser would you like to open HermesAI Swap in?</p>
    <div id="wallet-buttons"></div>
    <button id="close-modal" style="margin-top: 16px; padding: 8px 16px; background: #333; border: none; border-radius: 8px; color: white; cursor: pointer;">Cancel</button>
  `;

  const buttonsContainer = content.querySelector('#wallet-buttons');
  
  // Add wallet buttons
  WALLET_CONFIGS.forEach(wallet => {
    const button = document.createElement('button');
    button.style.cssText = `
      display: block;
      width: 100%;
      margin: 8px 0;
      padding: 12px;
      background: #2a2a2a;
      border: 1px solid #444;
      border-radius: 8px;
      color: white;
      cursor: pointer;
      transition: background 0.2s;
    `;
    button.textContent = wallet.name;
    button.onclick = () => {
      setPreferredWallet(wallet.name);
      window.location.href = wallet.deepLink;
      document.body.removeChild(modal);
    };
    
    button.onmouseover = () => button.style.background = '#3a3a3a';
    button.onmouseout = () => button.style.background = '#2a2a2a';
    
    buttonsContainer?.appendChild(button);
  });

  // Close modal handler
  content.querySelector('#close-modal')?.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.appendChild(content);
  document.body.appendChild(modal);
}

/**
 * PancakeSwap-style initialization
 * Call this on app startup
 */
export function initializeWalletRedirect(): void {
  // Initializing PancakeSwap-style wallet redirect
  
  // Check if we should auto-redirect
  const autoRedirect = localStorage.getItem('hermesAutoRedirect') !== 'false';
  
  if (autoRedirect && isMobileDevice() && !isInWalletBrowser()) {
    // Show banner instead of immediate redirect for better UX
    // Mobile detected, wallet redirect available
    showMobileBanner();
  }
  
  // Log current state
  const currentWallet = detectCurrentWallet();
  if (currentWallet) {
    // Running in wallet browser
  } else if (isMobileDevice()) {
    // Mobile browser detected, wallet redirect available
  } else {
    // Desktop browser detected
  }
}

/**
 * Shows mobile banner with wallet redirect option
 */
function showMobileBanner(): void {
  // Only show if not already shown
  if (document.querySelector('.wallet-redirect-banner')) return;
  
  const banner = document.createElement('div');
  banner.className = 'wallet-redirect-banner';
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: linear-gradient(45deg, #62cbc1, #4db8a8);
    color: #000;
    padding: 12px;
    text-align: center;
    z-index: 9999;
    font-weight: 600;
    font-size: 14px;
  `;
  
  banner.innerHTML = `
    <div>
      🚀 En iyi deneyim için cüzdan browserında açın
      <button id="open-wallet" style="margin-left: 8px; padding: 4px 8px; background: #000; color: #62cbc1; border: none; border-radius: 4px; cursor: pointer;">Aç</button>
      <button id="close-banner" style="margin-left: 8px; padding: 4px 8px; background: transparent; border: 1px solid #000; border-radius: 4px; cursor: pointer;">✕</button>
    </div>
  `;
  
  // Event handlers
  banner.querySelector('#open-wallet')?.addEventListener('click', () => {
    showWalletSelectionModal();
  });
  
  banner.querySelector('#close-banner')?.addEventListener('click', () => {
    document.body.removeChild(banner);
    localStorage.setItem('hermesAutoRedirect', 'false');
  });
  
  document.body.appendChild(banner);
  
  // Auto-hide after 10 seconds
  setTimeout(() => {
    if (document.body.contains(banner)) {
      document.body.removeChild(banner);
    }
  }, 10000);
}

/**
 * Manual wallet redirect with user choice
 */
export function openInWallet(): void {
  if (isMobileDevice()) {
    showWalletSelectionModal();
  } else {
    // Desktop: show QR code or direct link
    alert('Bu özellik mobile cihazlar için tasarlanmıştır. Mobile cihazınızdan erişin.');
  }
}