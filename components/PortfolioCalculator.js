import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Tab } from '@headlessui/react'; // Import Tab
// import ResultsSummary from './ResultsSummary'; // Commented out - Not yet created
// import AssumptionsSection from './AssumptionsSection'; // Commented out - Not yet created

// Import the new components
import InputsSection from './calculator/InputsSection';
import TimeHorizonSection from './calculator/TimeHorizonSection';
import RiskSelection from './calculator/RiskSelection';
import OptOutToggles from './calculator/OptOutToggles';
import RiskQuestionnaire from './calculator/RiskQuestionnaire';
import CustomAllocationSliders from './calculator/CustomAllocationSliders';
import AllocationSummary from './calculator/AllocationSummary';
import ETFSection from './calculator/ETFSection'; // Import ETFSection
import ProjectionSetup from './calculator/ProjectionSetup'; // Import ProjectionSetup
import SimulationControls from './calculator/SimulationControls'; // Import SimulationControls
import SimulationResultsDisplay from './calculator/SimulationResultsDisplay'; // Import SimulationResultsDisplay
import AllocationChart from './calculator/AllocationChart'; // Import AllocationChart
import ProjectionChart from './calculator/ProjectionChart'; // Import ProjectionChart
// Removed redundant MarketAnalysis and StrategyNotes components
import TaxEfficiency from './calculator/TaxEfficiency';
import ExportControls from './calculator/ExportControls'; // Import ExportControls
import InvestmentOptionsConfig from './calculator/InvestmentOptionsConfig'; // Import InvestmentOptionsConfig
import CollapsibleSection from './ui/CollapsibleSection'; // Import CollapsibleSection
import WyckoffAnalysis from './calculator/WyckoffAnalysis'; // Import WyckoffAnalysis
import RecentPerformance from './calculator/RecentPerformance'; // Import RecentPerformance
import RiskProfileSummary from './calculator/RiskProfileSummary'; // Import RiskProfileSummary
import PerformanceComparison from './calculator/PerformanceComparison'; // Import PerformanceComparison
import TaxImpactEstimator from './calculator/TaxImpactEstimator'; // Import TaxImpactEstimator

// Helper function to format currency
const formatCurrency = (value, currency) => {
    // ... (Full, unchanged currency formatting logic from previous step) ...
};

// Helper function to calculate the score and determine risk profile
const calculateProfileFromAnswers = (answers) => {
    // Return early if any answers are missing
    if (!answers.q1 || !answers.q2 || !answers.q3 || !answers.q4 || !answers.q5) {
        return { 
            isComplete: false, 
            message: 'Please answer all questions to get your risk profile.'
        };
    }
    
    // Map answers to numerical scores
    const scoreMap = {
        'a': 1, // Conservative
        'b': 2, // Moderate Conservative / Moderate
        'c': 3, // Moderate / Aggressive 
        'd': 4  // Aggressive / Very Aggressive
    };
    
    // Calculate total score
    const totalScore = [
        scoreMap[answers.q1], 
        scoreMap[answers.q2], 
        scoreMap[answers.q3], 
        scoreMap[answers.q4], 
        scoreMap[answers.q5]
    ].reduce((sum, score) => sum + score, 0);
    
    // Determine risk profile based on score range
    let recommendedProfile;
    let description;
    
    if (totalScore <= 8) {
        recommendedProfile = 'conservative';
        description = 'Your answers suggest a Conservative risk profile. This typically means prioritizing capital preservation over growth potential.';
    } else if (totalScore <= 12) {
        recommendedProfile = 'moderate';
        description = 'Your answers suggest a Moderate risk profile. This typically means balancing growth potential with reasonable risk management.';
    } else if (totalScore <= 16) {
        recommendedProfile = 'aggressive';
        description = 'Your answers suggest an Aggressive risk profile. This typically means focusing on growth potential while accepting higher volatility.';
    } else {
        recommendedProfile = 'veryAggressive';
        description = 'Your answers suggest a Very Aggressive risk profile. This typically means maximizing growth potential while accepting significant volatility.';
    }
    
    return {
        isComplete: true,
        score: totalScore,
        recommendedProfile,
        description,
        message: `Based on your answers, your recommended risk profile is: ${recommendedProfile.charAt(0).toUpperCase() + recommendedProfile.slice(1)}`
    };
};

// Default investment options configuration
const defaultInvestmentOptions = {
    // These are used by the simulation logic and for UI display
    stock: { expectedReturn: 8.0, volatility: 15.0 },  // Changed to match component keys (no 's')
    bond: { expectedReturn: 3.0, volatility: 5.0 },    // Changed to match component keys (no 's')
    crypto: { expectedReturn: 15.0, volatility: 50.0 }, // Using percentages for UI display
    gold: { expectedReturn: 5.0, volatility: 18.0 },    // Using percentages for UI display
    inflation: 2.5,  // Changed to percentage for UI consistency
    taxRate: 20.0,   // Changed to percentage for UI consistency
};

// Currency symbols mapping
const currencySymbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'C$',
    AUD: 'A$'
};

const europeanETFAlternatives = { /* ... Original Data ... */ }; // Make sure full data is present

const etfRecommendations = {
    USD: {
         largeCap: [ { ticker: "VOO", name: "Vanguard S&P 500 ETF", expense: "0.03%" }, { ticker: "IVV", name: "iShares Core S&P 500 ETF", expense: "0.03%" } ],
         techGrowth: [ { ticker: "VGT", name: "Vanguard Information Technology ETF", expense: "0.10%" }, { ticker: "XLK", name: "Technology Select Sector SPDR Fund", expense: "0.09%" }, { ticker: "QQQ", name: "Invesco QQQ Trust (Nasdaq-100)", expense: "0.20%" } ],
         healthcare: [ { ticker: "VHT", name: "Vanguard Health Care ETF", expense: "0.10%" }, { ticker: "XLV", name: "Health Care Select Sector SPDR Fund", expense: "0.09%" } ],
         financials: [ { ticker: "VFH", name: "Vanguard Financials ETF", expense: "0.10%" }, { ticker: "XLF", name: "Financial Select Sector SPDR Fund", expense: "0.09%" } ],
         energy: [ { ticker: "VDE", name: "Vanguard Energy ETF", expense: "0.10%" }, { ticker: "XLE", name: "Energy Select Sector SPDR Fund", expense: "0.09%" } ],
         developed: [ { ticker: "VEA", name: "Vanguard FTSE Developed Markets ETF", expense: "0.05%" }, { ticker: "IEFA", name: "iShares Core MSCI EAFE ETF", expense: "0.07%" } ],
         emerging: [ { ticker: "VWO", name: "Vanguard FTSE Emerging Markets ETF", expense: "0.08%" }, { ticker: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", expense: "0.09%" } ],
         bonds: [ { ticker: "BND", name: "Vanguard Total Bond Market ETF", expense: "0.03%" }, { ticker: "AGG", name: "iShares Core U.S. Aggregate Bond ETF", expense: "0.03%" } ],
         gold: [ { ticker: "GLD", name: "SPDR Gold Shares", expense: "0.40%" }, { ticker: "IAU", name: "iShares Gold Trust", expense: "0.25%" } ],
         bitcoin: [ { ticker: "Direct", name: "Via Exchange", expense: "Varies" }, { ticker: "IBIT", name: "iShares Bitcoin Trust", expense: "0.25%" }, { ticker: "FBTC", name: "Fidelity Wise Origin Bitcoin Fund", expense: "0.25%" } ],
         ethereum: [ { ticker: "Direct", name: "Via Exchange", expense: "Varies" } ]
     },
    GBP: { /* ... Use europeanETFAlternatives or specific GBP data ... */ 
         largeCap: [ { ticker: "VUSA.L", name: "Vanguard S&P 500 UCITS ETF (GBP)", expense: "0.07%" }, { ticker: "CSPX.L", name: "iShares Core S&P 500 UCITS ETF (GBP)", expense: "0.07%" } ],
         techGrowth: [ { ticker: "EQQQ.L", name: "Invesco EQQQ Nasdaq-100 UCITS ETF (GBP)", expense: "0.30%" } ],
         healthcare: [ { ticker: "WHEA.L", name: "SPDR MSCI World Health Care UCITS ETF (GBP)", expense: "0.30%" } ],
         financials: [ { ticker: "IUFS.L", name: "iShares S&P 500 Financials Sector UCITS ETF (USD)", expense: "0.15%" } ], // Note USD ticker
         energy: [ { ticker: "WENS.L", name: "iShares MSCI World Energy Sector UCITS ETF (GBP)", expense: "0.25%" } ],
         developed: [ { ticker: "IWRD.L", name: "iShares Core MSCI World UCITS ETF (GBP)", expense: "0.20%" }, { ticker: "VEVE.L", name: "Vanguard FTSE Developed World UCITS ETF (GBP)", expense: "0.12%" } ],
         emerging: [ { ticker: "VFEM.L", name: "Vanguard FTSE Emerging Markets UCITS ETF (GBP)", expense: "0.22%" }, { ticker: "EMIM.L", name: "iShares Core MSCI Emerging Markets IMI UCITS ETF (GBP)", expense: "0.18%" } ],
         bonds: [ { ticker: "VAGF.L", name: "Vanguard Global Aggregate Bond UCITS ETF (GBP Hedged)", expense: "0.10%" }, { ticker: "AGBP.L", name: "iShares Core Global Aggregate Bond UCITS ETF (GBP Hedged)", expense: "0.10%" } ],
         gold: [ { ticker: "SGLN.L", name: "iShares Physical Gold ETC (GBP)", expense: "0.12%" }, { ticker: "PHGP.L", name: "WisdomTree Physical Gold (GBP)", expense: "0.39%" } ],
         bitcoin: [ { ticker: "Direct", name: "Via Exchange", expense: "Varies" }, { ticker: "BTCW.L", name: "WisdomTree Physical Bitcoin (GBP)", expense: "0.95%" } ],
         ethereum: [ { ticker: "Direct", name: "Via Exchange", expense: "Varies" }, { ticker: "ETHW.L", name: "WisdomTree Physical Ethereum (GBP)", expense: "0.95%" } ]
    },
    EUR: { /* ... Use europeanETFAlternatives or specific EUR data ... */
        largeCap: [ { ticker: "SXR8.DE", name: "iShares Core S&P 500 UCITS ETF (EUR)", expense: "0.07%" } ],
         techGrowth: [ { ticker: "CNDX.AS", name: "iShares Nasdaq 100 UCITS ETF (EUR)", expense: "0.33%" }, { ticker: "SXLK.DE", name: "iShares S&P 500 Info Tech Sector UCITS (EUR)", expense: "0.15%"} ],
         healthcare: [ { ticker: "XDWH.DE", name: "Xtrackers MSCI World Healthcare UCITS ETF (EUR)", expense: "0.25%" } ],
         financials: [ { ticker: "XDUF.DE", name: "Xtrackers MSCI USA Financials UCITS ETF (EUR)", expense: "0.12%" } ],
         energy: [ { ticker: "ZPDE.DE", name: "SPDR S&P US Energy Select Sector UCITS ETF (EUR)", expense: "0.15%" } ],
         developed: [ { ticker: "VWCE.DE", name: "Vanguard FTSE All-World UCITS ETF (EUR Acc)", expense: "0.22%" } ],
         emerging: [ { ticker: "EMIM.AS", name: "iShares Core MSCI EM IMI UCITS ETF Acc EUR", expense: "0.18%" } ], // Changed Ticker from .L
         bonds: [ { ticker: "IEAG.AS", name: "iShares Core Global Aggregate Bond UCITS ETF (EUR)", expense: "0.10%" }, { ticker: "VETY.DE", name: "Vanguard Global Aggregate Bond UCITS ETF (EUR Hedged)", expense: "0.10%" } ],
         gold: [ { ticker: "4GLD.DE", name: "Xetra-Gold (EUR)", expense: "~0.02% + storage" }, { ticker: "SGLN.DE", name: "iShares Physical Gold ETC (EUR)", expense: "0.12%" } ],
         bitcoin: [ { ticker: "Direct", name: "Via Exchange", expense: "Varies" }, { ticker: "BTCE.DE", name: "ETC Group Physical Bitcoin ETC (EUR)", expense: "2.00%" } ],
         ethereum: [ { ticker: "Direct", name: "Via Exchange", expense: "Varies" }, { ticker: "ZETH.SW", name: "21Shares Ethereum ETP (CHF)", expense: "2.50%" } ] // Note CHF ticker
    }
};

// Client-Side Monte Carlo Simulation Logic
// Note: assumptions object is now removed as we use the dynamic investmentOptions state

function randomNormal(mean = 0, stdev = 1) {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); // Avoid log(0)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return mean + stdev * num;
}

const runMonteCarloSimulation = (params, options, numSimulations = 1000) => {
    const {
        startingBalance,
        monthlyInvestment,
        timeHorizon, // years
        allocations, // { stock: %, bond: %, crypto: %, gold: % }
        annualFee // decimal format (e.g., 0.005 for 0.5%)
    } = params;
    
    // Convert percentage values to decimal for calculations
    const assumptions = {
        stock: { 
            meanReturn: options.stock.expectedReturn / 100, 
            volatility: options.stock.volatility / 100 
        },
        bond: { 
            meanReturn: options.bond.expectedReturn / 100, 
            volatility: options.bond.volatility / 100 
        },
        crypto: { 
            meanReturn: options.crypto.expectedReturn / 100, 
            volatility: options.crypto.volatility / 100 
        },
        gold: { 
            meanReturn: options.gold.expectedReturn / 100, 
            volatility: options.gold.volatility / 100 
        },
        inflation: options.inflation / 100,
        taxRate: options.taxRate / 100
    };

    // Basic validation inside the function
    if (!allocations || typeof allocations !== 'object' || Object.keys(allocations).length === 0 || !timeHorizon || timeHorizon <= 0) {
      console.error('Invalid simulation parameters received:', params);
      throw new Error('Invalid parameters for simulation.');
    }

    const finalBalances = [];
    const yearlyBalances = Array(numSimulations).fill(null).map(() => Array(timeHorizon).fill(0));
    const monthlyRate = 1 / 12;

    for (let i = 0; i < numSimulations; i++) {
        let balance = startingBalance;
        for (let year = 0; year < timeHorizon; year++) {
            for (let month = 0; month < 12; month++) {
                balance += monthlyInvestment;
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
            balance *= (1 - annualFee);
            if (year < timeHorizon) {
                yearlyBalances[i][year] = balance;
            }
        }
        finalBalances.push(balance);
    }

    finalBalances.sort((a, b) => a - b);

    const p10Index = Math.max(0, Math.floor(numSimulations * 0.10));
    const p50Index = Math.max(0, Math.floor(numSimulations * 0.50));
    const p90Index = Math.min(numSimulations - 1, Math.floor(numSimulations * 0.90));
    const average = finalBalances.reduce((sum, val) => sum + val, 0) / numSimulations;

    const timeSeriesData = {
        years: Array.from({ length: timeHorizon }, (_, i) => i + 1),
        p10: [],
        p50: [],
        p90: []
    };

    for (let year = 0; year < timeHorizon; year++) {
        const balancesForYear = yearlyBalances.map(sim => sim[year]);
        balancesForYear.sort((a, b) => a - b);
        const yearP10Index = Math.max(0, Math.floor(balancesForYear.length * 0.10));
        const yearP50Index = Math.max(0, Math.floor(balancesForYear.length * 0.50));
        const yearP90Index = Math.min(balancesForYear.length - 1, Math.floor(balancesForYear.length * 0.90));
        timeSeriesData.p10.push(balancesForYear[yearP10Index]);
        timeSeriesData.p50.push(balancesForYear[yearP50Index]);
        timeSeriesData.p90.push(balancesForYear[yearP90Index]);
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

const PortfolioCalculator = () => {
    // --- State Variables ---
    const [monthlyAmount, setMonthlyAmount] = useState(1000);
    const [currency, setCurrency] = useState('USD');
    const [startingBalance, setStartingBalance] = useState(10000); // Already exists, ensure correct usage
    const [timeHorizon, setTimeHorizon] = useState(20);
    const [riskProfile, setRiskProfile] = useState('Moderate');
    const [includeCrypto, setIncludeCrypto] = useState(true);
    const [includeGold, setIncludeGold] = useState(true);
    const [useCustomAllocation, setUseCustomAllocation] = useState(false);

    // Consolidated state for custom allocations
    const [customAllocations, setCustomAllocations] = useState({ stock: 60, bond: 30, crypto: 5, gold: 5 });

    // State for questionnaire
    const [answers, setAnswers] = useState({});
    const [showQuestionnaire, setShowQuestionnaire] = useState(false);
    const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
    const [assessmentResult, setAssessmentResult] = useState({
        isComplete: false,
        message: 'Please answer all questions to get your risk profile.'
    });

    // State for simulation section
    const [accountType, setAccountType] = useState('Taxable'); // Added
    const [annualFee, setAnnualFee] = useState(0.5); // Added
    const [projections, setProjections] = useState(null); // Added (for API response)
    const [isLoadingSimulation, setIsLoadingSimulation] = useState(false); // Added
    const [errorSimulation, setErrorSimulation] = useState(null); // Added
    
    // State for investment options configuration
    const [investmentOptions, setInvestmentOptions] = useState(defaultInvestmentOptions);

    // Helper function to calculate allocations
    const calculateAllocations = useCallback((riskProfile, customAllocations, includeCrypto, includeGold) => {
        // Capitalize first letter to handle case-insensitive matching
        const capitalizedProfile = riskProfile.charAt(0).toUpperCase() + riskProfile.slice(1);

        const profiles = {
            Conservative: { stock: 20, bond: 60, crypto: 0, gold: 20 },
            Moderate: { stock: 50, bond: 30, crypto: 5, gold: 15 },
            Aggressive: { stock: 70, bond: 10, crypto: 10, gold: 10 },
            VeryAggressive: { stock: 80, bond: 0, crypto: 15, gold: 5 }, // Added Very Aggressive profile
            Custom: { ...customAllocations }
        };

        let alloc = profiles[capitalizedProfile] || profiles.Moderate; // Default to Moderate if profile invalid

        // Adjust based on include flags
        if (!includeCrypto) {
            alloc.crypto = 0;
        }
        if (!includeGold) {
            alloc.gold = 0;
        }

        // Re-normalize if necessary
        const total = alloc.stock + alloc.bond + alloc.crypto + alloc.gold;

        if (total > 0 && Math.abs(total - 100) > 0.01) { // Check if total is off and not zero
            const scaleFactor = 100 / total;
            alloc = {
                stock: alloc.stock * scaleFactor,
                bond: alloc.bond * scaleFactor,
                crypto: alloc.crypto * scaleFactor,
                gold: alloc.gold * scaleFactor,
            };
            // Optional: Round values after scaling if needed, ensure sum is exactly 100
             alloc.stock = Math.round(alloc.stock);
             alloc.bond = Math.round(alloc.bond);
             alloc.crypto = Math.round(alloc.crypto);
             alloc.gold = Math.round(alloc.gold);
             // Adjust rounding differences - typically add/subtract from largest allocation (e.g., stock or bond)
             const roundedTotal = alloc.stock + alloc.bond + alloc.crypto + alloc.gold;
             const difference = 100 - roundedTotal;
             if (alloc.stock > 0) alloc.stock += difference; // Adjust stock to make it sum to 100
             else if (alloc.bond > 0) alloc.bond += difference; // Or adjust bond
        }

        // Ensure non-negative values (safety check)
        alloc.stock = Math.max(0, alloc.stock);
        alloc.bond = Math.max(0, alloc.bond);
        alloc.crypto = Math.max(0, alloc.crypto);
        alloc.gold = Math.max(0, alloc.gold);

        console.log('[calculateAllocations] Returning:', alloc); // Added logging
        return alloc;

    }, []); // Dependency array is empty as the function only relies on its arguments

    // Derived state for allocations to display (based on risk or custom)
    const displayAllocations = useMemo(() => {
        return calculateAllocations(riskProfile, customAllocations, includeCrypto, includeGold);
    }, [riskProfile, customAllocations, includeCrypto, includeGold, calculateAllocations]); // Use calculateAllocations as dependency

    // --- Event Handlers ---
    const handleMonthlyAmountChange = (e) => {
        const value = parseFloat(e.target.value);
        if (!isNaN(value) && value >= 0) {
            setMonthlyAmount(value);
        }
    };

    // Handler for investment options changes
    const handleOptionsChange = useCallback((newOptions) => {
        setInvestmentOptions(newOptions);
    }, []);

    // Handler for Running Simulation (Client-Side Version)
    const runSimulationHandler = useCallback(() => {
        setIsLoadingSimulation(true);
        setErrorSimulation(null);
        setProjections(null);

        // Calculate allocations first
        console.log('[runSimulationHandler] Calculating allocations...');
        const currentAllocations = calculateAllocations(riskProfile, customAllocations, includeCrypto, includeGold);
        console.log('[runSimulationHandler] Allocations calculated:', currentAllocations);
        console.log('[runSimulationHandler] Using investment options:', investmentOptions);

        const parsedTimeHorizon = parseInt(timeHorizon, 10);

        // Validate inputs before proceeding
        if (!currentAllocations || typeof currentAllocations !== 'object' || Object.keys(currentAllocations).length === 0 || !parsedTimeHorizon || parsedTimeHorizon <= 0) {
            console.error('[runSimulationHandler] Invalid inputs detected:', { currentAllocations, timeHorizon: parsedTimeHorizon });
            setErrorSimulation('Invalid simulation inputs. Please check allocations and time horizon.');
            setIsLoadingSimulation(false);
            return;
        }

        const simulationParams = {
            startingBalance: parseFloat(startingBalance) || 0,
            monthlyInvestment: parseFloat(monthlyAmount) || 0,
            timeHorizon: parsedTimeHorizon,
            allocations: currentAllocations,
            annualFee: parseFloat(annualFee) / 100 || 0 // Convert percentage
        };

        console.log('[runSimulationHandler] Running client-side simulation with params:', simulationParams);

        try {
            // Run the local simulation function directly (synchronous)
            const results = runMonteCarloSimulation(simulationParams, investmentOptions);
            console.log('[runSimulationHandler] Simulation successful, results:', results);
            setProjections(results); // Update state with results
        } catch (error) {
            console.error('[runSimulationHandler] Client-side Simulation Error:', error);
            setErrorSimulation(error.message || 'An error occurred during simulation.');
            setProjections(null); // Clear results on error
        } finally {
            console.log('[runSimulationHandler] Simulation attempt finished.');
            setIsLoadingSimulation(false); // Ensure loading state is reset
        }

    }, [riskProfile, customAllocations, includeCrypto, includeGold, startingBalance, monthlyAmount, timeHorizon, annualFee, calculateAllocations]); // Dependencies

    // --- JSX ---
    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg shadow-xl border border-gray-200">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-brand-dark-blue mb-6 md:mb-8">Investment Strategy Calculator</h1>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-brand-blue p-1 mb-6">
                    {['Setup & Allocation', 'Investment Options', 'Projections & Analysis', 'Insights'].map((category) => (
                        <Tab
                            key={category}
                            className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ` +
                                `focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60 ` +
                                (selected
                                    ? 'bg-white text-brand-blue shadow' // Selected tab style
                                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white' // Unselected tab style
                                )
                            }
                        >
                            {category}
                        </Tab>
                    ))}
                </Tab.List>
                <Tab.Panels className="mt-2">
                    {/* Tab 1: Setup & Allocation */}
                    <Tab.Panel className="rounded-xl bg-white p-4 md:p-6 shadow-inner border border-gray-100 focus:outline-none focus:ring-2 ring-brand-blue">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">1. Define Your Investment Plan</h2>

                        {/* Row 1: Inputs & Time Horizon */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <InputsSection
                                monthlyAmount={monthlyAmount}
                                onAmountChange={handleMonthlyAmountChange}
                                currency={currency}
                                onCurrencyChange={(e) => setCurrency(e.target.value)}
                                currencySymbols={currencySymbols} // Pass the symbols object
                            />
                            <TimeHorizonSection
                                timeHorizon={timeHorizon}
                                onHorizonChange={(e) => setTimeHorizon(e.target.value)}
                            />
                        </div>

                        {/* Row 2: Risk Profile, Opt-outs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <RiskSelection
                                riskLevel={riskProfile} // Pass state as riskLevel
                                onRiskLevelChange={(newProfile) => setRiskProfile(newProfile)} // Pass handler as onRiskLevelChange
                                useCustomAllocation={useCustomAllocation} // Pass custom toggle state
                                onUseCustomAllocationChange={(isChecked) => setUseCustomAllocation(isChecked)} // Pass custom toggle handler
                            />
                            <OptOutToggles
                                includeCrypto={includeCrypto}
                                onCryptoChange={(e) => setIncludeCrypto(e.target.checked)}
                                includeGold={includeGold}
                                onGoldChange={(e) => setIncludeGold(e.target.checked)}
                            />
                        </div>

                        {/* Risk Questionnaire (Conditional) */}
                        <RiskQuestionnaire
                            isOpen={showQuestionnaire}
                            onToggle={() => setShowQuestionnaire(!showQuestionnaire)}
                            q1Answer={answers.q1} onQ1Change={(answer) => setAnswers({ ...answers, q1: answer })}
                            q2Answer={answers.q2} onQ2Change={(answer) => setAnswers({ ...answers, q2: answer })}
                            q3Answer={answers.q3} onQ3Change={(answer) => setAnswers({ ...answers, q3: answer })}
                            q4Answer={answers.q4} onQ4Change={(answer) => setAnswers({ ...answers, q4: answer })}
                            q5Answer={answers.q5} onQ5Change={(answer) => setAnswers({ ...answers, q5: answer })}
                            onCalculateProfile={() => {
                                const result = calculateProfileFromAnswers(answers);
                                setAssessmentResult(result);
                                setQuestionnaireCompleted(result.isComplete);
                            }}
                            result={assessmentResult.message}
                            isComplete={assessmentResult.isComplete}
                            recommendedProfile={assessmentResult.recommendedProfile}
                            onApplyProfile={() => {
                                if (assessmentResult.recommendedProfile) {
                                    setRiskProfile(assessmentResult.recommendedProfile);
                                    setShowQuestionnaire(false);
                                }
                            }}
                        />

                        {/* Custom Allocation Sliders (Conditional) */}
                        {useCustomAllocation && (
                            <CustomAllocationSliders
                                customStockAllocation={customAllocations.stock}
                                onStockChange={(value) => setCustomAllocations({ ...customAllocations, stock: value })}
                                customBondAllocation={customAllocations.bond}
                                onBondChange={(value) => setCustomAllocations({ ...customAllocations, bond: value })}
                                customCryptoAllocation={customAllocations.crypto}
                                onCryptoChange={(value) => setCustomAllocations({ ...customAllocations, crypto: value })}
                                customGoldAllocation={customAllocations.gold}
                                onGoldChange={(value) => setCustomAllocations({ ...customAllocations, gold: value })}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                                totalCustomAllocation={customAllocations.stock + customAllocations.bond + customAllocations.crypto + customAllocations.gold}
                            />
                        )}

                        {/* Allocation Summary */}
                        {displayAllocations && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <AllocationSummary
                                    stock={displayAllocations.stock}
                                    bond={displayAllocations.bond}
                                    crypto={displayAllocations.crypto}
                                    gold={displayAllocations.gold}
                                    includeCrypto={includeCrypto}
                                    includeGold={includeGold}
                                />
                                <div>
                                    <AllocationChart
                                        allocations={displayAllocations}
                                        includeCrypto={includeCrypto}
                                        includeGold={includeGold}
                                    />
                                </div>
                            </div>
                        )}

                    </Tab.Panel>

                    {/* Tab 2: Investment Options */}
                    <Tab.Panel className="rounded-xl bg-white p-6 shadow-inner border border-gray-100 focus:outline-none focus:ring-2 ring-brand-blue">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">2. Investment Options</h2>
                        <ETFSection currency={currency} etfRecommendations={etfRecommendations} />
                    </Tab.Panel>

                    {/* Tab 3: Projections & Analysis */}
                    <Tab.Panel className="rounded-xl bg-white p-4 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Projection Analysis</h3>
                        
                        {/* Investment Options in Collapsible Section */}
                        <CollapsibleSection title="Investment Assumptions" initiallyOpen={false}>
                            <InvestmentOptionsConfig
                                options={investmentOptions}
                                onOptionsChange={handleOptionsChange}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                            />
                        </CollapsibleSection>
                        
                        <h4 className="text-md font-medium text-gray-700 mt-6 mb-2">Simulation Setup</h4>

                        {/* Projection Setup Inputs */}
                        <ProjectionSetup
                            startingBalance={startingBalance}
                            setStartingBalance={setStartingBalance}
                            accountType={accountType}
                            setAccountType={setAccountType}
                            annualFee={annualFee}
                            setAnnualFee={setAnnualFee}
                            currency={currency}
                            currencySymbols={currencySymbols}
                        />

                        {/* Simulation Run Button */}
                        <SimulationControls
                            runSimulation={runSimulationHandler}
                            isLoadingSimulation={isLoadingSimulation}
                            errorSimulation={errorSimulation}
                        />

                        {/* Simulation Results Placeholder */}
                        {isLoadingSimulation && (
                            <div className="mt-6 text-center text-gray-500">Running simulation...</div>
                        )}
                        {errorSimulation && (
                            <div className="mt-6 text-center text-red-600 bg-red-100 p-3 rounded">Error: {errorSimulation}</div>
                        )}

                        {/* Simulation Results Display */}
                        {projections && !isLoadingSimulation && (
                            <SimulationResultsDisplay
                                projections={projections.summary} // Pass the summary part
                                currency={currency}
                            />
                        )}

                        {/* Projection Chart Display */}
                        {projections && !isLoadingSimulation && (
                            <ProjectionChart
                                projections={projections} // Pass the whole projections object
                                currency={currency}
                            />
                        )}

                    </Tab.Panel>

                    {/* Insights Tab */}
                    <Tab.Panel key="Insights" className="rounded-xl bg-white p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">
                        <div className="space-y-6">
                            <RiskProfileSummary 
                                riskProfile={riskProfile}
                                allocations={displayAllocations}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                            />
                            <PerformanceComparison 
                                allocations={displayAllocations}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                            />
                            <RecentPerformance 
                                allocations={displayAllocations}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                            />
                            <WyckoffAnalysis 
                                displayAllocations={displayAllocations}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                            />
                            <TaxImpactEstimator 
                                allocations={displayAllocations}
                                includeCrypto={includeCrypto}
                                includeGold={includeGold}
                            />
                            <TaxEfficiency />
                        </div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>

            {/* Export/Print Controls */}
            <ExportControls />
        </div>
    );
};

export default PortfolioCalculator;