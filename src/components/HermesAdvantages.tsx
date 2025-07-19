import { useTranslation } from "@/hooks/useTranslation";
import { Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function HermesAdvantages() {
  const { t } = useTranslation();
  const [totalSavedBNB, setTotalSavedBNB] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Simulate fee savings accumulation
  useEffect(() => {
    const savedAmount = localStorage.getItem('hermes-total-saved');
    if (savedAmount) {
      setTotalSavedBNB(parseFloat(savedAmount));
    }
    // Force refresh translations
    setRefreshKey(Date.now());
  }, []);

  // Add random savings between 0.10-0.25 USD converted to BNB
  const simulateFeeSavings = () => {
    const usdSaved = Math.random() * (0.25 - 0.10) + 0.10; // Random between 0.10-0.25 USD
    const bnbPrice = 654.72; // Current BNB price
    const bnbSaved = usdSaved / bnbPrice;
    
    const newTotal = totalSavedBNB + bnbSaved;
    setTotalSavedBNB(newTotal);
    localStorage.setItem('hermes-total-saved', newTotal.toString());
  };

  // Listen for swap events to trigger savings simulation
  useEffect(() => {
    const handleSwapSuccess = () => {
      simulateFeeSavings();
    };

    window.addEventListener('swapSuccess', handleSwapSuccess);
    return () => window.removeEventListener('swapSuccess', handleSwapSuccess);
  }, [totalSavedBNB]);

  return (
    <div className="relative bg-black border border-[#62cbc1] shadow-lg shadow-[#62cbc1]/30 rounded-xl p-4 lg:p-6 max-w-sm lg:max-w-none mobile-card">
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#62cbc1]/10 via-transparent to-[#62cbc1]/10 rounded-xl blur-sm"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-[#62cbc1] flex-shrink-0" />
          <h3 className="text-white font-semibold text-lg">
            {t('advantages.title')}
          </h3>
        </div>

        {/* Advantages List */}
        <div className="space-y-3 text-white text-sm">
          <div className="flex items-start gap-2">
            <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✅</span>
            <span className="leading-relaxed">{t('advantages.bestPrice')}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✅</span>
            <span className="leading-relaxed">{t('advantages.gasSavings')}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✅</span>
            <span className="leading-relaxed">{t('advantages.instantReward')}</span>
          </div>
          
          <div className="flex items-start gap-2">
            <span className="text-green-400 font-bold mt-0.5 flex-shrink-0">✅</span>
            <span className="leading-relaxed">
              {t('advantages.totalSaved')}: {' '}
              <span className="text-[#62cbc1] font-semibold">
                {totalSavedBNB.toFixed(6)} BNB
              </span>
            </span>
          </div>
        </div>

        {/* Subtle animation */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#62cbc1] rounded-full animate-pulse"></div>
      </div>
    </div>
  );
}