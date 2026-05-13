import Link from "next/link";

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Tools</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Tools</h1>
        <p className="text-gray-400 mb-8">Your poker toolkit.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ToolCard href="/tools/hand-chart" title="Hand Explorer" description="Browse all 169 starting hands. Equity, tier, recommended action by position." color="text-red-400" icon="🃏" />
          <ToolCard href="/tools/equity" title="Equity Calculator" description="Real-time equity vs. ranges, pot odds, Rule of 2 & 4." color="text-blue-400" icon="📊" />
          <ToolCard href="/tools/position" title="Position Strategy" description="Open-raise, defend, and 3-bet ranges for every seat." color="text-yellow-400" icon="🪑" />
        </div>
      </div>
    </div>
  );
}

function ToolCard({ href, title, description, color, icon }: {
  href: string; title: string; description: string; color: string; icon: string;
}) {
  return (
    <Link href={href} className="group block p-6 rounded-xl border border-gray-800 bg-[#161B22] hover:border-gray-700 hover:bg-[#1C2128] transition-all">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className={`font-semibold mb-2 ${color}`}>{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </Link>
  );
}
