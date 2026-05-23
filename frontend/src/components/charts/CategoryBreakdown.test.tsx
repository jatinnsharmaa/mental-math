import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CategoryBreakdown } from './CategoryBreakdown';
import type { CategoryStat } from '../../types';

const byCategory: Record<string, CategoryStat> = {
  multiplication: { total: 10, correct: 8, accuracy: 80, avgMs: 1200 },
  primes: { total: 5, correct: 3, accuracy: 60, avgMs: 1500 },
};

it('CategoryBreakdown renders without crashing', () => {
  const { container } = render(<CategoryBreakdown byCategory={byCategory} />);
  expect(container.firstChild).not.toBeNull();
});

it('CategoryBreakdown renders with empty data', () => {
  const { container } = render(<CategoryBreakdown byCategory={{}} />);
  expect(container.firstChild).not.toBeNull();
});
