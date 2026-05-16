# 🧠 NeuroMind (ANHB2217 Master Atlas)

NeuroMind helps ANHB2217 students study faster with practical workbooks, lesion logic, quick simulations, atlas review, and backend-powered tutor explanations.

## 🚀 Soft Launch Status

- **Dashboard:** Live and functioning as the high-yield overview.
- **Practical Builder v5:** Main ANHB2217 practical trainer with station-style revision, cranial nerves, pathway logic, progress tracking, and review questions.
- **Lab 5 Workbook:** Focused spinal cord workbook for tract logic and lesion localisation.
- **Workbook Hub:** Static workbook launcher at `/workbooks/`.
- **Feedback:** We're currently collecting feedback to improve the platform.

### Live workbook paths

When deployed to GitHub Pages, these paths are expected:

- `/neuromind-anhb2217/workbooks/`
- `/neuromind-anhb2217/workbooks/neuroanatomy-builder-v5.html`
- `/neuromind-anhb2217/workbooks/lab5-spinal-cord-workbook.html`

Source workbook files live in `public/workbooks/`. Vite copies them into `dist/workbooks/` during build.

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

2. **Environment Setup for backend AI features:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run Development Server:**
   ```bash
   npm run dev
   ```

4. **Run API Key Smoke Test:**
   ```bash
   GEMINI_API_KEY=your_api_key_here npm run test:api-key
   ```
   This starts the production server and verifies `/api/status` reports `aiAvailable: true`.

5. **Build static GitHub Pages bundle:**
   ```bash
   npm run build:gh-pages
   ```

## 🌐 Production Deployment

This project supports two deployment modes:

### GitHub Pages static deployment

GitHub Pages serves the atlas UI and workbook assets. It does **not** receive provider API keys. Browser bundles must not contain `GEMINI_API_KEY`, `VITE_GEMINI_API_KEY`, GitHub tokens, OpenRouter keys, or other private provider credentials.

The GitHub Pages workflow builds with:

```bash
npm run build:gh-pages
```

and verifies these files exist:

```bash
test -f dist/workbooks/neuroanatomy-builder-v5.html
test -f dist/workbooks/lab5-spinal-cord-workbook.html
test -f dist/workbooks/index.html
```

### Backend deployment for tutor features

AI generation requires the Node server and a server-side `GEMINI_API_KEY`. Deploy the server to Render, Vercel, or another Node host, then build the frontend with an external API base URL:

```bash
VITE_API_BASE_URL=https://your-deployed-backend-url npm run build:gh-pages
```

The frontend calls `/api/generate` through that backend. It does not call Gemini, OpenRouter, or GitHub Models directly.

### Render Deployment

The included `render.yaml` automates setup. Connect the repository to Render and add `GEMINI_API_KEY` to the Render environment variables.

## 🎯 Next Build Targets

1. Convert Practical Builder v5 from standalone HTML into shared React data/components.
2. Add shared progress state across workbooks and atlas modules.
3. Add mock practical mode inside the main React app.
4. Expand structured course data for cortex, thalamus, cerebellum, basal ganglia, hypothalamus, and limbic system.
5. Add more structured tutor feedback after wrong quiz answers.
