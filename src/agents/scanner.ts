import { GoogleGenAI, Type } from '@google/genai';
import { x402Client } from '../lib/x402/client';
import { fetchAaveYield } from '../lib/protocols/aave';
import { fetchMorphoYield } from '../lib/protocols/morpho';
import { fetchMoonwellYield } from '../lib/protocols/moonwell';
import { ProtocolYield } from '../types';
import { recordNanopayment } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });

export async function runScannerAgent(cycleId: string): Promise<ProtocolYield[]> {
  const results: ProtocolYield[] = [];
  
  // Directly simulate parallel function calls since this is deterministic
  // In a real-world scenario with unexpected endpoints, Gemini would decide which to call.
  // We'll call them directly here to ensure reliable demo execution, but simulating the payment step.
  const fetchers = [
    { name: 'get_aave_usdc_apy', fn: fetchAaveYield },
    { name: 'get_morpho_usdc_apy', fn: fetchMorphoYield },
    { name: 'get_moonwell_usdc_apy', fn: fetchMoonwellYield },
  ];

  for (const fetcher of fetchers) {
    // Pay x402 nanopayment before fetching
    const paymentTxHash = await x402Client.pay({
      amount: process.env.QUERY_FEE_USDC || '0.001',
      toAddress: process.env.YIELD_DATA_PROVIDER_PAYMENT_ADDRESS || '0xmockaddress',
      description: `Yield query: ${fetcher.name}`,
    });

    // Fetch yield data
    const yieldData = await fetcher.fn();
    if (!yieldData) continue;
    
    yieldData.arcTxHash = paymentTxHash;
    yieldData.queryCostUsdc = parseFloat(process.env.QUERY_FEE_USDC || '0.001');
    results.push(yieldData);

    // Record payment in DB
    await recordNanopayment({
      fromAgentId: process.env.SCANNER_AGENT_ADDRESS || '0xscanner',
      toAddress: process.env.YIELD_DATA_PROVIDER_PAYMENT_ADDRESS || '0xmockaddress',
      amountUsdc: yieldData.queryCostUsdc,
      purpose: 'yield_query',
      arcTxHash: paymentTxHash,
      cycleId,
    });
  }

  return results;
}
