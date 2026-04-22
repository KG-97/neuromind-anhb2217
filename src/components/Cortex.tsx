import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

export default function Cortex() {
  const [aiResponse, setAiResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [diagramSvg, setDiagramSvg] = useState('');
  const [imageLoading, setImageLoading] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  // Tooltip interaction state
  const [tooltip, setTooltip] = useState({ show: false, text: '', x: 0, y: 0 });
  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (diagramSvg && svgContainerRef.current) {
      // Find all interactive groups and extract their title to prevent native tooltips
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

  const generateAIContent = async (type: string) => {
    setLoading(true);
    setAiResponse('');
    try {
      const topic = "Meninges and Brodmann areas";
      let prompt = "";
      const sysInstruction = "You are an expert neuroanatomy professor teaching ANHB2217. Provide concise, accurate, and highly educational responses. Return ONLY raw HTML suitable to be placed inside a <div>. Do not use markdown code blocks like ```html. Use basic HTML tags like <strong>, <ul>, <li>, and <br>.";

      if (type === 'quiz') {
        prompt = `Create a short, realistic 2-sentence clinical vignette describing a patient with a lesion or issue affecting the ${topic}. Then, ask the student a specific multiple-choice question about the expected symptoms or the anatomical localization. Put the correct answer and a brief educational explanation inside a <details><summary>Click for Answer</summary><div class="mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">...</div></details> tag.`;
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

  const generateAIDiagram = async (topic: string) => {
    setImageLoading(true);
    setImageUrl('');
    setDiagramSvg('');
    
    try {
      let prompt = '';
      const sysInstruction = "You are an expert SVG graphics coder and neuroanatomy professor recording textbook figures. Output ONLY raw valid SVG code (starting with <svg> and ending with </svg>). Do not include markdown wraps or HTML beyond the SVG.";
      
      if (topic === 'meninges') {
        prompt = `Create a highly educational, scalable SVG diagram of the human brain meninges layers: dura mater, arachnoid mater, and pia mater.
      REQUIREMENTS:
      1. Use a clear viewBox (e.g., "0 0 1000 1000") for high-resolution scaling. Ensure the root <svg> tag includes width="100%" height="100%" and NO fixed pixel boundaries.
      2. Dark mode color palette. Provide intricate, high-fidelity textbook-level anatomical details for detailed views.
      3. Draw distinct, clearly separated layers representing the skull, dura mater, arachnoid mater, subarachnoid space (with CSF), pia mater, and the cortical surface.
      4. Label each layer distinctly.
      5. **INTERACTIVITY:** Wrap at least 4 key structures in <g class="cortex-interactive"> tags. Inside EACH <g>, add a <title> tag with a 1-2 sentence educational explanation of that structure for hover tooltips.
      6. Include <style>.cortex-interactive { cursor: pointer; transition: all 0.2s; } .cortex-interactive:hover { filter: drop-shadow(0px 0px 8px #8b5cf6); opacity: 0.9; stroke-width: 3; }</style>`;
      } else if (topic === 'csf') {
        prompt = `Create a clear, educational, scalable SVG flow diagram illustrating the full pathway of Cerebrospinal Fluid (CSF) circulation.
      REQUIREMENTS:
      1. Use a clear viewBox (e.g., "0 0 1000 1000") for high-resolution scaling. Ensure the root <svg> tag includes width="100%" height="100%" and NO fixed pixel boundaries.
      2. Dark mode color palette. Provide intricate, high-fidelity textbook-level detail.
      3. Illustrate the flow from Choroid Plexus -> Lateral Ventricles -> 3rd Ventricle -> Cerebral Aqueduct -> 4th Ventricle -> Subarachnoid Space -> Arachnoid Granulations. Use bright blue arrows for the CSF flow.
      4. **INTERACTIVITY:** Wrap at least 5 key structures/ventricles in <g class="cortex-interactive"> tags. Inside EACH, add a <title> tag with a 1-2 sentence educational explanation for hover tooltips.
      5. Include <style>.cortex-interactive { cursor: pointer; transition: all 0.2s; } .cortex-interactive:hover { filter: drop-shadow(0px 0px 8px #3b82f6); opacity: 0.9; stroke-width: 3; }</style>`;
      }

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
      <motion.h2 variants={itemVariants} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-3 tracking-tight">Cortex, Meninges & CSF</motion.h2>
      <motion.p variants={itemVariants} className="text-zinc-400 mb-8 text-lg leading-relaxed">This section details the functional organization of the cerebral cortex, the protective meningeal layers, and the complete pathway of Cerebrospinal Fluid (CSF) circulation. Understanding these structures is crucial for localizing cortical lesions and identifying causes of hydrocephalus.</motion.p>

      {/* Interactive SVG Display Area */}
      {imageLoading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-8 p-10 glass-panel rounded-3xl text-center flex flex-col items-center justify-center min-h-[350px] shadow-inner relative overflow-hidden"
        >
           <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/5 to-cyan-500/5 pointer-events-none"></div>
           <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4 relative z-10"></div>
           <p className="text-zinc-300 font-medium relative z-10">Generating Interactive AI Diagram... this may take a moment.</p>
        </motion.div>
      )}
      {diagramSvg && !imageLoading && (
         <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           className={isZoomed ? "fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto" : "mb-8 relative rounded-3xl overflow-hidden shadow-2xl group bg-black p-6 flex flex-col items-center justify-center border border-white/10"}
         >
            <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-transparent to-transparent pointer-events-none"></div>
            <div className="w-full text-center mb-6 relative z-10">
               <span className="inline-block text-xs font-bold text-violet-300 tracking-wider bg-violet-900/40 px-4 py-2 rounded-lg border border-violet-500/30 group-hover:bg-violet-900/60 transition-colors">👆 HOVER OVER ANATOMICAL STRUCTURES TO LEARN</span>
            </div>
            <div 
              ref={svgContainerRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
              className={isZoomed ? "w-full flex-1 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-6xl [&>svg]:max-h-[85vh] [&>svg]:object-contain text-zinc-100" : "w-full max-w-2xl [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[600px] text-zinc-100 transition-transform duration-500 group-hover:scale-[1.02] relative z-10"}
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
            <div className={`absolute top-4 right-4 flex gap-3 ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300 z-20`}>
                <button onClick={() => setIsZoomed(!isZoomed)} className="glass-button text-zinc-100 font-medium px-4 py-2 rounded-lg shadow-lg text-sm z-10 relative">
                  {isZoomed ? '🔍 Minimize' : '🔍 Detailed View'}
                </button>
                <button onClick={() => { setDiagramSvg(''); setIsZoomed(false); }} className="glass-button text-rose-300 font-medium px-4 py-2 rounded-lg shadow-lg text-sm z-10 relative">Close</button>
            </div>
         </motion.div>
      )}

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 relative">
        <div className="absolute top-[20%] left-[20%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="glass-card p-8 rounded-3xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full pointer-events-none"></div>
          <h3 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex flex-col items-center justify-center mr-3 border border-indigo-500/30">🧠</div> Crucial Brodmann Areas
          </h3>
          <ul className="space-y-4">
            <li className="flex items-start bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
              <span className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 text-rose-300 text-xs font-bold px-3 py-1.5 rounded-lg mr-4 mt-0.5 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]">Area 4</span>
              <div>
                <span className="font-bold text-zinc-100 block text-base">Primary Motor Cortex</span>
                <span className="text-sm text-zinc-400 leading-relaxed">Precentral gyrus (Frontal lobe). Voluntary movement.</span>
              </div>
            </li>
            <li className="flex items-start bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
              <span className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 text-emerald-300 text-xs font-bold px-3 py-1.5 rounded-lg mr-4 mt-0.5 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">Areas 1,2,3</span>
              <div>
                <span className="font-bold text-zinc-100 block text-base">Primary Somatosensory Cortex</span>
                <span className="text-sm text-zinc-400 leading-relaxed">Postcentral gyrus (Parietal). Tactile & proprioceptive.</span>
              </div>
            </li>
            <li className="flex items-start bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
              <span className="bg-gradient-to-br from-violet-500/20 to-violet-600/20 text-violet-300 text-xs font-bold px-3 py-1.5 rounded-lg mr-4 mt-0.5 border border-violet-500/30 shadow-[0_0_10px_rgba(139,92,246,0.1)]">Area 17</span>
              <div>
                <span className="font-bold text-zinc-100 block text-base">Primary Visual Cortex</span>
                <span className="text-sm text-zinc-400 leading-relaxed">Calcarine sulcus (Occipital lobe).</span>
              </div>
            </li>
            <li className="flex items-start bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
              <span className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-lg mr-4 mt-0.5 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Areas 44,45</span>
              <div>
                <span className="font-bold text-zinc-100 block text-base">Broca's Area</span>
                <span className="text-sm text-zinc-400 leading-relaxed">Inferior frontal gyrus. Speech production.</span>
              </div>
            </li>
            <li className="flex items-start bg-white/5 p-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
              <span className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 text-blue-300 text-xs font-bold px-3 py-1.5 rounded-lg mr-4 mt-0.5 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]">Area 22</span>
              <div>
                <span className="font-bold text-zinc-100 block text-base">Wernicke's Area</span>
                <span className="text-sm text-zinc-400 leading-relaxed">Superior temporal gyrus. Speech comprehension.</span>
              </div>
            </li>
          </ul>
        </div>

        <div className="glass-card p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden group hover:border-indigo-500/20 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-2xl font-bold text-zinc-100 flex items-center">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex flex-col items-center justify-center mr-3 border border-indigo-500/30">🛡️</div> The Meninges
                </h3>
                <button onClick={() => generateAIDiagram('meninges')} disabled={imageLoading} className="text-sm glass-button bg-indigo-600/20 text-indigo-300 border-indigo-500/30 font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center shadow-lg"><span className="mr-2">🎨</span> Diagram</button>
            </div>
            <div className="space-y-4 relative z-10">
              <div className="pl-5 border-l-4 border-zinc-100 bg-white/5 p-4 rounded-r-xl">
                <h4 className="font-bold text-zinc-100 text-lg">1. Dura Mater (Superficial)</h4>
                <p className="text-sm text-zinc-400">Tough, fibrous outer layer. Contains Dural Venous Sinuses.</p>
              </div>
              <div className="pl-5 border-l-4 border-zinc-500 bg-white/5 p-4 rounded-r-xl">
                <h4 className="font-bold text-zinc-100 text-lg">2. Arachnoid Mater (Middle)</h4>
                <p className="text-sm text-zinc-400">Web-like. Subarachnoid space contains CSF and major vessels.</p>
              </div>
              <div className="pl-5 border-l-4 border-blue-500/50 bg-white/5 p-4 rounded-r-xl">
                <h4 className="font-bold text-zinc-100 text-lg">3. Pia Mater (Deep)</h4>
                <p className="text-sm text-zinc-400">Delicate, adheres faithfully to the brain's gyri and sulci.</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 relative z-10">
            <button onClick={() => generateAIContent('quiz')} disabled={loading} className="w-full glass-button bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30 font-bold py-3.5 px-4 rounded-xl text-md transition-all shadow-lg text-center disabled:opacity-50">✨ Generate Meninges & Cortex Quiz</button>
          </div>
        </div>
      </motion.div>
      
      {loading && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 mb-8 p-6 text-violet-400 font-medium flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 shadow-inner"
        >
          <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mr-3"></div> Generating AI response...
        </motion.div>
      )}
      {aiResponse && !loading && (
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ type: "spring", stiffness: 200, damping: 20 }}
           className="mt-4 mb-8 p-8 bg-violet-900/20 border border-violet-500/30 rounded-3xl text-base text-zinc-200 leading-relaxed shadow-inner backdrop-blur-md" 
           dangerouslySetInnerHTML={{__html: aiResponse}}
         />
      )}

      <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:border-blue-500/20 transition-colors">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-bl-[100px] pointer-events-none"></div>
        <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-2xl font-bold text-zinc-100 flex items-center">
               <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex flex-col items-center justify-center mr-3 border border-blue-500/30">💧</div> CSF Flow Pathway
            </h3>
            <button onClick={() => generateAIDiagram('csf')} disabled={imageLoading} className="text-sm glass-button bg-indigo-600/20 text-indigo-300 border-indigo-500/30 font-bold px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center shadow-lg"><span className="mr-2">🎨</span> Diagram</button>
        </div>
        <div className="flex flex-wrap items-center text-sm gap-3 pt-2 relative z-10">
          <span className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-grow text-center">1. Choroid Plexus</span>
          <span className="text-zinc-500 font-bold hidden sm:inline">&rarr;</span>
          <span className="bg-black/40 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 shadow-inner flex-grow text-center">2. Lateral Ventricles</span>
          <span className="text-zinc-500 font-bold hidden sm:inline">&rarr;</span>
          <span className="bg-black/40 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 shadow-inner flex-grow text-center">3. Foramen of Monro</span>
          <span className="text-zinc-500 font-bold hidden xl:inline">&rarr;</span>
          <span className="bg-black/40 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 shadow-inner flex-grow text-center">4. 3rd Ventricle</span>
          <span className="text-zinc-500 font-bold hidden sm:inline">&rarr;</span>
          <span className="bg-black/40 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 shadow-inner flex-grow text-center">5. Cerebral Aqueduct</span>
          <span className="text-zinc-500 font-bold hidden sm:inline">&rarr;</span>
          <span className="bg-black/40 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 shadow-inner flex-grow text-center">6. 4th Ventricle</span>
          <span className="text-zinc-500 font-bold hidden xl:inline">&rarr;</span>
          <span className="bg-black/40 text-zinc-300 px-4 py-3 rounded-xl border border-white/10 shadow-inner flex-grow text-center">7. Subarachnoid Space</span>
          <span className="text-zinc-500 font-bold hidden sm:inline">&rarr;</span>
          <span className="bg-gradient-to-br from-blue-600/20 to-cyan-600/20 border border-blue-500/30 text-blue-300 px-4 py-3 rounded-xl font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)] flex-grow text-center">8. Arachnoid Granulations</span>
        </div>
      </motion.div>
    </motion.div>
  );
}

