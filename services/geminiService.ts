const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function postGenerate(prompt: string, systemInstruction: string): Promise<string> {
  if (!apiBaseUrl) {
    throw new Error('AI backend is not configured for this static build. Deploy the Node server and set VITE_API_BASE_URL to enable tutor generation.');
  }

  const res = await fetch(`${apiBaseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, systemInstruction }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || `AI request failed with status ${res.status}`);
  }

  if (typeof data?.response !== 'string' || !data.response.trim()) {
    throw new Error('AI backend returned an empty response.');
  }

  return data.response;
}

const QUIZ_ERROR = JSON.stringify({ error: 'Failed to generate quiz. Please try again.' });

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  try {
    const systemInstruction = 'You are an expert neurobiology professor. Generate a multiple choice question about the given topic. Output strictly a JSON object with this format: { "question": "...", "options": ["...", "...", "...", "..."], "correctAnswer": 0, "explanation": "..." }. Do NOT include markdown code blocks around the JSON.';
    const raw = (await postGenerate(topic, systemInstruction)).trim();
    const clean = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(clean);
    const ok = typeof parsed.question === 'string' && Array.isArray(parsed.options) &&
      parsed.options.length === 4 && typeof parsed.correctAnswer === 'number' &&
      parsed.correctAnswer >= 0 && parsed.correctAnswer <= 3 && typeof parsed.explanation === 'string';
    return ok ? JSON.stringify(parsed) : QUIZ_ERROR;
  } catch (e: any) {
    console.error('Quiz error:', e);
    return JSON.stringify({ error: `Error: ${e?.message || String(e)}` });
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  try {
    const systemInstruction = 'You are an expert neurobiology professor. Provide a clear explanation for an ANHB2217 student. Include the key mechanism, clinical relevance, and one memorable analogy. Keep it concise.';
    return await postGenerate(`Explain the concept: ${concept}`, systemInstruction);
  } catch (e: any) {
    console.error('Explain error:', e);
    return `Error: ${e?.message || String(e)}`;
  }
};
