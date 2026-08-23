import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function testPureAI() {
  console.log('Testing pure Gemini 3.6 Flash without external search tool...');
  const prompt = `You are an elite Autonomous AI Social Media Strategist & Tech Intelligence Officer.
Generate 4 distinct, high-impact, hot topic candidates for an AI Automation Agency covering:
- Autonomous Multi-Agent State Architectures (LangGraph, State machines)
- Zapier & Enterprise Webhook automations
- SaaS MVP development & API Integrations
- Production LLM reliability & Schema validation

Avoid repeating past topics: ["Building Deterministic AI Agents with State Machines vs Unconstrained LLM Loops"].

Return a valid JSON array of objects.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: prompt,
    config: {
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
            mixType: { type: Type.STRING },
            rationale: { type: Type.STRING },
          },
          required: ['title', 'summary', 'category', 'suggestedAngle', 'mixType', 'rationale'],
        },
      },
    },
  });

  console.log('Pure AI Success:');
  console.log(response.text);
}

testPureAI().catch(console.error);
