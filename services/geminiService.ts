const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const QUIZ_ERROR = JSON.stringify({
  error: 'Failed to generate a valid quiz question. Please try again.'
});

async function callGemini(prompt: string, jsonSchema?: object): Promise<string> {
  if (!apiKey) {
    throw new Error('Gemini API key missing. Set VITE_GEMINI_API_KEY in GitHub Secrets.');
  }

  const body: any = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  if (jsonSchema) {
    body.generationConfig = {
      responseMimeType: 'application/json',
      responseSchema: jsonSchema
    };
  }

  const res = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(JSON.stringify(data));
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('Empty response from Gemini API');
  return text;
}

export const generateQuizQuestion = async (topic: string): Promise<string> => {
  try {
    const text = await callGemini(
      `Generate a challenging multiple-choice question for a university-level Human Neurobiology student about: ${topic}. Focus on physiological mechanisms, anatomical relationships, or clinical correlates.`,
      {
        type: 'object',
        properties: {
          question: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          correctAnswer: { type: 'integer', description: 'Index of the correct answer (0-3)' },
          explanation: { type: 'string', description: 'Detailed explanation of why the answer is correct.' }
        },
        required: ['question', 'options', 'correctAnswer', 'explanation']
      }
    );

    const parsed = JSON.parse(text.trim());
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
    console.error('Quiz error:', e);
    return JSON.stringify({ error: `API Error: ${e?.message || String(e)}` });
  }
};

export const explainConcept = async (concept: string): Promise<string> => {
  try {
    return await callGemini(
      `Explain the following neurobiology concept in clear, student-friendly language suitable for a university Human Neurobiology course (ANHB2217). Include the key mechanism, why it matters clinically or functionally, and one memorable analogy if possible: ${concept}`
    );
  } catch (e: any) {
    console.error('Explain error:', e);
    return `API Error: ${e?.message || String(e)}`;
  }
};
