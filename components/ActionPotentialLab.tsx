import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Play, RotateCcw, Zap } from 'lucide-react';

const ActionPotentialLab: React.FC = () => {
  const [data, setData] = useState<{ time: number; mv: number }[]>([]);
  const [isStimulated, setIsStimulated] = useState(false);
  const [explanation, setExplanation] = useState("Neuron is at Resting Membrane Potential (-70mV). Permeable mainly to K+.");
  
  // Simulation constants
  const restingPot = -70;
  const threshold = -55;
  const peak = 30;
  const hyper = -85;

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
          if (frame > 20 && frame <= 25) setExplanation("Stimulus applied. Graded potential reaches Threshold (-55mV). Voltage-gated Na+ channels open.");
          else if (frame > 25 && frame <= 30) setExplanation("Depolarization Phase. Rapid Na+ influx makes the interior positive (+30mV).");
          else if (frame > 30 && frame <= 40) setExplanation("Repolarization Phase. Na+ channels inactivate. Voltage-gated K+ channels open, K+ rushes out.");
          else if (frame > 40 && frame <= 55) setExplanation("Hyperpolarization. K+ channels remain open, membrane potential dips below resting state (Relative Refractory Period).");
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
    setExplanation("Neuron is at Resting Membrane Potential (-70mV).");
    setIsStimulated(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Zap className="text-amber-500" /> Electrophysiology Lab
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={handleStimulate} 
              disabled={isStimulated}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${isStimulated ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              <Play size={16} /> Stimulate
            </button>
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full bg-slate-50 rounded-xl border border-slate-200 p-4 relative">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" hide />
              <YAxis domain={[-90, 40]} label={{ value: 'Membrane Potential (mV)', angle: -90, position: 'insideLeft' }} />
              <ReferenceLine y={-55} label="Threshold" stroke="red" strokeDasharray="3 3" />
              <ReferenceLine y={-70} label="Resting" stroke="green" strokeDasharray="3 3" />
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

      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-semibold text-blue-400 mb-4">Current State Analysis</h4>
          <div className="p-4 bg-slate-800 rounded-xl border border-slate-700 mb-6 min-h-[120px]">
             <p className="text-slate-200 leading-relaxed animate-pulse">
               {explanation}
             </p>
          </div>

          <h4 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Key Parameters</h4>
          <ul className="space-y-3">
            <li className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Resting Potential</span>
              <span className="font-mono text-green-400">-70 mV</span>
            </li>
            <li className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
              <span className="text-slate-400">Threshold</span>
              <span className="font-mono text-red-400">-55 mV</span>
            </li>
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
