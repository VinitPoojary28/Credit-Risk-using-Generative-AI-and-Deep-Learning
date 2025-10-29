import React, { useState } from 'react';
import type { ApplicantData } from '../types';
import { DocumentUpload } from './DocumentUpload';
import { InputMethodSelector } from './InputMethodSelector';
import { parseLoanDocument } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';

interface LoanApplicationFormProps {
  onSubmit: (data: ApplicantData) => void;
  isLoading: boolean;
}

interface InputProps {
  label: string;
  id: keyof ApplicantData;
  value: number;
  unit?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
}

const presets: Record<string, ApplicantData> = {
    'Good Applicant': {
        creditUtilization: 15,
        paymentHistoryMonths: 84,
        debtToIncomeRatio: 25,
        recentInquiries: 1,
        annualIncome: 8000000,
        loanAmount: 2000000,
    },
    'Borderline': {
        creditUtilization: 55,
        paymentHistoryMonths: 22,
        debtToIncomeRatio: 40,
        recentInquiries: 3,
        annualIncome: 5000000,
        loanAmount: 2500000,
    },
    'Risky Applicant': {
        creditUtilization: 92,
        paymentHistoryMonths: 9,
        debtToIncomeRatio: 55,
        recentInquiries: 6,
        annualIncome: 3000000,
        loanAmount: 1500000,
    }
};

const FormInput: React.FC<InputProps> = ({ label, id, value, unit, onChange, min, max, step }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
            {label}
        </label>
        <div className="relative">
            <input
                type="number"
                id={id}
                name={id}
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pr-16 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500 appearance-none [-moz-appearance:textfield]"
                required
            />
            {unit && <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-slate-400 pointer-events-none">{unit}</span>}
        </div>
    </div>
);


export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<ApplicantData>({
    creditUtilization: 45,
    paymentHistoryMonths: 18,
    debtToIncomeRatio: 30,
    recentInquiries: 3,
    annualIncome: 4500000,
    loanAmount: 1000000,
  });
  const [inputMethod, setInputMethod] = useState<'manual' | 'document'>('manual');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, min, max } = e.target;
    let numValue = Number(value);
    
    // Clamp the value within the min/max range
    if (value !== '') {
        numValue = Math.max(Number(min), Math.min(Number(max), numValue));
    }

    setFormData(prev => ({ ...prev, [name]: numValue }));
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handlePreset = (presetName: string) => {
    setFormData(presets[presetName]);
  };

  const handleFileUpload = async (file: File) => {
    setIsParsing(true);
    setParseError(null);
    try {
        const parsedData = await parseLoanDocument(file);

        if (Object.keys(parsedData).length === 0) {
            throw new Error("Could not extract any required fields from the document. Please ensure it contains relevant financial information.");
        }

        // Create a complete data object by merging with defaults
        const fullData = { ...formData, ...parsedData };
        
        // Immediately trigger the main analysis process
        onSubmit(fullData);

    } catch (err) {
        console.error("Parsing Error:", err);
        const errorMessage = err instanceof Error ? err.message : 'Could not automatically parse the document. Please try again or use manual input.';
        setParseError(errorMessage);
    } finally {
        setIsParsing(false);
    }
  };

  return (
    <form onSubmit={handleManualSubmit}>
      <InputMethodSelector selectedMethod={inputMethod} onMethodChange={setInputMethod} />
      
      {parseError && (
          <div className="my-4 text-sm text-red-400 bg-red-900/50 p-3 rounded-lg text-center">
              {parseError}
          </div>
      )}

      {inputMethod === 'document' && (
          <div className="my-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center my-10">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-400">
                        {isParsing ? 'Parsing document...' : 'Analyzing credit risk...'}
                    </p>
                </div>
              ) : (
                <DocumentUpload onFileUpload={handleFileUpload} />
              )}
          </div>
      )}

      {inputMethod === 'manual' && (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center my-6 space-x-2">
                <span className="text-sm font-medium text-slate-300">Applicant Presets:</span>
                <div className="flex space-x-2">
                    {Object.keys(presets).map(name => (
                        <button
                            key={name}
                            type="button"
                            onClick={() => handlePreset(name)}
                            className="px-3 py-1 text-xs font-semibold text-cyan-300 bg-slate-700 rounded-full hover:bg-slate-600 transition-colors"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <FormInput label="Credit Utilization Ratio" id="creditUtilization" min={0} max={100} step={1} value={formData.creditUtilization} unit="%" onChange={handleChange} />
            <FormInput label="Payment History Length" id="paymentHistoryMonths" min={1} max={120} step={1} value={formData.paymentHistoryMonths} unit="months" onChange={handleChange} />
            <FormInput label="Debt-to-Income Ratio" id="debtToIncomeRatio" min={0} max={100} step={1} value={formData.debtToIncomeRatio} unit="%" onChange={handleChange} />
            <FormInput label="Recent Inquiries (last 6 months)" id="recentInquiries" min={0} max={10} step={1} value={formData.recentInquiries} onChange={handleChange} />
            <FormInput label="Annual Income" id="annualIncome" min={100000} max={20000000} step={100000} value={formData.annualIncome} unit="INR" onChange={handleChange} />
            <FormInput label="Loan Amount Required" id="loanAmount" min={50000} max={10000000} step={10000} value={formData.loanAmount} unit="INR" onChange={handleChange} />
            
            <div className="mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
              >
                {isLoading ? 'Analyzing...' : 'Analyze Credit Risk'}
              </button>
            </div>
        </div>
      )}
    </form>
  );
};