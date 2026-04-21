'use client';

type Phase = 'scanning' | 'optimizing' | 'executing' | 'reflecting' | 'idle' | 'skipped';

interface PaymentFlowDiagramProps {
  currentPhase?: Phase;
}

const nodes = [
  { id: 'user', label: 'User Wallet', sublabel: 'USDC deposited', x: 50, y: 50 },
  { id: 'scanner', label: 'Scanner Agent', sublabel: 'Gemini Flash', x: 250, y: 20 },
  { id: 'aave', label: 'Aave API', sublabel: '$0.001 USDC', x: 450, y: 5 },
  { id: 'morpho', label: 'Morpho API', sublabel: '$0.001 USDC', x: 450, y: 50 },
  { id: 'moonwell', label: 'Moonwell API', sublabel: '$0.001 USDC', x: 450, y: 95 },
  { id: 'optimizer', label: 'Optimizer Agent', sublabel: 'Gemini Pro', x: 250, y: 80 },
  { id: 'executor', label: 'Execution Agent', sublabel: '$0.005 fee', x: 50, y: 120 },
  { id: 'reflexion', label: 'Reflexion Agent', sublabel: 'Self-improving', x: 250, y: 140 },
];

const phaseActiveNodes: Record<Phase, string[]> = {
  scanning: ['scanner', 'aave', 'morpho', 'moonwell'],
  optimizing: ['optimizer'],
  executing: ['executor', 'user'],
  reflecting: ['reflexion', 'optimizer'],
  idle: [],
  skipped: ['optimizer'],
};

export function PaymentFlowDiagram({ currentPhase = 'idle' }: PaymentFlowDiagramProps) {
  const activeNodes = phaseActiveNodes[currentPhase] ?? [];

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <h2 className="text-sm font-medium text-gray-400 mb-4 uppercase tracking-wider">
        Agent Payment Flow — Live
      </h2>
      <div className="relative h-48 w-full">
        {/* SVG-based flow visualization */}
        <svg viewBox="0 0 500 160" className="w-full h-full">
          {/* Edges (draw before nodes) */}
          <line x1="70" y1="50" x2="230" y2="35" stroke="#374151" strokeWidth="1" strokeDasharray="4"/>
          <line x1="270" y1="25" x2="430" y2="10" stroke={activeNodes.includes('aave') ? '#10b981' : '#374151'} strokeWidth={activeNodes.includes('aave') ? 2 : 1} />
          <line x1="270" y1="30" x2="430" y2="50" stroke={activeNodes.includes('morpho') ? '#10b981' : '#374151'} strokeWidth={activeNodes.includes('morpho') ? 2 : 1} />
          <line x1="270" y1="40" x2="430" y2="95" stroke={activeNodes.includes('moonwell') ? '#10b981' : '#374151'} strokeWidth={activeNodes.includes('moonwell') ? 2 : 1} />
          <line x1="250" y1="40" x2="250" y2="70" stroke={activeNodes.includes('optimizer') ? '#6366f1' : '#374151'} strokeWidth={activeNodes.includes('optimizer') ? 2 : 1} />
          <line x1="230" y1="90" x2="70" y2="115" stroke={activeNodes.includes('executor') ? '#f59e0b' : '#374151'} strokeWidth={activeNodes.includes('executor') ? 2 : 1} />
          <line x1="250" y1="100" x2="250" y2="130" stroke={activeNodes.includes('reflexion') ? '#8b5cf6' : '#374151'} strokeWidth={activeNodes.includes('reflexion') ? 2 : 1} />

          {/* Nodes */}
          {nodes.map(node => (
            <g key={node.id}>
              <rect
                x={node.x - 35} y={node.y - 12}
                width="70" height="24"
                rx="4"
                fill={activeNodes.includes(node.id) ? '#1e293b' : '#111827'}
                stroke={activeNodes.includes(node.id) ? '#10b981' : '#374151'}
                strokeWidth={activeNodes.includes(node.id) ? 1.5 : 1}
              />
              <text x={node.x} y={node.y + 1} textAnchor="middle" fill={activeNodes.includes(node.id) ? '#e2e8f0' : '#6b7280'} fontSize="7" fontWeight="500">
                {node.label}
              </text>
              <text x={node.x} y={node.y + 9} textAnchor="middle" fill="#4ade80" fontSize="5.5">
                {node.sublabel}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="mt-3 text-center">
        <span className={`text-xs font-mono px-2 py-1 rounded ${
          currentPhase === 'idle' ? 'bg-gray-800 text-gray-500' :
          currentPhase === 'skipped' ? 'bg-yellow-900/30 text-yellow-400' :
          'bg-green-900/30 text-green-400'
        }`}>
          {currentPhase === 'idle' ? '● IDLE — waiting for next cycle' :
           currentPhase === 'skipped' ? '⊘ REBALANCE SKIPPED — net gain below fee threshold' :
           `● ACTIVE — ${currentPhase.toUpperCase()}`}
        </span>
      </div>
    </div>
  );
}
