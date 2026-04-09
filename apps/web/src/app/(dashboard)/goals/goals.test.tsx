import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    goals: {
      list: vi.fn().mockResolvedValue({
        active: [
          {
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
          },
          {
            id: '2',
            name: 'Vacation',
            target_amount: 5000,
            current_amount: 1200,
            percent: 24,
            deadline: '2026-08-01',
            linked_account_id: null,
            status: 'active',
            pace: { status: 'behind', projected_date: '2026-10-15' },
            created_at: '2026-02-01T00:00:00',
          },
        ],
        completed: [
          {
            id: '3',
            name: 'New Laptop',
            target_amount: 2000,
            current_amount: 2000,
            percent: 100,
            deadline: null,
            linked_account_id: null,
            status: 'completed',
            pace: { status: 'on_track', projected_date: null },
            created_at: '2026-01-01T00:00:00',
          },
        ],
        paused: [],
        total: 3,
      }),
      create: vi.fn().mockResolvedValue({ id: '4', name: 'New Goal' }),
      update: vi.fn().mockResolvedValue({ status: 'updated' }),
      delete: vi.fn().mockResolvedValue({ status: 'deleted' }),
    },
  },
}));

import GoalsPage from './page';

describe('Goals Page', () => {
  afterEach(cleanup);

  it('renders active goal cards', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    });

    expect(screen.getByText('Vacation')).toBeInTheDocument();
  });

  it('renders circular progress percentages', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    expect(screen.getByText('24%')).toBeInTheDocument();
  });

  it('renders goal amounts in JetBrains Mono', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText(/\$4,500\.00 of \$10,000\.00/)).toBeInTheDocument();
    });
  });

  it('renders pace indicators', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('✓ On track')).toBeInTheDocument();
    });

    expect(screen.getByText('✗ Behind schedule')).toBeInTheDocument();
  });

  it('renders create goal button', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Create Goal')).toBeInTheDocument();
    });
  });

  it('renders completed goals section', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Completed (1)')).toBeInTheDocument();
    });
  });

  it('shows header title', async () => {
    render(<GoalsPage />);

    await waitFor(() => {
      expect(screen.getByText('Goals')).toBeInTheDocument();
    });
  });
});
