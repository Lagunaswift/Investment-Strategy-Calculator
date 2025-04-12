// components/calculator/TimeHorizonSection.js
import React from 'react';

const TimeHorizonSection = ({ timeHorizon, onHorizonChange }) => {
  // Handle direct slider change
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value, 10);
    // Create a synthetic event object with a target.value property
    // This allows us to maintain compatibility with the existing onChange handler
    onHorizonChange({ target: { value } });
  };

  // Generate year labels for specific points
  const yearLabels = [1, 10, 20, 30, 40, 50];

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <label htmlFor="timeHorizon" className="block text-sm font-medium text-gray-600">Time Horizon</label>
        <span className="text-sm font-semibold text-brand-blue bg-blue-50 px-2 py-0.5 rounded-full">
          {timeHorizon} {timeHorizon === 1 ? 'Year' : 'Years'}
        </span>
      </div>
      
      {/* Slider */}
      <input
        id="timeHorizon"
        type="range"
        min="1"
        max="50"
        value={timeHorizon}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-offset-2"
      />
      
      {/* Tick labels */}
      <div className="flex justify-between px-1 mt-1">
        {yearLabels.map(year => (
          <span key={year} className="text-xs text-gray-500">{year}</span>
        ))}
      </div>
    </div>
  );
};

export default TimeHorizonSection;
