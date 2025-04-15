// components/WyckoffAnalysisDisplay.tsx
'use client'; // Mark as Client Component

import React, { useState, useEffect } from 'react';
import { WyckoffAnalysisResult } from '@/lib/wyckoffAnalyzer'; // Adjust path

// Define structure for the fetched data (map of ticker to result)
type AnalysisData = Record<string, WyckoffAnalysisResult>;

/*
export default function WyckoffAnalysisDisplay() {
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/wyckoff-analysis'); // Fetch from results API
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch analysis data: ${response.status} ${response.statusText} - ${errorText}`);
        }
        const data: AnalysisData = await response.json();
        setAnalysisData(data);
      } catch (err) {
        console.error("Error fetching Wyckoff analysis:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setAnalysisData(null); // Clear data on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means run once on mount

  return (
    <div className="wyckoff-analysis-container p-4 border rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Wyckoff Analysis Overview</h2>

      {isLoading && <p>Loading analysis results...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!isLoading && !error && (!analysisData || Object.keys(analysisData).length === 0) && (
          <p>No analysis data available.</p>
      )}

      {!isLoading && !error && analysisData && Object.keys(analysisData).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(analysisData).map(([ticker, result]) => (
            <div key={ticker} className="border p-3 rounded bg-gray-50">
              <h3 className="font-bold text-lg mb-2">{ticker}</h3>
              <p><strong>Phase:</strong> {result.phase || 'N/A'}</p>
              {result.rangeLow && result.rangeHigh && (
                 <p><strong>Range:</strong> {result.rangeLow.toFixed(2)} - {result.rangeHigh.toFixed(2)}</p>
              )}
              <p><strong>Last Event:</strong> {result.lastEvent || 'None noted'}</p>
              <div className="mt-2 text-sm text-gray-600">
                <strong>Notes:</strong>
                {result.notes && result.notes.length > 0 ? (
                  <ul className="list-disc list-inside ml-2">
                    {result.notes.map((note, index) => (
                      <li key={index}>{note}</li>
                    ))}
                  </ul>
                ) : (
                  ' N/A'
                )}
              </div>
              <p className="text-xs text-gray-400 mt-2">Updated: {new Date(result.lastUpdated).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500 mt-6 italic">
        Disclaimer: This is an automated analysis based on simplified Wyckoff principles
        and standard technical indicators. It is for informational purposes only and
        does not constitute financial advice. Market interpretations can vary.
      </p>
    </div>
  );
}
