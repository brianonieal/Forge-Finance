"use client";

import { useEffect, useState } from "react";
import { CreditCard, Check, ExternalLink, Loader2 } from "lucide-react";
import { api, type BillingSubscription, type InvoiceItem } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const PRO_PRICE_PER_MONTH = 9;

export default function BillingPage() {
  const [subscription, setSubscription] = useState<BillingSubscription | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.billing.getSubscription(), api.billing.getInvoices()])
      .then(([sub, inv]) => {
        if (cancelled) return;
        setSubscription(sub);
        setInvoices(inv.invoices);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isPro = subscription?.plan === "pro";

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await api.billing.createCheckoutSession(
        `${origin}/settings/billing?status=success`,
        `${origin}/settings/billing?status=cancelled`
      );
      window.location.href = res.url;
    } catch {
      toast({ type: "error", title: "Could not start checkout. Try again later." });
      setActionLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const res = await api.billing.createPortalSession(`${origin}/settings/billing`);
      window.location.href = res.url;
    } catch {
      toast({ type: "error", title: "Could not open billing portal. Try again later." });
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-text-secondary">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading billing details...
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-text-primary">
          Subscription &amp; billing
        </h2>
        <p className="text-xs text-text-secondary mt-1">
          Manage your plan, view invoices, and update payment information.
        </p>
      </div>

      <PlanCard
        isPro={isPro}
        subscription={subscription}
        actionLoading={actionLoading}
        onUpgrade={handleUpgrade}
        onManageBilling={handleManageBilling}
        onCancel={() => setShowCancelConfirm(true)}
      />

      <PlanComparisonTable isPro={isPro} />

      {isPro && (
        <PaymentHistoryTable invoices={invoices} />
      )}

      {showCancelConfirm && (
        <CancellationModal
          actionLoading={actionLoading}
          onClose={() => setShowCancelConfirm(false)}
          onConfirm={handleManageBilling}
        />
      )}
    </div>
  );
}


// --- PlanCard ---------------------------------------------------------------

function PlanCard({
  isPro,
  subscription,
  actionLoading,
  onUpgrade,
  onManageBilling,
  onCancel,
}: {
  isPro: boolean;
  subscription: BillingSubscription | null;
  actionLoading: boolean;
  onUpgrade: () => void;
  onManageBilling: () => void;
  onCancel: () => void;
}) {
  const periodEnd =
    subscription?.subscription?.current_period_end
      ? new Date(subscription.subscription.current_period_end * 1000).toLocaleDateString()
      : null;

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-secondary">Current plan</p>
          <p className="text-2xl font-semibold text-text-primary mt-1">
            {isPro ? "Forge Pro" : "Forge Free"}
          </p>
          {isPro && periodEnd && (
            <p className="text-xs text-text-secondary mt-1">
              {subscription?.subscription?.cancel_at_period_end
                ? `Cancels on ${periodEnd}`
                : `Renews on ${periodEnd}`}
            </p>
          )}
          {!isPro && (
            <p className="text-xs text-text-secondary mt-1">
              10 @ORACLE queries / month · Limited insights
            </p>
          )}
        </div>
        <CreditCard className="h-6 w-6 text-text-secondary" aria-hidden />
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        {!isPro ? (
          <button
            onClick={onUpgrade}
            disabled={actionLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "bg-brand-primary text-white hover:opacity-90 transition-opacity",
              "disabled:opacity-50 flex items-center gap-2"
            )}
          >
            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upgrade to Pro — ${PRO_PRICE_PER_MONTH}/mo
          </button>
        ) : (
          <>
            <button
              onClick={onManageBilling}
              disabled={actionLoading}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium",
                "border border-brand-primary text-brand-primary",
                "hover:bg-brand-primary hover:text-white transition-colors",
                "disabled:opacity-50 flex items-center gap-2"
              )}
            >
              {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Manage billing
              <ExternalLink className="h-3 w-3" />
            </button>
            <button
              onClick={onCancel}
              disabled={actionLoading}
              className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-loss transition-colors"
            >
              Cancel subscription
            </button>
          </>
        )}
      </div>
    </div>
  );
}


// --- PlanComparisonTable ----------------------------------------------------

const FEATURES: Array<{
  label: string;
  free: string | boolean;
  pro: string | boolean;
}> = [
  { label: "@ORACLE AI queries", free: "10 / month", pro: "Unlimited" },
  { label: "Bank account connections", free: true, pro: true },
  { label: "Real-time transaction sync", free: true, pro: true },
  { label: "Budgets and goals", free: true, pro: true },
  { label: "Investment tracking", free: true, pro: true },
  { label: "Net worth dashboard", free: true, pro: true },
  { label: "Custom alerts and reports", free: false, pro: true },
  { label: "Priority support", free: false, pro: true },
];

function PlanComparisonTable({ isPro }: { isPro: boolean }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-primary">Compare plans</h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-overlay">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">
                Feature
              </th>
              <th
                className={cn(
                  "px-4 py-3 text-xs font-medium text-center",
                  !isPro && "text-brand-primary"
                )}
              >
                Free {!isPro && "(current)"}
              </th>
              <th
                className={cn(
                  "px-4 py-3 text-xs font-medium text-center",
                  isPro && "text-brand-primary"
                )}
              >
                Pro {isPro && "(current)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f) => (
              <tr key={f.label} className="border-t border-border">
                <td className="px-4 py-3 text-text-primary">{f.label}</td>
                <td className="px-4 py-3 text-center text-text-secondary">
                  <FeatureCell value={f.free} />
                </td>
                <td className="px-4 py-3 text-center text-text-primary">
                  <FeatureCell value={f.pro} highlight={isPro} />
                </td>
              </tr>
            ))}
            <tr className="border-t border-border bg-bg-overlay/50">
              <td className="px-4 py-3 font-medium text-text-primary">Price</td>
              <td className="px-4 py-3 text-center text-text-secondary">$0</td>
              <td className="px-4 py-3 text-center text-text-primary font-mono">
                ${PRO_PRICE_PER_MONTH}/mo
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FeatureCell({
  value,
  highlight,
}: {
  value: string | boolean;
  highlight?: boolean;
}) {
  if (value === true) {
    return <Check className={cn("inline h-4 w-4", highlight ? "text-gain" : "text-text-secondary")} aria-label="included" />;
  }
  if (value === false) {
    return <span className="text-text-secondary" aria-label="not included">—</span>;
  }
  return <span>{value}</span>;
}


// --- PaymentHistoryTable -----------------------------------------------------

function PaymentHistoryTable({ invoices }: { invoices: InvoiceItem[] }) {
  if (invoices.length === 0) {
    return (
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-text-primary">Payment history</h3>
        <p className="text-sm text-text-secondary bg-bg-surface border border-border rounded-lg p-4">
          No invoices yet. Your first charge will appear here after your trial period.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-primary">Payment history</h3>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-bg-overlay">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Date</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-text-secondary">Status</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Amount</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-text-secondary">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => {
              const date = new Date(inv.created * 1000).toLocaleDateString();
              const amount = (inv.amount_paid / 100).toFixed(2);
              return (
                <tr key={inv.id} className="border-t border-border">
                  <td className="px-4 py-3 text-text-primary">{date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded text-xs",
                        inv.status === "paid"
                          ? "bg-gain/10 text-gain"
                          : "bg-bg-overlay text-text-secondary"
                      )}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-text-primary">
                    ${amount}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inv.hosted_invoice_url ? (
                      <a
                        href={inv.hosted_invoice_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:underline inline-flex items-center gap-1"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-text-secondary">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


// --- CancellationModal -------------------------------------------------------

function CancellationModal({
  actionLoading,
  onClose,
  onConfirm,
}: {
  actionLoading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="bg-bg-surface border border-border rounded-lg max-w-md w-full p-6 space-y-4">
        <h3 id="cancel-title" className="text-lg font-semibold text-text-primary">
          Cancel your subscription?
        </h3>
        <p className="text-sm text-text-secondary">
          You&apos;ll keep Pro features until the end of your current billing period.
          After that, your account will revert to the Free plan with 10 @ORACLE queries per month.
        </p>
        <ul className="text-xs text-text-secondary space-y-1 pl-4 list-disc">
          <li>Your transaction data and account connections are preserved</li>
          <li>You can resubscribe anytime</li>
          <li>No partial refunds for unused time on the current period</li>
        </ul>
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="px-4 py-2 rounded-lg text-sm text-text-secondary hover:text-text-primary"
          >
            Keep Pro
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium",
              "border border-loss text-loss hover:bg-loss/10 transition-colors",
              "disabled:opacity-50 flex items-center gap-2"
            )}
          >
            {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue to Stripe
          </button>
        </div>
      </div>
    </div>
  );
}
