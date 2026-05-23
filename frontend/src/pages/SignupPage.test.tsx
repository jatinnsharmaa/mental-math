import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignupPage } from './SignupPage';

const mockSetAuth = vi.fn();

vi.mock('../lib/supabase', () => ({
  supabase: { auth: { signUp: vi.fn() } },
}));

vi.mock('../stores/authStore', () => ({
  useAuthStore: (sel: (s: any) => any) => sel({ setAuth: mockSetAuth }),
}));

import { supabase } from '../lib/supabase';

beforeEach(() => vi.clearAllMocks());

describe('SignupPage', () => {
  it('renders name, email, password fields', () => {
    render(<SignupPage onLogin={() => {}} />);
    expect(screen.getByPlaceholderText('Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('shows check-email screen when session is null (email confirmation)', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { session: null, user: { id: 'u1', email: 'a@b.com', user_metadata: {} } },
      error: null,
    } as any);

    render(<SignupPage onLogin={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(screen.getByText(/check your email/i)).toBeInTheDocument());
    expect(mockSetAuth).not.toHaveBeenCalled();
  });

  it('calls setAuth when session is returned immediately', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: {
        session: { access_token: 'tok' },
        user: { id: 'u1', email: 'a@b.com', user_metadata: {} },
      },
      error: null,
    } as any);

    render(<SignupPage onLogin={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(mockSetAuth).toHaveBeenCalledWith('tok', expect.objectContaining({ name: 'Alice' })));
  });

  it('shows error message on signup failure', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: { session: null, user: null },
      error: { message: 'Email already registered' },
    } as any);

    render(<SignupPage onLogin={() => {}} />);
    fireEvent.change(screen.getByPlaceholderText('Name'), { target: { value: 'Alice' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByPlaceholderText(/password/i), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => expect(screen.getByText('Email already registered')).toBeInTheDocument());
  });
});
