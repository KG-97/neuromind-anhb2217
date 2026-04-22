import "dotenv/config";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY?.trim();

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

console.log("DEBUG: GEMINI_API_KEY length is", apiKey.length, "starts with", apiKey.substring(0, 4));

const ai = new GoogleGenAI({ apiKey });

async function runTest() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: "Hello",
      config: {
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.HIGH,
        },
      },
    });
    console.log("SUCCESS:", response.text);
  } catch (e) {
    console.error("ERROR:");
    console.error(e);
  }
}

runTest();
