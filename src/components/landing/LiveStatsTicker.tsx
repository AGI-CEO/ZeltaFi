'use client';

import { useEffect, useState } from 'react';

const stats = [
  { label: 'Total AUM', prefix: '$', value: 12450000, suffix: '', decimals: 0 },
  { label: 'Avg Blended APY', prefix: '', value: 11.8, suffix: '%', decimals: 1 },
  { label: 'Total Alpha Generated', prefix: '$', value: 487200, suffix: '', decimals: 0 },
  { label: 'Management Fee Savings vs 2/20', prefix: '$', value: 249000, suffix: '', decimals: 0 },
  { label: 'Agent Cycles Executed', prefix: '', value: 38291, suffix: '', decimals: 0 },
  { label: 'Net-Gain Proofs Verified', prefix: '', value: 12847, suffix: '', decimals: 0 },
];

export function LiveStatsTicker() {
  const [offset, setOffset] = useState(0);
  const [values, setValues] = useState(stats.map(s => s.value));

  useEffect(() => {
    const interval = setInterval(() => {
      setOffset(prev => prev - 0.5);
      setValues(prev => prev.map((v, i) => {
        const jitter = stats[i].decimals > 0 ? (Math.random() - 0.45) * 0.02 : Math.round((Math.random() - 0.3) * 3);
        return +(v + jitter).toFixed(stats[i].decimals);
      }));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const items = [...stats, ...stats, ...stats]; // Triple for seamless loop

  return (
    <div className="w-full overflow-hidden border-y border-[var(--border-subtle)] bg-[var(--bg-surface)]">
      <div
        className="flex items-center gap-12 py-3 whitespace-nowrap"
        style={{ transform: `translateX(${offset % (stats.length * 280)}px)` }}
      >
        {items.map((stat, i) => {
          const idx = i % stats.length;
          return (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
                {stat.label}
              </span>
              <span className="text-sm font-bold font-mono text-emerald-400">
                {stat.prefix}{values[idx]?.toLocaleString(undefined, { minimumFractionDigits: stat.decimals, maximumFractionDigits: stat.decimals })}{stat.suffix}
              </span>
              <span className="text-[var(--text-dim)]">·</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
