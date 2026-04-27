'use client';

interface StatusPulseProps {
  color?: 'emerald' | 'amber' | 'violet' | 'cyan' | 'red' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  label?: string;
}

const colorMap = {
  emerald: { dot: 'bg-emerald-400', ring: 'bg-emerald-400/30' },
  amber: { dot: 'bg-amber-400', ring: 'bg-amber-400/30' },
  violet: { dot: 'bg-violet-400', ring: 'bg-violet-400/30' },
  cyan: { dot: 'bg-cyan-400', ring: 'bg-cyan-400/30' },
  red: { dot: 'bg-red-400', ring: 'bg-red-400/30' },
  gray: { dot: 'bg-gray-500', ring: 'bg-gray-500/30' },
};

const sizeMap = {
  sm: { dot: 'w-1.5 h-1.5', ring: 'w-3 h-3' },
  md: { dot: 'w-2 h-2', ring: 'w-4 h-4' },
  lg: { dot: 'w-2.5 h-2.5', ring: 'w-5 h-5' },
};

export function StatusPulse({
  color = 'emerald',
  size = 'md',
  active = true,
  label,
}: StatusPulseProps) {
  const colors = colorMap[color];
  const sizes = sizeMap[size];

  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative inline-flex">
        {active && (
          <span
            className={`absolute inset-0 rounded-full ${colors.ring} animate-ping`}
            style={{ animationDuration: '1.5s' }}
          />
        )}
        <span
          className={`relative rounded-full ${colors.dot} ${sizes.dot}`}
        />
      </span>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
          {label}
        </span>
      )}
    </span>
  );
}
