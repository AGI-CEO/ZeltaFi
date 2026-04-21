import { NextRequest, NextResponse } from 'next/server';
import { runAgentCycle } from '../../../../agents/orchestrator';
import { getUser } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    const user = await getUser(userId);
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Run cycle asynchronously, return cycle ID immediately for polling
    // Normally this is asynchronous fire and forget, but we await it to catch initial errors
    runAgentCycle(user).catch(console.error);

    return NextResponse.json({ cycleId: 'started', status: 'started' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
