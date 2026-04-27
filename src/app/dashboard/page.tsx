'use client';

import { Navbar } from '../../components/ui/Navbar';
import { PortfolioSummary } from '../../components/dashboard/PortfolioSummary';
import { AgentOrchestrationVisualizer } from '../../components/dashboard/AgentOrchestrationVisualizer';
import { AIReasoningFeed } from '../../components/dashboard/AIReasoningFeed';
import { AgentStatusCard } from '../../components/dashboard/AgentStatusCard';
import { LiveTransactionFeed } from '../../components/dashboard/LiveTransactionFeed';
import { YieldMetricsPanel } from '../../components/dashboard/YieldMetricsPanel';
import { EconomicsPanel } from '../../components/dashboard/EconomicsPanel';
import { TokenomicsPanel } from '../../components/dashboard/TokenomicsPanel';
import { useAgentStatus } from '../../hooks/useAgentStatus';
import { useTransactions } from '../../hooks/useTransactions';

export default function Dashboard() {
  const { status, triggerCycle, isRunning } = useAgentStatus();
  const { transactions, stats } = useTransactions();

  const user = status?.user;
  const latestCycle = status?.latestCycle;
  const cycles = status?.recentCycles || [];
  const scanResults = latestCycle?.scanResults || [];

  return (
    <div className="min-h-screen bg-[var(--bg-void)] bg-mesh">
      <Navbar />

      <main className="pt-20 px-4 lg:px-6 pb-8 max-w-[1600px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_320px] gap-5">

          {/* ─── LEFT SIDEBAR ─── */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <PortfolioSummary
              balance={user?.depositAmountUsdc ?? 1000}
              currentApy={user?.currentApy ?? 0}
              currentProtocol={user?.currentProtocol ?? 'idle'}
              yieldEarned={0}
              isAgentActive={user?.agentActive ?? true}
            />

            {/* Quick Actions */}
            <div className="glass p-4 space-y-2">
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Quick Actions
              </h3>
              <button
                onClick={triggerCycle}
                disabled={isRunning || false}
                className={`w-full py-3 rounded-lg text-xs font-semibold transition-all duration-300 ${
                  isRunning
                    ? 'glass-surface text-[var(--text-muted)] cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]'
                }`}
              >
                {isRunning ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Agents Working...
                  </span>
                ) : '▶ Run Agent Cycle'}
              </button>
            </div>

            {/* $ZELTA Panel */}
            <TokenomicsPanel />
          </aside>

          {/* ─── CENTER MAIN ─── */}
          <section className="space-y-5 min-w-0">
            {/* Agent Pipeline */}
            <AgentOrchestrationVisualizer
              currentPhase={latestCycle?.phase || status?.phase}
              reasoning={latestCycle?.optimizerDecision?.reasoning}
            />

            {/* AI Reasoning Feed */}
            <AIReasoningFeed
              entries={latestCycle?.reasoningLog}
            />

            {/* Yield Market */}
            <YieldMetricsPanel
              scanResults={scanResults}
              currentProtocol={user?.currentProtocol}
            />

            {/* Economics Panel */}
            <EconomicsPanel
              totalTransactions={stats.totalPaymentCount}
              totalUsdcSpent={stats.totalUsdcFlowed}
            />
          </section>

          {/* ─── RIGHT SIDEBAR ─── */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <AgentStatusCard
              status={status}
              isRunning={isRunning || false}
              onTriggerCycle={triggerCycle}
              cycles={cycles}
            />
            <LiveTransactionFeed transactions={transactions} />
          </aside>

        </div>
      </main>
    </div>
  );
}
