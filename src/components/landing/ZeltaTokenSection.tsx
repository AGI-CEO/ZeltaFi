'use client';

import { GlassCard } from '../ui/GlassCard';
import Link from 'next/link';

export function ZeltaTokenSection() {
  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400 mb-3">
          $ZELTA Token
        </p>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          Own the Alpha Engine.
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
          $ZELTA isn&apos;t a governance token collecting dust. It&apos;s a direct claim on the excess yield our AI agents generate — the spread between passive staking and autonomous strategy construction.
        </p>
      </div>

      {/* Flywheel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Flywheel visual */}
        <div className="relative">
          <GlassCard padding="lg" className="border-violet-500/20">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-6">
              The Compounding Flywheel
            </h3>

            <div className="space-y-4">
              {[
                { step: '1', icon: '💰', text: 'Capital deploys', sub: 'Smart Whales deposit USDC into self-custodial vaults', color: 'emerald' },
                { step: '2', icon: '🧠', text: 'AI constructs strategies', sub: 'Leveraged loops, cross-protocol optimization, incentive timing', color: 'cyan' },
                { step: '3', icon: '📈', text: 'Excess alpha captured', sub: 'Returns above passive Aave baseline = alpha', color: 'violet' },
                { step: '4', icon: '🪙', text: '$ZELTA holders profit', sub: '70% of alpha → stakers | 20% → buyback & burn', color: 'amber' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 group">
                  <div className={`shrink-0 w-10 h-10 rounded-xl bg-${item.color}-500/10 border border-${item.color}-500/20 flex items-center justify-center text-lg`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">{item.text}</div>
                    <div className="text-xs text-[var(--text-muted)]">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loop arrow */}
            <div className="mt-4 flex items-center justify-center">
              <div className="text-xs text-violet-400 font-mono flex items-center gap-2">
                <span>↻</span> More AUM → more strategies viable → higher returns → higher $ZELTA → repeat
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Token utility cards */}
        <div className="space-y-4">
          {[
            {
              title: 'Alpha Profit Sharing',
              icon: '💎',
              desc: '70% of all excess alpha — the yield our AI generates above passive Aave staking — distributes to $ZELTA stakers. The better the AI performs, the more you earn.',
              metric: '70%',
              metricLabel: 'of alpha to stakers',
              color: 'emerald',
            },
            {
              title: 'Fee Reduction Tiers',
              icon: '🏷️',
              desc: 'Hold $ZELTA to reduce the per-trade performance cost. Diamond tier (250K+ $ZELTA) gets 60% reduction.',
              metric: 'Up to 60%',
              metricLabel: 'fee reduction',
              color: 'cyan',
            },
            {
              title: 'Deflationary Buyback',
              icon: '🔥',
              desc: '20% of alpha funds automated $ZELTA buybacks from the open market. Tokens are burned permanently. More alpha = more scarcity.',
              metric: '20%',
              metricLabel: 'buyback & burn',
              color: 'amber',
            },
            {
              title: 'Strategy Governance',
              icon: '🗳️',
              desc: 'Vote on risk parameters, new protocol integrations, leverage limits, and AI agent team composition. Your capital, your rules.',
              metric: '1 ZELTA',
              metricLabel: '= 1 vote',
              color: 'violet',
            },
          ].map((card) => (
            <GlassCard key={card.title} padding="md" hover className={`border-${card.color}-500/10`}>
              <div className="flex items-start gap-4">
                <span className="text-2xl">{card.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{card.title}</h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed mb-2">{card.desc}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-lg font-bold font-mono text-${card.color}-400`}>{card.metric}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{card.metricLabel}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-10 text-center">
        <Link
          href="/onboard"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 active:scale-95 transition-all duration-300"
        >
          Start Earning with $ZELTA
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
