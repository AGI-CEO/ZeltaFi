import { runAgentCycle } from '../src/agents/orchestrator';
import { createMockUser, getUser } from '../src/lib/db';

async function seedDemoTransactions() {
  console.log('--- ZeltaFi Demo Seeder ---');
  console.log('Running 20 cycles to generate 50+ real Arc Testnet transactions...');

  let user = await getUser('demo-user');
  if (!user) {
    user = await createMockUser({
      depositAmountUsdc: 1000,
      riskTolerance: 'balanced',
    });
    // Force ID to match our demo user
    user.id = 'demo-user';
  }

  // Force reset user state so they reallocate and we get a fee
  user.currentProtocol = 'idle';
  user.currentApy = 0;

  let totalQueries = 0;
  let totalRebalances = 0;

  for (let i = 0; i < 20; i++) {
    process.stdout.write(`Cycle ${i + 1}/20: `);
    try {
      await runAgentCycle(user);
      
      // Update our user reference since it might have been modified
      const updatedUser = await getUser('demo-user');
      if (updatedUser) {
          user = updatedUser;
      }
      
      totalQueries += 3; // 3 API calls per cycle
      if (i === 0) totalRebalances++; // We forced idle, so first cycle should rebalance

      console.log('✅ Completed');
    } catch (err: any) {
      console.log(`❌ Failed: ${err.message}`);
    }
    
    // Wait 2 seconds between cycles to avoid rate limits
    if (i < 19) {
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  const estimatedTxns = totalQueries + totalRebalances;
  console.log('---------------------------');
  console.log(`Done! Estimated new transactions: ${estimatedTxns}`);
  console.log('Check the dashboard to verify the live count.');
}

seedDemoTransactions();
