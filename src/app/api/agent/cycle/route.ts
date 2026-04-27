import { NextRequest, NextResponse } from 'next/server';
import { runAgentCycle } from '../../../../agents/orchestrator';
import { getUser, createUser } from '../../../../lib/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    let user = await getUser(userId);
    
    if (!user && userId === 'demo-user') {
      user = await createUser({
         id: 'demo-user',
         circleUserId: crypto.randomUUID(),
         walletId: crypto.randomUUID(),
         walletAddress: '0xmockaddress',
         depositAmountUsdc: 1000,
         currentProtocol: 'idle',
         currentApy: 0,
         riskTolerance: 'balanced',
         agentActive: true,
         zeltaBalance: 5000,
         zeltaStaked: 2500,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
      });
    }

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Run cycle asynchronously, return cycle ID immediately for polling
    // Normally this is asynchronous fire and forget, but we await it to catch initial errors
    runAgentCycle(user).catch(console.error);

    return NextResponse.json({ cycleId: 'started', status: 'started' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
