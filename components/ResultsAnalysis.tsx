
import React, { useState } from 'react';
import { ChevronDownIcon, DocumentTextIcon, BeakerIcon } from './IconComponents';
import type { ApplicantData, MLOutput } from '../types';

interface ResultsAnalysisProps {
    analysisData: {
        mlOutput: MLOutput;
        applicantData: ApplicantData;
        genAIExplanation: string;
    } | null;
}

const Accordion: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode, startOpen?: boolean }> = ({ title, icon, children, startOpen = false }) => {
    const [isOpen, setIsOpen] = useState(startOpen);

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-lg hover:bg-slate-700/50"
            >
                <div className="flex items-center">
                    {icon}
                    <span className="ml-3">{title}</span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-700 text-slate-300 prose prose-invert max-w-none">
                    {children}
                </div>
            )}
        </div>
    );
};


export const ResultsAnalysis: React.FC<ResultsAnalysisProps> = ({ analysisData }) => {
  return (
    <div className="mt-12">
        <h2 className="text-3xl font-bold text-center mb-8">Project Details & Analysis</h2>
        <div className="space-y-4 max-w-4xl mx-auto">
            <Accordion title="Live Analysis of This Decision" icon={<DocumentTextIcon className="w-6 h-6 text-cyan-400"/>} startOpen={true}>
                {analysisData ? (
                    <>
                        <p>
                            The applicant's data was just processed by the <strong>{analysisData.mlOutput.modelType === 'standard' ? 'Standard Risk Model' : 'Deep Learning Model'}</strong>, resulting in a decision of <strong>'{analysisData.mlOutput.decision}'</strong> with a score of {analysisData.mlOutput.score}.
                        </p>
                        <p>
                            The core of this project is translating that quantitative output into a human-centric explanation. GenAI was tasked with this, and it produced the following key message:
                        </p>
                        <blockquote className="border-l-4 border-cyan-500 pl-4 italic">
                            "{analysisData.genAIExplanation.split('.').slice(0, 2).join('.') + '.'}"
                        </blockquote>
                        <p>
                            This demonstrates how GenAI acts as a bridge, converting complex data points into an understandable and actionable narrative for the end-user.
                        </p>
                    </>
                ) : (
                    <p>Submit a loan application above to see a live analysis of the results here.</p>
                )}
            </Accordion>
            
            <Accordion title="Comparing Model Methodologies" icon={<BeakerIcon className="w-6 h-6 text-green-400"/>}>
                 <p>
                    This tool allows you to switch between two simulated 'black-box' models to see how different architectures can lead to different outcomes.
                </p>
                
                <h4>Standard Risk Model</h4>
                <p>
                    This model uses a more traditional, linear approach. Each factor (like credit utilization or income) adds or subtracts a set number of points from the credit score. It's predictable and easier to interpret but may miss complex relationships in the data.
                    {analysisData?.mlOutput.modelType === 'standard' && <strong className="text-green-400 block mt-2">This was the model used in the analysis above.</strong>}
                </p>

                <h4>Deep Learning Model</h4>
                <p>
                    This model simulates a more modern, complex approach. It understands non-linear relationships and "interaction effects." For example, it might learn that high debt is significantly more risky for a low-income applicant than for a high-income one. These nuanced insights can lead to more accurate predictions but make the model's internal logic much harder to follow without an external tool like GenAI.
                    {analysisData?.mlOutput.modelType === 'deepLearning' && <strong className="text-green-400 block mt-2">This was the model used in the analysis above.</strong>}
                </p>
            </Accordion>

            <Accordion title="Regulatory & Trust Implications" icon={<BeakerIcon className="w-6 h-6 text-yellow-400"/>}>
                 <p>
                    Regulations like the EU's GDPR and AI Act emphasize the "right to explanation" for decisions made by automated systems. This project directly addresses that challenge.
                </p>
                {analysisData ? (
                     <>
                        <p>
                            For the decision of <strong>'{analysisData.mlOutput.decision}'</strong> you just received, simply providing the raw model output (a JSON file) would not meet the regulatory standard of a "meaningful explanation" for the average person. 
                        </p>
                        <p>
                            The GenAI-generated text, however, provides clear, understandable reasons based on the model's logic. If the decision was 'Denied', the applicant isn't just rejected; they are given a clear, actionable path to improve their financial standing. This transparency is key to building trust and ensuring fairness, turning a potentially negative experience into an empowering one.
                        </p>
                     </>
                ) : (
                    <p>
                        When an automated decision is made, a user has the right to know why. A raw data output is insufficient. GenAI can translate this data into a compliant, human-readable explanation that builds trust and empowers the user.
                    </p>
                )}
            </Accordion>
        </div>
    </div>
  );
};
