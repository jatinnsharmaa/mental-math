import { describe, it, expect } from 'vitest';
import { buildQuestions } from './seed';

describe('buildQuestions', () => {
  const questions = buildQuestions();

  it('produces 1107 questions total', () => {
    expect(questions).toHaveLength(1107);
  });

  it('every question has non-empty required fields', () => {
    for (const q of questions) {
      expect(q.category).toBeTruthy();
      expect(q.difficulty).toBeTruthy();
      expect(q.prompt).toBeTruthy();
      expect(q.answer).toBeTruthy();
    }
  });

  describe('multiplication', () => {
    const mult = questions.filter(q => q.category === 'multiplication');
    it('has 300 questions', () => expect(mult).toHaveLength(300));
    it('7 × 8 answer is 56', () => {
      const q = mult.find(q => q.prompt === '7 × 8 = ?');
      expect(q?.answer).toBe('56');
    });
    it('tables 1–10 are easy', () => {
      const easy = mult.filter(q => q.difficulty === 'easy');
      expect(easy.every(q => parseInt(q.prompt) <= 10)).toBe(true);
    });
  });

  describe('primes', () => {
    const primes = questions.filter(q => q.category === 'primes');
    it('has 292 questions (2–293)', () => expect(primes).toHaveLength(292));
    it('2 is prime', () => {
      expect(primes.find(q => q.prompt === 'Is 2 a prime number?')?.answer).toBe('yes');
    });
    it('97 is prime', () => {
      expect(primes.find(q => q.prompt === 'Is 97 a prime number?')?.answer).toBe('yes');
    });
    it('4 is not prime', () => {
      expect(primes.find(q => q.prompt === 'Is 4 a prime number?')?.answer).toBe('no');
    });
    it('100 is not prime', () => {
      expect(primes.find(q => q.prompt === 'Is 100 a prime number?')?.answer).toBe('no');
    });
  });

  describe('squares_cubes', () => {
    const sc = questions.filter(q => q.category === 'squares_cubes');
    it('has 60 questions (30 squares + 30 cubes)', () => expect(sc).toHaveLength(60));
    it('5² = 25', () => expect(sc.find(q => q.prompt === '5² = ?')?.answer).toBe('25'));
    it('5³ = 125', () => expect(sc.find(q => q.prompt === '5³ = ?')?.answer).toBe('125'));
  });

  describe('roots', () => {
    const roots = questions.filter(q => q.category === 'roots');
    it('has 20 questions (10 sqrt + 10 cbrt)', () => expect(roots).toHaveLength(20));
    it('√4 = 2', () => expect(roots.find(q => q.prompt === '√4 = ? (2 dp)')?.answer).toBe('2'));
    it('∛8 = 2', () => expect(roots.find(q => q.prompt === '∛8 = ? (2 dp)')?.answer).toBe('2'));
  });

  describe('fractions', () => {
    const fractions = questions.filter(q => q.category === 'fractions');
    it('has 435 questions', () => expect(fractions).toHaveLength(435));
    it('1/4 = 0.25', () => {
      expect(fractions.find(q => q.prompt === '1/4 as a decimal?')?.answer).toBe('0.25');
    });
    it('2/3 = 0.67', () => {
      expect(fractions.find(q => q.prompt === '2/3 as a decimal?')?.answer).toBe('0.67');
    });
  });

  it('all categories have easy, medium, and hard questions', () => {
    for (const cat of ['multiplication', 'primes', 'squares_cubes', 'roots', 'fractions']) {
      const catQs = questions.filter(q => q.category === cat);
      expect(catQs.some(q => q.difficulty === 'easy'), `${cat} has easy`).toBe(true);
      expect(catQs.some(q => q.difficulty === 'medium'), `${cat} has medium`).toBe(true);
      expect(catQs.some(q => q.difficulty === 'hard'), `${cat} has hard`).toBe(true);
    }
  });
});
