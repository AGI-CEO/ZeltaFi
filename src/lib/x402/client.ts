import axios from 'axios';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

interface X402PaymentConfig {
  amount: string;    // USDC amount as string e.g. "0.001"
  toAddress: string;
  description: string;
}

interface X402Client {
  pay: (config: X402PaymentConfig) => Promise<string>;  // Returns tx hash or receipt
  createPaymentHeader: (config: X402PaymentConfig) => Promise<string>;
}

export const x402Client: X402Client = {
  async pay(config: X402PaymentConfig): Promise<string> {
    if (!process.env.CIRCLE_API_KEY || process.env.CIRCLE_API_KEY === 'your_circle_api_key') {
       console.log(`[MOCK x402] Paid ${config.amount} USDC to ${config.toAddress} for ${config.description}`);
       return `0xmockx402hash_${Date.now()}`;
    }

    try {
      const response = await axios.post(
        `${process.env.CIRCLE_GATEWAY_FACILITATOR_URL}/settle`,
        {
          payTo: config.toAddress,
          amount: config.amount,
          currency: 'USDC',
          network: 'ARC-TESTNET',
          memo: config.description,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.CIRCLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data?.txHash ?? 'pending';
    } catch(err) {
      console.warn("x402 payment failed. Make sure Gateway API keys are active. Falling back to mock.");
      return `0xmockx402hash_fallback_${Date.now()}`;
    }
  },

  async createPaymentHeader(config: X402PaymentConfig): Promise<string> {
    const account = privateKeyToAccount((process.env.AGENT_PRIVATE_KEY as `0x${string}`) || '0x0000000000000000000000000000000000000000000000000000000000000000');
    // Return as base64 header
    return btoa(JSON.stringify({ from: account.address, to: config.toAddress, value: config.amount }));
  },
};
