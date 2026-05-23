import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { HomePage } from './HomePage';

vi.mock('../stores/authStore', () => ({
  useAuthStore: (sel: (s: any) => any) => sel({ user: { id: 'u1', email: 'a@b.com', name: 'Alice' }, logout: vi.fn() }),
}));

vi.mock('../stores/gameStore', () => ({
  useGameStore: (sel: (s: any) => any) => sel({ setQuestions: vi.fn() }),
}));

vi.mock('../api/client', () => ({
  api: { startSession: vi.fn() },
}));

import { api } from '../api/client';

beforeEach(() => vi.clearAllMocks());

describe('HomePage', () => {
  it('renders user name', () => {
    render(<HomePage onStart={vi.fn()} onDashboard={vi.fn()} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  it('calls api.startSession and onStart when session config submitted', async () => {
    vi.mocked(api.startSession).mockResolvedValueOnce({ sessionId: 42, questions: [] } as any);
    const onStart = vi.fn();
    render(<HomePage onStart={onStart} onDashboard={vi.fn()} />);

    fireEvent.click(screen.getByText('Multiplication'));
    fireEvent.click(screen.getByText('Easy'));
    fireEvent.click(screen.getByRole('button', { name: /start/i }));

    await waitFor(() => expect(api.startSession).toHaveBeenCalledWith(['multiplication'], ['easy']));
    await waitFor(() => expect(onStart).toHaveBeenCalledWith(42));
  });
});
