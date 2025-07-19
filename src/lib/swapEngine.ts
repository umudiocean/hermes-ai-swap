import { ethers } from "ethers";

// Legacy swapEngine - now using HermesReswapV2Service instead
// This file is kept for compatibility but not actively used

export async function performSwap({ provider, amountIn, tokenOutAddress, userAddress }: {
  provider: ethers.BrowserProvider;
  amountIn: string;
  tokenOutAddress: string;
  userAddress: string;
}) {
  // This function is deprecated - use HermesReswapV2Service instead
  throw new Error("Use HermesReswapV2Service for swaps");
}

export async function claimHermesReward(provider: ethers.BrowserProvider) {
  // This function is deprecated - use HermesReswapV2Service instead
  throw new Error("Use HermesReswapV2Service for claims");
}

export async function getClaimableAmount(provider: ethers.BrowserProvider, userAddress: string): Promise<string> {
  // This function is deprecated - use HermesReswapV2Service instead
  return "0";
}