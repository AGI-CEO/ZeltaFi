'use client';

import { GlassCard } from '../ui/GlassCard';
import { StatusPulse } from '../ui/StatusPulse';

type Phase = 'scanning' | 'optimizing' | 'executing' | 'reflecting' | 'idle' | 'skipped';

interface AgentStatusCardProps {
  status: any;
  isRunning: boolean;
  onTriggerCycle: () => void;
  cycles?: any[];
}

const phaseConfig: Record<Phase, { color: 'emerald' | 'amber' | 'violet' | 'cyan' | 'gray'; label: string }> = {
  scanning: { color: 'cyan', label: 'SCANNING' },
  optimizing: { color: 'violet', label: 'OPTIMIZING' },
  executing: { color: 'amber', label: 'EXECUTING' },
  reflecting: { color: 'violet', label: 'REFLECTING' },
  idle: { color: 'gray', label: 'IDLE' },
  skipped: { color: 'amber', label: 'SKIPPED' },
};

export function AgentStatusCard({ status, isRunning, onTriggerCycle, cycles = [] }: AgentStatusCardProps) {
  const phase = (status?.phase || 'idle') as Phase;
  const config = phaseConfig[phase] || phaseConfig.idle;

  // Recent decisions from cycles
  const recentCycles = cycles.slice(-5).reverse();

  return (
    <GlassCard padding="md" className="space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Agent Intelligence
        </h2>
        <StatusPulse
          color={config.color}
          active={phase !== 'idle'}
          label={config.label}
          size="sm"
        />
      </div>

      {/* APY Comparison */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-surface p-3 text-center">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Current APY</div>
          <div className="text-lg font-bold font-mono text-[var(--text-primary)]">
            {((status?.currentApy ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
        <div className="glass-surface p-3 text-center">
          <div className="text-[10px] text-[var(--text-muted)] mb-1 uppercase tracking-wider">Best Available</div>
          <div className="text-lg font-bold font-mono text-emerald-400">
            {((status?.bestAvailableApy ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Reflexion Version */}
      <div className="glass-surface p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Reflexion</span>
          <span className="text-xs font-mono font-semibold text-violet-400">
            v{status?.promptVersion ?? 0}
          </span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] italic line-clamp-2 leading-relaxed">
          {status?.lastCritique ?? 'Awaiting first cycle for critique...'}
        </p>
      </div>

      {/* Decision History */}
      {recentCycles.length > 0 && (
        <div>
          <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">
            Recent Decisions
          </div>
          <div className="space-y-1.5">
            {recentCycles.map((cycle: any, i: number) => {
              const decision = cycle.optimizerDecision;
              const rebalanced = cycle.executionResult?.executed;
              const skipped = cycle.phase === 'skipped' || (decision && !decision.shouldRebalance);

              return (
                <div
                  key={cycle.id || i}
                  className={`glass-surface p-2 flex items-center gap-2 animate-fade-in`}
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className={`w-0.5 h-6 rounded-full ${
                    rebalanced ? 'bg-emerald-400' : 'bg-amber-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold ${
                        rebalanced ? 'text-emerald-400' : 'text-amber-400'
                      }`}>
                        {rebalanced ? '✅' : '⊘'}
                      </span>
                      <span className="text-[10px] text-[var(--text-secondary)] truncate">
                        {rebalanced
                          ? `Rebalanced → ${decision?.targetProtocol || '?'}`
                          : 'Skipped (net gain < fee)'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={onTriggerCycle}
        disabled={isRunning}
        className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          isRunning
            ? 'glass-surface text-[var(--text-muted)] cursor-not-allowed'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.01] active:scale-[0.98]'
        }`}
      >
        {isRunning ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-3 h-3 border-2 border-[var(--text-muted)] border-t-transparent rounded-full animate-spin" />
            Agent Running...
          </span>
        ) : (
          '▶ Run Cycle'
        )}
      </button>
    </GlassCard>
  );
}
