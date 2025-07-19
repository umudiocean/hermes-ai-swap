import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const supportedLanguages = [
  'en', // English (default)
  'zh', // Chinese (Mandarin)
  'fr', // French
  'de', // German
  'hi', // Hindi
  'it', // Italian
  'ja', // Japanese
  'pt', // Portuguese
  'ru', // Russian
  'es', // Spanish
  'tr'  // Turkish
];

// Inline translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        swap: "Swap Tokens",
        referral: "Referral System",
        stake: "Stake Farms",
        join_x: "Join us on X",
        join_telegram: "Join Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "Connect Wallet",
        connecting: "Connecting...",
        mobile_connect: "Connect Mobile Wallet",
        disconnect: "Disconnect",
        copy_address: "Copy Address",
        address_copied: "Address copied!",
        hermes_balance: "HERMES Balance",
        wallet_address: "Wallet Address",
        smart_contract: "Smart Contract",
        add_token: "Add Hermes Coin to Wallet",
        auto_update: "Auto-refresh: Every 5 minutes",
        usd_value: "USD Value",
        balance_updated: "Balance Updated",
        balance_updated_desc: "HERMES balance successfully updated",
        update_error: "Update Error",
        update_error_desc: "Error occurred while updating balance",
        address_copied_desc: "Wallet address copied to clipboard",
        copy_error: "Copy Error",
        copy_error_desc: "Address could not be copied",
        token_added: "Token Added",
        token_added_desc: "HERMES token added to your wallet",
        token_add_error: "Token Add Error",
        token_add_error_desc: "Error occurred while adding token to wallet",
        not_connected: "Wallet not connected",
        connect_to_view: "Connect your wallet to view HERMES balance",
        last_update: "Last update"
      },
      
      // Swap Interface
      swap: {
        title: "Token Swap",
        from: "From",
        to: "To", 
        amount: "Amount",
        balance: "Balance",
        max: "MAX",
        slippage: "Slippage",
        price_impact: "Price Impact",
        minimum_received: "Minimum Received",
        execute: "Execute Swap",
        executing: "Executing...",
        success: "Swap Successful!",
        failed: "Swap Failed"
      },
      
      // Dashboard
      dashboard: {
        title: "Trading Dashboard",
        total_swaps: "Total Swaps",
        total_volume: "Total Volume",
        earned_rewards: "Earned Rewards",
        fee_savings: "Fee Savings"
      },
      
      // Swap Interface Extended
      swap_extended: {
        price_calculation_failed: "Price calculation failed",
        insufficient_bnb_for_fee: "Insufficient BNB for transaction fee",
        swap_in_progress: "Swap in progress...",
        preparing_transaction: "Preparing transaction",
        confirming_transaction: "Confirming transaction",
        swap_completed: "Swap completed successfully",
        current_rate: "Current Rate",
        estimated_gas: "Estimated Gas",
        total_fee: "Total Fee",
        you_receive: "You receive",
        platform_fee: "Platform Fee",
        trading_fee: "Trading Fee",
        hermes_reward: "HERMES Reward",
        slippage_tolerance: "Slippage Tolerance",
        hermes_slogan: "Hermes AI scanned 21 DEXs and found the lowest fee",
        first_token_approval: "First token swap: MAX approval first, then swap (2 transactions). Future swaps will be single transaction!",
        approval_completed: "MAX approval completed! All future swaps with this token will be single transaction."
      },
      
      // Rewards
      rewards: {
        title: "Rewards Center",
        claimable: "Claimable HERMES",
        claim: "Claim Rewards",
        claiming: "Claiming...",
        claimed: "Rewards Claimed!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Mobile Swap Mode",
        fullscreen: "Fullscreen Mode",
        exit_fullscreen: "Exit Fullscreen"
      },
      
      // Errors
      errors: {
        wallet_required: "Please connect your wallet",
        insufficient_balance: "Insufficient balance",
        slippage_too_high: "Slippage tolerance too high",
        transaction_failed: "Transaction failed",
        network_error: "Network error occurred"
      },

      // Notifications
      notifications: {
        referral_active: "Referral Active! 🎉",
        referral_active_desc: "Swapping with referral code {code}. You'll earn +10,000 HERMES bonus!",
        referral_active_wallet_desc: "{code} referral swap. +10,000 HERMES goes to referrer!",
        price_calculation_error: "Price Calculation Error",
        price_calculation_error_desc: "Could not retrieve instant price. Please try again.",
        insufficient_bnb: "Insufficient BNB. Required: {amount} BNB (swap + gas reserve)",
        swap_success_referral: "{fromAmount} {fromSymbol} → {toAmount} {toSymbol} + 110,000 HERMES reward! (Referrer: +10,000 HERMES)",
        swap_success_normal: "{fromAmount} {fromSymbol} → {toAmount} {toSymbol} + 100,000 HERMES reward!",
        network_connection_error: "Network connection problem! Cannot communicate with BSC network. Please check MetaMask and try again.",
        network_timeout: "BSC network timeout error. Wait a few seconds and try again.",
        transaction_cancelled: "Transaction cancelled by user.",
        slippage_too_low_hermes: "Slippage tolerance too low. At least {slippage}% slippage recommended for HERMES token.",
        slippage_too_low_token: "Slippage tolerance too low. At least {slippage}% slippage recommended for this token.",
        connection_restored: "Connection Restored",
        connection_restored_desc: "Internet connection restored",
        offline_mode: "Offline Mode",
        offline_mode_desc: "No internet connection. Some features may be limited.",
        mobile_wallet_tip: "For best experience, open wallet browser",
        wallet_browser_open: "Open Wallet Browser"
      },
      
      // Button states
      swapping: "Swapping...",
      calculating: "Calculating...",
      selectTokens: "Select Tokens",
      
      // Referral Page
      referral: {
        title: "Unlimited Referral System",
        invite_friends_earn: "Invite friends and earn HERMES rewards together",
        your_referral_link: "Your Referral Link",
        invite_with_link: "Share this link to invite friends",
        referral_link: "Referral Link",
        copy_link: "Copy Link",
        share_link: "Share Link",
        copied: "Link Copied!",
        referral_link_copied: "Referral link copied to clipboard",
        connect_wallet_first: "Connect your wallet to get your referral link",
        how_it_works: "How It Works",
        step1_title: "Share Your Link",
        step1_desc: "Send your unique referral link to friends",
        step2_title: "Friends Join & Swap",
        step2_desc: "When they use your link and make swaps",
        step3_title: "Earn Rewards",
        step3_desc: "Get bonus HERMES tokens for each referral",
        referral_stats: "Referral Statistics",
        total_referrals: "Total Referrals",
        referral_volume: "Referral Volume",
        earned_bonuses: "Earned Bonuses",
        // New comprehensive translations
        unlimited_title: "Unlimited Referral System",
        share_unique_link: "Share your unique referral link",
        track_earnings: "Track your earnings and claim anytime",
        influencers_welcome: "Influencers welcome — massive earning potential!",
        swaps_by_referrals: "Swaps by Referrals",
        unclaimed_hermes: "Unclaimed HERMES",
        total_claimed: "Total Claimed",
        share_to_earn: "Share this link to start earning",
        claim_rewards: "Claim Rewards",
        claiming: "Claiming...",
        rewards_claimed: "Rewards Claimed!",
        claim_success: "Successfully claimed {amount} HERMES tokens",
        claim_failed: "Claim Failed",
        claim_error: "Error occurred while claiming rewards. Please try again.",
        no_unclaimed: "No unclaimed rewards available",
        real_hermes_rewards: "Real HERMES Rewards",
        automatic_tracking: "Automatic Tracking System",
        referral_explanation: "How Hermes AI Referral System Works",
        explanation_intro: "Our referral system is designed to reward you for bringing new users to the platform. Here's how it works in detail:",
        step1_detailed: "Share Your Unique Link",
        step1_detail_desc: "Every wallet address gets a unique referral link. When you share this link, anyone who clicks it and connects their wallet will be permanently linked as your referral.",
        step2_detailed: "Referrals Make Swaps",
        step2_detail_desc: "When your referrals perform token swaps on our platform, the system automatically tracks these transactions and credits you with rewards.",
        step3_detailed: "Earn Real HERMES",
        step3_detail_desc: "For every swap your referrals make, you earn 10,000 HERMES tokens. These are real tokens sent directly from our treasury wallet to your wallet when you claim.",
        step4_detailed: "Manual Claim System",
        step4_detail_desc: "Rewards accumulate in your account and can be claimed manually at any time. This gives you control over when to receive your tokens and helps with gas optimization.",
        unlimited_earning: "Unlimited Earning Potential",
        unlimited_desc: "There's no limit to how many people you can refer or how much you can earn. Share with friends, family, social media followers, or anyone interested in DeFi trading.",
        security_note: "Security & Transparency",
        security_desc: "All referral tracking happens on-chain and in our secure database. Your earnings are guaranteed and can be verified through blockchain transactions.",
        get_started: "Ready to Start Earning?",
        get_started_desc: "Connect your wallet above to get your unique referral link and start building your referral network today!",
        
        // V4 System specific translations
        generate_code: "Generate Referral Code",
        generating_code: "Generating Referral Code...",
        code_generated: "Referral Code Generated! 🎉",
        generation_failed: "Generation Failed",
        v4_fee_required: "V4 System: 0.0006 BNB fee required. Please confirm transaction.",
        v4_fee_paid: "Code: {code}. 0.0006 BNB fee paid. Share to earn 10K HERMES per swap!",
        transaction_rejected: "Transaction rejected or insufficient BNB balance",
        url_copied: "Copied! 📋",
        url_copied_desc: "Referral URL copied to clipboard",
        share_whatsapp: "Share on WhatsApp",
        share_twitter: "Share on Twitter",
        share_telegram: "Share on Telegram",
        qr_code: "QR Code",
        scan_to_join: "Scan to join",
        wallet_not_connected: "Wallet Not Connected",
        connect_first: "Connect your wallet to access the referral system",
        no_code_yet: "No code yet",
        generate_first: "Generate your referral code first",
        system_v3_title: "HermesSwap V3 Referral System",
        no_referral_limit: "No Referral Limit",
        invite_unlimited: "Invite as many people as you want",
        hermes_per_swap: "10,000 HERMES/Swap",
        earn_per_swap: "Earn from every swap they make",
        realtime_stats: "Real-time statistics and instant rewards",
        system_features: {
          smart_codes: "Generate smart referral codes",
          enhanced_rewards: "Enhanced rewards: 110,000 HERMES for users + 10,000 for referrers",
          instant_payments: "Instant automatic payments during swaps",
          onchain_tracking: "On-chain tracking and verification",
          professional_system: "Professional influencer system!"
        },
        
        // Additional system feature descriptions
        smart_referral_codes_desc: "Generate smart referral codes",
        enhanced_rewards_desc: "Enhanced rewards: 110,000 HERMES for users + 10,000 for referrers", 
        instant_payments_desc: "Instant automatic payments during swaps",
        onchain_tracking_desc: "On-chain tracking and verification",
        professional_influencer_desc: "Professional influencer system!",

      },
      

      
      // Advantages
      advantages: {
        title: "Hermes AI Swap Advantages",
        bestPrice: "Best price across 21 DEXs",
        gasSavings: "Up to 25% BNB gas fee savings",
        instantReward: "Instant 100,000 HERMES reward",
        totalSaved: "Total saved"
      },
      
      // Passive Income
      passive_income: {
        title: "Earn 100% Passive Income with Hermes Coin",
        description: "All you need to do is hold HERMES Coin in your wallet — the system works for you 24/7 and pays automatically.",
        ecosystem_title: "With every action in the Hermes AI ecosystem, you keep earning:",
        earn_swaps: "Earn HERMES Coins from every swap transaction",
        earn_buysell: "Receive instant rewards from every buy & sell of HERMES Coin",
        earn_analysis: "Earn HERMES Coins for every analysis you run on the Hermes AI platform",
        earn_transfers: "Get rewarded with HERMES even from every token transfer",
        no_effort_title: "No mining. No staking. No claiming.",
        no_effort_desc: "Just buy HERMES, hold it, and the system takes care of the rest.",
        autopilot_earning: "This isn't passive income — it's autopilot earning, powered by Hermes AI."
      },

      // Stake Farm Education Content
      stake_education: {
        main_title: "Hermes AI Stake Farm",
        earn_fixed: "Secure 81.11% APY with Safe Passive Income",
        supported_tokens: "BNB, USDT, CAKE",
        how_it_works: "🔒 How It Works:",
        
        step1_title: "✅ 1. Stake:",
        step1_desc1: "Lock your tokens for exactly 99 days.",
        step1_desc2: "Earnings start immediately.",
        
        step2_title: "✅ 2. Earn Daily Rewards:",
        step2_desc1: "Returns accrue daily at approximately 0.222% per day (~81.1% APY).",
        step2_desc2: "You can claim your rewards every 24 hours or let them accumulate.",
        
        step3_title: "✅ 3. Unstake After 99 Days:",
        step3_desc: "After 99 days, withdraw your tokens + full accumulated rewards.",
        
        key_rules: "⚠️ Key Rules:",
        
        rule1_title: "🔴 Early Unstake Prohibited:",
        rule1_desc: "Strict 99-day lock period; no withdrawal allowed before maturity.",
        
        rule2_title: "🟡 Claiming Is Optional:",
        rule2_desc: "Unclaimed rewards accumulate safely; no loss if you wait.",
        
        rule3_title: "🟢 No Compounding:",
        rule3_desc: "Interest is calculated on principal only; rewards do not compound.",
        
        example_title: "📊 Example Calculation (1000 USDT):",
        example_if: "💎 If you stake 1000 USDT:",
        example_daily_detailed: "Daily earnings: ~2.22 USDT/day",
        example_monthly_detailed: "Monthly earnings (~30 days): ~66.6 USDT",
        example_total_rewards: "99-day total reward: ~222 USDT",
        example_total_payout: "Total payout at day 99: 1222 USDT (principal + reward)",
        
        getting_started: "🚀 Getting Started:",
        start_step1: "🔹 Connect your wallet",
        start_step2: "🔹 Select your token (BNB / USDT / CAKE)",
        start_step3: "🔹 Enter the amount to stake",
        start_step4: "🔹 Stake and start earning immediately!",
        
        risk_level: "🎯 Risk Level: Low",
        yield_info: "💵 Return: 22% fixed return in 99 days (~81.1% APY)",
        duration_info: "⏳ Duration: 99-day lock-in period",
        
        bonus_title: "Bonus:",
        bonus_desc1: "Hermes AI Stake Farm ensures full on-chain transparency and security.",
        bonus_desc2: "All staking and reward mechanisms are handled by audited smart contracts trackable and verifiable on the blockchain.",
        
        // Main description paragraph
        main_description: "Hermes AI Stake Farm is a professional passive income platform where users can securely stake BNB, USDT and CAKE tokens for exactly 99 days and earn a 22% net return guarantee (approximately ~0.222% daily, equivalent to 81.1% APY). Earnings start immediately after staking and accumulate every 24 hours. Rewards are always calculated on principal only, compound interest is not applied. For example, if you stake 1000 USDT, you earn daily 2.22 USDT, monthly 66.6 USDT. After 99 days, you receive a total of 1222 USDT. Your funds are securely locked by smart contract for the 99-day period. Early withdrawal is strictly not possible. All transactions take place transparently on Binance Smart Chain.",
        
        // Professional explanation sections
        professional_intro: "is a professional passive income platform offering secure, fixed-yield returns through blockchain technology. Users can stake BNB, USDT, or CAKE tokens for a 99-day lock period and earn a guaranteed 22% net return upon maturity.",
        how_it_works_title: "How It Works",
        how_it_works_step1: "Connect your wallet and select a token",
        how_it_works_step2: "Enter stake amount and confirm transaction",
        how_it_works_step3: "Earn ~0.222% daily rewards (22% over 99 days)",
        how_it_works_step4: "Claim rewards anytime or let them accumulate",
        how_it_works_step5: "Automatic principal return after 99 days",
        example_returns_title: "Example Returns",
        example_stake: "Stake: 1,000 USDT",
        example_daily: "Daily earnings: ~2.22 USDT",
        example_monthly: "Monthly earnings: ~66.6 USDT",
        example_total: "Total after 99 days: 1,222 USDT",
        example_profit: "Net profit: 222 USDT (22%)",
        closing_quote: "Transparent, on-chain staking with mathematical precision. No compounding complexity — just reliable, fixed returns calculated on your principal investment."
      },

      // Stake specific UI translations  
      stake: {
        page_title: "Hermes AI Stake Farm",
        page_subtitle: "Earn 22% in 99 days with Hermes AI Stake Farm",
        tab_pools: "Farm Pools", 
        tab_mystakes: "My Stakes",
        select_pool_title: "Select Token Pool",
        select_pool_subtitle: "Choose token for staking",
        premium_pool: "Premium Pool",
        selected: "Selected",
        select: "Select",
        stake_amount: "Stake Amount",
        balance: "Balance",
        lock_period: "Lock Period",
        apy: "APY",
        days: "days",
        stake_bnb: "Stake BNB",
        stake_usdt: "Stake USDT", 
        stake_cake: "Stake CAKE",
        staking_bnb: "Staking BNB...",
        staking_usdt: "Staking USDT...",
        staking_cake: "Staking CAKE...",
        enter_amount: "Enter BNB amount",
        enter_usdt_amount: "Enter USDT amount",
        enter_cake_amount: "Enter CAKE amount",
        connect_wallet_to_view: "Connect wallet to view your stakes",
        monitor_stakes: "Monitor your active stakes and rewards",
        status: "Status",
        status_connected: "Connected",
        status_not_connected: "Not Connected",
        address: "Address",
        none: "None",
        contract: "Contract",
        ready: "Ready",
        not_available: "Not available",
        provider: "Provider",
        signer: "Signer",
        available: "Available",
        missing: "Missing",
        no_active_stakes: "No active stakes",
        start_staking_to_see: "Start staking to see your positions here",
        staking_summary: "Staking Summary",
        total_pending: "Total Pending",
        claiming: "Claiming...",
        claim_all: "Claim All",
        connect_wallet_to_stake: "Connect wallet to start staking",
        staking_token: "Staking {{symbol}}...",
        stake_token: "Stake {{symbol}}"
      }
    }
  },
  
  tr: {
    translation: {
      // Navigation
      nav: {
        swap: "Token Takası",
        referral: "Referans Sistemi",
        stake: "Stake Farms",
        join_x: "X'te Bize Katılın",
        join_telegram: "Telegram'a Katılın"
      },
      
      // Wallet
      wallet: {
        connect: "Cüzdan Bağla",
        connecting: "Bağlanıyor...",
        mobile_connect: "Mobil Cüzdan Bağla",
        disconnect: "Bağlantıyı Kes",
        copy_address: "Adresi Kopyala",
        address_copied: "Adres kopyalandı!",
        hermes_balance: "HERMES Bakiyeniz",
        wallet_address: "Cüzdan Adresi",
        smart_contract: "Smart Contract",
        add_token: "Hermes Coin'i Cüzdana Ekle",
        auto_update: "Otomatik güncelleme: Her 5 dakika",
        usd_value: "USD Değeri",
        balance_updated: "Bakiye Güncellendi",
        balance_updated_desc: "HERMES bakiyeniz başarıyla güncellendi",
        update_error: "Güncelleme Hatası",
        update_error_desc: "Bakiye güncellenirken hata oluştu",
        address_copied_desc: "Cüzdan adresi panoya kopyalandı",
        copy_error: "Kopyalama Hatası",
        copy_error_desc: "Adres kopyalanamadı",
        token_added: "Token Eklendi",
        token_added_desc: "HERMES token cüzdanınıza eklendi",
        token_add_error: "Token Eklenemedi",
        token_add_error_desc: "Token cüzdana eklenirken hata oluştu",
        not_connected: "Wallet not connected",
        connect_to_view: "HERMES bakiyesini görmek için cüzdanınızı bağlayın",
        last_update: "Son güncelleme"
      },
      
      // Swap Interface  
      swap: {
        title: "Token Takası",
        from: "Gönderen",
        to: "Alan",
        amount: "Miktar", 
        balance: "Bakiye",
        max: "MAKS",
        slippage: "Kayma",
        price_impact: "Fiyat Etkisi",
        minimum_received: "Minimum Alınacak",
        execute: "Takası Gerçekleştir",
        executing: "Gerçekleştiriliyor...",
        success: "Takas Başarılı!",
        failed: "Takas Başarısız"
      },
      
      // Dashboard
      dashboard: {
        title: "İşlem Paneli",
        total_swaps: "Toplam Takas",
        total_volume: "Toplam Hacim",
        earned_rewards: "Kazanılan Ödüller",
        fee_savings: "Komisyon Tasarrufu"
      },
      
      // Swap Interface Extended
      swap_extended: {
        price_calculation_failed: "Fiyat hesaplama başarısız",
        insufficient_bnb_for_fee: "İşlem ücreti için yetersiz BNB",
        swap_in_progress: "Takas devam ediyor...",
        preparing_transaction: "İşlem hazırlanıyor",
        confirming_transaction: "İşlem onaylanıyor",
        swap_completed: "Takas başarıyla tamamlandı",
        current_rate: "Güncel Kur",
        estimated_gas: "Tahmini Gas",
        total_fee: "Toplam Ücret",
        you_receive: "Alacağınız",
        platform_fee: "Platform Ücreti",
        trading_fee: "İşlem Ücreti",
        hermes_reward: "HERMES Ödülü",
        slippage_tolerance: "Kayma Toleransı",
        hermes_slogan: "Hermes AI 21 DEX tarar ve BNB ücretlerinde %25 tasarruf sağlar!",
        first_token_approval: "İlk token swapı: Önce MAX onay, sonra swap (2 işlem). Gelecek swaplar tek işlem!",
        approval_completed: "MAX onay tamamlandı! Artık bu token ile tüm swaplar tek işlem olacak."
      },
      
      // Rewards
      rewards: {
        title: "Ödül Merkezi",
        claimable: "Talep Edilebilir HERMES",
        claim: "Ödül Talep Et",
        claiming: "Talep Ediliyor...",
        claimed: "Ödüller Talep Edildi!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Mobil Takas Modu",
        fullscreen: "Tam Ekran Modu", 
        exit_fullscreen: "Tam Ekrandan Çık"
      },
      
      // Errors
      errors: {
        wallet_required: "Lütfen cüzdanınızı bağlayın",
        insufficient_balance: "Yetersiz bakiye",
        slippage_too_high: "Kayma toleransı çok yüksek",
        transaction_failed: "İşlem başarısız",
        network_error: "Ağ hatası oluştu"
      },

      // Notifications
      notifications: {
        referral_active: "Referral Aktif! 🎉",
        referral_active_desc: "Referral kod {code} ile swap yapacaksınız. +10,000 HERMES bonus kazanacaksınız!",
        referral_active_wallet_desc: "{code} referansıyla swap yapacaksınız. +10,000 HERMES referrer'a gidecek!",
        price_calculation_error: "Fiyat Hesaplama Hatası",
        price_calculation_error_desc: "Anlık fiyat alınamadı. Lütfen tekrar deneyin.",
        insufficient_bnb: "BNB yetersiz. Gerekli: {amount} BNB (swap + gas rezervi)",
        swap_success_referral: "{fromAmount} {fromSymbol} → {toAmount} {toSymbol} + 110,000 HERMES ödülü! (Referrer: +10,000 HERMES)",
        swap_success_normal: "{fromAmount} {fromSymbol} → {toAmount} {toSymbol} + 100,000 HERMES ödülü!",
        network_connection_error: "Network bağlantı sorunu! BSC ağı ile iletişim kurulamıyor. Lütfen MetaMask'ı kontrol edin ve tekrar deneyin.",
        network_timeout: "BSC network timeout hatası. Birkaç saniye bekleyip tekrar deneyin.",
        transaction_cancelled: "İşlem kullanıcı tarafından iptal edildi.",
        slippage_too_low_hermes: "Slippage tolerance çok düşük. HERMES token için en az %{slippage} slippage önerilir.",
        slippage_too_low_token: "Slippage tolerance çok düşük. Bu token için en az %{slippage} slippage önerilir.",
        connection_restored: "Bağlantı Restored",
        connection_restored_desc: "Internet bağlantısı yeniden kuruldu",
        offline_mode: "Çevrimdışı Mod",
        offline_mode_desc: "Internet bağlantısı yok. Bazı özellikler sınırlı olabilir.",
        mobile_wallet_tip: "En iyi deneyim için cüzdan browserında açın",
        wallet_browser_open: "Cüzdan Browserında Aç"
      },
      
      // Button states
      swapping: "Takas Yapılıyor...",
      calculating: "Hesaplanıyor...",
      selectTokens: "Token Seçin",
      
      // Referral Page
      referral: {
        title: "Sınırsız Referans Sistemi",
        invite_friends_earn: "Arkadaşlarınızı davet edin ve birlikte HERMES ödülleri kazanın",
        your_referral_link: "Referans Bağlantınız",
        invite_with_link: "Arkadaşlarınızı davet etmek için bu bağlantıyı paylaşın",
        referral_link: "Referans Bağlantısı",
        copy_link_old: "Bağlantıyı Kopyala",
        share_link: "Bağlantıyı Paylaş",
        copied: "Bağlantı Kopyalandı!",
        referral_link_copied: "Referans bağlantısı panoya kopyalandı",
        connect_wallet_first: "Referans bağlantınızı almak için cüzdanınızı bağlayın",
        how_it_works: "Nasıl Çalışır",
        step1_title: "Bağlantınızı Paylaşın",
        step1_desc: "Benzersiz referans bağlantınızı arkadaşlarınıza gönderin",
        step2_title: "Arkadaşlar Katılır ve Takas Yapar",
        step2_desc: "Bağlantınızı kullandıklarında ve takas yaptıklarında",
        step3_title: "Ödül Kazanın",
        step3_desc: "Her referans için bonus HERMES token'ları alın",
        referral_stats: "Referans İstatistikleri",
        total_referrals: "Toplam Referanslar",
        referral_volume: "Referans Hacmi",
        earned_bonuses: "Kazanılan Bonuslar",
        // Yeni kapsamlı çeviriler
        unlimited_title: "Sınırsız Referans Sistemi",
        share_unique_link_old: "Benzersiz referans bağlantınızı paylaşın",
        track_earnings: "Kazançlarınızı takip edin ve istediğiniz zaman talep edin",
        influencers_welcome: "Influencer'lar hoş geldiniz — büyük kazanç potansiyeli!",
        unclaimed_hermes: "Talep Edilmemiş HERMES",
        total_claimed: "Toplam Talep Edilen",
        share_to_earn: "Kazanmaya başlamak için bu bağlantıyı paylaşın",
        claim_rewards: "Ödülleri Talep Et",
        claiming: "Talep Ediliyor...",
        rewards_claimed: "Ödüller Talep Edildi!",
        claim_success: "{amount} HERMES token başarıyla talep edildi",
        claim_failed: "Talep Başarısız",
        claim_error: "Ödüller talep edilirken hata oluştu. Lütfen tekrar deneyin.",
        no_unclaimed: "Talep edilecek ödül bulunmuyor",
        real_hermes_rewards: "Gerçek HERMES Ödülleri",
        automatic_tracking: "Otomatik Takip Sistemi",
        referral_explanation: "Hermes AI Referans Sistemi Nasıl Çalışır",
        explanation_intro: "Referans sistemimiz, platformumuza yeni kullanıcı getirmeniz için sizi ödüllendirmek üzere tasarlanmıştır. Detaylı çalışma şekli:",
        step1_detailed: "Benzersiz Bağlantınızı Paylaşın",
        step1_detail_desc: "Her cüzdan adresi benzersiz bir referans bağlantısı alır. Bu bağlantıyı paylaştığınızda, tıklayan ve cüzdanını bağlayan herkes kalıcı olarak sizin referansınız olur.",
        step2_detailed: "Referanslar Takas Yapar",
        step2_detail_desc: "Referanslarınız platformumuzda token takası yaptığında, sistem otomatik olarak bu işlemleri takip eder ve size ödül verir.",
        step3_detailed: "Gerçek HERMES Kazanın",
        step3_detail_desc: "Referanslarınızın yaptığı her takas için 10.000 HERMES token kazanırsınız. Bunlar hazine cüzdanımızdan talep ettiğinizde doğrudan cüzdanınıza gönderilen gerçek token'lardır.",
        step4_detailed: "Manuel Talep Sistemi",
        step4_detail_desc: "Ödüller hesabınızda birikir ve istediğiniz zaman manuel olarak talep edilebilir. Bu size token'larınızı ne zaman alacağınız konusunda kontrol verir ve gas optimizasyonuna yardımcı olur.",
        unlimited_earning: "Sınırsız Kazanç Potansiyeli",
        unlimited_desc: "Kaç kişiyi referans edebileceğiniz veya ne kadar kazanabileceğiniz konusunda limit yoktur. Arkadaşlarınız, aileniz, sosyal medya takipçileriniz veya DeFi ticareti ile ilgilenen herkesle paylaşın.",
        security_note: "Güvenlik ve Şeffaflık",
        security_desc: "Tüm referans takibi blok zincirde ve güvenli veritabanımızda gerçekleşir. Kazançlarınız garantilidir ve blok zincir işlemleri aracılığıyla doğrulanabilir.",
        get_started: "Kazanmaya Başlamaya Hazır mısınız?",
        get_started_desc: "Benzersiz referans bağlantınızı almak ve bugün referans ağınızı oluşturmaya başlamak için yukarıdan cüzdanınızı bağlayın!",
        
        // V4 System specific translations
        generate_code: "Referans Kodu Oluştur",
        generating_code: "Referans Kodu Oluşturuluyor...",
        code_generated: "Referans Kodu Oluşturuldu! 🎉",
        generation_failed: "Oluşturma Başarısız",
        v4_fee_required: "V4 Sistem: 0.0006 BNB ücreti gereklidir. Lütfen işlemi onaylayın.",
        v4_fee_paid: "Kod: {code}. 0.0006 BNB ücreti ödendi. Swap başına 10K HERMES kazanmak için paylaşın!",
        transaction_rejected: "İşlem reddedildi veya yetersiz BNB bakiyesi",
        url_copied: "Kopyalandı! 📋",
        url_copied_desc: "Referans URL'si panoya kopyalandı",
        share_whatsapp: "WhatsApp'ta Paylaş",
        share_twitter: "Twitter'da Paylaş", 
        share_telegram: "Telegram'da Paylaş",
        qr_code: "QR Kod",
        scan_to_join: "Katılmak için tarayın",
        wallet_not_connected: "Wallet Not Connected",
        connect_first: "Referans sistemi için cüzdanınızı bağlayın",
        no_code_yet: "Henüz kod yok",
        generate_first: "Önce referans kodunuzu oluşturun",
        system_v3_title: "HermesSwap V3 Referans Sistemi",
        no_referral_limit: "Referans Limiti Yok",
        invite_unlimited: "İstediğiniz kadar kişi davet edebilirsiniz",
        hermes_per_swap: "10.000 HERMES/Takas",
        earn_per_swap: "Yaptıkları her takastan kazanın",
        realtime_stats: "Gerçek zamanlı istatistikler ve anında ödüller",
        system_features: {
          smart_codes: "Akıllı referans kodları oluşturun",
          enhanced_rewards: "Gelişmiş ödüller: kullanıcılar için 110.000 HERMES + referanslar için 10.000",
          instant_payments: "Swap'lar sırasında anında otomatik ödemeler",
          onchain_tracking: "Zincir üzeri takip ve doğrulama",
          professional_system: "Profesyonel influencer sistemi!"
        },
        
        // Additional system feature descriptions
        smart_referral_codes_desc: "Akıllı referans kodları oluşturun",
        enhanced_rewards_desc: "Gelişmiş ödüller: kullanıcılar için 110.000 HERMES + referanslar için 10.000", 
        instant_payments_desc: "Swap'lar sırasında anında otomatik ödemeler",
        onchain_tracking_desc: "Zincir üzeri takip ve doğrulama",
        professional_influencer_desc: "Profesyonel influencer sistemi!",
      },
      

      
      // Advantages
      advantages: {
        title: "Hermes AI Swap Avantajları",
        bestPrice: "21 DEX'te en iyi fiyat",
        gasSavings: "%25'e kadar BNB gas ücreti tasarrufu",
        instantReward: "Anında 100.000 HERMES ödülü",
        totalSaved: "Toplam tasarruf"
      },
      
      // Passive Income
      passive_income: {
        title: "Hermes Coin ile %100 Pasif Gelir Kazanın",
        description: "Tek yapmanız gereken HERMES Coin'i cüzdanınızda tutmak — sistem sizin için 7/24 çalışır ve otomatik olarak ödeme yapar.",
        ecosystem_title: "Hermes AI ekosistemindeki her eylemde kazanmaya devam ediyorsunuz:",
        earn_swaps: "Her takas işleminden HERMES Coin kazanın",
        earn_buysell: "HERMES Coin'in her alım satımından anında ödüller alın",
        earn_analysis: "Hermes AI platformunda yaptığınız her analiz için HERMES Coin kazanın",
        earn_transfers: "Her token transferinden bile HERMES ile ödüllendirilirsiniz",
        no_effort_title: "Madencilik yok. Stake etme yok. Talep etme yok.",
        no_effort_desc: "Sadece HERMES satın alın, tutun, gerisini sistem halleder.",
        autopilot_earning: "Bu pasif gelir değil — Hermes AI ile desteklenen otopilot kazancıdır."
      },

      // Stake Farm Education Content
      stake_education: {
        main_title: "🌱 Hermes AI Stake Farm — Güvenli Sabit Getirili Pasif Gelir Platformu",
        earn_fixed: "💰 99 günde %81.11 APY kazanın!",
        supported_tokens: "📌 Desteklenen Tokenler: BNB • USDT • CAKE",
        how_it_works: "🔒 Nasıl Çalışır:",
        
        step1_title: "✅ 1. Stake Et:",
        step1_desc1: "Tokenlerinizi tam 99 gün kilitleyin.",
        step1_desc2: "Kazançlar hemen başlar.",
        
        step2_title: "✅ 2. Günlük Ödüller Kazanın:",
        step2_desc1: "Günlük yaklaşık %0.222 oranında getiri birikir (~%81.1 APY).",
        step2_desc2: "Ödüllerinizi 24 saatte bir talep edebilir veya biriktirmelerine izin verebilirsiniz.",
        
        step3_title: "✅ 3. 99 Gün Sonra Unstake:",
        step3_desc: "99 gün sonra tokenlerinizi + tüm birikmiş ödüllerinizi çekin.",
        
        key_rules: "⚠️ Ana Kurallar:",
        
        rule1_title: "🔴 Erken Unstake Yasak:",
        rule1_desc: "Sıkı 99 günlük kilitleme süresi; vade dolmadan çekim yapılamaz.",
        
        rule2_title: "🟡 Talep Etmek Opsiyonel:",
        rule2_desc: "Talep edilmeyen ödüller güvenle birikir; beklerseniz kayıp olmaz.",
        
        rule3_title: "🟢 Bileşik Faiz Yok:",
        rule3_desc: "Faiz sadece anapara üzerinden hesaplanır; ödüller bileşik faiz yapmaz.",
        
        example_title: "📊 Örnek Hesaplama (1000 USDT):",
        example_if: "💎 1000 USDT stake ederseniz:",
        example_daily_detailed: "Günlük kazanç: ~2.22 USDT/gün",
        example_monthly_detailed: "Aylık kazanç (~30 gün): ~66.6 USDT", 
        example_total_rewards: "99 günlük toplam ödül: ~222 USDT",
        example_total_payout: "99. günde toplam ödeme: 1222 USDT (anapara + ödül)",
        
        getting_started: "🚀 Başlangıç:",
        start_step1: "🔹 Cüzdanınızı bağlayın",
        start_step2: "🔹 Tokeninizi seçin (BNB / USDT / CAKE)",
        start_step3: "🔹 Stake edilecek miktarı girin",
        start_step4: "🔹 Stake edin ve hemen kazanmaya başlayın!",
        
        risk_level: "🎯 Risk Seviyesi: Düşük",
        yield_info: "💵 Getiri: 99 günde %22 sabit getiri (~%81.1 APY)",
        duration_info: "⏳ Süre: 99 günlük kilitleme süresi",
        
        bonus_title: "Bonus:",
        bonus_desc1: "Hermes AI Stake Farm tam on-chain şeffaflık ve güvenlik sağlar.",
        bonus_desc2: "Tüm stake ve ödül mekanizmaları denetlenmiş akıllı sözleşmeler tarafından yönetilir ve blockchain üzerinde izlenebilir ve doğrulanabilir.",
        
        // Ana açıklama paragrafı
        main_description: "Hermes AI Stake Farm güvenli ve sabit getirili pasif gelir platformudur. Kullanıcılar tam 99 gün boyunca BNB, USDT veya CAKE stake edebilir ve vade sonunda %22 net getiri kazanabilirler (~günlük %0.222, yaklaşık %81.1 APY'ye eşdeğer). Kazançlar hemen başlar ve kullanıcılar ödülleri her 24 saatte bir talep edebilir veya güvenle biriktirebilirler - bileşik faiz uygulanmaz ve ödüller her zaman sadece anapara üzerinden hesaplanır. Erken unstake kesinlikle yasaktır; fonlar tüm 99 günlük süre boyunca kilitli kalır. Örneğin, 1000 USDT stake etmek günlük yaklaşık 2.22 USDT, aylık 66.6 USDT ve 99 gün boyunca toplamda yaklaşık 222 USDT kazandırır, toplam 1222 USDT ödeme ile sonuçlanır. Başlamak kolaydır: cüzdanınızı bağlayın, stake edilecek token'ı seçin (BNB, USDT veya CAKE), miktarı girin, stake edin ve hemen kazanmaya başlayın. Hermes AI Stake Farm, 99 günlük kilitleme süresi boyunca %22 sabit getiri ile düşük riskli, şeffaf on-chain çözüm sunar.",
        
        // Profesyonel açıklama bölümleri
        professional_intro: "blockchain teknolojisi aracılığıyla güvenli, sabit getirili kazançlar sunan profesyonel bir pasif gelir platformudur. Kullanıcılar BNB, USDT veya CAKE tokenlerini 99 günlük kilitleme süresi için stake edebilir ve vade sonunda garantili %22 net getiri kazanabilirler.",
        how_it_works_title: "Nasıl Çalışır",
        how_it_works_step1: "Cüzdanınızı bağlayın ve bir token seçin",
        how_it_works_step2: "Stake miktarını girin ve işlemi onaylayın",
        how_it_works_step3: "Günlük ~%0.222 ödül kazanın (99 günde %22)",
        how_it_works_step4: "Ödülleri istediğiniz zaman talep edin veya biriktirin",
        how_it_works_step5: "99 gün sonra otomatik ana para iadesi",
        example_returns_title: "Örnek Getiriler",
        example_stake: "Stake: 1.000 USDT",
        example_daily: "Günlük kazanç: ~2.22 USDT",
        example_monthly: "Aylık kazanç: ~66.6 USDT",
        example_total: "99 gün sonra toplam: 1.222 USDT",
        example_profit: "Net kar: 222 USDT (%22)",
        closing_quote: "Matematiksel hassasiyetle şeffaf, zincir üstü staking. Karmaşık bileşik faiz yok — sadece ana yatırımınız üzerinden hesaplanan güvenilir, sabit getiriler."
      },

      // Stake Interface
      stake: {
        farm_pools: "Farm Havuzları",
        my_stakes: "Benim Stakelerim",
        select_token_pool: "Token Havuzu Seç",
        choose_token_staking: "22% APY staking için tokeninizi seçin",
        selected: "Seçildi",
        select: "Seç",
        premium_pool: "Premium Havuz",
        stake_amount: "Stake Miktarı",
        enter_amount: "{symbol} miktar girin",
        balance: "Bakiye",
        max: "MAKS",
        lock_period: "Kilitleme Süresi",
        days: "gün",
        apy: "APY",
        connect_wallet_to_start: "Staking başlatmak için cüzdan bağlayın",
        stake_token: "Stake {symbol}",
        staking_token: "Staking {symbol}...",
        connect_wallet_to_view: "Stakeleri görmek için cüzdanınızı bağlayın",
        monitor_stakes: "Aktif stakeleri takip edin ve ödülleri talep edin",
        no_active_stakes: "Aktif stake bulunamadı",
        start_staking_to_see: "Pozisyonlarınızı burada görmek için staking başlatın",
        staking_summary: "Staking Özeti",
        active_stakes: "Active stakes",
        total_pending: "Toplam Bekleyen",
        claim_all: "Hepsini Talep Et",
        claiming: "Talep Ediliyor...",
        stake_id: "{symbol} Stake #{id}",
        staked: "Staked: {amount} {symbol}",
        status: "Durum",
        unlocked: "Kilitli Değil",
        total_claimed: "Toplam Talep Edilen",
        pending_rewards: "Bekleyen Ödüller",
        stake_date: "Stake Tarihi",
        claim: "Talep Et",
        unstake: "Unstake",
        unstaking: "Unstaking...",
        status_connected: "Bağlandı",
        status_not_connected: "Bağlanmadı",
        address: "Adres",
        contract: "Contract",
        ready: "Hazır",
        not_available: "Mevcut değil",
        provider: "Provider",
        signer: "İmzalayıcı",
        available: "Mevcut",
        missing: "Eksik",
        none: "Yok",
        page_title: "Hermes AI Stake Farm",
        page_subtitle: "Hermes AI Stake Farm ile 99 günde %22 kazanın",
        tab_pools: "Farm Havuzları",
        tab_mystakes: "Stakelerim",
        select_pool_title: "Token Havuzu Seç",
        select_pool_subtitle: "Staking için token seçin"
      }
    }
  },
  
  zh: {
    translation: {
      // Navigation
      nav: {
        swap: "代币兑换",
        referral: "推荐系统",
        about: "关于HermesAI",
        audit: "审计报告", 
        join_x: "在X上加入我们",
        join_telegram: "加入Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "连接钱包",
        connecting: "连接中...",
        mobile_connect: "连接移动钱包",
        disconnect: "断开连接",
        copy_address: "复制地址",
        address_copied: "地址已复制！"
      },
      
      // Swap Interface
      swap: {
        title: "代币兑换",
        from: "发送",
        to: "接收",
        amount: "数量",
        balance: "余额", 
        max: "最大",
        slippage: "滑点",
        price_impact: "价格影响",
        minimum_received: "最少接收",
        execute: "执行兑换", 
        executing: "执行中...",
        success: "兑换成功！",
        failed: "兑换失败"
      },
      
      // Dashboard
      dashboard: {
        title: "交易面板",
        total_swaps: "总兑换次数",
        total_volume: "总交易量",
        earned_rewards: "获得奖励",
        fee_savings: "手续费节省"
      },
      
      // Rewards
      rewards: {
        title: "奖励中心",
        claimable: "可领取HERMES",
        claim: "领取奖励",
        claiming: "领取中...",
        claimed: "奖励已领取！"
      },
      
      // Mobile
      mobile: {
        swap_mode: "移动兑换模式",
        fullscreen: "全屏模式",
        exit_fullscreen: "退出全屏"
      },
      
      // Errors
      errors: {
        wallet_required: "请连接您的钱包",
        insufficient_balance: "余额不足",
        slippage_too_high: "滑点容忍度过高", 
        transaction_failed: "交易失败",
        network_error: "网络错误"
      },
      
      // Referral Page
      referral: {
        copy_link: "复制链接",
        share_unique_link: "在社交媒体分享",
        automatic_tracking: "自动支付活跃",
        share_to_earn: "分享您的推荐链接开始赚取奖励！",
        real_hermes_rewards: "真实HERMES奖励",
        total_referrals: "总推荐数",
        swaps_by_referrals: "推荐兑换",
        system_v3_title: "HermesSwap V3 推荐系统",
        no_referral_limit: "无推荐限制",
        invite_unlimited: "您可以邀请任意多的人",
        hermes_per_swap: "10,000 HERMES/交易",
        earn_per_swap: "从他们的每笔交易中赚取",
        realtime_stats: "实时统计和即时奖励",
        
        // System feature descriptions
        system_features: {
          smart_codes: "生成智能推荐代码",
          enhanced_rewards: "增强奖励：用户110,000 HERMES + 推荐人10,000",
          instant_payments: "兑换期间即时自动支付",
          onchain_tracking: "链上跟踪和验证",
          professional_system: "专业影响者系统！"
        },
        
        smart_referral_codes_desc: "生成智能推荐代码",
        enhanced_rewards_desc: "增强奖励：用户110,000 HERMES + 推荐人10,000",
        instant_payments_desc: "兑换期间即时自动支付",
        onchain_tracking_desc: "链上跟踪和验证",
        professional_influencer_desc: "专业影响者系统！"
      },
      
      // Swap Interface Extended
      swap_extended: {
        hermes_slogan: "Hermes AI 扫描 21 个 DEX 并节省 25% BNB 手续费！"
      },

      // Stake Farm Education Content
      stake_education: {
        main_title: "🌱 Hermes AI 质押农场 — 安全固定收益被动收入平台",
        earn_fixed: "💰 99天内赚取22%净收益！",
        supported_tokens: "📌 支持代币：BNB • USDT • CAKE",
        how_it_works: "🔒 运作方式：",
        
        step1_title: "✅ 1. 质押：",
        step1_desc1: "锁定您的代币整整99天。",
        step1_desc2: "收益立即开始。",
        
        step2_title: "✅ 2. 赚取每日奖励：",
        step2_desc1: "每日约0.222%的收益率累积（约81.1% APY）。",
        step2_desc2: "您可以每24小时申领奖励或让其累积。",
        
        step3_title: "✅ 3. 99天后解除质押：",
        step3_desc: "99天后，提取您的代币+全部累积奖励。",
        
        key_rules: "⚠️ 关键规则：",
        
        rule1_title: "🔴 禁止提前解除质押：",
        rule1_desc: "严格的99天锁定期；到期前不允许提取。",
        
        rule2_title: "🟡 申领是可选的：",
        rule2_desc: "未申领的奖励安全累积；等待不会损失。",
        
        rule3_title: "🟢 无复利：",
        rule3_desc: "利息仅按本金计算；奖励不会复利。",
        
        example_title: "📊 计算示例（1000 USDT）：",
        example_if: "💎 如果您质押1000 USDT：",
        example_daily: "每日收益：约2.22 USDT/天",
        example_monthly: "每月收益（约30天）：约66.6 USDT",
        example_total_rewards: "99天总奖励：约222 USDT",
        example_total_payout: "第99天总支付：1222 USDT（本金+奖励）",
        
        getting_started: "🚀 开始使用：",
        start_step1: "🔹 连接您的钱包",
        start_step2: "🔹 选择您的代币（BNB / USDT / CAKE）",
        start_step3: "🔹 输入要质押的数量",
        start_step4: "🔹 质押并立即开始赚取！",
        
        risk_level: "🎯 风险级别：低",
        yield_info: "💵 收益：99天内22%固定收益（约81.1% APY）",
        duration_info: "⏳ 期限：99天锁定期",
        
        bonus_title: "奖励：",
        bonus_desc1: "Hermes AI质押农场确保完全链上透明度和安全性。",
        bonus_desc2: "所有质押和奖励机制由经过审计的智能合约处理，可在区块链上跟踪和验证。"
      }
    }
  },
  
  es: {
    translation: {
      // Navigation
      nav: {
        swap: "Intercambio de Tokens",
        referral: "Sistema de Referidos",
        about: "Acerca de HermesAI",
        audit: "Informe de Auditoría",
        join_x: "Únete en X", 
        join_telegram: "Únete a Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "Conectar Billetera",
        connecting: "Conectando...",
        mobile_connect: "Conectar Billetera Móvil",
        disconnect: "Desconectar",
        copy_address: "Copiar Dirección",
        address_copied: "¡Dirección copiada!"
      },
      
      // Swap Interface
      swap: {
        title: "Intercambio de Tokens",
        from: "Desde",
        to: "Hacia",
        amount: "Cantidad",
        balance: "Saldo",
        max: "MÁX",
        slippage: "Deslizamiento",
        price_impact: "Impacto en el Precio",
        minimum_received: "Mínimo Recibido",
        execute: "Ejecutar Intercambio",
        executing: "Ejecutando...",
        success: "¡Intercambio Exitoso!",
        failed: "Intercambio Fallido"
      },
      
      // Dashboard
      dashboard: {
        title: "Panel de Trading",
        total_swaps: "Intercambios Totales",
        total_volume: "Volumen Total", 
        earned_rewards: "Recompensas Ganadas",
        fee_savings: "Ahorro en Comisiones"
      },
      
      // Rewards
      rewards: {
        title: "Centro de Recompensas",
        claimable: "HERMES Reclamable",
        claim: "Reclamar Recompensas",
        claiming: "Reclamando...",
        claimed: "¡Recompensas Reclamadas!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Modo de Intercambio Móvil",
        fullscreen: "Modo Pantalla Completa",
        exit_fullscreen: "Salir de Pantalla Completa"
      },
      
      // Errors
      errors: {
        wallet_required: "Por favor conecta tu billetera",
        insufficient_balance: "Saldo insuficiente",
        slippage_too_high: "Tolerancia de deslizamiento muy alta",
        transaction_failed: "Transacción fallida",
        network_error: "Error de red"
      },
      
      // Referral Page
      referral: {
        copy_link: "Copiar Enlace",
        share_unique_link: "Compartir en Redes Sociales",
        automatic_tracking: "Pago Automático Activo",
        share_to_earn: "¡Comparte tu enlace de referido para comenzar a ganar recompensas!",
        real_hermes_rewards: "Recompensas HERMES Reales",
        total_referrals: "Total de Referidos",
        swaps_by_referrals: "Intercambios por Referidos",
        system_v3_title: "Sistema de Referidos HermesSwap V3",
        no_referral_limit: "Sin Límite de Referidos",
        invite_unlimited: "Puedes invitar a tantas personas como quieras",
        hermes_per_swap: "10,000 HERMES/Intercambio",
        earn_per_swap: "Gana de cada intercambio que hagan",
        realtime_stats: "Estadísticas en tiempo real y recompensas instantáneas",
        
        // System feature descriptions
        system_features: {
          smart_codes: "Generar códigos de referido inteligentes",
          enhanced_rewards: "Recompensas mejoradas: 110.000 HERMES para usuarios + 10.000 para referidores",
          instant_payments: "Pagos automáticos instantáneos durante intercambios",
          onchain_tracking: "Seguimiento y verificación on-chain",
          professional_system: "¡Sistema de influencer profesional!"
        },
        
        smart_referral_codes_desc: "Generar códigos de referido inteligentes",
        enhanced_rewards_desc: "Recompensas mejoradas: 110.000 HERMES para usuarios + 10.000 para referidores",
        instant_payments_desc: "Pagos automáticos instantáneos durante intercambios",
        onchain_tracking_desc: "Seguimiento y verificación on-chain",
        professional_influencer_desc: "¡Sistema de influencer profesional!"
      },
      
      // Swap Interface Extended
      swap_extended: {
        hermes_slogan: "¡Hermes AI escanea 21 DEXs y ahorra 25% en comisiones BNB!"
      }
    }
  },
  
  fr: {
    translation: {
      // Navigation
      nav: {
        swap: "Échange de Tokens",
        referral: "Système de Parrainage",
        about: "À propos d'HermesAI",
        audit: "Rapport d'Audit",
        join_x: "Rejoignez-nous sur X",
        join_telegram: "Rejoindre Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "Connecter le Portefeuille",
        connecting: "Connexion...",
        mobile_connect: "Connecter Portefeuille Mobile",
        disconnect: "Déconnecter",
        copy_address: "Copier l'Adresse",
        address_copied: "Adresse copiée !"
      },
      
      // Swap Interface
      swap: {
        title: "Échange de Tokens",
        from: "De",
        to: "Vers",
        amount: "Montant",
        balance: "Solde",
        max: "MAX",
        slippage: "Glissement",
        price_impact: "Impact sur le Prix",
        minimum_received: "Minimum Reçu",
        execute: "Exécuter l'Échange",
        executing: "Exécution...",
        success: "Échange Réussi !",
        failed: "Échange Échoué"
      },
      
      // Dashboard
      dashboard: {
        title: "Tableau de Trading",
        total_swaps: "Échanges Totaux",
        total_volume: "Volume Total",
        earned_rewards: "Récompenses Gagnées",
        fee_savings: "Économies de Frais"
      },
      
      // Rewards
      rewards: {
        title: "Centre de Récompenses",
        claimable: "HERMES Réclamable",
        claim: "Réclamer les Récompenses",
        claiming: "Réclamation...",
        claimed: "Récompenses Réclamées !"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Mode d'Échange Mobile",
        fullscreen: "Mode Plein Écran",
        exit_fullscreen: "Quitter le Plein Écran"
      },
      
      // Errors
      errors: {
        wallet_required: "Veuillez connecter votre portefeuille",
        insufficient_balance: "Solde insuffisant",
        slippage_too_high: "Tolérance de glissement trop élevée",
        transaction_failed: "Transaction échouée",
        network_error: "Erreur de réseau"
      },
      
      // Referral Page
      referral: {
        copy_link: "Copier le Lien",
        share_unique_link: "Partager sur les Réseaux Sociaux",
        automatic_tracking: "Paiement Automatique Actif",
        share_to_earn: "Partagez votre lien de parrainage pour commencer à gagner des récompenses!",
        real_hermes_rewards: "Vraies Récompenses HERMES",
        total_referrals: "Total des Parrainages",
        swaps_by_referrals: "Échanges par Parrainages",
        system_v3_title: "Système de Parrainage HermesSwap V3",
        no_referral_limit: "Aucune Limite de Parrainage",
        invite_unlimited: "Vous pouvez inviter autant de personnes que vous voulez",
        hermes_per_swap: "10 000 HERMES/Échange",
        earn_per_swap: "Gagnez de chaque échange qu'ils font",
        realtime_stats: "Statistiques en temps réel et récompenses instantanées",
        
        // System feature descriptions
        system_features: {
          smart_codes: "Générer des codes de parrainage intelligents",
          enhanced_rewards: "Récompenses améliorées : 110 000 HERMES pour les utilisateurs + 10 000 pour les parrains",
          instant_payments: "Paiements automatiques instantanés pendant les échanges",
          onchain_tracking: "Suivi et vérification on-chain",
          professional_system: "Système d'influenceur professionnel !"
        },
        
        smart_referral_codes_desc: "Générer des codes de parrainage intelligents",
        enhanced_rewards_desc: "Récompenses améliorées : 110 000 HERMES pour les utilisateurs + 10 000 pour les parrains",
        instant_payments_desc: "Paiements automatiques instantanés pendant les échanges",
        onchain_tracking_desc: "Suivi et vérification on-chain",
        professional_influencer_desc: "Système d'influenceur professionnel !"
      }
    }
  },
  
  de: {
    translation: {
      // Navigation
      nav: {
        swap: "Token-Tausch",
        referral: "Empfehlungssystem",
        about: "Über HermesAI",
        audit: "Prüfbericht",
        join_x: "Begleiten Sie uns auf X",
        join_telegram: "Telegram beitreten"
      },
      
      // Wallet
      wallet: {
        connect: "Wallet Verbinden",
        connecting: "Verbinde...",
        mobile_connect: "Mobile Wallet Verbinden",
        disconnect: "Trennen",
        copy_address: "Adresse Kopieren",
        address_copied: "Adresse kopiert!"
      },
      
      // Swap Interface
      swap: {
        title: "Token-Tausch",
        from: "Von",
        to: "Zu",
        amount: "Betrag",
        balance: "Guthaben",
        max: "MAX",
        slippage: "Schlupf",
        price_impact: "Preisauswirkung",
        minimum_received: "Mindestens Erhalten",
        execute: "Tausch Ausführen",
        executing: "Ausführung...",
        success: "Tausch Erfolgreich!",
        failed: "Tausch Fehlgeschlagen"
      },
      
      // Dashboard
      dashboard: {
        title: "Trading-Dashboard",
        total_swaps: "Gesamte Tauschvorgänge",
        total_volume: "Gesamtvolumen",
        earned_rewards: "Verdiente Belohnungen",
        fee_savings: "Gebührenersparnis"
      },
      
      // Rewards
      rewards: {
        title: "Belohnungszentrum",
        claimable: "Beanspruchbare HERMES",
        claim: "Belohnungen Beanspruchen",
        claiming: "Beanspruche...",
        claimed: "Belohnungen Beansprucht!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Mobiler Tausch-Modus",
        fullscreen: "Vollbildmodus",
        exit_fullscreen: "Vollbild Verlassen"
      },
      
      // Errors
      errors: {
        wallet_required: "Bitte verbinden Sie Ihre Wallet",
        insufficient_balance: "Unzureichendes Guthaben",
        slippage_too_high: "Schlupftoleranz zu hoch",
        transaction_failed: "Transaktion fehlgeschlagen",
        network_error: "Netzwerkfehler aufgetreten"
      },
      
      // Referral Page
      referral: {
        copy_link: "Link Kopieren",
        share_unique_link: "In Sozialen Medien Teilen",
        automatic_tracking: "Automatische Zahlung Aktiv",
        share_to_earn: "Teilen Sie Ihren Empfehlungslink, um Belohnungen zu verdienen!",
        real_hermes_rewards: "Echte HERMES Belohnungen",
        total_referrals: "Gesamte Empfehlungen",
        swaps_by_referrals: "Tauschvorgänge durch Empfehlungen",
        system_v3_title: "HermesSwap V3 Empfehlungssystem",
        no_referral_limit: "Keine Empfehlungsgrenze",
        invite_unlimited: "Sie können so viele Personen einladen, wie Sie möchten",
        hermes_per_swap: "10.000 HERMES/Tausch",
        earn_per_swap: "Verdienen Sie aus jedem Tausch, den sie machen",
        realtime_stats: "Echtzeitstatistiken und sofortige Belohnungen",
        
        // System feature descriptions
        system_features: {
          smart_codes: "Intelligente Empfehlungscodes generieren",
          enhanced_rewards: "Verbesserte Belohnungen: 110.000 HERMES für Benutzer + 10.000 für Empfehler",
          instant_payments: "Sofortige automatische Zahlungen während Tauschvorgängen",
          onchain_tracking: "On-Chain-Verfolgung und Verifizierung",
          professional_system: "Professionelles Influencer-System!"
        },
        
        smart_referral_codes_desc: "Intelligente Empfehlungscodes generieren",
        enhanced_rewards_desc: "Verbesserte Belohnungen: 110.000 HERMES für Benutzer + 10.000 für Empfehler",
        instant_payments_desc: "Sofortige automatische Zahlungen während Tauschvorgängen",
        onchain_tracking_desc: "On-Chain-Verfolgung und Verifizierung",
        professional_influencer_desc: "Professionelles Influencer-System!"
      }
    }
  },
  
  hi: {
    translation: {
      // Navigation
      nav: {
        swap: "टोकन स्वैप",
        referral: "रेफ़रल सिस्टम",
        about: "HermesAI के बारे में",
        audit: "ऑडिट रिपोर्ट",
        join_x: "X पर हमसे जुड़ें",
        join_telegram: "टेलीग्राम से जुड़ें"
      },
      
      // Wallet
      wallet: {
        connect: "वॉलेट कनेक्ट करें",
        connecting: "कनेक्ट हो रहा है...",
        mobile_connect: "मोबाइल वॉलेट कनेक्ट करें",
        disconnect: "डिस्कनेक्ट करें",
        copy_address: "पता कॉपी करें",
        address_copied: "पता कॉपी हो गया!"
      },
      
      // Swap Interface
      swap: {
        title: "टोकन स्वैप",
        from: "से",
        to: "को",
        amount: "मात्रा",
        balance: "शेष राशि",
        max: "अधिकतम",
        slippage: "स्लिपेज",
        price_impact: "मूल्य प्रभाव",
        minimum_received: "न्यूनतम प्राप्त",
        execute: "स्वैप निष्पादित करें",
        executing: "निष्पादित हो रहा है...",
        success: "स्वैप सफल!",
        failed: "स्वैप असफल"
      },
      
      // Dashboard
      dashboard: {
        title: "ट्रेडिंग डैशबोर्ड",
        total_swaps: "कुल स्वैप",
        total_volume: "कुल वॉल्यूम",
        earned_rewards: "अर्जित पुरस्कार",
        fee_savings: "शुल्क बचत"
      },
      
      // Rewards
      rewards: {
        title: "पुरस्कार केंद्र",
        claimable: "दावा करने योग्य HERMES",
        claim: "पुरस्कार दावा करें",
        claiming: "दावा कर रहे हैं...",
        claimed: "पुरस्कार दावा किए गए!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "मोबाइल स्वैप मोड",
        fullscreen: "फुलस्क्रीन मोड",
        exit_fullscreen: "फुलस्क्रीन से बाहर निकलें"
      },
      
      // Errors
      errors: {
        wallet_required: "कृपया अपना वॉलेट कनेक्ट करें",
        insufficient_balance: "अपर्याप्त शेष राशि",
        slippage_too_high: "स्लिपेज सहनशीलता बहुत अधिक",
        transaction_failed: "लेनदेन असफल",
        network_error: "नेटवर्क त्रुटि हुई"
      },
      
      // Referral Page
      referral: {
        copy_link: "लिंक कॉपी करें",
        share_unique_link: "सोशल मीडिया पर साझा करें",
        automatic_tracking: "स्वचालित भुगतान सक्रिय",
        share_to_earn: "पुरस्कार कमाना शुरू करने के लिए अपना रेफरल लिंक साझा करें!",
        real_hermes_rewards: "वास्तविक HERMES पुरस्कार",
        total_referrals: "कुल रेफरल",
        swaps_by_referrals: "रेफरल द्वारा स्वैप",
        system_v3_title: "HermesSwap V3 रेफरल सिस्टम",
        no_referral_limit: "कोई रेफरल सीमा नहीं",
        invite_unlimited: "आप जितने चाहें उतने लोगों को आमंत्रित कर सकते हैं",
        hermes_per_swap: "10,000 HERMES/स्वैप",
        earn_per_swap: "उनके हर स्वैप से कमाएं",
        realtime_stats: "रीयल-टाइम आंकड़े और तत्काल पुरस्कार",
        
        // System feature descriptions
        system_features: {
          smart_codes: "स्मार्ट रेफरल कोड जेनरेट करें",
          enhanced_rewards: "बेहतर पुरस्कार: उपयोगकर्ताओं के लिए 110,000 HERMES + रेफरर के लिए 10,000",
          instant_payments: "स्वैप के दौरान तत्काल स्वचालित भुगतान",
          onchain_tracking: "ऑन-चेन ट्रैकिंग और सत्यापन",
          professional_system: "पेशेवर प्रभावशाली सिस्टम!"
        },
        
        smart_referral_codes_desc: "स्मार्ट रेफरल कोड जेनरेट करें",
        enhanced_rewards_desc: "बेहतर पुरस्कार: उपयोगकर्ताओं के लिए 110,000 HERMES + रेफरर के लिए 10,000",
        instant_payments_desc: "स्वैप के दौरान तत्काल स्वचालित भुगतान",
        onchain_tracking_desc: "ऑन-चेन ट्रैकिंग और सत्यापन",
        professional_influencer_desc: "पेशेवर प्रभावशाली सिस्टम!"
      }
    }
  },
  
  it: {
    translation: {
      // Navigation
      nav: {
        swap: "Scambio Token",
        referral: "Sistema di Referral",
        about: "Informazioni su HermesAI",
        audit: "Rapporto di Audit",
        join_x: "Unisciti a noi su X",
        join_telegram: "Unisciti a Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "Connetti Wallet",
        connecting: "Connessione...",
        mobile_connect: "Connetti Wallet Mobile",
        disconnect: "Disconnetti",
        copy_address: "Copia Indirizzo",
        address_copied: "Indirizzo copiato!"
      },
      
      // Swap Interface
      swap: {
        title: "Scambio Token",
        from: "Da",
        to: "A",
        amount: "Importo",
        balance: "Saldo",
        max: "MAX",
        slippage: "Slittamento",
        price_impact: "Impatto Prezzo",
        minimum_received: "Minimo Ricevuto",
        execute: "Esegui Scambio",
        executing: "Esecuzione...",
        success: "Scambio Riuscito!",
        failed: "Scambio Fallito"
      },
      
      // Dashboard
      dashboard: {
        title: "Dashboard Trading",
        total_swaps: "Scambi Totali",
        total_volume: "Volume Totale",
        earned_rewards: "Ricompense Guadagnate",
        fee_savings: "Risparmio Commissioni"
      },
      
      // Rewards
      rewards: {
        title: "Centro Ricompense",
        claimable: "HERMES Richiedibili",
        claim: "Richiedi Ricompense",
        claiming: "Richiedendo...",
        claimed: "Ricompense Richieste!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Modalità Scambio Mobile",
        fullscreen: "Modalità Schermo Intero",
        exit_fullscreen: "Esci da Schermo Intero"
      },
      
      // Errors
      errors: {
        wallet_required: "Perfavore connetti il tuo wallet",
        insufficient_balance: "Saldo insufficiente",
        slippage_too_high: "Tolleranza slittamento troppo alta",
        transaction_failed: "Transazione fallita",
        network_error: "Errore di rete"
      },
      
      // Referral Page
      referral: {
        copy_link: "Copia Link",
        share_unique_link: "Condividi sui Social Media",
        automatic_tracking: "Pagamento Automatico Attivo",
        share_to_earn: "Condividi il tuo link di referral per iniziare a guadagnare ricompense!",
        real_hermes_rewards: "Ricompense HERMES Reali",
        total_referrals: "Referral Totali",
        swaps_by_referrals: "Scambi da Referral",
        system_v3_title: "Sistema di Referral HermesSwap V3",
        no_referral_limit: "Nessun Limite di Referral",
        invite_unlimited: "Puoi invitare quante persone vuoi",
        hermes_per_swap: "10.000 HERMES/Scambio",
        earn_per_swap: "Guadagna da ogni scambio che fanno",
        realtime_stats: "Statistiche in tempo reale e ricompense istantanee",
        
        // System feature descriptions
        system_features: {
          smart_codes: "Genera codici referral intelligenti",
          enhanced_rewards: "Ricompense migliorate: 110.000 HERMES per utenti + 10.000 per referrer",
          instant_payments: "Pagamenti automatici istantanei durante gli scambi",
          onchain_tracking: "Tracciamento e verifica on-chain",
          professional_system: "Sistema influencer professionale!"
        },
        
        smart_referral_codes_desc: "Genera codici referral intelligenti",
        enhanced_rewards_desc: "Ricompense migliorate: 110.000 HERMES per utenti + 10.000 per referrer",
        instant_payments_desc: "Pagamenti automatici istantanei durante gli scambi",
        onchain_tracking_desc: "Tracciamento e verifica on-chain",
        professional_influencer_desc: "Sistema influencer professionale!"
      }
    }
  },
  
  ja: {
    translation: {
      // Navigation
      nav: {
        swap: "トークンスワップ",
        referral: "紹介システム",
        about: "HermesAIについて",
        audit: "監査レポート",
        join_x: "Xで参加",
        join_telegram: "Telegramに参加"
      },
      
      // Wallet
      wallet: {
        connect: "ウォレット接続",
        connecting: "接続中...",
        mobile_connect: "モバイルウォレット接続",
        disconnect: "切断",
        copy_address: "アドレスをコピー",
        address_copied: "アドレスがコピーされました！"
      },
      
      // Swap Interface
      swap: {
        title: "トークンスワップ",
        from: "送信元",
        to: "送信先",
        amount: "金額",
        balance: "残高",
        max: "最大",
        slippage: "スリッページ",
        price_impact: "価格影響",
        minimum_received: "最小受信量",
        execute: "スワップ実行",
        executing: "実行中...",
        success: "スワップ成功！",
        failed: "スワップ失敗"
      },
      
      // Dashboard
      dashboard: {
        title: "トレーディングダッシュボード",
        total_swaps: "総スワップ数",
        total_volume: "総取引量",
        earned_rewards: "獲得報酬",
        fee_savings: "手数料節約"
      },
      
      // Rewards
      rewards: {
        title: "報酬センター",
        claimable: "請求可能HERMES",
        claim: "報酬を請求",
        claiming: "請求中...",
        claimed: "報酬を請求しました！"
      },
      
      // Mobile
      mobile: {
        swap_mode: "モバイルスワップモード",
        fullscreen: "フルスクリーンモード",
        exit_fullscreen: "フルスクリーン終了"
      },
      
      // Errors
      errors: {
        wallet_required: "ウォレットを接続してください",
        insufficient_balance: "残高不足",
        slippage_too_high: "スリッページ許容範囲が高すぎます",
        transaction_failed: "取引失敗",
        network_error: "ネットワークエラーが発生しました"
      },
      
      // Referral Page
      referral: {
        copy_link: "リンクをコピー",
        share_unique_link: "ソーシャルメディアで共有",
        automatic_tracking: "自動支払いアクティブ",
        share_to_earn: "報酬を得るためにあなたの紹介リンクを共有してください！",
        real_hermes_rewards: "本物のHERMES報酬",
        total_referrals: "総紹介数",
        swaps_by_referrals: "紹介によるスワップ",
        system_v3_title: "HermesSwap V3 紹介システム",
        no_referral_limit: "紹介制限なし",
        invite_unlimited: "何人でも招待できます",
        hermes_per_swap: "10,000 HERMES/スワップ",
        earn_per_swap: "彼らのスワップから稼ぐ",
        realtime_stats: "リアルタイム統計と即座の報酬",
        
        // System feature descriptions
        system_features: {
          smart_codes: "スマート紹介コードを生成",
          enhanced_rewards: "拡張報酬: ユーザーに110,000 HERMES + 紹介者に10,000",
          instant_payments: "スワップ中の即座の自動支払い",
          onchain_tracking: "オンチェーン追跡と検証",
          professional_system: "プロフェッショナルインフルエンサーシステム！"
        },
        
        smart_referral_codes_desc: "スマート紹介コードを生成",
        enhanced_rewards_desc: "拡張報酬: ユーザーに110,000 HERMES + 紹介者に10,000",
        instant_payments_desc: "スワップ中の即座の自動支払い",
        onchain_tracking_desc: "オンチェーン追跡と検証",
        professional_influencer_desc: "プロフェッショナルインフルエンサーシステム！"
      }
    }
  },
  
  pt: {
    translation: {
      // Navigation
      nav: {
        swap: "Troca de Tokens",
        referral: "Sistema de Indicação",
        about: "Sobre HermesAI",
        audit: "Relatório de Auditoria",
        join_x: "Junte-se a nós no X",
        join_telegram: "Entrar no Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "Conectar Carteira",
        connecting: "Conectando...",
        mobile_connect: "Conectar Carteira Móvel",
        disconnect: "Desconectar",
        copy_address: "Copiar Endereço",
        address_copied: "Endereço copiado!"
      },
      
      // Swap Interface
      swap: {
        title: "Troca de Tokens",
        from: "De",
        to: "Para",
        amount: "Quantidade",
        balance: "Saldo",
        max: "MÁX",
        slippage: "Deslizamento",
        price_impact: "Impacto no Preço",
        minimum_received: "Mínimo Recebido",
        execute: "Executar Troca",
        executing: "Executando...",
        success: "Troca Bem-sucedida!",
        failed: "Troca Falhada"
      },
      
      // Dashboard
      dashboard: {
        title: "Dashboard de Trading",
        total_swaps: "Total de Trocas",
        total_volume: "Volume Total",
        earned_rewards: "Recompensas Ganhas",
        fee_savings: "Economia de Taxas"
      },
      
      // Rewards
      rewards: {
        title: "Centro de Recompensas",
        claimable: "HERMES Reivindicável",
        claim: "Reivindicar Recompensas",
        claiming: "Reivindicando...",
        claimed: "Recompensas Reivindicadas!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Modo de Troca Móvel",
        fullscreen: "Modo Tela Cheia",
        exit_fullscreen: "Sair da Tela Cheia"
      },
      
      // Errors
      errors: {
        wallet_required: "Por favor conecte sua carteira",
        insufficient_balance: "Saldo insuficiente",
        slippage_too_high: "Tolerância de deslizamento muito alta",
        transaction_failed: "Transação falhada",
        network_error: "Erro de rede ocorreu"
      },
      
      // Referral Page
      referral: {
        copy_link: "Copiar Link",
        share_unique_link: "Compartilhar nas Redes Sociais",
        automatic_tracking: "Pagamento Automático Ativo",
        share_to_earn: "Compartilhe seu link de indicação para começar a ganhar recompensas!",
        real_hermes_rewards: "Recompensas HERMES Reais",
        total_referrals: "Total de Indicações",
        swaps_by_referrals: "Trocas por Indicações",
        system_v3_title: "Sistema de Indicação HermesSwap V3",
        no_referral_limit: "Sem Limite de Indicação",
        invite_unlimited: "Você pode convidar quantas pessoas quiser",
        hermes_per_swap: "10.000 HERMES/Troca",
        earn_per_swap: "Ganhe de cada troca que eles fazem",
        realtime_stats: "Estatísticas em tempo real e recompensas instantâneas",
        
        // System feature descriptions
        system_features: {
          smart_codes: "Gerar códigos de indicação inteligentes",
          enhanced_rewards: "Recompensas aprimoradas: 110.000 HERMES para usuários + 10.000 para indicadores",
          instant_payments: "Pagamentos automáticos instantâneos durante as trocas",
          onchain_tracking: "Rastreamento e verificação on-chain",
          professional_system: "Sistema de influenciador profissional!"
        },
        
        smart_referral_codes_desc: "Gerar códigos de indicação inteligentes",
        enhanced_rewards_desc: "Recompensas aprimoradas: 110.000 HERMES para usuários + 10.000 para indicadores",
        instant_payments_desc: "Pagamentos automáticos instantâneos durante as trocas",
        onchain_tracking_desc: "Rastreamento e verificação on-chain",
        professional_influencer_desc: "Sistema de influenciador profissional!"
      }
    }
  },
  
  ru: {
    translation: {
      // Navigation
      nav: {
        swap: "Обмен Токенов",
        referral: "Реферальная Система",
        about: "О HermesAI",
        audit: "Отчёт Аудита",
        join_x: "Присоединиться в X",
        join_telegram: "Присоединиться к Telegram"
      },
      
      // Wallet
      wallet: {
        connect: "Подключить Кошелёк",
        connecting: "Подключение...",
        mobile_connect: "Подключить Мобильный Кошелёк",
        disconnect: "Отключить",
        copy_address: "Копировать Адрес",
        address_copied: "Адрес скопирован!"
      },
      
      // Swap Interface
      swap: {
        title: "Обмен Токенов",
        from: "От",
        to: "К",
        amount: "Количество",
        balance: "Баланс",
        max: "МАКС",
        slippage: "Проскальзывание",
        price_impact: "Влияние на Цену",
        minimum_received: "Минимум Получено",
        execute: "Выполнить Обмен",
        executing: "Выполнение...",
        success: "Обмен Успешен!",
        failed: "Обмен Неудачен"
      },
      
      // Dashboard
      dashboard: {
        title: "Торговая Панель",
        total_swaps: "Всего Обменов",
        total_volume: "Общий Объём",
        earned_rewards: "Заработанные Награды",
        fee_savings: "Экономия Комиссий"
      },
      
      // Rewards
      rewards: {
        title: "Центр Наград",
        claimable: "Доступные HERMES",
        claim: "Получить Награды",
        claiming: "Получение...",
        claimed: "Награды Получены!"
      },
      
      // Mobile
      mobile: {
        swap_mode: "Мобильный Режим Обмена",
        fullscreen: "Полноэкранный Режим",
        exit_fullscreen: "Выйти из Полноэкранного Режима"
      },
      
      // Errors
      errors: {
        wallet_required: "Пожалуйста, подключите ваш кошелёк",
        insufficient_balance: "Недостаточный баланс",
        slippage_too_high: "Допустимое проскальзывание слишком высокое",
        transaction_failed: "Транзакция неудачна",
        network_error: "Произошла ошибка сети"
      },
      
      // Referral Page
      referral: {
        copy_link: "Копировать Ссылку",
        share_unique_link: "Поделиться в Соцсетях",
        automatic_tracking: "Автоматическая Оплата Активна",
        share_to_earn: "Поделитесь своей реферальной ссылкой, чтобы начать зарабатывать награды!",
        real_hermes_rewards: "Настоящие Награды HERMES",
        total_referrals: "Всего Рефералов",
        swaps_by_referrals: "Обмены от Рефералов",
        system_v3_title: "Реферальная Система HermesSwap V3",
        no_referral_limit: "Без Лимита Рефералов",
        invite_unlimited: "Вы можете пригласить сколько угодно людей",
        hermes_per_swap: "10.000 HERMES/Обмен",
        earn_per_swap: "Зарабатывайте с каждого их обмена",
        realtime_stats: "Статистика в реальном времени и мгновенные награды",
        
        // System feature descriptions
        system_features: {
          smart_codes: "Генерировать умные реферальные коды",
          enhanced_rewards: "Улучшенные награды: 110.000 HERMES для пользователей + 10.000 для рефералов",
          instant_payments: "Мгновенные автоматические платежи во время обменов",
          onchain_tracking: "Отслеживание и проверка в блокчейне",
          professional_system: "Профессиональная система влиятельных лиц!"
        },
        
        smart_referral_codes_desc: "Генерировать умные реферальные коды",
        enhanced_rewards_desc: "Улучшенные награды: 110.000 HERMES для пользователей + 10.000 для рефералов",
        instant_payments_desc: "Мгновенные автоматические платежи во время обменов",
        onchain_tracking_desc: "Отслеживание и проверка в блокчейне",
        professional_influencer_desc: "Профессиональная система влиятельных лиц!"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'en', // Default language is English
    fallbackLng: 'en',
    supportedLngs: supportedLanguages,
    resources,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
    
    react: {
      useSuspense: false,
    },
  });

export default i18n;
export { supportedLanguages };

export type Language = typeof supportedLanguages[number];
export const getDefaultLanguage = (): Language => 'en';