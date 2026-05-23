export type Route = 'create' | 'next' | 'answers' | 'end';

export function matchRoute(method: string, path: string): Route | null {
  if (method === 'POST' && /\/sessions\/?$/.test(path)) return 'create';
  if (method === 'GET' && /\/sessions\/\d+\/next$/.test(path)) return 'next';
  if (method === 'POST' && /\/sessions\/\d+\/answers$/.test(path)) return 'answers';
  if (method === 'POST' && /\/sessions\/\d+\/end$/.test(path)) return 'end';
  return null;
}
