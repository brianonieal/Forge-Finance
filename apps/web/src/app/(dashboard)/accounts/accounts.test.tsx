import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// Mock react-plaid-link
vi.mock('react-plaid-link', () => ({
  usePlaidLink: () => ({ open: vi.fn(), ready: true }),
}));

// Mock the Plaid hook
vi.mock('@/hooks/use-plaid-link', () => ({
  usePlaidConnect: () => ({
    open: vi.fn(),
    ready: true,
    isExchanging: false,
    error: null,
  }),
}));

// Mutable accounts data for different test scenarios
let mockAccounts: any[] = [];

vi.mock('@/lib/api', () => ({
  api: {
    plaid: {
      createLinkToken: vi.fn().mockResolvedValue({ link_token: 'test' }),
      getAccounts: vi.fn().mockImplementation(() =>
        Promise.resolve({ accounts: mockAccounts }),
      ),
    },
  },
}));

import AccountsPage from './page';

describe('Accounts Page', () => {
  afterEach(() => {
    cleanup();
    mockAccounts = [];
  });

  it('shows empty state when no accounts', async () => {
    mockAccounts = [];
    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('No accounts connected')).toBeInTheDocument();
    });

    expect(screen.getByText('Connect Your First Account')).toBeInTheDocument();
  });

  it('shows account cards when accounts exist', async () => {
    mockAccounts = [
      {
        id: '1',
        name: 'Chase Checking',
        official_name: 'TOTAL CHECKING',
        type: 'depository',
        subtype: 'checking',
        mask: '1234',
        institution_name: 'Chase',
        institution_logo: null,
        balance_current: 5432.10,
        balance_available: 5000.00,
        currency: 'USD',
        plaid_item_id: 'item-1',
        last_synced: new Date().toISOString(),
      },
    ];

    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByText('Chase Checking')).toBeInTheDocument();
    });

    expect(screen.getByText('Chase')).toBeInTheDocument();
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('renders page header', async () => {
    mockAccounts = [];
    render(<AccountsPage />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Accounts' })).toBeInTheDocument();
    });
  });
});
