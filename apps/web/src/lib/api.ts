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
};

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
