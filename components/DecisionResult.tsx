
import React from 'react';
import type { MLOutput, ApplicantData } from '../types';
import { DecisionStatus } from '../types';
import { CheckCircleIcon, XCircleIcon, CpuChipIcon, SparklesIcon, ChartBarIcon, UserCircleIcon } from './IconComponents';
import { FeatureImportanceChart } from './RadarChart';

interface DecisionResultProps {
  mlOutput: MLOutput;
  genAIExplanation: string;
  applicantData: ApplicantData;
}

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const percentage = ((score - 300) / (850 - 300)) * 100;
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (percentage / 100) * circumference;
    
    let colorClass = 'text-red-500';
    if (score >= 670) colorClass = 'text-green-500';
    else if (score >= 580) colorClass = 'text-yellow-500';

    return (
        <div className="relative flex items-center justify-center w-40 h-40">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                    className="text-slate-700"
                    strokeWidth="10"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
                <circle
                    className={`${colorClass} transition-all duration-1000 ease-out`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    transform="rotate(-90 50 50)"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                 <span className={`text-4xl font-bold ${colorClass}`}>{score}</span>
                 <span className="text-sm text-slate-400">Credit Score</span>
            </div>
        </div>
    );
};

const MetricVisualization: React.FC<{
  label: string;
  value: number;
  unit: string;
  max: number;
  ranges: { color: string; to: number; label: string }[];
}> = ({ label, value, unit, max, ranges }) => {
    const markerPosition = Math.min((value / max) * 100, 100);
    const displayValue = ['Annual Income', 'Loan Amount Required'].includes(label) ? value.toLocaleString('en-IN') : value.toLocaleString();

    return (
        <div>
            <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-slate-300">{label}</span>
                <span className="text-sm font-bold text-cyan-400">{displayValue}{unit}</span>
            </div>
            <div className="relative w-full h-6 bg-slate-800 rounded">
                <div className="flex h-full rounded">
                    {ranges.map((range, index) => {
                        const prevRangeEnd = index > 0 ? ranges[index - 1].to : 0;
                        const width = ((range.to - prevRangeEnd) / max) * 100;
                        return (
                            <div
                                key={range.label}
                                className={`${range.color} h-full ${index === 0 ? 'rounded-l' : ''} ${index === ranges.length - 1 ? 'rounded-r' : ''}`}
                                style={{ width: `${width}%` }}
                                title={`${range.label} range`}
                            ></div>
                        );
                    })}
                </div>
                <div
                    className="absolute top-0 w-1 h-full bg-white rounded-full shadow-lg transform -translate-x-1/2"
                    style={{ left: `${markerPosition}%` }}
                    title={`Your value: ${displayValue}`}
                >
                    <div className="absolute -top-2 -left-1 w-3 h-3 bg-white rounded-full transform -translate-x-1/2 rotate-45"></div>
                </div>
            </div>
             <div className="flex justify-between text-xs text-slate-500 mt-1">
                {ranges.map((range) => (
                    <span key={range.label}>{range.label}</span>
                ))}
            </div>
        </div>
    );
};

const ApplicantProfileSnapshot: React.FC<{ applicantData: ApplicantData }> = ({ applicantData }) => {
    const metrics = [
        { id: 'creditUtilization', label: 'Credit Utilization', value: applicantData.creditUtilization, unit: '%', max: 100, ranges: [{label: 'Good', to: 30, color: 'bg-green-600/70'}, {label: 'Fair', to: 50, color: 'bg-yellow-600/70'}, {label: 'Poor', to: 100, color: 'bg-red-600/70'}] },
        { id: 'paymentHistoryMonths', label: 'Payment History', value: applicantData.paymentHistoryMonths, unit: ' mo', max: 120, ranges: [{label: 'Poor', to: 12, color: 'bg-red-600/70'}, {label: 'Fair', to: 36, color: 'bg-yellow-600/70'}, {label: 'Good', to: 120, color: 'bg-green-600/70'}] },
        { id: 'debtToIncomeRatio', label: 'Debt-to-Income Ratio', value: applicantData.debtToIncomeRatio, unit: '%', max: 100, ranges: [{label: 'Good', to: 36, color: 'bg-green-600/70'}, {label: 'Fair', to: 43, color: 'bg-yellow-600/70'}, {label: 'Poor', to: 100, color: 'bg-red-600/70'}] },
        { id: 'recentInquiries', label: 'Recent Inquiries', value: applicantData.recentInquiries, unit: '', max: 10, ranges: [{label: 'Good', to: 2, color: 'bg-green-600/70'}, {label: 'Fair', to: 4, color: 'bg-yellow-600/70'}, {label: 'Poor', to: 10, color: 'bg-red-600/70'}] },
        { id: 'annualIncome', label: 'Annual Income', value: applicantData.annualIncome, unit: ' INR', max: 10000000, ranges: [{label: 'Low', to: 2500000, color: 'bg-red-600/70'}, {label: 'Medium', to: 6000000, color: 'bg-yellow-600/70'}, {label: 'High', to: 10000000, color: 'bg-green-600/70'}] },
        { id: 'loanAmount', label: 'Loan Amount Required', value: applicantData.loanAmount, unit: ' INR', max: 5000000, ranges: [{label: 'Low', to: 1000000, color: 'bg-green-600/70'}, {label: 'Medium', to: 2500000, color: 'bg-yellow-600/70'}, {label: 'High', to: 5000000, color: 'bg-red-600/70'}] },
    ];

    return (
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <h3 className="flex items-center text-lg font-semibold mb-4 text-slate-400">
                <UserCircleIcon className="h-5 w-5 mr-2" />
                Applicant Profile Snapshot
            </h3>
            <div className="space-y-5">
                {metrics.map(metric => <MetricVisualization key={metric.id} {...metric} />)}
            </div>
        </div>
    );
};

export const DecisionResult: React.FC<DecisionResultProps> = ({ mlOutput, genAIExplanation, applicantData }) => {
  const isApproved = mlOutput.decision === DecisionStatus.Approved;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Decision */}
      <div className={`flex items-center p-4 rounded-lg ${isApproved ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
        {isApproved ? <CheckCircleIcon className="h-8 w-8 mr-3" /> : <XCircleIcon className="h-8 w-8 mr-3" />}
        <span className="text-2xl font-bold">Loan Application {mlOutput.decision}</span>
      </div>

      <div className="flex justify-center my-4">
        <ScoreGauge score={mlOutput.score} />
      </div>

      {/* Applicant Profile Snapshot */}
      <ApplicantProfileSnapshot applicantData={applicantData} />

      {/* GenAI Explanation */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-cyan-500/30">
        <h3 className="flex items-center text-lg font-semibold mb-2 text-cyan-400">
          <SparklesIcon className="h-5 w-5 mr-2" />
          GenAI Explanation
        </h3>
        <p className="text-slate-300 whitespace-pre-wrap">{genAIExplanation || 'Generating explanation...'}</p>
      </div>

      {/* Feature Importance */}
      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
          <h3 className="flex items-center text-lg font-semibold mb-2 text-slate-400">
              <ChartBarIcon className="h-5 w-5 mr-2" />
              Key Factor Importance
          </h3>
          <FeatureImportanceChart featureImportance={mlOutput.featureImportance} />
      </div>

      {/* Black-Box ML Output */}
      <details className="bg-slate-900/50 rounded-lg border border-slate-700">
          <summary className="flex items-center text-lg font-semibold p-4 cursor-pointer text-slate-400 hover:bg-slate-800/50 rounded-t-lg transition-colors">
              <CpuChipIcon className="h-5 w-5 mr-2" />
              'Black-Box' Model Raw Output
          </summary>
          <div className="p-4 border-t border-slate-700">
              <pre className="bg-slate-900 p-3 rounded-md text-xs text-yellow-300 overflow-x-auto">
                {JSON.stringify(mlOutput, (key, value) => 
                    typeof value === 'number' && key !== 'score' ? Number(value.toFixed(2)) : value, 
                2)}
              </pre>
          </div>
      </details>
    </div>
  );
};
