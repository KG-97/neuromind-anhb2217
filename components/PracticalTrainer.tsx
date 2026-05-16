import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Brain, CheckCircle, ExternalLink, ListChecks, Map, RotateCcw, ShieldQuestion } from 'lucide-react';
import {
  PracticalQuestion,
  practicalCranialNerves,
  practicalPathways,
  practicalQuestionBank,
  practicalStations,
} from '../app/practicalTrainerData';
import { primaryWorkbook } from '../app/workbooks';

type Mode = 'stations' | 'quiz' | 'pathways' | 'cranial';
type StationRating = 'red' | 'amber' | 'green';

type PracticalProgress = {
  stationRatings: Record<string, StationRating>;
  targetChecks: Record<string, boolean>;
  questionStats: Record<string, { attempts: number; correct: number }>;
};

const STORAGE_KEY = 'neuromind_practical_trainer_mvp_v1';

const emptyProgress: PracticalProgress = {
  stationRatings: {},
  targetChecks: {},
  questionStats: {},
};

function loadProgress(): PracticalProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyProgress, ...JSON.parse(raw) } : emptyProgress;
  } catch {
    return emptyProgress;
  }
}

function questionId(question: PracticalQuestion, index: number) {
  return `${question.prompt.slice(0, 40)}-${index}`;
}

const PracticalTrainer: React.FC = () => {
  const [mode, setMode] = useState<Mode>('stations');
  const [selectedStationId, setSelectedStationId] = useState(practicalStations[0]?.id ?? '');
  const [selectedPathwayName, setSelectedPathwayName] = useState(practicalPathways[0]?.name ?? '');
  const [progress, setProgress] = useState<PracticalProgress>(() => loadProgress());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const selectedStation = practicalStations.find(station => station.id === selectedStationId) ?? practicalStations[0];
  const selectedPathway = practicalPathways.find(pathway => pathway.name === selectedPathwayName) ?? practicalPathways[0];
  const currentQuestion = practicalQuestionBank[questionIndex % practicalQuestionBank.length];
  const currentQuestionId = questionId(currentQuestion, questionIndex % practicalQuestionBank.length);

  const stationStats = useMemo(() => {
    const totalTargets = practicalStations.reduce((sum, station) => sum + station.targets.length, 0);
    const checkedTargets = practicalStations.reduce(
      (sum, station) => sum + station.targets.filter(target => progress.targetChecks[`${station.id}:${target}`]).length,
      0,
    );
    const greenStations = practicalStations.filter(station => progress.stationRatings[station.id] === 'green').length;
    const redStations = practicalStations.filter(station => progress.stationRatings[station.id] === 'red').length;
    const questionAttempts = Object.values(progress.questionStats).reduce((sum, stat) => sum + stat.attempts, 0);
    const questionCorrect = Object.values(progress.questionStats).reduce((sum, stat) => sum + stat.correct, 0);

    return {
      totalTargets,
      checkedTargets,
      greenStations,
      redStations,
      questionAttempts,
      questionAccuracy: questionAttempts ? Math.round((questionCorrect / questionAttempts) * 100) : 0,
    };
  }, [progress]);

  const toggleTarget = (stationId: string, target: string) => {
    const id = `${stationId}:${target}`;
    setProgress(current => ({
      ...current,
      targetChecks: {
        ...current.targetChecks,
        [id]: !current.targetChecks[id],
      },
    }));
  };

  const rateStation = (stationId: string, rating: StationRating) => {
    setProgress(current => ({
      ...current,
      stationRatings: {
        ...current.stationRatings,
        [stationId]: rating,
      },
    }));
  };

  const answerQuestion = (answer: string) => {
    if (selectedAnswer) return;
    const correct = answer === currentQuestion.answer;
    setSelectedAnswer(answer);
    setProgress(current => {
      const previous = current.questionStats[currentQuestionId] ?? { attempts: 0, correct: 0 };
      return {
        ...current,
        questionStats: {
          ...current.questionStats,
          [currentQuestionId]: {
            attempts: previous.attempts + 1,
            correct: previous.correct + (correct ? 1 : 0),
          },
        },
      };
    });
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setQuestionIndex(index => (index + 1) % practicalQuestionBank.length);
  };

  const resetProgress = () => {
    setProgress(emptyProgress);
    setSelectedAnswer(null);
  };

  const modeButton = (value: Mode, label: string, Icon: React.ComponentType<{ size?: number }>) => (
    <button
      onClick={() => setMode(value)}
      className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
        mode === value ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="space-y-8">
      <section className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-[0.2em]">
              <Brain size={14} />
              React practical trainer MVP
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 leading-tight">
              Practical stations, pathways, cranial nerves, and mock questions inside the main app.
            </h2>
            <p className="mt-4 text-slate-600 text-lg leading-relaxed">
              This is the first React migration of the v5 builder data. The image-rich standalone workbook remains available while the app version becomes the structured long-term home.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {modeButton('stations', 'Stations', ListChecks)}
              {modeButton('quiz', 'Mocktical quiz', ShieldQuestion)}
              {modeButton('pathways', 'Pathways', Map)}
              {modeButton('cranial', 'Cranial nerves', BookOpen)}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 min-w-[280px]">
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{practicalStations.length}</p>
              <p className="text-sm text-slate-500 mt-1">stations</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{stationStats.checkedTargets}/{stationStats.totalTargets}</p>
              <p className="text-sm text-slate-500 mt-1">targets checked</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{stationStats.greenStations}</p>
              <p className="text-sm text-slate-500 mt-1">green stations</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-2xl font-bold text-slate-900">{stationStats.questionAccuracy}%</p>
              <p className="text-sm text-slate-500 mt-1">quiz accuracy</p>
            </div>
          </div>
        </div>
      </section>

      {mode === 'stations' && selectedStation && (
        <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 px-2">Stations</h3>
            {practicalStations.map(station => {
              const rating = progress.stationRatings[station.id];
              return (
                <button
                  key={station.id}
                  onClick={() => setSelectedStationId(station.id)}
                  className={`w-full text-left rounded-xl p-3 border transition-colors ${
                    station.id === selectedStation.id ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">{station.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{station.module}</p>
                  <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    rating === 'green' ? 'bg-green-100 text-green-700' : rating === 'amber' ? 'bg-amber-100 text-amber-700' : rating === 'red' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {rating ?? 'unrated'}
                  </span>
                </button>
              );
            })}
          </aside>

          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-700">{selectedStation.source}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{selectedStation.title}</h3>
                <p className="text-slate-600 mt-2 leading-relaxed">{selectedStation.prompt}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(['red', 'amber', 'green'] as StationRating[]).map(rating => (
                  <button
                    key={rating}
                    onClick={() => rateStation(selectedStation.id, rating)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold border ${
                      progress.stationRatings[selectedStation.id] === rating ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-slate-900">Targets</h4>
                <div className="mt-3 grid sm:grid-cols-2 gap-2">
                  {selectedStation.targets.map(target => {
                    const checked = progress.targetChecks[`${selectedStation.id}:${target}`];
                    return (
                      <button
                        key={target}
                        onClick={() => toggleTarget(selectedStation.id, target)}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors ${
                          checked ? 'bg-green-50 border-green-200 text-green-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle size={16} className={checked ? 'text-green-600' : 'text-slate-300'} />
                        {target}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <h4 className="font-bold text-slate-900">Exam notes</h4>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                    {selectedStation.notes.map(note => <li key={note}>{note}</li>)}
                  </ul>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <h4 className="font-bold text-blue-900">Rapid station checks</h4>
                  <div className="mt-3 space-y-3">
                    {selectedStation.rapid.map(item => (
                      <details key={item.prompt} className="bg-white border border-blue-100 rounded-xl p-3">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.prompt}</summary>
                        <p className="mt-2 text-sm text-blue-800"><strong>Answer:</strong> {item.answer}</p>
                        {item.explanation && <p className="mt-1 text-sm text-slate-600">{item.explanation}</p>}
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      )}

      {mode === 'quiz' && currentQuestion && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-4xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-blue-700">Question {questionIndex + 1} of {practicalQuestionBank.length}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-2">{currentQuestion.prompt}</h3>
            </div>
            <button onClick={nextQuestion} className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
              Next
            </button>
          </div>
          <div className="mt-6 grid gap-3">
            {currentQuestion.options.map(option => {
              const isAnswered = Boolean(selectedAnswer);
              const isCorrect = option === currentQuestion.answer;
              const isSelected = option === selectedAnswer;
              return (
                <button
                  key={option}
                  onClick={() => answerQuestion(option)}
                  disabled={isAnswered}
                  className={`text-left rounded-xl border px-4 py-3 transition-colors ${
                    isAnswered && isCorrect ? 'bg-green-50 border-green-300 text-green-800' :
                    isAnswered && isSelected ? 'bg-red-50 border-red-300 text-red-800' :
                    'bg-white border-slate-200 hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
          {selectedAnswer && (
            <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <p className="font-semibold text-blue-900">Correct answer: {currentQuestion.answer}</p>
              {currentQuestion.explanation && <p className="mt-2 text-sm text-slate-700">{currentQuestion.explanation}</p>}
            </div>
          )}
        </section>
      )}

      {mode === 'pathways' && selectedPathway && (
        <section className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 px-2">Pathways</h3>
            {practicalPathways.map(pathway => (
              <button
                key={pathway.name}
                onClick={() => setSelectedPathwayName(pathway.name)}
                className={`w-full text-left rounded-xl p-3 border transition-colors ${
                  pathway.name === selectedPathway.name ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{pathway.name}</p>
                <p className="text-xs text-slate-500 mt-1">{pathway.modality}</p>
              </button>
            ))}
          </aside>
          <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-2xl font-bold text-slate-900">{selectedPathway.name}</h3>
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 uppercase">Modality</p><p className="mt-1 text-sm text-slate-800">{selectedPathway.modality}</p></div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 uppercase">Chain</p><p className="mt-1 text-sm text-slate-800">{selectedPathway.chain}</p></div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4"><p className="text-xs font-semibold text-slate-500 uppercase">Crossing</p><p className="mt-1 text-sm text-slate-800">{selectedPathway.cross}</p></div>
            </div>
            <p className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-900 font-medium">{selectedPathway.logic}</p>
            <ol className="mt-6 space-y-3">
              {selectedPathway.steps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="h-7 w-7 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">{index + 1}</span>
                  <p className="text-slate-700 leading-relaxed">{step}</p>
                </li>
              ))}
            </ol>
          </article>
        </section>
      )}

      {mode === 'cranial' && (
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
          <h3 className="text-2xl font-bold text-slate-900">Cranial nerve atlas</h3>
          <table className="mt-5 min-w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-200 text-slate-500">
                <th className="py-3 pr-4">CN</th>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Type</th>
                <th className="py-3 pr-4">Function</th>
                <th className="py-3 pr-4">Nuclei/path</th>
                <th className="py-3 pr-4">Anchor</th>
              </tr>
            </thead>
            <tbody>
              {practicalCranialNerves.map(nerve => (
                <tr key={nerve.number} className="border-b border-slate-100 align-top">
                  <td className="py-3 pr-4 font-bold text-blue-700">{nerve.number}</td>
                  <td className="py-3 pr-4 font-semibold text-slate-900">{nerve.name}</td>
                  <td className="py-3 pr-4 text-slate-700">{nerve.type}</td>
                  <td className="py-3 pr-4 text-slate-700">{nerve.function}</td>
                  <td className="py-3 pr-4 text-slate-700">{nerve.nucleiOrPath}</td>
                  <td className="py-3 pr-4 text-slate-700">{nerve.anchor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Need the original labelled image workflow?</h3>
          <p className="text-sm text-slate-600 mt-1">Use the standalone v5 workbook while this React trainer grows the structured app version.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href={primaryWorkbook.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            Open standalone v5
            <ExternalLink size={16} />
          </a>
          <button onClick={resetProgress} className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
            <RotateCcw size={16} />
            Reset React progress
          </button>
        </div>
      </section>
    </div>
  );
};

export default PracticalTrainer;
