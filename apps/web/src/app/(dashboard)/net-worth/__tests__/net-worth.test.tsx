import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

vi.mock('@/lib/api', () => ({
  api: {
    netWorth: {
      getSummary: vi.fn().mockResolvedValue({
        net_worth: 75000,
        total_assets: 105000,
        total_liabilities: 30000,
        assets: [
          { id: '1', name: 'Checking', type: 'depository', subtype: 'checking', institution_name: 'Chase', balance: 5000 },
          { id: '2', name: '401k', type: 'investment', subtype: '401k', institution_name: 'Vanguard', balance: 100000 },
        ],
        liabilities: [
          { id: '3', name: 'Credit Card', type: 'credit', subtype: 'credit card', institution_name: 'Amex', balance: 5000 },
          { id: '4', name: 'Car Loan', type: 'loan', subtype: 'auto', institution_name: 'Wells Fargo', balance: 25000 },
        ],
      }),
      getTrend: vi.fn().mockResolvedValue({
        data: [
          { date: '2026-01-01', net_worth: 60000 },
          { date: '2026-02-01', net_worth: 68000 },
          { date: '2026-03-01', net_worth: 75000 },
        ],
        current: 75000,
      }),
    },
  },
}));

import NetWorthPage from '../page';

describe('Net Worth Page', () => {
  afterEach(cleanup);

  it('renders page title', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Net Worth' })).toBeInTheDocument();
    });
  });

  it('renders total assets card', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Assets')).toBeInTheDocument();
    });
  });

  it('renders total liabilities card', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Liabilities')).toBeInTheDocument();
    });
  });

  it('renders trend chart section', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByText('Net Worth Over Time')).toBeInTheDocument();
    });
  });

  it('renders asset accounts', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByText('Checking')).toBeInTheDocument();
    });
    expect(screen.getByText('Vanguard')).toBeInTheDocument();
  });

  it('renders liability accounts', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByText('Credit Card')).toBeInTheDocument();
    });
    expect(screen.getByText('Wells Fargo')).toBeInTheDocument();
  });

  it('renders assets section header', async () => {
    render(<NetWorthPage />);
    await waitFor(() => {
      expect(screen.getByText(/^Assets/)).toBeInTheDocument();
    });
  });
});
