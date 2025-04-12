import React from 'react';

const ExportControls = () => {
  // Placeholder functions for future implementation
  const handleExportPDF = () => {
    alert('Export to PDF functionality not yet implemented.');
  };

  const handlePrint = () => {
    alert('Print functionality not yet implemented.');
    // In a real implementation, you might use window.print()
    // or a library to format the content for printing.
  };

  return (
    <div className="mt-8 p-4 bg-gray-100 rounded-lg border border-gray-300">
      <h4 className="text-md font-semibold text-gray-800 mb-3">Export & Print Summary</h4>
      <p className="text-sm text-gray-600 mb-4">
        Generate a summary of your inputs, allocation, and projected outcomes for your records.
      </p>
      <div className="flex space-x-4">
        <button
          onClick={handleExportPDF}
          className="px-4 py-2 bg-brand-blue text-white text-sm rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          disabled // Disable until implemented
        >
          Export as PDF
        </button>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
          disabled // Disable until implemented
        >
          Print Summary
        </button>
      </div>
       <p className="text-xs italic text-gray-500 mt-3">
         (Export and Print features are planned for a future update.)
        </p>
    </div>
  );
};

export default ExportControls;
