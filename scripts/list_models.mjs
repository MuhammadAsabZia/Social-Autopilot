import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function listModels() {
  try {
    const list = await ai.models.list();
    console.log('Available models:');
    for await (const m of list) {
      console.log(`- ${m.name} | Methods: ${m.supportedGenerationMethods?.join(', ')}`);
    }
  } catch (err) {
    console.error('List models error:', err.message);
  }
}

listModels().catch(console.error);
