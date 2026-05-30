import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "dummy" });
const a = ai.models.generateImages({
  model: 'imagen-3.0-generate-002',
  prompt: 'test',
  config: {
    numberOfImages: 1,
  }
});
