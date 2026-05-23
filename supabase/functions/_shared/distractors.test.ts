import { assertEquals, assert } from 'jsr:@std/assert';
import { generateOptions, formatQuestion } from './distractors.ts';

Deno.test('primes: returns exactly [yes, no] in any order', () => {
  const opts = generateOptions('primes', 'yes');
  assertEquals(opts.length, 2);
  assert(opts.includes('yes'));
  assert(opts.includes('no'));
});

Deno.test('primes: same options when answer is no', () => {
  const opts = generateOptions('primes', 'no');
  assertEquals(opts.length, 2);
  assert(opts.includes('yes') && opts.includes('no'));
});

Deno.test('multiplication: 4 options, correct included, all same last digit', () => {
  const opts = generateOptions('multiplication', '56');
  assertEquals(opts.length, 4);
  assert(opts.includes('56'));
  assertEquals(new Set(opts).size, 4);
  assert(opts.every(o => parseInt(o) % 10 === 6));
});

Deno.test('multiplication: small answer (1) still produces 4 valid options', () => {
  const opts = generateOptions('multiplication', '1');
  assertEquals(opts.length, 4);
  assert(opts.includes('1'));
  assert(opts.every(o => parseInt(o) > 0 && parseInt(o) % 10 === 1));
});

Deno.test('squares_cubes: 4 options, all positive, no duplicates, same last digit', () => {
  const opts = generateOptions('squares_cubes', '6859'); // 19³
  assertEquals(opts.length, 4);
  assert(opts.includes('6859'));
  assertEquals(new Set(opts).size, 4);
  assert(opts.every(o => parseInt(o) > 0 && parseInt(o) % 10 === 9));
});

Deno.test('squares_cubes: works for small values like 5²=25', () => {
  const opts = generateOptions('squares_cubes', '25');
  assertEquals(opts.length, 4);
  assert(opts.includes('25'));
  assert(opts.every(o => parseInt(o) % 10 === 5));
});

Deno.test('roots: 4 options including correct answer, no duplicates', () => {
  const opts = generateOptions('roots', '1.41');
  assertEquals(opts.length, 4);
  assert(opts.includes('1.41'));
  assertEquals(new Set(opts).size, 4);
});

Deno.test('fractions: 4 options including correct answer', () => {
  const opts = generateOptions('fractions', '0.25');
  assertEquals(opts.length, 4);
  assert(opts.includes('0.25'));
});

Deno.test('formatQuestion strips answer field and adds options', () => {
  const q = { id: 1, category: 'multiplication', difficulty: 'easy', prompt: '7 × 8 = ?', answer: '56' };
  const formatted = formatQuestion(q);
  assert(!('answer' in formatted));
  assertEquals(formatted.options.length, 4);
  assert(formatted.options.includes('56'));
  assertEquals(formatted.id, 1);
  assertEquals(formatted.prompt, '7 × 8 = ?');
});
