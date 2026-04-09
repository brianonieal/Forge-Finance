import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// Mock Recharts (doesn't render in jsdom)
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

vi.mock('@/stores/ui-store', () => ({
  useUIStore: (selector: any) => selector({ period: '1M' }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    dashboard: {
      getMetrics: vi.fn().mockResolvedValue({
        net_worth: 25000,
        daily_pnl: 150.50,
        budget_health: 85,
        top_spend: { category: 'Food', amount: 450 },
        period: '1M',
      }),
      getSpendingTrend: vi.fn().mockResolvedValue({ data: [], period: '1M' }),
      getCategoryBreakdown: vi.fn().mockResolvedValue({ data: [], period: '1M' }),
    },
    transactions: {
      list: vi.fn().mockResolvedValue({ transactions: [], total: 0 }),
    },
  },
}));

import DashboardPage from './page';

describe('Dashboard Page', () => {
  afterEach(cleanup);

  it('renders metric cards with financial data', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Net Worth')).toBeInTheDocument();
    });

    expect(screen.getByText('Daily P&L')).toBeInTheDocument();
    expect(screen.getByText('Budget Health')).toBeInTheDocument();
    expect(screen.getByText('Top Spend')).toBeInTheDocument();
  });

  it('renders chart sections', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Spending Trend')).toBeInTheDocument();
    });

    expect(screen.getByText('Spending by Category')).toBeInTheDocument();
  });

  it('renders recent transactions section', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Recent Transactions')).toBeInTheDocument();
    });

    expect(screen.getByText('View All')).toBeInTheDocument();
  });
});
