import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Timer } from './Timer';

afterEach(() => vi.useRealTimers());

describe('Timer', () => {
  it('renders 0.0s initially', () => {
    vi.useFakeTimers();
    render(<Timer startedAt={Date.now()} />);
    expect(screen.getByText('0.0s')).toBeInTheDocument();
  });

  it('updates to ~1.0s after 1100ms', () => {
    vi.useFakeTimers();
    const startedAt = Date.now();
    render(<Timer startedAt={startedAt} />);
    act(() => { vi.advanceTimersByTime(1100); });
    expect(screen.getByText(/1\.\ds/)).toBeInTheDocument();
  });
});
