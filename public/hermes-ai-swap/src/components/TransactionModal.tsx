'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowDown, Clock, CheckCircle, AlertCircle, ExternalLink, Zap } from 'lucide-react'
import type { Token } from '@/lib/tokenService'

export interface SwapTransaction {
  id: string
  fromToken: Token
  toToken: Token
  fromAmount: string
  toAmount: string
  rate: string
  slippage: number
  gaslessFee: string
  priceImpact: string
  timestamp: Date
  status: 'pending' | 'confirmed' | 'failed'
  txHash?: string
}

interface TransactionModalProps {
  isOpen: boolean
  onClose: () => void
  transaction?: SwapTransaction
  onConfirm?: () => void
  isLoading?: boolean
  step?: 'review' | 'pending' | 'confirmed' | 'failed'
}

export default function TransactionModal({
  isOpen,
  onClose,
  transaction,
  onConfirm,
  isLoading = false,
  step = 'review'
}: TransactionModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsConfirming(true)
      try {
        await onConfirm()
      } finally {
        setIsConfirming(false)
      }
    }
  }

  const getStepContent = () => {
    switch (step) {
      case 'review':
        return <ReviewStep />
      case 'pending':
        return <PendingStep />
      case 'confirmed':
        return <ConfirmedStep />
      case 'failed':
        return <FailedStep />
      default:
        return <ReviewStep />
    }
  }

  const ReviewStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-white mb-2">Review Swap</h3>
        <p className="text-sm text-gray-400">Please review your transaction details</p>
      </div>

      {transaction ? (
        <div className="space-y-4">
          {/* Swap Details */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={transaction.fromToken.image}
                  alt={transaction.fromToken.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-white">{transaction.fromAmount} {transaction.fromToken.symbol}</p>
                  <p className="text-sm text-gray-400">{transaction.fromToken.name}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowDown className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <img
                  src={transaction.toToken.image}
                  alt={transaction.toToken.name}
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="font-medium text-white">{transaction.toAmount} {transaction.toToken.symbol}</p>
                  <p className="text-sm text-gray-400">{transaction.toToken.name}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Rate</span>
              <span className="text-white">{transaction.rate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span className="text-white">{transaction.slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span className={`${
                Number.parseFloat(transaction.priceImpact) > 5 ? 'text-red-400' : 'text-white'
              }`}>
                {transaction.priceImpact}
              </span>
            </div>
            <div className="flex justify-between">
              <div className="flex items-center space-x-1">
                <span className="text-gray-400">Gasless Fee</span>
                <Zap className="w-3 h-3 text-pink-400" />
              </div>
              <span className="text-green-400">{transaction.gaslessFee}</span>
            </div>
          </div>

          {/* Warning for high price impact */}
          {Number.parseFloat(transaction.priceImpact) > 5 && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">High Price Impact Warning</span>
              </div>
              <p className="text-xs text-red-300 mt-1">
                This swap has a price impact of {transaction.priceImpact}. You may lose a significant portion of your funds.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 border-gray-600 text-white hover:bg-gray-800"
        >
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={isConfirming}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isConfirming ? 'Confirming...' : 'Confirm Swap'}
        </Button>
      </div>
    </div>
  )

  const PendingStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500"></div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Transaction Pending</h3>
        <p className="text-sm text-gray-400">
          Your transaction is being processed. This may take a few moments...
        </p>
      </div>
      {transaction?.txHash && (
        <Button
          variant="outline"
          size="sm"
          className="border-gray-600 text-white hover:bg-gray-800"
          onClick={() => window.open(`https://etherscan.io/tx/${transaction.txHash}`, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </Button>
      )}
    </div>
  )

  const ConfirmedStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <CheckCircle className="w-16 h-16 text-green-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Swap Successful!</h3>
        <p className="text-sm text-gray-400">
          Your tokens have been swapped successfully.
        </p>
      </div>
      {transaction && (
        <div className="bg-gray-800/50 rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">You received</p>
          <p className="text-lg font-semibold text-white">
            {transaction.toAmount} {transaction.toToken.symbol}
          </p>
        </div>
      )}
      <div className="flex space-x-3">
        {transaction?.txHash && (
          <Button
            variant="outline"
            className="flex-1 border-gray-600 text-white hover:bg-gray-800"
            onClick={() => window.open(`https://etherscan.io/tx/${transaction.txHash}`, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Transaction
          </Button>
        )}
        <Button
          onClick={onClose}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Close
        </Button>
      </div>
    </div>
  )

  const FailedStep = () => (
    <div className="space-y-6 text-center">
      <div className="flex justify-center">
        <AlertCircle className="w-16 h-16 text-red-400" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-white mb-2">Transaction Failed</h3>
        <p className="text-sm text-gray-400">
          Your transaction could not be completed. Please try again.
        </p>
      </div>
      <div className="flex space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          className="flex-1 border-gray-600 text-white hover:bg-gray-800"
        >
          Close
        </Button>
        <Button
          onClick={handleConfirm}
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          Try Again
        </Button>
      </div>
    </div>
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white sr-only">Transaction Modal</DialogTitle>
        </DialogHeader>
        {getStepContent()}
      </DialogContent>
    </Dialog>
  )
}
