import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    signInWithGoogle: vi.fn(),
    signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn(),
}));

import LandingPage from './page';

describe('Landing Page', () => {
  afterEach(cleanup);

  it('renders hero headline', () => {
    render(<LandingPage />);
    expect(screen.getByText('Your finances, explained by AI.')).toBeInTheDocument();
  });

  it('renders hero CTAs', () => {
    render(<LandingPage />);
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
    expect(screen.getAllByText('Join Free').length).toBeGreaterThanOrEqual(1);
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

  it('renders login button in nav', () => {
    render(<LandingPage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  it('opens auth modal when Login is clicked', async () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Login'));
    await waitFor(() => {
      expect(screen.getByText('Sign in or create your account')).toBeInTheDocument();
    });
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Send Magic Link')).toBeInTheDocument();
    expect(screen.getByText(/Test account:/)).toBeInTheDocument();
  });

  it('renders footer', () => {
    render(<LandingPage />);
    expect(screen.getByText(/© 2026 Forge Finance/)).toBeInTheDocument();
  });
});
