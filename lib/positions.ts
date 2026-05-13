// Positions for a 9-max table

export type PositionId = 'UTG' | 'UTG1' | 'MP' | 'MP1' | 'CO' | 'BTN' | 'SB' | 'BB';

export interface Position {
  id: PositionId;
  name: string;
  shortName: string;
  seatIndex: number; // 0 = UTG, 8 = BB
  description: string;
  // % of hands to open-raise from this position
  openRaisePct: number;
  // % of hands to defend when facing a raise
  defendPct: number;
  // % of hands to 3-bet
  threeBetPct: number;
}

export const POSITIONS: Position[] = [
  {
    id: 'UTG',
    name: 'Under the Gun',
    shortName: 'UTG',
    seatIndex: 0,
    description: 'First to act pre-flop. Play your strongest hands only.',
    openRaisePct: 10,
    defendPct: 15,
    threeBetPct: 4,
  },
  {
    id: 'UTG1',
    name: 'Under the Gun +1',
    shortName: 'UTG+1',
    seatIndex: 1,
    description: 'Second to act pre-flop. Slightly wider than UTG.',
    openRaisePct: 12,
    defendPct: 18,
    threeBetPct: 5,
  },
  {
    id: 'MP',
    name: 'Middle Position',
    shortName: 'MP',
    seatIndex: 2,
    description: 'Middle position. Open with 15% of hands.',
    openRaisePct: 15,
    defendPct: 22,
    threeBetPct: 6,
  },
  {
    id: 'MP1',
    name: 'Middle Position +1',
    shortName: 'MP+1',
    seatIndex: 3,
    description: 'Late middle position. Open ~18% of hands.',
    openRaisePct: 18,
    defendPct: 25,
    threeBetPct: 7,
  },
  {
    id: 'CO',
    name: 'Cutoff',
    shortName: 'CO',
    seatIndex: 4,
    description: 'One seat before the button. Wide range, lots of stealing.',
    openRaisePct: 25,
    defendPct: 35,
    threeBetPct: 8,
  },
  {
    id: 'BTN',
    name: 'Button / Dealer',
    shortName: 'BTN',
    seatIndex: 5,
    description: 'The most profitable seat. Open ~40% of hands.',
    openRaisePct: 40,
    defendPct: 45,
    threeBetPct: 10,
  },
  {
    id: 'SB',
    name: 'Small Blind',
    shortName: 'SB',
    seatIndex: 6,
    description: 'Defend vs. steals. Tight when first in.',
    openRaisePct: 20,
    defendPct: 28,
    threeBetPct: 5,
  },
  {
    id: 'BB',
    name: 'Big Blind',
    shortName: 'BB',
    seatIndex: 7,
    description: 'Check-call with hands that have good board coverage.',
    openRaisePct: 0,
    defendPct: 45,
    threeBetPct: 3,
  },
];

export const POSITION_MAP: Record<PositionId, Position> = POSITIONS.reduce(
  (acc, pos) => {
    acc[pos.id] = pos;
    return acc;
  },
  {} as Record<PositionId, Position>
);

// Situation matrix: position vs position
export interface Situation {
  actor: PositionId;    // who's acting
  target: PositionId;    // who's being acted upon (e.g., open-raised against)
  action: 'open' | '3bet' | 'call' | 'defend' | 'squeeze';
}

export const SITUATIONS: Situation[] = POSITIONS.flatMap((actor) =>
  POSITIONS.filter((t) => t.seatIndex !== actor.seatIndex).map((target) => ({
    actor: actor.id,
    target: target.id,
    action: 'open' as const,
  }))
);
