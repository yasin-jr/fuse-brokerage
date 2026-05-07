import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { PILLARS } from "@/lib/mock-data";
import { Search, Sparkles } from "lucide-react";

export const Route = createFileRoute("/invest")({
  head: () => ({
    meta: [
      { title: "Invest — FusionSynergy" },
      { name: "description", content: "Discover stocks, sector heat map, themes, and FUSE Intelligence overlays." },
    ],
  }),
  component: InvestPage,
});

function InvestPage() {
  const sectors = [
    { name: "AI_TECH", change: 2.1 },
    { name: "ENERGY",  change: -0.3 },
    { name: "INFRA",   change: 1.6 },
  ];
  const themes = ["Magnificent 7", "AI & Robotics", "Clean Energy", "Healthcare", "Cybersecurity", "Quantum", "Fintech"];

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        <h1 className="text-2xl font-semibold">Invest</h1>

        <label className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search any stock…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </label>

        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-fuse-gradient p-[1px] text-sm font-semibold">
          <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-card py-2.5 text-fuse-cyan">
            <Sparkles className="h-4 w-4" /> Chat with FUSE Intelligence
          </span>
        </button>

        <section>
          <h2 className="mb-2 text-sm font-semibold">🗺️ Market Map</h2>
          <div className="grid grid-cols-3 gap-2">
            {sectors.map((s) => (
              <div
                key={s.name}
                className={`rounded-xl p-4 text-center text-sm font-semibold ${
                  s.change >= 0 ? "bg-emerald-500/15 text-emerald-300" : "bg-rose-500/15 text-rose-300"
                }`}
              >
                <div>{s.name}</div>
                <div className="mt-1 text-xs"><PriceTag change={s.change} /></div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">🎯 Themes</h2>
          <div className="flex flex-wrap gap-2">
            {themes.map((t) => (
              <span key={t} className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs">
                {t}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-sm font-semibold">🔥 Trending Stocks</h2>
          {PILLARS.length === 0 ? (
            <div className="glass rounded-xl p-4 text-center text-xs text-muted-foreground">
              Live prices light up here once a market-data feed is connected.
            </div>
          ) : (
            <div className="glass rounded-xl divide-y divide-border/50">
              {PILLARS.map((p) => (
                <div key={p.ticker} className="flex items-center justify-between p-3 text-sm">
                  <div>
                    <div className="font-semibold">{p.ticker}</div>
                    <div className="text-xs text-muted-foreground">{p.name}</div>
                  </div>
                  <div className="text-right">
                    <div>${p.price.toFixed(2)}</div>
                    <PriceTag change={p.change} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
