'use client';

import { GlassCard } from '../ui/GlassCard';

export type RiskLevel = 'conservative' | 'balanced' | 'aggressive';

interface RiskSelectorProps {
  value: RiskLevel;
  onChange: (value: RiskLevel) => void;
}

const riskConfig = [
  {
    id: 'conservative',
    label: 'Conservative',
    icon: '🛡️',
    description: 'Blue-chip protocols only. Only rebalances for >0.50% APY improvements.',
    color: 'emerald'
  },
  {
    id: 'balanced',
    label: 'Balanced',
    icon: '⚖️',
    description: 'Standard risk-adjusted yields. Rebalances for >0.25% APY improvements.',
    color: 'cyan'
  },
  {
    id: 'aggressive',
    label: 'Aggressive',
    icon: '🚀',
    description: 'Chases highest yields across all verified protocols. High rebalance frequency.',
    color: 'violet'
  }
] as const;

export function RiskSelector({ value, onChange }: RiskSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {riskConfig.map((risk) => {
        const isSelected = value === risk.id;
        
        return (
          <div
            key={risk.id}
            onClick={() => onChange(risk.id)}
            className="cursor-pointer h-full"
          >
            <GlassCard
              glowColor={isSelected ? risk.color : 'none'}
              hover={true}
              className={`h-full transition-all duration-300 ${
                isSelected 
                  ? `border-[var(--color-${risk.color})] bg-[var(--bg-surface-hover)]` 
                  : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">{risk.icon}</span>
                  <h3 className={`font-semibold capitalize ${
                    isSelected ? `text-${risk.color}-400` : 'text-[var(--text-primary)]'
                  }`}>
                    {risk.label}
                  </h3>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed flex-1">
                  {risk.description}
                </p>
                
                {/* Checkbox indicator */}
                <div className="mt-4 flex justify-end">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected 
                      ? `border-${risk.color}-500 bg-${risk.color}-500/20 text-${risk.color}-400` 
                      : 'border-[var(--border-base)]'
                  }`}>
                    {isSelected && <span className="text-xs">✓</span>}
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        );
      })}
    </div>
  );
}
