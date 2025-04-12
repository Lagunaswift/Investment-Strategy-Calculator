// components/calculator/RiskProfileSummary.js
import React from 'react';

const RiskProfileSummary = ({ riskProfile, allocations, includeCrypto, includeGold }) => {
  const profileData = {
    conservative: {
      color: 'pastel-bg-blue',
      textColor: 'pastel-text-blue',
      bgColor: 'pastel-bg-blue',
      expectedVolatility: '10-15%',
      maxDrawdown: '15-20%',
      description: 'Focuses on capital preservation with moderate growth potential'
    },
    moderate: {
      color: 'pastel-bg-green',
      textColor: 'pastel-text-green',
      bgColor: 'pastel-bg-green',
      expectedVolatility: '15-20%',
      maxDrawdown: '20-25%',
      description: 'Balanced approach with moderate risk and growth'
    },
    aggressive: {
      color: 'pastel-bg-purple',
      textColor: 'pastel-text-purple',
      bgColor: 'pastel-bg-purple',
      expectedVolatility: '20-25%',
      maxDrawdown: '25-30%',
      description: 'Growth-focused with higher risk tolerance'
    }
  };

  const profile = profileData[riskProfile.toLowerCase()];

  // Calculate portfolio risk score based on current allocations
  const calculateRiskScore = () => {
    const riskFactors = {
      stock: 0.8,
      bond: 0.2,
      crypto: 1.2,
      gold: 0.5
    };

    let score = 0;
    Object.entries(allocations).forEach(([asset, pct]) => {
      if (pct > 0) {
        score += pct * (riskFactors[asset] || 0);
      }
    });
    return Math.round(score);
  };

  // Helper function to get text color based on background color
  const getTextColor = (bgColor) => {
    const lightColors = ['pastel-bg-blue', 'pastel-bg-green', 'pastel-bg-purple'];
    return lightColors.includes(bgColor) ? 'text-gray-900' : 'text-white';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <h4 className="text-md font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">Risk Profile Summary</h4>
      <div className="space-y-4">
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-${profile.textColor} ${profile.bgColor} text-white mr-3`}>
            <span className="font-semibold text-lg">{riskProfile[0]}</span>
          </div>
          <div>
            <h5 className={`font-medium ${profile.textColor}`}>{riskProfile}</h5>
            <p className="text-sm text-gray-500">{profile.description}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className={`bg-${profile.color} p-3 rounded-lg border border-${profile.color}`}>
            <p className="text-sm text-${profile.textColor} mb-1">Expected Volatility</p>
            <p className="font-medium text-${profile.textColor}">{profile.expectedVolatility}</p>
          </div>
          <div className={`bg-${profile.color} p-3 rounded-lg border border-${profile.color}`}>
            <p className="text-sm text-${profile.textColor} mb-1">Max Drawdown</p>
            <p className="font-medium text-${profile.textColor}">{profile.maxDrawdown}</p>
          </div>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <h5 className="text-sm text-gray-500 mb-2">Portfolio Risk Score</h5>
          <div className="flex items-center">
            <div className="relative w-full max-w-xs h-4 rounded-full bg-gray-200 overflow-hidden">
              <div 
                className={`h-4 rounded-full absolute left-0 top-0 ${profile.bgColor}`} 
                style={{ width: `${calculateRiskScore()}%` }}
              />
            </div>
            <span className="ml-2 text-sm font-medium text-gray-500">
              {calculateRiskScore()}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskProfileSummary;
