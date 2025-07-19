import { pgTable, text, serial, integer, boolean, decimal, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  walletAddress: text("wallet_address").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const swapTransactions = pgTable("swap_transactions", {
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userStats = pgTable("user_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  walletAddress: text("wallet_address").notNull(),
  totalSwaps: integer("total_swaps").default(0).notNull(),
  totalVolumeBNB: decimal("total_volume_bnb", { precision: 18, scale: 8 }).default("0").notNull(),
  totalEarnedHermes: decimal("total_earned_hermes", { precision: 18, scale: 8 }).default("0").notNull(),
  pendingRewards: decimal("pending_rewards", { precision: 18, scale: 8 }).default("0").notNull(),
  feesSaved: decimal("fees_saved", { precision: 10, scale: 2 }).default("0").notNull(),
  feesSavedBNB: decimal("fees_saved_bnb", { precision: 18, scale: 8 }).default("0").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerUserId: integer("referrer_user_id").references(() => users.id).notNull(),
  referredUserId: integer("referred_user_id").references(() => users.id).notNull(),
  referredWalletAddress: text("referred_wallet_address").notNull(),
  totalSwaps: integer("total_swaps").default(0).notNull(),
  totalRewardsEarned: decimal("total_rewards_earned", { precision: 18, scale: 8 }).default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const referralRewards = pgTable("referral_rewards", {
  id: serial("id").primaryKey(),
  referrerUserId: integer("referrer_user_id").references(() => users.id).notNull(),
  referredUserId: integer("referred_user_id").references(() => users.id).notNull(),
  swapTransactionId: integer("swap_transaction_id").references(() => swapTransactions.id).notNull(),
  rewardAmount: decimal("reward_amount", { precision: 18, scale: 8 }).default("10000").notNull(),
  claimed: boolean("claimed").default(false).notNull(),
  claimedAt: timestamp("claimed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralStats = pgTable("referral_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  totalReferrals: integer("total_referrals").default(0),
  totalReferralSwaps: integer("total_referral_swaps").default(0),
  totalUnclaimedRewards: decimal("total_unclaimed_rewards", { precision: 18, scale: 8 }).default("0"),
  totalClaimedRewards: decimal("total_claimed_rewards", { precision: 18, scale: 8 }).default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  walletAddress: true,
});

export const insertSwapTransactionSchema = createInsertSchema(swapTransactions).pick({
  walletAddress: true,
  fromToken: true,
  toToken: true,
  fromAmount: true,
  toAmount: true,
  txHash: true,
});

export const insertUserStatsSchema = createInsertSchema(userStats).pick({
  walletAddress: true,
  totalSwaps: true,
  totalVolumeBNB: true,
  totalEarnedHermes: true,
  pendingRewards: true,
  feesSaved: true,
  feesSavedBNB: true,
});

export const insertReferralSchema = createInsertSchema(referrals).pick({
  referrerUserId: true,
  referredUserId: true,
  referredWalletAddress: true,
});

export const insertReferralRewardSchema = createInsertSchema(referralRewards).pick({
  referrerUserId: true,
  referredUserId: true,
  swapTransactionId: true,
  rewardAmount: true,
  claimed: true,
  claimedAt: true,
});

export const insertReferralStatsSchema = createInsertSchema(referralStats).pick({
  userId: true,
  totalReferrals: true,
  totalReferralSwaps: true,
  totalUnclaimedRewards: true,
  totalClaimedRewards: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SwapTransaction = typeof swapTransactions.$inferSelect;
export type InsertSwapTransaction = z.infer<typeof insertSwapTransactionSchema>;
export type UserStats = typeof userStats.$inferSelect;
export type InsertUserStats = z.infer<typeof insertUserStatsSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = z.infer<typeof insertReferralRewardSchema>;
export type ReferralStats = typeof referralStats.$inferSelect;
export type InsertReferralStats = z.infer<typeof insertReferralStatsSchema>;
