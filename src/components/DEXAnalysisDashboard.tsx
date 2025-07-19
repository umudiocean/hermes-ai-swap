import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { dexAnalyzer, DEXAnalysis } from '@/lib/dexAnalyzer';
import { TrendingUp, TrendingDown, Zap, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DEXAnalysisDashboard() {
  const { t } = useTranslation();
  const [analyses, setAnalyses] = useState<DEXAnalysis[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Initial load
    updateAnalyses();

    // Update every 30 seconds
    const interval = setInterval(updateAnalyses, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateAnalyses = () => {
    setIsRefreshing(true);
    const topDEXes = dexAnalyzer.getTopDEXes(21);
    setAnalyses(topDEXes);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getRecommendedDEX = () => {
    const recommended = dexAnalyzer.getRecommendedDEX();
    const secondBest = analyses[1];
    
    if (recommended && secondBest) {
      const profitDiff = parseFloat(recommended.profitability.replace('%', '').replace('+', '')) - 
                        parseFloat(secondBest.profitability.replace('%', '').replace('+', ''));
      return {
        recommended,
        alternative: secondBest,
        profitDiff: Math.abs(profitDiff).toFixed(2)
      };
    }
    return null;
  };

  const recommendation = getRecommendedDEX();

  // Translation helpers for different languages
  const getLocalizedText = (key: string) => {
    // Always use English for DEX analysis component
    const currentLang = 'en';
    
    const translations: Record<string, Record<string, string>> = {
      'tr': {
        'aiAnalysis': 'Hermes AI Analizi:',
        'recommended': 'tercih etti çünkü',
        'moreProfitable': 'daha karlı',
        'realTimeAnalysis': 'DEX Gerçek Zamanlı Analiz',
        'dexActive': 'DEX Aktif',
        'refresh': 'Yenile',
        'hide': 'Gizle',
        'detail': 'Detay',
        'aiRecommendation': 'Hermes AI Önerisi:',
        'use': 'kullan',
        'instead': 'yerine',
        'price': 'Fiyat:',
        'liquidity': 'Likidite:',
        'fee': 'Ücret:',
        'profitability': 'Karlılık:',
        'lastUpdate': 'Son güncelleme:',
        'autoUpdate': 'Otomatik güncelleme: 30 saniye',
        'recommended_badge': 'ÖNERİLEN'
      },
      'en': {
        'aiAnalysis': 'Hermes AI Analysis:',
        'recommended': 'recommends',
        'moreProfitable': 'more profitable',
        'realTimeAnalysis': 'Real-time DEX Analysis',
        'dexActive': 'DEX Active',
        'refresh': 'Refresh',
        'hide': 'Hide',
        'detail': 'Details',
        'aiRecommendation': 'Hermes AI Recommendation:',
        'use': 'Use',
        'instead': 'instead of',
        'price': 'Price:',
        'liquidity': 'Liquidity:',
        'fee': 'Fee:',
        'profitability': 'Profitability:',
        'lastUpdate': 'Last update:',
        'autoUpdate': 'Auto update: 30 seconds',
        'recommended_badge': 'RECOMMENDED'
      },
      'es': {
        'aiAnalysis': 'Análisis de Hermes AI:',
        'recommended': 'recomienda',
        'moreProfitable': 'más rentable',
        'realTimeAnalysis': 'Análisis DEX en tiempo real',
        'dexActive': 'DEX Activo',
        'refresh': 'Actualizar',
        'hide': 'Ocultar',
        'detail': 'Detalles',
        'aiRecommendation': 'Recomendación de Hermes AI:',
        'use': 'Usar',
        'instead': 'en lugar de',
        'price': 'Precio:',
        'liquidity': 'Liquidez:',
        'fee': 'Tarifa:',
        'profitability': 'Rentabilidad:',
        'lastUpdate': 'Última actualización:',
        'autoUpdate': 'Actualización automática: 30 segundos',
        'recommended_badge': 'RECOMENDADO'
      }
    };

    return translations[currentLang]?.[key] || translations['tr'][key] || key;
  };

  return (
    <div className="bg-gradient-to-r from-[#62cbc1] via-[#4db8a8] to-[#62cbc1] text-black relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="animate-pulse bg-gradient-to-r from-transparent via-white to-transparent h-full w-full"></div>
      </div>
      {/* Main Content */}
      <div className="relative z-10 px-4 h-[25px] flex items-center overflow-hidden">
        {!isExpanded ? (
          // Compact View - Animated Banner Style
          (<div className="flex items-center justify-between w-full">
            <div className="animate-slide-analysis whitespace-nowrap overflow-hidden flex-1">
              <span className="text-sm font-semibold leading-tight">
                🤖 <span className="text-black/90">{getLocalizedText('aiAnalysis')}</span>{' '}
                {recommendation ? (
                  <>
                    <span className="text-green-700 font-bold">{recommendation.recommended.dexName}</span>
                    {' '}{getLocalizedText('instead')}{' '}
                    <span className="text-red-600">{recommendation.alternative.dexName}</span>
                    {' '}{getLocalizedText('recommended')}{' '}
                    <span className="text-green-700 font-bold">%{recommendation.profitDiff} {getLocalizedText('moreProfitable')}</span>
                    {' '}📊 21 {getLocalizedText('realTimeAnalysis')}'
                  </>
                ) : (
                  `21 ${getLocalizedText('realTimeAnalysis')}...`
                )}
              </span>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setIsExpanded(true)}
                size="sm"
                className="ml-4 bg-black/20 hover:bg-black/30 text-black border-0 text-xs px-2 py-0.5 h-5"
              >
                <Eye className="w-3 h-3 mr-1" />
                {getLocalizedText('detail')}
              </Button>
            </div>
          </div>)
        ) : (
          // Expanded Dashboard View
          (<div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-[#62cbc1]" />
                <h3 className="font-bold text-lg">{getLocalizedText('realTimeAnalysis')}</h3>
                <span className="text-xs bg-black/20 px-2 py-1 rounded">
                  {analyses.length}/21 {getLocalizedText('dexActive')}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  onClick={updateAnalyses}
                  size="sm"
                  disabled={isRefreshing}
                  className="bg-black/20 hover:bg-black/30 text-black border-0 text-xs"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {getLocalizedText('refresh')}
                </Button>
                <Button
                  onClick={() => setIsExpanded(false)}
                  size="sm"
                  className="bg-black/20 hover:bg-black/30 text-black border-0 text-xs"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  {getLocalizedText('hide')}
                </Button>
              </div>
            </div>
            {/* AI Recommendation */}
            {recommendation && (
              <div className="bg-green-100/30 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-semibold text-green-800">Hermes AI Recommendation:</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Use <span className="font-bold">{recommendation.recommended.dexName}</span> - 
                  <span className="font-bold text-green-600"> {recommendation.profitDiff}% more profitable</span> 
                  {' '}(instead of {recommendation.alternative.dexName})
                </p>
              </div>
            )}
            {/* Top 5 DEX Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {analyses.slice(0, 5).map((analysis, index) => (
                <div
                  key={analysis.dexName}
                  className={`bg-black/10 rounded-lg p-3 border-2 transition-all ${
                    analysis.isRecommended 
                      ? 'border-green-500 bg-green-100/20 shadow-lg' 
                      : 'border-black/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold">#{index + 1}</span>
                      </div>
                      <span className="font-semibold text-xs">{analysis.dexName}</span>
                    </div>
                    {analysis.isRecommended && (
                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                        {getLocalizedText('recommended_badge')}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>{getLocalizedText('price')}</span>
                      <span className="font-mono">{analysis.priceUSD}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getLocalizedText('liquidity')}</span>
                      <span className="text-blue-700">{analysis.liquidity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getLocalizedText('fee')}</span>
                      <span className="text-[#62cbc1]">{analysis.fee}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{getLocalizedText('profitability')}</span>
                      <span className={`font-bold flex items-center ${
                        analysis.profitability.startsWith('+') ? 'text-green-700' : 'text-red-700'
                      }`}>
                        {analysis.profitability.startsWith('+') ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        {analysis.profitability}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Last Update Time */}
            <div className="text-center">
              <span className="text-xs text-black/60">
                {getLocalizedText('lastUpdate')} {lastUpdate.toLocaleTimeString()} • 
                {getLocalizedText('autoUpdate')}
              </span>
            </div>
          </div>)
        )}
      </div>
    </div>
  );
}