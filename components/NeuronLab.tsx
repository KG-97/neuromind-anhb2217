import React from 'react';
import { Activity, Target, Zap } from 'lucide-react';
import NeuronModel from './NeuronModel';
import ActionPotentialLab from './ActionPotentialLab';

const learningGoals = [
  {
    title: 'Identify core neuron structures',
    detail: 'Locate dendrites, soma, axon hillock, axon, myelin, nodes, and terminals.',
  },
  {
    title: 'Link structure to function',
    detail: 'Explain why each structure is specialized for receiving, integrating, or transmitting signals.',
  },
  {
    title: 'Connect anatomy to signaling',
    detail: 'Use structure knowledge to predict how membrane events build into an action potential.',
  },
];

const NeuronLab: React.FC = () => {
  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
          <Activity size={14} />
          Neuron lab
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 leading-tight">
          Explore neuron structure first, then simulate signaling behavior.
        </h2>
        <p className="mt-4 text-slate-600 text-lg leading-relaxed max-w-3xl">
          This guided lab combines anatomy and electrophysiology in one flow so you can move from naming parts to
          understanding how they produce an action potential.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {learningGoals.map((goal) => (
          <article key={goal.title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Target size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{goal.title}</h3>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">{goal.detail}</p>
          </article>
        ))}
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <NeuronModel />
      </section>

      <section className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 text-blue-300 font-semibold uppercase tracking-wide text-xs">
          <Zap size={14} />
          Transition
        </div>
        <h3 className="text-2xl font-bold mt-3">From structure to signaling</h3>
        <p className="text-slate-300 mt-3 leading-relaxed max-w-4xl">
          Once you can identify where signals are received, integrated, and propagated, the next step is to track the
          voltage changes that occur across the membrane. Use the lab below to map threshold, depolarization,
          repolarization, and hyperpolarization to the structures you just reviewed.
        </p>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <ActionPotentialLab />
      </section>
    </div>
  );
};

export default NeuronLab;
