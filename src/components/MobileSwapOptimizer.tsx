import React, { useEffect, useState } from 'react';
import { isMobile } from '@/lib/mobileWallet';
import { Smartphone, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileSwapOptimizerProps {
  children: React.ReactNode;
}

export default function MobileSwapOptimizer({ children }: MobileSwapOptimizerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  // Detect orientation change
  useEffect(() => {
    if (!isMobile()) return;

    const handleOrientationChange = () => {
      const newOrientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setOrientation(newOrientation);
      
      // Force re-render swap interface for better mobile layout
      window.dispatchEvent(new Event('resize'));
    };

    handleOrientationChange(); // Initial check
    window.addEventListener('orientationchange', handleOrientationChange);
    window.addEventListener('resize', handleOrientationChange);

    return () => {
      window.removeEventListener('orientationchange', handleOrientationChange);
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

  // Mobile fullscreen mode for swap interface
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  // Mobile-specific optimizations
  useEffect(() => {
    if (!isMobile()) return;

    // Add mobile-optimized styles
    const mobileStyles = document.createElement('style');
    mobileStyles.textContent = `
      /* Mobile swap interface optimizations */
      @media (max-width: 768px) {
        /* Larger touch targets for mobile */
        .mobile-optimized button {
          min-height: 48px !important;
          font-size: 16px !important;
          padding: 12px 20px !important;
        }
        
        /* Larger input fields */
        .mobile-optimized input {
          min-height: 48px !important;
          font-size: 16px !important;
          padding: 12px 16px !important;
        }
        
        /* Remove input zoom on iOS */
        .mobile-optimized input[type="number"] {
          font-size: 16px !important;
        }
        
        /* Better modal sizing */
        .mobile-optimized dialog {
          max-width: 95vw !important;
          max-height: 90vh !important;
        }
        
        /* Optimize swap cards */
        .swap-interface {
          padding: 16px !important;
          margin: 8px !important;
          border-radius: 16px !important;
        }
        
        /* Better spacing for mobile */
        .swap-container {
          gap: 12px !important;
        }
        
        /* Landscape optimizations */
        @media (orientation: landscape) {
          .swap-interface {
            max-height: 80vh;
            overflow-y: auto;
          }
        }
        
        /* Remove iOS bounce effect when inappropriate */
        .no-bounce {
          overscroll-behavior: none;
        }
        
        /* Better focus states for accessibility */
        .mobile-optimized button:focus,
        .mobile-optimized input:focus {
          outline: 2px solid #6495ed !important;
          outline-offset: 2px !important;
        }
      }
    `;
    
    document.head.appendChild(mobileStyles);
    
    // Add mobile optimization class to body
    document.body.classList.add('mobile-optimized');
    
    // Cleanup on unmount
    return () => {
      document.head.removeChild(mobileStyles);
      document.body.classList.remove('mobile-optimized');
    };
  }, []);

  // Haptic feedback for mobile interactions (if supported)
  const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (isMobile() && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [50]
      };
      navigator.vibrate(patterns[type]);
    }
  };

  // Mobile fullscreen button (only show on mobile)
  const FullscreenButton = () => {
    if (!isMobile()) return null;

    return (
      <Button
        onClick={() => {
          toggleFullscreen();
          triggerHapticFeedback('light');
        }}
        variant="outline"
        size="sm"
        className="fixed bottom-4 left-4 z-40 bg-black/50 border-white/20 text-white hover:bg-black/70"
      >
        {isFullscreen ? (
          <Minimize2 className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </Button>
    );
  };

  // Add mobile class to children wrapper
  return (
    <div className={`${isMobile() ? 'mobile-swap-optimized' : ''} ${orientation === 'landscape' ? 'landscape-mode' : 'portrait-mode'}`}>
      {children}
      <FullscreenButton />
    </div>
  );
}