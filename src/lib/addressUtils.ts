import { ethers } from "ethers";

/**
 * Reliable address utilities for BSC mainnet
 */

// Pre-validated BSC mainnet addresses
export const BSC_ADDRESSES = {
  WBNB: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
  PANCAKE_ROUTER: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
  HERMES_CONTRACT: "0xFf9Dd567e0B2164a55a290e3E594fa5e9DA7Bc96",
  FEE_COLLECTOR: "0xd88026A648C95780e3056ed98eD60E5105cc4863"
};

/**
 * Safe address normalization for BSC
 */
export function normalizeAddress(address: string): string {
  if (address === "BNB") {
    return BSC_ADDRESSES.WBNB;
  }
  
  try {
    return ethers.getAddress(address);
  } catch (error) {
    // Fallback for known addresses
    const normalized = address.toLowerCase();
    if (normalized === BSC_ADDRESSES.WBNB.toLowerCase()) {
      return BSC_ADDRESSES.WBNB;
    }
    
    console.warn(`Address normalization failed for ${address}:`, error);
    return address; // Return original if all else fails
  }
}

/**
 * Build trading path with normalized addresses
 */
export function buildTradingPath(tokenIn: string, tokenOut: string): string[] {
  const tokenInAddr = normalizeAddress(tokenIn);
  const tokenOutAddr = normalizeAddress(tokenOut);
  const wbnbAddr = BSC_ADDRESSES.WBNB;

  // Direct pair if one is BNB/WBNB
  if (tokenIn === "BNB" || tokenOut === "BNB") {
    return [tokenInAddr, tokenOutAddr];
  }
  
  // Via WBNB for token-to-token
  return [tokenInAddr, wbnbAddr, tokenOutAddr];
}