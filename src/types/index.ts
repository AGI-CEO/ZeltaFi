export interface User {
  id: string;                     // UUID
  circleUserId: string;           // Circle User ID
  walletId: string;               // Circle Wallet ID
  walletAddress: `0x${string}`;   // EVM address
  depositAmountUsdc: number;      // Current deposited amount
  currentProtocol: 'aave' | 'morpho' | 'moonwell' | 'idle';
  currentApy: number;             // Current earned APY (bps)
  riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  agentActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentCycle {
  id: string;
  userId: string;
  startedAt: string;
  completedAt?: string;
  phase: 'scanning' | 'optimizing' | 'executing' | 'reflecting' | 'idle' | 'skipped';
  scanResults: ProtocolYield[];
  optimizerDecision: OptimizerDecision | null;
  executionResult: ExecutionResult | null;
  reflexionCritique: string | null;
  totalFeePaidUsdc: number;        // x402 query fees paid this cycle
  userFeeChargedUsdc: number;      // 0 if no rebalance, 0.005 if rebalanced
}

export interface ProtocolYield {
  protocol: 'aave' | 'morpho' | 'moonwell';
  asset: string;                   // e.g. 'USDC'
  chain: string;                   // e.g. 'base', 'arc-testnet'
  supplyApyBps: number;            // APY in basis points (e.g. 850 = 8.50%)
  tvlUsd: number;
  utilizationRate: number;
  queryCostUsdc: number;           // What was paid via x402 for this data point
  arcTxHash: string | null;        // x402 payment tx hash on Arc
  queriedAt: string;
}

export interface OptimizerDecision {
  shouldRebalance: boolean;
  targetProtocol: 'aave' | 'morpho' | 'moonwell' | null;
  currentApyBps: number;
  targetApyBps: number;
  deltaApyBps: number;
  estimatedNetGainUsdc: number;
  feeCostUsdc: number;
  netGainAfterFeeUsdc: number;
  reasoning: string;               // Gemini's text explanation
  promptVersion: number;           // Which reflexion-improved prompt was used
}

export interface ExecutionResult {
  executed: boolean;
  fromProtocol: string;
  toProtocol: string;
  amountUsdc: number;
  arcTxHash: string | null;
  feeChargedTxHash: string | null;
  actualGasCost: number;           // Should be 0 via nanopayments
  timestampMs: number;
}

export interface NanopaymentRecord {
  id: string;
  fromAgentId: string;             // ERC-8004 agent identity address
  toAddress: string;               // Data provider or protocol address
  amountUsdc: number;
  purpose: 'yield_query' | 'rebalance_fee';
  arcTxHash: string | null;
  settledAt: string | null;
  cycleId: string;
}

export interface ReflexionMemory {
  version: number;
  critique: string;
  improvedSystemPrompt: string;
  performanceMetrics: {
    avgDeltaApyBpsAchieved: number;
    falseRebalanceRate: number;     // Cycles where rebalance was triggered but delta not achieved
    feeToValueRatio: number;        // avg fee / avg net gain per rebalance
  };
  updatedAt: string;
}

// Global store shape
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
