const MOCK_DATA = {
  quarterlyPerformance: {
    timestamp: `Q${new Date().getMonth() >= 9 ? 4 : Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
    lastUpdated: new Date().toISOString(),
    assets: {
      stock: {
        performance: 2.8,
        trend: 'up',
        details: 'Large-cap growth outperforming value stocks',
        currentPrice: '486.35',
        lastUpdated: new Date().toISOString(),
        symbol: 'SPY'
      },
      bond: {
        performance: -0.8,
        trend: 'down',
        details: 'Interest rates impacting fixed income',
        currentPrice: '95.60',
        lastUpdated: new Date().toISOString(),
        symbol: 'TLT'
      },
      crypto: {
        performance: 4.7,
        trend: 'up',
        details: 'Market sentiment and regulatory developments',
        currentPrice: '68245.12',
        lastUpdated: new Date().toISOString(),
        symbol: 'BTC-USD'
      },
      gold: {
        performance: 1.2,
        trend: 'up',
        details: 'Inflation concerns and geopolitical tensions',
        currentPrice: '214.78',
        lastUpdated: new Date().toISOString(),
        symbol: 'GLD'
      }
    }
  },
  wyckoffAnalysis: {
    timestamp: `Q${new Date().getMonth() >= 9 ? 4 : Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
    lastUpdated: new Date().toISOString(),
    markets: {
      sp500: {
        phase: 'Distribution / Early Markdown',
        position: 80, // percentage position in the cycle (0-100)
        notes: 'Technical weakness growing, volume characteristics suggesting distribution'
      },
      nasdaq: {
        phase: 'Re-acc / Distribution',
        position: 60,
        notes: 'Technology showing better relative strength than broader market'
      },
      ftse: {
        phase: 'Distribution / Markdown',
        position: 85,
        notes: 'Showing technical weakness with lower highs and lower lows'
      },
      bitcoin: {
        phase: 'Re-acc / Distribution',
        position: 55,
        notes: 'Holding key technical levels better than altcoins'
      },
      ethereum: {
        phase: 'Markdown',
        position: 90,
        notes: 'Breaking support levels with increasing volume'
      }
    },
    recommendations: [
      'Slightly reducing exposure to broad US markets (S&P 500) given distribution signals.',
      'Maintaining technology exposure (Nasdaq components) showing relative strength.',
      'Underweighting UK market exposure due to FTSE 100\'s technical weakness.',
      'Favoring Bitcoin over Ethereum within crypto based on relative strength/phase.'
    ]
  }
};

/**
 * Determine if we should use mock data instead of making actual API calls
 * This allows us to develop without hitting actual API endpoints
 */
const shouldUseMockData = () => {
  // Use mock data when in development or when environment variables aren't set
  return process.env.NODE_ENV === 'development' || 
         !process.env.NEXT_PUBLIC_USE_REAL_API || 
         process.env.NEXT_PUBLIC_USE_REAL_API === 'false';
};

/**
 * Get the current quarter and year
 * @returns {Object} Current quarter information
 */
export const getCurrentQuarter = () => {
  const now = new Date();
  const quarter = Math.floor(now.getMonth() / 3) + 1;
  const year = now.getFullYear();
  
  return {
    quarter,
    year,
    label: `Q${quarter} ${year}`,
    startDate: new Date(year, (quarter - 1) * 3, 1),
    endDate: new Date(year, quarter * 3, 0)
  };
};

/**
 * Fetch quarterly performance data for major asset classes
 * @returns {Promise<Object>} Quarterly performance data
 */
export const fetchQuarterlyPerformance = async () => {
  try {
    console.log('Starting quarterly performance fetch...');
    
    // Use mock data in development mode or if API isn't available
    if (shouldUseMockData()) {
      console.log('Using mock quarterly performance data');
      return MOCK_DATA.quarterlyPerformance;
    }
    
    // In production, we'd make the actual API call here
    // Implement actual API calls when ready
    
    const currentQuarter = getCurrentQuarter();
    // Return mock data for now
    return MOCK_DATA.quarterlyPerformance;
  } catch (error) {
    console.error("Error fetching quarterly performance:", error);
    // Return mock data as fallback on error
    return MOCK_DATA.quarterlyPerformance;
  }
};

/**
 * Fetch Wyckoff market cycle analysis for major markets
 * @returns {Promise<Object>} Wyckoff analysis data
 */
export const fetchWyckoffAnalysis = async () => {
  try {
    // Use mock data in development mode or if API isn't available
    if (shouldUseMockData()) {
      console.log('Using mock Wyckoff analysis data');
      return MOCK_DATA.wyckoffAnalysis;
    }
    
    // In production, this would make an API call to fetch real data
    // Implement actual API calls when ready
    
    // Return mock data for now
    return MOCK_DATA.wyckoffAnalysis;
  } catch (error) {
    console.error("Error fetching Wyckoff analysis:", error);
    // Return mock data as fallback on error
    return MOCK_DATA.wyckoffAnalysis;
  }
};

/**
 * Helper function to get asset-specific details
 * @param {string} asset Asset type (stock, bond, crypto, gold)
 * @returns {Promise<string>} Asset-specific market details
 */
async function getAssetDetails(asset) {
  // In a real implementation, you might want to fetch additional market context
  // For now, we'll return static details that are generally relevant
  const details = {
    stock: 'Large-cap growth outperforming value stocks',
    bond: 'Interest rates impacting fixed income',
    crypto: 'Market sentiment and regulatory developments',
    gold: 'Inflation concerns and geopolitical tensions'
  };
  
  return details[asset] || 'Market conditions affecting performance';
}

// Export constants that the components might need
export const ASSET_SYMBOLS = {
  stock: 'SPY',    // S&P 500 ETF
  bond: 'TLT',     // 20+ Year Treasury Bond ETF
  crypto: 'BTC-USD', // Bitcoin
  gold: 'GLD'      // Gold ETF
};

// Export error types for better error handling
export const ERROR_TYPES = {
  CACHE_ERROR: 'CACHE_ERROR',
  DATA_ERROR: 'DATA_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};
