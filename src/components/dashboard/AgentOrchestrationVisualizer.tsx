'use client';

import { GlassCard } from '../ui/GlassCard';
import { AGENT_PROFILES, AgentId, AgentPhase } from '../../types';

const agentOrder: AgentId[] = [
  'market_sentinel', 'risk_analyst', 'strategy_architect',
  'compliance_guardian', 'executor', 'performance_analyst', 'meta_strategist',
];

const phaseToActiveAgents: Record<string, AgentId[]> = {
  market_sentinel: ['market_sentinel'],
  risk_analyst: ['risk_analyst'],
  strategy_architect: ['strategy_architect'],
  compliance_check: ['compliance_guardian'],
  executing: ['executor'],
  performance_analysis: ['performance_analyst'],
  meta_strategist: ['meta_strategist'],
  scanning: ['market_sentinel'],
  optimizing: ['strategy_architect'],
  reflecting: ['meta_strategist'],
  idle: [],
  skipped: ['compliance_guardian'],
};

interface AgentOrchestrationVisualizerProps {
  currentPhase?: AgentPhase | string;
  reasoning?: string;
}

export function AgentOrchestrationVisualizer({ currentPhase = 'idle', reasoning }: AgentOrchestrationVisualizerProps) {
  const activeAgents = phaseToActiveAgents[currentPhase] || [];
  const isActive = currentPhase !== 'idle';

  return (
    <GlassCard padding="md" className="relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Agent Orchestration Pipeline
          </h2>
        </div>
        <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full ${
          isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[var(--bg-surface)] text-[var(--text-dim)]'
        }`}>
          {isActive ? 'LIVE' : 'STANDBY'}
        </span>
      </div>

      {/* Pipeline visualization */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {agentOrder.map((id, i) => {
          const agent = AGENT_PROFILES[id];
          const isAgentActive = activeAgents.includes(id);
          const isPast = agentOrder.findIndex(a => activeAgents.includes(a)) > i;

          return (
            <div key={id} className="flex items-center shrink-0">
              <div
                className={`relative p-2.5 rounded-xl transition-all duration-500 ${
                  isAgentActive
                    ? 'glass-strong scale-105 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : isPast
                    ? 'glass opacity-80'
                    : 'glass-surface opacity-50'
                }`}
                style={isAgentActive ? { borderColor: `${agent.color}40` } : {}}
              >
                {/* Active indicator */}
                {isAgentActive && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full" style={{ backgroundColor: agent.color }} />
                )}

                <div className="text-center min-w-[60px]">
                  <div className="text-lg mb-1">{agent.icon}</div>
                  <div className={`text-[9px] font-semibold leading-tight ${
                    isAgentActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                  }`}>
                    {agent.name.split(' ')[0]}
                  </div>

                  {/* Active thinking indicator */}
                  {isAgentActive && (
                    <div className="mt-1.5 flex items-center justify-center gap-0.5">
                      {[0, 1, 2].map(j => (
                        <div
                          key={j}
                          className="w-1 h-1 rounded-full animate-pulse"
                          style={{
                            backgroundColor: agent.color,
                            animationDelay: `${j * 200}ms`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Completed checkmark */}
                  {isPast && !isAgentActive && (
                    <div className="mt-1 text-[9px] text-emerald-400">✓</div>
                  )}
                </div>
              </div>

              {/* Connection arrow */}
              {i < agentOrder.length - 1 && (
                <div className={`w-4 h-px mx-0.5 transition-colors ${
                  isPast ? 'bg-emerald-400' :
                  isAgentActive ? 'bg-gradient-to-r from-emerald-400 to-transparent' :
                  'bg-[var(--border-subtle)]'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Current reasoning */}
      {reasoning && (
        <div className="mt-3 glass-surface p-3 rounded-lg animate-slide-in-top">
          <p className="text-xs text-[var(--text-secondary)] italic">{reasoning}</p>
        </div>
      )}
    </GlassCard>
  );
}
