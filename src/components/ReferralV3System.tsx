import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletStore } from "@/stores/useWalletStore";
import { useReferralV3Store } from "@/stores/useReferralV3Store";
import { useToast } from "@/hooks/use-toast";
import { Copy, Share2, Users, Coins, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useTranslation } from "@/hooks/useTranslation";

export default function ReferralV3System() {
  const { isConnected, address } = useWalletStore();
  const { 
    myReferralCode, 
    referralStats, 
    isGenerating, 
    error,
    generateMyReferralCode,
    getReferralStats,
    clearError
  } = useReferralV3Store();
  
  const { toast } = useToast();
  const { t } = useTranslation();
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [referralUrl, setReferralUrl] = useState<string>("");

  useEffect(() => {
    if (isConnected && address) {
      getReferralStats();
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (myReferralCode > 0) {
      const url = `${window.location.origin}/?ref=${myReferralCode}`;
      setReferralUrl(url);
      
      // Generate QR code
      QRCode.toDataURL(url, { width: 200, margin: 2 })
        .then(dataUrl => setQrCodeDataUrl(dataUrl))
        .catch(console.error);
    }
  }, [myReferralCode]);

  const handleGenerateCode = async () => {
    try {
      toast({
        title: t("referral.generating_code"),
        description: t("referral.v4_fee_required"),
        duration: 3000,
      });
      
      await generateMyReferralCode();
      
      toast({
        title: t("referral.code_generated"), 
        description: t("referral.v4_fee_paid", { code: myReferralCode }),
        duration: 6000,
      });
    } catch (error: any) {
      toast({
        title: t("referral.generation_failed"),
        description: error.message || t("referral.transaction_rejected"),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const copyReferralUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: t("referral.url_copied"),
      description: t("referral.url_copied_desc"),
    });
  };

  const shareOnSocial = (platform: string) => {
    const message = `🚀 Join HermesAI Swap - the best DeFi exchange with ZERO fees and instant rewards! Use my referral link to earn extra HERMES tokens: ${referralUrl}`;
    
    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case "telegram":
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent(message)}`;
        break;
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };

  if (!isConnected) {
    return (
      <div className="space-y-8">
        <Card className="bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border-2 border-hermes-border rounded-3xl shadow-2xl hover:shadow-[#62cbc1]/20 transition-all duration-700">
          <CardHeader className="pb-8">
            <CardTitle className="text-3xl text-[#62cbc1] text-center font-bold tracking-wide animate-pulse" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
              {t("referral.system_v3_title")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-400 text-xl font-medium" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              {t("referral.connect_first")}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Generate Referral Code - Compact Style */}
      {!referralStats.hasCode && (
        <Card className="bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border border-hermes-border rounded-xl shadow-lg hover:shadow-[#62cbc1]/20 transition-all duration-300">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-[#62cbc1] text-center font-semibold" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
              {t("referral.generate_code")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300 text-sm text-center" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
              {t("referral.earn_per_swap")}
            </p>
            <Button 
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-[#62cbc1] via-[#4db8a8] to-[#62cbc1] hover:from-[#4db8a8] hover:to-[#5cb4a3] text-black font-semibold py-2 rounded-lg text-sm hover:scale-105 transition-all duration-300 shadow-md disabled:opacity-70"
              style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
            >
              {isGenerating ? t("referral.generating_code") : t("referral.generate_code")}
            </Button>
            {error && (
              <p className="text-red-400 text-xs text-center" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                {error}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Referral Stats - Compact Style */}
      {referralStats.hasCode && (
        <>
          <Card className="bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border border-hermes-border rounded-xl shadow-lg hover:shadow-[#62cbc1]/20 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-[#62cbc1] text-center font-semibold flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
                <Users className="w-5 h-5" />
                {t("referral.your_referral_link")}: {referralStats.code}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-[#62cbc1] mb-1" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
                    {referralStats.totalRefs}
                  </div>
                  <div className="text-xs text-gray-400" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    {t("referral.total_referrals")}
                  </div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg border border-gray-700 hover:scale-105 transition-all duration-300">
                  <div className="text-2xl font-bold text-green-400 mb-1" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
                    {parseFloat(referralStats.earnings).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-400" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    {t("referral.earned_bonuses")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Share Options - Compact Style */}
          <Card className="bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border border-hermes-border rounded-xl shadow-lg hover:shadow-[#62cbc1]/20 transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-[#62cbc1] text-center font-semibold flex items-center justify-center gap-2" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '600' }}>
                <Share2 className="w-5 h-5" />
                {t("referral.share_link")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Referral URL */}
              <div className="flex gap-2">
                <Input 
                  value={referralUrl}
                  readOnly
                  className="bg-hermes-dark border-hermes-border text-white rounded-lg px-3 py-2 text-sm font-mono"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                />
                <Button 
                  onClick={copyReferralUrl} 
                  className="bg-gradient-to-r from-[#62cbc1] to-[#4db8a8] hover:from-[#4db8a8] hover:to-[#5cb4a3] text-black font-semibold px-3 py-2 rounded-lg hover:scale-105 transition-all duration-300"
                  style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>

              {/* QR Code */}
              {qrCodeDataUrl && (
                <div className="flex flex-col items-center space-y-2">
                  <p className="text-sm text-gray-400 text-center" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                    {t("referral.qr_code")} - {t("referral.scan_to_join")}
                  </p>
                  <div className="p-2 bg-white rounded-lg shadow-lg hover:scale-105 transition-all duration-300">
                    <img src={qrCodeDataUrl} alt="Referral QR Code" className="w-24 h-24" />
                  </div>
                </div>
              )}

              {/* Social Share Buttons */}
              <div className="space-y-2">
                <p className="text-sm text-gray-400 text-center" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                  {t("referral.share_unique_link")}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <Button 
                    onClick={() => shareOnSocial("twitter")}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md text-xs"
                    style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Twitter
                  </Button>
                  <Button 
                    onClick={() => shareOnSocial("telegram")}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold hover:scale-105 transition-all duration-300 shadow-md text-xs"
                    style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                  >
                    Telegram
                  </Button>
                  <Button 
                    onClick={() => shareOnSocial("whatsapp")}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold hover:scale-105 transition-all duration-500 shadow-lg"
                    style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}
                  >
                    {t("referral.share_whatsapp")}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How It Works - Professional Style */}
          <Card className="bg-gradient-to-br from-hermes-card via-gray-900 to-hermes-card border-2 border-hermes-border rounded-3xl shadow-2xl hover:shadow-[#62cbc1]/20 transition-all duration-700">
            <CardHeader className="pb-8">
              <CardTitle className="text-3xl text-[#62cbc1] text-center font-bold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
                {t("referral.system_v3_title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg text-gray-300 space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:scale-105 transition-all duration-500 group">
                  <div className="relative">
                    <Coins className="w-6 h-6 text-[#62cbc1] group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 w-6 h-6 bg-[#62cbc1]/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <div>
                    <strong style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
                      {t("referral.enhanced_rewards_desc")}
                    </strong>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:scale-105 transition-all duration-500 group">
                  <div className="relative">
                    <Users className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 w-6 h-6 bg-blue-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <div>
                    <strong style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
                      {t("referral.earn_per_swap")}
                    </strong>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl border border-gray-700 hover:scale-105 transition-all duration-500 group">
                  <div className="relative">
                    <QrCode className="w-6 h-6 text-green-400 group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 w-6 h-6 bg-green-400/20 rounded-full blur-xl animate-pulse"></div>
                  </div>
                  <div>
                    <strong style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', fontWeight: '700' }}>
                      {t("referral.instant_payments_desc")}
                    </strong>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}