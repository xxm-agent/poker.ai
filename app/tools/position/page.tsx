"use client";

import { useState } from "react";
import Link from "next/link";
import { POSITIONS, POSITION_MAP, type PositionId } from "@/lib/positions";
import { HANDS, getTierColor, type Tier } from "@/lib/hands";

export default function PositionPage() {
  const [selectedPosition, setSelectedPosition] = useState<PositionId>("BTN");
  const [view, setView] = useState<"open" | "defend" | "three">("open");

  const pos = POSITION_MAP[selectedPosition];

  // Generate hand list for this position/action
  const tierRanges: Record<string, Record<string, number[]>> = {
    UTG: {
      open: [1, 2],
      defend: [1, 2],
      three: [1],
    },
    BTN: {
      open: [1, 2, 3, 4],
      defend: [1, 2, 3, 4],
      three: [1, 2, 3],
    },
    CO: {
      open: [1, 2, 3, 4],
      defend: [1, 2, 3, 4],
      three: [1, 2, 3],
    },
    SB: {
      open: [1, 2, 3],
      defend: [1, 2, 3, 4],
      three: [1, 2],
    },
    BB: {
      open: [],
      defend: [1, 2, 3, 4, 5],
      three: [1, 2],
    },
    MP: {
      open: [1, 2, 3],
      defend: [1, 2, 3, 4],
      three: [1, 2],
    },
    MP1: {
      open: [1, 2, 3, 4],
      defend: [1, 2, 3, 4],
      three: [1, 2, 3],
    },
    UTG1: {
      open: [1, 2],
      defend: [1, 2, 3],
      three: [1],
    },
  };

  const rangeTiers = tierRanges[selectedPosition]?.[view] ?? [];

  const rangeHands = HANDS.filter((h) => rangeTiers.includes(h.tier));

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
            <span className="text-sm text-gray-400">Position Strategy</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-400">
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/tools" className="text-white">Tools</Link>
            <Link href="/session" className="hover:text-white transition-colors">Session</Link>
            <Link href="/players" className="hover:text-white transition-colors">Players</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Position Strategy</h1>
          <p className="text-gray-400">Know your range for every seat. Click a position to see what to play.</p>
        </div>

        {/* Table Diagram */}
        <div className="mb-8">
          <div className="flex flex-col items-center gap-1">
            {/* Top row: 4 positions */}
            <div className="flex gap-1">
              {['BB', 'SB', 'BTN', 'CO'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPosition(p as PositionId)}
                  className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all ${
                    selectedPosition === p
                      ? "bg-[#1DB954] text-black"
                      : "bg-[#161B22] border border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            {/* Spacer */}
            <div className="h-16 w-4" />
            {/* Bottom row: 4 positions */}
            <div className="flex gap-1">
              {['UTG', 'UTG1', 'MP', 'MP1'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPosition(p as PositionId)}
                  className={`px-4 py-2 rounded-lg text-sm font-mono font-bold transition-all ${
                    selectedPosition === p
                      ? "bg-[#1DB954] text-black"
                      : "bg-[#161B22] border border-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Position Info */}
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-6">
              <div className="text-xs text-gray-500 mb-1">Position</div>
              <div className="text-2xl font-bold mb-1">{pos.name}</div>
              <div className="text-sm text-gray-400">{pos.description}</div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-6">
              <div className="text-sm font-medium text-gray-300 mb-4">Stats</div>
              <div className="space-y-3">
                <StatRow label="Open Raise %" value={`${pos.openRaisePct}%`} />
                <StatRow label="Defend %" value={`${pos.defendPct}%`} />
                <StatRow label="3-Bet %" value={`${pos.threeBetPct}%`} />
                <StatRow label="Seat Index" value={`#${pos.seatIndex + 1} / 8`} />
              </div>
            </div>

            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-6">
              <div className="text-sm font-medium text-gray-300 mb-3">Position Notes</div>
              <div className="text-sm text-gray-400 space-y-2">
                {selectedPosition === 'BTN' && (
                  <p>The most profitable seat. Open ~40% of hands. Steal often from CO/SB/BB.</p>
                )}
                {selectedPosition === 'CO' && (
                  <p>Second most profitable. Open ~25%. 3-bet polarised range vs. BTN opens.</p>
                )}
                {selectedPosition === 'SB' && (
                  <p>Defend ~28% vs. steals. Play tighter than BB. Avoid calling raises.</p>
                )}
                {selectedPosition === 'BB' && (
                  <p>Check-call with hands that flop well. 3-bet only premium. Wide defend vs. steals.</p>
                )}
                {selectedPosition === 'UTG' && (
                  <p>Tightest range. Open only ~10% (AA–QQ, AK, maybe JJ+). First to act = weakest position.</p>
                )}
                {selectedPosition === 'MP' && (
                  <p>Open ~15%. Play solid TAG style. Avoid fancy plays.</p>
                )}
                {['UTG1', 'MP1'].includes(selectedPosition) && (
                  <p>Transitional position. Slightly looser than UTG but still tight.</p>
                )}
              </div>
            </div>
          </div>

          {/* Range Display */}
          <div className="lg:col-span-2 space-y-6">
            {/* Action Selector */}
            <div className="flex gap-2">
              {(["open", "defend", "three"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    view === v
                      ? "bg-[#1DB954] text-black"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {v === "open" ? "Open Raise" : v === "defend" ? "Defend" : "3-Bet"}
                </button>
              ))}
            </div>

            {/* Range Summary */}
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-300">
                  {view === "open" ? "Open Raise" : view === "defend" ? "Defend vs. Raise" : "3-Bet Range"}
                </span>
                <span className="text-sm font-mono text-[#1DB954]">
                  ~{rangeHands.length} hands
                </span>
              </div>
              {/* Mini grid */}
              <div className="grid grid-cols-[repeat(13,28px)] gap-[2px] mb-4">
                {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].map((r) => (
                  <div key={`ch-${r}`} className="w-[28px] h-5 flex items-center justify-center text-[10px] text-gray-500 font-mono">{r}</div>
                ))}
                {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].map((f, fi) => (
                  <>
                    <div key={`rh-${f}`} className="w-[28px] h-[28px] flex items-center justify-center text-[10px] text-gray-500 font-mono">{f}</div>
                    {['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'].map((r, ri) => {
                      const id = fi === ri ? `${r}${r}` : fi < ri ? `${r}${f}s` : `${r}${f}o`;
                      const hand = HANDS.find((h) => h.id === id);
                      const inRange = hand && rangeTiers.includes(hand.tier);
                      return (
                        <div
                          key={`${fi}-${ri}`}
                          className={`w-[28px] h-[28px] rounded text-[9px] font-mono font-bold flex items-center justify-center ${
                            !hand
                              ? "bg-gray-900/50"
                              : inRange
                              ? `${getTierColor(hand.tier)} text-white`
                              : "bg-gray-800 text-gray-600"
                          }`}
                        >
                          {id}
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-2">
                {([1, 2, 3, 4, 5] as Tier[]).map((t) => (
                  <div key={t} className="flex items-center gap-1">
                    <div className={`w-3 h-3 rounded ${getTierColor(t)}`} />
                    <span className="text-xs text-gray-400">
                      {t === 1 ? "Premium" : t === 2 ? "Strong" : t === 3 ? "Playable" : t === 4 ? "Speculative" : "Trash"}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-800" />
                  <span className="text-xs text-gray-400">Fold</span>
                </div>
              </div>
            </div>

            {/* Hand list */}
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <div className="text-sm font-medium text-gray-300 mb-4">
                Hand List ({rangeHands.length} total)
              </div>
              <div className="flex flex-wrap gap-2">
                {rangeHands.map((hand) => (
                  <span
                    key={hand.id}
                    className={`px-2 py-1 rounded text-xs font-mono font-medium ${getTierColor(hand.tier)} text-white`}
                  >
                    {hand.id}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Global Tips */}
        <div className="mt-8 rounded-xl border border-gray-800 bg-[#161B22] p-6">
          <h2 className="text-lg font-semibold mb-4">General Position Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <Tip title="Early Position" icon="🔴" text="Play tight. Only premium hands. Avoid marginal spots." />
            <Tip title="Middle Position" icon="🟡" text="Slightly wider. 15–18% open range. Solid TAG play." />
            <Tip title="Late Position" icon="🟢" text="Widest range. Steal frequently. Most profitable seats." />
            <Tip title="Blinds" icon="🅿️" text="SB tight, BB wide. Defend vs. steals, check-call with good board coverage." />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="font-mono text-white font-medium">{value}</span>
    </div>
  );
}

function Tip({ title, icon, text }: { title: string; icon: string; text: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div>
        <div className="font-medium mb-1">{title}</div>
        <div className="text-gray-400">{text}</div>
      </div>
    </div>
  );
}
