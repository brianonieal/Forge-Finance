'use client';

import { useState } from 'react';
import { MessageSquare, RefreshCw, Target, Check, X, LayoutDashboard, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {/* Nav Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 h-14 bg-bg-base/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-2 text-brand-primary font-semibold">
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-lg">Forge</span>
        </div>
        <button
          onClick={() => setShowAuth(true)}
          className="px-5 py-2 text-sm font-medium border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors"
        >
          Login
        </button>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-b from-bg-base to-bg-surface" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            Your finances, explained by AI.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-8">
            Forge Finance connects to your bank, syncs your transactions in real-time,
            and lets you ask questions about your money in plain English.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setShowAuth(true)}
              className="px-8 py-3 bg-brand-primary text-white rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
            >
              Join Free
            </button>
            <a
              href="#features"
              className="px-8 py-3 border border-border rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-surface transition-colors"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How Forge Finance Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-brand-primary" />}
              title="Conversational AI"
              description="Ask @ORACLE anything about your spending. Get instant, context-aware answers powered by AI that understands your financial data."
            />
            <FeatureCard
              icon={<RefreshCw className="w-8 h-8 text-brand-primary" />}
              title="Real-Time Sync"
              description="Connect your bank via Plaid. Transactions sync automatically through webhooks — no manual imports, no stale data."
            />
            <FeatureCard
              icon={<Target className="w-8 h-8 text-brand-primary" />}
              title="Smart Budgets & Goals"
              description="Set budgets by category with intelligent alerts. Track savings goals with pace indicators that tell you if you're on track."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-bg-surface">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Tier */}
            <div className="bg-bg-elevated rounded-xl p-8 border border-border">
              <h3 className="text-xl font-semibold mb-2">Free</h3>
              <p className="text-3xl font-mono font-bold mb-6">
                $0<span className="text-sm text-text-secondary font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <PricingItem>1 linked bank account</PricingItem>
                <PricingItem>90-day transaction history</PricingItem>
                <PricingItem>10 AI queries per month</PricingItem>
                <PricingItem>Basic budgets & goals</PricingItem>
              </ul>
              <button
                onClick={() => setShowAuth(true)}
                className="block w-full text-center px-6 py-3 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors font-medium"
              >
                Join Free
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-bg-elevated rounded-xl p-8 border-2 border-brand-primary relative">
              <span className="absolute -top-3 left-6 px-3 py-0.5 bg-brand-primary text-white text-xs font-medium rounded-full">
                Coming Soon
              </span>
              <h3 className="text-xl font-semibold mb-2">Pro</h3>
              <p className="text-3xl font-mono font-bold mb-6">
                $9<span className="text-sm text-text-secondary font-normal">/month</span>
              </p>
              <ul className="space-y-3 mb-8">
                <PricingItem>Unlimited bank accounts</PricingItem>
                <PricingItem>Full transaction history</PricingItem>
                <PricingItem>Unlimited AI queries</PricingItem>
                <PricingItem>Reports & analytics</PricingItem>
                <PricingItem>Investment tracking</PricingItem>
              </ul>
              <button
                className="block w-full text-center px-6 py-3 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                onClick={() => document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Join Waitlist for Pro
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Waitlist Signup */}
      <section id="waitlist" className="py-20 px-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Get Early Access</h2>
          <p className="text-text-secondary mb-8">
            Be the first to know when Forge Finance launches.
          </p>

          {submitted ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gain/20 flex items-center justify-center">
                <Check className="w-6 h-6 text-gain" />
              </div>
              <p className="text-lg font-medium text-text-primary">You&apos;re on the list!</p>
              <p className="text-sm text-text-secondary">We&apos;ll let you know when we launch.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-bg-surface border border-border rounded-lg px-4 py-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                required
              />
              <button
                type="submit"
                className="px-8 py-3 bg-brand-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                Join Waitlist
              </button>
            </form>
          )}

          <p className="text-xs text-text-secondary mt-4">
            We&apos;ll never share your email.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border text-center">
        <p className="text-sm text-text-secondary">
          © 2026 Forge Finance. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-bg-surface rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}

function PricingItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2 text-sm text-text-secondary">
      <Check className="w-4 h-4 text-gain flex-shrink-0" />
      {children}
    </li>
  );
}

function AuthModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const { signInWithGoogle, signInWithMagicLink } = useAuthStore();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    const { error } = await signInWithMagicLink(email);
    setLoading(false);
    if (error) {
      toast({ type: 'error', title: 'Error', description: error });
    } else {
      setMagicLinkSent(true);
      toast({ type: 'success', title: 'Check your email', description: 'We sent you a magic link to sign in.' });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-bg-surface rounded-xl p-8 border border-border mx-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-text-primary transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-center gap-2 mb-6">
          <LayoutDashboard className="h-6 w-6 text-brand-primary" />
          <span className="text-lg font-semibold text-brand-primary">Forge Finance</span>
        </div>

        {magicLinkSent ? (
          <div className="text-center">
            <h2 className="text-xl font-semibold text-text-primary mb-2">Check your email</h2>
            <p className="text-text-secondary text-sm mb-4">
              We sent a magic link to <strong>{email}</strong>
            </p>
            <button onClick={() => setMagicLinkSent(false)} className="text-sm text-brand-primary hover:underline">
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-text-primary text-center mb-1">Welcome</h2>
            <p className="text-sm text-text-secondary text-center mb-6">Sign in or create your account</p>

            <button
              onClick={signInWithGoogle}
              className={cn(
                'w-full flex items-center justify-center gap-2 h-10 rounded-lg',
                'border border-border text-text-primary text-sm font-medium',
                'hover:bg-bg-overlay transition-colors',
              )}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-secondary">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <form onSubmit={handleMagicLink} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className={cn(
                  'w-full h-10 px-3 rounded-lg text-sm',
                  'bg-bg-base border border-border text-text-primary',
                  'placeholder:text-text-secondary/60',
                  'focus:outline-none focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary',
                )}
              />
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  'w-full h-10 rounded-lg text-sm font-medium',
                  'bg-brand-primary text-white',
                  'hover:opacity-90 transition-opacity',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center justify-center gap-2',
                )}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Magic Link
              </button>
            </form>

            <p className="text-xs text-text-secondary text-center mt-4">
              By continuing, you agree to our Terms of Service.
            </p>

            <p className="text-xs text-text-secondary/60 text-center mt-3">
              Test account: username user / password pass
            </p>
          </>
        )}
      </div>
    </div>
  );
}
