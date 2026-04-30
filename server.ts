import 'dotenv/config';
import express from "express";
import { generateContent, generateImage } from "./src/services/geminiService.ts";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.use(express.json());

  // API routes
  app.post("/api/generate", async (req, res) => {
    const { prompt, systemInstruction } = req.body;
    try {
      const response = await generateContent(prompt, systemInstruction);
      res.json({ response });
    } catch (error: any) {
      console.error("GENERATE ERROR:", error);
      res.status(500).json({ error: "Failed to generate content", details: error?.message || String(error) });
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
      res.status(500).json({ error: "Failed to generate image", details: error?.message || String(error) });
    }
  });

  // Vite middleware for development
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
