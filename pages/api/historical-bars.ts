// app/api/historical-bars/route.ts
import { NextResponse } from 'next/server';

// Define the expected structure of a single bar from Polygon
interface PolygonBar {
  o: number; // Open
  h: number; // High
  l: number; // Low
  c: number; // Close
  v: number; // Volume
  t: number; // Timestamp (Unix ms)
  n?: number; // Number of transactions (optional)
  vw?: number; // Volume weighted average price (optional)
}

// Define the structure of the overall response from Polygon Aggregates API
interface PolygonAggsResponse {
    ticker?: string;
    queryCount?: number;
    resultsCount?: number;
    adjusted?: boolean;
    results?: PolygonBar[];
    status?: string;
    request_id?: string;
    count?: number;
    next_url?: string; // For pagination
}


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker');
  const timespan = searchParams.get('timespan') || 'day'; // Default to 'day'
  const from = searchParams.get('from'); // Expects YYYY-MM-DD
  const to = searchParams.get('to');   // Expects YYYY-MM-DD
  const limit = searchParams.get('limit') || '5000'; // Polygon default/max limit

  if (!ticker || !from || !to) {
    return NextResponse.json({ error: 'Missing required parameters: ticker, from, to' }, { status: 400 });
  }

  if (!process.env.POLYGON_API_KEY) {
      console.error("Polygon API Key not found in environment variables.");
      return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  // Adjust multiplier based on timespan if needed (e.g., for 1 week use multiplier 1 and timespan week)
  const multiplier = 1; // Typically 1 for standard daily/weekly/monthly bars

  const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=${limit}&apiKey=${process.env.POLYGON_API_KEY}`;

  console.log(`Workspaceing Polygon data: ${polygonUrl.replace(process.env.POLYGON_API_KEY, '***')}`); // Log URL without key

  try {
    const response = await fetch(polygonUrl);

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Polygon API Error (${response.status}): ${errorData}`);
      return NextResponse.json({ error: `Failed to fetch data from Polygon: ${response.statusText}`, details: errorData }, { status: response.status });
    }

    const data: PolygonAggsResponse = await response.json();

    // Basic check if results exist
    if (!data.results || data.results.length === 0) {
        console.log(`No results found for ${ticker} between ${from} and ${to}`);
        return NextResponse.json({ ticker: ticker, results: [], message: "No data found for the given parameters." }, { status: 200 });
    }

    // Return only the results array or the full structure if needed
    return NextResponse.json(data.results); // Common practice is to return the bars directly

  } catch (error) {
    console.error('Error fetching or processing data:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
}
