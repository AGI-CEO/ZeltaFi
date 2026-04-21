import { runAgentCycle } from '../src/agents/orchestrator';
import { createMockUser } from '../src/lib/db'; 
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function seedDemoTransactions() {
  const user = await createMockUser({
    depositAmountUsdc: 1000,
    riskTolerance: 'balanced',
  });
  
  console.log(`User created: ${user.id}. Starting demo transaction seeding...`);
  
  for (let i = 0; i < 20; i++) {
    console.log(`Running cycle ${i + 1}/20...`);
    try {
      await runAgentCycle(user);
    } catch (e) {
      console.error(`Cycle ${i + 1} failed:`, e);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
  
  console.log('Done. Check dashboard for transaction count.');
}

seedDemoTransactions();
