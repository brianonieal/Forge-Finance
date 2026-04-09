import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

// Mock Recharts
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
  RadialBarChart: ({ children }: any) => <div>{children}</div>,
  RadialBar: () => null,
}));

vi.mock('@/lib/api', () => ({
  api: {
    budgets: {
      list: vi.fn().mockResolvedValue({
        budgets: [
          {
            id: '1',
            category: 'Food',
            amount_limit: 500,
            spent: 350,
            remaining: 150,
            percent: 70,
            status: 'warning',
            period: 'monthly',
            alert_threshold: 70,
            created_at: '2026-04-01T00:00:00',
          },
          {
            id: '2',
            category: 'Transport',
            amount_limit: 200,
            spent: 80,
            remaining: 120,
            percent: 40,
            status: 'on_track',
            period: 'monthly',
            alert_threshold: 70,
            created_at: '2026-04-01T00:00:00',
          },
        ],
        health: 50,
        total: 2,
        on_track: 1,
      }),
      create: vi.fn().mockResolvedValue({ id: '3', category: 'Entertainment' }),
    },
  },
}));

import BudgetsPage from './page';

describe('Budgets Page', () => {
  afterEach(cleanup);

  it('renders budget category list', async () => {
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument();
    });

    expect(screen.getByText('Transport')).toBeInTheDocument();
  });

  it('renders health ring percentage', async () => {
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    expect(screen.getByText('on track')).toBeInTheDocument();
  });

  it('renders budget progress amounts in JetBrains Mono', async () => {
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(screen.getByText(/\$350\.00 of \$500\.00/)).toBeInTheDocument();
    });
  });

  it('renders status chips', async () => {
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });

    expect(screen.getByText('On Track')).toBeInTheDocument();
  });

  it('renders create budget button', async () => {
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Budget')).toBeInTheDocument();
    });
  });

  it('shows header title', async () => {
    render(<BudgetsPage />);

    await waitFor(() => {
      expect(screen.getByText('Budgets')).toBeInTheDocument();
    });
  });
});
