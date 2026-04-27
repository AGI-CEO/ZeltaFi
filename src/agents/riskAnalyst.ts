import { GoogleGenAI } from '@google/genai';
import { MarketIntelligence, RiskAssessment, ProtocolRiskScore, ReasoningEntry, AGENT_PROFILES } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });
const profile = AGENT_PROFILES.risk_analyst;

function generateMockRiskAssessment(intel: MarketIntelligence): RiskAssessment {
  const protocolScores: ProtocolRiskScore[] = intel.yields.map(y => {
    let base = 75;
    let reasoning = '';
    if (y.protocol === 'aave') {
      base = 92;
      reasoning = 'Battle-tested lending protocol with multiple audits and 3+ years without major exploits. Decentralized governance.';
    } else if (y.protocol === 'morpho') {
      base = 78;
      reasoning = 'Peer-to-peer optimization on top of Aave. Audited by Spearbit but newer with semi-centralized admin keys.';
    } else {
      base = 70;
      reasoning = 'Compound V2 fork on Base. Well-audited codebase but smaller TVL and newer deployment.';
    }
    if (y.utilizationRate > 0.85) base -= 5;
    if (y.tvlUsd < 30_000_000) base -= 8;
    return {
      protocol: y.protocol, overallScore: base,
      factors: {
        smartContractRisk: base + (y.protocol === 'aave' ? 5 : -3),
        tvlStability: Math.min(100, Math.round(base + (y.tvlUsd > 100_000_000 ? 10 : -5))),
        auditStatus: y.protocol === 'aave' ? 98 : y.protocol === 'morpho' ? 82 : 75,
        governanceRisk: y.protocol === 'aave' ? 90 : 72,
        concentrationRisk: y.tvlUsd > 500_000_000 ? 88 : 65,
      },
      reasoning,
    };
  });
  const avgScore = protocolScores.reduce((s, p) => s + p.overallScore, 0) / protocolScores.length;
  const riskLevel = avgScore > 85 ? 'low' : avgScore > 70 ? 'medium' : avgScore > 55 ? 'high' : 'critical';
  return {
    protocolScores, portfolioRiskLevel: riskLevel as RiskAssessment['portfolioRiskLevel'],
    recommendations: [
      avgScore > 80 ? 'Portfolio risk within acceptable bounds.' : 'Reduce exposure to lower-scored protocols.',
      'Maintain 60%+ allocation to Aave for conservative profiles.',
    ],
    reasoning: `Portfolio safety score: ${avgScore.toFixed(0)}/100 (${riskLevel}).`,
  };
}

export async function runRiskAnalyst(
  intel: MarketIntelligence, cycleId: string,
  onReasoning?: (entry: ReasoningEntry) => void
): Promise<RiskAssessment> {
  const log = (msg: string, type: ReasoningEntry['type'] = 'thinking') => {
    onReasoning?.({ timestamp: new Date().toISOString(), agentId: 'risk_analyst', agentName: profile.name, agentIcon: profile.icon, color: profile.color, message: msg, type });
  };
  log('Evaluating protocol health and counterparty risk...');
  let assessment: RiskAssessment | null = null;
  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key') {
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: `Analyze risk:\n${JSON.stringify(intel, null, 2)}` }] }],
        config: { systemInstruction: 'You are a DeFi Risk Analyst. Evaluate protocol safety: smart contract age, audits, TVL stability, governance risk. Return JSON with protocolScores, portfolioRiskLevel, recommendations, reasoning.', responseMimeType: 'application/json' },
      });
      assessment = JSON.parse(response.text ?? '{}') as RiskAssessment;
    }
  } catch { console.warn('Risk Analyst: Gemini failed, using deterministic.'); }
  if (!assessment?.protocolScores?.length) assessment = generateMockRiskAssessment(intel);
  assessment.protocolScores.forEach(p => {
    const emoji = p.overallScore > 85 ? '🟢' : p.overallScore > 70 ? '🟡' : '🔴';
    log(`${emoji} ${p.protocol}: ${p.overallScore}/100 — ${p.reasoning}`, 'decision');
  });
  log(`Portfolio risk: ${assessment.portfolioRiskLevel.toUpperCase()}`, 'decision');
  return assessment;
}
