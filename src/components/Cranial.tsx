import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';

const cns = {
  1: { r: 'I', n: 'Olfactory', t: 'Sensory', f: 'Smell', l: 'Cribriform plate', col: 'emerald' },
  2: { r: 'II', n: 'Optic', t: 'Sensory', f: 'Vision', l: 'Optic canal', col: 'emerald' },
  3: { r: 'III', n: 'Oculomotor', t: 'Motor', f: 'Eye movement (SR, IR, MR, IO), pupil constriction', l: 'Midbrain', col: 'rose' },
  4: { r: 'IV', n: 'Trochlear', t: 'Motor', f: 'Eye movement (Superior oblique)', l: 'Midbrain', col: 'rose' },
  5: { r: 'V', n: 'Trigeminal', t: 'Both', f: 'Facial sensation, Mastication muscles', l: 'Pons', col: 'violet' },
  6: { r: 'VI', n: 'Abducens', t: 'Motor', f: 'Eye movement (Lateral rectus)', l: 'Pons', col: 'rose' },
  7: { r: 'VII', n: 'Facial', t: 'Both', f: 'Facial expression, Taste (ant 2/3), tears/saliva', l: 'Pons', col: 'violet' },
  8: { r: 'VIII', n: 'Vestibulocochlear', t: 'Sensory', f: 'Hearing and balance', l: 'Pons / Medulla junction', col: 'emerald' },
  9: { r: 'IX', n: 'Glossopharyngeal', t: 'Both', f: 'Taste (post 1/3), swallowing, salivation', l: 'Medulla', col: 'violet' },
  10: { r: 'X', n: 'Vagus', t: 'Both', f: 'Parasympathetic to viscera, swallowing, phonation', l: 'Medulla', col: 'violet' },
  11: { r: 'XI', n: 'Accessory', t: 'Motor', f: 'Head/shoulder movement (SCM & Trapezius)', l: 'Medulla / Spinal cord', col: 'rose' },
  12: { r: 'XII', n: 'Hypoglossal', t: 'Motor', f: 'Tongue movement', l: 'Medulla', col: 'rose' }
};

export default function Cranial() {
  const [currentCNId, setCurrentCNId] = useState<keyof typeof cns>(1);
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [diagramSvg, setDiagramSvg] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  // Tooltip interaction state
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diagramSvg && svgContainerRef.current) {
      const interactiveElements = svgContainerRef.current.querySelectorAll('.cortex-interactive, .interactive, g');
      interactiveElements.forEach(el => {
        const titleEl = el.querySelector('title');
        if (titleEl && titleEl.textContent) {
          el.setAttribute('data-tooltip', titleEl.textContent);
          titleEl.remove();
        }
      });
    }
  }, [diagramSvg]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const target = e.target as Element;
    const interactiveGroup = target.closest('[data-tooltip]');
    
    if (interactiveGroup) {
      const text = interactiveGroup.getAttribute('data-tooltip');
      if (text) {
        setTooltip({
          show: true,
          text,
          x: e.clientX,
          y: e.clientY
        });
        return;
      }
    }
    
    if (tooltip.show) {
      setTooltip(prev => ({ ...prev, show: false }));
    }
  };

  // Progress Tracker State
  const [studiedList, setStudiedList] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem('anhb2217-studied-cns');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  // Labeling Trainer State
  const [quizActive, setQuizActive] = useState(false);
  const [quizTarget, setQuizTarget] = useState<number | null>(null);
  const [quizInput, setQuizInput] = useState('');
  const [quizResult, setQuizResult] = useState<{correct: boolean, msg: string} | null>(null);

  useEffect(() => {
    localStorage.setItem('anhb2217-studied-cns', JSON.stringify(studiedList));
  }, [studiedList]);

  const data = cns[currentCNId];

  const generateAIContent = async (type: string) => {
    setLoading(true);
    setAiResponse('');
    try {
      const cnName = `Cranial Nerve ${data.r} (${data.n})`;
      let prompt = "";
      const sysInstruction = "You are an expert neuroanatomy professor teaching ANHB2217. Provide concise, accurate, and highly educational responses. Return ONLY raw HTML suitable to be placed inside a <div>. Do not use markdown code blocks like ```html. Use basic HTML tags like <strong>, <ul>, <li>, and <br>.";

      if (type === 'case') {
        prompt = `Create a short, realistic 2-sentence clinical vignette describing a patient with a lesion or issue affecting ${cnName}. Then, ask the student a specific multiple-choice question about the expected symptoms or the anatomical localization. Put the correct answer and a brief educational explanation inside a <details><summary>Click for Answer</summary><div class="mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">...</div></details> tag.`;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: sysInstruction }),
      });
      const result = await res.json();
      setAiResponse(result.response);
    } catch (e) {
      setAiResponse('<div class="text-rose-500 font-medium">Error: Unable to reach the AI tutor at this time. Please try again later.</div>');
    } finally {
      setLoading(false);
    }
  };

  const generateAIDiagram = async () => {
    setImageLoading(true);
    setDiagramSvg('');
    setIsZoomed(false);
    try {
      const accentColor = data.col === 'emerald' ? '#10b981' : data.col === 'rose' ? '#f43f5e' : '#8b5cf6';
      const sysInstruction = "You are an expert SVG graphics coder and neuroanatomy professor recording textbook figures. Output ONLY raw valid SVG code (starting with <svg> and ending with </svg>). Do not include markdown wraps or HTML beyond the SVG.";
      const prompt = `Create a highly educational, scalable SVG diagram of Cranial Nerve ${data.r} (${data.n}).
      REQUIREMENTS:
      1. Use a clear viewBox (e.g., "0 0 1000 1200") for high-resolution scaling. Ensure the root <svg> tag includes width="100%" height="100%" and NO fixed pixel boundaries.
      2. Dark mode color palette (dark grey/zinc backgrounds, white/light text). Provide intricate, high-fidelity textbook-level anatomical details for optimal detailed viewing.
      3. Show the origin in the brain/brainstem (${data.l}) and its primary projection/innervation targets (${data.f.split(',')[0]}).
      4. Highlight the primary neural exiting path in bright ${accentColor}.
      5. **INTERACTIVITY (Crucial Requirement):** Wrap at least 4 key anatomical structures in <g class="interactive"> tags. Inside EACH of these <g> tags, put a <title> tag with a 1-2 sentence educational explanation of that structure so it appears as a tooltip on hover.
      6. Include an embedded <style> tag to add hover effects: .interactive { cursor: pointer; transition: all 0.2s; } .interactive:hover { filter: drop-shadow(0px 0px 8px ${accentColor}); opacity: 0.9; stroke-width: 3; }`;

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: sysInstruction }),
      });
      const result = await res.json();
      
      const svgMatch = result.response?.match(/<svg[\s\S]*?<\/svg>/i);

      if (svgMatch && svgMatch[0]) {
        setDiagramSvg(svgMatch[0]);
      } else {
        alert('Failed to generate a valid SVG diagram. Please try again.');
        console.error("AI Response was:", result.response);
      }
    } catch (e) {
       alert('Error communicating with AI text generator.');
    } finally {
      setImageLoading(false);
    }
  };

  const toggleStudied = (id: number) => {
    setStudiedList(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const startQuiz = () => {
    const randomCN = Math.floor(Math.random() * 12) + 1;
    setQuizTarget(randomCN);
    setQuizActive(true);
    setQuizInput('');
    setQuizResult(null);
  };

  const submitQuiz = () => {
    if (!quizTarget) return;
    const targetData = cns[quizTarget as keyof typeof cns];
    const isCorrect = quizInput.toLowerCase().trim() === targetData.n.toLowerCase();
    if (isCorrect) {
      setQuizResult({ correct: true, msg: `✓ Correct! CN ${targetData.r} is indeed the ${targetData.n} nerve.` });
    } else {
      setQuizResult({ correct: false, msg: `✗ Incorrect. CN ${targetData.r} is ${targetData.n}, not ${quizInput || '(no answer)'}` });
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="max-w-5xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 variants={itemVariants} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-3 tracking-tight">Cranial Nerves</motion.h2>
      <motion.p variants={itemVariants} className="text-zinc-400 mb-6 text-lg">Select any cranial nerve from the interactive grid below to view its specific functions, primary location, and fiber type.</motion.p>

      {/* Progress Tracker */}
      <motion.div variants={itemVariants} className="mb-8 glass-card rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between">
        <div className="mb-3 sm:mb-0">
          <h3 className="font-bold text-zinc-100 text-lg">Study Progress</h3>
          <p className="text-sm text-zinc-400">{studiedList.length}/12 modules studied</p>
        </div>
        <div className="w-full sm:w-1/2 bg-black/40 rounded-full h-3 overflow-hidden border border-white/5 shadow-inner">
           <div className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${(studiedList.length / 12) * 100}%` }}></div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 grid grid-cols-3 gap-3 h-max">
          {Object.entries(cns).map(([id, cnData]) => {
            const numericId = Number(id);
            const isStudied = studiedList.includes(numericId);
            const typeLabel = cnData.t === 'Sensory' ? 'S' : cnData.t === 'Motor' ? 'M' : 'B';
            return (
              <button
                key={id}
                onClick={() => { setCurrentCNId(numericId as keyof typeof cns); setAiResponse(''); }}
                className={`py-4 rounded-xl shadow-lg transition-all duration-300 text-center relative flex flex-col items-center justify-center ${
                  currentCNId === numericId 
                    ? 'bg-violet-600/20 border-2 border-violet-500/50 text-violet-300 transform scale-[1.02]' 
                    : 'glass-card text-zinc-300 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <span className="font-bold text-lg block">{cnData.r}</span>
                <span className={`text-[10px] uppercase font-bold tracking-widest mt-1.5 px-2 py-0.5 rounded-md ${
                  currentCNId === numericId ? 'bg-violet-900/50 text-violet-200' : 'bg-black/50 text-zinc-400'
                }`}>{typeLabel}</span>
                {isStudied && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
              </button>
            )
          })}
        </div>
        
        <div className="md:col-span-2 glass-panel rounded-3xl p-8 flex flex-col justify-center min-h-[400px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-[80px] pointer-events-none"></div>
          <div className="fade-in flex-1 relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-sm font-bold text-zinc-400 tracking-widest flex items-center gap-4 uppercase mb-2">
                  Cranial Nerve {data.r}
                  <button 
                    onClick={() => toggleStudied(currentCNId)}
                    className="text-xs normal-case font-medium px-3 py-1 rounded-lg glass-button text-zinc-300"
                  >
                     {studiedList.includes(currentCNId) ? 'Mark as Unread' : 'Mark as Studied'}
                  </button>
                </span>
                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">{data.n}</h3>
              </div>
              <span className={`bg-${data.col}-900/30 text-${data.col}-300 px-4 py-1.5 rounded-full text-sm font-bold border border-${data.col}-500/30 shadow-lg backdrop-blur-md`}>{data.t}</span>
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase block mb-1">Function</span>
                <p className="text-xl text-zinc-100 font-medium leading-relaxed">{data.f}</p>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase block mb-1">Location / Exit</span>
                <p className="text-zinc-300 text-lg">{data.l}</p>
              </div>
            </div>
          </div>

          {/* Interactive SVG Display Area for Cranial Nerves */}
          {imageLoading && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 mb-4 p-10 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px] backdrop-blur-sm shadow-inner"
            >
               <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
               <p className="text-zinc-300 font-medium">Generating Interactive AI Diagram for CN {data.r}...</p>
            </motion.div>
          )}
          {diagramSvg && !imageLoading && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ type: "spring", stiffness: 200, damping: 20 }}
               className={isZoomed ? "fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto" : "mt-8 mb-4 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-black p-6 flex flex-col items-center justify-center"}
             >
                <div className="w-full text-center mb-6">
                   <span className="inline-block text-xs font-bold text-violet-300 tracking-wider bg-violet-900/40 px-4 py-2 rounded-lg border border-violet-500/30">👆 HOVER OVER ANATOMICAL STRUCTURES TO LEARN</span>
                </div>
                <div 
                  ref={svgContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                  className={isZoomed ? "w-full flex-1 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-6xl [&>svg]:max-h-[85vh] [&>svg]:object-contain text-zinc-100" : "w-full max-w-2xl [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[600px] text-zinc-100 transition-transform duration-500 group-hover:scale-[1.02]"}
                  dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                />
                {tooltip.show && (
                  <div 
                    className="fixed z-[120] px-4 py-3 text-sm max-w-xs text-zinc-100 bg-zinc-900/90 border border-violet-500/50 shadow-2xl rounded-xl pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+16px)] backdrop-blur-md"
                    style={{ left: tooltip.x, top: tooltip.y }}
                  >
                    {tooltip.text}
                  </div>
                )}
                <div className={`absolute top-4 right-4 flex gap-3 ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                    <button onClick={() => setIsZoomed(!isZoomed)} className="glass-button text-zinc-100 font-medium px-4 py-2 rounded-lg shadow-lg text-sm z-10 relative">
                      {isZoomed ? '🔍 Minimize' : '🔍 Detailed View'}
                    </button>
                    <button onClick={() => { setDiagramSvg(''); setIsZoomed(false); }} className="glass-button text-rose-300 font-medium px-4 py-2 rounded-lg shadow-lg text-sm z-10 relative">Close</button>
                </div>
             </motion.div>
          )}
          
          {/* AI Action Bar */}
          <div className="mt-8 pt-6 flex gap-4 flex-wrap border-t border-white/5 relative z-10">
            <button onClick={() => generateAIContent('case')} disabled={loading} className="glass-button flex-1 bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border-violet-500/30 font-bold py-3 px-5 rounded-xl transition-all flex items-center justify-center disabled:opacity-50">
              <span className="mr-2 text-lg">✨</span> Test Me: Clinical Case
            </button>
            <button onClick={generateAIDiagram} disabled={imageLoading} className={`glass-button flex-1 bg-${data.col}-600/20 hover:bg-${data.col}-600/30 text-${data.col}-300 border-${data.col}-500/30 font-bold py-3 px-5 rounded-xl transition-all flex justify-center items-center disabled:opacity-50`}>
              <span className="mr-2 text-lg">🎨</span> Generate Diagram
            </button>
          </div>
          {loading && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 text-violet-400 font-medium flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 shadow-inner"
            >
              <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mr-3"></div> Generating AI response...
            </motion.div>
          )}
          {aiResponse && !loading && (
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ type: "spring", stiffness: 200, damping: 20 }}
               className="mt-6 p-6 bg-violet-900/20 border border-violet-500/30 rounded-2xl text-zinc-200 leading-relaxed shadow-inner backdrop-blur-md text-base" 
               dangerouslySetInnerHTML={{__html: aiResponse}}
             />
          )}

          {/* Labeling Trainer */}
          <div className="mt-8 pt-8 border-t border-white/5 relative z-10">
            <div className="flex items-center justify-between mb-5">
              <h4 className="font-bold text-zinc-100 flex items-center text-lg"><span className="mr-3 text-emerald-400">🎓</span> Labeling Trainer</h4>
            </div>
            
            {!quizActive ? (
              <button 
                onClick={startQuiz} 
                className="w-full glass-button bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/30 font-bold py-4 px-6 rounded-xl transition-all shadow-lg"
              >
                Start Random CN Quiz
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 p-6 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm"
              >
                <p className="text-zinc-300 mb-4 text-lg">What is the name of Cranial Nerve <strong className="text-white text-xl bg-white/10 px-2 py-1 rounded">{cns[quizTarget!].r}</strong>?</p>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    value={quizInput} 
                    onChange={e => setQuizInput(e.target.value)}
                    placeholder="Type name here (e.g. Vagus)"
                    className="flex-1 bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-xl px-4 py-3 text-zinc-100 text-lg focus:outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 shadow-inner"
                    onKeyDown={(e) => { if (e.key === 'Enter') submitQuiz(); }}
                    disabled={!!quizResult}
                  />
                  {!quizResult ? (
                    <button onClick={submitQuiz} className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg">Submit</button>
                  ) : (
                    <button onClick={startQuiz} className="glass-button bg-white/10 text-white px-6 py-3 rounded-xl font-bold transition-all">Next</button>
                  )}
                </div>
                {quizResult && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mt-4 p-4 rounded-xl flex items-center font-medium ${quizResult.correct ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]'}`}
                  >
                    {quizResult.msg}
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

        </div>
      </motion.div>
    </motion.div>
  );
}


