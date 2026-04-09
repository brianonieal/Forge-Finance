import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    signInWithGoogle: vi.fn(),
    signInWithMagicLink: vi.fn().mockResolvedValue({ error: null }),
  }),
}));

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn(),
}));

import LandingPage from '../page';

describe('Auth Modal Integration', () => {
  afterEach(cleanup);

  it('hero Join Free button opens auth modal', () => {
    render(<LandingPage />);
    const joinButtons = screen.getAllByText('Join Free');
    fireEvent.click(joinButtons[0]);
    expect(screen.getByText('Sign in or create your account')).toBeInTheDocument();
  });

  it('modal can be closed with X button', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText('Sign in or create your account')).toBeInTheDocument();
    const closeButton = screen.getByText('Sign in or create your account')
      .closest('.relative')!
      .querySelector('button');
    fireEvent.click(closeButton!);
    expect(screen.queryByText('Sign in or create your account')).not.toBeInTheDocument();
  });

  it('modal shows test account credentials', () => {
    render(<LandingPage />);
    fireEvent.click(screen.getByText('Login'));
    expect(screen.getByText(/Test account: username user/)).toBeInTheDocument();
  });
});
