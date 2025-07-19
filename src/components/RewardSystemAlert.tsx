import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Info, Gift } from "lucide-react";
import { ethers } from "ethers";

const HERMES_TOKEN_ADDRESS = "0x9495ab3549338bf14ad2f86cbcf79c7b574bba37";
const CONTRACT_ADDRESS = "0x040c821072fB0db013453329DcC78aB433d19a31";

export default function RewardSystemAlert() {
  const [contractHermesBalance, setContractHermesBalance] = useState<string>("0");
  const [loading, setLoading] = useState(true);

  const checkContractBalance = async () => {
    try {
      setLoading(true);
      const provider = new ethers.JsonRpcProvider("https://bsc-dataseed.binance.org");
      
      // HERMES token contract
      const hermesContract = new ethers.Contract(
        HERMES_TOKEN_ADDRESS,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      
      const balance = await hermesContract.balanceOf(CONTRACT_ADDRESS);
      const formattedBalance = ethers.formatEther(balance);
      setContractHermesBalance(formattedBalance);
    } catch (error) {
      console.error("Failed to check contract balance:", error);
      setContractHermesBalance("0");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkContractBalance();
    // Refresh every 30 seconds
    const interval = setInterval(checkContractBalance, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="text-center text-sm text-gray-400 py-2">
        <Info className="h-4 w-4 inline mr-1" />
        Checking reward system status...
      </div>
    );
  }

  const balanceNum = parseFloat(contractHermesBalance);
  const canDistributeRewards = balanceNum >= 100000; // 100K HERMES minimum

  return (
    <div className="space-y-3">
      {!canDistributeRewards ? (
        <Alert className="border-[#62cbc1]/30 bg-[#62cbc1]/20">
          <AlertTriangle className="h-4 w-4 text-[#62cbc1]" />
          <AlertDescription className="text-[#62cbc1]/80">
            <div className="space-y-3">
              <div className="font-semibold text-lg">⚠️ Reward System Status</div>
              
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-3">
                <div className="text-red-200 font-medium mb-2">
                  🚫 Automatic Rewards Currently Unavailable
                </div>
                <div className="text-sm text-red-300">
                  Contract HERMES Balance: <span className="font-mono">{balanceNum > 0 ? (balanceNum / 1000000).toFixed(1) + 'M' : '0'} HERMES</span>
                </div>
                <div className="text-sm text-red-300">
                  Status: <span className="font-mono text-red-400">Reward distribution not working</span>
                </div>
                <div className="text-xs text-red-400 mt-1">
                  Contract may need HERMES token deposit or reward function activation
                </div>
              </div>

              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-200 font-medium mb-2">
                  📋 Your Swaps Are Still Recorded
                </div>
                <div className="text-sm text-blue-300">
                  ✅ All transactions tracked in database<br/>
                  ✅ 100,000 HERMES rewards earned per swap<br/>
                  ✅ Rewards will be distributed when contract is funded
                </div>
              </div>

              <div className="bg-green-900/30 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-200 font-medium mb-2">
                  💡 Solution
                </div>
                <div className="text-sm text-green-300">
                  Contract needs HERMES token deposit to enable automatic reward distribution.
                  Your earned rewards will be available once the contract is funded.
                </div>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="border-green-500/30 bg-green-900/20">
          <Gift className="h-4 w-4 text-green-400" />
          <AlertDescription className="text-green-200">
            <div className="font-semibold flex items-center gap-2">
              ✅ Reward System Active
            </div>
            <div className="text-sm mt-1">
              Contract has {(balanceNum / 1000).toFixed(0)}K HERMES available.
              Automatic rewards enabled for all swaps!
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400">
        <div className="space-x-4">
          <span>Contract: {CONTRACT_ADDRESS.slice(0,6)}...{CONTRACT_ADDRESS.slice(-4)}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={checkContractBalance}
            className="h-6 px-2 text-xs hover:bg-hermes-primary/20"
          >
            Refresh
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href={`https://bscscan.com/address/${CONTRACT_ADDRESS}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-hermes-primary transition-colors"
          >
            View Contract
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
}