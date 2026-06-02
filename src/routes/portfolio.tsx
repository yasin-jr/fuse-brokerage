import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { PriceTag } from "@/components/PriceTag";
import { EmptyState } from "@/components/EmptyState";
import { useProfile } from "@/lib/profile-store";
import { getQuotes } from "@/lib/market.functions";
import { LOGO_URL } from "@/lib/catalog";
import { PieChart, Trophy } from "lucide-react";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Portfolio — FusionSynergy" },
      { name: "description", content: "Your locked starting capital, points and live holdings on FusionSynergy." },
      { property: "og:title", content: "Portfolio — FusionSynergy" },
      { property: "og:description", content: "Locked starting capital, points and live holdings." },
      { property: "og:url", content: "https://fuse-brokerage.lovable.app/portfolio" },
    ],
    links: [{ rel: "canonical", href: "https://fuse-brokerage.lovable.app/portfolio" }],
  }),
  component: PortfolioPage,
});

const INDEX_SYMBOLS = ["^IXIC", "^GSPC", "^DJI", "^RUT"];
const INDEX_NAMES: Record<string, string> = { "^IXIC": "NASDAQ", "^GSPC": "S&P 500", "^DJI": "DOW", "^RUT": "RUT" };

function PortfolioPage() {
  const profile = useProfile();
  const fetchQuotes = useServerFn(getQuotes);

  const claimedBalance = profile.claimedBalance ?? 0;
  const cash = profile.cash ?? 0;
  const positions = profile.positions ?? [];
  const points = profile.points ?? 0;
  const multiplier = profile.pointsMultiplier ?? 0;

  const heldSymbols = positions.map((p) => p.symbol);

  const { data: indexData } = useQuery({
    queryKey: ["indices", INDEX_SYMBOLS],
    queryFn: () => fetchQuotes({ data: { symbols: INDEX_SYMBOLS } }),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const indices = indexData?.quotes ?? [];

  const { data: holdData } = useQuery({
    queryKey: ["holdings-quotes", heldSymbols],
    queryFn: () => fetchQuotes({ data: { symbols: heldSymbols } }),
    enabled: heldSymbols.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
  const priceMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of holdData?.quotes ?? []) m.set(x.symbol, x.price);
    return m;
  }, [holdData]);

  const holdingsValue = positions.reduce((sum, p) => sum + p.shares * (priceMap.get(p.symbol) ?? p.avgPrice), 0);
  const totalPortfolio = cash + holdingsValue;
  const totalPnL = claimedBalance > 0 ? totalPortfolio - claimedBalance : 0;
  const totalPnLPct = claimedBalance > 0 ? (totalPnL / claimedBalance) * 100 : 0;

  const claimed = claimedBalance > 0;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
        {/* Live indices */}
        <section>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Markets right now</h2>
          <div className="grid grid-cols-4 gap-2">
            {INDEX_SYMBOLS.map((sym) => {
              const q = indices.find((x) => x.symbol === sym);
              return (
                <div key={sym} className="glass rounded-xl p-3">
                  <div className="text-[11px] text-muted-foreground">{INDEX_NAMES[sym]}</div>
                  <div className="text-sm font-semibold tabular-nums">
                    {q ? q.price.toLocaleString(undefined, { maximumFractionDigits: 2 }) : "—"}
                  </div>
                  {q ? <PriceTag change={q.change} /> : <span className="text-[11px] text-muted-foreground">…</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Total + Points */}
        {!claimed ? (
          <section className="glass rounded-2xl p-6 text-center">
            <h1 className="text-lg font-semibold">No starting capital yet</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pick a difficulty to claim your practice balance and start earning points.</p>
            <Link to="/onboarding/difficulty" className="mt-4 inline-block rounded-full bg-fuse-gradient px-5 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
              Pick difficulty
            </Link>
          </section>
        ) : (
          <section className="grid gap-3 sm:grid-cols-3">
            <div className="glass rounded-2xl p-4 sm:col-span-2">
              <p className="text-xs text-muted-foreground">Total portfolio</p>
              <h1 className="text-3xl font-semibold tabular-nums">${totalPortfolio.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <span className={totalPnL > 0 ? "text-emerald-400 font-medium" : totalPnL < 0 ? "text-rose-400 font-medium" : "text-muted-foreground"}>
                  {totalPnL >= 0 ? "+" : ""}${totalPnL.toFixed(2)}
                </span>
                <PriceTag change={totalPnLPct} />
                <span className="text-xs text-muted-foreground">vs starting capital</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Starting: <span className="text-foreground tabular-nums">${claimedBalance.toLocaleString()}</span></span>
                <span>Cash: <span className="text-foreground tabular-nums">${cash.toFixed(2)}</span></span>
                <span>Holdings: <span className="text-foreground tabular-nums">${holdingsValue.toFixed(2)}</span></span>
              </div>
            </div>
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Trophy className="h-3.5 w-3.5 text-fuse-cyan" /> Points
              </div>
              <div className="mt-1 text-3xl font-semibold tabular-nums text-fuse-cyan">{points.toLocaleString()}</div>
              <div className="mt-1 text-[10px] text-muted-foreground">+{multiplier} pt / 1% gain on sell</div>
            </div>
          </section>
        )}

        {/* Holdings */}
        <section>
          <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Holdings</h2>
          {positions.length > 0 ? (
            <div className="glass rounded-xl divide-y divide-border/50">
              {positions.map((p) => {
                const current = priceMap.get(p.symbol) ?? p.avgPrice;
                const value = p.shares * current;
                const pnl = value - p.shares * p.avgPrice;
                const pnlPct = ((current - p.avgPrice) / p.avgPrice) * 100;
                return (
                  <Link
                    key={p.symbol}
                    to="/stock/$symbol"
                    params={{ symbol: p.symbol }}
                    className="flex items-center gap-3 p-3 text-sm hover:bg-secondary/30"
                  >
                    <img src={LOGO_URL(p.symbol)} alt="" onError={(e) => { e.currentTarget.style.opacity = "0.2"; }} className="h-8 w-8 rounded bg-white p-0.5 object-contain" />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold">{p.symbol}</div>
                      <div className="text-xs text-muted-foreground">{p.shares} sh · avg ${p.avgPrice.toFixed(2)}</div>
                    </div>
                    <div className="text-right">
                      <div className="tabular-nums">${value.toFixed(2)}</div>
                      <div className={`text-xs tabular-nums ${pnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%)
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={<PieChart className="h-6 w-6 text-muted-foreground" />}
              title="No positions yet"
              description={claimed ? "Start practice trading — your holdings will live here." : "Pick a difficulty to start trading."}
              action={
                <Link to="/invest" className="rounded-full bg-fuse-gradient px-4 py-1.5 text-xs font-semibold text-primary-foreground">
                  Browse markets
                </Link>
              }
            />
          )}
        </section>
      </div>
    </AppShell>
  );
}
