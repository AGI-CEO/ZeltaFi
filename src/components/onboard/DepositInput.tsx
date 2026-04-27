'use client';

import { GlassCard } from '../ui/GlassCard';

interface DepositInputProps {
  value: number;
  onChange: (value: number) => void;
}

const presetAmounts = [100, 500, 1000, 5000];

export function DepositInput({ value, onChange }: DepositInputProps) {
  // Estimation based on ~11.5% avg blended APY (balanced strategy)
  const estimatedYearly = (value * 0.115).toFixed(2);
  const estimatedMonthly = ((value * 0.115) / 12).toFixed(2);

  return (
    <GlassCard>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Initial Deposit Amount (USDC)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-mono text-[var(--text-muted)]">
              $
            </span>
            <input
              type="number"
              value={value || ''}
              onChange={(e) => onChange(Number(e.target.value))}
              min={100}
              step={100}
              className="w-full bg-[var(--bg-void)] border border-[var(--border-base)] rounded-xl py-4 pl-10 pr-4 text-2xl font-mono text-emerald-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              placeholder="1000"
            />
          </div>
        </div>

        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Quick Select
          </div>
          <div className="flex flex-wrap gap-2">
            {presetAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => onChange(amount)}
                className={`px-4 py-2 rounded-lg text-sm font-mono transition-all ${
                  value === amount
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'glass-surface text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]'
                }`}
              >
                ${amount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {value > 0 && (
          <div className="pt-4 border-t border-[var(--border-base)]">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[var(--text-muted)]">Estimated Yield (11.5% Blended APY)</span>
              <div className="text-right">
                <div className="font-mono text-emerald-400">+${estimatedYearly} / yr</div>
                <div className="font-mono text-[10px] text-[var(--text-dim)]">+${estimatedMonthly} / mo</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
