import Link from "next/link";

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Learn</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Learn</h1>
        <p className="text-gray-400 mb-8">Texas Hold'em fundamentals and strategy.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <LearnCard href="/learn/basics" title="Poker Basics" description="Hand rankings, game flow, betting actions, and core concepts." icon="📖" />
          <LearnCard href="/learn/betting" title="Betting Strategies" description="C-bet, 3-bet, squeeze, check-raise — when and how much to bet." icon="💰" />
        </div>
      </div>
    </div>
  );
}

function LearnCard({ href, title, description, icon }: {
  href: string; title: string; description: string; icon: string;
}) {
  return (
    <Link href={href} className="group block p-6 rounded-xl border border-gray-800 bg-[#161B22] hover:border-gray-700 hover:bg-[#1C2128] transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2 text-green-400">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </Link>
  );
}
