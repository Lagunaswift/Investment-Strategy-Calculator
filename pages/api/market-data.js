import { API_KEY, ASSET_SYMBOLS, API_ENDPOINTS } from '../../services/marketDataService';

export default async function handler(req, res) {
  try {
    const { asset, startDate, endDate } = req.query;
    
    if (!asset || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: asset, startDate, endDate'
      });
    }

    // Build URL for API
    const url = new URL(API_ENDPOINTS[asset]);
    url.searchParams.set('symbol', ASSET_SYMBOLS[asset]);
    url.searchParams.set('from', startDate);
    url.searchParams.set('to', endDate);
    url.searchParams.set('apiKey', API_KEY);

    console.log('Fetching from API:', url.toString());

    // Make the request to Polygon.io
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      return res.status(response.status).json({
        error: `API error: ${response.status} - ${errorText}`
      });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  }
}
