'use client';

import { useState, useEffect } from 'react';
import { AGENT_PROFILES, AgentId } from '../../types';
import { GlassCard } from '../ui/GlassCard';

const agentOrder: AgentId[] = [
  'market_sentinel', 'risk_analyst', 'strategy_architect',
  'compliance_guardian', 'executor', 'performance_analyst', 'meta_strategist',
];

const quotes: Record<AgentId, string> = {
  market_sentinel: "I'll scan yield markets 24/7 and catch opportunities humans miss.",
  risk_analyst: "I'll evaluate every protocol's safety before your capital goes in.",
  strategy_architect: "I'll design multi-position strategies tailored to your risk profile.",
  compliance_guardian: "I'll block any trade that doesn't mathematically improve your returns.",
  executor: "I'll execute gas-free on Arc with sub-cent x402 nanopayments.",
  performance_analyst: "I'll track exactly where your alpha comes from, every cycle.",
  meta_strategist: "I'll make the entire team smarter by learning from every decision.",
};

export function AgentTeamReveal() {
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount < agentOrder.length) {
      const timer = setTimeout(() => setRevealedCount(prev => prev + 1), 500);
      return () => clearTimeout(timer);
    }
  }, [revealedCount]);

  const allRevealed = revealedCount >= agentOrder.length;

  return (
    <div className="space-y-6">
      <div className="text-center mb-2">
        <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">
          {allRevealed ? 'Your team is ready' : `Assembling agent ${revealedCount + 1} of ${agentOrder.length}...`}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {agentOrder.map((id, i) => {
          const agent = AGENT_PROFILES[id];
          const isRevealed = i < revealedCount;

          return (
            <div
              key={id}
              className={`transition-all duration-700 ${
                isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <GlassCard
                padding="md"
                className={`h-full ${isRevealed ? 'border-emerald-500/20' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ backgroundColor: `${agent.color}15`, border: `1px solid ${agent.color}30` }}
                  >
                    {agent.icon}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">{agent.name}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] italic leading-relaxed mt-1">
                      &ldquo;{quotes[id]}&rdquo;
                    </p>
                  </div>
                </div>
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Connection visualization */}
      {allRevealed && (
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-surface">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-emerald-400">All 7 agents connected and ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
