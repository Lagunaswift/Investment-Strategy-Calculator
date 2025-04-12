// components/calculator/AllocationSummary.js
import React from 'react';

const AllocationItem = ({ label, value, colorClass }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
    <span className="text-sm font-medium text-gray-700">{label}</span>
    <span className={`text-sm font-semibold ${colorClass}`}>{value}%</span>
  </div>
);

const AllocationSummary = ({
  stock,
  bond,
  crypto,
  gold,
  includeCrypto,
  includeGold,
  riskProfile // Optional: could be used for context later if needed
}) => {
  // Ensure values are numbers before formatting, default to 0 if undefined/null
  const stockValue = typeof stock === 'number' ? stock : 0;
  const bondValue = typeof bond === 'number' ? bond : 0;
  const cryptoValue = typeof crypto === 'number' ? crypto : 0;
  const goldValue = typeof gold === 'number' ? gold : 0;

  // Calculate total for verification (optional)
  const total = stockValue + bondValue + (includeCrypto ? cryptoValue : 0) + (includeGold ? goldValue : 0);

  // Basic validation color - could be more sophisticated
  const totalColor = Math.abs(total - 100) < 0.1 ? 'text-green-600' : 'text-red-600';

  return (
    <div className="mt-6 mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Calculated Allocation</h3>
      <div className="space-y-1">
        <AllocationItem label="Stocks" value={stockValue.toFixed(1)} colorClass="text-blue-600" />
        <AllocationItem label="Bonds" value={bondValue.toFixed(1)} colorClass="text-green-600" />
        {includeCrypto && (
          <AllocationItem label="Cryptocurrency" value={cryptoValue.toFixed(1)} colorClass="text-purple-600" />
        )}
        {includeGold && (
          <AllocationItem label="Gold" value={goldValue.toFixed(1)} colorClass="text-yellow-600" />
        )}
        <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
          <span className="text-sm font-bold text-gray-800">Total</span>
          <span className={`text-sm font-bold ${totalColor}`}>{total.toFixed(1)}%</span>
        </div>
      </div>
      {Math.abs(total - 100) >= 0.1 && (
        <p className="mt-2 text-xs text-red-500">Warning: Total allocation does not equal 100%. Please check inputs.</p>
      )}
    </div>
  );
};

export default AllocationSummary;
