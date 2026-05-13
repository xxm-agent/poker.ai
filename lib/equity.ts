// Equity and pot odds calculation utilities

/**
 * Count outs for a drawing hand on flop or turn
 */
export function countOuts(handRank: string, boardCards: string[], stage: 'flop' | 'turn'): number {
  // Simplified outs calculation
  // In a real implementation, this would do exhaustive enumeration

  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const needed = new Set<string>();

  // Flush draw
  const handSuits = [handRank[1], boardCards[2]];
  const boardSuits = boardCards.map((c) => c[1]);
  const allSuits = [...handSuits, ...boardSuits];
  const suitCounts: Record<string, number> = {};
  for (const s of allSuits) {
    suitCounts[s] = (suitCounts[s] || 0) + 1;
  }
  const flushSuit = Object.entries(suitCounts).find(([, v]) => v >= 4)?.[0];
  if (flushSuit) {
    const otherSuits = ['♠', '♥', '♦', '♣'].filter((s) => s !== flushSuit);
    for (const s of otherSuits) {
      for (const r of ranks) {
        needed.add(r + s);
      }
    }
  }

  // Straight draw (open-ended)
  const handRanks = [handRank[0]];
  const boardRanks = boardCards.map((c) => c[0]);
  const allRanks = [...handRanks, ...boardRanks].sort((a, b) => ranks.indexOf(a) - ranks.indexOf(b));
  for (let i = 0; i < allRanks.length - 1; i++) {
    const idx = ranks.indexOf(allRanks[i]);
    const nextIdx = ranks.indexOf(allRanks[i + 1]);
    if (nextIdx - idx >= 2 && nextIdx - idx <= 3) {
      // Could be gutshot or open-ended
    }
  }

  // Return rough estimate
  return needed.size;
}

/**
 * Rule of 2 and 4: quick equity estimate
 */
export function ruleOfTwoAndFour(outs: number, stage: 'flop' | 'turn'): number {
  if (stage === 'flop') return outs * 4;
  return outs * 2;
}

/**
 * Calculate pot odds percentage
 */
export function potOdds(callAmount: number, potSize: number): number {
  if (callAmount <= 0) return 100;
  return (callAmount / (potSize + callAmount)) * 100;
}

/**
 * Break-even equity needed to call
 */
export function breakEvenEquity(callAmount: number, potAfterCall: number): number {
  return (callAmount / potAfterCall) * 100;
}

/**
 * Monte Carlo simulation for equity vs a range
 * Returns percentage (0-100)
 */
export function monteCarloEquity(
  heroHand: [string, string],
  villainRange: string[],
  board: string[],
  iterations = 10000
): number {
  const deck = buildDeck();
  let wins = 0;

  for (let i = 0; i < iterations; i++) {
    const simDeck = [...deck];
    // Remove known cards
    removeCards(simDeck, heroHand);
    removeCards(simDeck, board);

    // Deal villain hand from range
    const villainHand = pickNRandom(simDeck, 2);
    removeCards(simDeck, villainHand);

    // Deal remaining board
    const remainingBoard = board.length < 5 ? pickNRandom(simDeck, 5 - board.length) : [];
    const fullBoard = [...board, ...remainingBoard];

    const heroScore = handScore([...heroHand, ...fullBoard]);
    const villainScore = handScore([...villainHand, ...fullBoard]);

    if (heroScore > villainScore) wins++;
    else if (heroScore === villainScore) wins += 0.5;
  }

  return (wins / iterations) * 100;
}

function buildDeck(): string[] {
  const suits = ['♠', '♥', '♦', '♣'];
  const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
  const deck: string[] = [];
  for (const s of suits) {
    for (const r of ranks) {
      deck.push(r + s);
    }
  }
  return deck;
}

function removeCards(deck: string[], cards: string[]): void {
  for (const card of cards) {
    const idx = deck.indexOf(card);
    if (idx !== -1) deck.splice(idx, 1);
  }
}

function pickNRandom(arr: string[], n: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(Math.random() * arr.length);
    result.push(arr.splice(idx, 1)[0]);
  }
  return result;
}

// Simple hand scoring (higher = better)
// Returns [handType, tiebreaker1, tiebreaker2, ...]
function handScore(cards: string[]): number {
  const ranks = '23456789TJQKA';
  const sorted = cards.slice().sort((a, b) => ranks.indexOf(b[0]) - ranks.indexOf(a[0]));
  const rankStr = sorted.map((c) => c[0]).join('');
  const suitStr = sorted.map((c) => c[1]).join('');

  // Count ranks
  const rankCounts: Record<string, number> = {};
  for (const c of cards) {
    rankCounts[c[0]] = (rankCounts[c[0]] || 0) + 1;
  }
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const uniqueRanks = Object.keys(rankCounts).sort((a, b) => rankCounts[b] - rankCounts[a] || ranks.indexOf(b) - ranks.indexOf(a));

  let type = 0;
  let tie = 0;

  const isFlush = cards.length >= 5 && [0, 1, 2, 3, 4].every((i) => cards[i][1] === cards[0][1]);

  // Check straight
  let hasStraight = false;
  if (cards.length >= 5) {
    const uniqSorted: string[] = Array.from(new Set(sorted.map((c) => c[0]))).sort((a, b) => ranks.indexOf(b) - ranks.indexOf(a));
    for (let i = 0; i <= uniqSorted.length - 5; i++) {
      const slice = uniqSorted.slice(i, i + 5);
      const indices = slice.map((r) => ranks.indexOf(r));
      if (indices[0] - indices[4] === 4) hasStraight = true;
    }
    // Wheel straight A2345
    if (!hasStraight && uniqSorted.includes('A') && uniqSorted.includes('2') && uniqSorted.includes('3') && uniqSorted.includes('4') && uniqSorted.includes('5')) {
      hasStraight = true;
    }
  }

  if (isFlush && hasStraight) { type = 8; tie = ranks.indexOf(uniqueRanks[0]); }
  else if (counts[0] === 4) { type = 7; tie = ranks.indexOf(uniqueRanks[0]); }
  else if (counts[0] === 3 && counts[1] === 2) { type = 6; tie = ranks.indexOf(uniqueRanks[0]) * 13 + ranks.indexOf(uniqueRanks[2]); }
  else if (isFlush) { type = 5; tie = ranks.indexOf(uniqueRanks[0]) * 13 + ranks.indexOf(uniqueRanks[1]) * 13 + ranks.indexOf(uniqueRanks[2]); }
  else if (hasStraight) { type = 4; tie = ranks.indexOf(uniqueRanks[0]); }
  else if (counts[0] === 3) { type = 3; tie = ranks.indexOf(uniqueRanks[0]); }
  else if (counts[0] === 2 && counts[1] === 2) { type = 2; tie = ranks.indexOf(uniqueRanks[0]) * 13 + ranks.indexOf(uniqueRanks[1]); }
  else if (counts[0] === 2) { type = 1; tie = ranks.indexOf(uniqueRanks[0]); }
  else { type = 0; tie = ranks.indexOf(uniqueRanks[0]) * 13 + ranks.indexOf(uniqueRanks[1]); }

  return type * 10000 + tie;
}
