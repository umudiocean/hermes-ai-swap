import { web3Service } from './web3';
import { HERMES_CONTRACT_ADDRESS } from './constants';

// HERMES Token ABI for reward claiming
const HERMES_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)"
];

/**
 * Claim HERMES rewards for a user
 * @param userAddress - The wallet address to claim rewards for
 * @returns Promise<string> - Transaction hash
 */
export const claimRewards = async (userAddress: string): Promise<string> => {
  try {
    console.log(`🎁 Claiming HERMES rewards for ${userAddress}`);
    
    const provider = web3Service.provider;
    const signer = web3Service.signer;
    
    if (!provider || !signer) {
      throw new Error("Web3 provider not available");
    }

    // Create HERMES token contract instance
    const hermesContract = new (await import('ethers')).Contract(
      HERMES_CONTRACT_ADDRESS,
      HERMES_TOKEN_ABI,
      signer
    );

    // Get current balance
    const currentBalance = await hermesContract.balanceOf(userAddress);
    console.log(`Current HERMES balance: ${currentBalance}`);

    // For demo purposes, simulate a reward claim
    // In production, this would interact with the reward contract
    const rewardAmount = "100000"; // 100K HERMES
    
    // Simulate transaction (since rewards are auto-distributed)
    const txHash = "0x" + Math.random().toString(16).slice(2, 66);
    
    console.log(`✅ Simulated reward claim: ${rewardAmount} HERMES`);
    console.log(`Transaction hash: ${txHash}`);
    
    return txHash;
    
  } catch (error) {
    console.error("❌ Failed to claim rewards:", error);
    throw new Error(`Reward claim failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Get claimable HERMES rewards for a user
 * @param userAddress - The wallet address to check
 * @returns Promise<string> - Claimable amount
 */
export const getClaimableRewards = async (userAddress: string): Promise<string> => {
  try {
    console.log(`🔍 Checking claimable rewards for ${userAddress}`);
    
    const provider = web3Service.provider;
    if (!provider) {
      throw new Error("Web3 provider not available");
    }

    // Create HERMES token contract instance
    const hermesContract = new (await import('ethers')).Contract(
      HERMES_CONTRACT_ADDRESS,
      HERMES_TOKEN_ABI,
      provider
    );

    // Get current balance
    const balance = await hermesContract.balanceOf(userAddress);
    const balanceInHermes = parseFloat((await import('ethers')).formatEther(balance));
    
    console.log(`Current HERMES balance: ${balanceInHermes}`);
    
    // For demo purposes, return 0 since rewards are auto-distributed
    return "0";
    
  } catch (error) {
    console.error("❌ Failed to get claimable rewards:", error);
    return "0";
  }
};

/**
 * Check if user has pending rewards
 * @param userAddress - The wallet address to check
 * @returns Promise<boolean> - Whether user has pending rewards
 */
export const hasPendingRewards = async (userAddress: string): Promise<boolean> => {
  try {
    const claimable = await getClaimableRewards(userAddress);
    return parseFloat(claimable) > 0;
  } catch (error) {
    console.error("❌ Failed to check pending rewards:", error);
    return false;
  }
};

export default {
  claimRewards,
  getClaimableRewards,
  hasPendingRewards
}; 