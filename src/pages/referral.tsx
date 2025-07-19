import { useTranslation } from '../hooks/useTranslation';
import { useWalletStore } from '../stores/useWalletStore';
import { Copy, ExternalLink, Users, TrendingUp, Gift, Zap, QrCode } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useReferralStore } from '../lib/referralStore';
import { Button } from '../components/ui/button';
import WalletConnect from '../components/WalletConnect';
import ReferralV3System from '../components/ReferralV3System';
import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { 
  ReferralIcon, 
  SwapIcon, 
  ClaimIcon, 
  EarningsIcon, 
  WalletIcon,
  SecurityIcon,
  OptimizationIcon,
  ScanningIcon 
} from '../components/icons/ModernIcons';

export default function ReferralPage() {
  const { t } = useTranslation();
  const { address } = useWalletStore();
  const { toast } = useToast();
  const [isClaiming, setIsClaiming] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  
  const {
    referralStats,
    unclaimedRewards,
    referrals,
    isLoading,
    generateReferralLink,
    fetchReferralStats,
    fetchUnclaimedRewards,
    fetchReferrals,
    claimRewards
  } = useReferralStore();

  const referralLink = address ? generateReferralLink(address) : '';

  useEffect(() => {
    if (address) {
      fetchReferralStats(address);
      fetchUnclaimedRewards(address);
      fetchReferrals(address);
    }
  }, [address]);

  const generateQRCode = async () => {
    if (referralLink) {
      try {
        const qrUrl = await QRCode.toDataURL(referralLink, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error('QR Code generation failed:', error);
      }
    }
  };

  useEffect(() => {
    if (referralLink) {
      generateQRCode();
    }
  }, [referralLink]);

  const copyReferralLink = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: t('referral.copied'),
        description: t('referral.referral_link_copied'),
      });
    }
  };

  // Claim function removed - instant payments now active

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header - Compact Professional Style */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#62cbc1] via-[#4db8a8] to-[#62cbc1] bg-clip-text text-transparent mb-4 tracking-tight" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
            {t('referral.system_v3_title')}
          </h1>
          <div className="text-base lg:text-lg text-gray-300 space-y-2 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '400' }}>
            <p className="flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
              <ReferralIcon size={18} />
              {t('referral.smart_referral_codes_desc')}
            </p>
            <p className="flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
              <EarningsIcon size={18} />
              {t('referral.enhanced_rewards_desc')}
            </p>
            <p className="flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
              <Zap className="w-4 h-4 text-[#62cbc1]" />
              {t('referral.instant_payments_desc')}
            </p>
            <p className="flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
              <ScanningIcon size={18} />
              {t('referral.onchain_tracking_desc')}
            </p>
            <p className="flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-300">
              <TrendingUp className="w-4 h-4 text-[#62cbc1]" />
              {t('referral.professional_influencer_desc')}
            </p>
          </div>
        </div>
        
        {/* V3 Referral System */}
        <div className="mb-12">
          <ReferralV3System />
        </div>

        {address ? (
          <>
            


          </>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border border-hermes-border rounded-xl p-8 max-w-md mx-auto shadow-lg hover:shadow-[#62cbc1]/20 transition-all duration-300">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <WalletIcon size={48} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-white" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
                {t('referral.get_started')}
              </h3>
              <p className="text-gray-400 mb-6 text-sm" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                {t('referral.get_started_desc')}
              </p>
              <div className="transform hover:scale-105 transition-all duration-300">
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}