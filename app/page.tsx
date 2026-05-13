import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-400">
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/session" className="hover:text-white transition-colors">Session</Link>
            <Link href="/players" className="hover:text-white transition-colors">Players</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 text-[#1DB954] text-xs font-medium mb-6">
          Phase 1 — Tools & Learn
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Texas Hold'em,<br />
          <span className="text-[#1DB954]">intelligently.</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Your AI-powered poker coach. Interactive hand charts, real-time equity calculator, position strategy, and opponent profiling.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/tools/hand-chart"
            className="px-6 py-3 bg-[#1DB954] text-black font-semibold rounded-lg hover:bg-[#1ed86a] transition-colors"
          >
            Open Hand Chart
          </Link>
          <Link
            href="/tools/equity"
            className="px-6 py-3 border border-gray-700 rounded-lg hover:border-gray-500 transition-colors"
          >
            Equity Calculator
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            href="/tools/hand-chart"
            title="Hand Explorer"
            description="Browse all 169 starting hands. See equity, tier, and recommended action by position."
            tag="Tools"
            color="text-red-400"
          />
          <FeatureCard
            href="/tools/equity"
            title="Equity Calculator"
            description="Real-time equity vs. ranges. Pot odds. Rule of 2 & 4. Know when to call."
            tag="Tools"
            color="text-blue-400"
          />
          <FeatureCard
            href="/tools/position"
            title="Position Guide"
            description="Open-raise ranges, defend ranges, and 3-bet ranges for every seat."
            tag="Tools"
            color="text-yellow-400"
          />
          <FeatureCard
            href="/learn/basics"
            title="Poker Basics"
            description="Hand rankings, game flow, betting actions, and core concepts."
            tag="Learn"
            color="text-green-400"
          />
          <FeatureCard
            href="/learn/betting"
            title="Betting Strategies"
            description="C-bet, 3-bet, squeeze, check-raise — when and how much."
            tag="Learn"
            color="text-purple-400"
          />
          <FeatureCard
            href="/session"
            title="Session Tracker"
            description="Log hands, track opponents, detect leaks. Coming in Phase 2."
            tag="Phase 2"
            color="text-orange-400"
          />
        </div>
      </section>

      {/* Phase 2 Teaser */}
      <section className="border-t border-gray-800 bg-[#161B22]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center flex-shrink-0">
              <span className="text-[#FFD700] text-lg">★</span>
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Phase 2 — Session Tracker & Opponent Profiling</h2>
              <p className="text-gray-400 mb-4 max-w-2xl">
                Coming soon: Import your hand histories, build opponent profiles with VPIP/PFR/AF stats, and get real-time bluff detection. 
                Designed for amateur players who need to exploit predictable patterns — not balanced GTO play.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">Session Logger</span>
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">VPIP / PFR / AF</span>
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">Bluff Detector</span>
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">Leak Analysis</span>
                <span className="px-2 py-1 rounded bg-gray-800 text-gray-300">100% Local</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  href,
  title,
  description,
  tag,
  color,
}: {
  href: string;
  title: string;
  description: string;
  tag: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group block p-5 rounded-xl border border-gray-800 bg-[#161B22] hover:border-gray-700 hover:bg-[#1C2128] transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold ${color}`}>{title}</h3>
        <span className="text-xs px-2 py-0.5 rounded bg-gray-800 text-gray-400">{tag}</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </Link>
  );
}
