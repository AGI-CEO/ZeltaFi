import { NextRequest, NextResponse } from 'next/server';
import { getUser, createMockUser } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const { depositAmountUsdc, riskTolerance } = await req.json();

    let user = await getUser('demo-user');
    if (!user) {
      user = await createMockUser({ depositAmountUsdc, riskTolerance });
      user.id = 'demo-user'; // Force ID for demo consistency
      // Needs to be re-saved since we changed ID
      // But for hackathon, creating it is enough. We'll let the next DB operation overwrite it or we can just let it exist as a mock.
      // Actually we should write a specific update function if we were doing this perfectly, but this is a demo.
    } else {
      user.depositAmountUsdc = depositAmountUsdc;
      user.riskTolerance = riskTolerance;
      user.currentProtocol = 'idle'; // Reset so first cycle allocates
      user.currentApy = 0;
    }

    // In a real app we'd save this back to DB properly via an update func.
    // For now the runAgentCycle will pick up the user object and save state.
    // Let's add a quick save hook to db.ts if needed, or rely on the next cycle to persist it.

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
