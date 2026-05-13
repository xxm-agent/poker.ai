/**
 * PokerStars hand history parser
 * Supports basic No-Limit Hold'em ring game and tournament formats.
 *
 * Example format:
 * PokerStars Hand #123456789: Hold'em No Limit ($0.01/$0.02) - 2024/01/15 14:32:00
 * Table 'Mercury' 6-max
 * Seat 1: Hero ($2.45)
 * Seat 2: FishPlayer ($1.80)
 * Hero: posts small blind $0.01
 * FishPlayer: posts big blind $0.02
 * *** HOLE CARDS ***
 * Hero: As Ks
 * FishPlayer: Jh Jd
 * *** FLOP *** [Kh 7s 2c]
 * Hero: bets $0.50
 * FishPlayer: calls $0.50
 * *** TURN *** [Kh 7s 2c] [9d]
 * Hero: checks
 * FishPlayer: bets $1.00
 * Hero: folds
 * *** SUMMARY ***
 * Pot: $2.03 | Rake $0.10
 * FishPlayer: shows Jh Jd (a pair of Jacks)
 * FishPlayer collected $1.93
 */

export interface ParsedHand {
  handId: string;
  date: string;
  gameType: 'cash' | 'tournament';
  stakes: string;
  tableName: string;
  tableSize: number;
  players: { name: string; seat: number; stack: number; isHero?: boolean }[];
  heroName?: string;
  holeCards?: string; // e.g. "As Ks"
  board?: string;     // e.g. "Kh 7s 2c 9d Qd"
  actions: ParsedAction[];
  pot: number;
  rake?: number;
  winner?: string;
  winnerHand?: string;
}

export interface ParsedAction {
  player: string;
  street: 'preflop' | 'flop' | 'turn' | 'river';
  action: string;      // 'posts small blind' | 'calls' | 'bets' | 'raises' | 'folds' | 'checks' | 'shows' | 'collected'
  amount?: number;
  hand?: string;       // for 'shows' action
  raw: string;
}

export function parsePokerStarsHand(text: string): ParsedHand | null {
  const lines = text.trim().split('\n').map((l) => l.trim());
  if (!text.includes('PokerStars Hand #')) return null;

  const parsed: Partial<ParsedHand> = {
    actions: [],
    players: [],
  };

  // Extract hand ID
  const handIdMatch = text.match(/PokerStars Hand #(\d+)/);
  if (handIdMatch) parsed.handId = handIdMatch[1];

  // Extract game info
  const gameMatch = text.match(/Hold'em No Limit \(([^)]+)\)/);
  if (gameMatch) parsed.stakes = gameMatch[1];

  // Extract date
  const dateMatch = text.match(/(\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2})/);
  if (dateMatch) parsed.date = dateMatch[1].replace(/\//g, '-');

  // Extract table
  const tableMatch = text.match(/Table '([^']+)' (\d+)-max/);
  if (tableMatch) {
    parsed.tableName = tableMatch[1];
    parsed.tableSize = parseInt(tableMatch[2], 10);
  }

  // Determine game type
  parsed.gameType = text.includes('Tournament') ? 'tournament' : 'cash';

  // Extract players and stacks
  const seatRegex = /Seat (\d+): (.+?) \((\$[\d.]+)\)/g;
  let seatMatch;
  while ((seatMatch = seatRegex.exec(text)) !== null) {
    const name = seatMatch[2];
    parsed.players!.push({
      seat: parseInt(seatMatch[1], 10),
      name,
      stack: parseFloat(seatMatch[3].replace('$', '')),
      isHero: false,
    });
  }

  // Identify hero (first "posts small blind" or known player label)
  const heroBlindMatch = text.match(/^(.+?): (posts small blind|posts big blind)/m);
  if (heroBlindMatch) {
    const heroName = heroBlindMatch[1].trim();
    parsed.heroName = heroName;
    parsed.players = parsed.players!.map((p) =>
      p.name === heroName ? { ...p, isHero: true } : p
    );
    const heroPlayer = parsed.players!.find((p) => p.isHero);
    if (heroPlayer) parsed.players!.unshift(parsed.players!.splice(parsed.players!.indexOf(heroPlayer), 1)[0]);
  }

  // Extract hole cards
  const heroCardsMatch = text.match(/Hero: ([\dA-Za-z♠♥♦♣ ]+)/);
  if (heroCardsMatch) parsed.holeCards = heroCardsMatch[1].trim();

  // Extract board
  const boardMatch = text.match(/\*\*\* (FLOP|TURN|RIVER) \*\*\* (\[[\w♠♥♦♣ ]+\])/g);
  if (boardMatch) {
    const boardCards = boardMatch.map((m) => m.match(/\[([^\]]+)\]/)?.[1] ?? '').join(' ');
    parsed.board = boardCards;
  }

  // Extract pot
  const potMatch = text.match(/Pot: ([\d.]+)/);
  if (potMatch) parsed.pot = parseFloat(potMatch[1]);

  const rakeMatch = text.match(/Rake ([\d.]+)/);
  if (rakeMatch) parsed.rake = parseFloat(rakeMatch[1]);

  // Extract winner
  const winnerMatch = text.match(/(.+?) (collected|shows|wins)/);
  if (winnerMatch) parsed.winner = winnerMatch[1].trim();

  // Extract street actions
  const streets: { regex: RegExp; street: string }[] = [
    { regex: /\*\*\* HOLE CARDS \*\*\*/, street: 'preflop' },
    { regex: /\*\*\* FLOP \*\*\*/, street: 'preflop' },
    { regex: /\*\*\* TURN \*\*\*/, street: 'turn' },
    { regex: /\*\*\* RIVER \*\*\*/, street: 'river' },
  ];

  const actionRegex = /^([^:]+): (.+)$/gm;
  let match;
  let currentStreet: ParsedAction['street'] = 'preflop';

  while ((match = actionRegex.exec(text)) !== null) {
    const player = match[1].trim();
    const raw = match[2].trim();

    // Detect street changes
    if (raw.startsWith('***')) {
      const marker = raw.match(/\*\*\* (\w+) \*\*\*/)?.[1];
      if (marker === 'FLOP') currentStreet = 'preflop';
      else if (marker === 'TURN') currentStreet = 'turn';
      else if (marker === 'RIVER') currentStreet = 'river';
      continue;
    }

    // Parse action
    const amountMatch = raw.match(/\$?([\d.]+)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;

    let action = raw;
    if (raw.includes('posts small blind')) action = 'posts_small_blind';
    else if (raw.includes('posts big blind')) action = 'posts_big_blind';
    else if (raw.includes('calls')) action = 'calls';
    else if (raw.includes('raises to')) action = 'raises';
    else if (raw.includes('bets')) action = 'bets';
    else if (raw.includes('checks')) action = 'checks';
    else if (raw.includes('folds')) action = 'folds';
    else if (raw.includes('shows')) action = 'shows';
    else if (raw.includes('collected')) action = 'collected';

    parsed.actions!.push({
      player,
      street: currentStreet,
      action,
      amount,
      hand: action === 'shows' ? raw.match(/shows? (.+?) \(/)?.[1] : undefined,
      raw,
    });
  }

  return parsed as ParsedHand;
}

/**
 * Parse multiple hands from a single file content
 */
export function parseHandHistoryFile(content: string): ParsedHand[] {
  // Split on hand boundaries
  const hands: ParsedHand[] = [];
  const handTexts = content.split(/(?=PokerStars Hand #\d+)/);
  for (const handText of handTexts) {
    if (!handText.trim()) continue;
    const parsed = parsePokerStarsHand(handText);
    if (parsed) hands.push(parsed);
  }
  return hands;
}

/**
 * Convert a ParsedHand into a HandRecord for IndexedDB storage
 */
export function parsedHandToRecord(parsed: ParsedHand, sessionId: string): Omit<import('./db').HandRecord, 'id' | 'createdAt'> {
  const allActions = parsed.actions ?? [];
  const showdownActions = allActions.filter((a) => a.action === 'shows' || a.action === 'collected');
  const lastAction = allActions[allActions.length - 1];

  return {
    sessionId,
    heroHand: parsed.holeCards,
    board: parsed.board,
    stage: parsed.board ? (parsed.board.split(' ').length >= 5 ? 'river' : parsed.board.split(' ').length >= 4 ? 'turn' : 'flop') : 'preflop',
    action: lastAction?.action ?? 'unknown',
    opponent: showdownActions.find((a) => a.player !== parsed.heroName)?.player,
    notes: showdownActions.map((a) => `${a.player}: ${a.raw}`).join(' | '),
    pot: parsed.pot,
  };
}
