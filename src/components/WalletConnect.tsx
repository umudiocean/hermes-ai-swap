import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { useWalletStore } from '../stores/useWalletStore';
import { Wallet, LogOut, Copy, Check, Smartphone } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from '../hooks/useTranslation';
import { isMobile } from '../lib/mobileWallet';

export default function WalletConnect() {
  const { 
    isConnected, 
    address,
    bnbBalance,
    hermesBalance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    updateBalances,
    clearError
  } = useWalletStore();
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleConnect = async () => {
    console.log('🔧 WalletConnect: Starting connection...');
    try {
      await connectWallet();
      toast({
        title: "Wallet Connected",
        description: "MetaMask connected successfully!",
      });
    } catch (error: any) {
      console.error('❌ WalletConnect: Connection failed:', error);
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    console.log('🔧 WalletConnect: Disconnecting...');
    try {
      disconnectWallet();
      toast({
        title: "Wallet Disconnected",
        description: "Wallet disconnected successfully",
      });
    } catch (error: any) {
      console.error('❌ WalletConnect: Disconnect failed:', error);
      toast({
        title: "Disconnect Error",
        description: "Failed to disconnect wallet",
        variant: "destructive"
      });
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast({
          title: "Address Copied",
          description: "Wallet address copied to clipboard",
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('❌ Copy address failed:', error);
      }
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance);
    if (num === 0) return '0.00';
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    return num.toFixed(2);
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 bg-hermes-dark border border-hermes-border rounded-lg px-3 py-2">
          <Wallet className="w-4 h-4 text-[#62cbc1]" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{formatAddress(address)}</span>
            <div className="text-xs text-gray-400">
              BNB: {formatBalance(bnbBalance)} | HERMES: {formatBalance(hermesBalance)}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyAddress}
            className="p-1 h-auto hover:bg-hermes-border"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-400" />
            ) : (
              <Copy className="w-3 h-3 text-gray-400" />
            )}
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          className="bg-hermes-dark border-hermes-border hover:bg-red-600/20 hover:border-red-500 transition-all duration-200"
          title="Disconnect Wallet"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button 
      onClick={handleConnect}
      disabled={isLoading}
      className="bg-[#6495ed] hover:bg-[#5884d8] text-white font-semibold px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 ml-[7px] mr-[7px] pl-[18px] pr-[18px]"
    >
      {isMobile() ? <Smartphone className="w-4 h-4" /> : <Wallet className="w-4 h-4" />}
      <span>
        {isLoading ? 'Connecting...' : 
         isMobile() ? 'Connect Mobile' : 'Connect Wallet'}
      </span>
    </Button>
  );
}
