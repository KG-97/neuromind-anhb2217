import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, RotateCcw, Zap } from 'lucide-react';

const ActionPotentialLab: React.FC = () => {
  const [data, setData] = useState<{ time: number; mv: number }[]>([]);
  const [isStimulated, setIsStimulated] = useState(false);
  const [explanation, setExplanation] = useState("Neuron is at Resting Membrane Potential. Permeable mainly to K+.");
  
  // Simulation controls
  const [restingPot, setRestingPot] = useState(-70);
  const [threshold, setThreshold] = useState(-55);
  const [peak, setPeak] = useState(30);

  // Derive hyper from resting
  const hyper = restingPot - 15;

  const generateData = () => {
    const points = [];
    // Resting
    for (let i = 0; i <= 20; i++) points.push({ time: i, mv: restingPot });
    // Depolarization
    for (let i = 21; i <= 25; i++) points.push({ time: i, mv: restingPot + ((threshold - restingPot) / 5) * (i - 20) });
    // Spike (Na+ influx)
    for (let i = 26; i <= 30; i++) points.push({ time: i, mv: threshold + ((peak - threshold) / 5) * (i - 25) });
    // Repolarization (K+ efflux)
    for (let i = 31; i <= 40; i++) points.push({ time: i, mv: peak - ((peak - hyper) / 10) * (i - 30) });
    // Hyperpolarization
    for (let i = 41; i <= 55; i++) points.push({ time: i, mv: hyper + ((restingPot - hyper) / 15) * (i - 40) });
    // Return to rest
    for (let i = 56; i <= 70; i++) points.push({ time: i, mv: restingPot });
    
    return points;
  };

  const fullSequence = useRef(generateData());

  useEffect(() => {
    fullSequence.current = generateData();
    if (!isStimulated) {
      setData(fullSequence.current.slice(0, 20));
    }
  }, [restingPot, threshold, peak]);

  useEffect(() => {
    // Initial state
    setData(fullSequence.current.slice(0, 20));
  }, []);

  useEffect(() => {
    if (isStimulated) {
      let frame = 20;
      const interval = setInterval(() => {
        frame++;
        if (frame <= 70) {
          setData(fullSequence.current.slice(0, frame));
          
          // Update explanation based on frame
          if (frame > 20 && frame <= 25) setExplanation(`Stimulus applied. Graded potential reaches Threshold (${threshold}mV). Voltage-gated Na+ channels open.`);
          else if (frame > 25 && frame <= 30) setExplanation(`Depolarization Phase. Rapid Na+ influx makes the interior positive (${peak}mV).`);
          else if (frame > 30 && frame <= 40) setExplanation("Repolarization Phase. Na+ channels inactivate. Voltage-gated K+ channels open, K+ rushes out.");
          else if (frame > 40 && frame <= 55) setExplanation("Hyperpolarization. K+ channels remain open, membrane potential dips below resting state.");
          else if (frame > 55) setExplanation("Return to Resting Potential via Na+/K+ Pump and leak channels.");
        } else {
          clearInterval(interval);
          setIsStimulated(false);
        }
      }, 50); // Speed of animation
      return () => clearInterval(interval);
    }
  }, [isStimulated]);

  const handleStimulate = () => {
    if (isStimulated) return;
    setData(fullSequence.current.slice(0, 20)); // Reset
    setIsStimulated(true);
  };

  const handleReset = () => {
    setData(fullSequence.current.slice(0, 20));
    setExplanation(`Neuron is at Resting Membrane Potential (${restingPot}mV).`);
    setIsStimulated(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-none">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-zinc-50 flex items-center gap-2">
            <Zap className="text-amber-500" /> Electrophysiology Lab
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handleStimulate} 
              disabled={isStimulated}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isStimulated ? 'glass-button opacity-50 cursor-not-allowed text-zinc-500 border-none' : 'glass-button text-violet-300 border-violet-500/50'}`}
            >
              <Play size={16} /> Stimulate
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium glass-button text-zinc-300 transition-colors border-none"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full glass-card rounded-xl p-4 relative border-none">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[-90, 40]} label={{ value: 'Membrane Potential (mV)', angle: -90, position: 'insideLeft' }} />
              <ReferenceLine x={21} label={{ value: 'Depolarization', position: 'top', fill: '#475569', fontSize: 11 }} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine x={30} label={{ value: 'Peak', position: 'top', fill: '#475569', fontSize: 11 }} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine x={40} label={{ value: 'Repolarization', position: 'top', fill: '#475569', fontSize: 11 }} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine x={55} label={{ value: 'Hyperpolarization', position: 'top', fill: '#475569', fontSize: 11 }} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine y={threshold} label="Threshold" stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={restingPot} label="Resting" stroke="green" strokeDasharray="3 3" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', color: '#fff', borderRadius: '8px', border: 'none' }}
                itemStyle={{ color: '#fff' }}
                formatter={(value: number) => [`${value.toFixed(1)} mV`, 'Voltage']}
              />
              <Line type="monotone" dataKey="mv" stroke="#3b82f6" strokeWidth={3} dot={false} animationDuration={0} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between border-none">
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-4">Current State Analysis</h4>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-6 min-h-[120px]">
             <p className="text-slate-200 leading-relaxed animate-pulse">
               {explanation}
             </p>
          </div>

          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Simulation Controls</h4>
          <div className="space-y-4 mb-6 p-4 glass-card rounded-xl">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-zinc-300">Resting Potential</label>
                <span className="font-mono text-green-400">{restingPot} mV</span>
              </div>
              <input 
                type="range" min="-90" max="-50" value={restingPot} 
                onChange={(e) => setRestingPot(Number(e.target.value))}
                disabled={isStimulated}
                className="w-full accent-green-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-zinc-300">Threshold</label>
                <span className="font-mono text-red-400">{threshold} mV</span>
              </div>
              <input 
                type="range" min="-65" max="-30" value={threshold} 
                onChange={(e) => setThreshold(Number(e.target.value))}
                disabled={isStimulated}
                className="w-full accent-red-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <label className="text-zinc-300">Peak Voltage (Na+ E)</label>
                <span className="font-mono text-blue-400">{peak} mV</span>
              </div>
              <input 
                type="range" min="10" max="60" value={peak} 
                onChange={(e) => setPeak(Number(e.target.value))}
                disabled={isStimulated}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Key Drivers</h4>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Depolarization Driver</span>
              <span className="text-blue-300">Na+ Influx</span>
            </li>
            <li className="flex justify-between items-center text-sm pb-2">
              <span className="text-slate-400">Repolarization Driver</span>
              <span className="text-amber-300">K+ Efflux</span>
            </li>
          </ul>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-700">
           <p className="text-xs text-slate-500 italic">
             Remember: The action potential is an "All-or-None" event. If threshold is not reached, no spike occurs.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ActionPotentialLab;
