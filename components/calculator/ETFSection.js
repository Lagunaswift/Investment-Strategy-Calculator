import React from 'react';

const ETFSection = ({ currency, etfRecommendations }) => {
    // Helper function to get colors based on category
    const getCategoryColors = (categoryKey) => {
        // Map each category to a specific pastel color theme
        const colorMap = {
            largeCap: { bg: 'pastel-bg-blue', border: 'pastel-border-blue', text: 'pastel-text-blue' },
            techGrowth: { bg: 'pastel-bg-purple', border: 'pastel-border-purple', text: 'pastel-text-purple' },
            healthcare: { bg: 'pastel-bg-teal', border: 'pastel-border-teal', text: 'pastel-text-teal' },
            financials: { bg: 'pastel-bg-green', border: 'pastel-border-green', text: 'pastel-text-green' },
            energy: { bg: 'pastel-bg-orange', border: 'pastel-border-orange', text: 'pastel-text-orange' },
            developed: { bg: 'pastel-bg-lime', border: 'pastel-border-lime', text: 'pastel-text-lime' },
            emerging: { bg: 'pastel-bg-red', border: 'pastel-border-red', text: 'pastel-text-red' },
            bonds: { bg: 'pastel-bg-yellow', border: 'pastel-border-yellow', text: 'pastel-text-yellow' },
            gold: { bg: 'pastel-bg-amber', border: 'pastel-border-amber', text: 'pastel-text-amber' },
            bitcoin: { bg: 'pastel-bg-orange', border: 'pastel-border-orange', text: 'pastel-text-orange' },
            ethereum: { bg: 'pastel-bg-purple', border: 'pastel-border-purple', text: 'pastel-text-purple' }
        };
        
        return colorMap[categoryKey] || { bg: 'pastel-bg-blue', border: 'pastel-border-blue', text: 'pastel-text-blue' }; // Default to blue
    };

    const renderETFTable = (categoryKey, categoryName) => {
        // Use the categoryKey to look up the ETF list for the current currency
        const etfList = etfRecommendations[currency]?.[categoryKey];

        if (!etfList || etfList.length === 0) {
            return (
                <div className="mb-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-1">{categoryName}</h4>
                    <p className="text-sm text-gray-500 italic">No specific recommendations available for {currency}.</p>
                </div>
            );
        }

        return (
            <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-700 mb-2">{categoryName}</h4>
                <div className={`overflow-x-auto rounded-lg border border-${getCategoryColors(categoryKey).border}`}>
                    <table className="w-full text-sm text-left">
                        <thead className={`text-xs uppercase bg-${getCategoryColors(categoryKey).bg}`}>
                            <tr>
                                <th scope="col" className={`px-4 py-2 text-${getCategoryColors(categoryKey).text}`}>Ticker</th>
                                <th scope="col" className={`px-4 py-2 text-${getCategoryColors(categoryKey).text}`}>Name</th>
                                <th scope="col" className={`px-4 py-2 text-${getCategoryColors(categoryKey).text}`}>Expense Ratio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {etfList.map((etf, index) => (
                                <tr key={`${categoryKey}-${etf.ticker}-${index}`} className={`bg-white border-b border-${getCategoryColors(categoryKey).border} last:border-b-0 hover:bg-${getCategoryColors(categoryKey).bg}`}>
                                    <td className="px-4 py-2 font-medium whitespace-nowrap">{etf.ticker}</td>
                                    <td className="px-4 py-2">{etf.name}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{etf.expense}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    // Define the categories to render tables for (match keys in etfRecommendations)
    // Use the keys from your original etfRecommendations data
    const categories = [
        { key: 'largeCap', name: 'US Large Cap' },
        { key: 'techGrowth', name: 'US Tech/Growth' },
        { key: 'healthcare', name: 'US Healthcare' },
        { key: 'financials', name: 'US Financials' },
        { key: 'energy', name: 'US Energy' },
        { key: 'developed', name: 'Global Developed Markets (ex-US)' },
        { key: 'emerging', name: 'Global Emerging Markets' },
        { key: 'bonds', name: 'Bonds (Aggregate)' },
        { key: 'gold', name: 'Gold' },
        { key: 'bitcoin', name: 'Bitcoin' },
        { key: 'ethereum', name: 'Ethereum' }
    ];

    return (
        <div className="mt-8 pt-6 border-t border-pastel-border-blue">
            <h3 className="text-lg font-semibold text-brand-blue mb-4">Example ETF Recommendations ({currency})</h3>
            <p className="text-xs text-gray-500 mb-4 italic">Note: These are examples based on your selected currency and may not be suitable for all investors. Expense ratios and availability may vary. DYOR.</p>
            <div className="space-y-4">
                 {/* Render tables for each category dynamically */}
                 {categories.map(cat => renderETFTable(cat.key, cat.name))}
            </div>
        </div>
    );
};

export default ETFSection;
