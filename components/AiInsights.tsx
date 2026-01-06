
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { PipeResult, FluidProperties, HydraulicMethod } from '../types';

interface AiInsightsProps {
  results: PipeResult[];
  fluid: FluidProperties;
  method: HydraulicMethod;
}

const AiInsights: React.FC<AiInsightsProps> = ({ results, fluid, method }) => {
  const [insight, setInsight] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        As a Senior Hydraulic Engineer, analyze this 3D pipe network simulation and provide technical recommendations.
        
        System Data:
        - Solver Method: ${method}
        - Water Temperature: ${fluid.temperature_c}°C
        - Total Pipe Segments: ${results.length}
        - Results Summary:
          ${results.map(r => `Pipe ${r.id}: L=${r.length_m.toFixed(1)}m, D=${r.diameter_mm}mm, Mat=${r.material}, V=${r.velocity_ms.toFixed(2)}m/s, HeadLoss=${r.totalHeadLoss_m.toFixed(2)}m, HGL_End=${r.hglEnd_m.toFixed(2)}m`).join('\n')}
          
        Focus on:
        1. Cavitation risks (negative HGL).
        2. Erosion risks (velocity > 3m/s).
        3. Efficiency optimization (high head loss vs diameter).
        4. Energy usage.
        
        Keep it concise, professional, and actionable. Use markdown.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
      });

      setInsight(response.text || 'Analysis complete. No critical issues found.');
    } catch (error) {
      console.error(error);
      setInsight('Failed to generate AI analysis. Please check your network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-slate-900 p-6 rounded-xl shadow-lg border border-slate-800 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" /></svg>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <h2 className="text-lg font-bold">Gemini Engineering Insights</h2>
      </div>

      {!insight && !isLoading ? (
        <div className="space-y-4">
          <p className="text-xs text-slate-400">Generate a comprehensive AI-driven audit of your hydraulic design based on current simulation results.</p>
          <button 
            onClick={generateAnalysis}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition-all text-sm flex items-center justify-center gap-2"
          >
            Run AI Analysis
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col items-center justify-center py-6 space-y-3">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-400">Evaluating fluid dynamics...</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-300 max-h-80 overflow-y-auto pr-2 custom-scrollbar prose prose-invert prose-sm">
            {insight.split('\n').map((line, i) => (
               <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
          <button 
            onClick={() => setInsight('')}
            className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white transition-colors"
          >
            Clear Analysis
          </button>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </section>
  );
};

export default AiInsights;
