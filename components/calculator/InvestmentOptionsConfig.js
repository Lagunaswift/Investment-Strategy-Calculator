// components/calculator/InvestmentOptionsConfig.js
import React from 'react';

const InvestmentOptionsConfig = ({ 
  options, 
  onOptionsChange, 
  includeCrypto, 
  includeGold 
}) => {
  // Handle changes to asset class parameters
  const handleChange = (assetClass, parameter, value) => {
    // Create a deep copy to avoid state mutation issues
    const updatedOptions = {
      ...options,
      [assetClass]: {
        ...options[assetClass],
        [parameter]: parseFloat(value)
      }
    };
    
    onOptionsChange(updatedOptions);
  };

  return (
    <div className="mb-8">
      <h3 className="text-md font-medium text-gray-700 mb-3">Configure Expected Returns & Volatility</h3>
      <p className="text-sm text-gray-500 mb-4">
        Adjust the expected annual returns and volatility for each asset class. These assumptions will affect your 
        Monte Carlo simulation results.
      </p>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stocks Configuration */}
        <div className="bg-pastel-bg-blue rounded-lg p-4 border border-pastel-border-blue">
          <h4 className="font-medium text-pastel-text-blue mb-2">Stocks</h4>
          
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Expected Annual Return (%)</label>
            <input 
              type="number" 
              min="0" 
              max="30" 
              step="0.1" 
              value={options.stock.expectedReturn} 
              onChange={(e) => handleChange('stock', 'expectedReturn', e.target.value)}
              className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-blue focus:border-pastel-text-blue shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Annual Volatility (%)</label>
            <input 
              type="number" 
              min="1" 
              max="50" 
              step="0.1" 
              value={options.stock.volatility} 
              onChange={(e) => handleChange('stock', 'volatility', e.target.value)}
              className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-blue focus:border-pastel-text-blue shadow-sm"
            />
          </div>
        </div>
        
        {/* Bonds Configuration */}
        <div className="bg-pastel-bg-yellow rounded-lg p-4 border border-pastel-border-yellow">
          <h4 className="font-medium text-pastel-text-yellow mb-2">Bonds</h4>
          
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Expected Annual Return (%)</label>
            <input 
              type="number" 
              min="0" 
              max="20" 
              step="0.1" 
              value={options.bond.expectedReturn} 
              onChange={(e) => handleChange('bond', 'expectedReturn', e.target.value)}
              className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-yellow focus:border-pastel-text-yellow shadow-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Annual Volatility (%)</label>
            <input 
              type="number" 
              min="1" 
              max="30" 
              step="0.1" 
              value={options.bond.volatility} 
              onChange={(e) => handleChange('bond', 'volatility', e.target.value)}
              className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-yellow focus:border-pastel-text-yellow shadow-sm"
            />
          </div>
        </div>
        
        {/* Gold Configuration (Conditional) */}
        {includeGold && (
          <div className="bg-pastel-bg-amber rounded-lg p-4 border border-pastel-border-amber">
            <h4 className="font-medium text-pastel-text-amber mb-2">Gold</h4>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Expected Annual Return (%)</label>
              <input 
                type="number" 
                min="0" 
                max="20" 
                step="0.1" 
                value={options.gold.expectedReturn} 
                onChange={(e) => handleChange('gold', 'expectedReturn', e.target.value)}
                className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-amber focus:border-pastel-text-amber shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Annual Volatility (%)</label>
              <input 
                type="number" 
                min="1" 
                max="30" 
                step="0.1" 
                value={options.gold.volatility} 
                onChange={(e) => handleChange('gold', 'volatility', e.target.value)}
                className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-amber focus:border-pastel-text-amber shadow-sm"
              />
            </div>
          </div>
        )}
        
        {/* Crypto Configuration (Conditional) */}
        {includeCrypto && (
          <div className="bg-pastel-bg-purple rounded-lg p-4 border border-pastel-border-purple">
            <h4 className="font-medium text-pastel-text-purple mb-2">Cryptocurrency</h4>
            
            <div className="mb-3">
              <label className="block text-xs text-gray-600 mb-1">Expected Annual Return (%)</label>
              <input 
                type="number" 
                min="0" 
                max="100" 
                step="0.1" 
                value={options.crypto.expectedReturn} 
                onChange={(e) => handleChange('crypto', 'expectedReturn', e.target.value)}
                className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-purple focus:border-pastel-text-purple shadow-sm"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Annual Volatility (%)</label>
              <input 
                type="number" 
                min="1" 
                max="150" 
                step="0.1" 
                value={options.crypto.volatility} 
                onChange={(e) => handleChange('crypto', 'volatility', e.target.value)}
                className="w-full text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-pastel-text-purple focus:border-pastel-text-purple shadow-sm"
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 text-xs text-gray-400 italic">
        These values are for simulation purposes only and are not investment advice.
        Past performance is not indicative of future results.
      </div>
    </div>
  );
};

export default InvestmentOptionsConfig;
