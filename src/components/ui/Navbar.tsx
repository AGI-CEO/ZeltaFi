'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWalletButton } from './ConnectWalletButton';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/#agents', label: 'Agents' },
  { href: '/#zelta', label: '$ZELTA' },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-[var(--bg-void)] font-black text-sm">Z</span>
          </div>
          <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
            ZeltaFi
          </span>
        </Link>

        {/* Nav links - centered */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = link.href === '/'
              ? pathname === '/'
              : pathname.startsWith(link.href.replace('/#', '/'));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${isActive
                    ? 'text-[var(--text-primary)] bg-[var(--bg-surface-hover)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: CTA + Wallet */}
        <div className="flex items-center gap-3">
          {pathname !== '/onboard' && (
            <Link
              href="/onboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 transition-all duration-200"
            >
              Start Earning
              <span className="text-emerald-400/60">→</span>
            </Link>
          )}
          <ConnectWalletButton compact />
        </div>
      </div>
    </header>
  );
}
