'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Settings, ArrowDown, Zap, Check, Github, BookOpen, Users, History, User } from "lucide-react"
import { useAccount, useConnect } from 'wagmi'
import { type Token, tokenService } from '@/lib/tokenService'
import TokenSelector from '@/components/TokenSelector'
import TransactionModal, { type SwapTransaction } from '@/components/TransactionModal'
import Link from 'next/link'

export default function HomePage() {
  const { address, isConnected } = useAccount()

  // Token and swap state
  const [fromToken, setFromToken] = useState<Token | undefined>()
  const [toToken, setToToken] = useState<Token | undefined>()
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [slippage, setSlippage] = useState([2.5])
  const [useGasless, setUseGasless] = useState(true)
  const [isLoadingPrices, setIsLoadingPrices] = useState(false)

  // Transaction modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentTransaction, setCurrentTransaction] = useState<SwapTransaction | undefined>()
  const [transactionStep, setTransactionStep] = useState<'review' | 'pending' | 'confirmed' | 'failed'>('review')

  useEffect(() => {
    // Load default tokens
    loadDefaultTokens()
  }, [])

  useEffect(() => {
    // Update swap calculation when tokens or amounts change
    if (fromToken && toToken && fromAmount) {
      calculateSwap()
    }
  }, [fromToken, toToken, fromAmount])

  const loadDefaultTokens = async () => {
    try {
      const tokens = await tokenService.fetchPopularTokens()
      // Set BNB as default from token
      const bnb = tokens.find(token => token.symbol === 'BNB')
      // Set BUSD as default to token
      const busd = tokens.find(token => token.symbol === 'BUSD')

      if (bnb) setFromToken(bnb)
      if (busd) setToToken(busd)

      // Set default amounts
      setFromAmount('1')
    } catch (error) {
      console.error('Error loading default tokens:', error)
    }
  }

  const calculateSwap = async () => {
    if (!fromToken || !toToken || !fromAmount || Number.parseFloat(fromAmount) <= 0) {
      setToAmount('')
      return
    }

    setIsLoadingPrices(true)
    try {
      const amount = Number.parseFloat(fromAmount)
      const rate = tokenService.calculateSwapRate(fromToken, toToken, amount)

      // Apply slippage
      const slippageDecimal = slippage[0] / 100
      const finalAmount = rate * (1 - slippageDecimal)

      setToAmount(finalAmount.toFixed(6))
    } catch (error) {
      console.error('Error calculating swap:', error)
      setToAmount('')
    } finally {
      setIsLoadingPrices(false)
    }
  }

  const handleSwapTokens = () => {
    const tempToken = fromToken
    const tempAmount = fromAmount

    setFromToken(toToken)
    setToToken(tempToken)
    setFromAmount(toAmount)
    setToAmount(tempAmount)
  }

  const createSwapTransaction = (): SwapTransaction => {
    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      throw new Error('Missing token or amount information')
    }

    const priceImpact = Math.abs((Number.parseFloat(fromAmount) * fromToken.current_price - Number.parseFloat(toAmount) * toToken.current_price) / (Number.parseFloat(fromAmount) * fromToken.current_price) * 100)

    return {
      id: Date.now().toString(),
      fromToken,
      toToken,
      fromAmount,
      toAmount,
      rate: `1 ${fromToken.symbol} = ${(tokenService.calculateSwapRate(fromToken, toToken, 1)).toFixed(6)} ${toToken.symbol}`,
      slippage: slippage[0],
      gaslessFee: useGasless ? '0.00 ' + toToken.symbol : '0.003 ETH',
      priceImpact: `-${priceImpact.toFixed(2)}%`,
      timestamp: new Date(),
      status: 'pending'
    }
  }

  const handleSwap = () => {
    if (!isConnected) {
      // If not connected, trigger wallet connection
      return
    }

    if (!fromToken || !toToken || !fromAmount || !toAmount) {
      return
    }

    try {
      const transaction = createSwapTransaction()
      setCurrentTransaction(transaction)
      setTransactionStep('review')
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const confirmTransaction = async () => {
    if (!currentTransaction) return

    setTransactionStep('pending')

    // Simulate transaction processing
    try {
      await new Promise(resolve => setTimeout(resolve, 3000))

      // Simulate random success/failure (90% success rate)
      const success = Math.random() > 0.1

      if (success) {
        setCurrentTransaction({
          ...currentTransaction,
          status: 'confirmed',
          txHash: '0x' + Math.random().toString(16).substr(2, 40)
        })
        setTransactionStep('confirmed')
      } else {
        setCurrentTransaction({
          ...currentTransaction,
          status: 'failed'
        })
        setTransactionStep('failed')
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      setTransactionStep('failed')
    }
  }

  const getSwapButtonText = () => {
    if (!isConnected) return 'Connect Wallet to Swap'
    if (!fromToken || !toToken) return 'Select Tokens'
    if (!fromAmount || Number.parseFloat(fromAmount) <= 0) return 'Enter Amount'
    if (isLoadingPrices) return 'Calculating...'
    return 'Swap Tokens'
  }

  const canSwap = () => {
    return isConnected && fromToken && toToken && fromAmount && Number.parseFloat(fromAmount) > 0 && !isLoadingPrices
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 flex-wrap gap-4">
        <div className="flex items-center space-x-4 md:space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <span className="text-white font-bold text-lg md:text-xl hidden sm:block">HERMES AI GASLESS SWAP</span>
            <span className="text-white font-bold text-sm sm:hidden">HERMES AI</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Button variant="ghost" className="text-white hover:text-purple-300">
              Swap
            </Button>
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white hover:text-purple-300">
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/history">
              <Button variant="ghost" className="text-white hover:text-purple-300">
                <History className="w-4 h-4 mr-2" />
                History
              </Button>
            </Link>
          </nav>
        </div>

        {isConnected ? (
          <div className="flex items-center space-x-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-gray-600 text-white hover:bg-gray-800 hidden sm:inline-flex">
                <User className="w-4 h-4 mr-2" />
                Portfolio
              </Button>
            </Link>
            <w3m-button />
          </div>
        ) : (
          <w3m-button />
        )}
      </header>

      {/* Hero Section */}
      <div className="text-center py-8 md:py-16 px-4 md:px-6">
        <div className="flex items-center justify-center space-x-2 md:space-x-4 mb-4">
          <Zap className="w-8 h-8 md:w-12 md:h-12 text-pink-400" />
          <h1 className="text-3xl md:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            Hermes Ai Swap
          </h1>
          <Zap className="w-8 h-8 md:w-12 md:h-12 text-pink-400" />
        </div>
        <p className="text-lg md:text-xl text-gray-300 mb-6 md:mb-8 px-4">
          Experience the Future of DeFi with <span className="text-pink-400 font-semibold">Zero Gas Fees</span>
        </p>
        <div className="flex items-center justify-center space-x-2 text-green-400">
          <Check className="w-4 h-4 md:w-5 md:h-5" />
          <span className="text-sm md:text-base">Gasless Transactions Enabled</span>
        </div>
      </div>

      {/* Connect Wallet Banner */}
      {!isConnected && (
        <div className="max-w-2xl mx-auto mb-6 md:mb-8 px-4 md:px-6">
          <Card className="bg-gray-800/50 border-gray-700 p-3 md:p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <span className="text-gray-300 text-sm md:text-base">Connect wallet to continue</span>
              <w3m-button />
            </div>
          </Card>
        </div>
      )}

      {/* Swap Interface */}
      <div className="max-w-lg mx-auto px-4 md:px-6 pb-12 md:pb-16">
        <Card className="bg-gradient-to-br from-purple-800/80 to-indigo-800/80 border-purple-600/50 backdrop-blur-sm">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-white">Swap Tokens</h2>
              <Settings className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
            </div>

            <div className="space-y-4">
              {/* From Token */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">From</label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="0.0"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                      className="bg-gray-800/50 border-gray-600 text-white text-right text-lg h-10 md:h-12"
                      type="number"
                      step="any"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {fromToken && fromAmount && Number.parseFloat(fromAmount) > 0
                        ? `≈ ${tokenService.formatPrice(Number.parseFloat(fromAmount) * fromToken.current_price)}`
                        : '≈ $0.00'
                      }
                    </div>
                  </div>
                  <TokenSelector
                    selectedToken={fromToken}
                    onTokenSelect={setFromToken}
                  />
                </div>
              </div>

              {/* Swap Arrow */}
              <div className="flex justify-center py-2">
                <div
                  onClick={handleSwapTokens}
                  className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center cursor-pointer hover:bg-purple-700 transition-colors"
                >
                  <ArrowDown className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* To Token */}
              <div className="space-y-2">
                <label className="text-sm text-gray-300">To</label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <div className="flex-1">
                    <Input
                      placeholder="0.0"
                      value={toAmount}
                      readOnly
                      className="bg-gray-800/50 border-gray-600 text-white text-right text-lg h-10 md:h-12"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {toToken && toAmount && Number.parseFloat(toAmount) > 0
                        ? `≈ ${tokenService.formatPrice(Number.parseFloat(toAmount) * toToken.current_price)}`
                        : '≈ $0.00'
                      }
                    </div>
                  </div>
                  <TokenSelector
                    selectedToken={toToken}
                    onTokenSelect={setToToken}
                  />
                </div>
              </div>

              {/* Slippage Tolerance */}
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300">Slippage Tolerance: {slippage[0]}%</label>
                </div>
                <Slider
                  value={slippage}
                  onValueChange={setSlippage}
                  max={50}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Options */}
              <div className="space-y-2 pt-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="pancake"
                    name="protocol"
                    checked={!useGasless}
                    onChange={() => setUseGasless(false)}
                    className="text-purple-600"
                  />
                  <label htmlFor="pancake" className="text-sm text-gray-300">Use PancakeSwap V2</label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="gasless"
                    name="protocol"
                    checked={useGasless}
                    onChange={() => setUseGasless(true)}
                    className="text-purple-600"
                  />
                  <label htmlFor="gasless" className="text-sm text-pink-400">Use Gasless Swap</label>
                  <Zap className="w-4 h-4 text-pink-400" />
                </div>
              </div>

              {/* Status */}
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-3 mt-4">
                <div className="flex items-center space-x-2 text-green-400">
                  <Check className="w-4 h-4" />
                  <span className="text-sm">Status: Ready to Swap</span>
                </div>
              </div>

              {/* Swap Button */}
              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base md:text-lg font-semibold mt-6"
                onClick={handleSwap}
                disabled={!canSwap()}
              >
                {getSwapButtonText()}
              </Button>

              {/* Rate Information */}
              {fromToken && toToken && fromAmount && toAmount && (
                <div className="space-y-2 pt-4 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Rate</span>
                    <span className="text-right">
                      1 {fromToken.symbol} = {(tokenService.calculateSwapRate(fromToken, toToken, 1)).toFixed(6)} {toToken.symbol}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>USD Value</span>
                    <span>{tokenService.formatPrice(Number.parseFloat(toAmount) * toToken.current_price)}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Fee</span>
                    <span className="text-green-400">{useGasless ? '0.00 ' + toToken.symbol : '0.003 ETH'}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Price Impact</span>
                    <span className="text-green-400">{'<0.01%'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={currentTransaction}
        onConfirm={confirmTransaction}
        step={transactionStep}
      />

      {/* Footer */}
      <footer className="text-center py-6 md:py-8 px-4 md:px-6 border-t border-gray-700/50">
        <div className="flex items-center justify-center space-x-2 mb-4 flex-wrap">
          <span className="text-gray-400 text-sm md:text-base">Hermes Ai Swap — Powered by Hermes</span>
          <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded">Zero Gas</span>
        </div>
        <div className="flex items-center justify-center space-x-4 md:space-x-6 flex-wrap gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs md:text-sm">
            <BookOpen className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Documentation
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs md:text-sm">
            <Github className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Github
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs md:text-sm">
            <Users className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            Community
          </Button>
        </div>
      </footer>
    </div>
  )
}
