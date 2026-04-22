import { GoogleGenAI, ThinkingLevel } from "@google/genai";

let apiKey = process.env.GEMINI_API_KEY || "";
apiKey = apiKey.replace(/[\n\r"' ]+/g, '');

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required");
}

const ai = new GoogleGenAI({ apiKey });

export async function generateContent(prompt: string, systemInstruction: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: systemInstruction,
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  if (!response.text) {
      throw new Error("No text returned from Gemini");
  }

  return response.text;
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: {
      parts: [
        {
          text: prompt,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: "1K"
      }
    }
  });

  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
}

export async function generateQuizQuestion(topic: string) {
  const sys = "You are an expert neurobiology professor. Generate a multiple choice question about the given topic. Output strictly a JSON object with this format: { \"question\": \"...\", \"options\": [\"...\", \"...\", \"...\", \"...\"], \"correctAnswer\": 0, \"explanation\": \"...\" }. Do NOT include markdown code blocks around the JSON.";
  const res = await generateContent(topic, sys);
  return res.replace(/```json/gi, '').replace(/```/g, '').trim();
}

export async function explainConcept(concept: string) {
  const sys = "You are an expert neurobiology professor. Provide a highly educational, clear, and easy to understand explanation of the given concept. Use bullet points and bold text where appropriate. Keep it concise.";
  const res = await generateContent(`Explain the concept: ${concept}`, sys);
  return res;
}
