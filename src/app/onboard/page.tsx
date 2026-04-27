'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '../../components/ui/Navbar';
import { ConnectWalletButton } from '../../components/ui/ConnectWalletButton';
import { RiskSelector, RiskLevel } from '../../components/onboard/RiskSelector';
import { DepositInput } from '../../components/onboard/DepositInput';
import { AgentTeamReveal } from '../../components/onboard/AgentTeamReveal';
import { GlassCard } from '../../components/ui/GlassCard';

const STEPS = [
  { label: 'Connect', icon: '💼' },
  { label: 'Strategy', icon: '⚖️' },
  { label: 'Your Team', icon: '🤖' },
  { label: 'Fund', icon: '💰' },
];

export default function Onboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(1);
  const [riskTolerance, setRiskTolerance] = useState<RiskLevel>('balanced');
  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>();

  useEffect(() => { setMounted(true); }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed = () => {
    if (step === 1) return true; // Wallet connection is encouraged but not required for demo
    if (step === 2) return true;
    if (step === 3) return true;
    if (step === 4) return depositAmount >= 100;
    return false;
  };

  const handleNext = () => {
    if (step < 4) setStep(prev => (prev + 1) as 1 | 2 | 3 | 4);
  };

  const handleBack = () => {
    if (step > 1) setStep(prev => (prev - 1) as 1 | 2 | 3 | 4);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await fetch('/api/user/onboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          depositAmountUsdc: depositAmount,
          riskTolerance,
          walletAddress: address || '0xdemo',
        }),
      });
      await new Promise(r => setTimeout(r, 2000));
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
      setIsSubmitting(false);
    }
  };

  // APY projections by risk level
  const apyProjections: Record<RiskLevel, { low: number; high: number }> = {
    conservative: { low: 9.5, high: 11.0 },
    balanced: { low: 11.0, high: 13.0 },
    aggressive: { low: 12.5, high: 15.5 },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-void)] bg-mesh flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col pt-24">
        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 ${
                  i + 1 === step ? 'glass-strong text-[var(--text-primary)]' :
                  i + 1 < step ? 'text-emerald-400' : 'text-[var(--text-muted)]'
                }`}>
                  <span className="text-sm">{i + 1 < step ? '✓' : s.icon}</span>
                  <span className="text-xs font-semibold hidden sm:inline">{s.label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-12 sm:w-20 h-px mx-1 transition-colors ${
                    i + 1 < step ? 'bg-emerald-400' : 'bg-[var(--border-subtle)]'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step title */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
            {step === 1 && 'Connect Your Wallet.'}
            {step === 2 && 'Choose Your Strategy.'}
            {step === 3 && 'Meet Your AI Team.'}
            {step === 4 && 'Fund & Launch.'}
          </h1>
          <p className="text-[var(--text-secondary)] text-lg">
            {step === 1 && 'Your keys, always. Connect your Web3 wallet to get started.'}
            {step === 2 && 'Set your risk mandate. Your AI team adapts strategy construction to your tolerance.'}
            {step === 3 && '7 specialized AI agents, ready to construct yield strategies 24/7.'}
            {step === 4 && 'Deploy USDC and activate your autonomous agent team.'}
          </p>
        </div>

        {/* Step content */}
        <div className="flex-1 flex flex-col items-center animate-fade-in" key={step}>
          {step === 1 && (
            <div className="max-w-lg w-full">
              <GlassCard padding="lg" className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl mb-4">💼</div>
                  <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Self-Custody Wallet
                  </h2>
                  <p className="text-sm text-[var(--text-secondary)]">
                    ZeltaFi never holds your funds. Connect your wallet and retain full control at all times.
                  </p>
                </div>

                <div className="flex justify-center">
                  <ConnectWalletButton />
                </div>

                {isConnected && address && (
                  <div className="glass-surface p-4 rounded-xl text-center animate-slide-in-bottom">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-semibold text-emerald-400">Connected</span>
                    </div>
                    <p className="text-xs font-mono text-[var(--text-muted)]">{address}</p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 pt-2">
                  {[
                    { icon: '🔒', label: 'Self-custody' },
                    { icon: '⛽', label: 'Gas-free on Arc' },
                    { icon: '🛡️', label: 'Net-gain guard' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <div className="text-lg mb-1">{item.icon}</div>
                      <div className="text-[10px] text-[var(--text-muted)]">{item.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {step === 2 && (
            <div className="w-full max-w-xl">
              <RiskSelector value={riskTolerance} onChange={setRiskTolerance} />
              {/* APY projection */}
              <div className="mt-6 glass-surface p-4 rounded-xl text-center">
                <div className="text-xs text-[var(--text-muted)] mb-2">Projected APY Range</div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {apyProjections[riskTolerance].low}% – {apyProjections[riskTolerance].high}%
                </div>
                <div className="text-[10px] text-[var(--text-muted)] mt-1">
                  Based on current market conditions and {riskTolerance} strategy
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <AgentTeamReveal />
          )}

          {step === 4 && (
            <div className="max-w-xl w-full space-y-6">
              <DepositInput value={depositAmount} onChange={setDepositAmount} />

              {/* Projected earnings card */}
              <GlassCard padding="md" className="border-emerald-500/20">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
                  Projected Annual Earnings
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-emerald-400">
                      ${(depositAmount * apyProjections[riskTolerance].low / 100).toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">Conservative</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-cyan-400">
                      ${(depositAmount * (apyProjections[riskTolerance].low + apyProjections[riskTolerance].high) / 200).toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">Expected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold font-mono text-violet-400">
                      ${(depositAmount * apyProjections[riskTolerance].high / 100).toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">Optimistic</div>
                  </div>
                </div>
              </GlassCard>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-12 pt-6 border-t border-[var(--border-subtle)] flex items-center justify-between">
          {step > 1 ? (
            <button onClick={handleBack} className="px-6 py-3 rounded-xl text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              ← Back
            </button>
          ) : <div />}

          <button
            onClick={step === 4 ? handleSubmit : handleNext}
            disabled={!canProceed() || isSubmitting}
            className={`px-8 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
              !canProceed() || isSubmitting
                ? 'glass-surface text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Deploying AI Agents...
              </span>
            ) : step === 4 ? (
              'Launch Agent Team 🚀'
            ) : (
              'Continue →'
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
