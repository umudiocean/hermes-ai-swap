'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createWeb3Modal } from '@web3modal/wagmi'
import { type State, WagmiProvider } from 'wagmi'
import { config, projectId } from '@/lib/wagmi'
import type { ReactNode } from 'react'
import { useEffect, useState } from 'react'

// Setup queryClient
const queryClient = new QueryClient()

// Create modal only on client side to avoid SSR issues
let web3Modal: any = null

function initializeWeb3Modal() {
  if (typeof window !== 'undefined' && !web3Modal) {
    web3Modal = createWeb3Modal({
      wagmiConfig: config,
      projectId,
      enableAnalytics: true,
      enableOnramp: true,
      themeMode: 'dark',
      themeVariables: {
        '--w3m-accent': '#8B5CF6', // Purple accent
        '--w3m-color-mix': '#1E1B4B',
        '--w3m-color-mix-strength': 40
      }
    })
  }
}

export default function Web3ModalProvider({
  children,
  initialState
}: {
  children: ReactNode
  initialState?: State
}) {
  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
