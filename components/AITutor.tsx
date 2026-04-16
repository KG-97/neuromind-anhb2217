import React, { useState } from 'react';
import { generateQuizQuestion, explainConcept } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Bot, BookOpen, CheckCircle, XCircle, HelpCircle, GraduationCap } from 'lucide-react';


const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    return (
      <p key={i} className={line === '' ? 'mt-2' : ''}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
};
const AITutor: React.FC = () => {
  const [activeMode, setActiveMode] = useState<'quiz' | 'explain'>('quiz');

  // Quiz State
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState<QuizQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Explain State
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');

  const handleGenerateQuiz = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setQuizData(null);
    setSelectedOption(null);

    const result = await generateQuizQuestion(topic);
    try {
      const parsed = JSON.parse(result);
      if (parsed.question) {
        setQuizData(parsed);
      } else {
        setError(parsed.error || 'Failed to generate a valid question. Please try again.');
      }
    } catch (e) {
      setError('AI response malformed. Please try again.');
    }
    setLoading(false);
  };

  const handleExplain = async () => {
    if (!concept.trim()) return;
    setLoading(true);
    setExplanation('');
    const result = await explainConcept(concept);
    setExplanation(result);
    setLoading(false);
  };

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Bot size={20} className="text-purple-600" />
          <div>
            <p className="text-sm font-semibold text-slate-800">AI Vault</p>
            <p className="text-xs text-slate-500">Gemini 2.5 Powered</p>
          </div>
        </div>
        <button
          onClick={() => { setActiveMode('quiz'); setError(''); setQuizData(null); }}
          className={`w-full text-left p-3 rounded-lg transition-all ${
            activeMode === 'quiz' ? 'bg-purple-50 border border-purple-200' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle size={16} className="text-purple-600" />
            <p className="text-sm font-semibold text-purple-800">Exam Generator</p>
          </div>
          <p className="text-xs text-slate-500">Generate multiple choice questions on any topic.</p>
        </button>
        <button
          onClick={() => { setActiveMode('explain'); setError(''); setExplanation(''); }}
          className={`w-full text-left p-3 rounded-lg transition-all ${
            activeMode === 'explain' ? 'bg-blue-50 border border-blue-200' : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={16} className="text-blue-600" />
            <p className="text-sm font-semibold text-blue-800">Concept Explainer</p>
          </div>
          <p className="text-xs text-slate-500">Get simplified explanations for complex mechanisms.</p>
        </button>
      </div>

      {/* Main Panel */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 p-6">
        {activeMode === 'quiz' ? (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <GraduationCap size={22} className="text-purple-600" />
              Exam Prep
            </h2>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleGenerateQuiz()}
                placeholder="Enter topic (e.g. 'Synaptic Transmission', 'Cerebellum')"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
              />
              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Generating...' : 'Create Question'}
              </button>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {quizData && (
              <div className="space-y-4">
                <p className="text-slate-800 font-medium text-base">{quizData.question}</p>
                <div className="space-y-2">
                  {quizData.options.map((opt, i) => {
                    const isSelected = selectedOption === i;
                    const isCorrect = i === quizData.correctAnswer;
                    const showResult = selectedOption !== null;
                    let cls = 'w-full text-left p-3 rounded-lg border transition-all text-sm ';
                    if (showResult) {
                      if (isCorrect) cls += 'bg-green-50 border-green-400 text-green-800';
                      else if (isSelected) cls += 'bg-red-50 border-red-400 text-red-800';
                      else cls += 'bg-slate-50 border-slate-200 text-slate-600';
                    } else {
                      cls += 'bg-white border-slate-200 hover:bg-purple-50 hover:border-purple-300';
                    }
                    return (
                      <button key={i} onClick={() => setSelectedOption(i)} disabled={showResult} className={cls}>
                        <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                        {showResult && isCorrect && <CheckCircle size={16} className="inline ml-2 text-green-600" />}
                        {showResult && isSelected && !isCorrect && <XCircle size={16} className="inline ml-2 text-red-600" />}
                      </button>
                    );
                  })}
                </div>
                {selectedOption !== null && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800 mb-1">Explanation</p>
                    <p className="text-sm text-blue-700">{quizData.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BookOpen size={22} className="text-blue-600" />
              Concept Explainer
            </h2>
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={concept}
                onChange={e => setConcept(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleExplain()}
                placeholder="Enter a concept (e.g. 'Long-term potentiation', 'Nernst equation')"
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                onClick={handleExplain}
                disabled={loading}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Explaining...' : 'Explain'}
              </button>
            </div>
            {explanation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 whitespace-pre-wrap">{renderMarkdown(explanation)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutor;
