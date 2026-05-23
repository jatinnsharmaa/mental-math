import { assertEquals } from 'jsr:@std/assert';
import { aggregateAnswers, groupByDay } from './aggregate.ts';

const makeAnswer = (isCorrect: boolean, responseTimeMs: number, category: string, difficulty: string, answeredAt: string) =>
  ({ isCorrect, responseTimeMs, answeredAt, question: { category, difficulty } });

Deno.test('aggregateAnswers: empty array returns zeros', () => {
  const result = aggregateAnswers([]);
  assertEquals(result.totalAnswered, 0);
  assertEquals(result.accuracy, 0);
  assertEquals(result.avgResponseMs, 0);
  assertEquals(result.byCategory, {});
  assertEquals(result.byDifficulty, {});
});

Deno.test('aggregateAnswers: all correct → accuracy 100', () => {
  const answers = [
    makeAnswer(true, 1000, 'multiplication', 'easy', '2024-01-01T00:00:00Z'),
    makeAnswer(true, 2000, 'multiplication', 'easy', '2024-01-01T00:00:00Z'),
  ];
  const result = aggregateAnswers(answers);
  assertEquals(result.accuracy, 100);
  assertEquals(result.totalAnswered, 2);
});

Deno.test('aggregateAnswers: half correct → accuracy 50', () => {
  const answers = [
    makeAnswer(true, 1000, 'primes', 'easy', '2024-01-01T00:00:00Z'),
    makeAnswer(false, 3000, 'primes', 'easy', '2024-01-01T00:00:00Z'),
  ];
  const result = aggregateAnswers(answers);
  assertEquals(result.accuracy, 50);
  assertEquals(result.avgResponseMs, 2000);
});

Deno.test('aggregateAnswers: byCategory totals are correct', () => {
  const answers = [
    makeAnswer(true, 1000, 'multiplication', 'easy', '2024-01-01T00:00:00Z'),
    makeAnswer(false, 1000, 'primes', 'hard', '2024-01-01T00:00:00Z'),
    makeAnswer(true, 1000, 'multiplication', 'medium', '2024-01-01T00:00:00Z'),
  ];
  const result = aggregateAnswers(answers);
  assertEquals(result.byCategory['multiplication'].total, 2);
  assertEquals(result.byCategory['multiplication'].correct, 2);
  assertEquals(result.byCategory['multiplication'].accuracy, 100);
  assertEquals(result.byCategory['primes'].total, 1);
  assertEquals(result.byCategory['primes'].correct, 0);
  assertEquals(result.byCategory['primes'].accuracy, 0);
});

Deno.test('aggregateAnswers: byDifficulty totals are correct', () => {
  const answers = [
    makeAnswer(true, 500, 'multiplication', 'easy', '2024-01-01T00:00:00Z'),
    makeAnswer(false, 1500, 'primes', 'easy', '2024-01-01T00:00:00Z'),
  ];
  const result = aggregateAnswers(answers);
  assertEquals(result.byDifficulty['easy'].total, 2);
  assertEquals(result.byDifficulty['easy'].accuracy, 50);
  assertEquals(result.byDifficulty['easy'].avgMs, 1000);
});

Deno.test('groupByDay: groups answers by date', () => {
  const answers = [
    { isCorrect: true, responseTimeMs: 1000, answeredAt: '2024-01-01T10:00:00Z' },
    { isCorrect: false, responseTimeMs: 3000, answeredAt: '2024-01-01T11:00:00Z' },
    { isCorrect: true, responseTimeMs: 2000, answeredAt: '2024-01-02T10:00:00Z' },
  ];
  const result = groupByDay(answers);
  assertEquals(result.length, 2);
  const day1 = result.find(d => d.date === '2024-01-01')!;
  assertEquals(day1.total, 2);
  assertEquals(day1.correct, 1);
  assertEquals(day1.accuracy, 50);
  assertEquals(day1.avgMs, 2000);
  const day2 = result.find(d => d.date === '2024-01-02')!;
  assertEquals(day2.total, 1);
  assertEquals(day2.accuracy, 100);
});
