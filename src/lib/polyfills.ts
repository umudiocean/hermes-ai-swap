// Polyfills for Node.js modules in browser environment
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
  
  // Polyfill for util module
  if (!(window as any).util) {
    (window as any).util = {
      inspect: (obj: any) => JSON.stringify(obj, null, 2),
      debuglog: (section: string) => (msg: string, ...args: any[]) => {
        console.log(`[${section}] ${msg}`, ...args);
      }
    };
  }
}

export {}; 