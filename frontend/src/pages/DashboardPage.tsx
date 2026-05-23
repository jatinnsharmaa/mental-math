import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AnalyticsSummary, DailyStat, MistakeSummary } from '../types';
import { AccuracyOverTime } from '../components/charts/AccuracyOverTime';
import { ResponseTimeChart } from '../components/charts/ResponseTimeChart';
import { CategoryBreakdown } from '../components/charts/CategoryBreakdown';

const CATEGORIES = ['multiplication', 'primes', 'squares_cubes', 'roots', 'fractions'] as const;
const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

type Tab = 'stats' | 'mistakes';

export function DashboardPage({ onHome }: { onHome: () => void }) {
  const [tab, setTab] = useState<Tab>('stats');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  const [mistakes, setMistakes] = useState<MistakeSummary[]>([]);
  const [mistakeDays, setMistakeDays] = useState(30);
  const [mistakeCategory, setMistakeCategory] = useState('');
  const [mistakeDifficulty, setMistakeDifficulty] = useState('');
  const [mistakesLoading, setMistakesLoading] = useState(false);

  useEffect(() => { api.getAnalyticsSummary().then(setSummary).finally(() => setLoading(false)); }, []);
  useEffect(() => { api.getDailyAnalytics(days).then(r => setDaily(r.daily)); }, [days]);

  useEffect(() => {
    if (tab !== 'mistakes') return;
    setMistakesLoading(true);
    api.getMistakes(mistakeDays, mistakeCategory || undefined, mistakeDifficulty || undefined)
      .then(r => setMistakes(r.mistakes))
      .finally(() => setMistakesLoading(false));
  }, [tab, mistakeDays, mistakeCategory, mistakeDifficulty]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <button onClick={onHome} className="text-sm text-gray-500 hover:text-gray-900">Back</button>
        </div>

        <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
          {(['stats', 'mistakes'] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'stats' && (
          <>
            {loading && <p className="text-sm text-gray-400">Loading…</p>}
            {summary && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Accuracy', value: `${summary.accuracy}%` },
                  { label: 'Answered', value: String(summary.totalAnswered) },
                  { label: 'Avg time', value: `${(summary.avgResponseMs / 1000).toFixed(1)}s` },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100">
                    <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              {[7, 14, 30].map(d => (
                <button key={d} onClick={() => setDays(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${days === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {d}d
                </button>
              ))}
            </div>
            {daily.length > 0 && <><AccuracyOverTime data={daily} /><ResponseTimeChart data={daily} /></>}
            {summary && Object.keys(summary.byCategory).length > 0 && <CategoryBreakdown byCategory={summary.byCategory} />}
            {summary && Object.keys(summary.byDifficulty).length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">By difficulty</p>
                {Object.entries(summary.byDifficulty).map(([diff, stat]) => (
                  <div key={diff} className="flex items-center gap-3">
                    <span className="text-sm text-gray-700 w-16 capitalize">{diff}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gray-900 rounded-full" style={{ width: `${stat.accuracy}%` }} />
                    </div>
                    <span className="text-sm tabular-nums text-gray-500 w-10 text-right">{stat.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
            {summary && Object.keys(summary.byCategory).length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-gray-100 space-y-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Weakest areas</p>
                {Object.entries(summary.byCategory).sort((a, b) => a[1].accuracy - b[1].accuracy).slice(0, 3).map(([cat, stat]) => (
                  <div key={cat} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 capitalize">{cat.replace('_', ' ')}</span>
                    <span className="text-red-500 font-medium">{stat.accuracy}%</span>
                  </div>
                ))}
              </div>
            )}
            {summary?.totalAnswered === 0 && (
              <p className="text-sm text-gray-400 text-center">Play a session to see your stats here.</p>
            )}
          </>
        )}

        {tab === 'mistakes' && (
          <>
            <div className="flex gap-2 flex-wrap">
              {[7, 30].map(d => (
                <button key={d} onClick={() => setMistakeDays(d)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${mistakeDays === d ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200'}`}>
                  {d}d
                </button>
              ))}
              <select value={mistakeCategory} onChange={e => setMistakeCategory(e.target.value)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600">
                <option value="">All categories</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select>
              <select value={mistakeDifficulty} onChange={e => setMistakeDifficulty(e.target.value)}
                className="px-3 py-1 rounded-full text-xs font-medium border border-gray-200 bg-white text-gray-600">
                <option value="">All difficulties</option>
                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {mistakesLoading && <p className="text-sm text-gray-400">Loading…</p>}

            {!mistakesLoading && mistakes.length === 0 && (
              <p className="text-sm text-gray-400 text-center pt-4">No mistakes in this period — you're on a roll!</p>
            )}

            {!mistakesLoading && mistakes.length > 0 && (
              <div className="space-y-2">
                {mistakes.map((m, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 font-medium">{m.prompt}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Answer: <span className="font-medium text-gray-700">{m.answer}</span></p>
                      <div className="flex gap-2 mt-1.5">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{m.category.replace('_', ' ')}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">{m.difficulty}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-semibold text-red-500">×{m.wrongCount}</p>
                      <p className="text-xs text-gray-400">wrong</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
