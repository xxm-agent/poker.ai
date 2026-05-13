"use client";

import { useState } from "react";
import Link from "next/link";

const faqs = [
  {
    q: "If both players have the same 2-pair, does the 5th card determine who wins?",
    a: "Only if BOTH pairs are identical. The tiebreaker order: (1) Higher pair wins — AA+KK beats QQ+JJ. (2) If first pairs match, second pair wins — AA+KK beats AA+QQ. (3) If both pairs are exactly the same, the kicker (5th card) breaks the tie.",
  },
  {
    q: "If a 3-bet is followed by another 3-bet, is it 3× the previous bet or 3× the pot?",
    a: "Neither exactly. The second 3-bet is actually called a 4-bet (counting total bet actions: BB → raise → 3-bet → 4-bet). Standard sizing: 3-bet ≈ 3× the open-raise, 4-bet ≈ 3-4× the 3-bet size. The naming describes position in the betting sequence, not the multiplier.",
  },
  {
    q: "Why is 3× the standard open-raise size?",
    a: "It's a convention, not a rule. 3× balances fold equity (enough to knock out weak hands) against value (not so big that strong hands fold). Too small (2×) lets drawing hands see the flop cheap. Too large (5-6×) reduces fold equity and scares off action. Pros vary sizes constantly to balance ranges and exploit opponents.",
  },
  {
    q: "Why is it called a 4-bet? What if someone 3× again after that?",
    a: "You're counting total bet actions in the sequence. BB posts (1), raises (2), 3-bets (3), 4-bets (4). Yes — 5-bet, 6-bet, etc. keep going. In practice, most games rarely go past 5-6 bets preflop before someone runs out of stack or the pot is massive.",
  },
  {
    q: "Do I have to raise exactly 3× every time? Is it rude to raise a different amount?",
    a: "Purely conventional. You can raise any amount from the minimum (BB) up to your stack. Mixing sizes is actually good strategy — it makes your range harder to read. There's no poker etiquette rule about raise size.",
  },
  {
    q: "What is a 3-bet?",
    a: "A 3-bet is the third bet in a preflop sequence. BB posts (that's the first \"bet\" but not called a 3-bet), someone raises (second bet), the next player re-raises — that's a 3-bet. It's also used to describe a strong hand or a re-raise with a premium hand.",
  },
  {
    q: "What is a 4-bet?",
    a: "The fourth bet preflop. After BB → raise → 3-bet → 4-bet. Typically a re-re-raise, indicating an extremely strong hand or a bluff. 4-bets are usually 3-4× the 3-bet size.",
  },
  {
    q: "What does \"position\" mean in poker?",
    a: "Your position relative to the button determines when you act. Late positions (Button, CO, HJ) act last post-flop — a huge advantage because you see what everyone else does before deciding. Early positions (UTG, UTG+1, UTG+2) act first and need stronger hands to open.",
  },
  {
    q: "What is a \"kicker\"?",
    a: "The kicker is the unpaired 5th card that breaks ties. Example: both players have A♠A♥K♦K♣ — the kicker (Q vs J) determines the winner. Higher kicker wins.",
  },
  {
    q: "What is \"pot equity\"?",
    a: "Your share of the pot expressed as a percentage. If you have a 70% chance to win at showdown, you have 70% equity. It changes with every street (flop, turn, river) as cards are dealt.",
  },
  {
    q: "What are \"pot odds\"?",
    a: "The ratio of the current pot size to the cost of calling. If the pot is $100 and you need to call $20, your pot odds are 100:20 or 20%. Compare pot odds to your equity — if equity > pot odds, the call is profitable over time.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0D1117]">
      <header className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center font-bold text-black text-sm">P</div>
            <span className="font-semibold text-lg tracking-tight">poker<span className="text-[#1DB954]">.ai</span></span>
          </Link>
          <span className="text-gray-600">/</span>
          <Link href="/learn" className="text-sm text-gray-400 hover:text-white transition-colors">Learn</Link>
          <span className="text-gray-600">/</span>
          <span className="text-sm text-gray-400">FAQ</span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">FAQ</h1>
          <p className="text-gray-400">Common poker questions — no such thing as a noob question.</p>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-gray-800 rounded-xl overflow-hidden bg-[#161B22]">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 hover:bg-[#1C2128] transition-colors"
              >
                <span className="font-medium text-gray-100">{faq.q}</span>
                <span className={`text-gray-500 text-lg transition-transform ${open === i ? "rotate-45" : ""}`}>+</span>
              </button>
              {open === i && (
                <div className="px-5 pb-5 text-gray-400 text-sm leading-relaxed border-t border-gray-800 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
