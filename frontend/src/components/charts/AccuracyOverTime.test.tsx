import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { AccuracyOverTime } from './AccuracyOverTime';
import type { DailyStat } from '../../types';

const data: DailyStat[] = [
  { date: '2024-01-01', total: 10, correct: 8, accuracy: 80, avgMs: 1200 },
  { date: '2024-01-02', total: 15, correct: 12, accuracy: 80, avgMs: 1100 },
];

it('AccuracyOverTime renders without crashing', () => {
  const { container } = render(<AccuracyOverTime data={data} />);
  expect(container.firstChild).not.toBeNull();
});

it('AccuracyOverTime renders with empty data', () => {
  const { container } = render(<AccuracyOverTime data={[]} />);
  expect(container.firstChild).not.toBeNull();
});
