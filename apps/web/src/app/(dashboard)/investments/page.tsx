'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { api, InvestmentHoldings, InvestmentPerformance } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const PIE_COLORS = ['#2E6DB4', '#C8A855', '#00C48C', '#FF4D4D', '#8B96A8', '#6366F1', '#EC4899'];

export default function InvestmentsPage() {
  const [holdings, setHoldings] = useState<InvestmentHoldings | null>(null);
  const [performance, setPerformance] = useState<InvestmentPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.investments.getHoldings().catch(() => ({ holdings: [], total_value: 0, allocation: [] })),
      api.investments.getPerformance().catch(() => ({ data: [], total_value: 0, total_gain: 0 })),
    ]).then(([h, p]) => {
      setHoldings(h);
      setPerformance(p);
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

  const totalValue = holdings?.total_value ?? 0;
  const totalGain = performance?.total_gain ?? 0;
  const gainPositive = totalGain >= 0;
  const allocationData = holdings?.allocation ?? [];
  const perfData = performance?.data ?? [];
  const holdingsList = holdings?.holdings ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Investments</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-surface rounded-xl p-5">
          <p className="text-sm text-text-secondary">Portfolio Value</p>
          <p className="text-2xl font-mono font-semibold text-text-primary">{fmt(totalValue)}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-5">
          <p className="text-sm text-text-secondary">Total Gain/Loss</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xl font-mono font-semibold ${gainPositive ? 'text-gain' : 'text-loss'}`}>
              {gainPositive ? '+' : ''}{fmt(totalGain)}
            </p>
            {gainPositive ? <TrendingUp className="w-5 h-5 text-gain" /> : <TrendingDown className="w-5 h-5 text-loss" />}
          </div>
        </div>
        <div className="bg-bg-surface rounded-xl p-5">
          <p className="text-sm text-text-secondary">Accounts</p>
          <p className="text-2xl font-mono font-semibold text-text-primary">{holdingsList.length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Performance Chart */}
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Portfolio Performance</h3>
          {perfData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={perfData}>
                <defs>
                  <linearGradient id="investGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00C48C" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00C48C" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number) => fmt(value)}
                />
                <Area type="monotone" dataKey="value" stroke="#00C48C" fill="url(#investGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-secondary text-sm">
              No performance data yet. Link investment accounts to track your portfolio.
            </div>
          )}
        </div>

        {/* Allocation Pie */}
        <div className="bg-bg-surface rounded-xl p-5">
          <h3 className="text-sm font-medium text-text-secondary mb-4">Asset Allocation</h3>
          {allocationData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    dataKey="value"
                    nameKey="type"
                    cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    paddingAngle={2}
                  >
                    {allocationData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number) => fmt(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {allocationData.map((item, i) => (
                  <div key={item.type} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-text-secondary capitalize">{item.type}</span>
                    </div>
                    <span className="font-mono text-text-primary">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-text-secondary text-sm">
              No allocation data yet
            </div>
          )}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Holdings</h3>
        {holdingsList.length > 0 ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-text-secondary border-b border-border">
                <th className="text-left py-2 font-medium">Account</th>
                <th className="text-left py-2 font-medium">Institution</th>
                <th className="text-left py-2 font-medium">Type</th>
                <th className="text-right py-2 font-medium">Balance</th>
              </tr>
            </thead>
            <tbody>
              {holdingsList.map((h) => (
                <tr key={h.id} className="border-b border-border last:border-0">
                  <td className="py-3 text-text-primary">{h.name}</td>
                  <td className="py-3 text-text-secondary">{h.institution_name || '—'}</td>
                  <td className="py-3 text-text-secondary capitalize">{h.subtype || h.type}</td>
                  <td className="py-3 text-right font-mono text-text-primary">{fmt(h.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-text-secondary text-center py-8">
            No investment accounts linked. Connect a brokerage or retirement account to see your holdings.
          </p>
        )}
      </div>
    </div>
  );
}
