'use client';

interface AgentStatusCardProps {
  status: any;
  isRunning: boolean;
  onTriggerCycle: () => void;
}

export function AgentStatusCard({ status, isRunning, onTriggerCycle }: AgentStatusCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
        Agent Status
      </h2>
      
      {/* Current APY comparison */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Current APY</div>
          <div className="text-xl font-bold text-white">
            {((status?.currentApy ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Best Available</div>
          <div className="text-xl font-bold text-green-400">
            {((status?.bestAvailableApy ?? 0) / 100).toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Fee-to-value ratio */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Fee-to-Value Ratio</span>
          <span className="text-sm font-mono text-amber-400">
            {status?.feeToValueRatio ? `${(status.feeToValueRatio * 100).toFixed(1)}%` : '--'}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-1">
          Lower = more value delivered per fee charged
        </div>
      </div>

      {/* Reflexion version */}
      <div className="bg-gray-800 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Reflexion Version</span>
          <span className="text-sm font-mono text-purple-400">
            v{status?.promptVersion ?? 0}
          </span>
        </div>
        <div className="text-xs text-gray-600 mt-1 italic line-clamp-2">
          {status?.lastCritique ?? 'No critique yet'}
        </div>
      </div>

      {/* Trigger button */}
      <button
        onClick={onTriggerCycle}
        disabled={isRunning}
        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-all ${
          isRunning 
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-500 text-white'
        }`}
      >
        {isRunning ? '⟳ Agent running...' : '▶ Trigger Cycle Now'}
      </button>
    </div>
  );
}
