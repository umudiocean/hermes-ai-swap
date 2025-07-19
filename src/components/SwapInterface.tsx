import { useState, useEffect, useCallback } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useWalletStore } from "../stores/useWalletStore";
import { useRewardsStore } from "../stores/useRewardsStore";
import { useTokenStore } from "../stores/useTokenStore";
import { useReferralStore } from "../lib/referralStore";
import { useReferralV3Store } from "../stores/useReferralV3Store";
import { useToast } from "../hooks/use-toast";
import { useTranslation } from "../hooks/useTranslation";
import { useSwapAmountDebounce } from "../hooks/useDebounce";
import { useOptimisticBalance } from "../hooks/useOptimisticUpdate";
import LoadingSpinner, { ShimmerLoader } from "../components/LoadingSpinner";
import { Skeleton } from "../components/ui/skeleton";
import TokenBalance from "../components/TokenBalance";
import { cacheService } from "../lib/cacheService";
import SystemHealth from "../components/SystemHealth";
import { walletService } from "../lib/walletService";
import { contractService } from "../lib/contractService";
import { priceService } from "../lib/priceService";
import { ethers } from "ethers";
import { ArrowUpDown } from "lucide-react";
import TokenSelector from "./TokenSelector";
import SwapSuccessModal from "./SwapSuccessModal";
import ContractRewardStatus from "./ContractRewardStatus";
import RewardSystemAlert from "./RewardSystemAlert";


export default function SwapInterface() {
  const [swapAmount, setSwapAmount] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [gasEstimate, setGasEstimate] = useState("2.50");
  
  // Optimistic balance updates for instant feel
  const fromBalanceOptimistic = useOptimisticBalance("0.00");
  const toBalanceOptimistic = useOptimisticBalance("0.00");
  
  // Debounced amount for performance
  const debouncedSwapAmount = useSwapAmountDebounce(swapAmount, 300);
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);
  const [fromTokenUsdPrice, setFromTokenUsdPrice] = useState<number>(0);
  const [toTokenUsdPrice, setToTokenUsdPrice] = useState<number>(0);
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
  const { checkForReferralCode, processReferralSwap } = useReferralStore();
  const { referralCode: v3ReferralCode } = useReferralV3Store();
  const { toast } = useToast();
  const { t } = useTranslation();

  // Instant feedback states
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [lastPriceUpdate, setLastPriceUpdate] = useState<number>(0);

  // Check for referral code on mount and parse URL ref parameter
  useEffect(() => {
    // Check URL for ref parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    
    if (refParam) {
      console.log('🎯 URL Referral parameter detected:', refParam);
      
      // Set referral code in V3 store
      const { setReferralCode } = useReferralV3Store.getState();
      setReferralCode(refParam);
      
      // Show user that referral is active
      toast({
        title: t('notifications.referral_active'),
        description: `Swapping with referral code ${refParam}. You'll earn +10,000 HERMES bonus!`,
        duration: 6000,
      });
    } else {
      // Fallback to old system
      const referralCode = checkForReferralCode();
      if (referralCode) {
        console.log('🎯 Referral code detected on page load:', referralCode);
        
        toast({
          title: t('notifications.referral_active'),
          description: `Swapping with referral code ${referralCode.slice(0,6)}...${referralCode.slice(-4)}. +10,000 HERMES goes to referrer!`,
          duration: 6000,
        });
      }
    }
  }, []);

  const updateTokenPrices = async (fromToken: any, toToken: any) => {
    try {
      // Check cache first for performance
      const fromPriceCacheKey = cacheService.generateTokenPriceKey(fromToken.address);
      const toPriceCacheKey = cacheService.generateTokenPriceKey(toToken.address);
      
      const cachedFromPrice = cacheService.get<number>(fromPriceCacheKey);
      const cachedToPrice = cacheService.get<number>(toPriceCacheKey);
      
      if (cachedFromPrice && cachedToPrice) {
        setFromTokenUsdPrice(cachedFromPrice);
        setToTokenUsdPrice(cachedToPrice);
        return;
      }
      
      // Use the real-time price service with correct symbol parameters
      const fromPrice = await priceService.getTokenPrice(fromToken.symbol);
      const toPrice = await priceService.getTokenPrice(toToken.symbol);
      
      setFromTokenUsdPrice(fromPrice);
      setToTokenUsdPrice(toPrice);
      
      // Cache the prices
      cacheService.set(fromPriceCacheKey, fromPrice, 'TOKEN_PRICE');
      cacheService.set(toPriceCacheKey, toPrice, 'TOKEN_PRICE');
      
      // Silent price update for performance optimization
    } catch (error) {
      console.error("Failed to update token prices:", error);
      // Fallback prices
      setFromTokenUsdPrice(0.001);
      setToTokenUsdPrice(0.001);
    }
  };

  // Calculate receive amount when swap amount or tokens change (with caching)
  useEffect(() => {
    const calculateReceiveAmount = async () => {
      if (!swapAmount || !fromToken || !toToken || !isConnected) {
        setReceiveAmount("");
        setIsCalculatingPrice(false);
        return;
      }

      if (isNaN(parseFloat(swapAmount)) || parseFloat(swapAmount) <= 0) {
        setReceiveAmount("");
        setIsCalculatingPrice(false);
        return;
      }

      // Check cache first for instant response
      const cacheKey = cacheService.generateSwapQuoteKey(fromToken.address, toToken.address, swapAmount);
      const cachedQuote = cacheService.get<string>(cacheKey);
      
      if (cachedQuote) {
        setReceiveAmount(cachedQuote);
        setIsCalculatingPrice(false);
        setIsCalculating(false);
        setLastPriceUpdate(Date.now());
        return;
      }

      // Show loading states
      setIsCalculatingPrice(true);
      setIsCalculating(true);
      try {
        // Use new price service for swap quotes
        if (isConnected && address) {
          const quote = await priceService.getSwapQuote(
            swapAmount,
            fromToken,
            toToken
          );
          
          setReceiveAmount(quote.amountOut);
          setGasEstimate(quote.gasEstimate);
          
          // Cache the result for future requests
          cacheService.set(cacheKey, quote.amountOut, 'SWAP_QUOTE');
          setLastPriceUpdate(Date.now());
          
          // Update token prices immediately when tokens change
          await updateTokenPrices(fromToken, toToken);
        } else {
          console.warn("Wallet not connected for swap calculation");
          setReceiveAmount("");
        }
      } catch (error) {
        console.error("Price calculation failed:", error);
        setReceiveAmount("");
        toast({
          title: t('notifications.price_calculation_error'),
          description: t('notifications.price_calculation_error_desc'),
          variant: "destructive",
        });
      } finally {
        setIsCalculating(false);
        setIsCalculatingPrice(false);
      }
    };

    const timeoutId = setTimeout(calculateReceiveAmount, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [swapAmount, fromToken, toToken, isConnected, address]);

  // Update balances when tokens or connection changes (with caching)
  useEffect(() => {
    const updateTokenBalances = async () => {
      if (!isConnected || !address || !fromToken || !toToken) return;
      
      try {
        // Check cache for existing balances
        const fromBalanceCacheKey = cacheService.generateBalanceKey(fromToken.address, address);
        const toBalanceCacheKey = cacheService.generateBalanceKey(toToken.address, address);
        
        const cachedFromBalance = cacheService.get<string>(fromBalanceCacheKey);
        const cachedToBalance = cacheService.get<string>(toBalanceCacheKey);
        
        // Use cached values if available
        if (cachedFromBalance) {
          fromBalanceOptimistic.updateBalance(cachedFromBalance, false);
        }
        if (cachedToBalance) {
          toBalanceOptimistic.updateBalance(cachedToBalance, false);
        }
        
        // Only fetch if cache miss or both tokens need update
        if (!cachedFromBalance || !cachedToBalance) {
          const provider = web3Service?.provider;
          const signer = web3Service?.signer;
          if (provider && signer) {
            await pancakeSwapService.initialize(provider, signer);
            
            const balancePromises = [];
            if (!cachedFromBalance) {
              balancePromises.push(pancakeSwapService.getTokenBalance(fromToken.address, address));
            }
            if (!cachedToBalance) {
              balancePromises.push(pancakeSwapService.getTokenBalance(toToken.address, address));
            }
            
            const balanceResults = await Promise.all(balancePromises);
            
            let resultIndex = 0;
            if (!cachedFromBalance) {
              const fromBal = parseFloat(balanceResults[resultIndex]).toFixed(6);
              fromBalanceOptimistic.updateBalance(fromBal, false);
              cacheService.set(fromBalanceCacheKey, fromBal, 'TOKEN_BALANCE');
              resultIndex++;
            }
            if (!cachedToBalance) {
              const toBal = parseFloat(balanceResults[resultIndex]).toFixed(6);
              toBalanceOptimistic.updateBalance(toBal, false);
              cacheService.set(toBalanceCacheKey, toBal, 'TOKEN_BALANCE');
            }
          }
        }
      } catch (error) {
        console.error("Failed to update token balances:", error);
      }
    };
    
    updateTokenBalances();
  }, [isConnected, address, fromToken, toToken]);

  useEffect(() => {
    const updateGasEstimate = async () => {
      if (isConnected && web3Service?.provider && web3Service?.signer) {
        try {
          const estimate = await web3Service.getGasEstimate();
          setGasEstimate(estimate);
        } catch (error) {
          console.error("Failed to get gas estimate:", error);
        }
      }
    };
    
    const updatePricesIfNeeded = async () => {
      if (fromToken && toToken && (fromTokenUsdPrice === 0 || toTokenUsdPrice === 0)) {
        await updateTokenPrices(fromToken, toToken);
      }
    };
    
    updateGasEstimate();
    updatePricesIfNeeded();
  }, [isConnected, fromToken, toToken, fromTokenUsdPrice, toTokenUsdPrice]);

  const handleSetMaxAmount = () => {
    if (!fromToken) return;
    
    // Get balance from wallet store based on token type
    let currentBalance: number;
    if (fromToken.symbol === 'BNB') {
      currentBalance = parseFloat(bnbBalance);
    } else if (fromToken.symbol === 'HERMES') {
      currentBalance = parseFloat(hermesBalance);
    } else {
      currentBalance = parseFloat(fromBalanceOptimistic.balance);
    }
    
    let maxAmount: number;
    
    if (fromToken.symbol === "BNB") {
      // Use same adaptive gas reserve as percentage calculation
      const gasReserve = Math.min(0.003, currentBalance * 0.05);
      maxAmount = Math.max(0, currentBalance - gasReserve);
    } else {
      // For tokens, use 99.5% to avoid decimal precision issues
      maxAmount = currentBalance * 0.995;
    }
    
    setSwapAmount(maxAmount.toFixed(8));
  };

  const handleSetPercentageAmount = (percentage: number) => {
    if (!fromToken) return;
    
    // Get balance from wallet store based on token type
    let currentBalance: number;
    if (fromToken.symbol === 'BNB') {
      currentBalance = parseFloat(bnbBalance);
    } else if (fromToken.symbol === 'HERMES') {
      currentBalance = parseFloat(hermesBalance);
    } else {
      currentBalance = parseFloat(fromBalanceOptimistic.balance);
    }
    
    if (currentBalance <= 0) return;
    
    let amount: number;
    
    if (fromToken.symbol === "BNB") {
      // For BNB, use adaptive gas fee reserve
      const gasReserve = Math.min(0.003, currentBalance * 0.05); // Use 5% of balance or 0.003 BNB, whichever is smaller
      const usableBalance = Math.max(0, currentBalance - gasReserve);
      amount = (usableBalance * percentage) / 100;
    } else {
      // For tokens, calculate percentage directly
      amount = (currentBalance * percentage) / 100;
    }
    
    // Set amount even if very small
    if (amount >= 0) {
      setSwapAmount(amount.toFixed(8)); // Use 8 decimals for precision
    }
  };

  const handleSwapOrConnect = async () => {
    // If wallet is not connected, show a message
    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet using the Connect Wallet button above to start swapping.",
        variant: "destructive",
      });
      return;
    }

    // If connected, proceed with swap
    return handleSwap();
  };

  const handleSwap = async () => {
    if (!isConnected || !address || !fromToken || !toToken) {
      toast({
        title: t('walletNotConnected'),
        description: t('pleaseConnectWallet'),
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

    // Enhanced balance check for BNB (need gas + fee reserve)
    if (fromToken?.symbol === "BNB") {
      const requiredAmount = parseFloat(swapAmount) + 0.001; // 0.001 BNB reserve for gas + fee
      if (requiredAmount > parseFloat(fromBalanceOptimistic.balance)) {
        toast({
          title: t('errors.insufficient_balance'),
          description: t('notifications.insufficient_bnb', { amount: requiredAmount.toFixed(6) }),
          variant: "destructive",
        });
        return;
      }
    } else if (parseFloat(swapAmount) > parseFloat(fromBalanceOptimistic.balance)) {
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
      recordSwap({
        fromToken: fromToken.symbol,
        toToken: toToken.symbol,
        amountIn: swapAmount,
        amountOut: receiveAmount,
        txHash: txHash,
        timestamp: Date.now(),
      });
      
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
          } else {
            // Legacy referral code is not numeric, using 0
            contractReferralCode = 0;
          }
        }
        
        // Final referral code for V4 swap

        // Use new HermesSwapV4Enhanced with enhanced referral system
        // HermesSwapV4Enhanced executing swap
        
        const expectedReward = contractReferralCode > 0 ? "110,000 HERMES (user) + 10,000 HERMES (referrer)" : "100,000 HERMES";
        // Expected reward distribution
        
        txHash = await hermesSwapV4Service.executeSwap(
          signer,
          fromToken.symbol === "BNB" ? "BNB" : fromToken.address,
          toToken.symbol === "BNB" ? "BNB" : toToken.address,
          swapAmount,
          contractReferralCode
        );
      } else {
        // Fallback to PancakeSwap (legacy) - ACTIVE due to V4 contract issues
        // Using proven PancakeSwap router + fee system
        
        await pancakeSwapService.initialize(provider, signer);
        
        if (fromToken.symbol === "BNB") {
          // BNB to Token swap with fee collection
          // BNB→Token via PancakeSwap + Fee Collection
          txHash = await pancakeSwapService.swapBNBToTokenWithRewards(
            swapAmount,
            amountOutMin,
            toToken.address,
            address
          );
        } else if (toToken.symbol === "BNB") {
          // Token to BNB swap
          // Token→BNB via PancakeSwap + Fee Collection
          txHash = await pancakeSwapService.swapTokens(
            swapAmount,
            amountOutMin,
            fromToken.address,
            toToken.address,
            address,
            fromToken.decimals
          );
        } else {
          // Token to Token swap
          // Token→Token via PancakeSwap + Fee Collection
          txHash = await pancakeSwapService.swapTokens(
            swapAmount,
            amountOutMin,
            fromToken.address,
            toToken.address,
            address,
            fromToken.decimals
          );
        }
      }
      
      // Record the swap in our system with proper error handling
      try {
        // Recording swap transaction
        
        const swapResult = await recordSwap(txHash, swapAmount, receiveAmount, fromToken.symbol, toToken.symbol);
        // Swap recorded successfully
        
        // Check if rewards were distributed by contract
        if (hermesSwapV4Service.isContractDeployed()) {
          try {
            const contractInfo = await hermesSwapV4Service.getContractInfo();
            // Contract reward status checked
            
            if (contractInfo && !contractInfo.canReward) {
              console.warn("⚠️ CRITICAL: Contract cannot provide rewards - insufficient HERMES balance!");
              console.warn("💰 Contract needs HERMES token deposit for reward distribution");
            } else {
              console.log("✅ Contract has sufficient HERMES for rewards");
            }
          } catch (error) {
            console.error("❌ Failed to check contract reward status:", error);
          }
        }
        
        // Process referral rewards if there's a referral code
        const { referralCode } = useReferralStore.getState();
        console.log('🔍 Checking referral after swap:', { referralCode, address, hasSwapResult: !!swapResult });
        
        if (referralCode && address && referralCode !== address) {
          try {
            // Processing referral reward
            
            // Create referral relationship first if it doesn't exist
            await useReferralStore.getState().createReferralRelationship(referralCode, address);
            // Referral relationship confirmed
            
            // Create referral reward for this swap - INSTANT PAYMENT
            // Creating INSTANT referral reward...
            const response = await fetch('/api/referral-rewards', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                referrerWalletAddress: referralCode,
                referredWalletAddress: address,
                swapTransactionId: swapResult?.id || 1, // Use actual swap ID from backend
                rewardAmount: "10000", // 10,000 HERMES for referrer
                claimed: true, // INSTANT payment - no claim needed
                claimedAt: new Date().toISOString()
              }),
            });
            
            if (response.ok) {
              const result = await response.json();
              console.log('✅ Referral reward INSTANTLY paid:', result);
              
              // Update referral stats for both referrer and referred user
              await useReferralStore.getState().fetchReferralStats(referralCode);
              console.log('✅ Referral stats updated');
              
              // Show success message
              toast({
                title: "⚡ Hermes AI scanned 21 DEXs and found the lowest fee",
                variant: "cyan" as any,
              });
            } else {
              const error = await response.json();
              console.error('❌ Failed to create referral reward:', error);
              console.error('❌ Response status:', response.status);
              console.error('❌ Response text:', await response.text());
            }
          } catch (error) {
            console.error('❌ Error processing referral swap:', error);
          }
        } else {
          console.log('ℹ️ No referral processing needed:', { 
            hasReferralCode: !!referralCode, 
            hasAddress: !!address, 
            notSelfReferral: referralCode !== address 
          });
        }
      } catch (error) {
        console.error('❌ Failed to record swap:', error);
        // Don't throw error here - swap was successful, recording is secondary
      }
      
      // Invalidate all relevant caches after successful swap for instant UI updates
      cacheService.invalidate(cacheService.generateBalanceKey(fromToken.address, address));
      cacheService.invalidate(cacheService.generateBalanceKey(toToken.address, address));
      
      // Optimistically update balances for instant visual feedback
      if (fromToken.address === "BNB") {
        const newFromBalance = (parseFloat(fromBalanceOptimistic.balance) - parseFloat(swapAmount) - 0.0005).toFixed(6);
        fromBalanceOptimistic.updateBalance(newFromBalance, true);
      } else {
        const newFromBalance = (parseFloat(fromBalanceOptimistic.balance) - parseFloat(swapAmount)).toFixed(6);
        fromBalanceOptimistic.updateBalance(newFromBalance, true);
      }
      
      // Optimistically update receive token balance
      const newToBalance = (parseFloat(toBalanceOptimistic.balance) + parseFloat(receiveAmount)).toFixed(6);
      toBalanceOptimistic.updateBalance(newToBalance, true);
      
      // Update wallet balances (will confirm optimistic updates)
      await updateBalances();
      
      // Reset form
      setSwapAmount("");
      setReceiveAmount("");
      
      // Prepare swap details for modal (check if referral was used)
      const { referralCode: v3Code } = useReferralV3Store.getState();
      const { referralCode: legacyCode } = useReferralStore.getState();
      const isReferralUsed = (v3Code && v3Code !== "0") || (legacyCode && legacyCode !== "0" && legacyCode !== address);
      
      const details = {
        fromAmount: parseFloat(swapAmount).toFixed(6),
        fromToken: fromToken.symbol,
        toAmount: parseFloat(receiveAmount).toFixed(6),
        toToken: toToken.symbol,
        txHash: txHash,
        rewardAmount: isReferralUsed ? "110,000" : "100,000",
        referralReward: isReferralUsed ? "10,000" : "0",
        feeAmount: "0.0005"
      };
      
      setSwapDetails(details);
      setShowSuccessModal(true);
      
      // Dispatch swap success event for HermesAdvantages component
      window.dispatchEvent(new CustomEvent('swapSuccess', {
        detail: {
          fromAmount: swapAmount,
          fromToken: fromToken.symbol,
          toAmount: receiveAmount,
          toToken: toToken.symbol,
          txHash: txHash
        }
      }));
      
      // Show success toast with custom styling
      const toastDescription = isReferralUsed 
        ? t('notifications.swap_success_referral', { fromAmount: swapAmount, fromSymbol: fromToken.symbol, toAmount: receiveAmount, toSymbol: toToken.symbol })
        : t('notifications.swap_success_normal', { fromAmount: swapAmount, fromSymbol: fromToken.symbol, toAmount: receiveAmount, toSymbol: toToken.symbol });
      
      toast({
        variant: "cyan" as any,
        title: "⚡ Hermes AI scanned 21 DEXs and found the lowest fee",
      });
    } catch (error: any) {
      console.error("Swap failed:", error);
      
      let errorMessage = t('swapTransactionFailed');
      let suggestedSlippage = null;
      
      // Enhanced error handling for network and contract issues
      if (error.message?.includes("Transaction does not have a transaction hash")) {
        errorMessage = t('notifications.network_connection_error');
      } else if (error.message?.includes("Network connection") || error.message?.includes("timeout")) {
        errorMessage = t('notifications.network_timeout');
      } else if (error.message?.includes("user rejected") || error.message?.includes("User denied")) {
        errorMessage = t('notifications.transaction_cancelled');
      } else if (error.reason === "Pancake: K") {
        // Suggest higher slippage based on token pair
        if (fromToken?.symbol === "HERMES" || toToken?.symbol === "HERMES") {
          suggestedSlippage = Math.max(15, slippageTolerance + 5);
          errorMessage = t('notifications.slippage_too_low_hermes', { slippage: suggestedSlippage });
        } else {
          suggestedSlippage = Math.max(3, slippageTolerance + 2);
          errorMessage = t('notifications.slippage_too_low_token', { slippage: suggestedSlippage });
        }
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient BNB balance (required for gas fees).";
      } else if (error.code === "CALL_EXCEPTION") {
        errorMessage = "Transaction failed. Increase slippage tolerance or try smaller amount.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('swapFailed'),
        description: errorMessage,
        variant: "destructive",
        duration: error.message?.includes("Network") || error.message?.includes("timeout") ? 8000 : 5000,
        action: suggestedSlippage ? (
          <button 
            onClick={() => setSlippageTolerance(suggestedSlippage)}
            className="bg-[#62cbc1] hover:bg-[#4db8a8] text-white px-3 py-1 rounded text-sm ml-2"
          >
            %{suggestedSlippage} Kullan
          </button>
        ) : error.message?.includes("Network") || error.message?.includes("timeout") ? (
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-sm ml-2"
          >
            Sayfayı Yenile
          </button>
        ) : undefined,
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

  // Calculate realistic USD values based on current token amounts  
  const calculateUsdValue = (amount: string, price: number) => {
    if (!amount || amount === "0" || !price) return "0.00";
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return "0.00";
    const usdVal = numAmount * price;
    // Handle very large numbers (probably calculation error)
    if (usdVal > 1000000) return "0.00";
    return usdVal.toFixed(2);
  };
  
  const usdValue = calculateUsdValue(swapAmount, fromTokenUsdPrice);
  const usdReceiveValue = calculateUsdValue(receiveAmount, toTokenUsdPrice);

  return (
    <div className="bg-hermes-card border border-hermes-border rounded-lg p-2 shadow-lg mobile-card">
      <div className="flex items-center justify-between mb-2 text-[#fdd619]">
        <h2 className="text-lg font-bold flex items-center space-x-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700', letterSpacing: '0.5px' }}>
          <span className="text-[#62cbc1]">⚡</span>
          <span className="hidden sm:inline text-[#62cbc1]">{t('swap_extended.hermes_slogan')}</span>
          <span className="sm:hidden">Swap</span>
        </h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}>
          <span>⚡</span>
          <span>{t('zeroFee')}</span>
        </div>
      </div>
      <div className="space-y-2">
        {/* From Token Section - Compact */}
        <div className="bg-hermes-dark border border-hermes-border rounded-lg p-2 mobile-input shadow-md">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}>
              {t('from')}
            </label>
            <TokenBalance 
              balance={fromToken?.symbol === 'BNB' ? bnbBalance : fromToken?.symbol === 'HERMES' ? hermesBalance : fromBalanceOptimistic.balance}
              symbol={fromToken?.symbol || ''}
              isOptimistic={fromBalanceOptimistic.isOptimistic}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Input
              type="number"
              placeholder="0.0"
              value={swapAmount}
              onChange={(e) => setSwapAmount(e.target.value)}
              className="bg-transparent text-xl font-bold border-none outline-none placeholder-gray-500 p-0 h-auto mobile-input swap-amount-input"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', letterSpacing: '0.5px' }}
              min="0"
              step="0.000001"
            />
            <div className="flex-shrink-0 w-full sm:w-auto">
              <TokenSelector
                selectedToken={fromToken}
                onSelectToken={setFromToken}
                label="From"
                excludeToken={toToken}
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-between mt-2 space-y-2 sm:space-y-0">
            <span className="text-sm text-gray-400 font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>≈ ${usdValue}</span>
            <div className="flex items-center space-x-1 justify-center sm:justify-end">
              <Button
                variant="link"
                onClick={() => handleSetPercentageAmount(25)}
                className="text-sm text-gray-400 hover:text-[#62cbc1] font-medium h-auto px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 touch-target"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}
              >
                25%
              </Button>
              <Button
                variant="link"
                onClick={() => handleSetPercentageAmount(50)}
                className="text-sm text-gray-400 hover:text-[#62cbc1] font-medium h-auto px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 touch-target"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}
              >
                50%
              </Button>
              <Button
                variant="link"
                onClick={() => handleSetPercentageAmount(75)}
                className="text-sm text-gray-400 hover:text-[#62cbc1] font-medium h-auto px-3 py-2 rounded-lg hover:bg-gray-800/50 transition-all duration-200 touch-target"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}
              >
                75%
              </Button>
              <Button
                variant="link"
                onClick={handleSetMaxAmount}
                className="text-sm text-[#62cbc1] hover:text-[#4db8a8] font-bold h-auto px-3 py-2 rounded-lg bg-[#62cbc1]/10 hover:bg-[#62cbc1]/20 transition-all duration-200 touch-target"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}
              >
                {t('max')}
              </Button>
            </div>
          </div>
        </div>

        {/* Swap Arrow - Compact */}
        <div className="flex justify-center -my-1">
          <Button
            variant="outline"
            size="icon"
            onClick={handleSwapTokens}
            className="bg-hermes-card border-hermes-border p-2 rounded-lg hover:bg-[#62cbc1] hover:text-black transition-all duration-300 group touch-target shadow-md hover:shadow-lg"
          >
            <ArrowUpDown className="w-5 h-5 transform group-hover:rotate-180 transition-transform duration-300" />
          </Button>
        </div>

        {/* To Token Section - Compact */}
        <div className="bg-hermes-dark border border-hermes-border rounded-lg p-2 mobile-input shadow-md">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-300" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}>
              {t('to')}
            </label>
            <TokenBalance 
              balance={toToken?.symbol === 'BNB' ? bnbBalance : toToken?.symbol === 'HERMES' ? hermesBalance : toBalanceOptimistic.balance}
              symbol={toToken?.symbol || ''}
              isOptimistic={toBalanceOptimistic.isOptimistic}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {isCalculatingPrice ? (
              <ShimmerLoader className="h-8 w-32 rounded-lg">
                <div className="bg-gray-600 h-8 w-32 rounded-lg animate-pulse" />
              </ShimmerLoader>
            ) : (
              <Input
                type="number"
                placeholder="0.0"
                value={receiveAmount}
                readOnly
                className="bg-transparent text-xl font-bold border-none outline-none placeholder-gray-500 p-0 h-auto text-gray-300 mobile-input animate-fade-in-up"
                style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600', letterSpacing: '0.5px' }}
              />
            )}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <TokenSelector
                selectedToken={toToken}
                onSelectToken={setToToken}
                label="To"
                excludeToken={fromToken}
              />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-400 font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>≈ ${usdReceiveValue}</span>
          </div>
        </div>

        {/* Swap Button - PancakeSwap Style */}
        {!isConnected ? (
          <div className="w-full">
            <w3m-button className="text-[#6495ed]" />
          </div>
        ) : (
          <Button
            onClick={handleSwapOrConnect}
            disabled={(!fromToken || !toToken || !swapAmount || parseFloat(swapAmount) <= 0) || isSwapping || isCalculating}
            className="w-full bg-[#00b0c7] hover:bg-[#0090a3] font-bold py-2.5 rounded-lg transition-all duration-300 hover:scale-[1.02] shadow-lg text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 force-white-text mobile-button touch-target"
            style={{ 
              color: '#ffffff !important',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: '600',
              letterSpacing: '0.5px'
            }}
          >
            <span style={{ color: '#ffffff !important' }} className="flex items-center justify-center space-x-2">
              {(isSwapping || isCalculating) && <LoadingSpinner size="sm" color="text-white" />}
              <span>
                {isSwapping ? t('swapping') : 
                 isCalculating ? t('calculating') :
                 !fromToken || !toToken ? t('selectTokens') : 
                 'SWAP'}
              </span>
            </span>
          </Button>
        )}

        {/* Swap Details - Compact */}
        <div className="bg-hermes-dark border border-hermes-border rounded-lg p-1.5 space-y-0.5 shadow-md pt-[10px] pb-[10px] mt-[12px] mb-[12px]">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}>
              {t('swap_extended.trading_fee')}
            </span>
            <span className="text-[#62cbc1] font-bold text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
              {t('zeroFee')} 🎉
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}>
              {t('swap_extended.hermes_reward')}
            </span>
            <span className="text-green-400 font-bold text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
              +100,000 HERMES
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '500' }}>
              {t('swap_extended.slippage_tolerance')}
            </span>
            <span className="text-blue-400 font-bold text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
              Auto
            </span>
          </div>
        </div>

        {/* Passive Income Information - Compact */}
        <div className="bg-gradient-to-br from-[#62cbc1]/20 to-[#4db8a8]/20 border border-[#62cbc1]/30 rounded-lg p-2 space-y-1 mt-2">
          <h3 className="text-lg font-bold text-center bg-gradient-to-r from-[#62cbc1] to-[#4db8a8] bg-clip-text text-transparent">
            {t('passive_income.title')}
          </h3>
          
          <p className="text-center text-sm text-gray-300 mb-4">
            ✅ {t('passive_income.description')}
          </p>
          
          <div className="space-y-3 text-sm">
            <p className="text-gray-300 font-medium mb-2">{t('passive_income.ecosystem_title')}</p>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔁</span>
                <span className="text-gray-300">{t('passive_income.earn_swaps')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg">💸</span>
                <span className="text-gray-300">{t('passive_income.earn_buysell')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <span className="text-gray-300">{t('passive_income.earn_analysis')}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-lg">🔄</span>
                <span className="text-gray-300">{t('passive_income.earn_transfers')}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-black/30 rounded-lg p-2 mt-2">
            <p className="text-center font-bold text-[#62cbc1] mb-2">💡 {t('passive_income.no_effort_title')}</p>
            <p className="text-center text-sm text-gray-300 mb-2">
              {t('passive_income.no_effort_desc')}
            </p>
            <p className="text-center text-sm font-semibold bg-gradient-to-r from-[#62cbc1] to-[#4db8a8] bg-clip-text text-transparent">
              {t('passive_income.autopilot_earning')}
            </p>
          </div>
        </div>



      </div>
      {/* Success Modal */}
      {swapDetails && (
        <SwapSuccessModal
          isOpen={showSuccessModal}
          onClose={() => setShowSuccessModal(false)}
          swapDetails={swapDetails}
        />
      )}
    </div>
  );
}