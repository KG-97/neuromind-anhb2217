import 'dotenv/config';
import express from "express";
import { generateContent, generateImage, AIError, AI_AVAILABLE } from "./src/services/geminiService.ts";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 80);

  app.use(express.json());

  // API routes
  app.post("/api/generate", async (req, res) => {
    const { prompt, systemInstruction } = req.body;
    try {
      const response = await generateContent(prompt, systemInstruction);
      res.json({ response });
    } catch (error: any) {
      console.error("GENERATE ERROR:", error);
      const status = error instanceof AIError && error.code === 'NO_KEY' ? 503 : 500;
      res.status(status).json({ error: error?.message || "Failed to generate content", code: error?.code || 'UNKNOWN' });
    }
  });

  app.post("/api/generate-image", async (req, res) => {
    const { prompt } = req.body;
    try {
      const imageUrl = await generateImage(prompt);
      if (imageUrl) {
        res.json({ imageUrl });
      } else {
         res.status(500).json({ error: "No image generated" });
      }
    } catch (error: any) {
      console.error("GENERATE IMAGE ERROR:", error);
      const status = error instanceof AIError && error.code === 'NO_KEY' ? 503 : 500;
      res.status(status).json({ error: error?.message || "Failed to generate image", code: error?.code || 'UNKNOWN' });
    }
  });

  // Vite middleware for development
  app.get('/api/status', (req, res) => {
    res.json({
      aiAvailable: AI_AVAILABLE,
      message: AI_AVAILABLE ? 'Gemini API key configured.' : 'Gemini API key is not configured. AI features are disabled.',
    });
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production: Serve files from dist
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
