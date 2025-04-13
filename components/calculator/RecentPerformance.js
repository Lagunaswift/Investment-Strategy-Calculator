// components/calculator/RecentPerformance.js
import React, { useState, useEffect } from 'react';
import { fetchQuarterlyPerformance, getCurrentQuarter } from '../../services/marketDataService';

const RecentPerformance = ({ allocations, includeCrypto, includeGold }) => {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Fetch performance data when component mounts
  useEffect(() => {
    const loadPerformanceData = async () => {
      try {
        setLoading(true);
        const data = await fetchQuarterlyPerformance();
        
        if (!data) {
          throw new Error('No data received from performance API');
        }
        
        setPerformanceData(data);
        setLastUpdated(data.lastUpdated ? new Date(data.lastUpdated).toLocaleDateString() : new Date().toLocaleDateString());
        setLoading(false);
      } catch (err) {
        console.error('Error loading quarterly performance data:', err);
        setError('Unable to load performance data. Using placeholder data.');
        setLoading(false);
      }
    };
    
    loadPerformanceData();
    
    // Set up a check to refresh data when the quarter changes
    const checkQuarter = () => {
      const currentQuarter = getCurrentQuarter();
      // Check if we're in a new quarter and reload data if needed
      if (performanceData && performanceData.timestamp !== currentQuarter.label) {
        loadPerformanceData();
      }
    };
    
    // Check monthly for quarter changes
    const intervalId = setInterval(checkQuarter, 30 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // If still loading, show loading message
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Last Quarter Performance</h4>
        <p className="text-sm text-gray-500">Loading performance data...</p>
      </div>
    );
  }
  
  // Format performance number
  const formatPerformance = (performance) => {
    if (performance === undefined || performance === null) {
      return '--%';
    }
    const prefix = performance > 0 ? '+' : '';
    return `${prefix}${performance.toFixed(1)}%`;
  };

  // Get CSS class for performance text
  const getPerformanceClass = (performance) => {
    if (performance === undefined || performance === null) {
      return 'text-gray-400';
    }
    if (performance > 0) return 'text-green-600';
    if (performance < 0) return 'text-red-600';
    return 'text-gray-500';
  };

  // Get trend arrow based on performance
  const getTrendArrow = (trend) => {
    if (trend === undefined || trend === null) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h.01" />
        </svg>
      );
    }
    switch (trend) {
      case 'up':
        return (
          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
          </svg>
        );
      case 'down':
        return (
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h.01" />
          </svg>
        );
    }
  };

  // Calculate weighted portfolio performance
  const calculatePortfolioPerformance = () => {
    if (!performanceData || !performanceData.assets) {
      return '--%';
    }
    
    let totalWeight = 0;
    let weightedPerformance = 0;
    let hasValidData = false;
    
    // Add stock component
    if (allocations.stock > 0 && performanceData?.assets?.stock?.performance !== undefined) {
      weightedPerformance += (allocations.stock / 100) * performanceData.assets.stock.performance;
      totalWeight += allocations.stock / 100;
      hasValidData = true;
    }
    
    // Add bond component
    if (allocations.bond > 0 && performanceData?.assets?.bond?.performance !== undefined) {
      weightedPerformance += (allocations.bond / 100) * performanceData.assets.bond.performance;
      totalWeight += allocations.bond / 100;
      hasValidData = true;
    }
    
    // Add crypto component
    if (includeCrypto && allocations.crypto > 0 && performanceData?.assets?.crypto?.performance !== undefined) {
      weightedPerformance += (allocations.crypto / 100) * performanceData.assets.crypto.performance;
      totalWeight += allocations.crypto / 100;
      hasValidData = true;
    }
    
    // Add gold component
    if (includeGold && allocations.gold > 0 && performanceData?.assets?.gold?.performance !== undefined) {
      weightedPerformance += (allocations.gold / 100) * performanceData.assets.gold.performance;
      totalWeight += allocations.gold / 100;
      hasValidData = true;
    }
    
    // Return formatted performance if we have valid data
    if (hasValidData && totalWeight > 0) {
      const result = weightedPerformance / totalWeight; // Normalize by actual weight
      return formatPerformance(result);
    }
    
    return '--%';
  };

  // Get asset details or error message
  const getAssetDetails = (asset) => {
    if (!performanceData || !performanceData.assets) {
      return 'Data not available';
    }
    
    const assetData = performanceData?.assets?.[asset];
    if (!assetData) {
      return 'No data available for this asset';
    }
    
    if (assetData.error) {
      return `Unable to retrieve data: ${assetData.error.message || 'Unknown error'}`;
    }
    
    return assetData.details || 'No details available';
  };

  const portfolioPerformance = calculatePortfolioPerformance();
  const portfolioTrend = portfolioPerformance.startsWith('+') ? 'up' : 
                         portfolioPerformance.startsWith('-') ? 'down' : 'neutral';
  
  // Fallback in case we have an error but performance data is missing
  if (error && (!performanceData || !performanceData.assets)) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Last Quarter Performance</h4>
        <p className="text-sm text-red-500">{error}</p>
        <p className="text-xs text-gray-500 mt-2">Showing placeholder data for demonstration purposes.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <div className="bg-pastel-bg-blue p-3 rounded-lg border border-pastel-border-blue">
            <div className="flex justify-between">
              <div>
                <h6 className="font-medium text-pastel-text-blue">Stocks</h6>
                <p className="text-xs text-gray-500 mt-0.5">{allocations.stock}% of portfolio</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-green-600">+2.8%</span>
                <div className="ml-1">
                  {getTrendArrow('up')}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Market conditions favorable for large-cap growth stocks</p>
          </div>
          
          <div className="bg-pastel-bg-yellow p-3 rounded-lg border border-pastel-border-yellow">
            <div className="flex justify-between">
              <div>
                <h6 className="font-medium text-pastel-text-yellow">Bonds</h6>
                <p className="text-xs text-gray-500 mt-0.5">{allocations.bond}% of portfolio</p>
              </div>
              <div className="flex items-center">
                <span className="font-medium text-red-600">-0.8%</span>
                <div className="ml-1">
                  {getTrendArrow('down')}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Interest rate pressures affecting fixed income</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-3 border-b pb-2">
        <h4 className="text-md font-semibold text-gray-800">Last Quarter Performance</h4>
        <span className="text-sm text-gray-500">{performanceData?.timestamp || 'Current Quarter'}</span>
      </div>
      
      <div className="mb-4">
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-3">
          <div className="flex justify-between items-center">
            <h5 className="font-medium text-gray-700">Current Portfolio</h5>
            <div className="flex items-center">
              <span className={`font-medium ${getPerformanceClass(parseFloat(portfolioPerformance))}`}>
                {portfolioPerformance}
              </span>
              <div className="ml-1">
                {getTrendArrow(portfolioTrend)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Weighted average based on your current allocation
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Stocks Performance */}
        <div className="bg-pastel-bg-blue p-3 rounded-lg border border-pastel-border-blue">
          <div className="flex justify-between">
            <div>
              <h6 className="font-medium text-pastel-text-blue">Stocks</h6>
              <p className="text-xs text-gray-500 mt-0.5">{allocations.stock}% of portfolio</p>
            </div>
            <div className="flex items-center">
              <span className={`font-medium ${getPerformanceClass(performanceData?.assets?.stock?.performance)}`}>
                {formatPerformance(performanceData?.assets?.stock?.performance)}
              </span>
              <div className="ml-1">
                {getTrendArrow(performanceData?.assets?.stock?.trend)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{getAssetDetails('stock')}</p>
        </div>
        
        {/* Bonds Performance */}
        <div className="bg-pastel-bg-yellow p-3 rounded-lg border border-pastel-border-yellow">
          <div className="flex justify-between">
            <div>
              <h6 className="font-medium text-pastel-text-yellow">Bonds</h6>
              <p className="text-xs text-gray-500 mt-0.5">{allocations.bond}% of portfolio</p>
            </div>
            <div className="flex items-center">
              <span className={`font-medium ${getPerformanceClass(performanceData?.assets?.bond?.performance)}`}>
                {formatPerformance(performanceData?.assets?.bond?.performance)}
              </span>
              <div className="ml-1">
                {getTrendArrow(performanceData?.assets?.bond?.trend)}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{getAssetDetails('bond')}</p>
        </div>
        
        {/* Crypto Performance (Conditional) */}
        {includeCrypto && (
          <div className="bg-pastel-bg-purple p-3 rounded-lg border border-pastel-border-purple">
            <div className="flex justify-between">
              <div>
                <h6 className="font-medium text-pastel-text-purple">Crypto</h6>
                <p className="text-xs text-gray-500 mt-0.5">{allocations.crypto}% of portfolio</p>
              </div>
              <div className="flex items-center">
                <span className={`font-medium ${getPerformanceClass(performanceData?.assets?.crypto?.performance)}`}>
                  {formatPerformance(performanceData?.assets?.crypto?.performance)}
                </span>
                <div className="ml-1">
                  {getTrendArrow(performanceData?.assets?.crypto?.trend)}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{getAssetDetails('crypto')}</p>
          </div>
        )}
        
        {/* Gold Performance (Conditional) */}
        {includeGold && (
          <div className="bg-pastel-bg-amber p-3 rounded-lg border border-pastel-border-amber">
            <div className="flex justify-between">
              <div>
                <h6 className="font-medium text-pastel-text-amber">Gold</h6>
                <p className="text-xs text-gray-500 mt-0.5">{allocations.gold}% of portfolio</p>
              </div>
              <div className="flex items-center">
                <span className={`font-medium ${getPerformanceClass(performanceData?.assets?.gold?.performance)}`}>
                  {formatPerformance(performanceData?.assets?.gold?.performance)}
                </span>
                <div className="ml-1">
                  {getTrendArrow(performanceData?.assets?.gold?.trend)}
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{getAssetDetails('gold')}</p>
          </div>
        )}
      </div>
      
      <p className="text-xs italic text-gray-400 mt-4">
        Note: Past performance is not indicative of future results. Performance data is for illustrative purposes only.
        <span className="block mt-1">Data automatically updated quarterly. Last updated: {lastUpdated}</span>
      </p>
    </div>
  );
};

export default RecentPerformance;
