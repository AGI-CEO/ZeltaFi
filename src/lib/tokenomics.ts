import { ZeltaMetrics } from '../types';

// $ZELTA Token Constants
export const ZELTA_TOTAL_SUPPLY = 100_000_000;       // 100M tokens
export const ZELTA_INITIAL_PRICE = 0.10;              // $0.10 initial
export const STAKER_SHARE_PERCENT = 70;               // 70% of alpha to stakers
export const TREASURY_SHARE_PERCENT = 20;             // 20% buyback + burn
export const IMPROVEMENT_FUND_PERCENT = 10;           // 10% AI improvement
export const BENCHMARK_APY_BPS = 750;                 // 7.5% baseline (passive Aave staking)

// Fee discount tiers
export const FEE_DISCOUNT_TIERS = [
  { minZelta: 0,       discount: 0,    label: 'Standard' },
  { minZelta: 1_000,   discount: 0.10, label: 'Bronze' },
  { minZelta: 10_000,  discount: 0.25, label: 'Silver' },
  { minZelta: 50_000,  discount: 0.40, label: 'Gold' },
  { minZelta: 250_000, discount: 0.60, label: 'Diamond' },
];

export function calculateAlpha(realizedApyBps: number): number {
  return Math.max(0, realizedApyBps - BENCHMARK_APY_BPS);
}

export function calculateStakerShare(alphaUsdc: number): number {
  return alphaUsdc * (STAKER_SHARE_PERCENT / 100);
}

export function calculateFeeDiscount(zeltaBalance: number): { discount: number; tier: string } {
  let result = FEE_DISCOUNT_TIERS[0];
  for (const tier of FEE_DISCOUNT_TIERS) {
    if (zeltaBalance >= tier.minZelta) result = tier;
  }
  return { discount: result.discount, tier: result.label };
}

export function getSimulatedMetrics(): ZeltaMetrics {
  // Simulated live metrics for demo
  const now = Date.now();
  const baseGrowth = Math.sin(now / 60000) * 0.002 + 1;

  return {
    totalSupply: ZELTA_TOTAL_SUPPLY,
    circulatingSupply: Math.round(42_500_000 * baseGrowth),
    price: +(ZELTA_INITIAL_PRICE * (1 + Math.sin(now / 120000) * 0.05 + 0.15)).toFixed(4),
    marketCap: 0, // computed below
    totalAlphaGenerated: +(18_742.50 + Math.random() * 10).toFixed(2),
    currentAlphaRate: +(342 + Math.sin(now / 30000) * 20).toFixed(0),
    stakerSharePercent: STAKER_SHARE_PERCENT,
    treasuryBalance: +(125_840 + Math.random() * 100).toFixed(2),
    totalValueLocked: +(2_450_000 + Math.sin(now / 45000) * 50000).toFixed(0),
    avgBlendedApy: +(11.2 + Math.sin(now / 60000) * 0.8).toFixed(2),
  };
}

export function projectedAnnualEarnings(depositUsdc: number, blendedApyBps: number, zeltaStaked: number): {
  yieldEarnings: number;
  alphaShare: number;
  feesSaved: number;
  totalReturn: number;
} {
  const yieldEarnings = depositUsdc * (blendedApyBps / 10000);
  const alphaBps = calculateAlpha(blendedApyBps);
  const alphaUsdc = depositUsdc * (alphaBps / 10000);
  const alphaShare = calculateStakerShare(alphaUsdc) * (zeltaStaked / Math.max(1, ZELTA_TOTAL_SUPPLY * 0.3)); // proportional
  const { discount } = calculateFeeDiscount(zeltaStaked);
  const annualCycles = 365 * 48; // cycles per year
  const feesSaved = annualCycles * parseFloat(process.env.REBALANCE_FEE_USDC || '0.005') * discount;

  return {
    yieldEarnings: +yieldEarnings.toFixed(2),
    alphaShare: +alphaShare.toFixed(2),
    feesSaved: +feesSaved.toFixed(2),
    totalReturn: +(yieldEarnings + alphaShare + feesSaved).toFixed(2),
  };
}
