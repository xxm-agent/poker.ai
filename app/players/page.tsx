"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { computeLeakReport, computeGlobalStats, getAllSessions, getHandsForSession, getAllOpponents, type LeakReport } from "@/lib/db";

type Tab = "leaks" | "opponents" | "stats";

const POSITION_ORDER = ['UTG', 'UTG1', 'MP', 'MP1', 'CO', 'BTN', 'SB', 'BB'];
const STAGE_ORDER = ['preflop', 'flop', 'turn', 'river'];

const ACTION_LABELS: Record<string, string> = {
  fold: "Fold",
  check: "Check",
  call: "Call",
  bet: "Bet",
  raise: "Raise",
  "3bet": "3-Bet",
  "4bet": "4-Bet",
  bluff: "Bluff",
  value_bet: "Value Bet",
  hero_call: "Hero Call",
  hero_fold: "Hero Fold",
  cbet: "C-Bet",
  check_raise: "Check-Raise",
  float: "Float",
};

const SEVERITY_COLOR: Record<string, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

export default function PlayersPage() {
  const [tab, setTab] = useState<Tab>("leaks");
  const [report, setReport] = useState<LeakReport | null>(null);
  const [globalStats, setGlobalStats] = useState<{ totalSessions: number; totalHands: number; totalProfit: number; biggestWin: number; biggestLoss: number } | null>(null);
  const [opponents, setOpponents] = useState<{ name: string; hands: number; playerType?: string; vpip?: number; pfr?: number; lastSeen: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [minHandsForAnalysis] = useState(20);

  const load = useCallback(async () => {
    setLoading(true);
    const [r, gs, opp] = await Promise.all([
      computeLeakReport(),
      computeGlobalStats(),
      getAllOpponents(),
    ]);
    setReport(r);
    setGlobalStats(gs);
    setOpponents(opp);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const hasEnoughData = (report?.overall.totalHands ?? 0) >= minHandsForAnalysis;

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
            <span className="text-sm text-gray-400">Me</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-400">
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/session" className="hover:text-white transition-colors">Session</Link>
            <Link href="/players" className="text-white">Me</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-800 pb-0">
          {([["leaks", "Leak Detector"], ["opponents", "Opponents"], ["stats", "Session Stats"]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-[#1DB954] text-white" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── LEAK DETECTOR ── */}
        {tab === "leaks" && (
          <div>
            {!hasEnoughData ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-3">Need more data</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Log at least <span className="text-white font-mono">{minHandsForAnalysis}</span> hands to get an accurate leak analysis.
                  You have <span className="text-[#1DB954] font-mono">{report?.overall.totalHands ?? 0}</span> so far.
                </p>
                <div className="w-64 mx-auto h-2 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full bg-[#1DB954] rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((report?.overall.totalHands ?? 0) / minHandsForAnalysis) * 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-2">{report?.overall.totalHands ?? 0} / {minHandsForAnalysis} hands</p>
                <Link href="/session" className="inline-block mt-6 px-5 py-2 rounded-lg bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed86a] transition-colors">
                  Log Hands
                </Link>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Overview */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Total Hands", value: report!.overall.totalHands.toLocaleString(), sub: "" },
                    { label: "Net Profit", value: `${report!.overall.totalProfit >= 0 ? "+" : ""}${report!.overall.totalProfit.toFixed(2)}BB`,
                      sub: "", color: report!.overall.totalProfit >= 0 ? "text-green-400" : "text-red-400" },
                    { label: "Win Rate", value: `${report!.overall.winRate.toFixed(1)}%`, sub: "" },
                    { label: "BB/100", value: `${report!.overall.bigBlindPer100 >= 0 ? "+" : ""}${report!.overall.bigBlindPer100.toFixed(2)}`,
                      sub: "big blinds per 100", color: report!.overall.bigBlindPer100 >= 0 ? "text-green-400" : "text-red-400" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-gray-800 bg-[#161B22] p-4">
                      <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                      <div className={`text-2xl font-mono font-bold ${(stat as { color?: string }).color ?? "text-white"}`}>
                        {stat.value}
                      </div>
                      {stat.sub && <div className="text-xs text-gray-600 mt-0.5">{stat.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Leaks */}
                {(report!.preflopLeak.length > 0 || report!.postflopLeak.length > 0) ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Preflop leaks */}
                    <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📥</span>
                        <h3 className="text-sm font-semibold text-gray-200">Pre-Flop Leaks</h3>
                      </div>
                      {report!.preflopLeak.length === 0 ? (
                        <p className="text-sm text-gray-500">No significant pre-flop leaks detected.</p>
                      ) : (
                        <div className="space-y-3">
                          {report!.preflopLeak.map((leak, i) => (
                            <div key={i} className={`p-3 rounded-lg border text-sm ${SEVERITY_COLOR[leak.severity]}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  leak.severity === 'high' ? 'bg-red-400' : leak.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                                }`} />
                                <span className="font-medium capitalize">{leak.type.replace(/_/g, ' ')}</span>
                                <span className="ml-auto text-xs opacity-70">{leak.severity}</span>
                              </div>
                              <p className="text-xs opacity-80 leading-relaxed">{leak.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Post-flop leaks */}
                    <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-lg">📉</span>
                        <h3 className="text-sm font-semibold text-gray-200">Post-Flop Leaks</h3>
                      </div>
                      {report!.postflopLeak.length === 0 ? (
                        <p className="text-sm text-gray-500">No significant post-flop leaks detected.</p>
                      ) : (
                        <div className="space-y-3">
                          {report!.postflopLeak.map((leak, i) => (
                            <div key={i} className={`p-3 rounded-lg border text-sm ${SEVERITY_COLOR[leak.severity]}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  leak.severity === 'high' ? 'bg-red-400' : leak.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'
                                }`} />
                                <span className="font-medium capitalize">{leak.type.replace(/_/g, ' ')}</span>
                                <span className="ml-auto text-xs opacity-70">{leak.severity}</span>
                              </div>
                              <p className="text-xs opacity-80 leading-relaxed">{leak.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 text-center">
                    <div className="text-3xl mb-3">✅</div>
                    <h3 className="text-lg font-semibold text-green-400 mb-2">No Major Leaks Detected</h3>
                    <p className="text-sm text-gray-400">Your stats look solid. Keep logging more hands to refine the analysis.</p>
                  </div>
                )}

                {/* Tilt spots */}
                {report!.tiltSpots.length > 0 && (
                  <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🔥</span>
                      <h3 className="text-sm font-semibold text-gray-200">Tilt Spots</h3>
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs">{report!.tiltSpots.length}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      {report!.tiltSpots.length} session(s) showed signs of tilt (4+ consecutive losing hands, ≥5BB down).
                    </p>
                    <div className="space-y-2">
                      {report!.tiltSpots.map((spot, i) => (
                        <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1117] border border-gray-800">
                          <div>
                            <span className="text-sm text-white">{spot.date}</span>
                            <span className="text-xs text-gray-500 ml-3">{spot.consecutiveLosses} consecutive losses</span>
                          </div>
                          <span className="text-sm font-mono text-red-400">{spot.totalLoss.toFixed(2)}BB</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By position */}
                {Object.keys(report!.byPosition).length > 0 && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <h3 className="text-sm font-semibold text-gray-200 mb-4">Profit by Position</h3>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {POSITION_ORDER.filter((p) => report!.byPosition[p]).map((pos) => {
                        const data = report!.byPosition[pos]!;
                        const perHand = data.hands > 0 ? data.profit / data.hands : 0;
                        return (
                          <div key={pos} className={`p-2 rounded-lg text-center border ${data.leak ? 'border-red-500/40 bg-red-500/5' : 'border-gray-800'}`}>
                            <div className="text-xs text-gray-500 mb-1">{pos}</div>
                            <div className={`text-sm font-mono font-bold ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {data.profit >= 0 ? '+' : ''}{data.profit.toFixed(1)}
                            </div>
                            <div className="text-xs text-gray-600">{data.hands}h · {perHand.toFixed(2)}BB/h</div>
                            {data.leak && <div className="text-xs text-red-400 mt-1">⚠ leak</div>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* By street */}
                {Object.keys(report!.byStage).length > 1 && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <h3 className="text-sm font-semibold text-gray-200 mb-4">Profit by Street</h3>
                    <div className="space-y-2">
                      {STAGE_ORDER.filter((s) => report!.byStage[s]).map((stage) => {
                        const data = report!.byStage[stage]!;
                        const perHand = data.hands > 0 ? data.profit / data.hands : 0;
                        return (
                          <div key={stage} className="flex items-center gap-4 p-2.5 rounded-lg bg-[#0D1117] border border-gray-800">
                            <div className="w-20 text-sm text-gray-400 capitalize">{stage}</div>
                            <div className="flex-1">
                              <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${data.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(100, Math.abs(data.profit / (data.hands * 1))) * 5}%` }}
                                />
                              </div>
                            </div>
                            <div className="w-16 text-right">
                              <span className={`text-sm font-mono font-medium ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {data.profit >= 0 ? '+' : ''}{data.profit.toFixed(1)}BB
                              </span>
                            </div>
                            <div className="w-20 text-right text-xs text-gray-600">{data.hands}h · {perHand.toFixed(2)}BB/h</div>
                            {data.leak && <span className="text-xs text-red-400">⚠ leak</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* By action */}
                {Object.keys(report!.byAction).length > 0 && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <h3 className="text-sm font-semibold text-gray-200 mb-4">Profit by Action</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-600 text-xs">
                            <th className="text-left pb-3 font-medium">Action</th>
                            <th className="text-right pb-3 font-medium">Hands</th>
                            <th className="text-right pb-3 font-medium">Total</th>
                            <th className="text-right pb-3 font-medium">BB/Hand</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(report!.byAction)
                            .sort((a, b) => (b[1].profit) - (a[1].profit))
                            .map(([action, data]) => (
                              <tr key={action} className="border-t border-gray-800/50">
                                <td className="py-2.5 text-gray-300">{ACTION_LABELS[action] ?? action}</td>
                                <td className="py-2.5 text-right text-gray-500">{data.hands}</td>
                                <td className={`py-2.5 text-right font-mono font-medium ${data.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {data.profit >= 0 ? '+' : ''}{data.profit.toFixed(2)}
                                </td>
                                <td className={`py-2.5 text-right font-mono ${data.avgResult >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                  {data.avgResult >= 0 ? '+' : ''}{data.avgResult.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Tag stats */}
                {Object.keys(report!.tagStats).length > 0 && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <h3 className="text-sm font-semibold text-gray-200 mb-4">Tag Performance</h3>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(report!.tagStats).map(([tag, data]) => (
                        <div key={tag} className="px-3 py-1.5 rounded-lg bg-[#0D1117] border border-gray-800">
                          <span className="text-xs text-gray-400">{tag}</span>
                          <span className="mx-2 text-gray-700">·</span>
                          <span className={`text-sm font-mono font-medium ${data.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {data.totalProfit >= 0 ? '+' : ''}{data.totalProfit.toFixed(1)}BB
                          </span>
                          <span className="ml-2 text-xs text-gray-600">{data.count}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bluff analysis */}
                {report!.bluffAnalysis.totalBluffs > 0 && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Bluff Record</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Total Bluffs</div>
                        <div className="text-xl font-mono font-bold text-white">{report!.bluffAnalysis.totalBluffs}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Called</div>
                        <div className="text-xl font-mono font-bold text-red-400">{report!.bluffAnalysis.bluffsCalled}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Success Rate</div>
                        <div className={`text-xl font-mono font-bold ${report!.bluffAnalysis.bluffSuccessRate >= 50 ? 'text-green-400' : 'text-yellow-400'}`}>
                          {report!.bluffAnalysis.bluffSuccessRate.toFixed(0)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── OPPONENTS ── */}
        {tab === "opponents" && (
          <div>
            {opponents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-bold mb-3">No opponents yet</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Import hand histories from your sessions to auto-build opponent profiles.
                </p>
                <Link href="/session" className="inline-block px-5 py-2 rounded-lg bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed86a] transition-colors">
                  Go to Session
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {opponents.map((opp) => (
                  <div key={opp.name} className="rounded-xl border border-gray-800 bg-[#161B22] p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">{opp.name}</div>
                      <div className="flex gap-4 mt-1 text-xs text-gray-500">
                        <span>{opp.hands}h</span>
                        {opp.vpip !== undefined && <span>VPIP: {opp.vpip}%</span>}
                        {opp.pfr !== undefined && <span>PFR: {opp.pfr}%</span>}
                        {opp.playerType && <span className="text-gray-400 capitalize">{opp.playerType.replace('_', ' ')}</span>}
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      Last seen {new Date(opp.lastSeen).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STATS ── */}
        {tab === "stats" && globalStats && (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { label: "Sessions", value: globalStats.totalSessions.toString() },
              { label: "Total Hands", value: globalStats.totalHands.toLocaleString() },
              { label: "Net Profit", value: `${globalStats.totalProfit >= 0 ? "+" : ""}${globalStats.totalProfit.toFixed(2)}BB`,
                color: globalStats.totalProfit >= 0 ? "text-green-400" : "text-red-400" },
              { label: "Biggest Win", value: `+${globalStats.biggestWin.toFixed(2)}BB`, color: "text-green-400" },
              { label: "Biggest Loss", value: `${globalStats.biggestLoss.toFixed(2)}BB`, color: "text-red-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
                <div className={`text-2xl font-mono font-bold ${(stat as { color?: string }).color ?? "text-white"}`}>{stat.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
