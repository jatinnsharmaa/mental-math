import { it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ResponseTimeChart } from './ResponseTimeChart';
import type { DailyStat } from '../../types';

const data: DailyStat[] = [{ date: '2024-01-01', total: 10, correct: 8, accuracy: 80, avgMs: 1200 }];

it('ResponseTimeChart renders without crashing', () => {
  const { container } = render(<ResponseTimeChart data={data} />);
  expect(container.firstChild).not.toBeNull();
});
