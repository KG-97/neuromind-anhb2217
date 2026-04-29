# Contributing to NeuroMind

Thank you for your interest in contributing to NeuroMind! This document provides guidelines for collaborating on this multi-AI development project.

## 🤖 Multi-AI Collaboration Model

This project uses a unique collaborative approach involving:

### Google AI Studio (Gemini)
**Role:** Primary Development Environment
- Generate and test React components
- Implement AI-powered features
- Create interactive visualizations
- Sync code changes to GitHub

**Workflow:**
1. Open project in [Google AI Studio](https://aistudio.google.com/apps/drive/1KTiPvHMXUc4SN1JNJOvOpKajst8YEV8o)
2. Make changes to components and features
3. Test in the preview panel
4. Use "Sync to GitHub" button to push changes
5. Always test before syncing

### GitHub Copilot/Codex
**Role:** Code Assistant & Enhancement
- Provide intelligent code completions
- Suggest optimizations and refactoring
- Help with documentation
- Assist with debugging

**Best Practices:**
- Accept suggestions that align with project style
- Review all suggestions before accepting
- Use for repetitive code patterns
- Leverage for boilerplate generation

### Perplexity AI
**Role:** Research & Coordination
- Research neuroscience concepts and best practices
- Coordinate between development platforms
- Maintain documentation
- Plan features and architecture
- Provide project management

**Responsibilities:**
- Keep README and docs up to date
- Research educational content accuracy
- Plan feature roadmap
- Coordinate AI assistant workflows

## 📋 Development Workflow

### For Google AI Studio
```
1. Make changes in AI Studio
2. Test features in preview
3. Check console for errors
4. Sync to GitHub when stable
5. Add descriptive commit message
```

### For GitHub Codex (when editing locally)
```
1. Clone repository: git clone https://github.com/KG-97/neuromind-anhb2217.git
2. Create feature branch: git checkout -b feature/your-feature
3. Make changes with Copilot assistance
4. Test locally: npm run dev
5. Commit: git commit -m "feat: your feature"
6. Push: git push origin feature/your-feature
7. Create pull request on GitHub
```

### For Perplexity (Documentation & Planning)
```
1. Research topics and create documentation
2. Update README and guides
3. Create issues for new features
4. Review and coordinate changes
5. Maintain project roadmap
```

## 🎨 Code Style Guidelines

### TypeScript
- Use functional components with hooks
- Define interfaces for all props
- Use descriptive variable names
- Add JSDoc comments for complex functions

```typescript
interface NeuronProps {
  voltage: number;
  threshold: number;
  onFire: () => void;
}

const Neuron: React.FC<NeuronProps> = ({ voltage, threshold, onFire }) => {
  // Component logic
};
```

### React Components
- One component per file
- Keep components focused and reusable
- Use React hooks for state management
- Implement error boundaries

### File Naming
- Components: `PascalCase.tsx` (e.g., `NeuronModel.tsx`)
- Services: `camelCase.ts` (e.g., `geminiService.ts`)
- Types: `types.ts` or `ComponentName.types.ts`

## 🧪 Testing

Before syncing/committing:
- ✅ Test all UI interactions
- ✅ Check console for errors
- ✅ Verify responsive design
- ✅ Test AI features with API
- ✅ Review TypeScript errors

## 📝 Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add synaptic transmission simulator
fix: correct action potential timing
docs: update API documentation
style: format code with prettier
refactor: restructure neuron components
test: add unit tests for brain atlas
```

## 🔄 Sync Frequency

### Google AI Studio
- Sync after completing a feature
- Sync before starting major changes
- Sync at end of development session
- Don't sync broken code

### GitHub Codex (Local Development)
- Commit frequently with clear messages
- Push to feature branch regularly
- Create PR when feature is complete

## 🐛 Bug Reports

Create an issue with:
- Clear description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment (browser, OS)

## 💡 Feature Requests

Create an issue with:
- Feature description
- Use case and benefits
- Proposed implementation (if any)
- Relevant neuroscience concepts

## 📚 Documentation

When adding features:
- Update README if needed
- Add JSDoc comments
- Document API endpoints
- Include usage examples
- Update component guides

## 🎓 Educational Content

For neuroscience content:
- Ensure scientific accuracy
- Cite sources when applicable
- Use appropriate terminology
- Make content accessible to students
- Include visual aids

## 🔗 Useful Resources

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Gemini API Docs](https://ai.google.dev/docs)
- [Vite Guide](https://vitejs.dev/guide/)
- [Neuroscience Textbooks](https://www.ncbi.nlm.nih.gov/books/NBK10799/)

## 🤝 Collaboration Tips

### Communication
- Use clear commit messages
- Comment complex code
- Document API changes
- Update team on major changes

### Coordination
- Check recent commits before starting
- Don't overwrite others' work
- Resolve conflicts carefully
- Communicate about features in progress

### Quality
- Test before syncing
- Review your own code
- Follow established patterns
- Maintain consistency

## ❓ Questions?

If you have questions about:
- **Development**: Check Google AI Studio docs
- **Code**: Use GitHub Discussions
- **Neuroscience**: Consult course materials
- **Project Direction**: Create an issue

---

**Remember:** This is a collaborative learning project. Focus on creating helpful educational tools for ANHB2217 students! 🧠✨
