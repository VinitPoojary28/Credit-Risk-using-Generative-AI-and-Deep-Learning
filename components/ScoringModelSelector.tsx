
import React from 'react';
import type { ScoringModelType } from '../types';

interface ScoringModelSelectorProps {
  selectedModel: ScoringModelType;
  onModelChange: (model: ScoringModelType) => void;
}

export const ScoringModelSelector: React.FC<ScoringModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  const isStandard = selectedModel === 'standard';

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-300 mb-2">Credit Scoring Model</label>
      <div className="flex items-center space-x-4 bg-slate-700 p-1 rounded-full w-full max-w-xs">
        <button
          onClick={() => onModelChange('standard')}
          className={`flex-1 text-center text-sm font-semibold py-2 rounded-full transition-colors duration-300 ${isStandard ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-600'}`}
          aria-pressed={isStandard}
        >
          Standard Risk
        </button>
        <button
          onClick={() => onModelChange('deepLearning')}
          className={`flex-1 text-center text-sm font-semibold py-2 rounded-full transition-colors duration-300 ${!isStandard ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-600'}`}
          aria-pressed={!isStandard}
        >
          Deep Learning
        </button>
      </div>
       <p className="text-xs text-slate-500 mt-2 pl-1">
        Choose the type of simulated model to assess the credit risk.
      </p>
    </div>
  );
};
