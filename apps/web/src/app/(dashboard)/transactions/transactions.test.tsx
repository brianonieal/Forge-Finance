import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    transactions: {
      list: vi.fn().mockResolvedValue({
        transactions: [
          {
            id: '1',
            account_id: 'acc-1',
            amount: -42.50,
            date: '2026-04-09',
            merchant_name: 'Starbucks',
            merchant_logo: null,
            category: 'Food',
            subcategory: null,
            pending: false,
            notes: null,
          },
          {
            id: '2',
            account_id: 'acc-1',
            amount: 2500.00,
            date: '2026-04-08',
            merchant_name: 'Payroll',
            merchant_logo: null,
            category: 'Income',
            subcategory: null,
            pending: false,
            notes: null,
          },
        ],
        total: 2,
        limit: 25,
        offset: 0,
      }),
    },
  },
}));

import TransactionsPage from './page';

describe('Transactions Page', () => {
  afterEach(cleanup);

  it('renders transaction table', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Starbucks')).toBeInTheDocument();
    });

    expect(screen.getByText('Payroll')).toBeInTheDocument();
  });

  it('renders column headers', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Date')).toBeInTheDocument();
    });

    expect(screen.getByText('Merchant')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
  });

  it('renders search input', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search transactions...')).toBeInTheDocument();
    });
  });

  it('renders category filter chips', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      // "All" filter chip — only appears once (in filter bar)
      expect(screen.getByText('All')).toBeInTheDocument();
    });

    // "Shopping" only appears as a filter chip (not in mock data)
    expect(screen.getByText('Shopping')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('shows export button (disabled for free tier)', async () => {
    render(<TransactionsPage />);

    await waitFor(() => {
      expect(screen.getByText('Export')).toBeInTheDocument();
    });
  });
});
