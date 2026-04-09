const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const { headers, ...rest } = options;

  // Get the session token from Supabase
  const { createBrowserClient } = await import('@supabase/ssr');
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  plaid: {
    createLinkToken: () =>
      apiFetch<{ link_token: string; expiration: string }>('/api/plaid/create-link-token', {
        method: 'POST',
      }),
    exchangePublicToken: (publicToken: string, institutionName?: string) =>
      apiFetch<{ item_id: string; accounts_created: number; initial_sync: Record<string, unknown> }>(
        '/api/plaid/exchange-public-token',
        {
          method: 'POST',
          body: JSON.stringify({
            public_token: publicToken,
            institution_name: institutionName,
          }),
        },
      ),
    getAccounts: () =>
      apiFetch<{ accounts: PlaidAccount[] }>('/api/plaid/accounts'),
  },
  dashboard: {
    getMetrics: (period = '1M') =>
      apiFetch<DashboardMetrics>(`/api/dashboard/metrics?period=${period}`),
    getSpendingTrend: (period = '1M') =>
      apiFetch<{ data: SpendingDataPoint[]; period: string }>(`/api/dashboard/spending-trend?period=${period}`),
    getCategoryBreakdown: (period = '1M') =>
      apiFetch<{ data: CategoryDataPoint[]; period: string }>(`/api/dashboard/category-breakdown?period=${period}`),
  },
  transactions: {
    list: (params: TransactionListParams = {}) => {
      const qs = new URLSearchParams();
      if (params.account_id) qs.set('account_id', params.account_id);
      if (params.category) qs.set('category', params.category);
      if (params.start) qs.set('start', params.start);
      if (params.end) qs.set('end', params.end);
      if (params.search) qs.set('search', params.search);
      if (params.sort_by) qs.set('sort_by', params.sort_by);
      if (params.sort_order) qs.set('sort_order', params.sort_order);
      if (params.limit) qs.set('limit', String(params.limit));
      if (params.offset) qs.set('offset', String(params.offset));
      return apiFetch<TransactionListResponse>(`/api/transactions?${qs.toString()}`);
    },
    get: (id: string) => apiFetch<TransactionItem>(`/api/transactions/${id}`),
    recategorize: (id: string, data: { category?: string; notes?: string }) =>
      apiFetch<{ status: string }>(`/api/transactions/${id}/category`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  oracle: {
    query: (query: string, conversationId?: string) =>
      fetch(`${API_BASE}/api/oracle/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, conversation_id: conversationId }),
      }),
    getHistory: () =>
      apiFetch<{ conversations: ConversationItem[] }>('/api/oracle/history'),
    getUsage: () =>
      apiFetch<OracleUsage>('/api/oracle/usage'),
  },
};

export interface DashboardMetrics {
  net_worth: number;
  daily_pnl: number;
  budget_health: number;
  top_spend: { category: string; amount: number };
  period: string;
}

export interface SpendingDataPoint {
  date: string;
  amount: number;
}

export interface CategoryDataPoint {
  category: string;
  amount: number;
}

export interface TransactionListParams {
  account_id?: string;
  category?: string;
  start?: string;
  end?: string;
  search?: string;
  sort_by?: string;
  sort_order?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionItem {
  id: string;
  account_id: string;
  amount: number;
  date: string;
  merchant_name: string | null;
  merchant_logo: string | null;
  category: string | null;
  subcategory: string | null;
  pending: boolean;
  notes: string | null;
}

export interface TransactionListResponse {
  transactions: TransactionItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ConversationItem {
  id: string;
  title: string | null;
  messages: Array<{ role: string; content: string; timestamp: string }>;
  created_at: string;
  updated_at: string;
}

export interface OracleUsage {
  queries_used: number;
  queries_limit: number;
  monthly_cost: number;
  cost_ceiling: number;
  is_pro: boolean;
}

export interface PlaidAccount {
  id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  mask: string | null;
  institution_name: string | null;
  institution_logo: string | null;
  balance_current: number | null;
  balance_available: number | null;
  currency: string;
  plaid_item_id: string | null;
  last_synced: string | null;
}
