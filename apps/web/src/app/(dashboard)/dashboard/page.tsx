'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus, ShieldCheck, Tag, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useUIStore } from '@/stores/ui-store';
import { api, DashboardMetrics, SpendingDataPoint, CategoryDataPoint, TransactionItem } from '@/lib/api';

const CHART_COLORS = ['#2E6DB4', '#C8A855', '#00C48C', '#FF4D4D', '#8B96A8', '#6366F1', '#EC4899'];

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function DashboardPage() {
  const period = useUIStore((s) => s.period);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [trend, setTrend] = useState<SpendingDataPoint[]>([]);
  const [categories, setCategories] = useState<CategoryDataPoint[]>([]);
  const [recentTxns, setRecentTxns] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    Promise.all([
      api.dashboard.getMetrics(period).catch(() => null),
      api.dashboard.getSpendingTrend(period).catch(() => ({ data: [] })),
      api.dashboard.getCategoryBreakdown(period).catch(() => ({ data: [] })),
      api.transactions.list({ limit: 5, sort_by: 'date', sort_order: 'desc' }).catch(() => ({ transactions: [] })),
    ]).then(([m, t, c, txns]) => {
      if (!mounted) return;
      setMetrics(m);
      setTrend(t.data);
      setCategories(c.data);
      setRecentTxns(txns.transactions);
      setLoading(false);
    });

    return () => { mounted = false; };
  }, [period]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-5 animate-pulse">
              <div className="h-4 w-20 bg-bg-elevated rounded mb-3" />
              <div className="h-8 w-28 bg-bg-elevated rounded" />
            </div>
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-bg-surface rounded-xl p-5 h-64 animate-pulse" />
          <div className="bg-bg-surface rounded-xl p-5 h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  const pnlPositive = (metrics?.daily_pnl ?? 0) >= 0;

  return (
    <div className="p-6 space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Net Worth"
          value={fmt(metrics?.net_worth ?? 0)}
        />
        <MetricCard
          label="Daily P&L"
          value={fmt(metrics?.daily_pnl ?? 0)}
          delta={pnlPositive ? 'gain' : (metrics?.daily_pnl ?? 0) < 0 ? 'loss' : 'neutral'}
        />
        <MetricCard
          label="Budget Health"
          value={`${metrics?.budget_health ?? 100}%`}
          icon={<ShieldCheck className="w-4 h-4" />}
          delta={(metrics?.budget_health ?? 100) >= 80 ? 'gain' : 'loss'}
        />
        <MetricCard
          label="Top Spend"
          value={fmt(metrics?.top_spend?.amount ?? 0)}
          subtitle={metrics?.top_spend?.category}
          icon={<Tag className="w-4 h-4" />}
        />
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Spending Trend */}
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Spending Trend</h3>
          {trend.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
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
                <Area type="monotone" dataKey="amount" stroke="#00C48C" fill="url(#spendGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
              No spending data for this period
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Spending by Category</h3>
          {categories.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {categories.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => fmt(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categories.slice(0, 5).map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                      <span className="text-text-secondary">{cat.category}</span>
                    </div>
                    <span className="font-mono text-text-primary">{fmt(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
              No category data for this period
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-bg-surface rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-text-secondary">Recent Transactions</h3>
          <Link href="/transactions" className="text-xs text-brand-primary hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentTxns.length > 0 ? (
          <div className="space-y-3">
            {recentTxns.map((txn) => (
              <div key={txn.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-sm font-medium text-text-primary">{txn.merchant_name || 'Unknown'}</p>
                    <p className="text-xs text-text-secondary">{txn.date} &middot; {txn.category || 'Uncategorized'}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-semibold ${txn.amount < 0 ? 'text-loss' : 'text-gain'}`}>
                  {txn.amount < 0 ? '-' : '+'}{fmt(Math.abs(txn.amount))}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary py-4 text-center">No transactions yet</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  delta,
  subtitle,
  icon,
}: {
  label: string;
  value: string;
  delta?: 'gain' | 'loss' | 'neutral';
  subtitle?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-bg-surface rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-text-secondary">{label}</span>
        {icon && <span className="text-text-secondary">{icon}</span>}
      </div>
      <p className="text-2xl font-mono font-semibold text-text-primary tracking-tight">{value}</p>
      {delta && (
        <div className={`flex items-center gap-1 mt-1 text-xs ${
          delta === 'gain' ? 'text-gain' : delta === 'loss' ? 'text-loss' : 'text-text-secondary'
        }`}>
          {delta === 'gain' && <TrendingUp className="w-3 h-3" />}
          {delta === 'loss' && <TrendingDown className="w-3 h-3" />}
          {delta === 'neutral' && <Minus className="w-3 h-3" />}
        </div>
      )}
      {subtitle && <p className="text-xs text-text-secondary mt-1">{subtitle}</p>}
    </div>
  );
}
