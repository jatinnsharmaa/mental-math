import { getServiceClient } from './db.ts';

export type AuthedUser = { userId: string; email: string };

export async function verifyToken(req: Request): Promise<AuthedUser | null> {
  const token = req.headers.get('Authorization')?.slice(7);
  if (!token) return null;
  const supabase = getServiceClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return { userId: user.id, email: user.email! };
}
