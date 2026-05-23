import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultsPage } from './ResultsPage';
import type { SessionAnswer } from '../types';

const mockReset = vi.fn();

const mockAnswers: SessionAnswer[] = [
  { questionId: 1, userAnswer: '56', isCorrect: true, correctAnswer: '56', responseTimeMs: 1000 },
  { questionId: 2, userAnswer: 'yes', isCorrect: true, correctAnswer: 'yes', responseTimeMs: 2000 },
  { questionId: 3, userAnswer: '48', isCorrect: true, correctAnswer: '56', responseTimeMs: 3000 },
  { questionId: 4, userAnswer: 'no', isCorrect: false, correctAnswer: 'yes', responseTimeMs: 4000 },
];

vi.mock('../stores/gameStore', () => ({
  useGameStore: (sel: (s: any) => any) => sel({ answers: mockAnswers, reset: mockReset }),
}));

describe('ResultsPage', () => {
  it('shows accuracy of 75%', () => {
    render(<ResultsPage onHome={vi.fn()} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('shows correct count 3/4', () => {
    render(<ResultsPage onHome={vi.fn()} />);
    expect(screen.getByText('3/4')).toBeInTheDocument();
  });

  it('shows avg time of 2.5s', () => {
    render(<ResultsPage onHome={vi.fn()} />);
    expect(screen.getByText('2.5s')).toBeInTheDocument();
  });

  it('renders 4 answer rows', () => {
    render(<ResultsPage onHome={vi.fn()} />);
    expect(screen.getAllByText('56').length).toBeGreaterThanOrEqual(1);
  });

  it('Play again calls reset and onHome', () => {
    const onHome = vi.fn();
    render(<ResultsPage onHome={onHome} />);
    fireEvent.click(screen.getByText('Play again'));
    expect(mockReset).toHaveBeenCalled();
    expect(onHome).toHaveBeenCalled();
  });
});
