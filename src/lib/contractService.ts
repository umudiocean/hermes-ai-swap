import { ethers } from "ethers";
import { bscRpcManager, BSC_GAS_CONFIG } from "./bscRpcManager";

// Contract addresses
const CONTRACTS = {
  HERMES_TOKEN: "0x9495aB3549338BF14aD2F86CbcF79C7b574bba37",         // ✅ Aktif
  HERMES_SWAP_V4: "0x4140096349072a4366Fee22FaA7FB295E474eAf8",        // ✅ Çalışır durumda  
  PANCAKE_ROUTER_V2: "0x10ED43C718714eb63d5aA57B78B54704E256024E",    // ✅ PancakeSwap resmi
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",               // ✅ Wrapped BNB
  FEE_COLLECTOR: "0xd88026A648C95780e3056ed98eD60E5105cc4863",        // ✅ Treasury wallet
};

// Contract ABIs
const HERMES_SWAP_V4_ABI = [
  "function swapBNBForTokens(address tokenOut, uint256 amountOutMin, address to, uint256 deadline) external payable",
  "function swapExactTokensForBNB(uint256 amountIn, uint256 amountOutMin, address to, uint256 deadline) external",
  "function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address tokenOut, address to, uint256 deadline) external",
  "function getUserSwapCount(address user) external view returns (uint256)",
  "function getClaimableRewards(address user) external view returns (uint256)",
  "function canReward() external view returns (bool)",
  "function getContractInfo() external view returns (uint256 hermesBalance, uint256 swapCount, bool canReward)"
];

const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)"
];

export class ContractService {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    this.provider = bscRpcManager.getOptimalProvider();
  }

  async getHermesSwapContract(signer?: ethers.JsonRpcSigner) {
    const provider = signer || this.provider;
    return new ethers.Contract(CONTRACTS.HERMES_SWAP_V4, HERMES_SWAP_V4_ABI, provider);
  }

  async getTokenContract(tokenAddress: string, signer?: ethers.JsonRpcSigner) {
    const provider = signer || this.provider;
    return new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  }

  async getUserStats(userAddress: string): Promise<{
    swapCount: number;
    claimableRewards: string;
    canClaim: boolean;
  }> {
    try {
      // Contract call with retry mechanism
      const result = await bscRpcManager.executeWithRetry(async (provider) => {
        const contractWithProvider = new ethers.Contract(CONTRACTS.HERMES_SWAP_V4, HERMES_SWAP_V4_ABI, provider);
        
        const [swapCount, claimableRewards, contractInfo] = await Promise.all([
          contractWithProvider.getUserSwapCount(userAddress),
          contractWithProvider.getClaimableRewards(userAddress),
          contractWithProvider.getContractInfo()
        ]);

        return {
          swapCount: Number(swapCount),
          claimableRewards: ethers.formatEther(claimableRewards),
          canClaim: contractInfo.canReward && Number(claimableRewards) > 0
        };
      });

      return result;

    } catch (error) {
      console.error("User stats alınamadı:", error);
      // Fallback değerler dön
      return {
        swapCount: 0,
        claimableRewards: "0",
        canClaim: false
      };
    }
  }

  async checkTokenApproval(
    tokenAddress: string, 
    ownerAddress: string, 
    spenderAddress: string, 
    amount: string
  ): Promise<boolean> {
    try {
      const contract = await this.getTokenContract(tokenAddress);
      const allowance = await contract.allowance(ownerAddress, spenderAddress);
      const amountWei = ethers.parseUnits(amount, 18);
      
      return allowance >= amountWei;
    } catch (error) {
      console.error("Approval check failed:", error);
      return false;
    }
  }

  async approveToken(
    tokenAddress: string, 
    spenderAddress: string, 
    amount: string, 
    signer: ethers.JsonRpcSigner
  ): Promise<string> {
    try {
      const contract = await this.getTokenContract(tokenAddress, signer);
      const amountWei = amount === "max" ? ethers.MaxUint256 : ethers.parseUnits(amount, 18);
      
      const tx = await contract.approve(spenderAddress, amountWei, BSC_GAS_CONFIG);
      await tx.wait();
      
      return tx.hash;
    } catch (error: any) {
      console.error("Token approval failed:", error);
      throw new Error(`Token approval failed: ${error.message}`);
    }
  }

  async executeSwap(
    fromToken: string,
    toToken: string,
    amountIn: string,
    signer: ethers.JsonRpcSigner
  ): Promise<string> {
    try {
      const contract = await this.getHermesSwapContract(signer);
      const userAddress = await signer.getAddress();
      const deadline = Math.floor(Date.now() / 1000) + 1800; // 30 dakika

      let tx;

      if (fromToken === "BNB") {
        // BNB -> Token swap
        const amountOutMin = "1"; // Minimum 1 wei
        tx = await contract.swapBNBForTokens(
          toToken,
          amountOutMin,
          userAddress,
          deadline,
          {
            value: ethers.parseEther(amountIn),
            ...BSC_GAS_CONFIG
          }
        );
      } else if (toToken === "BNB") {
        // Token -> BNB swap
        const amountInWei = ethers.parseUnits(amountIn, 18);
        const amountOutMin = "1";
        
        tx = await contract.swapExactTokensForBNB(
          amountInWei,
          amountOutMin,
          userAddress,
          deadline,
          BSC_GAS_CONFIG
        );
      } else {
        // Token -> Token swap
        const amountInWei = ethers.parseUnits(amountIn, 18);
        const amountOutMin = "1";
        
        tx = await contract.swapExactTokensForTokens(
          amountInWei,
          amountOutMin,
          toToken,
          userAddress,
          deadline,
          BSC_GAS_CONFIG
        );
      }

      console.log("Swap transaction gönderildi:", tx.hash);
      await tx.wait();
      console.log("Swap başarılı:", tx.hash);
      
      return tx.hash;

    } catch (error: any) {
      console.error("Swap hatası:", error);
      throw new Error(`Swap başarısız: ${error.message || "Bilinmeyen hata"}`);
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    try {
      if (tokenAddress === "BNB" || tokenAddress === ethers.ZeroAddress) {
        return await bscRpcManager.executeWithRetry(async (provider) => {
          const balance = await provider.getBalance(userAddress);
          return ethers.formatEther(balance);
        });
      } else {
        return await bscRpcManager.executeWithRetry(async (provider) => {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(userAddress);
          const decimals = await contract.decimals();
          return ethers.formatUnits(balance, decimals);
        });
      }
    } catch (error) {
      console.error("Token balance alınamadı:", error);
      return "0";
    }
  }

  async getContractInfo(): Promise<{
    hermesBalance: string;
    swapCount: number;
    canReward: boolean;
  }> {
    try {
      const contract = await this.getHermesSwapContract();
      const info = await contract.getContractInfo();
      
      return {
        hermesBalance: ethers.formatEther(info.hermesBalance),
        swapCount: Number(info.swapCount),
        canReward: info.canReward
      };
    } catch (error) {
      console.error("Contract info alınamadı:", error);
      return {
        hermesBalance: "0",
        swapCount: 0,
        canReward: false
      };
    }
  }
}

export const contractService = new ContractService(); 