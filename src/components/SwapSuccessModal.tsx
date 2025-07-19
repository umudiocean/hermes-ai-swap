import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, ArrowRight, ExternalLink, Gift, TrendingUp, Wallet, Plus } from "lucide-react";
import { BSC_EXPLORER_URL } from "@/lib/constants";

interface SwapSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  swapDetails: {
    fromAmount: string;
    fromToken: string;
    toAmount: string;
    toToken: string;
    txHash: string;
    rewardAmount: string;
    feeAmount: string;
  };
}

export default function SwapSuccessModal({ isOpen, onClose, swapDetails }: SwapSuccessModalProps) {
  const [showReward, setShowReward] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Staggered animations
      const rewardTimer = setTimeout(() => setShowReward(true), 800);
      const statsTimer = setTimeout(() => setShowStats(true), 1200);
      
      return () => {
        clearTimeout(rewardTimer);
        clearTimeout(statsTimer);
      };
    } else {
      setShowReward(false);
      setShowStats(false);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full mx-4 sm:mx-auto bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-green-500/20 text-white overflow-hidden sm:max-w-lg sm:w-auto modal-mobile max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Swap Transaction Successful</DialogTitle>
          <DialogDescription>
            Swap transaction completed successfully with details and rewards information
          </DialogDescription>
        </DialogHeader>
        <div className="relative p-4 sm:p-6">
          {/* Success Icon with Pulse Animation */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
              <div className="relative bg-green-500/10 p-4 rounded-full border border-green-500/30">
                <CheckCircle className="w-12 h-12 text-green-400 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 bg-gradient-to-r from-green-400 to-emerald-300 bg-clip-text text-transparent">
              Swap Successful!
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">Your transaction completed successfully</p>
          </div>

          {/* Swap Details */}
          <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-xl font-bold text-white">{swapDetails.fromAmount}</div>
                <div className="text-sm text-gray-400">{swapDetails.fromToken}</div>
              </div>
              
              <div className="mx-4">
                <ArrowRight className="w-6 h-6 text-green-400 animate-pulse" />
              </div>
              
              <div className="text-center flex-1">
                <div className="text-xl font-bold text-green-400">{swapDetails.toAmount}</div>
                <div className="text-sm text-gray-400">{swapDetails.toToken}</div>
              </div>
            </div>
          </div>

          {/* Reward Section - Animated Entry */}
          <div className={`transform transition-all duration-700 ${
            showReward ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-[#62cbc1]/30 to-[#4db8a8]/30 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-[#62cbc1]/30">
              <div className="flex items-center space-x-3">
                <div className="bg-[#62cbc1]/20 p-3 rounded-full">
                  <Gift className="w-6 h-6 text-[#62cbc1] animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-[#62cbc1]">
                    +{swapDetails.rewardAmount} HERMES
                  </div>
                  <div className="text-sm text-gray-400">Swap reward earned!</div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section - Animated Entry */}
          <div className={`transform transition-all duration-700 delay-200 ${
            showStats ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          }`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6 grid-mobile">
              <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-sm text-gray-400">Transaction Fee</div>
                <div className="font-semibold text-blue-400">Auto</div>
              </div>
              <div className="bg-gray-800/30 rounded-lg p-3 text-center border border-gray-700/30">
                <div className="text-sm text-gray-400">Gas Fee</div>
                <div className="font-semibold text-green-400">Auto</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 sm:space-y-3">
            <Button
              onClick={() => window.open(`${BSC_EXPLORER_URL}/tx/${swapDetails.txHash}`, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 sm:py-3 text-sm sm:text-base transition-all duration-300 hover:scale-105 mobile-button touch-target"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View on BSCScan
            </Button>
            
            <Button
              onClick={async () => {
                try {
                  const ethereum = (window as any).ethereum;
                  if (!ethereum) return;
                  
                  // Get token info from the swap details  
                  const tokenSymbol = swapDetails.toToken;
                  const tokenDecimals = 18; // Default decimals
                  let tokenAddress = "";
                  let tokenImage = "";
                  
                  // Get token address from common tokens
                  const tokenAddresses: { [key: string]: { address: string, image: string } } = {
                    'HERMES': { 
                      address: '0x9495ab3549338bf14ad2f86cbcf79c7b574bba37',
                      image: 'https://hermesaianalyzer.com/wp-content/uploads/2025/06/hermes.svg'
                    },
                    'CAKE': { 
                      address: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
                      image: 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_.png'
                    },
                    'USDT': { 
                      address: '0x55d398326f99059fF775485246999027B3197955',
                      image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png'
                    },
                    'USDC': { 
                      address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
                      image: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png'
                    }
                  };
                  
                  if (tokenAddresses[tokenSymbol]) {
                    tokenAddress = tokenAddresses[tokenSymbol].address;
                    tokenImage = tokenAddresses[tokenSymbol].image;
                  }
                  
                  if (tokenAddress && tokenSymbol !== 'BNB') {
                    await ethereum.request({
                      method: 'wallet_watchAsset',
                      params: {
                        type: 'ERC20',
                        options: {
                          address: tokenAddress,
                          symbol: tokenSymbol,
                          decimals: tokenDecimals,
                          image: tokenImage
                        }
                      }
                    });
                  }
                } catch (error) {
                  console.error('Error adding token to wallet:', error);
                }
              }}
              className="w-full bg-[#00b0c7] hover:bg-[#0090a3] text-white rounded-lg py-2 sm:py-3 text-sm sm:text-base transition-all duration-300 hover:scale-105 mobile-button touch-target"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Add {swapDetails.toToken} to Wallet
            </Button>
            
            <Button
              onClick={onClose}
              className="w-full mobile-done-button lg:bg-gradient-to-r lg:from-gray-700 lg:to-gray-600 lg:hover:from-gray-600 lg:hover:to-gray-500 text-white rounded-lg transition-all duration-300 mobile-button touch-target"
            >
              ✅ Done
            </Button>
          </div>

          {/* Floating Particles Animation */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-green-400/30 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}