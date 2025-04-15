// services/marketDataService.js
import { API_ERROR_TYPES, RETRY_OPTIONS, RATE_LIMIT, retryWithBackoff, parseApiError, createThrottledFunction, cacheManager } from '../utils/apiUtils';

// Asset symbols for different asset classes
const ASSET_SYMBOLS = {
  stock: 'SPY',    // S&P 500 ETF
  bond: 'TLT',     // 20+ Year Treasury Bond ETF
  crypto: 'BTC-USD', // Bitcoin (Note: Polygon API route might use X:BTCUSD)
  gold: 'GLD'      // Gold ETF
};

// API endpoints for different assets (Pointing to internal Next.js API routes)
const API_ENDPOINTS = {
  stock: '/api/market-data?asset=stock',
  bond: '/api/market-data?asset=bond',
  crypto: '/api/market-data?asset=crypto',
  gold: '/api/market-data?asset=gold'
};

// API key (This is used server-side in the API route, not directly here usually)
// Keep NEXT_PUBLIC_ prefix ONLY if genuinely needed client-side elsewhere,
// otherwise prefer server-only variable for the API route.
const API_KEY = process.env.NEXT_PUBLIC_POLYGON_API_KEY || 'V9Q0xLxC4f8PRdksYljJPgSaYI2OnSkG'; // Fallback is bad practice

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
      mode: 'cors', // Keep CORS if calling external APIs directly, less critical for internal
      credentials: 'omit',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // Optional, good practice
        'Cache-Control': 'no-cache', // Ensure fresh data from API route
        'Pragma': 'no-cache'
      }
    };

    const response = await fetch(urlString, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error response: ${response.status} - ${errorText}`);
      // Try to parse error JSON from API route if possible
      let errorJson = {};
      try {
        errorJson = JSON.parse(errorText);
      } catch (e) { /* Ignore parse error */ }
      throw new Error(errorJson.error || errorJson.details || `API error: ${response.status} - ${errorText.substring(0, 100)}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', {
      url: url.toString(),
      error: error.message,
      stack: error.stack?.substring(0, 200) // Limit stack trace length
    });
    // Re-throw a structured error
    throw {
      type: ERROR_TYPES.NETWORK_ERROR, // Or determine based on error type
      message: error.message || 'Network request failed',
      originalError: error,
      url: url.toString(),
      timestamp: new Date().toISOString()
    };
  }
// Ensure RATE_LIMIT is defined or provide default values
}, (RATE_LIMIT?.windowMs || 10000) / (RATE_LIMIT?.callsPerMinute || 5), {
  leading: true,
  trailing: false
});

// --- buildUrl function is not used when calling internal API routes directly ---
// const buildUrl = (endpoint, params) => { ... };

/**
 * Get cache key for asset data
 * @param {string} asset - Asset type
 * @param {string} symbol - Asset symbol
 * @returns {string} - Cache key
 */
const getCacheKey = (asset, symbol) => `market_data_${asset}_${symbol}`;

/**
 * Fetch quarterly performance data for major asset classes by calling the internal API route
 * @returns {Promise<Object>} Quarterly performance data
 */
export const fetchQuarterlyPerformance = async () => {
    try {
        console.log('Starting quarterly performance fetch...');
        const currentQuarter = getCurrentQuarter();
        const endDate = currentQuarter.endDate;
        const startDate = new Date(endDate);
        startDate.setDate(endDate.getDate() - 90); // Get data from ~3 months ago

        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];

        console.log('Fetching data sequentially for period:', startDateStr, 'to', endDateStr);

        // Initialize an object to store results
        const assets = {};
        const assetEntries = Object.entries(ASSET_SYMBOLS);

        // Process each asset sequentially
        for (const [asset, symbol] of assetEntries) {
            try {
                // Check cache first
                const cacheKey = getCacheKey(asset, symbol);
                const cachedData = cacheManager.get(cacheKey);
                
                if (cachedData) {
                    console.log(`Using cached data for ${asset} (${symbol})`);
                    assets[asset] = {
                        ...cachedData,
                        fromCache: true
                    };
                    continue; // Skip fetch if cached
                }

                console.log(`Fetching fresh data for ${asset} (${symbol})...`);

                // Construct the relative path with query parameters
                const relativePath = `${API_ENDPOINTS[asset]}&startDate=${startDateStr}&endDate=${endDateStr}`;
                // Create the full URL using the current window's origin as the base
                const url = new URL(relativePath, window.location.origin);

                console.log('Calling internal API:', url.toString());

                // Use throttled fetch with retry
                const response = await retryWithBackoff(
                    () => throttledFetch(url.toString()),
                    RETRY_OPTIONS
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`API error response for ${asset}: ${response.status} - ${errorText}`);
                    throw new Error(`API error: ${response.status} - ${errorText.substring(0, 100)}`);
                }

                const data = await response.json();

                // Check for errors returned by our API route
                if (data.error) {
                    console.error(`Error received from /api/market-data for ${asset}:`, data.error, data.details);
                    throw new Error(data.error || 'Unknown error from API route');
                }

                // Check for expected structure from our API route
                if (!data.results || data.results.length === 0) {
                    console.warn(`No data results found for ${symbol} via API route.`);
                    assets[asset] = {
                        performance: null,
                        trend: 'neutral',
                        details: 'No historical data available for period.',
                        currentPrice: null,
                        lastUpdated: new Date().toISOString(),
                        symbol: symbol,
                        error: {
                            type: ERROR_TYPES.DATA_ERROR,
                            message: 'No results found'
                        }
                    };
                    continue;
                }

                // Parse the data
                const results = data.results;
                const startPrice = results[0]?.c;
                const endPrice = results[results.length - 1]?.c;

                if (startPrice === undefined || startPrice === null || endPrice === undefined || endPrice === null) {
                    console.warn(`Missing start/end price in results for ${symbol}: Start=${startPrice}, End=${endPrice}`);
                    throw new Error(`Missing price data in results for ${symbol}`);
                }

                const performance = ((parseFloat(endPrice) - parseFloat(startPrice)) / parseFloat(startPrice)) * 100;

                const assetData = {
                    performance: parseFloat(performance.toFixed(1)),
                    trend: performance > 0 ? 'up' : (performance < 0 ? 'down' : 'neutral'),
                    details: await getAssetDetails(asset),
                    currentPrice: parseFloat(endPrice).toFixed(2),
                    lastUpdated: new Date().toISOString(),
                    symbol: symbol
                };

                // Cache the data
                cacheManager.set(cacheKey, assetData);

                console.log(`Successfully processed data for ${asset} (${symbol}):`, {
                    performance: assetData.performance,
                    trend: assetData.trend
                });

                assets[asset] = assetData;

                // Add a small delay between requests to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

            } catch (error) {
                console.error(`Error processing data for ${asset} (${symbol}):`, {
                    message: error.message,
                    type: error.type,
                    url: error.url,
                    originalErrorMessage: error.originalError?.message
                });
                assets[asset] = {
                    error: {
                        type: error.type || ERROR_TYPES.NETWORK_ERROR,
                        message: `Unable to retrieve data: ${error.message}`,
                        symbol: symbol,
                        timestamp: new Date().toISOString(),
                        originalError: error.originalError
                    }
                };
            }
        }

        // Log overall status
        const hasErrors = Object.values(assets).some(asset => asset.error);
        if (hasErrors) {
            console.warn('Some assets have errors after sequential processing:', assets);
        }

        console.log('Final performance data object constructed sequentially.');

        // Return the results object containing data or errors for each asset
        return {
            timestamp: currentQuarter.label,
            lastUpdated: new Date().toISOString(),
            assets,
            cacheStats: {
                hits: Object.values(assets).filter(asset => asset && asset.fromCache).length,
                misses: Object.values(assets).filter(asset => asset && !asset.fromCache && !asset.error).length,
                errors: Object.values(assets).filter(asset => asset && asset.error).length
            }
        };

    } catch (error) {
        console.error("Critical error fetching quarterly performance:", error);
        throw {
            type: ERROR_TYPES.NETWORK_ERROR,
            message: error.message || 'Failed to fetch market data',
            originalError: error,
            timestamp: new Date().toISOString()
        };
    }
};

/**
 * Test the market data service (Calls the internal API route)
 * @returns {Promise<boolean>} True if test succeeds, false otherwise
 */
export const testMarketDataService = async () => {
  try {
    // Test with a simple API call to the internal route
    const assetToTest = 'stock';
    const testStartDate = '2023-01-01'; // Use fixed historical dates for testing
    const testEndDate = '2023-01-31';

    const relativePath = `${API_ENDPOINTS[assetToTest]}&startDate=${testStartDate}&endDate=${testEndDate}`;
    const url = new URL(relativePath, window.location.origin);

    console.log('Testing service with URL:', url.toString());
    const response = await throttledFetch(url.toString()); // Use throttled fetch for consistency

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Test API call to internal route failed with status ${response.status}. Response: ${errorText}`);
    }

    const data = await response.json();
    // Check for the structure returned by your API route (which includes Polygon's structure)
    if (data.error || !data.results) {
       console.error('Test data structure is incorrect or contains error:', data);
      throw new Error('Test data structure is incorrect or API route returned error');
    }
    console.log('Market data service test successful.');
    return true;
  } catch (error) {
    console.error('Market data service test failed:', error.message);
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
    // Calculate end date first to avoid month overflow issues
    endDate: new Date(year, quarter * 3, 0),
    startDate: new Date(year, (quarter - 1) * 3, 1)
  };
};

/**
 * Helper function to get asset-specific details (Static for now)
 * @param {string} asset Asset type (stock, bond, crypto, gold)
 * @returns {Promise<string>} Asset-specific market details
 */
async function getAssetDetails(asset) {
  // Keep static details for now
  const details = {
    stock: 'Broad US market index (S&P 500).',
    bond: 'Long-term US Treasury bonds.',
    crypto: 'Primary cryptocurrency market indicator.',
    gold: 'Commodity often used as inflation hedge.'
  };
  return details[asset] || 'General market conditions.';
}

/**
 * Fetch Wyckoff market cycle analysis for major markets (Mock Data)
 * @returns {Promise<Object>} Wyckoff analysis data
 */
export const fetchWyckoffAnalysis = async () => {
  // Keep mock data for Wyckoff analysis
  try {
    const currentQuarter = getCurrentQuarter();
    return {
      timestamp: currentQuarter.label,
      lastUpdated: new Date().toISOString(),
      markets: {
        sp500: { phase: 'Distribution / Early Markdown', position: 80, notes: '...' },
        nasdaq: { phase: 'Re-acc / Distribution', position: 60, notes: '...' },
        ftse: { phase: 'Distribution / Markdown', position: 85, notes: '...' },
        bitcoin: { phase: 'Re-acc / Distribution', position: 55, notes: '...' },
        ethereum: { phase: 'Markdown', position: 90, notes: '...' }
      },
      recommendations: [ /* ... */ ]
    };
  } catch (error) {
    console.error("Error generating mock Wyckoff analysis:", error);
    throw error;
  }
};

/**
 * Set up a scheduled check for data updates (Placeholder)
 * @param {Function} callback Function to call when data is updated
 * @returns {Function} Function to cancel the scheduled updates
 */
export const scheduleDataUpdates = (callback) => {
  // Placeholder interval logic
  const intervalId = setInterval(async () => {
    try {
      const currentQuarter = getCurrentQuarter();
      console.log("Checking for data updates (mock)...", currentQuarter.label);
      // In real app, check if actual new data is available before calling back
      // callback(currentQuarter); // Only call if actual update needed
    } catch (error) {
      console.error("Error checking for data updates:", error);
    }
  // Reduced interval for testing, revert to longer for production
  }, 5 * 60 * 1000); // Check every 5 minutes for testing

  // Return function to cancel the interval
  return () => clearInterval(intervalId);
};
