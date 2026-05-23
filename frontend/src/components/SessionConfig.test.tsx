import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SessionConfig } from './SessionConfig';

describe('SessionConfig', () => {
  it('renders all 5 category buttons', () => {
    render(<SessionConfig onStart={vi.fn()} loading={false} />);
    expect(screen.getByText('Multiplication')).toBeInTheDocument();
    expect(screen.getByText('Primes')).toBeInTheDocument();
    expect(screen.getByText('Squares & Cubes')).toBeInTheDocument();
    expect(screen.getByText('Roots')).toBeInTheDocument();
    expect(screen.getByText('Fractions')).toBeInTheDocument();
  });

  it('renders 3 difficulty buttons', () => {
    render(<SessionConfig onStart={vi.fn()} loading={false} />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Medium')).toBeInTheDocument();
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('Start button is disabled when no selections', () => {
    render(<SessionConfig onStart={vi.fn()} loading={false} />);
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('Start button is disabled when only category selected (no difficulty)', () => {
    render(<SessionConfig onStart={vi.fn()} loading={false} />);
    fireEvent.click(screen.getByText('Multiplication'));
    fireEvent.click(screen.getByText('Medium')); // deselect pre-selected medium
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });

  it('Start button enabled when both category and difficulty selected', () => {
    render(<SessionConfig onStart={vi.fn()} loading={false} />);
    fireEvent.click(screen.getByText('Multiplication'));
    fireEvent.click(screen.getByText('Easy'));
    expect(screen.getByRole('button', { name: /start/i })).not.toBeDisabled();
  });

  it('calls onStart with selected categories and difficulties', () => {
    const onStart = vi.fn();
    render(<SessionConfig onStart={onStart} loading={false} />);
    fireEvent.click(screen.getByText('Multiplication'));
    fireEvent.click(screen.getByText('Primes'));
    fireEvent.click(screen.getByText('Medium')); // deselect pre-selected medium
    fireEvent.click(screen.getByText('Easy'));
    fireEvent.click(screen.getByRole('button', { name: /start/i }));
    expect(onStart).toHaveBeenCalledWith(['multiplication', 'primes'], ['easy']);
  });

  it('deselects a category on second click', () => {
    const onStart = vi.fn();
    render(<SessionConfig onStart={onStart} loading={false} />);
    fireEvent.click(screen.getByText('Multiplication'));
    fireEvent.click(screen.getByText('Multiplication')); // deselect
    fireEvent.click(screen.getByText('Easy'));
    expect(screen.getByRole('button', { name: /start/i })).toBeDisabled();
  });
});
