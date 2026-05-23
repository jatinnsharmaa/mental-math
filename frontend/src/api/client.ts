import { useAuthStore } from '../stores/authStore';
import type { PendingAnswer } from '../stores/gameStore';

const BASE = import.meta.env.VITE_API_URL as string;

if (!BASE) {
  console.error('VITE_API_URL is not set — all API calls will fail. Check Vercel environment variables.');
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> ?? {}) },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = (err as Record<string, unknown>).error
      ?? (err as Record<string, unknown>).message
      ?? (res.statusText || `HTTP ${res.status}`);
    throw new Error(msg as string);
  }
  return res.json() as Promise<T>;
}

export const api = {
  startSession: (categories: string[], difficulties: string[]) =>
    request<{ sessionId: number; questions: import('../types').Question[] }>(
      '/sessions', { method: 'POST', body: JSON.stringify({ categories, difficulties }) }
    ),
  fetchNextBatch: (sessionId: number, answers: PendingAnswer[] = []) =>
    request<{ questions: import('../types').Question[] }>(
      `/sessions/${sessionId}/next`,
      { method: 'POST', body: JSON.stringify({ answers }) }
    ),
  endSession: (sessionId: number, answers: PendingAnswer[] = []) =>
    request<{ endedAt: string }>(
      `/sessions/${sessionId}/end`,
      { method: 'POST', body: JSON.stringify({ answers }) }
    ),
  getAnalyticsSummary: () =>
    request<import('../types').AnalyticsSummary>('/analytics/summary'),
  getDailyAnalytics: (days = 7) =>
    request<{ daily: import('../types').DailyStat[] }>(`/analytics/daily?days=${days}`),
  getMistakes: (days = 30, category?: string, difficulty?: string) => {
    const params = new URLSearchParams({ days: String(days) });
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    return request<{ mistakes: import('../types').MistakeSummary[] }>(`/analytics/mistakes?${params}`);
  },
};
