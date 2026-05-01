import React, { useState, useEffect } from 'react';
import { Bot, BookOpen, CheckCircle, XCircle, HelpCircle, GraduationCap, X } from 'lucide-react';
import { apiPost } from '../services/apiClient';

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  return lines.map((line, i) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/);
    return (
      <p key={i} className={line === '' ? 'mt-2' : ''}>
        {parts.map((part, j) =>
          part.startsWith('**') && part.endsWith('**')
            ? <strong key={j} className="text-zinc-100">{part.slice(2, -2)}</strong>
            : part
        )}
      </p>
    );
  });
};

interface AITutorProps {
  aiAvailable: boolean | null;
}

const recommendedTopics = [
  'Dura Mater and subarachnoid space',
  'Corticospinal tract lesion',
  'Wallenberg syndrome',
  'Olfactory nerve anatomy',
  'CSF circulation and hydrocephalus',
  'Brodmann areas 1,2,3,4',
];

const recommendedConcepts = [
  'Action Potential generation',
  'Synaptic Transmission',
  'Cerebral cortex layers',
  'Basal ganglia direct and indirect pathways',
  'Cranial nerve nuclei location',
];

export default function AITutor({ aiAvailable }: AITutorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<'quiz' | 'explain'>('quiz');

  // Quiz State
  const [topic, setTopic] = useState('');
  const [quizData, setQuizData] = useState<any | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Explain State
  const [concept, setConcept] = useState('');
  const [explanation, setExplanation] = useState('');

  useEffect(() => {
    const handleExplainEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ concept: string }>;
      if (customEvent.detail?.concept) {
        setIsOpen(true);
        setActiveMode('explain');
        setConcept(customEvent.detail.concept);
        triggerExplain(customEvent.detail.concept);
      }
    };

    const handleQuizEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ topic: string }>;
      if (customEvent.detail?.topic) {
        setIsOpen(true);
        setActiveMode('quiz');
        setTopic(customEvent.detail.topic);
        handleGenerateQuiz(customEvent.detail.topic);
      }
    };

    window.addEventListener('aitutor:explain', handleExplainEvent);
    window.addEventListener('aitutor:quiz', handleQuizEvent);
    return () => {
      window.removeEventListener('aitutor:explain', handleExplainEvent);
      window.removeEventListener('aitutor:quiz', handleQuizEvent);
    };
  }, []);

  const triggerExplain = async (queryToExplain: string) => {
    if (aiAvailable === false) {
      setExplanation('AI is not available. Configure the backend key or deploy the full app to use explanations.');
      return;
    }
    setLoading(true);
    setExplanation('');
    const sys = "You are an expert neurobiology professor. Provide a highly educational, clear, and easy to understand explanation of the given concept. Use bullet points and bold text where appropriate. Keep it concise.";
    try {
      const data = await apiPost('/api/generate', { prompt: `Explain why this is incorrect or clarify the concept: ${queryToExplain}`, systemInstruction: sys });
      setExplanation(data.response || 'Failed to generate explanation.');
    } catch (e) {
      setExplanation('Failed to generate explanation.');
    }
    setLoading(false);
  };

  const handleGenerateQuiz = async (topicToUse?: string) => {
    const promptTopic = topicToUse?.trim() || topic.trim();
    if (!promptTopic) return;
    if (aiAvailable === false) {
      setError('AI is not available. Configure the backend key or deploy the full app to use quizzes.');
      return;
    }
    setLoading(true);
    setError('');
    setQuizData(null);
    setSelectedOption(null);

    const sys = "You are an expert neurobiology professor preparing ANHB2217 exam questions. Generate a multiple choice question about the given topic. Output strictly a JSON object with this format: { \"question\": \"...\", \"options\": [\"...\", \"...\", \"...\", \"...\"], \"correctAnswer\": 0, \"explanation\": \"...\" }. Do NOT include markdown code blocks around the JSON.";
    
    try {
      const data = await apiPost('/api/generate', { prompt: promptTopic, systemInstruction: sys });
      const result = data.response ? data.response.replace(/```json/gi, '').replace(/```/g, '').trim() : '';
      
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

  const handleExplain = async (conceptToUse?: string) => {
    const promptConcept = conceptToUse?.trim() || concept.trim();
    if (!promptConcept) return;
    await triggerExplain(promptConcept);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        aria-label="AI Tutor"
        className="fixed bottom-4 right-4 md:bottom-6 md:right-6 p-4 glass-button rounded-full text-violet-400 z-[100] shadow-2xl border-none hover:scale-105 transition-transform flex items-center justify-center"
      >
        <Bot size={32} />
      </button>
    );
  }

  return (
    <div className="fixed md:bottom-6 md:right-6 bottom-0 right-0 w-full md:w-[800px] max-w-[100vw] h-[85vh] md:h-[600px] glass-panel rounded-t-2xl md:rounded-2xl z-[100] flex flex-col overflow-hidden shadow-2xl border-none transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-white/5 bg-black/20">
         <div className="flex items-center gap-2">
           <Bot size={24} className="text-violet-400" />
           <span className="font-bold text-zinc-50 text-lg">AI Tutor Vault</span>
         </div>
         <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-100 transition-colors">
           <X size={24} />
         </button>
      </div>

      <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/5 p-4 md:space-y-3 flex md:flex-col gap-2 overflow-x-auto custom-scrollbar bg-black/10">
          <button
            onClick={() => { setActiveMode('quiz'); setError(''); setQuizData(null); }}
            className={`flex-1 md:w-full text-left p-3 rounded-lg transition-all min-w-[140px] ${
              activeMode === 'quiz' ? 'glass-button bg-violet-500/20 border-violet-500/50' : 'glass-button border-none'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <HelpCircle size={16} className="text-violet-400" />
              <p className="text-sm font-semibold text-zinc-100">Exam Generator</p>
            </div>
            <p className="text-xs text-zinc-400 hidden md:block">Generate multiple choice questions on any topic.</p>
          </button>
          
          <button
            onClick={() => { setActiveMode('explain'); setError(''); setExplanation(''); }}
            className={`flex-1 md:w-full text-left p-3 rounded-lg transition-all min-w-[140px] ${
              activeMode === 'explain' ? 'glass-button bg-blue-500/20 border-blue-500/50' : 'glass-button border-none'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-blue-400" />
              <p className="text-sm font-semibold text-zinc-100">Concept Explainer</p>
            </div>
            <p className="text-xs text-zinc-400 hidden md:block">Get simplified explanations for complex mechanisms.</p>
          </button>
        </div>

        {/* Main Panel */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {aiAvailable === false && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-100 text-sm">
              AI features are currently disabled. Configure the backend `GEMINI_API_KEY` (or `GOOGLE_API_KEY`) or deploy the full app to enable quiz and explanation generation.
            </div>
          )}
          {activeMode === 'quiz' ? (
            <div>
              <h2 className="text-xl font-bold text-zinc-50 mb-4 flex items-center gap-2">
                <GraduationCap size={22} className="text-violet-400" />
                Exam Prep
              </h2>
              <div className="flex flex-col gap-4 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recommendedTopics.map((topicOption) => (
                  <button
                    key={topicOption}
                    onClick={() => handleGenerateQuiz(topicOption)}
                    disabled={loading || aiAvailable === false}
                    className="text-left px-4 py-3 glass-button bg-zinc-900 border border-white/10 rounded-2xl text-zinc-200 hover:border-violet-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {topicOption}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleGenerateQuiz()}
                  placeholder="Enter topic (e.g. 'Synaptic Transmission')"
                  className="flex-1 px-4 py-2 glass-button text-zinc-100 rounded-lg outline-none focus:border-violet-500/50"
                />
                <button
                  onClick={() => handleGenerateQuiz()}
                  disabled={loading || aiAvailable === false}
                  className="px-5 py-2 glass-button text-violet-300 rounded-lg disabled:opacity-50 font-medium"
                >
                  {loading ? 'Generating...' : 'Create Question'}
                </button>
              </div>
            </div>

              {error && (
                <div className="p-4 glass-card bg-rose-500/20 border-rose-500/50 rounded-lg text-rose-200 text-sm mb-4">
                  {error}
                </div>
              )}

              {quizData && (
                <div className="space-y-4 fade-in">
                  <p className="text-zinc-50 font-medium text-base">{quizData.question}</p>
                  <div className="space-y-2">
                    {quizData.options.map((opt: string, i: number) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = i === quizData.correctAnswer;
                      const showResult = selectedOption !== null;
                      let cls = 'w-full text-left p-3 rounded-lg transition-all text-sm ';
                      if (showResult) {
                        if (isCorrect) cls += 'glass-button bg-emerald-500/20 text-emerald-300';
                        else if (isSelected) cls += 'glass-button bg-rose-500/20 text-rose-300';
                        else cls += 'glass-button opacity-50 text-zinc-400';
                      } else {
                        cls += 'glass-button text-zinc-300';
                      }
                      return (
                        <button key={i} onClick={() => setSelectedOption(i)} disabled={showResult} className={cls}>
                          <span className="font-medium mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
                          {showResult && isCorrect && <CheckCircle size={16} className="inline ml-2 text-emerald-400" />}
                          {showResult && isSelected && !isCorrect && <XCircle size={16} className="inline ml-2 text-rose-400" />}
                        </button>
                      );
                    })}
                  </div>
                  {selectedOption !== null && (
                    <div className="p-4 glass-card bg-violet-500/10 border-violet-500/30 rounded-lg fade-in">
                      <p className="text-sm font-semibold text-violet-300 mb-1">Explanation</p>
                      <p className="text-sm text-zinc-300">{quizData.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold text-zinc-50 mb-4 flex items-center gap-2">
                <BookOpen size={22} className="text-blue-400" />
                Concept Explainer
              </h2>
              <div className="space-y-3 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendedConcepts.map((conceptOption) => (
                    <button
                      key={conceptOption}
                      onClick={() => handleExplain(conceptOption)}
                      disabled={loading || aiAvailable === false}
                      className="text-left px-4 py-3 glass-button bg-zinc-900 border border-white/10 rounded-2xl text-zinc-200 hover:border-blue-500 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {conceptOption}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={concept}
                    onChange={e => setConcept(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleExplain()}
                    placeholder="Enter a concept (e.g. 'Action Potential')"
                    className="flex-1 px-4 py-2 glass-button text-zinc-100 rounded-lg outline-none focus:border-blue-500/50"
                  />
                  <button
                    onClick={() => handleExplain()}
                    disabled={loading || aiAvailable === false}
                    className="px-5 py-2 glass-button text-blue-300 rounded-lg disabled:opacity-50 font-medium"
                  >
                    {loading ? 'Explaining...' : 'Explain'}
                  </button>
                </div>
              </div>
              {explanation && (
                <div className="p-5 glass-card bg-blue-500/10 border-blue-500/30 rounded-lg fade-in">
                  <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">{renderMarkdown(explanation)}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
