import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

const faqs = [
  { q: "What are the 4 Bones?",            a: "Absolute risk rules: ≥15% cash, ≤5% daily loss, ≤20% per pillar, ≤50% per sector." },
  { q: "How does difficulty work?",        a: "Lower starting capital = higher points multiplier. Easy ($1M) → Hard ($1K, ×10 PTS)." },
  { q: "Live vs paper trading?",           a: "V1 is virtual paper trading. Real-money brokerage arrives in V2." },
  { q: "What is FUSE Intelligence?",       a: "AI overlay that runs Scout + Orchestrator on any stock and can route a trade." },
];

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help & FAQ — FusionSynergy" }] }),
  component: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">❓ Help Center</h1>
        <input placeholder="Search help…" className="w-full rounded-xl border border-border bg-secondary/40 px-3 py-2.5 text-sm outline-none" />
        <div className="glass rounded-xl divide-y divide-border/50">
          {faqs.map((f) => (
            <details key={f.q} className="group p-4 text-sm">
              <summary className="cursor-pointer font-medium">{f.q}</summary>
              <p className="mt-2 text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
        <button className="w-full rounded-xl bg-fuse-gradient p-[1px] text-sm font-semibold">
          <span className="flex w-full items-center justify-center rounded-xl bg-card py-2.5 text-fuse-cyan">
            Contact support
          </span>
        </button>
      </div>
    </AppShell>
  ),
});
