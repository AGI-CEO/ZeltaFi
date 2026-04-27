'use client';

import { CSSProperties, ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'emerald' | 'amber' | 'violet' | 'cyan' | 'red' | 'none';
  hover?: boolean;
  padding?: 'sm' | 'md' | 'lg';
  style?: CSSProperties;
}

const paddingMap = {
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

const glowMap = {
  emerald: 'glow-emerald',
  amber: 'glow-amber',
  violet: 'glow-violet',
  cyan: 'glow-cyan',
  red: 'glow-red',
  none: '',
};

export function GlassCard({
  children,
  className = '',
  glowColor = 'none',
  hover = false,
  padding = 'md',
  style,
}: GlassCardProps) {
  return (
    <div
      className={`
        glass ${paddingMap[padding]} ${glowMap[glowColor]}
        ${hover ? 'transition-all duration-300 hover:bg-[var(--bg-surface-hover)] hover:border-[var(--border-active)] hover:scale-[1.01]' : ''}
        ${className}
      `.trim()}
      style={style}
    >
      {children}
    </div>
  );
}
