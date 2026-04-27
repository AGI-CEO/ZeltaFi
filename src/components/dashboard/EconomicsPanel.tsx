'use client';

import { GlassCard } from '../ui/GlassCard';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface EconomicsPanelProps {
  totalTransactions: number;
  totalUsdcSpent: number;
}

export function EconomicsPanel({ totalTransactions, totalUsdcSpent }: EconomicsPanelProps) {
  // Estimated ETH gas cost for equivalent operations
  // Conservative estimate: $8 avg per on-chain transaction on ETH mainnet
  const avgEthGas = 8;
  const ethCost = totalTransactions * avgEthGas;
  const savings = ethCost - totalUsdcSpent;
  const reductionFactor = totalUsdcSpent > 0 ? Math.round(ethCost / totalUsdcSpent) : 0;

  return (
    <GlassCard padding="md">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full bg-emerald-400" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Why This Can&apos;t Exist On Ethereum
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* ETH Column */}
        <div className="glass-surface p-4 border-l-2 border-red-500/30">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            ETH Mainnet
          </div>
          <div className="text-xs text-[var(--text-muted)] mb-1">
            {totalTransactions} txns × ~${avgEthGas} gas
          </div>
          <AnimatedCounter
            value={ethCost}
            decimals={2}
            prefix="$"
            className="text-2xl font-bold text-red-400"
          />
          <div className="text-[10px] text-red-400/60 mt-1">
            Would destroy all yield gains
          </div>
        </div>

        {/* Arc Column */}
        <div className="glass-surface p-4 border-l-2 border-emerald-500/30">
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Arc + Nanopayments
          </div>
          <div className="text-xs text-[var(--text-muted)] mb-1">
            {totalTransactions} txns × ~${(totalUsdcSpent / Math.max(totalTransactions, 1)).toFixed(4)} avg
          </div>
          <AnimatedCounter
            value={totalUsdcSpent}
            decimals={4}
            prefix="$"
            className="text-2xl font-bold text-emerald-400"
          />
          <div className="text-[10px] text-emerald-400/60 mt-1">
            Gas-free, USDC-denominated
          </div>
        </div>
      </div>

      {/* Savings summary */}
      {totalTransactions > 0 && (
        <div className="glass-surface p-4 text-center border border-emerald-500/10">
          <div className="text-xs text-[var(--text-muted)] mb-1">Total Gas Savings</div>
          <AnimatedCounter
            value={savings}
            decimals={2}
            prefix="$"
            className="text-3xl font-bold text-emerald-400"
          />
          {reductionFactor > 0 && (
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              <span className="text-emerald-400 font-semibold">{reductionFactor.toLocaleString()}x</span> cost reduction
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
}
