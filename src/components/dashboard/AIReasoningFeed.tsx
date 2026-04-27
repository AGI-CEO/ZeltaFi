'use client';

import { useEffect, useRef, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { ReasoningEntry } from '../../types';

// Generate mock data lazily (must not be called at module scope to avoid SSR mismatch)
function createMockReasoningFeed(): ReasoningEntry[] {
  const now = Date.now();
  return [
    { timestamp: new Date(now - 30000).toISOString(), agentId: 'market_sentinel', agentName: 'Market Sentinel', agentIcon: '🔍', color: '#06b6d4', message: 'Scanning Aave V3, Morpho Blue, and Moonwell yield pools...', type: 'action' },
    { timestamp: new Date(now - 27000).toISOString(), agentId: 'market_sentinel', agentName: 'Market Sentinel', agentIcon: '🔍', color: '#06b6d4', message: 'Aave USDC: 8.92% APY | Morpho: 10.31% APY | Moonwell: 7.45% APY', type: 'thinking' },
    { timestamp: new Date(now - 25000).toISOString(), agentId: 'market_sentinel', agentName: 'Market Sentinel', agentIcon: '🔍', color: '#06b6d4', message: '🟢 2.86% yield spread detected between Morpho and Moonwell — rebalancing opportunity', type: 'decision' },
    { timestamp: new Date(now - 22000).toISOString(), agentId: 'risk_analyst', agentName: 'Risk Analyst', agentIcon: '📊', color: '#f59e0b', message: 'Evaluating protocol safety scores...', type: 'thinking' },
    { timestamp: new Date(now - 20000).toISOString(), agentId: 'risk_analyst', agentName: 'Risk Analyst', agentIcon: '📊', color: '#f59e0b', message: '🟢 Aave: 92/100 | 🟡 Morpho: 78/100 | 🟡 Moonwell: 70/100', type: 'decision' },
    { timestamp: new Date(now - 18000).toISOString(), agentId: 'risk_analyst', agentName: 'Risk Analyst', agentIcon: '📊', color: '#f59e0b', message: 'Morpho TVL stable at $180M. No elevated risk signals detected.', type: 'decision' },
    { timestamp: new Date(now - 15000).toISOString(), agentId: 'strategy_architect', agentName: 'Strategy Architect', agentIcon: '🧠', color: '#8b5cf6', message: 'Designing Balanced Diversified strategy for $1,000 deposit...', type: 'thinking' },
    { timestamp: new Date(now - 12000).toISOString(), agentId: 'strategy_architect', agentName: 'Strategy Architect', agentIcon: '🧠', color: '#8b5cf6', message: 'Strategy: 60% Aave (8.92%) + 40% Morpho (10.31%) = 9.48% blended APY', type: 'decision' },
    { timestamp: new Date(now - 10000).toISOString(), agentId: 'compliance_guardian', agentName: 'Compliance Guardian', agentIcon: '🛡️', color: '#10b981', message: '✅ Net gain $0.0082 > $0.005 fee — strategy approved', type: 'action' },
    { timestamp: new Date(now - 8000).toISOString(), agentId: 'executor', agentName: 'Execution Planner', agentIcon: '⚡', color: '#f97316', message: 'Executing via Circle Wallets — gas-free settlement on Arc', type: 'action' },
    { timestamp: new Date(now - 5000).toISOString(), agentId: 'performance_analyst', agentName: 'Performance Analyst', agentIcon: '📈', color: '#3b82f6', message: 'Alpha vs benchmark: +3.48% (9.48% realized vs 6.0% benchmark)', type: 'decision' },
    { timestamp: new Date(now - 2000).toISOString(), agentId: 'meta_strategist', agentName: 'Meta-Strategist', agentIcon: '🔄', color: '#a855f7', message: 'Prompt v3: Morpho allocation timing improved 8% over previous version', type: 'thinking' },
  ];
}

interface AIReasoningFeedProps {
  entries?: ReasoningEntry[];
}

export function AIReasoningFeed({ entries }: AIReasoningFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [mockFeed, setMockFeed] = useState<ReasoningEntry[]>([]);
  const feedData = entries?.length ? entries : mockFeed;

  useEffect(() => {
    if (!entries?.length) {
      setMockFeed(createMockReasoningFeed());
    }
  }, [entries]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [feedData.length]);

  return (
    <GlassCard padding="md" className="h-full max-h-[500px] flex flex-col">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            AI Reasoning Feed
          </h2>
        </div>
        <span className="text-[9px] font-mono text-[var(--text-dim)]">
          {feedData.length} entries
        </span>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin font-mono text-[11px]"
      >
        {feedData.map((entry, i) => (
          <div
            key={i}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--bg-surface)] transition-colors animate-fade-in"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            {/* Agent icon */}
            <span className="text-sm shrink-0 mt-0.5">{entry.agentIcon}</span>

            <div className="min-w-0 flex-1">
              {/* Agent name + timestamp */}
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-semibold" style={{ color: entry.color }}>
                  {entry.agentName}
                </span>
                <span className="text-[9px] text-[var(--text-dim)]">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              {/* Message */}
              <p className={`leading-relaxed ${
                entry.type === 'warning' ? 'text-amber-400' :
                entry.type === 'action' ? 'text-emerald-400' :
                entry.type === 'decision' ? 'text-[var(--text-primary)]' :
                'text-[var(--text-secondary)]'
              }`}>
                {entry.message}
              </p>
            </div>

            {/* Type badge */}
            <span className={`shrink-0 text-[8px] px-1.5 py-0.5 rounded font-semibold uppercase ${
              entry.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
              entry.type === 'action' ? 'bg-emerald-500/10 text-emerald-400' :
              entry.type === 'decision' ? 'bg-violet-500/10 text-violet-400' :
              'bg-cyan-500/10 text-cyan-400'
            }`}>
              {entry.type}
            </span>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
