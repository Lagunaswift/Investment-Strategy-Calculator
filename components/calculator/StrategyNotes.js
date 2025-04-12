import React from 'react';

const StrategyNotes = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Strategy Rationale & Notes</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          The suggested asset allocation is based on the inputs you provided (risk tolerance, time horizon, goals). The goal is typically to balance potential returns with acceptable levels of risk.
        </p>
        <p>
          Higher risk tolerance and longer time horizons generally allow for a greater allocation to growth-oriented assets like stocks and potentially crypto, as there's more time to recover from potential downturns.
        </p>
        <p>
          Conservative profiles will lean more towards bonds and potentially gold to preserve capital and reduce volatility. The inclusion of assets like Gold or Crypto aims to provide diversification benefits, although their specific impact depends on market conditions.
        </p>
        <p className="text-xs italic text-gray-400 pt-2">
           Note: This tool provides a model allocation. You should consider your unique financial situation and consult with a financial advisor before making investment decisions.
        </p>
      </div>
    </div>
  );
};

export default StrategyNotes;
