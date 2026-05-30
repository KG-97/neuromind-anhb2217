import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: "dummy" });
console.log(Object.keys(ai.models));
console.log(typeof ai.models.generateImages);
