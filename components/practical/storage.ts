import { PracticalProgress } from './types';
export const STORAGE_KEY = 'neuromind_practical_trainer_v2';
export const THEME_KEY = 'neuromind_theme';
export const ONBOARDING_KEY = 'neuromind_onboarding_v1';
const todayIso = () => new Date().toISOString().slice(0, 10);
export const emptyProgress: PracticalProgress = { stationRatings: {}, targetChecks: {}, questionStats: {}, streak: { days: 0 }, sessions: [] };
export function loadProgress(): PracticalProgress { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return emptyProgress; const parsed = JSON.parse(raw) as PracticalProgress; return { ...emptyProgress, ...parsed }; } catch (error) { console.error('Failed to load progress', error); return emptyProgress; } }
export function saveProgress(progress: PracticalProgress): void { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (error) { console.error(error); } }
export function computeDueDate(box: number): string { const gaps = [1, 2, 4, 7, 14]; const days = gaps[Math.max(0, Math.min(4, box - 1))]; const next = new Date(); next.setDate(next.getDate() + days); return next.toISOString().slice(0, 10); }
export function isDue(dueDate: string): boolean { return dueDate <= todayIso(); }
