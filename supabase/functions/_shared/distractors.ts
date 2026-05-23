function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function generateOptions(category: string, answer: string): string[] {
  if (category === 'primes') return ['yes', 'no'];

  if (category === 'squares_cubes' || category === 'multiplication') {
    const correct = parseInt(answer);
    const wrongs = new Set<string>();
    let k = 1;
    while (wrongs.size < 3) {
      for (const sign of [1, -1]) {
        const candidate = correct + sign * k * 10;
        if (candidate > 0 && String(candidate) !== answer) {
          wrongs.add(String(candidate));
          if (wrongs.size === 3) break;
        }
      }
      k++;
    }
    return shuffle([answer, ...Array.from(wrongs)]);
  }

  const correct = parseFloat(answer);
  const wrongs = new Set<string>();

  const deltas: Record<string, number[]> = {
    roots:     [0.05, 0.1, 0.15, 0.2, 0.25, 0.3],
    fractions: [0.03, 0.05, 0.07, 0.1, 0.12, 0.15],
  };

  for (const d of shuffle(deltas[category] ?? [1, 2, 3, 5])) {
    for (const sign of [1, -1]) {
      const candidate = parseFloat((correct + sign * d).toFixed(2));
      if (candidate > 0 && String(candidate) !== answer) {
        wrongs.add(String(candidate));
        if (wrongs.size === 3) break;
      }
    }
    if (wrongs.size === 3) break;
  }

  let i = 1;
  while (wrongs.size < 3) {
    const c = parseFloat((correct + i).toFixed(2));
    if (String(c) !== answer) wrongs.add(String(c));
    i++;
  }

  return shuffle([answer, ...Array.from(wrongs)]);
}

export function formatQuestion(q: {
  id: number; category: string; difficulty: string; prompt: string; answer: string;
}) {
  return {
    id: q.id,
    category: q.category,
    difficulty: q.difficulty,
    prompt: q.prompt,
    answer: q.answer,
    options: generateOptions(q.category, q.answer),
  };
}
