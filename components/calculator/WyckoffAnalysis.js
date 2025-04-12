// components/calculator/WyckoffAnalysis.js
import React, { useState, useEffect } from 'react';
import { fetchWyckoffAnalysis, getCurrentQuarter } from '../../services/marketDataService';

const WyckoffAnalysis = ({ displayAllocations, includeCrypto, includeGold }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState('');
  
  // Fetch analysis data when component mounts
  useEffect(() => {
    const loadAnalysisData = async () => {
      try {
        setLoading(true);
        const data = await fetchWyckoffAnalysis();
        setAnalysisData(data);
        setLastUpdated(new Date(data.lastUpdated).toLocaleDateString());
        setLoading(false);
      } catch (err) {
        console.error('Error loading Wyckoff analysis:', err);
        setError('Unable to load market analysis. Please try again later.');
        setLoading(false);
      }
    };
    
    loadAnalysisData();
    
    // Set up a check to refresh data when the quarter changes
    const checkQuarter = () => {
      const currentQuarter = getCurrentQuarter();
      // Check if we're in a new quarter and reload data if needed
      if (analysisData && analysisData.timestamp !== currentQuarter.label) {
        loadAnalysisData();
      }
    };
    
    // Check monthly for quarter changes
    const intervalId = setInterval(checkQuarter, 30 * 24 * 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // If still loading or error occurred, show appropriate message
  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Wyckoff Market Cycle Analysis</h4>
        <p className="text-sm text-gray-500">Loading market analysis data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Wyckoff Market Cycle Analysis</h4>
        <p className="text-sm text-red-500">{error}</p>
      </div>
    );
  }
  
  // If we have data, render the analysis
  const formattedDate = lastUpdated || new Date().toLocaleDateString();

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Wyckoff Market Cycle Analysis</h4>
      <p className="mb-4 text-sm text-gray-700">Current market phase analysis based on Wyckoff methodology (as of {formattedDate}):</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-pastel-bg-gray rounded-lg border border-pastel-border-gray">
          <h5 className="font-medium text-pastel-text-gray mb-2">US Markets & FTSE</h5>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">S&P 500:</span>
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">{analysisData.markets.sp500.phase}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500"></div>
              <div className="absolute top-0 h-full flex items-center" style={{left: `${analysisData.markets.sp500.position}%`, transform: 'translateX(-50%)'}}>
                <div className="h-3 w-1 bg-black border border-white rounded"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Accum</span><span>Markup</span><span>Dist</span><span>Markdown</span>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Nasdaq Comp:</span>
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">{analysisData.markets.nasdaq.phase}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500"></div>
              <div className="absolute top-0 h-full flex items-center" style={{left: `${analysisData.markets.nasdaq.position}%`, transform: 'translateX(-50%)'}}>
                <div className="h-3 w-1 bg-black border border-white rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">FTSE 100:</span>
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">{analysisData.markets.ftse.phase}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500"></div>
              <div className="absolute top-0 h-full flex items-center" style={{left: `${analysisData.markets.ftse.position}%`, transform: 'translateX(-50%)'}}>
                <div className="h-3 w-1 bg-black border border-white rounded"></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-pastel-bg-gray rounded-lg border border-pastel-border-gray">
          <h5 className="font-medium text-pastel-text-gray mb-2">Cryptocurrencies</h5>
          
          <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Bitcoin:</span>
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">{analysisData.markets.bitcoin.phase}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500"></div>
              <div className="absolute top-0 h-full flex items-center" style={{left: `${analysisData.markets.bitcoin.position}%`, transform: 'translateX(-50%)'}}>
                <div className="h-3 w-1 bg-black border border-white rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="mb-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">Ethereum:</span>
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-800 rounded-full">{analysisData.markets.ethereum.phase}</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
              <div className="h-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-500"></div>
              <div className="absolute top-0 h-full flex items-center" style={{left: `${analysisData.markets.ethereum.position}%`, transform: 'translateX(-50%)'}}>
                <div className="h-3 w-1 bg-black border border-white rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-3 bg-pastel-bg-blue rounded-lg border border-pastel-border-blue">
        <h5 className="font-medium text-pastel-text-blue mb-2">How This Affects Allocation:</h5>
        <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
          {analysisData.recommendations.map((recommendation, index) => (
            <li key={index}>{recommendation}</li>
          ))}
          {displayAllocations && displayAllocations.bond > 5 ? 
            <li>Including a defensive bond position ({displayAllocations.bond}%) as a buffer.</li> : 
            <li>Minimizing bond allocation ({displayAllocations && displayAllocations.bond}%) to focus on growth despite some market risk.</li>
          }
          {!includeCrypto && <li>Note: Crypto allocation excluded based on user preference.</li>}
          {!includeGold && <li>Note: Gold allocation excluded based on user preference.</li>}
        </ul>
      </div>
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Market cycle analysis based on Wyckoff methodology as of {formattedDate}. Subjective and for informational purposes only. Past performance is not indicative of future results.</p>
        <p className="mt-1">Analysis automatically updated quarterly. Last updated: {lastUpdated}</p>
      </div>
    </div>
  );
};

export default WyckoffAnalysis;
