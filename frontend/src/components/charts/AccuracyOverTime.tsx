import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { DailyStat } from '../../types';

export function AccuracyOverTime({ data }: { data: DailyStat[] }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Accuracy over time</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} unit="%" />
          <Tooltip formatter={(v: any) => [`${v}%`, 'Accuracy']} />
          <Line type="monotone" dataKey="accuracy" stroke="#111827" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
