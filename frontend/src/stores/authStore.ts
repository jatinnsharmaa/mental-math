import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '../types';

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: async () => {
        await supabase.auth.signOut();
        set({ token: null, user: null });
      },
      restoreSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          set({
            token: session.access_token,
            user: { id: session.user.id, email: session.user.email!, name: (session.user.user_metadata?.name as string) ?? '' },
          });
        }
      },
    }),
    { name: 'auth' }
  )
);
