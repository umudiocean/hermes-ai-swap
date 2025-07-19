import { create } from "zustand";
import { persist } from "zustand/middleware";
import hermesSwapV3Service from "@/services/hermesSwapV4Service";
import { useWalletStore } from "./useWalletStore";

interface ReferralV3Stats {
  code: number;
  earnings: string;
  totalRefs: number;
  hasCode: boolean;
}

interface ReferralV3State {
  referralCode: string | null;
  myReferralCode: number;
  referralStats: ReferralV3Stats;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  setReferralCode: (code: string) => void;
  generateMyReferralCode: () => Promise<void>;
  getReferralStats: () => Promise<void>;
  clearReferralCode: () => void;
  clearError: () => void;
}

export const useReferralV3Store = create<ReferralV3State>()(
  persist(
    (set, get) => ({
      referralCode: null,
      myReferralCode: 0,
      referralStats: {
        code: 0,
        earnings: "0",
        totalRefs: 0,
        hasCode: false
      },
      isGenerating: false,
      error: null,

      setReferralCode: (code: string) => {
        console.log("Setting referral code:", code);
        set({ referralCode: code });
      },

      generateMyReferralCode: async () => {
        const { provider, address } = useWalletStore.getState();
        
        if (!provider || !address) {
          set({ error: "Wallet not connected" });
          return;
        }
        
        const signer = await provider.getSigner();

        set({ isGenerating: true, error: null });
        
        try {
          console.log("🎫 Generating referral code with V4 system (0.0006 BNB fee)...");
          const codeResult = await hermesSwapV3Service.generateReferralCode(signer);
          
          if (codeResult.success && codeResult.code) {
            const code = codeResult.code;
          
            set({ 
              myReferralCode: code,
              referralStats: { 
                ...get().referralStats, 
                code, 
                hasCode: code > 0 
              },
              isGenerating: false 
            });
            
            console.log("✅ Referral code generated successfully:", code);
            console.log("💰 0.0006 BNB fee sent to treasury:", "0xd88026A648C95780e3056ed98eD60E5105cc4863");
          } else {
            throw new Error(codeResult.error || "Failed to generate referral code");
          }
        } catch (error: any) {
          console.error("❌ Error generating referral code:", error);
          set({ 
            error: error.message || "Failed to generate referral code",
            isGenerating: false 
          });
        }
      },

      getReferralStats: async () => {
        const { address } = useWalletStore.getState();
        
        if (!address) {
          return;
        }

        try {
          const stats = await hermesSwapV3Service.getReferralStats(address);
          if (stats) {
            set({ referralStats: stats });
            
            if (stats.hasCode && stats.code > 0) {
              set({ myReferralCode: stats.code });
            }
          }
        } catch (error: any) {
          console.error("Error getting referral stats:", error);
          set({ error: error.message || "Failed to get referral stats" });
        }
      },

      clearReferralCode: () => {
        set({ referralCode: null });
      },

      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: "hermes-referral-v3-store",
      partialize: (state) => ({
        referralCode: state.referralCode,
        myReferralCode: state.myReferralCode
      })
    }
  )
);

// Auto-load referral stats when wallet connects
useWalletStore.subscribe((state) => {
  if (state.isConnected && state.address) {
    const { getReferralStats } = useReferralV3Store.getState();
    getReferralStats();
  }
});

export default useReferralV3Store;