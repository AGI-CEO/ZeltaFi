import { GoogleGenAI } from '@google/genai';
import { ProtocolYield, OptimizerDecision, User } from '../types';
import { getReflexionMemory } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });

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
  const reflexionMemory = await getReflexionMemory();
  const systemPrompt = reflexionMemory.version > 0 
    ? reflexionMemory.improvedSystemPrompt 
    : BASE_SYSTEM_PROMPT;

  const cycleHours = parseFloat(process.env.AGENT_CYCLE_INTERVAL_MS || '1800000') / 3600000;
  const feeAmount = parseFloat(process.env.REBALANCE_FEE_USDC || '0.005');

  const userContext = `
User deposit: ${user.depositAmountUsdc} USDC
Current protocol: ${user.currentProtocol}
Current APY: ${user.currentApy} bps (${(user.currentApy / 100).toFixed(2)}%)
Risk tolerance: ${user.riskTolerance}
Hours to next cycle: ${cycleHours}
Fee amount: ${feeAmount} USDC

Current yield market:
${scanResults.map(p => `  ${p.protocol}: ${(p.supplyApyBps / 100).toFixed(2)}% APY, TVL: $${(p.tvlUsd / 1e6).toFixed(1)}M, Utilization: ${(p.utilizationRate * 100).toFixed(1)}%`).join('\n')}
`;

  let parsedRaw: Partial<OptimizerDecision> = {};

  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Might need gemini-1.5 ideally, fallback logic below handles missing model errors
        contents: [{ role: 'user', parts: [{ text: userContext }] }],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
        },
      });
      parsedRaw = JSON.parse(response.text ?? '{}');
    }
  } catch (err) {
    console.error("Gemini optimization failed (maybe wrong model string or key). Falling back to basic deterministic logic.");
  }

  const bestYield = scanResults.reduce((best, p) => p.supplyApyBps > best.supplyApyBps ? p : best, scanResults[0]);
  const deltaApyBps = bestYield.supplyApyBps - user.currentApy;
  const estimatedNetGain = (deltaApyBps / 10000) * user.depositAmountUsdc * (cycleHours / 8760);

  // Server-side override / deterministic fallback
  if (estimatedNetGain <= feeAmount || (user.currentProtocol !== 'idle' && user.currentProtocol === bestYield.protocol)) {
    return {
      shouldRebalance: false,
      targetProtocol: null,
      currentApyBps: user.currentApy,
      targetApyBps: bestYield.supplyApyBps,
      deltaApyBps,
      estimatedNetGainUsdc: estimatedNetGain,
      feeCostUsdc: feeAmount,
      netGainAfterFeeUsdc: estimatedNetGain - feeAmount,
      reasoning: parsedRaw.reasoning || `Net gain (${estimatedNetGain.toFixed(6)} USDC) does not exceed fee (${feeAmount} USDC). Skipping rebalance.`,
      promptVersion: reflexionMemory.version,
    };
  }

  return {
    shouldRebalance: true,
    targetProtocol: bestYield.protocol,
    currentApyBps: user.currentApy,
    targetApyBps: bestYield.supplyApyBps,
    deltaApyBps,
    estimatedNetGainUsdc: estimatedNetGain,
    feeCostUsdc: feeAmount,
    netGainAfterFeeUsdc: estimatedNetGain - feeAmount,
    reasoning: parsedRaw.reasoning || `Moved to ${bestYield.protocol} to capture ${(deltaApyBps/100).toFixed(2)}% extra APY. Net gain covers fee.`,
    promptVersion: reflexionMemory.version,
  };
}
