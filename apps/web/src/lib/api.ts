const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://forge-finance-api.onrender.com';

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
  budgets: {
    list: (period = 'monthly') =>
      apiFetch<BudgetListResponse>(`/api/budgets?period=${period}`),
    get: (id: string) =>
      apiFetch<BudgetDetail>(`/api/budgets/${id}`),
    create: (data: BudgetCreateInput) =>
      apiFetch<BudgetItem>('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<BudgetCreateInput>) =>
      apiFetch<{ status: string }>(`/api/budgets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch<{ status: string }>(`/api/budgets/${id}`, {
        method: 'DELETE',
      }),
  },
  goals: {
    list: (status = 'all') =>
      apiFetch<GoalListResponse>(`/api/goals?status=${status}`),
    get: (id: string) =>
      apiFetch<GoalItem>(`/api/goals/${id}`),
    create: (data: GoalCreateInput) =>
      apiFetch<GoalItem>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<GoalUpdateInput>) =>
      apiFetch<{ status: string; milestone?: number }>(`/api/goals/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      apiFetch<{ status: string }>(`/api/goals/${id}`, {
        method: 'DELETE',
      }),
  },
  investments: {
    getHoldings: () =>
      apiFetch<InvestmentHoldings>('/api/investments/holdings'),
    getPerformance: () =>
      apiFetch<InvestmentPerformance>('/api/investments/performance'),
  },
  netWorth: {
    getSummary: () =>
      apiFetch<NetWorthSummary>('/api/net-worth/summary'),
    getTrend: (months = 6) =>
      apiFetch<NetWorthTrend>(`/api/net-worth/trend?months=${months}`),
  },
  reports: {
    getMonthlySummary: (months = 6) =>
      apiFetch<ReportMonthlySummary>(`/api/reports/monthly-summary?months=${months}`),
    getCategoryTrends: (months = 3) =>
      apiFetch<ReportCategoryTrends>(`/api/reports/category-trends?months=${months}`),
  },
  alerts: {
    list: (filterType = 'all') =>
      apiFetch<AlertListResponse>(`/api/alerts?filter_type=${filterType}`),
    markRead: (id: string) =>
      apiFetch<{ status: string }>(`/api/alerts/${id}/read`, { method: 'PATCH' }),
    dismiss: (id: string) =>
      apiFetch<{ status: string }>(`/api/alerts/${id}/dismiss`, { method: 'POST' }),
    markAllRead: () =>
      apiFetch<{ status: string }>('/api/alerts/mark-all-read', { method: 'POST' }),
  },
  settings: {
    get2FAStatus: () =>
      apiFetch<{ enabled: boolean }>('/api/settings/2fa/status'),
    setup2FA: () =>
      apiFetch<{ secret: string; otpauth_uri: string }>('/api/settings/2fa/setup', { method: 'POST' }),
    verify2FA: (code: string) =>
      apiFetch<{ status: string }>('/api/settings/2fa/verify', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }),
    disable2FA: () =>
      apiFetch<{ status: string }>('/api/settings/2fa', { method: 'DELETE' }),
    verifyBetaAccess: (code: string) =>
      apiFetch<{ valid: boolean; message: string }>('/api/settings/beta-access', {
        method: 'POST',
        body: JSON.stringify({ code }),
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
  billing: {
    getSubscription: () =>
      apiFetch<BillingSubscription>('/api/billing/subscription'),
    getInvoices: () =>
      apiFetch<{ invoices: InvoiceItem[] }>('/api/billing/invoices'),
    createCheckoutSession: (successUrl: string, cancelUrl: string) =>
      apiFetch<{ id: string; url: string }>('/api/billing/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({ success_url: successUrl, cancel_url: cancelUrl }),
      }),
    createPortalSession: (returnUrl: string) =>
      apiFetch<{ url: string }>('/api/billing/create-portal-session', {
        method: 'POST',
        body: JSON.stringify({ return_url: returnUrl }),
      }),
  },
};

export interface BillingSubscription {
  plan: 'free' | 'pro';
  subscription: {
    id: string;
    status: string;
    current_period_end: number;
    cancel_at_period_end: boolean;
  } | null;
}

export interface InvoiceItem {
  id: string;
  amount_paid: number;
  currency: string;
  status: string;
  created: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  period_start: number;
  period_end: number;
}

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

export interface BudgetItem {
  id: string;
  category: string;
  amount_limit: number;
  spent: number;
  remaining: number;
  percent: number;
  status: 'on_track' | 'warning' | 'over_budget';
  period: string;
  alert_threshold: number;
  created_at: string | null;
}

export interface BudgetListResponse {
  budgets: BudgetItem[];
  health: number;
  total: number;
  on_track: number;
}

export interface BudgetDetail extends BudgetItem {
  transactions: Array<{
    id: string;
    amount: number;
    date: string;
    merchant_name: string | null;
    category: string | null;
    pending: boolean;
  }>;
}

export interface BudgetCreateInput {
  category: string;
  amount_limit: number;
  period?: string;
  alert_threshold?: number;
}

export interface GoalItem {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  percent: number;
  deadline: string | null;
  linked_account_id: string | null;
  status: string;
  pace: {
    status: 'on_track' | 'slightly_behind' | 'behind';
    projected_date: string | null;
  };
  created_at: string | null;
}

export interface GoalListResponse {
  active: GoalItem[];
  completed: GoalItem[];
  paused: GoalItem[];
  total: number;
}

export interface GoalCreateInput {
  name: string;
  target_amount: number;
  deadline?: string;
  linked_account_id?: string;
}

export interface GoalUpdateInput {
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string;
  status?: string;
}

export interface InvestmentHolding {
  id: string;
  name: string;
  official_name: string | null;
  type: string;
  subtype: string | null;
  institution_name: string | null;
  balance: number;
  currency: string;
}

export interface AllocationItem {
  type: string;
  value: number;
  percent: number;
}

export interface InvestmentHoldings {
  holdings: InvestmentHolding[];
  total_value: number;
  allocation: AllocationItem[];
}

export interface InvestmentPerformance {
  data: Array<{ date: string; value: number }>;
  total_value: number;
  total_gain: number;
}

export interface NetWorthAccount {
  id: string;
  name: string;
  type: string;
  subtype: string | null;
  institution_name: string | null;
  balance: number;
}

export interface NetWorthSummary {
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  assets: NetWorthAccount[];
  liabilities: NetWorthAccount[];
}

export interface NetWorthTrend {
  data: Array<{ date: string; net_worth: number }>;
  current: number;
}

export interface ReportMonthItem {
  year: number;
  month: number;
  income: number;
  expenses: number;
  net: number;
}

export interface ReportMonthlySummary {
  months: ReportMonthItem[];
}

export interface ReportCategoryItem {
  category: string;
  total: number;
  count: number;
}

export interface ReportCategoryTrends {
  categories: ReportCategoryItem[];
}

export interface AlertItem {
  id: string;
  type: 'budget' | 'goal' | 'sync' | 'system' | 'ai';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  is_read: boolean;
  timestamp: string;
  link: string;
}

export interface AlertListResponse {
  alerts: AlertItem[];
  total: number;
  unread: number;
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
