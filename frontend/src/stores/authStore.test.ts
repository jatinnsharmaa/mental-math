import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      signOut: vi.fn().mockResolvedValue({}),
      getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    },
  },
}));

beforeEach(() => {
  useAuthStore.setState({ token: null, user: null });
});

describe('setAuth', () => {
  it('stores token and user', () => {
    const user = { id: 'u1', email: 'a@b.com', name: 'Alice' };
    useAuthStore.getState().setAuth('tok123', user);
    expect(useAuthStore.getState().token).toBe('tok123');
    expect(useAuthStore.getState().user).toEqual(user);
  });
});

describe('logout', () => {
  it('clears token and user', async () => {
    useAuthStore.setState({ token: 'tok', user: { id: 'u', email: 'e@e.com', name: 'N' } });
    await useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });
});
