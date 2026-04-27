'use client';

import { useState, useEffect, useCallback } from 'react';

const ARC_TESTNET = {
  chainId: '0x1E2', // 482 in hex
  chainName: 'Arc Testnet',
  nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
  rpcUrls: ['https://rpc.arc-testnet.circle.com'],
  blockExplorerUrls: ['https://explorer.arc-testnet.circle.com'],
};

export function ConnectWalletButton({ compact = false }: { compact?: boolean }) {
  const [address, setAddress] = useState<string | null>(null);
  const [chainName, setChainName] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Check for existing connection on mount
  useEffect(() => {
    if (!mounted) return;
    const eth = (window as any).ethereum;
    if (!eth) return;

    eth.request({ method: 'eth_accounts' })
      .then((accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          updateChainName(eth);
        }
      })
      .catch(() => {});

    // Listen for account/chain changes
    eth.on?.('accountsChanged', (accounts: string[]) => {
      setAddress(accounts.length > 0 ? accounts[0] : null);
    });
    eth.on?.('chainChanged', () => updateChainName(eth));
  }, [mounted]);

  const updateChainName = async (eth: any) => {
    try {
      const chainId = await eth.request({ method: 'eth_chainId' });
      setChainName(chainId === ARC_TESTNET.chainId ? 'Arc Testnet' : `Chain ${parseInt(chainId, 16)}`);
    } catch { setChainName(null); }
  };

  const connect = useCallback(async () => {
    const eth = (window as any).ethereum;
    if (!eth) {
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    setConnecting(true);
    try {
      const accounts: string[] = await eth.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        // Try to switch to Arc Testnet
        try {
          await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: ARC_TESTNET.chainId }] });
        } catch (switchErr: any) {
          if (switchErr.code === 4902) {
            await eth.request({ method: 'wallet_addEthereumChain', params: [ARC_TESTNET] });
          }
        }
        await updateChainName(eth);
      }
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setConnecting(false);
      setShowMenu(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setChainName(null);
    setShowMenu(false);
  }, []);

  if (!mounted) {
    return (
      <button className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-500 to-cyan-500 text-white opacity-50">
        Connect Wallet
      </button>
    );
  }

  const truncated = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';

  // ─── Connected State ───
  if (address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex items-center gap-2.5 px-4 py-2 rounded-xl glass-strong hover:bg-[var(--bg-surface-hover)] transition-all duration-300"
        >
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-50" />
          </div>
          <span className="text-xs font-mono text-[var(--text-primary)] font-medium">{truncated}</span>
          {chainName && (
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {chainName}
            </span>
          )}
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-2 z-50 w-56 glass-strong p-3 rounded-xl space-y-2 animate-slide-in-top">
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Connected Wallet</div>
              <div className="glass-surface p-2.5 rounded-lg">
                <div className="text-xs font-mono text-[var(--text-secondary)] break-all">{address}</div>
              </div>
              <button
                onClick={disconnect}
                className="w-full py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
              >
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // ─── Disconnected State ───
  const hasMetaMask = typeof window !== 'undefined' && !!(window as any).ethereum;

  return (
    <div className="relative">
      <button
        onClick={hasMetaMask ? connect : () => setShowMenu(!showMenu)}
        disabled={connecting}
        className={`relative px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-300 overflow-hidden
          ${connecting
            ? 'glass-surface text-[var(--text-muted)] cursor-wait'
            : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]'
          }`}
      >
        {connecting ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Connecting...
          </span>
        ) : (
          <span className="relative z-10 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2.5" />
              <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
            </svg>
            Connect Wallet
          </span>
        )}
      </button>

      {showMenu && !connecting && !hasMetaMask && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 w-64 glass-strong p-3 rounded-xl space-y-2 animate-slide-in-top">
            <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">No Wallet Detected</div>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
            >
              <span className="text-lg">🦊</span>
              <div>
                <div className="font-semibold">Install MetaMask</div>
                <div className="text-[10px] text-[var(--text-muted)]">Browser extension</div>
              </div>
            </a>
            <div className="pt-2 border-t border-[var(--border-subtle)]">
              <p className="text-[9px] text-[var(--text-muted)] text-center">Connects to Arc Testnet (Chain 482)</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
