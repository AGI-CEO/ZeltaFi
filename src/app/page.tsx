import Link from 'next/link';
import { Navbar } from '../components/ui/Navbar';
import { ParticleHero } from '../components/landing/ParticleHero';
import { LiveStatsTicker } from '../components/landing/LiveStatsTicker';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { HowItWorks } from '../components/landing/HowItWorks';
import { AgentTeamShowcase } from '../components/landing/AgentTeamShowcase';
import { ZeltaTokenSection } from '../components/landing/ZeltaTokenSection';

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-void)]">
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden bg-mesh pt-16">
        <ParticleHero />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full glass-surface animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Autonomous Yield Orchestration on Arc
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 animate-slide-in-bottom leading-[1.1]">
            <span className="text-[var(--text-primary)]">The Self-Driving</span>
            <br />
            <span className="text-gradient-brand">
              Family Office.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-4 animate-slide-in-bottom leading-relaxed"
            style={{ animationDelay: '150ms', opacity: 0 }}
          >
            7 autonomous AI agents construct and execute multi-step yield strategies — leveraged loops, cross-protocol optimization, and incentive timing — delivering double-digit stablecoin returns from your self-custodial wallet. Zero management fees. You pay <span className="text-emerald-400 font-semibold">$0.005 only when the AI proves you made money</span>.
          </p>

          {/* Key stats inline */}
          <div
            className="flex items-center justify-center gap-6 mb-10 animate-slide-in-bottom"
            style={{ animationDelay: '250ms', opacity: 0 }}
          >
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-emerald-400">10-14%</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Target APY</div>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-cyan-400">$0.005</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Only If Profitable</div>
            </div>
            <div className="w-px h-8 bg-[var(--border-subtle)]" />
            <div className="text-center">
              <div className="text-2xl font-bold font-mono text-violet-400">24/7</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Self-Improving AI</div>
            </div>
          </div>

          {/* CTAs */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-in-bottom"
            style={{ animationDelay: '350ms', opacity: 0 }}
          >
            <Link
              href="/onboard"
              className="group relative px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300
                bg-gradient-to-r from-emerald-500 to-cyan-500 text-white
                hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02]
                active:scale-[0.98]"
            >
              <span className="relative z-10">Start Earning →</span>
            </Link>
            <a
              href="#agents"
              className="px-6 py-4 rounded-xl font-medium text-sm text-[var(--text-secondary)] transition-all duration-300
                glass hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
            >
              Meet Your AI Team
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float">
          <div className="w-5 h-8 rounded-full border border-[var(--border-subtle)] flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-emerald-400/60 animate-pulse" />
          </div>
        </div>
      </section>

      {/* ─── Live Stats Ticker ─── */}
      <LiveStatsTicker />

      {/* ─── Pain Points Section ─── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3">
              The Problem
            </p>
            <h2 className="text-3xl font-bold text-[var(--text-primary)]">
              Why Smart Capital Is Underperforming
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="glass p-6 group hover:glow-red transition-all duration-500 animate-slide-in-bottom" style={{ opacity: 0, animationDelay: '100ms' }}>
              <div className="text-3xl mb-4">💸</div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">The 2/20 Extraction Machine</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Crypto hedge funds charge 2% management + 20% performance — win or lose. On a $1M position, that&apos;s $20,000/year before your capital even moves.
              </p>
              <div className="glass-surface p-3 mt-auto">
                <p className="text-xs font-mono text-emerald-400">
                  ZeltaFi: <span className="text-[var(--text-primary)]">$0.005 per profitable rebalance. Zero management fees. The AI proves net gain first.</span>
                </p>
              </div>
            </div>

            <div className="glass p-6 group hover:glow-amber transition-all duration-500 animate-slide-in-bottom" style={{ opacity: 0, animationDelay: '250ms' }}>
              <div className="text-3xl mb-4">🛡️</div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">Celsius. Luna. BlockFi. Never Again.</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Centralized platforms promised 8-12% yields, then froze withdrawals and collapsed. The yield was never real. The custody was never yours.
              </p>
              <div className="glass-surface p-3 mt-auto">
                <p className="text-xs font-mono text-amber-400">
                  ZeltaFi: <span className="text-[var(--text-primary)]">Self-custody via Circle Wallets. Withdraw in minutes. Zero lock-ups. Your keys, unconditionally.</span>
                </p>
              </div>
            </div>

            <div className="glass p-6 group hover:glow-violet transition-all duration-500 animate-slide-in-bottom" style={{ opacity: 0, animationDelay: '400ms' }}>
              <div className="text-3xl mb-4">😴</div>
              <h3 className="text-base font-semibold text-[var(--text-primary)] mb-2">You Shouldn&apos;t Babysit a $5M Position</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                Monitoring utilization rates at 3am. Chasing 1.5% APY deltas between L2s. Manually constructing leveraged positions. You have better things to do than be your own quant desk.
              </p>
              <div className="glass-surface p-3 mt-auto">
                <p className="text-xs font-mono text-violet-400">
                  ZeltaFi: <span className="text-[var(--text-primary)]">Declare your intent, walk away. 7 AI agents construct strategies 24/7 while you sleep.</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── AI Agent Team ─── */}
      <section id="agents" className="py-24 px-6 bg-mesh">
        <AgentTeamShowcase />
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="py-24 px-6">
        <HowItWorks />
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-16 px-6 bg-mesh">
        <ComparisonTable />
      </section>

      {/* ─── $ZELTA Token ─── */}
      <section id="zelta" className="py-24 px-6">
        <ZeltaTokenSection />
      </section>

      {/* ─── Trust Signals ─── */}
      <section className="py-16 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-6">Built With</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-[var(--text-secondary)]">
            {[
              { name: 'Circle', color: 'bg-blue-400' },
              { name: 'Arc L1', color: 'bg-cyan-400' },
              { name: 'Gemini AI', color: 'bg-violet-400' },
              { name: 'x402 Nanopayments', color: 'bg-emerald-400' },
              { name: 'USDC', color: 'bg-amber-400' },
            ].map(item => (
              <span key={item.name} className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/5 to-transparent" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
            Your Capital Deserves an AI Team That Only Earns When You Do.
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Double-digit stablecoin yields. Institutional self-custody. Mathematical net-gain proofs on every trade. This is autonomous wealth management.
          </p>
          <Link
            href="/onboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95 transition-all duration-300 group"
          >
            Launch App
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="py-8 px-6 border-t border-[var(--border-subtle)]">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-[var(--text-muted)]">
          <span>© 2026 ZeltaFi. AI-Powered Yield Orchestration.</span>
          <span className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Agents Active
          </span>
        </div>
      </footer>
    </div>
  );
}
