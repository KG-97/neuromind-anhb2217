const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-1.5-flash';

async function geminiPost(prompt: string, jsonMode = false): Promise<string> {
  if (!apiKey) throw new Error('Gemini API key missing.');
  const body: any = {
    contents: [{ parts: [{ text: prompt }] }],
  };
  if (jsonMode) {
    body.generationConfig = { responseMimeType: 'application/json' };
  }
  const res = await fetch(`${BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

const QUIZ_ERROR = JSON.stringify({
  error: 'Failed to generate a valid quiz question. Please try again.',
});

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  try {
    const prompt = `Generate a challenging multiple-choice question for a university-level Human Neurobiology student about: ${topic}. Focus on physiological mechanisms, anatomical relationships, or clinical correlates.

Respond with ONLY valid JSON in this exact format:
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":0,"explanation":"..."}

The correctAnswer must be the index (0-3) of the correct option.`;
    const text = (await geminiPost(prompt, true)).trim();
    // Strip markdown code fences if present
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/,'').trim();
    const parsed = JSON.parse(clean);
    const isValid =
      typeof parsed.question === 'string' &&
      Array.isArray(parsed.options) &&
      parsed.options.length === 4 &&
      typeof parsed.correctAnswer === 'number' &&
      parsed.correctAnswer >= 0 &&
      parsed.correctAnswer <= 3 &&
      typeof parsed.explanation === 'string';
    return isValid ? JSON.stringify(parsed) : QUIZ_ERROR;
  } catch (e: any) {
    console.error('Gemini quiz error:', e);
    return JSON.stringify({ error: `API Error: ${e?.message || String(e)}` });
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  try {
    const prompt = `Explain the following neurobiology concept in clear, student-friendly language suitable for a university Human Neurobiology course (ANHB2217). Include the key mechanism, why it matters clinically or functionally, and one memorable analogy if possible: ${concept}`;
    return await geminiPost(prompt);
  } catch (e: any) {
    console.error('Gemini explain error:', e);
    return `API Error: ${e?.message || String(e)}`;
  }
};
