import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { bsc } from 'wagmi/chains'

// Web3Modal Project ID
const projectId = 'e1ce1bbc0f07c7cdf3c896b9cb0b7182'

// Dynamic URL detection for development and production
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'https://hermesaiswap.com'; // Fallback for SSR
};

// App metadata with dynamic URL
const metadata = {
  name: 'Hermes AI Swap',
  description: 'DeFi Trading Platform',
  url: getBaseUrl(),
  icons: [`${getBaseUrl()}/hermes ai logo_1751664533943.jpg`]
}

// Configure chains
const chains = [bsc] as const

// Create wagmi config
const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
  enableCoinbase: true,
})

// Create Web3Modal
createWeb3Modal({
  wagmiConfig: config,
  projectId,
  enableAnalytics: false,
  enableOnramp: false,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#1a1a1a',
    '--w3m-color-mix-strength': 40,
    '--w3m-accent': '#6495ed',
    '--w3m-font-size-master': '12px',
    '--w3m-border-radius-master': '12px',
    '--w3m-z-index': 999999
  }
})

export { config }