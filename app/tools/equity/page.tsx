"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { monteCarloEquity, potOdds, ruleOfTwoAndFour } from "@/lib/equity";
import { HAND_MAP, type HandId } from "@/lib/hands";

const DECK_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const DECK_SUITS = ['♠', '♥', '♦', '♣'];

function parseHand(input: string): [string, string] | null {
  const cleaned = input.replace(/\s+/g, "").toUpperCase();
  const ranks = DECK_RANKS.join("");
  // Match two characters: rank + optional suit, twice
  const match = cleaned.match(new RegExp(`^([${ranks}])([${DECK_SUITS}]?)([${ranks}])([${DECK_SUITS}]?)$`));
  if (!match) return null;
  const [, r1, s1, r2, s2] = match;
  if (!s1 || !s2) return null; // need suits
  return [`${r1}${s1}`, `${r2}${s2}`];
}

type Stage = "preflop" | "flop" | "turn" | "river";

export default function EquityCalculatorPage() {
  const [heroInput, setHeroInput] = useState("As Ks");
  const [villainRange, setVillainRange] = useState("top10");
  const [boardInput, setBoardInput] = useState("");
  const [pot, setPot] = useState(100);
  const [bet, setBet] = useState(50);
  const [stage, setStage] = useState<Stage>("preflop");
  const [equity, setEquity] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [outs, setOuts] = useState<number | null>(null);

  const calculate = useCallback(() => {
    const heroHand = parseHand(heroInput);
    if (!heroHand) return;

    const boardCards = boardInput
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((c) => c.toUpperCase());

    setCalculating(true);

    setTimeout(() => {
      // Quick equity using Monte Carlo
      const rangeMap: Record<string, string[]> = {
        top5: ['AA', 'KK', 'QQ', 'JJ', 'TT', 'AKs', 'AKo'],
        top10: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', 'AKs', 'AKo', 'AQs', 'AJs', 'KQs'],
        top20: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'KQs', 'KJs', 'QJs', 'JTs'],
        top30: ['AA', 'KK', 'QQ', 'JJ', 'TT', '99', '88', '77', '66', 'AKs', 'AKo', 'AQs', 'AJs', 'ATs', 'A9s', 'KQs', 'KJs', 'KTs', 'QJs', 'QTs', 'JTs', 'T9s'],
        random: ['random'],
      };

      const range = rangeMap[villainRange] || rangeMap.random;
      const equityResult = range[0] === 'random'
        ? 50
        : monteCarloEquity(heroHand, range, boardCards, 2000);

      setEquity(equityResult);

      // Estimate outs for drawing hands
      if (stage === "flop" || stage === "turn") {
        const boardRank = boardCards[boardCards.length - 1]?.[0] || heroHand[0][0];
        setOuts(estimateOuts(heroHand, boardCards));
      }

      setCalculating(false);
    }, 50);
  }, [heroInput, villainRange, boardInput, stage]);

  const potOddsPct = potOdds(bet, pot);
  const neededEquity = potOddsPct;
  const actualEquity = equity;
  const recommendation =
    actualEquity !== null
      ? actualEquity >= neededEquity + 5
        ? "CALL"
        : actualEquity >= neededEquity
        ? "TOSS-UP"
        : "FOLD"
      : null;

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
            <span className="text-sm text-gray-400">Equity Calculator</span>
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
          <h1 className="text-3xl font-bold mb-2">Equity Calculator</h1>
          <p className="text-gray-400">Enter your hand, board, and opponent range to get real-time equity + pot odds analysis.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            {/* Hero Hand */}
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <label className="block text-sm font-medium text-gray-300 mb-2">Your Hand</label>
              <input
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder="As Ks"
                className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono text-lg focus:outline-none focus:border-[#1DB954] placeholder-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Format: As Ks, Ah Kh, Ad Kd</p>
            </div>

            {/* Stage */}
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">Stage</label>
              <div className="grid grid-cols-4 gap-2">
                {(["preflop", "flop", "turn", "river"] as Stage[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStage(s)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      stage === s
                        ? "bg-[#1DB954] text-black"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Board */}
            {(stage === "flop" || stage === "turn" || stage === "river") && (
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Board {stage === "flop" ? "(3 cards)" : stage === "turn" ? "(4 cards)" : "(5 cards)"}
                </label>
                <input
                  type="text"
                  value={boardInput}
                  onChange={(e) => setBoardInput(e.target.value)}
                  placeholder={stage === "flop" ? "Kh 7s 2c" : stage === "turn" ? "Kh 7s 2c 9d" : "Kh 7s 2c 9d Qd"}
                  className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono focus:outline-none focus:border-[#1DB954] placeholder-gray-600"
                />
              </div>
            )}

            {/* Villain Range */}
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">Opponent Range</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "top5", label: "Top 5%" },
                  { value: "top10", label: "Top 10%" },
                  { value: "top20", label: "Top 20%" },
                  { value: "top30", label: "Top 30%" },
                ].map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setVillainRange(value)}
                    className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                      villainRange === value
                        ? "bg-[#1DB954] text-black font-medium"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pot & Bet */}
            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <label className="block text-sm font-medium text-gray-300 mb-3">Pot & Bet</label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Pot Size ($)</div>
                  <input
                    type="number"
                    value={pot}
                    onChange={(e) => setPot(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono focus:outline-none focus:border-[#1DB954]"
                  />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Opponent Bet ($)</div>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-lg bg-gray-900 border border-gray-700 text-white font-mono focus:outline-none focus:border-[#1DB954]"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={calculate}
              disabled={calculating || !heroInput}
              className="w-full py-3 rounded-lg bg-[#1DB954] text-black font-semibold hover:bg-[#1ed86a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {calculating ? "Calculating..." : "Calculate Equity"}
            </button>
          </div>

          {/* Result Panel */}
          <div className="space-y-6">
            {equity !== null && (
              <>
                {/* Equity */}
                <div className="rounded-xl border border-gray-800 bg-[#161B22] p-6">
                  <div className="text-sm text-gray-500 mb-2">Your Equity</div>
                  <div className="text-5xl font-bold text-[#1DB954] mb-2">{equity.toFixed(1)}%</div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#1DB954] rounded-full transition-all duration-700"
                      style={{ width: `${equity}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Pot Odds */}
                <div className="rounded-xl border border-gray-800 bg-[#161B22] p-6">
                  <div className="text-sm text-gray-500 mb-2">Pot Odds</div>
                  <div className="text-3xl font-bold text-white">{potOddsPct.toFixed(1)}%</div>
                  <div className="text-sm text-gray-400 mt-1">
                    Need this equity to break even
                  </div>
                </div>

                {/* Decision */}
                {recommendation && (
                  <div
                    className={`rounded-xl border p-6 text-center ${
                      recommendation === "CALL"
                        ? "border-green-500/30 bg-green-500/10"
                        : recommendation === "FOLD"
                        ? "border-red-500/30 bg-red-500/10"
                        : "border-yellow-500/30 bg-yellow-500/10"
                    }`}
                  >
                    <div className={`text-3xl font-bold mb-2 ${
                      recommendation === "CALL"
                        ? "text-green-400"
                        : recommendation === "FOLD"
                        ? "text-red-400"
                        : "text-yellow-400"
                    }`}>
                      {recommendation}
                    </div>
                    <div className="text-sm text-gray-400">
                      {recommendation === "CALL" && (
                        <>Your equity ({equity.toFixed(1)}%) ≥ pot odds ({potOddsPct.toFixed(1)}%)</>
                      )}
                      {recommendation === "FOLD" && (
                        <>Your equity ({equity.toFixed(1)}%) &lt; pot odds ({potOddsPct.toFixed(1)}%)</>
                      )}
                      {recommendation === "TOSS-UP" && (
                        <>Close — slight edge</>
                      )}
                    </div>
                  </div>
                )}

                {/* Rule of 2 and 4 */}
                {outs !== null && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <div className="text-sm font-medium text-gray-300 mb-3">Quick Estimate (Rule of 2 & 4)</div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Estimated Outs</span>
                        <span className="font-mono text-white">{outs}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">{stage === "flop" ? "On Flop (×4)" : "On Turn (×2)"}</span>
                        <span className="font-mono text-[#1DB954]">{stage === "flop" ? outs * 4 : outs * 2}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Context */}
                <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                  <div className="text-sm font-medium text-gray-300 mb-3">Context</div>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>Your hand: <span className="text-white font-mono">{heroInput}</span></p>
                    <p>Board: <span className="text-white font-mono">{boardInput || "(none)"}</span></p>
                    <p>Stage: <span className="text-white capitalize">{stage}</span></p>
                    <p>Opponent range: <span className="text-white">{villainRange}</span></p>
                    <p>Pot: <span className="text-white">${pot}</span> · Bet: <span className="text-white">${bet}</span></p>
                  </div>
                </div>
              </>
            )}

            {!equity && !calculating && (
              <div className="rounded-xl border border-dashed border-gray-800 bg-[#161B22] p-12 text-center">
                <div className="text-4xl mb-4">🎯</div>
                <p className="text-gray-400">Enter your hand and click Calculate</p>
              </div>
            )}

            {calculating && (
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-12 text-center">
                <div className="text-4xl mb-4 animate-pulse">⚙️</div>
                <p className="text-gray-400">Running Monte Carlo simulation...</p>
              </div>
            )}
          </div>
        </div>

        {/* Guide */}
        <div className="mt-12 rounded-xl border border-gray-800 bg-[#161B22] p-6">
          <h2 className="text-lg font-semibold mb-4">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-[#1DB954] font-medium mb-1">1. Enter Your Hand</div>
              <p className="text-gray-400">Type your hole cards like "As Ks" or "Ah Kh". Suits must match for suited.</p>
            </div>
            <div>
              <div className="text-[#1DB954] font-medium mb-1">2. Set Stage & Board</div>
              <p className="text-gray-400">Select preflop, flop, turn, or river. Add community cards as known.</p>
            </div>
            <div>
              <div className="text-[#1DB954] font-medium mb-1">3. Compare Equity vs. Pot Odds</div>
              <p className="text-gray-400">If your equity ≥ pot odds, you have a profitable call. Otherwise, fold.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function estimateOuts(heroHand: [string, string], boardCards: string[]): number {
  // Very simplified outs estimation
  // Flush draw = 9 outs, OESD = 8 outs, gutshot = 4 outs
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const suits = ['♠', '♥', '♦', '♣'];

  // Check flush draw
  const allCards = [...heroHand, ...boardCards];
  const suitCounts: Record<string, number> = {};
  for (const c of allCards) {
    suitCounts[c[1]] = (suitCounts[c[1]] || 0) + 1;
  }
  for (const [, count] of Object.entries(suitCounts)) {
    if (count >= 4) return 9; // flush draw
  }

  // Check straight draws
  const allRanks = allCards.map((c) => c[0]);
  const uniqueRanks = [...new Set(allRanks)];
  const sorted = uniqueRanks.sort((a, b) => ranks.indexOf(a) - ranks.indexOf(b));

  // Open-ended: 4 ranks in sequence
  for (let i = 0; i < sorted.length - 3; i++) {
    const a = ranks.indexOf(sorted[i]);
    const b = ranks.indexOf(sorted[i + 1]);
    const c = ranks.indexOf(sorted[i + 2]);
    const d = ranks.indexOf(sorted[i + 3]);
    if (b === a + 1 && c === b + 1 && d === c + 1) return 8;
  }

  // Gutshot: 1 missing in sequence
  for (let i = 0; i < sorted.length - 2; i++) {
    const a = ranks.indexOf(sorted[i]);
    const b = ranks.indexOf(sorted[i + 1]);
    const c = ranks.indexOf(sorted[i + 2]);
    if (b === a + 1 && c === b + 2) return 4;
  }

  return 0;
}
