
import React from 'react';
import { BrainCircuitIcon } from './IconComponents';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <BrainCircuitIcon className="h-8 w-8 text-cyan-400 mr-3" />
        <h1 className="text-xl md:text-2xl font-bold text-white">
          Explainable Credit Risk Decisions via GenAI
        </h1>
      </div>
    </header>
  );
};
