import Link from "next/link";

export default function BasicsPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <Link href="/learn" className="text-sm text-gray-400 hover:text-white">Learn</Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Basics</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Poker Basics</h1>

        {/* Hand Rankings */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-[#1DB954]">Hand Rankings</h2>
          <p className="text-gray-400 mb-4 text-sm">From best to worst. A higher-ranked hand always beats a lower-ranked one.</p>
          <div className="space-y-2">
            {[
              { rank: 1, name: "Royal Flush", example: "A♠ K♠ Q♠ J♠ 10♠", desc: "AKQJ10 all same suit. The unbeatable hand." },
              { rank: 2, name: "Straight Flush", example: "9♥ 8♥ 7♥ 6♥ 5♥", desc: "Five consecutive cards, same suit." },
              { rank: 3, name: "Four of a Kind", example: "K♠ K♦ K♥ K♣ 2♠", desc: "Four cards of the same rank." },
              { rank: 4, name: "Full House", example: "Q♠ Q♦ Q♣ 7♥ 7♠", desc: "Three of a kind + a pair." },
              { rank: 5, name: "Flush", example: "A♦ K♦ 8♦ 6♦ 3♦", desc: "Five cards same suit, not in sequence." },
              { rank: 6, name: "Straight", example: "10♣ 9♥ 8♠ 7♦ 6♣", desc: "Five consecutive cards, different suits." },
              { rank: 7, name: "Three of a Kind", example: "J♠ J♦ J♣ A♥ 5♠", desc: "Three cards of the same rank." },
              { rank: 8, name: "Two Pair", example: "A♠ A♦ 9♥ 9♣ 3♦", desc: "Two different pairs." },
              { rank: 9, name: "One Pair", example: "K♠ K♦ 10♣ 7♥ 4♣", desc: "Two cards of the same rank." },
              { rank: 10, name: "High Card", example: "A♣ J♦ 8♠ 5♥ 2♣", desc: "Nothing matched. Highest card wins." },
            ].map(({ rank, name, example, desc }) => (
              <div key={rank} className="flex items-center gap-4 p-3 rounded-lg bg-[#161B22] border border-gray-800">
                <div className="w-6 h-6 rounded-full bg-[#1DB954]/20 text-[#1DB954] text-xs font-bold flex items-center justify-center flex-shrink-0">{rank}</div>
                <div className="w-32 font-mono text-sm text-white">{name}</div>
                <div className="w-40 font-mono text-xs text-gray-400">{example}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Game Flow */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-[#1DB954]">Game Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { stage: "Pre-Flop", icon: "1/", desc: "Each player gets 2 hole cards. Betting starts with UTG (first position).", action: "Raise, call, or fold" },
              { stage: "Flop", icon: "2/", desc: "3 community cards dealt face-up. First betting round.", action: "Check, bet, call, raise, fold" },
              { stage: "Turn", icon: "3/", desc: "4th community card dealt. Second betting round.", action: "Same actions as flop" },
              { stage: "River", icon: "4/", desc: "5th and final community card. Final betting round.", action: "Same actions as turn" },
              { stage: "Showdown", icon: "5/", desc: "Remaining players reveal hands. Best 5-card hand wins the pot.", action: "Winner takes all" },
            ].map(({ stage, icon, desc, action }) => (
              <div key={stage} className="p-4 rounded-lg bg-[#161B22] border border-gray-800">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[#1DB954] font-mono font-bold">{icon}</span>
                  <span className="font-semibold">{stage}</span>
                </div>
                <p className="text-sm text-gray-400 mb-2">{desc}</p>
                <p className="text-xs text-gray-500">→ {action}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Betting Actions */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 text-[#1DB954]">Betting Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: "Fold", desc: "Throw away your hand. Forfeit any chance of winning the pot.", color: "text-red-400" },
              { name: "Check", desc: "Pass action to the next player. Only available when no bet has been made in that round.", color: "text-blue-400" },
              { name: "Call", desc: "Match the current bet to stay in the hand.", color: "text-yellow-400" },
              { name: "Bet / Raise", desc: "Put more money in than the previous player. Denotes strength.", color: "text-green-400" },
              { name: "3-Bet", desc: "The first re-raise after an initial bet. Shows strong hands or bluffs.", color: "text-purple-400" },
              { name: "4-Bet+", desc: "Re-re-raising a 3-bet. Usually the nuts or a strong bluff.", color: "text-orange-400" },
            ].map(({ name, desc, color }) => (
              <div key={name} className="p-4 rounded-lg bg-[#161B22] border border-gray-800">
                <div className={`font-semibold mb-1 ${color}`}>{name}</div>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Key Concepts */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-[#1DB954]">Key Concepts</h2>
          <div className="space-y-3">
            {[
              { term: "Big Blind (BB)", def: "The larger of the two forced bets. Also the position of the player sitting in that seat." },
              { term: "Small Blind (SB)", def: "The smaller forced bet. Position left of the button. You have the worst position post-flop." },
              { term: "Under the Gun (UTG)", def: "First position to act pre-flop. Must play the tightest from here." },
              { term: "Button (BTN)", def: "Dealer button. The best position. You act last post-flop on every street." },
              { term: "Pot Odds", def: "The ratio of the current pot size to the cost of a call. Determines if a call is mathematically profitable." },
              { term: "Equity", def: "Your hand's chance of winning at showdown, expressed as a percentage." },
              { term: "Implied Odds", def: "Pot odds plus the expected future bets you can win if you hit your hand." },
              { term: "Position", def: "Where you sit relative to the button. Later position = more information = better." },
            ].map(({ term, def }) => (
              <div key={term} className="flex gap-4 p-3 rounded-lg bg-[#161B22] border border-gray-800">
                <div className="w-36 flex-shrink-0 text-sm font-medium text-[#1DB954]">{term}</div>
                <div className="text-sm text-gray-400">{def}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
