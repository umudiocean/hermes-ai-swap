import { ethers } from 'ethers';

// HERMES token contract address
const HERMES_TOKEN_ADDRESS = '0x9495ab3549338bf14ad2f86cbcf79c7b574bba37';

// Referral rewards treasury wallet
const REFERRAL_TREASURY_ADDRESS = '0xd88026A648C95780e3056ed98eD60E5105cc4863';

// BSC RPC endpoint
const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org/';

// ERC20 ABI for token transfer
const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

export interface ClaimResult {
  success: boolean;
  txHash?: string;
  error?: string;
  amount?: string;
}

/**
 * Claims referral rewards by transferring HERMES tokens from treasury to user
 * Requires BSC_TREASURY_PRIVATE_KEY environment variable
 * @param userAddress - User's wallet address
 * @param rewardAmount - Amount of HERMES tokens to claim (in tokens, not wei)
 * @returns ClaimResult with transaction details
 */
export async function claimReferralRewards(
  userAddress: string,
  rewardAmount: string
): Promise<ClaimResult> {
  try {
    // Get treasury private key from environment
    const treasuryPrivateKey = process.env.BSC_TREASURY_PRIVATE_KEY;
    
    if (!treasuryPrivateKey) {
      throw new Error('Treasury private key not configured');
    }

    // Create provider and signer
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    const treasurySigner = new ethers.Wallet(treasuryPrivateKey, provider);

    // Verify treasury wallet address matches
    if (treasurySigner.address.toLowerCase() !== REFERRAL_TREASURY_ADDRESS.toLowerCase()) {
      throw new Error('Treasury wallet address mismatch');
    }

    // Create HERMES token contract instance
    const hermesContract = new ethers.Contract(
      HERMES_TOKEN_ADDRESS,
      ERC20_ABI,
      treasurySigner
    );

    // Get token decimals
    const decimals = await hermesContract.decimals();
    
    // Convert reward amount to wei (token units)
    const rewardAmountWei = ethers.parseUnits(rewardAmount, decimals);

    // Check treasury balance
    const treasuryBalance = await hermesContract.balanceOf(REFERRAL_TREASURY_ADDRESS);
    
    if (treasuryBalance < rewardAmountWei) {
      throw new Error(`Insufficient treasury balance. Required: ${rewardAmount} HERMES, Available: ${ethers.formatUnits(treasuryBalance, decimals)}`);
    }

    // Execute transfer transaction
    console.log('Executing referral reward transfer:', {
      from: REFERRAL_TREASURY_ADDRESS,
      to: userAddress,
      amount: rewardAmount,
      amountWei: rewardAmountWei.toString(),
    });

    const tx = await hermesContract.transfer(userAddress, rewardAmountWei);
    
    console.log('Referral reward transfer submitted:', tx.hash);
    
    // Wait for transaction confirmation
    const receipt = await tx.wait();
    
    if (receipt.status === 1) {
      console.log('Referral reward transfer confirmed:', receipt.hash);
      return {
        success: true,
        txHash: receipt.hash,
        amount: rewardAmount,
      };
    } else {
      throw new Error('Transaction failed');
    }

  } catch (error: any) {
    console.error('Error claiming referral rewards:', error);
    return {
      success: false,
      error: error.message || 'Failed to claim referral rewards',
    };
  }
}

/**
 * Checks if treasury has sufficient balance for referral rewards
 * @param requiredAmount - Amount needed for rewards
 * @returns boolean indicating if treasury has sufficient balance
 */
export async function checkTreasuryBalance(requiredAmount: string): Promise<boolean> {
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    
    const hermesContract = new ethers.Contract(
      HERMES_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    );

    const decimals = await hermesContract.decimals();
    const requiredAmountWei = ethers.parseUnits(requiredAmount, decimals);
    const treasuryBalance = await hermesContract.balanceOf(REFERRAL_TREASURY_ADDRESS);
    
    return treasuryBalance >= requiredAmountWei;

  } catch (error) {
    console.error('Error checking treasury balance:', error);
    return false;
  }
}

/**
 * Gets the current treasury balance in HERMES tokens
 * @returns Treasury balance as string
 */
export async function getTreasuryBalance(): Promise<string> {
  try {
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    
    const hermesContract = new ethers.Contract(
      HERMES_TOKEN_ADDRESS,
      ERC20_ABI,
      provider
    );

    const decimals = await hermesContract.decimals();
    const balance = await hermesContract.balanceOf(REFERRAL_TREASURY_ADDRESS);
    
    return ethers.formatUnits(balance, decimals);

  } catch (error) {
    console.error('Error getting treasury balance:', error);
    return '0';
  }
}