import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RewardState {
  // Current claimable reward count
  rewardCount: number
  // Total rewards claimed lifetime
  totalClaimed: number
  // Last claim timestamp
  lastClaimTime: number | null

  // Actions
  increment: () => void
  reset: () => void
  claim: (amount: number) => void
  getClaimableAmount: () => string
}

export const useRewardStore = create<RewardState>()(
  persist(
    (set, get) => ({
      rewardCount: 0,
      totalClaimed: 0,
      lastClaimTime: null,

      increment: () =>
        set((state) => ({
          rewardCount: state.rewardCount + 1
        })),

      reset: () =>
        set((state) => ({
          rewardCount: 0,
          lastClaimTime: Date.now()
        })),

      claim: (amount: number) =>
        set((state) => ({
          rewardCount: 0,
          totalClaimed: state.totalClaimed + amount,
          lastClaimTime: Date.now()
        })),

      getClaimableAmount: () => {
        const { rewardCount } = get()
        const tokensPerReward = 100000 // 100,000 HERMES per reward
        const totalTokens = rewardCount * tokensPerReward
        return totalTokens.toLocaleString('en-US')
      }
    }),
    {
      name: 'hermes-rewards', // unique name
      version: 1
    }
  )
)

// Constants for HERMES token
export const HERMES_TOKEN = {
  address: '0x9495ab3549338bf14ad2f86cbcf79c7b574bba37' as const,
  decimals: 18,
  symbol: 'HERMES',
  name: 'Hermes Token',
  tokensPerReward: 100000,
  // Chain: BSC Mainnet
  chainId: 56
}

// PancakeSwap Router and Factory addresses
export const PANCAKESWAP = {
  ROUTER_V2: '0x10ED43C718714eb63d5aA57B78B54704E256024E' as const,
  FACTORY_V2: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73' as const,
  WBNB: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' as const,
  TOKEN_LIST_URL: 'https://tokens.pancakeswap.finance/pancakeswap-extended.json'
}

// Fee collection address
export const FEE_CONFIG = {
  FEE_ADDRESS: '0x0000000000000000000000000000000000000000', // Replace with actual fee address
  FEE_AMOUNT: '0.0008', // 0.0008 BNB fee per swap
  FEE_AMOUNT_WEI: '800000000000000' // 0.0008 BNB in wei
}

export default useRewardStore
