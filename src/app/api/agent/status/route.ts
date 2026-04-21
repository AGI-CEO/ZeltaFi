import { NextRequest, NextResponse } from 'next/server';
import { getAllCycles, getReflexionMemory } from '../../../../lib/db';

export async function GET(req: NextRequest) {
  const cycles = await getAllCycles();
  const memory = await getReflexionMemory();
  
  const currentCycle = cycles.length > 0 ? cycles[cycles.length - 1] : null;

  return NextResponse.json({
    phase: currentCycle && currentCycle.phase !== 'idle' && currentCycle.phase !== 'skipped' ? currentCycle.phase : (currentCycle?.phase || 'idle'),
    currentApy: 0,
    bestAvailableApy: 0,
    feeToValueRatio: memory.performanceMetrics.feeToValueRatio,
    promptVersion: memory.version,
    lastCritique: memory.critique,
    isRunning: currentCycle ? ['scanning', 'optimizing', 'executing', 'reflecting'].includes(currentCycle.phase) : false
  });
}
