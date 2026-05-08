import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { BackBar } from "@/components/BackBar";

const faqs = [
  { q: "How does difficulty work?",     a: "Lower starting cash = bigger points multiplier. Pick what feels right and switch later." },
  { q: "Live vs paper trading?",        a: "Right now everything is practice (paper) trading. Real-money trading lands in a future update." },
  { q: "What is FUSE AI?",              a: "Your in-app sidekick — ask it about a stock, an idea, or what's moving today." },
];

export const Route = createFileRoute("/help")({
  head: () => ({ meta: [{ title: "Help & FAQ — FusionSynergy" }] }),
  component: () => (
    <AppShell>
      <BackBar />
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
