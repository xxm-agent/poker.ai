import Link from "next/link";

export default function PlayersPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Opponents</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-xs font-medium mb-6">
          Phase 2 — Coming Soon
        </div>
        <h1 className="text-4xl font-bold mb-4">Opponent Profiles</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          After you record sessions, opponents will appear here with their VPIP, PFR, aggression factor, and player type.
        </p>

        <div className="rounded-xl border border-dashed border-gray-700 bg-[#161B22] p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-gray-400">No opponents recorded yet.</p>
          <p className="text-gray-500 text-sm mt-1">Start logging sessions to build opponent profiles.</p>
        </div>
      </div>
    </div>
  );
}
