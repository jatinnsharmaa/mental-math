import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginPage } from './LoginPage';

const mockSetAuth = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: { auth: { signInWithPassword: vi.fn() } },
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: (sel: (s: any) => any) => sel({ setAuth: mockSetAuth }),
}));

import { supabase } from '../lib/supabase';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('LoginPage', () => {
  it('renders email, password fields and sign-in button', () => {
    render(<LoginPage onSignup={() => {}} />);
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls setAuth on successful login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'u1', email: 'a@b.com', user_metadata: { name: 'Alice' } },
      },
      error: null,
    } as any);

    render(<LoginPage onSignup={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(mockSetAuth).toHaveBeenCalledWith('tok', expect.objectContaining({ email: 'a@b.com' })));
  });

  it('shows error message on failed login', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'Invalid credentials' },
    } as any);

    render(<LoginPage onSignup={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(screen.getByText('Invalid credentials')).toBeInTheDocument());
  });
});
