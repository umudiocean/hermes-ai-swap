import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useWalletStore } from "../stores/useWalletStore";
import { useRewardsStore } from "../stores/useRewardsStore";
import { useTokenStore } from "../stores/useTokenStore";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from "../hooks/useTranslation";
import LoadingSpinner from "../components/LoadingSpinner";
import TokenBalance from "../components/TokenBalance";
import { walletService } from "../lib/walletService";
import { contractService } from "../lib/contractService";
import { priceService } from "../lib/priceService";
import { ethers } from "ethers";
import { ArrowUpDown } from "lucide-react";
import TokenSelector from "./TokenSelector";
import SwapSuccessModal from "./SwapSuccessModal";

export default function SwapInterface() {
  const [swapAmount, setSwapAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [gasEstimate, setGasEstimate] = useState("2.50");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [swapDetails, setSwapDetails] = useState<any>(null);
  
  const { 
    isConnected, 
    address, 
    updateBalances,
    bnbBalance,
    hermesBalance,
    isLoading
  } = useWalletStore();
  const { recordSwap } = useRewardsStore();
  const { fromToken, toToken, setFromToken, setToToken, swapTokens: swapTokenSelection } = useTokenStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Calculate receive amount when swap amount or tokens change
  useEffect(() => {
    const calculateReceiveAmount = async () => {
      if (!swapAmount || !fromToken || !toToken || !isConnected) {
        setReceiveAmount("");
        setIsCalculating(false);
        return;
      }

      if (isNaN(parseFloat(swapAmount)) || parseFloat(swapAmount) <= 0) {
        setReceiveAmount("");
        setIsCalculating(false);
        return;
      }

      setIsCalculating(true);
      try {
        const quote = await priceService.getSwapQuote(
          swapAmount,
          fromToken,
          toToken
        );
        
        setReceiveAmount(quote.amountOut);
        setGasEstimate(quote.gasEstimate);
      } catch (error) {
        console.error("Price calculation failed:", error);
        setReceiveAmount("");
      } finally {
        setIsCalculating(false);
      }
    };

    calculateReceiveAmount();
  }, [swapAmount, fromToken, toToken, isConnected]);

  const handleSetMaxAmount = () => {
    if (!isConnected || !fromToken) return;
    
    let maxAmount = "0";
    if (fromToken.symbol === "BNB") {
      // Reserve 0.001 BNB for gas
      const balance = parseFloat(bnbBalance);
      maxAmount = Math.max(0, balance - 0.001).toFixed(6);
    } else {
      maxAmount = hermesBalance;
    }
    
    setSwapAmount(maxAmount);
  };

  const handleSwapOrConnect = async () => {
    if (!isConnected) {
      try {
        await useWalletStore.getState().connectWallet();
      } catch (error: any) {
        toast({
          title: "Connection Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      await handleSwap();
    }
  };

  const handleSwap = async () => {
    if (!isConnected || !address || !fromToken || !toToken) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      toast({
        title: t('invalidAmount'),
        description: t('pleaseEnterValidAmount'),
        variant: "destructive",
      });
      return;
    }

    // Check balance
    const fromBalance = fromToken.symbol === "BNB" ? bnbBalance : hermesBalance;
    if (parseFloat(swapAmount) > parseFloat(fromBalance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough tokens to complete this swap",
        variant: "destructive",
      });
      return;
    }

    setIsSwapping(true);

    try {
      // Validate receive amount
      if (!receiveAmount || isNaN(parseFloat(receiveAmount)) || parseFloat(receiveAmount) <= 0) {
        throw new Error("Price calculation failed - please try again");
      }

      // Get signer from wallet service
      if (!walletService.isConnected()) {
        throw new Error("Wallet not connected");
      }

      const signer = walletService.getSigner();
      
      // Execute swap using new contract service
      console.log(`🚀 Executing swap: ${swapAmount} ${fromToken.symbol} → ${toToken.symbol}`);
      
      toast({
        title: "Hermes AI Swap - Executing transaction",
        description: "Processing your swap...",
      });
      
      // Execute swap with new contract service
      const txHash = await contractService.executeSwap(
        fromToken.address,
        toToken.address,
        swapAmount,
        signer
      );
      
      console.log("✅ Swap successful:", txHash);
      
      // Record swap for rewards
      recordSwap(txHash, swapAmount, receiveAmount, fromToken.symbol, toToken.symbol);
      
      // Update balances
      await updateBalances();
      
      // Show success modal
      setSwapDetails({
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amountIn: swapAmount,
        amountOut: receiveAmount,
        txHash: txHash,
        gasUsed: gasEstimate,
      });
      
      setShowSuccessModal(true);
      
      // Clear form
      setSwapAmount("");
      setReceiveAmount("");
      
      toast({
        title: "🎉 Swap Successful!",
        description: `Swapped ${swapAmount} ${fromToken.symbol} for ${receiveAmount} ${toToken.symbol}`,
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Swap failed:", error);
      
      toast({
        title: "❌ Swap Failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSwapping(false);
    }
  };

  const handleSwapTokens = () => {
    swapTokenSelection();
    setSwapAmount("");
    setReceiveAmount("");
  };

  const calculateUsdValue = (amount: string, price: number) => {
    const numAmount = parseFloat(amount) || 0;
    return (numAmount * price).toFixed(2);
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">Hermes AI Swap</h1>
        <p className="text-gray-400">Swap tokens with AI-powered optimization</p>
      </div>

      {/* From Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">From</label>
        <div className="flex items-center space-x-2">
          <TokenSelector
            selectedToken={fromToken}
            onSelectToken={setFromToken}
            disabled={isSwapping}
          />
          <Input
            type="number"
            placeholder="0.0"
            value={swapAmount}
            onChange={(e) => setSwapAmount(e.target.value)}
            disabled={isSwapping || !isConnected}
            className="flex-1"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Balance: {fromToken?.symbol === "BNB" ? bnbBalance : hermesBalance}</span>
          <button
            onClick={handleSetMaxAmount}
            disabled={isSwapping || !isConnected}
            className="text-blue-400 hover:text-blue-300"
          >
            MAX
          </button>
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSwapTokens}
          disabled={isSwapping || !isConnected}
          variant="outline"
          size="sm"
          className="rounded-full"
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* To Token */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-300">To</label>
        <div className="flex items-center space-x-2">
          <TokenSelector
            selectedToken={toToken}
            onSelectToken={setToToken}
            disabled={isSwapping}
          />
          <Input
            type="number"
            placeholder="0.0"
            value={receiveAmount}
            readOnly
            className="flex-1 bg-gray-800"
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Balance: {toToken?.symbol === "BNB" ? bnbBalance : hermesBalance}</span>
          {isCalculating && <LoadingSpinner size="sm" />}
        </div>
      </div>

      {/* Gas Estimate */}
      <div className="text-xs text-gray-400 text-center">
        Estimated gas: ${gasEstimate}
      </div>

      {/* Swap Button */}
      <Button
        onClick={handleSwapOrConnect}
        disabled={isSwapping || isCalculating || !swapAmount || parseFloat(swapAmount) <= 0}
        className="w-full"
        size="lg"
      >
        {isSwapping ? (
          <LoadingSpinner size="sm" />
        ) : !isConnected ? (
          "Connect Wallet"
        ) : (
          "Swap"
        )}
      </Button>

      {/* Success Modal */}
      {showSuccessModal && swapDetails && (
        <SwapSuccessModal
          details={swapDetails}
          onClose={() => setShowSuccessModal(false)}
        />
      )}
    </div>
  );
}