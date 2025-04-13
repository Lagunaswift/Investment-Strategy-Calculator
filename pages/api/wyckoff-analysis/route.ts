// app/api/wyckoff-analysis/route.ts
import { NextResponse } from 'next/server';
import { WyckoffAnalysisResult } from '@/lib/wyckoffAnalyzer'; // Adjust path

// Import storage client/SDK depending on your choice in Step 3.2
// import { kv } from '@vercel/kv';
// import Redis from 'ioredis'; const redis = new Redis(process.env.REDIS_URL);
import fs from 'fs';
import path from 'path';

const resultsFilePath = path.resolve(process.cwd(), 'wyckoff-analysis-results.json');

export async function GET(request: Request) {
  console.log("API Endpoint /api/wyckoff-analysis called");

  let allResults: Record<string, WyckoffAnalysisResult> = {};

  // --- Example: Simple File Storage ---
  try {
    if (fs.existsSync(resultsFilePath)) {
      const fileContent = fs.readFileSync(resultsFilePath, 'utf-8');
      allResults = JSON.parse(fileContent);
      console.log(`Retrieved analysis results for ${Object.keys(allResults).length} tickers from file.`);
    } else {
        console.log("Analysis results file not found.");
        return NextResponse.json({}, { status: 404, statusText: "No analysis data found." }); // Return empty or error if file doesn't exist
    }
  } catch (error) {
    console.error("Error reading analysis results file:", error);
    return NextResponse.json({ error: "Failed to retrieve analysis results" }, { status: 500 });
  }

   // --- Example: Vercel KV (Get all keys - less efficient, better to fetch specific keys if needed) ---
  // try {
  //   const keys = await kv.keys('wyckoff:*');
  //   for (const key of keys) {
  //     const ticker = key.replace('wyckoff:', '');
  //     const data = await kv.get<string>(key); // Fetch as string
  //     if (data) {
  //       allResults[ticker] = JSON.parse(data); // Parse JSON string
  //     }
  //   }
  //   console.log(`Retrieved analysis results for ${Object.keys(allResults).length} tickers from Vercel KV.`);
  // } catch (error) {
  //   console.error("Error retrieving analysis results from Vercel KV:", error);
  //   return NextResponse.json({ error: "Failed to retrieve analysis results" }, { status: 500 });
  // }

  // --- Example: Redis (Scan for keys) ---
 // try {
 //    const keys = await redis.keys('wyckoff:*'); // Use SCAN in production for large datasets
 //    for (const key of keys) {
 //       const ticker = key.replace('wyckoff:', '');
 //       const data = await redis.get(key);
 //       if (data) {
 //          allResults[ticker] = JSON.parse(data);
 //       }
 //    }
 //    console.log(`Retrieved analysis results for ${Object.keys(allResults).length} tickers from Redis.`);
 // } catch (error) {
 //    console.error("Error retrieving analysis results from Redis:", error);
 //    return NextResponse.json({ error: "Failed to retrieve analysis results" }, { status: 500 });
 // }


  if (Object.keys(allResults).length === 0) {
       console.log("No analysis results found in storage.");
       // Return empty object or an appropriate message
       return NextResponse.json({});
  }

  return NextResponse.json(allResults);
}
