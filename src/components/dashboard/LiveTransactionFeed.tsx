'use client';

import { NanopaymentRecord } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { AnimatedCounter } from '../ui/AnimatedCounter';

interface LiveTransactionFeedProps {
  transactions: NanopaymentRecord[];
}

const purposeConfig: Record<string, { label: string; dotColor: string; textColor: string }> = {
  yield_query: { label: 'Yield Query', dotColor: 'bg-cyan-400', textColor: 'text-cyan-400' },
  rebalance_fee: { label: 'Rebalance Fee', dotColor: 'bg-amber-400', textColor: 'text-amber-400' },
};

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return '...';
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function LiveTransactionFeed({ transactions }: LiveTransactionFeedProps) {
  const totalUsdc = transactions.reduce((sum, tx) => sum + (tx.amountUsdc || 0), 0);

  return (
    <GlassCard padding="md" className="flex flex-col" style={{ maxHeight: '380px' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Live Nanopayments
        </h2>
        <span className="text-[10px] font-mono text-[var(--text-secondary)]">
          <AnimatedCounter value={totalUsdc} decimals={4} prefix="$" className="text-emerald-400" />
          {' '}· {transactions.length} txns
        </span>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin space-y-1">
        {transactions.slice(0, 50).map((tx, i) => {
          const config = purposeConfig[tx.purpose] || purposeConfig.yield_query;

          return (
            <div
              key={tx.id}
              className="flex items-center justify-between py-2 px-2.5 rounded-lg glass-surface animate-slide-in-top group"
              style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} />
                <div className="min-w-0">
                  <span className={`text-[11px] font-medium ${config.textColor}`}>
                    {config.label}
                  </span>
                  <div className="text-[10px] text-[var(--text-dim)] font-mono truncate">
                    {tx.arcTxHash
                      ? (
                        <a
                          href={`https://explorer.arc-testnet.circle.com/tx/${tx.arcTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-[var(--text-secondary)] transition-colors"
                        >
                          {tx.arcTxHash.slice(0, 8)}...{tx.arcTxHash.slice(-4)}
                        </a>
                      )
                      : 'pending...'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 ml-2">
                <div className="text-[11px] font-mono font-semibold text-emerald-400">
                  ${(tx.amountUsdc || 0).toFixed(4)}
                </div>
                <div className="text-[10px] text-[var(--text-dim)]">
                  {timeAgo(tx.settledAt)}
                </div>
              </div>
            </div>
          );
        })}

        {transactions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="text-2xl mb-2">📡</div>
            <p className="text-xs text-[var(--text-muted)]">
              No transactions yet. Run a cycle to start.
            </p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
