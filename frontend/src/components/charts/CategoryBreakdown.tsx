import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryStat } from '../../types';

const LABELS: Record<string, string> = {
  multiplication: 'Multiply', primes: 'Primes', squares_cubes: 'Sq/Cube', roots: 'Roots', fractions: 'Fractions',
};

export function CategoryBreakdown({ byCategory }: { byCategory: Record<string, CategoryStat> }) {
  const data = Object.entries(byCategory).map(([k, v]) => ({ subject: LABELS[k] ?? k, accuracy: v.accuracy, fullMark: 100 }));
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-4">Accuracy by category</p>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
          <Radar dataKey="accuracy" stroke="#111827" fill="#111827" fillOpacity={0.15} />
          <Tooltip formatter={(v: any) => [`${v}%`, 'Accuracy']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
