import { NextRequest, NextResponse } from 'next/server';
import { getAllPayments, getAllCycles } from '../../../lib/db';

export async function GET(req: NextRequest) {
  const [payments, cycles] = await Promise.all([
    getAllPayments(),
    getAllCycles(),
  ]);

  return NextResponse.json({
    payments: payments.sort((a, b) => 
      new Date(b.settledAt ?? 0).getTime() - new Date(a.settledAt ?? 0).getTime()
    ),
    totalPaymentCount: payments.length,
    totalUsdcFlowed: payments.reduce((sum, p) => sum + p.amountUsdc, 0),
    cycleCount: cycles.length,
    rebalanceCount: cycles.filter(c => c.executionResult?.executed).length,
  });
}
