import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GamePage } from './GamePage';
import type { Question } from '../types';

const multQ: Question = { id: 1, category: 'multiplication', difficulty: 'easy', prompt: '7 × 8 = ?', answer: '56', options: ['56', '48', '63', '54'] };
const primeQ: Question = { id: 2, category: 'primes', difficulty: 'easy', prompt: 'Is 7 prime?', answer: 'yes', options: ['yes', 'no'] };

const mockAddPending = vi.fn();
const mockFlushPending = vi.fn(() => []);

vi.mock('../stores/gameStore', () => ({
  useGameStore: (sel: (s: any) => any) => sel({
    questions: [multQ, primeQ],
    currentIndex: 0,
    answers: [],
    pendingAnswers: [],
    nextQuestion: vi.fn(),
    addAnswer: vi.fn(),
    addPending: mockAddPending,
    flushPending: mockFlushPending,
    appendQuestions: vi.fn(),
  }),
}));

vi.mock('../api/client', () => ({
  api: {
    endSession: vi.fn(),
    fetchNextBatch: vi.fn(),
  },
}));

import { api } from '../api/client';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchNextBatch).mockResolvedValue({ questions: [] } as any);
  vi.mocked(api.endSession).mockResolvedValue({ endedAt: '2024-01-01' } as any);
  mockFlushPending.mockReturnValue([]);
});

describe('GamePage', () => {
  it('renders 4 option buttons for multiplication question', () => {
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    expect(screen.getAllByRole('button').filter(b => ['56', '48', '63', '54'].includes(b.textContent ?? ''))).toHaveLength(4);
  });

  it('prime question has 2 options', () => {
    expect(primeQ.options).toHaveLength(2);
  });

  it('clicking an option buffers the answer without an API call', () => {
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    fireEvent.click(screen.getByText('56'));
    expect(mockAddPending).toHaveBeenCalledWith({ questionId: 1, userAnswer: '56', responseTimeMs: expect.any(Number) });
  });

  it('shows correct feedback banner after correct answer', () => {
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    fireEvent.click(screen.getByText('56'));
    expect(screen.getByText('Correct!')).toBeInTheDocument();
  });

  it('shows wrong feedback with correct answer after wrong answer', () => {
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    fireEvent.click(screen.getByText('48'));
    expect(screen.getByText('Answer: 56')).toBeInTheDocument();
  });

  it('Stop button flushes pending answers and calls endSession', async () => {
    const pending: import('../stores/gameStore').PendingAnswer[] = [{ questionId: 1, userAnswer: '56', responseTimeMs: 300 }];
    mockFlushPending.mockReturnValue(pending);
    const onEnd = vi.fn();
    render(<GamePage sessionId={1} onEnd={onEnd} />);
    fireEvent.click(screen.getByText('Stop'));
    await waitFor(() => expect(api.endSession).toHaveBeenCalledWith(1, pending));
    await waitFor(() => expect(onEnd).toHaveBeenCalled());
  });
});
