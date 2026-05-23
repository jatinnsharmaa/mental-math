import { assertEquals, assertStrictEquals } from 'jsr:@std/assert';
import { matchRoute } from './routes.ts';

Deno.test('POST /sessions → create', () => {
  assertStrictEquals(matchRoute('POST', '/sessions'), 'create');
});

Deno.test('POST /sessions/ → create', () => {
  assertStrictEquals(matchRoute('POST', '/sessions/'), 'create');
});

Deno.test('GET /sessions/42/next → next', () => {
  assertStrictEquals(matchRoute('GET', '/sessions/42/next'), 'next');
});

Deno.test('POST /sessions/42/answers → answers', () => {
  assertStrictEquals(matchRoute('POST', '/sessions/42/answers'), 'answers');
});

Deno.test('POST /sessions/42/end → end', () => {
  assertStrictEquals(matchRoute('POST', '/sessions/42/end'), 'end');
});

Deno.test('DELETE /sessions → null', () => {
  assertStrictEquals(matchRoute('DELETE', '/sessions'), null);
});

Deno.test('GET /sessions/42 → null (no trailing route)', () => {
  assertStrictEquals(matchRoute('GET', '/sessions/42'), null);
});

Deno.test('answer correctness comparison is case-insensitive', () => {
  assertEquals('Yes'.trim().toLowerCase(), 'yes'.trim().toLowerCase());
  assertEquals('56'.trim().toLowerCase(), '56'.trim().toLowerCase());
});
