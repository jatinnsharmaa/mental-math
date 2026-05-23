export type Category = 'multiplication' | 'primes' | 'squares_cubes' | 'roots' | 'fractions';
export type Difficulty = 'easy' | 'medium' | 'hard';

export type Question = {
  id: number;
  category: Category;
  difficulty: Difficulty;
  prompt: string;
  answer: string;
  options: string[];
};

export type MistakeSummary = {
  prompt: string;
  category: string;
  difficulty: string;
  answer: string;
  wrongCount: number;
};

export type SessionAnswer = {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  correctAnswer: string;
  responseTimeMs: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
};

export type DailyStat = {
  date: string;
  total: number;
  correct: number;
  accuracy: number;
  avgMs: number;
};

export type CategoryStat = {
  total: number;
  correct: number;
  accuracy: number;
  avgMs: number;
};

export type AnalyticsSummary = {
  totalAnswered: number;
  accuracy: number;
  avgResponseMs: number;
  byCategory: Record<string, CategoryStat>;
  byDifficulty: Record<string, CategoryStat>;
};
