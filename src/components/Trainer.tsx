import { useMemo, useState } from 'react';
import { useScores, type QuizKey } from '../hooks/useScores';

type Pair = { term: string; match: string; hint?: string };
type Deck = {
  key: QuizKey;
  label: string;
  emoji: string;
  leftHeader: string;
  rightHeader: string;
  pairs: Pair[];
};

const decks: Deck[] = [
  {
    key: 'cranial-nerves',
    label: 'Cranial Nerves',
    emoji: '⚡',
    leftHeader: 'Cranial nerve',
    rightHeader: 'Primary function',
    pairs: [
      { term: 'CN I — Olfactory',           match: 'Smell' },
      { term: 'CN II — Optic',              match: 'Vision' },
      { term: 'CN III — Oculomotor',        match: 'Most eye muscles + pupil constriction' },
      { term: 'CN IV — Trochlear',          match: 'Superior oblique (down & in)' },
      { term: 'CN V — Trigeminal',          match: 'Facial sensation + mastication' },
      { term: 'CN VI — Abducens',           match: 'Lateral rectus' },
      { term: 'CN VII — Facial',            match: 'Facial expression + ant 2/3 taste' },
      { term: 'CN VIII — Vestibulocochlear', match: 'Hearing & balance' },
      { term: 'CN IX — Glossopharyngeal',   match: 'Post 1/3 taste, swallowing, parotid' },
      { term: 'CN X — Vagus',               match: 'Parasympathetic to viscera, phonation' },
      { term: 'CN XI — Accessory',          match: 'SCM & trapezius' },
      { term: 'CN XII — Hypoglossal',       match: 'Tongue movement' },
    ],
  },
  {
    key: 'cn-fiber-types',
    label: 'CN Fibre Types',
    emoji: '🧪',
    leftHeader: 'Cranial nerve',
    rightHeader: 'Fibre type',
    pairs: [
      { term: 'CN I Olfactory',          match: 'Sensory' },
      { term: 'CN II Optic',             match: 'Sensory' },
      { term: 'CN III Oculomotor',       match: 'Motor' },
      { term: 'CN IV Trochlear',         match: 'Motor' },
      { term: 'CN V Trigeminal',         match: 'Both' },
      { term: 'CN VI Abducens',          match: 'Motor' },
      { term: 'CN VII Facial',           match: 'Both' },
      { term: 'CN VIII Vestibulocochlear', match: 'Sensory' },
      { term: 'CN IX Glossopharyngeal',  match: 'Both' },
      { term: 'CN X Vagus',              match: 'Both' },
      { term: 'CN XI Accessory',         match: 'Motor' },
      { term: 'CN XII Hypoglossal',      match: 'Motor' },
    ],
  },
  {
    key: 'tract-decussation',
    label: 'Tract Decussations',
    emoji: '🔀',
    leftHeader: 'Tract',
    rightHeader: 'Where it crosses',
    pairs: [
      { term: 'Dorsal Column–Medial Lemniscus', match: 'Medulla (internal arcuate fibres)' },
      { term: 'Spinothalamic (anterolateral)',  match: 'Spinal cord, 1–2 segments above entry' },
      { term: 'Lateral Corticospinal',          match: 'Medullary pyramids (~90% cross)' },
      { term: 'Anterior Corticospinal',         match: 'At the segment of synapse in cord' },
      { term: 'Spinocerebellar (dorsal)',       match: 'Does NOT decussate (stays ipsilateral)' },
    ],
  },
  {
    key: 'brainstem-levels',
    label: 'Brainstem Levels',
    emoji: '🧠',
    leftHeader: 'Cranial nerve',
    rightHeader: 'Level of origin',
    pairs: [
      { term: 'CN III, IV',   match: 'Midbrain' },
      { term: 'CN V',         match: 'Pons' },
      { term: 'CN VI, VII',   match: 'Pontomedullary junction' },
      { term: 'CN VIII',      match: 'Pontomedullary junction' },
      { term: 'CN IX, X, XII', match: 'Medulla' },
      { term: 'CN XI',        match: 'Medulla + upper cervical cord' },
    ],
  },
  {
    key: 'sense-pathways',
    label: 'Special-Sense Relays',
    emoji: '👁️',
    leftHeader: 'Modality',
    rightHeader: 'Thalamic relay',
    pairs: [
      { term: 'Vision',      match: 'Lateral Geniculate Nucleus (LGN)' },
      { term: 'Audition',    match: 'Medial Geniculate Body (MGB)' },
      { term: 'Somatosensory (body)', match: 'Ventral Posterolateral (VPL)' },
      { term: 'Taste & face sensation', match: 'Ventral Posteromedial (VPM)' },
      { term: 'Olfaction',   match: 'Bypasses thalamus initially' },
    ],
  },
  {
    key: 'cortical-surface',
    label: 'Cortical Surface',
    emoji: '🧠',
    leftHeader: 'Structure',
    rightHeader: 'Function',
    pairs: [
      { term: 'Frontal Lobe', match: 'Executive function, voluntary motor, language production' },
      { term: 'Parietal Lobe', match: 'Somatosensory integration, spatial awareness' },
      { term: 'Temporal Lobe', match: 'Auditory processing, memory, language comprehension' },
      { term: 'Occipital Lobe', match: 'Primary visual processing' },
      { term: 'Central Sulcus', match: 'Separates frontal and parietal lobes' },
      { term: 'Precentral Gyrus', match: 'Primary motor cortex (BA 4)' },
      { term: 'Postcentral Gyrus', match: 'Primary somatosensory cortex' },
      { term: 'Broca\'s Area', match: 'Speech production (inferior frontal gyrus)' },
      { term: 'Wernicke\'s Area', match: 'Language comprehension (superior temporal gyrus)' },
    ],
  },
  {
    key: 'dura-blood',
    label: 'Dura & Blood Supply',
    emoji: '🩸',
    leftHeader: 'Structure',
    rightHeader: 'Description / Territory',
    pairs: [
      { term: 'Dura Mater', match: 'Outermost tough meningeal layer' },
      { term: 'Arachnoid Mater', match: 'Middle layer, granulations reabsorb CSF' },
      { term: 'Pia Mater', match: 'Innermost delicate vascular layer' },
      { term: 'Anterior Cerebral Artery (ACA)', match: 'Medial frontal and parietal lobes' },
      { term: 'Middle Cerebral Artery (MCA)', match: 'Lateral frontal, parietal, temporal lobes' },
      { term: 'Posterior Cerebral Artery (PCA)', match: 'Occipital lobe, inferior temporal, thalamus' },
      { term: 'Basilar Artery', match: 'Pons, superior cerebellum, midbrain' },
    ],
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Status = Record<number, 'correct' | 'wrong' | 'pending'>;

export default function Trainer() {
  const [deckIdx, setDeckIdx] = useState(0);
  const deck = decks[deckIdx];
  const { record, scores } = useScores();

  const [version, setVersion] = useState(0); // bumped to reshuffle
  const [leftSelected, setLeftSelected] = useState<number | null>(null);
  const [rightSelected, setRightSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<Status>({});
  const [attempts, setAttempts] = useState(0);
  const [wrongs, setWrongs] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const shuffledRight = useMemo(() => shuffle(deck.pairs.map((p, i) => ({ ...p, originalIdx: i }))), [deckIdx, version]);

  const remaining = deck.pairs.length - Object.values(status).filter((s) => s === 'correct').length;
  const allCorrect = remaining === 0;
  const best = scores[deck.key]?.best;

  // When a full round finishes correctly, log the score
  const finishIfDone = (newStatus: Status) => {
    const correctCount = Object.values(newStatus).filter((s) => s === 'correct').length;
    if (correctCount === deck.pairs.length) {
      // Score = correct / (correct + wrongs). Min 50% floor so one miss doesn't tank.
      const totalAnswers = correctCount + wrongs;
      record(deck.key, correctCount, Math.max(totalAnswers, correctCount));
    }
  };

  const handleLeft = (i: number) => {
    if (status[i] === 'correct') return;
    setLeftSelected(i);
    if (rightSelected !== null) evaluate(i, rightSelected);
  };

  const handleRight = (rIdx: number) => {
    const originalIdx = shuffledRight[rIdx].originalIdx;
    if (Object.values(status).filter((s, idx) => s === 'correct' && idx === originalIdx).length > 0) return;
    setRightSelected(rIdx);
    if (leftSelected !== null) evaluate(leftSelected, rIdx);
  };

  const evaluate = (leftIdx: number, rIdx: number) => {
    const originalIdx = shuffledRight[rIdx].originalIdx;
    setAttempts((a) => a + 1);
    const ns = { ...status };
    if (leftIdx === originalIdx) {
      ns[leftIdx] = 'correct';
      setStatus(ns);
      finishIfDone(ns);
    } else {
      ns[leftIdx] = 'wrong';
      setStatus(ns);
      setWrongs((w) => w + 1);
      // clear the "wrong" flash after a moment
      setTimeout(() => {
        setStatus((s) => {
          if (s[leftIdx] === 'wrong') { const c = { ...s }; delete c[leftIdx]; return c; }
          return s;
        });
      }, 700);
    }
    setLeftSelected(null);
    setRightSelected(null);
  };

  const reset = () => {
    setVersion((v) => v + 1);
    setLeftSelected(null);
    setRightSelected(null);
    setStatus({});
    setAttempts(0);
    setWrongs(0);
    setRevealed(false);
  };

  const accuracy = attempts ? Math.round(((attempts - wrongs) / attempts) * 100) : 100;

  return (
    <div className="max-w-5xl mx-auto fade-in">
      <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
        <h2 className="text-3xl font-bold text-zinc-50">Labelling Trainer</h2>
        {typeof best === 'number' && (
          <div className="text-sm text-zinc-400 glass-card px-3 py-1.5 rounded-lg">
            Best on {deck.label}: <span className="font-semibold text-emerald-400">{best}%</span>
          </div>
        )}
      </div>
      <p className="text-zinc-400 mb-6">Click a term on the left, then its match on the right. Green = correct, red flash = try again. Scores record once you clear a deck; fewer wrongs = higher score.</p>

      <div className="flex gap-2 mb-5 flex-wrap">
        {decks.map((d, i) => (
          <button
            key={d.key}
            onClick={() => { setDeckIdx(i); reset(); }}
            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
              i === deckIdx ? 'glass-button bg-violet-500/20 text-violet-200 border-violet-500/40' : 'glass-button text-zinc-400'
            }`}
          >
            <span className="mr-1.5">{d.emoji}</span>{d.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-xl p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="text-sm text-zinc-400">
            <span className="mr-4">Remaining: <span className="text-zinc-100 font-semibold">{remaining}</span> / {deck.pairs.length}</span>
            <span className="mr-4">Attempts: <span className="text-zinc-100 font-semibold">{attempts}</span></span>
            <span>Accuracy: <span className={`font-semibold ${accuracy >= 80 ? 'text-emerald-400' : accuracy >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>{accuracy}%</span></span>
          </div>
          <div className="flex gap-2">
            <button onClick={reset} className="text-sm glass-button text-zinc-200 font-semibold px-3 py-1.5 rounded-lg border-none">Shuffle / Reset</button>
            <button onClick={() => setRevealed((r) => !r)} className="text-sm glass-button text-zinc-200 font-semibold px-3 py-1.5 rounded-lg border-none">{revealed ? 'Hide' : 'Reveal'} answers</button>
          </div>
        </div>

        {allCorrect && (
          <div className="mb-4 p-4 bg-emerald-900/20 border border-emerald-800/40 rounded-lg">
            <p className="text-emerald-300 font-semibold">Deck cleared — {attempts} attempts, {accuracy}% accuracy. Best saved to dashboard.</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{deck.leftHeader}</h4>
            <ul className="space-y-2">
              {deck.pairs.map((p, i) => {
                const s = status[i];
                const active = leftSelected === i;
                const done = s === 'correct';
                return (
                  <li key={i}>
                    <button
                      onClick={() => handleLeft(i)}
                      disabled={done}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        done
                          ? 'glass-button bg-emerald-500/20 text-emerald-200'
                          : s === 'wrong'
                            ? 'glass-button bg-rose-500/20 text-rose-100 animate-pulse'
                            : active
                              ? 'glass-button bg-violet-500/20 text-violet-100'
                              : 'glass-button text-zinc-200'
                      }`}
                    >
                      <span className="font-medium">{p.term}</span>
                      {revealed && <span className="block text-xs text-zinc-500 mt-0.5">→ {p.match}</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{deck.rightHeader}</h4>
            <ul className="space-y-2">
              {shuffledRight.map((p, rIdx) => {
                const done = status[p.originalIdx] === 'correct';
                const active = rightSelected === rIdx;
                return (
                  <li key={rIdx}>
                    <button
                      onClick={() => handleRight(rIdx)}
                      disabled={done}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
                        done
                          ? 'glass-button bg-emerald-500/20 text-emerald-200'
                          : active
                            ? 'glass-button bg-violet-500/20 text-violet-100'
                            : 'glass-button text-zinc-200'
                      }`}
                    >
                      {p.match}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
