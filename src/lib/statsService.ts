import { ethers } from "ethers";
import { SWAP_CONTRACT_ADDRESS, HERMES_CONTRACT_ADDRESS } from "./constants";

interface UserStats {
  totalSwaps: number;
  totalEarnedHermes: string;
  feesSavedBnb: string;
  feesSavedUsd: number;
  lastSwapDate: Date | null;
  averageSwapAmount: string;
  totalVolumeBnb: string;
  totalVolumeUsd: number;
}

interface SwapEvent {
  user: string;
  amountIn: string;
  amountOut: string;
  timestamp: number;
  txHash: string;
}

class StatsService {
  private provider: any = null;
  private swapContract: any = null;
  private hermesContract: any = null;

  // Swap contract ABI for events
  private SWAP_ABI = [
    "event Swap(address indexed user, uint256 amountIn, uint256 amountOut, uint256 timestamp)",
    "function getSwapHistory(address user) view returns (tuple(address user, uint256 amountIn, uint256 amountOut, uint256 timestamp)[])",
    "function getUserStats(address user) view returns (uint256 totalSwaps, uint256 totalEarned, uint256 totalFeesSaved)"
  ];

  // HERMES contract ABI
  private HERMES_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];

  initialize(provider: any) {
    this.provider = provider;
    this.swapContract = new ethers.Contract(SWAP_CONTRACT_ADDRESS, this.SWAP_ABI, provider);
    this.hermesContract = new ethers.Contract(HERMES_CONTRACT_ADDRESS, this.HERMES_ABI, provider);
  }

  async getUserStats(userAddress: string): Promise<UserStats> {
    if (!this.provider || !this.swapContract) {
      throw new Error("Stats service not initialized");
    }

    try {
      // Get stats from smart contract
      const stats = await this.swapContract.getUserStats(userAddress);
      
      // Get swap history
      const swapHistory = await this.getSwapHistory(userAddress);
      
      // Calculate additional stats
      const totalVolumeBnb = this.calculateTotalVolume(swapHistory);
      const totalVolumeUsd = totalVolumeBnb * 300; // Approximate BNB price
      const averageSwapAmount = swapHistory.length > 0 
        ? (totalVolumeBnb / swapHistory.length).toFixed(4)
        : "0.0000";

      const lastSwap = swapHistory.length > 0 
        ? new Date(swapHistory[swapHistory.length - 1].timestamp * 1000)
        : null;

      return {
        totalSwaps: Number(stats.totalSwaps),
        totalEarnedHermes: ethers.formatUnits(stats.totalEarned, 18),
        feesSavedBnb: ethers.formatUnits(stats.totalFeesSaved, 18),
        feesSavedUsd: parseFloat(ethers.formatUnits(stats.totalFeesSaved, 18)) * 300,
        lastSwapDate: lastSwap,
        averageSwapAmount,
        totalVolumeBnb: totalVolumeBnb.toFixed(4),
        totalVolumeUsd
      };
    } catch (error) {
      console.warn("Failed to get user stats from contract, using fallback:", error);
      return this.getFallbackStats(userAddress);
    }
  }

  async getSwapHistory(userAddress: string): Promise<SwapEvent[]> {
    if (!this.swapContract) {
      return [];
    }

    try {
      const history = await this.swapContract.getSwapHistory(userAddress);
      return history.map((event: any) => ({
        user: event.user,
        amountIn: ethers.formatEther(event.amountIn),
        amountOut: ethers.formatUnits(event.amountOut, 18),
        timestamp: Number(event.timestamp),
        txHash: "" // Would need to get from blockchain events
      }));
    } catch (error) {
      console.warn("Failed to get swap history:", error);
      return [];
    }
  }

  private calculateTotalVolume(swapHistory: SwapEvent[]): number {
    return swapHistory.reduce((total, swap) => {
      return total + parseFloat(swap.amountIn);
    }, 0);
  }

  private getFallbackStats(userAddress: string): UserStats {
    // Fallback stats when contract calls fail
    return {
      totalSwaps: 0,
      totalEarnedHermes: "0.00",
      feesSavedBnb: "0.0000",
      feesSavedUsd: 0,
      lastSwapDate: null,
      averageSwapAmount: "0.0000",
      totalVolumeBnb: "0.0000",
      totalVolumeUsd: 0
    };
  }

  // Get recent activity for display
  async getRecentActivity(userAddress: string, limit: number = 5): Promise<SwapEvent[]> {
    const history = await this.getSwapHistory(userAddress);
    return history.slice(-limit).reverse();
  }

  // Calculate fees saved (HERMES swap has lower fees than PancakeSwap)
  calculateFeesSaved(swapAmount: number): { bnb: number; usd: number } {
    const pancakeSwapFee = swapAmount * 0.0025; // 0.25% fee
    const hermesSwapFee = swapAmount * 0.001; // 0.1% fee
    const savedBnb = pancakeSwapFee - hermesSwapFee;
    const savedUsd = savedBnb * 300; // Approximate BNB price
    
    return { bnb: savedBnb, usd: savedUsd };
  }

  // Get HERMES balance for user
  async getHermesBalance(userAddress: string): Promise<string> {
    if (!this.hermesContract) {
      return "0.00";
    }

    try {
      const balance = await this.hermesContract.balanceOf(userAddress);
      const decimals = await this.hermesContract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.warn("Failed to get HERMES balance:", error);
      return "0.00";
    }
  }
}

export const statsService = new StatsService(); 