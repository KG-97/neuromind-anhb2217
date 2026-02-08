import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  if (!apiKey) return JSON.stringify({ error: "API Key missing" });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Generate a challenging multiple-choice question for a university-level Human Neurobiology student about: ${topic}.
      Focus on physiological mechanisms, anatomical relationships, or clinical correlates.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.INTEGER, description: "Index of the correct answer (0-3)" },
            explanation: { type: Type.STRING, description: "Detailed explanation of why the answer is correct." }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    });
    return response.text || "{}";
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return JSON.stringify({ error: "Failed to generate quiz." });
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  if (!apiKey) return "API Key is missing. Please check your configuration.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Explain the neurobiological concept "${concept}" clearly and concisely for a university student. 
      Include key terminology (e.g., ions, channels, anatomical structures) where relevant. 
      If applicable, mention a clinical correlate.`,
    });
    return response.text || "No explanation available.";
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "Sorry, I encountered an error while fetching the explanation.";
  }
};
