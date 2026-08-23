import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

async function testSearch36() {
  console.log('Testing gemini-3.6-flash with Google Search Grounding...');

  const response = await ai.models.generateContent({
    model: 'gemini-3.6-flash',
    contents: 'What are the top 3 hot AI and workflow automation trends this week? Return title, summary, and category as JSON array.',
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
          },
          required: ['title', 'summary', 'category'],
        },
      },
    },
  });

  console.log('Search Grounding Success on gemini-3.6-flash:');
  console.log(response.text);
}

testSearch36().catch(console.error);
