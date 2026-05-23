import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STORAGE_KEY = 'neuromind_practical_trainer_v2';
const SESSIONS_KEY = 'nm_sessions';

interface QuestionStats {
  attempts: number;
  correct: number;
  wrong: number;
  leitnerBox: number;
  dueDate?: string;
  lastSeenAt?: string;
}

interface Progress {
  questionStats: Record<string, QuestionStats>;
  stationRatings?: Record<string, { rating: number; ratedAt?: string }>;
  streak?: { lastCheckIn?: string; days?: number };
  targetChecks?: Record<string, boolean>;
}

type Session = { date: string; minutes: number; module: string; score: number };

function parseProgress(): Progress | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function buildSessions(progress: Progress): Session[] {
  const qStats = Object.entries(progress.questionStats || {});
  const stations = Object.entries(progress.stationRatings || {});
  const seen = new Set<string>();
  const sessions: Session[] = [];

  // Group by date from lastSeenAt
  for (const [qid, stats] of qStats) {
    if (!stats.lastSeenAt || stats.attempts <= 0) continue;
    const dt = new Date(stats.lastSeenAt);
    const dateKey = dt.toISOString().slice(0, 10);
    if (seen.has(dateKey)) continue;
    seen.add(dateKey);
    const score = Math.round((stats.correct / stats.attempts) * 100);
    sessions.push({
      date: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: stats.attempts * 2,
      module: qid.split(':')[0] || 'General',
      score,
    });
  }

  // Add station rating sessions
  for (const [sid, rating] of stations) {
    if (!rating.ratedAt || seen.has(rating.ratedAt)) continue;
    const dt = new Date(rating.ratedAt);
    const dateKey = dt.toISOString().slice(0, 10);
    if (seen.has(dateKey)) continue;
    seen.add(dateKey);
    sessions.push({
      date: dt.toLocaleDateString('en-US', { weekday: 'short' }),
      minutes: 10,
      module: sid,
      score: rating.rating * 20,
    });
  }

  // Fallback if no real sessions yet
  if (sessions.length === 0) {
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const dt = new Date(today);
      dt.setDate(dt.getDate() - i);
      sessions.push({
        date: dt.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: 0,
        module: '—',
        score: 0,
      });
    }
  }

  return sessions;
}

export default function StudyAnalytics() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(SESSIONS_KEY) || 'null');
      if (cached && cached.length > 0) return cached;
    } catch {}
    const progress = parseProgress();
    return progress ? buildSessions(progress) : [];
  });
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const progress = parseProgress();
    if (progress) {
      const fresh = buildSessions(progress);
      setSessions(fresh);
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(fresh));
    }
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const totals = sessions.reduce((acc, s) => ({ minutes: acc.minutes + s.minutes, avg: acc.avg + s.score }), { minutes: 0, avg: 0 });
  const avgScore = sessions.length ? Math.round(totals.avg / sessions.length) : 0;
  const weakAreas = sessions.filter((s) => s.score < 75);

  const exportCsv = () => {
    const header = 'date,module,minutes,score\n';
    const body = sessions.map((s) => `${s.date},${s.module},${s.minutes},${s.score}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'neuromind-progress.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="glass-card rounded-2xl p-6 border border-white/10" aria-label="Study analytics dashboard">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl font-bold">Analytics Dashboard</h3>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="px-3 py-2 rounded-lg bg-emerald-600/20 border border-emerald-400/30">Export CSV</button>
          <button onClick={() => window.print()} className="px-3 py-2 rounded-lg bg-violet-600/20 border border-violet-400/30">Export PDF</button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-3 mt-4">
        <div className="rounded-lg border border-white/10 p-3">Total Study: {totals.minutes} min</div>
        <div className="rounded-lg border border-white/10 p-3">Avg Score: {avgScore}%</div>
        <div className="rounded-lg border border-white/10 p-3">Weak Areas: {weakAreas.length}</div>
        <div className="rounded-lg border border-white/10 p-3">Timer: {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2,'0')} <button className='underline ml-2' onClick={() => setRunning((r) => !r)}>{running ? 'Pause' : 'Start'}</button></div>
      </div>
      <div className="h-56 mt-4" role="img" aria-label="Study minutes by day chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sessions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="minutes" fill="#8b5cf6" radius={[8,8,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
