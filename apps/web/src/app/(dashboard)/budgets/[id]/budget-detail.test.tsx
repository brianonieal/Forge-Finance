import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import { Suspense } from 'react';

// Mock Recharts
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
    budgets: {
      get: vi.fn().mockResolvedValue({
        id: '1',
        category: 'Food',
        amount_limit: 500,
        spent: 350,
        remaining: 150,
        percent: 70,
        period: 'monthly',
        alert_threshold: 70,
        transactions: [
          { id: 't1', amount: -42.50, date: '2026-04-09', merchant_name: 'Starbucks', category: 'Food', pending: false },
          { id: 't2', amount: -15.00, date: '2026-04-08', merchant_name: 'McDonalds', category: 'Food', pending: false },
        ],
      }),
    },
  },
}));

import BudgetDetailPage from './page';

// Helper to render with Suspense and wait for resolution
async function renderPage() {
  const params = Promise.resolve({ id: '1' });
  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <BudgetDetailPage params={params} />
      </Suspense>
    );
  });
}

describe('Budget Detail Page', () => {
  afterEach(cleanup);

  it('renders budget category name', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });
  });

  it('renders budget amounts in JetBrains Mono', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('$500.00')).toBeInTheDocument();
    });

    expect(screen.getByText('$350.00')).toBeInTheDocument();
    expect(screen.getByText('$150.00')).toBeInTheDocument();
  });

  it('renders spending trend chart section', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Spending Trend')).toBeInTheDocument();
    });
  });

  it('renders transactions list', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Starbucks')).toBeInTheDocument();
    });

    expect(screen.getByText('McDonalds')).toBeInTheDocument();
  });

  it('renders back link to budgets', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Back to Budgets')).toBeInTheDocument();
    });
  });
});
