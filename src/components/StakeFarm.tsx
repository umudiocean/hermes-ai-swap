import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { useWalletStore } from '../stores/useWalletStore';
import { useStakingStore } from '../stores/useStakingStore';
import { Lock, Unlock, TrendingUp, Clock, Coins } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { useTranslation } from '../hooks/useTranslation';

interface StakingPool {
  id: string;
  name: string;
  token: string;
  tokenAddress: string;
  apy: number;
  lockPeriod: number;
  totalStaked: string;
  userStaked: string;
  userRewards: string;
  minStake: string;
  maxStake: string;
}

const STAKING_POOLS: StakingPool[] = [
  {
    id: 'hermes-pool',
    name: 'HERMES Staking Pool',
    token: 'HERMES',
    tokenAddress: '0x9495aB3549338BF14aD2F86CbcF79C7b574bba37',
    apy: 81.11,
    lockPeriod: 99,
    totalStaked: '0',
    userStaked: '0',
    userRewards: '0',
    minStake: '1000',
    maxStake: '1000000'
  },
  {
    id: 'bnb-pool',
    name: 'BNB Staking Pool',
    token: 'BNB',
    tokenAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    apy: 12.5,
    lockPeriod: 30,
    totalStaked: '0',
    userStaked: '0',
    userRewards: '0',
    minStake: '0.1',
    maxStake: '100'
  },
  {
    id: 'cake-pool',
    name: 'CAKE Staking Pool',
    token: 'CAKE',
    tokenAddress: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
    apy: 45.2,
    lockPeriod: 60,
    totalStaked: '0',
    userStaked: '0',
    userRewards: '0',
    minStake: '10',
    maxStake: '10000'
  }
];

export default function StakeFarm() {
  const { isConnected, address } = useWalletStore();
  const { 
    stakeTokens, 
    unstakeTokens, 
    claimRewards, 
    getStakingInfo,
    isLoading,
    error 
  } = useStakingStore();
  const { toast } = useToast();
  const { t } = useTranslation();

  const [selectedPool, setSelectedPool] = useState<StakingPool>(STAKING_POOLS[0]);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakingInfo, setStakingInfo] = useState<any>(null);

  useEffect(() => {
    if (isConnected && address) {
      loadStakingInfo();
    }
  }, [isConnected, address, selectedPool]);

  const loadStakingInfo = async () => {
    if (!address) return;
    
    try {
      const info = await getStakingInfo(address, selectedPool.id);
      setStakingInfo(info);
    } catch (error) {
      console.error('Failed to load staking info:', error);
    }
  };

  const handleStake = async () => {
    if (!address || !stakeAmount) return;

    try {
      await stakeTokens(address, selectedPool.id, stakeAmount);
      toast({
        title: 'Stake Successful',
        description: `${stakeAmount} ${selectedPool.token} staked successfully!`,
      });
      setStakeAmount('');
      loadStakingInfo();
    } catch (error: any) {
      toast({
        title: 'Stake Failed',
        description: error.message || 'Failed to stake tokens',
        variant: 'destructive',
      });
    }
  };

  const handleUnstake = async () => {
    if (!address || !unstakeAmount) return;

    try {
      await unstakeTokens(address, selectedPool.id, unstakeAmount);
      toast({
        title: 'Unstake Successful',
        description: `${unstakeAmount} ${selectedPool.token} unstaked successfully!`,
      });
      setUnstakeAmount('');
      loadStakingInfo();
    } catch (error: any) {
      toast({
        title: 'Unstake Failed',
        description: error.message || 'Failed to unstake tokens',
        variant: 'destructive',
      });
    }
  };

  const handleClaimRewards = async () => {
    if (!address) return;

    try {
      await claimRewards(address, selectedPool.id);
      toast({
        title: 'Rewards Claimed',
        description: 'Staking rewards claimed successfully!',
      });
      loadStakingInfo();
    } catch (error: any) {
      toast({
        title: 'Claim Failed',
        description: error.message || 'Failed to claim rewards',
        variant: 'destructive',
      });
    }
  };

  const handleMaxStake = () => {
    // Set maximum stake amount based on user balance
    const maxAmount = stakingInfo?.userBalance || '0';
    setStakeAmount(maxAmount);
  };

  const handleMaxUnstake = () => {
    // Set maximum unstake amount based on user staked
    const maxAmount = stakingInfo?.userStaked || '0';
    setUnstakeAmount(maxAmount);
  };

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <Lock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">
          Connect Wallet to Stake
        </h3>
        <p className="text-gray-500">
          Connect your wallet to start staking and earning rewards
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pool Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {STAKING_POOLS.map((pool) => (
          <Card 
            key={pool.id}
            className={`cursor-pointer transition-all ${
              selectedPool.id === pool.id 
                ? 'border-[#62cbc1] bg-[#62cbc1]/10' 
                : 'hover:border-gray-300'
            }`}
            onClick={() => setSelectedPool(pool)}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{pool.name}</CardTitle>
              <CardDescription>
                {pool.token} • {pool.lockPeriod} days lock
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">APY</span>
                <span className="text-lg font-bold text-green-500">
                  {pool.apy}%
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Total Staked</span>
                <span className="text-sm">
                  {parseFloat(pool.totalStaked).toLocaleString()} {pool.token}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Staking Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5" />
            {selectedPool.name}
          </CardTitle>
          <CardDescription>
            Stake {selectedPool.token} and earn {selectedPool.apy}% APY
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stake Section */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Stake {selectedPool.token}
            </h4>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Amount to stake`}
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleMaxStake}
                className="px-3"
              >
                MAX
              </Button>
            </div>
            <Button 
              onClick={handleStake}
              disabled={isLoading || !stakeAmount}
              className="w-full"
            >
              {isLoading ? 'Staking...' : `Stake ${selectedPool.token}`}
            </Button>
          </div>

          {/* Unstake Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2">
              <Unlock className="h-4 w-4" />
              Unstake {selectedPool.token}
            </h4>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Amount to unstake`}
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={handleMaxUnstake}
                className="px-3"
              >
                MAX
              </Button>
            </div>
            <Button 
              onClick={handleUnstake}
              disabled={isLoading || !unstakeAmount}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Unstaking...' : `Unstake ${selectedPool.token}`}
            </Button>
          </div>

          {/* Rewards Section */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Claim Rewards
            </h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Your Staked</span>
                <span className="font-semibold">
                  {stakingInfo?.userStaked || '0'} {selectedPool.token}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Rewards Earned</span>
                <span className="font-semibold text-green-500">
                  {stakingInfo?.userRewards || '0'} {selectedPool.token}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lock Period</span>
                <span className="text-sm">
                  {selectedPool.lockPeriod} days
                </span>
              </div>
            </div>
            <Button 
              onClick={handleClaimRewards}
              disabled={isLoading || !stakingInfo?.userRewards || parseFloat(stakingInfo?.userRewards || '0') <= 0}
              className="w-full bg-green-500 hover:bg-green-600"
            >
              {isLoading ? 'Claiming...' : 'Claim Rewards'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  );
} 