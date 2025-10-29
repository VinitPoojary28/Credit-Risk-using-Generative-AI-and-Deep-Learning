
import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { LoanApplicationForm } from './components/LoanApplicationForm';
import { DecisionResult } from './components/DecisionResult';
import { ResultsAnalysis } from './components/ResultsAnalysis';
import { getGenAIExplanation } from './services/geminiService';
import type { ApplicantData, MLOutput, ScoringModelType } from './types';
import { DecisionStatus } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ScoringModelSelector } from './components/ScoringModelSelector';
import { LoanManagerChatbot } from './components/LoanManagerChatbot';

const App: React.FC = () => {
  const [applicantData, setApplicantData] = useState<ApplicantData | null>(null);
  const [mlOutput, setMlOutput] = useState<MLOutput | null>(null);
  const [genAIExplanation, setGenAIExplanation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [scoringModel, setScoringModel] = useState<ScoringModelType>('standard');

  const handleFormSubmit = useCallback(async (data: ApplicantData) => {
    setIsLoading(true);
    setError(null);
    setMlOutput(null);
    setGenAIExplanation('');
    setApplicantData(data);

    try {
      // 1. Simulate Black-Box ML Model based on selection
      const simulationFunction = scoringModel === 'standard' ? simulateStandardModel : simulateDeepLearningModel;
      const { score, decision, featureImportance } = simulationFunction(data);
      const simulatedOutput: MLOutput = {
        decision,
        score,
        featureImportance,
        modelType: scoringModel
      };
      setMlOutput(simulatedOutput);

      // 2. Call GenAI for explanation
      const explanation = await getGenAIExplanation(data, simulatedOutput, 'gemini-2.5-flash');
      setGenAIExplanation(explanation);

    } catch (err) {
      console.error(err);
      setError('An error occurred while generating the explanation. Please check the console.');
    } finally {
      setIsLoading(false);
    }
  }, [scoringModel]);

  const simulateStandardModel = (data: ApplicantData): Omit<MLOutput, 'modelType'> => {
    let score = 650;
    const importance: MLOutput['featureImportance'] = {
        creditUtilization: { importance: 0, impact: 0 },
        paymentHistoryMonths: { importance: 0, impact: 0 },
        debtToIncomeRatio: { importance: 0, impact: 0 },
        recentInquiries: { importance: 0, impact: 0 },
        annualIncome: { importance: 0, impact: 0 },
        loanAmount: { importance: 0, impact: 0 },
    };
    const totalImpactRange = 450;

    // Credit Utilization (higher is worse)
    const utilPenalty = -Math.pow(data.creditUtilization / 100, 2) * 200;
    score += utilPenalty;
    importance.creditUtilization = { impact: utilPenalty, importance: Math.abs(utilPenalty / totalImpactRange) };

    // Payment History (longer is better)
    let historyImpact = 0;
    if (data.paymentHistoryMonths < 12) historyImpact = -80;
    else if (data.paymentHistoryMonths < 36) historyImpact = (data.paymentHistoryMonths - 12) * 2 - 40;
    else historyImpact = Math.min((data.paymentHistoryMonths - 36) * 1.5, 100);
    score += historyImpact;
    importance.paymentHistoryMonths = { impact: historyImpact, importance: Math.abs(historyImpact / totalImpactRange) };

    // DTI (higher is worse)
    const dtiPenalty = -(data.debtToIncomeRatio / 100) * 100;
    score += dtiPenalty;
    importance.debtToIncomeRatio = { impact: dtiPenalty, importance: Math.abs(dtiPenalty / totalImpactRange) };
    
    // Recent Inquiries (more is worse)
    const inquiryPenalty = -data.recentInquiries * 15;
    score += inquiryPenalty;
    importance.recentInquiries = { impact: inquiryPenalty, importance: Math.abs(inquiryPenalty / totalImpactRange) };
    
    // Income (higher is better)
    const incomeBonus = Math.min(data.annualIncome / 1000000, 10) * 10; // Capped at 1 Crore INR
    score += incomeBonus;
    importance.annualIncome = { impact: incomeBonus, importance: Math.abs(incomeBonus / totalImpactRange) };

    // Loan Amount (higher relative to income is worse)
    const lti = data.loanAmount / data.annualIncome;
    const ltiPenalty = -Math.pow(Math.max(0, lti - 0.5), 1.5) * 50; // Penalize LTI over 0.5
    score += ltiPenalty;
    importance.loanAmount = { impact: ltiPenalty, importance: Math.abs(ltiPenalty / totalImpactRange) };
    
    score = Math.max(300, Math.min(850, Math.round(score)));
    const decision = score >= 670 ? DecisionStatus.Approved : DecisionStatus.Denied;
    return { score, decision, featureImportance: importance };
  };

  const simulateDeepLearningModel = (data: ApplicantData): Omit<MLOutput, 'modelType'> => {
    let score = 650;
    const importance: MLOutput['featureImportance'] = {
        creditUtilization: { importance: 0, impact: 0 },
        paymentHistoryMonths: { importance: 0, impact: 0 },
        debtToIncomeRatio: { importance: 0, impact: 0 },
        recentInquiries: { importance: 0, impact: 0 },
        annualIncome: { importance: 0, impact: 0 },
        loanAmount: { importance: 0, impact: 0 },
    };
    const totalImpactRange = 450;

    // Non-linear penalty for Credit Utilization
    const utilPenalty = -Math.pow(data.creditUtilization / 100, 3) * 250;
    score += utilPenalty;
    importance.creditUtilization = { impact: utilPenalty, importance: Math.abs(utilPenalty / totalImpactRange) };

    // Logarithmic benefit for Payment History (diminishing returns)
    const historyImpact = Math.log(Math.max(1, data.paymentHistoryMonths)) * 25 - 50;
    score += historyImpact;
    importance.paymentHistoryMonths = { impact: historyImpact, importance: Math.abs(historyImpact / totalImpactRange) };

    // DTI impact scaled by income (interaction effect)
    const incomeInLakhs = data.annualIncome / 100000;
    const dtiPenalty = -(data.debtToIncomeRatio / 100) * (150 - Math.min(incomeInLakhs, 100)); // High income mitigates DTI penalty
    score += dtiPenalty;
    importance.debtToIncomeRatio = { impact: dtiPenalty, importance: Math.abs(dtiPenalty / totalImpactRange) };

    // Inquiries penalty amplified by short payment history
    const inquiryPenalty = -data.recentInquiries * (10 + 40 / Math.sqrt(data.paymentHistoryMonths));
    score += inquiryPenalty;
    importance.recentInquiries = { impact: inquiryPenalty, importance: Math.abs(inquiryPenalty / totalImpactRange) };
    
    // Income bonus
    const incomeBonus = Math.tanh((data.annualIncome - 600000) / 2000000) * 80;
    score += incomeBonus;
    importance.annualIncome = { impact: incomeBonus, importance: Math.abs(incomeBonus / totalImpactRange) };

    // Loan Amount penalty, amplified by DTI (interaction)
    const lti = data.loanAmount / data.annualIncome;
    const ltiPenalty = -Math.pow(lti, 2) * (50 + data.debtToIncomeRatio); // LTI risk is worse if DTI is also high
    score += ltiPenalty;
    importance.loanAmount = { impact: ltiPenalty, importance: Math.abs(ltiPenalty / totalImpactRange) };

    // Interaction penalty: high DTI + high utilization
    if (data.debtToIncomeRatio > 40 && data.creditUtilization > 60) {
        score -= 50;
    }
    
    score = Math.max(300, Math.min(850, Math.round(score)));
    const decision = score >= 670 ? DecisionStatus.Approved : DecisionStatus.Denied;
    return { score, decision, featureImportance: importance };
  };

  const analysisData = mlOutput && applicantData ? { mlOutput, applicantData, genAIExplanation } : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Loan Application Details</h2>
            <p className="mb-6 text-slate-400">
              Enter financial details, then select a scoring model. The 'black-box' model will generate a decision, and GenAI will provide a human-readable explanation.
            </p>
            <ScoringModelSelector selectedModel={scoringModel} onModelChange={setScoringModel} />
            <LoanApplicationForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          <div className="bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Assessment Results</h2>
            {isLoading && (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <LoadingSpinner />
                    <p className="mt-4 text-slate-400">Analyzing data and generating explanation...</p>
                </div>
            )}
            {error && <div className="text-red-400 bg-red-900/50 p-4 rounded-lg">{error}</div>}
            {!isLoading && !error && mlOutput && applicantData && (
              <DecisionResult mlOutput={mlOutput} genAIExplanation={genAIExplanation} applicantData={applicantData} />
            )}
            {!isLoading && !error && !mlOutput && (
                <div className="flex items-center justify-center h-full min-h-[300px] text-center text-slate-500">
                    <p>Results will be displayed here once an application is submitted.</p>
                </div>
            )}
          </div>
        </div>
        
        <LoanManagerChatbot analysisData={analysisData} />

        <ResultsAnalysis analysisData={analysisData} />

      </main>
    </div>
  );
};

export default App;
