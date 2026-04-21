import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { CircleWalletsClient } from '../../../../lib/circle/wallets';
import { createUser } from '../../../../lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { riskTolerance } = body;

    // Create Circle user
    const userId = crypto.randomUUID();
    await CircleWalletsClient.createUser(userId);

    // Create user token (required before wallet creation)
    const tokenResponse = await CircleWalletsClient.createUserToken(userId);

    // Create wallet set
    const walletResponse = await CircleWalletsClient.createWallet(userId);
    const wallet = walletResponse.data?.wallets?.[0];
    
    // Store in local DB
    const user = await createUser({
      id: crypto.randomUUID(),
      circleUserId: userId,
      walletId: wallet?.id ?? '',
      walletAddress: wallet?.address as `0x${string}` ?? '0x',
      depositAmountUsdc: 0,
      currentProtocol: 'idle',
      currentApy: 0,
      riskTolerance: riskTolerance || 'balanced',
      agentActive: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      userId: user.id,
      walletAddress: wallet?.address,
      userToken: tokenResponse.data?.userToken,  // Return to client for PIN setup
      encryptionKey: tokenResponse.data?.encryptionKey,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
