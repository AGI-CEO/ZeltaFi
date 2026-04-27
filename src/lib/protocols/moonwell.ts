import { ProtocolYield } from '../../types';

export async function fetchMoonwellYield(): Promise<ProtocolYield> {
  let supplyApyBps = 745; // Default fallback: 7.45%
  let tvlUsd = 95_000_000;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://api.moonwell.fi/yields', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data?.markets) {
        const usdcMarket = Object.values(data.markets).find(
          (m: any) => m.underlyingToken?.symbol === 'USDC'
        ) as any;
        
        if (usdcMarket) {
          const fetchedApy = Math.round((usdcMarket.baseSupplyApy ?? 0) * 10000);
          if (fetchedApy > 0) supplyApyBps = fetchedApy;
          if (parseFloat(usdcMarket.totalSupplyUsd ?? '0') > 0) tvlUsd = parseFloat(usdcMarket.totalSupplyUsd);
        }
      }
    }
  } catch {
    // Timeout or network error — use fallback values
  }

  return {
    protocol: 'moonwell',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps,
    tvlUsd,
    utilizationRate: 0.75,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
