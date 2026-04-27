'use client';

import { useState, useEffect } from 'react';
import { AGENT_PROFILES, AgentId } from '../../types';
import { GlassCard } from '../ui/GlassCard';

const agentOrder: AgentId[] = [
  'market_sentinel', 'risk_analyst', 'strategy_architect',
  'compliance_guardian', 'executor', 'performance_analyst', 'meta_strategist',
];

// Live reasoning showing strategy CONSTRUCTION, not just scanning
const liveThoughts: Record<AgentId, string[]> = {
  market_sentinel: [
    'Aave V3: 7.8% supply / 4.2% borrow — 3.6% spread detected',
    'Morpho Blue curated vault: 11.2% — elevated peer-to-peer demand',
    'Euler V2 USDC vault launched — 15% incentive APY (48h window)',
  ],
  risk_analyst: [
    'Aave: 92/100 — 1,247 days since last incident. Safe for leverage.',
    'Morpho loop: Max 2.8x leverage before liquidation threshold',
    'Euler incentive: Contract verified, TVL $84M — acceptable risk',
  ],
  strategy_architect: [
    'Constructing: Aave recursive lending loop → 12.4% effective APY',
    'Alternative: 60% Morpho vault + 40% Euler incentive → 13.1%',
    'Risk-adjusted optimal: Blended strategy at 12.8% with 2.3x leverage',
  ],
  compliance_guardian: [
    'Net-gain proof: $0.0147 gain > $0.005 fee — APPROVED',
    'Leverage ratio 2.3x within conservative bounds (max 3.0x)',
    'Liquidation buffer: 34% — safe for 30-min cycle interval',
  ],
  executor: [
    'Executing 3-step recursive loop via Circle Wallet on Arc',
    'x402 nanopayment: $0.005 rebalance fee — settled on-chain',
    'Position live: 2.3x leveraged Aave/Morpho loop confirmed',
  ],
  performance_analyst: [
    'Realized: 12.4% effective vs 7.8% passive = +4.6% alpha',
    'Leveraged loop contributed 68% of total alpha generation',
    'Fee efficiency ratio: 0.034 — exceptional cost-to-alpha',
  ],
  meta_strategist: [
    'Analyzing 142 past cycles: leverage sweet spot is 2.2-2.5x',
    'Recursive loop entry timing improved 18% since prompt v8',
    'New pattern: Incentive programs decay predictably after 72h',
  ],
};

export function AgentTeamShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [thoughtIdx, setThoughtIdx] = useState(0);

  useEffect(() => {
    const agentInterval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % agentOrder.length);
      setThoughtIdx(0);
    }, 4000);
    return () => clearInterval(agentInterval);
  }, []);

  useEffect(() => {
    const thoughtInterval = setInterval(() => {
      setThoughtIdx(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(thoughtInterval);
  }, [activeIdx]);

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3">
          Your AI Agent Team
        </p>
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-3">
          7 Agents That Construct Strategies, Not Just Compare Numbers.
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-2xl mx-auto">
          A self-improving AI team that designs leveraged loops, times incentive windows, and manages risk across protocols — then proves every trade is net-positive before execution.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {agentOrder.map((id, i) => {
          const agent = AGENT_PROFILES[id];
          const isActive = i === activeIdx;
          const thoughts = liveThoughts[id];

          return (
            <div
              key={id}
              className={`relative transition-all duration-500 ${isActive ? 'scale-[1.02] z-10' : 'opacity-70'}`}
            >
              <GlassCard
                padding="sm"
                className={`h-full text-center transition-all duration-500 ${
                  isActive ? 'border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : ''
                }`}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400" />
                )}

                {/* Icon */}
                <div className="text-2xl mb-2">{agent.icon}</div>

                {/* Name */}
                <h3 className="text-[11px] font-semibold text-[var(--text-primary)] mb-1 leading-tight">
                  {agent.name}
                </h3>

                {/* Live thought bubble */}
                {isActive && (
                  <div className="mt-2 p-2 rounded-lg bg-[var(--bg-surface)] border border-emerald-500/10 animate-fade-in">
                    <p className="text-[9px] font-mono text-emerald-400 leading-relaxed line-clamp-2" style={{ color: agent.color }}>
                      {thoughts[thoughtIdx]}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[8px] text-[var(--text-muted)]">reasoning...</span>
                    </div>
                  </div>
                )}

                {!isActive && (
                  <p className="text-[9px] text-[var(--text-muted)] leading-relaxed mt-1 line-clamp-2">
                    {agent.role.slice(0, 60)}...
                  </p>
                )}
              </GlassCard>
            </div>
          );
        })}
      </div>

      {/* Connection visualization */}
      <div className="mt-6 flex items-center justify-center gap-1">
        {agentOrder.map((_, i) => (
          <div key={i} className="flex items-center">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === activeIdx ? 'bg-emerald-400 scale-125' : 'bg-[var(--border-subtle)]'
            }`} />
            {i < agentOrder.length - 1 && (
              <div className={`w-8 h-px transition-all duration-300 ${
                i === activeIdx ? 'bg-gradient-to-r from-emerald-400 to-transparent' :
                i === activeIdx - 1 ? 'bg-gradient-to-r from-transparent to-emerald-400' :
                'bg-[var(--border-subtle)]'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
