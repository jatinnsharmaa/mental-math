import { assertEquals, assertStrictEquals } from 'jsr:@std/assert';
import { corsHeaders, handleCors } from './cors.ts';

Deno.test('handleCors returns 200 response for OPTIONS', async () => {
  const req = new Request('http://localhost/', { method: 'OPTIONS' });
  const res = handleCors(req);
  assertStrictEquals(res?.status, 200);
  assertEquals(res?.headers.get('Access-Control-Allow-Origin'), '*');
});

Deno.test('handleCors returns null for non-OPTIONS requests', () => {
  const req = new Request('http://localhost/', { method: 'GET' });
  assertStrictEquals(handleCors(req), null);
});

Deno.test('corsHeaders contains required keys', () => {
  assertEquals(corsHeaders['Access-Control-Allow-Origin'], '*');
  assertEquals(typeof corsHeaders['Access-Control-Allow-Headers'], 'string');
});
