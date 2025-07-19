import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
import { AlertCircle, Download, ExternalLink } from 'lucide-react';
import { supportedWallets, getAvailableWallets, type WalletProvider } from '@/lib/walletProviders';
import { useToast } from '@/hooks/use-toast';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: any, signer: any, address: string, walletName: string) => void;
}

export default function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const [isConnecting, setIsConnecting] = useState<string | null>(null);
  const { toast } = useToast();
  const availableWallets = getAvailableWallets();

  const handleWalletConnect = async (wallet: WalletProvider) => {
    if (!wallet.isInstalled()) {
      toast({
        title: `${wallet.name} Not Installed`,
        description: `Please install ${wallet.name} to continue.`,
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(wallet.name);
    
    try {
      const { provider, signer, address } = await wallet.connect();
      
      // Switch to BSC network if not already
      try {
        await provider.send('wallet_switchEthereumChain', [{ chainId: '0x38' }]);
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          // Chain not added, add BSC network
          await provider.send('wallet_addEthereumChain', [{
            chainId: '0x38',
            chainName: 'Binance Smart Chain',
            nativeCurrency: {
              name: 'BNB',
              symbol: 'BNB',
              decimals: 18
            },
            rpcUrls: ['https://bsc-dataseed.binance.org/'],
            blockExplorerUrls: ['https://bscscan.com/']
          }]);
        }
      }

      onConnect(provider, signer, address, wallet.name);
      onClose();
      
      toast({
        title: "Wallet Connected",
        description: `Successfully connected to ${wallet.name}`,
      });
    } catch (error: any) {
      console.error(`Error connecting to ${wallet.name}:`, error);
      toast({
        title: "Connection Failed",
        description: error.message || `Failed to connect to ${wallet.name}`,
        variant: "destructive",
      });
    } finally {
      setIsConnecting(null);
    }
  };

  const getWalletDownloadUrl = (walletName: string): string => {
    const urls: Record<string, string> = {
      'MetaMask': 'https://metamask.io/download/',
      'Trust Wallet': 'https://trustwallet.com/download',
      'Binance Wallet': 'https://www.binance.org/en/download',
      'Coinbase Wallet': 'https://www.coinbase.com/wallet/downloads',
      'OKX Wallet': 'https://www.okx.com/web3',
      'Brave Wallet': 'https://brave.com/wallet/',
    };
    return urls[walletName] || '#';
  };

  const getWalletIcon = (walletName: string): string => {
    const icons: Record<string, string> = {
      'MetaMask': '🦊',
      'Trust Wallet': '🛡️',
      'Binance Wallet': '🟡',
      'Coinbase Wallet': '🔵',
      'OKX Wallet': '⬛',
      'Brave Wallet': '🦁',
      'Ethereum Wallet': '💎'
    };
    return icons[walletName] || '💰';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-hermes-card border border-hermes-border text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            Connect Your Wallet
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Available Wallets */}
          {availableWallets.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-400 mb-3">Available Wallets</h3>
              <div className="grid gap-2">
                {availableWallets.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    onClick={() => handleWalletConnect(wallet)}
                    disabled={isConnecting === wallet.name}
                    className="flex items-center justify-between p-4 h-auto bg-hermes-dark border-hermes-border hover:bg-hermes-border transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getWalletIcon(wallet.name)}</span>
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full border border-transparent bg-green-600/20 text-green-400 px-2.5 py-0.5 text-xs font-semibold">
                        Installed
                      </span>
                      {isConnecting === wallet.name && (
                        <div className="w-4 h-4 border-2 border-[#62cbc1] border-t-transparent rounded-full animate-spin" />
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Not Installed Wallets */}
          <div>
            <h3 className="text-sm font-medium text-gray-400 mb-3">
              {availableWallets.length > 0 ? 'More Wallets' : 'Install a Wallet'}
            </h3>
            <div className="grid gap-2">
              {supportedWallets
                .filter(wallet => !wallet.isInstalled() && wallet.name !== 'Ethereum Wallet')
                .map((wallet) => (
                  <div
                    key={wallet.name}
                    className="flex items-center justify-between p-4 bg-hermes-dark border border-hermes-border rounded-lg opacity-60"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getWalletIcon(wallet.name)}</span>
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="inline-flex items-center rounded-full border border-gray-600 text-gray-400 px-2.5 py-0.5 text-xs font-semibold">
                        Not Installed
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(getWalletDownloadUrl(wallet.name), '_blank')}
                        className="p-1 h-auto text-gray-400 hover:text-white"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* No Wallets Available */}
          {availableWallets.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-[#62cbc1] mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Wallet Detected</h3>
              <p className="text-sm text-gray-400 mb-4">
                You need a Web3 wallet to use this application.
              </p>
              <Button
                variant="outline"
                onClick={() => window.open('https://metamask.io/download/', '_blank')}
                className="bg-hermes-dark border-hermes-border hover:bg-hermes-border"
              >
                <Download className="w-4 h-4 mr-2" />
                Install MetaMask
              </Button>
            </div>
          )}

          {/* Help Text */}
          <div className="bg-hermes-dark border border-hermes-border rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm mb-1">What's a Web3 Wallet?</h4>
                <p className="text-xs text-gray-400">
                  A wallet lets you connect to HermesAI Swap and manage your tokens securely. 
                  Your keys stay with you, never with us.
                </p>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => window.open('https://ethereum.org/en/wallets/', '_blank')}
                  className="p-0 h-auto text-xs text-blue-400 hover:text-blue-300"
                >
                  Learn more about wallets
                  <ExternalLink className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}