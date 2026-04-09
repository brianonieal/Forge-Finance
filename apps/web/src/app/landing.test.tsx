import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import LandingPage from './page';

describe('Landing Page', () => {
  afterEach(cleanup);

  it('renders hero headline', () => {
    render(<LandingPage />);
    expect(screen.getByText('Your finances, explained by AI.')).toBeInTheDocument();
  });

  it('renders hero CTAs', () => {
    render(<LandingPage />);
    expect(screen.getByText('Join the Waitlist')).toBeInTheDocument();
    expect(screen.getByText('See How It Works')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<LandingPage />);
    expect(screen.getByText('Conversational AI')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Sync')).toBeInTheDocument();
    expect(screen.getByText('Smart Budgets & Goals')).toBeInTheDocument();
  });

  it('renders pricing tiers with JetBrains Mono amounts', () => {
    render(<LandingPage />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Join Free')).toBeInTheDocument();
    expect(screen.getByText('Join Waitlist for Pro')).toBeInTheDocument();
  });

  it('renders waitlist form and shows success on submit', async () => {
    render(<LandingPage />);

    const emailInput = screen.getByPlaceholderText('your@email.com');
    expect(emailInput).toBeInTheDocument();

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.submit(emailInput.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText("You're on the list!")).toBeInTheDocument();
    });
  });

  it('renders privacy note', () => {
    render(<LandingPage />);
    expect(screen.getByText("We'll never share your email.")).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<LandingPage />);
    expect(screen.getByText(/© 2026 Forge Finance/)).toBeInTheDocument();
  });
});
