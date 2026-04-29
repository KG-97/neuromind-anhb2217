import { useState } from 'react';
import { motion } from 'motion/react';

export default function Dashboard() {
  const [imagePrompt, setImagePrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState('');
  const [imageLoading, setImageLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setGeneratedImage('');
    
    try {
      const fullPrompt = `Create a highly detailed, textbook-quality medical illustration of the ${imagePrompt}. Ensure scientifically accurate neuroanatomical structures, soft clinical lighting, and a dark background with educational textbook styling.`;
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        alert('Failed to generate image.');
      }
    } catch (e) {
      alert('Error communicating with the generation server.');
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
      <motion.h2 variants={itemVariants} className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-400 mb-3 tracking-tight">NeuroMind</motion.h2>
      <motion.p variants={itemVariants} className="text-zinc-400 mb-8 text-lg leading-relaxed max-w-3xl">NeuroMind helps ANHB2217 students study faster with workbook-style revision, lesion logic, quick simulations, and AI explanations.</motion.p>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card p-8 rounded-2xl group hover:border-emerald-500/30 transition-colors flex flex-col justify-center">
          <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center"><span className="text-emerald-400 mr-3">🧠</span> Lab 5: Neuron Workbook</h3>
          <p className="text-sm text-zinc-300/80 leading-relaxed mb-6">Start here: This combined module walks you through the anatomy of a neuron and the basics of electrophysiology. Trigger an action potential to watch how voltage changes over time.</p>
          <button onClick={() => {
            const navEvent = new CustomEvent('navigate', { detail: 'neuron' });
            window.dispatchEvent(navEvent);
          }} className="self-start glass-button bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-100 px-6 py-3 rounded-xl font-bold transition-all border border-emerald-500/30">
            Open Lab 5 Workbook &rarr;
          </button>
        </div>

        <div className="glass-card p-8 rounded-2xl flex flex-col group hover:border-blue-500/30 transition-colors">
          <h3 className="text-xl font-bold text-zinc-100 mb-4 flex items-center"><span className="text-blue-400 mr-3">💬</span> Feedback (Soft Launch)</h3>
          <p className="text-sm text-zinc-300/80 mb-4">Help us improve the atlas before the public release. We want to know:</p>
          <ul className="text-sm text-zinc-400 space-y-2 mb-6 list-disc pl-5">
            <li>What confused you or slowed you down?</li>
            <li>Which part saved you time?</li>
            <li>What topic should be the next workbook?</li>
          </ul>
          <a href="mailto:feedback@neuromind.app?subject=ANHB2217%20Feedback" className="self-start glass-button bg-blue-600/20 hover:bg-blue-600/40 text-blue-100 px-6 py-3 rounded-xl font-bold transition-all border border-blue-500/30">
            Send Feedback
          </a>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-card p-8 rounded-2xl flex flex-col relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-blue-500 animate-gradient"></div>
        <h3 className="text-2xl font-bold text-zinc-100 mb-3 flex items-center"><span className="mr-3 text-fuchsia-400">🔬</span> Anatomical Image Generator</h3>
        <p className="text-zinc-400 mb-8 max-w-2xl text-base">Need a visual reference not found in the atlas? Enter a specific anatomical structure (e.g., "Cerebellar peduncles", "Circle of Willis") to generate a textbook-quality clinical illustration.</p>
        
        <div className="flex gap-4 mb-6">
          <input 
            type="text" 
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateImage(); }}
            placeholder="E.g. Hippocampus cross section..."
            className="flex-1 bg-zinc-950/80 backdrop-blur-md border border-white/10 text-zinc-100 px-5 py-4 rounded-xl focus:outline-none focus:border-violet-500/70 focus:ring-2 focus:ring-violet-500/20 transition-all placeholder:text-zinc-600 shadow-inner"
            disabled={imageLoading}
          />
          <button 
            onClick={handleGenerateImage}
            disabled={imageLoading || !imagePrompt.trim()}
            className="glass-button bg-violet-600/90 hover:bg-violet-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center border border-violet-500/50 disabled:border-white/5"
          >
            {imageLoading ? (
              <><span className="mr-2 animate-spin">⚕️</span> Generating...</>
            ) : 'Generate Image'}
          </button>
        </div>

        {imageLoading && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full aspect-video bg-zinc-950/50 rounded-xl border border-white/5 flex flex-col items-center justify-center text-zinc-400 shadow-inner backdrop-blur-sm relative overflow-hidden"
          >
             <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mb-4"></div>
             <p className="font-medium tracking-wide">Synthesizing High-Resolution Illustration...</p>
          </motion.div>
        )}

        {generatedImage && !imageLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black relative group mt-4"
          >
             <img src={generatedImage} alt={`AI Illustration of ${imagePrompt}`} referrerPolicy="no-referrer" className="w-full h-auto object-contain max-h-[600px] transition-transform duration-700 group-hover:scale-[1.02]" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                <div className="backdrop-blur-md bg-white/10 border border-white/20 py-2 px-4 rounded-lg">
                  <span className="text-zinc-100 text-sm font-semibold tracking-wide">Textbook illustration: <span className="text-violet-300">{imagePrompt}</span></span>
                </div>
             </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
