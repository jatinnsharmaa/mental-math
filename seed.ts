import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

export type Q = { category: string; difficulty: string; prompt: string; answer: string };

export function buildQuestions(): Q[] {
  const questions: Q[] = [];

  // Multiplication tables 1–30 × 1–10
  for (let t = 1; t <= 30; t++) {
    const difficulty = t <= 10 ? 'easy' : t <= 20 ? 'medium' : 'hard';
    for (let m = 1; m <= 10; m++) {
      questions.push({ category: 'multiplication', difficulty, prompt: `${t} × ${m} = ?`, answer: String(t * m) });
    }
  }

  // Primes: 2–293
  const PRIME_SET = new Set([
    2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,
    53,59,61,67,71,73,79,83,89,97,
    101,103,107,109,113,127,131,137,139,149,151,157,163,167,173,179,181,191,193,197,199,
    211,223,227,229,233,239,241,251,257,263,269,271,277,281,283,293,
  ]);
  for (let n = 2; n <= 293; n++) {
    if (n !== 2 && n % 2 === 0) continue;
    const difficulty = n <= 50 ? 'easy' : n <= 150 ? 'medium' : 'hard';
    questions.push({ category: 'primes', difficulty, prompt: `Is ${n} a prime number?`, answer: PRIME_SET.has(n) ? 'yes' : 'no' });
  }

  // Squares and cubes 1–30
  const SC = [
    {n:1,sq:1,cb:1},{n:2,sq:4,cb:8},{n:3,sq:9,cb:27},{n:4,sq:16,cb:64},
    {n:5,sq:25,cb:125},{n:6,sq:36,cb:216},{n:7,sq:49,cb:343},{n:8,sq:64,cb:512},
    {n:9,sq:81,cb:729},{n:10,sq:100,cb:1000},{n:11,sq:121,cb:1331},{n:12,sq:144,cb:1728},
    {n:13,sq:169,cb:2197},{n:14,sq:196,cb:2744},{n:15,sq:225,cb:3375},{n:16,sq:256,cb:4096},
    {n:17,sq:289,cb:4913},{n:18,sq:324,cb:5832},{n:19,sq:361,cb:6859},{n:20,sq:400,cb:8000},
    {n:21,sq:441,cb:9261},{n:22,sq:484,cb:10648},{n:23,sq:529,cb:12167},{n:24,sq:576,cb:13824},
    {n:25,sq:625,cb:15625},{n:26,sq:676,cb:17576},{n:27,sq:729,cb:19683},{n:28,sq:784,cb:21952},
    {n:29,sq:841,cb:24389},{n:30,sq:900,cb:27000},
  ];
  for (const r of SC) {
    const difficulty = r.n <= 10 ? 'easy' : r.n <= 20 ? 'medium' : 'hard';
    questions.push({ category: 'squares_cubes', difficulty, prompt: `${r.n}² = ?`, answer: String(r.sq) });
    questions.push({ category: 'squares_cubes', difficulty, prompt: `${r.n}³ = ?`, answer: String(r.cb) });
  }

  // Roots 1–10
  const ROOTS = [
    {n:1,sq:'1',cb:'1'},{n:2,sq:'1.41',cb:'1.26'},{n:3,sq:'1.73',cb:'1.44'},
    {n:4,sq:'2',cb:'1.59'},{n:5,sq:'2.24',cb:'1.71'},{n:6,sq:'2.45',cb:'1.82'},
    {n:7,sq:'2.65',cb:'1.91'},{n:8,sq:'2.83',cb:'2'},{n:9,sq:'3',cb:'2.08'},
    {n:10,sq:'3.16',cb:'2.15'},
  ];
  for (const r of ROOTS) {
    const difficulty = r.n <= 4 ? 'easy' : r.n <= 7 ? 'medium' : 'hard';
    questions.push({ category: 'roots', difficulty, prompt: `√${r.n} = ? (2 dp)`, answer: r.sq });
    questions.push({ category: 'roots', difficulty, prompt: `∛${r.n} = ? (2 dp)`, answer: r.cb });
  }

  // Fractions: all n/d where 1 ≤ n < d ≤ 30
  for (let d = 2; d <= 30; d++) {
    const difficulty = d <= 5 ? 'easy' : d <= 12 ? 'medium' : 'hard';
    for (let n = 1; n < d; n++) {
      const dec = Math.round((n / d) * 100) / 100;
      questions.push({ category: 'fractions', difficulty, prompt: `${n}/${d} as a decimal?`, answer: String(dec) });
    }
  }

  return questions;
}

// Only runs when invoked directly: npx tsx seed.ts
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const db = new PrismaClient();
  async function main() {
    await db.sessionAnswer.deleteMany();
    await db.session.deleteMany();
    await db.question.deleteMany();
    await db.question.createMany({ data: buildQuestions() });
    console.log(`Seeded ${buildQuestions().length} questions`);
    await db.$disconnect();
  }
  main().catch(e => { console.error(e); process.exit(1); });
}
