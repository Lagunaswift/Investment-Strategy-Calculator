// components/calculator/TaxImpactEstimator.js
import React from 'react';

const TaxImpactEstimator = ({ allocations, includeCrypto, includeGold }) => {
  const calculateTaxImpact = () => {
    const taxRates = {
      stock: 0.15,    // 15% long-term capital gains
      bond: 0.25,    // 25% interest income
      crypto: 0.30,  // 30% crypto gains
      gold: 0.28     // 28% collectibles rate
    };

    const totalAllocation = Object.values(allocations).reduce((sum, pct) => sum + pct, 0);
    const taxImpact = Object.entries(allocations)
      .filter(([asset, pct]) => pct > 0)
      .reduce((impact, [asset, pct]) => {
        const rate = taxRates[asset] || 0;
        return impact + (pct / totalAllocation) * rate;
      }, 0);

    return {
      overall: (taxImpact * 100).toFixed(1),
      byAsset: Object.entries(allocations)
        .filter(([asset, pct]) => pct > 0)
        .map(([asset, pct]) => ({
          asset,
          rate: (taxRates[asset] * 100).toFixed(1),
          impact: ((pct / totalAllocation) * taxRates[asset] * 100).toFixed(1)
        }))
    };
  };

  const taxData = calculateTaxImpact();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Tax Impact Estimator</h4>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Estimated Tax Impact</p>
            <p className="font-medium text-gray-800 text-lg">{taxData.overall}%</p>
          </div>
          <div className="bg-pastel-bg-blue text-pastel-text-blue p-2 rounded-lg border border-pastel-border-blue">
            <p className="text-xs">Based on current allocation</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {taxData.byAsset.map((asset, index) => (
            <div key={index} className="flex items-center">
              <div className="relative w-full max-w-xs h-4 rounded-full bg-gray-200 overflow-hidden">
                <div 
                  className={`h-4 rounded-full absolute left-0 top-0 transition-all duration-300 ease-in-out ${
                    asset.asset === 'stock' ? 'bg-pastel-bg-blue' : 
                    asset.asset === 'bond' ? 'bg-pastel-bg-yellow' : 
                    asset.asset === 'crypto' ? 'bg-pastel-bg-purple' : 
                    'bg-pastel-bg-amber'}`} 
                  style={{ width: `${asset.impact}%` }}
                />
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                    asset.asset === 'stock' ? 'text-pastel-text-blue' : 
                    asset.asset === 'bond' ? 'text-pastel-text-yellow' : 
                    asset.asset === 'crypto' ? 'text-pastel-text-purple' : 
                    'text-pastel-text-amber'}`}>{asset.asset}</p>
                <p className="text-xs text-gray-500">Tax Rate: {asset.rate}%</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <h5 className="text-sm text-gray-500 font-medium mb-2">Tax Optimization Tips</h5>
          <ul className="text-sm text-gray-500 list-disc list-inside space-y-1">
            <li className="text-pastel-text-blue">Consider tax-efficient funds for stock exposure</li>
            <li className="text-pastel-text-green">Maximize tax-advantaged accounts</li>
            <li className="text-pastel-text-purple">Review holding periods for capital gains</li>
          </ul>
        </div>
      </div>

      <p className="text-xs italic text-gray-500 mt-4">
        Note: These are estimated tax impacts based on current US tax rates. Actual tax outcomes may vary based on individual circumstances.
      </p>
    </div>
  );
};

export default TaxImpactEstimator;
