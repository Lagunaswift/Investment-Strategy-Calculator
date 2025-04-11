import React, { useState, useEffect } from 'react';

// --- Main Component ---
const PortfolioCalculator = () => {
    // --- State Definitions ---
    const [monthlyAmount, setMonthlyAmount] = useState(1000);
    const [currency, setCurrency] = useState('USD');
    const [riskLevel, setRiskLevel] = useState('moderate'); // User's selected risk level
    const [useCustomAllocation, setUseCustomAllocation] = useState(false);
    const [timeHorizon, setTimeHorizon] = useState(20);
    const [accountType, setAccountType] = useState('taxable');
    const [startingBalance, setStartingBalance] = useState(0);
    const [showSimulation, setShowSimulation] = useState(false);
    const [simulationResults, setSimulationResults] = useState(null);

    // State for Risk Questionnaire Answers
    const [q1Answer, setQ1Answer] = useState(null);
    const [q2Answer, setQ2Answer] = useState(null);
    const [q3Answer, setQ3Answer] = useState(null);
    const [q4Answer, setQ4Answer] = useState(null);
    const [q5Answer, setQ5Answer] = useState(null);
    const [riskQuestionnaireResult, setRiskQuestionnaireResult] = useState('');

    // --- Static Data / Configuration ---
    // Base risk profiles
    const riskProfiles = {
        conservative: { usStocks: 40, globalStocks: 25, bonds: 33, crypto: 2 },
        moderate: { usStocks: 52, globalStocks: 35, bonds: 8, crypto: 5 },
        aggressive: { usStocks: 60, globalStocks: 28, bonds: 2, crypto: 10 },
        veryAggressive: { usStocks: 55, globalStocks: 25, bonds: 0, crypto: 20 },
        // 'custom' profile will be managed by the 'allocations' state directly when active
        custom: { usStocks: 52, globalStocks: 35, bonds: 8, crypto: 5 } // Initial state for custom
    };

    // Current allocation state - initialized to moderate, potentially updated by custom sliders
    const [allocations, setAllocations] = useState(riskProfiles.moderate);

    // Static breakdowns (could be made stateful if needed)
    const usStocksBreakdown = { largeCap: 70, techGrowth: 30 };
    const globalStocksBreakdown = { developed: 60, emerging: 40 };
    const cryptoAllocation = { bitcoin: 80, ethereum: 20 };

    // State for calculated monetary amounts per category
    const [calculated, setCalculated] = useState({
        usStocks: 0, globalStocks: 0, bonds: 0, crypto: 0,
        largeCap: 0, techGrowth: 0, developed: 0, emerging: 0,
        bitcoin: 0, ethereum: 0
    });

    // --- Currency Symbols and ETF Data ---
    const currencySymbols = { USD: '$', GBP: '£', EUR: '€' };

    // Example European/UK ETF Alternatives (Replace/Expand with actual desired ETFs)
    const europeanETFAlternatives = {
        largeCap: [
            { ticker: "VUSA.L", name: "Vanguard S&P 500 UCITS ETF (GBP)", expense: "0.07%" },
            { ticker: "CSPX.L", name: "iShares Core S&P 500 UCITS ETF (GBP)", expense: "0.07%" },
            { ticker: "SXR8.DE", name: "iShares Core S&P 500 UCITS ETF (EUR)", expense: "0.07%" }
        ],
        techGrowth: [
            { ticker: "EQQQ.L", name: "Invesco EQQQ Nasdaq-100 UCITS ETF (GBP)", expense: "0.30%" },
            { ticker: "QDVE.L", name: "iShares NASDAQ 100 UCITS ETF (GBP)", expense: "0.33%" }
        ],
        developed: [
            { ticker: "VEUR.L", name: "Vanguard FTSE Developed Europe UCITS ETF (GBP)", expense: "0.10%" },
            { ticker: "IWRD.L", name: "iShares Core MSCI World UCITS ETF (GBP)", expense: "0.20%" }
        ],
        emerging: [
            { ticker: "VFEM.L", name: "Vanguard FTSE Emerging Markets UCITS ETF (GBP)", expense: "0.22%" },
            { ticker: "EMIM.L", name: "iShares Core MSCI Emerging Markets IMI UCITS ETF (GBP)", expense: "0.18%" }
        ],
        bonds: [
            { ticker: "VGOV.L", name: "Vanguard UK Gilt UCITS ETF (GBP)", expense: "0.07%" },
            { ticker: "IEAG.L", name: "iShares € Aggregate Bond UCITS ETF (EUR)", expense: "0.15%" }
        ],
        bitcoin: [
            { ticker: "Direct", name: "Via Exchange (Coinbase, Kraken etc)", expense: "Varies" },
            { ticker: "BTCE.DE", name: "ETC Group Physical Bitcoin ETC (EUR)", expense: "2.00%" },
            { ticker: "BTCW.L", name: "WisdomTree Physical Bitcoin (GBP)", expense: "0.95%" }
        ],
        ethereum: [
             { ticker: "Direct", name: "Via Exchange (Coinbase, Kraken etc)", expense: "Varies" },
             { ticker: "ETHW.L", name: "WisdomTree Physical Ethereum (GBP)", expense: "0.95%" },
             { ticker: "ZETH.SW", name: "21Shares Ethereum ETP (CHF)", expense: "2.50%" }
        ]
    };

    // Example US ETF Recommendations (Replace/Expand as needed)
    const etfRecommendations = {
        USD: {
            largeCap: [
                { ticker: "VOO", name: "Vanguard S&P 500 ETF", expense: "0.03%" },
                { ticker: "IVV", name: "iShares Core S&P 500 ETF", expense: "0.03%" }
            ],
            techGrowth: [
                { ticker: "QQQ", name: "Invesco QQQ Trust", expense: "0.20%" },
                { ticker: "VGT", name: "Vanguard Information Technology ETF", expense: "0.10%" }
            ],
            developed: [
                { ticker: "VEA", name: "Vanguard FTSE Developed Markets ETF", expense: "0.05%" },
                { ticker: "IEFA", name: "iShares Core MSCI EAFE ETF", expense: "0.07%" }
            ],
            emerging: [
                { ticker: "VWO", name: "Vanguard FTSE Emerging Markets ETF", expense: "0.08%" },
                { ticker: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", expense: "0.09%" }
            ],
            bonds: [
                { ticker: "BND", name: "Vanguard Total Bond Market ETF", expense: "0.03%" },
                { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", expense: "0.03%" }
            ],
             bitcoin: [
                 { ticker: "Direct", name: "Via Exchange (Coinbase, Kraken etc)", expense: "Varies" },
                 { ticker: "BITO", name: "ProShares Bitcoin Strategy ETF", expense: "0.95%" },
                 { ticker: "GBTC", name: "Grayscale Bitcoin Trust", expense: "1.50%" } // Note higher expense
             ],
             ethereum: [
                 { ticker: "Direct", name: "Via Exchange (Coinbase, Kraken etc)", expense: "Varies" },
                 { ticker: "ETHE", name: "Grayscale Ethereum Trust", expense: "2.50%" }
             ]
        },
        GBP: europeanETFAlternatives, // Use European list for GBP
        EUR: europeanETFAlternatives  // Use European list for EUR
    };

    // --- Event Handlers & Helper Functions ---

    const handleMonthlyAmountChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setMonthlyAmount(value);
    };

    const handleCurrencyChange = (e) => {
        setCurrency(e.target.value);
    };

    const handleTimeHorizonChange = (e) => {
        setTimeHorizon(parseInt(e.target.value));
    };

    const handleAccountTypeChange = (e) => {
        setAccountType(e.target.value);
    };

    const handleStartingBalanceChange = (e) => {
        const value = parseFloat(e.target.value) || 0;
        setStartingBalance(value);
    };

    // Handles changes from Risk Level buttons
     const handleRiskLevelChange = (newRiskLevel) => {
        setRiskLevel(newRiskLevel);
        if (newRiskLevel !== 'custom') {
            setAllocations(riskProfiles[newRiskLevel]);
            setUseCustomAllocation(false);
        } else {
            // If switching to custom, load the saved custom state
            // or keep the current if already custom
            setAllocations(riskProfiles.custom);
            setUseCustomAllocation(true);
        }
        setRiskQuestionnaireResult(''); // Clear questionnaire suggestion
    };

    // Handles changes from Custom Allocation sliders
    const handleAllocationChange = (category, value) => {
        const newValue = Math.max(0, Math.min(100, value));
        let newAllocations = { ...allocations, [category]: newValue };

        const categories = Object.keys(riskProfiles.conservative); // Get all category keys
        const total = categories.reduce((sum, key) => sum + (newAllocations[key] || 0), 0);

        if (total !== 100) {
            const otherCategories = categories.filter(key => key !== category);
            const otherTotal = otherCategories.reduce((sum, key) => sum + (newAllocations[key] || 0), 0);

            if (otherTotal > 0) {
                const adjustmentFactor = (100 - newValue) / otherTotal;
                otherCategories.forEach(key => {
                    newAllocations[key] = Math.round(newAllocations[key] * adjustmentFactor);
                });
                // Adjust rounding
                const finalTotal = categories.reduce((sum, key) => sum + (newAllocations[key] || 0), 0);
                if (finalTotal !== 100) {
                    const diff = 100 - finalTotal;
                    const adjustCat = otherCategories.length > 0 ? otherCategories[0] : categories.find(c => c !== category); // Find a category to adjust
                    newAllocations[adjustCat] = (newAllocations[adjustCat] || 0) + diff;
                     // Ensure not negative
                    if(newAllocations[adjustCat] < 0) newAllocations[adjustCat] = 0;
                     // Final check
                     const finalFinalTotal = categories.reduce((sum, key) => sum + (newAllocations[key] || 0), 0);
                    if (finalFinalTotal !== 100) newAllocations[category] += (100 - finalFinalTotal);
                }
            } else if(otherCategories.length > 0) {
                 // Distribute remainder if other categories are zero
                const remainder = 100 - newValue;
                otherCategories.forEach((key, index) => {
                    newAllocations[key] = Math.round(remainder / otherCategories.length);
                });
                 // Adjust rounding diff on first other category
                const finalTotalCheck = categories.reduce((sum, key) => sum + (newAllocations[key] || 0), 0);
                 if (finalTotalCheck !== 100) newAllocations[otherCategories[0]] += (100-finalTotalCheck);
            }
        }

        setAllocations(newAllocations);
        // Update the reference 'custom' profile
        riskProfiles.custom = { ...newAllocations };
    };

    // Calculates the adjusted risk level based on time horizon
    const getTimeHorizonAdjustedRisk = (currentSelectedRisk) => {
        if (currentSelectedRisk === 'custom') return 'custom';
        if (timeHorizon < 5) {
            switch (currentSelectedRisk) {
                case 'conservative': return 'conservative';
                case 'moderate': return 'conservative';
                case 'aggressive': return 'moderate';
                case 'veryAggressive': return 'aggressive';
                default: return currentSelectedRisk;
            }
        } else if (timeHorizon > 25 && currentSelectedRisk === 'conservative') {
             return 'moderate';
        }
        return currentSelectedRisk;
    };

    // Calculate the monetary values for display
    const calculateAllocations = () => {
        const effectiveRisk = riskLevel === 'custom' ? 'custom' : getTimeHorizonAdjustedRisk(riskLevel);
        const currentAllocs = riskLevel === 'custom' ? allocations : riskProfiles[effectiveRisk];

        const usStocksAmount = monthlyAmount * (currentAllocs.usStocks || 0) / 100;
        const globalStocksAmount = monthlyAmount * (currentAllocs.globalStocks || 0) / 100;
        const bondsAmount = monthlyAmount * (currentAllocs.bonds || 0) / 100;
        const cryptoAmount = monthlyAmount * (currentAllocs.crypto || 0) / 100;

        const largeCapAmount = usStocksAmount * usStocksBreakdown.largeCap / 100;
        const techGrowthAmount = usStocksAmount * usStocksBreakdown.techGrowth / 100;
        const developedAmount = globalStocksAmount * globalStocksBreakdown.developed / 100;
        const emergingAmount = globalStocksAmount * globalStocksBreakdown.emerging / 100;
        const bitcoinAmount = cryptoAmount * cryptoAllocation.bitcoin / 100;
        const ethereumAmount = cryptoAmount * cryptoAllocation.ethereum / 100;

        setCalculated({
            usStocks: usStocksAmount.toFixed(2), globalStocks: globalStocksAmount.toFixed(2),
            bonds: bondsAmount.toFixed(2), crypto: cryptoAmount.toFixed(2),
            largeCap: largeCapAmount.toFixed(2), techGrowth: techGrowthAmount.toFixed(2),
            developed: developedAmount.toFixed(2), emerging: emergingAmount.toFixed(2),
            bitcoin: bitcoinAmount.toFixed(2), ethereum: ethereumAmount.toFixed(2)
        });
    };

    // Basic Monte Carlo Simulation
     const runMonteCarloSimulation = (startAmount, monthlyContrib, numYears, currentAllocs) => {
        const NUM_SIMULATIONS = 1000;
        const NUM_MONTHS = numYears * 12;
        const assetReturns = {
            usStocks: { mean: 0.10, stdDev: 0.15 }, globalStocks: { mean: 0.08, stdDev: 0.17 },
            bonds: { mean: 0.03, stdDev: 0.05 }, crypto: { mean: 0.20, stdDev: 0.65 }
        };
        const results = [];

        for (let sim = 0; sim < NUM_SIMULATIONS; sim++) {
            let balance = startAmount;
            for (let month = 0; month < NUM_MONTHS; month++) {
                balance += monthlyContrib;
                let monthlyReturn = 0;
                for (const [assetClass, allocation] of Object.entries(currentAllocs)) {
                    if (!assetReturns[assetClass] || !allocation) continue;
                    const { mean, stdDev } = assetReturns[assetClass];
                    const u1 = Math.random(), u2 = Math.random();
                    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
                    const annualReturn = mean + (stdDev * z0);
                    const monthlyAssetReturn = Math.max(-1, Math.pow(1 + annualReturn, 1/12) - 1);
                    monthlyReturn += (monthlyAssetReturn * allocation / 100);
                }
                balance *= (1 + monthlyReturn);
                if (balance < 0) balance = 0;
            }
            results.push(Math.round(balance));
        }
        results.sort((a, b) => a - b);
        return {
            median: results[Math.floor(NUM_SIMULATIONS * 0.5)],
            pessimistic: results[Math.floor(NUM_SIMULATIONS * 0.1)],
            optimistic: results[Math.floor(NUM_SIMULATIONS * 0.9)],
        };
    };

    // Trigger simulation run
    const runSimulationHandler = () => { // Renamed to avoid conflict
        const effectiveRisk = riskLevel === 'custom' ? 'custom' : getTimeHorizonAdjustedRisk(riskLevel);
        const currentAllocs = riskLevel === 'custom' ? allocations : riskProfiles[effectiveRisk];
        const results = runMonteCarloSimulation(startingBalance, monthlyAmount, timeHorizon, currentAllocs);
        setSimulationResults(results);
        setShowSimulation(true);
    };

    // Risk Questionnaire calculation
    const calculateRiskProfile = () => {
        let score = 0;
        const answers = [q1Answer, q2Answer, q3Answer, q4Answer, q5Answer];
        if (answers.some(a => a === null)) {
            setRiskQuestionnaireResult("Please answer all questions."); return;
        }
        const scoreMap = { a: 1, b: 2, c: 3, d: 4 };
        answers.forEach(answer => { score += scoreMap[answer] || 0; });

        let suggestedProfile = 'moderate';
        if (score <= 7) suggestedProfile = 'conservative';
        else if (score <= 11) suggestedProfile = 'moderate';
        else if (score <= 15) suggestedProfile = 'aggressive';
        else suggestedProfile = 'veryAggressive';

        setRiskQuestionnaireResult(`Based on your answers, we suggest a ${suggestedProfile.toUpperCase()} risk profile. You can select this above.`);
        document.getElementById('risk-questionnaire')?.classList.add('hidden');
    };

     // Render helper for ETF tables
     const renderETFTable = (category) => {
        const etfList = etfRecommendations[currency]?.[category];
        if (!etfList || etfList.length === 0) return <p className="text-sm text-gray-500 italic mt-2">No specific recommendations available for {currency} in this category.</p>;
        return (
            <div className="mt-2 mb-4 overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                        <tr>
                            <th scope="col" className="px-3 py-2">Ticker</th>
                            <th scope="col" className="px-3 py-2">Name</th>
                            <th scope="col" className="px-3 py-2">Expense Ratio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {etfList.map((etf, index) => (
                            <tr key={`${category}-${etf.ticker}-${index}`} className="border-b">
                                <td className="px-3 py-2 font-medium whitespace-nowrap">{etf.ticker}</td>
                                <td className="px-3 py-2">{etf.name}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{etf.expense}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    // --- Effects ---
    // Recalculate displayed monetary amounts whenever relevant inputs change
    useEffect(() => {
        calculateAllocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [monthlyAmount, currency, riskLevel, allocations, timeHorizon]); // Added timeHorizon as it affects adjusted risk


    // --- Render ---
    const effectiveRiskDisplay = riskLevel === 'custom' ? 'custom' : getTimeHorizonAdjustedRisk(riskLevel);
    const displayAllocations = riskLevel === 'custom' ? allocations : riskProfiles[effectiveRiskDisplay];


    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Monthly Investment Calculator</h2>

            {/* --- Inputs Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Monthly Amount */}
                <div>
                    <label htmlFor="monthlyAmount" className="block text-gray-700 font-semibold mb-2">Monthly Investment Amount ({currencySymbols[currency]})</label>
                    <input id="monthlyAmount" type="number" value={monthlyAmount} onChange={handleMonthlyAmountChange} className="w-full p-2 border border-gray-300 rounded-md" min="0"/>
                </div>
                {/* Currency */}
                <div>
                    <label htmlFor="currency" className="block text-gray-700 font-semibold mb-2">Currency</label>
                    <select id="currency" value={currency} onChange={handleCurrencyChange} className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="USD">US Dollar ($)</option>
                        <option value="GBP">British Pound (£)</option>
                        <option value="EUR">Euro (€)</option>
                    </select>
                </div>
            </div>

             {/* Time Horizon */}
             <div className="mb-6">
                 <label htmlFor="timeHorizon" className="block text-gray-700 font-semibold mb-2">Investment Time Horizon (Years)</label>
                 <div className="grid grid-cols-1 gap-2">
                     <input id="timeHorizon" type="range" min="1" max="40" value={timeHorizon} onChange={handleTimeHorizonChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                     <div className="flex justify-between text-sm text-gray-600">
                         <span>1 year</span><span>{timeHorizon} years</span><span>40 years</span>
                     </div>
                 </div>
                 {/* Adjusted Risk Note */}
                 {riskLevel !== 'custom' && effectiveRiskDisplay !== riskLevel && (
                     <div className="mt-2 p-2 bg-teal-50 border border-teal-200 rounded-md text-sm text-teal-800">
                         <span className="font-medium">Note:</span> Based on your {timeHorizon}-year time horizon, a <span className='font-semibold'>{effectiveRiskDisplay.toUpperCase()}</span> profile might be more suitable than your selected <span className='font-semibold'>{riskLevel.toUpperCase()}</span> profile. The calculations below reflect the <span className='font-semibold'>{effectiveRiskDisplay.toUpperCase()}</span> allocation.
                     </div>
                 )}
             </div>

            {/* Risk Tolerance Selection */}
            <div className="mb-6">
                <label className="block text-gray-700 font-semibold mb-2">Risk Tolerance</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2"> {/* Adjusted grid for smaller screens */}
                    {Object.keys(riskProfiles).map((level) => (
                        <div key={level} className={`p-3 border rounded-md cursor-pointer text-center ${riskLevel === level ? 'bg-blue-100 border-blue-400' : 'border-gray-300 hover:bg-gray-50'}`} onClick={() => handleRiskLevelChange(level)}>
                           <div className="font-medium">{level.charAt(0).toUpperCase() + level.slice(1).replace(/([A-Z])/g, ' $1')}</div>
                           {/* Descriptions */}
                           {level === 'conservative' && <div className="text-xs text-gray-600 mt-1">Lower risk</div>}
                           {level === 'moderate' && <div className="text-xs text-gray-600 mt-1">Balanced</div>}
                           {level === 'aggressive' && <div className="text-xs text-gray-600 mt-1">Growth focus</div>}
                           {level === 'veryAggressive' && <div className="text-xs text-gray-600 mt-1">Max growth</div>}
                           {level === 'custom' && <div className="text-xs text-gray-600 mt-1">Design own</div>}
                        </div>
                    ))}
                </div>
            </div>

             {/* Risk Assessment Questionnaire */}
             <div className="mb-6">
                 <button onClick={() => { document.getElementById('risk-questionnaire')?.classList.toggle('hidden'); setRiskQuestionnaireResult(''); }} className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mb-2 text-sm"> {/* Adjusted width/size */}
                     Need help determining your risk tolerance? Take our assessment →
                 </button>
                 <div id="risk-questionnaire" className="hidden bg-gray-50 p-4 rounded-lg border border-gray-200"> {/* Added border */}
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Tolerance Assessment</h3>
                     <div className="space-y-4">
                         {/* Question 1 */}
                         <div>
                             <p className="font-medium text-gray-700 mb-2 text-sm">1. If your portfolio lost 20% of its value in a single month, what would you do?</p>
                             <div className="space-y-2">
                                 <div className="flex items-center"><input type="radio" id="q1a" name="q1" value="a" onChange={(e)=>setQ1Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q1a" className="text-sm text-gray-700">Sell everything (Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q1b" name="q1" value="b" onChange={(e)=>setQ1Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q1b" className="text-sm text-gray-700">Sell some (Mod. Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q1c" name="q1" value="c" onChange={(e)=>setQ1Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q1c" className="text-sm text-gray-700">Do nothing (Moderate)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q1d" name="q1" value="d" onChange={(e)=>setQ1Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q1d" className="text-sm text-gray-700">Buy more (Aggressive)</label></div>
                             </div>
                         </div>
                         {/* Question 2 */}
                         <div>
                             <p className="font-medium text-gray-700 mb-2 text-sm">2. Which statement best describes your investment goals?</p>
                             <div className="space-y-2">
                                 <div className="flex items-center"><input type="radio" id="q2a" name="q2" value="a" onChange={(e)=>setQ2Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q2a" className="text-sm text-gray-700">Preserving capital (Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q2b" name="q2" value="b" onChange={(e)=>setQ2Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q2b" className="text-sm text-gray-700">Growth, concerned loss (Moderate)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q2c" name="q2" value="c" onChange={(e)=>setQ2Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q2c" className="text-sm text-gray-700">Focus growth, accept volatility (Aggressive)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q2d" name="q2" value="d" onChange={(e)=>setQ2Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q2d" className="text-sm text-gray-700">Maximize returns, accept high volatility (Very Aggressive)</label></div>
                             </div>
                         </div>
                         {/* Question 3 */}
                         <div>
                             <p className="font-medium text-gray-700 mb-2 text-sm">3. How many years until you plan to begin withdrawing significant amounts?</p>
                             <div className="space-y-2">
                                 <div className="flex items-center"><input type="radio" id="q3a" name="q3" value="a" onChange={(e)=>setQ3Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q3a" className="text-sm text-gray-700">Less than 3 years (Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q3b" name="q3" value="b" onChange={(e)=>setQ3Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q3b" className="text-sm text-gray-700">3-5 years (Mod. Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q3c" name="q3" value="c" onChange={(e)=>setQ3Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q3c" className="text-sm text-gray-700">5-10 years (Moderate)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q3d" name="q3" value="d" onChange={(e)=>setQ3Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q3d" className="text-sm text-gray-700">10+ years (Aggressive)</label></div>
                             </div>
                         </div>
                         {/* Question 4 */}
                         <div>
                             <p className="font-medium text-gray-700 mb-2 text-sm">4. Which portfolio would you be most comfortable with?</p>
                             <div className="space-y-2">
                                 <div className="flex items-center"><input type="radio" id="q4a" name="q4" value="a" onChange={(e)=>setQ4Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q4a" className="text-sm text-gray-700">A: Low Return / Low Loss (Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q4b" name="q4" value="b" onChange={(e)=>setQ4Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q4b" className="text-sm text-gray-700">B: Med Return / Med Loss (Moderate)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q4c" name="q4" value="c" onChange={(e)=>setQ4Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q4c" className="text-sm text-gray-700">C: High Return / High Loss (Aggressive)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q4d" name="q4" value="d" onChange={(e)=>setQ4Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q4d" className="text-sm text-gray-700">D: Max Return / Max Loss (Very Aggressive)</label></div>
                             </div>
                         </div>
                         {/* Question 5 */}
                         <div>
                             <p className="font-medium text-gray-700 mb-2 text-sm">5. Have you invested in cryptocurrency before?</p>
                             <div className="space-y-2">
                                 <div className="flex items-center"><input type="radio" id="q5a" name="q5" value="a" onChange={(e)=>setQ5Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q5a" className="text-sm text-gray-700">No, not comfortable (Conservative)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q5b" name="q5" value="b" onChange={(e)=>setQ5Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q5b" className="text-sm text-gray-700">No, willing small allocation (Moderate)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q5c" name="q5" value="c" onChange={(e)=>setQ5Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q5c" className="text-sm text-gray-700">Yes, small amount (Aggressive)</label></div>
                                 <div className="flex items-center"><input type="radio" id="q5d" name="q5" value="d" onChange={(e)=>setQ5Answer(e.target.value)} className="mr-2 focus:ring-blue-500 h-4 w-4"/><label htmlFor="q5d" className="text-sm text-gray-700">Yes, actively invest (Very Aggressive)</label></div>
                             </div>
                         </div>
                         {/* Result Display Area */}
                         {riskQuestionnaireResult && (<p className="mt-4 text-sm font-medium text-blue-700 p-2 bg-blue-100 rounded">{riskQuestionnaireResult}</p>)}
                         <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={calculateRiskProfile}>Calculate My Risk Profile</button>
                     </div>
                 </div>
             </div>


             {/* Custom Allocation Section */}
             {useCustomAllocation && riskLevel === 'custom' && (
                 <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200"> {/* Added border */}
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Custom Asset Allocation</h3>
                     <p className="text-sm text-gray-600 mb-4">Adjust the sliders. Values auto-balance to 100%.</p>
                      {Object.keys(displayAllocations).map((category) => (
                          <div className="mb-4" key={category}>
                              <div className="flex justify-between mb-1">
                                  <label className="text-sm font-medium text-gray-700">{category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1')}: {displayAllocations[category]}%</label>
                                  <span className="text-sm text-gray-500">{currencySymbols[currency]}{calculated[category]}</span>
                              </div>
                              <input type="range" min="0" max="100" value={displayAllocations[category] || 0} onChange={(e) => handleAllocationChange(category, parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"/>
                          </div>
                      ))}
                 </div>
             )}

             {/* Allocation Summary & Breakdown */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 {/* Allocation Summary */}
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"> {/* Added border */}
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Asset Allocation</h3>
                     <div className="mb-6">
                         {Object.keys(displayAllocations).map((key) => (
                             <div className="flex items-center justify-between mb-2" key={key}>
                                <div className="flex items-center">
                                    <div className={`w-4 h-4 ${key === 'usStocks' ? 'bg-blue-500' : key === 'globalStocks' ? 'bg-green-500' : key === 'bonds' ? 'bg-yellow-500' : 'bg-purple-500'} rounded-sm mr-2`}></div>
                                    <span>{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ({displayAllocations[key]}%)</span>
                                </div>
                                <span className="font-semibold">{currencySymbols[currency]}{calculated[key]}</span>
                             </div>
                          ))}
                     </div>
                     {/* Allocation Bar */}
                     <div className="w-full bg-gray-200 rounded-full h-6 mb-6">
                         <div className="flex h-6 rounded-full overflow-hidden text-[10px] text-white font-medium"> {/* Added text styles */}
                             <div style={{width: `${displayAllocations.usStocks}%`}} className="bg-blue-500 flex items-center justify-center"> {displayAllocations.usStocks > 5 ? `${displayAllocations.usStocks}%` : ''} </div>
                             <div style={{width: `${displayAllocations.globalStocks}%`}} className="bg-green-500 flex items-center justify-center"> {displayAllocations.globalStocks > 5 ? `${displayAllocations.globalStocks}%` : ''} </div>
                             <div style={{width: `${displayAllocations.bonds}%`}} className="bg-yellow-500 flex items-center justify-center"> {displayAllocations.bonds > 5 ? `${displayAllocations.bonds}%` : ''} </div>
                             <div style={{width: `${displayAllocations.crypto}%`}} className="bg-purple-500 flex items-center justify-center"> {displayAllocations.crypto > 5 ? `${displayAllocations.crypto}%` : ''} </div>
                         </div>
                     </div>
                 </div>
                 {/* Detailed Breakdown */}
                 <div className="bg-gray-50 p-4 rounded-lg border border-gray-200"> {/* Added border */}
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Detailed Breakdown</h3>
                     {calculated.usStocks > 0 && (
                         <div className="mb-4">
                             <p className="font-medium text-gray-700 mb-2">US Stocks ({displayAllocations.usStocks}%):</p>
                             <div className="pl-4">
                                <div className="flex items-center justify-between mb-1 text-sm"><span>↳ Large-Cap ({usStocksBreakdown.largeCap}%)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.largeCap}</span></div>
                                <div className="flex items-center justify-between mb-1 text-sm"><span>↳ Tech/Growth ({usStocksBreakdown.techGrowth}%)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.techGrowth}</span></div>
                             </div>
                         </div>
                     )}
                     {calculated.globalStocks > 0 && (
                         <div className="mb-4">
                             <p className="font-medium text-gray-700 mb-2">Global Stocks ({displayAllocations.globalStocks}%):</p>
                             <div className="pl-4">
                                <div className="flex items-center justify-between mb-1 text-sm"><span>↳ Developed ({globalStocksBreakdown.developed}%)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.developed}</span></div>
                                <div className="flex items-center justify-between mb-1 text-sm"><span>↳ Emerging ({globalStocksBreakdown.emerging}%)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.emerging}</span></div>
                             </div>
                         </div>
                     )}
                      {calculated.bonds > 0 && (
                          <div className="mb-4">
                              <p className="font-medium text-gray-700 mb-2">Bonds ({displayAllocations.bonds}%):</p>
                               <div className="pl-4">
                                  <div className="flex items-center justify-between mb-1 text-sm"><span>(Total Bonds)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.bonds}</span></div>
                               </div>
                          </div>
                       )}
                      {calculated.crypto > 0 && (
                          <div className="mb-4">
                              <p className="font-medium text-gray-700 mb-2">Cryptocurrency ({displayAllocations.crypto}%):</p>
                              <div className="pl-4">
                                 <div className="flex items-center justify-between mb-1 text-sm"><span>↳ Bitcoin ({cryptoAllocation.bitcoin}%)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.bitcoin}</span></div>
                                 <div className="flex items-center justify-between mb-1 text-sm"><span>↳ Ethereum ({cryptoAllocation.ethereum}%)</span><span className="font-semibold">{currencySymbols[currency]}{calculated.ethereum}</span></div>
                              </div>
                          </div>
                      )}
                 </div>
             </div>

            {/* --- Recommended ETFs Section --- */}
             <div className="mb-8">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Recommended ETFs / Investment Options</h3>
                 {/* Conditionally render sections only if allocation > 0 */}
                 {displayAllocations.usStocks > 0 && (
                     <>
                         {calculated.largeCap > 0 && (
                             <div className="bg-blue-50 p-3 rounded-lg mb-2 border border-blue-100">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-medium text-blue-800 text-sm md:text-base">US Large-Cap ({currencySymbols[currency]}{calculated.largeCap}/month)</h4>
                                     <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => document.getElementById('large-cap-info')?.classList.toggle('hidden')}>Learn more</button>
                                 </div>
                                 <div id="large-cap-info" className="hidden mt-2 p-2 bg-blue-100 rounded-md text-xs text-blue-800"><p>Large-cap ETFs invest in major US companies (S&P 500). Offer broad market exposure, often with more stability and dividends.</p></div>
                                 {renderETFTable('largeCap')}
                             </div>
                         )}
                         {calculated.techGrowth > 0 && (
                              <div className="bg-blue-50 p-3 rounded-lg mb-2 border border-blue-100">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-medium text-blue-800 text-sm md:text-base">US Tech/Growth ({currencySymbols[currency]}{calculated.techGrowth}/month)</h4>
                                     <button className="text-xs text-blue-600 hover:text-blue-800" onClick={() => document.getElementById('tech-growth-info')?.classList.toggle('hidden')}>Learn more</button>
                                 </div>
                                 <div id="tech-growth-info" className="hidden mt-2 p-2 bg-blue-100 rounded-md text-xs text-blue-800"><p>Focus on companies with above-average growth potential (often tech like Nasdaq-100). Historically higher returns, higher volatility.</p></div>
                                 {renderETFTable('techGrowth')}
                             </div>
                         )}
                     </>
                 )}
                  {displayAllocations.globalStocks > 0 && (
                      <>
                          {calculated.developed > 0 && (
                              <div className="bg-green-50 p-3 rounded-lg mb-2 border border-green-100">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-medium text-green-800 text-sm md:text-base">Developed Markets ({currencySymbols[currency]}{calculated.developed}/month)</h4>
                                     <button className="text-xs text-green-600 hover:text-green-800" onClick={() => document.getElementById('developed-info')?.classList.toggle('hidden')}>Learn more</button>
                                 </div>
                                 <div id="developed-info" className="hidden mt-2 p-2 bg-green-100 rounded-md text-xs text-green-800"><p>Exposure to established economies outside your home country (e.g., Europe, Japan). Provides international diversification.</p></div>
                                 {renderETFTable('developed')}
                             </div>
                          )}
                          {calculated.emerging > 0 && (
                             <div className="bg-green-50 p-3 rounded-lg mb-2 border border-green-100">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-medium text-green-800 text-sm md:text-base">Emerging Markets ({currencySymbols[currency]}{calculated.emerging}/month)</h4>
                                     <button className="text-xs text-green-600 hover:text-green-800" onClick={() => document.getElementById('emerging-info')?.classList.toggle('hidden')}>Learn more</button>
                                 </div>
                                 <div id="emerging-info" className="hidden mt-2 p-2 bg-green-100 rounded-md text-xs text-green-800"><p>Invests in developing economies (e.g., China, India). Higher growth potential but increased volatility and risk.</p></div>
                                 {renderETFTable('emerging')}
                             </div>
                          )}
                      </>
                  )}
                  {displayAllocations.bonds > 0 && (
                       <div className="bg-yellow-50 p-3 rounded-lg mb-2 border border-yellow-100">
                         <div className="flex justify-between items-center mb-1">
                             <h4 className="font-medium text-yellow-800 text-sm md:text-base">Bonds ({currencySymbols[currency]}{calculated.bonds}/month)</h4>
                             <button className="text-xs text-yellow-600 hover:text-yellow-800" onClick={() => document.getElementById('bond-info')?.classList.toggle('hidden')}>Learn more</button>
                         </div>
                         <div id="bond-info" className="hidden mt-2 p-2 bg-yellow-100 rounded-md text-xs text-yellow-800"><p>Fixed-income investments. Generally lower volatility than stocks, provide income, and act as a portfolio stabilizer.</p></div>
                         {renderETFTable('bonds')}
                     </div>
                  )}
                  {displayAllocations.crypto > 0 && (
                      <>
                          {calculated.bitcoin > 0 && (
                             <div className="bg-orange-50 p-3 rounded-lg mb-2 border border-orange-100">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-medium text-orange-800 text-sm md:text-base">Bitcoin ({currencySymbols[currency]}{calculated.bitcoin}/month)</h4>
                                     <button className="text-xs text-orange-600 hover:text-orange-800" onClick={() => document.getElementById('bitcoin-info')?.classList.toggle('hidden')}>Learn more</button>
                                 </div>
                                 <div id="bitcoin-info" className="hidden mt-2 p-2 bg-orange-100 rounded-md text-xs text-orange-800"><p>Largest cryptocurrency, often seen as "digital gold". High volatility, potential high returns. Direct ownership recommended.</p></div>
                                 {renderETFTable('bitcoin')}
                             </div>
                          )}
                          {calculated.ethereum > 0 && (
                              <div className="bg-indigo-50 p-3 rounded-lg mb-2 border border-indigo-100">
                                 <div className="flex justify-between items-center mb-1">
                                     <h4 className="font-medium text-indigo-800 text-sm md:text-base">Ethereum ({currencySymbols[currency]}{calculated.ethereum}/month)</h4>
                                     <button className="text-xs text-indigo-600 hover:text-indigo-800" onClick={() => document.getElementById('ethereum-info')?.classList.toggle('hidden')}>Learn more</button>
                                 </div>
                                 <div id="ethereum-info" className="hidden mt-2 p-2 bg-indigo-100 rounded-md text-xs text-indigo-800"><p>Second-largest crypto, platform for decentralized apps (dApps). Utility focus, also highly volatile.</p></div>
                                 {renderETFTable('ethereum')}
                             </div>
                          )}
                      </>
                  )}
             </div>

             {/* --- Wyckoff Market Cycle Analysis --- */}
             {/* Note: This section uses hardcoded data and date from original snippets */}
             <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Wyckoff Market Cycle Analysis</h3>
                 <p className="mb-4 text-sm text-gray-700">Current market phase analysis based on Wyckoff methodology (as of April 11, 2025):</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                     {/* US Markets */}
                     <div className="p-3 border border-gray-200 rounded-md">
                         <h4 className="font-medium text-gray-800 mb-2">US Markets & FTSE</h4>
                         {/* S&P 500 */}
                         <div className="mb-2">
                             <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium">S&P 500:</span><span className="text-sm px-2 py-0.5 bg-red-100 text-red-800 rounded-full">Distribution / Early Markdown</span></div>
                             <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                                <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                                <div className="absolute top-0 h-full flex items-center" style={{left: '80%', transform: 'translateX(-50%)'}}><div className="h-4 w-1 bg-black border border-white rounded"></div></div>
                             </div>
                             <div className="flex justify-between text-xs text-gray-500 mt-1"><span>Acc</span><span>Markup</span><span>Dist</span><span>Markdown</span></div>
                         </div>
                          {/* Nasdaq */}
                         <div className="mb-2">
                              <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium">Nasdaq Comp:</span><span className="text-sm px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Re-acc / Distribution</span></div>
                             <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                                 <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                                 <div className="absolute top-0 h-full flex items-center" style={{left: '60%', transform: 'translateX(-50%)'}}><div className="h-4 w-1 bg-black border border-white rounded"></div></div>
                             </div>
                         </div>
                          {/* FTSE 100 */}
                         <div className="mb-2">
                              <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium">FTSE 100:</span><span className="text-sm px-2 py-0.5 bg-red-100 text-red-800 rounded-full">Distribution / Markdown</span></div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                                 <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                                 <div className="absolute top-0 h-full flex items-center" style={{left: '85%', transform: 'translateX(-50%)'}}><div className="h-4 w-1 bg-black border border-white rounded"></div></div>
                             </div>
                         </div>
                     </div>
                     {/* Cryptocurrencies */}
                     <div className="p-3 border border-gray-200 rounded-md">
                          <h4 className="font-medium text-gray-800 mb-2">Cryptocurrencies</h4>
                          {/* Bitcoin */}
                          <div className="mb-2">
                               <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium">Bitcoin:</span><span className="text-sm px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">Re-acc / Distribution</span></div>
                              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                                  <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                                  <div className="absolute top-0 h-full flex items-center" style={{left: '55%', transform: 'translateX(-50%)'}}><div className="h-4 w-1 bg-black border border-white rounded"></div></div>
                              </div>
                          </div>
                          {/* Ethereum */}
                          <div className="mb-2">
                               <div className="flex justify-between items-center mb-1"><span className="text-sm font-medium">Ethereum:</span><span className="text-sm px-2 py-0.5 bg-red-100 text-red-800 rounded-full">Markdown</span></div>
                               <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
                                   <div className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"></div>
                                   <div className="absolute top-0 h-full flex items-center" style={{left: '90%', transform: 'translateX(-50%)'}}><div className="h-4 w-1 bg-black border border-white rounded"></div></div>
                               </div>
                          </div>
                     </div>
                 </div>
                 {/* How it affects portfolio */}
                 <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                     <h4 className="font-medium text-blue-800 mb-2">How This Affects Allocation:</h4>
                     <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1"> {/* Added space-y-1 */}
                         <li>Slightly reducing exposure to broad US markets (S&P 500) given distribution signals.</li>
                         <li>Maintaining technology exposure (Nasdaq components) showing relative strength.</li>
                         <li>Underweighting UK market exposure due to FTSE 100's technical weakness.</li>
                         <li>Favoring Bitcoin over Ethereum within crypto based on relative strength/phase.</li>
                         {/* Updated bond allocation message based on displayAllocations */}
                         {(displayAllocations.bonds > 5)
                            ? <li>Including a defensive bond position ({displayAllocations.bonds}%) as a buffer.</li>
                            : <li>Minimizing bond allocation ({displayAllocations.bonds}%) to focus on growth despite some market risk.</li>
                         }
                     </ul>
                 </div>
                 {/* Disclaimer */}
                 <div className="mt-4 text-xs text-gray-500">
                     <p>Market cycle analysis based on Wyckoff methodology as of April 11, 2025. Subjective and for informational purposes only. Past performance is not indicative of future results.</p>
                 </div>
             </div>


             {/* --- Investment Strategy Notes --- */}
             <div className="mb-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                 <h3 className="text-lg font-semibold text-blue-800 mb-2">Investment Strategy Notes</h3>
                 {/* List based on Wyckoff */}
                  <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1"> {/* Updated class */}
                     <li>Allocation reflects market conditions as of April 11, 2025.</li>
                     <li>US stocks slightly reduced due to potential S&P 500 distribution phase.</li>
                     <li>Tech sector emphasis recommended due to Nasdaq's relative strength.</li>
                     <li>Lower allocation to UK markets based on FTSE 100 technical weakness.</li>
                     <li>Higher Bitcoin allocation within crypto due to its relative strength.</li>
                    <li>Consider rebalancing quarterly if allocations drift significantly (e.g., &gt;5%).</li>
                 </ul>
                 {/* Risk Profile Text */}
                 <h4 className="font-medium text-blue-800 mt-4 mb-2 text-sm">
                     Using Profile: <span className="font-semibold">{effectiveRiskDisplay.charAt(0).toUpperCase() + effectiveRiskDisplay.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                     {riskLevel !== 'custom' && effectiveRiskDisplay !== riskLevel && ` (Adjusted from your selection: ${riskLevel.toUpperCase()})`}
                 </h4>
                 <p className="text-sm text-blue-700">
                     {effectiveRiskDisplay === 'conservative' && "This conservative portfolio prioritizes capital preservation..."}
                     {effectiveRiskDisplay === 'moderate' && "This moderate portfolio balances growth and stability..."}
                     {effectiveRiskDisplay === 'aggressive' && "This aggressive portfolio maximizes growth potential..."}
                     {effectiveRiskDisplay === 'veryAggressive' && "This very aggressive portfolio focuses exclusively on growth assets..."}
                     {effectiveRiskDisplay === 'custom' && "This custom portfolio reflects your personalized asset allocation preferences..."}
                 </p>
             </div>

             {/* --- Account Type & Starting Balance Inputs --- */}
             <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                     <label htmlFor="accountType" className="block text-gray-700 font-semibold mb-2">Account Type</label>
                     <select id="accountType" value={accountType} onChange={handleAccountTypeChange} className="w-full p-2 border border-gray-300 rounded-md">
                         <option value="taxable">Taxable Brokerage</option>
                         <option value="traditional">Traditional IRA/401(k)</option>
                         <option value="roth">Roth IRA/401(k)</option>
                     </select>
                 </div>
                 <div>
                     <label htmlFor="startingBalance" className="block text-gray-700 font-semibold mb-2">Current Portfolio Balance ({currencySymbols[currency]})</label>
                     <input id="startingBalance" type="number" value={startingBalance} onChange={handleStartingBalanceChange} className="w-full p-2 border border-gray-300 rounded-md" min="0"/>
                 </div>
             </div>

             {/* --- Run Simulation Button --- */}
             <div className="mb-6">
                 <button onClick={runSimulationHandler} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                     Run Performance Projection
                 </button>
             </div>

             {/* --- Simulation Results --- */}
             {showSimulation && simulationResults && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Projected Portfolio Value in {timeHorizon} Years</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center"> {/* Centered text */}
                         <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                             <div className="text-sm text-red-700 font-medium">Pessimistic</div>
                             <div className="text-xl font-bold text-red-800">{currencySymbols[currency]}{simulationResults.pessimistic.toLocaleString()}</div>
                             <div className="text-xs text-red-600">(10th percentile)</div>
                         </div>
                         <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                             <div className="text-sm text-blue-700 font-medium">Median</div>
                             <div className="text-xl font-bold text-blue-800">{currencySymbols[currency]}{simulationResults.median.toLocaleString()}</div>
                             <div className="text-xs text-blue-600">(50th percentile)</div>
                         </div>
                         <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                             <div className="text-sm text-green-700 font-medium">Optimistic</div>
                             <div className="text-xl font-bold text-green-800">{currencySymbols[currency]}{simulationResults.optimistic.toLocaleString()}</div>
                             <div className="text-xs text-green-600">(90th percentile)</div>
                         </div>
                     </div>
                     <div className="mt-4 text-xs text-gray-500 italic"> {/* Adjusted style */}
                         <p>Projections use Monte Carlo simulation based on historical averages and volatility. Actual results may vary significantly. Past performance does not guarantee future results.</p>
                     </div>
                </div>
             )}

             {/* --- Tax Efficiency Recommendations --- */}
             <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                 <h3 className="text-lg font-semibold text-gray-800 mb-4">Tax Efficiency Recommendations</h3>
                 {accountType === 'taxable' && (
                     <div>
                         <p className="mb-4 text-sm text-gray-700">For taxable accounts, consider placing tax-efficient assets here:</p>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="p-3 bg-green-50 border border-green-200 rounded-md"><h4 className="font-medium text-green-800 mb-1 text-sm">Good for Taxable</h4><ul className="list-disc pl-5 text-xs text-green-700 space-y-1"><li>US/Intl stock ETFs</li><li>Municipal bonds</li><li>Buy/hold crypto</li></ul></div>
                             <div className="p-3 bg-red-50 border border-red-200 rounded-md"><h4 className="font-medium text-red-800 mb-1 text-sm">Better in Tax-Advantaged</h4><ul className="list-disc pl-5 text-xs text-red-700 space-y-1"><li>Taxable bonds</li><li>REITs</li><li>Active funds</li><li>Frequent trades</li></ul></div>
                         </div>
                     </div>
                 )}
                 {accountType === 'traditional' && (
                     <div>
                         <p className="mb-4 text-sm text-gray-700">For Traditional IRA/401(k), focus on total return (tax-deferred growth):</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 bg-green-50 border border-green-200 rounded-md"><h4 className="font-medium text-green-800 mb-1 text-sm">Ideal for Traditional</h4><ul className="list-disc pl-5 text-xs text-green-700 space-y-1"><li>Taxable bonds</li><li>REITs</li><li>Dividend stocks</li><li>Active funds</li></ul></div>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md"><h4 className="font-medium text-blue-800 mb-1 text-sm">Tax Advantage</h4><p className="text-xs text-blue-700">Grows tax-deferred. Withdrawals taxed as ordinary income.</p></div>
                          </div>
                     </div>
                 )}
                 {accountType === 'roth' && (
                     <div>
                         <p className="mb-4 text-sm text-gray-700">For Roth IRA/401(k), prioritize highest growth potential (tax-free growth):</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-3 bg-green-50 border border-green-200 rounded-md"><h4 className="font-medium text-green-800 mb-1 text-sm">Ideal for Roth</h4><ul className="list-disc pl-5 text-xs text-green-700 space-y-1"><li>High-growth stocks</li><li>Small-cap/Emerging</li><li>Crypto</li><li>Highest potential assets</li></ul></div>
                              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md"><h4 className="font-medium text-blue-800 mb-1 text-sm">Tax Advantage</h4><p className="text-xs text-blue-700">Tax-free growth and withdrawals. Maximize by placing highest expected return assets here.</p></div>
                          </div>
                     </div>
                 )}
             </div>

            {/* --- Export/Print Buttons --- */}
             <div className="mt-8 flex flex-col sm:flex-row justify-between gap-4"> {/* Added gap, adjusted layout */}
                 <button onClick={() => {
                    const portfolioData = { monthlyAmount, currency, riskLevel, timeHorizon, accountType, startingBalance, allocations: displayAllocations, calculated }; // Use displayAllocations
                    const dataStr = JSON.stringify(portfolioData, null, 2);
                    const dataBlob = new Blob([dataStr], {type: 'application/json'});
                    const url = URL.createObjectURL(dataBlob);
                    const link = document.createElement('a');
                    link.download = `portfolio-plan-${new Date().toISOString().split('T')[0]}.json`;
                    link.href = url;
                    document.body.appendChild(link); // Append link to body
                    link.click();
                    document.body.removeChild(link); // Clean up link
                    URL.revokeObjectURL(url); // Clean up blob URL
                 }} className="w-full sm:w-auto px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"> {/* Adjusted size */}
                     Export Plan (JSON)
                 </button>
                 <button onClick={() => window.print()} className="w-full sm:w-auto px-5 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm"> {/* Adjusted size */}
                     Print Plan
                 </button>
             </div>

        </div> // End of main container div
    );
};

export default PortfolioCalculator;
