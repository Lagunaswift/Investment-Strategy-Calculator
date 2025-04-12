// components/calculator/CustomAllocationSliders.js
import React from 'react';

const Slider = ({ label, value, onChange, min = 0, max = 100, step = 1 }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}: {value}%</label>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-blue accent-brand-blue"
    />
  </div>
);

const CustomAllocationSliders = ({
  customStockAllocation, onStockChange,
  customBondAllocation, onBondChange,
  customCryptoAllocation, onCryptoChange,
  customGoldAllocation, onGoldChange,
  includeCrypto,
  includeGold,
  totalCustomAllocation
}) => {
  const availableAssets = 2 + (includeCrypto ? 1 : 0) + (includeGold ? 1 : 0);
  const remainingAllocation = 100 - totalCustomAllocation;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Customize Your Allocation</h3>
      <p className="text-sm text-gray-600 mb-4">
        Adjust the sliders to set your desired allocation. The total must equal 100%.
      </p>

      <Slider label="Stocks" value={customStockAllocation} onChange={onStockChange} />
      <Slider label="Bonds" value={customBondAllocation} onChange={onBondChange} />
      {includeCrypto && (
        <Slider label="Cryptocurrency" value={customCryptoAllocation} onChange={onCryptoChange} />
      )}
      {includeGold && (
        <Slider label="Gold" value={customGoldAllocation} onChange={onGoldChange} />
      )}

      <div className="mt-4 text-sm font-medium">
        Total Allocation: <span className={`font-bold ${totalCustomAllocation === 100 ? 'text-green-600' : 'text-red-600'}`}>{totalCustomAllocation}%</span>
        {totalCustomAllocation !== 100 && (
          <span className="ml-2 text-red-600">({remainingAllocation > 0 ? `+${remainingAllocation}` : remainingAllocation}% remaining)</span>
        )}
      </div>
       {totalCustomAllocation !== 100 && (
         <p className="mt-2 text-xs text-red-500">Total allocation must be exactly 100% to proceed.</p>
       )}
    </div>
  );
};

export default CustomAllocationSliders;
