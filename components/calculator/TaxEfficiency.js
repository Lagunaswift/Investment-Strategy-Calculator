import React from 'react';

const TaxEfficiency = () => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h4 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Tax Efficiency Considerations</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <p>
          Investment returns can be significantly impacted by taxes. Different account types (e.g., taxable brokerage accounts, retirement accounts like 401(k)s or IRAs) have different tax treatments.
        </p>
        <p>
          In many regions, tax-advantaged accounts offer benefits like tax-deferred growth or tax-free withdrawals in retirement. Utilizing these accounts effectively can enhance long-term returns.
        </p>
        <p>
          Within taxable accounts, consider strategies like tax-loss harvesting (selling losing investments to offset gains) and holding investments for the long term to potentially qualify for lower capital gains tax rates. The tax efficiency of specific investment vehicles (like ETFs vs. mutual funds) can also vary.
        </p>
        <p className="text-xs italic text-gray-400 pt-2">
          Note: Tax laws are complex and vary by jurisdiction. This information is general in nature. Consult a qualified tax professional for advice specific to your situation.
        </p>
      </div>
    </div>
  );
};

export default TaxEfficiency;
