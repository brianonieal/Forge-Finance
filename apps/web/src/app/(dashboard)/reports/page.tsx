'use client';

import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import { api, ReportMonthItem, ReportCategoryItem } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CATEGORY_COLORS = ['#2E6DB4', '#C8A855', '#00C48C', '#FF4D4D', '#8B96A8', '#6366F1', '#EC4899', '#F59E0B', '#10B981', '#EF4444'];

export default function ReportsPage() {
  const [monthly, setMonthly] = useState<ReportMonthItem[]>([]);
  const [categories, setCategories] = useState<ReportCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.reports.getMonthlySummary(6).catch(() => ({ months: [] })),
      api.reports.getCategoryTrends(3).catch(() => ({ categories: [] })),
    ]).then(([m, c]) => {
      setMonthly(m.months);
      setCategories(c.categories);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-80" />
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-64" />
      </div>
    );
  }

  const chartData = monthly.map((m) => ({
    month: `${MONTH_NAMES[m.month]} ${m.year}`,
    Income: m.income,
    Expenses: m.expenses,
    Net: m.net,
  }));

  // Summary totals
  const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
  const totalExpenses = monthly.reduce((s, m) => s + m.expenses, 0);
  const totalNet = totalIncome - totalExpenses;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <h1 className="text-2xl font-semibold text-text-primary">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-bg-surface rounded-xl p-5">
          <p className="text-sm text-text-secondary">Total Income</p>
          <p className="text-2xl font-mono font-semibold text-gain">{fmt(totalIncome)}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-5">
          <p className="text-sm text-text-secondary">Total Expenses</p>
          <p className="text-2xl font-mono font-semibold text-loss">{fmt(totalExpenses)}</p>
        </div>
        <div className="bg-bg-surface rounded-xl p-5">
          <p className="text-sm text-text-secondary">Net</p>
          <p className={`text-2xl font-mono font-semibold ${totalNet >= 0 ? 'text-gain' : 'text-loss'}`}>
            {fmt(totalNet)}
          </p>
        </div>
      </div>

      {/* Monthly Income vs Expenses */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Monthly Income vs Expenses</h3>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#8B96A8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                formatter={(value) => fmt(Number(value ?? 0))}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Income" fill="#00C48C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#FF4D4D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-text-secondary text-sm">
            No monthly data yet. Connect your bank and sync transactions to see reports.
          </div>
        )}
      </div>

      {/* Category Spending Breakdown */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Spending by Category</h3>
        {categories.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categories} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#8B96A8' }} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                  formatter={(value) => fmt(Number(value ?? 0))}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {categories.map((_, i) => (
                    <rect key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {categories.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                    <span className="text-text-secondary">{cat.category}</span>
                    <span className="text-xs text-text-secondary">({cat.count} txns)</span>
                  </div>
                  <span className="font-mono text-text-primary">{fmt(cat.total)}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-[250px] flex items-center justify-center text-text-secondary text-sm">
            No category data yet
          </div>
        )}
      </div>
    </div>
  );
}
