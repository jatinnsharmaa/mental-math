import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useGameStore } from '../stores/gameStore';
import { SessionConfig } from '../components/SessionConfig';
import { api } from '../api/client';
import type { Category, Difficulty } from '../types';

type Props = { onStart: (sessionId: number) => void; onDashboard: () => void };

export function HomePage({ onStart, onDashboard }: Props) {
  const { user, logout } = useAuthStore(s => s);
  const { setQuestions } = useGameStore(s => s);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleStart(categories: Category[], difficulties: Difficulty[]) {
    setLoading(true);
    setError('');
    try {
      const { sessionId, questions } = await api.startSession(categories, difficulties);
      setQuestions(questions);
      onStart(sessionId);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Mental Math</h1>
            <p className="text-sm text-gray-500">{user?.name || user?.email}</p>
          </div>
          <div className="flex gap-4">
            <button onClick={onDashboard} className="text-sm text-gray-600 hover:text-gray-900">Analytics</button>
            <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600">Sign out</button>
          </div>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <SessionConfig onStart={handleStart} loading={loading} />
      </div>
    </div>
  );
}
