import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuestionCard } from './QuestionCard';
import type { Question } from '../types';

const q: Question = { id: 1, category: 'squares_cubes', difficulty: 'hard', prompt: '15² = ?', answer: '225', options: ['225', '200', '250', '210'] };

describe('QuestionCard', () => {
  it('renders the prompt text', () => {
    render(<QuestionCard question={q} />);
    expect(screen.getByText('15² = ?')).toBeInTheDocument();
  });

  it('renders human-readable category label', () => {
    render(<QuestionCard question={q} />);
    expect(screen.getByText('Squares & Cubes')).toBeInTheDocument();
  });

  it('renders difficulty capitalized', () => {
    render(<QuestionCard question={q} />);
    expect(screen.getByText('hard')).toBeInTheDocument();
  });

  it('renders "Primes" label for primes category', () => {
    const pq: Question = { ...q, category: 'primes', prompt: 'Is 7 prime?' };
    render(<QuestionCard question={pq} />);
    expect(screen.getByText('Primes')).toBeInTheDocument();
  });
});
