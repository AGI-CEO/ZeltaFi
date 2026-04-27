'use client';

import { GlassCard } from '../ui/GlassCard';

const steps = [
  {
    number: '01',
    icon: '🎯',
    title: 'Declare Your Intent',
    description: 'Set your risk tolerance and yield goals. Conservative, balanced, or aggressive. Your AI team adapts to your mandate.',
    accent: 'emerald' as const,
  },
  {
    number: '02',
    icon: '🧠',
    title: 'AI Constructs Strategies',
    description: '7 agents design multi-step yield strategies — leveraged loops, cross-protocol optimization, incentive timing. Not arithmetic. Reasoning.',
    accent: 'cyan' as const,
  },
  {
    number: '03',
    icon: '🔒',
    title: 'Net-Gain Proof',
    description: 'Every rebalance requires mathematical proof that your yield improves beyond the $0.005 fee. No proof, no trade. Zero churn.',
    accent: 'amber' as const,
  },
  {
    number: '04',
    icon: '📈',
    title: 'You Compound',
    description: 'Autonomous 10-14% target APY. Self-custody. The Reflexion agent improves strategy quality every cycle. Set it and forget it.',
    accent: 'violet' as const,
  },
];

const accentStyles = {
  emerald: 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.08)]',
  cyan: 'border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.08)]',
  amber: 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.08)]',
  violet: 'border-violet-500/30 shadow-[0_0_20px_rgba(139,92,246,0.08)]',
};

const accentDotColor = {
  emerald: 'bg-emerald-400',
  cyan: 'bg-cyan-400',
  amber: 'bg-amber-400',
  violet: 'bg-violet-400',
};

const numberColor = {
  emerald: 'text-emerald-400/20',
  cyan: 'text-cyan-400/20',
  amber: 'text-amber-400/20',
  violet: 'text-violet-400/20',
};

export function HowItWorks() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          How It Works
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          From intent to autonomous yield orchestration in four steps
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className="animate-slide-in-bottom"
            style={{ animationDelay: `${i * 150}ms`, opacity: 0 }}
          >
            <GlassCard
              className={`h-full relative overflow-hidden ${accentStyles[step.accent]}`}
              hover
              padding="md"
            >
              {/* Step number watermark */}
              <span
                className={`absolute -top-2 -right-1 text-6xl font-black ${numberColor[step.accent]} select-none pointer-events-none`}
              >
                {step.number}
              </span>

              {/* Connector dot */}
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <div className={`w-2 h-2 rounded-full ${accentDotColor[step.accent]}`} />
                {i < steps.length - 1 && (
                  <div className="flex-1 h-px bg-[var(--border-subtle)] hidden lg:block" />
                )}
              </div>

              {/* Icon */}
              <div className="text-2xl mb-3">{step.icon}</div>

              {/* Content */}
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                {step.title}
              </h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {step.description}
              </p>
            </GlassCard>
          </div>
        ))}
      </div>
    </div>
  );
}
