import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key present:', Boolean(apiKey));

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

async function testImageGen() {
  const modelsToTry = [
    'imagen-3.0-generate-002',
    'imagen-3.0-generate-001',
    'gemini-2.5-flash',
    'gemini-3.1-flash-lite-image',
  ];

  for (const model of modelsToTry) {
    try {
      console.log(`Testing model: ${model}...`);
      if (model.startsWith('imagen')) {
        const response = await ai.models.generateImages({
          model,
          prompt: 'A futuristic ultra-modern AI automation workflow dashboard with glowing neon cyan and purple data pipelines, sleek high-contrast dark mode UI, tech infographic style, 8k resolution, crisp photorealistic 3D render.',
          config: {
            numberOfImages: 1,
            aspectRatio: '16:9',
            outputMimeType: 'image/jpeg',
          },
        });
        const img = response.generatedImages?.[0]?.image?.imageBytes;
        console.log(`Model ${model} SUCCESS! Image bytes length:`, img ? img.length : 'none');
        return;
      } else {
        const response = await ai.models.generateContent({
          model,
          contents: {
            parts: [{ text: 'Generate an ultra-modern tech infographic showing AI Agents communicating with APIs.' }],
          },
        });
        console.log(`Model ${model} response received:`, response.candidates?.[0]?.content?.parts?.length);
      }
    } catch (err) {
      console.log(`Model ${model} failed:`, err.message);
    }
  }
}

testImageGen().catch(console.error);
