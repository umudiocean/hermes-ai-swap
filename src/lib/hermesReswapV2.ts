import { ethers } from "ethers";
import { HERMES_RESWAP_V2_ADDRESS } from "./constants";

// HermesReswapV2 ABI
const HERMES_RESWAP_V2_ABI = [
  {
    "inputs": [],
    "name": "generateReferralCode",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "tokenIn", "type": "address"},
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"internalType": "uint256", "name": "referralCode", "type": "uint256"}
    ],
    "name": "swap",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "referralCode", "type": "uint256"}],
    "name": "swapBNBToHERMES",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "amount", "type": "uint256"},
      {"internalType": "uint256", "name": "referralCode", "type": "uint256"}
    ],
    "name": "swapHERMESToBNB",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address", "name": "tokenIn", "type": "address"},
      {"internalType": "address", "name": "tokenOut", "type": "address"},
      {"internalType": "uint256", "name": "amountIn", "type": "uint256"}
    ],
    "name": "estimateSwap",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getReferralCode",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getReferralStats",
    "outputs": [
      {"internalType": "uint256", "name": "code", "type": "uint256"},
      {"internalType": "uint256", "name": "earnings", "type": "uint256"},
      {"internalType": "uint256", "name": "totalRefs", "type": "uint256"},
      {"internalType": "bool", "name": "hasCode", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getContractInfo",
    "outputs": [
      {"internalType": "uint256", "name": "hermesBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "bnbBalance", "type": "uint256"},
      {"internalType": "uint256", "name": "swapCount", "type": "uint256"},
      {"internalType": "uint256", "name": "rewardsDistributed", "type": "uint256"},
      {"internalType": "uint256", "name": "feesCollected", "type": "uint256"},
      {"internalType": "uint256", "name": "referralRewardsTotal", "type": "uint256"},
      {"internalType": "bool", "name": "canReward", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "tokenIn", "type": "address"},
      {"indexed": false, "internalType": "address", "name": "tokenOut", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "amountIn", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "amountOut", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256"}
    ],
    "name": "SwapExecuted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "referrer", "type": "address"},
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256"}
    ],
    "name": "ReferralReward",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "address", "name": "user", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "code", "type": "uint256"}
    ],
    "name": "ReferralCodeGenerated",
    "type": "event"
  }
];

export class HermesReswapV2Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private contract: ethers.Contract | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.Signer) {
    this.provider = provider;
    this.signer = signer;
    this.contract = new ethers.Contract(HERMES_RESWAP_V2_ADDRESS, HERMES_RESWAP_V2_ABI, signer);
  }

  isContractDeployed(): boolean {
    return this.contract !== null;
  }

  // Generate referral code
  async generateReferralCode(): Promise<string> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const tx = await this.contract.generateReferralCode();
    const receipt = await tx.wait();
    
    // Extract referral code from event
    const event = receipt.logs.find((log: any) => log.topics[0] === ethers.id("ReferralCodeGenerated(address,uint256)"));
    if (event) {
      const decoded = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], event.data);
      return decoded[0].toString();
    }
    
    return tx.hash;
  }

  // Universal swap function supporting ALL token types with proper decimals
  async swap(tokenIn: string, tokenOut: string, amountIn: string, referralCode: string = "0", decimals: number = 18): Promise<string> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    // Universal token type detection
    const isFromBNB = tokenIn === "BNB" || tokenIn === "0x0000000000000000000000000000000000000000" || tokenIn.toLowerCase() === "bnb";
    const isToBNB = tokenOut === "BNB" || tokenOut === "0x0000000000000000000000000000000000000000" || tokenOut.toLowerCase() === "bnb";
    
    const tokenInAddress = isFromBNB ? ethers.ZeroAddress : tokenIn;
    const tokenOutAddress = isToBNB ? ethers.ZeroAddress : tokenOut;
    
    let value = ethers.parseEther("0.0005"); // Universal 0.0005 BNB fee for ALL swaps
    let amountInWei = "0";
    
    if (isFromBNB) {
      // BNB → Token: Add swap amount to fee (18 decimals for BNB)
      const swapAmount = ethers.parseEther(amountIn);
      value = value + swapAmount;
      amountInWei = "0"; // Contract handles BNB amount via msg.value
    } else {
      // Token → BNB/Token: Use precise decimals for the specific token
      amountInWei = ethers.parseUnits(amountIn, decimals).toString();
      console.log(`Token swap: ${amountIn} (${decimals} decimals) = ${amountInWei} wei`);
    }
    
    console.log(`HermesReswapV2 swap: ${tokenInAddress} → ${tokenOutAddress}, amount: ${amountIn}, referral: ${referralCode}`);
    console.log(`Transaction params: value=${ethers.formatEther(value)} BNB, amountInWei=${amountInWei}`);
    
    try {
      // Skip gas estimation for problematic cases - use safe defaults
      let gasLimit = BigInt(500000); // Safe default for token swaps
      
      try {
        const gasEstimate = await Promise.race([
          this.contract.swap.estimateGas(
            tokenInAddress,
            tokenOutAddress,
            amountInWei,
            referralCode || "0",
            { value }
          ),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error("Gas estimation timeout")), 5000)
          )
        ]);
        
        gasLimit = gasEstimate + (gasEstimate / BigInt(4)); // Add 25% buffer
        console.log(`Gas estimate: ${gasEstimate.toString()}, using: ${gasLimit.toString()}`);
      } catch (gasError) {
        console.warn("Gas estimation failed, using safe default:", gasError);
        gasLimit = BigInt(800000); // Higher safe default if estimation fails
      }
      
      // Get current gas price with fallback
      let gasPrice;
      try {
        gasPrice = await this.provider?.getGasPrice();
        if (gasPrice) {
          gasPrice = gasPrice + (gasPrice / BigInt(10)); // Add 10% for priority
        }
      } catch {
        gasPrice = ethers.parseUnits("5", "gwei"); // Fallback gas price
      }
      
      const tx = await this.contract.swap(
        tokenInAddress,
        tokenOutAddress,
        amountInWei,
        referralCode || "0",
        { 
          value,
          gasLimit,
          gasPrice,
          type: 0 // Legacy transaction for maximum compatibility
        }
      );
      
      console.log(`Transaction submitted: ${tx.hash}`);
      
      const receipt = await tx.wait();
      console.log(`✅ HermesReswapV2 swap completed: ${tx.hash}`);
      
      return tx.hash;
    } catch (error: any) {
      console.error("HermesReswapV2 swap failed:", error);
      
      // Check if it's a gas or transaction issue
      if (error.message?.includes("Transaction does not have a transaction hash")) {
        throw new Error("Network connection issue - please try again");
      }
      if (error.message?.includes("insufficient funds")) {
        throw new Error("Insufficient BNB - more BNB required for gas fees");
      }
      if (error.message?.includes("execution reverted")) {
        throw new Error("Contract execution error - increase slippage tolerance");
      }
      
      throw new Error(`Swap error: ${error.message}`);
    }
  }

  // Convenience functions
  async swapBNBToHERMES(amountIn: string, referralCode: string = "0"): Promise<string> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const swapAmount = ethers.parseEther(amountIn);
    const fee = ethers.parseEther("0.0005");
    const totalValue = swapAmount + fee;
    
    const tx = await this.contract.swapBNBToHERMES(referralCode || "0", { value: totalValue });
    const receipt = await tx.wait();
    
    return tx.hash;
  }

  async swapHERMESToBNB(amountIn: string, referralCode: string = "0"): Promise<string> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const amountInWei = ethers.parseUnits(amountIn, 18);
    const fee = ethers.parseEther("0.0005");
    
    const tx = await this.contract.swapHERMESToBNB(amountInWei, referralCode || "0", { value: fee });
    const receipt = await tx.wait();
    
    return tx.hash;
  }

  // View functions
  async estimateSwap(tokenIn: string, tokenOut: string, amountIn: string, decimals: number = 18): Promise<string> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const isFromBNB = tokenIn === "BNB" || tokenIn === "0x0000000000000000000000000000000000000000";
    const isToBNB = tokenOut === "BNB" || tokenOut === "0x0000000000000000000000000000000000000000";
    
    const tokenInAddress = isFromBNB ? ethers.ZeroAddress : tokenIn;
    const tokenOutAddress = isToBNB ? ethers.ZeroAddress : tokenOut;
    const amountInWei = ethers.parseUnits(amountIn, decimals);
    
    const result = await this.contract.estimateSwap(tokenInAddress, tokenOutAddress, amountInWei);
    return ethers.formatUnits(result, 18);
  }

  async getReferralCode(userAddress: string): Promise<string> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const code = await this.contract.getReferralCode(userAddress);
    return code.toString();
  }

  async getReferralStats(userAddress: string): Promise<{
    code: string;
    earnings: string;
    totalRefs: string;
    hasCode: boolean;
  }> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const [code, earnings, totalRefs, hasCode] = await this.contract.getReferralStats(userAddress);
    
    return {
      code: code.toString(),
      earnings: ethers.formatUnits(earnings, 18),
      totalRefs: totalRefs.toString(),
      hasCode
    };
  }

  async getContractInfo(): Promise<{
    hermesBalance: string;
    bnbBalance: string;
    swapCount: string;
    rewardsDistributed: string;
    feesCollected: string;
    referralRewardsTotal: string;
    canReward: boolean;
  }> {
    if (!this.contract) throw new Error("Contract not initialized");
    
    const [hermesBalance, bnbBalance, swapCount, rewardsDistributed, feesCollected, referralRewardsTotal, canReward] = 
      await this.contract.getContractInfo();
    
    return {
      hermesBalance: ethers.formatUnits(hermesBalance, 18),
      bnbBalance: ethers.formatEther(bnbBalance),
      swapCount: swapCount.toString(),
      rewardsDistributed: ethers.formatUnits(rewardsDistributed, 18),
      feesCollected: ethers.formatEther(feesCollected),
      referralRewardsTotal: ethers.formatUnits(referralRewardsTotal, 18),
      canReward
    };
  }
}

export const hermesReswapV2Service = new HermesReswapV2Service();