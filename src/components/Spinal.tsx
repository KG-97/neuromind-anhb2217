import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { apiPost } from '../services/apiClient';

const tracts = {
  'dcml': { 
     n: 'Dorsal Column-Medial Lemniscus (DCML)', t: '3-Neuron Sensory (Ascending)', f: 'Fine touch, vibration, conscious proprioception.', d: 'Medulla (Internal Arcuate Fibers)', det: 'Contains Fasciculus Gracilis (lower limbs, medial) and Fasciculus Cuneatus (upper limbs, lateral).', tCol: 'emerald',
     steps: [
       { label: '1st Order Neuron', body: 'DRG → enters spinal cord ipsilaterally → ascends in dorsal column (fasciculus gracilis/cuneatus)', synapse: 'Medulla (nucleus gracilis/cuneatus)' },
       { label: '2nd Order Neuron', body: 'Decussates as internal arcuate fibres → becomes medial lemniscus → ascends through brainstem', synapse: 'Thalamus (VPL nucleus)' },
       { label: '3rd Order Neuron', body: 'Thalamocortical radiations → primary somatosensory cortex (postcentral gyrus)', synapse: 'Cortex (Areas 3,1,2)' }
     ]
  },
  'spinothalamic': { 
     n: 'Spinothalamic Tract (Anterolateral)', t: '3-Neuron Sensory (Ascending)', f: 'Pain, temperature, crude touch.', d: 'Spinal Cord (at level of entry)', det: 'Fibers cross in the anterior white commissure of the spinal cord immediately after entering.', tCol: 'emerald',
     steps: [
       { label: '1st Order Neuron', body: 'DRG → enters dorsal horn → ascends/descends 1-2 segments in Lissauer\'s tract', synapse: 'Dorsal Horn (Rexed laminae I, II, V)' },
       { label: '2nd Order Neuron', body: 'Decussates via anterior white commissure → ascends as spinothalamic tract contralaterally', synapse: 'Thalamus (VPL nucleus)' },
       { label: '3rd Order Neuron', body: 'Thalamocortical radiations → primary somatosensory cortex', synapse: 'Cortex (Areas 3,1,2)' }
     ]
  },
  'corticospinal': { 
     n: 'Corticospinal Tract (Lateral)', t: '2-Neuron Motor (Descending)', f: 'Voluntary skilled movement of extremities.', d: 'Medullary Pyramids (Lower Medulla)', det: 'Upper Motor Neurons synapse onto Lower Motor Neurons in the ventral horn of the spinal cord.', tCol: 'rose',
     steps: [
       { label: 'Upper Motor Neuron (UMN)', body: 'Primary motor cortex (Betz cells) → internal capsule → cerebral peduncle → pons → medullary pyramid', synapse: 'Ventral Horn (Spinal Cord)' },
       { label: 'Lower Motor Neuron (LMN)', body: 'Decussation at caudal medulla → lateral corticospinal tract → alpha motor neuron', synapse: 'Neuromuscular Junction (Muscle)' }
     ]
  }
};

export default function Spinal() {
  const [currentTractId, setCurrentTractId] = useState<keyof typeof tracts>('dcml');
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

  const data = tracts[currentTractId];

  const generateAIContent = async (type: string) => {
    setLoading(true);
    setAiResponse('');
    try {
      const tractName = data.n;
      let prompt = "";
      const sysInstruction = "You are an expert neuroanatomy professor teaching ANHB2217. Provide concise, accurate, and highly educational responses. Return ONLY raw HTML suitable to be placed inside a <div>. Do not use markdown code blocks like ```html. Use basic HTML tags like <strong>, <ul>, <li>, and <br>.";

      if (type === 'case') {
        prompt = `Create a short, realistic 2-sentence clinical vignette describing a patient with a lesion or issue affecting the ${tractName}. Then, ask the student a specific multiple-choice question about the expected symptoms or the anatomical localization. Put the correct answer and a brief educational explanation inside a <details><summary>Click for Answer</summary><div class="mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">...</div></details> tag.`;
      } else if (type === 'mnemonic') {
        prompt = `Create a memorable, slightly funny, and easy-to-remember mnemonic to help a neurobiology student remember the key functions, pathway, or anatomical details of the ${tractName}. Briefly explain how the mnemonic maps to the specific anatomy.`;
      }

      const result = await apiPost('/api/generate', { prompt, systemInstruction: sysInstruction });
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
    try {
      const tractName = data.n;
      const isAscending = data.t.includes('Ascending');
      const accentColor = data.tCol === 'emerald' ? '#10b981' : '#f43f5e';
      const sysInstruction = "You are an expert SVG graphics coder and neuroanatomy professor recording textbook figures. Output ONLY raw valid SVG code (starting with <svg> and ending with </svg>). Do not include markdown wraps or HTML beyond the SVG.";
      const prompt = `Create a highly educational, scalable SVG diagram of the human spinal cord ${tractName} pathway.
      REQUIREMENTS:
      1. Use a clear viewBox (e.g., "0 0 1000 1200") for high-resolution scaling. Ensure the root <svg> tag includes width="100%" height="100%" and NO fixed pixel boundaries.
      2. Dark mode color palette (dark grey/zinc backgrounds, white/light text). Provide intricate, high-fidelity textbook-level anatomical details for optimal detailed viewing.
      3. Draw detailed geometric representations of the Brain, Brainstem, and Spinal Cord sections.
      4. Illustrate the ${isAscending ? 'ascending (sensory)' : 'descending (motor)'} neural pathway using precise lines/arrows.
      5. Highlight the primary neural tract in bright ${accentColor}.
      6. Point out and label the location of decussation at the ${data.d}.
      7. **INTERACTIVITY (Crucial Requirement):** Wrap at least 4-5 key anatomical structures (e.g., decussation point, synapses, tracts, cortices) in <g class="interactive"> tags. Inside EACH of these <g> tags, put a <title> tag with a 1-2 sentence educational explanation of that structure so it appears as a tooltip on hover.
      8. Include an embedded <style> tag to add hover effects: .interactive { cursor: pointer; transition: all 0.2s; } .interactive:hover { filter: drop-shadow(0px 0px 8px ${accentColor}); opacity: 0.9; stroke-width: 3; }`;

      const result = await apiPost('/api/generate', { prompt, systemInstruction: sysInstruction });
      
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
      <motion.h2 variants={itemVariants} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-3 tracking-tight">Spinal Cord & Major Pathways</motion.h2>
      <motion.p variants={itemVariants} className="text-zinc-400 mb-8 text-lg leading-relaxed">This module allows you to explore the "Big Three" neural tracts. Click on a tract below to review its modality, crossing point (decussation), and neuronal pathway type. Recognizing these differences is key to diagnosing spinal cord lesions.</motion.p>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(tracts).map(([id, tData]) => (
          <button
            key={id}
            onClick={() => { setCurrentTractId(id as keyof typeof tracts); setAiResponse(''); setDiagramSvg(''); }}
            className={`font-bold py-6 px-6 rounded-3xl shadow-lg transition-all duration-300 text-left relative overflow-hidden group ${
              currentTractId === id ? `bg-${tData.tCol}-600/20 border-2 border-${tData.tCol}-500/50 text-${tData.tCol}-300 scale-[1.02]` : 'glass-card text-zinc-400 hover:bg-white/10 hover:border-white/20'
            }`}
          >
            <span className="block text-xl mb-1.5">{tData.n.split(' (')[0]}</span>
            <span className={`block text-xs font-bold uppercase tracking-wider ${currentTractId === id ? `text-${tData.tCol}-400` : 'text-zinc-500 group-hover:text-zinc-400'}`}>
              {tData.n.includes('(') ? tData.n.split('(')[1].replace(')', '') : ''}
            </span>
            {currentTractId === id && <div className={`absolute top-0 right-0 w-24 h-24 bg-${tData.tCol}-500/20 rounded-bl-full pointer-events-none blur-xl`}></div>}
          </button>
        ))}
      </motion.div>

      <motion.div variants={itemVariants} className="glass-panel p-8 rounded-3xl shadow-2xl min-h-[300px] flex flex-col relative overflow-hidden">
        <div className={`absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-${data.tCol}-600/10 rounded-full blur-[100px] pointer-events-none -z-10`}></div>
        <div className="flex-1 fade-in relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 mb-6 gap-4">
            <h3 className={`text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-${data.tCol}-300`}>{data.n}</h3>
            <span className={`px-4 py-1.5 bg-${data.tCol}-900/30 text-${data.tCol}-300 rounded-full text-sm font-bold w-max border border-${data.tCol}-500/30 shadow-lg backdrop-blur-md`}>{data.t}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Function</h4>
                <p className="text-zinc-100 text-lg font-medium leading-relaxed">{data.f}</p>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/5">
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Key Details</h4>
                <p className="text-zinc-300 leading-relaxed text-base">{data.det}</p>
              </div>
            </div>
            <div className={`bg-${data.tCol}-900/10 backdrop-blur-md p-6 rounded-2xl border border-${data.tCol}-500/20 flex flex-col justify-between shadow-inner`}>
              <div>
                <h4 className={`text-xs font-bold text-${data.tCol}-400/80 uppercase tracking-wider mb-3`}>Decussation (Crossing Point)</h4>
                <div className="flex items-center text-xl text-zinc-100 font-bold bg-black/30 p-4 rounded-xl border border-white/5">
                  <span className={`mr-3 text-${data.tCol}-400 text-2xl`}>🔀</span> <span>{data.d}</span>
                </div>
              </div>
              <button onClick={generateAIDiagram} disabled={imageLoading} className={`mt-6 w-full text-md glass-button bg-${data.tCol}-600/20 text-${data.tCol}-300 border-${data.tCol}-500/30 hover:bg-${data.tCol}-600/30 font-bold py-4 px-4 rounded-xl transition-all disabled:opacity-50 flex justify-center items-center shadow-lg`}>
                <span className="mr-2 text-xl">🎨</span> Generate Diagram
              </button>
            </div>
          </div>
          
          {/* Pathway Steps Section */}
          <div className="mt-8 pt-6 border-t border-white/10 fade-in">
            <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4">Pathway Progression</h4>
            <div className="flex flex-col gap-3">
               {data.steps.map((step, i) => (
                 <div key={i} className={`glass-card p-5 rounded-xl border-l-4 border-l-${data.tCol}-500 relative flex items-start gap-4 hover:bg-white/5 transition-colors`}>
                    <div className={`w-8 h-8 rounded-full bg-${data.tCol}-500/20 text-${data.tCol}-400 font-bold flex items-center justify-center shrink-0`}>{i + 1}</div>
                    <div>
                      <h5 className="font-bold text-zinc-100 text-lg">{step.label}</h5>
                      <p className="text-zinc-300 text-base mt-1">{step.body}</p>
                      {step.synapse && <p className={`text-sm mt-2 text-${data.tCol}-300 font-semibold`}><span className="mr-1">⚡</span> Synapses at: {step.synapse}</p>}
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Interactive SVG Display Area */}
        {imageLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 mb-4 p-10 bg-black/40 border border-white/5 rounded-2xl text-center flex flex-col items-center justify-center min-h-[300px] backdrop-blur-sm shadow-inner relative z-10"
          >
             <div className={`w-12 h-12 border-4 border-${data.tCol}-500/30 border-t-${data.tCol}-500 rounded-full animate-spin mb-4`}></div>
             <p className="text-zinc-300 font-medium">Generating Interactive AI Diagram... this may take a moment.</p>
          </motion.div>
        )}
        {diagramSvg && !imageLoading && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ type: "spring", stiffness: 200, damping: 20 }}
             className={isZoomed ? "fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto" : "mt-8 mb-4 relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group bg-black p-6 flex flex-col items-center justify-center z-10"}
           >
              <div className="w-full text-center mb-6">
                 <span className={`inline-block text-xs font-bold text-${data.tCol}-300 tracking-wider bg-${data.tCol}-900/40 px-4 py-2 rounded-lg border border-${data.tCol}-500/30`}>👆 HOVER OVER ANATOMICAL STRUCTURES TO LEARN</span>
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
                  className={`fixed z-[120] px-4 py-3 text-sm max-w-xs text-zinc-100 bg-zinc-900/90 border border-${data.tCol}-500/50 shadow-2xl rounded-xl pointer-events-none transform -translate-x-1/2 -translate-y-[calc(100%+16px)] backdrop-blur-md`}
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
        <div className="mt-8 pt-6 border-t border-white/5 flex gap-4 flex-wrap relative z-10">
          <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider self-center mr-2">AI Tutors:</span>
          <button onClick={() => generateAIContent('case')} disabled={loading} className="glass-button bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30 font-bold py-3 px-5 rounded-xl transition-all disabled:opacity-50">✨ Generate Clinical Case</button>
          <button onClick={() => generateAIContent('mnemonic')} disabled={loading} className="glass-button bg-violet-600/20 text-violet-300 border-violet-500/30 hover:bg-violet-600/30 font-bold py-3 px-5 rounded-xl transition-all disabled:opacity-50">✨ Create Mnemonic</button>
        </div>
        {/* AI Output */}
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-6 text-violet-400 font-medium flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 shadow-inner relative z-10"
          >
            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mr-3"></div> Generating AI response...
          </motion.div>
        )}
        {aiResponse && !loading && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ type: "spring", stiffness: 200, damping: 20 }}
             className="mt-6 p-8 bg-violet-900/20 border border-violet-500/30 rounded-3xl text-zinc-200 leading-relaxed shadow-inner backdrop-blur-md relative z-10 text-base" 
             dangerouslySetInnerHTML={{__html: aiResponse}}
           />
        )}
      </motion.div>
      
      <motion.div variants={itemVariants} className="mt-8 bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
        <h4 className="font-bold text-rose-400 text-lg mb-2 flex items-center"><span className="text-2xl mr-2">💡</span> Motor Lesion Pearl</h4>
        <p className="text-base text-rose-200/80 leading-relaxed"><strong>UMN (Upper Motor Neuron):</strong> Spasticity, hyperreflexia. <br className="sm:hidden"/> <strong>LMN (Lower Motor Neuron):</strong> Flaccid paralysis, atrophy, hyporeflexia.</p>
      </motion.div>
    </motion.div>
  );
}

