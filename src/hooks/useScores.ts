import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'anhb2217_scores_v1';

export type QuizKey =
  | 'cranial-nerves'
  | 'cn-fiber-types'
  | 'tract-decussation'
  | 'brainstem-levels'
  | 'brainstem-syndromes'
  | 'sense-pathways'
  | 'cortical-surface'
  | 'dura-blood';

export type QuizScore = {
  best: number;    // best percent 0-100
  attempts: number;
  lastCorrect: number;
  lastTotal: number;
  lastAt: number;
};

export type ScoreMap = Partial<Record<QuizKey, QuizScore>>;

function read(): ScoreMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ScoreMap) : {};
  } catch {
    return {};
  }
}

function write(m: ScoreMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(m));
  } catch {
    /* no-op */
  }
}

export function useScores() {
  const [scores, setScores] = useState<ScoreMap>(() => read());

  useEffect(() => {
    const h = () => setScores(read());
    window.addEventListener('anhb2217:scores', h);
    window.addEventListener('storage', h);
    return () => {
      window.removeEventListener('anhb2217:scores', h);
      window.removeEventListener('storage', h);
    };
  }, []);

  const record = useCallback((key: QuizKey, correct: number, total: number) => {
    const current = read();
    const percent = total ? Math.round((correct / total) * 100) : 0;
    const prev = current[key];
    const next: QuizScore = {
      best: Math.max(prev?.best ?? 0, percent),
      attempts: (prev?.attempts ?? 0) + 1,
      lastCorrect: correct,
      lastTotal: total,
      lastAt: Date.now(),
    };
    const merged = { ...current, [key]: next };
    write(merged);
    setScores(merged);
    window.dispatchEvent(new CustomEvent('anhb2217:scores'));
    return next;
  }, []);

  const reset = useCallback(() => {
    write({});
    setScores({});
    window.dispatchEvent(new CustomEvent('anhb2217:scores'));
  }, []);

  return { scores, record, reset };
}
