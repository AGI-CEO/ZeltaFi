import { ProtocolYield } from '../../types';

export async function fetchAaveYield(): Promise<ProtocolYield> {
  let supplyApyBps = 850; // Default fallback: 8.50%
  let tvlUsd = 12_400_000_000;
  let utilizationRate = 0.82;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      'https://aave-api-v2.aave.com/data/markets-data',
      { signal: controller.signal, cache: 'no-store' }
    );
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (data?.reserves) {
        const baseMarket = data.reserves.find(
          (r: any) => r.symbol === 'USDC' && (!process.env.USDC_CONTRACT_ADDRESS || r.underlyingAsset?.toLowerCase() === process.env.USDC_CONTRACT_ADDRESS?.toLowerCase())
        );
        if (baseMarket) {
          const fetchedApy = Math.round((baseMarket.liquidityRate ?? 0) * 10000);
          if (fetchedApy > 0) supplyApyBps = fetchedApy;
          if (parseFloat(baseMarket.totalLiquidityUSD ?? '0') > 0) tvlUsd = parseFloat(baseMarket.totalLiquidityUSD);
          if (parseFloat(baseMarket.utilizationRate ?? '0') > 0) utilizationRate = parseFloat(baseMarket.utilizationRate);
        }
      }
    }
  } catch {
    // Timeout or network error — use fallback values
  }

  return {
    protocol: 'aave',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps,
    tvlUsd,
    utilizationRate,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
