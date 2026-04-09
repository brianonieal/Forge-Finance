import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';

// Mock all dependencies
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => '/dashboard',
}));

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@test.com' },
    loading: false,
    initialized: true,
  }),
}));

vi.mock('@/stores/ui-store', () => ({
  useUIStore: () => ({
    sidebarExpanded: true,
    toggleSidebar: vi.fn(),
  }),
}));

vi.mock('@/components/layout/beta-gate', () => ({
  BetaGate: ({ children }: any) => <>{children}</>,
}));

vi.mock('@/components/layout/mobile-bottom-tab-bar', () => ({
  MobileBottomTabBar: () => <nav data-testid="mobile-tabs" />,
}));

import DashboardLayout from '../layout';

describe('Dashboard Layout Accessibility', () => {
  afterEach(cleanup);

  it('renders skip navigation link', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink.getAttribute('href')).toBe('#main-content');
  });

  it('renders main landmark with id', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main.id).toBe('main-content');
  });

  it('renders navigation landmark with label', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
  });

  it('skip link has sr-only class by default', () => {
    render(<DashboardLayout><div>Content</div></DashboardLayout>);
    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink.className).toContain('sr-only');
  });
});
