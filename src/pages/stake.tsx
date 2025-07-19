import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useTranslation } from 'react-i18next';
import { useWalletStore } from '../stores/useWalletStore';
import WalletConnect from '../components/WalletConnect';
import StakeFarm from '../components/StakeFarm';
import { Coins, TrendingUp, Clock, Zap, Lock, Unlock, Calculator, Wallet, DollarSign, Sparkles, Target, Trophy, Star, Flame, Gem, BookOpen, Info, AlertTriangle } from 'lucide-react';

export default function StakePage() {
  const { t } = useTranslation();
  const { isConnected } = useWalletStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Coins className="h-10 w-10 text-[#62cbc1]" />
            Hermes AI Staking Farms
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Stake your tokens and earn high APY rewards with our advanced staking pools. 
            Lock your tokens for maximum returns and compound your earnings.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total Value Locked</p>
                  <p className="text-2xl font-bold text-white">$0.00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">Active Stakers</p>
                  <p className="text-2xl font-bold text-white">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm">Total Rewards</p>
                  <p className="text-2xl font-bold text-white">0 HERMES</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8 text-[#62cbc1]" />
                <div>
                  <p className="text-gray-400 text-sm">Average APY</p>
                  <p className="text-2xl font-bold text-white">46.27%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Staking Interface */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-[#62cbc1]" />
                  Staking Farms
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Choose your preferred staking pool and start earning rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!isConnected ? (
                  <div className="text-center py-12">
                    <Wallet className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                      Connect Your Wallet
                    </h3>
                    <p className="text-gray-500 mb-6">
                      Connect your wallet to start staking and earning rewards
                    </p>
                    <WalletConnect />
                  </div>
                ) : (
                  <StakeFarm />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="h-5 w-5 text-[#62cbc1]" />
                  How Staking Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#62cbc1] flex items-center justify-center text-xs font-bold text-gray-900">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Choose Pool</h4>
                    <p className="text-gray-400 text-sm">
                      Select from HERMES, BNB, or CAKE staking pools
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#62cbc1] flex items-center justify-center text-xs font-bold text-gray-900">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Stake Tokens</h4>
                    <p className="text-gray-400 text-sm">
                      Lock your tokens for the specified period
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#62cbc1] flex items-center justify-center text-xs font-bold text-gray-900">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Earn Rewards</h4>
                    <p className="text-gray-400 text-sm">
                      Earn high APY rewards automatically
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pool Benefits */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-400" />
                  Pool Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">High APY Returns</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Compound Rewards</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Secure Smart Contracts</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Auto-Reward Distribution</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-400" />
                  <span className="text-gray-300 text-sm">Multiple Token Support</span>
                </div>
              </CardContent>
            </Card>

            {/* Risk Warning */}
            <Card className="bg-red-900/20 border-red-700">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-300 text-sm">
                  Staking involves risks including impermanent loss and smart contract risks. 
                  Only stake what you can afford to lose. APY rates are variable and subject to change.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing icon component
const Users = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);