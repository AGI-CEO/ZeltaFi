'use client';

import Link from 'next/link';
import { AnimatedCounter } from '../ui/AnimatedCounter';
import { StatusPulse } from '../ui/StatusPulse';

interface HeaderBarProps {
  totalPayments: number;
  totalUsdc: number;
  walletAddress?: string;
  isAgentActive?: boolean;
}

export function HeaderBar({
  totalPayments,
  totalUsdc,
  walletAddress = '0xdemo...wallet',
  isAgentActive = true,
}: HeaderBarProps) {
  const truncatedAddress = walletAddress.length > 12
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-[var(--bg-void)] font-black text-xs">Z</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
            ZeltaFi
          </span>
        </Link>

        {/* Center: Nanopayment Counter */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              value={totalPayments}
              className="text-2xl font-bold text-emerald-400"
            />
            <span className="text-xs text-[var(--text-muted)]">
              nanopayments on Arc
            </span>
          </div>
          <span className="text-[var(--text-dim)]">·</span>
          <AnimatedCounter
            value={totalUsdc}
            decimals={4}
            prefix="$"
            suffix=" USDC"
            className="text-xs text-[var(--text-secondary)]"
          />
        </div>

        {/* Right: Wallet + Status */}
        <div className="flex items-center gap-3">
          <StatusPulse
            color={isAgentActive ? 'emerald' : 'gray'}
            active={isAgentActive}
            size="sm"
          />
          <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">
            {truncatedAddress}
          </span>
        </div>
      </div>
    </header>
  );
}
