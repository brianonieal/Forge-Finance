'use client';

import { useEffect, useState } from 'react';
import { X, CheckCheck, Bot, Wallet, Target, RefreshCw, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { api, AlertItem, AlertListResponse } from '@/lib/api';

const FILTER_CHIPS = [
  { key: 'all', label: 'All' },
  { key: 'ai', label: 'AI Insights' },
  { key: 'budget', label: 'Budget Alerts' },
  { key: 'goal', label: 'Goals' },
  { key: 'sync', label: 'Sync Status' },
  { key: 'system', label: 'System' },
];

function typeIcon(type: string) {
  switch (type) {
    case 'ai': return <Bot className="w-5 h-5 text-brand-primary" />;
    case 'budget': return <Wallet className="w-5 h-5 text-brand-accent" />;
    case 'goal': return <Target className="w-5 h-5 text-gain" />;
    case 'sync': return <RefreshCw className="w-5 h-5 text-text-secondary" />;
    case 'system': return <BarChart3 className="w-5 h-5 text-brand-accent" />;
    default: return <BarChart3 className="w-5 h-5 text-text-secondary" />;
  }
}

function severityBorder(severity: string): string {
  switch (severity) {
    case 'critical': return 'border-l-loss';
    case 'warning': return 'border-l-brand-accent';
    case 'success': return 'border-l-gain';
    default: return 'border-l-brand-primary';
  }
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export default function AlertsPage() {
  const [data, setData] = useState<AlertListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadAlerts = (filter: string) => {
    setLoading(true);
    api.alerts.list(filter)
      .then(setData)
      .catch(() => setData({ alerts: [], total: 0, unread: 0 }))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAlerts(activeFilter); }, [activeFilter]);

  const handleMarkRead = async (id: string) => {
    await api.alerts.markRead(id).catch(() => {});
    loadAlerts(activeFilter);
  };

  const handleDismiss = async (id: string) => {
    await api.alerts.dismiss(id).catch(() => {});
    loadAlerts(activeFilter);
  };

  const handleMarkAllRead = async () => {
    await api.alerts.markAllRead().catch(() => {});
    loadAlerts(activeFilter);
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-bg-surface rounded-xl p-5 animate-pulse h-20" />
        ))}
      </div>
    );
  }

  const alerts = data?.alerts ?? [];
  const unread = data?.unread ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Alerts & Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-text-secondary mt-1">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1 text-sm text-brand-primary hover:underline"
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setActiveFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeFilter === chip.key
                ? 'bg-brand-primary text-white'
                : 'bg-bg-surface text-text-secondary hover:text-text-primary'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Notification Feed */}
      {alerts.length === 0 ? (
        <div className="bg-bg-surface rounded-xl p-12 text-center">
          <CheckCheck className="w-12 h-12 text-gain mx-auto mb-4" />
          <p className="text-lg font-medium text-text-primary mb-1">All caught up!</p>
          <p className="text-sm text-text-secondary">
            No new notifications. We&apos;ll let you know when something needs your attention.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-bg-surface rounded-xl p-4 border-l-4 ${severityBorder(alert.severity)} flex items-start gap-4 relative group cursor-pointer transition-colors hover:bg-bg-elevated`}
              onClick={() => !alert.is_read && handleMarkRead(alert.id)}
            >
              {/* Unread dot */}
              {!alert.is_read && (
                <span className="absolute top-4 left-1 w-2 h-2 rounded-full bg-brand-primary" />
              )}

              {/* Type icon */}
              <div className="mt-0.5 ml-2">{typeIcon(alert.type)}</div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-base ${alert.is_read ? 'text-text-secondary' : 'font-medium text-text-primary'}`}>
                  {alert.title}
                </p>
                <p className="text-sm text-text-secondary mt-0.5">{alert.description}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-text-secondary">{timeAgo(alert.timestamp)}</span>
                  <Link
                    href={alert.link}
                    className="text-xs text-brand-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Dismiss */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDismiss(alert.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-text-secondary hover:text-text-primary"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
