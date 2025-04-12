import React from 'react';

// Helper function to format currency (can be moved to a utils file)
const formatCurrencyValue = (value, currency) => {
    const symbols = { USD: '$', GBP: '£', EUR: '€', AUD: 'A$' }; // Simplified
    return `${symbols[currency] || '$'}${Math.round(value).toLocaleString()}`;
};

const SummaryBox = ({ title, value, bgColor, currency }) => (
    <div className={`p-4 rounded-lg text-center shadow ${bgColor}`}>
        <p className="text-sm font-medium text-gray-700 mb-1">{title}</p>
        <p className="text-xl md:text-2xl font-bold text-gray-900">{formatCurrencyValue(value, currency)}</p>
    </div>
);

const SimulationResultsDisplay = ({ projections, currency }) => {
    // Check if projections and summary exist
    // The 'projections' prop here IS the summary object from the parent
    if (!projections) {
        return <p className="text-center text-gray-500 italic mt-4">No simulation data available. Run the simulation first.</p>;
    }

    const { p10, p50, p90, average } = projections; // Destructure expected summary fields

    return (
        <div className="mt-8 pt-6 border-t border-gray-300">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Projected Portfolio Value</h3>
            <p className="text-xs text-gray-500 mb-4 italic">
                Based on Monte Carlo simulation (1000 paths). Results show potential outcomes, not guarantees.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SummaryBox 
                    title="Worst 10% (P10)" 
                    value={p10} 
                    bgColor="bg-red-100"
                    currency={currency}
                />
                <SummaryBox 
                    title="Median (P50)" 
                    value={p50} 
                    bgColor="bg-yellow-100"
                    currency={currency}
                />
                <SummaryBox 
                    title="Best 10% (P90)" 
                    value={p90} 
                    bgColor="bg-green-100"
                    currency={currency}
                />
            </div>
            {/* Optional: Add Average display if needed */}
            {/* {average && (
                 <p className="text-center text-sm text-gray-600 mt-3">Average Outcome: {formatCurrencyValue(average, currency)}</p>
            )} */}
        </div>
    );
};

export default SimulationResultsDisplay;
