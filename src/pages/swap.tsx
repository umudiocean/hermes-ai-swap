import { useTranslation } from '../hooks/useTranslation';
import SwapInterface from '../components/SwapInterface';
import RewardsSidebar from '../components/RewardsSidebar';
import HermesAdvantages from '../components/HermesAdvantages';
import MobileSwapOptimizer from '../components/MobileSwapOptimizer';

export default function SwapPage() {
  const { t } = useTranslation();

  return (
    <MobileSwapOptimizer>
      <div>

        <main className="container mx-auto px-4 py-4 lg:py-6 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 swap-container">
            {/* Swap Interface */}
            <div className="lg:col-span-8">
              <div className="swap-interface w-full">
                <SwapInterface />
              </div>
            </div>

            {/* Sidebars - Mobile: stack below swap interface */}
            <div className="lg:col-span-4 space-y-4 lg:space-y-6 stats-panel">
              <RewardsSidebar />
              <HermesAdvantages />
            </div>
          </div>
        </main>
      </div>
    </MobileSwapOptimizer>
  );
}