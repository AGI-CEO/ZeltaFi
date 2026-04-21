import { CircleWalletsClient } from '../lib/circle/wallets';
import { nanopaymentClient } from '../lib/circle/nanopayments';
import { OptimizerDecision, ExecutionResult, User } from '../types';

export async function runExecutionAgent(
  decision: OptimizerDecision,
  user: User,
  cycleId: string
): Promise<ExecutionResult> {
  if (!decision.shouldRebalance || !decision.targetProtocol) {
    return {
      executed: false,
      fromProtocol: user.currentProtocol,
      toProtocol: user.currentProtocol,
      amountUsdc: user.depositAmountUsdc,
      arcTxHash: null,
      feeChargedTxHash: null,
      actualGasCost: 0,
      timestampMs: Date.now(),
    };
  }

  // Determine protocol addresses
  const aavePool = (process.env.AAVE_POOL_ADDRESS || '0xmockaave') as `0x${string}`;
  const morphoPool = (process.env.MORPHO_POOL_ADDRESS || '0xmockmorpho') as `0x${string}`;
  const moonwellPool = (process.env.MOONWELL_POOL_ADDRESS || '0xmockmoonwell') as `0x${string}`;

  const getContract = (proto: string): `0x${string}` => {
      if (proto === 'aave') return aavePool;
      if (proto === 'morpho') return morphoPool;
      return moonwellPool;
  }

  // Step 1: Withdraw from current protocol (if not idle)
  if (user.currentProtocol !== 'idle') {
    await CircleWalletsClient.executeContractTransaction({
      walletId: user.walletId,
      contractAddress: getContract(user.currentProtocol),
      abiFunctionSignature: 'withdraw(uint256,address,address)',
      abiParameters: [user.depositAmountUsdc * 1e6, user.walletAddress, user.walletAddress],
    });
  }

  // Step 2: Deposit into target protocol
  const usdcAddress = (process.env.USDC_CONTRACT_ADDRESS || '0xmockusdc') as `0x${string}`;
  const depositTxHash = await CircleWalletsClient.executeContractTransaction({
    walletId: user.walletId,
    contractAddress: getContract(decision.targetProtocol),
    abiFunctionSignature: 'supply(address,uint256,address,uint16)',
    abiParameters: [usdcAddress, user.depositAmountUsdc * 1e6, user.walletAddress, 0],
  });

  // Step 3: Charge user fee via Circle Nanopayment
  const feeChargedTxHash = await nanopaymentClient.transfer({
    fromWalletId: user.walletId,
    toAddress: process.env.AGENT_FEE_RECIPIENT_ADDRESS || '0xmockagentreceptient',
    amountUsdc: parseFloat(process.env.REBALANCE_FEE_USDC || '0.005'),
    memo: `ZeltaFi rebalance fee - cycle ${cycleId}`,
  });

  return {
    executed: true,
    fromProtocol: user.currentProtocol,
    toProtocol: decision.targetProtocol,
    amountUsdc: user.depositAmountUsdc,
    arcTxHash: depositTxHash,
    feeChargedTxHash,
    actualGasCost: 0,
    timestampMs: Date.now(),
  };
}
