# 🧠 ANHB2217 Neurobiology Master Atlas

A premium, interactive neurobiology study platform designed for high-yield anatomical review and AI-assisted learning. This atlas integrates structural diagrams, clinical cases, and real-time tutoring using Google Gemini.

## 🚀 Key Features
- **9 Specialized Modules:** Coverage from basic Neuron physiology to complex Subcortical systems.
- **AI-Powered Diagrams:** Generate custom textbook-quality SVGs with interactive "hover-to-learn" functionality.
- **Global Search:** Instant navigation via `Command+K` (or `Ctrl+K`) search bar.
- **Labelling Trainer:** Gamified matching games for cranial nerves, tracts, and blood supply.
- **AI Tutor:** Context-aware assistant for clinical vignettes, mnemonics, and exam prep.
- **Premium UI:** Glassmorphic dark-mode design with mobile-responsive navigation.

## 🛠️ Tech Stack
- **Frontend:** React + TypeScript + Tailwind CSS + Framer Motion
- **Backend:** Express (Production-ready proxy)
- **AI Core:** Google Gemini 3.1 Pro (Text/Reasoning) & Flash (Image Generation)

## 💻 Local Development

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

### Render Deployment:
The included `render.yaml` automates the setup. Simply connect your Git repository to Render, and it will handle the build and start commands automatically. **Important:** Remember to add your `GEMINI_API_KEY` to the Environment Variables in the Render dashboard.

---

*Designed for ANHB2217 students to master neuroanatomy with clarity and speed.*
