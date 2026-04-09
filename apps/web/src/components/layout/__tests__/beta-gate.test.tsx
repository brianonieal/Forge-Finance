import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    settings: {
      verifyBetaAccess: vi.fn().mockImplementation(async (code: string) => {
        if (code === 'FORGE2026') return { valid: true, message: 'Welcome!' };
        throw new Error('Invalid code');
      }),
    },
  },
}));

vi.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}));

import { BetaGate } from '../beta-gate';

describe('BetaGate', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(cleanup);

  it('shows beta access form when not verified', () => {
    render(<BetaGate><div>Dashboard</div></BetaGate>);
    expect(screen.getByText('Beta Access')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter access code')).toBeInTheDocument();
  });

  it('shows children when already verified', () => {
    localStorage.setItem('forge-beta-access', 'true');
    render(<BetaGate><div>Dashboard Content</div></BetaGate>);
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('shows error for invalid code', async () => {
    render(<BetaGate><div>Dashboard</div></BetaGate>);
    const input = screen.getByPlaceholderText('Enter access code');
    fireEvent.change(input, { target: { value: 'WRONG' } });
    fireEvent.click(screen.getByText('Verify Access'));
    await waitFor(() => {
      expect(screen.getByText('Invalid access code. Please try again.')).toBeInTheDocument();
    });
  });

  it('shows children after valid code', async () => {
    render(<BetaGate><div>Dashboard Content</div></BetaGate>);
    const input = screen.getByPlaceholderText('Enter access code');
    fireEvent.change(input, { target: { value: 'FORGE2026' } });
    fireEvent.click(screen.getByText('Verify Access'));
    await waitFor(() => {
      expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
    });
  });

  it('saves verification to localStorage', async () => {
    render(<BetaGate><div>Dashboard</div></BetaGate>);
    const input = screen.getByPlaceholderText('Enter access code');
    fireEvent.change(input, { target: { value: 'FORGE2026' } });
    fireEvent.click(screen.getByText('Verify Access'));
    await waitFor(() => {
      expect(localStorage.getItem('forge-beta-access')).toBe('true');
    });
  });

  it('renders Forge Finance branding', () => {
    render(<BetaGate><div>Dashboard</div></BetaGate>);
    expect(screen.getByText('Forge Finance')).toBeInTheDocument();
  });
});
