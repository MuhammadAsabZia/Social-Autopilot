import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function testInteractionsImage() {
  const models = [
    'gemini-3.1-flash-image',
    'gemini-3-pro-image',
    'gemini-2.5-flash-image'
  ];

  for (const model of models) {
    try {
      console.log(`\nTesting interaction with ${model}...`);
      const interaction = await ai.interactions.create({
        model,
        input: 'A sleek, hyper-professional LinkedIn digital art cover graphic for an Enterprise AI Agent automation framework. Glowing neon cyan and violet circuitry, dark glassmorphism interface cards, 3D isometric pipeline flow, photorealistic, 4k render, award-winning UI design.',
        response_format: {
          type: 'image',
          mime_type: 'image/jpeg',
          aspect_ratio: '16:9'
        }
      });

      console.log('Interaction completed! output_image:', Boolean(interaction.output_image));
      if (interaction.output_image) {
        fs.writeFileSync('test_gemini_generated.png', Buffer.from(interaction.output_image.data, 'base64'));
        console.log('SUCCESS! Saved test_gemini_generated.png');
        return;
      }
    } catch (err) {
      console.log(`Error on ${model}:`, err.message);
    }
  }
}

testInteractionsImage();
