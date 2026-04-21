import { ProtocolYield } from '../../types';

export async function fetchAaveYield(): Promise<ProtocolYield> {
  // Option A: Aave UI data API (public, no auth)
  const response = await fetch(
    'https://aave-api-v2.aave.com/data/markets-data',
    { next: { revalidate: 300 } }  // Cache 5 mins
  );
  const data = await response.json();
  
  // Find Base USDC market
  const baseMarket = data.reserves?.find(
    (r: any) => r.symbol === 'USDC' && r.underlyingAsset?.toLowerCase() === process.env.USDC_CONTRACT_ADDRESS?.toLowerCase()
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
