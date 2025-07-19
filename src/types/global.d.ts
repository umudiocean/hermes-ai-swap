declare global {
  interface Window {
    ethereum?: any;
  }
}

// Node.js modules for browser compatibility
declare module 'util' {
  export function inspect(obj: any, options?: any): string;
  export function debuglog(section: string): (msg: string, ...args: any[]) => void;
}

// Web3Modal types
declare module '@web3modal/wagmi/react' {
  export * from '@web3modal/wagmi/react';
}

declare module '@web3modal/ethers/react' {
  export * from '@web3modal/ethers/react';
}

export {}; 