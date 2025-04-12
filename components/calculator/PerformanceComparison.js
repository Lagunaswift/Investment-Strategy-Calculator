// components/calculator/PerformanceComparison.js
import React from 'react';

const PerformanceComparison = ({ allocations, includeCrypto, includeGold }) => {
  const calculateAssetClassImpact = (allocation) => {
    const impact = {
      stock: allocation.stock * 0.6,  // Impact factor for stocks
      bond: allocation.bond * 0.2,    // Impact factor for bonds
      crypto: allocation.crypto * 1.5, // Higher impact for crypto
      gold: allocation.gold * 0.3      // Impact factor for gold
    };
    
    return Object.entries(impact)
      .filter(([asset, value]) => value > 0)
      .map(([asset, value]) => ({
        asset,
        impact: value,
        percentage: allocation[asset]
      }));
  };

  const assetImpacts = calculateAssetClassImpact(allocations);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Performance Comparison</h4>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-pastel-bg-blue p-3 rounded-lg border border-pastel-border-blue">
            <p className="text-sm text-pastel-text-blue mb-1 font-medium">S&P 500 (US Stocks)</p>
            <div className="flex items-center">
              <div className="relative w-full max-w-xs h-4 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-4 rounded-full bg-pastel-bg-blue absolute left-0 top-0 transition-all duration-300 ease-in-out" style={{ width: '40%' }} />
              </div>
              <span className="ml-2 text-sm font-medium text-pastel-text-blue">+4.2%</span>
            </div>
          </div>
          <div className="bg-pastel-bg-yellow p-3 rounded-lg border border-pastel-border-yellow">
            <p className="text-sm text-pastel-text-yellow mb-1 font-medium">Global Bonds</p>
            <div className="flex items-center">
              <div className="relative w-full max-w-xs h-4 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-4 rounded-full bg-pastel-bg-yellow absolute left-0 top-0 transition-all duration-300 ease-in-out" style={{ width: '10%' }} />
              </div>
              <span className="ml-2 text-sm font-medium text-pastel-text-yellow">-0.8%</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <h5 className="text-sm text-gray-500 font-medium mb-2">Asset Class Impact</h5>
          <div className="space-y-3">
            {assetImpacts.map((impact, index) => (
              <div key={index} className="flex items-center">
                <div className="relative w-full max-w-xs h-4 rounded-full bg-gray-200 overflow-hidden">
                  <div 
                    className={`h-4 rounded-full absolute left-0 top-0 transition-all duration-300 ease-in-out ${
                      impact.asset === 'stock' ? 'bg-pastel-bg-blue' : 
                      impact.asset === 'bond' ? 'bg-pastel-bg-yellow' : 
                      impact.asset === 'crypto' ? 'bg-pastel-bg-purple' : 
                      'bg-pastel-bg-amber'}`} 
                    style={{ width: `${impact.percentage}%` }}
                  />
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                      impact.asset === 'stock' ? 'text-pastel-text-blue' : 
                      impact.asset === 'bond' ? 'text-pastel-text-yellow' : 
                      impact.asset === 'crypto' ? 'text-pastel-text-purple' : 
                      'text-pastel-text-amber'}`}>
                    {impact.asset}
                  </p>
                  <p className="text-xs text-gray-500">Impact: {impact.impact.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs italic text-gray-500 mt-4">
        Note: Performance data is for illustrative purposes only. Past performance is not indicative of future results.
      </p>
    </div>
  );
};

export default PerformanceComparison;
