import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const QUIZ_ERROR = JSON.stringify({
  error: "Failed to generate a valid quiz question. Please try again."
});

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  if (!apiKey) {
    return JSON.stringify({ error: "Gemini API key missing. Add VITE_GEMINI_API_KEY to .env.local." });
  }

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

    const text = response.text?.trim();
    if (!text) return QUIZ_ERROR;

    const parsed = JSON.parse(text);
    const isValid =
      typeof parsed.question === 'string' &&
      Array.isArray(parsed.options) &&
      parsed.options.length === 4 &&
      typeof parsed.correctAnswer === 'number' &&
      parsed.correctAnswer >= 0 &&
      parsed.correctAnswer < 4 &&
      typeof parsed.explanation === 'string';

    return isValid ? JSON.stringify(parsed) : QUIZ_ERROR;
  } catch (error) {
    console.error("Gemini Quiz Error:", error);
    return QUIZ_ERROR;
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  if (!apiKey) return "Gemini API key is missing. Add VITE_GEMINI_API_KEY to .env.local.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest',
      contents: `Explain the neurobiological concept "${concept}" clearly and concisely for a university student. 
      Include key terminology (e.g., ions, channels, anatomical structures) where relevant. 
      If applicable, mention a clinical correlate.`,
    });
    return response.text?.trim() || "No explanation available.";
  } catch (error) {
    console.error("Gemini Explanation Error:", error);
    return "Sorry, I hit an error while fetching the explanation.";
  }
};
