import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SwapPage from "@/pages/swap";
import ReferralPage from "@/pages/referral";
import StakePage from "@/pages/stake";

import Header from "@/components/Header";
import "./lib/i18n"; // Initialize i18n system

import AnimatedBanner from "@/components/AnimatedBanner";
import MobileBanner from "@/components/MobileBanner";
import MobileWalletOptimizer from "@/components/MobileWalletOptimizer";
import NotFound from "@/pages/not-found";
import { setupMobileWalletDetection } from "@/lib/mobileWallet";
import { initializeWalletRedirect } from "@/lib/walletBrowserRedirect";
import { useEffect } from "react";
function Router() {
  return (
    <MobileWalletOptimizer>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
        <AnimatedBanner />
        <Header />
        <Switch>
          <Route path="/" component={SwapPage} />
          <Route path="/swap" component={SwapPage} />
          <Route path="/referral" component={ReferralPage} />
          <Route path="/stake" component={StakePage} />

          <Route component={NotFound} />
        </Switch>
        
        {/* Mobile UX Enhancement Banner */}
        <MobileBanner />
      </div>
    </MobileWalletOptimizer>
  );
}

function App() {
  useEffect(() => {
    // Initialize PancakeSwap-style wallet redirect system
    initializeWalletRedirect();
    
    // Legacy mobile wallet detection (still needed for some features)  
    setupMobileWalletDetection();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
