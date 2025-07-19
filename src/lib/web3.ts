import { ethers } from "ethers";

// BSC Network configuration
export const BSC_NETWORK = {
  chainId: "0x38", // 56 in hex
  chainName: "Binance Smart Chain",
  nativeCurrency: {
    name: "BNB",
    symbol: "BNB",
    decimals: 18,
  },
  rpcUrls: [
    "https://bsc.publicnode.com",
    "https://bsc-rpc.publicnode.com",
    "https://bsc-dataseed2.binance.org/",
    "https://bsc-dataseed3.binance.org/"
  ],
  blockExplorerUrls: ["https://bscscan.com/"],
};

// Hermes Token Contract ABI (ERC20 standard functions)
export const HERMES_TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)",
];

export class Web3Service {
  public provider: ethers.BrowserProvider | null = null;
  public signer: ethers.JsonRpcSigner | null = null;

  setProvider(provider: ethers.BrowserProvider, signer: ethers.JsonRpcSigner) {
    this.provider = provider;
    this.signer = signer;
  }

  async connectWallet(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found");
      }

      // Initialize provider and signer
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();

      // Check if we're on BSC network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(56)) {
        await this.switchToBSC();
      }

      return accounts[0];
    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      throw new Error(error.message || "Failed to connect wallet");
    }
  }

  async switchToBSC(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BSC_NETWORK.chainId }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
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

  async getBNBBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Failed to get BNB balance:", error);
      throw new Error("Failed to get BNB balance");
    }
  }

  async getHermesBalance(address: string, contractAddress: string): Promise<string> {
    if (!this.provider) {
      throw new Error("Wallet not connected");
    }

    try {
      // Fix address checksum issue
      const checksummedContractAddress = ethers.getAddress(contractAddress);
      const checksummedUserAddress = ethers.getAddress(address);
      
      const contract = new ethers.Contract(checksummedContractAddress, HERMES_TOKEN_ABI, this.provider);
      const balance = await contract.balanceOf(checksummedUserAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error("Failed to get Hermes balance:", error);
      throw new Error("Failed to get Hermes balance");
    }
  }

  async transferHermes(
    contractAddress: string,
    toAddress: string,
    amount: string
  ): Promise<string> {
    if (!this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const contract = new ethers.Contract(contractAddress, HERMES_TOKEN_ABI, this.signer);
      const decimals = await contract.decimals();
      const amountWei = ethers.parseUnits(amount, decimals);

      const tx = await contract.transfer(toAddress, amountWei);
      await tx.wait();

      return tx.hash;
    } catch (error) {
      console.error("Failed to transfer Hermes tokens:", error);
      throw new Error("Failed to transfer Hermes tokens");
    }
  }

  async getGasEstimate(): Promise<string> {
    if (!this.provider || !this.signer) {
      throw new Error("Wallet not connected");
    }

    try {
      const gasPrice = await this.provider.getFeeData();
      const estimatedGas = BigInt(21000); // Standard transfer gas limit
      const gasCost = estimatedGas * (gasPrice.gasPrice || BigInt(0));
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
      const contract = new ethers.Contract(contractAddress, HERMES_TOKEN_ABI, this.provider);
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

  disconnect(): void {
    this.provider = null;
    this.signer = null;
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
