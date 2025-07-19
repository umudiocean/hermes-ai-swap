import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTokenStore } from "@/stores/useTokenStore";
import { type Token } from "@/lib/pancakeswap";
import { ChevronDown, Search } from "lucide-react";
import LoadingSpinner, { ShimmerLoader } from "@/components/LoadingSpinner";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelectToken: (token: Token) => void;
  label: string;
  excludeToken?: Token | null;
}

export default function TokenSelector({ 
  selectedToken, 
  onSelectToken, 
  label, 
  excludeToken 
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contractAddressInput, setContractAddressInput] = useState("");
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const { tokens, customTokens, isLoading, loadTokens, addCustomToken } = useTokenStore();

  useEffect(() => {
    if (tokens.length === 0 && !isLoading) {
      loadTokens();
    }
  }, [tokens.length, isLoading, loadTokens]);

  // Combine all available tokens
  const allTokens = [...tokens, ...customTokens];
  
  const filteredTokens = allTokens.filter(token => {
    // Exclude the token that's selected in the other selector
    if (excludeToken && token.address === excludeToken.address) {
      return false;
    }
    
    // Filter by search query - improved partial matching
    if (searchQuery && searchQuery.length > 0) {
      const query = searchQuery.toLowerCase().trim();
      return (
        token.symbol.toLowerCase().includes(query) ||
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query) ||
        // Additional fuzzy matching for better search results
        token.symbol.toLowerCase().startsWith(query) ||
        token.name.toLowerCase().startsWith(query)
      );
    }
    
    return true;
  }).slice(0, 100); // Limit results for performance

  // Check if search query looks like a contract address
  const isContractAddress = searchQuery.match(/^0x[a-fA-F0-9]{40}$/);
  const tokenExists = allTokens.some(t => 
    t.address.toLowerCase() === searchQuery.toLowerCase()
  );

  const handleTokenSelect = (token: Token) => {
    onSelectToken(token);
    setIsOpen(false);
    setSearchQuery("");
    setContractAddressInput("");
  };

  const handleAddCustomToken = async () => {
    if (!searchQuery.trim()) return;
    
    setIsAddingCustom(true);
    const newToken = await addCustomToken(searchQuery.trim());
    
    if (newToken) {
      handleTokenSelect(newToken);
    }
    
    setIsAddingCustom(false);
  };

  const formatTokenAddress = (address: string) => {
    if (address === "BNB") return "Native Token";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center space-x-2 bg-hermes-card border-hermes-border px-3 py-2 rounded-lg hover:bg-hermes-border transition-colors min-h-[44px] token-selector touch-target"
        >
          {selectedToken ? (
            <>
              <img 
                src={selectedToken.symbol === 'HERMES' ? 'https://hermesaianalyzer.com/wp-content/uploads/2025/06/hermes.svg' : selectedToken.logoURI} 
                alt={selectedToken.symbol}
                className="w-6 h-6 rounded-full bg-white"
                onError={(e) => {
                  // Special handling for HERMES token
                  if (selectedToken.symbol === 'HERMES') {
                    e.currentTarget.src = `https://via.placeholder.com/32x32/FFD700/000000?text=H`;
                    return;
                  }
                  // First fallback: Try CoinGecko logos
                  if (!e.currentTarget.src.includes('coingecko')) {
                    const coinGeckoLogos: { [key: string]: string } = {
                      'BNB': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
                      'CAKE': 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_.png',
                      'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
                      'USDC': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
                      'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
                    };
                    if (coinGeckoLogos[selectedToken.symbol]) {
                      e.currentTarget.src = coinGeckoLogos[selectedToken.symbol];
                      return;
                    }
                  }
                  // Final fallback: Colored placeholder
                  e.currentTarget.src = `https://via.placeholder.com/32x32/FFD700/000000?text=${selectedToken.symbol.charAt(0)}`;
                }}
              />
              <span className="font-semibold">{selectedToken.symbol}</span>
            </>
          ) : (
            <span className="text-gray-400">Select {label}</span>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-hermes-card border-hermes-border max-w-md w-[95vw] max-h-[90vh] h-[90vh] flex flex-col sm:max-h-[85vh] sm:h-auto">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-lg">Select {label} Token</DialogTitle>
          <DialogDescription className="text-sm text-gray-400 mt-1">
            Search for tokens or enter contract address to add new tokens.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
          {/* Search Input - Fixed at top */}
          <div className="flex-shrink-0 space-y-2">
            <div className="relative flex items-center search-input-container">
              <Input
                placeholder="Search tokens or paste contract address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-hermes-dark border-hermes-border text-sm py-3 w-full"
                style={{ paddingLeft: '16px', paddingRight: '16px' }}
                autoFocus={false}
              />
            </div>
            
            {/* Add Custom Token Button - Moved directly under search */}
            {searchQuery.length >= 42 && searchQuery.startsWith('0x') && (
              <Button
                onClick={handleAddCustomToken}
                disabled={isAddingCustom || tokenExists}
                className={`w-full font-semibold flex items-center justify-center space-x-2 py-3 text-sm ${
                  tokenExists 
                    ? 'bg-gray-500 text-white cursor-not-allowed' 
                    : 'bg-hermes-primary hover:bg-hermes-primary/80 text-white'
                }`}
              >
                {isAddingCustom ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding Token...</span>
                  </>
                ) : tokenExists ? (
                  <>
                    <span className="text-lg">✓</span>
                    <span>Token already exists</span>
                  </>
                ) : (
                  <>
                    <span className="text-xl text-[#62cbc1] font-bold">+</span>
                    <span>Add Token: {searchQuery.slice(0, 8)}...</span>
                  </>
                )}
              </Button>
            )}
          </div>
          
          {/* Token List - Shows immediately after search/add button */}
          <div className="flex-1 overflow-hidden min-h-0 token-list-container">
            <ScrollArea className="h-full min-h-[250px] rounded-md border border-hermes-border">
              <div className="p-2 space-y-1">
                {isLoading ? (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-sm">Loading tokens...</div>
                  </div>
                ) : filteredTokens.length === 0 && !searchQuery.startsWith('0x') ? (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-sm">No tokens found</div>
                    <div className="text-xs mt-1">Try searching by symbol or name</div>
                  </div>
                ) : filteredTokens.length === 0 && searchQuery.startsWith('0x') ? (
                  <div className="text-center py-6 text-gray-400">
                    <div className="text-sm">Contract address ready to add</div>
                    <div className="text-xs mt-1">Click "Add Token" button above</div>
                  </div>
                ) : (
                  filteredTokens.map((token) => (
                    <Button
                      key={token.address}
                      variant="ghost"
                      onClick={() => handleTokenSelect(token)}
                      className="w-full justify-start p-2 h-auto hover:bg-hermes-dark min-h-[44px] touch-target"
                    >
                      <div className="flex items-center space-x-3">
                        <img 
                          src={token.symbol === 'HERMES' ? 'https://hermesaianalyzer.com/wp-content/uploads/2025/06/hermes.svg' : token.logoURI} 
                          alt={token.symbol}
                          className="w-6 h-6 rounded-full bg-white flex-shrink-0"
                          onError={(e) => {
                            // Special handling for HERMES token
                            if (token.symbol === 'HERMES') {
                              e.currentTarget.src = `https://via.placeholder.com/32x32/FFD700/000000?text=H`;
                              return;
                            }
                            // First fallback: Try CoinGecko logos
                            if (!e.currentTarget.src.includes('coingecko')) {
                              const coinGeckoLogos: { [key: string]: string } = {
                                'BNB': 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
                                'CAKE': 'https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo_.png',
                                'USDT': 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
                                'USDC': 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
                                'ETH': 'https://assets.coingecko.com/coins/images/279/small/ethereum.png'
                              };
                              if (coinGeckoLogos[token.symbol]) {
                                e.currentTarget.src = coinGeckoLogos[token.symbol];
                                return;
                              }
                            }
                            // Final fallback: Colored placeholder
                            e.currentTarget.src = `https://via.placeholder.com/32x32/FFD700/000000?text=${token.symbol.charAt(0)}`;
                          }}
                        />
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">{token.symbol}</div>
                          <div className="text-xs text-gray-400 truncate">{token.name}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {formatTokenAddress(token.address)}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Simple instruction text at bottom */}
          <div className="flex-shrink-0 p-2 bg-hermes-dark/30 rounded border border-hermes-border/50">
            <p className="text-xs text-gray-400 text-center">
              💡 Paste any BSC contract address (0x...) in search to add custom tokens
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}