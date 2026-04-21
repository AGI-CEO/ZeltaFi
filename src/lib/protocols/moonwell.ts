import { ProtocolYield } from '../../types';

export async function fetchMoonwellYield(): Promise<ProtocolYield> {
  const response = await fetch('https://api.moonwell.fi/yields', {
    next: { revalidate: 300 },
  }).catch(() => null);
  
  let data: any = {};
  if (response && response.ok) {
     data = await response.json();
  }

  // Find USDC market on Base
  const usdcMarket = Object.values(data.markets ?? {}).find(
    (m: any) => m.underlyingToken?.symbol === 'USDC'
  ) as any;

  return {
    protocol: 'moonwell',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps: Math.round((usdcMarket?.baseSupplyApy ?? 0) * 10000) || 750, // mock fallback
    tvlUsd: parseFloat(usdcMarket?.totalSupplyUsd ?? '0'),
    utilizationRate: 0,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
