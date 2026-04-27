import { ProtocolYield } from '../../types';

const MORPHO_GRAPHQL = 'https://blue-api.morpho.org/graphql';

const USDC_VAULT_QUERY = `
query {
  vaultV2ByAddress(
    address: "0xd4468EF3745c315949a97090eD27b3F73b9b7C02"  
    chainId: 8453
  ) {
    type
    apy
    avgNetApy
    performanceFee
    rewards {
      asset { symbol }
      supplyApr
    }
  }
}`;

export async function fetchMorphoYield(): Promise<ProtocolYield> {
  let apyBps = 1031; // Default fallback: 10.31%

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(MORPHO_GRAPHQL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: USDC_VAULT_QUERY }),
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    
    if (response.ok) {
      const { data } = await response.json();
      const vault = data?.vaultV2ByAddress;
      const fetchedApy = Math.round((vault?.apy ?? 0) * 10000);
      if (fetchedApy > 0) {
        apyBps = fetchedApy;
      }
    }
  } catch {
    // Timeout or network error — use fallback values
  }

  return {
    protocol: 'morpho',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps: apyBps,
    tvlUsd: 180_000_000,
    utilizationRate: 0.88,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
