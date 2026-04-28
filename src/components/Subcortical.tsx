import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';

const subcortical = {
  'basal-ganglia': {
    t: 'Basal Ganglia',
    desc: 'A collection of subcortical nuclei involved in voluntary motor control, procedural learning, and habit formation.',
    nuclei: [
      { n: 'Striatum', f: 'Caudate + Putamen. Input stage of BG (from cortex).', d: 'Dopamine D1/D2 receptors.' },
      { n: 'Globus Pallidus', f: 'External (GPe) and Internal (GPi) segments. GPi is the major output stage.', d: 'GPi inhibits the Thalamus.' },
      { n: 'Subthalamic Nucleus', f: 'Part of the Indirect Pathway. Excites the GPi.', d: 'Major target for Deep Brain Stimulation (DBS).' },
      { n: 'Substantia Nigra', f: 'Compacta (SNc) provides dopamine; Reticulata (SNr) is output-like.', d: 'SNc degeneration leads to Parkinson\'s.' }
    ],
    pearl: 'Direct Pathway = "Go" (disinhibits thalamus). Indirect Pathway = "No Go" (inhibits thalamus). Dopamine excites the Direct and inhibits the Indirect pathway, both increasing motor output.'
  },
  'internal-capsule': {
    t: 'Internal Capsule',
    desc: 'A massive bundle of white matter (projection fibers) passing between the thalamus and basal ganglia.',
    limbs: [
      { l: 'Anterior Limb', c: 'Frontopontine and Thalamocortical fibers (Prefrontal).', s: 'Emotion and executive function.' },
      { l: 'Genu', c: 'Corticobulbar fibers (Cranial Nerve motor nuclei).', s: 'Lesions cause contralateral face weakness (sparing forehead).' },
      { l: 'Posterior Limb', c: 'Corticospinal tract and Thalamocortical (Somatosensory).', s: 'MAJOR site for strokes (contralateral body weakness/numbness).' }
    ],
    pearl: 'A stroke in the posterior limb of the internal capsule is a common cause of "pure motor hemiparesis" because descending motor fibers are so tightly packed here.'
  },
  'cerebellum': {
    t: 'Cerebellum',
    desc: 'The "Little Brain" responsible for coordination, precision, and accurate timing of motor activity.',
    structures: [
      { n: 'Vermis', f: 'Axial/trunk coordination and posture.', d: 'Lesions cause trunkal ataxia.' },
      { n: 'Hemispheres', f: 'Limb coordination and planning of movement.', d: 'Lesions cause appendicular ataxia (ipsilateral).' },
      { n: 'Flocculonodular Lobe', f: 'Vestibular control and eye movements.', d: 'Lesions cause nystagmus and balance issues.' }
    ],
    pearl: 'Cerebellar signs are IPSILATERAL (unlike the cortex) because fibers "double cross" or stay on the same side.'
  },
  'limbic': {
    t: 'Limbic System',
    desc: 'The "Emotional Brain" — a set of structures involved in memory, emotion, and motivation.',
    nuclei: [
      { n: 'Hippocampus', f: 'Consolidation of short-term memory to long-term memory.', d: 'Affected early in Alzheimer\'s disease.' },
      { n: 'Amygdala', f: 'Processing of fear, emotion, and threat detection.', d: 'Klüver-Bucy syndrome results from bilateral destruction.' },
      { n: 'Cingulate Gyrus', f: 'Emotional processing and attention.', d: 'Part of the Papez Circuit.' }
    ],
    pearl: 'The Papez Circuit: Hippocampus → Fornix → Mammillary bodies → Ant. Thalamus → Cingulate Gyrus → Hippocampus.'
  }
};

export default function Subcortical({ initialId }: { initialId?: string }) {
  const [currentId, setCurrentId] = useState<keyof typeof subcortical>('basal-ganglia');

  useEffect(() => {
    if (initialId && subcortical[initialId as keyof typeof subcortical]) {
      setCurrentId(initialId as keyof typeof subcortical);
    }
  }, [initialId]);
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
      const interactiveElements = svgContainerRef.current.querySelectorAll('.interactive, g');
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

  const data = subcortical[currentId];

  const generateAIContent = async (type: string) => {
    setLoading(true);
    setAiResponse('');
    try {
      const topic = data.t;
      let prompt = "";
      const sysInstruction = "You are an expert neuroanatomy professor teaching ANHB2217. Provide concise, accurate, and highly educational responses. Return ONLY raw HTML suitable to be placed inside a <div>. Do not use markdown code blocks. Use basic HTML tags like <strong>, <ul>, <li>, and <br>.";

      if (type === 'mnemonic') {
        prompt = `Create a memorable, slightly funny, and easy-to-remember mnemonic to help a neurobiology student remember the key functions or structures of the ${topic}. Briefly explain how the mnemonic maps to the specific anatomy.`;
      } else if (type === 'vignette') {
        prompt = `Create a 2-sentence clinical vignette for a patient with a lesion in the ${topic}. Then ask a multiple-choice question. Put the answer in a <details> block.`;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction: sysInstruction }),
      });
      const result = await res.json();
      setAiResponse(result.response);
    } catch (e) {
      setAiResponse('<div class="text-rose-500 font-medium">Error: Unable to reach the AI tutor at this time.</div>');
    } finally {
      setLoading(false);
    }
  };

  const generateAIDiagram = async () => {
    setImageLoading(true);
    setDiagramSvg('');
    setIsZoomed(false);
    try {
      const sysInstruction = "You are an expert SVG graphics coder and neuroanatomy professor recording textbook figures. Output ONLY raw valid SVG code (starting with <svg> and ending with </svg>). Do not include markdown wraps.";
      const prompt = `Create a highly educational, scalable SVG diagram of the ${data.t} and its key connections.
      REQUIREMENTS:
      1. Use a clear viewBox (e.g., "0 0 1000 1000") for high-resolution scaling. Root <svg> should have width/height="100%".
      2. Dark mode color palette.
      3. **INTERACTIVITY:** Wrap at least 4 key structures in <g class="interactive"> tags. Inside each, add a <title> tag with an educational explanation.
      4. If topic is Basal Ganglia, show the Direct vs Indirect circuit with colored arrows.
      5. Include <style>.interactive { cursor: pointer; transition: all 0.2s; } .interactive:hover { filter: drop-shadow(0px 0px 8px #a855f7); opacity: 0.9; stroke-width: 3; }</style>`;

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
        alert('Failed to generate diagram.');
      }
    } catch (e) {
       alert('Error communicating with AI.');
    } finally {
      setImageLoading(false);
    }
  };

  const tabs = [
    { id: 'basal-ganglia', label: 'Basal Ganglia' },
    { id: 'internal-capsule', label: 'Internal Capsule' },
    { id: 'cerebellum', label: 'Cerebellum' },
    { id: 'limbic', label: 'Limbic System' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      <motion.h2 variants={itemVariants} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-3 tracking-tight">Internal Structures & Motor Systems</motion.h2>
      <motion.p variants={itemVariants} className="text-zinc-400 mb-8 text-lg leading-relaxed">Explore the deep subcortical nuclei, the coordination centers of the cerebellum, and the emotional circuitry of the limbic system. These structures are the "software" that modulates the "hardware" of the cortex.</motion.p>

      <motion.div variants={itemVariants} className="glass-panel rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-white/5">
        <div className="flex border-b border-white/5 bg-black/40 overflow-x-auto custom-scrollbar relative z-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setCurrentId(tab.id as keyof typeof subcortical); setAiResponse(''); setDiagramSvg(''); setIsZoomed(false); }}
              className={`px-8 py-5 text-sm font-bold whitespace-nowrap transition-all duration-300 border-b-2 flex-1 hover:bg-white/5 ${
                currentId === tab.id 
                  ? 'border-b-purple-500 text-purple-300 bg-white/5 shadow-[inset_0_-4px_10px_rgba(168,85,247,0.1)]' 
                  : 'border-b-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="p-8 md:p-10 flex-1 relative z-10">
          <h3 className="text-3xl font-bold text-zinc-50 mb-4">{data.t}</h3>
          <p className="text-zinc-400 mb-8 text-lg leading-relaxed">{data.desc}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentId === 'internal-capsule' ? (
              (data as any).limbs.map((limb: any, i: number) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors shadow-inner">
                  <h4 className="font-bold text-purple-300 mb-2 text-xl">{limb.l}</h4>
                  <p className="text-zinc-100 font-medium mb-2 text-base">{limb.c}</p>
                  <p className="text-zinc-400 text-sm italic">{limb.s}</p>
                </div>
              ))
            ) : (
              (data as any).nuclei ? (data as any).nuclei.map((item: any, i: number) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors shadow-inner">
                  <h4 className="font-bold text-purple-300 mb-2 text-xl">{item.n}</h4>
                  <p className="text-zinc-100 font-medium mb-1 text-base">{item.f}</p>
                  <p className="text-zinc-400 text-sm italic">{item.d}</p>
                </div>
              )) : (data as any).structures.map((item: any, i: number) => (
                <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors shadow-inner">
                  <h4 className="font-bold text-purple-300 mb-2 text-xl">{item.n}</h4>
                  <p className="text-zinc-100 font-medium mb-1 text-base">{item.f}</p>
                  <p className="text-zinc-400 text-sm italic">{item.d}</p>
                </div>
              ))
            )}
          </div>

          <div className="bg-purple-500/10 border-l-4 border-purple-500 p-6 rounded-r-2xl mb-8 shadow-inner">
            <h4 className="font-bold text-purple-300 mb-2 text-lg flex items-center">
              <span className="mr-2">💡</span> Clinical Pearl
            </h4>
            <p className="text-base text-purple-200/80 leading-relaxed font-medium">{data.pearl}</p>
          </div>

          {/* Interactive SVG Display */}
          {imageLoading && (
            <div className="mb-8 p-10 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col items-center justify-center min-h-[350px]">
               <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
               <p className="text-zinc-300">Generating Interactive AI Diagram for {data.t}...</p>
            </div>
          )}
          {diagramSvg && !imageLoading && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               className={isZoomed ? "fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 overflow-y-auto" : "mb-8 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black p-6 flex flex-col items-center justify-center z-10 group"}
             >
                <div className="w-full text-center mb-6">
                   <span className="inline-block text-xs font-bold text-purple-300 tracking-wider bg-purple-900/40 px-4 py-2 rounded-lg border border-purple-500/30">👆 HOVER TO LEARN</span>
                </div>
                <div 
                  ref={svgContainerRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setTooltip(prev => ({ ...prev, show: false }))}
                  className={isZoomed ? "w-full flex-1 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-6xl [&>svg]:max-h-[85vh] [&>svg]:object-contain" : "w-full max-w-2xl [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[600px] transition-transform duration-500 group-hover:scale-[1.02]"}
                  dangerouslySetInnerHTML={{ __html: diagramSvg }} 
                />
                {tooltip.show && (
                  <div 
                    className="fixed z-[120] px-4 py-3 text-sm max-w-xs text-zinc-100 bg-zinc-900/90 border border-purple-500/50 shadow-2xl rounded-xl pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+16px)] backdrop-blur-md"
                    style={{ left: tooltip.x, top: tooltip.y }}
                  >
                    {tooltip.text}
                  </div>
                )}
                <div className={`absolute top-4 right-4 flex gap-3 ${isZoomed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity duration-300`}>
                    <button onClick={() => setIsZoomed(!isZoomed)} className="glass-button text-zinc-100 text-sm px-4 py-2 rounded-lg">{isZoomed ? '🔍 Minimize' : '🔍 Detailed View'}</button>
                    <button onClick={() => { setDiagramSvg(''); setIsZoomed(false); }} className="glass-button text-rose-300 text-sm px-4 py-2 rounded-lg">Close</button>
                </div>
             </motion.div>
          )}

          <div className="border-t border-white/5 pt-6 flex gap-4 flex-wrap relative z-10">
             <button onClick={() => generateAIContent('mnemonic')} disabled={loading} className="glass-button bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30 font-bold py-3.5 px-5 rounded-xl transition-all disabled:opacity-50 flex-1 md:flex-none">
                ✨ Generate Mnemonic
            </button>
            <button onClick={() => generateAIContent('vignette')} disabled={loading} className="glass-button bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30 font-bold py-3.5 px-5 rounded-xl transition-all disabled:opacity-50 flex-1 md:flex-none">
                ✨ Clinical Quiz
            </button>
            <button onClick={generateAIDiagram} disabled={imageLoading} className="glass-button bg-purple-600/20 text-purple-300 border-purple-500/30 hover:bg-purple-600/30 font-bold py-3.5 px-5 rounded-xl transition-all disabled:opacity-50 flex-1 md:flex-none">
                🎨 Generate Diagram
            </button>
            {loading && (
              <div className="mt-6 p-6 w-full text-purple-400 font-medium flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 shadow-inner">
                <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mr-3"></div> Generating AI...
              </div>
            )}
            {aiResponse && !loading && (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="mt-6 p-8 w-full bg-purple-900/20 border border-purple-500/30 rounded-3xl text-zinc-200 leading-relaxed shadow-inner backdrop-blur-md" 
                 dangerouslySetInnerHTML={{__html: aiResponse}}
               />
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
