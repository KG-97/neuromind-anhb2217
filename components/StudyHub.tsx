import React from 'react';
import { Brain, Activity, Zap, GraduationCap, ExternalLink } from 'lucide-react';
import { Tab } from '../types';

interface StudyHubProps {
  onNavigate: (tab: Tab) => void;
}

const StudyHub: React.FC<StudyHubProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
              <Brain size={14} />
              Workbook-first launch
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 leading-tight">
              Start with the spinal cord workbook, then use the tools to clean up weak spots.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              NeuroMind works best as a study hub, not a random pile of tabs. The fastest path is simple:
              workbook first, simulations second, AI help third.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/workbooks/lab5-spinal-cord-workbook.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                Open Lab 5 workbook
                <ExternalLink size={16} />
              </a>
              <button
                onClick={() => onNavigate(Tab.TUTOR)}
                className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-5 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors"
              >
                Open AI tutor
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 min-w-[260px]">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">1</p>
              <p className="text-sm text-slate-500 mt-1">Workbook ready to use</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">4</p>
              <p className="text-sm text-slate-500 mt-1">Interactive support tools</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">8</p>
              <p className="text-sm text-slate-500 mt-1">Quiz questions in Lab 5</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">1</p>
              <p className="text-sm text-slate-500 mt-1">Env path to configure</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: 'Neuron Model', description: 'Review structures and function.', tab: Tab.NEURON, icon: Activity },
          { title: 'Electrophysiology Lab', description: 'Replay the action potential sequence.', tab: Tab.ELECTRO, icon: Zap },
          { title: 'Brain Atlas', description: 'Revise anatomy and clinical correlates.', tab: Tab.ANATOMY, icon: Brain },
          { title: 'AI Tutor', description: 'Generate a question or explain a concept.', tab: Tab.TUTOR, icon: GraduationCap },
        ].map(({ title, description, tab, icon: Icon }) => (
          <article key={title} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
              <Icon size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="text-slate-600 mt-2 text-sm leading-relaxed">{description}</p>
            <button
              onClick={() => onNavigate(tab)}
              className="mt-5 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Open module
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default StudyHub;
