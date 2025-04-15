// API Configuration
export const API_CONFIG = {
    // API endpoints
    endpoints: {
        historical: 'https://api.polygon.io/v2/aggs/ticker/{ticker}/range/{multiplier}/{timespan}/{from}/{to}',
        realTime: 'https://api.polygon.io/v2/snapshot/locale/us/markets/stocks/tickers/{ticker}',
        search: 'https://api.polygon.io/v3/reference/tickers',
        companyInfo: 'https://api.polygon.io/v3/reference/tickers/{ticker}'
    },

    // Default parameters
    defaultParams: {
        multiplier: 1,
        timespan: 'day',
        limit: 1000,
        sort: 'asc',
        unadjusted: false
    }
};

// Error handling constants
export const API_ERRORS = {
    INVALID_API_KEY: 'Invalid API key provided',
    RATE_LIMITED: 'API rate limit exceeded',
    INVALID_REQUEST: 'Invalid request parameters',
    NO_DATA: 'No data available for the requested period'
};

// Helper function to get the API key
export const getApiKey = () => {
    const apiKey = process.env.NEXT_PUBLIC_POLYGON_API_KEY;
    if (!apiKey) {
        throw new Error('Polygon API key not configured. Please set NEXT_PUBLIC_POLYGON_API_KEY in your environment variables.');
    }
    return apiKey;
};
