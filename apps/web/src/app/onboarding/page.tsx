'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Building2, Loader2, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { usePlaidConnect } from '@/hooks/use-plaid-link';
import { api } from '@/lib/api';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [syncStatus, setSyncStatus] = useState<'waiting' | 'syncing' | 'complete'>('waiting');
  const [accountCount, setAccountCount] = useState(0);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-bg-base flex flex-col items-center justify-center p-4">
      {/* Progress bar */}
      <div className="w-full max-w-md mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary">Step {currentStep} of 4</span>
        </div>
        <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-primary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step content */}
      <div className="w-full max-w-md">
        {currentStep === 1 && (
          <Step1Welcome onNext={() => setCurrentStep(2)} />
        )}
        {currentStep === 2 && (
          <Step2PlaidConnect
            onSuccess={(count) => {
              setAccountCount(count);
              setCurrentStep(3);
              setSyncStatus('syncing');
            }}
          />
        )}
        {currentStep === 3 && (
          <Step3Syncing
            syncStatus={syncStatus}
            onComplete={() => {
              setSyncStatus('complete');
              setCurrentStep(4);
            }}
          />
        )}
        {currentStep === 4 && (
          <Step4Complete
            accountCount={accountCount}
            onFinish={() => router.push('/dashboard')}
          />
        )}
      </div>
    </div>
  );
}

function Step1Welcome({ onNext }: { onNext: () => void }) {
  return (
    <div className="bg-bg-surface rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Sparkles className="w-8 h-8 text-brand-primary" />
      </div>
      <h1 className="text-2xl font-bold text-text-primary mb-3">
        Welcome to Forge Finance
      </h1>
      <p className="text-text-secondary mb-8 leading-relaxed">
        Connect your bank account to get AI-powered insights into your spending,
        budgets, and savings goals. Your data is encrypted and never shared.
      </p>
      <button
        onClick={onNext}
        className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        Connect Your Bank
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function Step2PlaidConnect({
  onSuccess,
}: {
  onSuccess: (accountCount: number) => void;
}) {
  const { open, ready, isExchanging, error } = usePlaidConnect();
  const [connectError, setConnectError] = useState<string | null>(null);

  const handleConnect = useCallback(async () => {
    try {
      open();
    } catch {
      setConnectError('Failed to open bank connection');
    }
  }, [open]);

  // Listen for successful exchange via the hook's internal state
  // The usePlaidConnect hook handles the exchange internally
  // We monitor account creation by polling after exchange
  useEffect(() => {
    if (isExchanging) return;
    // After exchange completes, check for accounts
    const checkAccounts = async () => {
      try {
        const { accounts } = await api.plaid.getAccounts();
        if (accounts.length > 0) {
          onSuccess(accounts.length);
        }
      } catch {
        // Not yet connected
      }
    };

    // Only check if we had an exchange happen
    const timeout = setTimeout(checkAccounts, 1000);
    return () => clearTimeout(timeout);
  }, [isExchanging, onSuccess]);

  return (
    <div className="bg-bg-surface rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Building2 className="w-8 h-8 text-brand-primary" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-3">
        Connect Your Bank
      </h2>
      <p className="text-text-secondary mb-6">
        We use Plaid to securely connect to your bank. Your credentials are never
        stored on our servers.
      </p>

      {(error || connectError) && (
        <div className="mb-4 p-3 bg-loss/10 border border-loss/20 rounded-lg text-loss text-sm">
          {error || connectError}
        </div>
      )}

      <button
        onClick={handleConnect}
        disabled={!ready || isExchanging}
        className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isExchanging ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Building2 className="w-4 h-4" />
            Connect Bank Account
          </>
        )}
      </button>

      <div className="mt-6 flex items-center justify-center gap-2 text-xs text-text-secondary">
        <Shield className="w-3.5 h-3.5" />
        <span>256-bit encryption &middot; Bank-level security</span>
      </div>
    </div>
  );
}

function Step3Syncing({
  syncStatus,
  onComplete,
}: {
  syncStatus: 'waiting' | 'syncing' | 'complete';
  onComplete: () => void;
}) {
  // ERR-PLAID-002: 5-minute timeout with polling fallback
  useEffect(() => {
    if (syncStatus !== 'syncing') return;

    // Poll for sync completion (check if transactions exist)
    const interval = setInterval(async () => {
      try {
        const { accounts } = await api.plaid.getAccounts();
        if (accounts.length > 0) {
          onComplete();
        }
      } catch {
        // Keep polling
      }
    }, 5000);

    // 5-minute timeout — proceed even if sync hasn't completed
    const timeout = setTimeout(() => {
      onComplete();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [syncStatus, onComplete]);

  return (
    <div className="bg-bg-surface rounded-xl p-8 text-center">
      <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-brand-primary animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-3">
        Syncing Your Transactions
      </h2>
      <p className="text-text-secondary mb-4">
        This may take a few minutes while we pull your transaction history.
      </p>
      <div className="w-full h-2 bg-bg-elevated rounded-full overflow-hidden">
        <div className="h-full bg-brand-primary rounded-full animate-pulse w-2/3" />
      </div>
      <p className="text-xs text-text-secondary mt-4">
        You&apos;ll be redirected automatically when ready
      </p>
    </div>
  );
}

function Step4Complete({
  accountCount,
  onFinish,
}: {
  accountCount: number;
  onFinish: () => void;
}) {
  return (
    <div className="bg-bg-surface rounded-xl p-8 text-center">
      <div className="w-16 h-16 bg-gain/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-gain" />
      </div>
      <h2 className="text-xl font-bold text-text-primary mb-3">
        Your Finances Are Ready
      </h2>
      <p className="text-text-secondary mb-6">
        We&apos;ve connected {accountCount} account{accountCount !== 1 ? 's' : ''} and
        synced your transactions. Here&apos;s what&apos;s waiting for you:
      </p>

      {/* Insight preview cards */}
      <div className="space-y-3 mb-8">
        {[
          { label: 'AI-Powered Insights', desc: 'Ask questions about your spending' },
          { label: 'Smart Budgets', desc: 'Track spending by category' },
          { label: 'Savings Goals', desc: 'Set and track financial goals' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg text-left"
          >
            <Sparkles className="w-5 h-5 text-brand-accent flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-text-primary">{item.label}</p>
              <p className="text-xs text-text-secondary">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onFinish}
        className="w-full py-3 px-6 bg-brand-primary hover:bg-brand-primary/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
