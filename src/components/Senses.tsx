import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

const senses = {
  'vision': { t: 'Vision', r: 'Photoreceptors (Rods & Cones) &rarr; Bipolar &rarr; Ganglion', cn: 'CN II (Optic)', thal: 'Lateral Geniculate Nucleus (LGN)', cx: 'Primary Visual Cortex (Occipital)', p: 'Rods are for scotopic (night) vision. Cones are for color/acuity (fovea). Nasal retinal fibers cross at the Optic Chiasm; temporal fibers do not. Pupillary light reflex: Afferent=CN II, Efferent=CN III (Edinger-Westphal).' },
  'audition': { t: 'Audition (Hearing)', r: 'Hair cells in Organ of Corti (Cochlea)', cn: 'CN VIII (Vestibulocochlear)', thal: 'Medial Geniculate Body (MGB)', cx: 'Primary Auditory Cortex (Temporal)', p: 'Pathway Progression: 8th nerve &rarr; Cochlear nuclei (Medulla) &rarr; Superior Olivary nucleus &rarr; Inferior Colliculus (Midbrain) &rarr; MGB &rarr; Cortex.' },
  'vestibular': { t: 'Vestibular (Balance)', r: 'Maculae (Utricle/Saccule) & Crista (Semicircular canals)', cn: 'CN VIII (Vestibulocochlear)', thal: 'Ventral Posterior Nucleus', cx: 'Vestibular Cortex (Parietal/Insula)', p: 'Utricle detects horizontal linear acceleration. Saccule detects vertical linear acceleration (gravity). Crista ampullaris detects angular/rotational acceleration.' },
  'gustation': { t: 'Gustation (Taste)', r: 'Taste buds on tongue & epiglottis', cn: 'CN VII (ant 2/3), CN IX (post 1/3), CN X (epiglottis)', thal: 'Ventral Posteromedial (VPM)', cx: 'Gustatory Cortex (Insula & Postcentral gyrus)', p: 'Information travels from CNs VII, IX, and X to the Solitary Nucleus (nucleus tractus solitarius) in the medulla before heading to the VPM of the thalamus.' },
  'olfaction': { t: 'Olfaction (Smell)', r: 'Olfactory receptor neurons in nasal epithelium', cn: 'CN I (Olfactory)', thal: '<span class="text-zinc-500 italic">Bypasses Thalamus Initially</span>', cx: 'Primary Olfactory Cortex (Piriform)', p: 'Unique among special senses, olfactory pathways reach the cortex (via lateral olfactory stria) before relaying through the thalamus.' }
};

export default function Senses() {
  const [currentSenseId, setCurrentSenseId] = useState<keyof typeof senses>('vision');
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

  const data = senses[currentSenseId];

  const generateAIContent = async (type: string) => {
    setLoading(true);
    setAiResponse('');
    try {
      const senseName = `${data.t} pathway`;
      let prompt = "";
      const sysInstruction = "You are an expert neuroanatomy professor teaching ANHB2217. Provide concise, accurate, and highly educational responses. Return ONLY raw HTML suitable to be placed inside a <div>. Do not use markdown code blocks like ```html. Use basic HTML tags like <strong>, <ul>, <li>, and <br>.";

      if (type === 'mnemonic') {
        prompt = `Create a memorable, slightly funny, and easy-to-remember mnemonic to help a neurobiology student remember the key functions, pathway, or anatomical details of the ${senseName}. Briefly explain how the mnemonic maps to the specific anatomy.`;
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
      const sysInstruction = "You are an expert SVG graphics coder and neuroanatomy professor recording textbook figures. Output ONLY raw valid SVG code (starting with <svg> and ending with </svg>). Do not include markdown wraps or HTML beyond the SVG.";
      const prompt = `Create a highly educational, scalable SVG diagram of the human ${data.t} neural pathway.
      REQUIREMENTS:
      1. Use a clear viewBox (e.g., "0 0 1000 1200") for high-resolution scaling. Ensure the root <svg> tag includes width="100%" height="100%" and NO fixed pixel boundaries.
      2. Dark mode color palette (dark grey/zinc backgrounds, white/light text). Provide intricate, high-fidelity textbook-level anatomical details for optimal detailed viewing.
      3. Illustrate the neural signal pathway from the receptor (${data.r.replace(/<[^>]*>?/gm, '')}) through the Cranial Nerve ${data.cn}, to the Thalamus (${data.thal.replace(/<[^>]*>?/gm, '')}), and ending at the Cortex (${data.cx}). Use bright highlighting arrows to trace the path.
      4. **INTERACTIVITY (Crucial Requirement):** Wrap at least 4-5 key anatomical structures in <g class="interactive"> tags. Inside EACH of these <g> tags, put a <title> tag with a 1-2 sentence educational explanation of that structure so it appears as a tooltip on hover.
      5. Include an embedded <style> tag to add hover effects: .interactive { cursor: pointer; transition: all 0.2s; } .interactive:hover { filter: drop-shadow(0px 0px 8px #3b82f6); opacity: 0.9; stroke-width: 3; }`;

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

  const tabs = [
    { id: 'vision', label: '👁️ Vision' },
    { id: 'audition', label: '👂 Audition' },
    { id: 'vestibular', label: '⚖️ Vestibular' },
    { id: 'gustation', label: '👅 Gustation' },
    { id: 'olfaction', label: '👃 Olfaction' },
  ];

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
      <motion.h2 variants={itemVariants} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-3 tracking-tight">Special Senses & Pathways</motion.h2>
      <motion.p variants={itemVariants} className="text-zinc-400 mb-8 text-lg leading-relaxed">Interact with the tabs below to explore the core pathways of the special senses. Trace the signal from receptor to cortex. Use the AI tool to generate creative memorization strategies for these complex pathways.</motion.p>

      <motion.div variants={itemVariants} className="glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-white/5 group">
        <div className="absolute top-0 right-[20%] w-64 h-64 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
        <div className="flex border-b border-white/5 bg-black/40 overflow-x-auto custom-scrollbar relative z-10 backdrop-blur-md">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setCurrentSenseId(tab.id as keyof typeof senses); setAiResponse(''); setDiagramSvg(''); setIsZoomed(false); }}
              className={`px-8 py-5 text-sm font-bold whitespace-nowrap transition-all duration-300 border-b-2 flex-1 hover:bg-white/5 ${
                currentSenseId === tab.id 
                  ? 'border-b-violet-500 text-violet-300 bg-white/5 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' 
                  : 'border-b-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-8 md:p-10 fade-in flex-1 relative z-10">
          <div>
            <h3 className="text-3xl font-bold text-zinc-50 mb-8">{data.t}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-center relative z-10">
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors shadow-inner flex flex-col items-center justify-center">
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Receptor</span>
                <span className="font-bold text-zinc-100 text-lg" dangerouslySetInnerHTML={{__html: data.r}}></span>
              </div>
              <div className="flex items-center justify-center hidden md:flex text-zinc-600 text-2xl font-bold">&rarr;</div>
              <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors shadow-inner md:col-span-2 flex flex-col items-center justify-center">
                <span className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Cranial Nerve</span>
                <span className="font-bold text-zinc-100 text-lg">{data.cn}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-center relative z-10">
              <div className="bg-blue-600/10 p-6 rounded-2xl border border-blue-500/20 hover:bg-blue-600/20 transition-colors shadow-inner md:col-span-2 flex flex-col items-center justify-center">
                <span className="block text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">Thalamic Relay</span>
                <span className="font-bold text-blue-200 text-lg" dangerouslySetInnerHTML={{__html: data.thal}}></span>
              </div>
              <div className="flex items-center justify-center hidden md:flex text-blue-500/50 text-2xl font-bold">&rarr;</div>
              <div className="bg-emerald-600/10 p-6 rounded-2xl border border-emerald-500/20 hover:bg-emerald-600/20 transition-colors shadow-inner flex flex-col items-center justify-center">
                <span className="block text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">Cortex</span>
                <span className="font-bold text-emerald-200 text-lg">{data.cx}</span>
              </div>
            </div>

            {/* Interactive SVG Display Area for Senses */}
            {imageLoading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-8 p-10 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col items-center justify-center min-h-[350px] shadow-inner backdrop-blur-sm relative z-10"
              >
                 <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                 <p className="text-zinc-300 font-medium">Generating Interactive AI Diagram for {data.t}... this may take a moment.</p>
              </motion.div>
            )}
            {diagramSvg && !imageLoading && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
                 className={isZoomed ? "fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto" : "mb-8 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-black p-6 flex flex-col items-center justify-center z-10"}
               >
                  <div className="w-full text-center mb-6">
                     <span className="inline-block text-xs font-bold text-blue-300 tracking-wider bg-blue-900/40 px-4 py-2 rounded-lg border border-blue-500/30 shadow-lg">👆 HOVER OVER ANATOMICAL STRUCTURES TO LEARN</span>
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
                      className="fixed z-[120] px-4 py-3 text-sm max-w-xs text-zinc-100 bg-zinc-900/90 border border-blue-500/50 shadow-2xl rounded-xl pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+16px)] backdrop-blur-md"
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

            <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 rounded-r-2xl mb-8 shadow-inner relative z-10">
              <h4 className="font-bold text-amber-300 mb-2 text-lg">💡 High-Yield Pearls</h4>
              <p className="text-base text-amber-200/80 leading-relaxed font-medium">{data.p}</p>
            </div>
          </div>
          
          {/* AI Action Bar */}
          <div className="border-t border-white/5 pt-6 flex gap-4 flex-wrap relative z-10">
             <button onClick={() => generateAIContent('mnemonic')} disabled={loading} className="glass-button bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30 font-bold py-3.5 px-5 rounded-xl transition-all inline-flex items-center disabled:opacity-50 flex-1 md:flex-none justify-center">
                <span className="mr-2 text-lg">✨</span> Generate Memorization Mnemonic
            </button>
            <button onClick={generateAIDiagram} disabled={imageLoading} className="glass-button bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/30 font-bold py-3.5 px-5 rounded-xl transition-all inline-flex items-center disabled:opacity-50 flex-1 md:flex-none justify-center">
                <span className="mr-2 text-lg">🎨</span> Generate Interactive Diagram
            </button>
            {loading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-6 w-full text-violet-400 font-medium flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 shadow-inner"
              >
                <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mr-3"></div> Generating AI response...
              </motion.div>
            )}
            {aiResponse && !loading && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ type: "spring", stiffness: 200, damping: 20 }}
                 className="mt-6 p-8 w-full bg-violet-900/20 border border-violet-500/30 rounded-3xl text-zinc-200 leading-relaxed shadow-inner backdrop-blur-md text-base" 
                 dangerouslySetInnerHTML={{__html: aiResponse}}
               />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

