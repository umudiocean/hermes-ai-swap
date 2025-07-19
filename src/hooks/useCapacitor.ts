import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export const useCapacitor = () => {
  const [isNative, setIsNative] = useState(false);
  const [platform, setPlatform] = useState<string>('web');

  useEffect(() => {
    const initCapacitor = async () => {
      const isNativeApp = Capacitor.isNativePlatform();
      const currentPlatform = Capacitor.getPlatform();
      
      setIsNative(isNativeApp);
      setPlatform(currentPlatform);

      if (isNativeApp) {
        // Configure status bar for dark theme
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#1a1a1a' });
        } catch (error) {
          console.log('StatusBar not available:', error);
        }

        // Hide splash screen after app loads
        try {
          await SplashScreen.hide();
        } catch (error) {
          console.log('SplashScreen not available:', error);
        }

        // Listen for app state changes
        App.addListener('appStateChange', ({ isActive }) => {
          console.log('App state changed. Is active?', isActive);
        });

        // Listen for app URL open (for deep linking)
        App.addListener('appUrlOpen', (event) => {
          console.log('App opened with URL:', event.url);
          // Handle referral links: hermesaiswap://referral?ref=1001
          if (event.url.includes('referral')) {
            const url = new URL(event.url);
            const refCode = url.searchParams.get('ref');
            if (refCode) {
              // Store referral code in localStorage
              localStorage.setItem('pendingReferralCode', refCode);
              // Redirect to referral page
              window.location.href = `/referral?ref=${refCode}`;
            }
          }
        });
      }
    };

    initCapacitor();

    return () => {
      if (isNative) {
        App.removeAllListeners();
      }
    };
  }, []);

  const triggerHaptic = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (isNative) {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Haptics not available:', error);
      }
    }
  };

  const shareApp = async (text: string, url: string) => {
    if (isNative && 'navigator' in window && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Hermes AI Swap',
          text,
          url,
        });
      } catch (error) {
        console.log('Native sharing not available:', error);
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
      }
    } else {
      // Web fallback
      await navigator.clipboard.writeText(url);
    }
  };

  return {
    isNative,
    platform,
    triggerHaptic,
    shareApp,
  };
};