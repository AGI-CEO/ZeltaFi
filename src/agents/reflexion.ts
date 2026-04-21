import { GoogleGenAI } from '@google/genai';
import { AgentCycle } from '../types';
import { getReflexionMemory, updateReflexionMemory, getRecentCycles } from '../lib/db';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'mock_key' });

export async function runReflexionAgent(completedCycle: AgentCycle): Promise<void> {
  const recentCycles = await getRecentCycles(10);  // Last 10 cycles for context
  const currentMemory = await getReflexionMemory();

  const performanceData = recentCycles.map(c => ({
    decision: c.optimizerDecision,
    executed: c.executionResult?.executed,
    actualApyImprovement: c.executionResult?.executed 
      ? (c.optimizerDecision?.deltaApyBps ?? 0) 
      : 0,
    feeChargedUsdc: c.userFeeChargedUsdc,
    netGainActual: c.executionResult?.executed 
      ? (c.optimizerDecision?.estimatedNetGainUsdc ?? 0) - c.userFeeChargedUsdc 
      : 0,
  }));

  const reflexionPrompt = `
You are a self-improving AI agent reviewer. Analyze the following recent performance data for a DeFi yield optimizer agent and improve its system prompt.

## Recent Performance (last \${recentCycles.length} cycles):
\${JSON.stringify(performanceData, null, 2)}

## Current Optimizer System Prompt:
\${currentMemory.improvedSystemPrompt}

## Current Prompt Version: \${currentMemory.version}

## Your Task:
1. CRITIQUE: Identify specific decision patterns that were suboptimal. Were there unnecessary rebalances? Missed opportunities? Overly conservative skips?
2. DIAGNOSE: What did the prompt cause the optimizer to miss or get wrong?
3. IMPROVE: Write an improved version of the optimizer system prompt that corrects these issues. Keep all CRITICAL RULE blocks. Only refine the judgment guidance.

Return JSON:
{
  "critique": "specific analysis of what went wrong or right",
  "improvedSystemPrompt": "the full improved system prompt text",
  "performanceMetrics": {
    "avgDeltaApyBpsAchieved": number,
    "falseRebalanceRate": number,
    "feeToValueRatio": number
  }
}
`;

  let result: any = {
      critique: "Mock critique due to missing Gemini API key.",
      improvedSystemPrompt: currentMemory.improvedSystemPrompt,
      performanceMetrics: currentMemory.performanceMetrics,
  };

  try {
      if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'mock_key' && process.env.GEMINI_API_KEY !== 'your_gemini_api_key') {
          const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: [{ role: 'user', parts: [{ text: reflexionPrompt }] }],
            config: { responseMimeType: 'application/json' },
          });
          result = JSON.parse(response.text ?? '{}');
      }
  } catch (e) {
      console.warn("Reflexion agent failed. Falling back to current memory.", e);
  }

  await updateReflexionMemory({
    version: currentMemory.version + 1,
    critique: result.critique || 'Default system fallback critique',
    improvedSystemPrompt: result.improvedSystemPrompt || currentMemory.improvedSystemPrompt,
    performanceMetrics: result.performanceMetrics || currentMemory.performanceMetrics,
    updatedAt: new Date().toISOString(),
  });
}
