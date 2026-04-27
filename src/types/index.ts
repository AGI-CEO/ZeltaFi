// ─── Core User Types ───

export interface User {
  id: string;
  circleUserId: string;
  walletId: string;
  walletAddress: `0x${string}`;
  depositAmountUsdc: number;
  currentProtocol: 'aave' | 'morpho' | 'moonwell' | 'idle';
  currentApy: number;
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  agentActive: boolean;
  zeltaBalance: number;      // $ZELTA token balance
  zeltaStaked: number;       // $ZELTA staked for profit sharing
  createdAt: string;
  updatedAt: string;
}

// ─── Agent Cycle Types ───

export interface AgentCycle {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  phase: AgentPhase;
  // Agent outputs
  marketIntelligence: MarketIntelligence | null;
  riskAssessment: RiskAssessment | null;
  strategy: Strategy | null;
  executionResult: ExecutionResult | null;
  performanceAttribution: PerformanceAttribution | null;
  reflexionCritique: string | null;
  // Reasoning feed
  reasoningLog: ReasoningEntry[];
  // Legacy compat
  scanResults: ProtocolYield[];
  optimizerDecision: OptimizerDecision | null;
  // Costs
  totalFeePaidUsdc: number;
  userFeeChargedUsdc: number;
}

export type AgentPhase =
  | 'market_sentinel'
  | 'risk_analyst'
  | 'strategy_architect'
  | 'compliance_check'
  | 'executing'
  | 'performance_analysis'
  | 'meta_strategist'
  | 'idle'
  | 'skipped'
  // Legacy compat
  | 'scanning'
  | 'optimizing'
  | 'reflecting';

// ─── Market Sentinel (Scanner Upgrade) ───

export interface ProtocolYield {
  protocol: 'aave' | 'morpho' | 'moonwell';
  asset: string;
  chain: string;
  supplyApyBps: number;
  tvlUsd: number;
  utilizationRate: number;
  queryCostUsdc: number;
  arcTxHash: string | null;
  queriedAt: string;
}

export interface MarketSignal {
  type: 'opportunity' | 'risk' | 'neutral';
  protocol: string;
  signal: string;
  confidence: number;     // 0-100
  source: string;
}

export interface MarketIntelligence {
  yields: ProtocolYield[];
  signals: MarketSignal[];
  narrative: string;       // Gemini-generated market analysis paragraph
  timestamp: string;
}

// ─── Risk Analyst ───

export interface ProtocolRiskScore {
  protocol: string;
  overallScore: number;    // 0-100 (100 = safest)
  factors: {
    smartContractRisk: number;
    tvlStability: number;
    auditStatus: number;
    governanceRisk: number;
    concentrationRisk: number;
  };
  reasoning: string;
}

export interface RiskAssessment {
  protocolScores: ProtocolRiskScore[];
  portfolioRiskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  reasoning: string;
}

// ─── Strategy Architect (Optimizer Upgrade) ───

export interface StrategyPosition {
  protocol: 'aave' | 'morpho' | 'moonwell';
  action: 'supply' | 'withdraw' | 'hold';
  allocationPercent: number;
  expectedApyBps: number;
  reasoning: string;
}

export interface Strategy {
  id: string;
  name: string;            // e.g. "Diversified Core" or "Aggressive Alpha"
  positions: StrategyPosition[];
  blendedApyBps: number;
  riskScore: number;
  estimatedNetGainUsdc: number;
  feeCostUsdc: number;
  netGainAfterFeeUsdc: number;
  shouldExecute: boolean;
  reasoning: string;
  // Legacy compat
  shouldRebalance: boolean;
  targetProtocol: 'aave' | 'morpho' | 'moonwell' | null;
  deltaApyBps: number;
}

// ─── Performance Analyst ───

export interface PerformanceAttribution {
  realizedApyBps: number;
  projectedApyBps: number;
  alphaVsBenchmarkBps: number;    // excess over simple hold
  attributionByProtocol: {
    protocol: string;
    contributionBps: number;
    reasoning: string;
  }[];
  totalAlphaGeneratedUsdc: number;
  reasoning: string;
}

// ─── Reasoning Feed ───

export interface ReasoningEntry {
  timestamp: string;
  agentId: AgentId;
  agentName: string;
  agentIcon: string;
  color: string;
  message: string;
  type: 'thinking' | 'decision' | 'action' | 'warning';
}

export type AgentId =
  | 'market_sentinel'
  | 'risk_analyst'
  | 'strategy_architect'
  | 'compliance_guardian'
  | 'executor'
  | 'performance_analyst'
  | 'meta_strategist';

export const AGENT_PROFILES: Record<AgentId, { name: string; icon: string; color: string; role: string }> = {
  market_sentinel: {
    name: 'Market Sentinel',
    icon: '🔍',
    color: '#06b6d4',
    role: 'Monitors yields, TVL shifts, and governance signals across all protocols',
  },
  risk_analyst: {
    name: 'Risk Analyst',
    icon: '📊',
    color: '#f59e0b',
    role: 'Evaluates smart contract risk, audit status, and counterparty exposure',
  },
  strategy_architect: {
    name: 'Strategy Architect',
    icon: '🧠',
    color: '#8b5cf6',
    role: 'Designs multi-position strategies that maximize risk-adjusted yield',
  },
  compliance_guardian: {
    name: 'Compliance Guardian',
    icon: '🛡️',
    color: '#10b981',
    role: 'Enforces net-gain guards, risk limits, and portfolio constraints',
  },
  executor: {
    name: 'Execution Planner',
    icon: '⚡',
    color: '#f97316',
    role: 'Plans optimal trade routing, timing, and MEV protection',
  },
  performance_analyst: {
    name: 'Performance Analyst',
    icon: '📈',
    color: '#3b82f6',
    role: 'Tracks realized vs. projected returns and decomposes alpha sources',
  },
  meta_strategist: {
    name: 'Meta-Strategist',
    icon: '🔄',
    color: '#a855f7',
    role: 'Improves the entire team by analyzing patterns across cycles',
  },
};

// ─── Legacy Compat (OptimizerDecision) ───

export interface OptimizerDecision {
  shouldRebalance: boolean;
  targetProtocol: 'aave' | 'morpho' | 'moonwell' | null;
  currentApyBps: number;
  targetApyBps: number;
  deltaApyBps: number;
  estimatedNetGainUsdc: number;
  feeCostUsdc: number;
  netGainAfterFeeUsdc: number;
  reasoning: string;
  promptVersion: number;
}

// ─── Execution ───

export interface ExecutionResult {
  executed: boolean;
  fromProtocol: string;
  toProtocol: string;
  amountUsdc: number;
  arcTxHash: string | null;
  feeChargedTxHash: string | null;
  actualGasCost: number;
  timestampMs: number;
}

// ─── Nanopayments ───

export interface NanopaymentRecord {
  id: string;
  fromAgentId: string;
  toAddress: string;
  amountUsdc: number;
  purpose: 'yield_query' | 'rebalance_fee' | 'risk_analysis' | 'strategy_compute';
  arcTxHash: string | null;
  settledAt: string | null;
  cycleId: string;
}

// ─── Reflexion Memory ───

export interface ReflexionMemory {
  version: number;
  critique: string;
  improvedSystemPrompt: string;
  performanceMetrics: {
    avgDeltaApyBpsAchieved: number;
    falseRebalanceRate: number;
    feeToValueRatio: number;
  };
  updatedAt: string;
}

// ─── $ZELTA Token Economics ───

export interface ZeltaMetrics {
  totalSupply: number;
  circulatingSupply: number;
  price: number;
  marketCap: number;
  totalAlphaGenerated: number;    // All-time excess yield in USDC
  currentAlphaRate: number;       // Annualized excess yield rate
  stakerSharePercent: number;     // % of alpha that goes to stakers
  treasuryBalance: number;        // Protocol treasury USDC
  totalValueLocked: number;       // Total USDC under management
  avgBlendedApy: number;          // Average APY across all users
}

// ─── Global Store ───

export interface AppState {
  users: Record<string, User>;
  cycles: AgentCycle[];
  payments: NanopaymentRecord[];
  reflexionMemory: ReflexionMemory;
  agentWallets: {
    scannerAddress: string;
    optimizerAddress: string;
    executorAddress: string;
  };
}
