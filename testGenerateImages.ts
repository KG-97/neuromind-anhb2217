import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: 'A microscopic view of a neuron',
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
      }
    });
    console.log(response.generatedImages?.[0]);
  } catch(e) {
    console.error(e);
  }
}
run();
