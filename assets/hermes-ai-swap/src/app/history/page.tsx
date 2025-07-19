'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, ArrowDown, ExternalLink, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react'
import type { SwapTransaction } from '@/components/TransactionModal'
import Link from 'next/link'

// Mock transaction data - in a real app, this would come from an API or blockchain
const mockTransactions: SwapTransaction[] = [
  {
    id: '1',
    fromToken: {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 2450,
      market_cap: 0,
      market_cap_rank: 2,
      price_change_percentage_24h: 2.5
    },
    toToken: {
      id: 'tether',
      symbol: 'USDT',
      name: 'Tether',
      image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
      current_price: 1,
      market_cap: 0,
      market_cap_rank: 3,
      price_change_percentage_24h: 0.1
    },
    fromAmount: '1.5',
    toAmount: '3,675.00',
    rate: '1 ETH = 2,450 USDT',
    slippage: 2.5,
    gaslessFee: '0.00 USDT',
    priceImpact: '-0.12%',
    timestamp: new Date('2024-01-15T14:30:00Z'),
    status: 'confirmed',
    txHash: '0x1234567890abcdef...'
  },
  {
    id: '2',
    fromToken: {
      id: 'binancecoin',
      symbol: 'BNB',
      name: 'BNB',
      image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
      current_price: 320,
      market_cap: 0,
      market_cap_rank: 4,
      price_change_percentage_24h: -1.2
    },
    toToken: {
      id: 'binance-usd',
      symbol: 'BUSD',
      name: 'Binance USD',
      image: 'https://assets.coingecko.com/coins/images/9576/large/BUSD.png',
      current_price: 1,
      market_cap: 0,
      market_cap_rank: 6,
      price_change_percentage_24h: 0
    },
    fromAmount: '2.0',
    toAmount: '640.00',
    rate: '1 BNB = 320 BUSD',
    slippage: 1.0,
    gaslessFee: '0.00 BUSD',
    priceImpact: '-0.05%',
    timestamp: new Date('2024-01-14T09:15:00Z'),
    status: 'confirmed',
    txHash: '0xabcdef1234567890...'
  },
  {
    id: '3',
    fromToken: {
      id: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
      current_price: 42000,
      market_cap: 0,
      market_cap_rank: 1,
      price_change_percentage_24h: 1.8
    },
    toToken: {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 2450,
      market_cap: 0,
      market_cap_rank: 2,
      price_change_percentage_24h: 2.5
    },
    fromAmount: '0.1',
    toAmount: '1.714',
    rate: '1 BTC = 17.14 ETH',
    slippage: 3.0,
    gaslessFee: '0.00 ETH',
    priceImpact: '-0.25%',
    timestamp: new Date('2024-01-13T16:45:00Z'),
    status: 'pending',
    txHash: '0x9876543210fedcba...'
  },
  {
    id: '4',
    fromToken: {
      id: 'usd-coin',
      symbol: 'USDC',
      name: 'USD Coin',
      image: 'https://assets.coingecko.com/coins/images/6319/large/USD_Coin_icon.png',
      current_price: 1,
      market_cap: 0,
      market_cap_rank: 5,
      price_change_percentage_24h: 0
    },
    toToken: {
      id: 'ethereum',
      symbol: 'ETH',
      name: 'Ethereum',
      image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
      current_price: 2450,
      market_cap: 0,
      market_cap_rank: 2,
      price_change_percentage_24h: 2.5
    },
    fromAmount: '1000.00',
    toAmount: '0.408',
    rate: '1 USDC = 0.000408 ETH',
    slippage: 2.0,
    gaslessFee: '0.00 ETH',
    priceImpact: '-1.2%',
    timestamp: new Date('2024-01-12T11:20:00Z'),
    status: 'failed'
  }
]

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<SwapTransaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'pending' | 'failed'>('all')

  useEffect(() => {
    // Simulate loading transactions
    setTimeout(() => {
      setTransactions(mockTransactions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true
    return tx.status === filter
  })

  const getStatusIcon = (status: SwapTransaction['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />
    }
  }

  const getStatusColor = (status: SwapTransaction['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-900/20 text-green-400 border-green-700'
      case 'pending':
        return 'bg-yellow-900/20 text-yellow-400 border-yellow-700'
      case 'failed':
        return 'bg-red-900/20 text-red-400 border-red-700'
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatTxHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
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
          <h1 className="text-xl md:text-2xl font-bold text-white">Transaction History</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-4 md:p-6">
        {/* Filters */}
        <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          {(['all', 'confirmed', 'pending', 'failed'] as const).map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status)}
              className={`capitalize whitespace-nowrap ${
                filter === status
                  ? 'bg-purple-600 text-white'
                  : 'border-gray-600 text-gray-300 hover:bg-gray-800'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-gray-800/50 border-gray-700 p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="mt-4 flex justify-center">
                  <Skeleton className="h-4 w-4" />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              </Card>
            ))
          ) : filteredTransactions.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700 p-8 text-center">
              <p className="text-gray-400">No transactions found</p>
            </Card>
          ) : (
            filteredTransactions.map((transaction) => (
              <Card key={transaction.id} className="bg-gray-800/50 border-gray-700 p-4 md:p-6 hover:bg-gray-800/70 transition-colors">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(transaction.status)}
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-400">
                        {formatDate(transaction.timestamp)}
                      </span>
                    </div>
                    {transaction.txHash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://etherscan.io/tx/${transaction.txHash}`, '_blank')}
                        className="text-gray-400 hover:text-white"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Swap Details */}
                  <div className="space-y-3">
                    {/* From Token */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={transaction.fromToken.image}
                          alt={transaction.fromToken.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-white">
                            -{transaction.fromAmount} {transaction.fromToken.symbol}
                          </p>
                          <p className="text-sm text-gray-400">{transaction.fromToken.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">From</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex justify-center">
                      <ArrowDown className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* To Token */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={transaction.toToken.image}
                          alt={transaction.toToken.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-white">
                            +{transaction.toAmount} {transaction.toToken.symbol}
                          </p>
                          <p className="text-sm text-gray-400">{transaction.toToken.name}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-400">To</p>
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-700/50 text-sm">
                    <div>
                      <p className="text-gray-400">Rate</p>
                      <p className="text-white font-medium">{transaction.rate}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Slippage</p>
                      <p className="text-white">{transaction.slippage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Price Impact</p>
                      <p className={`${
                        Number.parseFloat(transaction.priceImpact) > 5 ? 'text-red-400' : 'text-white'
                      }`}>
                        {transaction.priceImpact}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Gas Fee</p>
                      <p className="text-green-400">{transaction.gaslessFee}</p>
                    </div>
                  </div>

                  {transaction.txHash && (
                    <div className="pt-2 border-t border-gray-700/50">
                      <p className="text-xs text-gray-400">
                        Transaction: {formatTxHash(transaction.txHash)}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
