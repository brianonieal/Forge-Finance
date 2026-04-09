import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  BarChart: ({ children }: any) => <div>{children}</div>,
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  Tooltip: () => null,
  CartesianGrid: () => null,
  Legend: () => null,
}));

vi.mock('@/lib/api', () => ({
  api: {
    reports: {
      getMonthlySummary: vi.fn().mockResolvedValue({
        months: [
          { year: 2026, month: 1, income: 5000, expenses: 3200, net: 1800 },
          { year: 2026, month: 2, income: 5200, expenses: 2800, net: 2400 },
          { year: 2026, month: 3, income: 4800, expenses: 3500, net: 1300 },
        ],
      }),
      getCategoryTrends: vi.fn().mockResolvedValue({
        categories: [
          { category: 'Food', total: 1200, count: 45 },
          { category: 'Transport', total: 800, count: 22 },
          { category: 'Entertainment', total: 500, count: 15 },
        ],
      }),
    },
  },
}));

import ReportsPage from './page';

describe('Reports Page', () => {
  afterEach(cleanup);

  it('renders page title', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
    });
  });

  it('renders summary cards', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
    });
    expect(screen.getByText('Total Expenses')).toBeInTheDocument();
    expect(screen.getByText('Net')).toBeInTheDocument();
  });

  it('renders monthly chart section', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Monthly Income vs Expenses')).toBeInTheDocument();
    });
  });

  it('renders category breakdown section', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Spending by Category')).toBeInTheDocument();
    });
  });

  it('renders category items with amounts', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Entertainment')).toBeInTheDocument();
  });

  it('renders transaction counts', async () => {
    render(<ReportsPage />);
    await waitFor(() => {
      expect(screen.getByText('(45 txns)')).toBeInTheDocument();
    });
  });
});
