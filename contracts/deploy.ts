import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const arcTestnet = {
  id: parseInt(process.env.ARC_CHAIN_ID!),
  name: 'Arc Testnet',
  rpcUrls: { default: { http: [process.env.ARC_RPC_URL!] } },
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
};

async function deploy() {
  const account = privateKeyToAccount(process.env.AGENT_PRIVATE_KEY as `0x${string}`);
  
  const walletClient = createWalletClient({
    account,
    chain: arcTestnet as any,
    transport: http(process.env.ARC_RPC_URL),
  });

  // Load compiled Vyper ABI and bytecode
  let identityArtifact;
  try {
    identityArtifact = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/IdentityRegistry.json'), 'utf8'));
  } catch (error) {
    console.warn("Vyper artifacts not found. Mocking deployment...");
    console.log("Mock IdentityRegistry deployed at tx: 0xmockdeploytxhash");
    return;
  }
  
  // Deploy IdentityRegistry
  const identityTxHash = await walletClient.deployContract({
    abi: identityArtifact.abi,
    bytecode: identityArtifact.bytecode,
    account,
    chain: arcTestnet as any,
  } as any);

  console.log('IdentityRegistry deployed at tx:', identityTxHash);
}

deploy().catch(console.error);
