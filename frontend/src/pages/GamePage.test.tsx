import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GamePage } from './GamePage';
import type { Question } from '../types';

const multQ: Question = { id: 1, category: 'multiplication', difficulty: 'easy', prompt: '7 × 8 = ?', options: ['56', '48', '63', '54'] };
const primeQ: Question = { id: 2, category: 'primes', difficulty: 'easy', prompt: 'Is 7 prime?', options: ['yes', 'no'] };

vi.mock('../stores/gameStore', () => ({
  useGameStore: (sel: (s: any) => any) => sel({
    questions: [multQ, primeQ],
    currentIndex: 0,
    answers: [],
    nextQuestion: vi.fn(),
    addAnswer: vi.fn(),
    appendQuestions: vi.fn(),
  }),
}));

vi.mock('../api/client', () => ({
  api: {
    submitAnswer: vi.fn(),
    endSession: vi.fn(),
    fetchNextBatch: vi.fn(),
  },
}));

import { api } from '../api/client';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.fetchNextBatch).mockResolvedValue({ questions: [] } as any);
});

describe('GamePage', () => {
  it('renders 4 option buttons for multiplication question', () => {
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    expect(screen.getAllByRole('button').filter(b => ['56','48','63','54'].includes(b.textContent ?? ''))).toHaveLength(4);
  });

  it('prime question has 2 options', () => {
    expect(primeQ.options).toHaveLength(2);
  });

  it('clicking an option calls api.submitAnswer', async () => {
    vi.mocked(api.submitAnswer).mockResolvedValueOnce({ isCorrect: true, correctAnswer: '56' });
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    fireEvent.click(screen.getByText('56'));
    await waitFor(() => expect(api.submitAnswer).toHaveBeenCalledWith(1, 1, '56', expect.any(Number)));
  });

  it('shows correct feedback banner after correct answer', async () => {
    vi.mocked(api.submitAnswer).mockResolvedValueOnce({ isCorrect: true, correctAnswer: '56' });
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    fireEvent.click(screen.getByText('56'));
    await waitFor(() => expect(screen.getByText('Correct!')).toBeInTheDocument());
  });

  it('shows wrong feedback with correct answer after wrong answer', async () => {
    vi.mocked(api.submitAnswer).mockResolvedValueOnce({ isCorrect: false, correctAnswer: '56' });
    render(<GamePage sessionId={1} onEnd={vi.fn()} />);
    fireEvent.click(screen.getByText('48'));
    await waitFor(() => expect(screen.getByText('Answer: 56')).toBeInTheDocument());
  });

  it('Stop button calls api.endSession and onEnd', async () => {
    vi.mocked(api.endSession).mockResolvedValueOnce({ endedAt: '2024-01-01' } as any);
    const onEnd = vi.fn();
    render(<GamePage sessionId={1} onEnd={onEnd} />);
    fireEvent.click(screen.getByText('Stop'));
    await waitFor(() => expect(api.endSession).toHaveBeenCalledWith(1));
    await waitFor(() => expect(onEnd).toHaveBeenCalled());
  });
});
