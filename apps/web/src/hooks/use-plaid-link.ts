'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink as usePlaidLinkLib, PlaidLinkOnSuccess } from 'react-plaid-link';
import { api } from '@/lib/api';

export function usePlaidConnect() {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [isExchanging, setIsExchanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    api.plaid
      .createLinkToken()
      .then((data) => {
        if (mounted) setLinkToken(data.link_token);
      })
      .catch((err) => {
        if (mounted) setError(err.message);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(
    async (publicToken, metadata) => {
      setIsExchanging(true);
      setError(null);
      try {
        const result = await api.plaid.exchangePublicToken(
          publicToken,
          metadata.institution?.name,
        );
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect account');
        throw err;
      } finally {
        setIsExchanging(false);
      }
    },
    [],
  );

  const { open, ready } = usePlaidLinkLib({
    token: linkToken,
    onSuccess,
  });

  return {
    open,
    ready: ready && !isExchanging,
    isExchanging,
    error,
  };
}
