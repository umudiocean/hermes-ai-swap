import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useWalletStore } from '../stores/useWalletStore';
import { Wallet, RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from '../hooks/useTranslation';
import { priceService } from '../lib/priceService';
import { HERMES_CONTRACT_ADDRESS } from '../lib/constants';

export default function HermesWalletBalance() {
  const {
    isConnected,
    address,
    hermesBalance,
    updateBalances,
    isLoading,
    error
  } = useWalletStore();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hermesUsdValue, setHermesUsdValue] = useState(0);

  // Get HERMES balance from wallet store
  const hermesAmount = parseFloat(hermesBalance || "0");
  
  // Calculate USD value for HERMES
  useEffect(() => {
    const calculateUsdValue = async () => {
      if (hermesAmount > 0) {
        try {
          const hermesPrice = await priceService.getTokenPrice('HERMES');
          const usdValue = hermesAmount * hermesPrice.usd;
          setHermesUsdValue(usdValue);
        } catch (error) {
          console.warn("Failed to get HERMES price:", error);
          // Fallback price
          setHermesUsdValue(hermesAmount * 0.00000019);
        }
      } else {
        setHermesUsdValue(0);
      }
    };

    calculateUsdValue();
  }, [hermesAmount]);

  // Auto-refresh HERMES price every 30 seconds
  useEffect(() => {
    if (!address || hermesAmount <= 0) return;

    const interval = setInterval(async () => {
      try {
        await updateBalances();
      } catch (error) {
        console.warn("Failed to update HERMES balance:", error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [address, hermesAmount, updateBalances]);

  // Force update when wallet address changes
  useEffect(() => {
    if (address) {
      updateBalances();
    }
  }, [address, updateBalances]);

  const handleRefresh = async () => {
    if (!address) return;
    
    setIsRefreshing(true);
    try {
      await updateBalances();
      toast({
        title: "Balance Updated",
        description: "HERMES balance has been refreshed",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to refresh balance",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!address) return;
    
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address",
        variant: "destructive",
      });
    }
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return "0.00";
    if (num < 0.000001) return num.toExponential(2);
    if (num < 0.01) return num.toFixed(8);
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  const formatUsdValue = (value: number) => {
    if (value === 0) return "$0.00";
    if (value < 0.01) return `$${value.toFixed(6)}`;
    if (value < 1) return `$${value.toFixed(4)}`;
    if (value < 1000) return `$${value.toFixed(2)}`;
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
  };

  if (!address) {
    return (
      <div className="bg-hermes-card border border-hermes-border rounded-2xl p-4 lg:p-6 shadow-2xl mobile-card">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-[#62cbc1] to-[#4db8a8] rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">HERMES Balance</h3>
            <p className="text-gray-400 text-sm">Connect wallet to view balance</p>
          </div>
        </div>
        <div className="text-center py-4">
          <p className="text-gray-400 text-sm">Wallet not connected</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-hermes-card border border-hermes-border rounded-2xl p-4 lg:p-6 shadow-2xl mobile-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#62cbc1] to-[#4db8a8] rounded-full flex items-center justify-center">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold">HERMES Balance</h3>
            <p className="text-gray-400 text-xs">
              Auto-refresh every 30s
            </p>
          </div>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isLoading || isRefreshing}
          variant="outline"
          size="sm"
          className="flex items-center space-x-1"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading || isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>

      <div className="space-y-4">
        {/* HERMES Balance */}
        <div className="bg-gradient-to-r from-[#62cbc1]/10 to-[#4db8a8]/10 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">HERMES Tokens</span>
            <span className="text-xs text-gray-400">HERMES</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-[#62cbc1]">
              {isLoading ? "..." : formatBalance(hermesBalance)}
            </span>
            <span className="text-sm text-gray-400">
              {isLoading ? "..." : formatUsdValue(hermesUsdValue)}
            </span>
          </div>
        </div>

        {/* Wallet Address */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Wallet Address</span>
            <Button
              onClick={handleCopyAddress}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          <div className="font-mono text-sm text-gray-300 break-all">
            {address.slice(0, 6)}...{address.slice(-4)}
          </div>
        </div>

        {/* Contract Info */}
        <div className="bg-gray-800/50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-400 text-sm">Contract Address</span>
            <span className="text-xs text-gray-400">BSC</span>
          </div>
          <div className="font-mono text-sm text-gray-300 break-all">
            {HERMES_CONTRACT_ADDRESS.slice(0, 6)}...{HERMES_CONTRACT_ADDRESS.slice(-4)}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Status</span>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-green-400">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}