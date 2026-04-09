import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    alerts: {
      list: vi.fn().mockResolvedValue({
        alerts: [
          {
            id: 'budget-1',
            type: 'budget',
            severity: 'warning',
            title: 'Food budget at 85%',
            description: "You've spent $425.00 of your $500.00 budget",
            is_read: false,
            timestamp: new Date().toISOString(),
            link: '/budgets/1',
          },
          {
            id: 'goal-2-50',
            type: 'goal',
            severity: 'info',
            title: 'Emergency Fund: 50% reached!',
            description: '$5000.00 of $10000.00 saved',
            is_read: true,
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            link: '/goals/2',
          },
        ],
        total: 2,
        unread: 1,
      }),
      markRead: vi.fn().mockResolvedValue({ status: 'read' }),
      dismiss: vi.fn().mockResolvedValue({ status: 'dismissed' }),
      markAllRead: vi.fn().mockResolvedValue({ status: 'all_read' }),
    },
  },
}));

import AlertsPage from './page';

describe('Alerts Page', () => {
  afterEach(cleanup);

  it('renders page title', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      expect(screen.getByText('Alerts & Notifications')).toBeInTheDocument();
    });
  });

  it('renders alert cards', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      expect(screen.getByText('Food budget at 85%')).toBeInTheDocument();
    });
    expect(screen.getByText('Emergency Fund: 50% reached!')).toBeInTheDocument();
  });

  it('renders alert descriptions', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      expect(screen.getByText(/\$425\.00 of your \$500\.00/)).toBeInTheDocument();
    });
  });

  it('renders filter chips', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      expect(screen.getByText('All')).toBeInTheDocument();
    });
    expect(screen.getByText('Budget Alerts')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
    expect(screen.getByText('AI Insights')).toBeInTheDocument();
    expect(screen.getByText('Sync Status')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('renders unread count', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      expect(screen.getByText('1 unread')).toBeInTheDocument();
    });
  });

  it('renders Mark All as Read button', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      expect(screen.getByText('Mark All as Read')).toBeInTheDocument();
    });
  });

  it('renders view details links', async () => {
    render(<AlertsPage />);
    await waitFor(() => {
      const links = screen.getAllByText('View Details →');
      expect(links.length).toBe(2);
    });
  });
});
