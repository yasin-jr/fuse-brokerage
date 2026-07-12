import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { claimDifficulty, type Difficulty, DIFFICULTY_TIERS } from "@/lib/profile-store";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/onboarding/difficulty")({
  head: () => ({ meta: [{ title: "Pick your difficulty — Ascend" }] }),
  component: DifficultyPage,
});

const TIERS: {
  id: Difficulty; emoji: string; name: string; desc: string; ring: string; chip: string;
}[] = [
  { id: "easy",          emoji: "🟢", name: "EASY",           desc: "Full arsenal. Diversify freely.",     ring: "ring-emerald-500/40", chip: "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25" },
  { id: "medium-long",   emoji: "🟡", name: "MEDIUM-LONG",    desc: "Solid foundation. Think long-term.",  ring: "ring-yellow-500/40",  chip: "bg-yellow-500/15  text-yellow-300  hover:bg-yellow-500/25" },
  { id: "medium-short",  emoji: "🟠", name: "MEDIUM-SHORT",   desc: "Limited capital. Every move counts.", ring: "ring-orange-500/40",  chip: "bg-orange-500/15  text-orange-300  hover:bg-orange-500/25" },
  { id: "hard",          emoji: "🔴", name: "HARD",           desc: "Minimum capital. Maximum skill.",     ring: "ring-rose-500/40",    chip: "bg-rose-500/15    text-rose-300    hover:bg-rose-500/25" },
];

function fmt(n: number) {
  return `$${n.toLocaleString()}`;
}

function DifficultyPage() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Difficulty | null>(null);

  const claim = (id: Difficulty) => {
    claimDifficulty(id);
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-semibold">Pick your difficulty</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Tap the <span className="text-foreground font-semibold">starting balance</span> to claim it. Once claimed it locks in until you reset your account.
          </p>
        </div>

        <div className="grid gap-3">
          {TIERS.map((t) => {
            const tier = DIFFICULTY_TIERS[t.id];
            const active = picked === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setPicked(t.id)}
                className={`glass rounded-2xl p-4 transition-all cursor-pointer ${active ? `ring-2 ${t.ring}` : "hover:bg-secondary/40"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">+{tier.multiplier} PT / 1% gain</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); claim(t.id); }}
                      className={`mt-3 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${t.chip}`}
                    >
                      Claim {fmt(tier.capital)}
                      <span className="text-[10px] uppercase tracking-wider opacity-75">tap to start</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          You can reset and pick again from Settings → Restart account.
        </p>
      </div>
    </div>
  );
}
