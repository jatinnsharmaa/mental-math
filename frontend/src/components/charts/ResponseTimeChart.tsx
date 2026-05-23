import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DailyStat } from '../../types';

export function ResponseTimeChart({ data }: { data: DailyStat[] }) {
  const formatted = data.map(d => ({ ...d, avgSec: parseFloat((d.avgMs / 1000).toFixed(2)) }));
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Avg response time (s)</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
          <YAxis tick={{ fontSize: 10 }} unit="s" />
          <Tooltip formatter={(v: any) => [`${v}s`, 'Avg time']} />
          <Bar dataKey="avgSec" fill="#111827" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
