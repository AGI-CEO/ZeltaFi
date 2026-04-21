// @ts-nocheck
import { initiateUserControlledWalletsClient } from '@circle-fin/user-controlled-wallets';
import crypto from 'crypto';

const client = initiateUserControlledWalletsClient({
  apiKey: process.env.CIRCLE_API_KEY || 'mock_api_key',
});

// Assuming a hackathon mock if keys are not perfectly valid
export const CircleWalletsClient = {
  async createUser(userId: string) {
    if (process.env.CIRCLE_API_KEY === 'mock_api_key') return { data: { userId } };
    return client.createUser({ userId });
  },

  async createUserToken(userId: string) {
    if (process.env.CIRCLE_API_KEY === 'mock_api_key') return { data: { userToken: 'mockToken', encryptionKey: 'mockKey' } };
    return client.createUserToken({ userId });
  },

  async createWallet(userId: string) {
    return client.createWallets({
      idempotencyKey: crypto.randomUUID(),
      userId,
      blockchains: ['ARC-TESTNET'],
    });
  },

  async getWalletBalance(walletId: string) {
    if (process.env.CIRCLE_API_KEY === 'mock_api_key') return { data: { tokenBalances: [{ token: { symbol: 'USDC' }, amount: '1000.00' }] } };
    return client.getWalletTokenBalance({ walletId });
  },

  async executeContractTransaction(params: {
    walletId: string;
    contractAddress: `0x${string}`;
    abiFunctionSignature: string;
    abiParameters: (string | number)[];
  }) {
    if (process.env.CIRCLE_API_KEY === 'mock_api_key') {
      console.log(`[MOCK] Executed contract txn: ${params.abiFunctionSignature} on ${params.contractAddress}`);
      return `0xmocktxhash_${crypto.randomUUID().slice(0, 8)}`;
    }
    
    const response = await client.createTransaction({
      walletId: params.walletId,
      amounts: ['0'],   // Token amounts handled in contract call
      destinationAddress: params.contractAddress,
      contractAbi: [{
        name: params.abiFunctionSignature.split('(')[0],
        type: 'function',
        inputs: [],
        outputs: [],
        stateMutability: 'nonpayable',
      }],
      callData: params.abiFunctionSignature,
      fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
    });
    return response.data?.transaction?.txHash ?? null;
  },
};
