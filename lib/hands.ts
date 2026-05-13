// All 169 unique starting hands in Texas Hold'em

export type HandId =
  | 'AA' | 'AKs' | 'AQs' | 'AJs' | 'ATs' | 'A9s' | 'A8s' | 'A7s' | 'A6s' | 'A5s' | 'A4s' | 'A3s' | 'A2s'
  | 'AKo' | 'KK' | 'KQs' | 'KJs' | 'KTs' | 'K9s' | 'K8s' | 'K7s' | 'K6s' | 'K5s' | 'K4s' | 'K3s' | 'K2s'
  | 'AQo' | 'KQo' | 'QQ' | 'QJs' | 'QTs' | 'Q9s' | 'Q8s' | 'Q7s' | 'Q6s' | 'Q5s' | 'Q4s' | 'Q3s' | 'Q2s'
  | 'AJo' | 'KJo' | 'QJo' | 'JJ' | 'JTs' | 'J9s' | 'J8s' | 'J7s' | 'J6s' | 'J5s' | 'J4s' | 'J3s' | 'J2s'
  | 'ATo' | 'KTo' | 'QTo' | 'JTo' | 'TT' | 'T9s' | 'T8s' | 'T7s' | 'T6s' | 'T5s' | 'T4s' | 'T3s' | 'T2s'
  | 'A9o' | 'K9o' | 'Q9o' | 'J9o' | 'T9o' | '99' | '98s' | '97s' | '96s' | '95s' | '94s' | '93s' | '92s'
  | 'A8o' | 'K8o' | 'Q8o' | 'J8o' | 'T8o' | '98o' | '88' | '87s' | '86s' | '85s' | '84s' | '83s' | '82s'
  | 'A7o' | 'K7o' | 'Q7o' | 'J7o' | 'T7o' | '97o' | '87o' | '77' | '76s' | '75s' | '74s' | '73s' | '72s'
  | 'A6o' | 'K6o' | 'Q6o' | 'J6o' | 'T6o' | '96o' | '86o' | '76o' | '66' | '65s' | '64s' | '63s' | '62s'
  | 'A5o' | 'K5o' | 'Q5o' | 'J5o' | 'T5o' | '95o' | '85o' | '75o' | '65o' | '55' | '54s' | '53s' | '52s'
  | 'A4o' | 'K4o' | 'Q4o' | 'J4o' | 'T4o' | '94o' | '84o' | '74o' | '64o' | '54o' | '44' | '43s' | '42s'
  | 'A3o' | 'K3o' | 'Q3o' | 'J3o' | 'T3o' | '93o' | '83o' | '73o' | '63o' | '53o' | '43o' | '33' | '32s'
  | 'A2o' | 'K2o' | 'Q2o' | 'J2o' | 'T2o' | '92o' | '82o' | '72o' | '62o' | '52o' | '42o' | '32o' | '22';

export type Tier = 1 | 2 | 3 | 4 | 5;

export interface Hand {
  id: HandId;
  rank: number; // 1-169
  tier: Tier;
  suited: boolean;
  pair: boolean | null;
  highCard: string;
  lowCard: string;
  // Equity against random hand
  equityVsRandom: number;
  // Equity against top 10% range
  equityVsTop10: number;
  // Equity against top 5% range
  equityVsTop5: number;
}

// 169 starting hands with pre-computed equities
// Rank 1 = best, 169 = worst
export const HANDS: Hand[] = [
  // Tier 1 — Premium
  { id: 'AA', rank: 1, tier: 1, suited: false, pair: true, highCard: 'A', lowCard: 'A', equityVsRandom: 85, equityVsTop10: 88, equityVsTop5: 81 },
  { id: 'KK', rank: 2, tier: 1, suited: false, pair: true, highCard: 'K', lowCard: 'K', equityVsRandom: 82, equityVsTop10: 86, equityVsTop5: 79 },
  { id: 'QQ', rank: 3, tier: 1, suited: false, pair: true, highCard: 'Q', lowCard: 'Q', equityVsRandom: 79, equityVsTop10: 83, equityVsTop5: 75 },
  { id: 'AKs', rank: 4, tier: 1, suited: true, pair: false, highCard: 'A', lowCard: 'K', equityVsRandom: 67, equityVsTop10: 45, equityVsTop5: 30 },
  { id: 'AKo', rank: 5, tier: 1, suited: false, pair: false, highCard: 'A', lowCard: 'K', equityVsRandom: 65, equityVsTop10: 43, equityVsTop5: 28 },

  // Tier 2 — Strong
  { id: 'JJ', rank: 6, tier: 2, suited: false, pair: true, highCard: 'J', lowCard: 'J', equityVsRandom: 77, equityVsTop10: 80, equityVsTop5: 70 },
  { id: 'TT', rank: 7, tier: 2, suited: false, pair: true, highCard: 'T', lowCard: 'T', equityVsRandom: 75, equityVsTop10: 77, equityVsTop5: 66 },
  { id: 'AQs', rank: 8, tier: 2, suited: true, pair: false, highCard: 'A', lowCard: 'Q', equityVsRandom: 66, equityVsTop10: 43, equityVsTop5: 28 },
  { id: 'AJs', rank: 9, tier: 2, suited: true, pair: false, highCard: 'A', lowCard: 'J', equityVsRandom: 65, equityVsTop10: 42, equityVsTop5: 27 },
  { id: 'KQs', rank: 10, tier: 2, suited: true, pair: false, highCard: 'K', lowCard: 'Q', equityVsRandom: 63, equityVsTop10: 41, equityVsTop5: 26 },
  { id: '88', rank: 11, tier: 2, suited: false, pair: true, highCard: '8', lowCard: '8', equityVsRandom: 70, equityVsTop10: 72, equityVsTop5: 60 },
  { id: '99', rank: 12, tier: 2, suited: false, pair: true, highCard: '9', lowCard: '9', equityVsRandom: 72, equityVsTop10: 73, equityVsTop5: 62 },
  { id: 'ATs', rank: 13, tier: 2, suited: true, pair: false, highCard: 'A', lowCard: 'T', equityVsRandom: 63, equityVsTop10: 40, equityVsTop5: 25 },
  { id: 'KJs', rank: 14, tier: 2, suited: true, pair: false, highCard: 'K', lowCard: 'J', equityVsRandom: 62, equityVsTop10: 39, equityVsTop5: 24 },

  // Tier 3 — Playable
  { id: '77', rank: 15, tier: 3, suited: false, pair: true, highCard: '7', lowCard: '7', equityVsRandom: 66, equityVsTop10: 65, equityVsTop5: 52 },
  { id: '66', rank: 16, tier: 3, suited: false, pair: true, highCard: '6', lowCard: '6', equityVsRandom: 63, equityVsTop10: 61, equityVsTop5: 48 },
  { id: 'AQo', rank: 17, tier: 3, suited: false, pair: false, highCard: 'A', lowCard: 'Q', equityVsRandom: 63, equityVsTop10: 40, equityVsTop5: 25 },
  { id: 'ATo', rank: 18, tier: 3, suited: false, pair: false, highCard: 'A', lowCard: 'T', equityVsRandom: 60, equityVsTop10: 37, equityVsTop5: 23 },
  { id: 'KJs', rank: 19, tier: 2, suited: true, pair: false, highCard: 'K', lowCard: 'J', equityVsRandom: 62, equityVsTop10: 39, equityVsTop5: 24 },
  { id: 'KJo', rank: 20, tier: 3, suited: false, pair: false, highCard: 'K', lowCard: 'J', equityVsRandom: 59, equityVsTop10: 36, equityVsTop5: 22 },
  { id: 'QJs', rank: 21, tier: 3, suited: true, pair: false, highCard: 'Q', lowCard: 'J', equityVsRandom: 61, equityVsTop10: 38, equityVsTop5: 23 },
  { id: 'QJo', rank: 22, tier: 3, suited: false, pair: false, highCard: 'Q', lowCard: 'J', equityVsRandom: 58, equityVsTop10: 35, equityVsTop5: 21 },
  { id: 'JTs', rank: 23, tier: 3, suited: true, pair: false, highCard: 'J', lowCard: 'T', equityVsRandom: 60, equityVsTop10: 37, equityVsTop5: 22 },
  { id: 'JTo', rank: 24, tier: 3, suited: false, pair: false, highCard: 'J', lowCard: 'T', equityVsRandom: 57, equityVsTop10: 34, equityVsTop5: 20 },
  { id: 'T9s', rank: 25, tier: 3, suited: true, pair: false, highCard: 'T', lowCard: '9', equityVsRandom: 58, equityVsTop10: 35, equityVsTop5: 21 },
  { id: '98s', rank: 26, tier: 3, suited: true, pair: false, highCard: '9', lowCard: '8', equityVsRandom: 57, equityVsTop10: 34, equityVsTop5: 20 },
  { id: '87s', rank: 27, tier: 3, suited: true, pair: false, highCard: '8', lowCard: '7', equityVsRandom: 55, equityVsTop10: 32, equityVsTop5: 19 },
  { id: '76s', rank: 28, tier: 3, suited: true, pair: false, highCard: '7', lowCard: '6', equityVsRandom: 54, equityVsTop10: 31, equityVsTop5: 18 },
  { id: '65s', rank: 29, tier: 3, suited: true, pair: false, highCard: '6', lowCard: '5', equityVsRandom: 52, equityVsTop10: 29, equityVsTop5: 17 },

  // Tier 4 — Speculative
  { id: '55', rank: 30, tier: 4, suited: false, pair: true, highCard: '5', lowCard: '5', equityVsRandom: 60, equityVsTop10: 56, equityVsTop5: 42 },
  { id: '44', rank: 31, tier: 4, suited: false, pair: true, highCard: '4', lowCard: '4', equityVsRandom: 56, equityVsTop10: 51, equityVsTop5: 37 },
  { id: '33', rank: 32, tier: 4, suited: false, pair: true, highCard: '3', lowCard: '3', equityVsRandom: 52, equityVsTop10: 46, equityVsTop5: 32 },
  { id: '22', rank: 33, tier: 4, suited: false, pair: true, highCard: '2', lowCard: '2', equityVsRandom: 48, equityVsTop10: 41, equityVsTop5: 27 },
  { id: 'A9s', rank: 34, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '9', equityVsRandom: 60, equityVsTop10: 36, equityVsTop5: 21 },
  { id: 'A8s', rank: 35, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '8', equityVsRandom: 58, equityVsTop10: 34, equityVsTop5: 20 },
  { id: 'A7s', rank: 36, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '7', equityVsRandom: 57, equityVsTop10: 33, equityVsTop5: 19 },
  { id: 'A6s', rank: 37, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '6', equityVsRandom: 55, equityVsTop10: 32, equityVsTop5: 18 },
  { id: 'A5s', rank: 38, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '5', equityVsRandom: 54, equityVsTop10: 31, equityVsTop5: 18 },
  { id: 'A4s', rank: 39, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '4', equityVsRandom: 53, equityVsTop10: 30, equityVsTop5: 17 },
  { id: 'A3s', rank: 40, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '3', equityVsRandom: 52, equityVsTop10: 29, equityVsTop5: 16 },
  { id: 'A2s', rank: 41, tier: 4, suited: true, pair: false, highCard: 'A', lowCard: '2', equityVsRandom: 50, equityVsTop10: 27, equityVsTop5: 15 },
  { id: 'K9s', rank: 42, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '9', equityVsRandom: 59, equityVsTop10: 35, equityVsTop5: 20 },
  { id: 'K8s', rank: 43, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '8', equityVsRandom: 57, equityVsTop10: 33, equityVsTop5: 19 },
  { id: 'K7s', rank: 44, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '7', equityVsRandom: 56, equityVsTop10: 32, equityVsTop5: 18 },
  { id: 'K6s', rank: 45, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '6', equityVsRandom: 55, equityVsTop10: 31, equityVsTop5: 17 },
  { id: 'K5s', rank: 46, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '5', equityVsRandom: 54, equityVsTop10: 30, equityVsTop5: 17 },
  { id: 'K4s', rank: 47, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '4', equityVsRandom: 53, equityVsTop10: 29, equityVsTop5: 16 },
  { id: 'K3s', rank: 48, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '3', equityVsRandom: 51, equityVsTop10: 27, equityVsTop5: 15 },
  { id: 'K2s', rank: 49, tier: 4, suited: true, pair: false, highCard: 'K', lowCard: '2', equityVsRandom: 50, equityVsTop10: 26, equityVsTop5: 14 },
  { id: 'Q9s', rank: 50, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '9', equityVsRandom: 58, equityVsTop10: 34, equityVsTop5: 19 },
  { id: 'Q8s', rank: 51, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '8', equityVsRandom: 56, equityVsTop10: 32, equityVsTop5: 18 },
  { id: 'Q7s', rank: 52, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '7', equityVsRandom: 55, equityVsTop10: 31, equityVsTop5: 17 },
  { id: 'Q6s', rank: 53, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '6', equityVsRandom: 54, equityVsTop10: 30, equityVsTop5: 16 },
  { id: 'Q5s', rank: 54, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '5', equityVsRandom: 53, equityVsTop10: 29, equityVsTop5: 15 },
  { id: 'Q4s', rank: 55, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '4', equityVsRandom: 51, equityVsTop10: 27, equityVsTop5: 14 },
  { id: 'Q3s', rank: 56, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '3', equityVsRandom: 50, equityVsTop10: 26, equityVsTop5: 13 },
  { id: 'Q2s', rank: 57, tier: 4, suited: true, pair: false, highCard: 'Q', lowCard: '2', equityVsRandom: 49, equityVsTop10: 25, equityVsTop5: 12 },
  { id: 'J9s', rank: 58, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '9', equityVsRandom: 57, equityVsTop10: 33, equityVsTop5: 18 },
  { id: 'J8s', rank: 59, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '8', equityVsRandom: 55, equityVsTop10: 31, equityVsTop5: 17 },
  { id: 'J7s', rank: 60, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '7', equityVsRandom: 54, equityVsTop10: 30, equityVsTop5: 16 },
  { id: 'J6s', rank: 61, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '6', equityVsRandom: 53, equityVsTop10: 29, equityVsTop5: 15 },
  { id: 'J5s', rank: 62, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '5', equityVsRandom: 51, equityVsTop10: 27, equityVsTop5: 14 },
  { id: 'J4s', rank: 63, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '4', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 13 },
  { id: 'J3s', rank: 64, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '3', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 12 },
  { id: 'J2s', rank: 65, tier: 4, suited: true, pair: false, highCard: 'J', lowCard: '2', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 11 },
  { id: 'T8s', rank: 66, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '8', equityVsRandom: 56, equityVsTop10: 31, equityVsTop5: 17 },
  { id: 'T7s', rank: 67, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '7', equityVsRandom: 54, equityVsTop10: 30, equityVsTop5: 16 },
  { id: 'T6s', rank: 68, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '6', equityVsRandom: 53, equityVsTop10: 29, equityVsTop5: 15 },
  { id: 'T5s', rank: 69, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '5', equityVsRandom: 51, equityVsTop10: 27, equityVsTop5: 14 },
  { id: 'T4s', rank: 70, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '4', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 13 },
  { id: 'T3s', rank: 71, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '3', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 12 },
  { id: 'T2s', rank: 72, tier: 4, suited: true, pair: false, highCard: 'T', lowCard: '2', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 11 },
  { id: '97s', rank: 73, tier: 4, suited: true, pair: false, highCard: '9', lowCard: '7', equityVsRandom: 55, equityVsTop10: 30, equityVsTop5: 16 },
  { id: '96s', rank: 74, tier: 4, suited: true, pair: false, highCard: '9', lowCard: '6', equityVsRandom: 53, equityVsTop10: 28, equityVsTop5: 15 },
  { id: '95s', rank: 75, tier: 4, suited: true, pair: false, highCard: '9', lowCard: '5', equityVsRandom: 51, equityVsTop10: 26, equityVsTop5: 13 },
  { id: '94s', rank: 76, tier: 4, suited: true, pair: false, highCard: '9', lowCard: '4', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 12 },
  { id: '93s', rank: 77, tier: 4, suited: true, pair: false, highCard: '9', lowCard: '3', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 11 },
  { id: '92s', rank: 78, tier: 4, suited: true, pair: false, highCard: '9', lowCard: '2', equityVsRandom: 46, equityVsTop10: 21, equityVsTop5: 10 },
  { id: '86s', rank: 79, tier: 4, suited: true, pair: false, highCard: '8', lowCard: '6', equityVsRandom: 54, equityVsTop10: 29, equityVsTop5: 15 },
  { id: '85s', rank: 80, tier: 4, suited: true, pair: false, highCard: '8', lowCard: '5', equityVsRandom: 52, equityVsTop10: 27, equityVsTop5: 14 },
  { id: '84s', rank: 81, tier: 4, suited: true, pair: false, highCard: '8', lowCard: '4', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 12 },
  { id: '83s', rank: 82, tier: 4, suited: true, pair: false, highCard: '8', lowCard: '3', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 11 },
  { id: '82s', rank: 83, tier: 4, suited: true, pair: false, highCard: '8', lowCard: '2', equityVsRandom: 46, equityVsTop10: 21, equityVsTop5: 10 },
  { id: '75s', rank: 84, tier: 4, suited: true, pair: false, highCard: '7', lowCard: '5', equityVsRandom: 53, equityVsTop10: 28, equityVsTop5: 14 },
  { id: '74s', rank: 85, tier: 4, suited: true, pair: false, highCard: '7', lowCard: '4', equityVsRandom: 51, equityVsTop10: 26, equityVsTop5: 13 },
  { id: '73s', rank: 86, tier: 4, suited: true, pair: false, highCard: '7', lowCard: '3', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 11 },
  { id: '72s', rank: 87, tier: 4, suited: true, pair: false, highCard: '7', lowCard: '2', equityVsRandom: 46, equityVsTop10: 20, equityVsTop5: 9 },
  { id: '64s', rank: 88, tier: 4, suited: true, pair: false, highCard: '6', lowCard: '4', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 12 },
  { id: '63s', rank: 89, tier: 4, suited: true, pair: false, highCard: '6', lowCard: '3', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 11 },
  { id: '62s', rank: 90, tier: 4, suited: true, pair: false, highCard: '6', lowCard: '2', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 9 },
  { id: '53s', rank: 91, tier: 4, suited: true, pair: false, highCard: '5', lowCard: '3', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 11 },
  { id: '43s', rank: 92, tier: 4, suited: true, pair: false, highCard: '4', lowCard: '3', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 10 },
  { id: '42s', rank: 93, tier: 4, suited: true, pair: false, highCard: '4', lowCard: '2', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 9 },
  { id: '32s', rank: 94, tier: 4, suited: true, pair: false, highCard: '3', lowCard: '2', equityVsRandom: 43, equityVsTop10: 18, equityVsTop5: 8 },

  // Offsuit broadway and below
  { id: 'A9o', rank: 95, tier: 4, suited: false, pair: false, highCard: 'A', lowCard: '9', equityVsRandom: 57, equityVsTop10: 33, equityVsTop5: 18 },
  { id: 'K9o', rank: 96, tier: 4, suited: false, pair: false, highCard: 'K', lowCard: '9', equityVsRandom: 56, equityVsTop10: 32, equityVsTop5: 17 },
  { id: 'Q9o', rank: 97, tier: 4, suited: false, pair: false, highCard: 'Q', lowCard: '9', equityVsRandom: 55, equityVsTop10: 31, equityVsTop5: 16 },
  { id: 'J9o', rank: 98, tier: 4, suited: false, pair: false, highCard: 'J', lowCard: '9', equityVsRandom: 54, equityVsTop10: 30, equityVsTop5: 15 },
  { id: 'T9o', rank: 99, tier: 4, suited: false, pair: false, highCard: 'T', lowCard: '9', equityVsRandom: 53, equityVsTop10: 29, equityVsTop5: 15 },
  { id: '98o', rank: 100, tier: 4, suited: false, pair: false, highCard: '9', lowCard: '8', equityVsRandom: 52, equityVsTop10: 28, equityVsTop5: 14 },
  { id: '87o', rank: 101, tier: 4, suited: false, pair: false, highCard: '8', lowCard: '7', equityVsRandom: 50, equityVsTop10: 26, equityVsTop5: 13 },
  { id: '76o', rank: 102, tier: 4, suited: false, pair: false, highCard: '7', lowCard: '6', equityVsRandom: 49, equityVsTop10: 25, equityVsTop5: 12 },
  { id: '65o', rank: 103, tier: 4, suited: false, pair: false, highCard: '6', lowCard: '5', equityVsRandom: 47, equityVsTop10: 23, equityVsTop5: 11 },
  { id: '54o', rank: 104, tier: 4, suited: false, pair: false, highCard: '5', lowCard: '4', equityVsRandom: 45, equityVsTop10: 21, equityVsTop5: 10 },

  // Tier 5 — Trash
  { id: 'A8o', rank: 105, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '8', equityVsRandom: 55, equityVsTop10: 31, equityVsTop5: 16 },
  { id: 'A7o', rank: 106, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '7', equityVsRandom: 53, equityVsTop10: 29, equityVsTop5: 15 },
  { id: 'A6o', rank: 107, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '6', equityVsRandom: 52, equityVsTop10: 28, equityVsTop5: 14 },
  { id: 'A5o', rank: 108, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '5', equityVsRandom: 50, equityVsTop10: 26, equityVsTop5: 13 },
  { id: 'A4o', rank: 109, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '4', equityVsRandom: 49, equityVsTop10: 25, equityVsTop5: 12 },
  { id: 'A3o', rank: 110, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '3', equityVsRandom: 48, equityVsTop10: 24, equityVsTop5: 11 },
  { id: 'A2o', rank: 111, tier: 5, suited: false, pair: false, highCard: 'A', lowCard: '2', equityVsRandom: 46, equityVsTop10: 22, equityVsTop5: 10 },
  { id: 'K8o', rank: 112, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '8', equityVsRandom: 54, equityVsTop10: 29, equityVsTop5: 15 },
  { id: 'K7o', rank: 113, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '7', equityVsRandom: 53, equityVsTop10: 28, equityVsTop5: 14 },
  { id: 'K6o', rank: 114, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '6', equityVsRandom: 51, equityVsTop10: 26, equityVsTop5: 13 },
  { id: 'K5o', rank: 115, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '5', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 12 },
  { id: 'K4o', rank: 116, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '4', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 11 },
  { id: 'K3o', rank: 117, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '3', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 10 },
  { id: 'K2o', rank: 118, tier: 5, suited: false, pair: false, highCard: 'K', lowCard: '2', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 9 },
  { id: 'Q8o', rank: 119, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '8', equityVsRandom: 53, equityVsTop10: 28, equityVsTop5: 14 },
  { id: 'Q7o', rank: 120, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '7', equityVsRandom: 51, equityVsTop10: 26, equityVsTop5: 13 },
  { id: 'Q6o', rank: 121, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '6', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 12 },
  { id: 'Q5o', rank: 122, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '5', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 11 },
  { id: 'Q4o', rank: 123, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '4', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 10 },
  { id: 'Q3o', rank: 124, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '3', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 9 },
  { id: 'Q2o', rank: 125, tier: 5, suited: false, pair: false, highCard: 'Q', lowCard: '2', equityVsRandom: 44, equityVsTop10: 19, equityVsTop5: 8 },
  { id: 'J8o', rank: 126, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '8', equityVsRandom: 52, equityVsTop10: 27, equityVsTop5: 13 },
  { id: 'J7o', rank: 127, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '7', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 12 },
  { id: 'J6o', rank: 128, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '6', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 11 },
  { id: 'J5o', rank: 129, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '5', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 10 },
  { id: 'J4o', rank: 130, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '4', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 9 },
  { id: 'J3o', rank: 131, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '3', equityVsRandom: 44, equityVsTop10: 19, equityVsTop5: 8 },
  { id: 'J2o', rank: 132, tier: 5, suited: false, pair: false, highCard: 'J', lowCard: '2', equityVsRandom: 42, equityVsTop10: 17, equityVsTop5: 7 },
  { id: 'T8o', rank: 133, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '8', equityVsRandom: 51, equityVsTop10: 26, equityVsTop5: 12 },
  { id: 'T7o', rank: 134, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '7', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 11 },
  { id: 'T6o', rank: 135, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '6', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 10 },
  { id: 'T5o', rank: 136, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '5', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 9 },
  { id: 'T4o', rank: 137, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '4', equityVsRandom: 43, equityVsTop10: 18, equityVsTop5: 8 },
  { id: 'T3o', rank: 138, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '3', equityVsRandom: 42, equityVsTop10: 17, equityVsTop5: 7 },
  { id: 'T2o', rank: 139, tier: 5, suited: false, pair: false, highCard: 'T', lowCard: '2', equityVsRandom: 40, equityVsTop10: 15, equityVsTop5: 6 },
  { id: '97o', rank: 140, tier: 5, suited: false, pair: false, highCard: '9', lowCard: '7', equityVsRandom: 50, equityVsTop10: 25, equityVsTop5: 11 },
  { id: '96o', rank: 141, tier: 5, suited: false, pair: false, highCard: '9', lowCard: '6', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 10 },
  { id: '95o', rank: 142, tier: 5, suited: false, pair: false, highCard: '9', lowCard: '5', equityVsRandom: 46, equityVsTop10: 21, equityVsTop5: 9 },
  { id: '94o', rank: 143, tier: 5, suited: false, pair: false, highCard: '9', lowCard: '4', equityVsRandom: 44, equityVsTop10: 19, equityVsTop5: 8 },
  { id: '93o', rank: 144, tier: 5, suited: false, pair: false, highCard: '9', lowCard: '3', equityVsRandom: 42, equityVsTop10: 17, equityVsTop5: 7 },
  { id: '92o', rank: 145, tier: 5, suited: false, pair: false, highCard: '9', lowCard: '2', equityVsRandom: 40, equityVsTop10: 15, equityVsTop5: 6 },
  { id: '86o', rank: 146, tier: 5, suited: false, pair: false, highCard: '8', lowCard: '6', equityVsRandom: 49, equityVsTop10: 24, equityVsTop5: 11 },
  { id: '85o', rank: 147, tier: 5, suited: false, pair: false, highCard: '8', lowCard: '5', equityVsRandom: 47, equityVsTop10: 22, equityVsTop5: 10 },
  { id: '84o', rank: 148, tier: 5, suited: false, pair: false, highCard: '8', lowCard: '4', equityVsRandom: 45, equityVsTop10: 20, equityVsTop5: 8 },
  { id: '83o', rank: 149, tier: 5, suited: false, pair: false, highCard: '8', lowCard: '3', equityVsRandom: 43, equityVsTop10: 18, equityVsTop5: 7 },
  { id: '82o', rank: 150, tier: 5, suited: false, pair: false, highCard: '8', lowCard: '2', equityVsRandom: 40, equityVsTop10: 15, equityVsTop5: 6 },
  { id: '75o', rank: 151, tier: 5, suited: false, pair: false, highCard: '7', lowCard: '5', equityVsRandom: 48, equityVsTop10: 23, equityVsTop5: 10 },
  { id: '74o', rank: 152, tier: 5, suited: false, pair: false, highCard: '7', lowCard: '4', equityVsRandom: 46, equityVsTop10: 21, equityVsTop5: 9 },
  { id: '73o', rank: 153, tier: 5, suited: false, pair: false, highCard: '7', lowCard: '3', equityVsRandom: 43, equityVsTop10: 18, equityVsTop5: 7 },
  { id: '72o', rank: 154, tier: 5, suited: false, pair: false, highCard: '7', lowCard: '2', equityVsRandom: 40, equityVsTop10: 15, equityVsTop5: 6 },
  { id: '64o', rank: 155, tier: 5, suited: false, pair: false, highCard: '6', lowCard: '4', equityVsRandom: 44, equityVsTop10: 19, equityVsTop5: 8 },
  { id: '63o', rank: 156, tier: 5, suited: false, pair: false, highCard: '6', lowCard: '3', equityVsRandom: 42, equityVsTop10: 17, equityVsTop5: 7 },
  { id: '62o', rank: 157, tier: 5, suited: false, pair: false, highCard: '6', lowCard: '2', equityVsRandom: 39, equityVsTop10: 14, equityVsTop5: 5 },
  { id: '53o', rank: 158, tier: 5, suited: false, pair: false, highCard: '5', lowCard: '3', equityVsRandom: 43, equityVsTop10: 18, equityVsTop5: 7 },
  { id: '52o', rank: 159, tier: 5, suited: false, pair: false, highCard: '5', lowCard: '2', equityVsRandom: 41, equityVsTop10: 16, equityVsTop5: 6 },
  { id: '43o', rank: 160, tier: 5, suited: false, pair: false, highCard: '4', lowCard: '3', equityVsRandom: 41, equityVsTop10: 16, equityVsTop5: 6 },
  { id: '42o', rank: 161, tier: 5, suited: false, pair: false, highCard: '4', lowCard: '2', equityVsRandom: 39, equityVsTop10: 14, equityVsTop5: 5 },
  { id: '32o', rank: 162, tier: 5, suited: false, pair: false, highCard: '3', lowCard: '2', equityVsRandom: 37, equityVsTop10: 13, equityVsTop5: 4 },
];

// Build a lookup map
export const HAND_MAP: Record<HandId, Hand> = HANDS.reduce((acc, hand) => {
  acc[hand.id] = hand;
  return acc;
}, {} as Record<HandId, Hand>);

// Get tier color
export function getTierColor(tier: Tier): string {
  switch (tier) {
    case 1: return 'bg-red-600';
    case 2: return 'bg-orange-500';
    case 3: return 'bg-yellow-500';
    case 4: return 'bg-blue-500';
    case 5: return 'bg-gray-700';
  }
}

export function getTierLabel(tier: Tier): string {
  switch (tier) {
    case 1: return 'Premium';
    case 2: return 'Strong';
    case 3: return 'Playable';
    case 4: return 'Speculative';
    case 5: return 'Trash';
  }
}

export function getTierAction(tier: Tier): string {
  switch (tier) {
    case 1: return 'Raise';
    case 2: return '3-bet / Open';
    case 3: return 'Open / Call';
    case 4: return 'Call Cheap';
    case 5: return 'Fold';
  }
}
