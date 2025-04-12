// components/calculator/RiskQuestionnaire.js
import React from 'react';

const RiskQuestionnaire = ({
    isOpen,
    onToggle,
    q1Answer, onQ1Change,
    q2Answer, onQ2Change,
    q3Answer, onQ3Change,
    q4Answer, onQ4Change,
    q5Answer, onQ5Change,
    onCalculateProfile,
    result,
    isComplete,
    recommendedProfile,
    onApplyProfile
}) => {
  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium text-left focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue"
        aria-expanded={isOpen} aria-controls="risk-questionnaire-content"
      >
        <span>Need help determining your risk tolerance? Take our assessment</span>
        <svg className={`w-5 h-5 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
      </button>
      {isOpen && (
        <div id="risk-questionnaire-content" className="mt-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Risk Tolerance Assessment</h3>
          <div className="space-y-4">
            {/* Question 1 */}
            <div>
              <p className="font-medium text-gray-700 mb-2 text-sm">1. If your portfolio lost 20% of its value in a single month, what would you do?</p>
              <div className="space-y-2">
                <div className="flex items-center"><input type="radio" id="q1a" name="q1" value="a" checked={q1Answer === 'a'} onChange={(e) => onQ1Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q1a" className="text-sm text-gray-700">Sell everything (Conservative)</label></div>
                <div className="flex items-center"><input type="radio" id="q1b" name="q1" value="b" checked={q1Answer === 'b'} onChange={(e) => onQ1Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q1b" className="text-sm text-gray-700">Sell some (Mod. Conservative)</label></div>
                <div className="flex items-center"><input type="radio" id="q1c" name="q1" value="c" checked={q1Answer === 'c'} onChange={(e) => onQ1Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q1c" className="text-sm text-gray-700">Do nothing (Moderate)</label></div>
                <div className="flex items-center"><input type="radio" id="q1d" name="q1" value="d" checked={q1Answer === 'd'} onChange={(e) => onQ1Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q1d" className="text-sm text-gray-700">Buy more (Aggressive)</label></div>
              </div>
            </div>
            {/* Question 2 */}
            <div>
              <p className="font-medium text-gray-700 mb-2 text-sm">2. Which statement best describes your investment goals?</p>
              <div className="space-y-2">
                <div className="flex items-center"><input type="radio" id="q2a" name="q2" value="a" checked={q2Answer === 'a'} onChange={(e) => onQ2Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q2a" className="text-sm text-gray-700">Preserving capital (Conservative)</label></div>
                <div className="flex items-center"><input type="radio" id="q2b" name="q2" value="b" checked={q2Answer === 'b'} onChange={(e) => onQ2Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q2b" className="text-sm text-gray-700">Growth, concerned loss (Moderate)</label></div>
                <div className="flex items-center"><input type="radio" id="q2c" name="q2" value="c" checked={q2Answer === 'c'} onChange={(e) => onQ2Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q2c" className="text-sm text-gray-700">Focus growth, accept volatility (Aggressive)</label></div>
                <div className="flex items-center"><input type="radio" id="q2d" name="q2" value="d" checked={q2Answer === 'd'} onChange={(e) => onQ2Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue" /><label htmlFor="q2d" className="text-sm text-gray-700">Maximize returns, accept high volatility (Very Aggressive)</label></div>
              </div>
            </div>
             {/* Question 3 */}
            <div>
              <p className="font-medium text-gray-700 mb-2 text-sm">3. How many years until you plan to begin withdrawing significant amounts?</p>
               <div className="space-y-2">
                 <div className="flex items-center"><input type="radio" id="q3a" name="q3" value="a" checked={q3Answer === 'a'} onChange={(e)=>onQ3Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q3a" className="text-sm text-gray-700">Less than 3 years (Conservative)</label></div>
                 <div className="flex items-center"><input type="radio" id="q3b" name="q3" value="b" checked={q3Answer === 'b'} onChange={(e)=>onQ3Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q3b" className="text-sm text-gray-700">3-5 years (Mod. Conservative)</label></div>
                 <div className="flex items-center"><input type="radio" id="q3c" name="q3" value="c" checked={q3Answer === 'c'} onChange={(e)=>onQ3Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q3c" className="text-sm text-gray-700">5-10 years (Moderate)</label></div>
                 <div className="flex items-center"><input type="radio" id="q3d" name="q3" value="d" checked={q3Answer === 'd'} onChange={(e)=>onQ3Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q3d" className="text-sm text-gray-700">10+ years (Aggressive)</label></div>
              </div>
            </div>
             {/* Question 4 */}
            <div>
              <p className="font-medium text-gray-700 mb-2 text-sm">4. Which portfolio would you be most comfortable with?</p>
               <div className="space-y-2">
                 <div className="flex items-center"><input type="radio" id="q4a" name="q4" value="a" checked={q4Answer === 'a'} onChange={(e)=>onQ4Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q4a" className="text-sm text-gray-700">A: Low Return / Low Loss (Conservative)</label></div>
                 <div className="flex items-center"><input type="radio" id="q4b" name="q4" value="b" checked={q4Answer === 'b'} onChange={(e)=>onQ4Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q4b" className="text-sm text-gray-700">B: Med Return / Med Loss (Moderate)</label></div>
                 <div className="flex items-center"><input type="radio" id="q4c" name="q4" value="c" checked={q4Answer === 'c'} onChange={(e)=>onQ4Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q4c" className="text-sm text-gray-700">C: High Return / High Loss (Aggressive)</label></div>
                 <div className="flex items-center"><input type="radio" id="q4d" name="q4" value="d" checked={q4Answer === 'd'} onChange={(e)=>onQ4Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q4d" className="text-sm text-gray-700">D: Max Return / Max Loss (Very Aggressive)</label></div>
              </div>
            </div>
             {/* Question 5 */}
            <div>
              <p className="font-medium text-gray-700 mb-2 text-sm">5. Have you invested in cryptocurrency before?</p>
               <div className="space-y-2">
                 <div className="flex items-center"><input type="radio" id="q5a" name="q5" value="a" checked={q5Answer === 'a'} onChange={(e)=>onQ5Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q5a" className="text-sm text-gray-700">No, not comfortable (Conservative)</label></div>
                 <div className="flex items-center"><input type="radio" id="q5b" name="q5" value="b" checked={q5Answer === 'b'} onChange={(e)=>onQ5Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q5b" className="text-sm text-gray-700">No, willing small allocation (Moderate)</label></div>
                 <div className="flex items-center"><input type="radio" id="q5c" name="q5" value="c" checked={q5Answer === 'c'} onChange={(e)=>onQ5Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q5c" className="text-sm text-gray-700">Yes, small amount (Aggressive)</label></div>
                 <div className="flex items-center"><input type="radio" id="q5d" name="q5" value="d" checked={q5Answer === 'd'} onChange={(e)=>onQ5Change(e.target.value)} className="mr-2 focus:ring-brand-blue h-4 w-4 text-brand-blue"/><label htmlFor="q5d" className="text-sm text-gray-700">Yes, actively invest (Very Aggressive)</label></div>
              </div>
            </div>
             {/* Result and Buttons */}
             {result && (
               <div className="mt-4 p-3 bg-pastel-bg-blue rounded border border-pastel-border-blue">
                 <p className="text-sm font-medium text-pastel-text-blue">{result}</p>
                 
                 {isComplete && recommendedProfile && (
                   <div className="mt-3 flex items-center space-x-3">
                     <button 
                       onClick={onApplyProfile}
                       className="px-4 py-2 bg-highlight-green text-white text-sm rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                     >
                       Apply This Profile
                     </button>
                     <span className="text-xs text-gray-500">This will update your risk profile setting</span>
                   </div>
                 )}
               </div>
             )}
             
             <div className="mt-4 flex justify-between">
               <button 
                 className="px-4 py-2 bg-brand-blue text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue" 
                 onClick={onCalculateProfile}
               >
                 {isComplete ? 'Recalculate Profile' : 'Calculate My Risk Profile'}
               </button>
               
               {isComplete && (
                 <button 
                   className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500" 
                   onClick={() => onToggle()}
                 >
                   Close Assessment
                 </button>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskQuestionnaire;
