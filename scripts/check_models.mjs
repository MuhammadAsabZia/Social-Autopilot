import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('Using API key:', apiKey?.slice(0, 10) + '...');

const ai = new GoogleGenAI({ apiKey });

async function main() {
  try {
    const list = await ai.models.list();
    console.log('Available models:');
    for await (const m of list) {
      console.log(`- ${m.name}`);
    }
  } catch (err) {
    console.error('Error listing models:', err.message);
  }
}

main();
