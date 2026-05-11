import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loadProfile, saveProfile, type Difficulty } from "@/lib/profile-store";
import { Logo } from "@/components/Logo";

export const Route = createFileRoute("/onboarding/difficulty")({
  head: () => ({ meta: [{ title: "Pick your difficulty — FusionSynergy" }] }),
  component: DifficultyPage,
});

const TIERS: {
  id: Difficulty; emoji: string; name: string; capital: string; mult: string; desc: string; ring: string;
}[] = [
  { id: "easy",          emoji: "🟢", name: "EASY",           capital: "$1,000,000", mult: "+1 PT / 1% gain",  desc: "Full arsenal. Diversify freely.",        ring: "ring-emerald-500/40" },
  { id: "medium-long",   emoji: "🟡", name: "MEDIUM-LONG",    capital: "$100,000",   mult: "+3 PTS / 1% gain", desc: "Solid foundation. Think long-term.",      ring: "ring-yellow-500/40" },
  { id: "medium-short",  emoji: "🟠", name: "MEDIUM-SHORT",   capital: "$10,000",    mult: "+5 PTS / 1% gain", desc: "Limited capital. Every move counts.",     ring: "ring-orange-500/40" },
  { id: "hard",          emoji: "🔴", name: "HARD",           capital: "$1,000",     mult: "+10 PTS / 1% gain",desc: "Minimum capital. Maximum skill.",         ring: "ring-rose-500/40" },
];

function DifficultyPage() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<Difficulty | null>(null);

  const confirm = () => {
    if (!picked) return;
    const p = loadProfile();
    saveProfile({ ...p, difficulty: picked });
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-5 py-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logo className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-semibold">Pick your difficulty</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            This sets your starting capital and points multiplier. You can reset later in Settings.
          </p>
        </div>

        <div className="grid gap-3">
          {TIERS.map((t) => {
            const active = picked === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setPicked(t.id)}
                className={`glass rounded-2xl p-4 text-left transition-all ${active ? `ring-2 ${t.ring}` : "hover:bg-secondary/40"}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{t.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.mult}</div>
                    </div>
                    <div className="mt-0.5 text-sm text-fuse-cyan">{t.capital}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{t.desc}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          onClick={confirm}
          disabled={!picked}
          className="mt-6 w-full rounded-lg bg-fuse-gradient py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          Confirm and start trading
        </button>
      </div>
    </div>
  );
}
