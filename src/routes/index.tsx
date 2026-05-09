import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { Logo } from "@/components/Logo";
import { EmptyState } from "@/components/EmptyState";
import { TickerTape } from "@/components/TickerTape";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PILLARS, PORTFOLIO, RECENT_ORDERS } from "@/lib/mock-data";
import { usePosts } from "@/lib/profile-store";
import { Sparkles, ArrowRight, MessageSquare, Receipt, Wallet, TrendingUp, Settings as SettingsIcon } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FusionSynergy — Where Intelligence Meets Finance" },
      { name: "description", content: "FusionSynergy: AI-powered practice trading. Track markets, learn the ropes, and chat with FUSE AI." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const hasPortfolio = PILLARS.length > 0;
  const winners = PILLARS.filter(p => p.change > 0).sort((a, b) => b.change - a.change).slice(0, 3);
  const losers  = PILLARS.filter(p => p.change < 0).sort((a, b) => a.change - b.change).slice(0, 3);
  const posts = usePosts();
  const previewPosts = posts.slice(0, 3);

  return (
    <AppShell>
      {/* Top bar with logo */}
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-5">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-9 w-9 rounded-xl" />
          <span className="text-base tracking-tight">
            <span className="brand-fusion">Fusion</span>
            <span className="brand-synergy">Synergy</span>
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link
            to="/settings"
            aria-label="Settings"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
          >
            <SettingsIcon className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>

      {/* Live ticker tape */}
      <div className="mt-4">
        <TickerTape />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Hero / portfolio */}
        {hasPortfolio ? (
          <header>
            <p className="text-sm text-muted-foreground">Total portfolio</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">
              ${PORTFOLIO.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h1>
            <div className="mt-1 flex items-center gap-3 text-sm">
              <span className="text-emerald-400 font-medium">+${PORTFOLIO.todayPnL.toFixed(2)}</span>
              <PriceTag change={PORTFOLIO.todayPnLPct} />
              <span className="text-muted-foreground text-xs">today</span>
            </div>
          </header>
        ) : (
          <header className="rounded-2xl border border-border/60 bg-card/40 p-6 text-center">
            <h1 className="text-3xl font-semibold tracking-tight">
              Where <span className="text-fuse-gradient">Intelligence</span> Meets Finance
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              "The future of fintech starts with one decision."
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              <Link
                to="/invest"
                className="rounded-full bg-fuse-gradient px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
              >
                Start practicing
              </Link>
              <Link
                to="/ai"
                className="rounded-full border border-border bg-secondary/50 px-5 py-2 text-xs font-semibold text-foreground hover:border-fuse-cyan/60"
              >
                Ask FUSE AI
              </Link>
            </div>
          </header>
        )}

        {/* FUSE AI billboard */}
        <Link
          to="/ai"
          className="group block overflow-hidden rounded-2xl bg-fuse-gradient p-[1px] shadow-glow"
        >
          <div className="flex items-center justify-between rounded-2xl bg-card p-5">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fuse-cyan">
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

        {/* Watchlist / movers */}
        {hasPortfolio ? (
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
        ) : (
          <Section title="Watchlist">
            <EmptyState
              icon={<TrendingUp className="h-6 w-6 text-muted-foreground" />}
              title="Build your watchlist"
              description="Search any stock and add it here to track price moves at a glance."
              action={
                <Link to="/invest" className="rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                  Browse stocks
                </Link>
              }
            />
          </Section>
        )}

        {/* Activity */}
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

        {/* Cash card if no portfolio */}
        {!hasPortfolio && (
          <div className="glass flex items-center gap-3 rounded-2xl p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuse-gradient">
              <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-muted-foreground">Practice cash</div>
              <div className="text-sm font-semibold">$0.00 — claim your starter balance</div>
            </div>
            <Link to="/settings" className="text-xs text-fuse-cyan">Setup →</Link>
          </div>
        )}

        {/* Community */}
        <Section title="Community" link={{ to: "/discussion", label: "Open" }}>
          {previewPosts.length === 0 ? (
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
              {previewPosts.map((d) => (
                <div key={d.id} className="p-3 text-sm">
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
        <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{title}</h2>
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
