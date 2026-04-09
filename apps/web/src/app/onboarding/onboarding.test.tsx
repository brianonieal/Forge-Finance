import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock react-plaid-link
vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: vi.fn(), ready: true }),
}));

// Mock the API
vi.mock('@/lib/api', () => ({
  api: {
    plaid: {
      createLinkToken: vi.fn().mockResolvedValue({ link_token: 'test-token' }),
      exchangePublicToken: vi.fn().mockResolvedValue({ item_id: 'test', accounts_created: 2 }),
      getAccounts: vi.fn().mockResolvedValue({ accounts: [] }),
    },
  },
}));

// Mock the hook
vi.mock('@/hooks/use-plaid-link', () => ({
  usePlaidConnect: () => ({
    open: vi.fn(),
    ready: true,
    isExchanging: false,
    error: null,
  }),
}));

import OnboardingPage from './page';

describe('Onboarding Page', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders step 1 welcome screen', () => {
    render(<OnboardingPage />);
    expect(screen.getByText('Welcome to Forge Finance')).toBeInTheDocument();
    expect(screen.getByText('Step 1 of 4')).toBeInTheDocument();
  });

  it('shows progress bar at 25%', () => {
    render(<OnboardingPage />);
    const progressBar = document.querySelector('[style*="width: 25%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('advances to step 2 when CTA is clicked', () => {
    render(<OnboardingPage />);

    // Click the first button (Connect Your Bank CTA)
    const ctaButtons = screen.getAllByRole('button');
    fireEvent.click(ctaButtons[0]);

    // Step 2 shows bank connection UI
    expect(screen.getByText('Connect Bank Account')).toBeInTheDocument();
    expect(screen.getByText(/256-bit encryption/)).toBeInTheDocument();
  });
});
