import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testImageGen() {
  const models = [
    'gemini-2.5-flash-image',
    'gemini-3.1-flash-image',
    'gemini-3.1-flash-image-preview',
    'gemini-3-pro-image'
  ];

  for (const model of models) {
    try {
      console.log(`\nTesting ${model}...`);
      const response = await ai.models.generateImages({
        model,
        prompt: 'Professional high quality 3D digital graphic for LinkedIn post about Enterprise AI Autonomous Agents, sleek modern isometric dashboard, dark neon glassmorphism style, vibrant cyan and purple lighting, ultra-sharp 4k render.',
        config: {
          numberOfImages: 1,
          aspectRatio: '16:9',
          outputMimeType: 'image/png'
        }
      });

      if (response.generatedImages?.[0]?.image?.imageBytes) {
        console.log(`SUCCESS with ${model}!`);
        fs.writeFileSync('test_output.png', Buffer.from(response.generatedImages[0].image.imageBytes, 'base64'));
        console.log('Saved test_output.png');
        return;
      }
    } catch (err) {
      console.log(`Failed with generateImages on ${model}:`, err.message);
      // Try generateContent
      try {
        const res2 = await ai.models.generateContent({
          model,
          contents: 'Professional high quality 3D digital graphic for LinkedIn post about Enterprise AI Autonomous Agents, sleek modern isometric dashboard, dark neon glassmorphism style, vibrant cyan and purple lighting, ultra-sharp 4k render.'
        });
        console.log(`generateContent on ${model} response:`, JSON.stringify(res2.candidates?.[0]?.content?.parts?.map(p => Object.keys(p))));
        const imagePart = res2.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (imagePart) {
          console.log(`SUCCESS via inlineData with ${model}!`);
          fs.writeFileSync('test_output.png', Buffer.from(imagePart.inlineData.data, 'base64'));
          return;
        }
      } catch (err2) {
        console.log(`Failed with generateContent on ${model}:`, err2.message);
      }
    }
  }
}

testImageGen();
