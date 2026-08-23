import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function testSearchTrends() {
  console.log('Testing Gemini 3.7 Flash with Google Search Grounding...');

  const prompt = `You are an elite AI & Tech Intelligence Strategist.
Search the web for the absolute latest, breaking, and hot real-time developments, architectural trends, case studies, and tool releases (from the last 48 hours) in:
- AI Automation & Autonomous AI Agents (LangGraph, CrewAI, AutoGen, OpenAI/Gemini API updates)
- Enterprise Workflow Automation 
- SaaS Development & AI Engineering

Return 4 hot, unique, high-leverage topics with breaking details.
Avoid generic high-level fluff. Focus on actionable engineering & business insights.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.7-flash',
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            category: { type: Type.STRING },
            suggestedAngle: { type: Type.STRING },
            hotMetricOrNews: { type: Type.STRING },
            mixType: { type: Type.STRING },
          },
          required: ['title', 'summary', 'category', 'suggestedAngle', 'hotMetricOrNews', 'mixType'],
        },
      },
    },
  });

  console.log('Search Grounding Result:');
  console.log(response.text);
}

testSearchTrends().catch(console.error);
