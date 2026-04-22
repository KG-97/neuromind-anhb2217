import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'anhb2217_progress_v1';

export type ProgressMap = Record<string, boolean>;

function readStore(): ProgressMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeStore(map: ProgressMap) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* storage unavailable */
  }
}

/**
 * Global, cross-component study-progress tracker. Each item is a stable string
 * key (e.g. "cn:III" or "tract:dcml"). Changes broadcast via a custom event so
 * every mounted component stays in sync without prop drilling.
 */
export function useProgress() {
  const [map, setMap] = useState<ProgressMap>(() => readStore());

  useEffect(() => {
    const handler = () => setMap(readStore());
    window.addEventListener('anhb2217:progress', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('anhb2217:progress', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const toggle = useCallback((key: string) => {
    const next = { ...readStore() };
    if (next[key]) delete next[key];
    else next[key] = true;
    writeStore(next);
    setMap(next);
    window.dispatchEvent(new CustomEvent('anhb2217:progress'));
  }, []);

  const set = useCallback((key: string, value: boolean) => {
    const next = { ...readStore() };
    if (value) next[key] = true;
    else delete next[key];
    writeStore(next);
    setMap(next);
    window.dispatchEvent(new CustomEvent('anhb2217:progress'));
  }, []);

  const reset = useCallback((prefix?: string) => {
    const current = readStore();
    const next: ProgressMap = {};
    if (prefix) {
      for (const k of Object.keys(current)) {
        if (!k.startsWith(prefix)) next[k] = current[k];
      }
    }
    writeStore(next);
    setMap(next);
    window.dispatchEvent(new CustomEvent('anhb2217:progress'));
  }, []);

  const has = useCallback((key: string) => !!map[key], [map]);

  const countWithPrefix = useCallback(
    (prefix: string) => Object.keys(map).filter((k) => k.startsWith(prefix)).length,
    [map],
  );

  return { map, has, toggle, set, reset, countWithPrefix };
}
