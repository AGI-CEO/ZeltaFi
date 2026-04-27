import type { Metadata } from "next";
import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";

export const metadata: Metadata = {
  title: "ZeltaFi — AI-Powered DeFi Yield & $ZELTA Profit Sharing",
  description:
    "The Self-Driving Family Office. 7 autonomous AI agents construct multi-step yield strategies — delivering 10-14% target APY on USDC with self-custody, zero management fees, and mathematical net-gain proofs.",
  keywords: [
    "DeFi",
    "yield optimization",
    "autonomous agents",
    "USDC",
    "Circle",
    "Arc",
    "nanopayments",
    "AI finance",
    "$ZELTA",
    "profit sharing",
    "multi-agent AI",
  ],
  openGraph: {
    title: "ZeltaFi — AI-Powered DeFi Yield & $ZELTA Profit Sharing",
    description:
      "The Self-Driving Family Office. Double-digit stablecoin yields. Zero management fees. AI that only earns when you do. Own the alpha with $ZELTA.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-void)] text-[var(--text-primary)]" suppressHydrationWarning>
        <WalletProvider>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
