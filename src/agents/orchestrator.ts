import { v4 as uuidv4 } from 'uuid';
import { runMarketSentinel } from './marketSentinel';
import { runRiskAnalyst } from './riskAnalyst';
import { runStrategyArchitect } from './strategyArchitect';
import { runExecutionAgent } from './executor';
import { runPerformanceAnalyst } from './performanceAnalyst';
import { runReflexionAgent } from './reflexion';
import { evaluateFeeGuard } from '../lib/feeGuard';
import { getUser, saveCycle, updateUserProtocol } from '../lib/db';
import { User, AgentCycle, ReasoningEntry, AGENT_PROFILES } from '../types';

// In-memory state
const activeCycles = new Map<string, boolean>();
const reasoningLogs = new Map<string, ReasoningEntry[]>();

export function getReasoningLog(cycleId: string): ReasoningEntry[] {
  return reasoningLogs.get(cycleId) || [];
}

export async function runAgentCycle(user: User): Promise<string> {
  const cycleId = uuidv4();

  if (activeCycles.get(user.id)) {
    throw new Error('Cycle already in progress for this user');
  }
  activeCycles.set(user.id, true);

  const log: ReasoningEntry[] = [];
  reasoningLogs.set(cycleId, log);

  const onReasoning = (entry: ReasoningEntry) => {
    log.push(entry);
  };

  const cycle: AgentCycle = {
    id: cycleId, userId: user.id,
    startedAt: new Date().toISOString(),
    phase: 'market_sentinel',
    marketIntelligence: null, riskAssessment: null,
    strategy: null, executionResult: null,
    performanceAttribution: null, reflexionCritique: null,
    reasoningLog: [],
    scanResults: [], optimizerDecision: null,
    totalFeePaidUsdc: 0, userFeeChargedUsdc: 0,
  };

  try {
    // PHASE 1: MARKET SENTINEL
    await saveCycle({ ...cycle, phase: 'market_sentinel' });
    onReasoning({ timestamp: new Date().toISOString(), agentId: 'market_sentinel', agentName: AGENT_PROFILES.market_sentinel.name, agentIcon: AGENT_PROFILES.market_sentinel.icon, color: AGENT_PROFILES.market_sentinel.color, message: 'Market Sentinel activated — scanning yield markets...', type: 'action' });
    const intel = await runMarketSentinel(cycleId, onReasoning);
    cycle.marketIntelligence = intel;
    cycle.scanResults = intel.yields;
    cycle.totalFeePaidUsdc = intel.yields.reduce((s, r) => s + r.queryCostUsdc, 0);

    // PHASE 2: RISK ANALYST
    cycle.phase = 'risk_analyst';
    await saveCycle(cycle);
    const risk = await runRiskAnalyst(intel, cycleId, onReasoning);
    cycle.riskAssessment = risk;

    // PHASE 3: STRATEGY ARCHITECT
    cycle.phase = 'strategy_architect';
    await saveCycle(cycle);
    const strategy = await runStrategyArchitect(intel, risk, user, cycleId, onReasoning);
    cycle.strategy = strategy;

    // Build legacy-compat optimizerDecision
    cycle.optimizerDecision = {
      shouldRebalance: strategy.shouldRebalance,
      targetProtocol: strategy.targetProtocol,
      currentApyBps: user.currentApy,
      targetApyBps: strategy.blendedApyBps,
      deltaApyBps: strategy.deltaApyBps,
      estimatedNetGainUsdc: strategy.estimatedNetGainUsdc,
      feeCostUsdc: strategy.feeCostUsdc,
      netGainAfterFeeUsdc: strategy.netGainAfterFeeUsdc,
      reasoning: strategy.reasoning,
      promptVersion: 0,
    };

    // PHASE 4: COMPLIANCE CHECK (fee guard)
    cycle.phase = 'compliance_check';
    await saveCycle(cycle);
    onReasoning({ timestamp: new Date().toISOString(), agentId: 'compliance_guardian', agentName: AGENT_PROFILES.compliance_guardian.name, agentIcon: AGENT_PROFILES.compliance_guardian.icon, color: AGENT_PROFILES.compliance_guardian.color, message: `Validating strategy against net-gain guard and risk limits...`, type: 'thinking' });

    const isInitial = user.currentProtocol === 'idle';
    const bestYield = intel.yields.reduce((b, p) => p.supplyApyBps > b.supplyApyBps ? p : b, intel.yields[0]);
    const guardResult = evaluateFeeGuard(user.currentApy, bestYield.supplyApyBps, user.depositAmountUsdc, parseInt(process.env.AGENT_CYCLE_INTERVAL_MS || '1800000'));

    if (!guardResult.shouldExecute && !isInitial) {
      strategy.shouldExecute = false;
      strategy.shouldRebalance = false;
      cycle.phase = 'skipped';
      onReasoning({ timestamp: new Date().toISOString(), agentId: 'compliance_guardian', agentName: AGENT_PROFILES.compliance_guardian.name, agentIcon: AGENT_PROFILES.compliance_guardian.icon, color: AGENT_PROFILES.compliance_guardian.color, message: `⊘ Strategy blocked — ${guardResult.reason}`, type: 'warning' });
      await saveCycle(cycle);
    } else if (strategy.shouldExecute || isInitial) {
      onReasoning({ timestamp: new Date().toISOString(), agentId: 'compliance_guardian', agentName: AGENT_PROFILES.compliance_guardian.name, agentIcon: AGENT_PROFILES.compliance_guardian.icon, color: AGENT_PROFILES.compliance_guardian.color, message: `✅ Strategy approved — net gain $${strategy.netGainAfterFeeUsdc.toFixed(6)} exceeds fee threshold`, type: 'action' });

      if (isInitial) {
        strategy.shouldExecute = true;
        strategy.shouldRebalance = true;
        strategy.targetProtocol = bestYield.protocol;
      }

      // PHASE 5: EXECUTE
      cycle.phase = 'executing';
      await saveCycle(cycle);
      const result = await runExecutionAgent(cycle.optimizerDecision!, user, cycleId);
      cycle.executionResult = result;
      cycle.userFeeChargedUsdc = result.executed ? parseFloat(process.env.REBALANCE_FEE_USDC || '0.005') : 0;

      if (result.executed && strategy.targetProtocol) {
        await updateUserProtocol(user.id, strategy.targetProtocol, strategy.blendedApyBps);
      }

      onReasoning({ timestamp: new Date().toISOString(), agentId: 'executor', agentName: AGENT_PROFILES.executor.name, agentIcon: AGENT_PROFILES.executor.icon, color: AGENT_PROFILES.executor.color, message: result.executed ? `✅ Executed: ${result.fromProtocol} → ${result.toProtocol} ($${result.amountUsdc} USDC)` : `Strategy execution skipped.`, type: 'action' });
    }

    // PHASE 6: PERFORMANCE ANALYSIS
    cycle.phase = 'performance_analysis';
    await saveCycle(cycle);
    const perf = await runPerformanceAnalyst(cycle, cycleId, onReasoning);
    cycle.performanceAttribution = perf;

    // PHASE 7: META-STRATEGIST (fire-and-forget)
    cycle.phase = 'meta_strategist';
    cycle.completedAt = new Date().toISOString();
    cycle.reasoningLog = log;
    await saveCycle(cycle);

    runReflexionAgent(cycle).then(async () => {
      cycle.phase = 'idle';
      await saveCycle(cycle);
    });

  } catch (error) {
    cycle.phase = 'idle';
    cycle.completedAt = new Date().toISOString();
    cycle.reasoningLog = log;
    await saveCycle(cycle);
    console.error('Agent cycle error:', error);
  } finally {
    activeCycles.delete(user.id);
  }

  return cycleId;
}

export function startAutoCycle(userId: string, intervalMs: number) {
  return setInterval(async () => {
    const user = await getUser(userId);
    if (user?.agentActive) await runAgentCycle(user);
  }, intervalMs);
}
