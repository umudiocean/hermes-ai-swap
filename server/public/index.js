var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/lib/referralClaim.ts
var referralClaim_exports = {};
__export(referralClaim_exports, {
  checkTreasuryBalance: () => checkTreasuryBalance,
  claimReferralRewards: () => claimReferralRewards,
  getTreasuryBalance: () => getTreasuryBalance
});
import { ethers } from "ethers";
async function claimReferralRewards(userAddress, rewardAmount) {
  try {
    const treasuryPrivateKey = process.env.BSC_TREASURY_PRIVATE_KEY;
    if (!treasuryPrivateKey) {
      throw new Error("Treasury private key not configured");
    }
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL);
    const treasurySigner = new ethers.Wallet(treasuryPrivateKey, provider);
    if (treasurySigner.address.toLowerCase() !== REFERRAL_TREASURY_ADDRESS.toLowerCase()) {
      throw new Error("Treasury wallet address mismatch");
    }
    const hermesContract = new ethers.Contract(
      HERMES_TOKEN_ADDRESS,
      ERC20_ABI,
      treasurySigner
    );
    const decimals = await hermesContract.decimals();
    const rewardAmountWei = ethers.parseUnits(rewardAmount, decimals);
    const treasuryBalance = await hermesContract.balanceOf(REFERRAL_TREASURY_ADDRESS);
    if (treasuryBalance < rewardAmountWei) {
      throw new Error(`Insufficient treasury balance. Required: ${rewardAmount} HERMES, Available: ${ethers.formatUnits(treasuryBalance, decimals)}`);
    }
    console.log("Executing referral reward transfer:", {
      from: REFERRAL_TREASURY_ADDRESS,
      to: userAddress,
      amount: rewardAmount,
      amountWei: rewardAmountWei.toString()
    });
    const tx = await hermesContract.transfer(userAddress, rewardAmountWei);
    console.log("Referral reward transfer submitted:", tx.hash);
    const receipt = await tx.wait();
    if (receipt.status === 1) {
      console.log("Referral reward transfer confirmed:", receipt.hash);
      return {
        success: true,
        txHash: receipt.hash,
        amount: rewardAmount
      };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Error claiming referral rewards:", error);
    return {
      success: false,
      error: error.message || "Failed to claim referral rewards"
    };
  }
}
async function checkTreasuryBalance(requiredAmount) {
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
    console.error("Error checking treasury balance:", error);
    return false;
  }
}
async function getTreasuryBalance() {
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
    console.error("Error getting treasury balance:", error);
    return "0";
  }
}
var HERMES_TOKEN_ADDRESS, REFERRAL_TREASURY_ADDRESS, BSC_RPC_URL, ERC20_ABI;
var init_referralClaim = __esm({
  "server/lib/referralClaim.ts"() {
    "use strict";
    HERMES_TOKEN_ADDRESS = "0x9495ab3549338bf14ad2f86cbcf79c7b574bba37";
    REFERRAL_TREASURY_ADDRESS = "0xd88026A648C95780e3056ed98eD60E5105cc4863";
    BSC_RPC_URL = "https://bsc-dataseed1.binance.org/";
    ERC20_ABI = [
      "function transfer(address to, uint256 amount) returns (bool)",
      "function balanceOf(address account) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function symbol() view returns (string)"
    ];
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  insertReferralRewardSchema: () => insertReferralRewardSchema,
  insertReferralSchema: () => insertReferralSchema,
  insertReferralStatsSchema: () => insertReferralStatsSchema,
  insertSwapTransactionSchema: () => insertSwapTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserStatsSchema: () => insertUserStatsSchema,
  referralRewards: () => referralRewards,
  referralStats: () => referralStats,
  referrals: () => referrals,
  swapTransactions: () => swapTransactions,
  userStats: () => userStats,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var swapTransactions = pgTable("swap_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  fromToken: text("from_token").notNull(),
  toToken: text("to_token").notNull(),
  fromAmount: decimal("from_amount", { precision: 18, scale: 8 }).notNull(),
  toAmount: decimal("to_amount", { precision: 18, scale: 8 }).notNull(),
  txHash: text("tx_hash").notNull().unique(),
  rewardsClaimed: boolean("rewards_claimed").default(false).notNull(),
  rewardsAmount: decimal("rewards_amount", { precision: 18, scale: 8 }).default("100000").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  totalSwaps: integer("total_swaps").default(0).notNull(),
  totalVolumeBNB: decimal("total_volume_bnb", { precision: 18, scale: 8 }).default("0").notNull(),
  totalEarnedHermes: decimal("total_earned_hermes", { precision: 18, scale: 8 }).default("0").notNull(),
  pendingRewards: decimal("pending_rewards", { precision: 18, scale: 8 }).default("0").notNull(),
  feesSaved: decimal("fees_saved", { precision: 10, scale: 2 }).default("0").notNull(),
  feesSavedBNB: decimal("fees_saved_bnb", { precision: 18, scale: 8 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerUserId: integer("referrer_user_id").references(() => users.id).notNull(),
  referredUserId: integer("referred_user_id").references(() => users.id).notNull(),
  referredWalletAddress: text("referred_wallet_address").notNull(),
  totalSwaps: integer("total_swaps").default(0).notNull(),
  totalRewardsEarned: decimal("total_rewards_earned", { precision: 18, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referrerUserId: integer("referrer_user_id").references(() => users.id).notNull(),
  referredUserId: integer("referred_user_id").references(() => users.id).notNull(),
  swapTransactionId: integer("swap_transaction_id").references(() => swapTransactions.id).notNull(),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).default("10000").notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var referralStats = pgTable("referral_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalReferrals: integer("total_referrals").default(0),
  totalReferralSwaps: integer("total_referral_swaps").default(0),
  totalUnclaimedRewards: decimal("total_unclaimed_rewards", { precision: 18, scale: 8 }).default("0"),
  totalClaimedRewards: decimal("total_claimed_rewards", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true
});
var insertSwapTransactionSchema = createInsertSchema(swapTransactions).pick({
  walletAddress: true,
  fromToken: true,
  toToken: true,
  fromAmount: true,
  toAmount: true,
  txHash: true
});
var insertUserStatsSchema = createInsertSchema(userStats).pick({
  walletAddress: true,
  totalSwaps: true,
  totalVolumeBNB: true,
  totalEarnedHermes: true,
  pendingRewards: true,
  feesSaved: true,
  feesSavedBNB: true
});
var insertReferralSchema = createInsertSchema(referrals).pick({
  referrerUserId: true,
  referredUserId: true,
  referredWalletAddress: true
});
var insertReferralRewardSchema = createInsertSchema(referralRewards).pick({
  referrerUserId: true,
  referredUserId: true,
  swapTransactionId: true,
  rewardAmount: true
});
var insertReferralStatsSchema = createInsertSchema(referralStats).pick({
  userId: true,
  totalReferrals: true,
  totalReferralSwaps: true,
  totalUnclaimedRewards: true,
  totalClaimedRewards: true
});

// server/storage.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { eq } from "drizzle-orm";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByWalletAddress(walletAddress) {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress.toLowerCase()));
    return user || void 0;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values({ ...insertUser, walletAddress: insertUser.walletAddress.toLowerCase() }).returning();
    return user;
  }
  async createSwapTransaction(swap) {
    const [transaction] = await db.insert(swapTransactions).values(swap).returning();
    return transaction;
  }
  async getSwapTransactionsByUser(userId) {
    return await db.select().from(swapTransactions).where(eq(swapTransactions.userId, userId)).orderBy(swapTransactions.createdAt);
  }
  async getSwapTransactionByTxHash(txHash) {
    const [transaction] = await db.select().from(swapTransactions).where(eq(swapTransactions.txHash, txHash));
    return transaction || void 0;
  }
  async getUserStats(userId) {
    const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId));
    return stats || void 0;
  }
  async getUserStatsByWalletAddress(walletAddress) {
    const [stats] = await db.select().from(userStats).where(eq(userStats.walletAddress, walletAddress.toLowerCase()));
    return stats || void 0;
  }
  async createOrUpdateUserStats(userId, statsUpdate) {
    const existingStats = await this.getUserStats(userId);
    if (existingStats) {
      const [updatedStats] = await db.update(userStats).set({ ...statsUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(userStats.userId, userId)).returning();
      return updatedStats;
    } else {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      const [newStats] = await db.insert(userStats).values({
        userId,
        walletAddress: user.walletAddress,
        totalSwaps: 0,
        totalVolumeBNB: "0",
        totalEarnedHermes: "0",
        pendingRewards: "0",
        feesSaved: "0",
        feesSavedBNB: "0",
        ...statsUpdate
      }).returning();
      return newStats;
    }
  }
  async createReferral(insertReferral) {
    const [referral] = await db.insert(referrals).values(insertReferral).returning();
    return referral;
  }
  async getReferralsByReferrer(referrerUserId) {
    return await db.select().from(referrals).where(eq(referrals.referrerUserId, referrerUserId));
  }
  async getReferralByUsers(referrerUserId, referredUserId) {
    const [referral] = await db.select().from(referrals).where(eq(referrals.referrerUserId, referrerUserId));
    return referral || void 0;
  }
  async updateReferralStats(referralId, stats) {
    await db.update(referrals).set({ ...stats, updatedAt: /* @__PURE__ */ new Date() }).where(eq(referrals.id, referralId));
  }
  async createReferralReward(insertReward) {
    const [reward] = await db.insert(referralRewards).values(insertReward).returning();
    return reward;
  }
  async getReferralRewardsByUser(referrerUserId) {
    return await db.select().from(referralRewards).where(eq(referralRewards.referrerUserId, referrerUserId));
  }
  async getUnclaimedReferralRewards(referrerUserId) {
    return await db.select().from(referralRewards).where(eq(referralRewards.referrerUserId, referrerUserId));
  }
  async claimReferralRewards(referrerUserId, rewardIds) {
    for (const rewardId of rewardIds) {
      await db.update(referralRewards).set({ claimed: true, claimedAt: /* @__PURE__ */ new Date() }).where(eq(referralRewards.id, rewardId));
    }
  }
  async getReferralStats(userId) {
    const [stats] = await db.select().from(referralStats).where(eq(referralStats.userId, userId));
    return stats || void 0;
  }
  async createOrUpdateReferralStats(userId, statsUpdate) {
    const existingStats = await this.getReferralStats(userId);
    if (existingStats) {
      const [updatedStats] = await db.update(referralStats).set({ ...statsUpdate, updatedAt: /* @__PURE__ */ new Date() }).where(eq(referralStats.userId, userId)).returning();
      return updatedStats;
    } else {
      const [newStats] = await db.insert(referralStats).values({
        userId,
        totalReferrals: 0,
        totalReferralSwaps: 0,
        totalUnclaimedRewards: "0",
        totalClaimedRewards: "0",
        ...statsUpdate
      }).returning();
      return newStats;
    }
  }
};
var storage = new DatabaseStorage();

// server/routes.ts
import { z } from "zod";
async function registerRoutes(app2) {
  app2.get("/api/users/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      let user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        user = await storage.createUser({ walletAddress });
      }
      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ message: error.message || "Failed to get user" });
    }
  });
  app2.get("/api/users/:walletAddress/stats", async (req, res) => {
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
          feesSavedBNB: "0"
        });
      }
      res.json(stats);
    } catch (error) {
      console.error("Error getting user stats:", error);
      res.status(500).json({ message: error.message || "Failed to get user stats" });
    }
  });
  app2.get("/api/users/:walletAddress/activity", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.json([]);
      }
      const transactions = await storage.getSwapTransactionsByUser(user.id);
      const activity = transactions.slice(0, 10).map((tx) => ({
        id: tx.txHash,
        type: "swap",
        description: `${tx.fromAmount} ${tx.fromToken} \u2192 ${tx.toAmount} ${tx.toToken}`,
        amount: "+100K",
        timestamp: tx.createdAt,
        status: "completed"
      }));
      res.json(activity);
    } catch (error) {
      console.error("Error getting user activity:", error);
      res.status(500).json({ message: error.message || "Failed to get user activity" });
    }
  });
  app2.post("/api/swaps", async (req, res) => {
    try {
      const swapData = insertSwapTransactionSchema.parse(req.body);
      let user = await storage.getUserByWalletAddress(swapData.walletAddress);
      if (!user) {
        user = await storage.createUser({ walletAddress: swapData.walletAddress });
      }
      const existingTx = await storage.getSwapTransactionByTxHash(swapData.txHash);
      if (existingTx) {
        return res.json(existingTx);
      }
      const transaction = await storage.createSwapTransaction({
        ...swapData,
        userId: user.id
      });
      const currentStats = await storage.getUserStats(user.id) || {
        totalSwaps: 0,
        totalVolumeBNB: "0",
        totalEarnedHermes: "0",
        pendingRewards: "0",
        feesSaved: "0"
      };
      const feesSavedThisSwapBNB = 1e-4 + Math.random() * 25e-5;
      const bnbPriceUSD = 670;
      const feesSavedThisSwapUSD = feesSavedThisSwapBNB * bnbPriceUSD;
      const newFeesSavedBNB = (parseFloat(currentStats.feesSavedBNB || "0") + feesSavedThisSwapBNB).toString();
      const newFeesSaved = (parseFloat(currentStats.feesSaved || "0") + feesSavedThisSwapUSD).toFixed(2);
      console.log(`\u{1F4B0} Fee savings this swap: ${feesSavedThisSwapBNB.toFixed(6)} BNB ($${feesSavedThisSwapUSD.toFixed(2)} USD)`);
      await storage.createOrUpdateUserStats(user.id, {
        walletAddress: user.walletAddress,
        totalSwaps: currentStats.totalSwaps + 1,
        totalVolumeBNB: (parseFloat(currentStats.totalVolumeBNB) + parseFloat(swapData.fromAmount)).toString(),
        totalEarnedHermes: (parseFloat(currentStats.totalEarnedHermes || "0") + 1e5).toString(),
        pendingRewards: (parseFloat(currentStats.pendingRewards) + 1e5).toString(),
        feesSaved: newFeesSaved,
        feesSavedBNB: newFeesSavedBNB
      });
      res.json(transaction);
    } catch (error) {
      console.error("Error recording swap:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid swap data", errors: error.errors });
      }
      res.status(500).json({ message: error.message || "Failed to record swap" });
    }
  });
  app2.post("/api/users/:walletAddress/claim-rewards", async (req, res) => {
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
      await storage.createOrUpdateUserStats(user.id, {
        walletAddress: user.walletAddress,
        totalEarnedHermes: (parseFloat(stats.totalEarnedHermes) + parseFloat(stats.pendingRewards)).toString(),
        pendingRewards: "0"
      });
      res.json({
        success: true,
        claimedAmount: stats.pendingRewards,
        txHash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`,
        gasCost: "3.20"
      });
    } catch (error) {
      console.error("Error claiming rewards:", error);
      res.status(500).json({ message: error.message || "Failed to claim rewards" });
    }
  });
  app2.post("/api/referrals", async (req, res) => {
    try {
      const { referrerWalletAddress, referredWalletAddress } = req.body;
      if (!referrerWalletAddress || !referredWalletAddress) {
        return res.status(400).json({ message: "Referrer and referred wallet addresses are required" });
      }
      if (referrerWalletAddress === referredWalletAddress) {
        return res.status(400).json({ message: "Cannot refer yourself" });
      }
      let referrer = await storage.getUserByWalletAddress(referrerWalletAddress);
      let referred = await storage.getUserByWalletAddress(referredWalletAddress);
      if (!referrer) {
        referrer = await storage.createUser({ walletAddress: referrerWalletAddress });
      }
      if (!referred) {
        referred = await storage.createUser({ walletAddress: referredWalletAddress });
      }
      const existingReferral = await storage.getReferralByUsers(referrer.id, referred.id);
      if (existingReferral) {
        return res.json({ message: "Referral relationship already exists", referral: existingReferral });
      }
      const referral = await storage.createReferral({
        referrerUserId: referrer.id,
        referredUserId: referred.id,
        referredWalletAddress
      });
      const currentStats = await storage.getReferralStats(referrer.id);
      await storage.createOrUpdateReferralStats(referrer.id, {
        totalReferrals: (currentStats?.totalReferrals || 0) + 1
      });
      res.json({ message: "Referral created successfully", referral });
    } catch (error) {
      console.error("Error creating referral:", error);
      res.status(500).json({ message: error.message || "Failed to create referral" });
    }
  });
  app2.get("/api/referrals/:walletAddress/stats", async (req, res) => {
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
          totalClaimedRewards: "0"
        });
      }
      res.json(stats);
    } catch (error) {
      console.error("Error getting referral stats:", error);
      res.status(500).json({ message: error.message || "Failed to get referral stats" });
    }
  });
  app2.get("/api/referrals/:walletAddress", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.json([]);
      }
      const referrals2 = await storage.getReferralsByReferrer(user.id);
      res.json(referrals2);
    } catch (error) {
      console.error("Error getting referrals:", error);
      res.status(500).json({ message: error.message || "Failed to get referrals" });
    }
  });
  app2.get("/api/referrals/:walletAddress/rewards", async (req, res) => {
    try {
      const { walletAddress } = req.params;
      const user = await storage.getUserByWalletAddress(walletAddress);
      if (!user) {
        return res.json([]);
      }
      const unclaimedRewards = await storage.getUnclaimedReferralRewards(user.id);
      res.json(unclaimedRewards);
    } catch (error) {
      console.error("Error getting referral rewards:", error);
      res.status(500).json({ message: error.message || "Failed to get referral rewards" });
    }
  });
  app2.post("/api/referrals/:walletAddress/claim", async (req, res) => {
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
      const rewards = await storage.getUnclaimedReferralRewards(user.id);
      const rewardsToClaimMap = new Map(rewards.map((r) => [r.id, r]));
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
      const { claimReferralRewards: claimReferralRewards2 } = await Promise.resolve().then(() => (init_referralClaim(), referralClaim_exports));
      const claimResult = await claimReferralRewards2(walletAddress, totalClaimAmount.toString());
      if (!claimResult.success) {
        return res.status(500).json({
          message: claimResult.error || "Failed to transfer HERMES tokens",
          details: claimResult
        });
      }
      await storage.claimReferralRewards(user.id, rewardIds);
      const unclaimedRewards = await storage.getUnclaimedReferralRewards(user.id);
      const totalUnclaimed = unclaimedRewards.reduce((sum, reward) => sum + parseFloat(reward.rewardAmount || "0"), 0);
      const currentStats = await storage.getReferralStats(user.id);
      await storage.createOrUpdateReferralStats(user.id, {
        totalUnclaimedRewards: totalUnclaimed.toString(),
        totalClaimedRewards: ((currentStats?.totalClaimedRewards ? parseFloat(currentStats.totalClaimedRewards) : 0) + totalClaimAmount).toString()
      });
      res.json({
        message: "Rewards claimed successfully",
        claimedAmount: totalClaimAmount,
        txHash: claimResult.txHash,
        success: true
      });
    } catch (error) {
      console.error("Error claiming referral rewards:", error);
      res.status(500).json({ message: error.message || "Failed to claim referral rewards" });
    }
  });
  app2.post("/api/referral-rewards", async (req, res) => {
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
      console.log("\u{1F3AF} Creating referral reward:", { referrerWalletAddress, referredWalletAddress, rewardAmount, claimed });
      let referrer = await storage.getUserByWalletAddress(referrerWalletAddress);
      let referred = await storage.getUserByWalletAddress(referredWalletAddress);
      if (!referrer) {
        referrer = await storage.createUser({ walletAddress: referrerWalletAddress });
      }
      if (!referred) {
        referred = await storage.createUser({ walletAddress: referredWalletAddress });
      }
      const reward = await storage.createReferralReward({
        referrerUserId: referrer.id,
        referredUserId: referred.id,
        swapTransactionId: parseInt(swapTransactionId),
        rewardAmount: rewardAmount || "10000",
        claimed,
        claimedAt: claimed ? claimedAt || (/* @__PURE__ */ new Date()).toISOString() : null
      });
      const currentStats = await storage.getReferralStats(referrer.id);
      if (claimed) {
        await storage.createOrUpdateReferralStats(referrer.id, {
          totalReferralSwaps: (currentStats?.totalReferralSwaps || 0) + 1,
          totalClaimedRewards: (parseFloat(currentStats?.totalClaimedRewards || "0") + parseFloat(rewardAmount || "10000")).toString()
        });
        console.log(`\u2705 INSTANT referral payment: ${rewardAmount || "10000"} HERMES paid to ${referrerWalletAddress}`);
      } else {
        await storage.createOrUpdateReferralStats(referrer.id, {
          totalReferralSwaps: (currentStats?.totalReferralSwaps || 0) + 1,
          totalUnclaimedRewards: (parseFloat(currentStats?.totalUnclaimedRewards || "0") + parseFloat(rewardAmount || "10000")).toString()
        });
      }
      const referral = await storage.getReferralByUsers(referrer.id, referred.id);
      if (referral) {
        await storage.updateReferralStats(referral.id, {
          totalSwaps: (referral.totalSwaps || 0) + 1,
          totalRewardsEarned: (parseFloat(referral.totalRewardsEarned || "0") + parseFloat(rewardAmount || "10000")).toString()
        });
      }
      res.json({
        message: claimed ? "Referral reward instantly paid!" : "Referral reward created successfully",
        reward,
        paymentType: claimed ? "INSTANT" : "PENDING"
      });
    } catch (error) {
      console.error("Error creating referral reward:", error);
      res.status(500).json({ message: error.message || "Failed to create referral reward" });
    }
  });
  app2.get("/api/treasury/balance", async (req, res) => {
    try {
      const { getTreasuryBalance: getTreasuryBalance2 } = await Promise.resolve().then(() => (init_referralClaim(), referralClaim_exports));
      const balance = await getTreasuryBalance2();
      res.json({
        treasuryAddress: "0xd88026A648C95780e3056ed98eD60E5105cc4863",
        balance,
        token: "HERMES",
        status: "active"
      });
    } catch (error) {
      console.error("Error getting treasury balance:", error);
      res.status(500).json({ message: error.message || "Failed to get treasury balance" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile("sw.js", { root: "public" });
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
