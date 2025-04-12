// components/calculator/RiskSelection.js
import React from 'react';

const RiskSelection = ({ riskLevel, onRiskLevelChange, useCustomAllocation, onUseCustomAllocationChange }) => {
  const riskOptions = [
    { value: 'conservative', label: 'Conservative', color: 'bg-pastel-bg-teal', textColor: 'text-pastel-text-teal', hoverColor: 'hover:bg-teal-100' },
    { value: 'moderate', label: 'Moderate', color: 'bg-pastel-bg-blue', textColor: 'text-pastel-text-blue', hoverColor: 'hover:bg-blue-100' },
    { value: 'aggressive', label: 'Aggressive', color: 'bg-pastel-bg-amber', textColor: 'text-pastel-text-amber', hoverColor: 'hover:bg-amber-100' },
    { value: 'veryAggressive', label: 'Very\nAggressive', color: 'bg-pastel-bg-red', textColor: 'text-pastel-text-red', hoverColor: 'hover:bg-red-100' },
    { value: 'custom', label: 'Custom', color: 'bg-gray-200', textColor: 'text-gray-800', hoverColor: 'hover:bg-gray-300' },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-md font-medium text-gray-700 mb-2">Select Risk Profile</h3>
      {/* Changed to 3 columns max for better fitting, ensuring more space per button */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
        {riskOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onRiskLevelChange(option.value)}
            className={`p-2 text-xs min-h-[40px] whitespace-pre-line rounded-md text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue ${option.hoverColor} ${
              riskLevel === option.value
                ? `${option.color} ${option.textColor} font-semibold border-2 border-brand-blue shadow-md`
                : `${option.color} ${option.textColor}`
            } ${option.value === 'custom' ? 'italic' : ''}`}
            disabled={option.value === 'custom' && !useCustomAllocation}
          >
            {option.label}
          </button>
        ))}
      </div>
      {/* Custom Allocation Toggle */}
      <div className="flex items-center mt-4">
        <input
          type="checkbox"
          id="useCustomAllocation"
          checked={useCustomAllocation}
          onChange={(e) => onUseCustomAllocationChange(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-brand-blue focus:ring-1 focus:ring-brand-blue shadow-sm mr-2"
        />
        <label htmlFor="useCustomAllocation" className="text-sm font-medium text-gray-600">
          Use Custom Allocation (define below)
        </label>
      </div>
    </div>
  );
};

export default RiskSelection;
