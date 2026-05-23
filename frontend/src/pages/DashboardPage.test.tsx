import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { DashboardPage } from './DashboardPage';

vi.mock('../api/client', () => ({
  api: {
    getAnalyticsSummary: vi.fn(),
    getDailyAnalytics: vi.fn(),
  },
}));

import { api } from '../api/client';

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(api.getDailyAnalytics).mockResolvedValue({ daily: [] } as any);
});

describe('DashboardPage', () => {
  it('shows loading initially', () => {
    vi.mocked(api.getAnalyticsSummary).mockReturnValue(new Promise(() => {}));
    render(<DashboardPage onHome={vi.fn()} />);
    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('shows stats after summary loads', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValueOnce({
      totalAnswered: 42, accuracy: 78, avgResponseMs: 1800,
      byCategory: {}, byDifficulty: {},
    } as any);
    render(<DashboardPage onHome={vi.fn()} />);
    await waitFor(() => expect(screen.getByText('78%')).toBeInTheDocument());
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('shows empty state when totalAnswered is 0', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValueOnce({
      totalAnswered: 0, accuracy: 0, avgResponseMs: 0, byCategory: {}, byDifficulty: {},
    } as any);
    render(<DashboardPage onHome={vi.fn()} />);
    await waitFor(() => expect(screen.getByText(/play a session/i)).toBeInTheDocument());
  });

  it('calls getDailyAnalytics with 14 when 14d button clicked', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValueOnce({
      totalAnswered: 5, accuracy: 80, avgResponseMs: 1200, byCategory: {}, byDifficulty: {},
    } as any);
    render(<DashboardPage onHome={vi.fn()} />);
    await waitFor(() => screen.getByText('14d'));
    fireEvent.click(screen.getByText('14d'));
    expect(api.getDailyAnalytics).toHaveBeenCalledWith(14);
  });

  it('Back button calls onHome', async () => {
    vi.mocked(api.getAnalyticsSummary).mockResolvedValueOnce({
      totalAnswered: 0, accuracy: 0, avgResponseMs: 0, byCategory: {}, byDifficulty: {},
    } as any);
    const onHome = vi.fn();
    render(<DashboardPage onHome={onHome} />);
    await waitFor(() => screen.getByText('Back'));
    fireEvent.click(screen.getByText('Back'));
    expect(onHome).toHaveBeenCalled();
  });
});
