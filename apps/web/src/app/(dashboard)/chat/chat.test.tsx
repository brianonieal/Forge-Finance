import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    oracle: {
      query: vi.fn().mockResolvedValue({ ok: true, body: { getReader: () => ({ read: () => Promise.resolve({ done: true }) }) } }),
      getHistory: vi.fn().mockResolvedValue({ conversations: [] }),
      getUsage: vi.fn().mockResolvedValue({ queries_used: 3, queries_limit: 10, monthly_cost: 0.05, cost_ceiling: 0.50, is_pro: false }),
    },
  },
}));

import ChatPage from './page';

describe('Chat Page', () => {
  afterEach(cleanup);

  it('renders empty state with suggested questions', () => {
    render(<ChatPage />);

    expect(screen.getByText('@ORACLE')).toBeInTheDocument();
    expect(screen.getByText('How much did I spend on food last month?')).toBeInTheDocument();
    expect(screen.getByText("What's my biggest expense category?")).toBeInTheDocument();
  });

  it('renders input field', () => {
    render(<ChatPage />);

    expect(screen.getByPlaceholderText('Ask @ORACLE anything...')).toBeInTheDocument();
  });

  it('renders send button', () => {
    render(<ChatPage />);

    // Send button exists
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
