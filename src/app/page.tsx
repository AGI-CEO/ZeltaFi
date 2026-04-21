import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white p-6">
      <h1 className="text-5xl font-bold mb-4 tracking-tight">ZeltaFi</h1>
      <p className="text-gray-400 max-w-lg text-center mb-8 text-lg">
        Autonomous DeFi yield optimizer using x402 nanopayments and Reflexion self-improvement loops.
      </p>
      
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl w-full max-w-2xl mb-8 font-mono text-sm">
        <h3 className="text-amber-400 mb-4 font-bold">Traditional ETH Gas vs. Arc Nanopayments</h3>
        <ul className="space-y-2 text-gray-300">
          <li className="flex justify-between"><span>Operation</span><span className="text-gray-500">ETH Mainnet</span><span className="text-white">Arc</span></li>
          <li className="flex justify-between border-t border-gray-800 pt-2"><span>Cost per yield query</span><span className="text-red-400">$1–$10</span><span className="text-green-400">$0.001</span></li>
          <li className="flex justify-between border-t border-gray-800 pt-2"><span>Cost per rebalance</span><span className="text-red-400">$5–$50</span><span className="text-green-400">$0.005</span></li>
          <li className="flex justify-between border-t border-gray-800 pt-2 pb-2"><span>10 queries/hour overhead</span><span className="text-red-400">$10–$100</span><span className="text-green-400">$0.01</span></li>
          <li className="flex justify-between border-t border-gray-800 pt-2"><span>Viable for &lt;$1,000 deposits</span><span className="text-red-400">❌ Never</span><span className="text-green-400">✅ Always</span></li>
        </ul>
      </div>

      <Link href="/dashboard" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors">
        Enter Dashboard
      </Link>
    </div>
  );
}
