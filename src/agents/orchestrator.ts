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
    const bestYield = scanResults.reduce((best, p) => p.supplyApyBps > best.supplyApyBps ? p : best, scanResults[0]);
    const guardResult = evaluateFeeGuard(
      user.currentApy,
      bestYield.supplyApyBps,
      user.depositAmountUsdc,
      parseInt(process.env.AGENT_CYCLE_INTERVAL_MS || '1800000'),
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
      cycle.userFeeChargedUsdc = result.executed ? parseFloat(process.env.REBALANCE_FEE_USDC || '0.005') : 0;
      
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
