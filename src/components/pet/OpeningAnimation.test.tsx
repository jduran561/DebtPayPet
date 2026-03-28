import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { OpeningAnimation } from './OpeningAnimation';

// Mock useConfetti
vi.mock('../../hooks/useConfetti', () => ({
  useConfetti: () => ({ triggerBig: vi.fn() }),
}));

// Use fake timers so we can control animation phases
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('OpeningAnimation', () => {
  it('renders the egg on mount', () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);
    expect(screen.getByText('🥚')).toBeInTheDocument();
  });

  it('shows the name input after animation completes', async () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    // Advance through all animation phases (total ~2400ms)
    await act(async () => { vi.advanceTimersByTime(3000); });

    expect(screen.getByPlaceholderText('Penny')).toBeInTheDocument();
    expect(screen.getByText("Let's go! →")).toBeInTheDocument();
  });

  it('calls onComplete with the default name "Penny" when submitted without changes', async () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    await act(async () => { vi.advanceTimersByTime(3000); });

    fireEvent.click(screen.getByText("Let's go! →"));
    expect(onComplete).toHaveBeenCalledWith('Penny');
  });

  it('calls onComplete with custom name when user types one', async () => {
    const onComplete = vi.fn();
    render(<OpeningAnimation onComplete={onComplete} />);

    await act(async () => { vi.advanceTimersByTime(3000); });

    const input = screen.getByPlaceholderText('Penny');
    fireEvent.change(input, { target: { value: 'Sparky' } });
    fireEvent.click(screen.getByText("Let's go! →"));

    expect(onComplete).toHaveBeenCalledWith('Sparky');
  });
});
