import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

// Custom number formatting function
const formatNumber = (number) => {
    if (!number) return '-';
    if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
    if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
    if (number >= 1000) return (number / 1000).toFixed(1) + 'K';
    return number.toFixed(0);
};

const TickerSelector = ({ selectedTickers, onAddTicker, onRemoveTicker, tickersData }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSector, setSelectedSector] = useState('All');
    const [selectedMarketCap, setSelectedMarketCap] = useState('All');
    const [selectedPeRange, setSelectedPeRange] = useState('All');
    const [selectedDividend, setSelectedDividend] = useState('All');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const marketCapRanges = [
        'All',
        '0-1B',
        '1B-10B',
        '10B-100B',
        '100B+'
    ];

    const peRanges = [
        'All',
        '0-10',
        '10-20',
        '20-30',
        '30+'
    ];

    const dividendRanges = [
        'All',
        '0-1%',
        '1-3%',
        '3-5%',
        '5%+'
    ];

    // Get unique sectors from tickers data
    const sectors = ['All', ...new Set(
        Object.values(tickersData)
            .flat()
            .map(ticker => ticker.sector)
    )];

    // Filter tickers based on all criteria
    const filteredTickers = Object.values(tickersData)
        .flat()
        .filter(ticker => {
            const matchesSearch = ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                ticker.name.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesSector = selectedSector === 'All' || ticker.sector === selectedSector;
            
            const matchesMarketCap = selectedMarketCap === 'All' || 
                (selectedMarketCap === '0-1B' && ticker.marketCap <= 1000000000) ||
                (selectedMarketCap === '1B-10B' && ticker.marketCap > 1000000000 && ticker.marketCap <= 10000000000) ||
                (selectedMarketCap === '10B-100B' && ticker.marketCap > 10000000000 && ticker.marketCap <= 100000000000) ||
                (selectedMarketCap === '100B+' && ticker.marketCap > 100000000000);

            const matchesPe = selectedPeRange === 'All' ||
                (selectedPeRange === '0-10' && ticker.peRatio <= 10) ||
                (selectedPeRange === '10-20' && ticker.peRatio > 10 && ticker.peRatio <= 20) ||
                (selectedPeRange === '20-30' && ticker.peRatio > 20 && ticker.peRatio <= 30) ||
                (selectedPeRange === '30+' && ticker.peRatio > 30);

            const matchesDividend = selectedDividend === 'All' ||
                (selectedDividend === '0-1%' && ticker.dividendYield <= 1) ||
                (selectedDividend === '1-3%' && ticker.dividendYield > 1 && ticker.dividendYield <= 3) ||
                (selectedDividend === '3-5%' && ticker.dividendYield > 3 && ticker.dividendYield <= 5) ||
                (selectedDividend === '5%+' && ticker.dividendYield > 5);

            return matchesSearch && matchesSector && matchesMarketCap && matchesPe && matchesDividend;
        })
        .slice((page - 1) * 10, page * 10);

    const totalTickers = Object.values(tickersData).flat().length;
    const filteredTotal = Object.values(tickersData)
        .flat()
        .filter(ticker => {
            return ticker.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   ticker.name.toLowerCase().includes(searchQuery.toLowerCase());
        }).length;

    useEffect(() => {
        setPage(1);
    }, [searchQuery, selectedSector, selectedMarketCap, selectedPeRange, selectedDividend]);

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    // Calculate metrics for each ticker
    const calculateMetrics = (ticker) => {
        const metrics = {
            potentialReturn: null,
            riskLevel: null,
            volatility: null,
            performance: null
        };

        if (ticker.marketCap && ticker.peRatio) {
            // Calculate potential return based on historical data
            metrics.potentialReturn = (25 - ticker.peRatio) / 100;
            
            // Calculate risk level based on market cap and PE ratio
            metrics.riskLevel = ticker.marketCap > 100000000000 ? 'Low' :
                               ticker.marketCap > 1000000000 ? 'Medium' : 'High';

            // Calculate volatility estimate based on PE ratio
            metrics.volatility = ticker.peRatio > 30 ? 'High' :
                               ticker.peRatio > 20 ? 'Medium' : 'Low';

            // Calculate performance based on dividend yield
            metrics.performance = ticker.dividendYield ? ticker.dividendYield : 0;
        }

        return metrics;
    };

    return (
        <div className="space-y-4">
            {/* Advanced Filters Toggle */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center text-sm text-gray-600 hover:text-gray-800"
                >
                    Advanced Filters
                    {showFilters ? (
                        <ChevronUpIcon className="w-4 h-4 ml-1" />
                    ) : (
                        <ChevronDownIcon className="w-4 h-4 ml-1" />
                    )}
                </button>
                <span className="text-sm text-gray-500">
                    {filteredTickers.length} of {filteredTotal} results
                </span>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
                <div className="space-y-2 bg-gray-50 p-4 rounded-md">
                    <select
                        value={selectedSector}
                        onChange={(e) => setSelectedSector(e.target.value)}
                        className="w-full text-xs sm:text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                    >
                        {sectors.map(sector => (
                            <option key={sector} value={sector}>
                                {sector === 'All' ? 'All Sectors' : sector}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedMarketCap}
                        onChange={(e) => setSelectedMarketCap(e.target.value)}
                        className="w-full text-xxs sm:text-xs p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                    >
                        {marketCapRanges.map(range => (
                            <option key={range} value={range}>
                                {range === 'All' ? 'All Market Caps' : range}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedPeRange}
                        onChange={(e) => setSelectedPeRange(e.target.value)}
                        className="w-full text-xs sm:text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                    >
                        {peRanges.map(range => (
                            <option key={range} value={range}>
                                {range === 'All' ? 'All P/E Ratios' : range}
                            </option>
                        ))}
                    </select>

                    <select
                        value={selectedDividend}
                        onChange={(e) => setSelectedDividend(e.target.value)}
                        className="w-full text-xs sm:text-sm p-1.5 border border-gray-300 rounded-md bg-white focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                    >
                        {dividendRanges.map(range => (
                            <option key={range} value={range}>
                                {range === 'All' ? 'All Dividends' : range}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* Search Input */}
            <div className="relative w-full">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for tickers..."
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:ring-brand-blue focus:border-brand-blue sm:text-sm"
                />
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Selected Tickers Section */}
            {selectedTickers.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm sm:text-base font-medium text-gray-600 mb-2">Selected Tickers:</h4>
                    <div className="flex flex-wrap gap-2">
                        {selectedTickers.map(ticker => (
                            <div
                                key={ticker.symbol}
                                className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-white border border-gray-300 rounded-full text-xs sm:text-sm"
                            >
                                <span className="mr-1 sm:mr-2">{ticker.symbol}</span>
                                <button
                                    onClick={() => onRemoveTicker(ticker.symbol)}
                                    className="text-gray-500 hover:text-red-500"
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Available Tickers List */}
            <div className="space-y-2">
                {loading && (
                    <div className="text-center text-xs sm:text-sm text-gray-500">Loading...</div>
                )}
                <div className="max-h-64 overflow-y-auto">
                    {filteredTickers.map(ticker => {
                        const metrics = calculateMetrics(ticker);
                        return (
                            <div
                                key={ticker.symbol}
                                className="flex items-center justify-between p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                onClick={() => onAddTicker(ticker)}
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center">
                                        <span className="font-medium text-xs sm:text-sm">{ticker.symbol}</span>
                                    </div>
                                    <div className="mt-1 flex items-center">
                                        <span className="text-xxs sm:text-xs text-gray-500 truncate">{ticker.name}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                    <span className="text-xxs sm:text-xs text-gray-500">{ticker.sector}</span>
                                    {ticker.marketCap && (
                                        <span className="text-xxxs sm:text-xxs text-gray-400">{ticker.marketCap ? formatNumber(ticker.marketCap) : '-'}</span>
                                    )}
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        {ticker.peRatio !== null && (
                                            <span className={`text-xxs sm:text-xs ${ticker.peRatio > 30 ? 'text-red-500' : 'text-gray-500'}`}>
                                                PE: {ticker.peRatio.toFixed(1)}
                                            </span>
                                        )}
                                        {ticker.dividendYield !== null && (
                                            <span className="text-xxs sm:text-xs text-green-500">
                                                Div: {ticker.dividendYield.toFixed(1)}%
                                            </span>
                                        )}
                                        {metrics.potentialReturn !== null && (
                                            <span className={`text-xxs sm:text-xs ${metrics.potentialReturn > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                Est Return: {metrics.potentialReturn > 0 ? '+' : ''}{(metrics.potentialReturn * 100).toFixed(1)}%
                                            </span>
                                        )}
                                        {metrics.riskLevel && (
                                            <span className={`text-xxs sm:text-xs ${
                                                metrics.riskLevel === 'Low' ? 'text-green-500' :
                                                metrics.riskLevel === 'Medium' ? 'text-yellow-500' :
                                                'text-red-500'
                                            }`}>
                                                Risk: {metrics.riskLevel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Pagination */}
                {filteredTickers.length > 0 && (
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span>
                            Page {page} of {Math.ceil(filteredTotal / 10)}
                        </span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page * 10 >= filteredTotal}
                            className="px-3 py-1 rounded-md hover:bg-gray-100 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TickerSelector;
