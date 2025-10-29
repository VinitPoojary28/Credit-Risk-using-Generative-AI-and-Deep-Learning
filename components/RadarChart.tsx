
import React from 'react';
import type { MLOutput } from '../types';

interface FeatureImportanceChartProps {
    featureImportance: MLOutput['featureImportance'];
}

const factorLabels: Record<string, string> = {
    annualIncome: 'Annual Income',
    paymentHistoryMonths: 'Payment History',
    creditUtilization: 'Credit Utilization',
    debtToIncomeRatio: 'DTI Ratio',
    recentInquiries: 'Recent Inquiries',
    loanAmount: 'Loan Amount',
};

export const FeatureImportanceChart: React.FC<FeatureImportanceChartProps> = ({ featureImportance }) => {
    const factors = Object.entries(featureImportance)
        .map(([key, value]) => ({
            label: factorLabels[key] || key,
            ...value,
        }))
        .sort((a, b) => b.importance - a.importance);

    return (
        <div className="space-y-4 pt-2">
            {factors.map((factor, index) => {
                const isPositive = factor.impact >= 0;
                const barColor = isPositive ? 'bg-green-500' : 'bg-red-500';
                const widthPercentage = Math.max(1, factor.importance * 100); // Ensure a min width for visibility

                return (
                    <div key={index} className="w-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                        <div className="flex justify-between items-center mb-1 text-sm">
                            <span className="font-medium text-slate-300">{factor.label}</span>
                            <span className={`font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                {factor.impact >= 0 ? '+' : ''}{factor.impact.toFixed(0)} pts
                            </span>
                        </div>
                        <div className="h-3 w-full rounded-full bg-slate-700 overflow-hidden">
                            <div
                                className={`${barColor} h-3 rounded-full transition-all duration-500 ease-out`}
                                style={{ width: `${widthPercentage}%` }}
                                title={`Importance: ${(factor.importance * 100).toFixed(0)}%`}
                            ></div>
                        </div>
                    </div>
                );
            })}
             <div className="flex justify-between text-xs text-slate-500 mt-6 pt-3 border-t border-slate-700">
                <span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 mr-2 align-middle"></span>
                    Positive Impact on Score
                </span>
                <span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 mr-2 align-middle"></span>
                    Negative Impact on Score
                </span>
            </div>
        </div>
    );
};
