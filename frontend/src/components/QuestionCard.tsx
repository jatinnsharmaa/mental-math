import type { Question } from '../types';

const CATEGORY_LABEL: Record<string, string> = {
  multiplication: 'Multiplication', primes: 'Primes',
  squares_cubes: 'Squares & Cubes', roots: 'Roots', fractions: 'Fractions',
};

export function QuestionCard({ question }: { question: Question }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center">
      <div className="flex justify-center gap-2 mb-6">
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{CATEGORY_LABEL[question.category]}</span>
        <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">{question.difficulty}</span>
      </div>
      <p className="text-3xl font-semibold text-gray-900 leading-tight">{question.prompt}</p>
    </div>
  );
}
