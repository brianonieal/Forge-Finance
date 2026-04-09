import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    settings: {
      get2FAStatus: vi.fn().mockResolvedValue({ enabled: true }),
      disable2FA: vi.fn().mockResolvedValue({ status: '2fa_disabled' }),
    },
  },
}));

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn(),
}));

import SecurityPage from '../page';

describe('Security Page - 2FA Enabled State', () => {
  afterEach(cleanup);

  it('shows 2FA enabled badge when already enabled', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('2FA is enabled')).toBeInTheDocument();
    });
  });

  it('shows disable button when 2FA is enabled', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('Disable')).toBeInTheDocument();
    });
  });

  it('does not show Enable 2FA when already enabled', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('2FA is enabled')).toBeInTheDocument();
    });
    expect(screen.queryByText('Enable 2FA')).not.toBeInTheDocument();
  });
});
