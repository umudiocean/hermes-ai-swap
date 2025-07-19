'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { type Token, tokenService } from '@/lib/tokenService'

interface TokenSelectorProps {
  selectedToken?: Token
  onTokenSelect: (token: Token) => void
  disabled?: boolean
}

export default function TokenSelector({ selectedToken, onTokenSelect, disabled }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [popularTokens, setPopularTokens] = useState<Token[]>([])
  const [searchResults, setSearchResults] = useState<Token[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadPopularTokens()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      searchTokens()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadPopularTokens = async () => {
    setIsLoading(true)
    try {
      const tokens = await tokenService.fetchPopularTokens()
      setPopularTokens(tokens)
    } catch (error) {
      console.error('Error loading popular tokens:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const searchTokens = async () => {
    setIsSearching(true)
    try {
      const results = await tokenService.searchTokens(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error searching tokens:', error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTokenSelect = (token: Token) => {
    onTokenSelect(token)
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
  }

  const TokenList = ({ tokens, title }: { tokens: Token[], title: string }) => (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <div className="space-y-1">
        {tokens.map((token) => (
          <div
            key={token.id}
            onClick={() => handleTokenSelect(token)}
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800/50 cursor-pointer transition-colors"
          >
            <img
              src={token.image}
              alt={token.name}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://via.placeholder.com/32/8B5CF6/FFFFFF?text=${token.symbol.charAt(0)}`;
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-white">{token.symbol}</span>
                <Badge variant="outline" className="text-xs">
                  #{token.market_cap_rank}
                </Badge>
              </div>
              <p className="text-sm text-gray-400 truncate">{token.name}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-white">
                {tokenService.formatPrice(token.current_price)}
              </p>
              {token.price_change_percentage_24h !== 0 && (
                <div className={`flex items-center text-xs ${
                  token.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {token.price_change_percentage_24h >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {tokenService.formatPercentageChange(token.price_change_percentage_24h)}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center space-x-3 p-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full sm:w-32 bg-gray-800/50 border-gray-600 text-white h-10 md:h-12 justify-between"
          disabled={disabled}
        >
          {selectedToken ? (
            <div className="flex items-center space-x-2">
              <img
                src={selectedToken.image}
                alt={selectedToken.name}
                className="w-5 h-5 md:w-6 md:h-6 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://via.placeholder.com/24/8B5CF6/FFFFFF?text=${selectedToken.symbol.charAt(0)}`;
                }}
              />
              <span>{selectedToken.symbol}</span>
            </div>
          ) : (
            <span>Select Token</span>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white">Select a Token</DialogTitle>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search name or paste address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800/50 border-gray-600 text-white"
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 space-y-4">
          {isSearching ? (
            <LoadingSkeleton />
          ) : searchResults.length > 0 ? (
            <TokenList tokens={searchResults} title="Search Results" />
          ) : (
            <>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <TokenList tokens={popularTokens} title="Popular Tokens" />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
