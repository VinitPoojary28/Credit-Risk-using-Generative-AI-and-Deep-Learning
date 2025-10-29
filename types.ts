
export interface ApplicantData {
  creditUtilization: number;
  paymentHistoryMonths: number;
  debtToIncomeRatio: number;
  recentInquiries: number;
  annualIncome: number;
  loanAmount: number;
}

export enum DecisionStatus {
  Approved = 'Approved',
  Denied = 'Denied',
}

export type ScoringModelType = 'standard' | 'deepLearning';

export interface MLOutput {
  decision: DecisionStatus;
  score: number;
  featureImportance: Record<string, {
    importance: number; // Normalized value (0-1) for magnitude
    impact: number; // Raw score change (+/-)
  }>;
  modelType: ScoringModelType;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
