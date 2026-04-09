'use client';

import { use, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api, BudgetDetail } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function progressBarColor(pct: number): string {
  if (pct >= 90) return 'bg-loss';
  if (pct >= 70) return 'bg-brand-accent';
  return 'bg-gain';
}

export default function BudgetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [budget, setBudget] = useState<BudgetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.budgets.get(id)
      .then(setBudget)
      .catch(() => setBudget(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-32" />
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-64" />
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="p-6">
        <Link href="/budgets" className="text-brand-primary hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Budgets
        </Link>
        <p className="text-text-secondary">Budget not found.</p>
      </div>
    );
  }

  // Build spending trend from transactions (daily aggregation)
  const dailyMap = new Map<string, number>();
  for (const t of budget.transactions) {
    const d = t.date;
    dailyMap.set(d, (dailyMap.get(d) || 0) + Math.abs(t.amount));
  }
  const trendData = Array.from(dailyMap.entries())
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Link href="/budgets" className="text-brand-primary hover:underline flex items-center gap-1 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Budgets
      </Link>

      <div className="bg-bg-surface rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-4">{budget.category}</h1>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-text-secondary">Budget Limit</p>
            <p className="text-xl font-mono font-semibold text-text-primary">{fmt(budget.amount_limit)}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Spent</p>
            <p className="text-xl font-mono font-semibold text-loss">{fmt(budget.spent)}</p>
          </div>
          <div>
            <p className="text-sm text-text-secondary">Remaining</p>
            <p className="text-xl font-mono font-semibold text-gain">{fmt(budget.remaining)}</p>
          </div>
        </div>
        <div className="w-full bg-bg-elevated rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${progressBarColor(budget.percent)}`}
            style={{ width: `${Math.min(budget.percent, 100)}%` }}
          />
        </div>
        <p className="text-sm font-mono text-text-secondary mt-2">{budget.percent}% used</p>
      </div>

      {/* Spending Trend Chart */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Spending Trend</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="budgetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E6DB4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E6DB4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#8B96A8' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#2E6DB4" fill="url(#budgetGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
            No spending data yet
          </div>
        )}
      </div>

      {/* Transactions */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Transactions</h3>
        {budget.transactions.length > 0 ? (
          <div className="space-y-2">
            {budget.transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <p className="text-sm font-medium text-text-primary">{t.merchant_name || 'Unknown'}</p>
                  <p className="text-xs text-text-secondary">{t.date}</p>
                </div>
                <span className={`font-mono text-sm font-semibold ${t.amount < 0 ? 'text-loss' : 'text-gain'}`}>
                  {t.amount < 0 ? '-' : '+'}{fmt(Math.abs(t.amount))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary text-center py-4">No transactions in this category</p>
        )}
      </div>
    </div>
  );
}
