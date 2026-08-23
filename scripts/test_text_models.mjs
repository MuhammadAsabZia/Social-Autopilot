import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function testModels() {
  const models = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-3.6-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.5-flash',
    'gemini-3.7-flash',
    'gemini-flash-latest',
    'gemini-flash-lite-latest',
  ];

  for (const model of models) {
    try {
      console.log(`\nTesting ${model}...`);
      const response = await ai.models.generateContent({
        model,
        contents: 'Say "Hello AI Strategist" and give 1 hot AI automation topic.',
      });
      console.log(`SUCCESS with ${model}:`, response.text?.slice(0, 120));
      return model;
    } catch (e) {
      console.log(`Failed ${model}:`, e.message?.slice(0, 140));
    }
  }
}

testModels().catch(console.error);
