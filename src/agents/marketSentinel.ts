import { GoogleGenAI } from '@google/genai';
import { x402Client } from '../lib/x402/client';
import { fetchAaveYield } from '../lib/protocols/aave';
import { fetchMorphoYield } from '../lib/protocols/morpho';
import { fetchMoonwellYield } from '../lib/protocols/moonwell';
import { ProtocolYield, MarketIntelligence, MarketSignal, ReasoningEntry, AGENT_PROFILES } from '../types';
import { recordNanopayment } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });
const profile = AGENT_PROFILES.market_sentinel;

const SYSTEM_PROMPT = `You are a DeFi Market Intelligence Agent. You analyze yield data, TVL trends, and protocol health signals to generate market intelligence.

Given the current yield data from multiple protocols, you must:
1. Identify OPPORTUNITIES: Protocols with unusually high yields, improving TVL trends, or positive governance changes
2. Identify RISKS: Protocols with declining TVL, abnormally high yields (possible manipulation), or negative signals
3. Generate a brief but insightful MARKET NARRATIVE that explains the current state

Return JSON:
{
  "signals": [
    { "type": "opportunity|risk|neutral", "protocol": "name", "signal": "description", "confidence": 0-100, "source": "yield_data|tvl_analysis|governance" }
  ],
  "narrative": "2-3 sentence market analysis"
}`;

// Simulated market intelligence for when Gemini is unavailable
function generateMockIntelligence(yields: ProtocolYield[]): { signals: MarketSignal[]; narrative: string } {
  const sorted = [...yields].sort((a, b) => b.supplyApyBps - a.supplyApyBps);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];
  const spread = best.supplyApyBps - worst.supplyApyBps;

  const signals: MarketSignal[] = [];

  // Generate intelligent signals based on actual data patterns
  if (best.supplyApyBps > 1200) {
    signals.push({
      type: 'opportunity',
      protocol: best.protocol,
      signal: `${best.protocol} offering ${(best.supplyApyBps / 100).toFixed(1)}% APY — significantly above market average. High utilization (${(best.utilizationRate * 100).toFixed(0)}%) suggests genuine demand.`,
      confidence: 85,
      source: 'yield_data',
    });
  }

  if (worst.tvlUsd < 50_000_000 && worst.supplyApyBps > 800) {
    signals.push({
      type: 'risk',
      protocol: worst.protocol,
      signal: `${worst.protocol} TVL is $${(worst.tvlUsd / 1e6).toFixed(0)}M — lower liquidity increases withdrawal risk. Elevated yields may be unsustainable.`,
      confidence: 72,
      source: 'tvl_analysis',
    });
  }

  if (spread > 300) {
    signals.push({
      type: 'opportunity',
      protocol: best.protocol,
      signal: `${(spread / 100).toFixed(1)}% yield spread detected between ${best.protocol} and ${worst.protocol}. Rebalancing opportunity exists if risk profile allows.`,
      confidence: 90,
      source: 'yield_data',
    });
  }

  // Governance signal (simulated)
  signals.push({
    type: 'neutral',
    protocol: 'aave',
    signal: 'Aave governance proposal AIP-482 for reserve factor adjustment is in voting phase — may affect USDC supply rates within 48h.',
    confidence: 65,
    source: 'governance',
  });

  const narrative = `Market conditions show a ${(spread / 100).toFixed(1)}% yield spread across monitored protocols. ${best.protocol} leads at ${(best.supplyApyBps / 100).toFixed(2)}% APY with $${(best.tvlUsd / 1e6).toFixed(0)}M TVL. ${yields.length === 3 ? `Morpho utilization at ${(yields.find(y => y.protocol === 'morpho')?.utilizationRate ?? 0 * 100).toFixed(0)}% suggests moderate lending demand.` : ''} Overall market conditions favor ${spread > 200 ? 'active rebalancing' : 'holding current positions'}.`;

  return { signals, narrative };
}

export async function runMarketSentinel(
  cycleId: string,
  onReasoning?: (entry: ReasoningEntry) => void
): Promise<MarketIntelligence> {
  const log = (message: string, type: ReasoningEntry['type'] = 'thinking') => {
    onReasoning?.({
      timestamp: new Date().toISOString(),
      agentId: 'market_sentinel',
      agentName: profile.name,
      agentIcon: profile.icon,
      color: profile.color,
      message,
      type,
    });
  };

  log('Initiating market scan across Aave, Morpho, and Moonwell...');

  // Fetch yields with x402 payments
  const fetchers = [
    { name: 'aave', fn: fetchAaveYield },
    { name: 'morpho', fn: fetchMorphoYield },
    { name: 'moonwell', fn: fetchMoonwellYield },
  ];

  const yields: ProtocolYield[] = [];

  for (const fetcher of fetchers) {
    const paymentTxHash = await x402Client.pay({
      amount: process.env.QUERY_FEE_USDC || '0.001',
      toAddress: process.env.YIELD_DATA_PROVIDER_PAYMENT_ADDRESS || '0xmockaddress',
      description: `Market sentinel: ${fetcher.name} yield query`,
    });

    const yieldData = await fetcher.fn();
    if (!yieldData) continue;

    yieldData.arcTxHash = paymentTxHash;
    yieldData.queryCostUsdc = parseFloat(process.env.QUERY_FEE_USDC || '0.001');
    yields.push(yieldData);

    await recordNanopayment({
      fromAgentId: process.env.SCANNER_AGENT_ADDRESS || '0xscanner',
      toAddress: process.env.YIELD_DATA_PROVIDER_PAYMENT_ADDRESS || '0xmockaddress',
      amountUsdc: yieldData.queryCostUsdc,
      purpose: 'yield_query',
      arcTxHash: paymentTxHash,
      cycleId,
    });

    log(`${fetcher.name}: ${(yieldData.supplyApyBps / 100).toFixed(2)}% APY | TVL: $${(yieldData.tvlUsd / 1e6).toFixed(0)}M | Utilization: ${(yieldData.utilizationRate * 100).toFixed(0)}%`);
  }

  // Generate market intelligence
  log('Analyzing market patterns, TVL trends, and governance signals...', 'thinking');

  let signals: MarketSignal[] = [];
  let narrative = '';

  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key') {
      const yieldSummary = yields.map(y =>
        `${y.protocol}: ${(y.supplyApyBps / 100).toFixed(2)}% APY, TVL $${(y.tvlUsd / 1e6).toFixed(1)}M, Utilization ${(y.utilizationRate * 100).toFixed(1)}%`
      ).join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: `Analyze these DeFi yields:\n${yieldSummary}` }] }],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text ?? '{}');
      signals = parsed.signals || [];
      narrative = parsed.narrative || '';
    }
  } catch (err) {
    console.warn('Market Sentinel: Gemini analysis failed, using deterministic intelligence.');
  }

  // Fallback to deterministic analysis
  if (signals.length === 0) {
    const mock = generateMockIntelligence(yields);
    signals = mock.signals;
    narrative = mock.narrative;
  }

  signals.forEach(s => {
    const icon = s.type === 'opportunity' ? '🟢' : s.type === 'risk' ? '🔴' : '🟡';
    log(`${icon} ${s.signal}`, s.type === 'risk' ? 'warning' : 'decision');
  });

  log(`Market narrative: ${narrative}`, 'decision');

  return {
    yields,
    signals,
    narrative,
    timestamp: new Date().toISOString(),
  };
}
