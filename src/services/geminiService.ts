import { GoogleGenAI } from "@google/genai";

// ── Central model constants ──────────────────────────────────────────────────
const MODELS = {
  text: 'gemini-2.5-flash',
  image: 'gemini-2.5-flash',
} as const;

const TIMEOUT_MS = 25000;

// ── Typed error class ────────────────────────────────────────────────────────
export class AIError extends Error {
  code: 'NO_KEY' | 'RATE_LIMIT' | 'TIMEOUT' | 'UNKNOWN';
  constructor(code: AIError['code'], message: string) {
    super(message);
    this.name = 'AIError';
    this.code = code;
  }
}

// ── API key setup ────────────────────────────────────────────────────────────
const rawApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || ''
let apiKey = rawApiKey;
apiKey = apiKey.replace(/[\n\r"' ]+/g, '');

const AI_AVAILABLE = Boolean(apiKey) && !apiKey.toLowerCase().includes('dummy');
const ai = AI_AVAILABLE ? new GoogleGenAI({ apiKey }) : null;

export { AI_AVAILABLE };

// ── Helper: wrap promise with timeout ───────────────────────────────────────
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new AIError('TIMEOUT', `Gemini request timed out after ${ms}ms`)), ms)
    ),
  ]);
}

// ── Public API ───────────────────────────────────────────────────────────────
export async function generateContent(prompt: string, systemInstruction: string): Promise<string> {
  if (!AI_AVAILABLE || !ai) {
    throw new AIError('NO_KEY', 'Gemini API key is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) to enable AI features.');
  }
  try {
    const response = await withTimeout(
      ai.models.generateContent({
        model: MODELS.text,
        contents: prompt,
        config: { systemInstruction },
      }),
      TIMEOUT_MS
    );
    if (!response.text) {
      throw new AIError('UNKNOWN', 'No text returned from Gemini');
    }
    return response.text;
  } catch (err) {
    if (err instanceof AIError) throw err;
    const msg = (err as Error)?.message || String(err);
    if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
      throw new AIError('RATE_LIMIT', 'Gemini rate limit hit. Please wait a moment and try again.');
    }
    throw new AIError('UNKNOWN', msg);
  }
}

export async function generateImage(prompt: string): Promise<string | null> {
  if (!AI_AVAILABLE || !ai) {
    throw new AIError('NO_KEY', 'Gemini API key is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) to enable AI features.');
  }
  const response = await withTimeout(
    ai.models.generateContent({
      model: MODELS.image,
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: '16:9', imageSize: '1K' },
      },
    }),
    TIMEOUT_MS
  );
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
}

export async function generateQuizQuestion(topic: string): Promise<string> {
  const sys = 'You are an expert neurobiology professor. Generate a multiple choice question about the given topic. Output strictly a JSON object with this format: { "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..." }. Do NOT include markdown code blocks around the JSON.';
  const res = await generateContent(topic, sys);
  return res.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export async function explainConcept(concept: string): Promise<string> {
  const sys = 'You are an expert neurobiology professor. Provide a highly educational, clear, and easy to understand explanation of the given concept. Use bullet points and bold text where appropriate. Keep it concise.';
  return generateContent(`Explain the concept: ${concept}`, sys);
}
