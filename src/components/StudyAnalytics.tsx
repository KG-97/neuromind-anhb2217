import { useEffect, useState } from 'react';
import { BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Session = { date: string; minutes: number; module: string; score: number };

const seed: Session[] = [
  { date: 'Mon', minutes: 35, module: 'Spinal', score: 72 },
  { date: 'Tue', minutes: 42, module: 'Cranial', score: 78 },
  { date: 'Wed', minutes: 28, module: 'Cortex', score: 70 },
  { date: 'Thu', minutes: 50, module: 'Trainer', score: 84 },
  { date: 'Fri', minutes: 45, module: 'Spinal', score: 80 },
  { date: 'Sat', minutes: 38, module: 'Cranial', score: 82 },
];

export default function StudyAnalytics() {
  const [sessions, setSessions] = useState<Session[]>(() => {
    try { return JSON.parse(localStorage.getItem('nm_sessions') || 'null') ?? seed; } catch { return seed; }
  });
  const [running, setRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    localStorage.setItem('nm_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const totals = sessions.reduce((acc, s) => ({ minutes: acc.minutes + s.minutes, avg: acc.avg + s.score }), { minutes: 0, avg: 0 });
  const avgScore = Math.round(totals.avg / sessions.length);
  const weakAreas = sessions.filter((s) => s.score < 75);

  const exportCsv = () => {
    const header = 'date,module,minutes,score\n';
    const body = sessions.map((s) => `${s.date},${s.module},${s.minutes},${s.score}`).join('\n');
    const blob = new Blob([header + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'neuromind-progress.csv'; a.click(); URL.revokeObjectURL(url);
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
