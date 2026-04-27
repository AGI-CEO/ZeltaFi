import { AgentCycle, PerformanceAttribution, ReasoningEntry, AGENT_PROFILES } from '../types';

const profile = AGENT_PROFILES.performance_analyst;

export async function runPerformanceAnalyst(
  cycle: AgentCycle, cycleId: string,
  onReasoning?: (entry: ReasoningEntry) => void
): Promise<PerformanceAttribution> {
  const log = (msg: string, type: ReasoningEntry['type'] = 'thinking') => {
    onReasoning?.({ timestamp: new Date().toISOString(), agentId: 'performance_analyst', agentName: profile.name, agentIcon: profile.icon, color: profile.color, message: msg, type });
  };

  log('Analyzing cycle performance and decomposing alpha sources...');

  const strategy = cycle.strategy;
  const benchmarkApyBps = 600; // Simple savings benchmark: 6% APY
  const realizedApyBps = strategy?.blendedApyBps ?? 0;
  const alphaVsBenchmark = realizedApyBps - benchmarkApyBps;
  const totalAlpha = (alphaVsBenchmark / 10000) * (cycle.scanResults?.[0]?.queryCostUsdc ? 1000 : 0); // Simplified

  const attribution = strategy?.positions?.map(p => ({
    protocol: p.protocol,
    contributionBps: Math.round((p.expectedApyBps - benchmarkApyBps) * p.allocationPercent / 100),
    reasoning: `${p.protocol} contributed ${((p.expectedApyBps - benchmarkApyBps) * p.allocationPercent / 10000).toFixed(2)}% alpha via ${p.allocationPercent}% allocation at ${(p.expectedApyBps / 100).toFixed(2)}% APY`,
  })) ?? [];

  const result: PerformanceAttribution = {
    realizedApyBps, projectedApyBps: strategy?.blendedApyBps ?? 0,
    alphaVsBenchmarkBps: alphaVsBenchmark,
    attributionByProtocol: attribution,
    totalAlphaGeneratedUsdc: totalAlpha,
    reasoning: `Realized ${(realizedApyBps / 100).toFixed(2)}% APY vs ${(benchmarkApyBps / 100).toFixed(2)}% benchmark = ${(alphaVsBenchmark / 100).toFixed(2)}% alpha. ${attribution.length > 0 ? `Top contributor: ${attribution.sort((a, b) => b.contributionBps - a.contributionBps)[0]?.protocol}.` : ''}`,
  };

  log(`Alpha vs benchmark: +${(alphaVsBenchmark / 100).toFixed(2)}% — ${result.reasoning}`, 'decision');

  return result;
}
