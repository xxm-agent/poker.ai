"use client";

import { useState } from "react";
import Link from "next/link";
import { HANDS, HAND_MAP, getTierColor, getTierLabel, getTierAction, type Hand, type Tier } from "@/lib/hands";

const RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const SUITS = ['♠', '♥', '♦', '♣'];

function getHandId(fileIdx: number, rankIdx: number): string {
  const high = RANKS[rankIdx];
  const low = RANKS[fileIdx];
  if (rankIdx === fileIdx) {
    return `${high}${high}`;
  }
  if (rankIdx < fileIdx) {
    return `${high}${low}s`;
  }
  return `${high}${low}o`;
}

function getCellColor(tier: Tier): string {
  switch (tier) {
    case 1: return "bg-red-600 hover:bg-red-500";
    case 2: return "bg-orange-500 hover:bg-orange-400";
    case 3: return "bg-yellow-500 hover:bg-yellow-400";
    case 4: return "bg-blue-600 hover:bg-blue-500";
    case 5: return "bg-gray-700 hover:bg-gray-600";
  }
}

export default function HandChartPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<Tier | "all">("all");

  const selectedHand = selected ? HAND_MAP[selected as keyof typeof HAND_MAP] : null;

  const filteredHands = filterTier === "all"
    ? HANDS
    : HANDS.filter((h) => h.tier === filterTier);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
              <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">Hand Explorer</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-400">
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/tools" className="text-white hover:text-white transition-colors">Tools</Link>
            <Link href="/session" className="hover:text-white transition-colors">Session</Link>
            <Link href="/players" className="hover:text-white transition-colors">Players</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Hand Explorer</h1>
          <p className="text-gray-400">All 169 starting hands ranked by strength. Click any hand to see details.</p>
        </div>

        {/* Tier Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilterTier("all")}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              filterTier === "all"
                ? "bg-white text-black font-medium"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            All (169)
          </button>
          {([1, 2, 3, 4, 5] as Tier[]).map((t) => (
            <button
              key={t}
              onClick={() => setFilterTier(t)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filterTier === t
                  ? "bg-white text-black font-medium"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {getTierLabel(t)} ({HANDS.filter((h) => h.tier === t).length})
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[auto,1fr] gap-8">
          {/* Grid */}
          <div>
            <p className="text-xs text-gray-500 mb-2 text-center">↓ Your hand / ↑ Opponent's range</p>
            <div className="grid grid-cols-[repeat(13,52px)] gap-[2px]">
              {/* Column headers */}
              <div />
              {RANKS.map((r) => (
                <div key={r} className="w-[52px] h-6 flex items-center justify-center text-xs text-gray-500 font-mono">
                  {r}
                </div>
              ))}

              {/* Rows */}
              {RANKS.map((fileRank, fileIdx) => (
                <>
                  <div
                    key={`row-${fileIdx}`}
                    className="w-[52px] h-[52px] flex items-center justify-center text-xs text-gray-500 font-mono"
                  >
                    {fileRank}
                  </div>
                  {RANKS.map((rankRank, rankIdx) => {
                    const handId = getHandId(fileIdx, rankIdx);
                    const hand = HAND_MAP[handId as keyof typeof HAND_MAP];
                    const isSelected = selected === handId;
                    const isHidden = filterTier !== "all" && hand?.tier !== filterTier;

                    if (isHidden) {
                      return (
                        <div
                          key={`${fileIdx}-${rankIdx}`}
                          className="w-[52px] h-[52px] bg-gray-900/50 rounded"
                        />
                      );
                    }

                    return (
                      <button
                        key={`${fileIdx}-${rankIdx}`}
                        onClick={() => setSelected(isSelected ? null : handId)}
                        className={`w-[52px] h-[52px] rounded text-xs font-mono font-bold transition-all ${
                          getCellColor(hand?.tier ?? 5)
                        } ${isSelected ? "ring-2 ring-white ring-offset-2 ring-offset-[#0D1117]" : ""}`}
                        title={handId}
                      >
                        <span className={hand?.suited ? (handId.endsWith('s') ? "text-white" : "text-white") : "text-white/80"}>
                          {handId}
                        </span>
                      </button>
                    );
                  })}
                </>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {([1, 2, 3, 4, 5] as Tier[]).map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${getTierColor(t)}`} />
                  <span className="text-xs text-gray-400">{getTierLabel(t)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {selectedHand ? (
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="text-3xl font-mono font-bold mb-1">{selectedHand.id}</div>
                    <div className={`inline-block px-2 py-0.5 rounded text-sm font-medium ${getTierColor(selectedHand.tier).replace("hover:", "")}`}>
                      {getTierLabel(selectedHand.tier)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">vs Random</div>
                    <div className="text-2xl font-bold text-[#1DB954]">{selectedHand.equityVsRandom}%</div>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm font-medium mb-3 text-gray-300">Equity Breakdown</div>
                  <div className="space-y-2">
                    <EquityBar label="vs Random" value={selectedHand.equityVsRandom} />
                    <EquityBar label="vs Top 10%" value={selectedHand.equityVsTop10} />
                    <EquityBar label="vs Top 5%" value={selectedHand.equityVsTop5} />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="text-sm font-medium mb-3 text-gray-300">Recommended Action</div>
                  <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-800">
                    <span className="text-[#1DB954] font-semibold">{getTierAction(selectedHand.tier)}</span>
                    <span className="text-gray-400 text-sm ml-2">from most positions</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="text-gray-500">Rank</div>
                    <div className="font-mono">#{selectedHand.rank} / 169</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-gray-500">Type</div>
                    <div className="font-mono">
                      {selectedHand.pair ? "Pocket Pair" : selectedHand.suited ? "Suited" : "Offsuit"}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-800 bg-[#161B22] p-12 text-center">
                <div className="text-4xl mb-4">🃏</div>
                <p className="text-gray-400">Click a hand on the grid to see details</p>
              </div>
            )}

            {/* Tier explanation */}
            <div className="mt-6 rounded-xl border border-gray-800 bg-[#161B22] p-6">
              <div className="text-sm font-medium mb-4 text-gray-300">Tier Guide</div>
              <div className="space-y-3">
                <TierRow tier={1} label="Premium" hands="AA, KK, QQ, AKs, AKo" action="Raise aggressively from any position" color="bg-red-600" />
                <TierRow tier={2} label="Strong" hands="JJ, TT, AQs, AJs, KQs, 88, 99, ATs" action="Open-raise or 3-bet" color="bg-orange-500" />
                <TierRow tier={3} label="Playable" hands="77–66, AQo, ATs, KJs, QJs, JTs, T9s" action="Open or call, position matters" color="bg-yellow-500" />
                <TierRow tier={4} label="Speculative" hands="55–22, A9s+, K9s+, Q9s+, J9s+" action="Call cheap, hope to hit" color="bg-blue-600" />
                <TierRow tier={5} label="Trash" hands="Everything else" action="Fold (unless BB very cheap)" color="bg-gray-700" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EquityBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-400 w-20 text-right">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#1DB954] rounded-full transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs font-mono w-10 text-right">{value}%</span>
    </div>
  );
}

function TierRow({
  tier,
  label,
  hands,
  action,
  color,
}: {
  tier: Tier;
  label: string;
  hands: string;
  action: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`} />
      <div className="w-24 text-xs font-medium">{label}</div>
      <div className="flex-1 text-xs text-gray-400 font-mono">{hands}</div>
      <div className="text-xs text-gray-500">{action}</div>
    </div>
  );
}
