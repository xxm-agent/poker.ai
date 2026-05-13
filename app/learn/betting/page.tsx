import Link from "next/link";

export default function BettingPage() {
  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <Link href="/learn" className="text-sm text-gray-400 hover:text-white">Learn</Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">Betting Strategies</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-8">Betting Strategies</h1>

        <div className="space-y-6">
          {/* C-Bet */}
          <StrategyCard
            title="Continuation Bet (C-Bet)"
            icon="🎯"
            difficulty="Beginner"
            description="Betting on the flop as the pre-flop aggressor, regardless of whether you hit the board."
            when="After you've raised pre-flop and at least one opponent calls."
            sizing="1/3 to 2/3 pot. Smaller on dry boards, larger on wet boards."
            example="You raise A♠ K♠ pre-flop. Opponent calls. Flop comes 7♥ 4♦ 2♣. You bet 2/3 pot. This is a c-bet — you're representing strength."
            tips={["C-bet ~70-80% of the time in position, slightly less OOP", "Larger sizing on wet boards (draw-heavy) to deny equity", "Check back some medium-strength hands to protect your check-call range"]}
          />

          {/* 3-Bet */}
          <StrategyCard
            title="3-Bet"
            icon="🔺"
            difficulty="Intermediate"
            description="Re-raising a pre-flop raise. Shows strength and takes control of the pot."
            when="With premium hands (top 5-8%) or as a bluff in the right spots."
            sizing="3x to 4x the original raise. In position, can go smaller."
            example="You have J♠ J♦. Early position raises. You 3-bet to 4x. This is a value 3-bet — you're saying 'I have a strong hand.'"
            tips={["Value 3-bet: AA, KK, QQ, AK, sometimes JJ, TT, AQs+", "Bluff 3-bet: Good blockers (AK, AQ) in late position vs. loose open-raises", "Position matters: 3-betting in position lets you realize equity better"]}
          />

          {/* Squeeze */}
          <StrategyCard
            title="Squeeze Play"
            icon="🤏"
            difficulty="Intermediate"
            description="3-betting after a raise and one or more callers. Exploits the 'sandbox' created by weak players who limp or call loosely."
            when="With a strong hand OR a well-timed bluff, when you have position on the original raiser."
            sizing="3x to 4x the original raise + 1 per additional caller."
            example="Loose player limps. Another calls. You have A♠ K♠ on the button. You squeeze — 3-bet to 4x. The limpers often fold marginal hands."
            tips={["Best squeeze targets: loose-passive players (calling stations)", "Use blockers (AK, AQ) when bluffing", "Squeeze smaller in position vs. out of position"]}
          />

          {/* Check-Raise */}
          <StrategyCard
            title="Check-Raise"
            icon="↩️"
            difficulty="Intermediate"
            description="Checking with a strong hand to induce a bet from your opponent, then raising. The opposite of a c-bet."
            when="With a strong made hand or a very strong draw, on boards where opponent will bet with weaker hands."
            sizing="Raise to 2x to 3x the opponent's bet. Make it look like a value bet."
            example="You have 8♠ 8♥. Board is 8♦ 7♠ 4♣. You check, opponent bets 1/2 pot. You raise to 3x. You've check-raised with a set."
            tips={["Best boards for check-raise: paired boards, dry boards where villain's range is weak", "Don't check-raise with air too much — you'll get called by hands that beat you", "Check-raise is strongest OOP (out of position) where you can induce"]}
          />

          {/* Float */}
          <StrategyCard
            title="Float"
            icon="🎈"
            difficulty="Intermediate"
            description="Calling a bet with a weak hand to take the pot away on a later street."
            when="In position, against a weak c-bet on a board where you have few assets but could represent strength."
            sizing="Usually a pot-sized bet on the turn to take it down."
            example="You call with J♠ T♠ on a flop of A♥ 7♦ 4♠. Opponent c-bets, you call (float). Turn is 2♣. You bet pot. Opponent folds."
            tips={["Best to float in position vs. OOP", "Float more against weak players who give up too often on later streets", "Always have a plan for the next street — you need to bet the turn if called"]}
          />

          {/* Overbet */}
          <StrategyCard
            title="Overbet"
            icon="💥"
            difficulty="Advanced"
            description="Betting more than the size of the pot. Used for maximum value with nuts or as a large bluff."
            when="When you have the absolute nuts (best possible hand) and want to extract maximum value. Or as a polarized bluff."
            sizing="1.5x to 2x pot. Sometimes more."
            example="Board is K♦ Q♦ 8♠ 8♥ 2♣. You have 8♠ 7♠ (the stone-cold nuts, a flush draw that missed). You overbet 1.5x pot for value."
            tips={["Overbet is most effective when you have a polarized range (nuts or air)", "Against weak opponents, overbet small for thin value", "Makes it very hard for villain to call with marginal hands"]}
          />

          {/* Thin Value */}
          <StrategyCard
            title="Thin Value Bet"
            icon="📉"
            difficulty="Intermediate"
            description="Betting small with a decent-but-not-great hand to get called by worse hands."
            when="When you have a hand that's likely best but not strong enough to get called by much worse if you bet big."
            sizing="1/3 to 1/2 pot."
            example="You have A♣ 7♦. Board is A♠ 9♣ 4♦ 8♥. You have top pair, weak kicker. You bet 1/3 pot for thin value. Worse aces (A9, A4) might call."
            tips={["Bet small to induce calls from worse hands", "Thin value is most common on the river", "Always ask: will worse hands call a smaller bet but fold to a bigger one?"]}
          />
        </div>
      </div>
    </div>
  );
}

function StrategyCard({
  title,
  icon,
  difficulty,
  description,
  when,
  sizing,
  example,
  tips,
}: {
  title: string;
  icon: string;
  difficulty: string;
  description: string;
  when: string;
  sizing: string;
  example: string;
  tips: string[];
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-[#161B22] overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            difficulty === "Beginner"
              ? "bg-green-500/20 text-green-400"
              : difficulty === "Intermediate"
              ? "bg-yellow-500/20 text-yellow-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {difficulty}
          </span>
        </div>
        <p className="text-gray-400">{description}</p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="text-xs text-[#1DB954] font-medium mb-1">WHEN TO USE</div>
            <p className="text-sm text-gray-300">{when}</p>
          </div>
          <div>
            <div className="text-xs text-[#1DB954] font-medium mb-1">SIZING</div>
            <p className="text-sm text-gray-300">{sizing}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs text-[#1DB954] font-medium mb-1">EXAMPLE</div>
            <p className="text-sm text-gray-400 italic">{example}</p>
          </div>
          <div>
            <div className="text-xs text-[#1DB954] font-medium mb-1">KEY TIPS</div>
            <ul className="space-y-1">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-400 flex gap-2">
                  <span className="text-[#1DB954]">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
