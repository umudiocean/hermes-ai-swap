import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, Gift } from "lucide-react";
import { useWalletStore } from "@/stores/useWalletStore";
import { useToast } from "@/hooks/use-toast";
import { hermesReswapV2Service } from "@/lib/hermesReswapV2";
import { web3Service } from "@/lib/web3";

interface ReferralGeneratorProps {
  onCodeGenerated: (code: string) => void;
}

export default function ReferralGenerator({ onCodeGenerated }: ReferralGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [referralCode, setReferralCode] = useState<string>("");
  const { isConnected, address } = useWalletStore();
  const { toast } = useToast();

  const generateCode = async () => {
    if (!isConnected || !address) {
      toast({
        title: "Cüzdan Bağlantısı Gerekli",
        description: "Referral kodu oluşturmak için cüzdanınızı bağlayın",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const provider = web3Service.provider;
      const signer = web3Service.signer;
      
      if (!provider || !signer) {
        throw new Error("Web3 provider not available");
      }

      await hermesReswapV2Service.initialize(provider, signer);
      
      // Check if user already has a referral code
      const existingCode = await hermesReswapV2Service.getReferralCode(address);
      
      if (existingCode && existingCode !== "0") {
        setReferralCode(existingCode);
        onCodeGenerated(existingCode);
        toast({
          title: "Mevcut Referral Kodunuz",
          description: `Referral kodunuz: ${existingCode}`,
        });
        return;
      }

      // Generate new referral code
      const newCode = await hermesReswapV2Service.generateReferralCode();
      setReferralCode(newCode);
      onCodeGenerated(newCode);
      
      toast({
        title: "Referral Kodu Oluşturuldu! 🎉",
        description: `Yeni referral kodunuz: ${newCode}`,
      });
    } catch (error: any) {
      console.error("Error generating referral code:", error);
      toast({
        title: "Referral Kodu Oluşturulamadı",
        description: error.message || "Bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyCode = async () => {
    if (!referralCode) return;
    
    try {
      await navigator.clipboard.writeText(referralCode);
      toast({
        title: "Kopyalandı!",
        description: "Referral kod panoya kopyalandı",
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (!isConnected) {
    return (
      <Card className="p-6 bg-hermes-card border-hermes-border">
        <div className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 text-[#62cbc1]" />
          <h3 className="text-lg font-semibold mb-2">Referral Sistemi</h3>
          <p className="text-gray-400 mb-4">
            Referral kodunuzu oluşturmak için cüzdanınızı bağlayın
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-hermes-card border-hermes-border">
      <div className="text-center">
        <Gift className="w-12 h-12 mx-auto mb-4 text-[#62cbc1]" />
        <h3 className="text-lg font-semibold mb-2">Referral Kodunuz</h3>
        
        {referralCode ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 p-3 bg-hermes-bg rounded-lg">
              <span className="text-2xl font-bold text-[#62cbc1]">{referralCode}</span>
              <Button
                onClick={copyCode}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-gray-400">
              <p>Bu kodu paylaşarak her referral swap'tan</p>
              <p className="text-[#62cbc1] font-semibold">10,000 HERMES kazanın!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 mb-4">
              Referral kodunuzu oluşturun ve arkadaşlarınızla paylaşın
            </p>
            
            <Button
              onClick={generateCode}
              disabled={isGenerating}
              className="w-full bg-[#62cbc1] hover:bg-[#4db8a8] text-black"
            >
              {isGenerating ? "Oluşturuluyor..." : "Referral Kodu Oluştur"}
            </Button>
            
            <div className="text-sm text-gray-400">
              <p>• Her referral swap'tan 10,000 HERMES kazanın</p>
              <p>• Referral olan kişi 90,000 HERMES alır</p>
              <p>• Tek seferlik kod oluşturma</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}