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
