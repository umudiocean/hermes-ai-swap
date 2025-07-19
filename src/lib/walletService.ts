import { ethers } from "ethers";
import { bscRpcManager, BSC_GAS_CONFIG } from "./bscRpcManager";

// Network configuration
const BSC_NETWORK = {
  chainId: "0x38", // 56 in hex
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: [
    "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
    "https://bsc.nodereal.io",
    "https://bsc.publicnode.com",
    "https://bsc-rpc.publicnode.com"
  ],
  blockExplorerUrls: ["https://bscscan.com/"],
};

// ERC20 Token ABI
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

export class WalletService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private isConnectedFlag = false;

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask kurulu değil");
    }

    try {
      console.log("🔧 Starting wallet connection...");
      
      // Account access iste
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts?.length) {
        throw new Error("Hesap bulunamadı");
      }

      console.log("✅ Accounts approved");

      // Provider'ı BSC için yapılandır
      this.provider = new ethers.BrowserProvider(window.ethereum);
      
      // Network kontrolü ve otomatik geçiş
      const network = await this.provider.getNetwork();
      if (network.chainId !== 56n) {
        console.log("🔧 Switching to BSC network...");
        await this.switchToBSC();
      }

      this.signer = await this.provider.getSigner();
      const address = await this.signer.getAddress();
      this.isConnectedFlag = true;
      
      console.log("✅ Address obtained:", address);
      console.log("✅ Wallet connection complete");
      
      return address;

    } catch (error: any) {
      console.error("❌ Wallet bağlantı hatası:", error);
      throw new Error(`Wallet bağlanamadı: ${error.message}`);
    }
  }

  async switchToBSC(): Promise<void> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        // BSC network eklenmemiş, ekle
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BSC_NETWORK],
          });
        } catch (addError) {
          console.error("Failed to add BSC network:", addError);
          throw new Error("Failed to add BSC network to MetaMask");
        }
      } else {
        console.error("Failed to switch to BSC network:", switchError);
        throw new Error("Failed to switch to BSC network");
      }
    }
  }

  async getTokenBalance(tokenAddress: string, userAddress: string): Promise<string> {
    if (!this.provider) throw new Error("Wallet bağlı değil");

    try {
      if (tokenAddress === "BNB" || tokenAddress === ethers.ZeroAddress) {
        // BNB balance with fallback
        return await bscRpcManager.executeWithRetry(async (provider) => {
          const balance = await provider.getBalance(userAddress);
          return ethers.formatEther(balance);
        });
      } else {
        // Token balance with fallback
        return await bscRpcManager.executeWithRetry(async (provider) => {
          const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
          const balance = await contract.balanceOf(userAddress);
          const decimals = await contract.decimals();
          return ethers.formatUnits(balance, decimals);
        });
      }
    } catch (error) {
      console.error("Balance alınamadı:", error);
      return "0";
    }
  }

  async getGasEstimate(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet bağlı değil");
    }

    try {
      // BSC doesn't support EIP-1559, so we use legacy gas price
      const gasPrice = await this.provider.getFeeData();
      const estimatedGas = BigInt(21000); // Standard transfer gas limit
      
      // Use gasPrice instead of maxFeePerGas for BSC
      const gasCost = estimatedGas * (gasPrice.gasPrice || BigInt(5000000000)); // 5 gwei fallback
      const gasCostEther = ethers.formatEther(gasCost);
      
      // Convert to USD (approximate BNB price)
      const bnbPriceUSD = 300; // This should come from a price API in production
      const gasCostUSD = parseFloat(gasCostEther) * bnbPriceUSD;
      
      return gasCostUSD.toFixed(2);
    } catch (error: any) {
      console.warn("Failed to estimate gas (using fallback):", error.message);
      // Return fallback estimate for common MetaMask RPC errors
      return "2.50"; // Fallback estimate
    }
  }

  async addTokenToWallet(contractAddress: string): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      const provider = bscRpcManager.getOptimalProvider();
      const contract = new ethers.Contract(contractAddress, ERC20_ABI, provider);
      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol: symbol,
            decimals: decimals,
          },
        },
      });
    } catch (error) {
      console.error("Failed to add token to wallet:", error);
      throw new Error("Failed to add token to wallet");
    }
  }

  getSigner(): ethers.JsonRpcSigner {
    if (!this.signer) throw new Error("Wallet bağlı değil");
    return this.signer;
  }

  getProvider(): ethers.BrowserProvider {
    if (!this.provider) throw new Error("Wallet bağlı değil");
    return this.provider;
  }

  isConnected(): boolean {
    return this.isConnectedFlag;
  }

  disconnect(): void {
    this.provider = null;
    this.signer = null;
    this.isConnectedFlag = false;
  }
}

export const walletService = new WalletService();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
} 