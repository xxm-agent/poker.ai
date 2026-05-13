"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { saveSession, updateSession, getAllSessions, deleteSession, getHandsForSession, addHand, type Session } from "@/lib/db";
import { parsePokerStarsHand, parseHandHistoryFile, parsedHandToRecord } from "@/lib/parser";

type Tab = "log" | "history" | "import";

export default function SessionPage() {
  const [tab, setTab] = useState<Tab>("log");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [importResult, setImportResult] = useState<{ ok: number; fail: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Log form state
  const [gameType, setGameType] = useState<"cash" | "tournament">("cash");
  const [stakes, setStakes] = useState("");
  const [buyIn, setBuyIn] = useState("");
  const [cashOut, setCashOut] = useState("");
  const [notes, setNotes] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Hand entry state
  const [handHeroHand, setHandHeroHand] = useState("");
  const [handPosition, setHandPosition] = useState("");
  const [handBoard, setHandBoard] = useState("");
  const [handStage, setHandStage] = useState<"preflop" | "flop" | "turn" | "river">("flop");
  const [handAction, setHandAction] = useState("");
  const [handPot, setHandPot] = useState("");
  const [handResult, setHandResult] = useState("");
  const [handOpponent, setHandOpponent] = useState("");
  const [handNotes, setHandNotes] = useState("");
  const [handTags, setHandTags] = useState<string[]>([]);
  const [hands, setHands] = useState<{ id: string; heroHand: string; stage: string; action: string; result: number }[]>([]);
  const [handSaveCount, setHandSaveCount] = useState(0);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    const s = await getAllSessions();
    setSessions(s);
    setLoading(false);
  }, []);

  useEffect(() => { loadSessions(); }, [loadSessions]);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  // ── Create / reopen session ──────────────────────────────────────────

  async function handleCreateSession() {
    if (!buyIn) { setMessage({ type: "error", text: "Buy-in is required" }); return; }
    setSaving(true);
    try {
      const session = await saveSession({
        date: new Date().toISOString().slice(0, 10),
        gameType,
        stakes: stakes || undefined,
        buyIn: parseFloat(buyIn),
        cashOut: cashOut ? parseFloat(cashOut) : undefined,
        duration: undefined,
        notes: notes || undefined,
        hands: [],
      });
      setSessionId(session.id);
      setMessage({ type: "success", text: `Session started — ${session.gameType} ${stakes ?? ''}` });
      await loadSessions();
    } catch {
      setMessage({ type: "error", text: "Failed to create session" });
    } finally {
      setSaving(false);
    }
  }

  async function handleReopenSession(id: string) {
    setSessionId(id);
    const loaded = await getHandsForSession(id);
    setHands(loaded.map((h) => ({ id: h.id, heroHand: h.heroHand ?? "", stage: h.stage, action: h.action, result: h.result ?? 0 })));
    setHandSaveCount(loaded.length);
    setTab("log");
  }

  async function handleDeleteSession(id: string) {
    if (!confirm("Delete this session and all its hands?")) return;
    await deleteSession(id);
    if (sessionId === id) setSessionId(null);
    await loadSessions();
  }

  // ── Add hand ─────────────────────────────────────────────────────────

  async function handleAddHand() {
    if (!sessionId) { setMessage({ type: "error", text: "Start or reopen a session first" }); return; }
    if (!handHeroHand) { setMessage({ type: "error", text: "Hero hand is required" }); return; }

    const record = await addHand({
      sessionId,
      heroHand: handHeroHand || undefined,
      position: handPosition || undefined,
      board: handBoard || undefined,
      stage: handStage,
      action: handAction || "unknown",
      pot: handPot ? parseFloat(handPot) : undefined,
      result: handResult ? parseFloat(handResult) : undefined,
      opponent: handOpponent || undefined,
      notes: handNotes || undefined,
      tags: handTags,
    });

    setHands((prev) => [...prev, { id: record.id, heroHand: record.heroHand ?? "", stage: record.stage, action: record.action, result: record.result ?? 0 }]);
    setHandSaveCount((c) => c + 1);
    setMessage({ type: "success", text: "Hand logged" });

    // Reset form
    setHandHeroHand(""); setHandBoard(""); setHandOpponent(""); setHandNotes("");
    setHandPot(""); setHandResult("");
  }

  async function handleDeleteHand(id: string) {
    const { deleteHand: del } = await import("@/lib/db");
    await del(id);
    setHands((prev) => prev.filter((h) => h.id !== id));
    setHandSaveCount((c) => c - 1);
  }

  // ── Import ───────────────────────────────────────────────────────────

  async function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportResult(null);
    const text = await file.text();
    const parsed = parseHandHistoryFile(text);
    if (parsed.length === 0) { setImportResult({ ok: 0, fail: 0 }); return; }

    // Create a session for this import batch
    const session = await saveSession({
      date: new Date().toISOString().slice(0, 10),
      gameType: "cash",
      stakes: parsed[0]?.stakes,
      notes: `Imported ${parsed.length} hands from file: ${file.name}`,
      hands: [],
    });

    let ok = 0;
    for (const hand of parsed) {
      try {
        const record = parsedHandToRecord(hand, session.id);
        await addHand({ ...record, result: 0 });
        ok++;
      } catch { /* skip bad parses */ }
    }

    setImportResult({ ok, fail: parsed.length - ok });
    await loadSessions();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const activeSession = sessions.find((s) => s.id === sessionId);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
              <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-sm text-gray-400">Session Tracker</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-400">
            <Link href="/learn" className="hover:text-white transition-colors">Learn</Link>
            <Link href="/tools" className="hover:text-white transition-colors">Tools</Link>
            <Link href="/session" className="text-white">Session</Link>
            <Link href="/players" className="hover:text-white transition-colors">Players</Link>
          </nav>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Banner */}
        {message && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            message.type === "success" ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"
          }`}>
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-gray-800 pb-0">
          {([["log", "Log Hands"], ["history", "History"], ["import", "Import HH"]] as const).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t ? "border-[#1DB954] text-white" : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {label}
              {t === "log" && handSaveCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded bg-[#1DB954]/20 text-[#1DB954] text-xs">{handSaveCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── LOG TAB ── */}
        {tab === "log" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: session + hand form */}
            <div className="space-y-6">
              {/* Session widget */}
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                <div className="text-sm font-medium text-gray-300 mb-3">
                  {activeSession ? (
                    <span className="text-[#1DB954]">Session active</span>
                  ) : (
                    <span className="text-gray-500">No active session</span>
                  )}
                </div>

                {!sessionId ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Game Type</div>
                        <div className="flex gap-1">
                          {(["cash", "tournament"] as const).map((g) => (
                            <button key={g} onClick={() => setGameType(g)}
                              className={`flex-1 py-1.5 rounded text-xs font-medium transition-colors ${gameType === g ? "bg-[#1DB954] text-black" : "bg-gray-800 text-gray-400"}`}>
                              {g === "cash" ? "💰 Cash" : "🏆 MTT"}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Stakes</div>
                        <input value={stakes} onChange={(e) => setStakes(e.target.value)} placeholder="$1/$2"
                          className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Buy-in ($)</div>
                        <input value={buyIn} onChange={(e) => setBuyIn(e.target.value)} placeholder="100"
                          className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Cash-out ($)</div>
                        <input value={cashOut} onChange={(e) => setCashOut(e.target.value)} placeholder="150"
                          className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]" />
                      </div>
                    </div>
                    <button onClick={handleCreateSession} disabled={saving}
                      className="w-full py-2 rounded-lg bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed86a] transition-colors disabled:opacity-50">
                      {saving ? "Starting..." : "Start Session"}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{activeSession?.gameType} {activeSession?.stakes}</span>
                      <span className="text-gray-400">{activeSession?.date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Buy-in</span>
                      <span className="text-white font-mono">${activeSession?.buyIn}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Net</span>
                      <span className={`font-mono font-medium ${((activeSession?.cashOut ?? 0) - (activeSession?.buyIn ?? 0)) >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {((activeSession?.cashOut ?? 0) - (activeSession?.buyIn ?? 0)) >= 0 ? "+" : ""}
                        ${((activeSession?.cashOut ?? 0) - (activeSession?.buyIn ?? 0)).toFixed(2)}
                      </span>
                    </div>
                    <button onClick={() => setSessionId(null)}
                      className="w-full py-2 rounded-lg bg-gray-800 text-gray-400 text-sm hover:bg-gray-700 transition-colors">
                      End Session
                    </button>
                  </div>
                )}
              </div>

              {/* Hand entry form */}
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                <div className="text-sm font-medium text-gray-300 mb-3">Log a Hand</div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Hero Hand <span className="text-red-400">*</span></div>
                      <input value={handHeroHand} onChange={(e) => setHandHeroHand(e.target.value)} placeholder="As Ks"
                        className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm font-mono focus:outline-none focus:border-[#1DB954]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Position</div>
                      <select value={handPosition} onChange={(e) => setHandPosition(e.target.value)}
                        className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]">
                        <option value="">Select</option>
                        {['UTG', 'UTG1', 'MP', 'MP1', 'CO', 'BTN', 'SB', 'BB'].map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Board</div>
                      <input value={handBoard} onChange={(e) => setHandBoard(e.target.value)} placeholder="Kh 7s 2c"
                        className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm font-mono focus:outline-none focus:border-[#1DB954]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Stage</div>
                      <select value={handStage} onChange={(e) => setHandStage(e.target.value as typeof handStage)}
                        className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]">
                        {['preflop', 'flop', 'turn', 'river'].map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Action</div>
                    <select value={handAction} onChange={(e) => setHandAction(e.target.value)}
                      className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]">
                      <option value="">Select</option>
                      {['fold', 'check', 'call', 'bet', 'raise', '3bet', '4bet', 'bluff', 'value_bet', 'hero_call', 'hero_fold'].map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Pot ($)</div>
                      <input value={handPot} onChange={(e) => setHandPot(e.target.value)} placeholder="10"
                        className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm font-mono focus:outline-none focus:border-[#1DB954]" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Result ($)</div>
                      <input value={handResult} onChange={(e) => setHandResult(e.target.value)} placeholder="+5.50"
                        className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm font-mono focus:outline-none focus:border-[#1DB954]" />
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Opponent</div>
                    <input value={handOpponent} onChange={(e) => setHandOpponent(e.target.value)} placeholder="PlayerName"
                      className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954]" />
                  </div>

                  {/* Tags */}
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {["bluff", "value", "hero_call", "hero_fold", "check_raise", "cbet", "float"].map((tag) => (
                        <button key={tag} onClick={() => setHandTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag])}
                          className={`px-2 py-0.5 rounded-full text-xs transition-colors ${handTags.includes(tag) ? "bg-[#1DB954] text-black" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <textarea value={handNotes} onChange={(e) => setHandNotes(e.target.value)} rows={2} placeholder="Any notes..."
                      className="w-full px-3 py-1.5 rounded bg-gray-900 border border-gray-700 text-white text-sm focus:outline-none focus:border-[#1DB954] resize-none" />
                  </div>

                  <button onClick={handleAddHand} disabled={!sessionId}
                    className="w-full py-2 rounded-lg bg-[#1DB954] text-black text-sm font-semibold hover:bg-[#1ed86a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Add Hand
                  </button>
                </div>
              </div>
            </div>

            {/* Right: hands list */}
            <div>
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-300">Hands in Session</div>
                  {hands.length > 0 && (
                    <div className="flex gap-2 text-xs">
                      <span className="text-green-400">Won: {hands.filter((h) => h.result > 0).length}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-red-400">Lost: {hands.filter((h) => h.result < 0).length}</span>
                      <span className="text-gray-500">·</span>
                      <span className="text-white">Total: {hands.length}</span>
                    </div>
                  )}
                </div>

                {hands.length === 0 ? (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    {sessionId ? "No hands logged yet" : "Start a session to begin logging hands"}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {[...hands].reverse().map((h) => (
                      <div key={h.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#0D1117] border border-gray-800">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-white font-medium">{h.heroHand || "—"}</span>
                          <span className="text-xs text-gray-500 capitalize">{h.stage}</span>
                          <span className="text-xs text-gray-600">·</span>
                          <span className="text-xs text-gray-400">{h.action}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-sm font-mono font-medium ${h.result > 0 ? "text-green-400" : h.result < 0 ? "text-red-400" : "text-gray-500"}`}>
                            {h.result > 0 ? "+" : ""}{h.result.toFixed(2)}
                          </span>
                          <button onClick={() => handleDeleteHand(h.id)} className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ── */}
        {tab === "history" && (
          <div>
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <p className="text-gray-400">No sessions yet. Start logging!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((s) => {
                  const net = (s.cashOut ?? 0) - (s.buyIn ?? 0);
                  return (
                    <div key={s.id} className="rounded-xl border border-gray-800 bg-[#161B22] p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-xs text-gray-500">{s.date}</div>
                        <div>
                          <div className="text-sm font-medium text-white">{s.gameType} {s.stakes ?? ""}</div>
                          <div className="text-xs text-gray-400">
                            BI ${s.buyIn} {s.cashOut ? `→ $${s.cashOut}` : "· Ongoing"}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={`text-sm font-mono font-medium ${net >= 0 ? "text-green-400" : "text-red-400"}`}>
                          {net >= 0 ? "+" : ""}{net.toFixed(2)}
                        </div>
                        <button onClick={() => handleReopenSession(s.id)}
                          className="px-3 py-1 rounded-lg bg-gray-800 text-gray-300 text-xs hover:bg-gray-700 transition-colors">
                          Reopen
                        </button>
                        <button onClick={() => handleDeleteSession(s.id)}
                          className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── IMPORT TAB ── */}
        {tab === "import" && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="rounded-xl border border-dashed border-gray-700 bg-[#161B22] p-10 text-center">
              <div className="text-4xl mb-4">📂</div>
              <h3 className="text-lg font-semibold mb-2">Import PokerStars Hand History</h3>
              <p className="text-sm text-gray-400 mb-6">Upload a <span className="font-mono text-gray-300">.txt</span> file exported from PokerStars.</p>
              <input ref={fileInputRef} type="file" accept=".txt" onChange={handleFileImport}
                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#1DB954] file:text-black file:text-sm file:font-semibold file:cursor-pointer hover:file:bg-[#1ed86a]" />
            </div>

            {importResult && (
              <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
                <div className="text-sm font-medium text-gray-300 mb-2">Import Result</div>
                <div className="space-y-1 text-sm">
                  <div className="text-green-400">✓ {importResult.ok} hands imported</div>
                  {importResult.fail > 0 && <div className="text-red-400">✗ {importResult.fail} hands failed to parse</div>}
                  {importResult.ok === 0 && importResult.fail === 0 && <div className="text-gray-400">No hands found in file</div>}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-gray-800 bg-[#161B22] p-5">
              <h4 className="text-sm font-medium text-gray-300 mb-3">How to export from PokerStars</h4>
              <ol className="text-sm text-gray-400 space-y-1.5">
                <li>1. Open PokerStars client</li>
                <li>2. Go to <span className="text-white">Reports → Hand History</span></li>
                <li>3. Select date range and table type</li>
                <li>4. Click <span className="text-white">Export</span> and save as .txt</li>
                <li>5. Upload that file here</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
