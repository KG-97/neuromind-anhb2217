import { GoogleGenAI, Type } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Try models in order of preference
const MODELS = ['gemini-1.5-flash', 'gemini-1.5-flash-latest', 'gemini-2.0-flash'];

const QUIZ_ERROR = JSON.stringify({
  error: "Failed to generate a valid quiz question. Please try again."
});

async function tryGenerateContent(params: { contents: string; config?: object }) {
  let lastError: any;
  for (const model of MODELS) {
    try {
      const response = await ai.models.generateContent({ model, ...params });
      return response;
    } catch (e: any) {
      lastError = e;
      // Only try next model if it's a quota/not-found issue
      if (!e?.message?.includes('RESOURCE_EXHAUSTED') && !e?.message?.includes('not found') && !e?.message?.includes('404')) {
        throw e;
      }
    }
  }
  throw lastError;
}

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  if (!apiKey) {
    return JSON.stringify({ error: "Gemini API key missing. Add VITE_GEMINI_API_KEY to .env.local." });
  }
  try {
    const response = await tryGenerateContent({
      contents: `Generate a challenging multiple-choice question for a university-level Human Neurobiology student about: ${topic}. Focus on physiological mechanisms, anatomical relationships, or clinical correlates.`,
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
      parsed.correctAnswer <= 3 &&
      typeof parsed.explanation === 'string';
    return isValid ? text : QUIZ_ERROR;
  } catch (e: any) {
    console.error('Gemini quiz error:', e);
    return JSON.stringify({ error: `API Error: ${e?.message || String(e)}` });
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  if (!apiKey) {
    return "Gemini API key missing. Add VITE_GEMINI_API_KEY to .env.local.";
  }
  try {
    const response = await tryGenerateContent({
      contents: `Explain the following neurobiology concept in clear, student-friendly language suitable for a university Human Neurobiology course (ANHB2217). Include the key mechanism, why it matters clinically or functionally, and one memorable analogy if possible: ${concept}`,
    });
    return response.text || "No explanation generated.";
  } catch (e: any) {
    console.error('Gemini explain error:', e);
    return `API Error: ${e?.message || String(e)}`;
  }
};
