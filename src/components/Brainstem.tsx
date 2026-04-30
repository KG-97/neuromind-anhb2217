import { useMemo, useState } from 'react';
import { useProgress } from '../hooks/useProgress';
import { useScores } from '../hooks/useScores';
import { apiPost } from '../services/apiClient';

type Syndrome = {
  id: string;
  name: string;
  level: 'Midbrain' | 'Pons' | 'Medulla';
  vessel: string;
  structures: { struct: string; sign: string }[];
  signature: string;
  hook: string;
};

const syndromes: Syndrome[] = [
  {
    id: 'weber',
    name: "Weber Syndrome",
    level: 'Midbrain',
    vessel: 'Paramedian branches of PCA / basilar',
    structures: [
      { struct: 'CN III fascicles', sign: 'Ipsilateral "down & out" eye, ptosis, blown pupil' },
      { struct: 'Corticospinal tract (cerebral peduncle)', sign: 'Contralateral hemiparesis (face & body)' },
    ],
    signature: 'Ipsilateral CN III palsy + contralateral hemiparesis',
    hook: '"Weber walks funny" — peduncle lesion = ventral midbrain.',
  },
  {
    id: 'benedikt',
    name: 'Benedikt Syndrome',
    level: 'Midbrain',
    vessel: 'Paramedian branches of PCA',
    structures: [
      { struct: 'CN III fascicles', sign: 'Ipsilateral CN III palsy' },
      { struct: 'Red nucleus', sign: 'Contralateral cerebellar ataxia, tremor, chorea' },
    ],
    signature: 'Ipsilateral CN III palsy + contralateral ataxia/tremor',
    hook: 'Benedikt = red-nucleus involvement → "red shaky hand".',
  },
  {
    id: 'mllf',
    name: 'Medial Pontine (Foville/Medial Inferior Pontine) Syndrome',
    level: 'Pons',
    vessel: 'Paramedian branches of basilar',
    structures: [
      { struct: 'CN VI nucleus/fascicles', sign: 'Ipsilateral lateral rectus palsy (eye fails to abduct)' },
      { struct: 'CN VII (may involve)', sign: 'Ipsilateral LMN facial palsy (whole face)' },
      { struct: 'Corticospinal tract', sign: 'Contralateral hemiparesis' },
      { struct: 'Medial lemniscus', sign: 'Contralateral loss of vibration / proprioception' },
    ],
    signature: 'Ipsilateral CN VI (± VII) + contralateral hemiparesis & DCML loss',
    hook: 'Ventromedial pons = abducens + face + pyramid + lemniscus.',
  },
  {
    id: 'wallenberg',
    name: 'Lateral Medullary (Wallenberg) Syndrome',
    level: 'Medulla',
    vessel: 'PICA (Posterior Inferior Cerebellar Artery)',
    structures: [
      { struct: 'Spinothalamic tract', sign: 'Contralateral loss of pain/temp (body)' },
      { struct: 'Spinal trigeminal nucleus/tract', sign: 'Ipsilateral loss of pain/temp (face)' },
      { struct: 'Nucleus ambiguus (CN IX, X)', sign: 'Dysphagia, hoarseness, loss of gag' },
      { struct: 'Vestibular nuclei', sign: 'Vertigo, nystagmus, nausea' },
      { struct: 'Inferior cerebellar peduncle', sign: 'Ipsilateral ataxia' },
      { struct: 'Descending sympathetic fibres', sign: 'Ipsilateral Horner syndrome' },
    ],
    signature: '"Crossed" sensory loss (face ipsi, body contra) + bulbar + Horner + ataxia',
    hook: '"Don\'t Pick A (horny) Horse That Can\'t Eat" — PICA mnemonic.',
  },
  {
    id: 'medial-medullary',
    name: 'Medial Medullary (Déjerine) Syndrome',
    level: 'Medulla',
    vessel: 'Anterior spinal artery / vertebral paramedian branches',
    structures: [
      { struct: 'Pyramid (corticospinal)', sign: 'Contralateral hemiparesis (body, face spared)' },
      { struct: 'Medial lemniscus', sign: 'Contralateral loss of vibration / proprioception' },
      { struct: 'CN XII fibres/nucleus', sign: 'Ipsilateral tongue deviation TOWARD the lesion on protrusion' },
    ],
    signature: 'Contralateral hemiparesis + DCML loss + ipsilateral tongue deviation',
    hook: 'Three Ms on the midline: Motor, Medial lemniscus, Motor-tongue (XII).',
  },
];

type MCQ = {
  q: string;
  options: string[];
  correctIdx: number;
  explanation: string;
};

const localizationMCQs: MCQ[] = [
  {
    q: 'A 68-year-old woman with sudden vertigo, hoarseness, ipsilateral Horner sign, loss of pain/temperature on the right side of her face and the left side of her body. Where is the lesion and which vessel is occluded?',
    options: [
      'Medial medulla — anterior spinal artery',
      'Lateral medulla — PICA (right)',
      'Medial pons — paramedian basilar branches',
      'Midbrain tegmentum — PCA paramedian branches',
    ],
    correctIdx: 1,
    explanation: 'Crossed sensory loss (ipsi face, contra body) + bulbar + Horner + ataxia is Wallenberg (lateral medullary) syndrome, classically from PICA occlusion.',
  },
  {
    q: 'A patient has a down-and-out right eye with ptosis and a blown pupil, plus left-sided arm and leg weakness. Where is the lesion?',
    options: [
      'Right ventral midbrain (Weber) — right CN III fascicles + right cerebral peduncle',
      'Right dorsal pons (Foville)',
      'Left lateral medulla (Wallenberg)',
      'Left medial pons',
    ],
    correctIdx: 0,
    explanation: 'Ipsilateral CN III palsy + contralateral hemiparesis localises to the ventral midbrain — Weber syndrome.',
  },
  {
    q: 'A stroke causes contralateral hemiparesis (body only, face spared), contralateral loss of vibration and proprioception, and tongue deviation toward the side of the lesion. This is:',
    options: [
      'Wallenberg syndrome',
      'Weber syndrome',
      'Medial medullary (Déjerine) syndrome',
      'Benedikt syndrome',
    ],
    correctIdx: 2,
    explanation: 'The medial-medullary triad: corticospinal (body, face spared), medial lemniscus, CN XII (tongue deviates TOWARD lesion on protrusion).',
  },
  {
    q: 'Ipsilateral CN III palsy with contralateral ataxia, tremor, and chorea — the lesion is in the ______ and involves the ______.',
    options: [
      'Ventral midbrain; cerebral peduncle',
      'Paramedian midbrain tegmentum; red nucleus',
      'Lateral pons; middle cerebellar peduncle',
      'Medial medulla; pyramid',
    ],
    correctIdx: 1,
    explanation: 'Red-nucleus involvement distinguishes Benedikt from Weber — both have CN III palsy, but Benedikt adds contralateral ataxia/tremor/chorea.',
  },
  {
    q: 'Which finding would you NOT expect in lateral medullary (Wallenberg) syndrome?',
    options: [
      'Contralateral hemiparesis of the body',
      'Ipsilateral Horner syndrome',
      'Vertigo and nystagmus',
      'Ipsilateral loss of pain and temperature on the face',
    ],
    correctIdx: 0,
    explanation: 'The lateral medulla spares the pyramid (which is medial). Contralateral hemiparesis would instead point to medial medullary syndrome.',
  },
];

export default function Brainstem() {
  const progress = useProgress();
  const { record, scores } = useScores();

  const [mode, setMode] = useState<'reference' | 'quiz' | 'ai'>('reference');
  const [selected, setSelected] = useState<string>(syndromes[0].id);

  // Quiz state
  const [qIdx, setQIdx] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  // AI mystery case
  const [caseHtml, setCaseHtml] = useState('');
  const [loading, setLoading] = useState(false);

  const data = useMemo(() => syndromes.find((s) => s.id === selected)!, [selected]);
  const question = localizationMCQs[qIdx];
  const best = scores['brainstem-syndromes']?.best;

  const levelColor: Record<Syndrome['level'], string> = {
    Midbrain: 'bg-amber-900/20 text-amber-300 border-amber-800/30',
    Pons: 'bg-violet-900/20 text-violet-300 border-violet-800/30',
    Medulla: 'bg-rose-900/20 text-rose-300 border-rose-800/30',
  };

  const resetQuiz = () => { setQIdx(0); setChosen(null); setCorrect(0); setDone(false); };

  const submitAnswer = () => {
    if (chosen === null) return;
    const isRight = chosen === question.correctIdx;
    const newCorrect = correct + (isRight ? 1 : 0);
    if (qIdx === localizationMCQs.length - 1) {
      record('brainstem-syndromes', newCorrect, localizationMCQs.length);
      setCorrect(newCorrect);
      setDone(true);
    } else {
      setCorrect(newCorrect);
      setQIdx(qIdx + 1);
      setChosen(null);
    }
  };

  const genMysteryCase = async () => {
    setLoading(true);
    setCaseHtml('');
    try {
      const sysInstruction = "You are an expert neuroanatomy professor teaching ANHB2217. Return ONLY raw HTML for a <div>. No code fences. Use <strong>, <ul>, <li>, <br>, <details>, <summary>.";
      const prompt = `Generate a realistic "mystery" brainstem-stroke vignette for a medical/neuroscience student. Pick ONE of: Weber, Benedikt, medial pontine (Foville), Wallenberg (lateral medullary), or medial medullary (Déjerine). Write the 3-sentence case WITHOUT naming the syndrome. Then list 3 questions: (1) which cranial nerves / tracts are involved, (2) which arterial territory is occluded, (3) the eponymous syndrome name. Put the answers inside a <details><summary>Reveal answers</summary><div class="mt-2 p-3 bg-zinc-800 border border-zinc-700 rounded text-zinc-300">...</div></details> block.`;
      const result = await apiPost('/api/generate', { prompt, systemInstruction: sysInstruction });
      setCaseHtml(result.response);
    } catch {
      setCaseHtml('<div class="text-rose-500 font-medium">Error: Unable to reach the AI tutor right now.</div>');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <h2 className="text-3xl font-bold text-zinc-50">Brainstem &amp; Clinical Localisation</h2>
        <div className="text-sm text-zinc-400 glass-card px-3 py-1.5 rounded-lg">
          Syndromes studied: <span className="font-semibold text-violet-400">{progress.countWithPrefix('brainstem:')} / {syndromes.length}</span>
          {typeof best === 'number' && <span className="ml-3 text-zinc-500">Quiz best: <span className="text-emerald-400 font-semibold">{best}%</span></span>}
        </div>
      </div>
      <p className="text-zinc-400 mb-6">The brainstem packs motor, sensory, and cranial-nerve fibres into a tiny cross-section — lesions produce "crossed" signs that localise precisely. Use the reference to memorise each syndrome, then take the MCQ quiz or generate an AI mystery case to test yourself.</p>

      <div className="flex gap-2 mb-5 flex-wrap">
        {(['reference', 'quiz', 'ai'] as const).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); if (m === 'quiz') resetQuiz(); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              mode === m
                ? 'glass-button bg-violet-500/20 text-violet-300 border-violet-500/40'
                : 'glass-button text-zinc-400'
            }`}
          >
            {m === 'reference' ? '📖 Reference' : m === 'quiz' ? '🎯 Localisation Quiz' : '✨ AI Mystery Case'}
          </button>
        ))}
      </div>

      {mode === 'reference' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1 space-y-2">
            {syndromes.map((s) => {
              const active = selected === s.id;
              const studied = progress.has(`brainstem:${s.id}`);
              return (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${active ? 'glass-button bg-violet-500/20 border border-violet-500/50' : 'glass-button'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-zinc-100 text-sm">{s.name}</span>
                    {studied && <span className="text-xs text-emerald-400">✓</span>}
                  </div>
                  <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded border ${levelColor[s.level]}`}>{s.level}</span>
                </button>
              );
            })}
          </div>

          <div className="md:col-span-2 glass-panel p-6 rounded-xl">
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div>
                <h3 className="text-2xl font-bold text-zinc-50">{data.name}</h3>
                <p className="text-sm text-zinc-500 mt-1">Vessel: <span className="text-zinc-300">{data.vessel}</span></p>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded border ${levelColor[data.level]}`}>{data.level}</span>
            </div>

            <div className="mt-4 p-3 bg-violet-900/10 border border-violet-900/30 rounded-lg">
              <p className="text-sm text-violet-200"><strong>Signature sign:</strong> {data.signature}</p>
            </div>

            <h4 className="mt-5 text-sm font-bold text-zinc-500 uppercase tracking-wider mb-2">Damaged structures → signs</h4>
            <ul className="space-y-2">
              {data.structures.map((s) => (
                <li key={s.struct} className="flex gap-3 items-start glass-card rounded-lg p-3">
                  <span className="text-zinc-200 font-medium text-sm shrink-0 w-52 md:w-56">{s.struct}</span>
                  <span className="text-sm text-zinc-400">{s.sign}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 p-3 bg-amber-900/10 border border-amber-900/30 rounded-lg">
              <p className="text-sm text-amber-200"><strong>Memory hook:</strong> {data.hook}</p>
            </div>

            <label className="mt-5 inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-violet-500 w-4 h-4"
                checked={progress.has(`brainstem:${data.id}`)}
                onChange={() => progress.toggle(`brainstem:${data.id}`)}
              />
              <span className="text-sm text-zinc-300">Mark as studied</span>
            </label>
          </div>
        </div>
      )}

      {mode === 'quiz' && (
        <div className="glass-panel p-6 rounded-xl">
          {!done ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-zinc-500">Question {qIdx + 1} of {localizationMCQs.length}</span>
                <span className="text-sm text-zinc-500">Correct so far: <span className="text-emerald-400 font-semibold">{correct}</span></span>
              </div>
              <p className="text-zinc-100 text-lg mb-4">{question.q}</p>
              <div className="space-y-2">
                {question.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setChosen(i)}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm transition-colors ${
                      chosen === i
                        ? 'glass-button bg-violet-500/20 border border-violet-500/60 text-violet-100'
                        : 'glass-button text-zinc-300'
                    }`}
                  >
                    <span className="inline-block w-6 text-zinc-500 font-bold">{String.fromCharCode(65 + i)}.</span>
                    {opt}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  disabled={chosen === null}
                  onClick={submitAnswer}
                  className="bg-violet-500 hover:bg-violet-400 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-950 font-semibold px-5 py-2 rounded-lg transition-colors"
                >
                  {qIdx === localizationMCQs.length - 1 ? 'Finish' : 'Next →'}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-zinc-500 uppercase tracking-wider mb-2">Results</p>
              <p className="text-4xl font-bold text-zinc-50 mb-1">{correct} / {localizationMCQs.length}</p>
              <p className={`text-lg font-semibold ${correct / localizationMCQs.length >= 0.8 ? 'text-emerald-400' : correct / localizationMCQs.length >= 0.5 ? 'text-amber-400' : 'text-rose-400'}`}>
                {Math.round((correct / localizationMCQs.length) * 100)}%
              </p>
              <button onClick={resetQuiz} className="mt-6 glass-button text-zinc-100 font-semibold px-5 py-2 rounded-lg">Try again</button>
            </div>
          )}

          {/* Review answers */}
          <details className="mt-6">
            <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">Show all answers &amp; explanations</summary>
            <ol className="mt-3 space-y-3 list-decimal pl-5">
              {localizationMCQs.map((m, i) => (
                <li key={i} className="text-sm text-zinc-400">
                  <span className="block text-zinc-200 font-medium mb-1">{m.q}</span>
                  <span className="block text-emerald-400">✓ {m.options[m.correctIdx]}</span>
                  <span className="block text-zinc-500 mt-0.5">{m.explanation}</span>
                </li>
              ))}
            </ol>
          </details>
        </div>
      )}

      {mode === 'ai' && (
        <div className="glass-panel rounded-xl p-6">
          <p className="text-zinc-400 text-sm mb-4">Generate an unseen vignette. Diagnose it before revealing the answer.</p>
          <button
            onClick={genMysteryCase}
            disabled={loading}
            className="bg-violet-900/10 text-violet-300 border border-violet-900/30 hover:bg-violet-900/30 font-semibold py-3 px-5 rounded-lg transition-colors disabled:opacity-50"
          >
            <span className="mr-2">✨</span> Generate mystery case
          </button>
          {loading && <div className="mt-4 p-5 text-violet-400 font-medium"><span className="inline-block animate-spin mr-3 text-xl">⏳</span> Generating AI response…</div>}
          {caseHtml && !loading && (
            <div className="mt-5 p-5 bg-violet-900/10 border border-violet-900/20 rounded-xl text-sm text-zinc-200 leading-relaxed shadow-inner" dangerouslySetInnerHTML={{ __html: caseHtml }} />
          )}
        </div>
      )}
    </div>
  );
}
