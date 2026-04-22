import React from 'react';
import { Activity, Zap, BrainCircuit, ArrowRight } from 'lucide-react';
import NeuronModel from './NeuronModel';
import ActionPotentialLab from './ActionPotentialLab';

const NeuronLab: React.FC = () => {
  const learningGoals = [
    {
      icon: Activity,
      title: 'Map the neuron',
      detail: 'Identify dendrites, soma, axon hillock, axon, myelin, and terminals before you try to memorise the mechanisms.',
    },
    {
      icon: Zap,
      title: 'Trace the action potential',
      detail: 'Walk through depolarisation, repolarisation, hyperpolarisation, and refractory periods in sequence instead of learning them as loose trivia.',
    },
    {
      icon: BrainCircuit,
      title: 'Link structure to signalling',
      detail: 'Tie anatomy to ion movement and signal propagation so the model and the electrophysiology lab reinforce each other.',
    },
  ];

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
            <Activity size={14} />
            Neuron lab
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 leading-tight">
            Use one workflow for neuron structure and electrophysiology instead of bouncing between disconnected tabs.
          </h2>
          <p className="mt-4 text-slate-600 text-lg leading-relaxed">
            Start by orienting yourself to the parts of the neuron, then move straight into the action potential sequence while the anatomy is still fresh.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {learningGoals.map(({ icon: Icon, title, detail }) => (
            <div key={title} className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Part 1 — Neuron structure</h3>
            <p className="text-sm text-slate-600">Get the parts straight first so the signalling story has somewhere to live.</p>
          </div>
        </div>
        <NeuronModel />
      </section>

      <div className="flex items-center justify-center gap-2 text-slate-400">
        <ArrowRight size={18} />
        <span className="text-sm font-semibold uppercase tracking-[0.2em]">Then move to signalling</span>
        <ArrowRight size={18} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Zap size={20} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Part 2 — Electrophysiology</h3>
            <p className="text-sm text-slate-600">Replay the action potential with the neuron map still in your head.</p>
          </div>
        </div>
        <ActionPotentialLab />
      </section>
    </div>
  );
};

export default NeuronLab;
