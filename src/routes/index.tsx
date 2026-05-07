import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { Logo } from "@/components/Logo";
import { EmptyState } from "@/components/EmptyState";
import { PILLARS, PORTFOLIO, RECENT_ORDERS, DISCUSSION_PREVIEW } from "@/lib/mock-data";
import { Sparkles, ArrowRight, MessageSquare, Receipt } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FusionSynergy — Practice trading, powered by AI" },
      { name: "description", content: "Your FusionSynergy home: portfolio at a glance, market movers, and FUSE AI." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const favourites = PILLARS.slice(0, 5);
  const winners = PILLARS.filter(p => p.change > 0).sort((a, b) => b.change - a.change).slice(0, 3);
  const losers = PILLARS.filter(p => p.change < 0).sort((a, b) => a.change - b.change).slice(0, 3);

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Top bar with logo */}
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Logo className="h-9 w-9 rounded-xl" />
            <span className="text-sm font-semibold tracking-tight">FusionSynergy</span>
          </Link>
          <Link to="/more" className="text-xs text-muted-foreground hover:text-foreground">
            @yasin
          </Link>
        </div>

        {/* Greeting + portfolio */}
        <header>
          <p className="text-sm text-muted-foreground">Good to see you back 👋</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            ${PORTFOLIO.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="text-emerald-400 font-medium">+${PORTFOLIO.todayPnL.toFixed(2)}</span>
            <PriceTag change={PORTFOLIO.todayPnLPct} />
            <span className="text-muted-foreground text-xs">today</span>
          </div>
        </header>

        {/* FUSE AI billboard */}
        <Link
          to="/ai"
          className="group block overflow-hidden rounded-2xl bg-fuse-gradient p-[1px] shadow-glow"
        >
          <div className="flex items-center justify-between rounded-2xl bg-card p-5">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-fuse-cyan">
                <Sparkles className="h-3.5 w-3.5" /> Ask FUSE AI
              </div>
              <p className="mt-2 max-w-xs text-sm text-foreground">
                Curious about a stock or what's moving the market? Just ask.
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-fuse-cyan transition-transform group-hover:translate-x-1">
              Chat <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        </Link>

        {/* Watchlist */}
        <Section title="Watchlist">
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

        {/* Movers */}
        <Section title="Today's movers">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-2">Up</div>
              {winners.map(p => (
                <div key={p.ticker} className="flex justify-between text-sm py-0.5">
                  <span>{p.ticker}</span><PriceTag change={p.change} />
                </div>
              ))}
            </div>
            <div className="glass rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-2">Down</div>
              {losers.map(p => (
                <div key={p.ticker} className="flex justify-between text-sm py-0.5">
                  <span>{p.ticker}</span><PriceTag change={p.change} />
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* Recent activity */}
        <Section title="Your activity" link={{ to: "/orders", label: "View orders" }}>
          {RECENT_ORDERS.length === 0 ? (
            <EmptyState
              icon={<Receipt className="h-6 w-6 text-muted-foreground" />}
              title="No orders yet"
              description="Place your first practice trade — your filled and pending orders will show up here."
              action={
                <Link to="/invest" className="rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                  Find a stock
                </Link>
              }
            />
          ) : (
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
          )}
        </Section>

        {/* Community */}
        <Section title="Community" link={{ to: "/discussion", label: "Open" }}>
          {DISCUSSION_PREVIEW.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-6 w-6 text-muted-foreground" />}
              title="The room is quiet"
              description="Be the first to share what you're watching today."
              action={
                <Link to="/discussion" className="rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs">
                  Start a post
                </Link>
              }
            />
          ) : (
            <div className="glass rounded-xl divide-y divide-border/50">
              {DISCUSSION_PREVIEW.map((d, i) => (
                <div key={i} className="p-3 text-sm">
                  <div className="text-xs text-muted-foreground">@{d.user}</div>
                  <p className="mt-1">{d.text}</p>
                </div>
              ))}
            </div>
          )}
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
