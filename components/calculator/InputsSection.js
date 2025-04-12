// components/calculator/InputsSection.js
import React from 'react';

// Component for handling monthly investment amount and currency
const InputsSection = ({
    monthlyAmount,
    onAmountChange,
    currency,
    onCurrencyChange,
    currencySymbols // Receive currencySymbols prop
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
                <label htmlFor="monthlyAmount" className="block text-sm font-medium text-gray-600 mb-1">Monthly Investment</label>
                <input
                    id="monthlyAmount"
                    type="number"
                    value={monthlyAmount}
                    onChange={onAmountChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue shadow-sm text-sm"
                    min="0"
                />
            </div>
            <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-600 mb-1">Currency</label>
                <select
                    id="currency"
                    value={currency}
                    onChange={onCurrencyChange}
                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 focus:ring-1 focus:ring-brand-blue focus:border-brand-blue shadow-sm text-sm"
                >
                    {Object.keys(currencySymbols || {}).map(key => (
                        <option key={key} value={key}>{key} ({currencySymbols[key]})</option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default InputsSection;
