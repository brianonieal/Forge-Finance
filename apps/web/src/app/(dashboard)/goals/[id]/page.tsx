'use client';

import { use, useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Pause, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { api, GoalItem } from '@/lib/api';

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

function paceColor(status: string): string {
  if (status === 'on_track') return 'text-gain';
  if (status === 'slightly_behind') return 'text-brand-accent';
  return 'text-loss';
}

function paceLabel(status: string): string {
  if (status === 'on_track') return '✓ On track';
  if (status === 'slightly_behind') return '⚠ Slightly behind';
  return '✗ Behind schedule';
}

function CircularProgress({ percent, size = 180 }: { percent: number; size?: number }) {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#2E6DB4" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-mono font-semibold text-text-primary">{Math.round(percent)}%</span>
        <span className="text-xs text-text-secondary">complete</span>
      </div>
    </div>
  );
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [goal, setGoal] = useState<GoalItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.goals.get(id)
      .then(setGoal)
      .catch(() => setGoal(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePause = async () => {
    await api.goals.update(id, { status: goal?.status === 'paused' ? 'active' : 'paused' }).catch(() => {});
    api.goals.get(id).then(setGoal).catch(() => {});
  };

  const handleDelete = async () => {
    await api.goals.delete(id).catch(() => {});
    router.push('/goals');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-64" />
        <div className="bg-bg-surface rounded-xl p-6 animate-pulse h-48" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-6">
        <Link href="/goals" className="text-brand-primary hover:underline flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Goals
        </Link>
        <p className="text-text-secondary">Goal not found.</p>
      </div>
    );
  }

  // Simulated contribution history (from created_at to now)
  const contributionData: Array<{ date: string; amount: number }> = [];
  if (goal.created_at) {
    const start = new Date(goal.created_at);
    const now = new Date();
    const totalDays = Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyContribution = goal.current_amount / totalDays;
    let cumulative = 0;
    for (let i = 0; i <= totalDays && i <= 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      cumulative += dailyContribution;
      contributionData.push({
        date: d.toISOString().split('T')[0],
        amount: Math.round(cumulative * 100) / 100,
      });
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Back link */}
      <Link href="/goals" className="text-brand-primary hover:underline flex items-center gap-1 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Goals
      </Link>

      {/* Goal Header */}
      <div className="bg-bg-surface rounded-xl p-6">
        <h1 className="text-2xl font-semibold text-text-primary mb-6">{goal.name}</h1>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <CircularProgress percent={goal.percent} />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-text-secondary">Saved</p>
              <p className="text-xl font-mono font-semibold text-text-primary">
                {fmt(goal.current_amount)} of {fmt(goal.target_amount)}
              </p>
            </div>
            {goal.deadline && (
              <div>
                <p className="text-sm text-text-secondary">Target Date</p>
                <p className="text-text-primary">
                  {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            )}
            <p className={`text-sm ${paceColor(goal.pace.status)}`}>
              {paceLabel(goal.pace.status)}
            </p>
            {goal.pace.projected_date && (
              <p className="text-xs text-text-secondary">
                Projected completion: {new Date(goal.pace.projected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}
            {goal.status === 'paused' && (
              <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-brand-accent text-white">Paused</span>
            )}
          </div>
        </div>
      </div>

      {/* Contribution History Chart */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Contribution History</h3>
        {contributionData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={contributionData}>
              <defs>
                <linearGradient id="goalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00C48C" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00C48C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8B96A8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: '#1A2035', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#8B96A8' }}
                formatter={(value: number) => fmt(value)}
              />
              <Area type="monotone" dataKey="amount" stroke="#00C48C" fill="url(#goalGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-text-secondary text-sm">
            No contribution data yet
          </div>
        )}
      </div>

      {/* Goal Actions */}
      <div className="bg-bg-surface rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-secondary mb-4">Actions</h3>
        <div className="flex gap-3">
          <Link href={`/goals/${goal.id}`}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-text-primary text-sm hover:bg-bg-elevated"
          >
            <Edit3 className="w-4 h-4" /> Edit Goal
          </Link>
          <button
            onClick={handlePause}
            className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-text-primary text-sm hover:bg-bg-elevated"
          >
            <Pause className="w-4 h-4" /> {goal.status === 'paused' ? 'Resume' : 'Pause'} Goal
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 border border-loss rounded-lg text-loss text-sm hover:bg-bg-elevated"
          >
            <Trash2 className="w-4 h-4" /> Delete Goal
          </button>
        </div>
      </div>
    </div>
  );
}
