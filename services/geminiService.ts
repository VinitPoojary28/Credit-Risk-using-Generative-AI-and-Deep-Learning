import { GoogleGenAI, Type } from "@google/genai";
import type { ApplicantData, MLOutput, ChatMessage } from '../types';

export const getGenAIExplanation = async (
  applicantData: ApplicantData,
  mlOutput: MLOutput,
  modelName: string
): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    You are an expert and empathetic loan officer AI assistant. Your task is to explain a credit decision to a customer in a clear, helpful, and human-readable way.

    **Instructions:**
    1.  Your tone must be professional, reassuring, and educational.
    2.  Use ONLY the data provided below. Do NOT invent or assume any information.
    3.  Start the explanation by clearly stating the decision (Approved or Denied).
    4.  Identify the top 2-3 factors that most influenced the decision, based on the 'impact' score (large positive or negative numbers are most significant).
    5.  Explain *how* each key factor influenced the decision in simple terms. For example, "A high credit utilization of X% suggests..."
    6.  If the decision is 'Denied', provide constructive, actionable advice on how the applicant could improve their profile for a future application, based directly on the negative factors identified.
    7.  Keep the explanation concise and easy to understand for someone with no financial background.
    8.  Structure your response with clear paragraphs. Do not use markdown lists.

    **Applicant Data:**
    - Credit Utilization Ratio: ${applicantData.creditUtilization}%
    - Payment History Length: ${applicantData.paymentHistoryMonths} months
    - Debt-to-Income (DTI) Ratio: ${applicantData.debtToIncomeRatio}%
    - Recent Credit Inquiries: ${applicantData.recentInquiries}
    - Annual Income: ₹${applicantData.annualIncome.toLocaleString('en-IN')}
    - Loan Amount Required: ₹${applicantData.loanAmount.toLocaleString('en-IN')}

    **ML Model Output:**
    - Final Decision: ${mlOutput.decision}
    - Calculated Credit Score: ${mlOutput.score}
    - Model Used: ${mlOutput.modelType === 'standard' ? 'Standard Risk Model' : 'Deep Learning Model'}
    - Key Factor Impacts (a positive number improved the score, a negative number lowered it):
      - Credit Utilization Impact: ${mlOutput.featureImportance.creditUtilization.impact.toFixed(0)} points
      - Payment History Impact: ${mlOutput.featureImportance.paymentHistoryMonths.impact.toFixed(0)} points
      - DTI Ratio Impact: ${mlOutput.featureImportance.debtToIncomeRatio.impact.toFixed(0)} points
      - Recent Inquiries Impact: ${mlOutput.featureImportance.recentInquiries.impact.toFixed(0)} points
      - Annual Income Impact: ${mlOutput.featureImportance.annualIncome.impact.toFixed(0)} points
      - Loan Amount Impact: ${mlOutput.featureImportance.loanAmount.impact.toFixed(0)} points

    Begin the explanation now.
    `;

  try {
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate explanation from GenAI.");
  }
};


export const getLoanManagerChatResponse = async (
  applicantData: ApplicantData,
  mlOutput: MLOutput,
  history: ChatMessage[]
): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const model = 'gemini-2.5-flash';

    const systemInstruction = `You are an expert financial analyst AI assisting a loan manager. Your task is to answer questions about a loan application based *only* on the provided data. Be concise, data-driven, and professional. Do not offer opinions or information outside of the data provided.

    **Applicant Data:**
    - Credit Utilization Ratio: ${applicantData.creditUtilization}%
    - Payment History Length: ${applicantData.paymentHistoryMonths} months
    - Debt-to-Income (DTI) Ratio: ${applicantData.debtToIncomeRatio}%
    - Recent Credit Inquiries: ${applicantData.recentInquiries}
    - Annual Income: ₹${applicantData.annualIncome.toLocaleString('en-IN')}
    - Loan Amount Required: ₹${applicantData.loanAmount.toLocaleString('en-IN')}

    **ML Model Output:**
    - Final Decision: ${mlOutput.decision}
    - Calculated Credit Score: ${mlOutput.score}
    - Model Used: ${mlOutput.modelType === 'standard' ? 'Standard Risk Model' : 'Deep Learning Model'}
    - Key Factor Impacts (points):
        - Credit Utilization: ${mlOutput.featureImportance.creditUtilization.impact.toFixed(0)}
        - Payment History: ${mlOutput.featureImportance.paymentHistoryMonths.impact.toFixed(0)}
        - DTI Ratio: ${mlOutput.featureImportance.debtToIncomeRatio.impact.toFixed(0)}
        - Recent Inquiries: ${mlOutput.featureImportance.recentInquiries.impact.toFixed(0)}
        - Annual Income: ${mlOutput.featureImportance.annualIncome.impact.toFixed(0)}
        - Loan Amount: ${mlOutput.featureImportance.loanAmount.impact.toFixed(0)}
    `;

    const contents = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    try {
        const chat = ai.chats.create({ model, config: { systemInstruction } });
        const response = await chat.sendMessage({
            history: contents.slice(0, -1),
            message: contents[contents.length - 1].parts[0].text
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API for chat:", error);
        throw new Error("Failed to get chat response from GenAI.");
    }
};

// Helper to convert a File object to a GoogleGenerativeAI.Part object
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

export const parseLoanDocument = async (file: File): Promise<Partial<ApplicantData>> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';

    const prompt = `
    You are an intelligent document parsing AI. Your task is to read the following loan application document (which could be a text file or a PDF) and extract the specified financial details.
    - If a value is not found, omit the key from the output.
    - Extract only numerical values. For example, for "₹ 45,00,000", extract 4500000.
    - For "Credit Utilization", look for a percentage.
    - For "Payment History", look for a number of months.
    - For "DTI", look for a percentage.
    - For "Recent Inquiries", find the number of inquiries.
    - For "Annual Income", find the total annual income figure in INR.
    - For "Loan Amount Requested", find the required loan amount in INR.

    Analyze the provided document and respond with the extracted data.
    `;
    
    const filePart = await fileToGenerativePart(file);
    const textPart = { text: prompt };

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: { parts: [textPart, filePart] },
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        creditUtilization: { type: Type.NUMBER },
                        paymentHistoryMonths: { type: Type.NUMBER },
                        debtToIncomeRatio: { type: Type.NUMBER },
                        recentInquiries: { type: Type.NUMBER },
                        annualIncome: { type: Type.NUMBER },
                        loanAmount: { type: Type.NUMBER },
                    },
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error parsing document with Gemini API:", error);
        throw new Error("Failed to parse document.");
    }
};