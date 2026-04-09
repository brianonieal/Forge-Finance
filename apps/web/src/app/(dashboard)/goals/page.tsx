'use client';

import { useEffect, useState } from 'react';
import { Plus, X, MoreVertical, Check, Pause, Trash2, PartyPopper } from 'lucide-react';
import Link from 'next/link';
import { api, GoalItem, GoalListResponse } from '@/lib/api';

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

function CircularProgress({ percent, size = 120 }: { percent: number; size?: number }) {
  const strokeWidth = 8;
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
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-mono font-semibold text-text-primary">{Math.round(percent)}%</span>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [data, setData] = useState<GoalListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCelebration, setShowCelebration] = useState<GoalItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  // Create form state
  const [newName, setNewName] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newDeadline, setNewDeadline] = useState('');

  const loadGoals = () => {
    setLoading(true);
    api.goals.list()
      .then(setData)
      .catch(() => setData({ active: [], completed: [], paused: [], total: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadGoals(); }, []);

  const handleCreate = async () => {
    if (!newName || !newTarget) return;
    await api.goals.create({
      name: newName,
      target_amount: parseFloat(newTarget),
      deadline: newDeadline || undefined,
    }).catch(() => {});
    setNewName('');
    setNewTarget('');
    setNewDeadline('');
    setShowCreate(false);
    loadGoals();
  };

  const handlePause = async (id: string) => {
    await api.goals.update(id, { status: 'paused' }).catch(() => {});
    setMenuOpen(null);
    loadGoals();
  };

  const handleDelete = async (id: string) => {
    await api.goals.delete(id).catch(() => {});
    setMenuOpen(null);
    loadGoals();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-bg-surface rounded-xl p-6 animate-pulse h-48" />
          ))}
        </div>
      </div>
    );
  }

  const active = data?.active ?? [];
  const completed = data?.completed ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Goals</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Create Goal
        </button>
      </div>

      {active.length === 0 && completed.length === 0 && !showCreate ? (
        <div className="bg-bg-surface rounded-xl p-12 text-center">
          <p className="text-text-secondary mb-4">No goals yet</p>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 text-sm font-medium"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <>
          {/* Active Goals Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {active.map((g) => (
              <Link key={g.id} href={`/goals/${g.id}`}>
                <div className="bg-bg-surface rounded-xl p-6 hover:bg-bg-elevated transition-colors cursor-pointer relative">
                  {/* Three-dot menu */}
                  <button
                    onClick={(e) => { e.preventDefault(); setMenuOpen(menuOpen === g.id ? null : g.id); }}
                    className="absolute top-4 right-4 text-text-secondary hover:text-text-primary"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  {menuOpen === g.id && (
                    <div className="absolute top-10 right-4 bg-bg-elevated border border-border rounded-lg shadow-lg z-10 py-1 min-w-[120px]"
                      onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={() => handlePause(g.id)}
                        className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-bg-surface flex items-center gap-2"
                      >
                        <Pause className="w-3 h-3" /> Pause
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="w-full text-left px-3 py-2 text-sm text-loss hover:bg-bg-surface flex items-center gap-2"
                      >
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  )}

                  <h3 className="text-lg font-semibold text-text-primary mb-4">{g.name}</h3>
                  <div className="flex justify-center mb-4">
                    <CircularProgress percent={g.percent} />
                  </div>
                  <p className="text-base font-mono text-text-primary text-center">
                    {fmt(g.current_amount)} of {fmt(g.target_amount)}
                  </p>
                  {g.deadline && (
                    <p className="text-sm text-text-secondary text-center mt-1">
                      {new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                  <p className={`text-sm text-center mt-2 ${paceColor(g.pace.status)}`}>
                    {paceLabel(g.pace.status)}
                  </p>
                  {g.pace.projected_date && (
                    <p className="text-xs text-text-secondary text-center mt-1">
                      At this pace, you&apos;ll reach your goal by {new Date(g.pace.projected_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Completed Goals Section */}
          {completed.length > 0 && (
            <div>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-sm text-text-secondary hover:text-text-primary flex items-center gap-2"
              >
                <span className={`transition-transform ${showCompleted ? 'rotate-90' : ''}`}>▸</span>
                Completed ({completed.length})
              </button>
              {showCompleted && (
                <div className="grid md:grid-cols-2 gap-4 mt-3">
                  {completed.map((g) => (
                    <div key={g.id} className="bg-bg-surface rounded-xl p-6 opacity-60">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="w-5 h-5 text-gain" />
                        <h3 className="text-lg font-semibold text-text-primary">{g.name}</h3>
                      </div>
                      <p className="font-mono text-text-primary">{fmt(g.target_amount)}</p>
                      <button
                        onClick={() => setShowCelebration(g)}
                        className="text-xs text-brand-primary hover:underline mt-2"
                      >
                        Celebrate Again
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Create Goal Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50">
          <div className="bg-bg-surface rounded-t-xl md:rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">Create Goal</h2>
              <button onClick={() => setShowCreate(false)} className="text-text-secondary hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-secondary block mb-1">Goal Name</label>
                <input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="e.g. Emergency Fund, Vacation"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-1">Target Amount</label>
                <input
                  type="number"
                  value={newTarget}
                  onChange={(e) => setNewTarget(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm font-mono focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  placeholder="10000.00"
                />
              </div>
              <div>
                <label className="text-sm text-text-secondary block mb-1">Target Date (optional)</label>
                <input
                  type="date"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  className="w-full bg-bg-elevated border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary"
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
                  Create Goal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="text-center p-8" role="dialog" aria-label="Goal celebration">
            <div className="motion-safe:animate-bounce">
              <PartyPopper className="w-16 h-16 text-brand-accent mx-auto mb-4" />
            </div>
            <h2 className="text-3xl font-semibold text-text-primary mb-2">Goal Reached!</h2>
            <p className="text-xl text-brand-accent font-mono mb-6">
              {showCelebration.name} — {fmt(showCelebration.target_amount)}
            </p>
            <button
              onClick={() => setShowCelebration(null)}
              className="px-8 py-3 bg-brand-primary text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              Celebrate!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
