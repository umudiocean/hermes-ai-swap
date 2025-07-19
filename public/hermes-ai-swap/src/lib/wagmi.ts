import { defaultWagmiConfig } from '@web3modal/wagmi'
import { mainnet, polygon, bsc, arbitrum } from 'wagmi/chains'

// Get projectId from https://cloud.walletconnect.com
export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'demo-project-id'

if (!projectId) throw new Error('Project ID is not defined')

const metadata = {
  name: 'Hermes Ai Swap',
  description: 'Experience the Future of DeFi with Zero Gas Fees',
  url: 'https://hermes-ai-swap.netlify.app',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [mainnet, polygon, bsc, arbitrum] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
})

export { mainnet, polygon, bsc, arbitrum }
