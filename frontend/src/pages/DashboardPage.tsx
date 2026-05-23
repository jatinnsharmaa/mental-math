import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { AnalyticsSummary, DailyStat } from '../types';
import { AccuracyOverTime } from '../components/charts/AccuracyOverTime';
import { ResponseTimeChart } from '../components/charts/ResponseTimeChart';
import { CategoryBreakdown } from '../components/charts/CategoryBreakdown';

export function DashboardPage({ onHome }: { onHome: () => void }) {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.getAnalyticsSummary().then(setSummary).finally(() => setLoading(false)); }, []);
  useEffect(() => { api.getDailyAnalytics(days).then(r => setDaily(r.daily)); }, [days]);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Your stats</h2>
          <button onClick={onHome} className="text-sm text-gray-500 hover:text-gray-900">Back</button>
        </div>
        {loading && <p className="text-sm text-gray-400">Loading…</p>}
        {summary && (
          <div className="grid grid-cols-3 gap-3">
            {[{ label: 'Accuracy', value: `${summary.accuracy}%` }, { label: 'Answered', value: String(summary.totalAnswered) }, { label: 'Avg time', value: `${(summary.avgResponseMs / 1000).toFixed(1)}s` }].map(s => (
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
      </div>
    </div>
  );
}
