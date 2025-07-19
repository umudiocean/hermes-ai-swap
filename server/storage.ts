import { 
  users, 
  swapTransactions, 
  userStats,
  referrals,
  referralRewards,
  referralStats,
  type User, 
  type InsertUser, 
  type SwapTransaction, 
  type InsertSwapTransaction,
  type UserStats,
  type InsertUserStats,
  type Referral,
  type InsertReferral,
  type ReferralReward,
  type InsertReferralReward,
  type ReferralStats,
  type InsertReferralStats
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByWalletAddress(walletAddress: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Swap transaction operations
  createSwapTransaction(swap: InsertSwapTransaction & { userId: number }): Promise<SwapTransaction>;
  getSwapTransactionsByUser(userId: number): Promise<SwapTransaction[]>;
  getSwapTransactionByTxHash(txHash: string): Promise<SwapTransaction | undefined>;

  // User stats operations
  getUserStats(userId: number): Promise<UserStats | undefined>;
  getUserStatsByWalletAddress(walletAddress: string): Promise<UserStats | undefined>;
  createOrUpdateUserStats(userId: number, stats: Partial<InsertUserStats>): Promise<UserStats>;

  // Referral operations
  createReferral(referral: InsertReferral): Promise<Referral>;
  getReferralsByReferrer(referrerUserId: number): Promise<Referral[]>;
  getReferralByUsers(referrerUserId: number, referredUserId: number): Promise<Referral | undefined>;
  updateReferralStats(referralId: number, stats: { totalSwaps: number; totalRewardsEarned: string }): Promise<void>;

  // Referral rewards operations
  createReferralReward(reward: InsertReferralReward): Promise<ReferralReward>;
  getReferralRewardsByUser(referrerUserId: number): Promise<ReferralReward[]>;
  getUnclaimedReferralRewards(referrerUserId: number): Promise<ReferralReward[]>;
  claimReferralRewards(referrerUserId: number, rewardIds: number[]): Promise<void>;

  // Referral stats operations
  getReferralStats(userId: number): Promise<ReferralStats | undefined>;
  createOrUpdateReferralStats(userId: number, stats: Partial<InsertReferralStats>): Promise<ReferralStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private swapTransactions: Map<number, SwapTransaction>;
  private userStats: Map<number, UserStats>;
  private referrals: Map<number, Referral>;
  private referralRewards: Map<number, ReferralReward>;
  private referralStats: Map<number, ReferralStats>;
  private currentUserId: number;
  private currentSwapId: number;
  private currentStatsId: number;
  private currentReferralId: number;
  private currentReferralRewardId: number;
  private currentReferralStatsId: number;

  constructor() {
    this.users = new Map();
    this.swapTransactions = new Map();
    this.userStats = new Map();
    this.referrals = new Map();
    this.referralRewards = new Map();
    this.referralStats = new Map();
    this.currentUserId = 1;
    this.currentSwapId = 1;
    this.currentStatsId = 1;
    this.currentReferralId = 1;
    this.currentReferralRewardId = 1;
    this.currentReferralStatsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async createSwapTransaction(swap: InsertSwapTransaction & { userId: number }): Promise<SwapTransaction> {
    const id = this.currentSwapId++;
    const transaction: SwapTransaction = {
      ...swap,
      id,
      rewardsClaimed: false,
      rewardsAmount: "100000",
      createdAt: new Date(),
    };
    this.swapTransactions.set(id, transaction);
    return transaction;
  }

  async getSwapTransactionsByUser(userId: number): Promise<SwapTransaction[]> {
    return Array.from(this.swapTransactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSwapTransactionByTxHash(txHash: string): Promise<SwapTransaction | undefined> {
    return Array.from(this.swapTransactions.values()).find(
      transaction => transaction.txHash === txHash
    );
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      stats => stats.userId === userId
    );
  }

  async getUserStatsByWalletAddress(walletAddress: string): Promise<UserStats | undefined> {
    return Array.from(this.userStats.values()).find(
      stats => stats.walletAddress.toLowerCase() === walletAddress.toLowerCase()
    );
  }

  async createOrUpdateUserStats(userId: number, statsUpdate: Partial<InsertUserStats>): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    
    if (existingStats) {
      const updatedStats: UserStats = {
        ...existingStats,
        ...statsUpdate,
        updatedAt: new Date(),
      };
      this.userStats.set(existingStats.id, updatedStats);
      return updatedStats;
    } else {
      const id = this.currentStatsId++;
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      const newStats: UserStats = {
        id,
        userId,
        walletAddress: user.walletAddress,
        totalSwaps: 0,
        totalVolumeBNB: "0",
        totalEarnedHermes: "0",
        pendingRewards: "0",
        feesSaved: "0",
        feesSavedBNB: "0",
        updatedAt: new Date(),
        ...statsUpdate,
      };
      this.userStats.set(id, newStats);
      return newStats;
    }
  }

  // Referral operations
  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const id = this.currentReferralId++;
    const referral: Referral = {
      id,
      ...insertReferral,
      totalSwaps: 0,
      totalRewardsEarned: "0",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.referrals.set(id, referral);
    return referral;
  }

  async getReferralsByReferrer(referrerUserId: number): Promise<Referral[]> {
    return Array.from(this.referrals.values()).filter(
      referral => referral.referrerUserId === referrerUserId
    );
  }

  async getReferralByUsers(referrerUserId: number, referredUserId: number): Promise<Referral | undefined> {
    return Array.from(this.referrals.values()).find(
      referral => referral.referrerUserId === referrerUserId && referral.referredUserId === referredUserId
    );
  }

  async updateReferralStats(referralId: number, stats: { totalSwaps: number; totalRewardsEarned: string }): Promise<void> {
    const referral = this.referrals.get(referralId);
    if (referral) {
      referral.totalSwaps = stats.totalSwaps;
      referral.totalRewardsEarned = stats.totalRewardsEarned;
      referral.updatedAt = new Date();
      this.referrals.set(referralId, referral);
    }
  }

  // Referral rewards operations
  async createReferralReward(insertReward: InsertReferralReward): Promise<ReferralReward> {
    const id = this.currentReferralRewardId++;
    const reward: ReferralReward = {
      id,
      referrerUserId: insertReward.referrerUserId,
      referredUserId: insertReward.referredUserId,
      swapTransactionId: insertReward.swapTransactionId,
      rewardAmount: insertReward.rewardAmount || "10000",
      claimed: false,
      claimedAt: null,
      createdAt: new Date(),
    };
    this.referralRewards.set(id, reward);
    return reward;
  }

  async getReferralRewardsByUser(referrerUserId: number): Promise<ReferralReward[]> {
    return Array.from(this.referralRewards.values()).filter(
      reward => reward.referrerUserId === referrerUserId
    );
  }

  async getUnclaimedReferralRewards(referrerUserId: number): Promise<ReferralReward[]> {
    return Array.from(this.referralRewards.values()).filter(
      reward => reward.referrerUserId === referrerUserId && !reward.claimed
    );
  }

  async claimReferralRewards(referrerUserId: number, rewardIds: number[]): Promise<void> {
    for (const rewardId of rewardIds) {
      const reward = this.referralRewards.get(rewardId);
      if (reward && reward.referrerUserId === referrerUserId) {
        reward.claimed = true;
        reward.claimedAt = new Date();
        this.referralRewards.set(rewardId, reward);
      }
    }
  }

  // Referral stats operations
  async getReferralStats(userId: number): Promise<ReferralStats | undefined> {
    return Array.from(this.referralStats.values()).find(
      stats => stats.userId === userId
    );
  }

  async createOrUpdateReferralStats(userId: number, statsUpdate: Partial<InsertReferralStats>): Promise<ReferralStats> {
    const existingStats = await this.getReferralStats(userId);
    
    if (existingStats) {
      const updatedStats: ReferralStats = {
        ...existingStats,
        ...statsUpdate,
        updatedAt: new Date(),
      };
      this.referralStats.set(existingStats.id, updatedStats);
      return updatedStats;
    } else {
      const id = this.currentReferralStatsId++;
      const newStats: ReferralStats = {
        id,
        userId,
        totalReferrals: 0,
        totalReferralSwaps: 0,
        totalUnclaimedRewards: "0",
        totalClaimedRewards: "0",
        createdAt: new Date(),
        updatedAt: new Date(),
        ...statsUpdate,
      };
      this.referralStats.set(id, newStats);
      return newStats;
    }
  }
}

// Import the database setup
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle({ client: pool, schema });

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, walletAddress.toLowerCase()));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, walletAddress: insertUser.walletAddress.toLowerCase() })
      .returning();
    return user;
  }

  async createSwapTransaction(swap: InsertSwapTransaction & { userId: number }): Promise<SwapTransaction> {
    const [transaction] = await db
      .insert(swapTransactions)
      .values(swap)
      .returning();
    return transaction;
  }

  async getSwapTransactionsByUser(userId: number): Promise<SwapTransaction[]> {
    return await db.select().from(swapTransactions)
      .where(eq(swapTransactions.userId, userId))
      .orderBy(swapTransactions.createdAt);
  }

  async getSwapTransactionByTxHash(txHash: string): Promise<SwapTransaction | undefined> {
    const [transaction] = await db.select().from(swapTransactions)
      .where(eq(swapTransactions.txHash, txHash));
    return transaction || undefined;
  }

  async getUserStats(userId: number): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats)
      .where(eq(userStats.userId, userId));
    return stats || undefined;
  }

  async getUserStatsByWalletAddress(walletAddress: string): Promise<UserStats | undefined> {
    const [stats] = await db.select().from(userStats)
      .where(eq(userStats.walletAddress, walletAddress.toLowerCase()));
    return stats || undefined;
  }

  async createOrUpdateUserStats(userId: number, statsUpdate: Partial<InsertUserStats>): Promise<UserStats> {
    const existingStats = await this.getUserStats(userId);
    
    if (existingStats) {
      const [updatedStats] = await db
        .update(userStats)
        .set({ ...statsUpdate, updatedAt: new Date() })
        .where(eq(userStats.userId, userId))
        .returning();
      return updatedStats;
    } else {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      const [newStats] = await db
        .insert(userStats)
        .values({
          userId,
          walletAddress: user.walletAddress,
          totalSwaps: 0,
          totalVolumeBNB: "0",
          totalEarnedHermes: "0",
          pendingRewards: "0",
          feesSaved: "0",
          feesSavedBNB: "0",
          ...statsUpdate,
        })
        .returning();
      return newStats;
    }
  }

  async createReferral(insertReferral: InsertReferral): Promise<Referral> {
    const [referral] = await db
      .insert(referrals)
      .values(insertReferral)
      .returning();
    return referral;
  }

  async getReferralsByReferrer(referrerUserId: number): Promise<Referral[]> {
    return await db.select().from(referrals)
      .where(eq(referrals.referrerUserId, referrerUserId));
  }

  async getReferralByUsers(referrerUserId: number, referredUserId: number): Promise<Referral | undefined> {
    const [referral] = await db.select().from(referrals)
      .where(eq(referrals.referrerUserId, referrerUserId));
    return referral || undefined;
  }

  async updateReferralStats(referralId: number, stats: { totalSwaps: number; totalRewardsEarned: string }): Promise<void> {
    await db
      .update(referrals)
      .set({ ...stats, updatedAt: new Date() })
      .where(eq(referrals.id, referralId));
  }

  async createReferralReward(insertReward: InsertReferralReward): Promise<ReferralReward> {
    const [reward] = await db
      .insert(referralRewards)
      .values(insertReward)
      .returning();
    return reward;
  }

  async getReferralRewardsByUser(referrerUserId: number): Promise<ReferralReward[]> {
    return await db.select().from(referralRewards)
      .where(eq(referralRewards.referrerUserId, referrerUserId));
  }

  async getUnclaimedReferralRewards(referrerUserId: number): Promise<ReferralReward[]> {
    return await db.select().from(referralRewards)
      .where(eq(referralRewards.referrerUserId, referrerUserId));
  }

  async claimReferralRewards(referrerUserId: number, rewardIds: number[]): Promise<void> {
    for (const rewardId of rewardIds) {
      await db
        .update(referralRewards)
        .set({ claimed: true, claimedAt: new Date() })
        .where(eq(referralRewards.id, rewardId));
    }
  }

  async getReferralStats(userId: number): Promise<ReferralStats | undefined> {
    const [stats] = await db.select().from(referralStats)
      .where(eq(referralStats.userId, userId));
    return stats || undefined;
  }

  async createOrUpdateReferralStats(userId: number, statsUpdate: Partial<InsertReferralStats>): Promise<ReferralStats> {
    const existingStats = await this.getReferralStats(userId);
    
    if (existingStats) {
      const [updatedStats] = await db
        .update(referralStats)
        .set({ ...statsUpdate, updatedAt: new Date() })
        .where(eq(referralStats.userId, userId))
        .returning();
      return updatedStats;
    } else {
      const [newStats] = await db
        .insert(referralStats)
        .values({
          userId,
          totalReferrals: 0,
          totalReferralSwaps: 0,
          totalUnclaimedRewards: "0",
          totalClaimedRewards: "0",
          ...statsUpdate,
        })
        .returning();
      return newStats;
    }
  }
}

export const storage = new DatabaseStorage();
