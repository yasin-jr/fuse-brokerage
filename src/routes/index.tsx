import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { PILLARS, PORTFOLIO, RECENT_ORDERS, AGENT_ACTIVITY, DISCUSSION_PREVIEW } from "@/lib/mock-data";
import { Sparkles, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Home — FusionSynergy Virtual Brokerage" },
      { name: "description", content: "Your FusionSynergy dashboard: portfolio, favourites, agent activity, and FUSE Intelligence." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const favourites = PILLARS.slice(0, 5);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Greeting + portfolio summary */}
        <header>
          <p className="text-sm text-muted-foreground">Welcome back, CEO</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            ${PORTFOLIO.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="text-emerald-400 font-medium">+${PORTFOLIO.todayPnL.toFixed(2)}</span>
            <PriceTag change={PORTFOLIO.todayPnLPct} />
            <span className="text-muted-foreground text-xs">today</span>
          </div>
        </header>

        {/* FUSE Intelligence billboard */}
        <Link
          to="/ai"
          className="group block overflow-hidden rounded-2xl border border-border bg-fuse-gradient p-[1px] shadow-glow"
        >
          <div className="flex items-center justify-between rounded-2xl bg-card p-5">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-fuse-cyan">
                <Sparkles className="h-3.5 w-3.5" /> FUSE Intelligence
              </div>
              <p className="mt-2 max-w-xs text-sm text-foreground">
                Analyze any stock with FusionSynergy AI — Scout + Orchestrator powered.
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-fuse-cyan transition-transform group-hover:translate-x-1">
              Open <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Favourites */}
        <Section title="⭐ Favourites">
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {favourites.map((p) => (
              <div key={p.ticker} className="glass min-w-[140px] rounded-xl p-3">
                <div className="text-sm font-semibold">{p.ticker}</div>
                <div className="mt-1 text-xs text-muted-foreground">${p.price.toFixed(2)}</div>
                <div className="mt-2"><PriceTag change={p.change} /></div>
              </div>
            ))}
          </div>
        </Section>

        {/* Daily movers */}
        <Section title="📊 Daily Movers">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-2">🟢 Winners</div>
              {PILLARS.filter(p => p.change > 0).sort((a,b)=>b.change-a.change).slice(0,3).map(p => (
                <div key={p.ticker} className="flex justify-between text-sm py-0.5">
                  <span>{p.ticker}</span><PriceTag change={p.change} />
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-2">🔴 Losers</div>
              {PILLARS.filter(p => p.change < 0).sort((a,b)=>a.change-b.change).slice(0,3).map(p => (
                <div key={p.ticker} className="flex justify-between text-sm py-0.5">
                  <span>{p.ticker}</span><PriceTag change={p.change} />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Recent orders */}
        <Section title="📋 Recent Orders" link={{ to: "/orders", label: "View all" }}>
          <div className="glass rounded-xl divide-y divide-border/50">
            {RECENT_ORDERS.map(o => (
              <div key={o.id} className="flex items-center justify-between p-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className={o.action === "BUY" ? "text-emerald-400" : "text-rose-400"}>
                    {o.status === "FILLED" ? "✅" : "⏳"} {o.action}
                  </span>
                  <span className="font-semibold">{o.ticker}</span>
                  <span className="text-muted-foreground">×{o.qty} @ ${o.price}</span>
                </div>
                <span className="text-xs text-muted-foreground">{o.ts}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Agent activity */}
        <Section title="🤖 Agent Activity">
          <div className="glass rounded-xl divide-y divide-border/50">
            {AGENT_ACTIVITY.map((a, i) => (
              <div key={i} className="flex items-start justify-between gap-3 p-3 text-sm">
                <div>
                  <span className="font-semibold text-fuse-violet">{a.agent}</span>
                  <span className="ml-2 text-muted-foreground">{a.message}</span>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{a.ts}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* Discussion preview */}
        <Section title="💬 Discussion" link={{ to: "/discussion", label: "See all" }}>
          <div className="glass rounded-xl divide-y divide-border/50">
            {DISCUSSION_PREVIEW.map((d, i) => (
              <div key={i} className="p-3 text-sm">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{d.badge}</span>
                  <span>@{d.user}</span>
                </div>
                <p className="mt-1">{d.text} <span className="ml-1">{d.sentiment}</span></p>
                <div className="mt-1 text-xs text-muted-foreground">🐂 {d.likes}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link?: { to: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground/90">{title}</h2>
        {link && (
          <Link to={link.to} className="text-xs text-fuse-cyan hover:underline">
            {link.label} →
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}
