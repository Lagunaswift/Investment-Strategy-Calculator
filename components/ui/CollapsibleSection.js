// components/ui/CollapsibleSection.js
import React, { useState } from 'react';

const CollapsibleSection = ({ title, children, initiallyOpen = false }) => {
  const [isOpen, setIsOpen] = useState(initiallyOpen);

  return (
    <div className="mb-4 border border-gray-200 rounded-lg shadow-sm">
      <button
        className="w-full flex justify-between items-center p-4 text-left font-medium bg-gray-50 hover:bg-gray-100 transition-colors rounded-t-lg focus:outline-none focus:ring-2 focus:ring-brand-blue focus:ring-opacity-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        <svg 
          className={`w-5 h-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="p-4 bg-white rounded-b-lg border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsibleSection;
