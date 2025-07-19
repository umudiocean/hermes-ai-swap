import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/polyfills"; // Import polyfills first
import "./lib/i18n"; // Initialize i18n system
// Web3Modal types declared globally
import "./lib/web3modal"; // Initialize Web3Modal
import "./lib/pancakeswapMobile"; // PancakeSwap-style mobile redirect

// PancakeSwap-style mobile redirect is auto-executed in pancakeswapMobile.ts

// MetaMask mobile browser auto-connection optimization
if (typeof window !== 'undefined') {
  const isMetaMaskBrowser = window.navigator.userAgent.includes('MetaMask') || 
                           window.ethereum?.isMetaMask;
  
  if (isMetaMaskBrowser) {
    // Auto-detect MetaMask in mobile browser and prepare for connection
    // MetaMask mobile browser detected - optimizing experience
    
    // Force proper viewport for MetaMask browser
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
      );
    }
    
    // Prevent MetaMask browser scroll issues
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'auto';
  }
}

// ServiceWorker registration for PWA functionality
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ ServiceWorker registered successfully');
      })
      .catch((error) => {
        // Silent registration failure - PWA features disabled but app still works
        // ServiceWorker registration failed (expected in development)
      });
  });
}

// Initialize Web3Modal before rendering app
console.log('🚀 Initializing Hermes AI Swap...');

createRoot(document.getElementById("root")!).render(<App />);
