'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { getSimulatedMetrics, STAKER_SHARE_PERCENT, TREASURY_SHARE_PERCENT, FEE_DISCOUNT_TIERS } from '../../lib/tokenomics';

export function TokenomicsPanel() {
  const [metrics, setMetrics] = useState<ReturnType<typeof getSimulatedMetrics> | null>(null);

  useEffect(() => {
    setMetrics(getSimulatedMetrics());
    const interval = setInterval(() => setMetrics(getSimulatedMetrics()), 5000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) {
    return (
      <GlassCard padding="md" className="border-violet-500/10">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-5 rounded-full bg-violet-400" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            $ZELTA Economics
          </h2>
        </div>
        <div className="text-xs text-[var(--text-muted)] text-center py-6">Loading metrics...</div>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="md" className="border-violet-500/10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-5 rounded-full bg-violet-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          $ZELTA Economics
        </h2>
      </div>

      {/* Price + Market Cap */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-surface p-3 text-center">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">$ZELTA Price</div>
          <AnimatedCounter
            value={metrics.price}
            prefix="$"
            decimals={4}
            className="text-xl font-bold text-violet-400"
          />
        </div>
        <div className="glass-surface p-3 text-center">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Total Alpha</div>
          <AnimatedCounter
            value={metrics.totalAlphaGenerated}
            prefix="$"
            decimals={0}
            className="text-xl font-bold text-emerald-400"
          />
        </div>
      </div>

      {/* TVL + Blended APY */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass-surface p-3 text-center">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">TVL</div>
          <div className="text-sm font-bold font-mono text-[var(--text-primary)]">
            ${(Number(metrics.totalValueLocked) / 1_000_000).toFixed(2)}M
          </div>
        </div>
        <div className="glass-surface p-3 text-center">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Blended APY</div>
          <div className="text-sm font-bold font-mono text-emerald-400">
            {metrics.avgBlendedApy}%
          </div>
        </div>
      </div>

      {/* Alpha distribution */}
      <div className="glass-surface p-3 mb-3">
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Alpha Distribution</div>
        <div className="flex items-center gap-1 h-2 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${STAKER_SHARE_PERCENT}%` }} />
          <div className="h-full bg-amber-500" style={{ width: `${TREASURY_SHARE_PERCENT}%` }} />
          <div className="h-full bg-violet-500 rounded-r-full" style={{ width: '10%' }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-[9px]">
          <span className="text-emerald-400">{STAKER_SHARE_PERCENT}% Stakers</span>
          <span className="text-amber-400">{TREASURY_SHARE_PERCENT}% Buyback</span>
          <span className="text-violet-400">10% AI Fund</span>
        </div>
      </div>

      {/* Fee tiers preview */}
      <div className="glass-surface p-3">
        <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Fee Discount Tiers</div>
        <div className="space-y-1">
          {FEE_DISCOUNT_TIERS.slice(1).map(tier => (
            <div key={tier.label} className="flex items-center justify-between text-[10px]">
              <span className="text-[var(--text-secondary)]">{tier.label}</span>
              <span className="font-mono text-[var(--text-muted)]">{tier.minZelta.toLocaleString()}+ $ZELTA</span>
              <span className="font-semibold text-emerald-400">-{(tier.discount * 100).toFixed(0)}% fees</span>
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}
