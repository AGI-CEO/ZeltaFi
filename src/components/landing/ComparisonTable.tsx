'use client';

import { GlassCard } from '../ui/GlassCard';

const columns = ['', 'Crypto Hedge Fund', 'Self-Managed (Aave)', 'STRC (MicroStrategy)', 'ZeltaFi'];

const rows = [
  {
    label: 'Target Yield',
    values: ['8-15%', '6-8%', '11.5%', '10-14%'],
    highlight: 3,
  },
  {
    label: 'Management Fee',
    values: ['2% annual', '$0', 'N/A (equity)', '$0'],
    highlight: 3,
  },
  {
    label: 'Performance Fee',
    values: ['20%', '$0', 'N/A', '$0.005/trade'],
    highlight: 3,
  },
  {
    label: 'Custody',
    values: ['Theirs', 'Yours', 'Brokerage', 'Yours'],
    highlight: 3,
  },
  {
    label: 'Counterparty Risk',
    values: ['Fund manager', 'Protocol only', 'MicroStrategy', 'None (self-custody)'],
    highlight: 3,
  },
  {
    label: 'Transparency',
    values: ['Quarterly reports', 'On-chain', 'SEC filings', 'Real-time AI reasoning'],
    highlight: 3,
  },
  {
    label: 'Active Management',
    values: ['Fund manages', 'You manage', 'Buy & hold', 'AI manages, you oversee'],
    highlight: 3,
  },
  {
    label: 'Strategy Sophistication',
    values: ['Varies', 'Single protocol', 'BTC exposure', 'Multi-step, self-improving'],
    highlight: 3,
  },
];

export function ComparisonTable() {
  return (
    <GlassCard className="w-full max-w-5xl mx-auto overflow-hidden" padding="lg">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-5 rounded-full bg-amber-400" />
        <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
          How Does ZeltaFi Compare?
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[var(--text-muted)] text-xs uppercase tracking-wider">
              <th className="text-left pb-3 font-medium min-w-[140px]"></th>
              <th className="text-center pb-3 font-medium min-w-[120px]">
                <span className="text-red-400/80">Hedge Fund</span>
              </th>
              <th className="text-center pb-3 font-medium min-w-[120px]">
                <span className="text-[var(--text-muted)]">Self-Managed</span>
              </th>
              <th className="text-center pb-3 font-medium min-w-[120px]">
                <span className="text-amber-400/80">STRC</span>
              </th>
              <th className="text-center pb-3 font-medium min-w-[120px]">
                <span className="text-emerald-400">ZeltaFi</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={i}
                className="border-t border-[var(--border-subtle)] animate-fade-in"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <td className="py-3 text-[var(--text-secondary)] font-medium text-xs">
                  {row.label}
                </td>
                {row.values.map((val, j) => (
                  <td key={j} className="py-3 text-center">
                    <span className={`font-mono text-xs ${
                      j === row.highlight
                        ? 'text-emerald-400 font-semibold'
                        : j === 0
                        ? 'text-red-400/70'
                        : 'text-[var(--text-muted)]'
                    }`}>
                      {val}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-center">
        <p className="text-xs text-[var(--text-muted)]">
          STRC-level returns with <span className="text-emerald-400 font-semibold">self-custody</span>,{' '}
          <span className="text-emerald-400 font-semibold">zero management fees</span>, and{' '}
          <span className="text-emerald-400 font-semibold">mathematical proof of every trade</span>.
        </p>
      </div>
    </GlassCard>
  );
}
