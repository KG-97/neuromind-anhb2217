# NeuroMind - ANHB2217 Study Companion

> An interactive neuroscience learning application for ANHB2217 students at UWA

[![Built with Google AI Studio](https://img.shields.io/badge/Built%20with-Google%20AI%20Studio-4285F4?logo=google)](https://ai.studio)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)

## 🧠 About

NeuroMind is an interactive study companion designed to help students master complex neuroscience concepts through:
- **Interactive Neuron Models**: Visualize action potentials, synaptic transmission, and neural circuits
- **AI-Powered Tutoring**: Get instant explanations and study guidance
- **Brain Atlas Explorer**: Navigate through detailed neuroanatomy
- **Practice Problems**: Test your knowledge with interactive quizzes

## 🤖 Collaborative AI Development

This project is being built collaboratively by:
- **Google AI Studio (Gemini)**: Primary development environment and code generation
- **GitHub Copilot/Codex**: Code suggestions and completions
- **Perplexity AI**: Research, documentation, and project coordination

This multi-AI approach leverages the strengths of each platform to create a comprehensive learning tool.

## 📁 Project Structure

```
neuromind-anhb2217/
├── components/          # React components
│   ├── NeuronModel.tsx # Interactive neuron visualization
│   ├── ActionPotentialLab.tsx
│   ├── BrainAtlas.tsx
│   └── AITutor.tsx
├── services/           # API and service integrations
│   └── geminiService.ts
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── index.tsx           # Application entry point
└── package.json        # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Gemini API key (for AI features)

### Installation

```bash
# Clone the repository
git clone https://github.com/KG-97/neuromind-anhb2217.git
cd neuromind-anhb2217

# Install dependencies
npm install

# Set up environment variables
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env.local

# Run development server
npm run dev
```

The app will be available at `http://localhost:5173`

## 🛠️ Development

### For AI Assistants Contributing to This Project

When working on this codebase:

1. **Code Style**: Follow TypeScript best practices, use functional components with hooks
2. **Component Structure**: Keep components focused and reusable
3. **State Management**: Use React hooks (useState, useEffect, useContext)
4. **API Integration**: All Gemini API calls should go through `services/geminiService.ts`
5. **Commit Messages**: Use conventional commits (feat:, fix:, docs:, etc.)

### Key Technologies
- **Vite**: Fast build tool and dev server
- **TypeScript**: Type-safe development
- **React**: UI framework
- **Gemini API**: AI-powered features

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

## 📚 Features

### Current Features
- ✅ Interactive neuron model with action potential visualization
- ✅ AI tutor powered by Gemini
- ✅ Brain atlas navigation
- ✅ Action potential lab simulation

### Roadmap
- [ ] Synaptic transmission simulator
- [ ] Neurotransmitter database
- [ ] Study card generator
- [ ] Progress tracking and analytics
- [ ] Mobile app version
- [ ] Offline mode support

## 🤝 Contributing

This is a collaborative AI development project. Contributions from:
- **Human developers**: PRs welcome!
- **AI assistants**: Follow the development guidelines above
- **Students**: Feedback and feature requests appreciated

### For Google AI Studio
- Primary development happens in AI Studio
- Sync changes to GitHub regularly
- Test all features before committing

### For GitHub Codex
- Provide code suggestions and completions
- Help with refactoring and optimization
- Assist with documentation

### For Perplexity
- Coordinate between development platforms
- Research best practices and new features
- Maintain documentation and project management

## 📖 Documentation

- [API Documentation](./docs/API.md) (coming soon)
- [Component Guide](./docs/COMPONENTS.md) (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) (coming soon)

## 🔗 Links

- [Google AI Studio Project](https://aistudio.google.com/apps/drive/1KTiPvHMXUc4SN1JNJOvOpKajst8YEV8o)
- [GitHub Repository](https://github.com/KG-97/neuromind-anhb2217)
- [UWA ANHB2217 Course Info](https://handbooks.uwa.edu.au/unitdetails?code=ANHB2217)

## 📄 License

MIT License - feel free to use this for your own studies!

## 🙏 Acknowledgments

- UWA Neuroscience Department
- Google AI Studio team
- All contributing AI assistants
- ANHB2217 students providing feedback

---

**Built with 🧠 by AI collaboration for neuroscience students**
