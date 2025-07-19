import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, ExternalLink, Gift } from "lucide-react";
import hermesSwapV3Service from "@/services/hermesSwapV3Service";

interface ContractInfo {
  hermesBalance: string;
  canReward: boolean;
  totalSwaps: number;
  rewardsDistributed: string;
}

export default function ContractRewardStatus() {
  const [contractInfo, setContractInfo] = useState<ContractInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkContractStatus = async () => {
    if (!hermesSwapV3Service.isContractDeployed()) return;
    
    try {
      setLoading(true);
      const info = await hermesSwapV3Service.getContractInfo();
      setContractInfo(info);
      setLastCheck(new Date());
    } catch (error) {
      console.error("Failed to check contract status:", error);
      // Set fallback data to prevent crashes
      setContractInfo({
        hermesBalance: "0",
        canReward: false,
        totalSwaps: 0,
        rewardsDistributed: "0"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkContractStatus();
    
    // Check every 2 minutes
    const interval = setInterval(checkContractStatus, 120000);
    return () => clearInterval(interval);
  }, []);

  if (!hermesSwapV3Service.isContractDeployed() || loading) {
    return null;
  }
  
  // Show loading state if no contract info yet
  if (!contractInfo) {
    return (
      <div className="text-center text-sm text-gray-400 py-2">
        Checking contract status...
      </div>
    );
  }

  const hermesBalanceNum = parseFloat(contractInfo.hermesBalance || "0");
  const requiredBalance = 100000; // 100K HERMES minimum for rewards

  return (
    <div className="space-y-3">
      {!contractInfo.canReward ? (
        <Alert className="border-[#62cbc1]/30 bg-[#62cbc1]/20">
          <AlertTriangle className="h-4 w-4 text-[#62cbc1]" />
          <AlertDescription className="text-[#62cbc1]/80">
            <div className="space-y-2">
              <div className="font-semibold">Reward System Notice</div>
              <div className="text-sm">
                Contract has insufficient HERMES balance ({(hermesBalanceNum / 1000).toFixed(0)}K HERMES).
                Minimum {requiredBalance.toLocaleString()} HERMES required for reward distribution.
              </div>
              <div className="text-xs text-[#62cbc1]/80">
                Contract needs HERMES token deposit to enable automatic rewards.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-500/30 bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            <div className="space-y-1">
              <div className="font-semibold flex items-center gap-2">
                <Gift className="h-4 w-4" />
                Reward System Active
              </div>
              <div className="text-sm">
                Contract has {(hermesBalanceNum / 1000).toFixed(0)}K HERMES available for rewards.
                Automatic distribution enabled for all swaps.
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="space-x-4">
          <span>Total Swaps: {(contractInfo.totalSwaps || 0).toLocaleString()}</span>
          <span>Rewards Paid: {(parseFloat(contractInfo.rewardsDistributed || "0") / 1000).toFixed(0)}K HERMES</span>
        </div>
        
        <div className="flex items-center gap-2">
          {lastCheck && (
            <span>Updated: {lastCheck.toLocaleTimeString()}</span>
          )}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkContractStatus}
            className="h-6 px-2 text-xs hover:bg-hermes-primary/20"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        <a 
          href={`https://bscscan.com/address/0x040c821072fB0db013453329DcC78aB433d19a31`}
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 hover:text-hermes-primary transition-colors"
        >
          View Contract on BSCScan
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}