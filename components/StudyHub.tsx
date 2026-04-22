import React from 'react';
import { Brain, Activity, Zap, GraduationCap, ExternalLink } from 'lucide-react';
import { Tab } from '../types';

interface StudyHubProps {
  onNavigate: (tab: Tab) => void;
}

const StudyHub: React.FC<StudyHubProps> = ({ onNavigate }) => {
  const evidenceBasedProtocol = [
    {
      title: 'Active recall first',
      detail: 'Attempt questions before re-reading notes to strengthen retrieval pathways.',
      cadence: 'Every session',
    },
    {
      title: 'Spaced repetition',
      detail: 'Revisit weak topics at expanding intervals to improve long-term retention.',
      cadence: 'Day 1 → Day 3 → Day 7',
    },
    {
      title: 'Interleaving',
      detail: 'Alternate anatomy, electrophysiology, and mechanisms to improve transfer.',
      cadence: '2-3 topics per block',
    },
    {
      title: 'Error logging',
      detail: 'Track mistakes, trigger causes, and corrected rules for exam-day pattern recognition.',
      cadence: 'After every quiz',
    },
    {
      title: 'Dual coding',
      detail: 'Pair text explanations with labelled sketches or flow diagrams to improve memory cues.',
      cadence: '1 diagram per topic',
    },
    {
      title: 'Elaboration',
      detail: 'Ask “why” and “what if” questions to connect mechanisms with clinical findings.',
      cadence: '3 prompts per concept',
    },
    {
      title: 'Mixed difficulty blocks',
      detail: 'Blend easy and hard questions so confidence and challenge are trained together.',
      cadence: '70/30 easy-hard split',
    },
    {
      title: 'Teach-back check',
      detail: 'Explain a concept out loud in plain language to expose hidden gaps in understanding.',
      cadence: '2-minute recap each block',
    },
  ];

  const quickStartPlan = [
    {
      label: '30-minute rescue sprint',
      totalTime: '10 + 10 + 10 mins',
      steps: [
        'Open the Lab 5 workbook and complete one lesion localisation run without notes.',
        'Use the Electrophysiology Lab to narrate depolarisation, repolarisation, and refractory periods.',
        'Generate 5 AI questions on your weakest topic and explain each answer aloud.',
      ],
    },
    {
      label: '60-minute consolidation sprint',
      totalTime: '20 + 20 + 20 mins',
      steps: [
        'Run one workbook block, then write a one-page summary from memory before checking notes.',
        'Switch to Brain Atlas and identify 6 structures with one clinical correlate for each.',
        'Finish with 10 AI questions, then record every error in your correction log.',
      ],
    },
  ];

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
                href={`${import.meta.env.BASE_URL}workbooks/lab5-spinal-cord-workbook.html`}
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
              <p className="text-2xl font-bold text-slate-900">5</p>
              <p className="text-sm text-slate-500 mt-1">Interactive support tools</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">8</p>
              <p className="text-sm text-slate-500 mt-1">Quiz questions in Lab 5</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">Powered</p>
              <p className="text-sm text-slate-500 mt-1">Gemini 2.5 AI</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { title: 'Neuron Model', description: 'Review structures and function.', tab: Tab.NEURON_LAB, icon: Activity },
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

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Evidence-based study protocol</h3>
          <p className="text-sm text-slate-600 mt-2">
            Use these learning science principles to turn NeuroMind into a reliable exam system, not passive revision.
          </p>
          <div className="mt-5 grid sm:grid-cols-2 gap-4">
            {evidenceBasedProtocol.map((item) => (
              <div key={item.title} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.detail}</p>
                <p className="text-xs text-blue-700 font-semibold mt-3 uppercase tracking-wide">{item.cadence}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">High-yield sprint playbooks</h3>
          <p className="text-sm text-slate-600 mt-2">
            Pick a sprint length and execute it exactly to cover retrieval, mechanism understanding, and feedback.
          </p>
          <div className="mt-5 space-y-4">
            {quickStartPlan.map((plan) => (
              <div key={plan.label} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">{plan.label}</p>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-700">{plan.totalTime}</span>
                </div>
                <ol className="mt-3 space-y-2">
                  {plan.steps.map((step, index) => (
                    <li key={step} className="flex gap-2">
                      <span className="mt-0.5 h-5 w-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                        {index + 1}
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed">{step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate(Tab.ELECTRO)}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Start with electrophysiology lab
            </button>
            <button
              onClick={() => onNavigate(Tab.ANATOMY)}
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
            >
              Jump to brain atlas
            </button>
          </div>
        </article>
      </section>
    </div>
  );
};

export default StudyHub;
