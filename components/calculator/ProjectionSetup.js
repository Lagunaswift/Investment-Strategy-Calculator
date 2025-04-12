import React from 'react';

const ProjectionSetup = ({
  startingBalance, 
  setStartingBalance,
  accountType, 
  setAccountType,
  annualFee, 
  setAnnualFee,
  currency,
  currencySymbols
}) => {

  const handleStartingBalanceChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal
    setStartingBalance(value === '' ? '' : parseFloat(value));
  };

  const handleAnnualFeeChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, ''); // Allow only numbers and decimal
    setAnnualFee(value === '' ? '' : parseFloat(value));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Starting Balance Input */}
      <div>
        <label htmlFor="startingBalance" className="block text-sm font-medium text-gray-700 mb-1">
          Starting Balance ({currencySymbols[currency]})
        </label>
        <input
          type="text" // Use text to allow empty string and formatting
          id="startingBalance"
          name="startingBalance"
          value={startingBalance === '' ? '' : startingBalance.toLocaleString()} // Format for display
          onChange={handleStartingBalanceChange}
          placeholder="e.g., 10000"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Account Type Selection */}
      <div>
        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">
          Account Type
        </label>
        <select
          id="accountType"
          name="accountType"
          value={accountType}
          onChange={(e) => setAccountType(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="Taxable">Taxable</option>
          <option value="Tax-Advantaged">Tax-Advantaged (IRA, 401k, etc.)</option>
          {/* Add other types if needed */}
        </select>
      </div>

      {/* Annual Fee Input */}
      <div>
        <label htmlFor="annualFee" className="block text-sm font-medium text-gray-700 mb-1">
          Estimated Annual Fee (%)
        </label>
        <input
          type="text" // Use text to allow empty string and formatting
          id="annualFee"
          name="annualFee"
          value={annualFee === '' ? '' : annualFee} // No formatting needed for percentage usually
          onChange={handleAnnualFeeChange}
          placeholder="e.g., 0.5"
          className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>
    </div>
  );
};

export default ProjectionSetup;
