'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Copy, ExternalLink, RefreshCw } from 'lucide-react'
import { type Token, tokenService } from '@/lib/tokenService'
import { useAccount, useBalance } from 'wagmi'
import Link from 'next/link'

interface PortfolioToken extends Token {
  balance: string
  balanceUSD: number
  percentage: number
}

// Mock portfolio data - in a real app, this would come from wallet balances
const mockPortfolio: PortfolioToken[] = [
  {
    id: 'ethereum',
    symbol: 'ETH',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    current_price: 2450,
    market_cap: 0,
    market_cap_rank: 2,
    price_change_percentage_24h: 2.5,
    balance: '2.5',
    balanceUSD: 6125,
    percentage: 45.2
  },
  {
    id: 'binancecoin',
    symbol: 'BNB',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    current_price: 320,
    market_cap: 0,
    market_cap_rank: 4,
    price_change_percentage_24h: -1.2,
    balance: '8.0',
    balanceUSD: 2560,
    percentage: 18.9
  },
  {
    id: 'tether',
    symbol: 'USDT',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    current_price: 1,
    market_cap: 0,
    market_cap_rank: 3,
    price_change_percentage_24h: 0.1,
    balance: '3,250.00',
    balanceUSD: 3250,
    percentage: 24.0
  },
  {
    id: 'usd-coin',
    symbol: 'USDC',
    name: 'USD Coin',
    image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
    current_price: 1,
    market_cap: 0,
    market_cap_rank: 5,
    price_change_percentage_24h: 0,
    balance: '1,620.00',
    balanceUSD: 1620,
    percentage: 12.0
  }
]

export default function DashboardPage() {
  const { address, isConnected } = useAccount()
  const { data: ethBalance } = useBalance({ address })

  const [portfolio, setPortfolio] = useState<PortfolioToken[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalValue, setTotalValue] = useState(0)
  const [totalChange24h, setTotalChange24h] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadPortfolioData()
  }, [])

  const loadPortfolioData = async () => {
    setIsLoading(true)
    try {
      // In a real app, you would fetch actual wallet balances
      // For now, we'll use mock data and update prices
      const tokenIds = mockPortfolio.map(token => token.id)
      const prices = await tokenService.fetchTokenPrices(tokenIds)

      const updatedPortfolio = mockPortfolio.map(token => ({
        ...token,
        current_price: prices[token.id]?.usd || token.current_price,
        price_change_percentage_24h: prices[token.id]?.usd_24h_change || token.price_change_percentage_24h,
        balanceUSD: Number.parseFloat(token.balance.replace(',', '')) * (prices[token.id]?.usd || token.current_price)
      }))

      const total = updatedPortfolio.reduce((sum, token) => sum + token.balanceUSD, 0)
      const change24h = updatedPortfolio.reduce((sum, token) => {
        const change = (token.balanceUSD * token.price_change_percentage_24h) / 100
        return sum + change
      }, 0)

      setPortfolio(updatedPortfolio)
      setTotalValue(total)
      setTotalChange24h(change24h)
    } catch (error) {
      console.error('Error loading portfolio:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadPortfolioData()
    setIsRefreshing(false)
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      // In a real app, you might show a toast notification here
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 flex items-center justify-center">
        <Card className="bg-gray-800/50 border-gray-700 p-8 text-center max-w-md">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">Connect your wallet to view your portfolio</p>
          <w3m-button />
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/50">
        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-300">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Swap
            </Button>
          </Link>
          <h1 className="text-xl md:text-2xl font-bold text-white">Portfolio Dashboard</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="border-gray-600 text-white hover:bg-gray-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </header>

      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        {/* Wallet Info */}
        <Card className="bg-gray-800/50 border-gray-700 p-4 md:p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Connected Wallet</p>
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-white">{formatAddress(address!)}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyAddress}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            <w3m-button />
          </div>
        </Card>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-800/50 border-gray-700 p-4 md:p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Total Portfolio Value</p>
              {isLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <p className="text-2xl font-bold text-white">
                  {tokenService.formatPrice(totalValue)}
                </p>
              )}
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 md:p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">24h Change</p>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="flex items-center space-x-2">
                  <p className={`text-2xl font-bold ${
                    totalChange24h >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {tokenService.formatPrice(Math.abs(totalChange24h))}
                  </p>
                  {totalChange24h >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700 p-4 md:p-6">
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Active Tokens</p>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold text-white">{portfolio.length}</p>
              )}
            </div>
          </Card>
        </div>

        {/* Token Holdings */}
        <Card className="bg-gray-800/50 border-gray-700">
          <div className="p-4 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Token Holdings</h2>

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="space-y-2 text-right">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {portfolio.map((token) => (
                  <div
                    key={token.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <img
                        src={token.image}
                        alt={token.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="font-medium text-white">{token.symbol}</p>
                          <Badge variant="outline" className="text-xs">
                            {token.percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">{token.name}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium text-white">{token.balance} {token.symbol}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-400">
                          {tokenService.formatPrice(token.balanceUSD)}
                        </p>
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              Make a Swap
            </Button>
          </Link>
          <Link href="/history" className="flex-1">
            <Button variant="outline" className="w-full border-gray-600 text-white hover:bg-gray-800">
              View History
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
