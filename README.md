# 🧠 NeuroMind (ANHB2217 Master Atlas)

NeuroMind helps ANHB2217 students study faster with workbook-style revision, lesion logic, quick simulations, and AI explanations.

## 🚀 Soft Launch Status

- **Dashboard:** Live and functioning as the high-yield overview.
- **Lab 5 Workbook:** The first workbook (Neurons & Action Potentials) is linked directly on the dashboard.
- **Feedback:** We're currently collecting feedback to improve the platform.

### We want your feedback!
Help us refine NeuroMind before the first public release. Ask yourself:
- "Which part saved you time?"
- "Which section felt confusing or too long?"
- "What topic should be the next workbook?"

Share your thoughts with us at [feedback@neuromind.app](mailto:feedback@neuromind.app?subject=ANHB2217%20Feedback).

## 🛠️ Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Environment Setup:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

## 🌐 Production Deployment

This project is configured for seamless deployment to **Render**, **Vercel**, or any Node.js environment.

### Deployment Steps:
1. **Build the Application:**
   ```bash
   npm run build
   ```
2. **Start Production Server:**
   ```bash
   NODE_ENV=production npx tsx server.ts
   ```

### GitHub Pages & Static Hosting
This repository is a full-stack app. The static GitHub Pages version can serve the atlas UI, but AI content generation and image generation require the Node.js server and `GEMINI_API_KEY`.

If you want the static bundle to forward AI calls to a hosted backend, build with an external API base URL:
```bash
VITE_API_BASE_URL=https://your-deployed-backend-url npm run build:gh-pages
```

### Render Deployment:
The included `render.yaml` automates the setup. Simply connect your Git repository to Render, and it will handle the build and start commands automatically. **Important:** Remember to add your `GEMINI_API_KEY` to the Environment Variables in the Render dashboard.

## 🎯 Next Build Targets
1. Action potentials workbook (improvements to the current simulation)
2. Neuroanatomy workbook
3. Better progress tracking across modules
4. More structured AI help after wrong quiz answers
