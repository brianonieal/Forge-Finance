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

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/lib/api', () => ({
  api: {
    goals: {
      get: vi.fn().mockResolvedValue({
        id: '1',
        name: 'Emergency Fund',
        target_amount: 10000,
        current_amount: 4500,
        percent: 45,
        deadline: '2026-12-31',
        linked_account_id: null,
        status: 'active',
        pace: { status: 'on_track', projected_date: '2026-11-15' },
        created_at: '2026-01-01T00:00:00',
      }),
      update: vi.fn().mockResolvedValue({ status: 'updated' }),
      delete: vi.fn().mockResolvedValue({ status: 'deleted' }),
    },
  },
}));

import GoalDetailPage from './page';

async function renderPage() {
  const params = Promise.resolve({ id: '1' });
  await act(async () => {
    render(
      <Suspense fallback={<div>Loading...</div>}>
        <GoalDetailPage params={params} />
      </Suspense>
    );
  });
}

describe('Goal Detail Page', () => {
  afterEach(cleanup);

  it('renders goal name', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });
  });

  it('renders large circular progress', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    expect(screen.getByText('complete')).toBeInTheDocument();
  });

  it('renders amounts in JetBrains Mono', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText(/\$4,500\.00 of \$10,000\.00/)).toBeInTheDocument();
    });
  });

  it('renders pace indicator', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('✓ On track')).toBeInTheDocument();
    });
  });

  it('renders contribution history chart section', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Contribution History')).toBeInTheDocument();
    });
  });

  it('renders action buttons', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Edit Goal')).toBeInTheDocument();
    });

    expect(screen.getByText('Pause Goal')).toBeInTheDocument();
    expect(screen.getByText('Delete Goal')).toBeInTheDocument();
  });

  it('renders back link', async () => {
    await renderPage();

    await waitFor(() => {
      expect(screen.getByText('Back to Goals')).toBeInTheDocument();
    });
  });
});
