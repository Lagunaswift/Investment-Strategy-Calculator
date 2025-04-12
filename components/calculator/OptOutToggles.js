// components/calculator/OptOutToggles.js
import React from 'react';

const OptOutToggles = ({ includeCrypto, onIncludeCryptoChange, includeGold, onIncludeGoldChange }) => {
  return (
    <div className="mb-6">
        <h4 className="text-md font-medium text-gray-700 mb-2">Asset Inclusion</h4>
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-2 sm:space-y-0 mt-2">
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="includeCrypto"
                    checked={includeCrypto}
                    onChange={(e) => onIncludeCryptoChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-brand-blue focus:ring-1 focus:ring-brand-blue shadow-sm mr-2"
                />
                <label htmlFor="includeCrypto" className="text-sm font-medium text-gray-600">
                    Include Cryptocurrency Allocation
                </label>
            </div>
            <div className="flex items-center">
                <input
                    type="checkbox"
                    id="includeGold"
                    checked={includeGold}
                    onChange={(e) => onIncludeGoldChange(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 bg-gray-50 text-brand-blue focus:ring-1 focus:ring-brand-blue shadow-sm mr-2"
                />
                <label htmlFor="includeGold" className="text-sm font-medium text-gray-600">
                    Include Gold Allocation
                </label>
            </div>
        </div>
    </div>
  );
};

export default OptOutToggles;
