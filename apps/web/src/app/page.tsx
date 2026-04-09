'use client';

import { useState } from 'react';
import { MessageSquare, RefreshCw, Target, Check } from 'lucide-react';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleWaitlist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
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
            <a
              href="#waitlist"
              className="px-8 py-3 bg-brand-primary text-white rounded-lg text-lg font-medium hover:opacity-90 transition-opacity"
            >
              Join the Waitlist
            </a>
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
              <Link
                href="/register"
                className="block w-full text-center px-6 py-3 border border-brand-primary text-brand-primary rounded-lg hover:bg-brand-primary hover:text-white transition-colors font-medium"
              >
                Join Free
              </Link>
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
