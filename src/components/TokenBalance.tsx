import { ShimmerLoader } from "./LoadingSpinner";

interface TokenBalanceProps {
  balance: string;
  symbol: string;
  isLoading?: boolean;
  isOptimistic?: boolean;
}

export default function TokenBalance({ balance, symbol, isLoading, isOptimistic }: TokenBalanceProps) {
  if (isLoading) {
    return (
      <ShimmerLoader className="h-5 w-24 rounded">
        <div className="bg-gray-600 h-5 w-24 rounded animate-pulse" />
      </ShimmerLoader>
    );
  }

  return (
    <span className={`text-sm text-gray-400 truncate transition-all duration-200 ${
      isOptimistic ? 'animate-pulse-fast text-[#62cbc1]' : 'animate-fade-in-up'
    }`}>
      Balance: {balance} {symbol}
    </span>
  );
}