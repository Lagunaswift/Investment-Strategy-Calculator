// pages/api/simulate.js

// --- Monte Carlo Simulation Logic ---

// Basic assumptions (replace with more dynamic/configurable values if needed)
const assumptions = {
    stock: { meanReturn: 0.08, volatility: 0.15 },
    bond: { meanReturn: 0.03, volatility: 0.05 },
    crypto: { meanReturn: 0.15, volatility: 0.50 }, // High risk/return
    gold: { meanReturn: 0.04, volatility: 0.18 },
    correlation: { // Simplified correlations (example)
        stock_bond: 0.2,
        stock_crypto: 0.3,
        stock_gold: 0.1,
        bond_crypto: 0.1,
        bond_gold: 0.05,
        crypto_gold: 0.2
    }
};

// Helper for normally distributed random number (Box-Muller transform)
function randomNormal(mean = 0, stdev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stdev * num;
}

// Core Simulation Function
const runMonteCarloSimulation = (params, numSimulations = 1000) => {
    const { 
        startingBalance, 
        monthlyInvestment, 
        timeHorizon, // years
        allocations, // { stock: %, bond: %, crypto: %, gold: % }
        annualFee // decimal format (e.g., 0.005 for 0.5%)
    } = params;

    const finalBalances = [];
    const yearlyBalances = Array(numSimulations).fill(null).map(() => Array(timeHorizon).fill(0)); 
    const monthlyRate = 1 / 12;

    // Basic geometric Brownian motion simulation for each path
    for (let i = 0; i < numSimulations; i++) {
        let balance = startingBalance;
        for (let year = 0; year < timeHorizon; year++) {
            for (let month = 0; month < 12; month++) {
                balance += monthlyInvestment;
                
                // Calculate weighted return for the month based on random variables
                // Note: This simplified model doesn't explicitly use correlations yet.
                // A more complex model (e.g., Cholesky decomposition) would be needed for accurate correlation.
                let monthlyReturn = 0;
                if (allocations.stock > 0) {
                    monthlyReturn += (allocations.stock / 100) * randomNormal(assumptions.stock.meanReturn * monthlyRate, assumptions.stock.volatility * Math.sqrt(monthlyRate));
                }
                if (allocations.bond > 0) {
                    monthlyReturn += (allocations.bond / 100) * randomNormal(assumptions.bond.meanReturn * monthlyRate, assumptions.bond.volatility * Math.sqrt(monthlyRate));
                }
                if (allocations.crypto > 0) {
                    monthlyReturn += (allocations.crypto / 100) * randomNormal(assumptions.crypto.meanReturn * monthlyRate, assumptions.crypto.volatility * Math.sqrt(monthlyRate));
                }
                if (allocations.gold > 0) {
                    monthlyReturn += (allocations.gold / 100) * randomNormal(assumptions.gold.meanReturn * monthlyRate, assumptions.gold.volatility * Math.sqrt(monthlyRate));
                }
                
                balance *= (1 + monthlyReturn);
            }
             // Apply annual fee at the end of the year
             balance *= (1 - annualFee);
             // Record balance at the end of the year
             if (year < timeHorizon) { // Ensure we don't write out of bounds (though loop condition handles this)
                 yearlyBalances[i][year] = balance;
             }
        }
        finalBalances.push(balance);
    }

    // Sort results to find percentiles
    finalBalances.sort((a, b) => a - b);

    // Calculate percentiles
    const p10Index = Math.floor(numSimulations * 0.10);
    const p50Index = Math.floor(numSimulations * 0.50);
    const p90Index = Math.floor(numSimulations * 0.90);
    const average = finalBalances.reduce((sum, val) => sum + val, 0) / numSimulations;

    // Calculate time series data (P10, P50, P90 for each year)
    const timeSeriesData = { 
        years: Array.from({ length: timeHorizon }, (_, i) => i + 1), // Array [1, 2, ..., timeHorizon]
        p10: [], 
        p50: [], 
        p90: [] 
    };

    for (let year = 0; year < timeHorizon; year++) {
        const balancesForYear = yearlyBalances.map(sim => sim[year]);
        balancesForYear.sort((a, b) => a - b);

        timeSeriesData.p10.push(balancesForYear[p10Index]);
        timeSeriesData.p50.push(balancesForYear[p50Index]);
        timeSeriesData.p90.push(balancesForYear[p90Index]);
    }

    return {
        summary: {
            p10: finalBalances[p10Index],
            p50: finalBalances[p50Index],
            p90: finalBalances[p90Index],
            average: average,
        },
        timeSeriesData: timeSeriesData 
    };
};


export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const params = req.body;

            // Basic validation (can be expanded)
            if (!params || typeof params !== 'object') {
                return res.status(400).json({ message: 'Invalid request body' });
            }
            // Add checks for essential parameters like timeHorizon, allocations etc. if needed
            
            if (typeof params.timeHorizon !== 'number' || params.timeHorizon <= 0) {
                return res.status(400).json({ message: 'Invalid time horizon' });
            }
            if (!params.allocations || typeof params.allocations !== 'object') {
                return res.status(400).json({ message: 'Missing or invalid allocations' });
            }
            // Ensure allocations roughly sum to 100 (allow for float precision)
            const totalAlloc = Object.values(params.allocations).reduce((sum, val) => sum + (val || 0), 0);
            if (Math.abs(totalAlloc - 100) > 0.1) {
                console.warn("API received allocations not summing to 100:", params.allocations);
                // Allow processing but maybe log it / handle as needed
            }
            
            // Run the (placeholder) simulation
            const results = runMonteCarloSimulation(params);

            // Send back the results
            res.status(200).json(results);

        } catch (error) {
            console.error("API Simulation Error:", error);
            res.status(500).json({ message: error.message || 'Error running simulation' });
        }
    } else {
        // Handle any non-POST requests
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
