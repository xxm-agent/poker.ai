"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  computeLeakReport,
  computeGlobalStats,
  computeSessionDetail,
  computeOpponentProfiles,
  getAllSessions,
  getAllOpponents,
  deleteSession,
  type LeakReport,
  type OpponentProfile,
  type Session,
} from "@/lib/db";

const POSITION_ORDER = ['UTG', 'UTG1', 'MP', 'MP1', 'CO', 'BTN', 'SB', 'BB'];
type Tab = "leaks" | "opponents" | "sessions";

const STAGE_ORDER = ["preflop", "flop", "turn", "river"];

const ACTION_LABELS: Record<string, string> = {
  fold: "Fold", check: "Check", call: "Call", bet: "Bet", raise: "Raise",
  "3bet": "3-Bet", "4bet": "4-Bet", bluff: "Bluff", value_bet: "Value Bet",
  hero_call: "Hero Call", hero_fold: "Hero Fold", cbet: "C-Bet",
  check_raise: "Check-Raise", float: "Float",
};

const SEVERITY_COLOR: Record<string, string> = {
  high: "text-red-400 bg-red-500/10 border-red-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  low: "text-blue-400 bg-blue-500/10 border-blue-500/30",
};

const PLAYER_TYPE_COLORS: Record<string, string> = {
  nit: "bg-purple-500/20 text-purple-300",
  tag: "bg-green-500/20 text-green-300",
  lag: "bg-yellow-500/20 text-yellow-300",
  calling_station: "bg-orange-500/20 text-orange-300",
  fish: "bg-red-500/20 text-red-300",
  unknown: "bg-gray-500/20 text-gray-300",
};

export default function PlayersPage() {
  const [tab, setTab] = useState<Tab>("leaks");
  const [report, setReport] = useState<LeakReport | null>(null);
  const [globalStats, setGlobalStats] = useState<{
    totalSessions: number; totalHands: number; totalProfit: number;
    biggestWin: number; biggestLoss: number;
  } | null>(null);
  const [opponents, setOpponents] = useState<OpponentProfile[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<{
    session: Session | null;
    stats: Awaited<ReturnType<typeof computeSessionDetail>>["stats"] | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [rebuildingOpponents, setRebuildingOpponents] = useState(false);
  const minHandsForAnalysis = 20;

  const load = useCallback(async () => {
    setLoading(true);
    const [r, gs, opp, sess] = await Promise.all([
      computeLeakReport(),
      computeGlobalStats(),
      getAllOpponents(),
      getAllSessions(),
    ]);
    setReport(r);
    setGlobalStats(gs);
    setOpponents(opp);
    setSessions(sess);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRebuildOpponents() {
    setRebuildingOpponents(true);
    await computeOpponentProfiles();
    const opp = await getAllOpponents();
    setOpponents(opp);
    setRebuildingOpponents(false);
  }

  async function handleSelectSession(sessionId: string) {
    const detail = await computeSessionDetail(sessionId);
    setActiveSession(detail);
  }

  async function handleDeleteSession(sessionId: string) {
    if (!confirm("Delete this session?")) return;
    await deleteSession(sessionId);
    setActiveSession(null);
    await load();
  }

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
          {([["leaks", "Leak Detector"], ["opponents", "Opponents"], ["sessions", "Sessions"]] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setActiveSession(null); }}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? "border-[#1DB954] text-white" : "border-transparent text-gray-500 hover:text-gray-300"}`}>
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
                  <div className="h-full bg-[#1DB954] rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((report?.overall.totalHands ?? 0) / minHandsForAnalysis) * 100)}%` }} />
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
                    { label: "Total Hands", value: report!.overall.totalHands.toLocaleString() },
                    { label: "Net Profit", value: `${report!.overall.totalProfit >= 0 ? "+" : ""}${report!.overall.totalProfit.toFixed(2)}BB`,
                      color: report!.overall.totalProfit >= 0 ? "text-green-400" : "text-red-400" },
                    { label: "Win Rate", value: `${report!.overall.winRate.toFixed(1)}%` },
                    { label: "BB/100", value: `${report!.overall.bigBlindPer100 >= 0 ? "+" : ""}${report!.overall.bigBlindPer100.toFixed(2)}`,
                      color: report!.overall.bigBlindPer100 >= 0 ? "text-green-400" : "text-red-400" },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl border border-gray-800 bg-[#161B22] p-4">
                      <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                      <div className={`text-2xl font-mono font-bold ${(s as { color?: string }).color ?? "text-white"}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Preflop + Post-flop leaks */}
                {(report!.preflopLeak.length > 0 || report!.postflopLeak.length > 0) ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                                <span className={`w-1.5 h-1.5 rounded-full ${leak.severity === 'high' ? 'bg-red-400' : leak.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
                                <span className="font-medium capitalize">{leak.type.replace(/_/g, ' ')}</span>
                                <span className="ml-auto text-xs opacity-70">{leak.severity}</span>
                              </div>
                              <p className="text-xs opacity-80 leading-relaxed">{leak.detail}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
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
                                <span className={`w-1.5 h-1.5 rounded-full ${leak.severity === 'high' ? 'bg-red-400' : leak.severity === 'medium' ? 'bg-yellow-400' : 'bg-blue-400'}`} />
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
                      {report!.tiltSpots.length} session(s) with 4+ consecutive losing hands ≥5BB down.
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

                {/* Profit by position */}
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

                {/* Profit by street */}
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
                                <div className={`h-full rounded-full transition-all ${data.profit >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                                  style={{ width: `${Math.min(100, Math.abs(data.profit / (data.hands * 1))) * 5}%` }} />
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

                {/* Profit by action */}
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
                            .sort((a, b) => b[1].profit - a[1].profit)
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

                {/* Bluff record */}
                {report!.bluffAnalysis.totalBluffs > 0 && (
                  <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                    <h3 className="text-sm font-semibold text-gray-200 mb-3">Bluff Record</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Total Bluffs", value: report!.bluffAnalysis.totalBluffs.toString() },
                        { label: "Called", value: report!.bluffAnalysis.bluffsCalled.toString(), color: "text-red-400" },
                        { label: "Success Rate", value: `${report!.bluffAnalysis.bluffSuccessRate.toFixed(0)}%`,
                          color: report!.bluffAnalysis.bluffSuccessRate >= 50 ? "text-green-400" : "text-yellow-400" },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="text-xs text-gray-500">{s.label}</div>
                          <div className={`text-xl font-mono font-bold ${(s as { color?: string }).color ?? "text-white"}`}>{s.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── OPPONENTS ── */}
        {tab === "opponents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">
                {opponents.length === 0 ? "No opponent data yet" : `${opponents.length} opponent${opponents.length !== 1 ? "s" : ""}`}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleRebuildOpponents}
                  disabled={rebuildingOpponents}
                  className="px-4 py-1.5 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {rebuildingOpponents ? "Rebuilding..." : "Rebuild from Hands"}
                </button>
                <Link href="/session"
                  className="px-4 py-1.5 rounded-lg bg-[#1DB954] text-black text-xs font-semibold hover:bg-[#1ed86a] transition-colors">
                  Log More
                </Link>
              </div>
            </div>

            {opponents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">👥</div>
                <h2 className="text-2xl font-bold mb-3">No opponents yet</h2>
                <p className="text-gray-400 max-w-md mx-auto mb-6">
                  Import hand histories or log hands with opponent names. Stats are computed automatically.
                </p>
                <Link href="/session" className="inline-block px-5 py-2 rounded-lg bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed86a] transition-colors">
                  Go to Session
                </Link>
              </div>
            ) : (
              <>
                {/* VPIP / PFR scatter summary */}
                <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                  <h3 className="text-sm font-semibold text-gray-200 mb-4">VPIP vs PFR — All Opponents</h3>
                  <div className="space-y-2">
                    {opponents.map((opp) => (
                      <div key={opp.name} className="flex items-center gap-4 py-1.5 border-b border-gray-800/50 last:border-0">
                        <div className="w-36 text-sm text-white truncate">{opp.name}</div>
                        <div className="flex gap-4 flex-1">
                          {[
                            { label: "VPIP", value: opp.vpip, good: opp.vpip !== undefined && opp.vpip >= 20 && opp.vpip <= 30 },
                            { label: "PFR", value: opp.pfr, good: opp.pfr !== undefined && opp.pfr >= 15 },
                            { label: "AF", value: opp.af, good: opp.af !== undefined && opp.af >= 1.5 && opp.af <= 3 },
                            { label: "WTSD", value: opp.wtsd, good: opp.wtsd !== undefined && opp.wtsd >= 25 && opp.wtsd <= 40 },
                            { label: "W$SD", value: opp.w$sd, good: opp.w$sd !== undefined && opp.w$sd >= 48 },
                          ].map(({ label, value, good }) => (
                            <div key={label} className="text-center">
                              <div className="text-xs text-gray-600">{label}</div>
                              <div className={`text-sm font-mono font-medium ${value === undefined ? 'text-gray-600' : good ? 'text-green-400' : 'text-yellow-400'}`}>
                                {value !== undefined ? `${value}%` : '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                        {opp.playerType && opp.playerType !== 'unknown' && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAYER_TYPE_COLORS[opp.playerType] ?? 'bg-gray-500/20 text-gray-300'}`}>
                            {opp.playerType.replace('_', ' ')}
                          </span>
                        )}
                        <span className="text-xs text-gray-600 w-16 text-right">{opp.hands}h</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Per-opponent detail cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opponents.map((opp) => (
                    <div key={opp.name} className="rounded-xl border border-gray-800 bg-[#161B22] p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-semibold text-white">{opp.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{opp.hands} hands</div>
                        </div>
                        {opp.playerType && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PLAYER_TYPE_COLORS[opp.playerType] ?? 'bg-gray-500/20 text-gray-300'}`}>
                            {opp.playerType.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "VPIP", value: opp.vpip !== undefined ? `${opp.vpip}%` : "—",
                            desc: "Voluntarily in pot %" },
                          { label: "PFR", value: opp.pfr !== undefined ? `${opp.pfr}%` : "—",
                            desc: "Preflop raise %" },
                          { label: "AF", value: opp.af !== undefined ? `${opp.af}` : "—",
                            desc: "Aggression factor" },
                          { label: "WTSD", value: opp.wtsd !== undefined ? `${opp.wtsd}%` : "—",
                            desc: "Went to showdown %" },
                          { label: "W$SD", value: opp.w$sd !== undefined ? `${opp.w$sd}%` : "—",
                            desc: "Won at showdown %" },
                          { label: "River Call", value: opp.riverCall !== undefined ? `${opp.riverCall}%` : "—",
                            desc: "River call %" },
                        ].map(({ label, value, desc }) => (
                          <div key={label}>
                            <div className="text-xs text-gray-500">{label}</div>
                            <div className="text-base font-mono font-bold text-white">{value}</div>
                            <div className="text-xs text-gray-600">{desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── SESSIONS ── */}
        {tab === "sessions" && (
          <div className="space-y-6">
            {sessions.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">📋</div>
                <h2 className="text-2xl font-bold mb-3">No sessions yet</h2>
                <p className="text-gray-400">Start logging to see your session history.</p>
                <Link href="/session" className="inline-block mt-6 px-5 py-2 rounded-lg bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed86a] transition-colors">
                  Start Session
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Session list */}
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-400 mb-2">{sessions.length} sessions</div>
                  {sessions.map((s) => {
                    const net = (s.cashOut ?? 0) - (s.buyIn ?? 0);
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelectSession(s.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors ${
                          activeSession?.session?.id === s.id
                            ? "border-[#1DB954]/50 bg-[#1DB954]/5"
                            : "border-gray-800 bg-[#161B22] hover:border-gray-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-white">{s.gameType} {s.stakes ?? ""}</span>
                          <span className={`text-sm font-mono font-medium ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
                            {net >= 0 ? "+" : ""}{net.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{s.date}</span>
                          <span>BI ${s.buyIn}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Session detail */}
                <div className="lg:col-span-2">
                  {!activeSession?.session ? (
                    <div className="rounded-xl border border-gray-800 bg-[#161B22] p-8 flex items-center justify-center h-full">
                      <p className="text-gray-500 text-sm">Select a session to view breakdown</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Session summary */}
                      <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-sm font-semibold text-white">
                              {activeSession.session.gameType} {activeSession.session.stakes ?? ""}
                            </h3>
                            <p className="text-xs text-gray-500">{activeSession.session.date}</p>
                          </div>
                          <div className="flex gap-2">
                            <span className={`text-lg font-mono font-bold ${activeSession.stats!.totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                              {activeSession.stats!.totalProfit >= 0 ? "+" : ""}{activeSession.stats!.totalProfit.toFixed(2)}BB
                            </span>
                            <button onClick={() => handleDeleteSession(activeSession!.session!.id)}
                              className="ml-4 text-gray-600 hover:text-red-400 text-xs transition-colors self-start">✕ Delete</button>
                          </div>
                        </div>

                        {/* Key stats row */}
                        <div className="grid grid-cols-4 gap-3">
                          {[
                            { label: "Hands", value: activeSession.stats!.totalHands.toString() },
                            { label: "Won", value: activeSession.stats!.byResult.wins.toString() },
                            { label: "Lost", value: activeSession.stats!.byResult.losses.toString() },
                            { label: "BB/100", value: activeSession.stats!.totalHands > 0
                              ? `${((activeSession.stats!.totalProfit / activeSession.stats!.totalHands) * 100).toFixed(2)}`
                              : "—" },
                          ].map((s) => (
                            <div key={s.label} className="text-center">
                              <div className="text-xs text-gray-600">{s.label}</div>
                              <div className="text-sm font-mono font-bold text-white">{s.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* By position */}
                      {Object.keys(activeSession.stats!.byPosition).length > 0 && (
                        <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                          <h4 className="text-sm font-semibold text-gray-200 mb-3">By Position</h4>
                          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                            {POSITION_ORDER.filter((p) => activeSession.stats!.byPosition[p]).map((pos) => {
                              const data = activeSession.stats!.byPosition[pos]!;
                              return (
                                <div key={pos} className="p-1.5 rounded-lg text-center border border-gray-800">
                                  <div className="text-xs text-gray-600">{pos}</div>
                                  <div className={`text-xs font-mono font-bold ${data.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {data.profit >= 0 ? "+" : ""}{data.profit.toFixed(1)}
                                  </div>
                                  <div className="text-xs text-gray-700">{data.hands}h</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* By street */}
                      {Object.keys(activeSession.stats!.byStage).length > 1 && (
                        <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                          <h4 className="text-sm font-semibold text-gray-200 mb-3">By Street</h4>
                          <div className="space-y-2">
                            {STAGE_ORDER.filter((s) => activeSession.stats!.byStage[s]).map((stage) => {
                              const data = activeSession.stats!.byStage[stage]!;
                              return (
                                <div key={stage} className="flex items-center gap-3">
                                  <div className="w-16 text-xs text-gray-400 capitalize">{stage}</div>
                                  <div className="flex-1 h-2 rounded-full bg-gray-800 overflow-hidden">
                                    <div className={`h-full rounded-full ${data.profit >= 0 ? "bg-green-500" : "bg-red-500"}`}
                                      style={{ width: `${Math.min(100, Math.abs(data.profit / (data.hands * 0.5))) * 5}%` }} />
                                  </div>
                                  <div className={`text-xs font-mono font-medium ${data.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                    {data.profit >= 0 ? "+" : ""}{data.profit.toFixed(1)}BB
                                  </div>
                                  <div className="text-xs text-gray-600 w-12 text-right">{data.hands}h</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* By action */}
                      {Object.keys(activeSession.stats!.byAction).length > 0 && (
                        <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                          <h4 className="text-sm font-semibold text-gray-200 mb-3">By Action</h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="text-gray-600 text-xs">
                                  <th className="text-left pb-2 font-medium">Action</th>
                                  <th className="text-right pb-2 font-medium">Hands</th>
                                  <th className="text-right pb-2 font-medium">Total</th>
                                  <th className="text-right pb-2 font-medium">BB/h</th>
                                </tr>
                              </thead>
                              <tbody>
                                {Object.entries(activeSession.stats!.byAction)
                                  .sort((a, b) => b[1].profit - a[1].profit)
                                  .map(([action, data]) => (
                                    <tr key={action} className="border-t border-gray-800/50">
                                      <td className="py-2 text-gray-300">{ACTION_LABELS[action] ?? action}</td>
                                      <td className="py-2 text-right text-gray-500">{data.hands}</td>
                                      <td className={`py-2 text-right font-mono font-medium ${data.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                        {data.profit >= 0 ? "+" : ""}{data.profit.toFixed(2)}
                                      </td>
                                      <td className={`py-2 text-right font-mono ${data.profit / data.hands >= 0 ? "text-green-400/70" : "text-red-400/70"}`}>
                                        {(data.profit / data.hands) >= 0 ? "+" : ""}{(data.profit / data.hands).toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {Object.keys(activeSession.stats!.byTag).length > 0 && (
                        <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                          <h4 className="text-sm font-semibold text-gray-200 mb-3">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(activeSession.stats!.byTag).map(([tag, data]) => (
                              <div key={tag} className="px-3 py-1.5 rounded-lg bg-[#0D1117] border border-gray-800">
                                <span className="text-xs text-gray-400">{tag}</span>
                                <span className="mx-1.5 text-gray-700">·</span>
                                <span className={`text-sm font-mono font-medium ${data.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                                  {data.profit >= 0 ? "+" : ""}{data.profit.toFixed(1)}BB
                                </span>
                                <span className="ml-1.5 text-xs text-gray-600">{data.count}h</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
