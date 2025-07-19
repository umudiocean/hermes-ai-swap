import { ethers } from "ethers";
import { HERMES_SINGLE_TX_ADDRESS } from "./constants";

const HERMES_SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable",
  "function swapBNBToHERMES() external payable",
  "function swapHERMESToBNB(uint256 amount) external payable",
  "function estimateSwap(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 estimatedOut)",
  "function getContractInfo() external view returns (uint256 hermesBalance, uint256 bnbBalance, uint256 swapCount, uint256 rewardsDistributed, bool canReward)",
  "function getRewardBalance() external view returns (uint256)",
  "function totalSwaps() external view returns (uint256)",
  "function totalRewardsDistributed() external view returns (uint256)",
  "event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 reward)",
  "event RewardPaid(address indexed user, uint256 amount)",
  "event FeeCollected(uint256 amount)"
];

export class HermesSwapService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    
    // Only initialize if contract is deployed
    if (HERMES_SINGLE_TX_ADDRESS && HERMES_SINGLE_TX_ADDRESS.length > 0) {
      this.contract = new ethers.Contract(
        HERMES_SINGLE_TX_ADDRESS,
        HERMES_SWAP_ABI,
        signer
      );
    }
  }

  // This contract only supports HERMES->BNB swaps
  async swapAndReward(): Promise<string> {
    throw new Error("BNB->Token swaps not supported by this contract. Use PancakeSwap multicall instead.");
  }

  // TRUE single transaction: Token->BNB swap + fee + reward in one TX
  async swapTokenToBNBAndReward(
    tokenInAddress: string,
    amountIn: string,
    amountOutMin: string,
    feeValue: string = "0.0005"
  ): Promise<string> {
    if (!this.contract) {
      throw new Error("HermesSwap contract not deployed yet");
    }

    try {
      console.log("Executing TRUE single transaction Token->BNB via HermesSwap contract...");

      const userAddress = await this.signer!.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 minutes

      const amountInWei = ethers.parseUnits(amountIn, 18);
      const minAmountOut = "1"; // 1 wei minimum to avoid slippage issues
      
      // Only support HERMES token
      if (tokenInAddress.toLowerCase() !== "0x9495aB3549338BF14aD2F86CbcF79C7b574bba37".toLowerCase()) {
        throw new Error("This contract only supports HERMES->BNB swaps");
      }

      const tx = await this.contract.swapHermesForBNBWithSupport(
        amountInWei,
        minAmountOut,
        userAddress,
        deadline,
        {
          value: ethers.parseEther(feeValue), // 0.0005 BNB fee
          gasLimit: 800000
        }
      );

      await tx.wait();
      console.log("TRUE single transaction Token->BNB completed:", tx.hash);
      
      return tx.hash;
    } catch (error) {
      console.error("HermesSwap Token->BNB contract failed:", error);
      throw error;
    }
  }

  // This contract only supports HERMES->BNB swaps
  async swapTokenToTokenAndReward(): Promise<string> {
    throw new Error("Token->Token swaps not supported by this contract. Use PancakeSwap multicall instead.");
  }

  async getClaimableRewards(userAddress: string): Promise<string> {
    // Temporary: Return 0 until contract function is confirmed
    return "0";
  }

  async getUserSwapCount(userAddress: string): Promise<number> {
    if (!this.contract) return 0;

    try {
      const count = await this.contract.getUserSwapCount(userAddress);
      return Number(count);
    } catch (error) {
      console.error("Failed to get swap count:", error);
      return 0;
    }
  }

  async claimRewards(userAddress: string): Promise<string> {
    // New contract gives rewards instantly during swap, no separate claim needed
    throw new Error("Rewards are given instantly during swap. No separate claim required.");
  }

  isContractDeployed(): boolean {
    return HERMES_SINGLE_TX_ADDRESS && HERMES_SINGLE_TX_ADDRESS.length > 0;
  }

  // Test contract functionality with minimal BNB
  async testContract(): Promise<string> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const tx = await this.contract.testSwap({
        value: ethers.parseEther("0.001"), // 0.001 BNB for test
        gasLimit: 300000
      });
      
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Contract test failed:", error);
      throw error;
    }
  }

  // Check contract health with debug info
  async checkHealth(): Promise<{isHealthy: boolean, contractBNB: string, contractHermes: string, canReward: boolean, lastError?: string, errorStep?: number}> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [isHealthy, contractBNB, contractHermes, canReward, lastError, lastMsg] = await this.contract.healthCheck();
      return {
        isHealthy,
        contractBNB: ethers.formatEther(contractBNB),
        contractHermes: ethers.formatEther(contractHermes),
        canReward,
        lastError: lastMsg,
        errorStep: Number(lastError)
      };
    } catch (error) {
      console.error("Health check failed:", error);
      return { isHealthy: false, contractBNB: "0", contractHermes: "0", canReward: false };
    }
  }

  // Get contract configuration info
  async getContractInfo(): Promise<{
    router: string,
    wbnb: string, 
    hermesToken: string,
    feeCollector: string,
    feeAmount: string,
    hermesReward: string
  }> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [router, wbnb, hermesToken, feeCollector, feeAmount, hermesReward] = await this.contract.getContractInfo();
      return {
        router,
        wbnb,
        hermesToken,
        feeCollector,
        feeAmount: ethers.formatEther(feeAmount),
        hermesReward: ethers.formatEther(hermesReward)
      };
    } catch (error) {
      console.error("Contract info failed:", error);
      throw error;
    }
  }
}

export const hermesSwapService = new HermesSwapService();