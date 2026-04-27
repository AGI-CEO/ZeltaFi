'use client';

import { useEffect, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';

type Phase = 'scanning' | 'optimizing' | 'executing' | 'reflecting' | 'idle' | 'skipped';

interface PaymentFlowDiagramProps {
  currentPhase?: Phase;
  lastDecision?: {
    shouldRebalance: boolean;
    reasoning: string;
    targetProtocol?: string | null;
    deltaApyBps?: number;
    netGainAfterFeeUsdc?: number;
  };
}

interface AgentNode {
  id: string;
  label: string;
  sublabel: string;
  icon: string;
  cx: number;
  cy: number;
  color: string;
  glowColor: string;
}

const nodes: AgentNode[] = [
  { id: 'user', label: 'User Wallet', sublabel: 'USDC Deposit', icon: '💰', cx: 70, cy: 85, color: '#10b981', glowColor: 'rgba(16,185,129,0.3)' },
  { id: 'scanner', label: 'Scanner', sublabel: 'Gemini Flash', icon: '🔍', cx: 220, cy: 45, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.3)' },
  { id: 'aave', label: 'Aave', sublabel: '$0.001', icon: '🟦', cx: 400, cy: 20, color: '#3b82f6', glowColor: 'rgba(59,130,246,0.3)' },
  { id: 'morpho', label: 'Morpho', sublabel: '$0.001', icon: '🔷', cx: 400, cy: 65, color: '#06b6d4', glowColor: 'rgba(6,182,212,0.3)' },
  { id: 'moonwell', label: 'Moonwell', sublabel: '$0.001', icon: '🟣', cx: 400, cy: 110, color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.3)' },
  { id: 'optimizer', label: 'Optimizer', sublabel: 'Gemini Pro', icon: '🧠', cx: 220, cy: 110, color: '#8b5cf6', glowColor: 'rgba(139,92,246,0.3)' },
  { id: 'executor', label: 'Executor', sublabel: '$0.005 fee', icon: '⚡', cx: 70, cy: 145, color: '#f59e0b', glowColor: 'rgba(245,158,11,0.3)' },
  { id: 'reflexion', label: 'Reflexion', sublabel: 'Self-improving', icon: '🔄', cx: 220, cy: 155, color: '#a855f7', glowColor: 'rgba(168,85,247,0.3)' },
];

interface Edge {
  from: string;
  to: string;
  activePhases: Phase[];
}

const edges: Edge[] = [
  { from: 'user', to: 'scanner', activePhases: ['scanning'] },
  { from: 'scanner', to: 'aave', activePhases: ['scanning'] },
  { from: 'scanner', to: 'morpho', activePhases: ['scanning'] },
  { from: 'scanner', to: 'moonwell', activePhases: ['scanning'] },
  { from: 'scanner', to: 'optimizer', activePhases: ['optimizing'] },
  { from: 'optimizer', to: 'executor', activePhases: ['executing'] },
  { from: 'executor', to: 'user', activePhases: ['executing'] },
  { from: 'optimizer', to: 'reflexion', activePhases: ['reflecting'] },
  { from: 'reflexion', to: 'optimizer', activePhases: ['reflecting'] },
];

const phaseActiveNodes: Record<Phase, string[]> = {
  scanning: ['scanner', 'aave', 'morpho', 'moonwell'],
  optimizing: ['optimizer'],
  executing: ['executor', 'user'],
  reflecting: ['reflexion', 'optimizer'],
  idle: [],
  skipped: ['optimizer'],
};

const phaseLabels: Record<Phase, { text: string; color: string }> = {
  scanning: { text: 'SCANNING — Querying yield data via x402 nanopayments', color: 'text-cyan-400' },
  optimizing: { text: 'OPTIMIZING — AI evaluating net-gain guard', color: 'text-violet-400' },
  executing: { text: 'EXECUTING — Rebalancing via Circle Wallets', color: 'text-amber-400' },
  reflecting: { text: 'REFLECTING — Self-improving decision prompt', color: 'text-purple-400' },
  idle: { text: 'IDLE — Awaiting next cycle', color: 'text-[var(--text-muted)]' },
  skipped: { text: 'SKIPPED — Net gain below fee threshold (guard active)', color: 'text-amber-400' },
};

export function PaymentFlowDiagram({ currentPhase = 'idle', lastDecision }: PaymentFlowDiagramProps) {
  const activeNodes = phaseActiveNodes[currentPhase] ?? [];
  const phaseLabel = phaseLabels[currentPhase];
  const [dotOffset, setDotOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotOffset(prev => (prev + 2) % 100);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const getNodeById = (id: string) => nodes.find(n => n.id === id);

  return (
    <GlassCard padding="lg" className="relative overflow-hidden">
      {/* Title */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${currentPhase === 'idle' ? 'bg-gray-500' : 'bg-emerald-400 animate-pulse'}`} />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Agent Orchestration — Live
          </h2>
        </div>
      </div>

      {/* SVG Flow Visualization */}
      <div className="relative w-full" style={{ paddingBottom: '35%' }}>
        <svg viewBox="0 0 480 175" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Glow filters */}
            {nodes.map(node => (
              <filter key={`glow-${node.id}`} id={`glow-${node.id}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor={node.glowColor} result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Edges */}
          {edges.map((edge, i) => {
            const from = getNodeById(edge.from);
            const to = getNodeById(edge.to);
            if (!from || !to) return null;

            const isActive = edge.activePhases.includes(currentPhase);
            const strokeColor = isActive ? nodes.find(n => n.id === edge.to)?.color || '#10b981' : 'rgba(255,255,255,0.06)';

            return (
              <g key={i}>
                <line
                  x1={from.cx} y1={from.cy}
                  x2={to.cx} y2={to.cy}
                  stroke={strokeColor}
                  strokeWidth={isActive ? 1.5 : 0.5}
                  strokeOpacity={isActive ? 0.6 : 1}
                  strokeDasharray={isActive ? '' : '3 3'}
                />
                {/* Traveling dot */}
                {isActive && (
                  <circle
                    cx={from.cx + (to.cx - from.cx) * (dotOffset / 100)}
                    cy={from.cy + (to.cy - from.cy) * (dotOffset / 100)}
                    r="2.5"
                    fill={strokeColor}
                    opacity={Math.sin((dotOffset / 100) * Math.PI)}
                  >
                    <animate
                      attributeName="r"
                      values="2;3;2"
                      dur="0.8s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map(node => {
            const isActive = activeNodes.includes(node.id);

            return (
              <g key={node.id} filter={isActive ? `url(#glow-${node.id})` : undefined}>
                {/* Node background */}
                <rect
                  x={node.cx - 38} y={node.cy - 16}
                  width="76" height="32"
                  rx="8"
                  fill={isActive ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                  stroke={isActive ? node.color : 'rgba(255,255,255,0.08)'}
                  strokeWidth={isActive ? 1.5 : 0.5}
                />

                {/* Icon */}
                <text x={node.cx - 26} y={node.cy + 2} fontSize="10" textAnchor="middle">
                  {node.icon}
                </text>

                {/* Label */}
                <text
                  x={node.cx + 2} y={node.cy - 2}
                  textAnchor="middle"
                  fill={isActive ? '#f1f5f9' : '#64748b'}
                  fontSize="7"
                  fontWeight="600"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {node.label}
                </text>

                {/* Sublabel */}
                <text
                  x={node.cx + 2} y={node.cy + 8}
                  textAnchor="middle"
                  fill={isActive ? node.color : '#475569'}
                  fontSize="5.5"
                  fontFamily="'JetBrains Mono', monospace"
                >
                  {node.sublabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Phase Status */}
      <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-4 rounded-full ${
            currentPhase === 'idle' ? 'bg-gray-600' :
            currentPhase === 'skipped' ? 'bg-amber-400' :
            'bg-emerald-400'
          }`} />
          <span className={`text-xs font-mono ${phaseLabel.color}`}>
            {phaseLabel.text}
          </span>
        </div>
      </div>

      {/* Decision Tooltip */}
      {lastDecision && currentPhase !== 'scanning' && (
        <div className={`mt-3 glass-surface p-3 animate-slide-in-top ${
          lastDecision.shouldRebalance ? 'border-emerald-500/20' : 'border-amber-500/20'
        }`} style={{ borderLeftWidth: '2px' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-semibold ${lastDecision.shouldRebalance ? 'text-emerald-400' : 'text-amber-400'}`}>
              {lastDecision.shouldRebalance ? '✅ REBALANCING' : '⊘ SKIPPED'}
            </span>
            {lastDecision.targetProtocol && (
              <span className="text-xs text-[var(--text-muted)] font-mono">
                → {lastDecision.targetProtocol}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-2">
            {lastDecision.reasoning}
          </p>
        </div>
      )}
    </GlassCard>
  );
}
