export type Route = 'create' | 'next' | 'answers_batch' | 'end';

export function matchRoute(method: string, path: string): Route | null {
  if (method === 'POST' && /\/sessions\/?$/.test(path)) return 'create';
  if (method === 'POST' && /\/sessions\/\d+\/next$/.test(path)) return 'next';
  if (method === 'POST' && /\/sessions\/\d+\/answers\/batch$/.test(path)) return 'answers_batch';
  if (method === 'POST' && /\/sessions\/\d+\/end$/.test(path)) return 'end';
  return null;
}
