'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Building2, RefreshCw, AlertCircle, CheckCircle2, CreditCard, Landmark, PiggyBank } from 'lucide-react';
import { api, PlaidAccount } from '@/lib/api';
import { usePlaidConnect } from '@/hooks/use-plaid-link';

const ACCOUNT_TYPE_ICONS: Record<string, React.ElementType> = {
  checking: Landmark,
  savings: PiggyBank,
  credit: CreditCard,
};

function formatCurrency(amount: number | null, currency = 'USD'): string {
  if (amount === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<PlaidAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { open, ready } = usePlaidConnect();

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const { accounts: data } = await api.plaid.getAccounts();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-32 bg-bg-elevated rounded animate-pulse" />
          <div className="h-10 w-40 bg-bg-elevated rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-6 animate-pulse">
              <div className="h-6 w-24 bg-bg-elevated rounded mb-4" />
              <div className="h-10 w-32 bg-bg-elevated rounded mb-2" />
              <div className="h-4 w-20 bg-bg-elevated rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-text-primary">Accounts</h1>
        <button
          onClick={() => open()}
          disabled={!ready}
          className="flex items-center gap-2 py-2.5 px-4 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          Connect Account
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Empty state */}
      {accounts.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-bg-elevated rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-text-secondary" />
          </div>
          <h2 className="text-lg font-semibold text-text-primary mb-2">
            No accounts connected
          </h2>
          <p className="text-text-secondary mb-6 max-w-sm">
            Connect your first bank account to start tracking your finances with AI-powered insights.
          </p>
          <button
            onClick={() => open()}
            disabled={!ready}
            className="flex items-center gap-2 py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Connect Your First Account
          </button>
        </div>
      )}

      {/* Account cards */}
      {accounts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = ACCOUNT_TYPE_ICONS[account.subtype || ''] || Landmark;
            const isError = account.institution_logo === 'LOGIN_REQUIRED';

            return (
              <div
                key={account.id}
                className="bg-bg-surface rounded-xl p-6 border border-border hover:border-brand-primary/30 transition-colors cursor-pointer"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-bg-elevated rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary">
                        {account.name}
                      </h3>
                      {account.institution_name && (
                        <p className="text-xs text-text-secondary">
                          {account.institution_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary capitalize">
                    {account.subtype || account.type}
                  </span>
                </div>

                {/* Balance */}
                <div className="mb-3">
                  <p className="text-2xl font-mono font-semibold text-text-primary tracking-tight">
                    {formatCurrency(account.balance_current, account.currency)}
                  </p>
                  {account.balance_available !== null &&
                    account.balance_available !== account.balance_current && (
                      <p className="text-sm text-text-secondary font-mono">
                        {formatCurrency(account.balance_available, account.currency)}{' '}
                        available
                      </p>
                    )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {isError ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-loss" />
                        <span className="text-loss">Reconnect required</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-gain" />
                        <span className="text-gain">Connected</span>
                      </>
                    )}
                  </div>
                  <span className="text-text-secondary">
                    {timeAgo(account.last_synced)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
