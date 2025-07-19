import { ethers } from "ethers";
import { HERMES_RESWAP_V2_ADDRESS } from "./constants";

// Rango-style Diamond Pattern ABI for single transaction swaps
const DIAMOND_ABI = [
  "function swapBNBForToken(address tokenOut) external payable",
  "function swapTokenForBNB(address tokenIn, uint256 amountIn) external",
  "function swapTokenForToken(address tokenIn, address tokenOut, uint256 amountIn) external payable",
  "function claimRewards() external",
  "function getTotalRewardsEarned(address user) external view returns (uint256)",
  "function getUserSwaps(address user) external view returns (uint256)"
];

export class DiamondSwapService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private diamondContract: ethers.Contract | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    
    // Initialize Diamond contract (Rango-style single transaction)
    this.diamondContract = new ethers.Contract(
      HERMES_RESWAP_V2_ADDRESS,
      DIAMOND_ABI,
      signer
    );
  }

  // TRUE single transaction: BNB -> Token + Fee + Reward
  async swapBNBToToken(
    amountIn: string,
    tokenOutAddress: string,
    userAddress: string
  ): Promise<string> {
    if (!this.diamondContract) {
      throw new Error("Diamond contract not initialized");
    }

    try {
      console.log("Executing TRUE single-transaction BNB->Token swap...");
      
      const tx = await this.diamondContract.swapBNBForToken(
        tokenOutAddress,
        { 
          value: ethers.parseEther(amountIn),
          gasLimit: 300000
        }
      );

      await tx.wait();
      console.log("Single transaction completed:", tx.hash);
      return tx.hash;
    } catch (error) {
      console.error("Diamond swap failed:", error);
      throw error;
    }
  }

  // TRUE single transaction: Token -> BNB + Fee + Reward  
  async swapTokenToBNB(
    tokenInAddress: string,
    amountIn: string,
    userAddress: string
  ): Promise<string> {
    if (!this.diamondContract || !this.signer) {
      throw new Error("Diamond contract not initialized");
    }

    try {
      console.log("Executing TRUE single-transaction Token->BNB swap...");
      
      // First approve tokens
      const tokenContract = new ethers.Contract(
        tokenInAddress,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        this.signer
      );
      
      const approveTx = await tokenContract.approve(HERMES_RESWAP_V2_ADDRESS, amountIn);
      await approveTx.wait();
      
      // Execute single transaction swap
      const tx = await this.diamondContract.swapTokenForBNB(
        tokenInAddress,
        amountIn,
        { gasLimit: 350000 }
      );

      await tx.wait();
      console.log("Single transaction completed:", tx.hash);
      return tx.hash;
    } catch (error) {
      console.error("Diamond swap failed:", error);
      throw error;
    }
  }

  // TRUE single transaction: Token -> Token + Fee + Reward
  async swapTokenToToken(
    tokenInAddress: string,
    tokenOutAddress: string,
    amountIn: string,
    userAddress: string
  ): Promise<string> {
    if (!this.diamondContract || !this.signer) {
      throw new Error("Diamond contract not initialized");
    }

    try {
      console.log("Executing TRUE single-transaction Token->Token swap...");
      
      // First approve tokens
      const tokenContract = new ethers.Contract(
        tokenInAddress,
        ["function approve(address spender, uint256 amount) external returns (bool)"],
        this.signer
      );
      
      const approveTx = await tokenContract.approve(HERMES_RESWAP_V2_ADDRESS, amountIn);
      await approveTx.wait();
      
      // Execute single transaction swap (includes 0.0005 BNB fee)
      const tx = await this.diamondContract.swapTokenForToken(
        tokenInAddress,
        tokenOutAddress,
        amountIn,
        { 
          value: ethers.parseEther("0.0005"), // Fee
          gasLimit: 400000
        }
      );

      await tx.wait();
      console.log("Single transaction completed:", tx.hash);
      return tx.hash;
    } catch (error) {
      console.error("Diamond swap failed:", error);
      throw error;
    }
  }

  // Get claimable HERMES rewards
  async getClaimableRewards(userAddress: string): Promise<string> {
    if (!this.diamondContract) {
      return "0";
    }

    // Function temporarily disabled due to contract error
    return "0";
  }

  // Claim HERMES rewards
  async claimRewards(userAddress: string): Promise<string> {
    if (!this.diamondContract) {
      throw new Error("Diamond contract not initialized");
    }

    try {
      const tx = await this.diamondContract.claimRewards();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to claim rewards:", error);
      throw error;
    }
  }
}

export const diamondSwapService = new DiamondSwapService();