import { ethers } from "ethers";
import { HERMES_RESWAP_V2_ADDRESS } from "./constants";

const HERMES_BOG_SWAP_ABI = [
  "function swap(address tokenIn, address tokenOut, uint256 amountIn) external payable",
  "function swapBNBToHERMES() external payable",
  "function swapHERMESToBNB(uint256 amount) external payable",
  "function estimateSwap(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 estimatedOut)",
  "function getContractInfo() external view returns (uint256 hermesBalance, uint256 bnbBalance, uint256 swapCount, uint256 rewardsDistributed, uint256 feesCollected, bool canReward)",
  "function getRewardBalance() external view returns (uint256)",
  "function totalSwaps() external view returns (uint256)",
  "function totalRewardsDistributed() external view returns (uint256)",
  "function totalFeesCollected() external view returns (uint256)",
  "function depositRewards(uint256 amount) external",
  "event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 reward)",
  "event RewardPaid(address indexed user, uint256 amount)",
  "event FeeCollected(uint256 amount)",
  "event FeeTransferred(address to, uint256 amount)"
];

export class HermesBogSwapService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private contract: ethers.Contract | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    
    if (HERMES_RESWAP_V2_ADDRESS && HERMES_RESWAP_V2_ADDRESS.length > 0) {
      this.contract = new ethers.Contract(
        HERMES_RESWAP_V2_ADDRESS,
        HERMES_BOG_SWAP_ABI,
        signer
      );
    }
  }

  // Check contract status and HERMES balance
  async getContractStatus(): Promise<any> {
    if (!this.contract) {
      throw new Error("HermesBogSwap3 contract not deployed yet");
    }

    try {
      const contractInfo = await this.contract.getContractInfo();
      return {
        hermesBalance: ethers.formatEther(contractInfo[0]),
        bnbBalance: ethers.formatEther(contractInfo[1]),
        swapCount: Number(contractInfo[2]).toString(),
        rewardsDistributed: ethers.formatEther(contractInfo[3]),
        feesCollected: ethers.formatEther(contractInfo[4]),
        canReward: Boolean(contractInfo[5])
      };
    } catch (error) {
      console.error("Error getting contract status:", error);
      throw error;
    }
  }

  // Universal swap function for ALL token combinations
  async universalSwap(
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    onApprovalComplete?: () => void
  ): Promise<string> {
    if (!this.contract) {
      throw new Error("HermesBogSwap3 contract not deployed yet");
    }

    try {
      // Check contract status before swap
      const status = await this.getContractStatus();
      console.log("Contract Status Before Swap:", status);
      
      if (parseFloat(status.hermesBalance) < 100000) {
        console.warn("⚠️ CRITICAL: Contract has insufficient HERMES tokens for rewards!");
        console.warn(`Current HERMES balance: ${status.hermesBalance}`);
      }

      console.log(`Executing universal swap: ${tokenIn} -> ${tokenOut} via HermesBogSwap3...`);

      // Convert addresses (use zero address for BNB)
      const tokenInAddress = tokenIn === "BNB" ? "0x0000000000000000000000000000000000000000" : tokenIn;
      const tokenOutAddress = tokenOut === "BNB" ? "0x0000000000000000000000000000000000000000" : tokenOut;
      
      // Platform fee is always 0.0005 BNB
      const feeAmount = ethers.parseEther("0.0005");
      let totalValue = feeAmount;
      let amountInWei = "0";
      
      if (tokenIn === "BNB") {
        // BNB->Token: send BNB amount + fee
        totalValue = ethers.parseEther(amountIn) + feeAmount;
        amountInWei = "0"; // BNB amount is in msg.value
      } else {
        // Token->BNB or Token->Token: approval + swap in single UX flow
        amountInWei = ethers.parseUnits(amountIn, 18);
        totalValue = feeAmount;
        
        // Handle approval automatically for seamless UX
        const ERC20_ABI = [
          "function approve(address spender, uint256 amount) external returns (bool)",
          "function allowance(address owner, address spender) external view returns (uint256)",
          "function balanceOf(address account) external view returns (uint256)",
          "function decimals() external view returns (uint8)"
        ];
        
        const tokenContract = new ethers.Contract(tokenInAddress, ERC20_ABI, this.signer);
        const currentAllowance = await tokenContract.allowance(await this.signer!.getAddress(), HERMES_RESWAP_V2_ADDRESS);
        
        if (currentAllowance < amountInWei) {
          console.log("⚠️ İlk defa token swap: Önce MAX onay gerekiyor, sonraki swaplar tek işlem olacak");
          // Use max approval to avoid ALL future approval transactions
          const maxApproval = ethers.MaxUint256;
          const approveTx = await tokenContract.approve(HERMES_RESWAP_V2_ADDRESS, maxApproval);
          await approveTx.wait();
          console.log("✅ MAX Onay tamamlandı - Artık TÜM gelecek swaplar tek işlem olacak!");
          
          // Notify UI about approval completion
          if (onApprovalComplete) {
            onApprovalComplete();
          }
        }
      }
      
      // Send swap transaction (approval already handled if needed)
      console.log(`Executing swap with ${ethers.formatEther(totalValue)} BNB (includes 0.0005 BNB fee automatically transferred)...`);
      
      const tx = await this.contract.swap(
        tokenInAddress,
        tokenOutAddress,
        amountInWei,
        {
          value: totalValue,
          gasLimit: 800000
        }
      );

      await tx.wait();
      console.log(`✅ Universal swap completed: ${tx.hash}`);
      console.log(`✅ Fee automatically transferred to 0xd88026A648C95780e3056ed98eD60E5105cc4863`);
      
      return tx.hash;
    } catch (error) {
      console.error("HermesBogSwap3 universal swap failed:", error);
      throw error;
    }
  }

  // Convenience functions
  async swapBNBToToken(tokenOut: string, bnbAmount: string): Promise<string> {
    return this.universalSwap("BNB", tokenOut, bnbAmount);
  }

  async swapTokenToBNB(tokenIn: string, amount: string): Promise<string> {
    return this.universalSwap(tokenIn, "BNB", amount);
  }

  async swapTokenToToken(tokenIn: string, tokenOut: string, amount: string): Promise<string> {
    return this.universalSwap(tokenIn, tokenOut, amount);
  }

  // Get contract statistics
  async getContractInfo(): Promise<{
    hermesBalance: string;
    bnbBalance: string;
    swapCount: number;
    rewardsDistributed: string;
    canReward: boolean;
  }> {
    if (!this.contract) {
      throw new Error("Contract not initialized");
    }

    try {
      const [hermesBalance, bnbBalance, swapCount, rewardsDistributed, canReward] = 
        await this.contract.getContractInfo();
      
      return {
        hermesBalance: ethers.formatEther(hermesBalance),
        bnbBalance: ethers.formatEther(bnbBalance),
        swapCount: Number(swapCount),
        rewardsDistributed: ethers.formatEther(rewardsDistributed),
        canReward
      };
    } catch (error) {
      console.error("Failed to get contract info:", error);
      throw error;
    }
  }

  // Check if contract is deployed and working
  isContractDeployed(): boolean {
    return this.contract !== null && HERMES_RESWAP_V2_ADDRESS !== "0x0000000000000000000000000000000000000000" as string;
  }

  // Get claimable rewards (for compatibility)
  async getClaimableRewards(userAddress: string): Promise<string> {
    // BogSwap2 automatically distributes rewards, no claiming needed
    return "0";
  }

  // Health check
  async checkHealth(): Promise<{
    isHealthy: boolean;
    contractBNB: string;
    contractHermes: string;
    canReward: boolean;
    lastError?: string;
  }> {
    try {
      const info = await this.getContractInfo();
      
      return {
        isHealthy: true,
        contractBNB: info.bnbBalance,
        contractHermes: info.hermesBalance,
        canReward: info.canReward
      };
    } catch (error) {
      return {
        isHealthy: false,
        contractBNB: "0",
        contractHermes: "0",
        canReward: false,
        lastError: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
}

export const hermesBogSwapService = new HermesBogSwapService();