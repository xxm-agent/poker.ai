import Link from "next/link";

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Session Tracker</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFD700]/30 bg-[#FFD700]/10 text-[#FFD700] text-xs font-medium mb-6">
          Phase 2 — Coming Soon
        </div>
        <h1 className="text-4xl font-bold mb-4">Session Tracker</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto mb-10">
          Log your sessions, build opponent profiles, and detect bluffs — all stored locally on your device.
        </p>

        {/* Feature preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12 text-left">
          <div className="p-5 rounded-xl border border-gray-800 bg-[#161B22]">
            <div className="text-2xl mb-2">📋</div>
            <h3 className="font-semibold mb-1">Session Logger</h3>
            <p className="text-sm text-gray-400">Manual entry or import PokerStars hand histories. Track every session.</p>
          </div>
          <div className="p-5 rounded-xl border border-gray-800 bg-[#161B22]">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">VPIP / PFR / AF</h3>
            <p className="text-sm text-gray-400">Auto-computed stats per opponent. See how loose, tight, or aggressive they play.</p>
          </div>
          <div className="p-5 rounded-xl border border-gray-800 bg-[#161B22]">
            <div className="text-2xl mb-2">🎭</div>
            <h3 className="font-semibold mb-1">Bluff Detector</h3>
            <p className="text-sm text-gray-400">"Are they bluffing?" — Input the situation, get a probability with reasoning.</p>
          </div>
          <div className="p-5 rounded-xl border border-gray-800 bg-[#161B22]">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-semibold mb-1">Leak Detector</h3>
            <p className="text-sm text-gray-400">Auto-surfaces patterns in YOUR play. "You're folding too much from SB."</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs">100% Local Storage</span>
            <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs">PokerStars HH Import</span>
            <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-400 text-xs">Minimum Sample Warnings</span>
          </div>
        </div>
      </div>
    </div>
  );
}
