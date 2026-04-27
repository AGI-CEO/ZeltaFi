'use client';

import { GlassCard } from '../ui/GlassCard';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { StatusPulse } from '../ui/StatusPulse';

interface PortfolioSummaryProps {
  balance: number;
  currentApy: number;
  currentProtocol: string;
  yieldEarned: number;
  isAgentActive: boolean;
}

const protocolColors: Record<string, string> = {
  aave: 'bg-blue-400',
  morpho: 'bg-cyan-400',
  moonwell: 'bg-purple-400',
  idle: 'bg-gray-500',
};

export function PortfolioSummary({
  balance,
  currentApy,
  currentProtocol,
  yieldEarned,
  isAgentActive,
}: PortfolioSummaryProps) {
  return (
    <GlassCard padding="md" className="space-y-5">
      {/* Section Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Portfolio
        </h2>
        <StatusPulse
          color={isAgentActive ? 'emerald' : 'gray'}
          active={isAgentActive}
          label={isAgentActive ? 'Active' : 'Idle'}
          size="sm"
        />
      </div>

      {/* Balance */}
      <div>
        <div className="text-xs text-[var(--text-muted)] mb-1">Balance</div>
        <AnimatedCounter
          value={balance}
          decimals={2}
          prefix="$"
          suffix=" USDC"
          className="text-2xl font-bold text-[var(--text-primary)]"
        />
      </div>

      {/* APY */}
      <div className="glass-surface p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-[var(--text-muted)]">Current APY</span>
          <span className="text-xs text-emerald-400">↑</span>
        </div>
        <AnimatedCounter
          value={currentApy / 100}
          decimals={2}
          suffix="%"
          className="text-xl font-bold text-emerald-400"
        />
      </div>

      {/* Protocol Badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">Allocated to</span>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full glass-surface text-xs font-medium text-[var(--text-secondary)]">
          <span className={`w-1.5 h-1.5 rounded-full ${protocolColors[currentProtocol] || 'bg-gray-500'}`} />
          {currentProtocol === 'idle' ? 'Unallocated' : currentProtocol.charAt(0).toUpperCase() + currentProtocol.slice(1)}
        </span>
      </div>

      {/* Yield Earned */}
      <div className="border-t border-[var(--border-subtle)] pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-muted)]">Yield Earned</span>
          <AnimatedCounter
            value={yieldEarned}
            decimals={4}
            prefix="+$"
            suffix=" USDC"
            className="text-sm font-semibold text-emerald-400"
          />
        </div>
      </div>
    </GlassCard>
  );
}
