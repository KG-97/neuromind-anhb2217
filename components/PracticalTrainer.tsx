import React, { useEffect, useMemo, useReducer, useState } from 'react';
import { BookOpen, Brain, CheckCircle, ExternalLink, ListChecks, Map, Moon, RotateCcw, ShieldQuestion, Sun } from 'lucide-react';
import { practicalCranialNerves, practicalPathways, practicalQuestionBank, practicalStations } from '../app/practicalTrainerData';
import { primaryWorkbook } from '../app/workbooks';
import { computeDueDate, emptyProgress, isDue, loadProgress, ONBOARDING_KEY, saveProgress, THEME_KEY } from './practical/storage';
import { ClinicalVignette, Flashcard, Mode, PracticalProgress, StationRating, ThemeMode } from './practical/types';

const vignettes: ClinicalVignette[] = [
  { id: 'dcml', prompt: 'Loss of vibration and proprioception in right leg below T8 after hemicord injury. Localize lesion.', answer: 'Right dorsal column in spinal cord at/above T8 (ipsilateral DCML deficit before medullary decussation).', hint: 'Think where DCML crosses.' },
  { id: 'spinothalamic', prompt: 'Pain/temperature loss on left body with right-sided cord lesion. Why?', answer: 'Spinothalamic fibers cross within 1–2 segments, so right lesion gives contralateral left pain/temp loss.', hint: 'Crossing happens early in spinal cord.' },
];
const flashcards: Flashcard[] = practicalPathways.map((pathway) => ({ id: pathway.name, front: pathway.name, back: pathway.logic, topic: pathway.modality }));

const qid = (i: number) => `q-${i}`;

type Action =
  | { type: 'toggleTarget'; id: string }
  | { type: 'rateStation'; stationId: string; rating: StationRating }
  | { type: 'answerQuestion'; qid: string; correct: boolean }
  | { type: 'checkIn' }
  | { type: 'reset' };

function reducer(state: PracticalProgress, action: Action): PracticalProgress {
  switch (action.type) {
    case 'toggleTarget': return { ...state, targetChecks: { ...state.targetChecks, [action.id]: !state.targetChecks[action.id] } };
    case 'rateStation': return { ...state, stationRatings: { ...state.stationRatings, [action.stationId]: action.rating } };
    case 'answerQuestion': {
      const prev = state.questionStats[action.qid] ?? { attempts: 0, correct: 0, wrong: 0, leitnerBox: 1 as const, dueDate: computeDueDate(1) };
      const nextBox = action.correct ? Math.min(5, prev.leitnerBox + 1) : 1;
      return { ...state, questionStats: { ...state.questionStats, [action.qid]: { attempts: prev.attempts + 1, correct: prev.correct + (action.correct ? 1 : 0), wrong: prev.wrong + (action.correct ? 0 : 1), leitnerBox: nextBox as 1|2|3|4|5, lastSeenAt: new Date().toISOString(), dueDate: computeDueDate(nextBox) } } };
    }
    case 'checkIn': {
      const today = new Date().toISOString().slice(0, 10);
      if (state.streak.lastCheckIn === today) return state;
      return { ...state, streak: { lastCheckIn: today, days: state.streak.days + 1 } };
    }
    case 'reset': return emptyProgress;
    default: return state;
  }
}

const PracticalTrainer: React.FC = () => {
  const [mode, setMode] = useState<Mode>('dashboard');
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem(THEME_KEY) as ThemeMode) || 'light');
  const [progress, dispatch] = useReducer(reducer, undefined, loadProgress);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [tourOpen, setTourOpen] = useState(() => !localStorage.getItem(ONBOARDING_KEY));
  const [flipped, setFlipped] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem(THEME_KEY, theme); }, [theme]);
  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'q') setMode('quiz');
      if (event.key === 's') setMode('stations');
      if (event.key === 'n') setQuestionIndex((i) => (i + 1) % practicalQuestionBank.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const stats = useMemo(() => {
    const totalTargets = practicalStations.reduce((sum, station) => sum + station.targets.length, 0);
    const checkedTargets = Object.values(progress.targetChecks).filter(Boolean).length;
    const questionStats = Object.values(progress.questionStats) as Array<{attempts:number;correct:number;wrong:number;dueDate:string}>;
    const attempts = questionStats.reduce((sum, stat) => sum + stat.attempts, 0);
    const correct = questionStats.reduce((sum, stat) => sum + stat.correct, 0);
    const weakAreas = questionStats.filter((s) => s.wrong > s.correct).length;
    const dueQuestions = questionStats.filter((s) => isDue(s.dueDate)).length;
    return { totalTargets, checkedTargets, attempts, accuracy: attempts ? Math.round((correct / attempts) * 100) : 0, weakAreas, dueQuestions, completion: Math.round((checkedTargets / Math.max(1, totalTargets)) * 100) };
  }, [progress]);

  const question = practicalQuestionBank[questionIndex % practicalQuestionBank.length];
  const card = flashcards[questionIndex % flashcards.length];

  return <div className="space-y-6 transition-all duration-300">
    {tourOpen && <div className="rounded-xl border p-4 bg-blue-50" role="dialog" aria-label="Onboarding">
      <h3 className="font-bold">Welcome to NeuroMind practical trainer</h3><p className="text-sm">Shortcuts: <b>S</b> stations, <b>Q</b> quiz, <b>N</b> next question.</p>
      <button className="mt-2 rounded bg-blue-600 text-white px-3 py-1" onClick={() => { localStorage.setItem(ONBOARDING_KEY, 'done'); setTourOpen(false); }}>Got it</button></div>}
    <section className="flex flex-wrap gap-2 items-center justify-between">
      <div className='flex gap-2'>{(['dashboard','stations','quiz','pathways','cranial','flashcards','lesions'] as Mode[]).map((m) => <button key={m} onClick={() => setMode(m)} className="px-3 py-2 rounded border">{m}</button>)}</div>
      <button aria-label="Toggle theme" onClick={() => setTheme(theme === 'light' ? 'dark' : theme === 'dark' ? 'high-contrast' : 'light')} className='px-3 py-2 rounded border inline-flex items-center gap-2'>{theme === 'light' ? <Moon size={15}/> : <Sun size={15}/>} {theme}</button>
    </section>

    {mode === 'dashboard' && <section className='grid md:grid-cols-4 gap-3 animate-pulse'>
      <div className='border rounded p-3'>Completion {stats.completion}%</div><div className='border rounded p-3'>Accuracy {stats.accuracy}%</div><div className='border rounded p-3'>Due SRS {stats.dueQuestions}</div><div className='border rounded p-3'>Streak {progress.streak.days} days <button onClick={() => dispatch({ type: 'checkIn' })} className='ml-2 underline'>Check-in</button></div>
    </section>}

    {mode === 'quiz' && <section className='border rounded p-4'>
      <p>{question.prompt}</p>
      {question.options.map((option, index) => <button key={option} aria-label={`option-${index}`} disabled={!!selectedAnswer} onClick={() => { setSelectedAnswer(option); dispatch({ type: 'answerQuestion', qid: qid(questionIndex), correct: option === question.answer }); }} className='block w-full text-left border rounded px-3 py-2 mt-2'>{option}</button>)}
      {selectedAnswer && <p className='mt-3'>Answer: {question.answer}</p>}
      <button className='mt-2 border rounded px-3 py-1' onClick={() => { setSelectedAnswer(null); setQuestionIndex((i) => i + 1); }}>Next</button>
    </section>}

    {mode === 'flashcards' && <section className='border rounded p-4'>
      <div className='cursor-pointer transition-transform duration-500' onClick={() => setFlipped((v) => !v)}>{flipped ? card.back : card.front}</div>
    </section>}

    {mode === 'lesions' && <section className='space-y-2'>{vignettes.map((v) => <details key={v.id} className='border rounded p-3'><summary>{v.prompt}</summary><p className='text-sm mt-2'>Hint: {v.hint}</p><p className='text-sm mt-1'><b>Localization:</b> {v.answer}</p></details>)}</section>}

    {mode === 'cranial' && <section className='overflow-auto border rounded p-3'><table><thead><tr><th>CN</th><th>Name</th><th>Type</th><th>Function</th></tr></thead><tbody>{practicalCranialNerves.map((n) => <tr key={n.number}><td>{n.number}</td><td>{n.name}</td><td>{n.type}</td><td>{n.function}</td></tr>)}</tbody></table></section>}

    <section className='flex gap-2'>
      <a href={primaryWorkbook.href} target='_blank' rel='noreferrer' className='px-3 py-2 rounded bg-blue-600 text-white inline-flex items-center gap-2'>Workbook <ExternalLink size={14}/></a>
      <button onClick={() => dispatch({ type: 'reset' })} className='px-3 py-2 rounded border inline-flex items-center gap-2'><RotateCcw size={14}/>Reset</button>
    </section>
  </div>;
};

export default PracticalTrainer;
