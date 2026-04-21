'use client';

import { AgentStatusCard } from '../../components/dashboard/AgentStatusCard';
import { LiveTransactionFeed } from '../../components/dashboard/LiveTransactionFeed';
import { PaymentFlowDiagram } from '../../components/dashboard/PaymentFlowDiagram';
import { YieldMetricsPanel } from '../../components/dashboard/YieldMetricsPanel';
import { useAgentStatus } from '../../hooks/useAgentStatus';
import { useTransactions } from '../../hooks/useTransactions';

export default function Dashboard() {
  const { status, triggerCycle, isRunning } = useAgentStatus();
  const { transactions, stats } = useTransactions();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      {/* Header with live counter */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">ZeltaFi</h1>
          <p className="text-gray-400 text-sm">Autonomous DeFi yield optimizer</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-mono font-bold text-green-400">
            {stats?.totalPaymentCount?.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">nanopayments settled on Arc</div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <PaymentFlowDiagram currentPhase={status?.phase} />
          <YieldMetricsPanel status={status} />
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <AgentStatusCard 
            status={status}
            isRunning={isRunning || false}
            onTriggerCycle={triggerCycle}
          />
          <LiveTransactionFeed transactions={transactions} />
        </div>
      </div>
    </div>
  );
}
