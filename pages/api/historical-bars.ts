// app/api/historical-bars/route.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { API_CONFIG, API_ERRORS, getApiKey } from '../../config/api-config';

// Define the expected structure of a single bar from Polygon
interface PolygonBar {
    o: number; // Open price
    h: number; // High price
    l: number; // Low price
    c: number; // Close price
    v: number; // Volume
    vw: number; // VWAP
    t: number; // Timestamp in milliseconds
}

interface PolygonAggsResponse {
    results: PolygonBar[];
    status: string;
    request_id: string;
    count: number;
    next_url?: string;
}

interface HistoricalData {
    ticker: string;
    data: Array<{
        date: string;
        open: number;
        high: number;
        low: number;
        close: number;
        volume: number;
        vwap: number;
    }>;
}

interface ErrorResponse {
    error: string;
    details?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse<HistoricalData | ErrorResponse>) {
    const { ticker, startDate, endDate } = req.query;

    if (!ticker || !startDate || !endDate) {
        return res.status(400).json({ 
            error: 'Missing required parameters',
            details: 'Please provide ticker, startDate, and endDate' 
        });
    }

    try {
        // Format dates for API
        const from = new Date(startDate as string).toISOString().split('T')[0];
        const to = new Date(endDate as string).toISOString().split('T')[0];

        // Build API URL
        const url = API_CONFIG.endpoints.historical
            .replace('{ticker}', ticker as string)
            .replace('{multiplier}', API_CONFIG.defaultParams.multiplier.toString())
            .replace('{timespan}', API_CONFIG.defaultParams.timespan)
            .replace('{from}', from)
            .replace('{to}', to);

        try {
            // Get API key
            const apiKey = getApiKey();
            
            // Add API key
            const fullUrl = `${url}?apiKey=${apiKey}`;

            // Fetch data
            const response = await fetch(fullUrl);
            const data = await response.json();

            if (!response.ok) {
                return res.status(500).json({ 
                    error: data.error || 'Failed to fetch historical data',
                    details: data.details || 'Polygon API returned an error'
                });
            }

            // Basic check if results exist
            if (!data.results || data.results.length === 0) {
                console.log(`No results found for ${ticker} between ${startDate} and ${endDate}`);
                return res.status(200).json({ ticker: ticker as string, data: [] });
            }

            // Transform data
            const transformedData = data.results.map(bar => ({
                date: new Date(bar.t * 1000).toISOString().split('T')[0],
                open: bar.o,
                high: bar.h,
                low: bar.l,
                close: bar.c,
                volume: bar.v,
                vwap: bar.vw
            }));

            res.status(200).json({ ticker: ticker as string, data: transformedData });
        } catch (error) {
            if (error instanceof Error && error.message.includes('API key not configured')) {
                return res.status(500).json({
                    error: 'Polygon API key not configured',
                    details: 'Please set NEXT_PUBLIC_POLYGON_API_KEY in your .env.local file. Get your API key from https://polygon.io/.'
                });
            }
            throw error;
        }
    } catch (error) {
        console.error('Error fetching historical data:', error);
        res.status(500).json({ 
            error: error instanceof Error ? error.message : 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error occurred'
        });
    }
}
