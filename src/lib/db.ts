import fs from 'fs';
import path from 'path';
import { User, AgentCycle, NanopaymentRecord, ReflexionMemory, AppState, ProtocolYield } from '../types';

const dbPath = path.join(process.cwd(), 'data.json');

const defaultState: AppState = {
  users: {},
  cycles: [],
  payments: [],
  reflexionMemory: {
    version: 0,
    critique: '',
    improvedSystemPrompt: `You are a DeFi yield optimizer. Your ONLY goal is to maximize net user yield AFTER all fees.

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
}`,
    performanceMetrics: {
      avgDeltaApyBpsAchieved: 0,
      falseRebalanceRate: 0,
      feeToValueRatio: 0,
    },
    updatedAt: new Date().toISOString()
  },
  agentWallets: {
    scannerAddress: process.env.SCANNER_AGENT_ADDRESS || '0x',
    optimizerAddress: process.env.OPTIMIZER_AGENT_ADDRESS || '0x',
    executorAddress: process.env.EXECUTOR_AGENT_ADDRESS || '0x',
  }
};

function readDb(): AppState {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(defaultState, null, 2));
    return defaultState;
  }
  return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

function writeDb(data: AppState) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export async function createUser(user: User): Promise<User> {
  const db = readDb();
  db.users[user.id] = user;
  writeDb(db);
  return user;
}

export async function getUser(id: string): Promise<User | undefined> {
  const db = readDb();
  return db.users[id];
}

export async function updateUserProtocol(userId: string, targetProtocol: 'aave' | 'morpho' | 'moonwell', currentApy: number): Promise<void> {
  const db = readDb();
  if (db.users[userId]) {
    db.users[userId].currentProtocol = targetProtocol;
    db.users[userId].currentApy = currentApy;
    db.users[userId].updatedAt = new Date().toISOString();
    writeDb(db);
  }
}

export async function saveCycle(cycle: AgentCycle): Promise<void> {
  const db = readDb();
  const index = db.cycles.findIndex(c => c.id === cycle.id);
  if (index >= 0) {
    db.cycles[index] = cycle;
  } else {
    db.cycles.push(cycle);
  }
  writeDb(db);
}

export async function getRecentCycles(limit: number = 10): Promise<AgentCycle[]> {
  const db = readDb();
  return db.cycles.slice(-limit);
}

export async function getAllCycles(): Promise<AgentCycle[]> {
  const db = readDb();
  return db.cycles;
}

export async function getReflexionMemory(): Promise<ReflexionMemory> {
  const db = readDb();
  return db.reflexionMemory;
}

export async function updateReflexionMemory(memory: ReflexionMemory): Promise<void> {
  const db = readDb();
  db.reflexionMemory = memory;
  writeDb(db);
}

export async function recordNanopayment(payment: Omit<NanopaymentRecord, 'id' | 'settledAt'>): Promise<void> {
  const db = readDb();
  db.payments.push({
    ...payment,
    id: crypto.randomUUID(),
    settledAt: new Date().toISOString()
  });
  writeDb(db);
}

export async function getAllPayments(): Promise<NanopaymentRecord[]> {
  const db = readDb();
  return db.payments;
}

export async function createMockUser(params: { depositAmountUsdc: number, riskTolerance: 'conservative' | 'balanced' | 'aggressive' }): Promise<User> {
  const user: User = {
    id: crypto.randomUUID(),
    circleUserId: crypto.randomUUID(),
    walletId: crypto.randomUUID(),
    walletAddress: '0xmockaddress',
    depositAmountUsdc: params.depositAmountUsdc,
    currentProtocol: 'idle',
    currentApy: 0,
    riskTolerance: params.riskTolerance,
    agentActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return createUser(user);
}
