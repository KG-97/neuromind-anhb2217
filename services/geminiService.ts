const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
// Try newest model first — gemini-3-flash-preview, then fallbacks
const MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-2.0-flash-lite'];

async function geminiPost(prompt: string, jsonMode = false): Promise<string> {
  if (!apiKey) throw new Error('Gemini API key missing. Set VITE_GEMINI_API_KEY in GitHub secrets.');
  let lastErr: any;
  for (const model of MODELS) {
    try {
      const body: any = { contents: [{ role: 'user', parts: [{ text: prompt }] }] };
      if (jsonMode) body.generationConfig = { responseMimeType: 'application/json' };
      const res = await fetch(`${BASE}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.error?.message || JSON.stringify(data);
        // Only retry on quota/not-found errors
        if (res.status === 429 || res.status === 404 || res.status === 403) {
          lastErr = new Error(`[${model}] ${msg}`);
          continue;
        }
        throw new Error(`[${model}] ${msg}`);
      }
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      return text;
    } catch (e: any) {
      lastErr = e;
      if (!e.message?.includes('429') && !e.message?.includes('quota') && !e.message?.includes('RESOURCE_EXHAUSTED')) throw e;
    }
  }
  throw lastErr;
}

const QUIZ_ERROR = JSON.stringify({ error: 'Failed to generate quiz. Please try again.' });

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  try {
    const prompt = `Generate a challenging multiple-choice question for a university Human Neurobiology student (ANHB2217) about: ${topic}.

Return ONLY valid JSON — no markdown, no code fences:
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":0,"explanation":"..."}

correctAnswer is the 0-based index of the correct option.`;
    const raw = (await geminiPost(prompt, true)).trim();
    const clean = raw.replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/,'').trim();
    const parsed = JSON.parse(clean);
    const ok = typeof parsed.question==='string' && Array.isArray(parsed.options) &&
      parsed.options.length===4 && typeof parsed.correctAnswer==='number' &&
      parsed.correctAnswer>=0 && parsed.correctAnswer<=3 && typeof parsed.explanation==='string';
    return ok ? JSON.stringify(parsed) : QUIZ_ERROR;
  } catch(e:any) {
    console.error('Quiz error:', e);
    return JSON.stringify({ error: `Error: ${e?.message||String(e)}` });
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  try {
    return await geminiPost(`Explain this neurobiology concept for an ANHB2217 student — clear mechanism, clinical relevance, one analogy: ${concept}`);
  } catch(e:any) {
    console.error('Explain error:', e);
    return `Error: ${e?.message||String(e)}`;
  }
};
