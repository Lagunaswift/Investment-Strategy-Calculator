// services/marketDataService.js
import { API_ERROR_TYPES, RETRY_OPTIONS, RATE_LIMIT, retryWithBackoff, parseApiError, createThrottledFunction, cacheManager } from '../utils/apiUtils';

// Asset symbols for different asset classes
const ASSET_SYMBOLS = {
  stock: 'SPY',    // S&P 500 ETF
  bond: 'TLT',     // 20+ Year Treasury Bond ETF
  crypto: 'BTC-USD', // Bitcoin
  gold: 'GLD'      // Gold ETF
};

// API endpoints for different assets
const API_ENDPOINTS = {
  stock: '/api/market-data?asset=stock',
  bond: '/api/market-data?asset=bond',
  crypto: '/api/market-data?asset=crypto',
  gold: '/api/market-data?asset=gold'
};

// API key (for server-side use)
const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'V9Q0xLxC4f8PRdksYljJPgSaYI2OnSkG';

// Error types for better error handling
const ERROR_TYPES = {
  ...API_ERROR_TYPES,
  CACHE_ERROR: 'CACHE_ERROR',
  DATA_ERROR: 'DATA_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR'
};

/**
 * Create a throttled fetch function for rate limiting
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Fetch response
 */
const throttledFetch = createThrottledFunction(async (url, options = {}) => {
  try {
    console.log('Fetching URL:', url);
    
    // Ensure URL is a string
    const urlString = url.toString();
    
    // Add proper headers
    const fetchOptions = {
      ...options,
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    };

    const response = await fetch(urlString, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${response.status} - ${errorText}`);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', {
      url: url.toString(),
      error: error.message,
      stack: error.stack
    });
    throw {
      ...parseApiError(error),
      originalError: error,
      url: url.toString(),
      timestamp: new Date().toISOString()
    };
  }
}, RATE_LIMIT.windowMs / RATE_LIMIT.callsPerMinute, {
  leading: true,
  trailing: false
});

/**
 * Build URL with proper parameter encoding
 * @param {string} endpoint - The API endpoint template
 * @param {Object} params - Parameters to replace in template
 * @returns {URL} - Constructed URL
 */
const buildUrl = (endpoint, params) => {
  let url = endpoint;
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`{${key}}`, encodeURIComponent(value));
  });
  return new URL(url);
};

/**
 * Get cache key for asset data
 * @param {string} asset - Asset type
 * @param {string} symbol - Asset symbol
 * @returns {string} - Cache key
 */
const getCacheKey = (asset, symbol) => `market_data_${asset}_${symbol}`;

/**
 * Fetch quarterly performance data for major asset classes
 * @returns {Promise<Object>} Quarterly performance data
 */
export const fetchQuarterlyPerformance = async () => {
  try {
    console.log('Starting quarterly performance fetch...');
    const currentQuarter = getCurrentQuarter();
    const endDate = currentQuarter.endDate;
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 90); // Get data from 3 months ago

    console.log('Fetching data for period:', startDate.toISOString(), 'to', endDate.toISOString());

    const promises = Object.entries(ASSET_SYMBOLS).map(async ([asset, symbol]) => {
      try {
        // Check cache first
        const cacheKey = getCacheKey(asset, symbol);
        const cachedData = cacheManager.get(cacheKey);
        if (cachedData) {
          console.log(`Using cached data for ${asset} (${symbol})`);
          return {
            [asset]: {
              ...cachedData,
              fromCache: true
            }
          };
        }

        console.log(`Fetching fresh data for ${asset} (${symbol})...`);
        
        // Build URL for API
        const url = new URL(`${API_ENDPOINTS[asset]}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`);

        console.log('Fetching from API:', url.toString());

        const response = await throttledFetch(url.toString());
        const data = await response.json();

        if (data.error) {
          throw new Error(`API error: ${data.error}`);
        }

        if (!data.results || data.results.length === 0) {
          throw new Error(`No data found for ${symbol}: ${JSON.stringify(data, null, 2)}`);
        }

        const results = data.results;
        const startPrice = results[0].c; // Closing price of first result
        const endPrice = results[results.length - 1].c; // Closing price of last result
        
        if (!startPrice || !endPrice) {
          throw new Error(`Missing price data for ${symbol} - Start: ${startPrice}, End: ${endPrice}`);
        }
        
        const performance = ((parseFloat(endPrice) - parseFloat(startPrice)) / parseFloat(startPrice)) * 100;
        
        const assetData = {
          performance: parseFloat(performance.toFixed(1)),
          trend: performance >= 0 ? 'up' : 'down',
          details: await getAssetDetails(asset),
          currentPrice: parseFloat(endPrice).toFixed(2),
          lastUpdated: new Date().toISOString(),
          symbol: symbol
        };

        // Cache the data
        cacheManager.set(cacheKey, assetData);
        
        console.log(`Successfully fetched data for ${asset} (${symbol}):`, {
          performance: assetData.performance,
          trend: assetData.trend
        });
        
        return {
          [asset]: assetData
        };
      } catch (error) {
        console.error(`Error fetching data for ${asset} (${symbol}):`, {
          error: error.message,
          url: error.url,
          type: error.type,
          originalError: error.originalError?.message
        });
        
        return {
          [asset]: {
            error: {
              type: error.type || ERROR_TYPES.NETWORK_ERROR,
              message: error.message || 'Failed to fetch data',
              symbol: symbol,
              timestamp: new Date().toISOString(),
              retryAttempts: error.retryAttempts || RETRY_OPTIONS.maxRetries,
              details: {
                url: error.url,
                originalError: error.originalError?.message
              }
            }
          }
        };
      }
    });

    const results = await Promise.all(promises);
    const assets = Object.assign({}, ...results);

    // Validate the data structure
    const hasErrors = Object.values(assets).some(asset => asset.error);
    if (hasErrors) {
      console.warn('Some assets have errors:', assets);
    }

    console.log('Final performance data:', {
      timestamp: currentQuarter.label,
      lastUpdated: new Date().toISOString(),
      assets: Object.keys(assets).map(asset => ({
        [asset]: assets[asset].error ? assets[asset].error.message : assets[asset].performance
      }))
    });

    return {
      timestamp: currentQuarter.label,
      lastUpdated: new Date().toISOString(),
      assets,
      cacheStats: {
        hits: Object.values(assets).filter(asset => asset.fromCache).length,
        misses: Object.values(assets).filter(asset => !asset.fromCache).length,
        errors: Object.values(assets).filter(asset => asset.error).length
      }
    };
  } catch (error) {
    console.error("Error fetching quarterly performance:", {
      message: error.message,
      type: error.type || ERROR_TYPES.NETWORK_ERROR,
      timestamp: new Date().toISOString()
    });
    throw {
      type: error.type || ERROR_TYPES.NETWORK_ERROR,
      message: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

/**
 * Test the market data service
 * @returns {Promise<boolean>} True if test succeeds, false otherwise
 */
export const testMarketDataService = async () => {
  try {
    // Test with a simple API call
    const testSymbol = 'SPY';
    const url = new URL(API_ENDPOINTS.stock);
    url.searchParams.set('startDate', '2022-01-01');
    url.searchParams.set('endDate', '2022-01-31');

    const response = await throttledFetch(url.toString());

    if (!response.ok) {
      throw new Error(`Test API call failed with status ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      throw new Error('Test data structure is incorrect');
    }

    return true;
  } catch (error) {
    console.error('Market data service test failed:', error);
    return false;
  }
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

/**
 * Fetch Wyckoff market cycle analysis for major markets
 * @returns {Promise<Object>} Wyckoff analysis data
 */
export const fetchWyckoffAnalysis = async () => {
  try {
    const currentQuarter = getCurrentQuarter();
    
    // In a real implementation, this would make an API call to fetch real data
    // const response = await fetch(`${API_BASE_URL}/wyckoff-analysis?quarter=${currentQuarter.quarter}&year=${currentQuarter.year}`);
    // const data = await response.json();
    
    // For now, return mock data that could be replaced with the real API integration
    return {
      timestamp: currentQuarter.label,
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
    };
  } catch (error) {
    console.error("Error fetching Wyckoff analysis:", error);
    throw error;
  }
};

/**
 * Set up a scheduled check for data updates
 * @param {Function} callback Function to call when data is updated
 * @returns {Function} Function to cancel the scheduled updates
 */
export const scheduleDataUpdates = (callback) => {
  // Check for data updates weekly (in a real app, this could be daily)
  const intervalId = setInterval(async () => {
    try {
      const currentQuarter = getCurrentQuarter();
      
      // In a real implementation, check if new quarterly data is available
      // const response = await fetch(`${API_BASE_URL}/check-updates?lastUpdate=${encodeURIComponent(lastUpdateTime)}`);
      // const { hasUpdates } = await response.json();
      
      // For demonstration, just call the callback periodically
      callback(currentQuarter);
      
    } catch (error) {
      console.error("Error checking for data updates:", error);
    }
  }, 7 * 24 * 60 * 60 * 1000); // Weekly check
  
  // Return function to cancel the interval
  return () => clearInterval(intervalId);
};

// You could add more functions here for specific data needs
