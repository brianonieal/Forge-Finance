import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  AreaChart: ({ children }: any) => <div>{children}</div>,
  Area: () => null,
  PieChart: ({ children }: any) => <div>{children}</div>,
  Pie: ({ children }: any) => <div>{children}</div>,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
}));

vi.mock('@/lib/api', () => ({
  api: {
    investments: {
      getHoldings: vi.fn().mockResolvedValue({
        holdings: [
          { id: '1', name: 'Brokerage', official_name: null, type: 'investment', subtype: 'brokerage', institution_name: 'Fidelity', balance: 25000, currency: 'USD' },
          { id: '2', name: '401k', official_name: null, type: 'investment', subtype: '401k', institution_name: 'Vanguard', balance: 80000, currency: 'USD' },
        ],
        total_value: 105000,
        allocation: [
          { type: 'brokerage', value: 25000, percent: 24 },
          { type: '401k', value: 80000, percent: 76 },
        ],
      }),
      getPerformance: vi.fn().mockResolvedValue({
        data: [
          { date: '2026-01-01', value: 90000 },
          { date: '2026-02-01', value: 95000 },
          { date: '2026-03-01', value: 105000 },
        ],
        total_value: 105000,
        total_gain: 15000,
      }),
    },
  },
}));

import InvestmentsPage from '../page';

describe('Investments Page', () => {
  afterEach(cleanup);

  it('renders page title', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Investments')).toBeInTheDocument();
    });
  });

  it('renders portfolio value card', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Portfolio Value')).toBeInTheDocument();
    });
  });

  it('renders total gain/loss card', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Gain/Loss')).toBeInTheDocument();
    });
  });

  it('renders holdings table', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Holdings')).toBeInTheDocument();
    });
    expect(screen.getByText('Fidelity')).toBeInTheDocument();
    expect(screen.getByText('Vanguard')).toBeInTheDocument();
  });

  it('renders allocation section', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Asset Allocation')).toBeInTheDocument();
    });
  });

  it('renders performance chart section', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Portfolio Performance')).toBeInTheDocument();
    });
  });

  it('renders accounts count', async () => {
    render(<InvestmentsPage />);
    await waitFor(() => {
      expect(screen.getByText('Accounts')).toBeInTheDocument();
    });
  });
});
