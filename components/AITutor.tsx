import React, { useState } from 'react';
import { generateQuizQuestion, explainConcept } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { Bot, BookOpen, CheckCircle, XCircle, HelpCircle, GraduationCap } from 'lucide-react';

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
        setError('Failed to generate a valid question. Please try again.');
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
    <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-4">
           <Bot className="text-indigo-600" size={28} />
           <div>
             <h3 className="font-bold text-slate-800">AI Vault</h3>
             <p className="text-xs text-slate-500">Gemini 2.5 Powered</p>
           </div>
        </div>

        <button 
          onClick={() => setActiveMode('quiz')}
          className={`p-4 rounded-xl text-left transition-all ${activeMode === 'quiz' ? 'bg-indigo-50 border-indigo-200 border shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
        >
          <div className="flex items-center gap-2 font-semibold text-indigo-900 mb-1">
            <HelpCircle size={18} /> Exam Generator
          </div>
          <p className="text-xs text-slate-500">Generate multiple choice questions on any topic.</p>
        </button>

        <button 
          onClick={() => setActiveMode('explain')}
          className={`p-4 rounded-xl text-left transition-all ${activeMode === 'explain' ? 'bg-emerald-50 border-emerald-200 border shadow-sm' : 'hover:bg-slate-50 border border-transparent'}`}
        >
          <div className="flex items-center gap-2 font-semibold text-emerald-900 mb-1">
            <BookOpen size={18} /> Concept Explainer
          </div>
          <p className="text-xs text-slate-500">Get simplified explanations for complex mechanisms.</p>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="lg:col-span-3 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
        
        {activeMode === 'quiz' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <GraduationCap className="text-indigo-500" /> Exam Prep
            </h2>
            
            {!quizData && (
              <div className="flex gap-2 mb-8">
                <input 
                  type="text" 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter topic (e.g. 'Synaptic Transmission', 'Cerebellum')" 
                  className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateQuiz()}
                />
                <button 
                  onClick={handleGenerateQuiz}
                  disabled={loading || !topic}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Generating...' : 'Create Question'}
                </button>
              </div>
            )}

            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">{error}</div>}

            {quizData && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-6">
                  <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Question</span>
                  <p className="text-xl font-medium text-slate-900 mt-2 leading-relaxed">{quizData.question}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {quizData.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedOption(idx)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedOption === null 
                          ? 'border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                          : selectedOption === idx
                            ? idx === quizData.correctAnswer
                              ? 'border-green-500 bg-green-50' 
                              : 'border-red-500 bg-red-50'
                            : idx === quizData.correctAnswer
                              ? 'border-green-500 bg-green-50'
                              : 'border-slate-100 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option}</span>
                        {selectedOption !== null && idx === quizData.correctAnswer && <CheckCircle className="text-green-600" />}
                        {selectedOption === idx && idx !== quizData.correctAnswer && <XCircle className="text-red-600" />}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedOption !== null && (
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-800 mb-2">Explanation</h4>
                    <p className="text-slate-600 leading-relaxed">{quizData.explanation}</p>
                    <button 
                      onClick={() => { setQuizData(null); setSelectedOption(null); }}
                      className="mt-4 text-indigo-600 font-semibold hover:text-indigo-800 text-sm"
                    >
                      Generate Another Question &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeMode === 'explain' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <BookOpen className="text-emerald-500" /> Concept Explainer
            </h2>
            
            <div className="flex gap-2 mb-8">
              <input 
                type="text" 
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                placeholder="What concept confuses you? (e.g. 'Long Term Potentiation')" 
                className="flex-1 border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                onKeyDown={(e) => e.key === 'Enter' && handleExplain()}
              />
              <button 
                onClick={handleExplain}
                disabled={loading || !concept}
                className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Thinking...' : 'Explain'}
              </button>
            </div>

            {explanation && (
              <div className="prose prose-slate max-w-none bg-slate-50 p-6 rounded-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="whitespace-pre-wrap">{explanation}</div>
              </div>
            )}
            
            {!explanation && !loading && (
              <div className="text-center text-slate-400 mt-20">
                <Bot size={48} className="mx-auto mb-4 opacity-20" />
                <p>Ask me anything about neurobiology.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AITutor;
