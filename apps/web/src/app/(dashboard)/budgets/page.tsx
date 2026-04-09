'use client';

import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
} from 'recharts';
import { api, BudgetItem, BudgetListResponse } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function statusColor(status: string): string {
  if (status === 'over_budget') return 'bg-loss';
  if (status === 'warning') return 'bg-brand-accent';
  return 'bg-gain';
}

function statusLabel(status: string): string {
  if (status === 'over_budget') return 'Over Budget';
  if (status === 'warning') return 'Warning';
  return 'On Track';
}

function progressBarColor(pct: number): string {
  if (pct >= 90) return 'bg-loss';
  if (pct >= 70) return 'bg-brand-accent';
  return 'bg-gain';
}

export default function BudgetsPage() {
  const [data, setData] = useState<BudgetListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const loadBudgets = () => {
    setLoading(true);
    api.budgets.list('monthly')
      .then(setData)
      .catch(() => setData({ budgets: [], health: 100, total: 0, on_track: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBudgets(); }, []);

  const handleCreate = async () => {
    if (!newCategory || !newLimit) return;
    await api.budgets.create({
      category: newCategory,
      amount_limit: parseFloat(newLimit),
    }).catch(() => {});
    setNewCategory('');
    setNewLimit('');
    setShowCreate(false);
    loadBudgets();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-bg-surface rounded-xl p-8 animate-pulse h-48" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-5 animate-pulse h-20" />
          ))}
        </div>
      </div>
    );
  }

  const budgets = data?.budgets ?? [];
  const health = data?.health ?? 100;

  const ringData = [{ name: 'health', value: health, fill: health >= 70 ? '#00C48C' : health >= 50 ? '#C8A855' : '#FF4D4D' }];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Budgets</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Budget
        </button>
      </div>

      {budgets.length === 0 && !showCreate ? (
        <div className="bg-bg-surface rounded-xl p-12 text-center">
          <p className="text-text-secondary mb-4">No budgets set up</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 text-sm font-medium"
          >
            Create Your First Budget
          </button>
        </div>
      ) : (
        <>
          {/* Health Ring */}
          <div className="bg-bg-surface rounded-xl p-6 flex items-center gap-6">
            <div className="w-32 h-32">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius="70%" outerRadius="100%"
                  startAngle={90} endAngle={-270}
                  data={ringData}
                  barSize={10}
                >
                  <RadialBar dataKey="value" cornerRadius={5} background={{ fill: 'rgba(255,255,255,0.05)' }} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div>
              <p className="text-3xl font-mono font-semibold text-text-primary">{health}%</p>
              <p className="text-sm text-text-secondary">on track</p>
              <p className="text-xs text-text-secondary mt-1">
                {data?.on_track ?? 0} of {data?.total ?? 0} budgets on track
              </p>
            </div>
          </div>

          {/* Budget Category List */}
          <div className="space-y-3">
            {budgets.map((b) => (
              <Link key={b.id} href={`/budgets/${b.id}`}>
                <div className="bg-bg-surface rounded-xl p-5 hover:bg-bg-elevated transition-colors cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-text-primary">{b.category}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full text-white ${statusColor(b.status)}`}>
                      {statusLabel(b.status)}
                    </span>
                  </div>
                  <div className="w-full bg-bg-elevated rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all ${progressBarColor(b.percent)}`}
                      style={{ width: `${Math.min(b.percent, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-text-primary">
                      {fmt(b.spent)} of {fmt(b.amount_limit)}
                    </span>
                    <span className="font-mono text-text-secondary">{b.percent}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Create Budget Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-surface rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Create Budget</h2>
              <button onClick={() => setShowCreate(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary block mb-1">Category</label>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="e.g. Food, Transport, Entertainment"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-1">Monthly Limit</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="500.00"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-border rounded-lg text-text-secondary text-sm hover:bg-bg-elevated"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
                >
                  Create Budget
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
