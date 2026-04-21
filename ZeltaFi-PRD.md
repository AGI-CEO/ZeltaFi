# YieldAgent — Product Requirements Document
**Version:** 1.0  
**Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS  
**Target:** Arc Hackathon Submission — April 25, 2026  
**Scope:** Fully autonomous multi-agent DeFi stablecoin yield optimizer with x402 nanopayment economics and a Reflexion self-improvement loop.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Tech Stack & Dependencies](#3-tech-stack--dependencies)
4. [Environment Variables](#4-environment-variables)
5. [Directory Structure](#5-directory-structure)
6. [Database Schema](#6-database-schema)
7. [Agent System Design](#7-agent-system-design)
8. [Smart Contracts](#8-smart-contracts)
9. [API Routes](#9-api-routes)
10. [Frontend Pages & Components](#10-frontend-pages--components)
11. [Fee Model & Incentive Logic](#11-fee-model--incentive-logic)
12. [Agent Cycle Orchestration](#12-agent-cycle-orchestration)
13. [x402 Nanopayment Integration](#13-x402-nanopayment-integration)
14. [Circle Wallets Integration](#14-circle-wallets-integration)
15. [Yield Data Sources](#15-yield-data-sources)
16. [Reflexion Self-Improvement Loop](#16-reflexion-self-improvement-loop)
17. [ERC-8004 Agent Identity](#17-erc-8004-agent-identity)
18. [Demo & Hackathon Requirements](#18-demo--hackathon-requirements)
19. [Error Handling & Edge Cases](#19-error-handling--edge-cases)
20. [Build & Deployment](#20-build--deployment)

---

## 1. Project Overview

### One-Line Pitch
An autonomous DeFi savings agent that continuously optimizes stablecoin yield across Aave, Morpho, and Moonwell — charging users a nanopayment fee **only when a rebalance demonstrably improves their yield beyond the cost of the fee**.

### Core Value Proposition
- Users deposit USDC and earn optimized yield (targeting 9–12% APY) without any manual management
- The agent pays data providers in real-time via x402 nanopayments ($0.001 USDC per API query)
- Users are charged **only when value is delivered**: a $0.005 USDC fee per rebalance, triggered only when `(new_apy − current_apy) × deposit × time_horizon > fee_amount`
- All payments settle gas-free on Arc via Circle Nanopayments
- A Reflexion Agent reviews each cycle, critiques decisions, and improves the Optimizer's decision prompt over time

### Aligned Incentives (Key Design Decision)
The agent is economically prevented from churning. The Optimizer Agent computes a **net user gain** before every potential rebalance:

```
net_gain = (new_apy - current_apy) × user_deposit × (hours_to_next_cycle / 8760)
```

A rebalance only executes if `net_gain > fee_amount ($0.005)`. This means the agent can only earn more by finding genuinely better yield — not by manufacturing transactions.

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    NEXT.JS APP (Arc Testnet)             │
│                                                         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐            │
│  │  User UI │   │ Dashboard│   │  Admin   │            │
│  │ (deposit/│   │(live feed│   │(agent    │            │
│  │  withdraw│   │ txn log) │   │ config)  │            │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘            │
│       └──────────────┴──────────────┘                   │
│                        │                                │
│              ┌─────────▼──────────┐                     │
│              │  Next.js API Routes │                     │
│              │  /api/agent/*       │                     │
│              │  /api/wallet/*      │                     │
│              │  /api/yield/*       │                     │
│              └─────────┬──────────┘                     │
│                        │                                │
│         ┌──────────────▼──────────────┐                 │
│         │    AGENT ORCHESTRATOR        │                 │
│         │  (Next.js Server Action /   │                 │
│         │   background job via        │                 │
│         │   setInterval in API route) │                 │
│         └──────┬───────────────┬──────┘                 │
│                │               │                        │
│    ┌───────────▼──┐   ┌────────▼────────┐               │
│    │ SCANNER AGENT│   │ REFLEXION AGENT │               │
│    │ Gemini Flash │   │ Gemini Pro      │               │
│    │ + x402 client│   │ (async, post-   │               │
│    └──────┬───────┘   │  cycle review)  │               │
│           │           └────────┬────────┘               │
│    ┌──────▼────────┐           │                        │
│    │OPTIMIZER AGENT│◄──────────┘ (improved prompt)      │
│    │ Gemini Pro    │                                     │
│    │ + net_gain    │                                     │
│    │   guard       │                                     │
│    └──────┬────────┘                                    │
│           │                                             │
│    ┌──────▼──────────┐                                  │
│    │ EXECUTION AGENT  │                                  │
│    │ Circle Wallets   │                                  │
│    │ SDK + x402 fee   │                                  │
│    └──────┬───────────┘                                  │
└───────────┼─────────────────────────────────────────────┘
            │
    ┌───────▼──────────────────────────────────┐
    │          ARC TESTNET (EVM L1)             │
    │  Circle Gateway Wallets  │  ERC-8004      │
    │  x402 nanopayments       │  Registries    │
    │  Aave/Morpho/Moonwell    │  (agent IDs)   │
    └──────────────────────────────────────────┘
```

---

## 3. Tech Stack & Dependencies

### Core Framework
```bash
npx create-next-app@latest yieldagent --typescript --tailwind --app --src-dir
```

### Package Installation
```bash
# Circle SDKs
npm install @circle-fin/user-controlled-wallets @circle-fin/smart-contract-platform

# x402 payment protocol
npm install x402-axios  
# Note: use x402-express patterns adapted to Next.js API routes

# Gemini AI
npm install @google/genai

# Blockchain / Wallet
npm install viem wagmi @wagmi/core

# UI Components
npm install @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-progress
npm install lucide-react class-variance-authority clsx tailwind-merge

# Data / State
npm install swr zustand

# Utilities
npm install uuid zod dotenv
```

### Dev Dependencies
```bash
npm install -D @types/uuid hardhat @nomicfoundation/hardhat-toolbox
```

---

## 4. Environment Variables

Create `.env.local`:

```env
# Circle
CIRCLE_API_KEY=your_circle_api_key
CIRCLE_ENTITY_SECRET=your_entity_secret
CIRCLE_ENVIRONMENT=sandbox  # or 'production' for mainnet

# Arc / EVM
ARC_RPC_URL=https://rpc.arc-testnet.circle.com
ARC_CHAIN_ID=482  # Arc testnet chain ID - verify from Circle docs
AGENT_PRIVATE_KEY=0x...  # Server-side agent wallet private key (never exposed to client)

# Gemini
GEMINI_API_KEY=your_gemini_api_key

# x402 / Gateway
CIRCLE_GATEWAY_FACILITATOR_URL=https://gateway.circle.com/v1
YIELD_DATA_PROVIDER_PAYMENT_ADDRESS=0x...  # Address of AIsa/yield data provider on Arc

# Protocol Addresses (Arc Testnet - confirm from Circle/protocol docs)
AAVE_POOL_ADDRESS=0x...
MORPHO_API_ENDPOINT=https://blue-api.morpho.org/graphql
MOONWELL_API_ENDPOINT=https://yield.moonwell.fi/

# Agent Config
AGENT_CYCLE_INTERVAL_MS=1800000  # 30 minutes
MIN_YIELD_DELTA_BPS=25  # 0.25% minimum APY improvement to trigger rebalance
REBALANCE_FEE_USDC=0.005  # Fee in USDC per successful rebalance
QUERY_FEE_USDC=0.001  # x402 fee per yield API query

# ERC-8004 Registry Addresses (deploy these - see Smart Contracts section)
IDENTITY_REGISTRY_ADDRESS=0x...
REPUTATION_REGISTRY_ADDRESS=0x...
VALIDATION_REGISTRY_ADDRESS=0x...

# App
NEXTAUTH_SECRET=your_secret
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 5. Directory Structure

```
yieldagent/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing / onboarding
│   │   ├── dashboard/
│   │   │   └── page.tsx                # Main user dashboard
│   │   ├── deposit/
│   │   │   └── page.tsx                # Deposit flow
│   │   └── api/
│   │       ├── agent/
│   │       │   ├── start/route.ts      # Start agent cycle for user
│   │       │   ├── stop/route.ts       # Stop agent
│   │       │   ├── cycle/route.ts      # Manual trigger one cycle (demo)
│   │       │   └── status/route.ts     # Get current agent state
│   │       ├── wallet/
│   │       │   ├── create/route.ts     # Create Circle user wallet
│   │       │   ├── balance/route.ts    # Get wallet balance
│   │       │   └── deposit/route.ts    # Initiate deposit flow
│   │       ├── yield/
│   │       │   └── scan/route.ts       # Trigger scanner, return APY data
│   │       └── transactions/
│   │           └── route.ts            # Get transaction log
│   ├── agents/
│   │   ├── orchestrator.ts             # Master agent loop controller
│   │   ├── scanner.ts                  # Scanner Agent (Gemini Flash)
│   │   ├── optimizer.ts                # Optimizer Agent (Gemini Pro)
│   │   ├── executor.ts                 # Execution Agent (Circle Wallets)
│   │   └── reflexion.ts               # Reflexion Agent (Gemini Pro)
│   ├── lib/
│   │   ├── circle/
│   │   │   ├── wallets.ts              # Circle Wallets SDK wrapper
│   │   │   ├── nanopayments.ts         # Circle Gateway nanopayment client
│   │   │   └── gateway.ts             # Gateway wallet deposit/balance
│   │   ├── x402/
│   │   │   └── client.ts              # x402 payment client (axios interceptor)
│   │   ├── protocols/
│   │   │   ├── aave.ts                # Aave APY fetcher
│   │   │   ├── morpho.ts              # Morpho APY fetcher
│   │   │   └── moonwell.ts            # Moonwell APY fetcher
│   │   ├── erc8004/
│   │   │   └── registry.ts            # ERC-8004 agent identity client
│   │   ├── gemini.ts                   # Gemini client factory
│   │   ├── db.ts                       # In-memory state store (or SQLite via better-sqlite3)
│   │   └── utils.ts
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── AgentStatusCard.tsx
│   │   │   ├── AllocationChart.tsx
│   │   │   ├── LiveTransactionFeed.tsx
│   │   │   ├── PaymentFlowDiagram.tsx
│   │   │   └── YieldMetricsPanel.tsx
│   │   ├── deposit/
│   │   │   └── DepositForm.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Badge.tsx
│   ├── hooks/
│   │   ├── useAgentStatus.ts
│   │   ├── useTransactions.ts
│   │   └── useWalletBalance.ts
│   └── types/
│       └── index.ts
├── contracts/
│   ├── IdentityRegistry.vy
│   ├── ReputationRegistry.vy
│   ├── ValidationRegistry.vy
│   └── deploy.ts
├── scripts/
│   └── seed-testnet.ts                # Pre-fund agent wallets for demo
├── .env.local
├── hardhat.config.ts
└── package.json
```

---

## 6. Database Schema

Use an in-memory store backed by a JSON file for hackathon simplicity (no external DB needed). Implement in `src/lib/db.ts`:

```typescript
// src/types/index.ts

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
```

---

## 7. Agent System Design

### 7.1 Scanner Agent

**File:** `src/agents/scanner.ts`

**Model:** `gemini-3-flash-preview` (low latency, function-calling)

**Responsibility:** Query yield APYs from 3 protocols, paying $0.001 USDC via x402 per query. Return structured `ProtocolYield[]`.

```typescript
// src/agents/scanner.ts
import { GoogleGenAI, Type } from '@google/genai';
import { x402Client } from '../lib/x402/client';
import { fetchAaveYield } from '../lib/protocols/aave';
import { fetchMorphoYield } from '../lib/protocols/morpho';
import { fetchMoonwellYield } from '../lib/protocols/moonwell';
import { ProtocolYield } from '../types';
import { recordNanopayment } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Function declarations for Gemini function calling
const yieldFunctions = [
  {
    name: 'get_aave_usdc_apy',
    description: 'Fetches the current USDC supply APY from Aave V3 on Base. Returns APY in basis points.',
    parameters: { type: Type.OBJECT, properties: {}, required: [] },
  },
  {
    name: 'get_morpho_usdc_apy',
    description: 'Fetches the current USDC vault APY from Morpho Blue on Base. Returns APY in basis points.',
    parameters: { type: Type.OBJECT, properties: {}, required: [] },
  },
  {
    name: 'get_moonwell_usdc_apy',
    description: 'Fetches the current USDC supply APY from Moonwell on Base. Returns APY in basis points.',
    parameters: { type: Type.OBJECT, properties: {}, required: [] },
  },
];

const functionMap: Record<string, () => Promise<ProtocolYield>> = {
  get_aave_usdc_apy: fetchAaveYield,
  get_morpho_usdc_apy: fetchMorphoYield,
  get_moonwell_usdc_apy: fetchMoonwellYield,
};

export async function runScannerAgent(cycleId: string): Promise<ProtocolYield[]> {
  const results: ProtocolYield[] = [];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Fetch the current USDC supply APY from all three protocols: Aave, Morpho, and Moonwell. Call all three functions.' }],
      },
    ],
    config: {
      tools: [{ functionDeclarations: yieldFunctions }],
      systemInstruction: 'You are a DeFi yield scanner. Always call all three yield functions in parallel to gather complete market data.',
    },
  });

  // Process function calls
  const functionCalls = response.functionCalls ?? [];
  
  for (const call of functionCalls) {
    const fetcher = functionMap[call.name];
    if (!fetcher) continue;

    // Pay x402 nanopayment before fetching
    const paymentTxHash = await x402Client.pay({
      amount: process.env.QUERY_FEE_USDC!,
      toAddress: process.env.YIELD_DATA_PROVIDER_PAYMENT_ADDRESS!,
      description: `Yield query: ${call.name}`,
    });

    // Fetch yield data
    const yieldData = await fetcher();
    yieldData.arcTxHash = paymentTxHash;
    yieldData.queryCostUsdc = parseFloat(process.env.QUERY_FEE_USDC!);
    results.push(yieldData);

    // Record payment in DB
    await recordNanopayment({
      fromAgentId: process.env.SCANNER_AGENT_ADDRESS!,
      toAddress: process.env.YIELD_DATA_PROVIDER_PAYMENT_ADDRESS!,
      amountUsdc: parseFloat(process.env.QUERY_FEE_USDC!),
      purpose: 'yield_query',
      arcTxHash: paymentTxHash,
      cycleId,
    });
  }

  return results;
}
```

### 7.2 Optimizer Agent

**File:** `src/agents/optimizer.ts`

**Model:** `gemini-3-pro-preview` (multi-step financial reasoning)

**Responsibility:** Given scan results and user context, decide whether to rebalance. Enforces the net-gain guard. Uses the Reflexion-improved system prompt.

```typescript
// src/agents/optimizer.ts
import { GoogleGenAI, Type } from '@google/genai';
import { ProtocolYield, OptimizerDecision, User } from '../types';
import { getReflexionMemory } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// BASE system prompt - gets improved by Reflexion Agent over time
const BASE_SYSTEM_PROMPT = `You are a DeFi yield optimizer. Your ONLY goal is to maximize net user yield AFTER all fees.

CRITICAL RULE - You MUST calculate net_gain before recommending any rebalance:
  net_gain_usdc = (target_apy_bps - current_apy_bps) / 10000 * deposit_usdc * (hours_to_next_cycle / 8760)
  
  Only recommend rebalance if: net_gain_usdc > FEE_AMOUNT (0.005 USDC)
  
  If net_gain_usdc <= FEE_AMOUNT, ALWAYS return shouldRebalance: false.

Consider risk tolerance:
- conservative: only Aave (most established), skip if delta < 50bps
- balanced: Aave or Morpho, skip if delta < 25bps  
- aggressive: any protocol, skip if delta < 10bps

Return your decision as a JSON object with these exact fields:
{
  "shouldRebalance": boolean,
  "targetProtocol": "aave" | "morpho" | "moonwell" | null,
  "deltaApyBps": number,
  "estimatedNetGainUsdc": number,
  "feeCostUsdc": 0.005,
  "netGainAfterFeeUsdc": number,
  "reasoning": "brief explanation"
}`;

export async function runOptimizerAgent(
  scanResults: ProtocolYield[],
  user: User,
  cycleId: string
): Promise<OptimizerDecision> {
  // Get latest Reflexion-improved prompt
  const reflexionMemory = await getReflexionMemory();
  const systemPrompt = reflexionMemory.version > 0 
    ? reflexionMemory.improvedSystemPrompt 
    : BASE_SYSTEM_PROMPT;

  const userContext = `
User deposit: ${user.depositAmountUsdc} USDC
Current protocol: ${user.currentProtocol}
Current APY: ${user.currentApy} bps (${(user.currentApy / 100).toFixed(2)}%)
Risk tolerance: ${user.riskTolerance}
Hours to next cycle: ${parseFloat(process.env.AGENT_CYCLE_INTERVAL_MS!) / 3600000}
Fee amount: ${process.env.REBALANCE_FEE_USDC} USDC

Current yield market:
${scanResults.map(p => `  ${p.protocol}: ${(p.supplyApyBps / 100).toFixed(2)}% APY, TVL: $${(p.tvlUsd / 1e6).toFixed(1)}M, Utilization: ${(p.utilizationRate * 100).toFixed(1)}%`).join('\n')}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: userContext }] }],
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    },
  });

  const raw = JSON.parse(response.text ?? '{}');

  // Enforce net-gain guard server-side regardless of LLM output
  const bestYield = scanResults.reduce((best, p) => p.supplyApyBps > best.supplyApyBps ? p : best);
  const deltaApyBps = bestYield.supplyApyBps - user.currentApy;
  const cycleHours = parseFloat(process.env.AGENT_CYCLE_INTERVAL_MS!) / 3600000;
  const estimatedNetGain = (deltaApyBps / 10000) * user.depositAmountUsdc * (cycleHours / 8760);
  const feeAmount = parseFloat(process.env.REBALANCE_FEE_USDC!);

  // Server-side override: never rebalance if net gain doesn't cover fee
  if (estimatedNetGain <= feeAmount) {
    return {
      shouldRebalance: false,
      targetProtocol: null,
      currentApyBps: user.currentApy,
      targetApyBps: bestYield.supplyApyBps,
      deltaApyBps,
      estimatedNetGainUsdc: estimatedNetGain,
      feeCostUsdc: feeAmount,
      netGainAfterFeeUsdc: estimatedNetGain - feeAmount,
      reasoning: `Net gain (${estimatedNetGain.toFixed(6)} USDC) does not exceed fee (${feeAmount} USDC). Skipping rebalance.`,
      promptVersion: reflexionMemory.version,
    };
  }

  return {
    shouldRebalance: raw.shouldRebalance ?? false,
    targetProtocol: raw.targetProtocol ?? null,
    currentApyBps: user.currentApy,
    targetApyBps: raw.targetProtocol ? bestYield.supplyApyBps : user.currentApy,
    deltaApyBps: raw.deltaApyBps ?? deltaApyBps,
    estimatedNetGainUsdc: raw.estimatedNetGainUsdc ?? estimatedNetGain,
    feeCostUsdc: feeAmount,
    netGainAfterFeeUsdc: (raw.estimatedNetGainUsdc ?? estimatedNetGain) - feeAmount,
    reasoning: raw.reasoning ?? 'No reasoning provided.',
    promptVersion: reflexionMemory.version,
  };
}
```

### 7.3 Execution Agent

**File:** `src/agents/executor.ts`

**Responsibility:** Execute the rebalance via Circle Wallets SDK. Charge user the $0.005 nanopayment fee only if execution succeeds.

```typescript
// src/agents/executor.ts
import { CircleWalletsClient } from '../lib/circle/wallets';
import { nanopaymentClient } from '../lib/circle/nanopayments';
import { OptimizerDecision, ExecutionResult, User } from '../types';

export async function runExecutionAgent(
  decision: OptimizerDecision,
  user: User,
  cycleId: string
): Promise<ExecutionResult> {
  if (!decision.shouldRebalance || !decision.targetProtocol) {
    return {
      executed: false,
      fromProtocol: user.currentProtocol,
      toProtocol: user.currentProtocol,
      amountUsdc: user.depositAmountUsdc,
      arcTxHash: null,
      feeChargedTxHash: null,
      actualGasCost: 0,
      timestampMs: Date.now(),
    };
  }

  // Step 1: Withdraw from current protocol via Circle Wallets
  const withdrawTxHash = await CircleWalletsClient.executeContractTransaction({
    walletId: user.walletId,
    contractAddress: getProtocolAddress(user.currentProtocol),
    abiFunctionSignature: 'withdraw(uint256,address,address)',
    abiParameters: [user.depositAmountUsdc * 1e6, user.walletAddress, user.walletAddress],
  });

  // Step 2: Deposit into target protocol
  const depositTxHash = await CircleWalletsClient.executeContractTransaction({
    walletId: user.walletId,
    contractAddress: getProtocolAddress(decision.targetProtocol),
    abiFunctionSignature: 'supply(address,uint256,address,uint16)',
    abiParameters: [USDC_ADDRESS, user.depositAmountUsdc * 1e6, user.walletAddress, 0],
  });

  // Step 3: Charge user $0.005 USDC fee via Circle Nanopayment (ONLY on success)
  const feeChargedTxHash = await nanopaymentClient.transfer({
    fromWalletId: user.walletId,
    toAddress: process.env.AGENT_FEE_RECIPIENT_ADDRESS!,
    amountUsdc: parseFloat(process.env.REBALANCE_FEE_USDC!),
    memo: `YieldAgent rebalance fee - cycle ${cycleId}`,
  });

  return {
    executed: true,
    fromProtocol: user.currentProtocol,
    toProtocol: decision.targetProtocol,
    amountUsdc: user.depositAmountUsdc,
    arcTxHash: depositTxHash,
    feeChargedTxHash,
    actualGasCost: 0,  // Gas-free via Circle Nanopayments
    timestampMs: Date.now(),
  };
}

function getProtocolAddress(protocol: string): `0x${string}` {
  const addresses: Record<string, `0x${string}`> = {
    aave: process.env.AAVE_POOL_ADDRESS as `0x${string}`,
    morpho: process.env.MORPHO_POOL_ADDRESS as `0x${string}`,
    moonwell: process.env.MOONWELL_POOL_ADDRESS as `0x${string}`,
  };
  return addresses[protocol];
}

const USDC_ADDRESS = process.env.USDC_CONTRACT_ADDRESS as `0x${string}`;
```

### 7.4 Reflexion Agent

**File:** `src/agents/reflexion.ts`

**Model:** `gemini-3-pro-preview`

**Responsibility:** Runs asynchronously after each cycle. Reviews the outcome, writes a critique, and generates an improved Optimizer system prompt. Updates `reflexionMemory` in the DB.

```typescript
// src/agents/reflexion.ts
import { GoogleGenAI } from '@google/genai';
import { AgentCycle, ReflexionMemory } from '../types';
import { getReflexionMemory, updateReflexionMemory, getRecentCycles } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function runReflexionAgent(completedCycle: AgentCycle): Promise<void> {
  const recentCycles = await getRecentCycles(10);  // Last 10 cycles for context
  const currentMemory = await getReflexionMemory();

  const performanceData = recentCycles.map(c => ({
    decision: c.optimizerDecision,
    executed: c.executionResult?.executed,
    actualApyImprovement: c.executionResult?.executed 
      ? (c.optimizerDecision?.deltaApyBps ?? 0) 
      : 0,
    feeChargedUsdc: c.userFeeChargedUsdc,
    netGainActual: c.executionResult?.executed 
      ? (c.optimizerDecision?.estimatedNetGainUsdc ?? 0) - c.userFeeChargedUsdc 
      : 0,
  }));

  const reflexionPrompt = `
You are a self-improving AI agent reviewer. Analyze the following recent performance data for a DeFi yield optimizer agent and improve its system prompt.

## Recent Performance (last ${recentCycles.length} cycles):
${JSON.stringify(performanceData, null, 2)}

## Current Optimizer System Prompt:
${currentMemory.improvedSystemPrompt}

## Current Prompt Version: ${currentMemory.version}

## Your Task:
1. CRITIQUE: Identify specific decision patterns that were suboptimal. Were there unnecessary rebalances? Missed opportunities? Overly conservative skips?
2. DIAGNOSE: What did the prompt cause the optimizer to miss or get wrong?
3. IMPROVE: Write an improved version of the optimizer system prompt that corrects these issues. Keep all CRITICAL RULE blocks. Only refine the judgment guidance.

Return JSON:
{
  "critique": "specific analysis of what went wrong or right",
  "improvedSystemPrompt": "the full improved system prompt text",
  "performanceMetrics": {
    "avgDeltaApyBpsAchieved": number,
    "falseRebalanceRate": number,
    "feeToValueRatio": number
  }
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ role: 'user', parts: [{ text: reflexionPrompt }] }],
    config: { responseMimeType: 'application/json' },
  });

  const result = JSON.parse(response.text ?? '{}');

  await updateReflexionMemory({
    version: currentMemory.version + 1,
    critique: result.critique,
    improvedSystemPrompt: result.improvedSystemPrompt,
    performanceMetrics: result.performanceMetrics,
    updatedAt: new Date().toISOString(),
  });
}
```

---

## 8. Smart Contracts

### 8.1 ERC-8004 Identity Registry (Vyper)

**File:** `contracts/IdentityRegistry.vy`

Deploy three minimal ERC-8004 registries for agent identities. The hackathon provides a reference Vyper implementation — adapt it:

```vyper
# contracts/IdentityRegistry.vy
# ERC-8004 Identity Registry — registers AI agents with on-chain identity

# @version ^0.4.0

# Events
event AgentRegistered:
    agent_id: indexed(uint256)
    agent_address: indexed(address)
    agent_type: String[32]
    metadata_uri: String[256]

event AgentUpdated:
    agent_id: indexed(uint256)
    agent_address: indexed(address)

# Agent identity struct
struct AgentIdentity:
    agent_address: address
    agent_type: String[32]      # "scanner", "optimizer", "executor", "reflexion"
    metadata_uri: String[256]   # IPFS URI or inline JSON descriptor
    reputation_score: uint256   # Updated by ReputationRegistry
    registered_at: uint256
    is_active: bool

# State
owner: public(address)
agent_count: public(uint256)
agents: public(HashMap[uint256, AgentIdentity])
address_to_id: public(HashMap[address, uint256])

@deploy
def __init__():
    self.owner = msg.sender
    self.agent_count = 0

@external
def register_agent(agent_address: address, agent_type: String[32], metadata_uri: String[256]) -> uint256:
    assert msg.sender == self.owner, "Only owner can register agents"
    assert self.address_to_id[agent_address] == 0, "Agent already registered"
    
    self.agent_count += 1
    agent_id: uint256 = self.agent_count
    
    self.agents[agent_id] = AgentIdentity({
        agent_address: agent_address,
        agent_type: agent_type,
        metadata_uri: metadata_uri,
        reputation_score: 0,
        registered_at: block.timestamp,
        is_active: True
    })
    self.address_to_id[agent_address] = agent_id
    
    log AgentRegistered(agent_id, agent_address, agent_type, metadata_uri)
    return agent_id

@external
def update_reputation(agent_id: uint256, new_score: uint256):
    assert msg.sender == self.owner, "Only owner"
    self.agents[agent_id].reputation_score = new_score

@view
@external
def get_agent(agent_id: uint256) -> AgentIdentity:
    return self.agents[agent_id]

@view
@external  
def get_agent_by_address(agent_address: address) -> AgentIdentity:
    agent_id: uint256 = self.address_to_id[agent_address]
    return self.agents[agent_id]
```

### 8.2 Deployment Script

**File:** `contracts/deploy.ts`

```typescript
// contracts/deploy.ts
import { createWalletClient, createPublicClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';

const arcTestnet = {
  id: parseInt(process.env.ARC_CHAIN_ID!),
  name: 'Arc Testnet',
  rpcUrls: { default: { http: [process.env.ARC_RPC_URL!] } },
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
};

async function deploy() {
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
  
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet as any,
    transport: http(process.env.ARC_RPC_URL),
  });

  // Load compiled Vyper ABI and bytecode (compile with vyper CLI first)
  const identityArtifact = JSON.parse(fs.readFileSync('./contracts/out/IdentityRegistry.json', 'utf8'));
  
  // Deploy IdentityRegistry
  const identityTxHash = await walletClient.deployContract({
    abi: identityArtifact.abi,
    bytecode: identityArtifact.bytecode,
  });

  console.log('IdentityRegistry deployed at tx:', identityTxHash);
  
  // Register the four agents after deployment
  // (repeat pattern for ReputationRegistry and ValidationRegistry)
}

deploy().catch(console.error);
```

---

## 9. API Routes

### 9.1 `POST /api/wallet/create`

```typescript
// src/app/api/wallet/create/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';
import { v4 as uuidv4 } from 'uuid';
import { createUser } from '../../../lib/db';

const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export async function POST(req: NextRequest) {
  const { riskTolerance } = await req.json();

  // Create Circle user
  const userId = uuidv4();
  await circleClient.createUser({ userId });

  // Create user token (required before wallet creation)
  const tokenResponse = await circleClient.createUserToken({ userId });

  // Create wallet set
  const walletResponse = await circleClient.createUserWallet({
    idempotencyKey: uuidv4(),
    userId,
    blockchains: ['ARC-TESTNET'],  // Confirm chain identifier from Circle docs
  });

  const wallet = walletResponse.data?.wallets?.[0];
  
  // Store in local DB
  const user = await createUser({
    id: uuidv4(),
    circleUserId: userId,
    walletId: wallet?.id ?? '',
    walletAddress: wallet?.address as `0x${string}` ?? '0x',
    depositAmountUsdc: 0,
    currentProtocol: 'idle',
    currentApy: 0,
    riskTolerance,
    agentActive: false,
  });

  return NextResponse.json({
    userId: user.id,
    walletAddress: wallet?.address,
    userToken: tokenResponse.data?.userToken,  // Return to client for PIN setup
    encryptionKey: tokenResponse.data?.encryptionKey,
  });
}
```

### 9.2 `POST /api/agent/cycle`

This is the core demo endpoint — triggers one full agent cycle manually.

```typescript
// src/app/api/agent/cycle/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runAgentCycle } from '../../../agents/orchestrator';
import { getUser } from '../../../lib/db';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  const user = await getUser(userId);
  
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Run cycle asynchronously, return cycle ID immediately for polling
  const cycleId = await runAgentCycle(user);

  return NextResponse.json({ cycleId, status: 'started' });
}
```

### 9.3 `GET /api/transactions`

Returns the full nanopayment transaction log for display in the Live Feed component.

```typescript
// src/app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAllPayments, getAllCycles } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const [payments, cycles] = await Promise.all([
    getAllPayments(),
    getAllCycles(),
  ]);

  return NextResponse.json({
    payments: payments.sort((a, b) => 
      new Date(b.settledAt ?? 0).getTime() - new Date(a.settledAt ?? 0).getTime()
    ),
    totalPaymentCount: payments.length,
    totalUsdcFlowed: payments.reduce((sum, p) => sum + p.amountUsdc, 0),
    cycleCount: cycles.length,
    rebalanceCount: cycles.filter(c => c.executionResult?.executed).length,
  });
}
```

---

## 10. Frontend Pages & Components

### 10.1 Main Dashboard Page

**File:** `src/app/dashboard/page.tsx`

```typescript
// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { AgentStatusCard } from '../../components/dashboard/AgentStatusCard';
import { LiveTransactionFeed } from '../../components/dashboard/LiveTransactionFeed';
import { PaymentFlowDiagram } from '../../components/dashboard/PaymentFlowDiagram';
import { YieldMetricsPanel } from '../../components/dashboard/YieldMetricsPanel';
import { useAgentStatus } from '../../hooks/useAgentStatus';
import { useTransactions } from '../../hooks/useTransactions';

export default function Dashboard() {
  const { status, triggerCycle, isRunning } = useAgentStatus();
  const { transactions, stats } = useTransactions();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header with live counter */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">YieldAgent</h1>
          <p className="text-gray-400 text-sm">Autonomous DeFi yield optimizer</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-green-400">
            {stats.totalPaymentCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">nanopayments settled on Arc</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentFlowDiagram currentPhase={status?.phase} />
          <YieldMetricsPanel status={status} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <AgentStatusCard 
            status={status}
            isRunning={isRunning}
            onTriggerCycle={triggerCycle}
          />
          <LiveTransactionFeed transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
```

### 10.2 Payment Flow Diagram Component

This is the key visual for judges — a live animated flow showing agent-to-agent nanopayments.

```typescript
// src/components/dashboard/PaymentFlowDiagram.tsx
'use client';

import { useEffect, useState } from 'react';

type Phase = 'scanning' | 'optimizing' | 'executing' | 'reflecting' | 'idle' | 'skipped';

interface PaymentFlowDiagramProps {
  currentPhase?: Phase;
}

const nodes = [
  { id: 'user', label: 'User Wallet', sublabel: 'USDC deposited', x: 50, y: 50 },
  { id: 'scanner', label: 'Scanner Agent', sublabel: 'Gemini Flash', x: 250, y: 20 },
  { id: 'aave', label: 'Aave API', sublabel: '$0.001 USDC', x: 450, y: 5 },
  { id: 'morpho', label: 'Morpho API', sublabel: '$0.001 USDC', x: 450, y: 50 },
  { id: 'moonwell', label: 'Moonwell API', sublabel: '$0.001 USDC', x: 450, y: 95 },
  { id: 'optimizer', label: 'Optimizer Agent', sublabel: 'Gemini Pro', x: 250, y: 80 },
  { id: 'executor', label: 'Execution Agent', sublabel: '$0.005 fee', x: 50, y: 120 },
  { id: 'reflexion', label: 'Reflexion Agent', sublabel: 'Self-improving', x: 250, y: 140 },
];

const phaseActiveNodes: Record<Phase, string[]> = {
  scanning: ['scanner', 'aave', 'morpho', 'moonwell'],
  optimizing: ['optimizer'],
  executing: ['executor', 'user'],
  reflecting: ['reflexion', 'optimizer'],
  idle: [],
  skipped: ['optimizer'],
};

export function PaymentFlowDiagram({ currentPhase = 'idle' }: PaymentFlowDiagramProps) {
  const activeNodes = phaseActiveNodes[currentPhase] ?? [];

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
        Agent Payment Flow — Live
      </h2>
      <div className="relative h-48 w-full">
        {/* SVG-based flow visualization */}
        <svg viewBox="0 0 500 160" className="w-full h-full">
          {/* Edges (draw before nodes) */}
          <line x1="70" y1="50" x2="230" y2="35" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <line x1="270" y1="25" x2="430" y2="10" stroke={activeNodes.includes('aave') ? '#10b981' : '#374151'} strokeWidth={activeNodes.includes('aave') ? 2 : 1} />
          <line x1="270" y1="30" x2="430" y2="50" stroke={activeNodes.includes('morpho') ? '#10b981' : '#374151'} strokeWidth={activeNodes.includes('morpho') ? 2 : 1} />
          <line x1="270" y1="40" x2="430" y2="95" stroke={activeNodes.includes('moonwell') ? '#10b981' : '#374151'} strokeWidth={activeNodes.includes('moonwell') ? 2 : 1} />
          <line x1="250" y1="40" x2="250" y2="70" stroke={activeNodes.includes('optimizer') ? '#6366f1' : '#374151'} strokeWidth={activeNodes.includes('optimizer') ? 2 : 1} />
          <line x1="230" y1="90" x2="70" y2="115" stroke={activeNodes.includes('executor') ? '#f59e0b' : '#374151'} strokeWidth={activeNodes.includes('executor') ? 2 : 1} />
          <line x1="250" y1="100" x2="250" y2="130" stroke={activeNodes.includes('reflexion') ? '#8b5cf6' : '#374151'} strokeWidth={activeNodes.includes('reflexion') ? 2 : 1} />

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <rect
                x={node.x - 35} y={node.y - 12}
                width="70" height="24"
                rx="4"
                fill={activeNodes.includes(node.id) ? '#1e293b' : '#111827'}
                stroke={activeNodes.includes(node.id) ? '#10b981' : '#374151'}
                strokeWidth={activeNodes.includes(node.id) ? 1.5 : 1}
              />
              <text x={node.x} y={node.y + 1} textAnchor="middle" fill={activeNodes.includes(node.id) ? '#e2e8f0' : '#6b7280'} fontSize="7" fontWeight="500">
                {node.label}
              </text>
              <text x={node.x} y={node.y + 9} textAnchor="middle" fill="#4ade80" fontSize="5.5">
                {node.sublabel}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 text-center">
        <span className={`text-xs font-mono px-2 py-1 rounded ${
          currentPhase === 'idle' ? 'bg-gray-800 text-gray-500' :
          currentPhase === 'skipped' ? 'bg-yellow-900/30 text-yellow-400' :
          'bg-green-900/30 text-green-400'
        }`}>
          {currentPhase === 'idle' ? '● IDLE — waiting for next cycle' :
           currentPhase === 'skipped' ? '⊘ REBALANCE SKIPPED — net gain below fee threshold' :
           `● ACTIVE — ${currentPhase.toUpperCase()}`}
        </span>
      </div>
    </div>
  );
}
```

### 10.3 Live Transaction Feed Component

```typescript
// src/components/dashboard/LiveTransactionFeed.tsx
'use client';

import { NanopaymentRecord } from '../../types';

interface LiveTransactionFeedProps {
  transactions: NanopaymentRecord[];
}

const purposeColors = {
  yield_query: 'text-blue-400',
  rebalance_fee: 'text-amber-400',
};

const purposeLabels = {
  yield_query: 'Yield query',
  rebalance_fee: 'Rebalance fee',
};

export function LiveTransactionFeed({ transactions }: LiveTransactionFeedProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
        Live Nanopayments
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {transactions.slice(0, 50).map(tx => (
          <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
            <div>
              <span className={`text-xs font-medium ${purposeColors[tx.purpose]}`}>
                {purposeLabels[tx.purpose]}
              </span>
              <div className="text-xs text-gray-600 font-mono mt-0.5">
                {tx.arcTxHash ? `${tx.arcTxHash.slice(0, 6)}...${tx.arcTxHash.slice(-4)}` : 'pending'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-400 font-mono">
                ${tx.amountUsdc.toFixed(4)} USDC
              </span>
              <div className="text-xs text-gray-600">
                {tx.settledAt ? new Date(tx.settledAt).toLocaleTimeString() : '...'}
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            No transactions yet. Start the agent to begin.
          </p>
        )}
      </div>
    </div>
  );
}
```

### 10.4 Agent Status Card

```typescript
// src/components/dashboard/AgentStatusCard.tsx
'use client';

interface AgentStatusCardProps {
  status: any;
  isRunning: boolean;
  onTriggerCycle: () => void;
}

export function AgentStatusCard({ status, isRunning, onTriggerCycle }: AgentStatusCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
        Agent Status
      </h2>
      
      {/* Current APY comparison */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Current APY</div>
          <div className="text-xl font-bold text-white">
            {((status?.currentApy ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Best Available</div>
          <div className="text-xl font-bold text-green-400">
            {((status?.bestAvailableApy ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Fee-to-value ratio */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Fee-to-Value Ratio</span>
          <span className="text-sm font-mono text-amber-400">
            {status?.feeToValueRatio ? `${(status.feeToValueRatio * 100).toFixed(1)}%` : '--'}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Lower = more value delivered per fee charged
        </div>
      </div>

      {/* Reflexion version */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Reflexion Version</span>
          <span className="text-sm font-mono text-purple-400">
            v{status?.promptVersion ?? 0}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-1 italic line-clamp-2">
          {status?.lastCritique ?? 'No critique yet'}
        </div>
      </div>

      {/* Trigger button */}
      <button
        onClick={onTriggerCycle}
        disabled={isRunning}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
          isRunning 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-500 text-white'
        }`}
      >
        {isRunning ? '⟳ Agent running...' : '▶ Trigger Cycle Now'}
      </button>
    </div>
  );
}
```

---

## 11. Fee Model & Incentive Logic

### The Net-Gain Guard (Core Business Logic)

This is the most important business logic in the entire system. It MUST be enforced server-side in the Orchestrator, independent of the LLM output.

```typescript
// src/lib/feeGuard.ts

export interface FeeGuardResult {
  shouldExecute: boolean;
  netGainUsdc: number;
  feeUsdc: number;
  netGainAfterFeeUsdc: number;
  reason: string;
}

export function evaluateFeeGuard(
  currentApyBps: number,
  targetApyBps: number,
  depositUsdc: number,
  cycleIntervalMs: number,
  feeUsdc: number = 0.005
): FeeGuardResult {
  const deltaApyBps = targetApyBps - currentApyBps;
  
  // If target is worse or equal, never execute
  if (deltaApyBps <= 0) {
    return {
      shouldExecute: false,
      netGainUsdc: 0,
      feeUsdc,
      netGainAfterFeeUsdc: -feeUsdc,
      reason: 'Target APY is not better than current allocation.',
    };
  }

  // Calculate how much extra yield this rebalance earns before next cycle
  const cycleYears = cycleIntervalMs / (1000 * 60 * 60 * 24 * 365);
  const netGainUsdc = (deltaApyBps / 10000) * depositUsdc * cycleYears;
  const netGainAfterFeeUsdc = netGainUsdc - feeUsdc;

  if (netGainAfterFeeUsdc <= 0) {
    return {
      shouldExecute: false,
      netGainUsdc,
      feeUsdc,
      netGainAfterFeeUsdc,
      reason: `Net gain ($${netGainUsdc.toFixed(6)} USDC) does not exceed fee ($${feeUsdc} USDC). Not worth rebalancing.`,
    };
  }

  return {
    shouldExecute: true,
    netGainUsdc,
    feeUsdc,
    netGainAfterFeeUsdc,
    reason: `Expected net gain after fee: $${netGainAfterFeeUsdc.toFixed(6)} USDC. Rebalance is justified.`,
  };
}
```

### Minimum Deposit Threshold

For the fee model to be viable, calculate the minimum deposit at which any rebalance ever makes sense:

```typescript
// A 25bps delta over a 30min cycle:
// netGain = (0.0025) * deposit * (0.5/8760)
// For netGain > $0.005:
// deposit > 0.005 / (0.0025 * 0.5 / 8760) = $35,040

// Implication: enforce a minimum deposit of $100 in the UI
// and set minimum delta threshold high enough (e.g., 100bps+) 
// for small deposits to ensure rebalances are always worth it.
export const MIN_DEPOSIT_USDC = 100;
export const MIN_REBALANCE_DELTA_BPS_BY_DEPOSIT: Record<string, number> = {
  'small':  200,  // < $500: need 2%+ delta to justify
  'medium': 50,   // $500-$5000: 0.5%+ delta
  'large':  15,   // > $5000: 0.15%+ delta
};
```

---

## 12. Agent Cycle Orchestration

**File:** `src/agents/orchestrator.ts`

```typescript
// src/agents/orchestrator.ts
import { v4 as uuidv4 } from 'uuid';
import { runScannerAgent } from './scanner';
import { runOptimizerAgent } from './optimizer';
import { runExecutionAgent } from './executor';
import { runReflexionAgent } from './reflexion';
import { evaluateFeeGuard } from '../lib/feeGuard';
import { getUser, saveCycle, updateUserProtocol } from '../lib/db';
import { User, AgentCycle } from '../types';

// In-memory active cycles map
const activeCycles = new Map<string, boolean>();

export async function runAgentCycle(user: User): Promise<string> {
  const cycleId = uuidv4();
  
  if (activeCycles.get(user.id)) {
    throw new Error('Cycle already in progress for this user');
  }
  activeCycles.set(user.id, true);

  const cycle: AgentCycle = {
    id: cycleId,
    userId: user.id,
    startedAt: new Date().toISOString(),
    phase: 'scanning',
    scanResults: [],
    optimizerDecision: null,
    executionResult: null,
    reflexionCritique: null,
    totalFeePaidUsdc: 0,
    userFeeChargedUsdc: 0,
  };

  try {
    // PHASE 1: SCAN
    await saveCycle({ ...cycle, phase: 'scanning' });
    const scanResults = await runScannerAgent(cycleId);
    cycle.scanResults = scanResults;
    cycle.totalFeePaidUsdc = scanResults.reduce((s, r) => s + r.queryCostUsdc, 0);

    // PHASE 2: OPTIMIZE
    cycle.phase = 'optimizing';
    await saveCycle(cycle);
    const decision = await runOptimizerAgent(scanResults, user, cycleId);
    cycle.optimizerDecision = decision;

    // Server-side fee guard (belt-and-suspenders over LLM decision)
    const bestYield = scanResults.reduce((best, p) => p.supplyApyBps > best.supplyApyBps ? p : best);
    const guardResult = evaluateFeeGuard(
      user.currentApy,
      bestYield.supplyApyBps,
      user.depositAmountUsdc,
      parseInt(process.env.AGENT_CYCLE_INTERVAL_MS!),
    );

    // Override LLM if guard says no
    if (!guardResult.shouldExecute) {
      decision.shouldRebalance = false;
      decision.reasoning = guardResult.reason;
      cycle.phase = 'skipped';
      await saveCycle(cycle);
    } else if (decision.shouldRebalance) {
      // PHASE 3: EXECUTE
      cycle.phase = 'executing';
      await saveCycle(cycle);
      const result = await runExecutionAgent(decision, user, cycleId);
      cycle.executionResult = result;
      cycle.userFeeChargedUsdc = result.executed ? parseFloat(process.env.REBALANCE_FEE_USDC!) : 0;
      
      if (result.executed && decision.targetProtocol) {
        await updateUserProtocol(user.id, decision.targetProtocol, decision.targetApyBps);
      }
    }

    // PHASE 4: REFLECT (async, don't await — runs in background)
    cycle.phase = 'reflecting';
    cycle.completedAt = new Date().toISOString();
    await saveCycle(cycle);
    
    // Fire-and-forget reflexion (non-blocking for demo responsiveness)
    runReflexionAgent(cycle).then(async () => {
      cycle.phase = 'idle';
      await saveCycle(cycle);
    });

  } catch (error) {
    cycle.phase = 'idle';
    cycle.completedAt = new Date().toISOString();
    await saveCycle(cycle);
    console.error('Agent cycle error:', error);
  } finally {
    activeCycles.delete(user.id);
  }

  return cycleId;
}

// Auto-cycle runner for production use
export function startAutoCycle(userId: string, intervalMs: number) {
  return setInterval(async () => {
    const user = await getUser(userId);
    if (user?.agentActive) {
      await runAgentCycle(user);
    }
  }, intervalMs);
}
```

---

## 13. x402 Nanopayment Integration

**File:** `src/lib/x402/client.ts`

The x402 protocol works by: (1) client requests a paid endpoint, (2) server returns HTTP 402 with payment details, (3) client signs an EIP-3009 authorization, (4) client retries with the authorization header, (5) server settles via Circle Gateway.

```typescript
// src/lib/x402/client.ts
import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

// Use Circle's Gateway as the nanopayment facilitator
// The x402 flow is:
// 1. POST to protected endpoint
// 2. Receive 402 with { x402Version, accepts: [{ scheme, network, maxAmountRequired, paymentAddress }] }
// 3. Sign EIP-3009 TransferWithAuthorization offchain
// 4. Retry request with X-PAYMENT header containing the signed authorization
// 5. Circle Gateway batches and settles onchain

interface X402PaymentConfig {
  amount: string;    // USDC amount as string e.g. "0.001"
  toAddress: string;
  description: string;
}

interface X402Client {
  pay: (config: X402PaymentConfig) => Promise<string>;  // Returns tx hash or receipt
  createPaymentHeader: (config: X402PaymentConfig) => Promise<string>;
}

export const x402Client: X402Client = {
  async pay(config: X402PaymentConfig): Promise<string> {
    // In a full implementation, this uses the Circle Gateway client
    // Pattern from lablab.ai tutorial: buyers use GatewayClient.pay()
    // which intercepts 402 responses and auto-signs EIP-3009 authorizations

    // For hackathon: directly call Circle Gateway settlement API
    const response = await axios.post(
      `${process.env.CIRCLE_GATEWAY_FACILITATOR_URL}/settle`,
      {
        payTo: config.toAddress,
        amount: config.amount,
        currency: 'USDC',
        network: 'ARC-TESTNET',
        memo: config.description,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data?.txHash ?? 'pending';
  },

  async createPaymentHeader(config: X402PaymentConfig): Promise<string> {
    // EIP-3009 TransferWithAuthorization signing
    // Used when calling x402-protected endpoints directly
    const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
    
    const domain = {
      name: 'USD Coin',
      version: '2',
      chainId: parseInt(process.env.ARC_CHAIN_ID!),
      verifyingContract: process.env.USDC_CONTRACT_ADDRESS as `0x${string}`,
    };

    const types = {
      TransferWithAuthorization: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'validAfter', type: 'uint256' },
        { name: 'validBefore', type: 'uint256' },
        { name: 'nonce', type: 'bytes32' },
      ],
    };

    // Sign the transfer authorization
    const walletClient = createWalletClient({
      account,
      transport: http(process.env.ARC_RPC_URL),
    });

    // Return as base64 header
    return btoa(JSON.stringify({ from: account.address, to: config.toAddress, value: config.amount }));
  },
};
```

---

## 14. Circle Wallets Integration

**File:** `src/lib/circle/wallets.ts`

```typescript
// src/lib/circle/wallets.ts
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY!,
});

export const CircleWalletsClient = {
  async createUser(userId: string) {
    return client.createUser({ userId });
  },

  async createUserToken(userId: string) {
    return client.createUserToken({ userId });
  },

  async createWallet(userId: string) {
    return client.createUserWallet({
      idempotencyKey: crypto.randomUUID(),
      userId,
      blockchains: ['ARC-TESTNET'],
    });
  },

  async getWalletBalance(walletId: string) {
    return client.getWalletTokenBalance({ walletId });
  },

  async executeContractTransaction(params: {
    walletId: string;
    contractAddress: `0x${string}`;
    abiFunctionSignature: string;
    abiParameters: (string | number)[];
  }) {
    const response = await client.createTransaction({
      walletId: params.walletId,
      amounts: ['0'],   // Token amounts handled in contract call
      destinationAddress: params.contractAddress,
      contractAbi: [{
        name: params.abiFunctionSignature.split('(')[0],
        type: 'function',
        inputs: [],  // Parse from signature in production
        outputs: [],
        stateMutability: 'nonpayable',
      }],
      callData: params.abiFunctionSignature,
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    });
    return response.data?.transaction?.txHash ?? null;
  },
};
```

---

## 15. Yield Data Sources

### 15.1 Aave V3 (Base)

```typescript
// src/lib/protocols/aave.ts
import { ProtocolYield } from '../../types';

// Aave V3 has a React SDK (@aave/react) and REST data endpoints
// For hackathon, use the Aave UI data provider or Aavescan API

export async function fetchAaveYield(): Promise<ProtocolYield> {
  // Option A: Aave UI data API (public, no auth)
  const response = await fetch(
    'https://aave-api-v2.aave.com/data/markets-data',
    { next: { revalidate: 300 } }  // Cache 5 mins
  );
  const data = await response.json();
  
  // Find Base USDC market
  const baseMarket = data.reserves?.find(
    (r: any) => r.symbol === 'USDC' && r.underlyingAsset?.toLowerCase() === process.env.USDC_ADDRESS_BASE?.toLowerCase()
  );

  return {
    protocol: 'aave',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps: Math.round((baseMarket?.liquidityRate ?? 0) * 10000),
    tvlUsd: parseFloat(baseMarket?.totalLiquidityUSD ?? '0'),
    utilizationRate: parseFloat(baseMarket?.utilizationRate ?? '0'),
    queryCostUsdc: 0,  // Set by scanner after x402 payment
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
```

### 15.2 Morpho Blue (Base)

```typescript
// src/lib/protocols/morpho.ts
import { ProtocolYield } from '../../types';

const MORPHO_GRAPHQL = 'https://blue-api.morpho.org/graphql';

const USDC_VAULT_QUERY = `
query {
  vaultV2ByAddress(
    address: "0xd4468EF3745c315949a97090eD27b3F73b9b7C02"  
    chainId: 8453
  ) {
    type
    apy
    avgNetApy
    performanceFee
    rewards {
      asset { symbol }
      supplyApr
    }
  }
}`;

export async function fetchMorphoYield(): Promise<ProtocolYield> {
  const response = await fetch(MORPHO_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: USDC_VAULT_QUERY }),
    next: { revalidate: 300 },
  });
  
  const { data } = await response.json();
  const vault = data?.vaultV2ByAddress;
  const apyBps = Math.round((vault?.avgNetApy ?? 0) * 10000);

  return {
    protocol: 'morpho',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps: apyBps,
    tvlUsd: 0,  // Fetch separately if needed
    utilizationRate: 0,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
```

### 15.3 Moonwell (Base)

```typescript
// src/lib/protocols/moonwell.ts
import { ProtocolYield } from '../../types';

// Moonwell yield backend: https://github.com/moonwell-fi/yield-backend
// Returns JSON with baseSupplyApy per market

export async function fetchMoonwellYield(): Promise<ProtocolYield> {
  const response = await fetch('https://yield.moonwell.fi/', {
    next: { revalidate: 300 },
  });
  const data = await response.json();

  // Find USDC market on Base
  const usdcMarket = Object.values(data.markets ?? {}).find(
    (m: any) => m.underlyingToken?.symbol === 'USDC'
  ) as any;

  return {
    protocol: 'moonwell',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps: Math.round((usdcMarket?.baseSupplyApy ?? 0) * 10000),
    tvlUsd: parseFloat(usdcMarket?.totalSupplyUsd ?? '0'),
    utilizationRate: 0,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
```

---

## 16. Reflexion Self-Improvement Loop

The Reflexion Agent runs after every completed cycle and writes a new version of the Optimizer's system prompt. Key behaviors:

- **Tracks**: rebalances triggered vs. actual yield improvement achieved; fee-to-value ratio; false positives (rebalanced when APY didn't actually improve post-execution)
- **Improves**: threshold calibration in the system prompt, protocol preference weighting, risk-tolerance nuance
- **Guards**: never removes the hardcoded net-gain CRITICAL RULE block from the prompt
- **Version control**: prompt version is stored in DB and surfaced on the UI as "Reflexion v{N}"

The Reflexion output feeds directly into the next Optimizer Agent call via `getReflexionMemory()` in `src/agents/optimizer.ts`.

---

## 17. ERC-8004 Agent Identity

Each of the four agents gets a registered on-chain identity via the `IdentityRegistry.vy` contract deployed on Arc Testnet.

**Registration** (run once during `scripts/seed-testnet.ts`):

```typescript
// scripts/seed-testnet.ts
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import identityRegistryAbi from '../contracts/out/IdentityRegistry.abi.json';

const agents = [
  { address: process.env.SCANNER_AGENT_ADDRESS!, type: 'scanner', metadata: '{"model":"gemini-3-flash-preview","role":"yield_scanner"}' },
  { address: process.env.OPTIMIZER_AGENT_ADDRESS!, type: 'optimizer', metadata: '{"model":"gemini-3-pro-preview","role":"yield_optimizer"}' },
  { address: process.env.EXECUTOR_AGENT_ADDRESS!, type: 'executor', metadata: '{"role":"transaction_executor"}' },
  { address: process.env.REFLEXION_AGENT_ADDRESS!, type: 'reflexion', metadata: '{"model":"gemini-3-pro-preview","role":"self_improvement"}' },
];

async function registerAgents() {
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
  const walletClient = createWalletClient({ account, transport: http(process.env.ARC_RPC_URL) });

  for (const agent of agents) {
    const hash = await walletClient.writeContract({
      address: process.env.IDENTITY_REGISTRY_ADDRESS as `0x${string}`,
      abi: identityRegistryAbi,
      functionName: 'register_agent',
      args: [agent.address, agent.type, agent.metadata],
    });
    console.log(`Registered ${agent.type} agent:`, hash);
  }
}

registerAgents();
```

---

## 18. Demo & Hackathon Requirements

### Mandatory Requirements Checklist

| Requirement | How YieldAgent Satisfies It | Implementation Location |
|---|---|---|
| ≤$0.01 per-action pricing | $0.001 per query, $0.005 per rebalance | `feeGuard.ts`, `executor.ts` |
| 50+ on-chain transactions | 3 queries/cycle × 30-min intervals = 144+/day | `scanner.ts` x402 payments |
| Margin explanation | Gas comparison baked into onboarding page | `app/page.tsx` |
| Working demo video | Live cycle trigger on dashboard | `dashboard/page.tsx` |

### Demo Script (For Video Recording)

1. **Open dashboard** → show "0 nanopayments" counter at top right
2. **Click "Trigger Cycle Now"** → watch PaymentFlowDiagram animate through Scanner phase
3. **Show Live Transaction Feed** → 3 nanopayments appear ($0.001 each, to Aave/Morpho/Moonwell APIs)
4. **Optimizer phase activates** → show decision card: "Morpho: 9.2% vs Aave: 7.8% — net gain $0.0031 > fee $0.005? NO — rebalance skipped" (or YES if APY delta is large)
5. **Run 5 cycles back-to-back** → counter climbs to 15+
6. **Show Reflexion card** → "Reflexion v2 — critique: 'Optimizer was too aggressive on small deltas...'"
7. **Zoom on Arc Explorer tab** → show 15+ real transaction hashes
8. **End on counter** → "17 nanopayments, $0.017 USDC total settled gas-free on Arc"

### Margin Explanation (Required Submission Element)

Include this table in the submission long-description field:

```
Traditional ETH Gas vs. Arc Nanopayments:
┌─────────────────────────────┬──────────────┬────────────────────┐
│ Operation                   │ ETH Mainnet  │ Arc Nanopayments   │
├─────────────────────────────┼──────────────┼────────────────────┤
│ Cost per yield API query    │ $1–$10       │ $0.001             │
│ Cost per rebalance          │ $5–$50       │ $0.005             │
│ 10 queries/hour overhead    │ $10–$100     │ $0.01              │
│ Viable for <$1,000 deposit? │ ❌ Never     │ ✅ Always          │
└─────────────────────────────┴──────────────┴────────────────────┘
```

---

## 19. Error Handling & Edge Cases

### API Failures
- If any yield API fails, use cached values from previous cycle (store last-known APY per protocol in DB)
- Do NOT execute a rebalance based on stale data older than 2 cycles
- Log API failures as `NanopaymentRecord` with `arcTxHash: 'api_error'`

### Circle Wallets Errors
- If contract execution fails, abort cycle and mark `ExecutionResult.executed = false`
- Never charge user fee if execution fails
- Retry once after 5-second delay before aborting

### Low Balance Guard
- Check user wallet USDC balance before every cycle
- If balance < `depositAmountUsdc * 0.99` (slippage), skip cycle and flag account for manual review
- If agent operator wallet is below 0.01 USDC (can't cover query fees), pause all cycles

### Reflexion Failure
- If Reflexion Agent returns unparseable JSON, skip the prompt update for this cycle
- Never overwrite a valid prompt version with a failed parse
- Keep the current prompt version active; log failure silently

### First Cycle (No Current Protocol)
- If `user.currentProtocol === 'idle'`, skip the net-gain guard and deploy to the highest-APY protocol immediately on first cycle
- This is the "initial deposit routing" case — there's no switching cost

---

## 20. Build & Deployment

### Local Development

```bash
# Install dependencies
npm install

# Compile Vyper contracts (requires vyper CLI)
vyper contracts/IdentityRegistry.vy -o contracts/out/

# Run deployment script (Arc testnet)
npx ts-node scripts/seed-testnet.ts

# Register ERC-8004 agents
npx ts-node scripts/register-agents.ts

# Start development server
npm run dev
```

### Hardhat Config (for contract deployment)

```typescript
// hardhat.config.ts
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  networks: {
    arcTestnet: {
      url: process.env.ARC_RPC_URL!,
      chainId: parseInt(process.env.ARC_CHAIN_ID!),
      accounts: [process.env.AGENT_PRIVATE_KEY!],
    },
  },
};

export default config;
```

### Pre-Submission Checklist

- [ ] `CIRCLE_API_KEY` and `CIRCLE_ENTITY_SECRET` set and validated
- [ ] Arc testnet RPC URL confirmed from Circle documentation
- [ ] Agent wallets pre-funded with testnet USDC (use Circle faucet)
- [ ] ERC-8004 registries deployed and agent addresses stored in `.env.local`
- [ ] At least one full test cycle completes with real Arc transaction hashes
- [ ] Dashboard shows live transaction counter incrementing
- [ ] `scripts/seed-testnet.ts` generates 50+ transactions for demo
- [ ] Demo video recorded showing 50+ transactions in Arc Explorer
- [ ] Margin explanation table included in submission description
- [ ] Circle product feedback form completed ($500 bonus eligibility)
- [ ] README includes one-line pitch, architecture diagram, and tech stack

### Seed Script for 50+ Demo Transactions

```typescript
// scripts/seed-transactions.ts
// Run this to pre-populate the demo with 50+ real Arc transactions
// before recording the demo video

import { runAgentCycle } from '../src/agents/orchestrator';
import { createMockUser } from '../src/lib/db';

async function seedDemoTransactions() {
  const user = await createMockUser({
    depositAmountUsdc: 1000,
    riskTolerance: 'balanced',
  });
  
  // Run 20 cycles = 60+ nanopayments (3 queries + potential rebalance fee each)
  for (let i = 0; i < 20; i++) {
    console.log(`Running cycle ${i + 1}/20...`);
    await runAgentCycle(user);
    await new Promise(r => setTimeout(r, 2000));  // 2s between cycles
  }
  
  console.log('Done. Check dashboard for transaction count.');
}

seedDemoTransactions();
```
