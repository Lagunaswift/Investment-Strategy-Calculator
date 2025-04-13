// pages/api/market-data.js

// Use server-side environment variable (remove NEXT_PUBLIC_ if key is only used here)
// IMPORTANT: Store your key in .env.local as POLYGON_API_KEY=YOUR_REAL_KEY
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;
const POLYGON_BASE_URL = 'https://api.polygon.io';

// Define symbols suitable for Polygon.io
// Note: Crypto often requires X: prefix
const POLYGON_SYMBOLS = {
  stock: 'SPY',
  bond: 'TLT',
  crypto: 'X:BTCUSD', // Use Polygon's format for Crypto aggregates
  gold: 'GLD'
};

export default async function handler(req, res) {
  // Check for API key first
  if (!POLYGON_API_KEY) {
      console.error("Polygon API key is missing.");
      return res.status(500).json({ error: 'API key configuration error.' });
  }

  try {
    const { asset, startDate, endDate } = req.query;

    if (!asset || !POLYGON_SYMBOLS[asset] || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing or invalid required parameters: asset, startDate, endDate'
      });
    }

    const ticker = POLYGON_SYMBOLS[asset];
    const multiplier = 1; // For daily aggregates
    const timespan = 'day';

    // --- Construct the CORRECT Polygon.io URL ---
    const url = new URL(
        `${POLYGON_BASE_URL}/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${startDate}/${endDate}`
    );
    url.searchParams.set('adjusted', 'true'); // Get adjusted prices
    url.searchParams.set('sort', 'asc'); // Get results in chronological order
    // url.searchParams.set('limit', '5000'); // Optional: Increase limit if needed, check plan limits
    url.searchParams.set('apiKey', POLYGON_API_KEY); // Append the API key

    console.log('Fetching from Polygon.io API:', url.toString());

    // Make the request to Polygon.io
    const polygonResponse = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
         // Polygon doesn't typically require User-Agent, but keep if desired
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      }
    });

    if (!polygonResponse.ok) {
      const errorText = await polygonResponse.text();
      console.error(`Polygon API error: ${polygonResponse.status} - ${errorText}`);
      // Forward the status and a generic error, or parse specific Polygon errors
      return res.status(polygonResponse.status).json({
        error: `Polygon API Error: ${polygonResponse.status}`,
        details: errorText // Send back details for client-side debugging if needed
      });
    }

    const data = await polygonResponse.json();

    // Check Polygon's response structure for potential issues (like no results)
     if (data.queryCount === 0 || !data.results || data.results.length === 0) {
        console.warn(`No results found from Polygon for ${ticker} between ${startDate} and ${endDate}`);
        // Return the empty results structure so the client handles it gracefully
        return res.status(200).json({ ticker: ticker, queryCount: 0, resultsCount: 0, results: [] });
     }

    // Polygon data structure is already close to what the client expects.
    // It has a 'results' array with objects containing 'c' (close), 'o' (open), etc.
    console.log(`Successfully fetched ${data.resultsCount} results for ${ticker}`);
    return res.status(200).json(data); // Forward the relevant Polygon data

  } catch (error) {
    console.error('Error in /api/market-data handler:', error);
    return res.status(500).json({
      error: 'Internal server error fetching market data',
      details: error.message
    });
  }
}
