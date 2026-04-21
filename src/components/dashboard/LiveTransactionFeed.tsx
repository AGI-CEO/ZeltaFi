'use client';

import { NanopaymentRecord } from '../../types';

interface LiveTransactionFeedProps {
  transactions: NanopaymentRecord[];
}

const purposeColors: Record<string, string> = {
  yield_query: 'text-blue-400',
  rebalance_fee: 'text-amber-400',
};

const purposeLabels: Record<string, string> = {
  yield_query: 'Yield query',
  rebalance_fee: 'Rebalance fee',
};

export function LiveTransactionFeed({ transactions }: LiveTransactionFeedProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
      <h2 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
        Live Nanopayments
      </h2>
      <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin">
        {transactions.slice(0, 50).map(tx => (
          <div key={tx.id} className="flex items-center justify-between py-1.5 border-b border-gray-800 last:border-0">
            <div>
              <span className={`text-xs font-medium ${purposeColors[tx.purpose]}`}>
                {purposeLabels[tx.purpose]}
              </span>
              <div className="text-xs text-gray-600 font-mono mt-0.5">
                {tx.arcTxHash ? `${tx.arcTxHash.slice(0, 6)}...${tx.arcTxHash.slice(-4)}` : 'pending'}
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-green-400 font-mono">
                $\{(tx.amountUsdc || 0).toFixed(4)} USDC
              </span>
              <div className="text-xs text-gray-600">
                {tx.settledAt ? new Date(tx.settledAt).toLocaleTimeString() : '...'}
              </div>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">
            No transactions yet. Start the agent to begin.
          </p>
        )}
      </div>
    </div>
  );
}
