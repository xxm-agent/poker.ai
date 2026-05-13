// IndexedDB schema for poker.ai session tracker

const DB_NAME = 'poker-ai-sessions';
const DB_VERSION = 1;

export interface Session {
  id: string;
  date: string; // ISO date string
  gameType: 'cash' | 'tournament';
  stakes?: string; // e.g. "$1/$2", "$5/$10"
  buyIn?: number;
  cashOut?: number;
  duration?: number; // minutes
  notes?: string;
  hands: HandRecord[];
  createdAt: number;
}

export interface HandRecord {
  id: string;
  sessionId: string;
  heroHand?: string; // e.g. "As Ks"
  position?: string;
  board?: string; // e.g. "Kh 7s 2c"
  stage: 'preflop' | 'flop' | 'turn' | 'river';
  action: string; // e.g. "call", "raise", "3bet", "fold", "check"
  pot?: number;
  result?: number; // net profit/loss for this hand
  opponent?: string;
  notes?: string;
  tags?: string[]; // e.g. ["bluff", "value", "hero_call"]
  createdAt: number;
}

export interface OpponentProfile {
  name: string;
  hands: number;
  vpip?: number; // Voluntarily Put Money In (%)
  pfr?: number;  // Pre-flop Raise (%)
  af?: number;   // Aggression Factor
  wtsd?: number; // Went to Showdown (%)
  w$sd?: number; // Won at Showdown (%)
  riverCall?: number; // % call river
  playerType?: 'nit' | 'tag' | 'lag' | 'calling_station' | 'fish' | 'unknown';
  lastSeen: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('sessions')) {
        const sessions = db.createObjectStore('sessions', { keyPath: 'id' });
        sessions.createIndex('date', 'date');
        sessions.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains('hands')) {
        const hands = db.createObjectStore('hands', { keyPath: 'id' });
        hands.createIndex('sessionId', 'sessionId');
        hands.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains('opponents')) {
        const opponents = db.createObjectStore('opponents', { keyPath: 'name' });
        opponents.createIndex('lastSeen', 'lastSeen');
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Sessions ──────────────────────────────────────────────────────────────

export async function saveSession(session: Omit<Session, 'id' | 'createdAt'>): Promise<Session> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const store = tx.objectStore('sessions');
    const record: Session = { ...session, id: generateId(), createdAt: Date.now() };
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function updateSession(session: Session): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readwrite');
    const req = tx.objectStore('sessions').put(session);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const req = tx.objectStore('sessions').getAll();
    req.onsuccess = () => {
      const sessions = (req.result as Session[]).sort((a, b) => b.createdAt - a.createdAt);
      resolve(sessions);
    };
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function getSession(id: string): Promise<Session | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sessions', 'readonly');
    const req = tx.objectStore('sessions').get(id);
    req.onsuccess = () => resolve(req.result as Session | null);
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function deleteSession(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['sessions', 'hands'], 'readwrite');
    // Delete session
    tx.objectStore('sessions').delete(id);
    // Delete associated hands
    const handsIndex = tx.objectStore('hands').index('sessionId');
    const handsReq = handsIndex.getAllKeys(id);
    handsReq.onsuccess = () => {
      for (const key of handsReq.result) {
        tx.objectStore('hands').delete(key);
      }
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

// ── Individual Hands ─────────────────────────────────────────────────────

export async function addHand(hand: Omit<HandRecord, 'id' | 'createdAt'>): Promise<HandRecord> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('hands', 'readwrite');
    const record: HandRecord = { ...hand, id: generateId(), createdAt: Date.now() };
    const req = tx.objectStore('hands').put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function getHandsForSession(sessionId: string): Promise<HandRecord[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('hands', 'readonly');
    const index = tx.objectStore('hands').index('sessionId');
    const req = index.getAll(sessionId);
    req.onsuccess = () => resolve(req.result as HandRecord[]);
    req.onerror = () => reject(req.error);
    db.close();
  });
}

export async function deleteHand(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('hands', 'readwrite');
    const req = tx.objectStore('hands').delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
    db.close();
  });
}

// ── Opponents ────────────────────────────────────────────────────────────

export async function upsertOpponent(profile: Partial<OpponentProfile> & { name: string }): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('opponents', 'readwrite');
    const req = tx.objectStore('opponents').get(profile.name);
    req.onsuccess = () => {
      const existing = req.result as OpponentProfile | undefined;
      const updated: OpponentProfile = {
        name: profile.name,
        hands: existing?.hands ?? 0,
        vpip: existing?.vpip ?? profile.vpip ?? 0,
        pfr: existing?.pfr ?? profile.pfr ?? 0,
        af: existing?.af ?? profile.af ?? 0,
        wtsd: existing?.wtsd ?? profile.wtsd ?? 0,
        w$sd: existing?.w$sd ?? profile.w$sd ?? 0,
        riverCall: existing?.riverCall ?? profile.riverCall ?? 0,
        playerType: existing?.playerType ?? profile.playerType ?? 'unknown',
        lastSeen: Date.now(),
      };
      tx.objectStore('opponents').put(updated);
    };
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    db.close();
  });
}

export async function getAllOpponents(): Promise<OpponentProfile[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('opponents', 'readonly');
    const req = tx.objectStore('opponents').getAll();
    req.onsuccess = () => {
      const sorted = (req.result as OpponentProfile[]).sort((a, b) => b.lastSeen - a.lastSeen);
      resolve(sorted);
    };
    req.onerror = () => reject(req.error);
    db.close();
  });
}

// ── Compute opponent stats from hand records ──────────────────────────────

function classifyPlayer(vpip: number, pfr: number, af: number, wtsd: number): OpponentProfile['playerType'] {
  if (vpip < 10 && pfr < 8) return 'nit';
  if (vpip > 40) return 'calling_station';
  if (vpip > 30 && pfr < 12) return 'fish';
  if (vpip > 25 && af > 2.5) return 'lag';
  if (vpip >= 18 && vpip <= 28 && pfr >= 14 && pfr <= 24) return 'tag';
  return 'unknown';
}

export async function computeOpponentProfiles(): Promise<void> {
  // Collect all hands across all sessions
  const sessions = await getAllSessions();
  const allHands: HandRecord[] = [];
  for (const s of sessions) {
    const h = await getHandsForSession(s.id);
    allHands.push(...h);
  }

  if (allHands.length === 0) return;

  // Group hands by opponent
  const byOpponent: Record<string, HandRecord[]> = {};
  for (const hand of allHands) {
    if (!hand.opponent) continue;
    byOpponent[hand.opponent] = byOpponent[hand.opponent] ?? [];
    byOpponent[hand.opponent].push(hand);
  }

  // VPIP: count hands where opponent voluntarily put money in preflop (call, raise, 3bet, 4bet)
  const vpipActions = new Set(['call', 'raise', '3bet', '4bet', 'bluff', 'value_bet', 'cbet', 'check_raise', 'float', 'hero_call']);

  for (const [name, hands] of Object.entries(byOpponent)) {
    if (hands.length < 3) continue;

    let vpipCount = 0;
    let pfrCount = 0;
    let totalBets = 0;
    let totalCalls = 0;
    let showdowns = 0;
    let wonShowdowns = 0;
    let riverSeen = 0;
    let riverCalled = 0;

    for (const hand of hands) {
      const stage = hand.stage;
      const action = hand.action.toLowerCase();

      if (stage === 'preflop') {
        if (vpipActions.has(action) || action === 'call') vpipCount++;
        if (['raise', '3bet', '4bet'].includes(action)) pfrCount++;
      }

      // Aggression: bets and raises vs calls
      if (['bet', 'raise', '3bet', '4bet', 'cbet', 'check_raise', 'bluff'].includes(action)) totalBets++;
      if (['call', 'hero_call'].includes(action)) totalCalls++;

      // Showdown
      if (stage === 'river' || action === 'showdown') {
        showdowns++;
        if ((hand.result ?? 0) > 0) wonShowdowns++;
      }

      // River call
      if (stage === 'river') {
        riverSeen++;
        if (['call', 'hero_call'].includes(action)) riverCalled++;
      }
    }

    const vpip = Math.round((vpipCount / hands.length) * 100);
    const pfr = Math.round((pfrCount / hands.length) * 100);
    const af = totalCalls > 0 ? totalBets / totalCalls : totalBets > 0 ? totalBets : 0;
    const wtsd = Math.round((showdowns / hands.length) * 100);
    const w$sd = showdowns > 0 ? Math.round((wonShowdowns / showdowns) * 100) : 0;
    const riverCall = riverSeen > 0 ? Math.round((riverCalled / riverSeen) * 100) : 0;

    await upsertOpponent({
      name,
      hands: hands.length,
      vpip,
      pfr,
      af: Math.round(af * 10) / 10,
      wtsd,
      w$sd,
      riverCall,
      playerType: classifyPlayer(vpip, pfr, af, wtsd),
    });
  }
}

// ── Session detail stats ──────────────────────────────────────────────────

export async function computeSessionDetail(sessionId: string): Promise<{
  session: Session | null;
  stats: {
    totalHands: number;
    wonHands: number;
    totalProfit: number;
    byPosition: Record<string, { hands: number; profit: number }>;
    byStage: Record<string, { hands: number; profit: number }>;
    byAction: Record<string, { hands: number; profit: number }>;
    byTag: Record<string, { count: number; profit: number }>;
    byResult: { wins: number; losses: number; breakeven: number; totalProfit: number };
    hourlyRate: number | null;
  };
}> {
  const sessions = await getAllSessions();
  const session = sessions.find((s) => s.id === sessionId) ?? null;
  const hands = await getHandsForSession(sessionId);

  const byPosition: Record<string, { hands: number; profit: number }> = {};
  const byStage: Record<string, { hands: number; profit: number }> = {};
  const byAction: Record<string, { hands: number; profit: number }> = {};
  const byTag: Record<string, { count: number; profit: number }> = {};
  let wonHands = 0;
  let losses = 0;
  let breakeven = 0;
  let totalProfit = 0;

  for (const hand of hands) {
    const r = hand.result ?? 0;
    totalProfit += r;
    if (r > 0) wonHands++;
    else if (r < 0) losses++;
    else breakeven++;

    if (hand.position) {
      byPosition[hand.position] = byPosition[hand.position] ?? { hands: 0, profit: 0 };
      byPosition[hand.position].hands++;
      byPosition[hand.position].profit += r;
    }
    byStage[hand.stage] = byStage[hand.stage] ?? { hands: 0, profit: 0 };
    byStage[hand.stage].hands++;
    byStage[hand.stage].profit += r;

    const act = hand.action ?? 'unknown';
    byAction[act] = byAction[act] ?? { hands: 0, profit: 0 };
    byAction[act].hands++;
    byAction[act].profit += r;

    for (const tag of hand.tags ?? []) {
      byTag[tag] = byTag[tag] ?? { count: 0, profit: 0 };
      byTag[tag].count++;
      byTag[tag].profit += r;
    }
  }

  // Duration in hours (rough estimate: assume 30 hands/hour for live, 60 for online)
  const durationHours = (session?.duration ?? 0) / 60;
  const hourlyRate = durationHours > 0 ? totalProfit / durationHours : null;

  return {
    session,
    stats: {
      totalHands: hands.length,
      wonHands,
      totalProfit,
      byPosition,
      byStage,
      byAction,
      byTag,
      byResult: { wins: wonHands, losses, breakeven, totalProfit },
      hourlyRate,
    },
  };
}

// ── Stats ────────────────────────────────────────────────────────────────

export async function computeSessionStats(sessionId: string): Promise<{
  totalHands: number;
  wonHands: number;
  totalProfit: number;
  byPosition: Record<string, { hands: number; profit: number }>;
  byStage: Record<string, { hands: number; profit: number }>;
}> {
  const hands = await getHandsForSession(sessionId);
  const byPosition: Record<string, { hands: number; profit: number }> = {};
  const byStage: Record<string, { hands: number; profit: number }> = {};
  let totalProfit = 0;
  let wonHands = 0;

  for (const hand of hands) {
    totalProfit += hand.result ?? 0;
    if ((hand.result ?? 0) > 0) wonHands++;
    if (hand.position) {
      byPosition[hand.position] = byPosition[hand.position] ?? { hands: 0, profit: 0 };
      byPosition[hand.position].hands++;
      byPosition[hand.position].profit += hand.result ?? 0;
    }
    byStage[hand.stage] = byStage[hand.stage] ?? { hands: 0, profit: 0 };
    byStage[hand.stage].hands++;
    byStage[hand.stage].profit += hand.result ?? 0;
  }

  return { totalHands: hands.length, wonHands, totalProfit, byPosition, byStage };
}

export async function computeGlobalStats(): Promise<{
  totalSessions: number;
  totalHands: number;
  totalProfit: number;
  biggestWin: number;
  biggestLoss: number;
}> {
  const sessions = await getAllSessions();
  const db = await openDB();

  let totalHands = 0;
  let totalProfit = 0;
  let biggestWin = 0;
  let biggestLoss = 0;

  for (const session of sessions) {
    const hands = await getHandsForSession(session.id);
    totalHands += hands.length;
    for (const hand of hands) {
      const r = hand.result ?? 0;
      totalProfit += r;
      if (r > biggestWin) biggestWin = r;
      if (r < biggestLoss) biggestLoss = r;
    }
  }

  return { totalSessions: sessions.length, totalHands, totalProfit, biggestWin, biggestLoss };
}

// ── Leak Analysis ─────────────────────────────────────────────────────────

export interface LeakReport {
  overall: {
    totalHands: number;
    totalProfit: number;
    winRate: number; // % hands won
    bigBlindPer100: number;
  };
  byPosition: Record<string, { hands: number; profit: number; leak?: boolean }>;
  byStage: Record<string, { hands: number; profit: number; leak?: boolean }>;
  byAction: Record<string, { hands: number; profit: number; avgResult: number }>;
  tiltSpots: { sessionId: string; date: string; consecutiveLosses: number; totalLoss: number }[];
  preflopLeak: { type: string; severity: 'low' | 'medium' | 'high'; detail: string }[];
  postflopLeak: { type: string; severity: 'low' | 'medium' | 'high'; detail: string }[];
  bluffAnalysis: {
    totalBluffs: number;
    bluffsCalled: number;
    bluffSuccessRate: number;
  };
  tagStats: Record<string, { count: number; totalProfit: number }>;
}

export async function computeLeakReport(): Promise<LeakReport | null> {
  const sessions = await getAllSessions();
  if (sessions.length === 0) return null;

  const allHands: HandRecord[] = [];
  for (const s of sessions) {
    const h = await getHandsForSession(s.id);
    allHands.push(...h);
  }

  if (allHands.length < 20) return null;

  const bigBlindPer100 = (allHands.reduce((sum, h) => sum + (h.result ?? 0), 0) / allHands.length) * 100;

  // By position
  const byPosition: Record<string, { hands: number; profit: number }> = {};
  // By stage
  const byStage: Record<string, { hands: number; profit: number }> = {};
  // By action
  const byAction: Record<string, { hands: number; profit: number }> = {};
  // By tag
  const tagStats: Record<string, { count: number; profit: number }> = {};
  // Session clusters for tilt detection
  const sessionHands: Record<string, HandRecord[]> = {};
  // Bluffs
  let totalBluffs = 0;
  let bluffsCalled = 0;

  let wonHands = 0;

  for (const hand of allHands) {
    const r = hand.result ?? 0;
    if (r > 0) wonHands++;
    if (hand.position) {
      byPosition[hand.position] = byPosition[hand.position] ?? { hands: 0, profit: 0 };
      byPosition[hand.position].hands++;
      byPosition[hand.position].profit += r;
    }
    byStage[hand.stage] = byStage[hand.stage] ?? { hands: 0, profit: 0 };
    byStage[hand.stage].hands++;
    byStage[hand.stage].profit += r;

    const act = hand.action ?? 'unknown';
    byAction[act] = byAction[act] ?? { hands: 0, profit: 0 };
    byAction[act].hands++;
    byAction[act].profit += r;

    // Tags
    for (const tag of hand.tags ?? []) {
      tagStats[tag] = tagStats[tag] ?? { count: 0, profit: 0 };
      tagStats[tag].count++;
      tagStats[tag].profit += r;
    }

    if (!sessionHands[hand.sessionId]) sessionHands[hand.sessionId] = [];
    sessionHands[hand.sessionId].push(hand);

    // Bluff detection
    const isBluffTag = (hand.tags ?? []).includes('bluff');
    if (isBluffTag) {
      totalBluffs++;
      // If opponent called (any non-fold result), the bluff was called
      if (act !== 'fold') bluffsCalled++;
    }
  }

  // ── Tilt detection ────────────────────────────────────────────────────
  const tiltSpots: LeakReport['tiltSpots'] = [];
  for (const session of sessions) {
    const sHands = sessionHands[session.id] ?? [];
    // Find consecutive losing hands
    for (let i = 0; i < sHands.length; i++) {
      if ((sHands[i].result ?? 0) >= 0) continue;
      let consecutive = 1;
      let loss = sHands[i].result ?? 0;
      for (let j = i + 1; j < sHands.length; j++) {
        if ((sHands[j].result ?? 0) < 0) { consecutive++; loss += sHands[j].result ?? 0; }
        else break;
      }
      if (consecutive >= 4 && loss <= -5) {
        tiltSpots.push({
          sessionId: session.id,
          date: session.date,
          consecutiveLosses: consecutive,
          totalLoss: loss,
        });
        break; // one spot per session
      }
    }
  }

  // ── Preflop leak detection ────────────────────────────────────────────
  const preflopLeak: LeakReport['preflopLeak'] = [];

  const foldCount = byAction['fold']?.hands ?? 0;
  const callCount = byAction['call']?.hands ?? 0;
  const raiseCount = (byAction['raise']?.hands ?? 0) + (byAction['3bet']?.hands ?? 0) + (byAction['4bet']?.hands ?? 0);

  // Too many folds preflop (over 30% of all hands played)
  const totalPlayed = foldCount + callCount + raiseCount;
  if (totalPlayed > 0 && foldCount / totalPlayed > 0.4) {
    preflopLeak.push({
      type: 'folding_too_much',
      severity: foldCount / totalPlayed > 0.55 ? 'high' : 'medium',
      detail: `You fold ${Math.round(foldCount / totalPlayed * 100)}% of hands before the flop. You're playing too tight — you're giving up pots without a fight.`,
    });
  }

  // Never 4-bet
  const fourBetCount = byAction['4bet']?.hands ?? 0;
  if (fourBetCount === 0 && totalPlayed > 50) {
    preflopLeak.push({
      type: 'no_4bet_bluff',
      severity: 'medium',
      detail: `You've never 4-bet in ${totalPlayed} hands. You're transparent — opponents know you only call or fold. Add some 4-bet bluffs with suited connectors.`,
    });
  }

  // Limp too much (calling but not raising)
  if (totalPlayed > 0 && callCount / totalPlayed > 0.3) {
    preflopLeak.push({
      type: 'limping_too_much',
      severity: 'medium',
      detail: `${Math.round(callCount / totalPlayed * 100)}% of your hands are calls (limps). Limping is mostly passive — consider raising with your strong hands to build pots.`,
    });
  }

  // Lose most from BB
  const bbProfit = byPosition['BB']?.profit ?? 0;
  const bbHands = byPosition['BB']?.hands ?? 0;
  if (bbHands > 10 && bbProfit < -bbHands * 0.5) {
    preflopLeak.push({
      type: 'bb_loss',
      severity: bbProfit < -bbHands ? 'high' : 'medium',
      detail: `You lose ${bbProfit.toFixed(1)}BB from BB in ${bbHands} hands (${(bbProfit / bbHands).toFixed(2)} BB/hand). Either defending too little or playing poorly post-flop when checked to.`,
    });
  }

  // ── Post-flop leak detection ──────────────────────────────────────────
  const postflopLeak: LeakReport['postflopLeak'] = [];

  const flopProfit = byStage['flop']?.profit ?? 0;
  const turnProfit = byStage['turn']?.profit ?? 0;
  const riverProfit = byStage['river']?.profit ?? 0;
  const flopHands = byStage['flop']?.hands ?? 0;
  const turnHands = byStage['turn']?.hands ?? 0;
  const riverHands = byStage['river']?.hands ?? 0;

  // Worst street
  const worstStreet = flopHands > 5 && flopProfit / flopHands < -0.3 ? 'flop'
    : turnHands > 5 && turnProfit / turnHands < -0.3 ? 'turn'
    : riverHands > 5 && riverProfit / riverHands < -0.3 ? 'river' : null;

  if (worstStreet) {
    const profit = byStage[worstStreet]!.profit;
    const hands = byStage[worstStreet]!.hands;
    const perHand = (profit / hands).toFixed(2);
    postflopLeak.push({
      type: `${worstStreet}_leak`,
      severity: profit / hands < -0.5 ? 'high' : 'medium',
      detail: `You lose ${Math.abs(profit).toFixed(2)}BB on the ${worstStreet} (${perHand} BB/hand). You're giving away pots after the ${worstStreet}. Check what actions you're taking here.`,
    });
  }

  // Hero call losing money
  const heroCallProfit = tagStats['hero_call']?.profit ?? 0;
  const heroCallCount = tagStats['hero_call']?.count ?? 0;
  if (heroCallCount > 5 && heroCallProfit / heroCallCount < -0.3) {
    postflopLeak.push({
      type: 'hero_call_overplay',
      severity: heroCallProfit / heroCallCount < -0.5 ? 'high' : 'medium',
      detail: `Your hero calls average ${(heroCallProfit / heroCallCount).toFixed(2)}BB loss. ${heroCallCount} hero calls — either you're calling with too weak or the opponent isn't bluffing enough.`,
    });
  }

  // Folding too much on river
  const riverFolds = byAction['fold']?.hands ?? 0;
  if (riverHands > 10 && riverFolds / riverHands > 0.5) {
    postflopLeak.push({
      type: 'river_fold_too_much',
      severity: riverFolds / riverHands > 0.7 ? 'high' : 'medium',
      detail: `You fold ${Math.round(riverFolds / riverHands * 100)}% of river hands. River is where value bets get called — if you're folding this much you're missing thin value and letting bluffs win.`,
    });
  }

  // ── Bluff analysis ────────────────────────────────────────────────────
  const bluffSuccessRate = totalBluffs > 0 ? ((totalBluffs - bluffsCalled) / totalBluffs) * 100 : 0;

  const avgResultFor = (action: string) => {
    const a = byAction[action];
    return a && a.hands > 0 ? a.profit / a.hands : 0;
  };

  return {
    overall: {
      totalHands: allHands.length,
      totalProfit: allHands.reduce((s, h) => s + (h.result ?? 0), 0),
      winRate: (wonHands / allHands.length) * 100,
      bigBlindPer100,
    },
    byPosition: Object.fromEntries(
      Object.entries(byPosition).map(([k, v]) => [k, {
        ...v,
        leak: v.profit < 0 && v.hands >= 5 && v.profit / v.hands < -0.4,
      }])
    ),
    byStage: Object.fromEntries(
      Object.entries(byStage).map(([k, v]) => [k, {
        ...v,
        leak: v.profit < 0 && v.hands >= 5 && v.profit / v.hands < -0.4,
      }])
    ),
    byAction: Object.fromEntries(
      Object.entries(byAction).map(([k, v]) => [k, { ...v, avgResult: v.profit / v.hands }])
    ),
    tiltSpots,
    preflopLeak,
    postflopLeak,
    bluffAnalysis: { totalBluffs, bluffsCalled, bluffSuccessRate },
    tagStats: Object.fromEntries(
      Object.entries(tagStats).map(([k, v]) => [k, { count: v.count, totalProfit: v.profit }])
    ),
  };
}
