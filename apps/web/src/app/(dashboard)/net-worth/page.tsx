'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign } from 'lucide-react';
import { api, NetWorthSummary, NetWorthTrend } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function NetWorthPage() {
  const [summary, setSummary] = useState<NetWorthSummary | null>(null);
  const [trend, setTrend] = useState<NetWorthTrend | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.netWorth.getSummary().catch(() => ({
        net_worth: 0, total_assets: 0, total_liabilities: 0, assets: [], liabilities: [],
      })),
      api.netWorth.getTrend().catch(() => ({ data: [], current: 0 })),
    ]).then(([s, t]) => {
      setSummary(s);
      setTrend(t);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-64" />
      </div>
    );
  }

  const netWorth = summary?.net_worth ?? 0;
  const totalAssets = summary?.total_assets ?? 0;
  const totalLiabilities = summary?.total_liabilities ?? 0;
  const assets = summary?.assets ?? [];
  const liabilities = summary?.liabilities ?? [];
  const trendData = trend?.data ?? [];
  const netPositive = netWorth >= 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Net Worth</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="w-4 h-4 text-gain" />
            <p className="text-sm text-text-secondary">Total Assets</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-gain">{fmt(totalAssets)}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-loss" />
            <p className="text-sm text-text-secondary">Total Liabilities</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-loss">{fmt(totalLiabilities)}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-brand-primary" />
            <p className="text-sm text-text-secondary">Net Worth</p>
          </div>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-mono font-semibold ${netPositive ? 'text-gain' : 'text-loss'}`}>
              {fmt(netWorth)}
            </p>
            {netPositive ? <TrendingUp className="w-5 h-5 text-gain" /> : <TrendingDown className="w-5 h-5 text-loss" />}
          </div>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Net Worth Over Time</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2E6DB4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2E6DB4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                formatter={(value: number) => fmt(value)}
              />
              <Area type="monotone" dataKey="net_worth" stroke="#2E6DB4" fill="url(#nwGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[260px] flex items-center justify-center text-text-secondary text-sm">
            No trend data yet. Link accounts and build transaction history to see your net worth over time.
          </div>
        )}
      </div>

      {/* Account Breakdown */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Assets */}
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">
            Assets <span className="font-mono text-gain ml-2">{fmt(totalAssets)}</span>
          </h3>
          {assets.length > 0 ? (
            <div className="space-y-3">
              {assets.map((a) => (
                <div key={a.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-primary">{a.name}</p>
                    <p className="text-xs text-text-secondary capitalize">
                      {a.institution_name || a.subtype || a.type}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-gain">{fmt(a.balance)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">No asset accounts linked</p>
          )}
        </div>

        {/* Liabilities */}
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">
            Liabilities <span className="font-mono text-loss ml-2">{fmt(totalLiabilities)}</span>
          </h3>
          {liabilities.length > 0 ? (
            <div className="space-y-3">
              {liabilities.map((l) => (
                <div key={l.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-text-primary">{l.name}</p>
                    <p className="text-xs text-text-secondary capitalize">
                      {l.institution_name || l.subtype || l.type}
                    </p>
                  </div>
                  <p className="font-mono text-sm text-loss">{fmt(l.balance)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm text-center py-4">No liability accounts linked</p>
          )}
        </div>
      </div>
    </div>
  );
}
