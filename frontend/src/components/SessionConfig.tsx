import { useState } from 'react';
import type { Category, Difficulty } from '../types';

const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'multiplication', label: 'Multiplication' },
  { value: 'primes', label: 'Primes' },
  { value: 'squares_cubes', label: 'Squares & Cubes' },
  { value: 'roots', label: 'Roots' },
  { value: 'fractions', label: 'Fractions' },
];

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

function toggle<T>(arr: T[], val: T): T[] {
  return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
}

type Props = { onStart: (categories: Category[], difficulties: Difficulty[]) => void; loading: boolean };

export function SessionConfig({ onStart, loading }: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<Difficulty[]>(['medium']);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</p>
          <div className="flex gap-2">
            <button onClick={() => setCategories(CATEGORIES.map(c => c.value))}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Select all
            </button>
            <span className="text-xs text-gray-300">·</span>
            <button onClick={() => setCategories([])}
              className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Deselect all
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button key={c.value} onClick={() => setCategories(toggle(categories, c.value))}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${categories.includes(c.value) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
              {c.label}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Difficulty</p>
        <div className="flex gap-2">
          {DIFFICULTIES.map(d => (
            <button key={d.value} onClick={() => setDifficulties(toggle(difficulties, d.value))}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${difficulties.includes(d.value) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'}`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>
<button disabled={!categories.length || !difficulties.length || loading}
        onClick={() => onStart(categories, difficulties)}
        className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-700 transition-colors">
        {loading ? 'Loading…' : 'Start'}
      </button>
    </div>
  );
}
