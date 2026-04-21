export interface FeeGuardResult {
  shouldExecute: boolean;
  netGainUsdc: number;
  feeUsdc: number;
  netGainAfterFeeUsdc: number;
  reason: string;
}

export function evaluateFeeGuard(
  currentApyBps: number,
  targetApyBps: number,
  depositUsdc: number,
  cycleIntervalMs: number,
  feeUsdc: number = 0.005
): FeeGuardResult {
  const deltaApyBps = targetApyBps - currentApyBps;
  
  // If target is worse or equal, never execute
  if (deltaApyBps <= 0) {
    return {
      shouldExecute: false,
      netGainUsdc: 0,
      feeUsdc,
      netGainAfterFeeUsdc: -feeUsdc,
      reason: 'Target APY is not better than current allocation.',
    };
  }

  // Calculate how much extra yield this rebalance earns before next cycle
  const cycleYears = cycleIntervalMs / (1000 * 60 * 60 * 24 * 365);
  const netGainUsdc = (deltaApyBps / 10000) * depositUsdc * cycleYears;
  const netGainAfterFeeUsdc = netGainUsdc - feeUsdc;

  if (netGainAfterFeeUsdc <= 0) {
    return {
      shouldExecute: false,
      netGainUsdc,
      feeUsdc,
      netGainAfterFeeUsdc,
      reason: `Net gain ($${netGainUsdc.toFixed(6)} USDC) does not exceed fee ($${feeUsdc} USDC). Not worth rebalancing.`,
    };
  }

  return {
    shouldExecute: true,
    netGainUsdc,
    feeUsdc,
    netGainAfterFeeUsdc,
    reason: `Expected net gain after fee: $${netGainAfterFeeUsdc.toFixed(6)} USDC. Rebalance is justified.`,
  };
}

export const MIN_DEPOSIT_USDC = 100;
export const MIN_REBALANCE_DELTA_BPS_BY_DEPOSIT: Record<string, number> = {
  'small':  200,  // < $500: need 2%+ delta to justify
  'medium': 50,   // $500-$5000: 0.5%+ delta
  'large':  15,   // > $5000: 0.15%+ delta
};
