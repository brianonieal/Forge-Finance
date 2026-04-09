'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api, PlaidAccount, TransactionItem } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [account, setAccount] = useState<PlaidAccount | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.plaid.getAccounts(),
      api.transactions.list({ account_id: id, limit: 50 }),
    ])
      .then(([accts, txns]) => {
        if (!mounted) return;
        const found = accts.accounts.find((a) => a.id === id);
        setAccount(found || null);
        setTransactions(txns.transactions);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => { mounted = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-bg-elevated rounded animate-pulse" />
        <div className="h-12 w-32 bg-bg-elevated rounded animate-pulse" />
        <div className="bg-bg-surface rounded-xl h-48 animate-pulse" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6">
        <button onClick={() => router.push('/accounts')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </button>
        <p className="text-text-secondary">Account not found.</p>
      </div>
    );
  }

  const filtered = search
    ? transactions.filter((t) => t.merchant_name?.toLowerCase().includes(search.toLowerCase()))
    : transactions;

  // Build a simple balance history from transactions (reverse cumulative)
  const balanceHistory = transactions
    .slice()
    .reverse()
    .reduce<Array<{ date: string; balance: number }>>((acc, t, i) => {
      const prev = i > 0 ? acc[i - 1].balance : (account.balance_current ?? 0);
      acc.push({ date: t.date, balance: prev - t.amount });
      return acc;
    }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <button onClick={() => router.push('/accounts')} className="flex items-center gap-2 text-text-secondary hover:text-text-primary text-sm mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">{account.name}</h1>
            <p className="text-sm text-text-secondary">
              {account.institution_name} &middot; {account.subtype || account.type}
              {account.mask && ` ••${account.mask}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-mono font-semibold text-text-primary">{fmt(account.balance_current ?? 0)}</p>
            {account.balance_available != null && account.balance_available !== account.balance_current && (
              <p className="text-sm font-mono text-text-secondary">{fmt(account.balance_available)} available</p>
            )}
          </div>
        </div>
      </div>

      {/* Balance History Chart */}
      {balanceHistory.length > 1 && (
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Balance History</h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={balanceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => fmt(value)}
              />
              <Line type="monotone" dataKey="balance" stroke="#00C48C" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-bg-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">Transactions</h3>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transactions..."
            className="text-sm bg-bg-elevated text-text-primary rounded-lg px-3 py-1.5 border border-border focus:border-brand-primary focus:outline-none w-48"
          />
        </div>
        {filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{txn.merchant_name || 'Unknown'}</p>
                  <p className="text-xs text-text-secondary">{txn.date} &middot; {txn.category || 'Uncategorized'}</p>
                </div>
                <span className={`font-mono text-sm font-semibold ${txn.amount < 0 ? 'text-loss' : 'text-gain'}`}>
                  {txn.amount < 0 ? '-' : '+'}{fmt(Math.abs(txn.amount))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary py-4 text-center">No transactions found</p>
        )}
      </div>
    </div>
  );
}
