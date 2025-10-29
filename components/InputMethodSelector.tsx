import React from 'react';
import { PencilSquareIcon, DocumentArrowUpIcon } from './IconComponents';

interface InputMethodSelectorProps {
  selectedMethod: 'manual' | 'document';
  onMethodChange: (method: 'manual' | 'document') => void;
}

export const InputMethodSelector: React.FC<InputMethodSelectorProps> = ({ selectedMethod, onMethodChange }) => {
  const isManual = selectedMethod === 'manual';

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-slate-300 mb-2">Input Method</label>
      <div className="flex items-center space-x-2 bg-slate-700 p-1 rounded-full w-full">
        <button
          type="button"
          onClick={() => onMethodChange('manual')}
          className={`flex-1 flex items-center justify-center text-sm font-semibold py-2 rounded-full transition-colors duration-300 ${isManual ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-600'}`}
          aria-pressed={isManual}
        >
          <PencilSquareIcon className="h-5 w-5 mr-2" />
          Manual Input
        </button>
        <button
          type="button"
          onClick={() => onMethodChange('document')}
          className={`flex-1 flex items-center justify-center text-sm font-semibold py-2 rounded-full transition-colors duration-300 ${!isManual ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-600'}`}
          aria-pressed={!isManual}
        >
          <DocumentArrowUpIcon className="h-5 w-5 mr-2" />
          Upload Document
        </button>
      </div>
    </div>
  );
};
