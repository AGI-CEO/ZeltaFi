import { NextRequest, NextResponse } from 'next/server';
import { getUser, getAllCycles, getReflexionMemory } from '../../../../lib/db';

// Realistic fallback yield data to show before any cycle runs
const FALLBACK_SCAN_RESULTS = [
  { protocol: 'aave', asset: 'USDC', chain: 'base', supplyApyBps: 850, tvlUsd: 12_400_000_000, utilizationRate: 0.82, queryCostUsdc: 0.001, arcTxHash: null, queriedAt: new Date().toISOString() },
  { protocol: 'morpho', asset: 'USDC', chain: 'base', supplyApyBps: 1031, tvlUsd: 180_000_000, utilizationRate: 0.88, queryCostUsdc: 0.001, arcTxHash: null, queriedAt: new Date().toISOString() },
  { protocol: 'moonwell', asset: 'USDC', chain: 'base', supplyApyBps: 745, tvlUsd: 95_000_000, utilizationRate: 0.75, queryCostUsdc: 0.001, arcTxHash: null, queriedAt: new Date().toISOString() },
];

export async function GET(req: NextRequest) {
  const user = await getUser('demo-user');
  const cycles = await getAllCycles();
  const memory = await getReflexionMemory();
  
  const currentCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;
  
  // Use live scan results if available, otherwise show fallback data
  const scanResults = currentCycle?.scanResults?.length
    ? currentCycle.scanResults
    : FALLBACK_SCAN_RESULTS;

  const bestAvailableApy = Math.max(...scanResults.map((r: any) => r.supplyApyBps));

  // If user has no APY set yet but we have yield data, show estimated APY
  const currentApy = (user?.currentApy && user.currentApy > 0)
    ? user.currentApy
    : bestAvailableApy;

  return NextResponse.json({
    // Phase info
    phase: currentCycle?.phase || 'idle',
    isRunning: currentCycle ? ['scanning', 'optimizing', 'executing', 'reflecting'].includes(currentCycle.phase) : false,

    // APY data
    currentApy,
    bestAvailableApy,
    feeToValueRatio: memory.performanceMetrics.feeToValueRatio,

    // Reflexion
    promptVersion: memory.version,
    lastCritique: memory.critique,

    // User data for dashboard
    user: user ? { ...user, currentApy: currentApy } : null,

    // Latest cycle with full details (inject fallback scan results)
    latestCycle: currentCycle
      ? currentCycle
      : { phase: 'idle', scanResults: FALLBACK_SCAN_RESULTS },

    // Recent cycles for decision history
    recentCycles: cycles.slice(-10),
  });
}
