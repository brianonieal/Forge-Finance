'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ArrowUpDown, X, Download } from 'lucide-react';
import { api, TransactionItem } from '@/lib/api';

const CATEGORIES = ['All', 'Food', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Income', 'Transfer'];

function fmt(n: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedTxn, setSelectedTxn] = useState<TransactionItem | null>(null);
  const [offset, setOffset] = useState(0);
  const limit = 25;

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.transactions.list({
        search: search || undefined,
        category: category !== 'All' ? category : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
        limit,
        offset,
      });
      setTransactions(result.transactions);
      setTotal(result.total);
    } catch {
      // Error handled
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, sortOrder, offset]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
    setOffset(0);
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">Transactions</h1>
        <button className="flex items-center gap-2 py-2 px-4 bg-bg-surface text-text-secondary rounded-lg text-sm border border-border opacity-50 cursor-not-allowed">
          <Download className="w-4 h-4" /> Export
        </button>
      </div>

      {/* Search + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setOffset(0); }}
            placeholder="Search transactions..."
            className="w-full pl-10 pr-4 py-2.5 bg-bg-surface text-text-primary rounded-lg border border-border focus:border-brand-primary focus:outline-none text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setOffset(0); }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                category === cat
                  ? 'bg-brand-primary text-white'
                  : 'bg-bg-surface text-text-secondary hover:text-text-primary border border-border'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-bg-surface rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {[
                { key: 'date', label: 'Date' },
                { key: 'merchant_name', label: 'Merchant' },
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount' },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className="text-left text-xs font-medium text-text-secondary p-4 cursor-pointer hover:text-text-primary select-none"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {sortBy === col.key && (
                      <ArrowUpDown className="w-3 h-3 text-brand-primary" />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border">
                  <td className="p-4"><div className="h-4 w-20 bg-bg-elevated rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-32 bg-bg-elevated rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-16 bg-bg-elevated rounded animate-pulse" /></td>
                  <td className="p-4"><div className="h-4 w-20 bg-bg-elevated rounded animate-pulse" /></td>
                </tr>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((txn) => (
                <tr
                  key={txn.id}
                  onClick={() => setSelectedTxn(txn)}
                  className="border-b border-border hover:bg-bg-elevated/50 cursor-pointer transition-colors"
                >
                  <td className="p-4 text-sm text-text-secondary">{txn.date}</td>
                  <td className="p-4 text-sm text-text-primary font-medium">{txn.merchant_name || 'Unknown'}</td>
                  <td className="p-4">
                    {txn.category && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-bg-elevated text-text-secondary">
                        {txn.category}
                      </span>
                    )}
                  </td>
                  <td className={`p-4 text-sm font-mono font-semibold text-right ${
                    txn.amount < 0 ? 'text-loss' : 'text-gain'
                  }`}>
                    {txn.amount < 0 ? '-' : '+'}{fmt(Math.abs(txn.amount))}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-8 text-center text-text-secondary text-sm">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {total > limit && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <span className="text-xs text-text-secondary">
              {offset + 1}–{Math.min(offset + limit, total)} of {total}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setOffset(Math.max(0, offset - limit))}
                disabled={offset === 0}
                className="text-xs px-3 py-1 rounded bg-bg-elevated text-text-secondary disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setOffset(offset + limit)}
                disabled={offset + limit >= total}
                className="text-xs px-3 py-1 rounded bg-bg-elevated text-text-secondary disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Drawer */}
      {selectedTxn && (
        <div className="fixed inset-y-0 right-0 w-96 bg-bg-surface border-l border-border shadow-xl z-50 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-text-primary">Transaction Detail</h2>
            <button onClick={() => setSelectedTxn(null)} className="text-text-secondary hover:text-text-primary">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xl font-semibold text-text-primary">{selectedTxn.merchant_name || 'Unknown'}</p>
              <p className={`text-3xl font-mono font-bold mt-2 ${selectedTxn.amount < 0 ? 'text-loss' : 'text-gain'}`}>
                {selectedTxn.amount < 0 ? '-' : '+'}{fmt(Math.abs(selectedTxn.amount))}
              </p>
            </div>

            <div className="space-y-3 border-t border-border pt-4">
              <Detail label="Date" value={selectedTxn.date} />
              <Detail label="Category" value={selectedTxn.category || 'Uncategorized'} />
              <Detail label="Status" value={selectedTxn.pending ? 'Pending' : 'Posted'} />
              {selectedTxn.notes && <Detail label="Notes" value={selectedTxn.notes} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm text-text-primary">{value}</span>
    </div>
  );
}
