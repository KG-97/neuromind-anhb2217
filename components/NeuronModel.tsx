import React, { useState } from 'react';
import { Info, Zap, Activity } from 'lucide-react';

const NeuronModel: React.FC = () => {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const parts = {
    dendrites: {
      title: "Dendrites",
      desc: "Branch-like extensions that receive chemical signals (neurotransmitters) from other neurons. They contain ligand-gated ion channels. The primary site for EPSPs and IPSPs integration."
    },
    soma: {
      title: "Soma (Cell Body)",
      desc: "Contains the nucleus and organelles (ER, Golgi). Responsible for protein synthesis (neurotransmitters/enzymes). Integrates incoming graded potentials."
    },
    axonHillock: {
      title: "Axon Hillock",
      desc: "The 'trigger zone' with a high density of voltage-gated Na+ channels. If the membrane potential reaches threshold (~-55mV) here, an action potential is fired."
    },
    axon: {
      title: "Axon",
      desc: "A long projection that conducts electrical impulses away from the soma. Can be myelinated or unmyelinated. Contains microtubules for axoplasmic transport."
    },
    myelin: {
      title: "Myelin Sheath",
      desc: "Fatty insulation formed by Schwann cells (PNS) or Oligodendrocytes (CNS). Increases conduction velocity via Saltatory Conduction."
    },
    nodes: {
      title: "Nodes of Ranvier",
      desc: "Gaps in the myelin sheath where voltage-gated Na+ and K+ channels are clustered. Action potentials 'jump' from node to node."
    },
    terminal: {
      title: "Synaptic Terminal",
      desc: "The end of the axon containing synaptic vesicles filled with neurotransmitter. Depolarization opens voltage-gated Ca2+ channels, triggering exocytosis."
    }
  };

  const handleSelect = (key: string) => setSelectedPart(key);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <h3 className="absolute top-4 left-4 text-xl font-bold text-slate-800 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Interactive Neuron Model
        </h3>
        <p className="absolute top-12 left-4 text-sm text-slate-500">Click the components to learn more.</p>
        
        {/* SVG Neuron Schematic */}
        <div className="w-full max-w-2xl aspect-video relative mt-12 select-none">
           <svg viewBox="0 0 800 400" className="w-full h-full drop-shadow-xl">
              {/* Axon */}
              <rect x="200" y="185" width="500" height="30" fill="#cbd5e1" rx="15" 
                    className="cursor-pointer hover:fill-blue-200 transition-colors"
                    onClick={() => handleSelect('axon')} />
              
              {/* Myelin Sheaths */}
              <g onClick={() => handleSelect('myelin')} className="cursor-pointer hover:opacity-80 transition-opacity">
                <rect x="220" y="175" width="80" height="50" fill="#fcd34d" rx="8" />
                <rect x="320" y="175" width="80" height="50" fill="#fcd34d" rx="8" />
                <rect x="420" y="175" width="80" height="50" fill="#fcd34d" rx="8" />
                <rect x="520" y="175" width="80" height="50" fill="#fcd34d" rx="8" />
              </g>

              {/* Nodes of Ranvier (The gaps) */}
              <g onClick={() => handleSelect('nodes')}>
                 <circle cx="310" cy="200" r="8" fill="transparent" className="cursor-pointer hover:stroke-red-500 hover:stroke-2" />
                 <circle cx="410" cy="200" r="8" fill="transparent" className="cursor-pointer hover:stroke-red-500 hover:stroke-2" />
                 <circle cx="510" cy="200" r="8" fill="transparent" className="cursor-pointer hover:stroke-red-500 hover:stroke-2" />
              </g>

              {/* Soma */}
              <circle cx="150" cy="200" r="60" fill="#3b82f6" 
                      className="cursor-pointer hover:fill-blue-500 transition-colors"
                      onClick={() => handleSelect('soma')} />
              <circle cx="150" cy="200" r="20" fill="#1e40af" pointerEvents="none" />

              {/* Dendrites */}
              <g stroke="#3b82f6" strokeWidth="8" strokeLinecap="round" 
                 className="cursor-pointer hover:stroke-blue-500 transition-colors"
                 onClick={() => handleSelect('dendrites')}>
                 <path d="M100 170 L50 120" />
                 <path d="M100 230 L50 280" />
                 <path d="M90 200 L30 200" />
                 <path d="M120 150 L80 100" />
                 <path d="M120 250 L80 300" />
              </g>

              {/* Axon Hillock */}
              <path d="M190 170 L220 185 L220 215 L190 230 Z" fill="#93c5fd" 
                    className="cursor-pointer hover:fill-blue-300 transition-colors"
                    onClick={() => handleSelect('axonHillock')} />

              {/* Synaptic Terminal */}
              <g transform="translate(680, 160)" 
                 className="cursor-pointer hover:fill-indigo-300 transition-colors"
                 onClick={() => handleSelect('terminal')}>
                <path d="M20 40 L60 10 L80 30" stroke="#64748b" strokeWidth="6" fill="none" />
                <circle cx="80" cy="30" r="15" fill="#64748b" />
                <path d="M20 40 L60 70 L80 50" stroke="#64748b" strokeWidth="6" fill="none" />
                <circle cx="80" cy="50" r="15" fill="#64748b" />
              </g>
           </svg>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col">
        {selectedPart && parts[selectedPart as keyof typeof parts] ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <Info size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">{parts[selectedPart as keyof typeof parts].title}</h2>
            </div>
            <p className="text-slate-600 leading-relaxed text-lg">
              {parts[selectedPart as keyof typeof parts].desc}
            </p>
            <div className="mt-8 p-4 bg-white rounded-xl border border-blue-100 shadow-sm">
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <Zap size={16} /> Key Concept
                </h4>
                <p className="text-sm text-slate-500">
                    Structure dictates function. The {parts[selectedPart as keyof typeof parts].title.toLowerCase()} is specialized to 
                    {selectedPart === 'myelin' ? ' insulate and speed up ' : selectedPart === 'dendrites' ? ' receive ' : ' transmit '} 
                    signals efficiently.
                </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center">
            <Activity size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Select a structure to begin analysis</p>
            <p className="text-sm mt-2">Click on the neuron diagram on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NeuronModel;
