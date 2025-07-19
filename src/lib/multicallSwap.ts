import { ethers } from "ethers";

// PancakeSwap Interface Multicall V3 Contract (BSC Mainnet)
const PANCAKE_MULTICALL_ADDRESS = "0xac1ce734566f390a94b00eb9bf561c2625bf44ea";
const PANCAKE_MULTICALL_ABI = [
  "function multicall(tuple(address target, uint256 gasLimit, bytes callData)[] calls) external returns (uint256 blockNumber, tuple(bool success, uint256 gasUsed, bytes returnData)[] returnData)"
];

// Optimized single-transaction swap using Multicall3
export class MulticallSwapService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private multicallContract: ethers.Contract | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    
    this.multicallContract = new ethers.Contract(
      PANCAKE_MULTICALL_ADDRESS,
      PANCAKE_MULTICALL_ABI,
      signer
    );
  }

  // TRUE single transaction using PancakeSwap Interface Multicall V3
  async executeSwapWithFee(
    routerAddress: string,
    swapCallData: string,
    swapValue: string,
    feeAddress: string,
    feeAmount: string,
    userAddress: string
  ): Promise<string> {
    if (!this.multicallContract) {
      throw new Error("Multicall contract not initialized");
    }

    try {
      const swapValueWei = ethers.parseEther(swapValue);
      const feeValueWei = ethers.parseEther(feeAmount);
      const totalValue = swapValueWei + feeValueWei;

      console.log("Executing TRUE single transaction via PancakeSwap Multicall...");

      // Prepare multicall with PancakeSwap Router + Fee transfer
      const calls = [
        {
          target: routerAddress,
          gasLimit: 300000,
          callData: swapCallData
        },
        {
          target: feeAddress,
          gasLimit: 21000,
          callData: "0x" // Simple ETH transfer
        }
      ];

      // Execute single transaction containing both swap and fee
      const tx = await this.multicallContract.multicall(calls, {
        value: totalValue,
        gasLimit: 400000
      });

      await tx.wait();
      console.log("TRUE single transaction completed:", tx.hash);
      
      return tx.hash;
    } catch (error) {
      console.error("PancakeSwap multicall failed:", error);
      throw error;
    }
  }

  // Generate swap call data for PancakeSwap
  generateSwapCallData(
    routerAddress: string,
    amountOutMin: string,
    path: string[],
    userAddress: string
  ): string {
    const routerInterface = new ethers.Interface([
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)"
    ]);

    const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes

    return routerInterface.encodeFunctionData("swapExactETHForTokens", [
      ethers.parseUnits(amountOutMin, 18), // Convert to Wei format (18 decimals)
      path,
      userAddress,
      deadline
    ]);
  }
}

export const multicallSwapService = new MulticallSwapService();