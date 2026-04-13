// AI service: tries OpenRouter (free models) → GitHub Models → Gemini
const openRouterKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
const ghToken = import.meta.env.VITE_GITHUB_TOKEN || '';
const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

// OpenRouter: free models via OpenAI-compatible API
async function openRouterPost(prompt: string): Promise<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openRouterKey}`,
      'HTTP-Referer': 'https://kg-97.github.io/neuromind-anhb2217/',
      'X-Title': 'NeuroMind ANHB2217',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.2-3b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data.choices?.[0]?.message?.content ?? '';
}

// GitHub Models: free OpenAI-compatible API using your GitHub token
async function githubModelsPost(prompt: string): Promise<string> {
  const res = await fetch('https://models.inference.ai.azure.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ghToken}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1000,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || JSON.stringify(data));
  return data.choices?.[0]?.message?.content ?? '';
}

// Gemini REST fallback
async function geminiPost(prompt: string): Promise<string> {
  const models = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite'];
  let lastErr: any;
  for (const model of models) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: prompt }] }] }),
        }
      );
      const data = await res.json();
      if (!res.ok) { lastErr = new Error(data?.error?.message || res.status); continue; }
      return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    } catch(e) { lastErr = e; }
  }
  throw lastErr;
}

async function callAI(prompt: string): Promise<string> {
  // Try OpenRouter first (free models, reliable)
  if (openRouterKey) {
    try { return await openRouterPost(prompt); } catch(e) { console.warn('OpenRouter failed, trying GitHub Models:', e); }
  }
  // Try GitHub Models
  if (ghToken) {
    try { return await githubModelsPost(prompt); } catch(e) { console.warn('GitHub Models failed, trying Gemini:', e); }
  }
  // Try Gemini
  if (geminiKey) {
    return await geminiPost(prompt);
  }
  throw new Error('No AI API key configured.');
}

const QUIZ_ERROR = JSON.stringify({ error: 'Failed to generate quiz. Please try again.' });

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  try {
    const prompt = `Generate a challenging multiple-choice question for a university Human Neurobiology student (ANHB2217) about: ${topic}.
Return ONLY valid JSON with no markdown or code fences:
{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":0,"explanation":"..."}
correctAnswer is the 0-based index of the correct option.`;
    const raw = (await callAI(prompt)).trim();
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
    return await callAI(`Explain this neurobiology concept for an ANHB2217 university student. Include: key mechanism, clinical relevance, one memorable analogy. Concept: ${concept}`);
  } catch(e:any) {
    console.error('Explain error:', e);
    return `Error: ${e?.message||String(e)}`;
  }
};
