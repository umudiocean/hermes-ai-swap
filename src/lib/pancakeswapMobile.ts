// Universal mobile access - no forced redirects
export const pancakeswapMobileRedirect = (): void => {
  if (typeof window === 'undefined') return;
  
  // Simply detect mobile - no redirects
  const userAgent = window.navigator.userAgent.toLowerCase();
  const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  if (isMobileDevice) {
    // Mobile device detected - universal wallet access enabled
  }
};

// Auto-execute on load - PancakeSwap style
if (typeof window !== 'undefined') {
  // Execute immediately when script loads
  pancakeswapMobileRedirect();
  
  // Also execute on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', pancakeswapMobileRedirect);
  } else {
    pancakeswapMobileRedirect();
  }
}

export default pancakeswapMobileRedirect;