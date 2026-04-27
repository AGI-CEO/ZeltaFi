import { GoogleGenAI } from '@google/genai';
import { MarketIntelligence, RiskAssessment, Strategy, StrategyPosition, User, ReasoningEntry, AGENT_PROFILES } from '../types';
import { getReflexionMemory } from '../lib/db';
import { evaluateFeeGuard } from '../lib/feeGuard';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });
const profile = AGENT_PROFILES.strategy_architect;

function buildMockStrategy(intel: MarketIntelligence, risk: RiskAssessment, user: User): Strategy {
  const yields = intel.yields;
  const sorted = [...yields].sort((a, b) => b.supplyApyBps - a.supplyApyBps);
  const best = sorted[0];
  const cycleHours = parseFloat(process.env.AGENT_CYCLE_INTERVAL_MS || '1800000') / 3600000;
  const feeAmount = parseFloat(process.env.REBALANCE_FEE_USDC || '0.005');
  const isInitial = user.currentProtocol === 'idle';

  let positions: StrategyPosition[] = [];
  let name = 'Hold Current';
  let reasoning = '';

  if (user.riskTolerance === 'conservative') {
    const aave = yields.find(y => y.protocol === 'aave')!;
    positions = [{ protocol: 'aave', action: isInitial ? 'supply' : 'hold', allocationPercent: 100, expectedApyBps: aave.supplyApyBps, reasoning: 'Conservative profile: 100% allocation to Aave (highest safety score).' }];
    name = 'Conservative Core';
    reasoning = `Conservative strategy allocates 100% to Aave (safety: ${risk.protocolScores.find(p => p.protocol === 'aave')?.overallScore}/100). Current APY: ${(aave.supplyApyBps / 100).toFixed(2)}%.`;
  } else if (user.riskTolerance === 'balanced') {
    const aave = yields.find(y => y.protocol === 'aave')!;
    const morpho = yields.find(y => y.protocol === 'morpho')!;
    positions = [
      { protocol: 'aave', action: isInitial ? 'supply' : 'hold', allocationPercent: 60, expectedApyBps: aave.supplyApyBps, reasoning: `60% to Aave (${(aave.supplyApyBps / 100).toFixed(2)}% APY, safety ${risk.protocolScores.find(p => p.protocol === 'aave')?.overallScore}/100)` },
      { protocol: 'morpho', action: isInitial ? 'supply' : 'hold', allocationPercent: 40, expectedApyBps: morpho.supplyApyBps, reasoning: `40% to Morpho (${(morpho.supplyApyBps / 100).toFixed(2)}% APY, peer-to-peer optimization)` },
    ];
    name = 'Balanced Diversified';
    reasoning = `Balanced strategy splits across Aave (60%) and Morpho (40%) for diversified risk-adjusted yield. Blended APY: ${((aave.supplyApyBps * 0.6 + morpho.supplyApyBps * 0.4) / 100).toFixed(2)}%.`;
  } else {
    positions = sorted.map((y, i) => ({
      protocol: y.protocol, action: isInitial ? 'supply' as const : 'hold' as const,
      allocationPercent: i === 0 ? 50 : i === 1 ? 30 : 20,
      expectedApyBps: y.supplyApyBps,
      reasoning: `${i === 0 ? '50' : i === 1 ? '30' : '20'}% to ${y.protocol} (${(y.supplyApyBps / 100).toFixed(2)}% APY)`,
    }));
    name = 'Aggressive Alpha';
    reasoning = `Aggressive strategy maximizes blended yield across all ${sorted.length} protocols, weighted by APY ranking.`;
  }

  const blendedApyBps = Math.round(positions.reduce((s, p) => s + p.expectedApyBps * p.allocationPercent / 100, 0));
  const deltaApyBps = blendedApyBps - user.currentApy;
  const estimatedNetGain = (deltaApyBps / 10000) * user.depositAmountUsdc * (cycleHours / 8760);
  const shouldExecute = isInitial || estimatedNetGain > feeAmount;

  if (shouldExecute && !isInitial) {
    positions = positions.map(p => ({ ...p, action: p.protocol === best.protocol ? 'supply' as const : 'withdraw' as const }));
  }

  return {
    id: crypto.randomUUID(),
    name, positions, blendedApyBps,
    riskScore: risk.protocolScores.reduce((s, p) => s + p.overallScore, 0) / risk.protocolScores.length,
    estimatedNetGainUsdc: estimatedNetGain, feeCostUsdc: feeAmount,
    netGainAfterFeeUsdc: estimatedNetGain - feeAmount,
    shouldExecute, reasoning,
    shouldRebalance: shouldExecute,
    targetProtocol: shouldExecute ? best.protocol : null,
    deltaApyBps,
  };
}

export async function runStrategyArchitect(
  intel: MarketIntelligence, risk: RiskAssessment, user: User, cycleId: string,
  onReasoning?: (entry: ReasoningEntry) => void
): Promise<Strategy> {
  const log = (msg: string, type: ReasoningEntry['type'] = 'thinking') => {
    onReasoning?.({ timestamp: new Date().toISOString(), agentId: 'strategy_architect', agentName: profile.name, agentIcon: profile.icon, color: profile.color, message: msg, type });
  };

  log(`Designing strategy for ${user.riskTolerance} profile with $${user.depositAmountUsdc} USDC...`);
  log(`Considering ${intel.yields.length} protocols, ${intel.signals.length} market signals, ${risk.protocolScores.length} risk assessments...`);

  let strategy: Strategy | null = null;

  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key') {
      const memory = await getReflexionMemory();
      const prompt = `Design a DeFi yield strategy.
User: $${user.depositAmountUsdc} USDC, ${user.riskTolerance} risk, current: ${user.currentProtocol} at ${user.currentApy}bps
Market: ${JSON.stringify(intel.yields.map(y => ({ p: y.protocol, apy: y.supplyApyBps, tvl: y.tvlUsd })))}
Signals: ${intel.signals.map(s => `${s.type}: ${s.signal}`).join('; ')}
Risk: ${risk.protocolScores.map(p => `${p.protocol}=${p.overallScore}/100`).join(', ')}
Fee: $${process.env.REBALANCE_FEE_USDC || '0.005'}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { systemInstruction: memory.version > 0 ? memory.improvedSystemPrompt : 'You are a DeFi Strategy Architect. Design multi-position strategies considering risk, yield, and diversification. Return JSON with name, positions[], blendedApyBps, shouldExecute, reasoning.', responseMimeType: 'application/json' },
      });
      const parsed = JSON.parse(response.text ?? '{}');
      if (parsed.positions?.length) strategy = parsed as Strategy;
    }
  } catch { console.warn('Strategy Architect: Gemini failed, using deterministic.'); }

  if (!strategy) strategy = buildMockStrategy(intel, risk, user);

  log(`Strategy: "${strategy.name}" — ${strategy.positions.map(p => `${p.allocationPercent}% ${p.protocol}`).join(', ')}`, 'decision');
  log(`Blended APY: ${(strategy.blendedApyBps / 100).toFixed(2)}% | Net gain: $${strategy.netGainAfterFeeUsdc.toFixed(6)} | Execute: ${strategy.shouldExecute ? 'YES' : 'NO'}`, strategy.shouldExecute ? 'action' : 'decision');

  return strategy;
}
