export type AnswerRow = {
  isCorrect: boolean;
  responseTimeMs: number;
  answeredAt: string;
  question: { category: string; difficulty: string };
};

type Bucket = { total: number; correct: number; totalMs: number };

export function aggregateAnswers(answers: AnswerRow[]) {
  if (!answers.length) {
    return { totalAnswered: 0, accuracy: 0, avgResponseMs: 0, byCategory: {}, byDifficulty: {} };
  }

  const total = answers.length;
  const correct = answers.filter(a => a.isCorrect).length;
  const accuracy = Math.round((correct / total) * 100);
  const avgResponseMs = Math.round(answers.reduce((s, a) => s + a.responseTimeMs, 0) / total);

  const byCategory: Record<string, Bucket> = {};
  const byDifficulty: Record<string, Bucket> = {};

  for (const a of answers) {
    const cat = a.question.category;
    const diff = a.question.difficulty;
    for (const [key, group] of [[cat, byCategory], [diff, byDifficulty]] as [string, Record<string, Bucket>][]) {
      if (!group[key]) group[key] = { total: 0, correct: 0, totalMs: 0 };
      group[key].total++;
      if (a.isCorrect) group[key].correct++;
      group[key].totalMs += a.responseTimeMs;
    }
  }

  const summarise = (g: Record<string, Bucket>) =>
    Object.fromEntries(Object.entries(g).map(([k, v]) => [k, {
      total: v.total,
      correct: v.correct,
      accuracy: Math.round((v.correct / v.total) * 100),
      avgMs: Math.round(v.totalMs / v.total),
    }]));

  return { totalAnswered: total, accuracy, avgResponseMs, byCategory: summarise(byCategory), byDifficulty: summarise(byDifficulty) };
}

type MistakeRow = {
  questionId: number;
  question: { prompt: string; category: string; difficulty: string; answer: string };
};

export type MistakeSummary = {
  prompt: string;
  category: string;
  difficulty: string;
  answer: string;
  wrongCount: number;
};

export function groupByQuestion(rows: MistakeRow[]): MistakeSummary[] {
  const byQ = new Map<number, MistakeSummary & { questionId: number }>();
  for (const r of rows) {
    if (!r.question) continue;
    const existing = byQ.get(r.questionId);
    if (existing) {
      existing.wrongCount++;
    } else {
      byQ.set(r.questionId, { questionId: r.questionId, ...r.question, wrongCount: 1 });
    }
  }
  return [...byQ.values()]
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .map(({ questionId: _id, ...rest }) => rest);
}

export function groupByDay(answers: Pick<AnswerRow, 'isCorrect' | 'responseTimeMs' | 'answeredAt'>[]) {
  const byDay: Record<string, { total: number; correct: number; totalMs: number }> = {};
  for (const a of answers) {
    const day = a.answeredAt.split('T')[0];
    if (!byDay[day]) byDay[day] = { total: 0, correct: 0, totalMs: 0 };
    byDay[day].total++;
    if (a.isCorrect) byDay[day].correct++;
    byDay[day].totalMs += a.responseTimeMs;
  }
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({
      date,
      total: d.total,
      correct: d.correct,
      accuracy: Math.round((d.correct / d.total) * 100),
      avgMs: Math.round(d.totalMs / d.total),
    }));
}
