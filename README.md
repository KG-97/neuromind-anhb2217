# NeuroMind - ANHB2217 Study Companion

> A focused neuroscience study hub for ANHB2217 students at UWA

[![Built with Google AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-4285F4?logo=google)](https://ai.studio)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## What NeuroMind is

NeuroMind is being shaped into a course-specific study system rather than a generic AI education app.
The current product combines:

- workbook-style study pages for high-yield lab and exam topics
- interactive simulations for neurons and electrophysiology
- neuroanatomy review with quick clinical correlates
- AI-assisted tutoring for on-demand explanation and question generation

## Current focus

The strongest launch direction is simple:

1. workbook first
2. interactive tools second
3. AI support third

That means the Lab 5 spinal cord workbook is now a core feature, not a forgotten side file.

## Current features

- ✅ dashboard-style landing page for a clearer study flow
- ✅ interactive neuron model
- ✅ electrophysiology lab animation
- ✅ brain atlas explorer
- ✅ Gemini-powered AI tutor
- ✅ Lab 5 spinal cord workbook with search, self-test mode, lesion localiser, progress tracking, rapid quiz, and mobile navigation

## Project structure

```text
neuromind-anhb2217/
├── components/                  # React UI components
├── public/workbooks/            # Deployable workbook pages
├── services/                    # API/service integrations
├── docs/                        # Documentation and launch notes
├── App.tsx                      # App shell
├── types.ts                     # Shared types
└── package.json                 # Scripts and dependencies
```

## Getting started

### Prerequisites

- Node.js 18+
- npm
- Gemini API key for AI features

### Installation

```bash
git clone https://github.com/KG-97/neuromind-anhb2217.git
cd neuromind-anhb2217
npm install
cp .env.example .env.local
```

Add your Gemini key to `.env.local`:

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

Then run the app:

```bash
npm run dev
```

The local dev server runs on `http://localhost:3000`.

## Scripts

```bash
npm run dev         # Start local development server
npm run build       # Build for production
npm run launch:test # Verify typecheck + production build
npm run preview     # Preview production build locally
npm run typecheck   # Run TypeScript checks
```

## Deployment notes

Workbook pages now belong in `public/workbooks/` so they are copied into production builds.
That avoids the classic static-file trap where a nice page exists in the repo but disappears at deploy time.

See [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md) for a simple deployment checklist.

## Launch strategy

NeuroMind should launch as:

**The ANHB2217 study hub for workbooks, lesion logic, quick simulations, and AI explanations.**

The first launch target should be classmates, lab partners, course group chats, and exam-week testers.

See [docs/LAUNCH_CHECKLIST.md](./docs/LAUNCH_CHECKLIST.md) for the practical rollout list.

## Contributing

Contributions are welcome, but keep them aligned with the actual product direction:

- improve workbook-style study flows
- improve accuracy and usability
- tighten the course-specific value
- avoid random shiny features with no study payoff

## Links

- [Google AI Studio Project](https://aistudio.google.com/apps/drive/1KTiPvHMXUc4SN1JNJOvOpKajst8YEV8o)
- [GitHub Repository](https://github.com/KG-97/neuromind-anhb2217)
- [UWA ANHB2217 Course Info](https://handbooks.uwa.edu.au/unitdetails?code=ANHB2217)

## License

MIT License

---

**Built for neuroscience students who would prefer less fluff and more marks.**
