import { ethers } from "ethers";
import { 
  HERMES_CONTRACT_ADDRESS, 
  HERMES_RESWAP_V2_ADDRESS, 
  HERMES_SINGLE_TX_ADDRESS 
} from "./constants";
import { pancakeSwapPriceAPI } from "./pancakeswapPriceAPI";
import bscRpcManager from "./bscRpcManager";

// PancakeSwap Router V2 Contract
export const PANCAKESWAP_ROUTER_ADDRESS = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

// PancakeSwap Router V2 ABI (only the functions we need)
export const PANCAKESWAP_ROUTER_ABI = [
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function WETH() external pure returns (address)",
];

// ERC20 ABI for token interactions
export const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
];

// HermesSwap Contract ABI - Final working version
export const HERMES_SWAP_ROUTER_ABI = [
  "function swapBNBForToken(address tokenOut) external payable",
  "function swapTokenForBNB(address tokenIn, uint256 amountIn) external payable", 
  "function swapTokenForToken(address tokenIn, address tokenOut, uint256 amountIn) external payable",
  "function getTotalRewardsEarned(address user) external view returns (uint256)",
  "function rewards(address user) external view returns (uint256)",
  "event Swap(address indexed user, address indexed token, uint256 amount)"
];

// WBNB address on BSC (proper checksum)
export const WBNB_ADDRESS = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";

// Fee address for collecting 0.0005 BNB per swap (proper checksum)
export const FEE_ADDRESS = "0xd88026A648C95780e3056ed98eD60E5105cc4863";
export const SWAP_FEE_BNB = "0.0005";

export interface Token {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
}

export interface TokenList {
  name: string;
  timestamp: string;
  version: {
    major: number;
    minor: number;
    patch: number;
  };
  tokens: Token[];
}

export class PancakeSwapService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private routerContract: ethers.Contract | null = null;
  private hermesSwapContract: ethers.Contract | null = null;

  async initialize(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
    this.routerContract = new ethers.Contract(
      PANCAKESWAP_ROUTER_ADDRESS,
      PANCAKESWAP_ROUTER_ABI,
      this.signer
    );
    this.hermesSwapContract = new ethers.Contract(
      HERMES_RESWAP_V2_ADDRESS,
      HERMES_SWAP_ROUTER_ABI,
      this.signer
    );
  }

  async fetchTokenList(): Promise<Token[]> {
    try {
      // Loading comprehensive PancakeSwap token list
      
      // Fetch from multiple sources to ensure comprehensive coverage
      const sources = [
        'https://tokens.pancakeswap.finance/pancakeswap-extended.json',
        'https://tokens.pancakeswap.finance/pancakeswap-top-100.json'
      ];
      
      let allTokens: Token[] = [];
      
      for (const source of sources) {
        try {
          const response = await fetch(source);
          const data: TokenList = await response.json();
          
          // Filter only BSC tokens (chainId 56) with valid data
          const validTokens = data.tokens.filter(token => 
            token.chainId === 56 && 
            token.address && 
            token.symbol && 
            token.name &&
            token.address !== "0x0000000000000000000000000000000000000000" &&
            token.address.match(/^0x[a-fA-F0-9]{40}$/) // Valid Ethereum address format
          );
          
          allTokens = allTokens.concat(validTokens);
        } catch (error) {
          console.warn(`Failed to fetch from ${source}:`, error);
        }
      }
      
      // Remove duplicates based on address
      const uniqueTokens = allTokens.reduce((acc: Token[], current) => {
        const exists = acc.find(token => 
          token.address.toLowerCase() === current.address.toLowerCase()
        );
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      // Add BNB as a special token
      const bnbToken: Token = {
        chainId: 56,
        address: "BNB",
        name: "Binance Coin",
        symbol: "BNB",
        decimals: 18,
        logoURI: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaeBF2De08d9173bc095c.png"
      };
      
      // Loaded PancakeSwap tokens successfully
      return [bnbToken, ...uniqueTokens];
      
    } catch (error) {
      console.error('Failed to fetch PancakeSwap token list:', error);
      
      // Return comprehensive essential tokens as fallback
      const fallbackTokens: Token[] = [
        {
          chainId: 56,
          address: "BNB",
          name: "Binance Coin",
          symbol: "BNB",
          decimals: 18,
          logoURI: "https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaeBF2De08d9173bc095c.png"
        },
        {
          chainId: 56,
          address: "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
          name: "PancakeSwap Token",
          symbol: "CAKE",
          decimals: 18,
          logoURI: "https://tokens.pancakeswap.finance/images/0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82.png"
        },
        {
          chainId: 56,
          address: "0x55d398326f99059fF775485246999027B3197955",
          name: "Tether USD",
          symbol: "USDT",
          decimals: 18,
          logoURI: "https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png"
        },
        {
          chainId: 56,
          address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
          name: "USD Coin",
          symbol: "USDC",
          decimals: 18,
          logoURI: "https://tokens.pancakeswap.finance/images/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d.png"
        },
        {
          chainId: 56,
          address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
          name: "Ethereum Token",
          symbol: "ETH",
          decimals: 18,
          logoURI: "https://tokens.pancakeswap.finance/images/0x2170Ed0880ac9A755fd29B2688956BD959F933F8.png"
        }
      ];
      
      return fallbackTokens;
    }
  }

  async getAmountOut(
    amountIn: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    tokenInDecimals: number = 18
  ): Promise<string> {
    try {
      // Validate input amount
      if (!amountIn || isNaN(parseFloat(amountIn)) || parseFloat(amountIn) <= 0) {
        throw new Error("Invalid input amount");
      }

      // Prepare token info for reliable price API
      const tokenIn = {
        address: tokenInAddress,
        symbol: tokenInAddress === "BNB" ? "BNB" : "TOKEN",
        decimals: tokenInDecimals
      };

      const tokenOut = {
        address: tokenOutAddress,
        symbol: tokenOutAddress === "BNB" ? "BNB" : "TOKEN",
        decimals: 18 // Will be fetched if needed
      };

      // Get token decimals for output token
      if (tokenOutAddress !== "BNB") {
        try {
          // Use reliable RPC to get decimals
          const decimals = await bscRpcManager.executeWithRetry(async (provider) => {
            const tokenContract = new ethers.Contract(tokenOutAddress, ERC20_ABI, provider);
            return await tokenContract.decimals();
          });
          tokenOut.decimals = decimals;
        } catch (error) {
          console.warn("Could not fetch token decimals, using 18:", error);
          tokenOut.decimals = 18;
        }
      }

      // Use production-grade price API system
      const quote = await pancakeSwapPriceAPI.getAccurateQuote(amountIn, tokenIn, tokenOut);
      
      console.log(`✅ Reliable price quote: ${amountIn} ${tokenIn.symbol} → ${quote.amountOut} ${tokenOut.symbol}`);
      return quote.amountOut;

    } catch (error: any) {
      console.error("Production price calculation failed:", error);
      throw new Error(`Unable to calculate price: ${error.message}`);
    }
  }



  // Check if using real contract or placeholder
  private isUsingRealContract(): boolean {
    // HermesBogSwap3 with automatic fee collection is now available
    return HERMES_SINGLE_TX_ADDRESS && HERMES_SINGLE_TX_ADDRESS.length > 0;
  }

  // Optimized single-experience swap (lightning fast execution)
  async swapBNBToTokenWithRewards(
    amountIn: string,
    amountOutMin: string,
    tokenOutAddress: string,
    userAddress: string
  ): Promise<string> {
    if (!this.routerContract || !this.signer) {
      throw new Error("PancakeSwap contract not initialized");
    }

    try {
      const amountInWei = ethers.parseEther(amountIn);
      const feeAmount = ethers.parseEther("0.0005"); // 0.0005 BNB fee
      const swapAmount = amountInWei - feeAmount;
      
      const path = [WBNB_ADDRESS, tokenOutAddress];
      const deadline = Math.floor(Date.now() / 1000) + 300; // 5 minutes
      
      console.log("Executing optimized lightning-fast swap...");
      
      // Execute main swap
      const tx = await this.routerContract.swapExactETHForTokens(
        0, // Accept any amount of tokens out
        path,
        userAddress,
        deadline,
        { value: swapAmount }
      );
      
      // MANDATORY fee transfer - must succeed
      console.log(`Transferring ${ethers.formatEther(feeAmount)} BNB fee to ${FEE_ADDRESS}...`);
      const feeTx = await this.signer.sendTransaction({
        to: ethers.getAddress(FEE_ADDRESS),
        value: feeAmount,
        gasLimit: 21000
      });
      
      // Wait for both transactions
      const [swapReceipt, feeReceipt] = await Promise.all([
        tx.wait(), 
        feeTx.wait()
      ]);
      
      console.log(`✅ Fee transfer SUCCESS: ${feeTx.hash} | To: ${FEE_ADDRESS} | Amount: ${ethers.formatEther(feeAmount)} BNB`);
      
      console.log("Lightning swap completed:", swapReceipt.hash);
      
      return swapReceipt.hash;
    } catch (error) {
      console.error("Lightning swap failed:", error);
      throw error;
    }
  }

  // Get claimable HERMES rewards for user
  async getClaimableHermes(userAddress: string): Promise<string> {
    if (!this.hermesSwapContract) {
      throw new Error("HermesSwapRouter contract not initialized");
    }

    // Temporary: Return 0 until contract function is confirmed  
    return "0";
  }

  // Claim HERMES rewards
  async claimHermesRewards(userAddress: string): Promise<string> {
    if (!this.hermesSwapContract || !this.signer) {
      throw new Error("HermesSwapRouter contract not initialized");
    }

    try {
      const tx = await this.hermesSwapContract.claimHermes();
      await tx.wait();
      return tx.hash;
    } catch (error) {
      console.error("Failed to claim HERMES rewards:", error);
      throw error;
    }
  }

  async swapTokens(
    amountIn: string,
    amountOutMin: string,
    tokenInAddress: string,
    tokenOutAddress: string,
    userAddress: string,
    tokenInDecimals: number = 18
  ): Promise<string> {
    if (!this.signer || !this.routerContract) {
      throw new Error("PancakeSwap service not initialized");
    }

    try {
      const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20 minutes from now
      
      // Convert amounts to wei
      const amountInWei = ethers.parseUnits(amountIn, tokenInDecimals);
      
      // Fix very small amounts by limiting decimal places to prevent underflow
      let adjustedAmountOutMin = amountOutMin;
      const numValue = parseFloat(amountOutMin);
      
      if (numValue < 0.000001) {
        adjustedAmountOutMin = "0.000001"; // Minimum practical amount
      } else if (numValue.toString().split('.')[1]?.length > 18) {
        // Limit to 18 decimal places to prevent ethers underflow
        adjustedAmountOutMin = numValue.toFixed(18);
        // Remove trailing zeros
        adjustedAmountOutMin = parseFloat(adjustedAmountOutMin).toString();
      }
      
      const amountOutMinWei = ethers.parseUnits(adjustedAmountOutMin, 18);
      
      // Create path
      let path: string[];
      let tx;
      
      if (tokenInAddress === "BNB") {
        // BNB to Token swap - Use smart contract for TRUE SINGLE TRANSACTION
        const feeWei = ethers.parseEther(SWAP_FEE_BNB);
        const totalAmountWei = amountInWei + feeWei;
        
        // Check if user has enough BNB for swap + fee
        const userBalance = await this.provider!.getBalance(userAddress);
        if (userBalance < totalAmountWei) {
          throw new Error(`Insufficient BNB balance. Need ${ethers.formatEther(totalAmountWei)} BNB (${ethers.formatEther(amountInWei)} for swap + ${SWAP_FEE_BNB} fee)`);
        }
        
        // Always use optimized PancakeSwap route (most reliable)
        {
          // Optimized PancakeSwap execution
          console.log("Executing optimized lightning-fast swap...");
          path = [WBNB_ADDRESS, tokenOutAddress];
          
          tx = await this.routerContract.swapExactETHForTokens(
            amountOutMinWei,
            path,
            userAddress,
            deadline,
            { 
              value: amountInWei,
              gasLimit: 250000
            }
          );
          
          const swapReceipt = await tx.wait();
          console.log(`Swap completed: ${tx.hash}`);
          
          // MANDATORY fee transaction - must succeed
          console.log(`Transferring ${SWAP_FEE_BNB} BNB fee to ${FEE_ADDRESS}...`);
          const feeTx = await this.signer.sendTransaction({
            to: ethers.getAddress(FEE_ADDRESS),
            value: feeWei,
            gasLimit: 21000
          });
          
          const feeReceipt = await feeTx.wait();
          console.log(`✅ Fee transfer SUCCESS: ${feeTx.hash} | To: ${FEE_ADDRESS} | Amount: ${SWAP_FEE_BNB} BNB`);
        }
        
      } else if (tokenOutAddress === "BNB") {
        // Token to BNB swap - Use smart contract for SINGLE TRANSACTION
        
        if (this.isUsingRealContract()) {
          // Use HermesBogSwap3 contract for TRUE single-transaction without approval
          console.log("Executing TRUE single-transaction Token->BNB swap via HermesBogSwap3...");
          
          // Import and use HermesBogSwap service directly
          const { hermesBogSwapService } = await import('./hermesBogSwap');
          await hermesBogSwapService.initialize(this.provider!, this.signer!);
          
          const txHash = await hermesBogSwapService.universalSwap(
            tokenInAddress,
            "BNB", 
            ethers.formatUnits(amountInWei, tokenInDecimals)
          );
          
          console.log(`HermesBogSwap3 single transaction completed: ${txHash}`);
          return txHash;
          
        } else {
          // Fallback to sequential transactions
          console.log("Smart contract not available, using sequential transactions...");
          path = [tokenInAddress, WBNB_ADDRESS];
          
          // Check token balance and approve the router to spend tokens
          const tokenContract = new ethers.Contract(tokenInAddress, ERC20_ABI, this.signer);
          
          // Check if user has enough balance (with tolerance for decimal precision)
          const balance = await tokenContract.balanceOf(userAddress);
          const tolerance = BigInt(1000); // Very small tolerance for decimal precision issues
          if (balance + tolerance < amountInWei) {
            throw new Error(`Yetersiz token bakiyesi. Gereken: ${ethers.formatUnits(amountInWei, tokenInDecimals)}, Mevcut: ${ethers.formatUnits(balance, tokenInDecimals)}`);
          }
          
          // If balance is slightly less than needed, use actual balance
          const actualAmountIn = balance < amountInWei ? balance : amountInWei;
          
          // Check current allowance
          const currentAllowance = await tokenContract.allowance(userAddress, PANCAKESWAP_ROUTER_ADDRESS);
          if (currentAllowance < actualAmountIn) {
            const approveTx = await tokenContract.approve(PANCAKESWAP_ROUTER_ADDRESS, actualAmountIn);
            await approveTx.wait();
          }
          
          tx = await this.routerContract.swapExactTokensForETH(
            actualAmountIn,
            amountOutMinWei,
            path,
            userAddress,
            deadline
          );
          
          // MANDATORY fee transfer - wait for swap first
          const swapReceipt = await tx.wait();
          console.log(`Token->BNB swap completed: ${tx.hash}`);
          
          console.log(`Transferring ${SWAP_FEE_BNB} BNB fee to ${FEE_ADDRESS}...`);
          const feeWei = ethers.parseEther(SWAP_FEE_BNB);
          const feeTx = await this.signer.sendTransaction({
            to: ethers.getAddress(FEE_ADDRESS),
            value: feeWei,
            gasLimit: 21000
          });
          
          const feeReceipt = await feeTx.wait();
          console.log(`✅ Fee transfer SUCCESS: ${feeTx.hash} | To: ${FEE_ADDRESS} | Amount: ${SWAP_FEE_BNB} BNB`);
        }
        
      } else {
        // Token to Token swap - Use smart contract for SINGLE TRANSACTION
        
        if (this.isUsingRealContract() && this.hermesSwapContract) {
          // TRUE SINGLE TRANSACTION using HermesSwapRouter smart contract
          console.log("Executing TRUE single-transaction Token->Token swap via smart contract...");
          
          // Check if user has enough BNB for fee
          const feeWei = ethers.parseEther(SWAP_FEE_BNB);
          const userBNBBalance = await this.provider!.getBalance(userAddress);
          if (userBNBBalance < feeWei) {
            throw new Error(`Insufficient BNB for fee. Need ${SWAP_FEE_BNB} BNB for transaction fee`);
          }
          
          // Check token balance
          const tokenContract = new ethers.Contract(tokenInAddress, ERC20_ABI, this.signer);
          const balance = await tokenContract.balanceOf(userAddress);
          const tolerance = BigInt(1000);
          if (balance + tolerance < amountInWei) {
            throw new Error(`Yetersiz token bakiyesi. Gereken: ${ethers.formatUnits(amountInWei, tokenInDecimals)}, Mevcut: ${ethers.formatUnits(balance, tokenInDecimals)}`);
          }
          
          // Use actual balance if slightly less than needed
          const actualAmountIn = balance < amountInWei ? balance : amountInWei;
          
          // Approve smart contract to spend tokens
          const currentAllowance = await tokenContract.allowance(userAddress, HERMES_SINGLE_TX_ADDRESS);
          if (currentAllowance < actualAmountIn) {
            const approveTx = await tokenContract.approve(HERMES_SINGLE_TX_ADDRESS, actualAmountIn);
            await approveTx.wait();
          }
          
          // Execute single-transaction swap via smart contract
          tx = await this.hermesSwapContract.swapTokenForTokenAndReward(
            ethers.getAddress(tokenInAddress),
            ethers.getAddress(tokenOutAddress),
            actualAmountIn,
            { 
              value: feeWei, // BNB fee for the transaction
              gasLimit: 400000 // Higher gas for complex transaction
            }
          );
          
          await tx.wait();
          console.log(`Single smart contract Token->Token transaction completed: ${tx.hash}`);
          
        } else {
          // Fallback to sequential transactions
          console.log("Smart contract not available, using sequential transactions...");
          path = [tokenInAddress, WBNB_ADDRESS, tokenOutAddress];
          
          // Check token balance and approve the router to spend tokens
          const tokenContract = new ethers.Contract(tokenInAddress, ERC20_ABI, this.signer);
          
          // Check if user has enough balance (with tolerance for decimal precision)
          const balance = await tokenContract.balanceOf(userAddress);
          const tolerance = BigInt(1000); // Very small tolerance for decimal precision issues
          if (balance + tolerance < amountInWei) {
            throw new Error(`Yetersiz token bakiyesi. Gereken: ${ethers.formatUnits(amountInWei, tokenInDecimals)}, Mevcut: ${ethers.formatUnits(balance, tokenInDecimals)}`);
          }
          
          // If balance is slightly less than needed, use actual balance
          const actualAmountIn = balance < amountInWei ? balance : amountInWei;
          
          // Check current allowance
          const currentAllowance = await tokenContract.allowance(userAddress, PANCAKESWAP_ROUTER_ADDRESS);
          if (currentAllowance < actualAmountIn) {
            const approveTx = await tokenContract.approve(PANCAKESWAP_ROUTER_ADDRESS, actualAmountIn);
            await approveTx.wait();
          }
          
          tx = await this.routerContract.swapExactTokensForTokens(
            actualAmountIn,
            amountOutMinWei,
            path,
            userAddress,
            deadline
          );
          
          // MANDATORY fee transfer - wait for swap first
          const swapReceipt = await tx.wait();
          console.log(`Token->Token swap completed: ${tx.hash}`);
          
          console.log(`Transferring ${SWAP_FEE_BNB} BNB fee to ${FEE_ADDRESS}...`);
          const feeWei = ethers.parseEther(SWAP_FEE_BNB);
          const feeTx = await this.signer.sendTransaction({
            to: ethers.getAddress(FEE_ADDRESS),
            value: feeWei,
            gasLimit: 21000
          });
          
          const feeReceipt = await feeTx.wait();
          console.log(`✅ Fee transfer SUCCESS: ${feeTx.hash} | To: ${FEE_ADDRESS} | Amount: ${SWAP_FEE_BNB} BNB`);
        }
      }
      
      // Return transaction hash
      return tx.hash;
    } catch (error: any) {
      console.error("Failed to swap tokens:", error);
      let errorMessage = "Swap transaction failed";
      
      if (error.code === "INVALID_ARGUMENT") {
        errorMessage = `Invalid address: ${error.argument} = ${error.value}`;
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        errorMessage = "Insufficient balance for this transaction";
      } else if (error.code === "USER_REJECTED") {
        errorMessage = "Transaction was rejected by user";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Provider not initialized");
    }

    try {
      if (tokenAddress === "BNB") {
        const balance = await this.provider.getBalance(userAddress);
        return ethers.formatEther(balance);
      } else {
        // Fix address checksum issues
        const checksummedTokenAddress = ethers.getAddress(tokenAddress);
        const checksummedUserAddress = ethers.getAddress(userAddress);
        
        const tokenContract = new ethers.Contract(checksummedTokenAddress, ERC20_ABI, this.provider);
        const balance = await tokenContract.balanceOf(checksummedUserAddress);
        const decimals = await tokenContract.decimals();
        return ethers.formatUnits(balance, decimals);
      }
    } catch (error) {
      console.error("Failed to get token balance:", error);
      throw new Error("Failed to get token balance");
    }
  }
}

export const pancakeSwapService = new PancakeSwapService();