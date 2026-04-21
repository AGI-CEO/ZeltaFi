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
  const response = await fetch(MORPHO_GRAPHQL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: USDC_VAULT_QUERY }),
    next: { revalidate: 300 },
  });
  
  const { data } = await response.json();
  const vault = data?.vaultV2ByAddress;
  const apyBps = Math.round((vault?.avgNetApy ?? 0) * 10000);

  return {
    protocol: 'morpho',
    asset: 'USDC',
    chain: 'base',
    supplyApyBps: apyBps || 920, // fallback mock if unavailable
    tvlUsd: 0,  // Fetch separately if needed
    utilizationRate: 0,
    queryCostUsdc: 0,
    arcTxHash: null,
    queriedAt: new Date().toISOString(),
  };
}
