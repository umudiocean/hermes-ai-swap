import { ethers } from "ethers";
import { bscRpcManager } from "@/lib/bscRpcManager";

// V4 Enhanced contract - DEPLOYED and READY
const CONTRACT_ADDRESS = "0x4140096349072a4366Fee22FaA7FB295E474eAf8";
const HERMES_TOKEN_ADDRESS = "0x9495aB3549338BF14aD2F86CbcF79C7b574bba37";

// V4 Enhanced ABI - Complete production contract
const HERMES_SWAP_V4_ABI = [
  // Main swap function with enhanced security
  "function swap(address tokenIn, address tokenOut, uint256 amountIn, uint256 referralCode) external payable",
  
  // Referral functions with 0.0006 BNB fee
  "function generateReferralCode() external payable returns (uint256)", // Returns referral code
  "function getReferralCode(address user) external view returns (uint256)",
  "function getReferrerByCode(uint256 code) external view returns (address)",
  "function getReferralStats(address user) external view returns (uint256 code, uint256 earnings, uint256 totalRefs, bool hasCode)",
  
  // V4 Enhanced rate limiting and security
  "function getRemainingCooldown(address user) external view returns (uint256)",
  "function canSwapNow(address user) external view returns (bool)",
  "function getLastSwapTime(address user) external view returns (uint256)",
  "function getSecurityInfo(address user) external view returns (bool isBlacklisted, uint256 lastSwap, uint256 dailySwaps, uint256 remainingCooldown, bool canSwap)",
  
  // Enhanced view functions
  "function estimateSwap(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 estimatedOut)",
  "function getContractInfo() external view returns (uint256 hermesBalance, uint256 bnbBalance, uint256 swapCount, uint256 rewardsDistributed, uint256 feesCollected, uint256 referralRewardsTotal, uint256 referralFeesCollected, bool canReward, bool contractPaused, bool emergency)",
  "function getPlatformFees() external pure returns (uint256 swapFee, uint256 referralFee)",
  "function getRewardAmounts() external pure returns (uint256 baseReward, uint256 userRewardWithReferral, uint256 referralReward, uint256 totalReferralReward)",
  
  // Security and admin functions
  "function setPaused(bool _paused) external", // Owner only
  "function toggleEmergencyMode() external", // Owner only
  "function setBlacklistStatus(address user, bool status) external", // Owner only
  "function emergencyWithdrawBNB() external", // Owner only
  "function emergencyWithdrawToken(address token) external", // Owner only
  "function depositRewards(uint256 amount) external", // Owner only
  
  // Public state variables
  "function totalSwaps() external view returns (uint256)",
  "function totalRewardsDistributed() external view returns (uint256)",
  "function totalFeesCollected() external view returns (uint256)",
  "function totalReferralRewards() external view returns (uint256)",
  "function referralCodes(address) external view returns (uint256)",
  "function codeToReferrer(uint256) external view returns (address)",
  "function referralEarnings(address) external view returns (uint256)",
  "function totalReferrals(address) external view returns (uint256)",
  "function nextReferralCode() external view returns (uint256)",
  "function paused() external view returns (bool)",
  "function emergencyMode() external view returns (bool)",
  "function blacklisted(address) external view returns (bool)",
  
  // V4 Enhanced events
  "event SwapExecuted(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut, uint256 userReward, uint256 referralReward, address referrer)",
  "event ReferralCodeGenerated(address indexed user, uint256 indexed code, uint256 feeAmount)",
  "event RewardPaid(address indexed user, uint256 amount)",
  "event ReferralRewardPaid(address indexed referrer, address indexed user, uint256 amount)",
  "event FeeCollected(uint256 swapFee, uint256 referralFee)",
  "event UserBlacklistChanged(address indexed user, bool status)",
  "event EmergencyModeToggled(bool enabled)",
  "event PauseStatusChanged(bool paused)",
  
  // V4 Enhanced custom errors (gas optimized)
  "error Unauthorized()",
  "error Reentrancy()",
  "error ContractIsPaused()",
  "error EmergencyModeActive()",
  "error AddressBlacklisted()",
  "error RateLimited()",
  "error InsufficientFee(uint256 required, uint256 provided)",
  "error ReferralCodeExists()",
  "error InvalidReferralCode()",
  "error TransferFailed()",
  "error SwapFailed()",
  "error InvalidAmount()",
  "error SameToken()",
  "error InvalidAddress()"
];

const ERC20_ABI = [
  "function balanceOf(address) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function approve(address,uint256) external returns (bool)",
  "function allowance(address,address) external view returns (uint256)"
];

export interface SwapResult {
  success: boolean;
  txHash?: string;
  error?: string;
  userReward?: string;
  referralReward?: string;
  referrer?: string;
}

export interface ContractInfo {
  hermesBalance: string;
  bnbBalance: string;
  swapCount: string;
  rewardsDistributed: string;
  feesCollected: string;
  referralRewardsTotal: string;
  canReward: boolean;
}

export interface ReferralStats {
  code: number;
  earnings: string;
  totalRefs: number;
  hasCode: boolean;
}

class HermesSwapV4Service {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private signer: ethers.Signer | null = null;

  constructor() {
    this.provider = bscRpcManager.getOptimalProvider();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, HERMES_SWAP_V4_ABI, this.provider);
  }

  // Initialize service with provider and signer
  async initialize(provider: any, signer: ethers.Signer): Promise<void> {
    this.signer = signer;
    this.provider = bscRpcManager.getOptimalProvider();
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, HERMES_SWAP_V4_ABI, this.provider);
    // HermesSwapV4Service initialized successfully
  }

  // Check if contract is deployed and service is ready
  isContractDeployed(): boolean {
    return true; // Contract is deployed at the specified address
  }

  // Generate referral code for user (V4 requires 0.0006 BNB fee)
  async generateReferralCode(signer: ethers.Signer): Promise<{ success: boolean; code?: number; txHash?: string; error?: string }> {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const userAddress = await signer.getAddress();
      
      // Check if user already has a referral code
      try {
        const existingCode = await this.contract.getReferralCode(userAddress);
        if (existingCode && existingCode.toString() !== "0") {
          console.log("✅ User already has referral code:", existingCode.toString());
          return { success: true, code: parseInt(existingCode.toString()) };
        }
      } catch (error) {
        console.log("🔍 No existing referral code found, proceeding with generation...");
      }
      
      // V4 system - 0.0006 BNB fee required for referral code generation
      const referralFee = ethers.parseEther("0.0006");
      const tx = await contractWithSigner.generateReferralCode({ value: referralFee });
      
      console.log("🎫 Generating referral code with V4 system (0.0006 BNB fee required)...");
      console.log("💰 0.0006 BNB fee will be sent to treasury address");
      console.log("📤 Transaction hash:", tx.hash);
      
      const receipt = await tx.wait();
      console.log("✅ Referral code generation transaction confirmed!");
      
      // Find the ReferralCodeGenerated event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'ReferralCodeGenerated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const code = parseInt(parsed.args.code.toString());
        return { success: true, code, txHash: receipt.hash };
      }

      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error("❌ Generate referral code failed:", error);
      return { success: false, error: error.message };
    }
  }

  // UNIVERSAL SINGLE TRANSACTION SWAP - all swap types in one transaction
  async executeSwap(
    signer: ethers.Signer,
    tokenIn: string,
    tokenOut: string,
    amountIn: string,
    referralCode: number = 0
  ): Promise<string> {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const userAddress = await signer.getAddress();
      
      // Calculate required fee (always 0.0005 BNB)
      const platformFee = ethers.parseEther("0.0005");
      let totalValue = platformFee;
      let swapAmountWei = ethers.parseUnits(amountIn, 18);

      // Determine swap type and prepare parameters
      let finalTokenIn = tokenIn;
      let finalTokenOut = tokenOut;
      
      if (tokenIn === "BNB" || tokenIn === "0x0000000000000000000000000000000000000000") {
        // BNB -> Token swap (add swap amount to total value)
        finalTokenIn = "0x0000000000000000000000000000000000000000";
        totalValue = platformFee + ethers.parseEther(amountIn);
        swapAmountWei = ethers.parseEther(amountIn); // CRITICAL FIX: BNB amount in wei
        console.log("🚀 BNB→Token Single Transaction Swap");
      } else if (tokenOut === "BNB" || tokenOut === "0x0000000000000000000000000000000000000000") {
        // Token -> BNB swap - FIX: Get correct token decimals
        finalTokenOut = "0x0000000000000000000000000000000000000000";
        
        // For HERMES token (18 decimals), use proper decimals
        if (tokenIn === HERMES_TOKEN_ADDRESS) {
          swapAmountWei = ethers.parseUnits(amountIn, 18);
        } else {
          // For other tokens, get decimals from contract
          try {
            const tokenContract = new ethers.Contract(tokenIn, ERC20_ABI, this.provider);
            const decimals = await tokenContract.decimals();
            swapAmountWei = ethers.parseUnits(amountIn, decimals);
          } catch (error) {
            console.warn("Could not get token decimals, using 18 as default");
            swapAmountWei = ethers.parseUnits(amountIn, 18);
          }
        }
        
        console.log("🚀 Token→BNB Single Transaction Swap");
        console.log(`📊 Swap amount: ${amountIn} tokens = ${swapAmountWei.toString()} wei`);
      } else {
        // Token -> Token swap
        console.log("🚀 Token→Token Single Transaction Swap");
      }

      console.log("🔄 Executing HermesSwapV4Enhanced universal swap...");
      console.log(`From: ${finalTokenIn} → To: ${finalTokenOut}`);
      console.log(`Amount: ${amountIn}, Referral: ${referralCode}`);
      console.log(`SwapAmountWei: ${swapAmountWei.toString()}`);
      console.log(`Total Value: ${ethers.formatEther(totalValue)} BNB`);

      // Enhanced gas limits for different swap types - INCREASED for BNB swaps
      let gasLimit = 500000; // Increased from 300000 to 500000 for BNB→Token swaps
      if (finalTokenIn !== "0x0000000000000000000000000000000000000000") {
        gasLimit = 600000; // Even higher gas for Token swaps
      }

      // DEBUG: Log contract call parameters
      console.log("🔍 CONTRACT CALL DEBUG:");
      console.log("- Contract Address:", CONTRACT_ADDRESS);
      console.log("- TokenIn:", finalTokenIn);
      console.log("- TokenOut:", finalTokenOut);
      console.log("- AmountIn (wei):", swapAmountWei.toString());
      console.log("- ReferralCode:", referralCode);
      console.log("- Value (wei):", totalValue.toString());
      console.log("- GasLimit:", gasLimit);
      
      // Execute universal swap function with better error handling
      const tx = await contractWithSigner.swap(
        finalTokenIn,
        finalTokenOut,
        swapAmountWei,
        referralCode,
        {
          value: totalValue,
          gasLimit: gasLimit
        }
      );

      console.log(`📤 V4Enhanced Single Transaction Sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log("✅ V4ENHANCED UNIVERSAL SWAP COMPLETED!");

      // Enhanced reward feedback based on referral usage
      if (referralCode > 0) {
        console.log("💰 V4Enhanced Rewards: User 110K HERMES + Referrer 10K HERMES");
      } else {
        console.log("💰 V4Enhanced Rewards: User 100K HERMES");
      }

      return receipt.hash;

    } catch (error: any) {
      console.error("❌ HermesSwapV4Enhanced universal swap failed:", error);
      
      // DETAILED ERROR DEBUG
      if (error.receipt) {
        console.log("📝 Transaction Receipt Status:", error.receipt.status);
        console.log("📝 Gas Used:", error.receipt.gasUsed?.toString());
        console.log("📝 Transaction Hash:", error.receipt.hash);
      }
      
      // Enhanced error handling for V4 contract
      if (error.message?.includes("INSUFFICIENT_OUTPUT_AMOUNT")) {
        throw new Error("Slippage çok düşük - daha yüksek slippage tolerance ayarlayın");
      } else if (error.message?.includes("SwapFailed")) {
        throw new Error("PancakeSwap router swap başarısız - miktar veya token çiftini kontrol edin");
      } else if (error.message?.includes("InsufficientFee")) {
        throw new Error("0.0005 BNB platform fee gerekli");
      } else if (error.message?.includes("RateLimited")) {
        throw new Error("Rate limit - 3 saniye bekleyin");
      } else if (error.message?.includes("AddressBlacklisted")) {
        throw new Error("Adres blacklist'te");
      } else if (error.message?.includes("TransferFailed")) {
        throw new Error("Token transfer başarısız - allowance kontrolü yapın");
      } else if (error.code === "CALL_EXCEPTION") {
        // Contract revert without specific error message
        throw new Error("Contract çağrısı başarısız - parametreler veya contract durumunu kontrol edin");
      }
      
      throw new Error(error.reason || error.message || "V4Enhanced universal swap execution failed");
    }
  }

  // Get contract information
  async getContractInfo(): Promise<ContractInfo | null> {
    try {
      const info = await this.contract.getContractInfo();
      
      return {
        hermesBalance: ethers.formatEther(info.hermesBalance),
        bnbBalance: ethers.formatEther(info.bnbBalance),
        swapCount: info.swapCount.toString(),
        rewardsDistributed: ethers.formatEther(info.rewardsDistributed),
        feesCollected: ethers.formatEther(info.feesCollected),
        referralRewardsTotal: ethers.formatEther(info.referralRewardsTotal),
        canReward: info.canReward
      };
    } catch (error) {
      console.error("Failed to get contract info:", error);
      return null;
    }
  }

  // Get user's referral statistics
  async getReferralStats(userAddress: string): Promise<ReferralStats | null> {
    try {
      const stats = await this.contract.getReferralStats(userAddress);
      
      return {
        code: parseInt(stats.code.toString()),
        earnings: ethers.formatEther(stats.earnings),
        totalRefs: parseInt(stats.totalRefs.toString()),
        hasCode: stats.hasCode
      };
    } catch (error) {
      console.error("Failed to get referral stats:", error);
      return null;
    }
  }

  // Get user's referral code (alias for compatibility)
  async getUserReferralCode(userAddress: string): Promise<number> {
    return this.getReferralCode(userAddress);
  }

  // Get user's referral code
  async getReferralCode(userAddress: string): Promise<number> {
    try {
      const code = await this.contract.getReferralCode(userAddress);
      return parseInt(code.toString());
    } catch (error) {
      console.error("Failed to get user referral code:", error);
      return 0;
    }
  }

  // Estimate swap output
  async estimateSwap(tokenIn: string, tokenOut: string, amountIn: string): Promise<string> {
    try {
      const estimate = await this.contract.estimateSwap(
        tokenIn === "BNB" ? "0x0000000000000000000000000000000000000000" : tokenIn,
        tokenOut === "BNB" ? "0x0000000000000000000000000000000000000000" : tokenOut,
        ethers.parseUnits(amountIn, 18)
      );
      
      return ethers.formatEther(estimate);
    } catch (error) {
      console.error("Failed to estimate swap:", error);
      return "0";
    }
  }

  // Check if token approval is needed for Token->BNB/Token swaps
  async checkTokenApproval(tokenAddress: string, userAddress: string, amount: string): Promise<boolean> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const allowance = await tokenContract.allowance(userAddress, CONTRACT_ADDRESS);
      const requiredAmount = ethers.parseUnits(amount, 18);
      
      return allowance >= requiredAmount;
    } catch (error) {
      console.error("Failed to check token approval:", error);
      return false;
    }
  }

  // Approve token for spending
  async approveToken(tokenAddress: string, signer: ethers.Signer): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);
      const maxApproval = ethers.MaxUint256;
      
      console.log("🔓 Approving infinite token spend...");
      const tx = await tokenContract.approve(CONTRACT_ADDRESS, maxApproval);
      const receipt = await tx.wait();
      
      console.log("✅ Token approval confirmed!");
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      console.error("❌ Token approval failed:", error);
      return { success: false, error: error.message };
    }
  }

  // Quick HERMES functions
  async swapBNBToHERMES(amountIn: string, referralCode: number, signer: ethers.Signer): Promise<SwapResult> {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const totalValue = ethers.parseEther("0.0005") + ethers.parseEther(amountIn);
      
      const tx = await contractWithSigner.swapBNBToHERMES(referralCode, {
        value: totalValue,
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async swapHERMESToBNB(amount: string, referralCode: number, signer: ethers.Signer): Promise<SwapResult> {
    try {
      const contractWithSigner = this.contract.connect(signer);
      const fee = ethers.parseEther("0.0005");
      
      const tx = await contractWithSigner.swapHERMESToBNB(
        ethers.parseUnits(amount, 18),
        referralCode,
        { value: fee, gasLimit: 300000 }
      );
      
      const receipt = await tx.wait();
      return { success: true, txHash: receipt.hash };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const hermesSwapV4Service = new HermesSwapV4Service();
// Backward compatibility alias
export const hermesSwapV3Service = hermesSwapV4Service;
export default hermesSwapV3Service;