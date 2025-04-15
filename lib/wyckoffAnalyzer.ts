// lib/wyckoffAnalyzer.ts

// Reuse PolygonBar interface from API route or redefine it
export interface PolygonBar {
  o: number; h: number; l: number; c: number; v: number; t: number;
}

// Look at the last N bars (e.g., 6 months ~ 126 trading days)
// const lookbackPeriod = Math.min(bars.length, 126);
// const recentBars = bars.slice(-lookbackPeriod);
// const recentIndicatorInput = prepareIndicatorInput(recentBars);

// let potentialLow = Math.min(...recentIndicatorInput.low);
// let potentialHigh = Math.max(...recentIndicatorInput.high);
// // This needs much more sophisticated logic to find *significant* pivots defining the range boundaries (e.g., SC, AR)
// result.rangeLow = potentialLow;
// result.rangeHigh = potentialHigh;
// result.notes.push(`Provisional Range [${lookbackPeriod} bars]: ${potentialLow.toFixed(2)} - ${potentialHigh.toFixed(2)}`);

// --- Event Detection (Simplified Selling Climax - SC - Example) ---
// let potentialSCEvents: string[] = [];
// // Iterate backwards from the most recent bar for relevance, but need context from before
// // Need to align indicator results with bar data carefully (indicators produce shorter arrays)
// // const offset = bars.length - volumeSma.length; // SMA removes initial bars

// // for (let i = bars.length - 1; i >= 0 && i > bars.length - 60 ; i--) { // Check last ~3 months
// //     const bar = bars[i];
// //     // const barVolume = bar.v;
// //     // const avgVolume = volumeSma[i - offset]; // Align index
// //     const avgVolume = volumeSma[i - offset]; // Align index
// //     const priceSpread = bar.h - bar.l;
// //     const isWideSpread = priceSpread > (potentialHigh - potentialLow) * 0.05; // Example: Spread > 5% of recent range
// //     const isHighVolume = barVolume > avgVolume * 1.8; // Example: Volume > 180% of average
// //     const closesNearLow = (bar.c - bar.l) < priceSpread * 0.3; // Example: Closes in bottom 30%
// //     // Add check for preceding downtrend (e.g., price < SMA50) - requires SMA for that bar 'i'
// //     const priceBelowLongSma = bar.c < priceSmaLong[i - (bars.length - priceSmaLong.length)]; // Careful index alignment!
// //     const avgVolume = volumeSma[i - offset]; // Align index
// //     const priceSpread = bar.h - bar.l;
// //     const isWideSpread = priceSpread > (potentialHigh - potentialLow) * 0.05; // Example: Spread > 5% of recent range
// //     const isHighVolume = barVolume > avgVolume * 1.8; // Example: Volume > 180% of average
// //     const closesNearLow = (bar.c - bar.l) < priceSpread * 0.3; // Example: Closes in bottom 30%
// //     // Add check for preceding downtrend (e.g., price < SMA50) - requires SMA for that bar 'i'
// //     const priceBelowLongSma = bar.c < priceSmaLong[i - (bars.length - priceSmaLong.length)]; // Careful index alignment!

// //     if (isHighVolume && isWideSpread && closesNearLow && priceBelowLongSma) {
// //         potentialSCEvents.push(`Potential SC/Climactic Action on ${new Date(bar.t).toLocaleDateString()}`);
// //         // In real logic, you'd store the *level* of this event
// //         // If this is the lowest point, it might define the bottom of the range
// //         // Break or refine logic after finding a strong candidate
// //     }
// // }
// // if (potentialSCEvents.length > 0) {
// //     result.lastEvent = potentialSCEvents[0]; // Store the most recent potential event
// //     result.notes.push(...potentialSCEvents.slice(0, 2)); // Add first few findings to notes
// // }

// --- Phase Determination (Placeholder) ---
// This requires checking the sequence of events (SC -> AR -> ST -> Spring/UTAD -> SOS/SOW etc.)
// relative to the trading range. Extremely complex.
// Example simplified logic:
// const lastPrice = indicatorInput.close[indicatorInput.close.length - 1];
// const midPoint = (result.rangeHigh + result.rangeLow) / 2;
  if (result.lastEvent?.includes("Potential SC") && lastPrice < midPoint) {
      result.phase = 'Accumulation'; // Very naive guess after potential SC
      result.notes.push("Guessing Accumulation phase based on recent potential climactic action near lows.");
  } else if (lastPrice > result.rangeHigh && lastPrice > priceSmaLong[priceSmaLong.length-1]) {
      result.phase = 'Markup'; // Naive guess if breaking above range and above MA
       result.notes.push("Guessing Markup phase based on price breaking above range/MA.");
  }
  // ... add much more logic for Distribution, Markdown, Phase B tests, Phase C events etc.


  // Return the final analysis object
  return result;
}
