import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

vi.mock('@/lib/api', () => ({
  api: {
    settings: {
      get2FAStatus: vi.fn().mockResolvedValue({ enabled: false }),
      setup2FA: vi.fn().mockResolvedValue({
        secret: 'TESTBASE32SECRET',
        otpauth_uri: 'otpauth://totp/Forge%20Finance?secret=TESTBASE32SECRET&issuer=Forge%20Finance',
      }),
      verify2FA: vi.fn().mockResolvedValue({ status: '2fa_enabled' }),
      disable2FA: vi.fn().mockResolvedValue({ status: '2fa_disabled' }),
    },
  },
}));

vi.mock('@/components/ui/toast', () => ({
  toast: vi.fn(),
}));

import SecurityPage from '../page';

describe('Security Page', () => {
  afterEach(cleanup);

  it('renders page title', async () => {
    render(<SecurityPage />);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('renders 2FA section', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('Two-factor authentication')).toBeInTheDocument();
    });
  });

  it('shows Enable 2FA button when not enabled', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('Enable 2FA')).toBeInTheDocument();
    });
  });

  it('shows setup step after clicking Enable 2FA', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('Enable 2FA')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Enable 2FA'));
    await waitFor(() => {
      expect(screen.getByText('Step 1: Add to your authenticator app')).toBeInTheDocument();
    });
  });

  it('shows verification step after clicking Next', async () => {
    render(<SecurityPage />);
    await waitFor(() => {
      expect(screen.getByText('Enable 2FA')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Enable 2FA'));
    await waitFor(() => {
      expect(screen.getByText("I've added it — Next")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText("I've added it — Next"));
    await waitFor(() => {
      expect(screen.getByText('Step 2: Verify your code')).toBeInTheDocument();
    });
  });

  it('renders active sessions section', async () => {
    render(<SecurityPage />);
    expect(screen.getByText('Active sessions')).toBeInTheDocument();
    expect(screen.getByText('Current session')).toBeInTheDocument();
  });

  it('renders delete account section', async () => {
    render(<SecurityPage />);
    expect(screen.getByText('Delete account')).toBeInTheDocument();
    expect(screen.getByText('Delete Account')).toBeInTheDocument();
  });

  it('shows delete confirmation when clicked', () => {
    render(<SecurityPage />);
    fireEvent.click(screen.getByText('Delete Account'));
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });
});
