'use client';

interface YieldMetricsPanelProps {
  status: any;
}

export function YieldMetricsPanel({ status }: YieldMetricsPanelProps) {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-800 flex items-center justify-center">
      <div className="text-gray-400 text-sm">
        Yield Metrics detailed breakdown module (placeholder). Status: {status?.phase}
      </div>
    </div>
  );
}
