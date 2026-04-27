'use client';

import { GlassCard } from '../ui/GlassCard';
import { ProtocolYield } from '../../types';

interface YieldMetricsPanelProps {
  scanResults?: ProtocolYield[];
  currentProtocol?: string;
}

const protocolConfig: Record<string, { icon: string; color: string; borderColor: string }> = {
  aave: { icon: '🟦', color: 'text-blue-400', borderColor: 'border-blue-500/20' },
  morpho: { icon: '🔷', color: 'text-cyan-400', borderColor: 'border-cyan-500/20' },
  moonwell: { icon: '🟣', color: 'text-violet-400', borderColor: 'border-violet-500/20' },
};

export function YieldMetricsPanel({ scanResults = [], currentProtocol = 'idle' }: YieldMetricsPanelProps) {
  // Find best APY
  const bestApy = scanResults.length > 0
    ? Math.max(...scanResults.map(r => r.supplyApyBps))
    : 0;

  return (
    <GlassCard padding="md">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Yield Market
        </h2>
        {scanResults.length > 0 && (
          <span className="text-[10px] text-[var(--text-muted)] font-mono">
            Last scan: {new Date(scanResults[0]?.queriedAt || '').toLocaleTimeString()}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(['aave', 'morpho', 'moonwell'] as const).map(protocol => {
          const result = scanResults.find(r => r.protocol === protocol);
          const config = protocolConfig[protocol];
          const apyBps = result?.supplyApyBps ?? 0;
          const apyPct = (apyBps / 100).toFixed(2);
          const isBest = apyBps === bestApy && apyBps > 0;
          const isCurrent = currentProtocol === protocol;

          return (
            <div
              key={protocol}
              className={`glass-surface p-4 relative overflow-hidden transition-all duration-300 ${
                isBest ? 'glow-emerald' : ''
              } ${config.borderColor}`}
              style={{ borderLeftWidth: isCurrent ? '2px' : undefined }}
            >
              {/* Best badge */}
              {isBest && (
                <div className="absolute top-2 right-2">
                  <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Best
                  </span>
                </div>
              )}

              {/* Protocol info */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{config.icon}</span>
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)] capitalize">
                    {protocol}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)]">
                    {isCurrent ? '● Currently allocated' : 'Available'}
                  </div>
                </div>
              </div>

              {/* APY */}
              <div className="mb-3">
                <div className={`text-2xl font-bold font-mono ${isBest ? 'text-emerald-400' : config.color}`}>
                  {apyPct}%
                </div>
                <div className="text-[10px] text-[var(--text-muted)]">Supply APY</div>
              </div>

              {/* TVL bar */}
              {result && result.tvlUsd > 0 && (
                <div className="mb-2">
                  <div className="flex justify-between text-[10px] text-[var(--text-muted)] mb-1">
                    <span>TVL</span>
                    <span className="font-mono">${(result.tvlUsd / 1e6).toFixed(1)}M</span>
                  </div>
                </div>
              )}

              {/* Query cost badge */}
              <div className="flex items-center gap-1 mt-auto">
                <span className="text-[9px] font-mono text-emerald-400/60 glass-surface px-1.5 py-0.5 rounded">
                  x402: ${result?.queryCostUsdc?.toFixed(3) || '0.001'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {scanResults.length === 0 && (
        <div className="text-center py-6">
          <p className="text-xs text-[var(--text-muted)]">
            Run a cycle to fetch live yield data from protocols
          </p>
        </div>
      )}
    </GlassCard>
  );
}
