import { walletService } from "../src/lib/walletService";
import { contractService } from "../src/lib/contractService";
import { priceService } from "../src/lib/priceService";
import { bscRpcManager } from "../src/lib/bscRpcManager";

// Test configuration
const TEST_ADDRESS = "0xf0d848b2AF7Db0bAC9AceC11bEA5931E8DFd1327";
const HERMES_CONTRACT_ADDRESS = "0x9495aB3549338BF14aD2F86CbcF79C7b574bba37";

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL';
  message: string;
  duration: number;
}

class SystemTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log("🚀 Starting Hermes AI Swap System Tests...\n");

    // RPC Tests
    await this.testRPCConnection();
    await this.testRPCFallback();
    
    // Price Tests
    await this.testPriceService();
    await this.testSwapQuotes();
    
    // Contract Tests
    await this.testContractService();
    await this.testUserStats();
    
    // Wallet Tests (if available)
    await this.testWalletService();

    this.printResults();
    return this.results;
  }

  private async testRPCConnection(): Promise<void> {
    const startTime = Date.now();
    try {
      const isConnected = await bscRpcManager.testConnection();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "RPC Connection",
        status: isConnected ? 'PASS' : 'FAIL',
        message: isConnected ? "BSC RPC connection successful" : "BSC RPC connection failed",
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "RPC Connection",
        status: 'FAIL',
        message: `RPC connection error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testRPCFallback(): Promise<void> {
    const startTime = Date.now();
    try {
      const stats = bscRpcManager.getStats();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "RPC Fallback System",
        status: stats.length > 0 ? 'PASS' : 'FAIL',
        message: `RPC fallback system initialized with ${stats.length} endpoints`,
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "RPC Fallback System",
        status: 'FAIL',
        message: `RPC fallback error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testPriceService(): Promise<void> {
    const startTime = Date.now();
    try {
      const bnbPrice = await priceService.getBNBPrice();
      const hermesPrice = await priceService.getHermesPrice();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "Price Service",
        status: (bnbPrice > 0 && hermesPrice > 0) ? 'PASS' : 'FAIL',
        message: `BNB: $${bnbPrice}, HERMES: $${hermesPrice}`,
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "Price Service",
        status: 'FAIL',
        message: `Price service error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testSwapQuotes(): Promise<void> {
    const startTime = Date.now();
    try {
      const bnbToken = { address: "BNB", symbol: "BNB", decimals: 18, name: "BNB" };
      const hermesToken = { address: HERMES_CONTRACT_ADDRESS, symbol: "HERMES", decimals: 18, name: "HERMES" };
      
      const quote = await priceService.getSwapQuote("1", bnbToken, hermesToken);
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "Swap Quotes",
        status: parseFloat(quote.amountOut) > 0 ? 'PASS' : 'FAIL',
        message: `Quote: 1 BNB = ${quote.amountOut} HERMES (${quote.priceImpact}% impact)`,
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "Swap Quotes",
        status: 'FAIL',
        message: `Swap quote error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testContractService(): Promise<void> {
    const startTime = Date.now();
    try {
      const contractInfo = await contractService.getContractInfo();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "Contract Service",
        status: 'PASS',
        message: `Contract info loaded - HERMES: ${contractInfo.hermesBalance}, Swaps: ${contractInfo.swapCount}`,
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "Contract Service",
        status: 'FAIL',
        message: `Contract service error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testUserStats(): Promise<void> {
    const startTime = Date.now();
    try {
      const stats = await contractService.getUserStats(TEST_ADDRESS);
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "User Stats",
        status: 'PASS',
        message: `User stats loaded - Swaps: ${stats.swapCount}, Rewards: ${stats.claimableRewards}`,
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "User Stats",
        status: 'FAIL',
        message: `User stats error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private async testWalletService(): Promise<void> {
    const startTime = Date.now();
    try {
      // Test without actual wallet connection
      const isConnected = walletService.isConnected();
      const duration = Date.now() - startTime;
      
      this.results.push({
        test: "Wallet Service",
        status: 'PASS',
        message: `Wallet service initialized - Connected: ${isConnected}`,
        duration
      });
    } catch (error: any) {
      this.results.push({
        test: "Wallet Service",
        status: 'FAIL',
        message: `Wallet service error: ${error.message}`,
        duration: Date.now() - startTime
      });
    }
  }

  private printResults(): void {
    console.log("\n📊 Test Results:");
    console.log("=".repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    this.results.forEach(result => {
      const status = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${status} ${result.test}: ${result.message} (${result.duration}ms)`);
    });
    
    console.log("\n" + "=".repeat(50));
    console.log(`🎯 Summary: ${passed}/${total} tests passed`);
    
    if (failed === 0) {
      console.log("🎉 All tests passed! System is ready for production.");
    } else {
      console.log(`⚠️  ${failed} test(s) failed. Please check the issues above.`);
    }
  }

  // Individual test methods for debugging
  async testRPCOnly(): Promise<void> {
    console.log("🔧 Testing RPC connection only...");
    await this.testRPCConnection();
    await this.testRPCFallback();
    this.printResults();
  }

  async testPricesOnly(): Promise<void> {
    console.log("🔧 Testing price service only...");
    await this.testPriceService();
    await this.testSwapQuotes();
    this.printResults();
  }

  async testContractsOnly(): Promise<void> {
    console.log("🔧 Testing contract service only...");
    await this.testContractService();
    await this.testUserStats();
    this.printResults();
  }
}

// Export for use in other files
export const systemTest = new SystemTest();

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  systemTest.runAllTests().catch(console.error);
} else {
  // Browser environment
  window.systemTest = systemTest;
}

// Browser global declaration
declare global {
  interface Window {
    systemTest?: SystemTest;
  }
} 