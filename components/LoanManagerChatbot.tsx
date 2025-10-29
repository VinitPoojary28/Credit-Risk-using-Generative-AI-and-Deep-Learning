
import React, { useState, useEffect, useRef } from 'react';
import type { ApplicantData, MLOutput, ChatMessage } from '../types';
import { getLoanManagerChatResponse } from '../services/geminiService';
import { LoadingSpinner } from './LoadingSpinner';
import { ChatBubbleLeftRightIcon, PaperAirplaneIcon, UserCircleIcon } from './IconComponents';
import { BrainCircuitIcon } from './IconComponents';


interface LoanManagerChatbotProps {
    analysisData: {
        mlOutput: MLOutput;
        applicantData: ApplicantData;
    } | null;
}

export const LoanManagerChatbot: React.FC<LoanManagerChatbotProps> = ({ analysisData }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (analysisData) {
            setMessages([
                { role: 'model', text: `I have analyzed the application for you. The model's decision was **${analysisData.mlOutput.decision}** with a score of **${analysisData.mlOutput.score}**. How can I assist you further?` }
            ]);
        } else {
            setMessages([]);
        }
    }, [analysisData]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !analysisData) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await getLoanManagerChatResponse(
                analysisData.applicantData,
                analysisData.mlOutput,
                [...messages, userMessage]
            );
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Chatbot error:", error);
            const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I encountered an error. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!analysisData) {
        return null;
    }

    return (
        <div className="mt-8 bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-700 animate-fade-in">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400 flex items-center">
                <ChatBubbleLeftRightIcon className="h-7 w-7 mr-3" />
                Loan Manager AI Assistant
            </h2>
            <div className="h-80 bg-slate-900 rounded-lg p-4 flex flex-col space-y-4 overflow-y-auto">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       {msg.role === 'model' && (
                           <div className="w-8 h-8 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center">
                               <BrainCircuitIcon className="w-5 h-5 text-cyan-400" />
                           </div>
                       )}
                       <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-800 text-white' : 'bg-slate-700 text-slate-300'}`}>
                           <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                       </div>
                        {msg.role === 'user' && (
                           <div className="w-8 h-8 flex-shrink-0 bg-slate-600 rounded-full flex items-center justify-center">
                               <UserCircleIcon className="w-5 h-5 text-slate-300" />
                           </div>
                       )}
                    </div>
                ))}
                {isLoading && (
                    <div className="flex items-start gap-3 justify-start">
                        <div className="w-8 h-8 flex-shrink-0 bg-cyan-500/20 rounded-full flex items-center justify-center">
                           <BrainCircuitIcon className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div className="max-w-md p-3 rounded-lg bg-slate-700 text-slate-300 flex items-center">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse mr-2 delay-150"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse delay-300"></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the applicant's key risk factors..."
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-lg p-3 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold p-3 rounded-lg transition-colors"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="h-6 w-6" />
                </button>
            </form>
        </div>
    );
};
