import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertSwapTransactionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create user by wallet address
  app.get("/api/users/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        user = await storage.createUser({ walletAddress });
      }
      
      res.json(user);
    } catch (error: any) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });

  // Get user stats
  app.get("/api/users/:walletAddress/stats", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        user = await storage.createUser({ walletAddress });
      }

      let stats = await storage.getUserStats(user.id);
      
      if (!stats) {
        stats = await storage.createOrUpdateUserStats(user.id, {
          walletAddress,
          totalSwaps: 0,
          totalVolumeBNB: "0",
          totalEarnedHermes: "0",
          pendingRewards: "0",
          feesSaved: "0",
          feesSavedBNB: "0",
        });
      }
      
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ message: error.message || "Failed to get user stats" });
    }
  });

  // Get user activity
  app.get("/api/users/:walletAddress/activity", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.json([]);
      }

      const transactions = await storage.getSwapTransactionsByUser(user.id);
      
      const activity = transactions.slice(0, 10).map(tx => ({
        id: tx.txHash,
        type: "swap",
        description: `${tx.fromAmount} ${tx.fromToken} → ${tx.toAmount} ${tx.toToken}`,
        amount: "+100K",
        timestamp: tx.createdAt,
        status: "completed",
      }));
      
      res.json(activity);
    } catch (error: any) {
      console.error("Error getting user activity:", error);
      res.status(500).json({ message: error.message || "Failed to get user activity" });
    }
  });

  // Record a new swap transaction
  app.post("/api/swaps", async (req, res) => {
    try {
      const swapData = insertSwapTransactionSchema.parse(req.body);
      
      // Get or create user
      let user = await storage.getUserByWalletAddress(swapData.walletAddress);
      
      if (!user) {
        user = await storage.createUser({ walletAddress: swapData.walletAddress });
      }

      // Check if transaction already exists
      const existingTx = await storage.getSwapTransactionByTxHash(swapData.txHash);
      if (existingTx) {
        return res.json(existingTx);
      }

      // Create swap transaction
      const transaction = await storage.createSwapTransaction({
        ...swapData,
        userId: user.id,
      });

      // Update user stats
      const currentStats = await storage.getUserStats(user.id) || {
        totalSwaps: 0,
        totalVolumeBNB: "0",
        totalEarnedHermes: "0",
        pendingRewards: "0",
        feesSaved: "0",
        feesSavedBNB: "0",
      };

      // Generate random fee savings (0.000100 - 0.000350 BNB per swap)
      const feesSavedThisSwapBNB = 0.000100 + (Math.random() * 0.000250); // 0.000100 to 0.000350 BNB
      
      // Calculate USD value (assuming BNB = $670 average)
      const bnbPriceUSD = 670;
      const feesSavedThisSwapUSD = feesSavedThisSwapBNB * bnbPriceUSD;

      // Accumulate fee savings
      const newFeesSavedBNB = (parseFloat(currentStats.feesSavedBNB || "0") + feesSavedThisSwapBNB).toString();
      const newFeesSaved = (parseFloat(currentStats.feesSaved || "0") + feesSavedThisSwapUSD).toFixed(2);

      console.log(`💰 Fee savings this swap: ${feesSavedThisSwapBNB.toFixed(6)} BNB ($${feesSavedThisSwapUSD.toFixed(2)} USD)`);

      await storage.createOrUpdateUserStats(user.id, {
        walletAddress: user.walletAddress,
        totalSwaps: currentStats.totalSwaps + 1,
        totalVolumeBNB: (parseFloat(currentStats.totalVolumeBNB) + parseFloat(swapData.fromAmount)).toString(),
        totalEarnedHermes: (parseFloat(currentStats.totalEarnedHermes || "0") + 100000).toString(),
        pendingRewards: (parseFloat(currentStats.pendingRewards) + 100000).toString(),
        feesSaved: newFeesSaved,
        feesSavedBNB: newFeesSavedBNB,
      });

      res.json(transaction);
    } catch (error: any) {
      console.error("Error recording swap:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid swap data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to record swap" });
    }
  });

  // Claim rewards
  app.post("/api/users/:walletAddress/claim-rewards", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const stats = await storage.getUserStats(user.id);
      
      if (!stats || parseFloat(stats.pendingRewards) <= 0) {
        return res.status(400).json({ message: "No rewards to claim" });
      }

      // Update stats - move pending rewards to earned
      await storage.createOrUpdateUserStats(user.id, {
        walletAddress: user.walletAddress,
        totalEarnedHermes: (parseFloat(stats.totalEarnedHermes) + parseFloat(stats.pendingRewards)).toString(),
        pendingRewards: "0",
      });

      // In a real implementation, this would trigger the actual token transfer
      res.json({
        success: true,
        claimedAmount: stats.pendingRewards,
        txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
        gasCost: "3.20",
      });
    } catch (error: any) {
      console.error("Error claiming rewards:", error);
      res.status(500).json({ message: error.message || "Failed to claim rewards" });
    }
  });

  // Create referral relationship
  app.post("/api/referrals", async (req, res) => {
    try {
      const { referrerWalletAddress, referredWalletAddress } = req.body;
      
      if (!referrerWalletAddress || !referredWalletAddress) {
        return res.status(400).json({ message: "Referrer and referred wallet addresses are required" });
      }

      if (referrerWalletAddress === referredWalletAddress) {
        return res.status(400).json({ message: "Cannot refer yourself" });
      }

      // Get or create users
      let referrer = await storage.getUserByWalletAddress(referrerWalletAddress);
      let referred = await storage.getUserByWalletAddress(referredWalletAddress);

      if (!referrer) {
        referrer = await storage.createUser({ walletAddress: referrerWalletAddress });
      }

      if (!referred) {
        referred = await storage.createUser({ walletAddress: referredWalletAddress });
      }

      // Check if referral relationship already exists
      const existingReferral = await storage.getReferralByUsers(referrer.id, referred.id);
      if (existingReferral) {
        return res.json({ message: "Referral relationship already exists", referral: existingReferral });
      }

      // Create referral relationship
      const referral = await storage.createReferral({
        referrerUserId: referrer.id,
        referredUserId: referred.id,
        referredWalletAddress: referredWalletAddress,
      });

      // Update referral stats
      const currentStats = await storage.getReferralStats(referrer.id);
      await storage.createOrUpdateReferralStats(referrer.id, {
        totalReferrals: (currentStats?.totalReferrals || 0) + 1,
      });

      res.json({ message: "Referral created successfully", referral });
    } catch (error: any) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: error.message || "Failed to create referral" });
    }
  });

  // Get referral stats
  app.get("/api/referrals/:walletAddress/stats", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      let user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        user = await storage.createUser({ walletAddress });
      }

      let stats = await storage.getReferralStats(user.id);
      
      if (!stats) {
        stats = await storage.createOrUpdateReferralStats(user.id, {
          totalReferrals: 0,
          totalReferralSwaps: 0,
          totalUnclaimedRewards: "0",
          totalClaimedRewards: "0",
        });
      }
      
      res.json(stats);
    } catch (error: any) {
      console.error("Error getting referral stats:", error);
      res.status(500).json({ message: error.message || "Failed to get referral stats" });
    }
  });

  // Get referral list
  app.get("/api/referrals/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.json([]);
      }

      const referrals = await storage.getReferralsByReferrer(user.id);
      
      res.json(referrals);
    } catch (error: any) {
      console.error("Error getting referrals:", error);
      res.status(500).json({ message: error.message || "Failed to get referrals" });
    }
  });

  // Get unclaimed referral rewards
  app.get("/api/referrals/:walletAddress/rewards", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.json([]);
      }

      const unclaimedRewards = await storage.getUnclaimedReferralRewards(user.id);
      
      res.json(unclaimedRewards);
    } catch (error: any) {
      console.error("Error getting referral rewards:", error);
      res.status(500).json({ message: error.message || "Failed to get referral rewards" });
    }
  });

  // Claim referral rewards
  app.post("/api/referrals/:walletAddress/claim", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const { rewardIds } = req.body;
      
      const user = await storage.getUserByWalletAddress(walletAddress);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (!rewardIds || !Array.isArray(rewardIds)) {
        return res.status(400).json({ message: "Invalid reward IDs" });
      }

      // Get unclaimed rewards to calculate total claim amount
      const rewards = await storage.getUnclaimedReferralRewards(user.id);
      const rewardsToClaimMap = new Map(rewards.map(r => [r.id, r]));
      
      let totalClaimAmount = 0;
      for (const rewardId of rewardIds) {
        const reward = rewardsToClaimMap.get(rewardId);
        if (reward) {
          totalClaimAmount += parseFloat(reward.rewardAmount || "0");
        }
      }

      if (totalClaimAmount === 0) {
        return res.status(400).json({ message: "No valid rewards to claim" });
      }

      // Import claim function (dynamic import to avoid ESM issues)
      const { claimReferralRewards } = await import('./lib/referralClaim.js');
      
      // Execute actual HERMES token transfer
      const claimResult = await claimReferralRewards(walletAddress, totalClaimAmount.toString());
      
      if (!claimResult.success) {
        return res.status(500).json({ 
          message: claimResult.error || "Failed to transfer HERMES tokens",
          details: claimResult 
        });
      }

      // Mark rewards as claimed in database
      await storage.claimReferralRewards(user.id, rewardIds);

      // Update referral stats
      const unclaimedRewards = await storage.getUnclaimedReferralRewards(user.id);
      const totalUnclaimed = unclaimedRewards.reduce((sum, reward) => sum + parseFloat(reward.rewardAmount || "0"), 0);
      
      const currentStats = await storage.getReferralStats(user.id);
      
      await storage.createOrUpdateReferralStats(user.id, {
        totalUnclaimedRewards: totalUnclaimed.toString(),
        totalClaimedRewards: ((currentStats?.totalClaimedRewards ? parseFloat(currentStats.totalClaimedRewards) : 0) + totalClaimAmount).toString(),
      });

      res.json({ 
        message: "Rewards claimed successfully", 
        claimedAmount: totalClaimAmount,
        txHash: claimResult.txHash,
        success: true
      });
    } catch (error: any) {
      console.error("Error claiming referral rewards:", error);
      res.status(500).json({ message: error.message || "Failed to claim referral rewards" });
    }
  });

  // Create referral reward for a specific swap - ENHANCED WITH INSTANT PAYMENT
  app.post("/api/referral-rewards", async (req, res) => {
    try {
      const { 
        referrerWalletAddress, 
        referredWalletAddress, 
        swapTransactionId, 
        rewardAmount,
        claimed = false,
        claimedAt = null
      } = req.body;
      
      if (!referrerWalletAddress || !referredWalletAddress || !swapTransactionId) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      console.log('🎯 Creating referral reward:', { referrerWalletAddress, referredWalletAddress, rewardAmount, claimed });

      // Get or create users
      let referrer = await storage.getUserByWalletAddress(referrerWalletAddress);
      let referred = await storage.getUserByWalletAddress(referredWalletAddress);

      if (!referrer) {
        referrer = await storage.createUser({ walletAddress: referrerWalletAddress });
      }

      if (!referred) {
        referred = await storage.createUser({ walletAddress: referredWalletAddress });
      }

      // Create referral reward with instant payment support
      const reward = await storage.createReferralReward({
        referrerUserId: referrer.id,
        referredUserId: referred.id,
        swapTransactionId: parseInt(swapTransactionId),
        rewardAmount: rewardAmount || "10000",
        claimed: claimed,
        claimedAt: claimed ? (claimedAt || new Date().toISOString()) : null,
      });

      // Update referral stats based on payment type
      const currentStats = await storage.getReferralStats(referrer.id);
      
      if (claimed) {
        // INSTANT PAYMENT - add to claimed rewards directly
        await storage.createOrUpdateReferralStats(referrer.id, {
          totalReferralSwaps: (currentStats?.totalReferralSwaps || 0) + 1,
          totalClaimedRewards: (parseFloat(currentStats?.totalClaimedRewards || "0") + parseFloat(rewardAmount || "10000")).toString(),
        });
        console.log(`✅ INSTANT referral payment: ${rewardAmount || "10000"} HERMES paid to ${referrerWalletAddress}`);
      } else {
        // Traditional pending system
        await storage.createOrUpdateReferralStats(referrer.id, {
          totalReferralSwaps: (currentStats?.totalReferralSwaps || 0) + 1,
          totalUnclaimedRewards: (parseFloat(currentStats?.totalUnclaimedRewards || "0") + parseFloat(rewardAmount || "10000")).toString(),
        });
      }

      // Update referral relationship stats
      const referral = await storage.getReferralByUsers(referrer.id, referred.id);
      if (referral) {
        await storage.updateReferralStats(referral.id, {
          totalSwaps: (referral.totalSwaps || 0) + 1,
          totalRewardsEarned: (parseFloat(referral.totalRewardsEarned || "0") + parseFloat(rewardAmount || "10000")).toString(),
        });
      }

      res.json({ 
        message: claimed ? "Referral reward instantly paid!" : "Referral reward created successfully", 
        reward,
        paymentType: claimed ? "INSTANT" : "PENDING"
      });
    } catch (error: any) {
      console.error("Error creating referral reward:", error);
      res.status(500).json({ message: error.message || "Failed to create referral reward" });
    }
  });

  // Get treasury balance for monitoring
  app.get("/api/treasury/balance", async (req, res) => {
    try {
      const { getTreasuryBalance } = await import('./lib/referralClaim.js');
      const balance = await getTreasuryBalance();
      
      res.json({ 
        treasuryAddress: '0xd88026A648C95780e3056ed98eD60E5105cc4863',
        balance: balance,
        token: 'HERMES',
        status: 'active'
      });
    } catch (error: any) {
      console.error("Error getting treasury balance:", error);
      res.status(500).json({ message: error.message || "Failed to get treasury balance" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
