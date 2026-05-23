import { useGameStore } from '../stores/gameStore';

export function ResultsPage({ onHome }: { onHome: () => void }) {
  const { answers, reset } = useGameStore(s => s);

  const total = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;
  const avgMs = total ? Math.round(answers.reduce((s, a) => s + a.responseTimeMs, 0) / total) : 0;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-md mx-auto space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">Session complete</h2>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: 'Accuracy', value: `${accuracy}%` }, { label: 'Correct', value: `${correct}/${total}` }, { label: 'Avg time', value: `${(avgMs / 1000).toFixed(1)}s` }].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 text-center border border-gray-100">
              <p className="text-2xl font-semibold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 max-h-96 overflow-y-auto">
          {answers.map((a, i) => (
            <div key={i} className="flex items-center px-4 py-3 text-sm gap-3">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${a.isCorrect ? 'bg-green-400' : 'bg-red-400'}`} />
              <span className="flex-1 text-gray-700 truncate">{a.correctAnswer}</span>
              <span className="text-gray-400 tabular-nums">{(a.responseTimeMs / 1000).toFixed(1)}s</span>
            </div>
          ))}
        </div>
        <button onClick={() => { reset(); onHome(); }}
          className="w-full py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors">
          Play again
        </button>
      </div>
    </div>
  );
}
