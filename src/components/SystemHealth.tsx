import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { pancakeSwapPriceAPI } from '@/lib/pancakeswapPriceAPI';
import bscRpcManager from '@/lib/bscRpcManager';

interface SystemHealthProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function SystemHealth({ isVisible, onClose }: SystemHealthProps) {
  const [healthData, setHealthData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const checkSystemHealth = async () => {
    setIsLoading(true);
    try {
      const health = await pancakeSwapPriceAPI.getHealthStatus();
      const rpcStats = bscRpcManager.getStats();
      
      setHealthData({
        ...health,
        rpcDetails: rpcStats,
        timestamp: new Date().toLocaleString()
      });
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthData({
        error: error.message,
        timestamp: new Date().toLocaleString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isVisible) {
      checkSystemHealth();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-[600px] max-h-[80vh] overflow-y-auto bg-hermes-dark border-hermes-border">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-white">
            System Health Status
            <Button onClick={onClose} variant="ghost" size="sm">
              ✕
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-white">
          <div className="flex gap-2 mb-4">
            <Button 
              onClick={checkSystemHealth} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Checking...' : 'Refresh'}
            </Button>
          </div>

          {healthData && (
            <div className="space-y-4">
              <div className="text-sm text-gray-400">
                Last Check: {healthData.timestamp}
              </div>

              {healthData.error ? (
                <div className="text-red-400 p-3 bg-red-900/20 rounded">
                  Error: {healthData.error}
                </div>
              ) : (
                <>
                  {/* Overall Status */}
                  <div className={`p-3 rounded ${healthData.overallHealth ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                    <strong>Overall Status:</strong> {healthData.overallHealth ? '✅ Healthy' : '❌ Issues'}
                  </div>

                  {/* PancakeSwap API */}
                  <div className={`p-3 rounded ${healthData.pancakeswapAPI ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                    <strong>PancakeSwap API:</strong> {healthData.pancakeswapAPI ? '✅ Active' : '❌ Unreachable'}
                  </div>

                  {/* RPC Status */}
                  <div className="space-y-2">
                    <strong>BSC RPC Status:</strong>
                    <div className="text-sm">
                      Total: {healthData.rpc.totalEndpoints} | 
                      Healthy: {healthData.rpc.healthyEndpoints} | 
                      Active: {healthData.rpc.currentProvider}
                    </div>
                    
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {healthData.rpc.endpoints.map((endpoint: any, index: number) => (
                        <div 
                          key={index}
                          className={`text-xs p-2 rounded ${endpoint.healthy ? 'bg-green-900/10' : 'bg-red-900/10'}`}
                        >
                          <div className="flex justify-between">
                            <span className="truncate">{endpoint.url}</span>
                            <span className={endpoint.healthy ? 'text-green-400' : 'text-red-400'}>
                              {endpoint.healthy ? '✅' : '❌'}
                            </span>
                          </div>
                          <div className="text-gray-500">
                            Latency: {endpoint.latency}ms | Last: {new Date(endpoint.lastCheck).toLocaleTimeString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}